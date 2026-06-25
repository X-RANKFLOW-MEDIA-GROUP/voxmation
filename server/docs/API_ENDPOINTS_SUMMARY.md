# Billing API Endpoints Summary

## Quick Reference

### Admin Endpoints (Owner/Admin Only)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/subscriptions` | List all subscriptions | Required |
| PATCH | `/api/admin/subscriptions/:id` | Change subscription plan | Required |
| GET | `/api/admin/invoices` | List all invoices | Required |
| POST | `/api/admin/invoices/:id/resend` | Resend invoice | Required |

### User Endpoints (Authenticated)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/billing/plans` | List available plans | Required |
| GET | `/api/billing/subscription` | Get current subscription | Required |
| GET | `/api/billing/invoices` | Get user's invoices | Required |
| GET | `/api/billing/usage` | Get usage metrics | Required |
| POST | `/api/billing/checkout` | Create checkout session | Required |
| POST | `/api/billing/subscribe` | Create subscription directly | Required |
| GET | `/api/billing/subscription/:id` | Get subscription details | Required |
| POST | `/api/billing/subscription/:id/cancel` | Cancel subscription | Required |
| GET | `/api/billing/invoices/:customerId` | Get customer invoices | Required |
| GET | `/api/billing/upcoming-invoice/:customerId` | Get upcoming invoice | Required |

### Webhook Endpoints (No Auth)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/webhooks/stripe` | Receive Stripe events | Signature |

---

## Admin Endpoints Detailed

### GET /api/admin/subscriptions

**Description**: List all subscriptions with advanced filtering and pagination

**Authorization**: Owner or Admin role required

**Query Parameters**:
```
limit=25          # items per page (default: 25)
offset=0          # pagination offset (default: 0)
status=active     # filter: active, paused, canceled, trialing, past_due
planId=plan_id    # filter by plan ID
currency=USD      # filter: USD, EUR
```

**Response**:
```json
{
  "data": [
    {
      "id": "sub_uuid",
      "planId": "plan_uuid",
      "planName": "Professional",
      "status": "active",
      "currency": "USD",
      "billingCycle": "monthly",
      "pricePerCycle": 49.99,
      "currentPeriodStart": "2024-01-15",
      "currentPeriodEnd": "2024-02-15",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "pagination": { "limit": 25, "offset": 0 }
}
```

**Examples**:
```bash
# Get all active subscriptions
curl -X GET "https://api.app.com/api/admin/subscriptions?status=active" \
  -H "Authorization: Bearer TOKEN"

# Get subscriptions for specific plan
curl -X GET "https://api.app.com/api/admin/subscriptions?planId=plan_pro&limit=50" \
  -H "Authorization: Bearer TOKEN"

# Get EUR subscriptions
curl -X GET "https://api.app.com/api/admin/subscriptions?currency=EUR" \
  -H "Authorization: Bearer TOKEN"
```

---

### PATCH /api/admin/subscriptions/:id

**Description**: Change subscription plan with flexible proration options

**Authorization**: Owner or Admin role required

**URL Parameters**:
```
id                # subscription ID (required)
```

**Request Body**:
```json
{
  "planId": "plan_enterprise_uuid",         // required
  "billingCycle": "yearly",                 // optional: monthly or yearly
  "prorationBehavior": "create_prorations"  // optional: create_prorations, always_invoice, none
}
```

**Response**:
```json
{
  "id": "sub_uuid",
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

**Examples**:
```bash
# Upgrade subscription plan
curl -X PATCH "https://api.app.com/api/admin/subscriptions/sub_abc123" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_enterprise_id",
    "prorationBehavior": "create_prorations"
  }'

# Change billing cycle
curl -X PATCH "https://api.app.com/api/admin/subscriptions/sub_abc123" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_pro_id",
    "billingCycle": "yearly",
    "prorationBehavior": "none"
  }'
```

**Events Created**: `subscription_modified` event in billing_history

---

### GET /api/admin/invoices

**Description**: List all invoices with filtering and pagination

**Authorization**: Owner or Admin role required

**Query Parameters**:
```
limit=25              # items per page (default: 25)
offset=0              # pagination offset (default: 0)
status=paid           # filter: paid, open, draft, void, uncollectible
currency=USD          # filter: USD, EUR
subscriptionId=sub_id # filter by subscription
```

**Response**:
```json
{
  "data": [
    {
      "id": "inv_uuid",
      "invoiceNumber": "INV-2024-001",
      "subscriptionId": "sub_uuid",
      "status": "paid",
      "currency": "USD",
      "amountTotal": 49.99,
      "amountPaid": 49.99,
      "amountDue": 0,
      "issueDate": "2024-01-15",
      "dueDate": "2024-02-15",
      "paidDate": "2024-01-15",
      "pdfUrl": "https://...",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 12,
  "pagination": { "limit": 25, "offset": 0 }
}
```

**Examples**:
```bash
# Get paid invoices
curl -X GET "https://api.app.com/api/admin/invoices?status=paid" \
  -H "Authorization: Bearer TOKEN"

# Get open invoices
curl -X GET "https://api.app.com/api/admin/invoices?status=open&limit=50" \
  -H "Authorization: Bearer TOKEN"

# Get invoices for specific subscription
curl -X GET "https://api.app.com/api/admin/invoices?subscriptionId=sub_abc123" \
  -H "Authorization: Bearer TOKEN"

# Get EUR invoices
curl -X GET "https://api.app.com/api/admin/invoices?currency=EUR" \
  -H "Authorization: Bearer TOKEN"
```

---

### POST /api/admin/invoices/:id/resend

**Description**: Resend an invoice to the customer via email

**Authorization**: Owner or Admin role required

**URL Parameters**:
```
id    # invoice ID (required)
```

**Request Body**:
```json
{}
```

**Response**:
```json
{
  "id": "inv_uuid",
  "invoiceNumber": "INV-2024-001",
  "status": "sent",
  "message": "Invoice resent successfully"
}
```

**Examples**:
```bash
# Resend invoice to customer
curl -X POST "https://api.app.com/api/admin/invoices/inv_abc123/resend" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Events Created**: `invoice_created` event (action: resend) in billing_history

---

## Status Codes & Error Handling

### Success Responses

```
200 OK              - Request successful
201 Created         - Resource created
```

### Client Errors

```
400 Bad Request     - Missing or invalid parameters
401 Unauthorized    - Missing or invalid token
403 Forbidden       - Insufficient permissions (need owner/admin)
404 Not Found       - Resource not found
```

### Server Errors

```
500 Server Error    - Internal server error (check logs)
```

### Error Response Format

```json
{
  "error": "Subscription not found"
}
```

---

## Authentication

### Bearer Token Format

All requests must include:
```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access

- **Public**: `/api/billing/plans` (GET only, no auth needed)
- **Authenticated**: `/api/billing/*` (user data)
- **Admin Only**: `/api/admin/*` (requires owner or admin role)

---

## Multi-Currency Support

Both USD and EUR are supported across all billing operations:

```json
{
  "currency": "USD",
  "amount": 99.99,
  "symbol": "$"
}
```

### Currency Codes
- **USD**: US Dollar
- **EUR**: Euro

---

## Pagination

Standard pagination across all list endpoints:

```json
{
  "data": [...],
  "total": 100,
  "pagination": {
    "limit": 25,
    "offset": 0
  }
}
```

**Formula**: `total_pages = ceil(total / limit)`

---

## Filtering

All list endpoints support filtering via query parameters:

```
/api/admin/subscriptions?status=active&currency=USD&limit=50&offset=0
```

Filters are applied with AND logic (all conditions must match).

---

## Billing Events Tracking

All admin actions are tracked:

| Action | Event Type | Details |
|--------|-----------|---------|
| Change plan | `subscription_modified` | old/new plan, proration |
| Resend invoice | `invoice_created` | action: resend |

Access via:
```sql
SELECT * FROM billing_history
WHERE account_id = $1
  AND event_type = $2
ORDER BY created_at DESC;
```

---

## Rate Limits

- **Unauthenticated**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Admin**: Same as authenticated (plan for caching)

---

## Documentation Files

For detailed information, see:

- **`/server/docs/ADMIN_BILLING.md`** - Complete admin endpoint documentation
- **`/server/examples/billing-endpoints.ts`** - Code examples and patterns
- **`/server/tests/billing.test.ts`** - Test cases and validation rules

---

## Quick Start

### 1. List Subscriptions
```bash
curl -X GET "https://api.app.com/api/admin/subscriptions?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Change Plan
```bash
curl -X PATCH "https://api.app.com/api/admin/subscriptions/SUB_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "NEW_PLAN_ID"}'
```

### 3. List Invoices
```bash
curl -X GET "https://api.app.com/api/admin/invoices?status=paid&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Resend Invoice
```bash
curl -X POST "https://api.app.com/api/admin/invoices/INV_ID/resend" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Support

For issues or questions about billing endpoints:

1. Check `/server/docs/ADMIN_BILLING.md` for detailed documentation
2. Review `/server/examples/billing-endpoints.ts` for code examples
3. Check application logs for error details
4. Verify authentication token and permissions
5. Contact Stripe support for payment-related issues
