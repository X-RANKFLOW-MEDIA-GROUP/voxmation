# Automations Engine - Quick Start Guide

## Overview

The Automations Engine allows you to create powerful marketing workflows that automatically execute actions based on contact behavior or scheduled triggers. Actions include sending emails, SMS, creating opportunities, and updating tags.

## Getting Started in 5 Minutes

### Step 1: Create Email Templates

First, you'll need email templates to use in your automations. Create templates via the CRM interface or API:

```bash
curl -X POST http://localhost:3001/api/campaigns/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Welcome Email",
    "subject": "Welcome {{first_name}}!",
    "body": "<h1>Welcome to Voxmation</h1><p>Hi {{first_name}}, thanks for joining!</p>",
    "category": "welcome"
  }'
```

### Step 2: Create Your First Automation

Create a simple welcome automation that sends an email to new contacts:

```bash
curl -X POST http://localhost:3001/api/automations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Welcome New Contacts",
    "description": "Automatically welcome new contacts with an email",
    "type": "welcome",
    "trigger_type": "contact_created",
    "trigger_conditions": {},
    "workflow": [
      {
        "id": "step-1",
        "type": "send_email",
        "action": {
          "emailTemplate": "YOUR_TEMPLATE_UUID_HERE"
        },
        "order": 1
      }
    ],
    "is_recurring": false,
    "tags": ["onboarding"]
  }'
```

Response:
```json
{
  "id": "automation-uuid",
  "status": "draft",
  "name": "Welcome New Contacts",
  ...
}
```

### Step 3: Test the Automation

Before activating, test it with a real contact:

```bash
curl -X POST http://localhost:3001/api/automations/automation-uuid/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contactId": "contact-uuid"
  }'
```

### Step 4: Activate the Automation

Once tested successfully, activate it:

```bash
curl -X POST http://localhost:3001/api/automations/automation-uuid/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Monitor Executions

Check the execution history:

```bash
curl "http://localhost:3001/api/automations/automation-uuid/executions?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Automation Patterns

### Pattern 1: Welcome Series (3 Emails Over 2 Days)

```json
{
  "name": "Welcome Series",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {},
  "workflow": [
    {
      "id": "email-1",
      "type": "send_email",
      "action": { "emailTemplate": "welcome-1-uuid" },
      "order": 1
    },
    {
      "id": "delay-1",
      "type": "delay",
      "action": { "delayMinutes": 1440 },
      "order": 2
    },
    {
      "id": "email-2",
      "type": "send_email",
      "action": { "emailTemplate": "welcome-2-uuid" },
      "order": 3
    },
    {
      "id": "delay-2",
      "type": "delay",
      "action": { "delayMinutes": 1440 },
      "order": 4
    },
    {
      "id": "email-3",
      "type": "send_email",
      "action": { "emailTemplate": "welcome-3-uuid" },
      "order": 5
    }
  ]
}
```

### Pattern 2: Sales Qualification Workflow

```json
{
  "name": "Sales Qualification",
  "type": "trigger",
  "trigger_type": "contact_tag",
  "trigger_conditions": { "tag": "inquiry" },
  "workflow": [
    {
      "id": "send-response",
      "type": "send_email",
      "action": { "emailTemplate": "inquiry-response-uuid" },
      "order": 1
    },
    {
      "id": "create-opportunity",
      "type": "create_opportunity",
      "action": { "opportunityType": "Sales Inquiry" },
      "order": 2
    },
    {
      "id": "tag-qualified",
      "type": "update_tag",
      "action": { "tag": "sales_qualified" },
      "order": 3
    }
  ]
}
```

### Pattern 3: Conditional Email Based on Company Size

```json
{
  "name": "Segmented Campaign",
  "type": "trigger",
  "trigger_type": "contact_tag",
  "trigger_conditions": { "tag": "target_contact" },
  "workflow": [
    {
      "id": "check-enterprise",
      "type": "condition",
      "action": {
        "condition": {
          "field": "company",
          "operator": "contains",
          "value": "Corp"
        }
      },
      "order": 1
    },
    {
      "id": "enterprise-email",
      "type": "send_email",
      "action": { "emailTemplate": "enterprise-offer-uuid" },
      "order": 2
    }
  ]
}
```

## Available Actions

### 1. Send Email

```json
{
  "type": "send_email",
  "action": {
    "emailTemplate": "template-uuid"
  }
}
```

**Personalization Variables:**
- `{{first_name}}` - Contact's first name
- `{{full_name}}` - Contact's full name
- `{{email}}` - Contact's email address
- `{{company}}` - Contact's company name
- `{{phone}}` - Contact's phone number

### 2. Send SMS

```json
{
  "type": "send_sms",
  "action": {
    "smsMessage": "Hi {{first_name}}, check your email!"
  }
}
```

### 3. Create Opportunity

```json
{
  "type": "create_opportunity",
  "action": {
    "opportunityType": "Sales Inquiry"
  }
}
```

### 4. Update Tag

```json
{
  "type": "update_tag",
  "action": {
    "tag": "engaged_contact"
  }
}
```

### 5. Delay

```json
{
  "type": "delay",
  "action": {
    "delayMinutes": 1440
  }
}
```

Delays the workflow for specified minutes:
- 60 = 1 hour
- 1440 = 1 day
- 10080 = 1 week

### 6. Conditional Branch

```json
{
  "type": "condition",
  "action": {
    "condition": {
      "field": "company",
      "operator": "equals",
      "value": "Acme Corp"
    }
  }
}
```

**Operators:**
- `equals` - Exact match
- `contains` - String contains
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automations` | GET | List all automations |
| `/api/automations` | POST | Create new automation |
| `/api/automations/:id` | GET | Get automation details |
| `/api/automations/:id` | PATCH | Update automation |
| `/api/automations/:id/activate` | POST | Activate automation |
| `/api/automations/:id/pause` | POST | Pause automation |
| `/api/automations/:id/test` | POST | Test with a contact |
| `/api/automations/:id/executions` | GET | View execution history |
| `/api/automations/:id` | DELETE | Delete automation |

## Workflow Building Tips

1. **Order Matters**: Each step has an `order` field (1, 2, 3, etc.). Steps execute in order.

2. **Use UUIDs**: Get template and contact UUIDs from their API responses.

3. **Test First**: Always test with one contact before activating to avoid sending unintended emails.

4. **Monitor Executions**: Check the executions endpoint to troubleshoot failed workflows.

5. **Use Tags**: Update tags to track workflow progress and segment contacts.

6. **Smart Delays**: Insert delays between emails to feel more personal.

7. **Conditions**: Use conditions to prevent unnecessary actions based on contact properties.

## Example: Multi-step Sales Funnel

Here's a complete example that:
1. Sends initial inquiry response
2. Waits 2 days
3. Sends follow-up email
4. Creates sales opportunity
5. Tags contact as "sales_qualified"

```bash
curl -X POST http://localhost:3001/api/automations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Sales Funnel - Inquiry to Qualified",
    "type": "trigger",
    "trigger_type": "contact_tag",
    "trigger_conditions": {"tag": "inquiry"},
    "workflow": [
      {
        "id": "step-1",
        "type": "send_email",
        "action": {"emailTemplate": "inquiry-response-uuid"},
        "order": 1
      },
      {
        "id": "step-2",
        "type": "delay",
        "action": {"delayMinutes": 2880},
        "order": 2
      },
      {
        "id": "step-3",
        "type": "send_email",
        "action": {"emailTemplate": "followup-email-uuid"},
        "order": 3
      },
      {
        "id": "step-4",
        "type": "create_opportunity",
        "action": {"opportunityType": "Sales Qualified Lead"},
        "order": 4
      },
      {
        "id": "step-5",
        "type": "update_tag",
        "action": {"tag": "sales_qualified"},
        "order": 5
      }
    ],
    "is_recurring": false,
    "tags": ["sales", "funnel"]
  }'
```

## Troubleshooting

**Automation not triggering:**
- Check automation status is "active"
- Verify trigger_conditions match contact data
- Test manually with `/test` endpoint

**Email not sending:**
- Verify email template UUID is correct
- Check contact email address is valid
- Review email_logs table for errors

**Workflow stops unexpectedly:**
- Check automation_executions table for error_message
- Ensure contact_id exists in contacts table
- Verify email templates are not deleted

## Next Steps

- Read [AUTOMATIONS_ENGINE.md](./server/routes/AUTOMATIONS_ENGINE.md) for complete documentation
- Check [automations.examples.ts](./server/routes/automations.examples.ts) for more patterns
- Build your first sales automation!

## Support

For detailed API documentation, see `server/routes/AUTOMATIONS_ENGINE.md`
For code examples, see `server/routes/automations.examples.ts`
