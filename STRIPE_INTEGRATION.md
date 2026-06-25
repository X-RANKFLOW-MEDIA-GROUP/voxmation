# Stripe Integration Documentation

Complete Stripe integration for Voxmation with support for USD/EUR currencies, subscriptions, invoices, and webhook handling.

## Table of Contents

- [Setup](#setup)
- [Core Features](#core-features)
- [API Reference](#api-reference)
- [Webhook Setup](#webhook-setup)
- [Database Schema](#database-schema)
- [Examples](#examples)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

## Setup

### 1. Install Dependencies

The project requires the `stripe` package:

```bash
npm install stripe
# or
pnpm add stripe
```

### 2. Environment Configuration

Add these environment variables to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

### 3. Initialize Stripe

The Stripe client is automatically initialized on first use, or you can initialize it explicitly:

```typescript
import { initializeStripe } from "./server/integrations/stripe";

// Initialize with environment variables
const stripe = initializeStripe();

// Or with explicit config
const stripe = initializeStripe({
  secretKey: "sk_live_...",
  publishableKey: "pk_live_...",
  webhookSecret: "whsec_...",
});
```

## Core Features

### 1. Customer Management

#### Create a Customer

```typescript
import { createStripeCustomer } from "./server/integrations/stripe";

const customer = await createStripeCustomer(
  "account-123",
  "user@example.com",
  "John Doe",
  "usd" // or "eur"
);
```

#### Retrieve Customer

```typescript
import { getStripeCustomer } from "./server/integrations/stripe";

const customer = await getStripeCustomer("cus_123456");
```

#### Update Customer

```typescript
import { updateStripeCustomer } from "./server/integrations/stripe";

const updated = await updateStripeCustomer("cus_123456", {
  email: "newemail@example.com",
  name: "Jane Doe",
  metadata: { plan: "pro" },
});
```

### 2. Subscription Management

#### Create Subscription

```typescript
import { createSubscription } from "./server/integrations/stripe";

const subscription = await createSubscription({
  customerId: "cus_123456",
  priceId: "price_1234567890",
  trialDays: 14,
  currency: "usd",
  metadata: {
    accountId: "account-123",
    planId: "plan-pro",
  },
});
```

#### Get Subscription Details

```typescript
import { getSubscription } from "./server/integrations/stripe";

const subscription = await getSubscription("sub_123456");
```

#### List Customer Subscriptions

```typescript
import { listCustomerSubscriptions } from "./server/integrations/stripe";

const subscriptions = await listCustomerSubscriptions("cus_123456");
```

#### Update Subscription

```typescript
import { updateSubscription } from "./server/integrations/stripe";

const updated = await updateSubscription("sub_123456", {
  priceId: "price_new_9876543", // Change plan
  metadata: { tier: "enterprise" },
});
```

#### Cancel Subscription

```typescript
import { cancelSubscription } from "./server/integrations/stripe";

// Immediate cancellation
const cancelled = await cancelSubscription("sub_123456", false);

// Cancel at period end
const cancelled = await cancelSubscription("sub_123456", true);
```

### 3. Checkout & Payments

#### Create Checkout Session

```typescript
import { createCheckoutSession } from "./server/integrations/stripe";

const session = await createCheckoutSession({
  customerId: "cus_123456",
  priceId: "price_1234567890",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  currency: "eur",
  metadata: { planId: "plan-pro" },
});

console.log(session.url); // Redirect user to this URL
```

#### Get Checkout Session

```typescript
import { getCheckoutSession } from "./server/integrations/stripe";

const session = await getCheckoutSession("cs_123456");
```

### 4. Invoices & Billing

#### Get Upcoming Invoice

```typescript
import { getUpcomingInvoice } from "./server/integrations/stripe";

const invoice = await getUpcomingInvoice("cus_123456");

if (invoice) {
  console.log(`Amount: ${invoice.currency?.toUpperCase()} ${invoice.total / 100}`);
  console.log(`Due: ${new Date(invoice.period_end * 1000)}`);
}
```

#### Get Invoices

```typescript
import { getInvoices } from "./server/integrations/stripe";

const invoices = await getInvoices({
  customerId: "cus_123456",
  limit: 25,
  status: "paid", // Filter: 'paid', 'open', 'draft', 'void', 'uncollectible'
});

invoices.forEach((invoice) => {
  console.log(`${invoice.number}: ${invoice.status} - ${invoice.currency} ${invoice.total / 100}`);
});
```

#### Get Specific Invoice

```typescript
import { getInvoice } from "./server/integrations/stripe";

const invoice = await getInvoice("in_123456");
```

## Webhook Setup

### 1. Register Webhook Handlers

```typescript
import { registerWebhookHandlers } from "./server/integrations/stripe";

registerWebhookHandlers({
  onSubscriptionCreated: async (subscription) => {
    console.log(`New subscription: ${subscription.id}`);
    // Update database, send welcome email, etc.
  },

  onSubscriptionUpdated: async (subscription) => {
    console.log(`Subscription updated: ${subscription.id}`);
  },

  onSubscriptionDeleted: async (subscription) => {
    console.log(`Subscription canceled: ${subscription.id}`);
  },

  onInvoicePaid: async (invoice) => {
    console.log(`Invoice paid: ${invoice.id}`);
    // Send receipt, grant access, etc.
  },

  onInvoicePaymentFailed: async (invoice) => {
    console.log(`Payment failed: ${invoice.id}`);
    // Alert user, notify support, etc.
  },

  onPaymentSucceeded: async (invoice) => {
    console.log(`Payment succeeded: ${invoice.id}`);
  },

  onCustomerCreated: async (customer) => {
    console.log(`Customer created: ${customer.id}`);
  },

  onCustomerDeleted: async (customer) => {
    console.log(`Customer deleted: ${customer.id}`);
  },
});
```

### 2. Verify & Handle Webhooks

In your webhook endpoint (`POST /api/webhooks/stripe`):

```typescript
import { verifyAndHandleWebhook } from "./server/integrations/stripe";

router.post("/stripe", raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  try {
    const event = await verifyAndHandleWebhook(
      req.body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`Processed event: ${event.type}`);
    res.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook failed" });
  }
});
```

## API Endpoints

The integration provides these Express endpoints in `/api/billing/` and `/api/webhooks/`:

### Billing Endpoints

#### `POST /api/billing/checkout`

Create a checkout session for subscription purchase.

**Body:**

```json
{
  "planId": "plan-pro",
  "billingCycle": "monthly",
  "currency": "usd"
}
```

**Response:**

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### `POST /api/billing/subscribe`

Create a subscription directly (requires payment method on file).

**Body:**

```json
{
  "planId": "plan-pro",
  "billingCycle": "monthly",
  "trialDays": 14,
  "currency": "usd"
}
```

**Response:**

```json
{
  "subscriptionId": "sub_123456",
  "status": "trialing",
  "currentPeriodStart": 1234567890,
  "currentPeriodEnd": 1234567890,
  "trialEnd": 1234567890
}
```

#### `GET /api/billing/subscription/:id`

Get subscription details.

**Response:**

```json
{
  "id": "sub_123456",
  "status": "active",
  "customer": "cus_123456",
  "currentPeriodStart": 1234567890,
  "currentPeriodEnd": 1234567890,
  "trialEnd": null,
  "items": [
    {
      "priceId": "price_123456",
      "quantity": 1
    }
  ]
}
```

#### `POST /api/billing/subscription/:id/cancel`

Cancel a subscription.

**Body:**

```json
{
  "atPeriodEnd": false
}
```

**Response:**

```json
{
  "id": "sub_123456",
  "status": "canceled",
  "canceledAt": 1234567890,
  "cancelAtPeriodEnd": false
}
```

#### `GET /api/billing/invoices/:customerId?limit=25&status=paid`

Get customer invoices.

**Response:**

```json
{
  "data": [
    {
      "id": "in_123456",
      "number": "0001",
      "status": "paid",
      "total": 9900,
      "currency": "USD",
      "created": 1234567890,
      "paidAt": 1234567890,
      "pdfUrl": "https://..."
    }
  ],
  "total": 1
}
```

#### `GET /api/billing/upcoming-invoice/:customerId`

Get the upcoming invoice for a customer.

**Response:**

```json
{
  "data": {
    "total": 9900,
    "currency": "USD",
    "periodStart": 1234567890,
    "periodEnd": 1234567890,
    "items": [
      {
        "description": "Pro Plan - Monthly",
        "amount": 9900,
        "quantity": 1
      }
    ]
  }
}
```

### Webhook Endpoints

#### `POST /api/webhooks/stripe`

Stripe webhook endpoint. Configure in Stripe Dashboard:

Settings > Webhooks > Add endpoint

**Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`

**Events to subscribe:**

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `customer.created`
- `customer.deleted`

#### `GET /api/webhooks/health`

Check webhook configuration health.

**Response:**

```json
{
  "status": "ok",
  "webhook": {
    "configured": true,
    "endpoint": "/api/webhooks/stripe",
    "events": [...]
  }
}
```

## Database Schema

### Required Supabase Tables

#### `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  currency TEXT DEFAULT 'usd',
  items JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_paid_at TIMESTAMP,
  canceled_at TIMESTAMP
);
```

#### `invoices`

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  total BIGINT NOT NULL,
  currency TEXT DEFAULT 'USD',
  issue_date TIMESTAMP NOT NULL,
  paid_date TIMESTAMP,
  pdf_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

#### `stripe_customers`

```sql
CREATE TABLE stripe_customers (
  stripe_customer_id TEXT PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  email TEXT,
  name TEXT,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);
```

#### `payment_alerts`

```sql
CREATE TABLE payment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  type TEXT NOT NULL,
  invoice_id TEXT,
  amount BIGINT,
  currency TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

## Examples

See `/server/examples/stripe-integration-guide.ts` for comprehensive examples including:

- Customer creation
- Subscription management
- Checkout sessions
- Invoice handling
- Webhook setup
- API endpoint examples

## Environment Variables

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NODE_ENV=production
PORT=3001
```

## Testing

### Test Card Numbers

Use these test card numbers in development:

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`
- **Declined**: `4000 0000 0000 0002`

Use any future expiration date and any 3-digit CVC.

### Local Webhook Testing

Use the Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login with your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### API Testing with cURL

```bash
# Create customer
curl -X POST http://localhost:3001/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan-123",
    "billingCycle": "monthly",
    "currency": "usd"
  }'

# Get invoices
curl http://localhost:3001/api/billing/invoices/cus_123456?limit=10
```

## Error Handling

All functions throw errors on failure. Handle them appropriately:

```typescript
try {
  const subscription = await createSubscription({
    customerId: "cus_123456",
    priceId: "price_123456",
  });
} catch (error) {
  if (error instanceof Error) {
    console.error("Subscription creation failed:", error.message);
  }
  // Handle error - return 400/500, log, etc.
}
```

## Common Issues

### "Stripe secret key not provided"

Ensure `STRIPE_SECRET_KEY` is set in environment variables before initializing.

### Webhook signature verification failed

- Check that `STRIPE_WEBHOOK_SECRET` matches the signing secret in Stripe Dashboard
- Ensure webhook endpoint is publicly accessible
- Verify timestamp is recent (Stripe rejects old signatures)

### Payment method required error

Make sure customer has a valid payment method on file before creating subscriptions.

### Currency not supported

Ensure the price ID exists in the requested currency (USD/EUR).

## Support

For issues or questions:

1. Check Stripe Dashboard for webhook logs
2. Review server logs for error messages
3. Verify environment variables are correctly set
4. Test with Stripe test keys first
5. Check database tables exist with correct schema
