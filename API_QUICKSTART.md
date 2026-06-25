# Voxmation API Quick Start Guide

Get started with the Voxmation API in minutes.

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Authentication](#authentication)
3. [Your First Request](#your-first-request)
4. [Common Use Cases](#common-use-cases)
5. [Testing & Debugging](#testing--debugging)

## Before You Start

### Prerequisites

- API credentials (email and password)
- HTTP client (cURL, Postman, or any programming language)
- Basic understanding of REST APIs and JSON

### Getting API Documentation

The interactive API documentation is available at:

```
http://localhost:3001/api-docs
```

You can also download the OpenAPI specification:

```
GET /api-docs/swagger.json
GET /api-docs/swagger.yaml
```

## Authentication

### Step 1: Obtain an Authentication Token

The first step is to get a JWT token from the login endpoint.

**Using cURL:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Using Python:**

```python
import requests
import json

url = "http://localhost:3001/api/auth/login"
payload = {
    "email": "your-email@example.com",
    "password": "your-password"
}

response = requests.post(url, json=payload)
data = response.json()

if data['success']:
    token = data['token']
    print(f"Token: {token}")
else:
    print(f"Error: {data['message']}")
```

**Using JavaScript:**

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});

const data = await response.json();
if (data.success) {
  const token = data.token;
  console.log('Token:', token);
}
```

### Step 2: Use the Token in Requests

Include the token in the `Authorization` header for all subsequent requests:

```bash
curl -X GET http://localhost:3001/api/crm/contacts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Your First Request

### Example: List Your Contacts

**cURL:**

```bash
curl -X GET http://localhost:3001/api/crm/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Python:**

```python
import requests

headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

response = requests.get(
    "http://localhost:3001/api/crm/contacts",
    headers=headers
)

contacts = response.json()
for contact in contacts['data']:
    print(f"- {contact['name']} ({contact['email']})")
```

**JavaScript:**

```javascript
const response = await fetch('http://localhost:3001/api/crm/contacts', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
data.data.forEach(contact => {
  console.log(`- ${contact.name} (${contact.email})`);
});
```

## Common Use Cases

### Use Case 1: Create a Contact

Create a new contact in your CRM.

**cURL:**

```bash
curl -X POST http://localhost:3001/api/crm/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+14155552671",
    "company": "Tech Corp",
    "tags": ["sales", "vip"]
  }'
```

**Python:**

```python
import requests

headers = {"Authorization": f"Bearer {token}"}
payload = {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+14155552671",
    "company": "Tech Corp",
    "tags": ["sales", "vip"]
}

response = requests.post(
    "http://localhost:3001/api/crm/contacts",
    headers=headers,
    json=payload
)

contact = response.json()
print(f"Created contact: {contact['id']}")
```

### Use Case 2: Create and Send an Email Campaign

Create a marketing campaign and send it to multiple recipients.

**Step 1: Create Campaign**

```bash
curl -X POST http://localhost:3001/api/campaigns/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring Sale Campaign",
    "subject": "Special Offer: 30% Off Everything!",
    "htmlBody": "<h1>Spring Sale</h1><p>Get 30% off this spring!</p>",
    "textBody": "Spring Sale - Get 30% off this spring!",
    "fromEmail": "marketing@company.com",
    "fromName": "Marketing Team",
    "recipients": [
      {
        "email": "customer1@example.com",
        "name": "Customer One",
        "variables": {"first_name": "Customer"}
      },
      {
        "email": "customer2@example.com",
        "name": "Customer Two",
        "variables": {"first_name": "Customer"}
      }
    ]
  }'
```

Response will include `campaignId`.

**Step 2: Send Campaign**

```bash
curl -X POST http://localhost:3001/api/campaigns/email/{campaignId}/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"immediate": true}'
```

**Step 3: Check Stats**

```bash
curl -X GET http://localhost:3001/api/campaigns/email/{campaignId}/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Complete Python Example:**

```python
import requests
import json
import time

token = "YOUR_TOKEN"
headers = {"Authorization": f"Bearer {token}"}

# Create campaign
campaign_data = {
    "name": "Spring Sale",
    "subject": "Save 30%!",
    "htmlBody": "<h1>Spring Sale</h1>",
    "textBody": "Spring Sale",
    "fromEmail": "marketing@company.com",
    "fromName": "Marketing",
    "recipients": [
        {
            "email": "customer@example.com",
            "name": "Customer"
        }
    ]
}

response = requests.post(
    "http://localhost:3001/api/campaigns/email",
    headers=headers,
    json=campaign_data
)
campaign = response.json()
campaign_id = campaign['campaignId']
print(f"Created campaign: {campaign_id}")

# Send campaign
send_response = requests.post(
    f"http://localhost:3001/api/campaigns/email/{campaign_id}/send",
    headers=headers,
    json={"immediate": True}
)
print(f"Campaign sent: {send_response.json()['message']}")

# Check stats
time.sleep(2)
stats_response = requests.get(
    f"http://localhost:3001/api/campaigns/email/{campaign_id}/stats",
    headers=headers
)
stats = stats_response.json()['stats']
print(f"Stats: {stats['stats']['sent']} sent, {stats['stats']['failed']} failed")
```

### Use Case 3: Create an Automation

Set up an automated workflow for new contacts.

```bash
curl -X POST http://localhost:3001/api/automations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Welcome New Contacts",
    "description": "Auto-welcome and follow-up for new contacts",
    "type": "welcome",
    "trigger_type": "contact_created",
    "trigger_conditions": {},
    "workflow": [
      {
        "id": "step-1",
        "type": "send_email",
        "action": {"emailTemplate": "welcome"},
        "order": 1
      },
      {
        "id": "step-2",
        "type": "delay",
        "action": {"delayMinutes": 1440},
        "order": 2
      },
      {
        "id": "step-3",
        "type": "send_email",
        "action": {"emailTemplate": "follow-up"},
        "order": 3
      },
      {
        "id": "step-4",
        "type": "create_opportunity",
        "action": {"opportunityType": "Sales Qualified Lead"},
        "order": 4
      }
    ],
    "is_recurring": true,
    "max_contacts_per_day": 100
  }'
```

**Activate the automation:**

```bash
curl -X POST http://localhost:3001/api/automations/{automationId}/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 4: Make a Phone Call

Initiate an outbound call using Twilio integration.

```bash
curl -X POST http://localhost:3001/api/calls \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+14155552671",
    "from": "+13105551234",
    "record": true,
    "statusCallback": "https://your-domain.com/call-webhook"
  }'
```

### Use Case 5: Check Billing Information

Get subscription and usage information.

**Get Current Plan:**

```bash
curl -X GET http://localhost:3001/api/billing/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Usage Metrics:**

```bash
curl -X GET http://localhost:3001/api/billing/usage \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Invoices:**

```bash
curl -X GET "http://localhost:3001/api/billing/invoices?limit=10&offset=0&status=paid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing & Debugging

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the OpenAPI spec:
   - Click "Import"
   - Select "Link" tab
   - Enter: `http://localhost:3001/api-docs/swagger.json`
3. Set up environment variables:
   - Create a variable `token` with your JWT token
   - Use `{{token}}` in Authorization header

### Using cURL with Variables

```bash
# Set token variable
TOKEN="your-token-here"

# List contacts
curl -X GET http://localhost:3001/api/crm/contacts \
  -H "Authorization: Bearer $TOKEN"
```

### Debugging Tips

1. **Check Response Status:**
   ```bash
   curl -i http://localhost:3001/api/crm/contacts \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Pretty Print JSON:**
   ```bash
   curl http://localhost:3001/api/crm/contacts \
     -H "Authorization: Bearer $TOKEN" | jq '.'
   ```

3. **Verbose Output:**
   ```bash
   curl -v http://localhost:3001/api/crm/contacts \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Check Rate Limits:**
   ```bash
   curl -i http://localhost:3001/api/crm/contacts \
     -H "Authorization: Bearer $TOKEN"
   ```
   Look for `X-RateLimit-*` headers in response.

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token is valid and not expired. Use `/api/auth/refresh` to get new token. |
| 403 Forbidden | Verify you have required role (admin, marketing, etc.) for the operation. |
| 404 Not Found | Check resource ID is correct and resource exists. |
| 429 Too Many Requests | Reduce request frequency or upgrade plan for higher limits. |
| 500 Internal Server Error | Check server logs and try again. Contact support if persistent. |

## Next Steps

- Read the [full API documentation](./API_DOCUMENTATION.md)
- Explore the [interactive API documentation](http://localhost:3001/api-docs)
- Check out [API examples](./API_DOCUMENTATION.md#examples)
- Join our community for support

## Support

For help or questions:
- Email: `support@voxmation.com`
- Documentation: `http://localhost:3001/api-docs`
- GitHub Issues: [Report a bug](https://github.com/voxmation/api/issues)
