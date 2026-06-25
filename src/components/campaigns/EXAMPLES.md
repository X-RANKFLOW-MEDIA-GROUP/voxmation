# Automation Workflow Builder - Advanced Examples

## Real-World Workflow Examples

This guide provides practical examples of complete workflows you can create with the Automation Workflow Builder.

## Sales Workflows

### 1. Inbound Lead Nurture Sequence

**Goal**: Automatically nurture inbound leads with a series of emails and follow-ups.

```typescript
const inboundLeadWorkflow: Workflow = {
  id: "workflow-inbound-lead",
  name: "Inbound Lead Nurture",
  description: "Automatically nurture new inbound leads with welcome email and follow-ups",
  trigger: {
    id: "trigger-1",
    type: "new_contact",
    config: {
      source: "web_form"
    },
    description: "New Contact from Web Form"
  },
  actions: [
    {
      id: "action-1",
      type: "send_email",
      config: {
        templateId: "welcome-email",
        recipient: "contact_email"
      },
      description: "Send Welcome Email"
    },
    {
      id: "action-2",
      type: "update_tag",
      config: {
        tagName: "inbound-lead",
        action: "add"
      },
      description: "Tag as Inbound Lead"
    },
    {
      id: "action-3",
      type: "update_tag",
      config: {
        tagName: "nurture-sequence",
        action: "add"
      },
      description: "Add to Nurture Sequence"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    triggered: 145,
    completed: 142,
    failed: 3
  }
};
```

### 2. Qualified Lead → Opportunity Creation

**Goal**: Automatically create sales opportunities when leads become qualified.

```typescript
const qualifiedLeadWorkflow: Workflow = {
  id: "workflow-qualified-opp",
  name: "Qualified Lead → Opportunity",
  description: "Create opportunities when leads reach qualified stage",
  trigger: {
    id: "trigger-1",
    type: "stage_change",
    config: {
      fromStage: "prospect",
      toStage: "qualified"
    },
    description: "Stage Changed to Qualified"
  },
  actions: [
    {
      id: "action-1",
      type: "create_opportunity",
      config: {
        opportunityName: "Sales Opportunity - {contact_name}",
        stage: "qualified",
        value: 25000
      },
      description: "Create $25k Opportunity"
    },
    {
      id: "action-2",
      type: "send_email",
      config: {
        templateId: "qualified-email",
        recipient: "contact_email"
      },
      description: "Send Qualified Badge Email"
    },
    {
      id: "action-3",
      type: "send_email",
      config: {
        templateId: "sales-handoff",
        recipient: "owner_email"
      },
      description: "Notify Sales Team"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    triggered: 87,
    completed: 85,
    failed: 2
  }
};
```

### 3. VIP Contact Alert

**Goal**: Immediately notify sales team when a contact is tagged as VIP.

```typescript
const vipAlertWorkflow: Workflow = {
  id: "workflow-vip-alert",
  name: "VIP Contact Alert",
  description: "Alert sales team immediately when a contact is marked as VIP",
  trigger: {
    id: "trigger-1",
    type: "tag_added",
    config: {
      tagName: "VIP"
    },
    description: "VIP Tag Added"
  },
  actions: [
    {
      id: "action-1",
      type: "send_sms",
      config: {
        phoneField: "owner_mobile",
        messageTemplate: "NEW VIP CONTACT: {contact_name} from {company_name} has been added to your list!"
      },
      description: "SMS Alert to Sales Rep"
    },
    {
      id: "action-2",
      type: "send_email",
      config: {
        templateId: "vip-handoff",
        recipient: "owner_email"
      },
      description: "Email VIP Details"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    triggered: 23,
    completed: 23,
    failed: 0
  }
};
```

## Customer Success Workflows

### 4. New Customer Onboarding

**Goal**: Provide structured onboarding for new customers with welcome materials and scheduled follow-ups.

```typescript
const customerOnboardingWorkflow: Workflow = {
  id: "workflow-customer-onboarding",
  name: "New Customer Onboarding",
  description: "Welcome new customers and guide them through onboarding process",
  trigger: {
    id: "trigger-1",
    type: "tag_added",
    config: {
      tagName: "new-customer"
    },
    description: "New Customer Tag"
  },
  actions: [
    {
      id: "action-1",
      type: "send_email",
      config: {
        templateId: "welcome-new-customer",
        recipient: "contact_email"
      },
      description: "Send Welcome Package"
    },
    {
      id: "action-2",
      type: "update_tag",
      config: {
        tagName: "onboarding-in-progress",
        action: "add"
      },
      description: "Mark as Onboarding"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 5. Customer Check-in (7-Day Follow-up)

**Goal**: Check in with customers 7 days after they join.

```typescript
const customerCheckInWorkflow: Workflow = {
  id: "workflow-7day-checkin",
  name: "7-Day Customer Check-in",
  description: "Proactive check-in with new customers after 1 week",
  trigger: {
    id: "trigger-1",
    type: "time_based",
    config: {
      delayDays: 7,
      delayHours: 0
    },
    description: "7 Days After Customer Signup"
  },
  actions: [
    {
      id: "action-1",
      type: "send_email",
      config: {
        templateId: "week-1-checkin",
        recipient: "contact_email"
      },
      description: "Send Check-in Email"
    },
    {
      id: "action-2",
      type: "send_sms",
      config: {
        phoneField: "phone_number",
        messageTemplate: "Hi {first_name}! How are you getting along with Voxmation? Reply YES if you'd like a demo or have questions."
      },
      description: "Send SMS Check-in"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## Marketing Workflows

### 6. Webinar Registration Confirmation

**Goal**: Confirm webinar registrations and send preparation materials.

```typescript
const webinarRegistrationWorkflow: Workflow = {
  id: "workflow-webinar-reg",
  name: "Webinar Registration Confirmation",
  description: "Send confirmation and prep materials when contact registers for webinar",
  trigger: {
    id: "trigger-1",
    type: "tag_added",
    config: {
      tagName: "webinar-2024-registration"
    },
    description: "Webinar Registration"
  },
  actions: [
    {
      id: "action-1",
      type: "send_email",
      config: {
        templateId: "webinar-confirmation",
        recipient: "contact_email"
      },
      description: "Send Confirmation Email"
    },
    {
      id: "action-2",
      type: "update_tag",
      config: {
        tagName: "webinar-attendee",
        action: "add"
      },
      description: "Add to Attendees List"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 7. Re-engagement Campaign for Inactive Contacts

**Goal**: Re-engage inactive contacts with special offer.

```typescript
const reengagementWorkflow: Workflow = {
  id: "workflow-reengagement",
  name: "Inactive Contact Re-engagement",
  description: "Send special offer to contacts who haven't engaged in 60 days",
  trigger: {
    id: "trigger-1",
    type: "tag_added",
    config: {
      tagName: "inactive-60-days"
    },
    description: "Inactive for 60 Days"
  },
  actions: [
    {
      id: "action-1",
      type: "send_email",
      config: {
        templateId: "reengagement-offer",
        recipient: "contact_email"
      },
      description: "Send Special Offer"
    },
    {
      id: "action-2",
      type: "send_sms",
      config: {
        phoneField: "phone_number",
        messageTemplate: "We miss you! Get 20% off your next purchase: {promo_code}"
      },
      description: "Send Promo Code SMS"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## Multi-Step Workflow Example

### 8. Complete Lead-to-Customer Journey

A complex workflow combining multiple triggers and sequential actions:

```typescript
const advancedMultiStepWorkflow: Workflow = {
  id: "workflow-advanced-multi-step",
  name: "Complete Lead-to-Customer Journey",
  description: "End-to-end workflow from lead generation to customer success",
  trigger: {
    id: "trigger-primary",
    type: "new_contact",
    config: {
      source: "web_form"
    },
    description: "New Contact from Website Form"
  },
  actions: [
    // Step 1: Welcome & Qualification (Immediate)
    {
      id: "action-welcome",
      type: "send_email",
      config: {
        templateId: "welcome-series-part-1",
        recipient: "contact_email"
      },
      description: "Part 1: Welcome Email"
    },
    {
      id: "action-tag-lead",
      type: "update_tag",
      config: {
        tagName: "lead-new",
        action: "add"
      },
      description: "Tag as New Lead"
    },
    // Step 2: 2-Day Follow-up
    // (This would typically be a separate time-based workflow)
    {
      id: "action-followup",
      type: "send_email",
      config: {
        templateId: "welcome-series-part-2",
        recipient: "contact_email"
      },
      description: "Part 2: Follow-up Email (after 2 days)"
    },
    // Step 3: Qualification Check
    {
      id: "action-qualify-tag",
      type: "update_tag",
      config: {
        tagName: "qualification-pending",
        action: "add"
      },
      description: "Flag for Sales Review"
    }
  ],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    triggered: 512,
    completed: 498,
    failed: 14
  }
};
```

## Advanced Configuration Examples

### Configuration Patterns

#### Pattern 1: Dynamic Content

```typescript
// Use template variables for personalization
const emailConfig = {
  templateId: "welcome-email",
  recipient: "contact_email",
  // Variables automatically filled:
  // {contact_name}, {company_name}, {email}, {phone}
};
```

#### Pattern 2: Conditional Logic via Tags

```typescript
// Use tags to represent conditions
// Trigger: Tag "qualified" → Create Opportunity
const stageChangeAction = {
  type: "create_opportunity",
  config: {
    opportunityName: "{contact_name} - {company_name}",
    stage: "qualified",
    value: 50000
  }
};
```

#### Pattern 3: Multi-Channel Communication

```typescript
// Combine email and SMS for max reach
const actions = [
  {
    type: "send_email",
    config: {
      templateId: "important-update",
      recipient: "contact_email"
    }
  },
  {
    type: "send_sms",
    config: {
      phoneField: "phone_number",
      messageTemplate: "Important update sent to your email. Check it out!"
    }
  }
];
```

## Integration Patterns

### Pattern 1: Webhook Actions (Future)

```typescript
// For future custom actions
{
  type: "webhook",
  config: {
    url: "https://api.example.com/webhook",
    method: "POST",
    headers: { "Authorization": "Bearer token" },
    payload: {
      contactId: "{contact_id}",
      action: "qualified"
    }
  }
}
```

### Pattern 2: CRM Sync

```typescript
// Automatically sync with external CRM
{
  type: "sync_to_crm",
  config: {
    crmType: "salesforce",
    objectType: "Lead",
    fieldMapping: {
      "contact_name": "Name",
      "email": "Email",
      "company_name": "Company"
    }
  }
}
```

## Testing Workflows

### Test a Workflow Before Publishing

```typescript
import automationClient from '@/services/automationClient';

async function testWorkflowBeforePublishing() {
  const workflow = {
    name: "Test Workflow",
    trigger: { /* ... */ },
    actions: [ /* ... */ ]
  };

  // Test with sample contact
  const result = await automationClient.testWorkflow(
    workflow,
    "sample-contact-123"
  );

  console.log("Test Results:", {
    success: result.success,
    executionId: result.executionId,
    actionResults: result.results
  });

  // Review results before publishing
  if (result.results.every(r => r.success)) {
    // Safe to publish
    await automationClient.saveWorkflow(workflow);
  }
}
```

## Monitoring & Analytics

### Monitor Workflow Performance

```typescript
import automationClient from '@/services/automationClient';

async function monitorWorkflow(workflowId: string) {
  // Get statistics
  const stats = await automationClient.getWorkflowStats(workflowId);
  
  console.log("Workflow Performance:", {
    triggered: stats.triggered,
    completed: stats.completed,
    failed: stats.failed,
    successRate: (stats.completed / stats.triggered) * 100 + "%",
    avgExecutionTime: stats.avgExecutionTime + "ms"
  });

  // Get recent logs
  const logs = await automationClient.getExecutionLogs(workflowId, {
    limit: 10,
    status: "failed"
  });

  console.log("Recent Failures:", logs.logs);
}
```

## Common Workflow Combinations

| Use Case | Trigger | Actions |
|----------|---------|---------|
| Welcome New Leads | New Contact | Send Email, Add Tag |
| Qualify Leads | Stage Change | Send Email, Create Opportunity |
| Alert VIP | Tag Added | Send SMS, Send Email |
| Follow-up | Time-Based | Send Email, Update Tag |
| Re-engage | Tag Added | Send Email, Send SMS |
| Customer Success | New Customer Tag | Send Email, Create Task |
| Upsell Opportunity | Stage Change | Create Opportunity, Send Email |

## Troubleshooting Examples

### Workflow Not Triggering

```typescript
// Check workflow is enabled
const workflow = await automationClient.getWorkflow(workflowId);
if (!workflow.enabled) {
  await automationClient.toggleWorkflow(workflowId, true);
}

// Check execution logs
const logs = await automationClient.getExecutionLogs(workflowId);
console.log("Recent executions:", logs);
```

### Actions Not Completing

```typescript
// Get detailed logs
const logs = await automationClient.getExecutionLogs(workflowId, {
  status: "failed"
});

// Analyze failure reasons
logs.logs.forEach(log => {
  log.actionResults.forEach(result => {
    if (!result.success) {
      console.error(`Action ${result.actionId} failed:`, result.error);
    }
  });
});
```

## Best Practices

1. **Test Before Publishing**: Always test workflows with sample data
2. **Monitor Performance**: Regularly check success rates and execution times
3. **Keep It Simple**: Avoid overly complex workflows with too many actions
4. **Use Meaningful Names**: Name workflows descriptively
5. **Document Configuration**: Add descriptions to triggers and actions
6. **Review Regularly**: Periodically review workflow effectiveness
7. **Handle Failures**: Monitor failed executions and adjust configurations
8. **Optimize Performance**: Combine similar workflows to reduce duplication

## Example Implementation in React

```typescript
import { useState } from 'react';
import AutomationBuilder from '@/components/campaigns/AutomationBuilder';
import automationClient from '@/services/automationClient';

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState([]);

  const handleSave = async (workflow) => {
    try {
      // Validate first
      const validation = await automationClient.validateWorkflow(workflow);
      if (!validation.valid) throw new Error(validation.errors?.join(", "));

      // Test the workflow
      const testResult = await automationClient.testWorkflow(
        workflow,
        "test-contact-id"
      );

      if (!testResult.success) {
        throw new Error("Test failed - check action configurations");
      }

      // Save to backend
      const response = await automationClient.saveWorkflow(workflow);
      
      // Fetch updated list
      const { workflows: updated } = await automationClient.listWorkflows();
      setWorkflows(updated);

      console.log("Workflow published:", response.workflowId);
    } catch (error) {
      console.error("Failed to save workflow:", error);
    }
  };

  return <AutomationBuilder onSave={handleSave} />;
}
```

For more examples and detailed documentation, see the main README.md file.
