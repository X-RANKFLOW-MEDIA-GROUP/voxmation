import Stripe from "stripe";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface StripeInitConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export interface SubscriptionOptions {
  customerId: string;
  priceId: string;
  trialDays?: number;
  currency?: "usd" | "eur";
  metadata?: Record<string, string>;
}

export interface CreateCheckoutOptions {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: "usd" | "eur";
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface InvoiceOptions {
  customerId: string;
  limit?: number;
  status?: "draft" | "open" | "paid" | "void" | "uncollectible";
}

export interface WebhookEventHandler {
  (event: Stripe.Event): Promise<void>;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

let stripe: Stripe | null = null;

/**
 * Initialize Stripe client with API credentials
 * Can be called multiple times safely - uses cached instance
 */
export function initializeStripe(config?: StripeInitConfig): Stripe {
  if (stripe) {
    return stripe;
  }

  const secretKey = config?.secretKey || process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Stripe secret key not provided. Set STRIPE_SECRET_KEY environment variable or pass config to initializeStripe()"
    );
  }

  stripe = new Stripe(secretKey, {
    apiVersion: "2024-04-10" as any,
  });

  return stripe;
}

/**
 * Get initialized Stripe instance
 * Throws if not initialized
 */
function getStripe(): Stripe {
  if (!stripe) {
    return initializeStripe();
  }
  return stripe;
}

/**
 * Reset Stripe instance (useful for testing)
 */
export function resetStripe(): void {
  stripe = null;
}

export { getStripe as stripe };

// =============================================================================
// CUSTOMER MANAGEMENT
// =============================================================================

/**
 * Create a Stripe customer for an account
 * Supports both USD and EUR currencies
 */
export async function createStripeCustomer(
  accountId: string,
  email: string,
  name: string,
  currency: "usd" | "eur" = "usd"
) {
  try {
    const stripeInstance = getStripe();

    const customer = await stripeInstance.customers.create({
      email,
      name,
      preferred_locales: currency === "eur" ? ["en-DE", "en-GB", "fr-FR"] : ["en-US"],
      metadata: {
        accountId,
        currency,
        createdAt: new Date().toISOString(),
      },
    });

    console.log(`[Stripe] Customer created: ${customer.id} for account ${accountId}`);
    return customer;
  } catch (error) {
    console.error("[Stripe] Error creating customer:", error);
    throw error;
  }
}

/**
 * Retrieve a Stripe customer by ID
 */
export async function getStripeCustomer(customerId: string) {
  try {
    const stripeInstance = getStripe();
    const customer = await stripeInstance.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error("[Stripe] Error retrieving customer:", error);
    throw error;
  }
}

/**
 * Update a Stripe customer
 */
export async function updateStripeCustomer(
  customerId: string,
  updates: {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
  }
) {
  try {
    const stripeInstance = getStripe();
    const customer = await stripeInstance.customers.update(customerId, updates);
    console.log(`[Stripe] Customer updated: ${customerId}`);
    return customer;
  } catch (error) {
    console.error("[Stripe] Error updating customer:", error);
    throw error;
  }
}

// =============================================================================
// SUBSCRIPTION MANAGEMENT
// =============================================================================

/**
 * Create a subscription for a customer
 * Supports trial periods and multiple currencies
 */
export async function createSubscription(
  options: SubscriptionOptions
): Promise<Stripe.Subscription> {
  const {
    customerId,
    priceId,
    trialDays,
    currency = "usd",
    metadata = {},
  } = options;

  try {
    const stripeInstance = getStripe();

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        currency,
        createdAt: new Date().toISOString(),
        ...metadata,
      },
    };

    if (trialDays && trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }

    const subscription = await stripeInstance.subscriptions.create(
      subscriptionData
    );

    console.log(
      `[Stripe] Subscription created: ${subscription.id} for customer ${customerId}`
    );
    return subscription;
  } catch (error) {
    console.error("[Stripe] Error creating subscription:", error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const stripeInstance = getStripe();
    const subscription = await stripeInstance.subscriptions.retrieve(
      subscriptionId,
      {
        expand: ["latest_invoice"],
      }
    );
    return subscription;
  } catch (error) {
    console.error("[Stripe] Error retrieving subscription:", error);
    throw error;
  }
}

/**
 * List customer's subscriptions
 */
export async function listCustomerSubscriptions(customerId: string) {
  try {
    const stripeInstance = getStripe();
    const subscriptions = await stripeInstance.subscriptions.list({
      customer: customerId,
      limit: 100,
      expand: ["data.latest_invoice"],
    });
    return subscriptions.data;
  } catch (error) {
    console.error("[Stripe] Error listing subscriptions:", error);
    throw error;
  }
}

/**
 * Update a subscription (e.g., change price)
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Subscription> {
  try {
    const stripeInstance = getStripe();

    const updateData: Stripe.SubscriptionUpdateParams = {};

    if (updates.priceId) {
      const subscription = await stripeInstance.subscriptions.retrieve(
        subscriptionId
      );
      const itemId = subscription.items.data[0]?.id;
      if (itemId) {
        updateData.items = [
          {
            id: itemId,
            price: updates.priceId,
          },
        ];
      }
    }

    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    const updated = await stripeInstance.subscriptions.update(
      subscriptionId,
      updateData
    );

    console.log(`[Stripe] Subscription updated: ${subscriptionId}`);
    return updated;
  } catch (error) {
    console.error("[Stripe] Error updating subscription:", error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * Immediate cancellation by default, or at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const stripeInstance = getStripe();

    if (atPeriodEnd) {
      return stripeInstance.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    }
    const cancelled = await stripeInstance.subscriptions.cancel(subscriptionId, {
      invoice_now: true,
    });

    console.log(
      `[Stripe] Subscription cancelled: ${subscriptionId} (at period end: ${atPeriodEnd})`
    );
    return cancelled;
  } catch (error) {
    console.error("[Stripe] Error canceling subscription:", error);
    throw error;
  }
}

// =============================================================================
// CHECKOUT & PAYMENT
// =============================================================================

/**
 * Create a checkout session for subscription purchase
 * Supports EUR and USD pricing
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const {
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    currency = "usd",
    quantity = 1,
    metadata = {},
  } = options;

  try {
    const stripeInstance = getStripe();

    const session = await stripeInstance.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: currency === "eur" ? "en" : "en",
      metadata: {
        currency,
        ...metadata,
      },
    });

    console.log(`[Stripe] Checkout session created: ${session.id}`);
    return session;
  } catch (error) {
    console.error("[Stripe] Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const stripeInstance = getStripe();
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "subscription", "customer"],
    });
    return session;
  } catch (error) {
    console.error("[Stripe] Error retrieving checkout session:", error);
    throw error;
  }
}

// =============================================================================
// INVOICES & BILLING
// =============================================================================

/**
 * Get upcoming invoice for a customer subscription
 * Shows what will be charged next
 */
export async function getUpcomingInvoice(customerId: string) {
  try {
    const stripeInstance = getStripe();

    const invoice = await stripeInstance.invoices.retrieveUpcoming({
      customer: customerId,
    });

    return invoice;
  } catch (error) {
    // Invoice.retrieveUpcoming throws if no upcoming invoice
    if ((error as any).type === "StripeInvalidRequestError") {
      return null;
    }
    console.error("[Stripe] Error getting upcoming invoice:", error);
    throw error;
  }
}

/**
 * Get customer's invoices with filtering and pagination
 * Supports filtering by status (draft, open, paid, void, uncollectible)
 */
export async function getInvoices(
  options: InvoiceOptions
): Promise<Stripe.Invoice[]> {
  const { customerId, limit = 25, status } = options;

  try {
    const stripeInstance = getStripe();

    const listParams: Stripe.InvoiceListParams = {
      customer: customerId,
      limit: Math.min(limit, 100), // Max 100 per API limits
      expand: ["data.payment_intent", "data.customer"],
    };

    if (status) {
      listParams.status = status;
    }

    const invoices = await stripeInstance.invoices.list(listParams);
    return invoices.data;
  } catch (error) {
    console.error("[Stripe] Error getting invoices:", error);
    throw error;
  }
}

/**
 * Alias for backwards compatibility
 */
export async function getCustomerInvoices(customerId: string) {
  return getInvoices({ customerId, limit: 10 });
}

/**
 * Get a specific invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  try {
    const stripeInstance = getStripe();
    const invoice = await stripeInstance.invoices.retrieve(invoiceId, {
      expand: ["payment_intent", "customer", "subscription"],
    });
    return invoice;
  } catch (error) {
    console.error("[Stripe] Error retrieving invoice:", error);
    throw error;
  }
}

/**
 * List all invoices across all customers (admin use)
 * Careful with this - use limit to avoid large datasets
 */
export async function listAllInvoices(limit: number = 25) {
  try {
    const stripeInstance = getStripe();
    const invoices = await stripeInstance.invoices.list({
      limit: Math.min(limit, 100),
      expand: ["data.customer", "data.subscription"],
    });
    return invoices.data;
  } catch (error) {
    console.error("[Stripe] Error listing invoices:", error);
    throw error;
  }
}

// =============================================================================
// WEBHOOK HANDLING
// =============================================================================

export interface StripeWebhookHandlers {
  onSubscriptionCreated?: (subscription: Stripe.Subscription) => Promise<void>;
  onSubscriptionUpdated?: (subscription: Stripe.Subscription) => Promise<void>;
  onSubscriptionDeleted?: (subscription: Stripe.Subscription) => Promise<void>;
  onInvoicePaid?: (invoice: Stripe.Invoice) => Promise<void>;
  onInvoicePaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>;
  onPaymentSucceeded?: (paymentIntent: Stripe.PaymentIntent) => Promise<void>;
  onCustomerCreated?: (customer: Stripe.Customer) => Promise<void>;
  onCustomerDeleted?: (customer: Stripe.Customer) => Promise<void>;
}

// Store registered handlers
const webhookHandlers: StripeWebhookHandlers = {};

/**
 * Register webhook event handlers
 */
export function registerWebhookHandlers(
  handlers: Partial<StripeWebhookHandlers>
): void {
  Object.assign(webhookHandlers, handlers);
  console.log("[Stripe] Webhook handlers registered:", Object.keys(handlers));
}

/**
 * Verify and process Stripe webhook events
 * Call this in your webhook endpoint with raw body and signature
 */
export async function verifyAndHandleWebhook(
  rawBody: Buffer | string,
  signature: string,
  webhookSecret?: string
): Promise<Stripe.Event> {
  const secret =
    webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "Webhook secret not provided. Set STRIPE_WEBHOOK_SECRET environment variable."
    );
  }

  try {
    const stripeInstance = getStripe();

    // Webhook signature verification
    const event = stripeInstance.webhooks.constructEvent(
      rawBody,
      signature,
      secret
    );

    console.log(`[Stripe Webhook] Event received: ${event.type}`);

    // Handle the event
    await handleStripeWebhookEvent(event);

    return event;
  } catch (error) {
    console.error("[Stripe Webhook] Error verifying webhook:", error);
    throw error;
  }
}

/**
 * Handle specific Stripe webhook events
 */
async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      // Subscription events
      case "customer.subscription.created":
        if (webhookHandlers.onSubscriptionCreated) {
          await webhookHandlers.onSubscriptionCreated(
            event.data.object as Stripe.Subscription
          );
        }
        console.log("[Stripe Webhook] Subscription created");
        break;

      case "customer.subscription.updated":
        if (webhookHandlers.onSubscriptionUpdated) {
          await webhookHandlers.onSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
        }
        console.log("[Stripe Webhook] Subscription updated");
        break;

      case "customer.subscription.deleted":
        if (webhookHandlers.onSubscriptionDeleted) {
          await webhookHandlers.onSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
        }
        console.log("[Stripe Webhook] Subscription deleted");
        break;

      // Invoice events
      case "invoice.paid":
        if (webhookHandlers.onInvoicePaid) {
          await webhookHandlers.onInvoicePaid(
            event.data.object as Stripe.Invoice
          );
        }
        console.log("[Stripe Webhook] Invoice paid");
        break;

      case "invoice.payment_failed":
        if (webhookHandlers.onInvoicePaymentFailed) {
          await webhookHandlers.onInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
        }
        console.log("[Stripe Webhook] Invoice payment failed");
        break;

      // Payment intent events
      case "payment_intent.succeeded":
        if (webhookHandlers.onPaymentSucceeded) {
          await webhookHandlers.onPaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        }
        console.log("[Stripe Webhook] Payment succeeded");
        break;

      // Customer events
      case "customer.created":
        if (webhookHandlers.onCustomerCreated) {
          await webhookHandlers.onCustomerCreated(
            event.data.object as Stripe.Customer
          );
        }
        console.log("[Stripe Webhook] Customer created");
        break;

      case "customer.deleted":
        if (webhookHandlers.onCustomerDeleted) {
          await webhookHandlers.onCustomerDeleted(
            event.data.object as Stripe.Customer
          );
        }
        console.log("[Stripe Webhook] Customer deleted");
        break;

      default:
        console.log(
          `[Stripe Webhook] Unhandled event type: ${event.type}`
        );
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling event:", error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events (backward compatible function)
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  return handleStripeWebhookEvent(event);
}
