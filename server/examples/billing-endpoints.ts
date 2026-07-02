/**
 * Stripe Billing Endpoints Implementation Guide
 *
 * This guide demonstrates the three main billing endpoints:
 * 1. POST /api/billing/checkout - Create checkout session
 * 2. GET /api/billing/invoices - Get invoices with filtering
 * 3. POST /api/webhooks/stripe - Handle webhook events
 *
 * Both USD and EUR currencies are supported
 */

import * as crypto from "crypto";

// =============================================================================
// 1. CREATE CHECKOUT SESSION
// =============================================================================

/**
 * POST /api/billing/checkout
 * Create a Stripe checkout session for purchasing/upgrading subscription
 *
 * Required headers:
 * - Authorization: Bearer <token>
 * - Content-Type: application/json
 *
 * Request body:
 * {
 *   "planId": "plan_pro",                    // subscription plan ID
 *   "billingCycle": "monthly",               // "monthly" or "yearly"
 *   "currency": "usd",                       // "usd" or "eur"
 *   "successUrl": "https://app.com/success", // optional: custom redirect
 *   "cancelUrl": "https://app.com/cancel",   // optional: custom redirect
 *   "metadata": {                            // optional: custom metadata
 *     "campaignId": "camp_123"
 *   }
 * }
 *
 * Response:
 * {
 *   "sessionId": "cs_live_abc123",
 *   "checkoutUrl": "https://checkout.stripe.com/...",
 *   "currency": "USD",
 *   "billingCycle": "monthly",
 *   "planId": "plan_pro",
 *   "estimatedAmount": 99.00
 * }
 */

export async function createCheckoutExample() {
  const token = "your_auth_token";

  const response = await fetch("https://api.app.com/api/billing/checkout", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planId: "plan_pro",
      billingCycle: "monthly",
      currency: "usd", // or "eur"
      successUrl: "https://app.com/dashboard?payment=success",
      cancelUrl: "https://app.com/billing?payment=cancelled",
      metadata: {
        source: "web_portal",
      },
    }),
  });

  const data = await response.json();
  console.log("Checkout URL:", data.checkoutUrl);

  // Redirect user to Stripe checkout
  window.location.href = data.checkoutUrl;
}

// USD Example
export const checkoutExampleUSD = {
  method: "POST",
  url: "/api/billing/checkout",
  body: {
    planId: "plan_pro",
    billingCycle: "monthly",
    currency: "usd",
  },
};

// EUR Example
export const checkoutExampleEUR = {
  method: "POST",
  url: "/api/billing/checkout",
  body: {
    planId: "plan_pro",
    billingCycle: "monthly",
    currency: "eur",
  },
};

// Yearly Subscription
export const checkoutYearlyExample = {
  method: "POST",
  url: "/api/billing/checkout",
  body: {
    planId: "plan_pro",
    billingCycle: "yearly",
    currency: "usd",
  },
};

// =============================================================================
// 2. GET INVOICES
// =============================================================================

/**
 * GET /api/billing/invoices
 * Retrieve paginated invoices for the account with optional filtering
 *
 * Query parameters:
 * - limit: number (default: 10) - Items per page
 * - offset: number (default: 0) - Pagination offset
 * - status: string (optional) - Filter by status: paid, open, draft, void, uncollectible
 * - currency: string (optional) - Filter by currency: USD, EUR
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "id": "in_1234567890",
 *       "invoiceNumber": "INV-001",
 *       "status": "paid",
 *       "amount": 99.00,
 *       "currency": "USD",
 *       "issueDate": "2024-01-15T10:00:00Z",
 *       "paidDate": "2024-01-15T14:30:00Z",
 *       "dueDate": "2024-02-15T10:00:00Z",
 *       "pdfUrl": "https://invoice.pdf",
 *       "subscriptionId": "sub_123456",
 *       "metadata": {}
 *     }
 *   ],
 *   "total": 15,
 *   "pagination": {
 *     "limit": 10,
 *     "offset": 0
 *   }
 * }
 */

export async function getInvoicesExample() {
  const token = "your_auth_token";

  // Get all invoices
  const response = await fetch(
    "https://api.app.com/api/billing/invoices?limit=10&offset=0",
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  console.log("Total invoices:", data.total);
  console.log("Invoices:", data.data);

  return data;
}

// Get paid invoices only
export const getPaidInvoicesExample = {
  method: "GET",
  url: "/api/billing/invoices?status=paid&limit=25",
};

// Get USD invoices
export const getUSDInvoicesExample = {
  method: "GET",
  url: "/api/billing/invoices?currency=USD&limit=10",
};

// Get EUR invoices
export const getEURInvoicesExample = {
  method: "GET",
  url: "/api/billing/invoices?currency=EUR&limit=10",
};

// Get open invoices (awaiting payment)
export const getOpenInvoicesExample = {
  method: "GET",
  url: "/api/billing/invoices?status=open&limit=10",
};

// Paginate through invoices
export async function paginateInvoicesExample() {
  const token = "your_auth_token";
  const pageSize = 10;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.app.com/api/billing/invoices?limit=${pageSize}&offset=${offset}`,
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    );

    const { data, total } = await response.json();
    console.log(`Page ${Math.floor(offset / pageSize) + 1}:`, data);

    offset += pageSize;
    hasMore = offset < total;
  }
}

// =============================================================================
// 3. STRIPE WEBHOOK
// =============================================================================

/**
 * POST /api/webhooks/stripe
 * Webhook endpoint for handling Stripe events
 * NO AUTHENTICATION REQUIRED - uses Stripe signature verification
 *
 * Required headers:
 * - stripe-signature: <Stripe-Signature-Header>
 * - Content-Type: application/json
 *
 * Supported events:
 * - customer.subscription.created - New subscription created
 * - customer.subscription.updated - Subscription modified
 * - customer.subscription.deleted - Subscription canceled
 * - invoice.paid - Invoice payment succeeded
 * - invoice.payment_failed - Invoice payment failed
 * - payment_intent.succeeded - Payment intent succeeded
 * - customer.created - New customer created
 * - customer.deleted - Customer deleted
 *
 * Response:
 * {
 *   "received": true,
 *   "eventId": "evt_1234567890",
 *   "eventType": "invoice.paid",
 *   "processedAt": "2024-01-15T10:00:00Z"
 * }
 *
 * Error responses:
 * - 400: Invalid signature (possible tampering)
 * - 500: Processing error (still logged, can retry)
 */

// Example webhook payload (from Stripe)
export const webhookPayloadExample = {
  id: "evt_1234567890",
  object: "event",
  api_version: "2024-04-10",
  created: 1705320000,
  data: {
    object: {
      id: "in_1234567890",
      object: "invoice",
      customer: "cus_1234567890",
      subscription: "sub_1234567890",
      total: 9900, // in cents
      currency: "usd",
      status: "paid",
      paid: true,
      paid_at: 1705320000,
      created: 1705310000,
      metadata: {
        accountId: "acc_123",
        planId: "plan_pro",
      },
    },
  },
  type: "invoice.paid",
};

// Webhook configuration example (do this in Stripe Dashboard)
export const webhookConfigurationGuide = {
  description: "How to configure webhooks in Stripe Dashboard",
  steps: [
    "1. Go to https://dashboard.stripe.com/webhooks",
    "2. Click 'Add endpoint'",
    "3. Enter endpoint URL: https://api.yourapp.com/api/webhooks/stripe",
    "4. Select events:",
    "   - customer.subscription.created",
    "   - customer.subscription.updated",
    "   - customer.subscription.deleted",
    "   - invoice.paid",
    "   - invoice.payment_failed",
    "   - payment_intent.succeeded",
    "   - customer.created",
    "   - customer.deleted",
    "5. Copy the Signing Secret",
    "6. Set STRIPE_WEBHOOK_SECRET environment variable",
    "7. Click 'Add endpoint'",
  ],
};

// Verify webhook signature (example implementation)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const [timestamp, signedContent] = signature.split(",").map((pair: string) => {
    const [key, value] = pair.split("=");
    return value;
  });

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return expectedSignature === signedContent;
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

export const environmentVariables = {
  description: "Required environment variables for Stripe integration",
  variables: {
    STRIPE_SECRET_KEY: {
      description: "Stripe API secret key",
      format: "sk_live_... or sk_test_...",
      required: true,
    },
    STRIPE_PUBLISHABLE_KEY: {
      description: "Stripe API publishable key",
      format: "pk_live_... or pk_test_...",
      required: true,
    },
    STRIPE_WEBHOOK_SECRET: {
      description: "Webhook signing secret from Stripe Dashboard",
      format: "whsec_...",
      required: true,
    },
  },
};

// =============================================================================
// CURL EXAMPLES
// =============================================================================

export const curlExamples = {
  createCheckout: `
curl -X POST https://api.yourapp.com/api/billing/checkout \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "planId": "plan_pro",
    "billingCycle": "monthly",
    "currency": "usd"
  }'
  `,

  getInvoices: `
curl https://api.yourapp.com/api/billing/invoices?limit=10&offset=0 \\
  -H "Authorization: Bearer YOUR_TOKEN"
  `,

  getInvoicesPaid: `
curl https://api.yourapp.com/api/billing/invoices?status=paid&currency=USD \\
  -H "Authorization: Bearer YOUR_TOKEN"
  `,

  testWebhook: `
# This should be done from Stripe Dashboard -> Webhooks -> Send test event
# Or use Stripe CLI:
stripe listen --forward-to localhost:3001/api/webhooks/stripe
  `,
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export const errorHandling = {
  checkout_errors: {
    "Plan not found": "Verify planId exists and is active",
    "Invalid currency": "Use 'usd' or 'eur'",
    "Price not configured": "Plan is missing Stripe price IDs for selected currency/cycle",
    "Account not found": "User must be authenticated",
  },
  invoices_errors: {
    "No invoices found": "Account may not have billing history yet",
    "Invalid status filter": "Use: paid, open, draft, void, uncollectible",
  },
  webhook_errors: {
    "Invalid signature": "Webhook secret mismatch or tampering detected",
    "Processing error": "Check server logs, webhook will retry",
  },
};

// =============================================================================
// CURRENCY SUPPORT
// =============================================================================

export const currencySupport = {
  supported: ["USD", "EUR"],
  description: "Both USD and EUR are supported for all billing operations",
  examples: {
    usd: {
      symbol: "$",
      minAmount: 0.50,
      maxAmount: 9999999.99,
      decimalPlaces: 2,
    },
    eur: {
      symbol: "€",
      minAmount: 0.50,
      decimalPlaces: 2,
      maxAmount: 9999999.99,
    },
  },
};

// =============================================================================
// ADMIN BILLING ENDPOINTS
// =============================================================================

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions for the account (admin only)
 *
 * Required headers:
 * - Authorization: Bearer <token>
 * - User must have 'owner' or 'admin' role
 *
 * Query parameters:
 * - limit: number (default: 25) - Items per page
 * - offset: number (default: 0) - Pagination offset
 * - status: string (optional) - Filter by status: active, paused, canceled, trialing, etc.
 * - planId: string (optional) - Filter by plan ID
 * - currency: string (optional) - Filter by currency: USD, EUR
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "id": "sub_abc123",
 *       "stripeSubscriptionId": "sub_stripe_123",
 *       "planId": "plan_pro_id",
 *       "planName": "Professional",
 *       "status": "active",
 *       "currency": "USD",
 *       "billingCycle": "monthly",
 *       "pricePerCycle": 49.99,
 *       "currentPeriodStart": "2024-01-15",
 *       "currentPeriodEnd": "2024-02-15",
 *       "trialEnd": null,
 *       "cancelAtPeriodEnd": false,
 *       "createdAt": "2024-01-15T10:00:00Z",
 *       "updatedAt": "2024-01-15T10:00:00Z"
 *     }
 *   ],
 *   "total": 5,
 *   "pagination": {
 *     "limit": 25,
 *     "offset": 0
 *   }
 * }
 */

export const getAdminSubscriptionsExample = {
  method: "GET",
  url: "/api/admin/subscriptions?limit=25&offset=0",
  headers: {
    "Authorization": "Bearer <your_admin_token>",
  },
};

// Get active subscriptions
export const getActiveSubscriptionsExample = {
  method: "GET",
  url: "/api/admin/subscriptions?status=active&limit=25",
};

// Get subscriptions for specific plan
export const getSubscriptionsByPlanExample = {
  method: "GET",
  url: "/api/admin/subscriptions?planId=plan_pro_id&limit=25",
};

// Get EUR subscriptions
export const getEURSubscriptionsExample = {
  method: "GET",
  url: "/api/admin/subscriptions?currency=EUR&limit=25",
};

/**
 * PATCH /api/admin/subscriptions/:id
 * Change subscription plan (admin only)
 *
 * Required headers:
 * - Authorization: Bearer <token>
 * - Content-Type: application/json
 * - User must have 'owner' or 'admin' role
 *
 * URL parameters:
 * - id: subscription ID
 *
 * Request body:
 * {
 *   "planId": "plan_enterprise_id",           // Required: new plan ID
 *   "billingCycle": "yearly",                 // Optional: monthly or yearly (default: keep current)
 *   "prorationBehavior": "create_prorations"  // Optional: create_prorations, always_invoice, or none
 * }
 *
 * Response:
 * {
 *   "id": "sub_abc123",
 *   "planId": "plan_enterprise_id",
 *   "planName": "Enterprise",
 *   "status": "active",
 *   "billingCycle": "yearly",
 *   "pricePerCycle": 299.99,
 *   "currentPeriodStart": "2024-01-15T00:00:00Z",
 *   "currentPeriodEnd": "2025-01-15T00:00:00Z",
 *   "prorationCredit": 45.50
 * }
 */

export const updateSubscriptionPlanExample = {
  method: "PATCH",
  url: "/api/admin/subscriptions/sub_abc123",
  headers: {
    "Authorization": "Bearer <your_admin_token>",
    "Content-Type": "application/json",
  },
  body: {
    planId: "plan_enterprise_id",
    billingCycle: "yearly",
    prorationBehavior: "create_prorations",
  },
};

// Upgrade without proration
export const upgradeSubscriptionExample = {
  method: "PATCH",
  url: "/api/admin/subscriptions/sub_abc123",
  body: {
    planId: "plan_enterprise_id",
  },
};

// Change to monthly without changing plan
export const changeToBillingCycleExample = {
  method: "PATCH",
  url: "/api/admin/subscriptions/sub_abc123",
  body: {
    planId: "plan_pro_id", // current plan
    billingCycle: "monthly",
    prorationBehavior: "none",
  },
};

/**
 * GET /api/admin/invoices
 * Get all invoices for the account (admin only)
 *
 * Required headers:
 * - Authorization: Bearer <token>
 * - User must have 'owner' or 'admin' role
 *
 * Query parameters:
 * - limit: number (default: 25) - Items per page
 * - offset: number (default: 0) - Pagination offset
 * - status: string (optional) - Filter by status: paid, open, draft, void, uncollectible
 * - currency: string (optional) - Filter by currency: USD, EUR
 * - subscriptionId: string (optional) - Filter by subscription ID
 *
 * Response:
 * {
 *   "data": [
 *     {
 *       "id": "inv_abc123",
 *       "stripeInvoiceId": "in_stripe_123",
 *       "invoiceNumber": "INV-001",
 *       "subscriptionId": "sub_abc123",
 *       "status": "paid",
 *       "currency": "USD",
 *       "amountSubtotal": 49.99,
 *       "amountTax": 0,
 *       "amountTotal": 49.99,
 *       "amountPaid": 49.99,
 *       "amountDue": 0,
 *       "amountRemaining": 0,
 *       "issueDate": "2024-01-15",
 *       "dueDate": "2024-02-15",
 *       "paidDate": "2024-01-15",
 *       "pdfUrl": "https://invoice.pdf",
 *       "hostedInvoiceUrl": "https://invoice.stripe.com",
 *       "lineItems": [],
 *       "createdAt": "2024-01-15T10:00:00Z"
 *     }
 *   ],
 *   "total": 12,
 *   "pagination": {
 *     "limit": 25,
 *     "offset": 0
 *   }
 * }
 */

export const getAdminInvoicesExample = {
  method: "GET",
  url: "/api/admin/invoices?limit=25&offset=0",
  headers: {
    "Authorization": "Bearer <your_admin_token>",
  },
};

// Get paid invoices
export const getPaidInvoicesByAdminExample = {
  method: "GET",
  url: "/api/admin/invoices?status=paid&limit=25",
};

// Get open invoices (awaiting payment)
export const getOpenInvoicesByAdminExample = {
  method: "GET",
  url: "/api/admin/invoices?status=open&limit=25",
};

// Get invoices for specific subscription
export const getSubscriptionInvoicesExample = {
  method: "GET",
  url: "/api/admin/invoices?subscriptionId=sub_abc123&limit=25",
};

/**
 * POST /api/admin/invoices/:id/resend
 * Resend an invoice to the customer (admin only)
 *
 * Required headers:
 * - Authorization: Bearer <token>
 * - User must have 'owner' or 'admin' role
 *
 * URL parameters:
 * - id: invoice ID
 *
 * Request body: {} (empty)
 *
 * Response:
 * {
 *   "id": "inv_abc123",
 *   "stripeInvoiceId": "in_stripe_123",
 *   "invoiceNumber": "INV-001",
 *   "status": "sent",
 *   "message": "Invoice resent successfully"
 * }
 */

export const resendInvoiceExample = {
  method: "POST",
  url: "/api/admin/invoices/inv_abc123/resend",
  headers: {
    "Authorization": "Bearer <your_admin_token>",
    "Content-Type": "application/json",
  },
  body: {},
};

// =============================================================================
// ADMIN ENDPOINTS ERROR HANDLING
// =============================================================================

export const adminErrorHandling = {
  subscriptions_errors: {
    "Insufficient permissions": "User must have 'owner' or 'admin' role",
    "Subscription not found": "Invalid subscription ID or doesn't belong to account",
    "Plan not found": "Plan ID is invalid or inactive",
  },
  plan_change_errors: {
    "Plan ID is required": "Must provide planId in request body",
    "Price not available": "Plan is missing price for the currency/billing cycle combination",
    "Invalid subscription": "Cannot change plan for canceled subscriptions",
  },
  invoices_errors: {
    "Invoice not found": "Invalid invoice ID or doesn't belong to account",
    "Not linked to Stripe": "Invoice must be synced with Stripe before resending",
  },
};

// =============================================================================
// MIGRATION GUIDE FROM EXISTING ENDPOINTS
// =============================================================================

export const migrationGuide = {
  oldCheckoutEndpoint: "/api/billing/checkout",
  newCheckoutEndpoint: "/api/billing/checkout",
  changes: [
    "Enhanced response with sessionId, currency, and estimatedAmount",
    "Added support for custom redirect URLs",
    "Better error messages",
    "Improved metadata handling",
  ],

  oldInvoicesEndpoint: "/api/billing/invoices",
  newInvoicesEndpoint: "/api/billing/invoices",
  improvements: [
    "Added status and currency filtering",
    "Better pagination object in response",
    "Enhanced invoice data transformation",
    "Support for invoice PDF URLs",
  ],

  webhookEndpoint: "/api/webhooks/stripe",
  webhookImprovements: [
    "Better error handling with detailed messages",
    "Event logging and tracking",
    "Support for webhook event deduplication",
    "Improved metadata extraction",
  ],

  adminEndpoints: [
    "GET /api/admin/subscriptions - List all account subscriptions with filtering",
    "PATCH /api/admin/subscriptions/:id - Change subscription plan with proration options",
    "GET /api/admin/invoices - List all account invoices with filtering",
    "POST /api/admin/invoices/:id/resend - Resend invoice to customer",
  ],

  adminEndpointFeatures: {
    authorization: "Owner or Admin role required",
    multiCurrency: "USD and EUR support",
    filtering: "Filter by status, plan, currency, subscription",
    pagination: "Standard pagination with limit and offset",
    prorating: "Flexible proration options when changing plans",
    billing_events: "Automatic billing history tracking",
  },
};
