# Stripe Integration - Quick Start Guide

Complete Stripe integration for Voxmation is ready to use. Here's how to get started.

## 1. Install Dependency (1 minute)

```bash
npm install stripe
```

## 2. Set Environment Variables (2 minutes)

Create or update `.env`:

```env
# From Stripe Dashboard > API Keys
STRIPE_SECRET_KEY=sk_test_... (use sk_test_... for testing)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# From Stripe Dashboard > Webhooks (after setup)
STRIPE_WEBHOOK_SECRET=whsec_...

NODE_ENV=development
```

## 3. Create Database Tables (5 minutes)

Copy this SQL to your Supabase editor and run:

```sql
-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
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

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
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

-- Stripe Customers
CREATE TABLE stripe_customers (
  stripe_customer_id TEXT PRIMARY KEY,
  account_id UUID NOT NULL,
  email TEXT,
  name TEXT,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

-- Payment Alerts
CREATE TABLE payment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  type TEXT NOT NULL,
  invoice_id TEXT,
  amount BIGINT,
  currency TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

## 4. Test with Stripe CLI (5 minutes)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

Copy the signing secret shown in the terminal and add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_... (from stripe listen output)
```

## 5. Use in Code (2 minutes)

### Create Checkout Session

```typescript
import { createCheckoutSession, createStripeCustomer } from "./server/integrations/stripe";

// Create customer
const customer = await createStripeCustomer(
  "account-123",
  "user@example.com",
  "John Doe",
  "usd"
);

// Create checkout
const session = await createCheckoutSession({
  customerId: customer.id,
  priceId: "price_1234567890", // From Stripe Dashboard
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  currency: "usd",
});

// Redirect user to checkout
window.location.href = session.url;
```

### Create Subscription

```typescript
import { createSubscription } from "./server/integrations/stripe";

const subscription = await createSubscription({
  customerId: "cus_123456",
  priceId: "price_1234567890",
  trialDays: 14,
  currency: "usd",
});
```

### Get Invoices

```typescript
import { getInvoices } from "./server/integrations/stripe";

const invoices = await getInvoices({
  customerId: "cus_123456",
  limit: 10,
  status: "paid",
});

invoices.forEach(inv => {
  console.log(`Invoice ${inv.number}: ${inv.currency} ${inv.total / 100}`);
});
```

### Cancel Subscription

```typescript
import { cancelSubscription } from "./server/integrations/stripe";

// Cancel immediately
await cancelSubscription("sub_123456", false);

// Or at period end
await cancelSubscription("sub_123456", true);
```

## 6. API Endpoints Available

### Checkout
```
POST /api/billing/checkout
Body: { planId, billingCycle: "monthly", currency: "usd" }
```

### Subscription Management
```
POST /api/billing/subscribe
GET  /api/billing/subscription/:id
POST /api/billing/subscription/:id/cancel
```

### Invoices
```
GET /api/billing/invoices/:customerId?limit=10
GET /api/billing/upcoming-invoice/:customerId
```

### Webhooks
```
POST /api/webhooks/stripe (Stripe sends events here)
GET  /api/webhooks/health (Check configuration)
```

## 7. Test Cards

Use these in the Stripe test environment:

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`
- **Declined**: `4000 0000 0000 0002`

Any future expiration date and any 3-digit CVC.

## 8. Configure Webhook Endpoint

When ready for production:

1. Go to Stripe Dashboard > Settings > Webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.deleted`
5. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Full Documentation

For complete documentation, see:
- **STRIPE_INTEGRATION.md** - Full API reference and setup guide
- **server/examples/stripe-integration-guide.ts** - 9 code examples
- **server/integrations/STRIPE_README.md** - Module reference

## Common Tasks

### Task: Add EUR Support

Update your plan creation in Stripe Dashboard:
- Create prices in EUR (monthly + yearly)
- Add `stripe_price_id_monthly_eur` to plans table
- Add `stripe_price_id_yearly_eur` to plans table

Then use:
```typescript
const session = await createCheckoutSession({
  customerId: "cus_123",
  priceId: "price_eur_monthly", // EUR price from Stripe
  currency: "eur",
  ...
});
```

### Task: Setup Payment Failure Alerts

Webhooks automatically create alerts in the `payment_alerts` table:

```typescript
// Query failed payments
const { data: alerts } = await supabase
  .from("payment_alerts")
  .select("*")
  .eq("type", "payment_failed")
  .eq("read", false);

// Mark as read
await supabase
  .from("payment_alerts")
  .update({ read: true })
  .eq("id", alert.id);
```

### Task: Send Invoice Email

When webhook receives `invoice.paid`:

```typescript
const onInvoicePaid = async (invoice) => {
  // Get customer email
  const customer = await stripe.customers.retrieve(invoice.customer);
  
  // Send email with PDF
  await sendEmail({
    to: customer.email,
    subject: `Invoice ${invoice.number}`,
    body: `Your invoice is attached`,
    attachments: [{ url: invoice.pdf }],
  });
};
```

## Troubleshooting

### "Stripe secret key not provided"
- Check `STRIPE_SECRET_KEY` is set in `.env`
- Restart dev server: `npm run dev`

### Webhook signature verification failed
- Verify `STRIPE_WEBHOOK_SECRET` is correct from Stripe Dashboard
- Use `stripe listen` for local testing
- Check webhook endpoint is publicly accessible

### Payment method required
- Customer needs payment method on file
- Use Stripe Checkout to collect payment method first

### "Price not found"
- Verify price ID exists in Stripe Dashboard
- Check it's in the correct currency (USD/EUR)
- Use exact price ID from Stripe

## Next Steps

1. ✓ Install dependencies
2. ✓ Set environment variables
3. ✓ Create database tables
4. ✓ Test with Stripe CLI
5. ⬜ Create pricing plans in Stripe Dashboard
6. ⬜ Add plans to database
7. ⬜ Implement checkout on website
8. ⬜ Setup customer success workflows
9. ⬜ Monitor webhook logs
10. ⬜ Deploy to production

## Files to Know

- **Core**: `server/integrations/stripe.ts` - All Stripe operations
- **Webhooks**: `server/routes/webhooks.ts` - Event handlers
- **API**: `server/routes/billing.ts` - HTTP endpoints
- **Examples**: `server/examples/stripe-integration-guide.ts` - Code samples
- **Docs**: `STRIPE_INTEGRATION.md` - Full reference

## Get Help

1. Check **STRIPE_INTEGRATION.md** for detailed docs
2. Review examples in **stripe-integration-guide.ts**
3. Check Stripe Dashboard > Logs > Webhooks for event details
4. Verify environment variables are set: `echo $STRIPE_SECRET_KEY`
5. Test webhook locally with `stripe listen`

---

**Ready?** Start with Step 1 above. Everything is implemented and documented.

Estimated setup time: **15 minutes** (mostly waiting for Stripe CLI)
