# Stripe Configuration & Setup

Step-by-step guide to configure Stripe for the subscription system.

## Prerequisites

- Stripe account (https://stripe.com)
- Voxmation app deployed or running locally
- Webhook endpoint accessible (ngrok for local testing)

## Step 1: Get API Keys

### From Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Click **Developers** (top right)
3. Select **API Keys**
4. Copy both keys:
   - **Publishable Key**: `pk_test_...` or `pk_live_...`
   - **Secret Key**: `sk_test_...` or `sk_live_...`

### Environment Setup

Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_51234567890...
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_1234567890...  # Will get this later
```

## Step 2: Create Products

### In Stripe Dashboard

1. Go to **Products**
2. Click **Add product**

#### Create "Starter" Plan

**Product Details:**
- Name: `Starter`
- Description: `Perfect for getting started`
- Tax code: None

After creation, add prices:

**Monthly Price (USD):**
- Amount: `$9.99`
- Currency: `USD`
- Billing period: `Monthly`

Copy Price ID: `price_1ABC...` → `STRIPE_PRICE_MONTHLY_USD_STARTER`

**Yearly Price (USD):**
- Amount: `$99.99`
- Currency: `USD`
- Billing period: `Yearly`

Copy Price ID: `price_1DEF...` → `STRIPE_PRICE_YEARLY_USD_STARTER`

**Monthly Price (EUR):**
- Amount: `€8.99`
- Currency: `EUR`
- Billing period: `Monthly`

Copy Price ID: `price_1GHI...` → `STRIPE_PRICE_MONTHLY_EUR_STARTER`

**Yearly Price (EUR):**
- Amount: `€89.99`
- Currency: `EUR`
- Billing period: `Yearly`

Copy Price ID: `price_1JKL...` → `STRIPE_PRICE_YEARLY_EUR_STARTER`

#### Create "Professional" Plan

Repeat for Professional plan with these prices:

| Period | Currency | Amount |
|--------|----------|--------|
| Monthly | USD | $49.99 |
| Yearly | USD | $499.99 |
| Monthly | EUR | €44.99 |
| Yearly | EUR | €449.99 |

#### Create "Enterprise" Plan

Repeat for Enterprise plan with these prices:

| Period | Currency | Amount |
|--------|----------|--------|
| Monthly | USD | $299.99 |
| Yearly | USD | $2,999.99 |
| Monthly | EUR | €269.99 |
| Yearly | EUR | €2,699.99 |

### Update Database

```typescript
import { supabase } from './server/supabase';

const plans = [
  {
    slug: 'starter',
    stripe_price_id_monthly_usd: 'price_1ABC...',
    stripe_price_id_yearly_usd: 'price_1DEF...',
    stripe_price_id_monthly_eur: 'price_1GHI...',
    stripe_price_id_yearly_eur: 'price_1JKL...'
  },
  {
    slug: 'professional',
    stripe_price_id_monthly_usd: 'price_2ABC...',
    stripe_price_id_yearly_usd: 'price_2DEF...',
    stripe_price_id_monthly_eur: 'price_2GHI...',
    stripe_price_id_yearly_eur: 'price_2JKL...'
  },
  {
    slug: 'enterprise',
    stripe_price_id_monthly_usd: 'price_3ABC...',
    stripe_price_id_yearly_usd: 'price_3DEF...',
    stripe_price_id_monthly_eur: 'price_3GHI...',
    stripe_price_id_yearly_eur: 'price_3JKL...'
  }
];

for (const plan of plans) {
  await supabase
    .from('subscription_plans')
    .update(plan)
    .eq('slug', plan.slug);
}
```

## Step 3: Configure Webhooks

### Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   - Production: `https://yourdomain.com/api/webhooks/stripe`
   - Local Testing: Use ngrok (see below)

### Select Events

Click **Select events** and enable:

**Subscription Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Invoice Events:**
- `invoice.created`
- `invoice.finalized`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`

**Payment Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

**Customer Events:**
- `customer.created`
- `customer.updated`
- `customer.deleted`

### Get Webhook Secret

1. After creating webhook, you'll see the endpoint
2. Click to view details
3. Copy the signing secret: `whsec_...`
4. Add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890...
```

### Test Webhook

Click **Send test event** and choose an event:

```bash
# Or use Stripe CLI (see below)
stripe trigger customer.subscription.created
```

## Step 4: Local Development Setup

### Using ngrok for Local Testing

```bash
# Install ngrok
# https://ngrok.com/download

# Start ngrok (forwards HTTPS to localhost:3000)
ngrok http 3000
# Output: https://abc123.ngrok.io

# In Stripe Dashboard webhook:
# https://abc123.ngrok.io/api/webhooks/stripe
```

### Using Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to your account
stripe login

# Forward webhook events to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Watch the output for webhook signing secret
# Add to .env: STRIPE_WEBHOOK_SECRET=...

# Test events
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger payment_intent.succeeded

# View logs
stripe logs tail
```

## Step 5: Test Payments

### Test Card Numbers

Use these in checkout/payment forms (test mode only):

| Scenario | Card Number | Expiry | CVC |
|----------|------------|--------|-----|
| Successful | `4242 4242 4242 4242` | 12/25 | 123 |
| Decline | `4000 0000 0000 0002` | 12/25 | 123 |
| Requires Auth | `4000 0025 0000 3155` | 12/25 | 123 |
| 3D Secure | `4000 0000 0000 9995` | 12/25 | 123 |

### Full Payment Test Flow

1. Go to billing page
2. Select a plan
3. Click "Subscribe"
4. Enter test card `4242 4242 4242 4242`
5. Enter any future date and CVC
6. Submit

**Expected Results:**
- Subscription created in database
- Invoice generated
- Webhook events received
- Webhook logs updated

## Step 6: Production Deployment

### Switch to Live Keys

1. In Stripe Dashboard, toggle **View test data** off
2. Go to **Developers** → **API Keys**
3. Copy live keys (start with `pk_live_` and `sk_live_`)
4. Update `.env` (or your deployment platform):

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (create new webhook in live mode)
```

### Create Production Webhook

1. In Stripe Dashboard (live mode)
2. Go to **Developers** → **Webhooks**
3. Add new endpoint with production URL
4. Select same events as test webhook
5. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Enable Email Receipts

1. Go to **Settings** → **Email Templates**
2. Enable invoice emails for paid invoices

### Tax Configuration

1. Go to **Settings** → **Tax**
2. Configure tax rates by country/region
3. This will be applied to invoices automatically

## Step 7: Verification Checklist

- [ ] API keys in `.env`
- [ ] Webhook secret in `.env`
- [ ] Products created (Starter, Professional, Enterprise)
- [ ] All prices configured (4 per plan = 12 total)
- [ ] Price IDs updated in database
- [ ] Webhook endpoint configured
- [ ] Test webhook successful
- [ ] Local testing with Stripe CLI or ngrok
- [ ] Test payment works end-to-end
- [ ] Webhook events logged in database
- [ ] Subscription created in database
- [ ] Invoice created in database
- [ ] Email notifications configured (if enabled)

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. Endpoint URL is correct and accessible
2. Signing secret matches in Dashboard
3. Raw body is being used (not parsed)
4. No firewall blocking webhooks

**Test:**
```bash
stripe trigger customer.subscription.created

# Check database
SELECT * FROM webhook_events 
ORDER BY received_at DESC 
LIMIT 1;
```

### Signature Verification Failing

**Cause**: Raw body vs parsed body

**Fix in Express:**
```typescript
// CORRECT - uses raw body
app.use('/api/webhooks/stripe', raw({ type: 'application/json' }), webhookRoutes);

// WRONG - body already parsed
app.use(express.json());
app.use('/api/webhooks/stripe', webhookRoutes);
```

### Prices Not Showing Up

**Check:**
1. Price IDs spelled correctly
2. Prices are active (not archived)
3. Price ID matches currency/period

**Debug:**
```typescript
const price = await stripe.prices.retrieve('price_...');
console.log(price);
// Should show: currency, unit_amount, recurring
```

### Customer Not Created

**Check:**
1. Stripe API key has permission
2. Email is valid
3. Metadata is JSON serializable

**Debug:**
```typescript
const customer = await stripe.customers.create({
  email: 'test@example.com',
  name: 'Test Account'
});
console.log(customer.id); // Should start with 'cus_'
```

## Advanced Configuration

### Dunning Management

Configure automatic retry for failed payments:

1. Go to **Settings** → **Billing**
2. Under "Failed payments"
3. Set retry schedule (e.g., 3 days, 5 days, 7 days)
4. Enable dunning emails

### Revenue Recognition

For IFRS 15 compliance:

1. Go to **Settings** → **Billing**
2. Enable "Performance Obligation" if needed
3. Configure revenue recognition timeline

### Custom Branding

1. Go to **Settings** → **Branding**
2. Add logo and colors
3. These will appear in invoices and emails

### Tax Settings

1. Go to **Settings** → **Tax**
2. Create tax rates for your regions
3. Link to products as needed

### Reconciliation

1. Go to **Settings** → **Billing**
2. Enable "Send settlement statements"
3. Receive daily/weekly payout reports

## Security Best Practices

### Webhook Security

```typescript
// Always verify signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Never trust unverified events
if (!event) {
  return res.status(400).json({ error: 'Invalid signature' });
}
```

### API Key Security

- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Use restricted API keys in test mode

### PCI Compliance

- Never handle raw card data
- Always use Stripe's hosted forms
- Enable 3D Secure for EU customers
- Store payment method IDs, not card data

## Monitoring & Analytics

### Dashboard Metrics

1. Go to **Developers** → **Dashboard**
2. Monitor:
   - API request volume
   - Webhook delivery success rate
   - Error trends

### Payment Analytics

1. Go to **Reporting** → **Revenue**
2. View:
   - MRR/ARR trends
   - Churn rate
   - Customer LTV

### Webhook Health

Use our endpoints:

```bash
# Check webhook health
curl https://yourdomain.com/api/webhooks/status

# Get recent events
curl https://yourdomain.com/api/webhooks/events?limit=20
```

## Support & Resources

- Stripe Docs: https://stripe.com/docs
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe Dashboard Support: https://support.stripe.com
- Our Guide: `/SUBSCRIPTION_SYSTEM_GUIDE.md`

---

**Next Steps:**
1. Follow steps 1-7 above
2. Verify checklist items
3. Run integration tests
4. Monitor first production transaction
5. Adjust settings as needed
