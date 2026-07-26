import { Router, type NextFunction, type Request, type Response } from "express";
import { createHash, randomBytes } from "crypto";
import { supabase } from "../supabase";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import {
  assignAgentToPhoneNumber,
  createConversationalAgent,
  importTwilioNumber,
  placeAgentTestCall,
} from "../integrations/elevenlabs-agents";
import {
  buildProductionAgentPrompt,
  readinessFromTrial,
  validateIntake,
  type TrialIntake,
} from "../services/clientTrialService";
import { runClientTrialLifecycle } from "../services/clientTrialLifecycle";
import { sendEmail } from "../email";

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES = [
  "accepted", "intake", "agent_configured", "number_connected", "testing", "awaiting_approval", "live", "blocked",
  "expired",
];
const CLIENT_VISIBLE_STATUSES = [...OPEN_STATUSES, "converted"];

const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
const isE164 = (value: string) => /^\+[1-9]\d{7,14}$/.test(value);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[char] || char);

const ensureDatabase = (_req: Request, res: Response, next: NextFunction) => {
  if (!supabase) return res.status(503).json({ success: false, error: "Database is not configured" });
  next();
};

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    const { data, error } = await supabase!.auth.getUser(authorization.slice(7));
    if (error || !data.user) return res.status(401).json({ success: false, error: "Invalid session" });
    req.userId = data.user.id;
    (req as Request & { authEmail?: string }).authEmail = data.user.email?.toLowerCase();
    next();
  } catch (error) {
    next(error);
  }
};

const staffOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await supabase!
      .from("account_members")
      .select("role, accounts!inner(type)")
      .eq("user_id", req.userId)
      .in("role", ["owner", "admin"])
      .eq("accounts.type", "master")
      .limit(1)
      .maybeSingle();
    if (!data) return res.status(403).json({ success: false, error: "VOXmation staff access required" });
    next();
  } catch (error) {
    next(error);
  }
};

const event = async (trialId: string, eventType: string, actorUserId?: string | null, eventData = {}) => {
  await supabase!.from("client_trial_events").insert({
    trial_id: trialId,
    actor_user_id: actorUserId || null,
    event_type: eventType,
    event_data: eventData,
  });
};

const getOwnedTrial = async (userId: string) => {
  const { data, error } = await supabase!
    .from("client_trials")
    .select("*")
    .eq("owner_user_id", userId)
    .in("status", CLIENT_VISIBLE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

router.use(ensureDatabase);

router.post("/operations/run-lifecycle", async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      return res.status(401).json({ success: false, error: "Invalid lifecycle secret" });
    }
    return res.json({ success: true, data: await runClientTrialLifecycle() });
  } catch (error) {
    next(error);
  }
});

// Public metadata is intentionally minimal; the invite token itself is the secret.
router.get("/invite/:token", async (req, res, next) => {
  try {
    const { data, error } = await supabase!
      .from("client_trial_invites")
      .select("expires_at, used_at, revoked_at, client_trials!inner(business_name, contact_name, industry, service_area, status, invite_email)")
      .eq("token_hash", hashToken(String(req.params.token)))
      .maybeSingle();
    if (error) throw error;
    if (!data || data.revoked_at || new Date(data.expires_at).getTime() <= Date.now()) {
      return res.status(404).json({ success: false, error: "Invite is invalid or expired" });
    }
    const trial = (data as any).client_trials;
    const [name, domain = ""] = String(trial.invite_email).split("@");
    return res.json({
      success: true,
      data: {
        businessName: trial.business_name,
        contactName: trial.contact_name,
        industry: trial.industry,
        serviceArea: trial.service_area,
        status: trial.status,
        claimed: Boolean(data.used_at),
        emailHint: `${name.slice(0, 2)}***@${domain}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/invite/:token/claim", userAuth, async (req, res, next) => {
  try {
    const tokenHash = hashToken(String(req.params.token));
    const { data: invite, error } = await supabase!
      .from("client_trial_invites")
      .select("*, client_trials!inner(*)")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (error) throw error;
    if (!invite || invite.revoked_at || new Date(invite.expires_at).getTime() <= Date.now()) {
      return res.status(404).json({ success: false, error: "Invite is invalid or expired" });
    }

    const trial = (invite as any).client_trials;
    const authEmail = (req as Request & { authEmail?: string }).authEmail;
    if (!authEmail || authEmail !== String(trial.invite_email).toLowerCase()) {
      return res.status(403).json({ success: false, error: "Sign in with the email address that received this invite" });
    }
    if (trial.owner_user_id && trial.owner_user_id !== req.userId) {
      return res.status(409).json({ success: false, error: "Invite has already been claimed" });
    }

    const { data: membership } = await supabase!
      .from("account_members")
      .select("account_id, accounts!inner(type)")
      .eq("user_id", req.userId)
      .eq("accounts.type", "sub")
      .limit(1)
      .maybeSingle();

    let accountId = membership?.account_id as string | undefined;
    if (!accountId) {
      const { data: account, error: accountError } = await supabase!
        .from("accounts")
        .insert({
          name: trial.business_name,
          type: "sub",
          plan: "free",
          settings: {
            features: { crm: true, phone: true, sms: true, reports: true },
            limits: { calls_per_month: 100, sms_per_month: 100, team_members: 1 },
          },
        })
        .select("id")
        .single();
      if (accountError) throw accountError;
      accountId = account.id;
      const { error: memberError } = await supabase!.from("account_members").insert({
        account_id: accountId,
        user_id: req.userId,
        role: "owner",
        permissions: { permissions: ["manage_trial", "view_calls", "view_leads"] },
      });
      if (memberError) throw memberError;
    }

    await supabase!.from("profiles").upsert({
      id: req.userId,
      auth_user_id: req.userId,
      account_id: accountId,
      full_name: trial.contact_name,
      company_name: trial.business_name,
      email: trial.invite_email,
      phone: trial.phone,
      plan: "trial",
      role: "owner",
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    const claimedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase!
      .from("client_trials")
      .update({
        owner_user_id: req.userId,
        account_id: accountId,
        claimed_at: claimedAt,
        status: trial.status === "accepted" ? "intake" : trial.status,
        next_action: "Complete business intake",
        next_action_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", trial.id)
      .select("*")
      .single();
    if (updateError) throw updateError;
    await supabase!.from("client_trial_invites").update({ used_at: claimedAt }).eq("id", invite.id);
    await event(trial.id, "invite_claimed", req.userId);
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

router.get("/me", userAuth, async (req, res, next) => {
  try {
    const trial = await getOwnedTrial(req.userId!);
    if (!trial) return res.status(404).json({ success: false, error: "No active trial found" });
    const [{ data: events }, { data: tasks }] = await Promise.all([
      supabase!.from("client_trial_events").select("event_type, event_data, created_at").eq("trial_id", trial.id).order("created_at", { ascending: false }).limit(25),
      supabase!.from("client_trial_tasks").select("id, task_type, title, due_at, status").eq("trial_id", trial.id).order("due_at"),
    ]);
    return res.json({ success: true, data: { ...trial, readiness: readinessFromTrial(trial), events: events || [], tasks: tasks || [] } });
  } catch (error) {
    next(error);
  }
});

router.patch("/me/intake", userAuth, async (req, res, next) => {
  try {
    const trial = await getOwnedTrial(req.userId!);
    if (!trial) return res.status(404).json({ success: false, error: "No active trial found" });
    if (["live", "converted", "expired", "cancelled"].includes(trial.status)) {
      return res.status(409).json({ success: false, error: "Intake is locked for this trial state" });
    }

    const intake = { ...(trial.intake || {}), ...(req.body || {}) } as TrialIntake;
    const missing = validateIntake(intake);
    const completed = missing.length === 0;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      intake,
      phone_mode: intake.phoneMode || null,
      business_phone: intake.businessPhone || null,
      forwarding_phone: intake.forwardingPhone || null,
      escalation_phone: intake.escalationPhone || null,
      service_area: intake.serviceArea || trial.service_area,
      status: "intake",
      next_action: completed ? "VOXmation configures the AI agent" : `Complete intake: ${missing.join(", ")}`,
      next_action_at: new Date(Date.now() + (completed ? 4 : 2) * 60 * 60 * 1000).toISOString(),
    };
    if (completed && !trial.intake_completed_at) updates.intake_completed_at = now;
    if (req.body.termsAccepted === true && !trial.terms_accepted_at) updates.terms_accepted_at = now;
    if (req.body.recordingConsentAcknowledged === true && !trial.recording_consent_acknowledged_at) {
      updates.recording_consent_acknowledged_at = now;
    }

    const { data, error } = await supabase!.from("client_trials").update(updates).eq("id", trial.id).select("*").single();
    if (error) throw error;
    await event(trial.id, completed ? "intake_completed" : "intake_saved", req.userId, { missing });
    return res.json({ success: true, data: { ...data, readiness: readinessFromTrial(data) }, missing });
  } catch (error) {
    next(error);
  }
});

router.post("/me/test-call", userAuth, async (req, res, next) => {
  try {
    const trial = await getOwnedTrial(req.userId!);
    if (!trial) return res.status(404).json({ success: false, error: "No active trial found" });
    if (!["number_connected", "testing", "awaiting_approval"].includes(trial.status)) {
      return res.status(409).json({ success: false, error: "Test calls are not available in this trial state" });
    }
    if (!trial.elevenlabs_agent_id || !trial.elevenlabs_phone_number_id) {
      return res.status(409).json({ success: false, error: "Agent and phone number must be connected first" });
    }
    const toNumber = String(req.body.toNumber || trial.phone || "");
    if (!isE164(toNumber)) return res.status(400).json({ success: false, error: "Use E.164 format, for example +19725551234" });
    const call = await placeAgentTestCall({
      agentId: trial.elevenlabs_agent_id,
      agentPhoneNumberId: trial.elevenlabs_phone_number_id,
      toNumber,
      trialId: trial.id,
    });
    await supabase!.from("client_trials").update({ status: "testing", next_action: "Complete the test call checklist" }).eq("id", trial.id);
    await event(trial.id, "test_call_started", req.userId, { conversationId: call.conversation_id, callSid: call.callSid, toNumber });
    return res.json({ success: true, data: call });
  } catch (error) {
    next(error);
  }
});

router.post("/me/test-result", userAuth, async (req, res, next) => {
  try {
    const trial = await getOwnedTrial(req.userId!);
    if (!trial) return res.status(404).json({ success: false, error: "No active trial found" });
    if (!["testing", "awaiting_approval"].includes(trial.status)) {
      return res.status(409).json({ success: false, error: "Test results are not available in this trial state" });
    }
    const passed = req.body.passed === true;
    if (passed) {
      const { data: completedTest, error: testError } = await supabase!
        .from("client_trial_events")
        .select("id")
        .eq("trial_id", trial.id)
        .eq("event_type", "test_call_received")
        .limit(1)
        .maybeSingle();
      if (testError) throw testError;
      if (!completedTest) {
        return res.status(409).json({ success: false, error: "Wait for the completed test call to appear before marking it passed" });
      }
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase!.from("client_trials").update({
      test_call_passed_at: passed ? now : null,
      status: passed ? "awaiting_approval" : "testing",
      last_error: passed ? null : String(req.body.notes || "Client reported a failed test"),
      next_action: passed ? "Client approves go-live" : "VOXmation fixes the test issue",
      next_action_at: passed ? now : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }).eq("id", trial.id).select("*").single();
    if (error) throw error;
    await event(trial.id, passed ? "test_call_passed" : "test_call_failed", req.userId, { notes: req.body.notes || null });
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/me/go-live", userAuth, async (req, res, next) => {
  try {
    const trial = await getOwnedTrial(req.userId!);
    if (!trial) return res.status(404).json({ success: false, error: "No active trial found" });
    if (trial.status !== "awaiting_approval") {
      return res.status(409).json({ success: false, error: "Go-live is available only after a passed test call" });
    }
    const readiness = readinessFromTrial(trial);
    const blockers = Object.entries(readiness).filter(([key, ready]) => key !== "client_approval" && !ready).map(([key]) => key);
    if (blockers.length) return res.status(409).json({ success: false, error: "Trial is not ready for go-live", blockers });
    if (req.body.approved !== true) return res.status(400).json({ success: false, error: "Explicit client approval is required" });

    const liveAt = new Date();
    const trialEndsAt = new Date(liveAt.getTime() + 7 * DAY_MS);
    await assignAgentToPhoneNumber(trial.elevenlabs_phone_number_id, trial.elevenlabs_agent_id);
    const { data, error } = await supabase!.from("client_trials").update({
      client_approved_at: liveAt.toISOString(),
      live_at: liveAt.toISOString(),
      trial_started_at: liveAt.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      status: "live",
      next_action: "Review the first five real calls",
      next_action_at: new Date(liveAt.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    }).eq("id", trial.id).select("*").single();
    if (error) {
      await assignAgentToPhoneNumber(trial.elevenlabs_phone_number_id, null).catch(() => undefined);
      throw error;
    }
    await event(trial.id, "trial_went_live", req.userId, { trialEndsAt: trialEndsAt.toISOString() });
    let responseData = data;
    if (trial.account_id) {
      const { data: paidSubscription } = await supabase!
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("account_id", trial.account_id)
        .in("status", ["active", "trialing"])
        .limit(1)
        .maybeSingle();
      if (paidSubscription) {
        const { data: converted } = await supabase!
          .from("client_trials")
          .update({
            status: "converted",
            converted_at: liveAt.toISOString(),
            next_action: "Paid subscription active",
            next_action_at: null,
          })
          .eq("id", trial.id)
          .select("*")
          .single();
        if (converted) responseData = converted;
        await event(trial.id, "trial_converted", req.userId, {
          stripeSubscriptionId: paidSubscription.stripe_subscription_id,
          timing: "paid_before_go_live",
        });
        await supabase!.from("client_trial_messages").update({ status: "cancelled" }).eq("trial_id", trial.id).eq("status", "pending");
      }
    }
    return res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
});

// Staff operations
router.post("/admin/invites", tenantMiddleware, staffOnly, async (req, res, next) => {
  try {
    const { email, businessName, contactName, phone, industry, serviceArea, timezone, source, internalOwner } = req.body;
    if (!email || !businessName || !contactName) {
      return res.status(400).json({ success: false, error: "email, businessName, and contactName are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, error: "A valid client email is required" });
    }
    if (phone && !isE164(String(phone))) {
      return res.status(400).json({ success: false, error: "Client phone must use E.164 format" });
    }
    const { data: existing } = await supabase!.from("client_trials").select("id").eq("invite_email", normalizedEmail).in("status", OPEN_STATUSES).limit(1).maybeSingle();
    let trialId = existing?.id as string | undefined;
    if (!trialId) {
      const { data: trial, error } = await supabase!.from("client_trials").insert({
        invite_email: normalizedEmail,
        business_name: String(businessName).trim(),
        contact_name: String(contactName).trim(),
        phone: phone || null,
        industry: industry || "other",
        service_area: serviceArea || null,
        timezone: timezone || "America/Chicago",
        source: source || "sales",
        internal_owner: internalOwner || null,
        created_by: req.userId,
        next_action: "Client claims onboarding invite",
        next_action_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }).select("id").single();
      if (error) throw error;
      trialId = trial.id;
      await supabase!.from("client_trial_tasks").insert({
        trial_id: trialId,
        task_type: "onboarding_followup",
        title: "Confirm the client opened the onboarding link",
        assigned_to: internalOwner || null,
        due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
      await event(trialId, "trial_accepted", req.userId, { source: source || "sales" });
    }

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 14 * DAY_MS).toISOString();
    const { error: inviteError } = await supabase!.from("client_trial_invites").insert({
      trial_id: trialId,
      token_hash: hashToken(rawToken),
      expires_at: expiresAt,
    });
    if (inviteError) throw inviteError;
    const appUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
    const inviteUrl = `${appUrl}/trial/start?invite=${rawToken}`;
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: `Launch your VOXmation trial for ${String(businessName)}`,
      text: `Hi ${String(contactName)},\n\nYour VOXmation trial onboarding is ready. The seven-day clock will not start until setup, a completed test call, and your explicit go-live approval.\n\nOpen your secure invite: ${inviteUrl}\n\nThis invite expires ${expiresAt}.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:32px;color:#101827"><h1 style="font-size:24px">VOXmation</h1><p>Hi ${escapeHtml(String(contactName))},</p><p>Your onboarding for <strong>${escapeHtml(String(businessName))}</strong> is ready. Your seven-day trial clock stays paused until setup, a completed test call, and your explicit go-live approval.</p><p><a href="${inviteUrl}" style="display:inline-block;background:#ff7a18;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Start secure onboarding</a></p><p style="color:#667085;font-size:12px">This one-time invite expires ${escapeHtml(expiresAt)}.</p></div>`,
    });
    await event(trialId, emailSent ? "invite_email_sent" : "invite_email_failed", req.userId, { recipient: normalizedEmail });
    if (!emailSent) {
      await supabase!.from("client_trial_tasks").insert({
        trial_id: trialId,
        task_type: "invite_delivery",
        title: "Send the secure onboarding link manually",
        assigned_to: internalOwner || null,
        due_at: new Date().toISOString(),
      });
    }
    return res.status(201).json({ success: true, data: { trialId, inviteUrl, expiresAt, emailSent } });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", tenantMiddleware, staffOnly, async (req, res, next) => {
  try {
    let query = supabase!.from("client_trials").select("*").order("created_at", { ascending: false }).limit(250);
    if (req.query.status) query = query.eq("status", String(req.query.status));
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data: (data || []).map((trial) => ({ ...trial, readiness: readinessFromTrial(trial) })) });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/:id/configure-agent", tenantMiddleware, staffOnly, async (req, res, next) => {
  try {
    const { data: trial, error } = await supabase!.from("client_trials").select("*").eq("id", req.params.id).single();
    if (error || !trial) return res.status(404).json({ success: false, error: "Trial not found" });
    const intake = trial.intake as TrialIntake;
    const missing = validateIntake(intake);
    if (missing.length) return res.status(409).json({ success: false, error: "Intake is incomplete", missing });
    const prompt = buildProductionAgentPrompt(trial, intake);
    const firstMessage = intake.greeting || `Thank you for calling ${trial.business_name}. This is ${intake.agentName || "Vox"}. How can I help you today?`;
    const agent = await createConversationalAgent({
      businessName: trial.business_name,
      prompt,
      firstMessage,
      voiceId: req.body.voiceId || trial.voice_id,
      language: intake.languages?.[0] || "en",
    });
    const version = Number(trial.prompt_version || 0) + 1;
    await supabase!.from("client_trial_agent_versions").insert({
      trial_id: trial.id,
      version,
      prompt,
      configuration: { firstMessage, voiceId: agent.voiceId, intakeSnapshot: intake },
      provider_agent_id: agent.agentId,
      environment: "testing",
      created_by: req.userId,
    });
    const { data: updated, error: updateError } = await supabase!.from("client_trials").update({
      elevenlabs_agent_id: agent.agentId,
      voice_id: agent.voiceId,
      prompt_version: version,
      agent_configured_at: new Date().toISOString(),
      status: "agent_configured",
      last_error: null,
      next_action: "Connect a Twilio phone number",
      next_action_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }).eq("id", trial.id).select("*").single();
    if (updateError) throw updateError;
    await event(trial.id, "agent_configured", req.userId, { agentId: agent.agentId, version });
    return res.json({ success: true, data: updated });
  } catch (error) {
    await supabase!.from("client_trials").update({ status: "blocked", last_error: error instanceof Error ? error.message : "Agent configuration failed" }).eq("id", req.params.id);
    next(error);
  }
});

router.post("/admin/:id/connect-number", tenantMiddleware, staffOnly, async (req, res, next) => {
  try {
    const { data: trial, error } = await supabase!.from("client_trials").select("*").eq("id", req.params.id).single();
    if (error || !trial) return res.status(404).json({ success: false, error: "Trial not found" });
    if (!trial.elevenlabs_agent_id) return res.status(409).json({ success: false, error: "Configure the agent first" });
    const phoneNumber = String(req.body.phoneNumber || process.env.TWILIO_PHONE_NUMBER || "");
    if (!isE164(phoneNumber)) return res.status(400).json({ success: false, error: "A valid existing Twilio number in E.164 format is required" });
    const phoneNumberId = await importTwilioNumber(phoneNumber, `${trial.business_name} — VOXmation`);
    const { data: updated, error: updateError } = await supabase!.from("client_trials").update({
      twilio_phone_number: phoneNumber,
      elevenlabs_phone_number_id: phoneNumberId,
      number_connected_at: new Date().toISOString(),
      status: "number_connected",
      last_error: null,
      next_action: "Client places an outbound test call; inbound remains disconnected until go-live",
      next_action_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }).eq("id", trial.id).select("*").single();
    if (updateError) throw updateError;
    await event(trial.id, "phone_number_connected", req.userId, { phoneNumber, phoneNumberId });
    return res.json({ success: true, data: updated });
  } catch (error) {
    await supabase!.from("client_trials").update({ status: "blocked", last_error: error instanceof Error ? error.message : "Phone connection failed" }).eq("id", req.params.id);
    next(error);
  }
});

export default router;
