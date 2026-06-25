# Automations Engine Documentation

## Overview

The Automations Engine provides a powerful workflow automation system for marketing and CRM tasks. It allows you to create complex automated workflows that trigger specific actions based on contact behavior or scheduled events.

## Features

### Supported Trigger Types

- **contact_tag**: Triggers when a contact receives a specific tag
- **contact_property**: Triggers when a contact property changes (e.g., company, status)
- **contact_created**: Triggers when a new contact is created
- **contact_updated**: Triggers when a contact is updated
- **time_based**: Triggers at scheduled times
- **event_based**: Triggers on custom events

### Supported Actions

#### 1. Send Email (`send_email`)
Sends a personalized email to a contact using templates.

**Action Configuration:**
```json
{
  "type": "send_email",
  "action": {
    "emailTemplate": "template-uuid"
  }
}
```

**Supported Variables:**
- `{{first_name}}` - Contact's first name
- `{{full_name}}` - Contact's full name
- `{{email}}` - Contact's email
- `{{company}}` - Contact's company
- `{{phone}}` - Contact's phone number

#### 2. Send SMS (`send_sms`)
Sends a personalized SMS message to a contact.

**Action Configuration:**
```json
{
  "type": "send_sms",
  "action": {
    "smsMessage": "Hi {{first_name}}, your message here"
  }
}
```

**Supported Variables:**
- `{{first_name}}` - Contact's first name
- `{{full_name}}` - Contact's full name

#### 3. Create Opportunity (`create_opportunity`)
Creates a new sales opportunity in the CRM for a contact.

**Action Configuration:**
```json
{
  "type": "create_opportunity",
  "action": {
    "opportunityType": "Enterprise Sale"
  }
}
```

#### 4. Update Tag (`update_tag`)
Adds a tag to a contact's profile.

**Action Configuration:**
```json
{
  "type": "update_tag",
  "action": {
    "tag": "engaged_lead"
  }
}
```

#### 5. Delay (`delay`)
Pauses the workflow for a specified duration.

**Action Configuration:**
```json
{
  "type": "delay",
  "action": {
    "delayMinutes": 60
  }
}
```

#### 6. Conditional Branch (`condition`)
Evaluates a condition and only continues if true.

**Action Configuration:**
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

**Supported Operators:**
- `equals` - Exact match
- `contains` - String contains
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison

## API Endpoints

### 1. List Automations

**Endpoint:** `GET /api/automations`

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, paused, completed, archived)
- `type` (optional): Filter by type (drip, trigger, welcome, abandoned_cart, re_engagement, custom)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "automation-uuid",
      "account_id": "account-uuid",
      "name": "Welcome Email Series",
      "description": "Send welcome emails to new contacts",
      "type": "welcome",
      "trigger_type": "contact_created",
      "trigger_conditions": {},
      "workflow": [...],
      "status": "active",
      "is_recurring": false,
      "total_contacts": 150,
      "total_completed": 150,
      "total_failed": 0,
      "last_triggered_at": "2026-06-25T10:30:00Z",
      "tags": ["onboarding"],
      "created_at": "2026-06-20T00:00:00Z",
      "updated_at": "2026-06-25T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### 2. Create Automation

**Endpoint:** `POST /api/automations`

**Required Permissions:** `admin`, `marketing`

**Request Body:**
```json
{
  "name": "Welcome Email Series",
  "description": "Send welcome emails to new contacts",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {},
  "workflow": [
    {
      "id": "step-1",
      "type": "send_email",
      "action": {
        "emailTemplate": "welcome-email-uuid"
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
        "emailTemplate": "followup-email-uuid"
      },
      "order": 3
    }
  ],
  "is_recurring": false,
  "max_contacts_per_day": 1000,
  "tags": ["onboarding", "welcome"]
}
```

**Response:**
```json
{
  "id": "automation-uuid",
  "account_id": "account-uuid",
  "name": "Welcome Email Series",
  "description": "Send welcome emails to new contacts",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {},
  "workflow": [...],
  "status": "draft",
  "is_recurring": false,
  "max_contacts_per_day": 1000,
  "total_contacts": 0,
  "total_completed": 0,
  "total_failed": 0,
  "tags": ["onboarding", "welcome"],
  "created_at": "2026-06-25T10:30:00Z",
  "updated_at": "2026-06-25T10:30:00Z"
}
```

### 3. Get Automation Details

**Endpoint:** `GET /api/automations/:id`

**Response:**
```json
{
  "id": "automation-uuid",
  "account_id": "account-uuid",
  "name": "Welcome Email Series",
  "description": "Send welcome emails to new contacts",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {},
  "workflow": [...],
  "status": "active",
  "is_recurring": false,
  "total_contacts": 150,
  "total_completed": 150,
  "total_failed": 0,
  "last_triggered_at": "2026-06-25T10:30:00Z",
  "tags": ["onboarding"],
  "created_at": "2026-06-20T00:00:00Z",
  "updated_at": "2026-06-25T00:00:00Z"
}
```

### 4. Update Automation

**Endpoint:** `PATCH /api/automations/:id`

**Required Permissions:** `admin`, `marketing`

**Request Body:**
```json
{
  "name": "Updated Welcome Series",
  "description": "Updated description",
  "workflow": [...],
  "max_contacts_per_day": 500
}
```

**Note:** Use status-specific endpoints (activate/pause) to change status.

**Response:** Updated automation object

### 5. Activate Automation

**Endpoint:** `POST /api/automations/:id/activate`

**Required Permissions:** `admin`, `marketing`

**Response:**
```json
{
  "id": "automation-uuid",
  "status": "active",
  ...
}
```

### 6. Pause Automation

**Endpoint:** `POST /api/automations/:id/pause`

**Required Permissions:** `admin`, `marketing`

**Response:**
```json
{
  "id": "automation-uuid",
  "status": "paused",
  ...
}
```

### 7. Test Automation

**Endpoint:** `POST /api/automations/:id/test`

**Required Permissions:** `admin`, `marketing`

**Request Body:**
```json
{
  "contactId": "contact-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Automation test executed successfully",
  "execution": {
    "id": "execution-uuid",
    "account_id": "account-uuid",
    "automation_id": "automation-uuid",
    "contact_id": "contact-uuid",
    "status": "completed",
    "progress_step": 0,
    "triggered_at": "2026-06-25T10:30:00Z",
    "started_at": "2026-06-25T10:30:00Z",
    "completed_at": "2026-06-25T10:30:05Z",
    "workflow_data": {},
    "created_at": "2026-06-25T10:30:00Z"
  }
}
```

### 8. Get Automation Executions

**Endpoint:** `GET /api/automations/:id/executions`

**Query Parameters:**
- `status` (optional): Filter by execution status (pending, in_progress, completed, failed, skipped)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "execution-uuid",
      "account_id": "account-uuid",
      "automation_id": "automation-uuid",
      "contact_id": "contact-uuid",
      "status": "completed",
      "progress_step": 0,
      "triggered_at": "2026-06-25T10:30:00Z",
      "started_at": "2026-06-25T10:30:00Z",
      "completed_at": "2026-06-25T10:30:05Z",
      "workflow_data": {},
      "created_at": "2026-06-25T10:30:00Z",
      "updated_at": "2026-06-25T10:30:05Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### 9. Delete Automation

**Endpoint:** `DELETE /api/automations/:id`

**Required Permissions:** `admin`

**Response:**
```json
{
  "message": "Automation deleted successfully"
}
```

## Workflow Examples

### Example 1: Welcome Email Series

```json
{
  "name": "Welcome Email Series",
  "type": "welcome",
  "trigger_type": "contact_created",
  "trigger_conditions": {},
  "workflow": [
    {
      "id": "step-1",
      "type": "send_email",
      "action": {
        "emailTemplate": "welcome-uuid"
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
        "emailTemplate": "followup-uuid"
      },
      "order": 3
    },
    {
      "id": "step-4",
      "type": "delay",
      "action": {
        "delayMinutes": 1440
      },
      "order": 4
    },
    {
      "id": "step-5",
      "type": "send_email",
      "action": {
        "emailTemplate": "final-followup-uuid"
      },
      "order": 5
    }
  ]
}
```

### Example 2: Sales Qualification Workflow

```json
{
  "name": "Sales Qualification Workflow",
  "type": "trigger",
  "trigger_type": "contact_tag",
  "trigger_conditions": {
    "tag": "inquiry"
  },
  "workflow": [
    {
      "id": "step-1",
      "type": "send_email",
      "action": {
        "emailTemplate": "inquiry-response-uuid"
      },
      "order": 1
    },
    {
      "id": "step-2",
      "type": "create_opportunity",
      "action": {
        "opportunityType": "Sales Qualified Lead"
      },
      "order": 2
    },
    {
      "id": "step-3",
      "type": "update_tag",
      "action": {
        "tag": "sales_qualified"
      },
      "order": 3
    }
  ]
}
```

### Example 3: Re-engagement Campaign with Conditions

```json
{
  "name": "Re-engagement for Enterprise Accounts",
  "type": "re_engagement",
  "trigger_type": "contact_property",
  "trigger_conditions": {
    "property": "last_engagement",
    "days_inactive": 90
  },
  "workflow": [
    {
      "id": "step-1",
      "type": "condition",
      "action": {
        "condition": {
          "field": "company",
          "operator": "contains",
          "value": "Inc"
        }
      },
      "order": 1
    },
    {
      "id": "step-2",
      "type": "send_email",
      "action": {
        "emailTemplate": "reengagement-uuid"
      },
      "order": 2
    }
  ]
}
```

## Database Schema

### Automations Table

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  created_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('drip', 'trigger', 'welcome', 'abandoned_cart', 're_engagement', 'custom')),
  trigger_type TEXT CHECK (trigger_type IN ('contact_tag', 'contact_property', 'contact_created', 'contact_updated', 'time_based', 'event_based')),
  trigger_conditions JSONB,
  workflow JSONB,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  is_recurring BOOLEAN,
  max_contacts_per_day INTEGER,
  total_contacts INTEGER,
  total_completed INTEGER,
  total_failed INTEGER,
  last_triggered_at TIMESTAMP,
  tags TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Automation Executions Table

```sql
CREATE TABLE automation_executions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  automation_id UUID REFERENCES automations(id),
  contact_id UUID REFERENCES contacts(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  progress_step INTEGER,
  triggered_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  workflow_data JSONB,
  error_message TEXT,
  custom_fields JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Trigger Executor Service

The `TriggerExecutor` class handles the execution of automations:

### Key Methods

- **`executeAutomation(accountId, automationId, contactId)`**: Executes a complete automation workflow for a contact
- **`executeStep(accountId, contactId, contact, step)`**: Executes a single workflow step
- **`executeSendEmail()`**: Sends personalized email
- **`executeSendSMS()`**: Sends personalized SMS
- **`executeCreateOpportunity()`**: Creates CRM opportunity
- **`executeUpdateTag()`**: Updates contact tags
- **`executeDelay()`**: Pauses workflow
- **`executeCondition()`**: Evaluates conditions

## Best Practices

1. **Test Before Activation**: Always test automations with a single contact before activating
2. **Monitor Executions**: Check execution history for failures and errors
3. **Use Conditions**: Add conditions to prevent unnecessary actions
4. **Schedule Delays**: Use delays between emails to avoid overwhelming contacts
5. **Tag Organization**: Use tags to organize and track contacts through automations
6. **Template Management**: Keep email templates updated and test personalization
7. **Limits**: Set `max_contacts_per_day` to prevent overwhelming systems

## Limitations & Future Enhancements

### Current Limitations

- SMS integration requires external provider (Twilio, AWS SNS)
- Advanced conditions limited to single field evaluation
- No loop/repeat functionality within workflow
- Email templates use simple variable replacement

### Planned Enhancements

- SMS provider integration
- Complex conditional logic (AND/OR operators)
- Loop and repeat actions
- Workflow branching based on conditions
- Advanced contact segmentation in triggers
- Webhook integrations for external systems
- Webhook payload customization
- Schedule-based triggers (cron expressions)
- A/B testing within automations
- Dynamic delay based on contact behavior
