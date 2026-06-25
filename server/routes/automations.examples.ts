/**
 * Automations Engine - Usage Examples
 *
 * This file contains practical examples for using the Automations Engine API.
 * Copy and modify these examples for your use cases.
 */

// ============================================
// EXAMPLE 1: Welcome Email Series
// ============================================

export const welcomeEmailSeriesExample = {
  name: "Welcome Email Series",
  description: "Send a series of welcome emails to new contacts",
  type: "welcome",
  trigger_type: "contact_created",
  trigger_conditions: {},
  workflow: [
    {
      id: "welcome-email-1",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440001", // Replace with actual template UUID
      },
      order: 1,
    },
    {
      id: "delay-1",
      type: "delay",
      action: {
        delayMinutes: 1440, // 24 hours
      },
      order: 2,
    },
    {
      id: "welcome-email-2",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440002", // Replace with actual template UUID
      },
      order: 3,
    },
    {
      id: "delay-2",
      type: "delay",
      action: {
        delayMinutes: 1440, // 24 hours
      },
      order: 4,
    },
    {
      id: "welcome-email-3",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440003", // Replace with actual template UUID
      },
      order: 5,
    },
  ],
  is_recurring: false,
  max_contacts_per_day: 1000,
  tags: ["onboarding", "welcome"],
};

// ============================================
// EXAMPLE 2: Sales Inquiry Qualification
// ============================================

export const salesQualificationExample = {
  name: "Sales Inquiry Qualification Flow",
  description: "Automatically qualify and track sales inquiries",
  type: "trigger",
  trigger_type: "contact_tag",
  trigger_conditions: {
    tag: "inquiry",
  },
  workflow: [
    {
      id: "send-response",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440010",
      },
      order: 1,
    },
    {
      id: "create-sales-opp",
      type: "create_opportunity",
      action: {
        opportunityType: "Sales Inquiry",
      },
      order: 2,
    },
    {
      id: "tag-qualified",
      type: "update_tag",
      action: {
        tag: "sales_qualified",
      },
      order: 3,
    },
  ],
  is_recurring: false,
  tags: ["sales", "qualification"],
};

// ============================================
// EXAMPLE 3: Enterprise Account Re-engagement
// ============================================

export const enterpriseReengagementExample = {
  name: "Enterprise Account Re-engagement",
  description: "Re-engage inactive enterprise accounts with personalized outreach",
  type: "re_engagement",
  trigger_type: "contact_property",
  trigger_conditions: {
    property: "last_engagement",
    days_inactive: 90,
  },
  workflow: [
    {
      id: "check-enterprise",
      type: "condition",
      action: {
        condition: {
          field: "company",
          operator: "contains",
          value: "Inc",
        },
      },
      order: 1,
    },
    {
      id: "send-reengagement",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440020",
      },
      order: 2,
    },
    {
      id: "wait-3days",
      type: "delay",
      action: {
        delayMinutes: 4320, // 3 days
      },
      order: 3,
    },
    {
      id: "send-followup",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440021",
      },
      order: 4,
    },
    {
      id: "tag-reengaged",
      type: "update_tag",
      action: {
        tag: "reengagement_in_progress",
      },
      order: 5,
    },
  ],
  is_recurring: true,
  max_contacts_per_day: 100,
  tags: ["reengagement", "enterprise"],
};

// ============================================
// EXAMPLE 4: Multi-touch Drip Campaign
// ============================================

export const dripCampaignExample = {
  name: "Product Onboarding Drip Campaign",
  description: "Guide new customers through product features over 2 weeks",
  type: "drip",
  trigger_type: "contact_tag",
  trigger_conditions: {
    tag: "new_customer",
  },
  workflow: [
    {
      id: "day1-welcome",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440030",
      },
      order: 1,
    },
    {
      id: "delay-day2",
      type: "delay",
      action: {
        delayMinutes: 1440, // 24 hours
      },
      order: 2,
    },
    {
      id: "day2-feature1",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440031",
      },
      order: 3,
    },
    {
      id: "delay-day4",
      type: "delay",
      action: {
        delayMinutes: 2880, // 48 hours
      },
      order: 4,
    },
    {
      id: "day4-feature2",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440032",
      },
      order: 5,
    },
    {
      id: "delay-day7",
      type: "delay",
      action: {
        delayMinutes: 4320, // 72 hours
      },
      order: 6,
    },
    {
      id: "day7-feedback",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440033",
      },
      order: 7,
    },
    {
      id: "delay-day10",
      type: "delay",
      action: {
        delayMinutes: 4320, // 72 hours
      },
      order: 8,
    },
    {
      id: "day10-summary",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440034",
      },
      order: 9,
    },
    {
      id: "tag-onboarded",
      type: "update_tag",
      action: {
        tag: "onboarding_complete",
      },
      order: 10,
    },
  ],
  is_recurring: false,
  max_contacts_per_day: 500,
  tags: ["onboarding", "drip", "product"],
};

// ============================================
// EXAMPLE 5: SMS + Email Notification
// ============================================

export const smsEmailNotificationExample = {
  name: "VIP Customer SMS + Email Alert",
  description: "Alert VIP customers via SMS and email for special offers",
  type: "trigger",
  trigger_type: "event_based",
  trigger_conditions: {
    event: "special_offer_created",
  },
  workflow: [
    {
      id: "send-sms",
      type: "send_sms",
      action: {
        smsMessage:
          "Hi {{first_name}}! We have an exclusive offer just for you. Check your email!",
      },
      order: 1,
    },
    {
      id: "delay-1min",
      type: "delay",
      action: {
        delayMinutes: 1,
      },
      order: 2,
    },
    {
      id: "send-email",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440040",
      },
      order: 3,
    },
    {
      id: "tag-notified",
      type: "update_tag",
      action: {
        tag: "offer_notified",
      },
      order: 4,
    },
  ],
  is_recurring: false,
  tags: ["vip", "alerts", "offers"],
};

// ============================================
// EXAMPLE 6: Conditional Segmented Campaign
// ============================================

export const conditionalSegmentedExample = {
  name: "Segment-based Email Campaign",
  description: "Send different emails based on company size",
  type: "trigger",
  trigger_type: "contact_tag",
  trigger_conditions: {
    tag: "campaign_target",
  },
  workflow: [
    {
      id: "check-enterprise",
      type: "condition",
      action: {
        condition: {
          field: "company",
          operator: "contains",
          value: "Enterprise",
        },
      },
      order: 1,
    },
    {
      id: "enterprise-email",
      type: "send_email",
      action: {
        emailTemplate: "550e8400-e29b-41d4-a716-446655440050",
      },
      order: 2,
    },
    {
      id: "tag-enterprise",
      type: "update_tag",
      action: {
        tag: "enterprise_segment",
      },
      order: 3,
    },
  ],
  is_recurring: false,
  tags: ["segmentation", "campaign"],
};

// ============================================
// API USAGE EXAMPLES
// ============================================

/**
 * Example 1: Create a new automation
 *
 * curl -X POST http://localhost:3001/api/automations \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -d '{
 *     "name": "Welcome Email Series",
 *     "description": "Send welcome emails to new contacts",
 *     "type": "welcome",
 *     "trigger_type": "contact_created",
 *     "trigger_conditions": {},
 *     "workflow": [...],
 *     "is_recurring": false,
 *     "tags": ["onboarding"]
 *   }'
 */

/**
 * Example 2: List all automations
 *
 * curl -X GET "http://localhost:3001/api/automations?status=active&type=welcome&page=1&limit=20" \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Example 3: Get automation details
 *
 * curl -X GET http://localhost:3001/api/automations/automation-uuid \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Example 4: Update automation
 *
 * curl -X PATCH http://localhost:3001/api/automations/automation-uuid \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -d '{
 *     "name": "Updated Name",
 *     "workflow": [...]
 *   }'
 */

/**
 * Example 5: Activate automation
 *
 * curl -X POST http://localhost:3001/api/automations/automation-uuid/activate \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Example 6: Test automation with a contact
 *
 * curl -X POST http://localhost:3001/api/automations/automation-uuid/test \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -d '{
 *     "contactId": "contact-uuid"
 *   }'
 */

/**
 * Example 7: Get automation executions
 *
 * curl -X GET "http://localhost:3001/api/automations/automation-uuid/executions?status=completed&page=1" \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Example 8: Pause automation
 *
 * curl -X POST http://localhost:3001/api/automations/automation-uuid/pause \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

/**
 * Example 9: Delete automation
 *
 * curl -X DELETE http://localhost:3001/api/automations/automation-uuid \
 *   -H "Authorization: Bearer YOUR_TOKEN"
 */

// ============================================
// CLIENT-SIDE USAGE (TypeScript/JavaScript)
// ============================================

/**
 * Create automation from TypeScript
 *
 * async function createAutomation() {
 *   const response = await fetch('/api/automations', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${token}`,
 *     },
 *     body: JSON.stringify(welcomeEmailSeriesExample),
 *   });
 *
 *   const automation = await response.json();
 *   console.log('Created automation:', automation.id);
 *   return automation;
 * }
 */

/**
 * List automations from TypeScript
 *
 * async function listAutomations(status?: string, type?: string) {
 *   const params = new URLSearchParams();
 *   if (status) params.append('status', status);
 *   if (type) params.append('type', type);
 *
 *   const response = await fetch(`/api/automations?${params}`, {
 *     headers: {
 *       'Authorization': `Bearer ${token}`,
 *     },
 *   });
 *
 *   const { data, total } = await response.json();
 *   console.log(`Found ${total} automations`);
 *   return data;
 * }
 */

/**
 * Test automation from TypeScript
 *
 * async function testAutomation(automationId: string, contactId: string) {
 *   const response = await fetch(`/api/automations/${automationId}/test`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${token}`,
 *     },
 *     body: JSON.stringify({ contactId }),
 *   });
 *
 *   const result = await response.json();
 *   console.log('Test execution:', result.execution);
 *   return result;
 * }
 */

/**
 * Activate automation from TypeScript
 *
 * async function activateAutomation(automationId: string) {
 *   const response = await fetch(`/api/automations/${automationId}/activate`, {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${token}`,
 *     },
 *   });
 *
 *   const automation = await response.json();
 *   console.log('Automation activated:', automation.status);
 *   return automation;
 * }
 */

export const apiExamples = {
  welcomeEmailSeriesExample,
  salesQualificationExample,
  enterpriseReengagementExample,
  dripCampaignExample,
  smsEmailNotificationExample,
  conditionalSegmentedExample,
};
