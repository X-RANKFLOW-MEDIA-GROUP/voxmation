import Stripe from "stripe";
import { supabase } from "../supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export { stripe };

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SubscriptionData {
  id: string;
  accountId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  currency: "USD" | "EUR";
  billingCycle: "monthly" | "yearly";
  pricePerCycle: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
}

export interface InvoiceData {
  id: string;
  accountId: string;
  stripeInvoiceId: string;
  amountTotal: number;
  currency: string;
  status: string;
  invoiceNumber?: string;
  issueDate: Date;
  dueDate?: Date;
}

export interface WebhookPayload {
  type: string;
  id: string;
  object: Stripe.Event;
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Create or get a Stripe customer for an account
 */
export async function createOrGetStripeCustomer(
  accountId: string,
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    // Check if customer exists
    const existingCustomers = await stripe.customers.search({
      query: `metadata["accountId"]:"${accountId}"`,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        accountId,
        ...metadata,
      },
    });

    // Store in Supabase
    await supabase.from("subscriptions").insert({
      account_id: accountId,
      stripe_customer_id: customer.id,
      // Other fields will be set when creating subscription
    });

    return customer;
  } catch (error) {
    console.error("Error creating/getting Stripe customer:", error);
    throw error;
  }
}

/**
 * Update customer metadata
 */
export async function updateCustomerMetadata(
  customerId: string,
  metadata: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.update(customerId, { metadata });
  } catch (error) {
    console.error("Error updating customer metadata:", error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create a subscription with trial support and multi-currency
 */
export async function createSubscription(
  customerId: string,
  accountId: string,
  planId: string,
  priceId: string,
  options?: {
    trialDays?: number;
    currency?: "USD" | "EUR";
    billingCycle?: "monthly" | "yearly";
    metadata?: Record<string, string>;
  }
): Promise<SubscriptionData> {
  try {
    const currency = options?.currency || "USD";
    const billingCycle =
      options?.billingCycle ||
      (priceId.includes("yearly") ? "yearly" : "monthly");

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      trial_period_days: options?.trialDays || 0,
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        accountId,
        planId,
        currency,
        ...options?.metadata,
      },
    });

    // Get price details for cost storage
    const price = await stripe.prices.retrieve(priceId);
    const pricePerCycle = (price.unit_amount || 0) / 100;

    // Store in Supabase
    const { data: storedSub, error } = await supabase
      .from("subscriptions")
      .insert({
        account_id: accountId,
        plan_id: planId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        status: subscription.status,
        currency,
        billing_cycle: billingCycle,
        price_per_cycle: pricePerCycle,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: storedSub.id,
      accountId: storedSub.account_id,
      planId: storedSub.plan_id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      status: subscription.status,
      currency,
      billingCycle,
      pricePerCycle,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : undefined,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Update subscription (plan change, pause, etc.)
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    trialEnd?: number;
    metadata?: Record<string, string>;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<Stripe.Subscription> {
  try {
    const items = updates.priceId ? [{ price: updates.priceId }] : undefined;

    return await stripe.subscriptions.update(subscriptionId, {
      items,
      trial_end: updates.trialEnd,
      metadata: updates.metadata,
      cancel_at_period_end: updates.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false,
  reason?: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId, {
      invoice_now: immediate,
    });

    // Update Supabase
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date(),
        cancellation_reason: reason,
      })
      .eq("stripe_subscription_id", subscriptionId);

    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: "void" },
    });

    await supabase
      .from("subscriptions")
      .update({ status: "active", cancel_at_period_end: false })
      .eq("stripe_subscription_id", subscriptionId);

    return subscription;
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
}

/**
 * Pause subscription
 */
export async function pauseSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: "mark_uncollectible" },
    });
  } catch (error) {
    console.error("Error pausing subscription:", error);
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
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice.payment_intent"],
    });
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * Get upcoming invoice for a customer
 */
export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string
): Promise<Stripe.Invoice> {
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subscriptionId,
    });
  } catch (error) {
    console.error("Error getting upcoming invoice:", error);
    throw error;
  }
}

/**
 * Get customer invoices with pagination
 */
export async function getCustomerInvoices(
  customerId: string,
  options?: { limit?: number; starting_after?: string }
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: options?.limit || 10,
      starting_after: options?.starting_after,
    });

    return invoices.data;
  } catch (error) {
    console.error("Error getting customer invoices:", error);
    throw error;
  }
}

/**
 * Download invoice PDF
 */
export async function getInvoicePDF(invoiceId: string): Promise<Buffer> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.pdf) {
      throw new Error("Invoice PDF not available");
    }

    // Fetch the PDF from the URL
    const response = await fetch(invoice.pdf);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("Error getting invoice PDF:", error);
    throw error;
  }
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw error;
  }
}

/**
 * Detach payment method from customer
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error) {
    console.error("Error detaching payment method:", error);
    throw error;
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  try {
    return await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
}

/**
 * Get payment methods for customer
 */
export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return methods.data;
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw error;
  }
}

// ============================================================================
// CHECKOUT & BILLING PORTAL
// ============================================================================

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  accountId: string,
  options?: {
    successUrl?: string;
    cancelUrl?: string;
    trialDays?: number;
    discountCode?: string;
  }
): Promise<Stripe.Checkout.Session> {
  try {
    const baseUrl = options?.successUrl?.split("?")[0] || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url:
        options?.successUrl || `${baseUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: options?.cancelUrl || `${baseUrl}/billing?canceled=true`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: options?.trialDays,
        metadata: {
          accountId,
        },
      },
      metadata: {
        accountId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}

// ============================================================================
// WEBHOOK VERIFICATION & PROCESSING
// ============================================================================

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * Process webhook event
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    // Store webhook event in database for audit and retry capability
    const { error: storeError } = await supabase
      .from("webhook_events")
      .insert({
        event_type: event.type,
        event_id: event.id,
        source: "stripe",
        payload: event.data.object as any,
        status: "processing",
      });

    if (storeError) {
      console.error("Error storing webhook event:", storeError);
    }

    // Process based on event type
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.created":
        await handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;

      case "invoice.finalized":
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log("Unhandled webhook event type:", event.type);
    }

    // Mark event as completed
    await supabase
      .from("webhook_events")
      .update({ status: "completed", processed_at: new Date() })
      .eq("event_id", event.id);
  } catch (error) {
    console.error("Error processing webhook event:", error);

    // Mark event as failed
    await supabase
      .from("webhook_events")
      .update({
        status: "failed",
        error_message: (error as Error).message,
        retry_count: supabase.from("webhook_events").select().count,
      })
      .eq("event_id", event.id);

    throw error;
  }
}

// ============================================================================
// WEBHOOK HANDLERS
// ============================================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log("Subscription created:", subscription.id);

  const accountId = (subscription.metadata?.accountId as string) || "";
  const planId = (subscription.metadata?.planId as string) || "";

  // Additional processing if needed
  await supabase.from("billing_history").insert({
    account_id: accountId,
    event_type: "subscription_created",
    details: {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log("Subscription updated:", subscription.id);

  const accountId = (subscription.metadata?.accountId as string) || "";

  // Update in database
  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date(),
    })
    .eq("stripe_subscription_id", subscription.id);

  await supabase.from("billing_history").insert({
    account_id: accountId,
    event_type: "subscription_modified",
    details: { stripe_subscription_id: subscription.id },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log("Subscription deleted:", subscription.id);

  const accountId = (subscription.metadata?.accountId as string) || "";

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .eq("stripe_subscription_id", subscription.id);

  await supabase.from("billing_history").insert({
    account_id: accountId,
    event_type: "subscription_canceled",
    details: { stripe_subscription_id: subscription.id },
  });
}

async function handleInvoiceCreated(invoice: Stripe.Invoice): Promise<void> {
  console.log("Invoice created:", invoice.id);

  const customerId = invoice.customer as string;

  // Find account by Stripe customer ID
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("account_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (subscription) {
    await supabase.from("invoices").insert({
      account_id: subscription.account_id,
      stripe_invoice_id: invoice.id,
      amount_total: (invoice.total || 0) / 100,
      currency: invoice.currency,
      status: invoice.status,
      issue_date: new Date(invoice.created * 1000),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    });
  }
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
  console.log("Invoice finalized:", invoice.id);

  await supabase
    .from("invoices")
    .update({
      pdf_url: invoice.pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      status: "open",
    })
    .eq("stripe_invoice_id", invoice.id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log("Invoice paid:", invoice.id);

  const { data: invoiceRecord } = await supabase
    .from("invoices")
    .select("account_id")
    .eq("stripe_invoice_id", invoice.id)
    .single();

  await supabase
    .from("invoices")
    .update({
      status: "paid",
      amount_paid: (invoice.paid || 0) / 100,
      paid_date: new Date(),
    })
    .eq("stripe_invoice_id", invoice.id);

  if (invoiceRecord) {
    await supabase.from("billing_history").insert({
      account_id: invoiceRecord.account_id,
      event_type: "payment_succeeded",
      amount: (invoice.total || 0) / 100,
      currency: invoice.currency,
      details: { stripe_invoice_id: invoice.id },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log("Invoice payment failed:", invoice.id);

  const { data: invoiceRecord } = await supabase
    .from("invoices")
    .select("account_id")
    .eq("stripe_invoice_id", invoice.id)
    .single();

  await supabase
    .from("invoices")
    .update({ status: "open" })
    .eq("stripe_invoice_id", invoice.id);

  if (invoiceRecord) {
    await supabase.from("billing_history").insert({
      account_id: invoiceRecord.account_id,
      event_type: "payment_failed",
      details: { stripe_invoice_id: invoice.id },
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("Payment intent succeeded:", paymentIntent.id);
  // Additional processing if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("Payment intent failed:", paymentIntent.id);
  // Additional processing if needed
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log("Charge refunded:", charge.id);

  if (charge.invoice) {
    const { data: invoiceRecord } = await supabase
      .from("invoices")
      .select("account_id")
      .eq("stripe_invoice_id", String(charge.invoice))
      .single();

    if (invoiceRecord) {
      await supabase.from("billing_history").insert({
        account_id: invoiceRecord.account_id,
        event_type: "payment_failed",
        amount: (charge.amount_refunded || 0) / 100,
        currency: charge.currency,
        details: { stripe_charge_id: charge.id },
      });
    }
  }
}

// ============================================================================
// PRICING HELPERS
// ============================================================================

/**
 * Get price in specified currency
 */
export async function getPrice(
  priceId: string
): Promise<{ amount: number; currency: string; billingPeriod: string }> {
  try {
    const price = await stripe.prices.retrieve(priceId);

    return {
      amount: (price.unit_amount || 0) / 100,
      currency: price.currency,
      billingPeriod:
        price.recurring?.interval === "month"
          ? "monthly"
          : price.recurring?.interval === "year"
            ? "yearly"
            : "one-time",
    };
  } catch (error) {
    console.error("Error getting price:", error);
    throw error;
  }
}

/**
 * Create price for a product in multiple currencies
 */
export async function createPriceForCurrencies(
  productId: string,
  amounts: {
    usd: number;
    eur: number;
  },
  billingPeriod: "month" | "year"
): Promise<{ usd: Stripe.Price; eur: Stripe.Price }> {
  try {
    const [usdPrice, eurPrice] = await Promise.all([
      stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amounts.usd * 100),
        currency: "usd",
        recurring: {
          interval: billingPeriod,
          aggregate_usage: "sum",
        },
      }),
      stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amounts.eur * 100),
        currency: "eur",
        recurring: {
          interval: billingPeriod,
        },
      }),
    ]);

    return { usd: usdPrice, eur: eurPrice };
  } catch (error) {
    console.error("Error creating prices:", error);
    throw error;
  }
}
