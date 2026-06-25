import Stripe from "stripe";
import { supabase } from "../supabase";

/**
 * Helper utilities for Stripe integration
 * Provides common operations for billing, invoices, and subscriptions
 */

// =============================================================================
// INVOICE HELPERS
// =============================================================================

/**
 * Format invoice amount from cents to currency units
 */
export function formatInvoiceAmount(
  amountCents: number,
  currency: string = "USD"
): string {
  const amount = amountCents / 100;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Convert Stripe invoice status to internal status
 */
export function mapInvoiceStatus(
  stripeStatus: string
): "draft" | "open" | "paid" | "void" | "uncollectible" {
  const statusMap: Record<string, any> = {
    draft: "draft",
    open: "open",
    paid: "paid",
    void: "void",
    uncollectible: "uncollectible",
  };
  return statusMap[stripeStatus] || stripeStatus;
}

/**
 * Get invoice line items in a readable format
 */
export function formatInvoiceLines(
  lines: Stripe.Invoice.LineItemList
): Array<{
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: string;
}> {
  return lines.data.map((line) => ({
    description: line.description || "Subscription",
    quantity: line.quantity || 1,
    unitPrice: (line.amount || 0) / (line.quantity || 1) / 100,
    amount: (line.amount || 0) / 100,
    currency: line.currency?.toUpperCase() || "USD",
  }));
}

// =============================================================================
// SUBSCRIPTION HELPERS
// =============================================================================

/**
 * Get subscription status label
 */
export function getSubscriptionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "Active",
    past_due: "Past Due",
    unpaid: "Unpaid",
    canceled: "Canceled",
    incomplete: "Incomplete",
    incomplete_expired: "Incomplete - Expired",
    trialing: "Trial",
    paused: "Paused",
  };
  return labels[status] || status;
}

/**
 * Check if subscription is active (can be used)
 */
export function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

/**
 * Calculate subscription cost per day
 */
export function calculateDailyCost(
  monthlyAmount: number,
  billingCycle: "monthly" | "yearly"
): number {
  if (billingCycle === "yearly") {
    return monthlyAmount / 365;
  }
  return monthlyAmount / 30;
}

// =============================================================================
// CURRENCY HELPERS
// =============================================================================

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "Fr",
    CAD: "C$",
    AUD: "A$",
  };
  return symbols[currency.toUpperCase()] || currency.toUpperCase();
}

/**
 * Format amount with currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

// =============================================================================
// BILLING HISTORY HELPERS
// =============================================================================

/**
 * Record a billing event
 */
export async function recordBillingEvent(
  accountId: string,
  eventType:
    | "subscription_created"
    | "subscription_updated"
    | "subscription_canceled"
    | "invoice_paid"
    | "invoice_failed"
    | "payment_method_added"
    | "payment_method_removed",
  details: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase.from("billing_history").insert({
      account_id: accountId,
      event_type: eventType,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    console.log(`[Billing Event] ${eventType} recorded for account ${accountId}`);
  } catch (error) {
    console.error("[Billing Event] Error recording event:", error);
  }
}

/**
 * Get billing event history for account
 */
export async function getBillingEventHistory(
  accountId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("billing_history")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[Billing History] Error fetching history:", error);
    return [];
  }
}

// =============================================================================
// WEBHOOK HELPERS
// =============================================================================

/**
 * Log webhook event
 */
export async function logWebhookEvent(
  eventType: string,
  eventId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.from("webhook_events").insert({
      event_type: eventType,
      stripe_event_id: eventId,
      processed_at: new Date().toISOString(),
      metadata,
    });

    if (error) throw error;
  } catch (error) {
    console.error("[Webhook Log] Error logging event:", error);
  }
}

/**
 * Check if webhook event was already processed
 */
export async function isWebhookEventProcessed(
  eventId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("stripe_event_id", eventId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("[Webhook Check] Error checking event:", error);
    return false;
  }
}

// =============================================================================
// CUSTOMER HELPERS
// =============================================================================

/**
 * Get or create Stripe customer record in database
 */
export async function saveStripeCustomer(
  stripeCustomerId: string,
  accountId: string,
  email: string,
  name: string,
  currency: string = "USD"
): Promise<void> {
  try {
    const { error } = await supabase.from("stripe_customers").upsert(
      {
        stripe_customer_id: stripeCustomerId,
        account_id: accountId,
        email,
        name,
        currency: currency.toUpperCase(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "stripe_customer_id",
      }
    );

    if (error) throw error;
  } catch (error) {
    console.error("[Customer] Error saving customer:", error);
  }
}

/**
 * Get Stripe customer from database
 */
export async function getStripeCustomerRecord(
  stripeCustomerId: string
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("stripe_customers")
      .select("*")
      .eq("stripe_customer_id", stripeCustomerId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error("[Customer] Error fetching customer:", error);
    return null;
  }
}

// =============================================================================
// PAYMENT METHOD HELPERS
// =============================================================================

/**
 * Format payment method for display
 */
export function formatPaymentMethod(paymentMethod: any): string {
  if (paymentMethod.type === "card" && paymentMethod.card) {
    const { brand, last4, exp_month, exp_year } = paymentMethod.card;
    return `${brand?.toUpperCase()} ending in ${last4} (${exp_month}/${exp_year})`;
  }
  return paymentMethod.type || "Unknown";
}

/**
 * Check if payment method is expired
 */
export function isPaymentMethodExpired(
  expMonth: number,
  expYear: number
): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (expYear < currentYear) return true;
  if (expYear === currentYear && expMonth < currentMonth) return true;
  return false;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate billing cycle
 */
export function isValidBillingCycle(cycle: string): boolean {
  return ["monthly", "yearly"].includes(cycle.toLowerCase());
}

/**
 * Validate plan configuration
 */
export async function validatePlanConfig(planId: string): Promise<boolean> {
  try {
    const { data: plan, error } = await supabase
      .from("subscription_plans")
      .select(
        "stripe_price_id_monthly_usd, stripe_price_id_monthly_eur, stripe_price_id_yearly_usd, stripe_price_id_yearly_eur"
      )
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (error) return false;

    // Check if at least one price is configured
    return !!(
      plan?.stripe_price_id_monthly_usd ||
      plan?.stripe_price_id_monthly_eur ||
      plan?.stripe_price_id_yearly_usd ||
      plan?.stripe_price_id_yearly_eur
    );
  } catch (error) {
    console.error("[Validation] Error validating plan:", error);
    return false;
  }
}
