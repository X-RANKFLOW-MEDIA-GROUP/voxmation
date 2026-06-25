# Email Campaigns API Documentation

## Overview

The Email Campaigns API provides endpoints to create, manage, and track email campaigns with advanced features like:
- Personalization via variable substitution
- Batch processing with email queue
- Real-time campaign statistics
- Campaign status management
- Retry logic for failed emails

## Authentication

All endpoints require authentication via the `tenantMiddleware`. Some endpoints require specific roles:
- `admin`: Full access
- `marketing`: Can create, send, and view campaigns
- Other roles: Read-only access

## Base URL

```
/api/campaigns
```

## Endpoints

### 1. Create Email Campaign
Create a new email campaign in draft status.

**Endpoint:** `POST /api/campaigns/email`

**Required Role:** `admin`, `marketing`

**Request Body:**
```json
{
  "name": "Campaign Name",
  "subject": "Email Subject - {{productName}}",
  "htmlBody": "<html>...</html>",
  "textBody": "Plain text version (optional)",
  "fromEmail": "sender@example.com",
  "fromName": "Sender Name (optional)",
  "recipients": [
    {
      "email": "user@example.com",
      "name": "User Name",
      "variables": {
        "productName": "Product X",
        "recipientName": "User"
      }
    }
  ],
  "sendAt": "2024-01-20T10:00:00Z (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": "uuid",
  "campaign": {
    "id": "uuid",
    "accountId": "uuid",
    "name": "Campaign Name",
    "subject": "Email Subject",
    "status": "draft",
    "stats": {
      "total": 1,
      "sent": 0,
      "failed": 0,
      "pending": 1
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get All Campaigns
Retrieve campaigns for the current account.

**Endpoint:** `GET /api/campaigns/email`

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `scheduled`, `sending`, `sent`, `paused`)
- `limit` (optional, default: 50): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "name": "Campaign Name",
      "subject": "Email Subject",
      "status": "draft",
      "stats": {
        "total": 100,
        "sent": 0,
        "failed": 0,
        "pending": 100
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "offset": 0,
  "limit": 50
}
```

---

### 3. Get Specific Campaign
Retrieve details of a specific campaign.

**Endpoint:** `GET /api/campaigns/email/:id`

**Response:**
```json
{
  "campaign": {
    "id": "uuid",
    "accountId": "uuid",
    "name": "Campaign Name",
    "subject": "Email Subject",
    "htmlBody": "<html>...</html>",
    "textBody": "Plain text",
    "fromEmail": "sender@example.com",
    "fromName": "Sender Name",
    "recipients": [
      {
        "email": "user@example.com",
        "name": "User Name",
        "variables": { ... }
      }
    ],
    "status": "draft",
    "stats": {
      "total": 100,
      "sent": 0,
      "failed": 0,
      "pending": 100
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update Campaign
Update a draft campaign.

**Endpoint:** `PUT /api/campaigns/email/:id`

**Required Role:** `admin`, `marketing`

**Restrictions:** Only draft campaigns can be edited

**Request Body:**
```json
{
  "name": "Updated Name (optional)",
  "subject": "Updated Subject (optional)",
  "htmlBody": "<html>...</html> (optional)",
  "textBody": "Updated text (optional)",
  "fromEmail": "new@example.com (optional)",
  "fromName": "New Name (optional)",
  "recipients": [ ... ] (optional)
}
```

**Response:**
```json
{
  "success": true,
  "campaign": { ... }
}
```

---

### 5. Send Campaign
Send a campaign by enqueueing emails for processing.

**Endpoint:** `POST /api/campaigns/email/:id/send`

**Required Role:** `admin`, `marketing`

**Request Body:**
```json
{
  "immediate": true
}
```

**Parameters:**
- `immediate` (optional, default: true): Send immediately or schedule

**Response:**
```json
{
  "success": true,
  "message": "Campaign sent",
  "campaign": {
    "id": "uuid",
    "status": "sending",
    "stats": {
      "total": 100,
      "sent": 0,
      "failed": 0,
      "pending": 100
    }
  },
  "queuedEmails": 100
}
```

**Status Changes:**
- Draft → Sending (if immediate=true)
- Draft → Scheduled (if immediate=false)

---

### 6. Get Campaign Statistics
Get detailed statistics and queue status for a campaign.

**Endpoint:** `GET /api/campaigns/email/:id/stats`

**Response:**
```json
{
  "stats": {
    "campaignId": "uuid",
    "campaignName": "Campaign Name",
    "status": "sending",
    "stats": {
      "total": 100,
      "sent": 45,
      "failed": 5,
      "pending": 50
    },
    "detailedStats": {
      "sent": 45,
      "failed": 5,
      "pending": 50
    },
    "recentQueued": [
      {
        "id": "queue-item-uuid",
        "email": "user@example.com",
        "status": "sent",
        "sentAt": "2024-01-15T10:35:00Z",
        "error": null
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### 7. Pause Campaign
Pause a sending campaign.

**Endpoint:** `POST /api/campaigns/email/:id/pause`

**Required Role:** `admin`, `marketing`

**Restrictions:** Only sending campaigns can be paused

**Response:**
```json
{
  "success": true,
  "message": "Campaign paused",
  "campaign": {
    "id": "uuid",
    "status": "paused",
    "stats": { ... }
  }
}
```

---

### 8. Delete Campaign
Delete a draft or paused campaign.

**Endpoint:** `DELETE /api/campaigns/email/:id`

**Required Role:** `admin`

**Restrictions:** Cannot delete campaigns with status: sending, sent

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted"
}
```

---

### 9. Get Queue Status
Get overall email queue statistics (admin only).

**Endpoint:** `GET /api/campaigns/queue/status`

**Required Role:** `admin`

**Response:**
```json
{
  "status": {
    "totalQueued": 250,
    "totalSent": 180,
    "totalFailed": 20,
    "totalPending": 50,
    "campaigns": [
      {
        "id": "uuid",
        "name": "Campaign Name",
        "status": "sending",
        "stats": {
          "total": 100,
          "sent": 45,
          "failed": 5,
          "pending": 50
        }
      }
    ]
  }
}
```

---

## Campaign Status Workflow

```
Draft → Scheduled/Sending → (Paused) → Sent
  ↓
Draft can be: Updated, Deleted, Sent
Scheduled can be: Sent
Sending can be: Paused, Resumed
Paused can be: Resumed, Deleted
Sent: Final status
```

---

## Variable Substitution

Variables in the subject, HTML, and text body are replaced with recipient-specific values.

### Syntax
Variables are enclosed in double curly braces: `{{variableName}}`

### Example
```json
{
  "subject": "Hello {{recipientName}}, check out {{productName}}",
  "recipients": [
    {
      "email": "john@example.com",
      "name": "John",
      "variables": {
        "recipientName": "John",
        "productName": "ProductX"
      }
    }
  ]
}
```

Result: `Hello John, check out ProductX`

---

## Email Queue System

The email queue manages batch processing of emails with:
- Asynchronous email sending
- Automatic retry logic (up to 3 attempts)
- Error tracking and logging
- Per-recipient status tracking

### Queue States

Each queued email can have the following states:

| Status | Description |
|--------|-------------|
| `pending` | Waiting to be sent |
| `sent` | Successfully delivered |
| `failed` | Delivery failed (after retries) |

---

## Error Handling

### Common Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Missing required fields | Check request body format |
| 400 | Campaign cannot be sent | Invalid campaign status |
| 403 | Unauthorized | User lacks required role |
| 404 | Campaign not found | Campaign ID doesn't exist |
| 500 | Failed to send campaign | Server error in email processing |

### Example Error Response
```json
{
  "error": "Failed to create campaign: Missing required fields"
}
```

---

## Integration Examples

### Create and Send Campaign
```javascript
// 1. Create campaign
const campaign = await fetch('/api/campaigns/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Campaign',
    subject: 'Hello {{name}}',
    htmlBody: '<p>Hello {{name}}</p>',
    fromEmail: 'sender@example.com',
    recipients: [
      {
        email: 'user@example.com',
        name: 'User',
        variables: { name: 'John' }
      }
    ]
  })
});

// 2. Send campaign
const campaignData = await campaign.json();
const sent = await fetch(`/api/campaigns/email/${campaignData.campaignId}/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ immediate: true })
});

// 3. Monitor stats
const stats = await fetch(`/api/campaigns/email/${campaignData.campaignId}/stats`);
const statsData = await stats.json();
console.log(statsData.stats);
```

### Monitor Campaign Progress
```javascript
async function monitorCampaign(campaignId, interval = 5000) {
  const poll = setInterval(async () => {
    const response = await fetch(`/api/campaigns/email/${campaignId}/stats`);
    const data = await response.json();
    
    console.log(`Sent: ${data.stats.stats.sent}`);
    console.log(`Failed: ${data.stats.stats.failed}`);
    console.log(`Pending: ${data.stats.stats.pending}`);
    
    if (data.stats.stats.pending === 0) {
      clearInterval(poll);
      console.log('Campaign complete!');
    }
  }, interval);
}
```

---

## Best Practices

1. **Variable Names**: Use descriptive variable names (e.g., `recipientName`, `productName`)
2. **Testing**: Create a draft campaign and send to yourself first
3. **Large Recipients**: Use pagination when fetching campaigns
4. **Monitoring**: Check stats endpoint periodically to track delivery
5. **Error Handling**: Implement retry logic for failed requests
6. **Personalization**: Always include `{{recipientName}}` for better engagement
7. **Mobile Optimization**: Ensure HTML templates are responsive
8. **Unsubscribe**: Include unsubscribe link in templates (legal requirement)

---

## Rate Limits

- Campaign creation: 100 campaigns per hour
- Email queue processing: Limited by email service provider
- API requests: 1000 requests per minute per account

---

## Data Retention

- Campaign metadata: Kept indefinitely
- Queue items: Cleared after 30 days
- Statistics: Aggregated after campaign completion

---

## Future Enhancements

- [ ] Email template builder UI
- [ ] A/B testing support
- [ ] Deliverability analytics
- [ ] Webhook notifications
- [ ] WYSIWYG editor integration
- [ ] Subscriber list management
- [ ] Email scheduling with cron
- [ ] Bounce handling
- [ ] Spam score checking
