# Stripe Integration Module

Complete Stripe integration for subscriptions, billing, and webhooks with multi-currency support (USD/EUR).

## Files

- **stripe.ts** - Core integration module with all Stripe operations
- **../routes/webhooks.ts** - Webhook endpoint handlers
- **../routes/billing.ts** - Enhanced with new endpoints
- **../examples/stripe-integration-guide.ts** - Comprehensive usage examples
- **../../STRIPE_INTEGRATION.md** - Full documentation

## Quick Start

### 1. Installation

```bash
npm install stripe
```

### 2. Environment Setup

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Initialize

```typescript
import { initializeStripe } from "./integrations/stripe";

const stripe = initializeStripe();
```

## Core Functions

### Customer Management

- `initializeStripe(config?)` - Initialize Stripe client
- `createStripeCustomer(accountId, email, name, currency)` - Create customer
- `getStripeCustomer(customerId)` - Retrieve customer
- `updateStripeCustomer(customerId, updates)` - Update customer

### Subscriptions

- `createSubscription(options)` - Create subscription with trial support
- `getSubscription(subscriptionId)` - Get subscription details
- `listCustomerSubscriptions(customerId)` - List all subscriptions
- `updateSubscription(subscriptionId, updates)` - Update subscription
- `cancelSubscription(subscriptionId, atPeriodEnd)` - Cancel subscription

### Checkout & Payments

- `createCheckoutSession(options)` - Create checkout session (USD/EUR)
- `getCheckoutSession(sessionId)` - Get session details

### Invoices

- `getUpcomingInvoice(customerId)` - Get next invoice
- `getInvoices(options)` - Get invoice history with filtering
- `getInvoice(invoiceId)` - Get specific invoice
- `listAllInvoices(limit)` - List all invoices (admin)

### Webhooks

- `registerWebhookHandlers(handlers)` - Register event handlers
- `verifyAndHandleWebhook(body, signature, secret)` - Process webhook events
- `handleStripeWebhook(event)` - Handle individual webhook events

## Supported Events

### Subscription Events
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled

### Invoice Events
- `invoice.paid` - Invoice paid
- `invoice.payment_failed` - Payment failed
- `payment_intent.succeeded` - Payment success

### Customer Events
- `customer.created` - Customer created
- `customer.deleted` - Customer deleted

## API Endpoints

### Billing Routes (`/api/billing/`)

```
POST   /checkout                        Create checkout session
POST   /subscribe                       Create subscription directly
GET    /subscription/:id                Get subscription details
POST   /subscription/:id/cancel         Cancel subscription
GET    /invoices/:customerId            List customer invoices
GET    /upcoming-invoice/:customerId    Get upcoming invoice
GET    /plans                           Get subscription plans
GET    /subscription                    Get current subscription
GET    /usage                           Get usage metrics
```

### Webhook Routes (`/api/webhooks/`)

```
POST   /stripe                          Webhook endpoint
GET    /health                          Health check
```

## Multi-Currency Support

Both USD and EUR are supported:

```typescript
// Create customer with EUR
const customer = await createStripeCustomer(
  "account-123",
  "user@example.com",
  "John Doe",
  "eur"
);

// Create subscription with EUR
const subscription = await createSubscription({
  customerId: "cus_123",
  priceId: "price_eur_monthly",
  currency: "eur",
});

// Checkout with EUR
const session = await createCheckoutSession({
  customerId: "cus_123",
  priceId: "price_eur_monthly",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  currency: "eur",
});
```

## Database Requirements

Required Supabase tables:
- `subscriptions` - Subscription data
- `invoices` - Invoice records
- `stripe_customers` - Customer mappings
- `payment_alerts` - Payment notifications

See STRIPE_INTEGRATION.md for full schema.

## Error Handling

All functions throw errors on failure:

```typescript
try {
  const sub = await createSubscription({ ... });
} catch (error) {
  console.error("Failed:", error.message);
  // Handle error appropriately
}
```

## Testing

### Test Cards
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`
- Declined: `4000 0000 0000 0002`

### Webhook Testing with Stripe CLI

```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

## Examples

See `../examples/stripe-integration-guide.ts` for:
- Customer creation
- Subscription management
- Checkout flow
- Invoice handling
- Webhook setup
- API endpoint examples
- Database schema

## Documentation

Full documentation available in `../../STRIPE_INTEGRATION.md`

## TypeScript Support

All functions include full TypeScript types:

```typescript
import type {
  StripeInitConfig,
  SubscriptionOptions,
  CreateCheckoutOptions,
  InvoiceOptions,
  StripeWebhookHandlers,
} from "./integrations/stripe";
```

## Logging

All operations log to console with `[Stripe]` prefix:

```
[Stripe] Customer created: cus_123456 for account account-123
[Stripe] Subscription created: sub_123456 for customer cus_123456
[Stripe Webhook] Event received: customer.subscription.created
[Stripe Webhook] Subscription created
```

## Common Operations

### Complete Checkout Flow

1. Create customer: `createStripeCustomer()`
2. Create checkout session: `createCheckoutSession()`
3. Redirect user to checkout URL
4. Webhook receives `customer.subscription.created`
5. Save subscription to database

### Cancel Subscription

```typescript
// Immediate cancellation
await cancelSubscription("sub_123", false);

// Cancel at period end (service continues)
await cancelSubscription("sub_123", true);
```

### Get Billing Info

```typescript
// Upcoming charges
const upcoming = await getUpcomingInvoice("cus_123");

// Past invoices
const past = await getInvoices({
  customerId: "cus_123",
  limit: 10,
  status: "paid",
});
```

## Production Checklist

- [ ] Set up Stripe webhook endpoint in Dashboard
- [ ] Configure `STRIPE_SECRET_KEY` and webhook secret
- [ ] Create required database tables
- [ ] Register webhook handlers
- [ ] Test with live test cards
- [ ] Monitor webhook logs
- [ ] Set up payment failure alerts
- [ ] Configure email notifications
- [ ] Document pricing tiers

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- API Reference: https://stripe.com/docs/api
- Testing Guide: https://stripe.com/docs/testing
- Webhook Events: https://stripe.com/docs/api/events
- Stripe CLI: https://stripe.com/docs/stripe-cli
