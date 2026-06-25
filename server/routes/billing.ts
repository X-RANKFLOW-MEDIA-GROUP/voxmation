import { Router, Request, Response } from "express";
import { tenantMiddleware, requireRole } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";
import {
  createCheckoutSession,
  createStripeCustomer,
  getInvoices,
  getCustomerInvoices,
  createSubscription,
  cancelSubscription,
  getSubscription,
  listCustomerSubscriptions,
  updateSubscription,
  getUpcomingInvoice,
  getStripeCustomer,
  updateStripeCustomer,
  initializeStripe,
} from "../integrations/stripe";

const router = Router();

// Apply tenant middleware to billing routes
router.use(tenantMiddleware);

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
router.get("/plans", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

/**
 * GET /api/billing/subscription
 * Get current subscription for account
 */
router.get("/subscription", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("account_id", accountId)
      .eq("status", "active")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No subscription found
        return res.json({ data: null });
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

/**
 * GET /api/billing/invoices
 * Get invoices for account with filtering and pagination
 * Query params: limit, offset, status, currency
 */
router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { limit = 10, offset = 0, status, currency } = req.query;

    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order("issue_date", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply currency filter if provided
    if (currency) {
      query = query.eq("currency", currency.toString().toUpperCase());
    }

    const { data, count, error } = await query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    if (error) throw error;

    // Transform invoice data for response
    const transformedInvoices = (data || []).map((invoice) => ({
      id: invoice.stripe_invoice_id,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      amount: (invoice.total || 0) / 100, // Convert cents to units
      currency: invoice.currency || "USD",
      issueDate: invoice.issue_date,
      paidDate: invoice.paid_date,
      dueDate: invoice.due_date,
      pdfUrl: invoice.pdf_url,
      subscriptionId: invoice.stripe_subscription_id,
      metadata: invoice.metadata || {},
    }));

    res.json({
      data: transformedInvoices,
      total: count || 0,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/**
 * GET /api/billing/usage
 * Get usage metrics for current period
 */
router.get("/usage", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;

    // Get current month period
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;

    const { data, error } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("account_id", accountId)
      .eq("period", period)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No usage data yet
        return res.json({
          data: {
            calls_total: 0,
            sms_sent: 0,
            emails_sent: 0,
            estimated_cost: 0,
          },
        });
      }
      throw error;
    }

    res.json({ data });
  } catch (error) {
    console.error("Error fetching usage:", error);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
});

/**
 * POST /api/billing/checkout
 * Create a Stripe checkout session for plan subscription
 * Supports both USD and EUR currencies
 * Body: { planId, billingCycle, currency, successUrl?, cancelUrl?, metadata? }
 */
router.post("/checkout", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const {
      planId,
      billingCycle = "monthly",
      currency = "usd",
      successUrl,
      cancelUrl,
      metadata = {},
    } = req.body;

    // Validation
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    const normalizedCurrency = currency.toLowerCase();
    if (!["usd", "eur"].includes(normalizedCurrency)) {
      return res.status(400).json({
        error: "Invalid currency. Supported currencies: USD, EUR",
      });
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({
        error: "Invalid billing cycle. Supported: monthly, yearly",
      });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, email, name")
      .eq("id", accountId)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .maybeSingle();

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
      // Update customer with current account info
      await updateStripeCustomer(stripeCustomerId, {
        email: account.email,
        name: account.name,
        metadata: {
          accountId,
          currency: normalizedCurrency,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Create new Stripe customer
      const customer = await createStripeCustomer(
        accountId,
        account.email,
        account.name,
        normalizedCurrency as "usd" | "eur"
      );
      stripeCustomerId = customer.id;
    }

    // Get Stripe price ID based on billing cycle and currency
    const priceKey = `stripe_price_id_${billingCycle}_${normalizedCurrency}`;
    const priceId = plan[priceKey];

    if (!priceId) {
      return res.status(400).json({
        error: `Price configuration not available for ${normalizedCurrency.toUpperCase()} ${billingCycle} billing`,
      });
    }

    // Determine redirect URLs
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const finalSuccessUrl =
      successUrl || `${baseUrl}/portal/billing?session=success&plan=${planId}`;
    const finalCancelUrl =
      cancelUrl || `${baseUrl}/portal/billing?session=cancelled`;

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl,
      currency: normalizedCurrency as "usd" | "eur",
      metadata: {
        accountId,
        planId,
        billingCycle,
        ...metadata,
      },
    });

    // Log checkout creation
    console.log(
      `[Billing] Checkout session created: ${session.id} for account ${accountId}`
    );

    // Return checkout session details
    res.status(201).json({
      sessionId: session.id,
      checkoutUrl: session.url,
      currency: normalizedCurrency.toUpperCase(),
      billingCycle,
      planId,
      estimatedAmount:
        plan[`price_${billingCycle}_${normalizedCurrency}`] / 100,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/billing/subscribe
 * Create subscription directly (requires owner/admin)
 * Body: { planId, billingCycle, trialDays, currency }
 */
router.post("/subscribe", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { planId, billingCycle = "monthly", trialDays = 0, currency = "usd" } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID required" });
    }

    // Get plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Get or create Stripe customer
    const { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    let stripeCustomerId: string;

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    } else {
      const customer = await createStripeCustomer(
        accountId,
        account?.email || "billing@account.local",
        account?.name || "Account",
        currency as "usd" | "eur"
      );
      stripeCustomerId = customer.id;
    }

    // Get price ID
    const priceKey =
      billingCycle === "yearly"
        ? currency === "eur"
          ? "stripe_price_id_yearly_eur"
          : "stripe_price_id_yearly"
        : currency === "eur"
          ? "stripe_price_id_monthly_eur"
          : "stripe_price_id_monthly";

    const priceId = plan[priceKey];

    if (!priceId) {
      return res.status(400).json({
        error: `Stripe ${currency.toUpperCase()} price not configured`,
      });
    }

    // Create subscription
    const subscription = await createSubscription({
      customerId: stripeCustomerId,
      priceId,
      trialDays: trialDays > 0 ? trialDays : undefined,
      currency: currency as "usd" | "eur",
      metadata: { accountId, planId, billingCycle },
    });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      trialEnd: subscription.trial_end,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

/**
 * GET /api/billing/subscription/:id
 * Get subscription details (requires owner/admin)
 */
router.get("/subscription/:id", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const { id: subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    res.json({
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      trialEnd: subscription.trial_end,
      items: subscription.items.data.map((item) => ({
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

/**
 * POST /api/billing/subscription/:id/cancel
 * Cancel subscription (requires owner/admin)
 * Body: { atPeriodEnd }
 */
router.post(
  "/subscription/:id/cancel",
  requireRole("owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { id: subscriptionId } = req.params;
      const { atPeriodEnd = false } = req.body;

      const cancelled = await cancelSubscription(subscriptionId, atPeriodEnd);

      res.json({
        id: cancelled.id,
        status: cancelled.status,
        canceledAt: cancelled.canceled_at,
        cancelAtPeriodEnd: cancelled.cancel_at_period_end,
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  }
);

/**
 * GET /api/billing/invoices/:customerId
 * Get customer invoices with filtering (requires owner/admin)
 */
router.get(
  "/invoices/:customerId",
  requireRole("owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const { limit = 25, status } = req.query;

      const invoices = await getInvoices({
        customerId,
        limit: parseInt(limit as string) || 25,
        status: (status as any) || undefined,
      });

      res.json({
        data: invoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          total: inv.total,
          currency: inv.currency?.toUpperCase(),
          created: inv.created,
          paidAt: inv.paid_at,
          dueDate: inv.due_date,
          pdfUrl: inv.pdf,
        })),
        total: invoices.length,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }
);

/**
 * GET /api/billing/upcoming-invoice/:customerId
 * Get upcoming invoice for customer (requires owner/admin)
 */
router.get(
  "/upcoming-invoice/:customerId",
  requireRole("owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;

      const invoice = await getUpcomingInvoice(customerId);

      if (!invoice) {
        return res.json({ data: null });
      }

      res.json({
        data: {
          total: invoice.total,
          currency: invoice.currency?.toUpperCase(),
          periodStart: invoice.period_start,
          periodEnd: invoice.period_end,
          items: invoice.lines.data.map((line) => ({
            description: line.description,
            amount: line.amount,
            quantity: line.quantity,
          })),
        },
      });
    } catch (error) {
      console.error("Error fetching upcoming invoice:", error);
      res.status(500).json({ error: "Failed to fetch upcoming invoice" });
    }
  }
);

export default router;
