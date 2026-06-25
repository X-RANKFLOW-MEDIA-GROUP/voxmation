import { Router, Request, Response, raw } from "express";
import { supabase } from "../supabase";
import {
  verifyAndHandleWebhook,
  registerWebhookHandlers,
  StripeWebhookHandlers,
  Stripe,
} from "../integrations/stripe";

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

      // Store invoice in database
      const { error: invoiceError } = await supabase
        .from("invoices")
        .upsert(
          {
            stripe_invoice_id: invoice.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "paid",
            amount_paid: invoice.amount_paid,
            total: invoice.total,
            currency: invoice.currency?.toUpperCase() || "USD",
            issue_date: new Date(
              invoice.created * 1000
            ).toISOString(),
            paid_date: invoice.paid_at
              ? new Date(invoice.paid_at * 1000).toISOString()
              : null,
            pdf_url: invoice.pdf,
            metadata: invoice.metadata || {},
          },
          {
            onConflict: "stripe_invoice_id",
          }
        );

      if (invoiceError) {
        console.error("[Webhook] Error saving paid invoice:", invoiceError);
        throw invoiceError;
      }

      // Update subscription status if needed
      if (subscriptionId) {
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            last_paid_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (subError) {
          console.error("[Webhook] Error updating last paid:", subError);
        }
      }

      console.log(`[Webhook] Invoice paid: ${invoice.id}`);
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
// ROUTES
// =============================================================================

/**
 * POST /api/webhooks/stripe
 * Stripe webhook endpoint
 * Receives raw body for signature verification
 */
router.post(
  "/stripe",
  raw({ type: "application/json" }),
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
        `[Webhook] Successfully processed event: ${event.id} (type: ${event.type})`
      );

      // Return 200 to acknowledge receipt
      res.json({ received: true, eventId: event.id });
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);

      // Return 400 for invalid signatures
      if ((error as any).type === "StripeSignatureVerificationError") {
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Return 500 for processing errors
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

/**
 * GET /api/webhooks/health
 * Health check endpoint for webhook configuration
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const hasSecret = !!webhookSecret;

    res.json({
      status: "ok",
      webhook: {
        configured: hasSecret,
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
    });
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

export default router;
