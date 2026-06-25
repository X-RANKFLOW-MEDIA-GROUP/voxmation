# Admin Billing Management Endpoints

This document describes the admin-only billing management endpoints that allow account owners and admins to manage subscriptions and invoices for their account.

## Overview

The admin billing endpoints provide full control over subscription management and invoice administration:

- **GET /api/admin/subscriptions** - List all subscriptions with filtering
- **PATCH /api/admin/subscriptions/:id** - Change subscription plan
- **GET /api/admin/invoices** - List all invoices with filtering
- **POST /api/admin/invoices/:id/resend** - Resend invoice to customer

All endpoints require `owner` or `admin` role authorization.

---

## Authentication & Authorization

All admin endpoints require:

1. **Valid JWT token** in `Authorization: Bearer <token>` header
2. **Owner or Admin role** for the account
3. **Same account membership** - Users can only manage their own account's subscriptions and invoices

### Middleware Verification

```typescript
// Required headers
Authorization: Bearer <your_jwt_token>

// Required role (enforced by requireRole middleware)
User must have: owner or admin role
```

---

## Endpoints

### 1. GET /api/admin/subscriptions

List all subscriptions for the account with optional filtering and pagination.

#### Request

```http
GET /api/admin/subscriptions?limit=25&offset=0&status=active
Authorization: Bearer <token>
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 25 | Items per page (max 100) |
| `offset` | number | 0 | Pagination offset |
| `status` | string | - | Filter by status: active, paused, canceled, trialing, past_due, incomplete |
| `planId` | string | - | Filter by plan ID |
| `currency` | string | - | Filter by currency: USD, EUR |

#### Response

```json
{
  "data": [
    {
      "id": "sub_uuid_123",
      "stripeSubscriptionId": "sub_stripe_abc123",
      "planId": "plan_pro_uuid",
      "planName": "Professional",
      "status": "active",
      "currency": "USD",
      "billingCycle": "monthly",
      "pricePerCycle": 49.99,
      "currentPeriodStart": "2024-01-15",
      "currentPeriodEnd": "2024-02-15",
      "trialStart": null,
      "trialEnd": null,
      "cancelAtPeriodEnd": false,
      "canceledAt": null,
      "cancellationReason": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "pagination": {
    "limit": 25,
    "offset": 0
  }
}
```

#### Example Requests

Get active subscriptions:
```bash
curl -X GET "https://api.example.com/api/admin/subscriptions?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Filter by plan:
```bash
curl -X GET "https://api.example.com/api/admin/subscriptions?planId=plan_pro_id" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get EUR subscriptions:
```bash
curl -X GET "https://api.example.com/api/admin/subscriptions?currency=EUR&limit=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Missing authorization token | Auth header not provided |
| 403 | Insufficient permissions | User doesn't have owner/admin role |
| 500 | Failed to fetch subscriptions | Database or service error |

---

### 2. PATCH /api/admin/subscriptions/:id

Change subscription plan with flexible proration options.

#### Request

```http
PATCH /api/admin/subscriptions/sub_uuid_123
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan_enterprise_uuid",
  "billingCycle": "yearly",
  "prorationBehavior": "create_prorations"
}
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Subscription ID |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | Yes | Target plan ID |
| `billingCycle` | string | No | 'monthly' or 'yearly' (default: keep current) |
| `prorationBehavior` | string | No | 'create_prorations', 'always_invoice', or 'none' (default: 'create_prorations') |

#### Proration Behavior

- **create_prorations**: Calculate and apply proration credit immediately (recommended)
- **always_invoice**: Send invoice for remaining balance if any
- **none**: No proration adjustments

#### Response

```json
{
  "id": "sub_uuid_123",
  "planId": "plan_enterprise_uuid",
  "planName": "Enterprise",
  "status": "active",
  "billingCycle": "yearly",
  "pricePerCycle": 299.99,
  "currentPeriodStart": "2024-01-15T00:00:00Z",
  "currentPeriodEnd": "2025-01-15T00:00:00Z",
  "prorationCredit": 45.50
}
```

#### Example Requests

Upgrade to Enterprise plan:
```bash
curl -X PATCH "https://api.example.com/api/admin/subscriptions/sub_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_enterprise_id",
    "prorationBehavior": "create_prorations"
  }'
```

Change to yearly billing:
```bash
curl -X PATCH "https://api.example.com/api/admin/subscriptions/sub_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_pro_id",
    "billingCycle": "yearly",
    "prorationBehavior": "none"
  }'
```

#### Billing Event

When a subscription plan is changed, a billing event is automatically created:

```json
{
  "event_type": "subscription_modified",
  "account_id": "account_uuid",
  "subscription_id": "sub_uuid_123",
  "details": {
    "old_plan_id": "plan_pro_id",
    "new_plan_id": "plan_enterprise_id",
    "old_plan_name": "Professional",
    "new_plan_name": "Enterprise",
    "billing_cycle": "yearly",
    "proration_behavior": "create_prorations"
  },
  "amount": 299.99,
  "currency": "USD"
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Plan ID is required | planId field missing |
| 400 | Price not available | Plan missing price for currency/cycle |
| 404 | Subscription not found | Invalid ID or doesn't belong to account |
| 404 | Plan not found | Plan ID invalid or inactive |
| 500 | Failed to update subscription | Stripe or database error |

---

### 3. GET /api/admin/invoices

List all invoices for the account with optional filtering and pagination.

#### Request

```http
GET /api/admin/invoices?limit=25&offset=0&status=paid
Authorization: Bearer <token>
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 25 | Items per page (max 100) |
| `offset` | number | 0 | Pagination offset |
| `status` | string | - | Filter by status: paid, open, draft, void, uncollectible |
| `currency` | string | - | Filter by currency: USD, EUR |
| `subscriptionId` | string | - | Filter by subscription ID |

#### Response

```json
{
  "data": [
    {
      "id": "inv_uuid_123",
      "stripeInvoiceId": "in_stripe_abc123",
      "invoiceNumber": "INV-2024-001",
      "subscriptionId": "sub_uuid_123",
      "status": "paid",
      "currency": "USD",
      "amountSubtotal": 49.99,
      "amountTax": 0.00,
      "amountTotal": 49.99,
      "amountPaid": 49.99,
      "amountDue": 0.00,
      "amountRemaining": 0.00,
      "issueDate": "2024-01-15",
      "dueDate": "2024-02-15",
      "paidDate": "2024-01-15",
      "pdfUrl": "https://invoice.stripe.com/pdf/inv_abc123.pdf",
      "hostedInvoiceUrl": "https://invoice.stripe.com/i/inv_abc123",
      "lineItems": [
        {
          "description": "Professional Plan",
          "quantity": 1,
          "unitAmount": 4999,
          "amount": 4999
        }
      ],
      "customFields": {},
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 12,
  "pagination": {
    "limit": 25,
    "offset": 0
  }
}
```

#### Example Requests

Get paid invoices:
```bash
curl -X GET "https://api.example.com/api/admin/invoices?status=paid&limit=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get open invoices (awaiting payment):
```bash
curl -X GET "https://api.example.com/api/admin/invoices?status=open" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get invoices for specific subscription:
```bash
curl -X GET "https://api.example.com/api/admin/invoices?subscriptionId=sub_abc123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get EUR invoices:
```bash
curl -X GET "https://api.example.com/api/admin/invoices?currency=EUR&limit=25" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Missing authorization token | Auth header not provided |
| 403 | Insufficient permissions | User doesn't have owner/admin role |
| 500 | Failed to fetch invoices | Database or service error |

---

### 4. POST /api/admin/invoices/:id/resend

Resend an invoice to the customer via email through Stripe.

#### Request

```http
POST /api/admin/invoices/inv_uuid_123/resend
Authorization: Bearer <token>
Content-Type: application/json

{}
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Invoice ID |

#### Response

```json
{
  "id": "inv_uuid_123",
  "stripeInvoiceId": "in_stripe_abc123",
  "invoiceNumber": "INV-2024-001",
  "status": "sent",
  "message": "Invoice resent successfully"
}
```

#### Example Request

```bash
curl -X POST "https://api.example.com/api/admin/invoices/inv_abc123/resend" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Billing Event

When an invoice is resent, a billing event is automatically created:

```json
{
  "event_type": "invoice_created",
  "account_id": "account_uuid",
  "invoice_id": "inv_uuid_123",
  "details": {
    "action": "resend",
    "invoice_number": "INV-2024-001",
    "stripe_invoice_id": "in_stripe_abc123"
  },
  "amount": 49.99,
  "currency": "USD"
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invoice is not linked to Stripe | Invoice must have stripe_invoice_id |
| 404 | Invoice not found | Invalid ID or doesn't belong to account |
| 500 | Failed to resend invoice | Stripe or service error |

---

## Use Cases

### Use Case 1: Account Owner Reviews All Subscriptions

```typescript
// Get all subscriptions for the account
const response = await fetch('/api/admin/subscriptions', {
  headers: { Authorization: `Bearer ${token}` }
});

const { data, total } = await response.json();
console.log(`Account has ${total} subscription(s)`);
```

### Use Case 2: Admin Upgrades Customer Plan

```typescript
// Upgrade a customer's subscription plan
const response = await fetch('/api/admin/subscriptions/sub_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planId: 'plan_enterprise_id',
    prorationBehavior: 'create_prorations'
  })
});

const { prorationCredit } = await response.json();
console.log(`Proration credit applied: $${prorationCredit}`);
```

### Use Case 3: Finance Team Reviews Invoices

```typescript
// Get all paid invoices from last quarter
const response = await fetch(
  '/api/admin/invoices?status=paid&limit=100&offset=0',
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

const { data, total } = await response.json();
const totalRevenue = data.reduce((sum, inv) => sum + inv.amountTotal, 0);
console.log(`Paid invoices: ${total}, Total revenue: $${totalRevenue}`);
```

### Use Case 4: Support Team Resends Invoice

```typescript
// Resend invoice to customer after they request it
const response = await fetch('/api/admin/invoices/inv_abc123/resend', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: '{}'
});

const { status } = await response.json();
console.log(`Invoice resent with status: ${status}`);
```

---

## Billing Events

All admin billing actions are tracked in the `billing_history` table:

| Event Type | Trigger | Details |
|----------|---------|---------|
| `subscription_modified` | Plan or billing cycle change | Old/new plan, proration behavior |
| `invoice_created` | Invoice resend | Action type, invoice number |

### Querying Billing History

```sql
SELECT * FROM billing_history
WHERE account_id = $1
  AND event_type = 'subscription_modified'
ORDER BY created_at DESC;
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{
  "error": "Missing authorization token"
}
```
**Solution**: Ensure JWT token is in Authorization header

#### 403 Forbidden
```json
{
  "error": "Insufficient permissions for this action"
}
```
**Solution**: User must have owner or admin role

#### 404 Not Found
```json
{
  "error": "Subscription not found"
}
```
**Solution**: Verify ID is correct and belongs to account

#### 400 Bad Request
```json
{
  "error": "Plan ID is required"
}
```
**Solution**: Ensure required fields are provided in request body

---

## Rate Limiting

These endpoints follow the same rate limiting as other API endpoints:

- **Unauthenticated**: 100 requests/hour
- **Authenticated**: 1000 requests/hour

Consider implementing caching for frequently accessed lists.

---

## Security Considerations

1. **Role-Based Access Control**: Only owner/admin can access admin endpoints
2. **Account Isolation**: Users can only manage their own account's billing
3. **Stripe Signature Verification**: Resend operations verify with Stripe
4. **Audit Logging**: All changes are recorded in billing_history
5. **Data Protection**: Sensitive fields are validated and sanitized

---

## Integration Guide

### Example: Complete Subscription Management Flow

```typescript
import { adminBillingApi } from './api';

class SubscriptionManager {
  constructor(private token: string) {}

  async upgradeSubscription(subId: string, newPlanId: string) {
    // Get current subscription
    const subs = await this.getSubscriptions({ subscriptionId: subId });
    const current = subs.data[0];

    // Upgrade plan
    const response = await adminBillingApi.updateSubscription(
      subId,
      {
        planId: newPlanId,
        prorationBehavior: 'create_prorations'
      },
      this.token
    );

    // Log the change
    console.log(
      `Upgraded ${current.planName} -> ${response.planName}`,
      `Proration credit: $${response.prorationCredit}`
    );

    return response;
  }

  async getSubscriptions(filters?: Record<string, string>) {
    return adminBillingApi.listSubscriptions(filters, this.token);
  }

  async getInvoices(status?: string) {
    return adminBillingApi.listInvoices({ status }, this.token);
  }

  async resendInvoice(invoiceId: string) {
    return adminBillingApi.resendInvoice(invoiceId, this.token);
  }
}
```

---

## FAQ

**Q: Can I change the billing cycle without changing the plan?**
A: Yes, provide the same planId with a different billingCycle.

**Q: How does proration work?**
A: With 'create_prorations', Stripe calculates a credit/charge for the remainder of the current period.

**Q: Can I downgrade a subscription?**
A: Yes, you can change to any active plan. Downgrade credits are handled per your Stripe settings.

**Q: Will resending an invoice charge the customer again?**
A: No, resending only sends the invoice email. No payment is collected.

**Q: Can I see all invoices for all accounts?**
A: No, each account can only access its own invoices. Use account context in the token.

---

## Support

For issues or questions:

1. Check error responses for detailed messages
2. Review billing_history table for audit trail
3. Contact Stripe support for payment-related issues
4. Check application logs for backend errors
