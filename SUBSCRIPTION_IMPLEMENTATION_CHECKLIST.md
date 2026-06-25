# Subscription System Implementation Checklist

Complete checklist for implementing the multi-currency subscription system with Stripe integration.

## Phase 1: Database Setup

- [x] **Migration Created**: `20260625_create_subscription_system.sql`
  - [x] `subscription_plans` table with multi-currency support
  - [x] `subscriptions` table with Stripe integration
  - [x] `invoices` table with payment tracking
  - [x] `usage_metrics` table for tracking
  - [x] `webhook_events` table for audit
  - [x] `usage_limits` table for enforcement
  - [x] `payment_methods` table for card storage
  - [x] `billing_history` table for audit trail
  - [x] RLS policies configured
  - [x] Helper functions implemented
  - [x] Default plans inserted

- [ ] **Apply Migration**
  ```bash
  supabase db push
  # Or apply migrations directly
  ```

- [ ] **Verify Tables**
  ```sql
  \dt+ subscription_plans
  \dt+ subscriptions
  \dt+ invoices
  \dt+ usage_metrics
  ```

## Phase 2: Backend Services

- [x] **Stripe Advanced Integration**: `/server/integrations/stripe-advanced.ts`
  - [x] Customer management (create/get/update)
  - [x] Subscription management (CRUD)
  - [x] Invoice management
  - [x] Payment methods
  - [x] Checkout sessions
  - [x] Billing portal
  - [x] Webhook verification
  - [x] Event processing
  - [x] Webhook handlers for all events
  - [x] Type definitions

- [x] **Billing Service**: `/server/services/billingService.ts`
  - [x] Create subscription with options
  - [x] Get subscription details
  - [x] Cancel/pause/resume subscription
  - [x] Get invoices
  - [x] Get upcoming invoices
  - [x] Track usage
  - [x] Check usage limits
  - [x] Payment method management
  - [x] Billing history tracking

- [ ] **Integrate Services into Routes**
  ```typescript
  // In /server/routes/billing.ts, update imports
  import { createSubscriptionForAccount, getAccountSubscription } from '../services/billingService';
  ```

- [x] **Webhook Routes**: `/server/routes/webhooks.ts`
  - [x] Stripe webhook endpoint
  - [x] Webhook event management
  - [x] Event retry logic
  - [x] Health status endpoint

## Phase 3: Environment Configuration

- [ ] **Add Environment Variables** to `.env`
  ```env
  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # Currency
  DEFAULT_CURRENCY=USD
  SUPPORTED_CURRENCIES=USD,EUR
  ```

- [ ] **Verify Environment** setup
  ```bash
  echo $STRIPE_SECRET_KEY
  echo $STRIPE_WEBHOOK_SECRET
  ```

## Phase 4: Stripe Configuration

- [ ] **Create Stripe Products**
  - [ ] Starter plan
  - [ ] Professional plan
  - [ ] Enterprise plan

- [ ] **Create Stripe Prices** (12 total)
  - [ ] 3 plans × 4 prices (monthly/yearly × USD/EUR)
  - [ ] All prices must be recurring monthly/yearly
  - [ ] Save price IDs

- [ ] **Update Database with Price IDs**
  ```typescript
  // Run script to update subscription_plans table
  import { updatePlanPrices } from './scripts/updateStripePrices';
  await updatePlanPrices();
  ```

- [ ] **Create Webhook Endpoint**
  - [ ] URL: `https://yourdomain.com/api/webhooks/stripe`
  - [ ] Select all subscription, invoice, payment, and customer events
  - [ ] Save webhook secret to `.env`

- [ ] **Test Webhook** (in Stripe Dashboard)
  ```bash
  # Or use Stripe CLI
  stripe trigger customer.subscription.created
  ```

## Phase 5: Express Integration

- [ ] **Update `/server/index.ts`**
  ```typescript
  import { raw } from 'express';
  import webhookRoutes from './routes/webhooks';
  import billingRoutes from './routes/billing';
  
  // Must be before other middleware
  app.use('/api/webhooks', raw({ type: 'application/json' }), webhookRoutes);
  
  // Regular routes
  app.use('/api/billing', billingRoutes);
  ```

- [ ] **Verify Routes**
  ```bash
  GET /api/billing/plans
  GET /api/billing/subscription
  POST /api/billing/checkout
  GET /api/webhooks/test
  ```

## Phase 6: Testing

### Local Testing

- [ ] **Test API Endpoints**
  ```bash
  # Get plans
  curl http://localhost:3000/api/billing/plans
  
  # Create subscription
  curl -X POST http://localhost:3000/api/billing/subscribe \
    -H "Content-Type: application/json" \
    -d '{"planId":"...", "currency":"USD"}'
  ```

- [ ] **Test Webhooks Locally**
  ```bash
  # Option 1: ngrok
  ngrok http 3000
  # Update Stripe webhook to ngrok URL
  
  # Option 2: Stripe CLI
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  stripe trigger customer.subscription.created
  ```

- [ ] **Verify Database Changes**
  ```sql
  SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 1;
  SELECT * FROM subscriptions WHERE account_id = '...';
  SELECT * FROM invoices WHERE account_id = '...';
  ```

### Unit Tests

- [ ] **Create test file** `/server/tests/billing.test.ts`
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { createSubscriptionForAccount } from '../services/billingService';
  
  describe('Billing Service', () => {
    it('should create subscription', async () => {
      // Test implementation
    });
  });
  ```

- [ ] **Run tests**
  ```bash
  npm test server/tests/billing.test.ts
  ```

### Integration Tests

- [ ] **Test with Stripe Test API**
  - [ ] Create subscription with test card `4242 4242 4242 4242`
  - [ ] Verify subscription in database
  - [ ] Verify webhook processed
  - [ ] Check invoice created
  - [ ] Verify billing history logged

- [ ] **Test Edge Cases**
  - [ ] Insufficient payment method
  - [ ] Canceled subscription
  - [ ] Plan upgrade/downgrade
  - [ ] Usage limit exceeded
  - [ ] Multiple subscriptions per account

## Phase 7: Frontend Integration

- [ ] **Update Billing Page** (`/apps/web/src/pages/billing.tsx`)
  ```typescript
  import { useQuery } from '@tanstack/react-query';
  
  const BillingPage = () => {
    const { data: plans } = useQuery({
      queryKey: ['billing', 'plans'],
      queryFn: async () => {
        const res = await fetch('/api/billing/plans');
        return res.json();
      }
    });
    
    const { data: subscription } = useQuery({
      queryKey: ['billing', 'subscription'],
      queryFn: async () => {
        const res = await fetch('/api/billing/subscription');
        return res.json();
      }
    });
    
    // Render UI
  };
  ```

- [ ] **Add Checkout UI**
  - [ ] Plan selection cards
  - [ ] Billing cycle toggle (monthly/yearly)
  - [ ] Currency selector (USD/EUR)
  - [ ] "Subscribe" button

- [ ] **Add Subscription Management**
  - [ ] Display current plan
  - [ ] Show renewal date
  - [ ] Cancel button
  - [ ] Pause/Resume buttons
  - [ ] Update payment method

- [ ] **Add Usage Dashboard**
  - [ ] Display usage metrics
  - [ ] Show usage bars with limits
  - [ ] Display estimated cost
  - [ ] Show upgrade suggestions

- [ ] **Add Invoice History**
  - [ ] List recent invoices
  - [ ] Download PDF
  - [ ] Filter by status
  - [ ] Show payment date

## Phase 8: Production Deployment

- [ ] **Database Migration**
  - [ ] Backup production database
  - [ ] Test migration on staging
  - [ ] Run migration on production
  - [ ] Verify all tables created

- [ ] **Environment Variables**
  - [ ] Add to deployment platform
  - [ ] Use live Stripe keys
  - [ ] Verify secrets are not logged

- [ ] **SSL/HTTPS**
  - [ ] Verify HTTPS enabled
  - [ ] Update webhook URL to HTTPS
  - [ ] Create production webhook endpoint

- [ ] **Monitoring**
  - [ ] Enable error tracking (Sentry, LogRocket)
  - [ ] Monitor webhook delivery
  - [ ] Monitor API error rates
  - [ ] Set up alerts for failed payments

- [ ] **Compliance**
  - [ ] Review PCI compliance
  - [ ] Verify no card data stored
  - [ ] Enable 3D Secure for EU
  - [ ] Review privacy policy

## Phase 9: Documentation

- [x] **Main Guide**: `/SUBSCRIPTION_SYSTEM_GUIDE.md`
  - [x] Architecture overview
  - [x] Database schema
  - [x] Setup instructions
  - [x] API endpoints
  - [x] Webhook management
  - [x] Multi-currency
  - [x] Usage tracking
  - [x] Testing
  - [x] Troubleshooting

- [x] **Stripe Setup Guide**: `/STRIPE_SETUP.md`
  - [x] Prerequisites
  - [x] API key setup
  - [x] Product creation
  - [x] Price configuration
  - [x] Webhook setup
  - [x] Local development
  - [x] Production deployment
  - [x] Verification checklist

- [ ] **Team Documentation**
  - [ ] API reference for developers
  - [ ] Billing flow diagrams
  - [ ] Runbook for common tasks
  - [ ] FAQ and troubleshooting

## Phase 10: Monitoring & Maintenance

- [ ] **Setup Monitoring**
  ```sql
  -- Monitor webhook success rate
  SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*)*100.0/(SELECT COUNT(*) FROM webhook_events), 2) as percentage
  FROM webhook_events
  WHERE received_at > NOW() - INTERVAL '24 hours'
  GROUP BY status;
  ```

- [ ] **Monthly Tasks**
  - [ ] Review webhook failures
  - [ ] Check usage patterns
  - [ ] Verify all subscriptions synced
  - [ ] Audit billing history

- [ ] **Quarterly Tasks**
  - [ ] Review pricing
  - [ ] Update default currency rates
  - [ ] Analyze churn
  - [ ] Plan improvements

- [ ] **Annual Tasks**
  - [ ] Audit security settings
  - [ ] Review compliance requirements
  - [ ] Plan feature updates
  - [ ] Schedule training

## Phase 11: Feature Enhancements

- [ ] **Billing Features**
  - [ ] Plan upgrades/downgrades
  - [ ] Prorated billing
  - [ ] Coupon/discount codes
  - [ ] Usage-based add-ons

- [ ] **Payment Features**
  - [ ] Multiple payment methods
  - [ ] Saved cards management
  - [ ] ACH/bank transfer (US)
  - [ ] SEPA (EU)

- [ ] **Customer Features**
  - [ ] Billing email reminders
  - [ ] Invoice PDF generation
  - [ ] Tax receipts
  - [ ] Billing portal (Stripe hosted)

- [ ] **Admin Features**
  - [ ] Manual invoice creation
  - [ ] Credit application
  - [ ] Refund management
  - [ ] Subscription override

## Rollout Timeline

### Week 1: Setup & Configuration
- [ ] Complete Phase 1-3 (Database, Services, Environment)
- [ ] Phase 4 (Stripe Configuration)
- [ ] Phase 6 (Local Testing)

### Week 2: Integration & Testing
- [ ] Phase 5 (Express Integration)
- [ ] Phase 6 (Full Testing)
- [ ] Phase 9 (Documentation)

### Week 3: Deployment
- [ ] Phase 8 (Production Deployment)
- [ ] Staging testing
- [ ] Production go-live

### Week 4: Monitoring
- [ ] Phase 10 (Monitoring Setup)
- [ ] Production validation
- [ ] User feedback collection

## Success Criteria

- [ ] All database tables created successfully
- [ ] All API endpoints responding correctly
- [ ] Stripe API integration working
- [ ] Test payment processes successfully
- [ ] Webhook events logged and processed
- [ ] Subscriptions visible in database
- [ ] Invoices generated correctly
- [ ] Usage tracking operational
- [ ] Production deployment successful
- [ ] Zero critical production issues in first week

## Support Contacts

- **Stripe Support**: support@stripe.com
- **Supabase Support**: support@supabase.io
- **Documentation**: `/SUBSCRIPTION_SYSTEM_GUIDE.md`

## Sign-Off

- [ ] **Developer**: ______________ Date: __________
- [ ] **QA**: ______________ Date: __________
- [ ] **Product**: ______________ Date: __________
- [ ] **Operations**: ______________ Date: __________

---

**Next Phase**: After completion, evaluate Phase 11 feature enhancements based on business priorities.
