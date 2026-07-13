import express, { Router, Request, Response, raw } from "express";
import { supabase } from "../supabase";
import { webhookRateLimiter } from "../middleware/rateLimiter";
import {
  verifyAndHandleWebhook,
  registerWebhookHandlers,
  StripeWebhookHandlers,
  Stripe,
} from "../integrations/stripe";
import {
  handleWebhook as handleTwilioWebhook,
  registerWebhookHandlers as registerTwilioHandlers,
  TwilioWebhookHandlers,
  CallWebhookEvent,
  RecordingReadyWebhookEvent,
  MessageWebhookEvent,
} from "../integrations/twilio";

const router = Router();

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
            paid_date: invoice.paid_at
              ? new Date(invoice.paid_at * 1000).toISOString()
              : new Date().toISOString(),
            due_date: invoice.due_date
              ? new Date(invoice.due_date * 1000).toISOString()
              : null,
            pdf_url: invoice.pdf,
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
  onPaymentSucceeded: async (invoice: Stripe.Invoice) => {
    try {
      console.log(`[Webhook] Payment succeeded: ${invoice.id}`);
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
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
