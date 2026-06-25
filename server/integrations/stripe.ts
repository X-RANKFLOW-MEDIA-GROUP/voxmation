import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

export { stripe };

/**
 * Create a Stripe customer for an account
 */
export async function createStripeCustomer(
  accountId: string,
  email: string,
  name: string
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        accountId,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Create a subscription for an account
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      trial_period_days: trialDays,
    });

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Get upcoming invoice
 */
export async function getUpcomingInvoice(customerId: string) {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    });

    return invoice;
  } catch (error) {
    console.error("Error getting upcoming invoice:", error);
    throw error;
  }
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Get customer's invoices
 */
export async function getCustomerInvoices(customerId: string) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    return invoices.data;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid":
      case "invoice.payment_failed":
        console.log("Webhook event handled:", event.type);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
}
