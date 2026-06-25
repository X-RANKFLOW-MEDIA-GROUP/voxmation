import { Router, Request, Response } from "express";
import { tenantMiddleware, requireRole } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";
import {
  createCheckoutSession,
  createStripeCustomer,
  getCustomerInvoices,
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
 * Get invoices for account
 */
router.get("/invoices", async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { limit = 10, offset = 0 } = req.query;

    const { data, count, error } = await supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order("issue_date", { ascending: false })
      .range(
        parseInt(offset as string),
        parseInt(offset as string) + parseInt(limit as string) - 1
      );

    if (error) throw error;

    res.json({ data: data || [], total: count || 0 });
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
 * Create checkout session (requires owner/admin)
 */
router.post("/checkout", requireRole("owner", "admin"), async (req: Request, res: Response) => {
  try {
    const accountId = req.accountId!;
    const { planId, billingCycle = "monthly" } = req.body;

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

    // Check if customer exists
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .single();

    if (subscription?.stripe_customer_id) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      // Create new customer
      const customer = await createStripeCustomer(
        accountId,
        account?.email || "billing@account.local",
        account?.name || "Account"
      );
      stripeCustomerId = customer.id;
    }

    // Get Stripe price ID based on billing cycle
    const priceId =
      billingCycle === "yearly"
        ? plan.stripe_price_id_yearly
        : plan.stripe_price_id_monthly;

    if (!priceId) {
      return res.status(400).json({
        error: "Stripe configuration incomplete for this plan",
      });
    }

    // Create checkout session
    const successUrl = `${req.protocol}://${req.get("host")}/portal/billing?success=true`;
    const cancelUrl = `${req.protocol}://${req.get("host")}/portal/billing?success=false`;

    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;
