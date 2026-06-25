# Stripe Billing Integration - API Endpoints

Complete implementation guide for Stripe billing endpoints with multi-currency support (USD/EUR) and webhook handling.

## Quick Start

### Environment Setup

Set these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Installation

Stripe package is already included in `package.json`:

```bash
npm install
```

## Endpoints Overview

### 1. POST /api/billing/checkout

Create a Stripe checkout session for subscription purchase or upgrade.

**URL:** `POST /api/billing/checkout`

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "planId": "plan_pro",
  "billingCycle": "monthly",
  "currency": "usd",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel",
  "metadata": {
    "source": "web_portal"
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| planId | string | Yes | Subscription plan ID |
| billingCycle | string | Yes | "monthly" or "yearly" |
| currency | string | No | "usd" (default) or "eur" |
| successUrl | string | No | Redirect after successful payment |
| cancelUrl | string | No | Redirect if user cancels |
| metadata | object | No | Custom metadata to track |

**Success Response (201):**

```json
{
  "sessionId": "cs_live_abc123",
  "checkoutUrl": "https://checkout.stripe.com/pay/...",
  "currency": "USD",
  "billingCycle": "monthly",
  "planId": "plan_pro",
  "estimatedAmount": 99.00
}
```

**Error Responses:**

```json
// 400 - Invalid input
{
  "error": "Plan ID is required"
}

// 404 - Plan not found
{
  "error": "Subscription plan not found"
}

// 500 - Server error
{
  "error": "Failed to create checkout session"
}
```

**Examples:**

<details>
<summary>cURL</summary>

```bash
# USD Monthly
curl -X POST https://api.yourapp.com/api/billing/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_pro",
    "billingCycle": "monthly",
    "currency": "usd"
  }'

# EUR Yearly
curl -X POST https://api.yourapp.com/api/billing/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_pro",
    "billingCycle": "yearly",
    "currency": "eur"
  }'
```

</details>

<details>
<summary>JavaScript</summary>

```javascript
// USD Monthly
const response = await fetch('/api/billing/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 'plan_pro',
    billingCycle: 'monthly',
    currency: 'usd',
  }),
});

const { checkoutUrl } = await response.json();
window.location.href = checkoutUrl;
```

</details>

<details>
<summary>Python</summary>

```python
import requests

response = requests.post(
    'https://api.yourapp.com/api/billing/checkout',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    },
    json={
        'planId': 'plan_pro',
        'billingCycle': 'monthly',
        'currency': 'usd',
    }
)

data = response.json()
print(f"Redirect to: {data['checkoutUrl']}")
```

</details>

---

### 2. GET /api/billing/invoices

Retrieve invoices with pagination and filtering support.

**URL:** `GET /api/billing/invoices`

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Items per page (max 100) |
| offset | number | 0 | Pagination offset |
| status | string | - | Filter: paid, open, draft, void, uncollectible |
| currency | string | - | Filter: USD, EUR |

**Success Response (200):**

```json
{
  "data": [
    {
      "id": "in_1234567890",
      "invoiceNumber": "INV-001",
      "status": "paid",
      "amount": 99.00,
      "currency": "USD",
      "issueDate": "2024-01-15T10:00:00Z",
      "paidDate": "2024-01-15T14:30:00Z",
      "dueDate": "2024-02-15T10:00:00Z",
      "pdfUrl": "https://invoice.pdf",
      "subscriptionId": "sub_123456",
      "metadata": {
        "planId": "plan_pro",
        "billingCycle": "monthly"
      }
    }
  ],
  "total": 15,
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses:**

```json
// 400 - Invalid query
{
  "error": "Invalid status filter"
}

// 401 - Unauthorized
{
  "error": "Unauthorized"
}

// 500 - Server error
{
  "error": "Failed to fetch invoices"
}
```

**Examples:**

<details>
<summary>cURL</summary>

```bash
# All invoices
curl https://api.yourapp.com/api/billing/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"

# Paid invoices only
curl https://api.yourapp.com/api/billing/invoices?status=paid \
  -H "Authorization: Bearer YOUR_TOKEN"

# USD invoices
curl https://api.yourapp.com/api/billing/invoices?currency=USD \
  -H "Authorization: Bearer YOUR_TOKEN"

# Pagination
curl https://api.yourapp.com/api/billing/invoices?limit=25&offset=25 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined filters
curl "https://api.yourapp.com/api/billing/invoices?status=paid&currency=EUR&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

</details>

<details>
<summary>JavaScript</summary>

```javascript
// All invoices
const response = await fetch('/api/billing/invoices', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data, total } = await response.json();

// With filters
const response = await fetch(
  '/api/billing/invoices?status=paid&currency=USD&limit=25',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

// Pagination
async function* getAllInvoices() {
  let offset = 0;
  let hasMore = true;
  const limit = 25;

  while (hasMore) {
    const response = await fetch(
      `/api/billing/invoices?limit=${limit}&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const { data, total } = await response.json();
    
    for (const invoice of data) {
      yield invoice;
    }
    
    offset += limit;
    hasMore = offset < total;
  }
}
```

</details>

<details>
<summary>Python</summary>

```python
import requests

# All invoices
response = requests.get(
    'https://api.yourapp.com/api/billing/invoices',
    headers={'Authorization': f'Bearer {token}'}
)
invoices = response.json()['data']

# With filters
response = requests.get(
    'https://api.yourapp.com/api/billing/invoices',
    headers={'Authorization': f'Bearer {token}'},
    params={
        'status': 'paid',
        'currency': 'USD',
        'limit': 25,
    }
)
invoices = response.json()['data']

# Pagination
def get_all_invoices():
    offset = 0
    limit = 25
    total = None
    
    while total is None or offset < total:
        response = requests.get(
            'https://api.yourapp.com/api/billing/invoices',
            headers={'Authorization': f'Bearer {token}'},
            params={'limit': limit, 'offset': offset}
        )
        data = response.json()
        total = data['total']
        
        for invoice in data['data']:
            yield invoice
        
        offset += limit
```

</details>

---

### 3. POST /api/webhooks/stripe

Stripe webhook endpoint for handling billing events. Signature verification is automatic.

**URL:** `POST /api/webhooks/stripe`

**Authentication:** None (uses Stripe HMAC signature verification)

**Headers Required:**

```
stripe-signature: <Stripe-Signature-Header>
Content-Type: application/json
```

**Supported Events:**

| Event | Description |
|-------|-------------|
| `customer.subscription.created` | New subscription created |
| `customer.subscription.updated` | Subscription modified |
| `customer.subscription.deleted` | Subscription canceled |
| `invoice.paid` | Invoice payment succeeded |
| `invoice.payment_failed` | Invoice payment failed |
| `payment_intent.succeeded` | Payment intent succeeded |
| `customer.created` | New customer created |
| `customer.deleted` | Customer deleted |

**Success Response (200):**

```json
{
  "received": true,
  "eventId": "evt_1234567890",
  "eventType": "invoice.paid",
  "processedAt": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

```json
// 400 - Invalid signature
{
  "error": "Invalid signature"
}

// 500 - Processing error
{
  "error": "Webhook processing failed",
  "details": "Error details here"
}
```

**Configuration:**

1. Go to [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint: `https://api.yourapp.com/api/webhooks/stripe`
4. Select all billing events listed above
5. Copy the Signing Secret
6. Set environment variable: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Testing Webhooks Locally:**

<details>
<summary>Using Stripe CLI</summary>

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Start listening for events
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger invoice.paid
stripe trigger customer.subscription.created
```

</details>

<details>
<summary>Using cURL</summary>

```bash
# Get test signature (from stripe listen output or dashboard)
curl -X POST http://localhost:3001/api/webhooks/stripe \
  -H "stripe-signature: <signature-from-stripe-cli>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test",
    "type": "invoice.paid",
    "data": {
      "object": {
        "id": "in_test",
        "status": "paid",
        "customer": "cus_test"
      }
    }
  }'
```

</details>

---

## Data Models

### Invoice Model

```typescript
{
  id: string;                // Stripe invoice ID
  invoiceNumber: string;     // User-friendly number
  status: string;            // paid, open, draft, void, uncollectible
  amount: number;            // In currency units (€99.00 = 99)
  currency: string;          // USD or EUR
  issueDate: string;         // ISO 8601
  paidDate: string | null;   // ISO 8601
  dueDate: string | null;    // ISO 8601
  pdfUrl: string | null;     // PDF download link
  subscriptionId: string;    // Associated subscription
  metadata: object;          // Custom data
}
```

### Checkout Session Model

```typescript
{
  sessionId: string;        // Stripe session ID
  checkoutUrl: string;      // Redirect URL
  currency: string;         // USD or EUR
  billingCycle: string;     // monthly or yearly
  planId: string;           // Selected plan
  estimatedAmount: number;  // Estimated cost
}
```

### Webhook Event Model

```typescript
{
  received: boolean;     // Always true on success
  eventId: string;       // Stripe event ID
  eventType: string;     // Event type
  processedAt: string;   // ISO 8601 timestamp
}
```

---

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Plan not found | 404 | Invalid planId | Verify plan exists in database |
| Price not configured | 400 | Missing Stripe price ID | Configure plan in Stripe |
| Invalid currency | 400 | Unsupported currency | Use USD or EUR only |
| Invalid signature | 400 | Webhook tampering | Check STRIPE_WEBHOOK_SECRET |
| Account not found | 404 | User not authenticated | Ensure valid Bearer token |
| Unauthorized | 401 | Missing token | Add Authorization header |

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional context (webhooks only)"
}
```

---

## Multi-Currency Support

### USD (United States Dollar)

- Symbol: `$`
- Stripe ID format: `price_*_usd`
- Min amount: $0.50
- Decimal places: 2

### EUR (Euro)

- Symbol: `€`
- Stripe ID format: `price_*_eur`
- Min amount: €0.50
- Decimal places: 2

**Currency Selection:**

Currency is determined by:
1. Explicit `currency` parameter in request
2. Customer's preferred currency (if set)
3. Default: USD

---

## Implementation Details

### Stripe Integration Files

**Core Integration:**
- `server/integrations/stripe.ts` - Main Stripe client and operations
- `server/integrations/stripe-advanced.ts` - Advanced features (if needed)

**Routes:**
- `server/routes/billing.ts` - Checkout and invoices endpoints
- `server/routes/webhooks.ts` - Webhook handling

**Utilities:**
- `server/utils/stripe-helpers.ts` - Helper functions for common operations

**Examples:**
- `server/examples/billing-endpoints.ts` - Usage examples

### Middleware

Billing endpoints use tenant middleware for account isolation:
- `server/middleware/tenantMiddleware.ts` - Extracts accountId from request

---

## Database Tables

Required tables (auto-created or use migrations):

```sql
-- Invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY,
  stripe_invoice_id text UNIQUE,
  account_id uuid,
  status text,
  amount numeric,
  currency text,
  issue_date timestamp,
  paid_date timestamp,
  pdf_url text,
  metadata jsonb
);

-- Subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  stripe_subscription_id text UNIQUE,
  account_id uuid,
  status text,
  currency text,
  current_period_start timestamp,
  current_period_end timestamp,
  last_paid_at timestamp
);

-- Webhook Events
CREATE TABLE webhook_events (
  id uuid PRIMARY KEY,
  event_type text,
  stripe_event_id text UNIQUE,
  stripe_invoice_id text,
  processed_at timestamp,
  metadata jsonb
);
```

---

## Best Practices

1. **Security:**
   - Always verify webhook signatures (automatic in implementation)
   - Use Bearer tokens with proper expiration
   - Keep STRIPE_WEBHOOK_SECRET secure (never expose to client)

2. **Error Handling:**
   - Implement retry logic for failed webhooks
   - Log all webhook events for debugging
   - Monitor for signature verification failures

3. **User Experience:**
   - Provide custom success/cancel URLs
   - Show estimated amounts before checkout
   - Display invoice PDFs for accounting

4. **Data Integrity:**
   - Store both Stripe IDs and local database IDs
   - Use idempotency keys for API calls
   - Reconcile invoices regularly with Stripe

5. **Performance:**
   - Cache plan data
   - Implement pagination for invoices
   - Use database indexes on frequently queried fields

---

## Troubleshooting

### Webhook Signature Errors

**Problem:** "Invalid signature" errors on webhooks

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
2. Check webhook endpoint URL in Stripe Dashboard
3. Ensure raw body is used (not parsed JSON)
4. Use Stripe CLI to test locally first

### Checkout Session Issues

**Problem:** Users redirected to blank checkout page

**Solutions:**
1. Verify plan has configured Stripe price IDs
2. Check Stripe account is properly configured
3. Ensure prices exist in Stripe Dashboard
4. Test with Stripe test mode first

### Invoice Retrieval Issues

**Problem:** No invoices returned despite payments

**Solutions:**
1. Verify customer exists in Stripe
2. Check account_id is set correctly
3. Ensure invoices have been paid in Stripe
4. Check currency filter matches invoice currency

---

## Testing Checklist

- [ ] Create checkout session (USD monthly)
- [ ] Create checkout session (EUR yearly)
- [ ] Complete payment in Stripe checkout
- [ ] Verify webhook receives payment event
- [ ] Get invoices with no filters
- [ ] Filter invoices by status (paid)
- [ ] Filter invoices by currency (USD, EUR)
- [ ] Test pagination with multiple invoices
- [ ] Verify invoice PDF URLs work
- [ ] Test error cases (invalid plan, bad currency)

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Billing Integration Examples](./server/examples/billing-endpoints.ts)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Stripe Dashboard for account issues
3. Check server logs for error details
4. Test with Stripe CLI for webhook issues
5. Contact Stripe support for API issues
