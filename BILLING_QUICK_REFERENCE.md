# Stripe Billing - Quick Reference Card

## Three Main Endpoints

### 1️⃣ CREATE CHECKOUT
**POST /api/billing/checkout**
```bash
curl -X POST /api/billing/checkout \
  -H "Authorization: Bearer TOKEN" \
  -d '{"planId":"plan_pro", "currency":"usd", "billingCycle":"monthly"}'
```
✓ USD/EUR | ✓ Monthly/Yearly | ✓ Auto customer creation

### 2️⃣ GET INVOICES
**GET /api/billing/invoices**
```bash
curl /api/billing/invoices?status=paid&currency=USD&limit=10 \
  -H "Authorization: Bearer TOKEN"
```
✓ Pagination | ✓ Filter by status | ✓ Filter by currency

### 3️⃣ WEBHOOK
**POST /api/webhooks/stripe**
- No authentication (signature verified)
- Handles 8+ event types
- Auto-persists to database

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET/webhooks) |
| 201 | Created (POST checkout) |
| 400 | Bad request/validation error |
| 401 | Unauthorized (missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found (plan/account) |
| 500 | Server error |

---

## Currencies Supported

| Code | Symbol | Region |
|------|--------|--------|
| USD | $ | Worldwide |
| EUR | € | Europe |

---

## Billing Cycles

| Cycle | Frequency |
|-------|-----------|
| monthly | Every month |
| yearly | Every 12 months |

---

## Invoice Statuses

| Status | Meaning |
|--------|---------|
| draft | Not sent to customer |
| open | Awaiting payment |
| paid | Paid |
| void | Canceled |
| uncollectible | Bad debt |

---

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Response Examples

### Checkout
```json
{
  "sessionId": "cs_live_...",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "currency": "USD",
  "billingCycle": "monthly",
  "estimatedAmount": 99.00
}
```

### Invoices
```json
{
  "data": [
    {
      "id": "in_...",
      "amount": 99.00,
      "currency": "USD",
      "status": "paid",
      "paidDate": "2024-01-15T14:30:00Z",
      "pdfUrl": "https://..."
    }
  ],
  "total": 15,
  "pagination": {"limit": 10, "offset": 0}
}
```

### Webhook
```json
{
  "received": true,
  "eventId": "evt_...",
  "eventType": "invoice.paid",
  "processedAt": "2024-01-15T10:00:00Z"
}
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| "Plan not found" | Verify planId exists |
| "Invalid currency" | Use USD or EUR |
| "Invalid signature" | Check webhook secret |
| "Account not found" | Verify authentication token |
| "Price not configured" | Add Stripe price IDs to plan |

---

## File Locations

| File | Purpose |
|------|---------|
| `server/routes/billing.ts` | Checkout & invoices endpoints |
| `server/routes/webhooks.ts` | Webhook handler |
| `server/integrations/stripe.ts` | Stripe client & operations |
| `server/utils/stripe-helpers.ts` | Helper functions |
| `BILLING_ENDPOINTS.md` | Full documentation |

---

## Quick Setup

1. **Install Stripe package** (already done)
   ```bash
   npm install stripe
   ```

2. **Set environment variables**
   ```bash
   export STRIPE_SECRET_KEY=...
   export STRIPE_PUBLISHABLE_KEY=...
   export STRIPE_WEBHOOK_SECRET=...
   ```

3. **Configure webhook in Stripe Dashboard**
   - Endpoint: `https://api.yourapp.com/api/webhooks/stripe`
   - Events: All billing events
   - Copy signing secret → STRIPE_WEBHOOK_SECRET

4. **Create plans in Stripe** with price IDs:
   - `stripe_price_id_monthly_usd`
   - `stripe_price_id_yearly_usd`
   - `stripe_price_id_monthly_eur`
   - `stripe_price_id_yearly_eur`

5. **Test**
   ```bash
   # Checkout
   curl -X POST /api/billing/checkout -H "Authorization: Bearer TOKEN"
   
   # Invoices
   curl /api/billing/invoices -H "Authorization: Bearer TOKEN"
   
   # Webhooks
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

---

## Webhook Events

| Event | Trigger |
|-------|---------|
| `customer.subscription.created` | New subscription |
| `customer.subscription.updated` | Plan change |
| `customer.subscription.deleted` | Cancellation |
| `invoice.paid` | Payment received |
| `invoice.payment_failed` | Payment declined |
| `payment_intent.succeeded` | Payment processed |
| `customer.created` | New customer |
| `customer.deleted` | Customer deleted |

---

## Role Requirements

| Endpoint | Required Role |
|----------|---------------|
| POST /checkout | owner, admin |
| GET /invoices | any authenticated |
| POST /webhooks/stripe | none (signature verified) |

---

## Testing Checklist

- [ ] Checkout creates session (USD)
- [ ] Checkout creates session (EUR)
- [ ] Invoices list retrieves data
- [ ] Invoice filtering by status works
- [ ] Invoice filtering by currency works
- [ ] Webhook receives events
- [ ] Webhook signature validates
- [ ] Error cases handled gracefully

---

## Performance Tips

1. **Cache plan data** - Plans don't change often
2. **Use pagination** - Don't fetch all invoices at once
3. **Index Stripe IDs** - Fast lookups in database
4. **Batch webhooks** - Process multiple events together
5. **Monitor webhook latency** - Should process < 5 seconds

---

## Security Checklist

- [ ] STRIPE_SECRET_KEY never exposed to client
- [ ] STRIPE_WEBHOOK_SECRET only on server
- [ ] Webhook signature verified before processing
- [ ] Role-based access control enforced
- [ ] Account ID validated from token
- [ ] Error messages don't leak sensitive data
- [ ] HTTPS enforced for all endpoints
- [ ] Webhook secrets rotated periodically

---

## Debugging Commands

```bash
# View recent events in Stripe CLI
stripe logs tail

# Test webhook locally
stripe trigger invoice.paid

# Forward to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Monitor account activity
stripe dashboard

# Check API keys
stripe api_keys

# View recent charges
stripe charges list

# View invoices
stripe invoices list
```

---

## Related Files

- Full API guide: `BILLING_ENDPOINTS.md`
- Code examples: `server/examples/billing-endpoints.ts`
- Test suite: `server/tests/billing.test.ts`
- Helper functions: `server/utils/stripe-helpers.ts`
- Implementation details: `BILLING_IMPLEMENTATION_SUMMARY.md`

---

## Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **API Reference:** https://stripe.com/docs/api
- **Webhooks Guide:** https://stripe.com/docs/webhooks

---

**Last Updated:** 2026-06-25
**Status:** Production Ready
**Version:** 1.0.0
