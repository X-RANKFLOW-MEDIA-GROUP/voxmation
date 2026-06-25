# Voxmation API Documentation

Complete API reference for Voxmation - Voice automation and campaign management platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- [Webhooks](#webhooks)
- [Examples](#examples)

## Overview

### Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.voxmation.com`

### API Version

Current API version: `1.0.0`

### Response Format

All API responses are in JSON format with the following structure:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Operation successful"
}
```

## Authentication

### Authentication Methods

1. **JWT Bearer Token** (Recommended)
   - Obtained from `/api/auth/login` endpoint
   - Include in `Authorization` header: `Bearer <token>`
   - Token expires in 24 hours

2. **API Key** (For programmatic access)
   - Include in `X-API-Key` header
   - Contact support to generate API keys

### Getting an Auth Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "user_metadata": {}
  },
  "accountId": "account-uuid",
  "message": "Login successful"
}
```

### Token Refresh

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh-token-value"
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200  | OK | Successful request |
| 201  | Created | Resource created successfully |
| 400  | Bad Request | Invalid request parameters |
| 401  | Unauthorized | Authentication failed or token expired |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource not found |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Server-side error |
| 503  | Service Unavailable | Service temporarily unavailable |

### Common Error Codes

#### Authentication Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password is incorrect |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 401 | JWT token is invalid or malformed |
| `MISSING_AUTH_HEADER` | 401 | Authorization header is missing |
| `MISSING_EMAIL_VERIFICATION` | 401 | Email not verified |

#### Validation Errors

| Code | HTTP | Description |
|------|------|-------------|
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_EMAIL_FORMAT` | 400 | Email format is invalid |
| `PASSWORD_TOO_SHORT` | 400 | Password must be at least 6 characters |
| `INVALID_PHONE_NUMBER` | 400 | Phone number format is invalid |
| `EMAIL_ALREADY_EXISTS` | 400 | Email is already registered |

#### Resource Errors

| Code | HTTP | Description |
|------|------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `ACCOUNT_NOT_FOUND` | 404 | Account not found |
| `CONTACT_NOT_FOUND` | 404 | Contact not found |
| `CAMPAIGN_NOT_FOUND` | 404 | Campaign not found |
| `AUTOMATION_NOT_FOUND` | 404 | Automation not found |

#### Permission Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required role/permission |
| `ADMIN_ONLY` | 403 | This operation requires admin role |
| `UNAUTHORIZED_ACCOUNT_ACCESS` | 403 | User cannot access this account |

#### State Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_STATE_TRANSITION` | 400 | Cannot transition to requested state |
| `CAMPAIGN_NOT_DRAFT` | 400 | Only draft campaigns can be edited |
| `INVALID_OPERATION` | 400 | Operation is not valid for current state |

#### Server Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | An unexpected error occurred |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 500 | External service (Stripe, Twilio) failed |

## Rate Limiting

### Rate Limits by Plan

| Plan | Requests/Hour | Burst |
|------|--------------|-------|
| Free | 100 | 10 |
| Starter | 1,000 | 100 |
| Pro | 10,000 | 1,000 |
| Enterprise | Unlimited | Unlimited |

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

When rate limited (429):
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again later.",
  "retryAfter": 60
}
```

## API Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth/login
Login with email and password.

**Parameters:**
- `email` (string, required): User email
- `password` (string, required): User password

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "jwt-token",
  "accessToken": "supabase-token",
  "user": {...},
  "accountId": "account-id"
}
```

#### POST /api/auth/register
Register a new user account.

**Parameters:**
- `email` (string, required): Email address
- `password` (string, required, min 6 chars): Password
- `fullName` (string, optional): Full name
- `companyName` (string, optional): Company name

**Response:** `201 Created`

#### POST /api/auth/logout
Logout user and invalidate token.

**Response:** `200 OK`

#### POST /api/auth/refresh
Refresh authentication token.

**Parameters:**
- `refresh_token` (string, required): Refresh token from login

**Response:** `200 OK`

### CRM - Contacts (`/api/crm/contacts`)

#### GET /api/crm/contacts
List all contacts with filtering.

**Query Parameters:**
- `search` (string): Search by name, email, or phone
- `source` (string): Filter by source (web, import, api, form)
- `tag` (string): Filter by tag
- `page` (integer, default 1): Page number
- `limit` (integer, default 20, max 100): Items per page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "contact-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "source": "api",
      "tags": ["vip", "sales"],
      "lead_score": 75,
      "contact_type": "lead",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T14:20:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

#### POST /api/crm/contacts
Create a new contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "company": "Tech Inc",
  "source": "api",
  "tags": ["prospect"]
}
```

**Response:** `201 Created`

#### GET /api/crm/contacts/{id}
Get a specific contact.

**Response:** `200 OK`

#### PUT /api/crm/contacts/{id}
Update a contact.

**Request Body:** Same as POST (all fields optional)

**Response:** `200 OK`

#### DELETE /api/crm/contacts/{id}
Delete a contact (soft delete).

**Response:** `200 OK`

#### GET /api/crm/contacts/{id}/interactions
Get all interactions for a contact.

**Response:** `200 OK`

### CRM - Opportunities (`/api/crm/opportunities`)

#### GET /api/crm/opportunities
List all opportunities.

**Query Parameters:**
- `stage` (string): awareness, consideration, decision, won, lost
- `contact_id` (string): Filter by contact
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** `200 OK`

#### POST /api/crm/opportunities
Create a new opportunity.

**Request Body:**
```json
{
  "contact_id": "contact-uuid",
  "title": "Enterprise Package Sale",
  "value": 50000,
  "stage": "awareness",
  "expected_close_date": "2024-03-15"
}
```

**Response:** `201 Created`

#### PATCH /api/crm/opportunities/{id}/stage
Update opportunity stage.

**Request Body:**
```json
{
  "stage": "decision"
}
```

**Response:** `200 OK`

### Campaigns - Email (`/api/campaigns/email`)

#### GET /api/campaigns/email
List all email campaigns.

**Query Parameters:**
- `status` (string): draft, scheduled, sending, sent, paused
- `limit` (integer, default 50): Items per page
- `offset` (integer, default 0): Offset

**Response:** `200 OK`

#### POST /api/campaigns/email
Create a new email campaign.

**Request Body:**
```json
{
  "name": "Q1 Marketing Push",
  "subject": "Special Offer: 20% Off",
  "htmlBody": "<h1>Hello {{first_name}}</h1><p>...</p>",
  "textBody": "Hello {{first_name}}...",
  "fromEmail": "campaigns@voxmation.com",
  "fromName": "Voxmation Team",
  "recipients": [
    {
      "email": "user1@example.com",
      "name": "User One",
      "variables": {
        "first_name": "User",
        "company": "Acme"
      }
    }
  ],
  "sendAt": "2024-02-01T10:00:00Z"
}
```

**Response:** `201 Created`

#### GET /api/campaigns/email/{id}
Get campaign details.

**Response:** `200 OK`

#### PUT /api/campaigns/email/{id}
Update a campaign (draft only).

**Response:** `200 OK`

#### DELETE /api/campaigns/email/{id}
Delete a campaign (draft/paused only, admin only).

**Response:** `200 OK`

#### POST /api/campaigns/email/{id}/send
Send a campaign.

**Request Body:**
```json
{
  "immediate": true
}
```

**Response:** `200 OK`

#### POST /api/campaigns/email/{id}/pause
Pause a sending campaign.

**Response:** `200 OK`

#### GET /api/campaigns/email/{id}/stats
Get campaign statistics.

**Response:** `200 OK`
```json
{
  "stats": {
    "campaignId": "campaign-uuid",
    "campaignName": "Q1 Marketing Push",
    "status": "sent",
    "stats": {
      "total": 1000,
      "sent": 998,
      "failed": 2,
      "pending": 0
    },
    "detailedStats": {...},
    "recentQueued": [...],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

#### GET /api/campaigns/queue/status
Get email queue status (admin only).

**Response:** `200 OK`

### Automations (`/api/automations`)

#### GET /api/automations
List all automations.

**Query Parameters:**
- `status` (string): draft, active, paused, completed, archived
- `type` (string): drip, trigger, welcome, abandoned_cart, re_engagement, custom
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** `200 OK`

#### POST /api/automations
Create a new automation.

**Request Body:**
```json
{
  "name": "Welcome Series",
  "description": "Email series for new contacts",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {
    "source": "api"
  },
  "workflow": [
    {
      "id": "step-1",
      "type": "send_email",
      "action": {
        "emailTemplate": "template-uuid"
      },
      "order": 1
    },
    {
      "id": "step-2",
      "type": "delay",
      "action": {
        "delayMinutes": 1440
      },
      "order": 2
    },
    {
      "id": "step-3",
      "type": "send_email",
      "action": {
        "emailTemplate": "template-uuid-2"
      },
      "order": 3
    }
  ],
  "is_recurring": false,
  "max_contacts_per_day": 100,
  "tags": ["marketing"]
}
```

**Response:** `201 Created`

#### GET /api/automations/{id}
Get automation details.

**Response:** `200 OK`

#### PATCH /api/automations/{id}
Update automation.

**Request Body:** Partial update of any field

**Response:** `200 OK`

#### POST /api/automations/{id}/activate
Activate an automation.

**Response:** `200 OK`

#### POST /api/automations/{id}/pause
Pause an automation.

**Response:** `200 OK`

#### POST /api/automations/{id}/test
Test automation with a specific contact.

**Request Body:**
```json
{
  "contactId": "contact-uuid"
}
```

**Response:** `200 OK`

#### GET /api/automations/{id}/executions
Get execution history.

**Query Parameters:**
- `status` (string): Filter by status
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** `200 OK`

#### DELETE /api/automations/{id}
Delete automation (admin only).

**Response:** `200 OK`

### Calls (`/api/calls`)

#### GET /api/calls
List all calls.

**Query Parameters:**
- `status` (string): queued, ringing, in-progress, completed, failed, busy, no-answer
- `campaignId` (string): Filter by campaign
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** `200 OK`

#### POST /api/calls
Initiate a new call.

**Request Body:**
```json
{
  "to": "+14155552671",
  "from": "+13105551234",
  "campaignId": "campaign-uuid",
  "twimlUrl": "https://example.com/twiml",
  "record": true,
  "recordingChannels": "mono",
  "statusCallback": "https://example.com/webhook",
  "metadata": {
    "custom_key": "custom_value"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "call-uuid",
  "twilio_call_sid": "CA...",
  "to": "+14155552671",
  "from": "+13105551234",
  "status": "queued",
  "campaignId": "campaign-uuid",
  "createdAt": "2024-01-16T14:20:00Z"
}
```

#### GET /api/calls/{id}
Get call details.

**Response:** `200 OK`

#### GET /api/calls/{id}/recordings
Get call recordings.

**Response:** `200 OK`

### Billing (`/api/billing`)

#### GET /api/billing/plans
List all subscription plans.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "plan-uuid",
      "name": "Pro Plan",
      "slug": "pro",
      "description": "Professional plan for growing teams",
      "price": 9900,
      "currency": "USD",
      "features": [
        "Up to 10,000 contacts",
        "Unlimited campaigns",
        "Advanced automations"
      ],
      "limits": {
        "contacts": 10000,
        "campaigns": -1,
        "automations": -1,
        "api_calls_per_month": 100000
      },
      "is_active": true,
      "display_order": 2
    }
  ]
}
```

#### GET /api/billing/subscription
Get current subscription.

**Response:** `200 OK`

#### GET /api/billing/invoices
List invoices.

**Query Parameters:**
- `limit` (integer, default 10): Items per page
- `offset` (integer, default 0): Offset
- `status` (string): draft, open, paid, void, uncollectible
- `currency` (string): Filter by currency (USD, EUR, etc.)

**Response:** `200 OK`

#### GET /api/billing/usage
Get current usage metrics.

**Response:** `200 OK`
```json
{
  "usage": {
    "contacts": 2150,
    "campaigns": 42,
    "automations": 8,
    "api_calls": 45230
  },
  "limits": {
    "contacts": 10000,
    "campaigns": 100,
    "automations": 50,
    "api_calls": 100000
  },
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

### Admin (`/api/admin`)

#### GET /api/admin/accounts
List all accounts (admin only).

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `status` (string): active, inactive, all
- `type` (string): master, sub, all
- `search` (string): Search by name or email

**Response:** `200 OK`

#### GET /api/admin/accounts/{id}
Get account details (admin only).

**Response:** `200 OK`

## Webhooks

### Stripe Webhooks

**Endpoint:** `POST /api/webhooks/stripe`

Handle Stripe events:
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled
- `invoice.paid` - Invoice paid
- `invoice.payment_failed` - Payment failed

### Twilio Webhooks

**Endpoint:** `POST /api/webhooks/twilio`

Handle Twilio events:
- Call status updates (ringing, answered, completed)
- Recording ready notifications
- Message events

## Examples

### Example: Complete Campaign Workflow

```bash
# 1. Get authentication token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Response includes: token

# 2. Create campaign
curl -X POST http://localhost:3001/api/campaigns/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring Sale",
    "subject": "Save 30% this spring!",
    "htmlBody": "<h1>Save 30%</h1>",
    "fromEmail": "sales@company.com",
    "fromName": "Sales Team",
    "recipients": [
      {
        "email": "customer@example.com",
        "name": "John Doe"
      }
    ]
  }'

# Response includes: campaignId

# 3. Send campaign
curl -X POST http://localhost:3001/api/campaigns/email/CAMPAIGN_ID/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"immediate": true}'

# 4. Check stats
curl http://localhost:3001/api/campaigns/email/CAMPAIGN_ID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Create and Activate Automation

```bash
# Create automation
curl -X POST http://localhost:3001/api/automations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome New Contacts",
    "type": "welcome",
    "trigger_type": "contact_created",
    "trigger_conditions": {},
    "workflow": [
      {
        "id": "email-1",
        "type": "send_email",
        "action": {"emailTemplate": "welcome-template"},
        "order": 1
      }
    ]
  }'

# Response includes: id

# Activate automation
curl -X POST http://localhost:3001/api/automations/AUTOMATION_ID/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Make a Call

```bash
curl -X POST http://localhost:3001/api/calls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+14155552671",
    "from": "+13105551234",
    "record": true,
    "statusCallback": "https://example.com/call-status"
  }'
```

## Documentation Access

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **OpenAPI JSON**: `http://localhost:3001/api-docs/swagger.json`
- **OpenAPI YAML**: `http://localhost:3001/api-docs/swagger.yaml`

## Support

For API support, contact: `support@voxmation.com`

For documentation updates and feedback: `docs@voxmation.com`
