/**
 * STRIPE INTEGRATION GUIDE
 *
 * This guide shows how to use the Stripe integration in the Voxmation application.
 * The integration supports USD and EUR currencies, subscriptions, webhooks, and more.
 */

// =============================================================================
// 1. INITIALIZATION
// =============================================================================

import {
  initializeStripe,
  createStripeCustomer,
  createSubscription,
  cancelSubscription,
  getInvoices,
  getUpcomingInvoice,
  registerWebhookHandlers,
} from "../integrations/stripe";

/**
 * Initialize Stripe once on app startup
 * The SDK will use STRIPE_SECRET_KEY environment variable by default
 */
async function setupStripe() {
  try {
    // Option 1: Use default environment variable
    const stripe = initializeStripe();

    // Option 2: Pass config explicitly
    // const stripe = initializeStripe({
    //   secretKey: "sk_live_...",
    //   publishableKey: "pk_live_...",
    //   webhookSecret: "whsec_...",
    // });

    console.log("Stripe initialized successfully");
    return stripe;
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    throw error;
  }
}

// =============================================================================
// 2. CUSTOMER MANAGEMENT
// =============================================================================

/**
 * Create a Stripe customer for a new account
 */
async function createCustomerForAccount(
  accountId: string,
  email: string,
  accountName: string,
  currency: "usd" | "eur" = "usd"
) {
  try {
    const customer = await createStripeCustomer(
      accountId,
      email,
      accountName,
      currency
    );

    console.log(`Created Stripe customer: ${customer.id}`);
    console.log(`Email: ${customer.email}`);
    console.log(`Name: ${customer.name}`);

    // Save customer ID to database for future reference
    // await db.updateAccount(accountId, { stripeCustomerId: customer.id });

    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

// =============================================================================
// 3. SUBSCRIPTION MANAGEMENT
// =============================================================================

/**
 * Create a subscription with a trial period
 */
async function subscribeWithTrial(
  customerId: string,
  priceId: string,
  trialDays: number = 14,
  currency: "usd" | "eur" = "usd"
) {
  try {
    const subscription = await createSubscription({
      customerId,
      priceId,
      trialDays,
      currency,
      metadata: {
        // Add custom data
        campaignName: "summer_2024",
        source: "landing_page",
      },
    });

    console.log(`Subscription created: ${subscription.id}`);
    console.log(`Status: ${subscription.status}`);
    console.log(`Trial ends: ${new Date(subscription.trial_end! * 1000)}`);

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Create a subscription without trial
 */
async function subscribeImmediately(
  customerId: string,
  priceId: string,
  currency: "usd" | "eur" = "usd"
) {
  try {
    const subscription = await createSubscription({
      customerId,
      priceId,
      currency,
    });

    console.log(`Subscription created: ${subscription.id}`);
    console.log(`Current period: ${subscription.current_period_start} - ${subscription.current_period_end}`);

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Cancel a subscription immediately or at period end
 */
async function cancelSubscriptionExample(
  subscriptionId: string,
  atPeriodEnd: boolean = false
) {
  try {
    const cancelled = await cancelSubscription(subscriptionId, atPeriodEnd);

    if (atPeriodEnd) {
      console.log(`Subscription will be canceled at period end: ${cancelled.cancel_at}`);
    } else {
      console.log(`Subscription canceled immediately: ${cancelled.canceled_at}`);
    }

    return cancelled;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

// =============================================================================
// 4. BILLING & INVOICES
// =============================================================================

/**
 * Get upcoming invoice for a customer
 * Shows what will be charged on the next billing date
 */
async function getNextInvoiceDetails(customerId: string) {
  try {
    const invoice = await getUpcomingInvoice(customerId);

    if (!invoice) {
      console.log("No upcoming invoice");
      return null;
    }

    console.log(`Upcoming Invoice:`);
    console.log(`  Total: ${invoice.currency?.toUpperCase()} ${(invoice.total / 100).toFixed(2)}`);
    console.log(`  Period: ${new Date(invoice.period_start * 1000)} - ${new Date(invoice.period_end * 1000)}`);
    console.log(`  Items:`);

    invoice.lines.data.forEach((line) => {
      console.log(`    - ${line.description}: ${(line.amount / 100).toFixed(2)}`);
    });

    return invoice;
  } catch (error) {
    console.error("Error fetching upcoming invoice:", error);
    throw error;
  }
}

/**
 * Get customer's invoice history
 */
async function getInvoiceHistory(customerId: string, limit: number = 10) {
  try {
    const invoices = await getInvoices({
      customerId,
      limit,
      status: "paid", // Filter by status: 'paid', 'open', 'draft', 'void', 'uncollectible'
    });

    console.log(`Found ${invoices.length} invoices:`);

    invoices.forEach((invoice) => {
      console.log(`  Invoice #${invoice.number}`);
      console.log(`    Amount: ${invoice.currency?.toUpperCase()} ${(invoice.total / 100).toFixed(2)}`);
      console.log(`    Status: ${invoice.status}`);
      console.log(`    Date: ${new Date(invoice.created * 1000)}`);
      console.log(`    PDF: ${invoice.pdf}`);
      console.log("");
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

// =============================================================================
// 5. WEBHOOK SETUP
// =============================================================================

/**
 * Register webhook event handlers
 * These will be called when Stripe sends webhook events
 */
function setupWebhookHandlers() {
  registerWebhookHandlers({
    // Handle new subscription
    onSubscriptionCreated: async (subscription) => {
      console.log(`New subscription: ${subscription.id}`);
      // Update database, send welcome email, etc.
      // await db.createSubscription({
      //   stripeId: subscription.id,
      //   customerId: subscription.customer,
      //   status: subscription.status,
      // });
    },

    // Handle subscription changes
    onSubscriptionUpdated: async (subscription) => {
      console.log(`Subscription updated: ${subscription.id}`);
      console.log(`New status: ${subscription.status}`);
      // Update database, notify user, etc.
    },

    // Handle subscription cancellation
    onSubscriptionDeleted: async (subscription) => {
      console.log(`Subscription canceled: ${subscription.id}`);
      // Update database, send cancellation email, etc.
    },

    // Handle successful payment
    onInvoicePaid: async (invoice) => {
      console.log(`Invoice paid: ${invoice.id}`);
      console.log(`Amount: ${invoice.currency?.toUpperCase()} ${(invoice.total / 100).toFixed(2)}`);
      // Update database, send receipt email, grant access, etc.
    },

    // Handle failed payment
    onInvoicePaymentFailed: async (invoice) => {
      console.log(`Payment failed: ${invoice.id}`);
      console.log(`Error: ${invoice.last_finalization_error?.message}`);
      // Send payment failure notification, alert support, etc.
    },
  });
}

// =============================================================================
// 6. API ENDPOINT EXAMPLES
// =============================================================================

/**
 * Express route example: Create checkout session
 * POST /api/billing/checkout
 * Body: { planId, billingCycle: "monthly" | "yearly", currency: "usd" | "eur" }
 */
async function checkoutEndpointExample(req: any, res: any) {
  try {
    const { planId, billingCycle = "monthly", currency = "usd" } = req.body;

    // Plan would come from database
    const plan = {
      id: planId,
      name: "Pro Plan",
      stripe_price_id_monthly: "price_1234567890",
      stripe_price_id_yearly: "price_0987654321",
      stripe_price_id_monthly_eur: "price_eur_monthly",
      stripe_price_id_yearly_eur: "price_eur_yearly",
    };

    // Get customer or create one
    const customer = await createStripeCustomer(
      "account-123",
      "user@example.com",
      "John Doe",
      currency as "usd" | "eur"
    );

    // Get appropriate price ID
    const priceKey =
      billingCycle === "yearly"
        ? currency === "eur"
          ? "stripe_price_id_yearly_eur"
          : "stripe_price_id_yearly"
        : currency === "eur"
          ? "stripe_price_id_monthly_eur"
          : "stripe_price_id_monthly";

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId: plan[priceKey as keyof typeof plan] as string,
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
      currency: currency as "usd" | "eur",
      metadata: { planId, billingCycle },
    });

    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}

/**
 * Express route example: List invoices
 * GET /api/billing/invoices/:customerId?limit=25&status=paid
 */
async function invoicesEndpointExample(req: any, res: any) {
  try {
    const { customerId } = req.params;
    const { limit = 25, status } = req.query;

    const invoices = await getInvoices({
      customerId,
      limit: parseInt(limit),
      status,
    });

    res.json({
      data: invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        total: inv.total,
        currency: inv.currency,
        created: inv.created,
        pdf: inv.pdf,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}

// =============================================================================
// 7. DATABASE SCHEMA REQUIREMENTS
// =============================================================================

/**
 * Required database tables and fields:
 *
 * subscriptions:
 *   - id (primary key)
 *   - account_id (foreign key)
 *   - stripe_customer_id (string)
 *   - stripe_subscription_id (string, unique)
 *   - status (active, canceled, past_due, trialing, etc.)
 *   - current_period_start (timestamp)
 *   - current_period_end (timestamp)
 *   - currency (usd, eur)
 *   - items (jsonb) - price items
 *   - metadata (jsonb) - custom data
 *   - created_at (timestamp)
 *   - updated_at (timestamp)
 *   - last_paid_at (timestamp)
 *   - canceled_at (timestamp)
 *
 * invoices:
 *   - id (primary key)
 *   - stripe_invoice_id (string, unique)
 *   - stripe_customer_id (string)
 *   - stripe_subscription_id (string)
 *   - account_id (foreign key)
 *   - status (paid, open, draft, void, uncollectible)
 *   - total (integer - cents)
 *   - currency (string - USD, EUR)
 *   - issue_date (timestamp)
 *   - paid_date (timestamp)
 *   - pdf_url (string)
 *   - metadata (jsonb)
 *   - created_at (timestamp)
 *
 * stripe_customers:
 *   - stripe_customer_id (primary key)
 *   - account_id (foreign key)
 *   - email (string)
 *   - name (string)
 *   - currency (usd, eur)
 *   - created_at (timestamp)
 *   - deleted_at (timestamp)
 *
 * payment_alerts:
 *   - id (primary key)
 *   - account_id (foreign key)
 *   - type (payment_failed, upcoming_renewal, etc.)
 *   - invoice_id (string)
 *   - amount (integer - cents)
 *   - currency (string)
 *   - message (text)
 *   - read (boolean)
 *   - created_at (timestamp)
 */

// =============================================================================
// 8. ENVIRONMENT VARIABLES
// =============================================================================

/**
 * Required environment variables:
 *
 * STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
 * STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
 * STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint settings)
 * NODE_ENV=production (or development)
 */

// =============================================================================
// 9. TESTING HELPERS
// =============================================================================

/**
 * Test webhook locally using Stripe CLI
 *
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login: stripe login
 * 3. Forward webhooks: stripe listen --forward-to localhost:3001/api/webhooks/stripe
 * 4. Test event: stripe trigger payment_intent.succeeded
 */

/**
 * Common test card numbers:
 * - Visa: 4242 4242 4242 4242
 * - Mastercard: 5555 5555 5555 4444
 * - Amex: 3782 822463 10005
 * - Declined: 4000 0000 0000 0002
 */

export {
  setupStripe,
  createCustomerForAccount,
  subscribeWithTrial,
  subscribeImmediately,
  cancelSubscriptionExample,
  getNextInvoiceDetails,
  getInvoiceHistory,
  setupWebhookHandlers,
  checkoutEndpointExample,
  invoicesEndpointExample,
};
