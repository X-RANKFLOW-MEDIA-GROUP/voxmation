import { sendEmail } from "../email";
import { supabase } from "../supabase";
import { assignAgentToPhoneNumber } from "../integrations/elevenlabs-agents";

const DAY_MS = 86400000;
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] || char);

type MessageCandidate = { key: string; subject: string; body: string };

const candidateMessages = (trial: Record<string, any>, now: number): MessageCandidate[] => {
  const acceptedAt = new Date(trial.accepted_at).getTime();
  const liveAt = trial.live_at ? new Date(trial.live_at).getTime() : null;
  const messages: MessageCandidate[] = [];

  if (!trial.claimed_at && now >= acceptedAt + 2 * 60 * 60 * 1000) {
    messages.push({ key: "accepted_2h", subject: "Complete your VOXmation onboarding", body: "Your seven-day trial has not started. Open your secure invite so we can configure and test your AI receptionist." });
  }
  if (trial.claimed_at && !trial.intake_completed_at && now >= new Date(trial.claimed_at).getTime() + 2 * 60 * 60 * 1000) {
    messages.push({ key: "intake_2h", subject: "Finish your AI receptionist setup", body: "Your onboarding is saved. Finish the remaining business hours, services, call rules, and phone details so VOXmation can configure your agent." });
  }
  if (trial.intake_completed_at) {
    messages.push({ key: "intake_complete", subject: "Your VOXmation intake is complete", body: "We received your call rules. The next step is configuring the AI agent and connecting the phone number. Your seven-day clock is still paused." });
  }
  if (trial.number_connected_at && !trial.test_call_passed_at) {
    messages.push({ key: "ready_to_test", subject: "Your VOXmation test call is ready", body: `Your AI receptionist and phone line are connected. Sign in to place the test call and approve any corrections before go-live.` });
  }
  if (liveAt) {
    if (now >= liveAt + DAY_MS) messages.push({ key: "live_day_1", subject: "Day 1: review your first calls", body: "Review the first real calls, transcripts, and outcomes. Send corrections through Support so changes can be tested before deployment." });
    if (now >= liveAt + 3 * DAY_MS) messages.push({ key: "live_day_3", subject: "Your VOXmation mid-trial check-in", body: "Review call volume, qualified leads, transfers, and appointments in your portal. This is the best time to tune any remaining call rules." });
    if (now >= liveAt + 5 * DAY_MS) messages.push({ key: "live_day_5", subject: "Keep your AI receptionist active", body: "Your trial is approaching its end. Review real usage in Billing and select the plan that matches your call volume to avoid interruption." });
    if (now >= liveAt + 6 * DAY_MS) messages.push({ key: "live_day_6", subject: "Your VOXmation trial ends tomorrow", body: `Your trial ends ${new Date(trial.trial_ends_at).toLocaleString("en-US", { timeZone: trial.timezone || "America/Chicago" })}. Subscribe before then to keep the receptionist active.` });
  }
  if (trial.status === "expired") {
    messages.push({ key: "expired", subject: "Your VOXmation trial is paused", body: "The AI receptionist is paused, but your configuration is preserved. Choose a plan to reactivate without rebuilding your setup." });
  }
  return messages;
};

export async function runClientTrialLifecycle() {
  if (!supabase) throw new Error("Database is not configured");
  await supabase.rpc("expire_client_trials");

  const { data: trials, error } = await supabase.from("client_trials").select("*").in("status", [
    "accepted", "intake", "agent_configured", "number_connected", "testing", "awaiting_approval", "live", "expired",
  ]);
  if (error) throw error;

  const now = Date.now();
  for (const trial of trials || []) {
    if (trial.status === "expired") {
      const { data: expirationEvent } = await supabase.from("client_trial_events").select("id").eq("trial_id", trial.id).eq("event_type", "trial_expired").limit(1).maybeSingle();
      if (!expirationEvent) {
        await supabase.from("client_trial_events").insert({ trial_id: trial.id, event_type: "trial_expired", event_data: { trialEndsAt: trial.trial_ends_at } });
      }
    }
    if (trial.status === "expired" && trial.elevenlabs_phone_number_id) {
      const { data: suspended } = await supabase.from("client_trial_events").select("id").eq("trial_id", trial.id).eq("event_type", "trial_phone_suspended").limit(1).maybeSingle();
      if (!suspended) {
        try {
          await assignAgentToPhoneNumber(trial.elevenlabs_phone_number_id, null);
          await supabase.from("client_trial_events").insert({ trial_id: trial.id, event_type: "trial_phone_suspended", event_data: { reason: "trial_expired" } });
        } catch (error) {
          await supabase.from("client_trials").update({ last_error: error instanceof Error ? error.message : "Could not suspend expired phone assignment" }).eq("id", trial.id);
        }
      }
    }
    for (const message of candidateMessages(trial, now)) {
      await supabase.from("client_trial_messages").upsert({
        trial_id: trial.id,
        message_key: message.key,
        channel: "email",
        recipient: trial.invite_email,
        subject: message.subject,
        body: message.body,
        due_at: new Date().toISOString(),
      }, { onConflict: "trial_id,message_key,channel", ignoreDuplicates: true });
    }
  }

  const { data: pending, error: queueError } = await supabase
    .from("client_trial_messages")
    .select("*, client_trials!inner(business_name, contact_name)")
    .in("status", ["pending", "failed"])
    .lt("attempts", 3)
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(50);
  if (queueError) throw queueError;

  let sent = 0;
  let failed = 0;
  for (const message of pending || []) {
    const attempts = Number(message.attempts || 0) + 1;
    const { data: claimed } = await supabase
      .from("client_trial_messages")
      .update({ status: "sending", attempts })
      .eq("id", message.id)
      .eq("status", message.status)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;
    const trial = (message as any).client_trials;
    const appUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
    const ok = await sendEmail({
      to: message.recipient,
      subject: message.subject || "VOXmation trial update",
      text: `${message.body}\n\nOpen your portal: ${appUrl}/portal/onboarding`,
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:32px;color:#101827"><h1 style="font-size:24px">VOXmation</h1><p>Hi ${escapeHtml(trial.contact_name)},</p><p style="line-height:1.6">${escapeHtml(message.body)}</p><p><a href="${appUrl}/portal/onboarding" style="display:inline-block;background:#ff7a18;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Open trial portal</a></p><p style="color:#667085;font-size:12px">${escapeHtml(trial.business_name)} · Operational trial update</p></div>`,
    });
    await supabase.from("client_trial_messages").update(ok
      ? { status: "sent", sent_at: new Date().toISOString(), last_error: null }
      : {
          status: "failed",
          last_error: "Email provider returned failure",
          due_at: new Date(Date.now() + attempts * 30 * 60 * 1000).toISOString(),
        }
    ).eq("id", message.id);
    if (ok) {
      sent += 1;
    } else {
      failed += 1;
      if (attempts >= 3) {
        await supabase.from("client_trial_tasks").insert({
          trial_id: message.trial_id,
          task_type: "message_delivery",
          title: `Manually send: ${message.subject || message.message_key}`,
          due_at: new Date().toISOString(),
        });
      }
    }
  }

  return { trialsEvaluated: trials?.length || 0, queued: pending?.length || 0, sent, failed };
}
