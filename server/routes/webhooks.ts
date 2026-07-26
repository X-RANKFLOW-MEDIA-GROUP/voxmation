import express, { Router, Request, Response, raw } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import type Stripe from "stripe";
import { supabase } from "../supabase";
import { webhookRateLimiter } from "../middleware/rateLimiter";
import {
  verifyAndHandleWebhook,
  registerWebhookHandlers,
  StripeWebhookHandlers,
} from "../integrations/stripe";
import {
  handleWebhook as handleTwilioWebhook,
  registerWebhookHandlers as registerTwilioHandlers,
  TwilioWebhookHandlers,
  CallWebhookEvent,
  RecordingReadyWebhookEvent,
  MessageWebhookEvent,
} from "../integrations/twilio";
import { assignAgentToPhoneNumber } from "../integrations/elevenlabs-agents";

const router = Router();

type ElevenLabsWebhookPayload = {
  type?: string;
  data?: Record<string, any>;
};

const verifyElevenLabsSignature = (rawBody: Buffer, signatureHeader: string) => {
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  if (!secret) throw new Error("ELEVENLABS_CONVAI_WEBHOOK_SECRET is not configured");

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    })
  );
  const timestamp = Number(parts.t);
  const supplied = parts.v0;
  if (!Number.isFinite(timestamp) || !supplied) return false;

  const tolerance = Number(process.env.ELEVENLABS_WEBHOOK_TOLERANCE_SECONDS || 1800);
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > tolerance) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
};

const transcriptToText = (transcript: unknown) => {
  if (!Array.isArray(transcript)) return null;
  const lines = transcript
    .map((turn) => {
      if (!turn || typeof turn !== "object") return null;
      const entry = turn as Record<string, unknown>;
      const message = typeof entry.message === "string" ? entry.message.trim() : "";
      if (!message) return null;
      const role = entry.role === "agent" ? "Agent" : entry.role === "user" ? "Caller" : "System";
      return `${role}: ${message}`;
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : null;
};

const normalizeCallSuccessful = (value: unknown) => {
  if (value === true || value === "success") return "successful";
  if (value === false || value === "failure") return "unsuccessful";
  return null;
};

/**
 * Signed, idempotent ingestion for completed ElevenLabs Agent conversations.
 */
router.post(
  "/elevenlabs/post-call",
  raw({ type: "application/json", limit: "10mb" }),
  async (req: Request, res: Response) => {
    const signature = req.header("elevenlabs-signature");
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");

    if (!signature || !rawBody.length) {
      return res.status(400).json({ error: "Missing signed webhook payload" });
    }

    try {
      if (!verifyElevenLabsSignature(rawBody, signature)) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }

      const payload = JSON.parse(rawBody.toString("utf8")) as ElevenLabsWebhookPayload;
      const data = payload.data || {};
      const agentId = typeof data.agent_id === "string" ? data.agent_id : null;

      if (!agentId) return res.status(200).json({ received: true, ignored: "missing_agent_id" });

      const { data: trial, error: trialError } = await supabase
        .from("client_trials")
        .select("id, account_id, owner_user_id, status")
        .eq("elevenlabs_agent_id", agentId)
        .maybeSingle();
      if (trialError) throw trialError;
      if (!trial) return res.status(200).json({ received: true, ignored: "unknown_agent" });

      if (payload.type === "call_initiation_failure") {
        const errorMessage = String(data.error || data.failure_reason || "Call initiation failed").slice(0, 1000);
        await Promise.all([
          supabase.from("client_trials").update({ last_error: errorMessage }).eq("id", trial.id),
          supabase.from("client_trial_events").insert({
            trial_id: trial.id,
            event_type: "call_initiation_failed",
            event_data: { agentId, error: errorMessage },
          }),
        ]);
        return res.status(200).json({ received: true });
      }

      if (payload.type !== "post_call_transcription") {
        return res.status(200).json({ received: true, ignored: "unsupported_event" });
      }

      const conversationId = typeof data.conversation_id === "string" ? data.conversation_id : null;
      if (!conversationId || !trial.owner_user_id) {
        throw new Error("Conversation or claimed trial owner is missing");
      }

      const metadata = (data.metadata || {}) as Record<string, any>;
      const phoneCall = (metadata.phone_call || {}) as Record<string, any>;
      const initiation = (data.conversation_initiation_client_data || {}) as Record<string, any>;
      const dynamicVariables = (initiation.dynamic_variables || {}) as Record<string, any>;
      const analysis = (data.analysis || {}) as Record<string, any>;
      const isTest = dynamicVariables.call_type === "onboarding_test" || dynamicVariables.trial_id === trial.id;
      const callSid = phoneCall.call_sid || metadata.call_sid || null;
      const callerPhone = phoneCall.external_number || phoneCall.caller_id || null;
      const direction = phoneCall.direction === "outbound" || isTest ? "outbound" : "inbound";
      const startSeconds = Number(metadata.start_time_unix_secs);
      const durationSeconds = Number(metadata.call_duration_secs || 0);
      const cost = Number(metadata.cost_fiat ?? metadata.cost);
      const outcome = normalizeCallSuccessful(analysis.call_successful);
      const status = data.status === "failed" || metadata.termination_reason === "error" ? "failed" : "completed";

      const { data: existing, error: existingError } = await supabase
        .from("calls")
        .select("id")
        .eq("provider", "elevenlabs")
        .eq("provider_conversation_id", conversationId)
        .maybeSingle();
      if (existingError) throw existingError;

      const callRecord = {
        user_id: trial.owner_user_id,
        account_id: trial.account_id,
        caller_phone: callerPhone,
        call_type: isTest ? "test" : direction,
        status,
        duration_seconds: Number.isFinite(durationSeconds) ? Math.max(0, Math.round(durationSeconds)) : 0,
        transcript: transcriptToText(data.transcript),
        summary: typeof analysis.transcript_summary === "string" ? analysis.transcript_summary : null,
        outcome,
        sentiment: typeof analysis.user_sentiment === "string" ? analysis.user_sentiment : null,
        provider: "elevenlabs",
        provider_call_id: callSid,
        provider_conversation_id: conversationId,
        provider_agent_id: agentId,
        is_test: isTest,
        cost_amount: Number.isFinite(cost) ? cost : null,
        cost_currency: Number.isFinite(cost) ? "USD" : null,
        agent_version: typeof data.version_id === "string" ? data.version_id : null,
        metadata: {
          termination_reason: metadata.termination_reason || null,
          evaluation: analysis.evaluation_criteria_results || null,
          data_collection: analysis.data_collection_results || null,
        },
        created_at: Number.isFinite(startSeconds)
          ? new Date(startSeconds * 1000).toISOString()
          : new Date().toISOString(),
      };

      const { data: savedCall, error: callError } = await supabase
        .from("calls")
        .upsert(callRecord, { onConflict: "provider,provider_conversation_id" })
        .select("id")
        .single();
      if (callError) throw callError;

      if (!existing) {
        await supabase.from("client_trial_events").insert({
          trial_id: trial.id,
          event_type: isTest ? "test_call_received" : "live_call_received",
          event_data: { callId: savedCall.id, conversationId, outcome },
        });

        if (!isTest) {
          const accountFilter = trial.account_id
            ? supabase.from("calls").select("id", { count: "exact", head: true }).eq("account_id", trial.account_id)
            : supabase.from("calls").select("id", { count: "exact", head: true }).eq("user_id", trial.owner_user_id);
          const { count } = await accountFilter.eq("provider", "elevenlabs").eq("is_test", false);
          if ((count || 0) <= 5) {
            await supabase.from("client_trial_tasks").insert({
              trial_id: trial.id,
              task_type: "first_call_review",
              title: `Review live call ${conversationId}`,
              due_at: new Date().toISOString(),
            });
          }
        }
      }

      return res.status(200).json({ received: true, callId: savedCall.id });
    } catch (error) {
      console.error("[Webhook] Error processing ElevenLabs webhook:", error);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

const markClientTrialConverted = async (accountId: string | undefined, subscriptionId: string, status: string) => {
  if (!accountId || !["active", "trialing"].includes(status)) return;
  const convertedAt = new Date().toISOString();
  const { data: trial } = await supabase
    .from("client_trials")
    .update({
      status: "converted",
      converted_at: convertedAt,
      next_action: "Paid subscription active",
      next_action_at: null,
    })
    .eq("account_id", accountId)
    .in("status", ["live", "expired"])
    .select("id, elevenlabs_phone_number_id, elevenlabs_agent_id")
    .limit(1)
    .maybeSingle();
  if (trial) {
    if (trial.elevenlabs_phone_number_id && trial.elevenlabs_agent_id) {
      await assignAgentToPhoneNumber(trial.elevenlabs_phone_number_id, trial.elevenlabs_agent_id);
    }
    await supabase.from("client_trial_events").insert({
      trial_id: trial.id,
      event_type: "trial_converted",
      event_data: { stripeSubscriptionId: subscriptionId },
    });
    await supabase.from("client_trial_messages").update({ status: "cancelled" }).eq("trial_id", trial.id).eq("status", "pending");
  }
};

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

/**
 * Define handlers for Stripe webhook events
 * These will be called when corresponding events occur
 */
const stripeWebhookHandlers: StripeWebhookHandlers = {
  // Handle subscription creation
  onSubscriptionCreated: async (subscription: Stripe.Subscription) => {
    try {
      const customerId = subscription.customer as string;
      const metadata = subscription.metadata || {};

      // Save to database
      const { error } = await supabase.from("subscriptions").upsert(
        {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          account_id: metadata.accountId,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          currency: (metadata.currency as string) || "usd",
          items: subscription.items.data.map((item) => ({
            priceId: item.price.id,
            quantity: item.quantity,
          })),
          metadata,
        },
        {
          onConflict: "stripe_subscription_id",
        }
      );

      if (error) {
        console.error(
          "[Webhook] Error saving subscription:",
          error
        );
        throw error;
      }

      await markClientTrialConverted(metadata.accountId, subscription.id, subscription.status);

      console.log(
        `[Webhook] Subscription created for customer ${customerId}`
      );
    } catch (error) {
      console.error("[Webhook] Error in onSubscriptionCreated:", error);
      throw error;
    }
  },

  // Handle subscription updates
  onSubscriptionUpdated: async (subscription: Stripe.Subscription) => {
    try {
      const customerId = subscription.customer as string;
      const metadata = subscription.metadata || {};

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          items: subscription.items.data.map((item) => ({
            priceId: item.price.id,
            quantity: item.quantity,
          })),
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("[Webhook] Error updating subscription:", error);
        throw error;
      }


      await markClientTrialConverted(metadata.accountId, subscription.id, subscription.status);

      console.log(
        `[Webhook] Subscription updated: ${subscription.id}`
      );
    } catch (error) {
      console.error("[Webhook] Error in onSubscriptionUpdated:", error);
      throw error;
    }
  },

  // Handle subscription cancellation
  onSubscriptionDeleted: async (subscription: Stripe.Subscription) => {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("[Webhook] Error updating subscription status:", error);
        throw error;
      }

      console.log(
        `[Webhook] Subscription canceled: ${subscription.id}`
      );
    } catch (error) {
      console.error("[Webhook] Error in onSubscriptionDeleted:", error);
      throw error;
    }
  },

  // Handle paid invoices
  onInvoicePaid: async (invoice: Stripe.Invoice) => {
    try {
      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;
      const currency = invoice.currency?.toUpperCase() || "USD";
      const amount = (invoice.total || 0) / 100; // Convert cents to units

      // Store invoice in database
      const { error: invoiceError } = await supabase
        .from("invoices")
        .upsert(
          {
            stripe_invoice_id: invoice.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            account_id: (invoice.metadata?.accountId as string) || null,
            status: "paid",
            amount_paid: invoice.amount_paid,
            total: invoice.total,
            currency,
            invoice_number: invoice.number,
            issue_date: new Date(invoice.created * 1000).toISOString(),
            paid_date: invoice.status_transitions?.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : new Date().toISOString(),
            due_date: invoice.due_date
              ? new Date(invoice.due_date * 1000).toISOString()
              : null,
            pdf_url: invoice.invoice_pdf,
            metadata: invoice.metadata || {},
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "stripe_invoice_id",
          }
        );

      if (invoiceError) {
        console.error("[Webhook] Error saving paid invoice:", invoiceError);
        throw invoiceError;
      }

      // Update subscription last_paid_at
      if (subscriptionId) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            last_paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (subError) {
          console.error("[Webhook] Error updating subscription last_paid_at:", subError);
        }
      }

      // Create billing event log
      await supabase.from("webhook_events").insert({
        event_type: "invoice.paid",
        stripe_event_id: customerId,
        stripe_invoice_id: invoice.id,
        amount,
        currency,
        processed_at: new Date().toISOString(),
        metadata: {
          invoiceNumber: invoice.number,
          subscriptionId,
        },
      });

      console.log(
        `[Webhook] Invoice paid: ${invoice.id} (${currency} ${amount.toFixed(2)}) for customer ${customerId}`
      );
    } catch (error) {
      console.error("[Webhook] Error in onInvoicePaid:", error);
      throw error;
    }
  },

  // Handle failed payments
  onInvoicePaymentFailed: async (invoice: Stripe.Invoice) => {
    try {
      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;

      // Store failed invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .upsert(
          {
            stripe_invoice_id: invoice.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "payment_failed",
            total: invoice.total,
            currency: invoice.currency?.toUpperCase() || "USD",
            issue_date: new Date(
              invoice.created * 1000
            ).toISOString(),
            attempted_at: new Date().toISOString(),
            metadata: {
              ...invoice.metadata,
              failureReason: invoice.last_finalization_error?.message,
            },
          },
          {
            onConflict: "stripe_invoice_id",
          }
        );

      if (invoiceError) {
        console.error(
          "[Webhook] Error saving failed invoice:",
          invoiceError
        );
        throw invoiceError;
      }

      // Create alert/notification for failed payment
      if (customerId) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("account_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subscription?.account_id) {
          await supabase.from("payment_alerts").insert({
            account_id: subscription.account_id,
            type: "payment_failed",
            invoice_id: invoice.id,
            amount: invoice.total,
            currency: invoice.currency?.toUpperCase() || "USD",
            message: `Payment of ${invoice.currency?.toUpperCase() || "USD"} ${(
              invoice.total / 100
            ).toFixed(2)} failed. Please update your payment method.`,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
    } catch (error) {
      console.error("[Webhook] Error in onInvoicePaymentFailed:", error);
      throw error;
    }
  },

  // Handle payment success
  onPaymentSucceeded: async (paymentIntent: Stripe.PaymentIntent) => {
    try {
      console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
    } catch (error) {
      console.error("[Webhook] Error in onPaymentSucceeded:", error);
      throw error;
    }
  },

  // Handle customer creation
  onCustomerCreated: async (customer: Stripe.Customer) => {
    try {
      const accountId = (customer.metadata?.accountId as string) || null;

      if (accountId) {
        const { error } = await supabase
          .from("stripe_customers")
          .upsert(
            {
              stripe_customer_id: customer.id,
              account_id: accountId,
              email: customer.email,
              name: customer.name,
              currency: (customer.metadata?.currency as string) || "usd",
              created_at: new Date().toISOString(),
            },
            {
              onConflict: "stripe_customer_id",
            }
          );

        if (error) {
          console.error("[Webhook] Error saving customer:", error);
          throw error;
        }
      }

      console.log(`[Webhook] Customer created: ${customer.id}`);
    } catch (error) {
      console.error("[Webhook] Error in onCustomerCreated:", error);
      throw error;
    }
  },

  // Handle customer deletion
  onCustomerDeleted: async (customer: Stripe.Customer) => {
    try {
      const { error } = await supabase
        .from("stripe_customers")
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customer.id);

      if (error) {
        console.error("[Webhook] Error marking customer deleted:", error);
        throw error;
      }

      console.log(`[Webhook] Customer deleted: ${customer.id}`);
    } catch (error) {
      console.error("[Webhook] Error in onCustomerDeleted:", error);
      throw error;
    }
  },
};

// Register all webhook handlers on startup
registerWebhookHandlers(stripeWebhookHandlers);

// =============================================================================
// TWILIO WEBHOOK HANDLERS
// =============================================================================

/**
 * Define handlers for Twilio webhook events
 * These will be called when corresponding Twilio events occur
 */
const twilioWebhookHandlers: TwilioWebhookHandlers = {
  // Handle incoming call ringing
  onCallRinging: async (event: CallWebhookEvent) => {
    try {
      console.log(`[Twilio Webhook] Call ringing: ${event.callSid} from ${event.from} to ${event.to}`);

      // Store call event in database
      const { error } = await supabase.from("twilio_call_events").insert({
        call_sid: event.callSid,
        account_sid: event.accountSid,
        from_number: event.from,
        to_number: event.to,
        event_type: "ringing",
        status: "ringing",
        timestamp: event.timestamp.toISOString(),
        metadata: event.metadata,
      });

      if (error) {
        console.error("[Twilio Webhook] Error storing ringing event:", error);
        throw error;
      }

      console.log(`[Twilio Webhook] Ringing event stored for call ${event.callSid}`);
    } catch (error) {
      console.error("[Twilio Webhook] Error in onCallRinging:", error);
      // Don't re-throw to allow webhook to return 200 to Twilio
    }
  },

  // Handle call answered
  onCallAnswered: async (event: CallWebhookEvent) => {
    try {
      console.log(`[Twilio Webhook] Call answered: ${event.callSid}`);

      const { error } = await supabase
        .from("twilio_call_events")
        .insert({
          call_sid: event.callSid,
          account_sid: event.accountSid,
          from_number: event.from,
          to_number: event.to,
          event_type: "answered",
          status: "in-progress",
          timestamp: event.timestamp.toISOString(),
          metadata: event.metadata,
        });

      if (error) {
        console.error("[Twilio Webhook] Error storing answered event:", error);
        throw error;
      }

      // Update call status
      await supabase
        .from("twilio_calls")
        .update({
          status: "in-progress",
          answered_at: event.timestamp.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("call_sid", event.callSid);

      console.log(`[Twilio Webhook] Call answered event stored for ${event.callSid}`);
    } catch (error) {
      console.error("[Twilio Webhook] Error in onCallAnswered:", error);
    }
  },

  // Handle call completed
  onCallCompleted: async (event: CallWebhookEvent) => {
    try {
      console.log(`[Twilio Webhook] Call completed: ${event.callSid}, duration: ${event.duration}s`);

      const { error } = await supabase
        .from("twilio_call_events")
        .insert({
          call_sid: event.callSid,
          account_sid: event.accountSid,
          from_number: event.from,
          to_number: event.to,
          event_type: "completed",
          status: "completed",
          duration: event.duration,
          timestamp: event.timestamp.toISOString(),
          metadata: event.metadata,
        });

      if (error) {
        console.error("[Twilio Webhook] Error storing completed event:", error);
        throw error;
      }

      // Update call status and duration
      await supabase
        .from("twilio_calls")
        .update({
          status: "completed",
          duration: event.duration,
          ended_at: event.timestamp.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("call_sid", event.callSid);

      console.log(`[Twilio Webhook] Call completed event stored for ${event.callSid}`);
    } catch (error) {
      console.error("[Twilio Webhook] Error in onCallCompleted:", error);
    }
  },

  // Handle recording ready
  onRecordingReady: async (event: RecordingReadyWebhookEvent) => {
    try {
      console.log(
        `[Twilio Webhook] Recording ready: ${event.recordingSid} for call ${event.callSid}, duration: ${event.recordingDuration}s`
      );

      // Store recording in database
      const { error } = await supabase
        .from("twilio_recordings")
        .insert({
          recording_sid: event.recordingSid,
          call_sid: event.callSid,
          account_sid: event.accountSid,
          recording_url: event.recordingUrl,
          duration: event.recordingDuration,
          channels: event.recordingChannels,
          timestamp: event.timestamp.toISOString(),
        });

      if (error) {
        console.error("[Twilio Webhook] Error storing recording:", error);
        throw error;
      }

      // Update call with recording info
      await supabase
        .from("twilio_calls")
        .update({
          recording_sid: event.recordingSid,
          recording_url: event.recordingUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("call_sid", event.callSid);

      console.log(`[Twilio Webhook] Recording stored: ${event.recordingSid}`);
    } catch (error) {
      console.error("[Twilio Webhook] Error in onRecordingReady:", error);
    }
  },

  // Handle SMS status changes
  onMessageStatusChanged: async (event: MessageWebhookEvent) => {
    try {
      console.log(
        `[Twilio Webhook] Message status changed: ${event.messageSid} - ${event.messageStatus}`
      );

      // Store message event in database
      const { error } = await supabase
        .from("twilio_message_events")
        .insert({
          message_sid: event.messageSid,
          account_sid: event.accountSid,
          from_number: event.from,
          to_number: event.to,
          status: event.messageStatus,
          error_code: event.errorCode,
          timestamp: event.timestamp.toISOString(),
        });

      if (error) {
        console.error("[Twilio Webhook] Error storing message event:", error);
        throw error;
      }

      // Update message status
      await supabase
        .from("twilio_messages")
        .update({
          status: event.messageStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("message_sid", event.messageSid);

      console.log(`[Twilio Webhook] Message event stored: ${event.messageSid}`);
    } catch (error) {
      console.error("[Twilio Webhook] Error in onMessageStatusChanged:", error);
    }
  },
};

// Register Twilio webhook handlers on startup
registerTwilioHandlers(twilioWebhookHandlers);

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/webhooks/stripe
 * Stripe webhook endpoint for handling payment and subscription events
 * Supports events: subscription.*, invoice.*, payment_intent.*, customer.*
 * Requires: stripe-signature header for HMAC verification
 */
router.post(
  "/stripe",
  raw({ type: "application/json" }),
  webhookRateLimiter,
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      console.error("[Webhook] Missing stripe-signature header");
      return res.status(400).json({ error: "Missing stripe-signature" });
    }

    try {
      // Verify webhook signature and handle event
      const event = await verifyAndHandleWebhook(
        req.body,
        signature as string
      );

      console.log(
        `[Webhook] Successfully processed event: ${event.id} (type: ${event.type}) at ${new Date(
          event.created * 1000
        ).toISOString()}`
      );

      // Log webhook metrics
      const accountId =
        (event.data.object as any)?.metadata?.accountId ||
        ((event.data.object as any)?.metadata as any)?.accountId;

      if (accountId) {
        console.log(
          `[Webhook] Event for account: ${accountId} (event: ${event.type})`
        );
      }

      // Return 200 to acknowledge receipt
      res.status(200).json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);

      // Return 400 for invalid signatures
      if ((error as any).type === "StripeSignatureVerificationError") {
        console.warn(
          "[Webhook] Invalid signature - possible tampering or outdated webhook secret"
        );
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Return 500 for processing errors (but still acknowledge to Stripe)
      res.status(500).json({
        error: "Webhook processing failed",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

/**
 * POST /api/webhooks/twilio
 * Twilio webhook endpoint for handling call and SMS events
 * Supports events: call status changes (ringing, answered, completed), recordings, message status
 * No signature verification required - Twilio uses URL-based auth in production
 */
router.post("/twilio", express.urlencoded({ extended: true }), webhookRateLimiter, async (req: Request, res: Response) => {
  try {
    // Twilio sends form-encoded data, not JSON
    const body = req.body;

    console.log(`[Webhook] Twilio event received: ${body.CallStatus || body.MessageStatus || body.RecordingStatus}`);

    // Handle the webhook
    await handleTwilioWebhook(body);

    // Return 200 immediately to acknowledge receipt
    res.status(200).send("OK");
  } catch (error) {
    console.error("[Webhook] Error processing Twilio webhook:", error);

    // Return 200 anyway to prevent Twilio from retrying
    // (we log the error but don't block the response)
    res.status(200).send("OK");
  }
});

/**
 * GET /api/webhooks/health
 * Health check endpoint for webhook configuration
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const elevenLabsSecret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
    const stripeConfigured = !!stripeSecret;
    const twilioConfigured = !!twilioAccountSid;

    res.json({
      status: "ok",
      webhooks: {
        stripe: {
          configured: stripeConfigured,
          endpoint: "/api/webhooks/stripe",
          events: [
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
            "invoice.paid",
            "invoice.payment_failed",
            "payment_intent.succeeded",
            "customer.created",
            "customer.deleted",
          ],
        },
        twilio: {
          configured: twilioConfigured,
          endpoint: "/api/webhooks/twilio",
          events: [
            "call.ringing",
            "call.answered",
            "call.completed",
            "recording.ready",
            "message.status_changed",
          ],
        },
        elevenlabs: {
          configured: Boolean(elevenLabsSecret),
          endpoint: "/api/webhooks/elevenlabs/post-call",
          events: ["post_call_transcription", "call_initiation_failure"],
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
