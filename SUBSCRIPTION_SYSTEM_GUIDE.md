# Subscription System Implementation Guide

Complete guide for the multi-currency subscription system with Stripe integration, webhooks, and usage tracking.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [Webhook Management](#webhook-management)
6. [Multi-Currency Support](#multi-currency-support)
7. [Usage Tracking](#usage-tracking)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Voxmation Platform                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │           API Routes (/api/billing)              │   │
│  │  - /plans                                        │   │
│  │  - /subscription                                 │   │
│  │  - /invoices                                     │   │
│  │  - /usage                                        │   │
│  │  - /checkout                                     │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│                           ▼                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Billing Service Layer                    │   │
│  │  - Subscription management                       │   │
│  │  - Usage tracking                                │   │
│  │  - Payment method handling                       │   │
│  │  - Billing history                               │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
│                           ▼                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │       Stripe Advanced Integration                │   │
│  │  - Customer management                           │   │
│  │  - Subscription lifecycle                        │   │
│  │  - Invoice management                            │   │
│  │  - Webhook processing                            │   │
│  └──────────────────────────────────────────────────┘   │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │      Stripe API               │
            │  - Products & Prices          │
            │  - Subscriptions              │
            │  - Invoices                   │
            │  - Payment Methods            │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │    Stripe Webhooks            │
            │  - Customer updates           │
            │  - Invoice events             │
            │  - Payment confirmations      │
            └───────────────────────────────┘
```

### Supabase Database Tables

1. **subscription_plans** - Available pricing tiers
2. **subscriptions** - Account subscriptions
3. **invoices** - Billing invoices
4. **usage_metrics** - Usage tracking per period
5. **webhook_events** - Webhook event log
6. **usage_limits** - Per-period usage limits
7. **payment_methods** - Stored payment methods
8. **billing_history** - Audit trail of billing events

---

## Database Schema

### subscription_plans
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Multi-currency pricing
  price_monthly_usd NUMERIC(10, 2),
  price_yearly_usd NUMERIC(10, 2),
  price_monthly_eur NUMERIC(10, 2),
  price_yearly_eur NUMERIC(10, 2),
  
  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_id_monthly_usd TEXT,
  stripe_price_id_yearly_usd TEXT,
  stripe_price_id_monthly_eur TEXT,
  stripe_price_id_yearly_eur TEXT,
  
  -- Features and limits
  features JSONB,
  limits JSONB,
  
  is_active BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  plan_id UUID REFERENCES subscription_plans(id),
  
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  currency TEXT CHECK (currency IN ('USD', 'EUR')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_per_cycle NUMERIC(10, 2),
  
  status TEXT,
  current_period_start DATE,
  current_period_end DATE,
  trial_start DATE,
  trial_end DATE,
  
  cancel_at_period_end BOOLEAN,
  canceled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  invoice_number TEXT UNIQUE,
  
  amount_subtotal NUMERIC(10, 2),
  amount_tax NUMERIC(10, 2),
  amount_total NUMERIC(10, 2),
  amount_paid NUMERIC(10, 2),
  amount_due NUMERIC(10, 2),
  amount_remaining NUMERIC(10, 2),
  
  currency TEXT CHECK (currency IN ('USD', 'EUR')),
  status TEXT,
  
  issue_date DATE,
  due_date DATE,
  paid_date DATE,
  
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  line_items JSONB,
  custom_fields JSONB,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### usage_metrics
```sql
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  period DATE,
  
  -- API metrics
  api_calls_total INTEGER,
  api_calls_ai INTEGER,
  api_calls_failed INTEGER,
  
  -- Communication metrics
  sms_sent INTEGER,
  sms_failed INTEGER,
  sms_cost NUMERIC(10, 2),
  
  emails_sent INTEGER,
  emails_bounced INTEGER,
  emails_cost NUMERIC(10, 2),
  
  calls_initiated INTEGER,
  calls_completed INTEGER,
  calls_cost NUMERIC(10, 2),
  
  -- Business metrics
  contacts_total INTEGER,
  campaigns_created INTEGER,
  opportunities_total INTEGER,
  
  storage_used_mb INTEGER,
  usage_cost NUMERIC(10, 2),
  estimated_total_cost NUMERIC(10, 2),
  
  currency TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(account_id, period)
);
```

---

## Setup Instructions

### 1. Environment Variables

Add to `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint)

# Currency Configuration
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR
CURRENCY_CONVERSION_ENABLED=true
```

### 2. Database Migration

Apply the migration:

```bash
# Using Supabase CLI
supabase db push

# Or run migration file directly:
# supabase/migrations/20260625_create_subscription_system.sql
```

### 3. Create Stripe Products and Prices

```typescript
import { stripe } from './integrations/stripe-advanced';

// Create a product
const product = await stripe.products.create({
  name: 'Professional Plan',
  description: 'For growing teams',
  metadata: { plan_slug: 'professional' }
});

// Create monthly prices
const priceUSD = await stripe.prices.create({
  product: product.id,
  unit_amount: 4999, // $49.99
  currency: 'usd',
  recurring: { interval: 'month' }
});

const priceEUR = await stripe.prices.create({
  product: product.id,
  unit_amount: 4499, // €44.99
  currency: 'eur',
  recurring: { interval: 'month' }
});

// Create yearly prices
const priceUSDAnnual = await stripe.prices.create({
  product: product.id,
  unit_amount: 49999, // $499.99
  currency: 'usd',
  recurring: { interval: 'year' }
});

const priceEURAnnual = await stripe.prices.create({
  product: product.id,
  unit_amount: 44999, // €449.99
  currency: 'eur',
  recurring: { interval: 'year' }
});

// Update plan in database
await supabase
  .from('subscription_plans')
  .update({
    stripe_product_id: product.id,
    stripe_price_id_monthly_usd: priceUSD.id,
    stripe_price_id_yearly_usd: priceUSDAnnual.id,
    stripe_price_id_monthly_eur: priceEUR.id,
    stripe_price_id_yearly_eur: priceEURAnnual.id,
  })
  .eq('slug', 'professional');
```

### 4. Configure Webhook Endpoint

In Stripe Dashboard:

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourapp.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Integrate Routes

In your Express app (`server/index.ts`):

```typescript
import { raw } from 'express';
import webhookRoutes from './routes/webhooks';
import billingRoutes from './routes/billing';

// Webhook endpoint needs raw body for signature verification
app.use('/api/webhooks', raw({ type: 'application/json' }), webhookRoutes);

// Regular billing routes
app.use('/api/billing', billingRoutes);
```

---

## API Endpoints

### Billing Plans

#### GET `/api/billing/plans`
Get all active subscription plans.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Professional",
      "slug": "professional",
      "description": "For growing teams",
      "price_monthly_usd": 49.99,
      "price_yearly_usd": 499.99,
      "price_monthly_eur": 44.99,
      "price_yearly_eur": 449.99,
      "features": {
        "contacts": 10000,
        "users": 5,
        "api_access": true,
        "white_label": true
      },
      "limits": {
        "max_api_calls_per_day": 5000,
        "max_sms_per_month": 10000,
        "max_storage_gb": 100
      }
    }
  ]
}
```

### Subscriptions

#### GET `/api/billing/subscription`
Get current subscription.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "plan_id": "uuid",
    "status": "active",
    "currency": "USD",
    "billing_cycle": "monthly",
    "price_per_cycle": 49.99,
    "current_period_start": "2026-06-01",
    "current_period_end": "2026-07-01",
    "trial_end": null,
    "cancel_at_period_end": false
  }
}
```

#### POST `/api/billing/subscribe`
Create a new subscription (owner/admin only).

**Request:**
```json
{
  "planId": "uuid",
  "billingCycle": "monthly",
  "currency": "USD",
  "trialDays": 14
}
```

**Response:**
```json
{
  "subscriptionId": "uuid",
  "status": "trialing",
  "currentPeriodStart": "2026-06-25",
  "currentPeriodEnd": "2026-07-25",
  "trialEnd": "2026-07-09"
}
```

#### POST `/api/billing/subscription/:id/cancel`
Cancel subscription (owner/admin only).

**Request:**
```json
{
  "atPeriodEnd": true,
  "reason": "too expensive"
}
```

### Invoices

#### GET `/api/billing/invoices`
Get account invoices with pagination.

**Query Parameters:**
- `limit`: 10 (default)
- `offset`: 0 (default)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "stripe_invoice_id": "in_...",
      "amount_total": 49.99,
      "currency": "USD",
      "status": "paid",
      "issue_date": "2026-06-01",
      "paid_date": "2026-06-02",
      "pdf_url": "https://...",
      "hosted_invoice_url": "https://..."
    }
  ],
  "total": 15
}
```

### Usage & Limits

#### GET `/api/billing/usage`
Get usage metrics for current period.

**Response:**
```json
{
  "data": {
    "period": "2026-06-01",
    "api_calls_total": 2345,
    "sms_sent": 156,
    "emails_sent": 4231,
    "contacts_total": 8234,
    "storage_used_mb": 256,
    "estimated_total_cost": 125.50,
    "currency": "USD"
  }
}
```

### Checkout

#### POST `/api/billing/checkout`
Create Stripe checkout session (owner/admin only).

**Request:**
```json
{
  "planId": "uuid",
  "billingCycle": "monthly",
  "currency": "USD"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

---

## Webhook Management

### Webhook Events

All webhook events are logged in `webhook_events` table for audit and replay.

**Handled Events:**
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled
- `invoice.created` - Invoice generated
- `invoice.finalized` - Invoice ready for payment
- `invoice.paid` - Payment received
- `invoice.payment_failed` - Payment failed
- `payment_intent.succeeded` - One-time payment success
- `payment_intent.payment_failed` - One-time payment failed
- `charge.refunded` - Refund processed

### Webhook Endpoints

#### GET `/api/webhooks/events`
List webhook events (with filtering).

**Query Parameters:**
- `limit`: 50 (default)
- `offset`: 0 (default)
- `status`: `pending|processing|completed|failed`
- `type`: Event type filter

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "event_type": "invoice.paid",
      "event_id": "evt_...",
      "status": "completed",
      "payload": { ... },
      "processed_at": "2026-06-25T10:30:00Z",
      "retry_count": 0,
      "received_at": "2026-06-25T10:29:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

#### GET `/api/webhooks/status`
Get webhook health status.

**Response:**
```json
{
  "status": "healthy",
  "last_24h": {
    "total_events": 245,
    "completed": 243,
    "failed": 2,
    "pending": 0,
    "success_rate": 99.18
  },
  "timestamp": "2026-06-25T10:30:00Z"
}
```

#### POST `/api/webhooks/events/:id/retry`
Retry failed webhook event.

**Response:**
```json
{
  "success": true,
  "message": "Event retried successfully"
}
```

#### GET `/api/webhooks/test`
Test webhook connectivity.

**Response:**
```json
{
  "status": "ok",
  "message": "Webhook endpoint is accessible",
  "timestamp": "2026-06-25T10:30:00Z"
}
```

---

## Multi-Currency Support

### Currency Handling

The system supports USD and EUR with automatic conversion support.

#### Configuration

```env
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR
```

#### Pricing Structure

Each plan has prices in both currencies:

```
Starter Plan:
  Monthly: $9.99 USD / €8.99 EUR
  Yearly:  $99.99 USD / €89.99 EUR
```

#### Subscription Currency

When creating a subscription, the currency is locked:

```typescript
const subscription = await createSubscriptionForAccount({
  accountId: accountId,
  planId: planId,
  email: user.email,
  name: user.name,
  currency: 'USD', // or 'EUR'
  billingCycle: 'monthly'
});
```

#### Price Retrieval

The system automatically selects the correct Stripe price ID based on currency and billing cycle.

### Currency Conversion

For exchange rates (if needed):

```typescript
// Future: Integrate with exchange rate API
const exchangeRate = await getExchangeRate('USD', 'EUR');
const priceInEUR = priceInUSD * exchangeRate;
```

---

## Usage Tracking

### Recording Usage

Usage is automatically tracked when actions occur. To manually record usage:

```typescript
import { recordUsage } from './services/billingService';

await recordUsage(accountId, {
  apiCallsTotal: 100,
  smsSent: 5,
  emailsSent: 25,
  contactsTotal: 500,
  campaignsCreated: 2
});
```

### Checking Limits

Before allowing an action, check usage limits:

```typescript
import { checkUsageLimits } from './services/billingService';

const { allowed, remaining, percentage } = await checkUsageLimits(
  accountId,
  'api_calls',
  1 // how many to consume
);

if (!allowed) {
  // Upgrade or wait until next billing period
  throw new Error('API call limit exceeded');
}
```

### Usage Alerts

Automatically triggered when usage reaches thresholds:

```sql
-- Enable alerts at 80%, 95%, 100%
SELECT * FROM usage_limits
WHERE (used_api_calls / max_api_calls) >= 0.80;
```

---

## Testing

### 1. Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSubscriptionForAccount } from './services/billingService';

describe('Billing Service', () => {
  it('should create subscription with trial', async () => {
    const sub = await createSubscriptionForAccount({
      accountId: 'test-account',
      planId: 'test-plan',
      email: 'test@example.com',
      name: 'Test Account',
      trialDays: 14,
      currency: 'USD'
    });

    expect(sub.status).toBe('trialing');
    expect(sub.trialEnd).toBeDefined();
  });

  it('should enforce usage limits', async () => {
    const result = await checkUsageLimits('test-account', 'api_calls', 10000);
    expect(result.allowed).toBe(false);
  });
});
```

### 2. Integration Tests with Stripe

```typescript
describe('Stripe Integration', () => {
  it('should create customer in Stripe', async () => {
    const customer = await createOrGetStripeCustomer(
      'test-account',
      'test@example.com',
      'Test Co'
    );

    expect(customer.id).toMatch(/^cus_/);
  });

  it('should handle subscription webhook', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { /* subscription data */ } }
    };

    await processWebhookEvent(event);

    // Verify database was updated
  });
});
```

### 3. Local Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created

# View events
stripe logs tail
```

---

## Troubleshooting

### Common Issues

#### 1. "Stripe configuration incomplete"

**Cause**: Stripe price IDs not set on plan.

**Fix**:
```typescript
// Update plan with Stripe price IDs
await supabase
  .from('subscription_plans')
  .update({
    stripe_price_id_monthly_usd: 'price_...',
    stripe_price_id_yearly_usd: 'price_...',
    stripe_price_id_monthly_eur: 'price_...',
    stripe_price_id_yearly_eur: 'price_...'
  })
  .eq('id', planId);
```

#### 2. "Invalid webhook signature"

**Cause**: Webhook secret mismatch or payload tampering.

**Fix**:
- Verify `STRIPE_WEBHOOK_SECRET` matches Dashboard
- Ensure raw body is used for signature verification
- Check Express middleware order

#### 3. "STRIPE_SECRET_KEY not configured"

**Cause**: Missing environment variable.

**Fix**:
```bash
export STRIPE_SECRET_KEY="sk_test_..."
# Or add to .env file
```

#### 4. "Subscription not found"

**Cause**: Customer doesn't have active subscription.

**Fix**:
```typescript
const sub = await getAccountSubscription(accountId);
if (!sub) {
  // Create trial subscription
  await createSubscriptionForAccount({...});
}
```

#### 5. "Usage limit exceeded"

**Cause**: Account exceeded plan limits.

**Fix**:
```typescript
// Check current usage
const usage = await getAccountUsage(accountId);
const limits = await getUsageLimits(accountId);

// Either upgrade plan or wait until next period
```

### Debugging

Enable debug logging:

```typescript
// In environment or startup
process.env.DEBUG = 'stripe:*';

// Use verbose error logging
console.log('Subscription:', JSON.stringify(subscription, null, 2));
```

### Database Queries for Debugging

```sql
-- Check subscriptions for account
SELECT * FROM subscriptions 
WHERE account_id = 'account-uuid' 
ORDER BY created_at DESC;

-- Check unpaid invoices
SELECT * FROM invoices 
WHERE account_id = 'account-uuid' 
AND status IN ('draft', 'open');

-- Check usage limits
SELECT * FROM usage_limits 
WHERE account_id = 'account-uuid' 
AND period >= DATE_TRUNC('month', NOW())::DATE;

-- Check webhook event processing
SELECT event_type, status, COUNT(*) 
FROM webhook_events 
GROUP BY event_type, status;

-- Check billing history
SELECT * FROM billing_history 
WHERE account_id = 'account-uuid' 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## Performance Optimization

### Caching

```typescript
// Cache subscription for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const subscriptionCache = new Map();

async function getCachedSubscription(accountId: string) {
  const cached = subscriptionCache.get(accountId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await getAccountSubscription(accountId);
  subscriptionCache.set(accountId, { data, timestamp: Date.now() });
  return data;
}
```

### Batch Operations

```typescript
// Record multiple usage events at once
await supabase
  .from('usage_metrics')
  .upsert(batchUsageData, { 
    onConflict: 'account_id,period' 
  });
```

### Index Optimization

The migration includes key indexes:

```sql
CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_account ON invoices(account_id);
CREATE INDEX idx_usage_account_period ON usage_metrics(account_id, period DESC);
CREATE INDEX idx_webhook_status ON webhook_events(status);
```

---

## Next Steps

1. **Implement Usage Tracking** - Hook into action handlers
2. **Create Admin Dashboard** - Monitor subscriptions and usage
3. **Add Email Notifications** - Billing reminders and failures
4. **Implement Dunning** - Retry failed payments
5. **Add Analytics** - Track subscription metrics
