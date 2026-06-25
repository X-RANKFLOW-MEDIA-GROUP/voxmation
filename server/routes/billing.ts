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

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions for the account (admin only)
 * Query params: limit, offset, status, planId, currency
 */
router.get("/admin/subscriptions", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { limit = 25, offset = 0, status, planId, currency } = req.query;

    let query = supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)", { count: "exact" })
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply plan filter if provided
    if (planId) {
      query = query.eq("plan_id", planId);
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

    // Transform subscription data
    const transformedSubscriptions = (data || []).map((sub) => ({
      id: sub.id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      planId: sub.plan_id,
      planName: sub.subscription_plans?.name,
      status: sub.status,
      currency: sub.currency,
      billingCycle: sub.billing_cycle,
      pricePerCycle: sub.price_per_cycle,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      trialStart: sub.trial_start,
      trialEnd: sub.trial_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at,
      cancellationReason: sub.cancellation_reason,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    res.json({
      data: transformedSubscriptions,
      total: count || 0,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error("Error fetching admin subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

/**
 * PATCH /api/admin/subscriptions/:id
 * Change subscription plan (admin only)
 * Body: { planId, billingCycle?, prorationBehavior? }
 * prorationBehavior: 'create_prorations' | 'always_invoice' | 'none'
 */
router.patch(
  "/admin/subscriptions/:id",
  requireRole("owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const accountId = req.accountId!;
      const { id: subscriptionId } = req.params;
      const { planId, billingCycle, prorationBehavior = "create_prorations" } = req.body;

      if (!planId) {
        return res.status(400).json({ error: "Plan ID is required" });
      }

      // Get current subscription
      const { data: currentSub, error: subError } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("id", subscriptionId)
        .eq("account_id", accountId)
        .single();

      if (subError || !currentSub) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      // Get new plan
      const { data: newPlan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .eq("is_active", true)
        .single();

      if (planError || !newPlan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // Determine billing cycle (use provided or current)
      const cycle = (billingCycle || currentSub.billing_cycle) as "monthly" | "yearly";
      const currency = currentSub.currency.toLowerCase();

      // Get new price ID
      const priceKey = `stripe_price_id_${cycle}_${currency}`;
      const newPriceId = newPlan[priceKey];

      if (!newPriceId) {
        return res.status(400).json({
          error: `Price not available for ${currency.toUpperCase()} ${cycle} billing`,
        });
      }

      // Update subscription via Stripe
      const stripe = await initializeStripe();
      const updated = await stripe.subscriptions.update(
        currentSub.stripe_subscription_id,
        {
          items: [
            {
              id: (
                await stripe.subscriptions.retrieve(
                  currentSub.stripe_subscription_id,
                  {
                    expand: ["items"],
                  }
                )
              ).items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: prorationBehavior as any,
        }
      );

      // Update database
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          billing_cycle: cycle,
          price_per_cycle: newPlan[`price_${cycle}_${currency}`],
          updated_at: new Date(),
        })
        .eq("id", subscriptionId)
        .eq("account_id", accountId);

      if (updateError) throw updateError;

      // Record billing event
      await supabase.from("billing_history").insert({
        account_id: accountId,
        subscription_id: subscriptionId,
        event_type: "subscription_modified",
        details: {
          old_plan_id: currentSub.plan_id,
          new_plan_id: planId,
          old_plan_name: currentSub.subscription_plans?.name,
          new_plan_name: newPlan.name,
          billing_cycle: cycle,
          proration_behavior: prorationBehavior,
        },
        amount: newPlan[`price_${cycle}_${currency}`],
        currency: currentSub.currency,
      });

      res.json({
        id: subscriptionId,
        planId: planId,
        planName: newPlan.name,
        status: updated.status,
        billingCycle: cycle,
        pricePerCycle: newPlan[`price_${cycle}_${currency}`],
        currentPeriodStart: new Date(updated.current_period_start! * 1000),
        currentPeriodEnd: new Date(updated.current_period_end! * 1000),
        prorationCredit: updated.discount || 0,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update subscription";
      res.status(500).json({ error: message });
    }
  }
);

/**
 * GET /api/admin/invoices
 * Get all invoices for the account (admin only)
 * Query params: limit, offset, status, currency, subscriptionId
 */
router.get("/admin/invoices", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { limit = 25, offset = 0, status, currency, subscriptionId } = req.query;

    let query = supabase
      .from("invoices")
      .select("*, subscriptions(id, stripe_subscription_id)", { count: "exact" })
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

    // Apply subscription filter if provided
    if (subscriptionId) {
      query = query.eq("subscription_id", subscriptionId);
    }

    const { data, count, error } = await query.range(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string) - 1
    );

    if (error) throw error;

    // Transform invoice data
    const transformedInvoices = (data || []).map((invoice) => ({
      id: invoice.id,
      stripeInvoiceId: invoice.stripe_invoice_id,
      invoiceNumber: invoice.invoice_number,
      subscriptionId: invoice.subscription_id,
      status: invoice.status,
      currency: invoice.currency,
      amountSubtotal: invoice.amount_subtotal,
      amountTax: invoice.amount_tax,
      amountTotal: invoice.amount_total,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      amountRemaining: invoice.amount_remaining,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date,
      pdfUrl: invoice.pdf_url,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      lineItems: invoice.line_items || [],
      customFields: invoice.custom_fields || {},
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
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
    console.error("Error fetching admin invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/**
 * POST /api/admin/invoices/:id/resend
 * Resend an invoice to the customer (admin only)
 */
router.post(
  "/admin/invoices/:id/resend",
  requireRole("owner", "admin"),
  async (req: Request, res: Response) => {
    try {
      const accountId = req.accountId!;
      const { id: invoiceId } = req.params;

      // Get invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("account_id", accountId)
        .single();

      if (invoiceError || !invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (!invoice.stripe_invoice_id) {
        return res.status(400).json({ error: "Invoice is not linked to Stripe" });
      }

      // Send invoice via Stripe
      const stripe = await initializeStripe();
      await stripe.invoices.sendInvoice(invoice.stripe_invoice_id);

      // Record billing event
      await supabase.from("billing_history").insert({
        account_id: accountId,
        invoice_id: invoiceId,
        event_type: "invoice_created",
        details: {
          action: "resend",
          invoice_number: invoice.invoice_number,
          stripe_invoice_id: invoice.stripe_invoice_id,
        },
        amount: invoice.amount_total,
        currency: invoice.currency,
      });

      // Update invoice last_sent timestamp (if we add this field later)
      // For now, just record the event

      res.json({
        id: invoiceId,
        stripeInvoiceId: invoice.stripe_invoice_id,
        invoiceNumber: invoice.invoice_number,
        status: "sent",
        message: "Invoice resent successfully",
      });
    } catch (error) {
      console.error("Error resending invoice:", error);
      const message =
        error instanceof Error ? error.message : "Failed to resend invoice";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
