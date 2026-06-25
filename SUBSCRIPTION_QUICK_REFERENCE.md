# Subscription System Quick Reference

Fast lookup guide for the multi-currency subscription system implementation.

## 1-Minute Setup

```bash
# 1. Environment
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."

# 2. Database
supabase db push

# 3. Webhook (in Stripe Dashboard)
# https://yourdomain.com/api/webhooks/stripe

# 4. Verify
curl http://localhost:3000/api/billing/plans
```

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `supabase/migrations/20260625_create_subscription_system.sql` | 776 | Database schema (8 tables) |
| `server/integrations/stripe-advanced.ts` | 876 | Stripe API integration |
| `server/services/billingService.ts` | 706 | Business logic layer |
| `server/routes/webhooks.ts` | 411 | Webhook endpoints |
| `SUBSCRIPTION_SYSTEM_GUIDE.md` | 961 | Complete documentation |
| `STRIPE_SETUP.md` | 487 | Stripe configuration |
| `SUBSCRIPTION_IMPLEMENTATION_CHECKLIST.md` | 431 | Implementation steps |

## Database Tables Quick Reference

### subscription_plans
```sql
-- Get all plans with pricing
SELECT id, name, price_monthly_usd, price_yearly_usd, 
       price_monthly_eur, price_yearly_eur 
FROM subscription_plans 
WHERE is_active = true 
ORDER BY display_order;
```

### subscriptions
```sql
-- Get account's active subscription
SELECT s.*, p.name as plan_name, p.features, p.limits
FROM subscriptions s
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.account_id = '...'
AND s.status = 'active';
```

### invoices
```sql
-- Get unpaid invoices
SELECT id, amount_total, currency, status, issue_date, due_date
FROM invoices
WHERE account_id = '...'
AND status IN ('draft', 'open');
```

### usage_metrics
```sql
-- Get current month usage
SELECT * FROM usage_metrics
WHERE account_id = '...'
AND period = DATE_TRUNC('month', NOW())::DATE;
```

### webhook_events
```sql
-- Check webhook health
SELECT status, COUNT(*) 
FROM webhook_events
WHERE received_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

## API Endpoints Quick Reference

### Public (No Auth)
```bash
# Get all pricing plans
GET /api/billing/plans
→ Returns: { data: [{ id, name, price_monthly_usd, price_yearly_usd, ... }] }
```

### Authenticated (User)
```bash
# Get current subscription
GET /api/billing/subscription
→ Returns: { data: { id, plan_id, status, currency, ... } }

# Get usage metrics
GET /api/billing/usage
→ Returns: { data: { period, api_calls_total, sms_sent, ... } }

# Get invoices
GET /api/billing/invoices?limit=10&offset=0
→ Returns: { data: [...], total: 15 }
```

### Admin Only
```bash
# Create subscription
POST /api/billing/subscribe
Body: { planId, currency, billingCycle, trialDays }

# Create checkout session
POST /api/billing/checkout
Body: { planId, currency, billingCycle }

# Cancel subscription
POST /api/billing/subscription/:id/cancel
Body: { atPeriodEnd: true, reason: "..." }
```

### Webhooks
```bash
# Webhook receiver (Stripe calls this)
POST /api/webhooks/stripe
Headers: { "stripe-signature": "..." }

# Get webhook status
GET /api/webhooks/status
→ Returns: { status: "healthy", last_24h: { ... } }

# Get webhook events
GET /api/webhooks/events?limit=50&status=failed
→ Returns: { data: [...], pagination: {...} }

# Retry failed event
POST /api/webhooks/events/:id/retry

# Test connectivity
GET /api/webhooks/test
→ Returns: { status: "ok" }
```

## Common Tasks

### Create Subscription
```typescript
import { createSubscriptionForAccount } from './services/billingService';

const sub = await createSubscriptionForAccount({
  accountId: '...',
  planId: '...',
  email: 'user@example.com',
  name: 'User Name',
  currency: 'USD',      // or 'EUR'
  billingCycle: 'monthly', // or 'yearly'
  trialDays: 14
});
```

### Check Usage Limits
```typescript
import { checkUsageLimits } from './services/billingService';

const { allowed, remaining, percentage } = await checkUsageLimits(
  accountId,
  'api_calls', // or 'sms', 'emails', 'contacts', 'campaigns'
  10           // how many to use
);

if (!allowed) {
  throw new Error(`Limit exceeded. Remaining: ${remaining}`);
}
```

### Record Usage
```typescript
import { recordUsage } from './services/billingService';

await recordUsage(accountId, {
  apiCallsTotal: 100,
  smsSent: 5,
  emailsSent: 25
});
```

### Process Webhook
```typescript
import { processWebhookEvent } from './integrations/stripe-advanced';

await processWebhookEvent(stripeEvent);
// Automatically:
// - Validates signature
// - Routes to handler
// - Updates database
// - Logs to webhook_events
// - Records billing_history
```

### Get Subscription Details
```typescript
import { getAccountSubscription } from './services/billingService';

const subscription = await getAccountSubscription(accountId);
// Returns: { id, planId, planName, status, currency, 
//            billingCycle, pricePerCycle, currentPeriodStart,
//            currentPeriodEnd, trialEnd, features, limits }
```

## Stripe Test Cards

| Use Case | Number | Exp | CVC |
|----------|--------|-----|-----|
| Success | 4242 4242 4242 4242 | 12/25 | 123 |
| Decline | 4000 0000 0000 0002 | 12/25 | 123 |
| 3D Secure | 4000 0000 0000 9995 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

## Environment Variables

```env
# Required
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional (defaults provided)
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR
```

## Debugging

### Check Database Schema
```bash
# List all billing tables
supabase db pull

# Or in psql
\dt+ subscription_*
\dt+ invoices
\dt+ webhook_events
\dt+ usage_*
\dt+ payment_methods
\dt+ billing_history
```

### Check Stripe Sync
```sql
-- Compare Supabase vs Stripe
SELECT COUNT(*) FROM subscriptions WHERE stripe_subscription_id IS NULL;
SELECT COUNT(*) FROM invoices WHERE stripe_invoice_id IS NULL;
```

### Monitor Webhooks
```sql
-- Failed webhooks in last 24h
SELECT event_type, COUNT(*) 
FROM webhook_events
WHERE status = 'failed'
AND received_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Pending retry
SELECT id, event_type, retry_count, error_message
FROM webhook_events
WHERE status = 'failed'
AND retry_count < 5
ORDER BY received_at DESC;
```

### Check Usage
```sql
-- Account approaching limit
SELECT account_id, 
       ROUND((used_api_calls::NUMERIC / max_api_calls) * 100, 1) as percentage
FROM usage_limits
WHERE (used_api_calls::NUMERIC / max_api_calls) > 0.8
ORDER BY percentage DESC;
```

## Performance Tips

### Cache Subscriptions (5-minute)
```typescript
const cache = new Map();

async function getCachedSub(accountId) {
  const cached = cache.get(accountId);
  if (cached && Date.now() - cached.ts < 300000) {
    return cached.data;
  }
  const data = await getAccountSubscription(accountId);
  cache.set(accountId, { data, ts: Date.now() });
  return data;
}
```

### Batch Updates
```typescript
const batch = [];
for (const item of items) {
  batch.push({ account_id: item.accountId, period: getPeriod(), ... });
}
await supabase.from('usage_metrics').upsert(batch);
```

### Use Indexes
Already included in migration:
- `idx_subscriptions_account` - for account lookups
- `idx_invoices_status` - for filtering
- `idx_usage_account_period` - for recent data
- `idx_webhook_status` - for health checks

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid signature" | Webhook secret mismatch | Check `STRIPE_WEBHOOK_SECRET` |
| "Price not found" | Stripe ID not in database | Run price update script |
| "No active subscription" | Customer not subscribed | Create subscription first |
| "Limit exceeded" | Usage over plan limits | Upgrade or wait for reset |
| "Customer not found" | Stripe customer doesn't exist | Run webhook event |

## Webhook Events Reference

| Event | Handled | Action |
|-------|---------|--------|
| `customer.subscription.created` | ✓ | Log creation |
| `customer.subscription.updated` | ✓ | Sync status |
| `customer.subscription.deleted` | ✓ | Mark canceled |
| `invoice.created` | ✓ | Store invoice |
| `invoice.finalized` | ✓ | Update URLs |
| `invoice.paid` | ✓ | Mark paid |
| `invoice.payment_failed` | ✓ | Log failure |
| `payment_intent.succeeded` | ✓ | Log success |
| `payment_intent.payment_failed` | ✓ | Log failure |
| `charge.refunded` | ✓ | Log refund |
| `customer.created` | ✓ | Log creation |
| `customer.updated` | ✓ | Sync metadata |

## Feature Matrix

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Contacts | 1,000 | 10,000 | 100,000 |
| Users | 1 | 5 | 50 |
| API Calls/Day | 500 | 5,000 | 50,000 |
| SMS/Month | 1,000 | 10,000 | 100,000 |
| Campaigns | 5 | 50 | 500 |
| White Label | ✗ | ✓ | ✓ |
| API Access | ✗ | ✓ | ✓ |
| Support | Email | Priority | 24/7 |
| Monthly | $9.99 | $49.99 | $299.99 |
| Yearly | $99.99 | $499.99 | $2,999.99 |

## Links

- **Full Guide**: `/SUBSCRIPTION_SYSTEM_GUIDE.md`
- **Stripe Setup**: `/STRIPE_SETUP.md`
- **Checklist**: `/SUBSCRIPTION_IMPLEMENTATION_CHECKLIST.md`
- **Summary**: `/SUBSCRIPTION_SYSTEM_SUMMARY.md`
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs

## Support

### Need to...

**Set up Stripe?** → Read `/STRIPE_SETUP.md`

**Implement the system?** → Follow `/SUBSCRIPTION_IMPLEMENTATION_CHECKLIST.md`

**Learn the architecture?** → Read `/SUBSCRIPTION_SYSTEM_GUIDE.md`

**Find an API endpoint?** → Check this file or guide's API section

**Debug an issue?** → See guide's Troubleshooting section

**Write a test?** → See guide's Testing section

---

**Version**: 1.0.0
**Last Updated**: June 25, 2026
**Status**: Production Ready
