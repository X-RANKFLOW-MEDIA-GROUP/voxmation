# Automation Workflow Builder

A comprehensive drag-and-drop interface for creating automated workflows with triggers and actions in Voxmation.

## Features

### Core Capabilities
- **Drag-and-Drop Interface**: Intuitive visual builder for creating workflows
- **Multiple Triggers**: Support for various trigger types
- **Multiple Actions**: Execute various actions when triggers fire
- **Visual Workflow Design**: See your automation flow at a glance
- **Enable/Disable**: Toggle workflows on and off
- **Duplicate Workflows**: Clone existing workflows to save time
- **Workflow Statistics**: Track triggers, completions, and failures
- **Real-time Validation**: Ensure workflows are properly configured

## Supported Triggers

### 1. New Contact (`new_contact`)
Triggers when a new contact is added to the system.

**Configuration Fields:**
- `source` (required): Where the contact came from
  - `web_form`: Contact from website form
  - `import`: Contact from import
  - `api`: Contact from API

**Use Cases:**
- Send welcome email to new leads
- Add new contacts to SMS list
- Create initial opportunity

### 2. Stage Change (`stage_change`)
Triggers when a contact moves between sales stages.

**Configuration Fields:**
- `fromStage` (optional): Starting stage
  - Options: Lead, Prospect, Qualified, Negotiation
- `toStage` (required): Target stage
  - Options: Lead, Prospect, Qualified, Negotiation

**Use Cases:**
- Send email when contact becomes qualified
- Create opportunity when moving to negotiation
- Update tags based on stage progression

### 3. Tag Added (`tag_added`)
Triggers when a specific tag is added to a contact.

**Configuration Fields:**
- `tagName` (required): Name of the tag to monitor

**Use Cases:**
- Send specialized email for high-priority contacts
- Add to specific SMS campaign
- Assign to sales rep

### 4. Time-Based (`time_based`)
Triggers after a delay from another event.

**Configuration Fields:**
- `delayDays` (optional): Number of days to delay (0-365)
- `delayHours` (optional): Number of hours to delay (0-23)

**Use Cases:**
- Send follow-up email 2 days after contact creation
- Check in with prospect after 1 week
- Create reminder 24 hours before meeting

## Supported Actions

### 1. Send Email (`send_email`)
Send an email to a contact or their owner.

**Configuration Fields:**
- `templateId` (required): Email template to use
- `recipient` (required): Who to send to
  - `contact_email`: Send to contact's email
  - `owner_email`: Send to contact owner's email

**Features:**
- Dynamic template variables
- Contact merge tags
- Tracking and logging

### 2. Send SMS (`send_sms`)
Send an SMS text message to a contact.

**Configuration Fields:**
- `phoneField` (required): Which phone field to use
- `messageTemplate` (required): SMS message content

**Features:**
- Character count tracking
- Delivery confirmation
- Link shortening

### 3. Update Tag (`update_tag`)
Add or remove a tag from a contact.

**Configuration Fields:**
- `tagName` (required): Name of tag to modify
- `action` (required): What to do with the tag
  - `add`: Add the tag
  - `remove`: Remove the tag

**Features:**
- Bulk tag operations
- Tag-based segmentation
- Tag audit trail

### 4. Create Opportunity (`create_opportunity`)
Create a new sales opportunity for a contact.

**Configuration Fields:**
- `opportunityName` (required): Name of the opportunity
- `stage` (required): Initial stage (Lead, Prospect, Qualified)
- `value` (optional): Deal value in currency

**Features:**
- Auto-assign based on rules
- Stage-based workflows
- Revenue tracking

## Component Structure

```
src/components/campaigns/
├── AutomationBuilder.tsx          # Main component
├── types.ts                        # TypeScript definitions
├── index.ts                        # Exports
└── README.md                       # This file

src/services/
└── automationClient.ts             # API client
```

## Usage

### Basic Integration

```typescript
import { AutomationBuilder } from '@/components/campaigns';

export default function WorkflowPage() {
  const handleSave = (workflow) => {
    console.log('Workflow saved:', workflow);
    // Send to API
  };

  const handleError = (error) => {
    console.error('Error:', error);
    // Show toast notification
  };

  return (
    <AutomationBuilder 
      onSave={handleSave}
      onError={handleError}
    />
  );
}
```

### With API Client

```typescript
import automationClient from '@/services/automationClient';
import { AutomationBuilder } from '@/components/campaigns';

export default function WorkflowManager() {
  const handleSave = async (workflow) => {
    try {
      const response = await automationClient.saveWorkflow(workflow);
      console.log('Workflow published:', response.workflowId);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  return <AutomationBuilder onSave={handleSave} />;
}
```

## API Client Methods

### Workflow Management

```typescript
// Save a workflow
await automationClient.saveWorkflow(workflow);

// Get a single workflow
await automationClient.getWorkflow(workflowId);

// List all workflows
await automationClient.listWorkflows({ 
  limit: 50, 
  offset: 0,
  enabled: true 
});

// Delete a workflow
await automationClient.deleteWorkflow(workflowId);

// Duplicate a workflow
await automationClient.duplicateWorkflow(workflowId);

// Toggle workflow status
await automationClient.toggleWorkflow(workflowId, enabled);
```

### Workflow Execution

```typescript
// Execute a workflow for a contact
await automationClient.executeWorkflow(workflowId, contactId);

// Get execution logs
await automationClient.getExecutionLogs(workflowId, {
  limit: 50,
  offset: 0,
  status: 'completed'
});

// Get workflow statistics
await automationClient.getWorkflowStats(workflowId);

// Test workflow with sample data
await automationClient.testWorkflow(workflow, sampleContactId);
```

### Validation

```typescript
// Validate workflow configuration
await automationClient.validateWorkflow(workflow);
```

## Type Definitions

### Workflow

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger | null;
  actions: Action[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    triggered: number;
    completed: number;
    failed: number;
  };
}
```

### Trigger

```typescript
interface Trigger {
  id: string;
  type: TriggerType; // 'new_contact' | 'stage_change' | 'tag_added' | 'time_based'
  config: Record<string, any>;
  description?: string;
}
```

### Action

```typescript
interface Action {
  id: string;
  type: ActionType; // 'send_email' | 'send_sms' | 'update_tag' | 'create_opportunity'
  config: Record<string, any>;
  description?: string;
}
```

## Building a Workflow

### Step 1: Create a Workflow
1. Click "New Workflow" button
2. Enter workflow name and description
3. Click "Create Workflow"

### Step 2: Add a Trigger
1. Drag a trigger from the left sidebar to the canvas
2. Configure the trigger in the dialog
3. Click "Save Trigger"

### Step 3: Add Actions
1. Drag an action from the sidebar or click "Add Action"
2. Configure the action in the dialog
3. Click "Save Action"
4. Repeat to add multiple actions

### Step 4: Enable and Save
1. Click "Enable" to activate the workflow
2. Click "Save Workflow" to publish changes

## Workflow Validation Rules

A valid workflow must have:
- **Name**: Non-empty workflow name
- **Trigger**: Exactly one trigger with valid configuration
- **Actions**: At least one action with valid configuration
- **Configuration**: All required fields filled in trigger and actions

## Error Handling

The component provides error callbacks for all operations:

```typescript
<AutomationBuilder 
  onError={(error: string) => {
    // Handle error
    toast.error(error);
  }}
/>
```

## Examples

### Welcome Email for New Contacts

**Trigger**: New Contact (source: web_form)
**Action 1**: Send Email (template: "Welcome", recipient: contact_email)
**Action 2**: Update Tag (tag: "newsletter", action: add)

### Follow-up on Stage Change

**Trigger**: Stage Change (toStage: "Qualified")
**Action 1**: Send Email (template: "Qualification Email", recipient: contact_email)
**Action 2**: Create Opportunity (name: "New Deal", stage: "Qualified", value: 10000)

### Time-Based Reminder

**Trigger**: Time-Based (delayDays: 3)
**Action**: Send SMS (message: "Quick check-in on your inquiry...")

## Performance Considerations

- Workflows are evaluated asynchronously
- Triggers are checked on contact events
- Actions are queued and processed sequentially
- Large bulk operations may take time

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Requires HTML5 Drag and Drop API support

## Limitations

- Maximum 100 actions per workflow (recommended < 10)
- Trigger evaluation latency: ~1-5 seconds
- Action execution timeout: 30 seconds per action
- Daily execution limit: Contact Voxmation team for higher limits

## Future Enhancements

- [ ] Conditional logic (if/else branches)
- [ ] Advanced scheduling (cron expressions)
- [ ] Workflow templates marketplace
- [ ] A/B testing support
- [ ] Analytics and reporting dashboard
- [ ] Workflow versioning and rollback
- [ ] Multi-trigger workflows
- [ ] Custom webhook actions

## Troubleshooting

### Workflow Not Triggering
- Check if workflow is enabled
- Verify trigger configuration
- Check execution logs for errors
- Test workflow manually

### Actions Not Executing
- Verify all required fields are configured
- Check contact data matches trigger conditions
- Review execution logs for specific errors
- Test individual action configuration

### Performance Issues
- Reduce number of actions
- Check for slow email templates
- Verify API connectivity
- Review server logs

## Support

For issues or feature requests, contact the Voxmation development team.
