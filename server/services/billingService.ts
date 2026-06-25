import { supabase } from "../supabase";
import {
  createOrGetStripeCustomer,
  createSubscription as createStripeSubscription,
  cancelSubscription as cancelStripeSubscription,
  resumeSubscription,
  pauseSubscription,
  getSubscription,
  getUpcomingInvoice,
  getCustomerInvoices,
  getPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
  setDefaultPaymentMethod,
} from "../integrations/stripe-advanced";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CreateSubscriptionOptions {
  accountId: string;
  planId: string;
  email: string;
  name: string;
  currency?: "USD" | "EUR";
  billingCycle?: "monthly" | "yearly";
  trialDays?: number;
}

export interface SubscriptionDetails {
  id: string;
  planId: string;
  planName: string;
  status: string;
  currency: string;
  billingCycle: string;
  pricePerCycle: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  features: any;
  limits: any;
}

export interface UsageData {
  period: string;
  apiCallsTotal: number;
  apiCallsAi: number;
  smsSent: number;
  emailsSent: number;
  callsInitiated: number;
  callsCompleted: number;
  contactsTotal: number;
  campaignsCreated: number;
  opportunitiesTotal: number;
  usageCost: number;
  estimatedTotalCost: number;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create a new subscription for an account
 */
export async function createSubscriptionForAccount(
  options: CreateSubscriptionOptions
): Promise<SubscriptionDetails> {
  try {
    // Get plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", options.planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    // Create Stripe customer
    const customer = await createOrGetStripeCustomer(
      options.accountId,
      options.email,
      options.name,
      { currency: options.currency || "USD" }
    );

    // Get price ID for selected currency and billing cycle
    const currency = options.currency || "USD";
    const billingCycle = options.billingCycle || "monthly";

    const priceKey =
      billingCycle === "yearly"
        ? currency === "EUR"
          ? "stripe_price_id_yearly_eur"
          : "stripe_price_id_yearly_usd"
        : currency === "EUR"
          ? "stripe_price_id_monthly_eur"
          : "stripe_price_id_monthly_usd";

    const priceId = plan[priceKey];

    if (!priceId) {
      throw new Error(`Price not configured for ${currency} ${billingCycle}`);
    }

    // Create subscription
    const subscription = await createStripeSubscription(
      customer.id,
      options.accountId,
      options.planId,
      priceId,
      {
        currency: currency as "USD" | "EUR",
        billingCycle: billingCycle as "monthly" | "yearly",
        trialDays: options.trialDays,
      }
    );

    // Create usage limits record
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const limits = plan.limits || {};

    await supabase.from("usage_limits").insert({
      account_id: options.accountId,
      subscription_id: subscription.id,
      period: periodStart.toISOString().split("T")[0],
      max_api_calls: limits.max_api_calls_per_day,
      max_sms: limits.max_sms_per_month,
      max_emails: limits.max_emails_per_month,
      max_contacts: limits.max_contacts,
      max_concurrent_campaigns: limits.max_concurrent_campaigns,
      max_storage_mb: (limits.storage_gb || 10) * 1024,
    });

    // Record billing event
    await supabase.from("billing_history").insert({
      account_id: options.accountId,
      subscription_id: subscription.id,
      event_type: "subscription_created",
      amount: subscription.pricePerCycle,
      currency: subscription.currency,
      details: {
        plan_name: plan.name,
        billing_cycle: billingCycle,
        trial_days: options.trialDays,
      },
    });

    return {
      id: subscription.id,
      planId: subscription.planId,
      planName: plan.name,
      status: subscription.status,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      pricePerCycle: subscription.pricePerCycle,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEnd: subscription.trialEnd,
      cancelAtPeriodEnd: false,
      features: plan.features,
      limits: plan.limits,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Get subscription details for an account
 */
export async function getAccountSubscription(
  accountId: string
): Promise<SubscriptionDetails | null> {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("account_id", accountId)
      .in("status", ["active", "trialing", "paused"])
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No subscription found
        return null;
      }
      throw error;
    }

    if (!subscription) {
      return null;
    }

    const plan = subscription.subscription_plans;

    return {
      id: subscription.id,
      planId: subscription.plan_id,
      planName: plan.name,
      status: subscription.status,
      currency: subscription.currency,
      billingCycle: subscription.billing_cycle,
      pricePerCycle: subscription.price_per_cycle,
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      features: plan.features,
      limits: plan.limits,
    };
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelAccountSubscription(
  accountId: string,
  immediate: boolean = false,
  reason?: string
): Promise<void> {
  try {
    // Get subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("account_id", accountId)
      .in("status", ["active", "trialing"])
      .single();

    if (error || !subscription) {
      throw new Error("No active subscription found");
    }

    // Cancel via Stripe
    await cancelStripeSubscription(subscription.stripe_subscription_id, immediate, reason);

    // Record event
    await supabase.from("billing_history").insert({
      account_id: accountId,
      subscription_id: subscription.id,
      event_type: "subscription_canceled",
      details: { reason, immediate },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Pause subscription
 */
export async function pauseAccountSubscription(accountId: string): Promise<void> {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("account_id", accountId)
      .eq("status", "active")
      .single();

    if (error || !subscription) {
      throw new Error("No active subscription found");
    }

    await pauseSubscription(subscription.stripe_subscription_id);

    await supabase
      .from("subscriptions")
      .update({ status: "paused", updated_at: new Date() })
      .eq("id", subscription.id);

    await supabase.from("billing_history").insert({
      account_id: accountId,
      subscription_id: subscription.id,
      event_type: "subscription_paused",
    });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    throw error;
  }
}

/**
 * Resume paused subscription
 */
export async function resumeAccountSubscription(accountId: string): Promise<void> {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("account_id", accountId)
      .eq("status", "paused")
      .single();

    if (error || !subscription) {
      throw new Error("No paused subscription found");
    }

    await resumeSubscription(subscription.stripe_subscription_id);

    await supabase
      .from("subscriptions")
      .update({ status: "active", updated_at: new Date() })
      .eq("id", subscription.id);

    await supabase.from("billing_history").insert({
      account_id: accountId,
      subscription_id: subscription.id,
      event_type: "subscription_resumed",
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
}

// ============================================================================
// INVOICES & BILLING
// ============================================================================

/**
 * Get invoices for account
 */
export async function getAccountInvoices(
  accountId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ invoices: any[]; total: number }> {
  try {
    const { data, count, error } = await supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order("issue_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      invoices: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
}

/**
 * Get upcoming invoice for account
 */
export async function getAccountUpcomingInvoice(accountId: string): Promise<any | null> {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .in("status", ["active", "trialing"])
      .single();

    if (!subscription?.stripe_customer_id) {
      return null;
    }

    const upcomingInvoice = await getUpcomingInvoice(subscription.stripe_customer_id);

    return {
      amountTotal: (upcomingInvoice.total || 0) / 100,
      currency: upcomingInvoice.currency?.toUpperCase(),
      periodStart: new Date(upcomingInvoice.period_start! * 1000),
      periodEnd: new Date(upcomingInvoice.period_end! * 1000),
      dueDate: upcomingInvoice.due_date ? new Date(upcomingInvoice.due_date * 1000) : null,
      items: upcomingInvoice.lines.data.map((line) => ({
        description: line.description,
        amount: (line.amount || 0) / 100,
        quantity: line.quantity,
      })),
    };
  } catch (error) {
    console.error("Error getting upcoming invoice:", error);
    return null;
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Get usage metrics for current period
 */
export async function getAccountUsage(accountId: string): Promise<UsageData | null> {
  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: usage, error } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("account_id", accountId)
      .eq("period", period)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No data yet
        return null;
      }
      throw error;
    }

    return {
      period: usage.period,
      apiCallsTotal: usage.api_calls_total || 0,
      apiCallsAi: usage.api_calls_ai || 0,
      smsSent: usage.sms_sent || 0,
      emailsSent: usage.emails_sent || 0,
      callsInitiated: usage.calls_initiated || 0,
      callsCompleted: usage.calls_completed || 0,
      contactsTotal: usage.contacts_total || 0,
      campaignsCreated: usage.campaigns_created || 0,
      opportunitiesTotal: usage.opportunities_total || 0,
      usageCost: usage.usage_cost || 0,
      estimatedTotalCost: usage.estimated_total_cost || 0,
    };
  } catch (error) {
    console.error("Error getting usage:", error);
    throw error;
  }
}

/**
 * Update usage metrics
 */
export async function recordUsage(
  accountId: string,
  usage: Partial<UsageData>
): Promise<void> {
  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (usage.apiCallsTotal) updateData.api_calls_total = usage.apiCallsTotal;
    if (usage.apiCallsAi) updateData.api_calls_ai = usage.apiCallsAi;
    if (usage.smsSent) updateData.sms_sent = usage.smsSent;
    if (usage.emailsSent) updateData.emails_sent = usage.emailsSent;
    if (usage.callsInitiated) updateData.calls_initiated = usage.callsInitiated;
    if (usage.callsCompleted) updateData.calls_completed = usage.callsCompleted;
    if (usage.contactsTotal) updateData.contacts_total = usage.contactsTotal;
    if (usage.campaignsCreated) updateData.campaigns_created = usage.campaignsCreated;
    if (usage.opportunitiesTotal) updateData.opportunities_total = usage.opportunitiesTotal;

    const { error } = await supabase
      .from("usage_metrics")
      .upsert(
        {
          account_id: accountId,
          period,
          ...updateData,
        },
        { onConflict: "account_id,period" }
      );

    if (error) throw error;
  } catch (error) {
    console.error("Error recording usage:", error);
    throw error;
  }
}

/**
 * Get usage limits for current period
 */
export async function getUsageLimits(accountId: string): Promise<any | null> {
  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data, error } = await supabase
      .from("usage_limits")
      .select("*")
      .eq("account_id", accountId)
      .eq("period", period)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting usage limits:", error);
    throw error;
  }
}

/**
 * Check if usage is within limits
 */
export async function checkUsageLimits(
  accountId: string,
  type: "api_calls" | "sms" | "emails" | "contacts" | "campaigns",
  amount: number = 1
): Promise<{ allowed: boolean; remaining: number; percentage: number }> {
  try {
    const limits = await getUsageLimits(accountId);
    const usage = await getAccountUsage(accountId);

    if (!limits) {
      return { allowed: true, remaining: -1, percentage: 0 };
    }

    let limit = 0;
    let used = 0;

    switch (type) {
      case "api_calls":
        limit = limits.max_api_calls;
        used = limits.used_api_calls || 0;
        break;
      case "sms":
        limit = limits.max_sms;
        used = limits.used_sms || 0;
        break;
      case "emails":
        limit = limits.max_emails;
        used = limits.used_emails || 0;
        break;
      case "contacts":
        limit = limits.max_contacts;
        used = limits.used_contacts || 0;
        break;
      case "campaigns":
        limit = limits.max_concurrent_campaigns;
        used = limits.used_concurrent_campaigns || 0;
        break;
    }

    const remaining = limit - used;
    const allowed = remaining >= amount;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;

    return { allowed, remaining: Math.max(0, remaining), percentage };
  } catch (error) {
    console.error("Error checking usage limits:", error);
    throw error;
  }
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Get payment methods for account
 */
export async function getAccountPaymentMethods(accountId: string): Promise<any[]> {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .single();

    if (!subscription?.stripe_customer_id) {
      return [];
    }

    const methods = await getPaymentMethods(subscription.stripe_customer_id);

    return methods.map((method) => ({
      id: method.id,
      type: method.type,
      brand: method.card?.brand,
      lastFour: method.card?.last4,
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year,
    }));
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return [];
  }
}

/**
 * Add payment method to account
 */
export async function addPaymentMethod(
  accountId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .single();

    if (!subscription?.stripe_customer_id) {
      throw new Error("No customer found for account");
    }

    await attachPaymentMethod(subscription.stripe_customer_id, paymentMethodId);

    // Store in database
    await supabase.from("payment_methods").insert({
      account_id: accountId,
      stripe_payment_method_id: paymentMethodId,
      stripe_customer_id: subscription.stripe_customer_id,
      type: "card",
      is_active: true,
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethodForAccount(
  accountId: string,
  paymentMethodId: string
): Promise<void> {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("account_id", accountId)
      .single();

    if (!subscription?.stripe_customer_id) {
      throw new Error("No customer found");
    }

    await setDefaultPaymentMethod(subscription.stripe_customer_id, paymentMethodId);

    // Update defaults in database
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("account_id", accountId);

    await supabase
      .from("payment_methods")
      .update({ is_default: true })
      .eq("stripe_payment_method_id", paymentMethodId);
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
}

// ============================================================================
// BILLING HISTORY
// ============================================================================

/**
 * Get billing history for account
 */
export async function getAccountBillingHistory(
  accountId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ events: any[]; total: number }> {
  try {
    const { data, count, error } = await supabase
      .from("billing_history")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      events: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error("Error getting billing history:", error);
    throw error;
  }
}
