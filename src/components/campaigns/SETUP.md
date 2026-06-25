# Automation Workflow Builder - Setup Guide

## Installation

The Automation Workflow Builder is already integrated into the Voxmation project.

### File Structure

```
src/
├── components/
│   ├── campaigns/
│   │   ├── AutomationBuilder.tsx       # Main component
│   │   ├── AutomationBuilderDemo.tsx   # Demo implementation
│   │   ├── types.ts                    # Type definitions
│   │   ├── index.ts                    # Exports
│   │   ├── README.md                   # Full documentation
│   │   └── SETUP.md                    # This file
│   └── ui/                             # Shadcn UI components
├── services/
│   └── automationClient.ts             # API client
└── types/                              # Global types
```

## Quick Start

### 1. Import the Component

```typescript
import { AutomationBuilder } from '@/components/campaigns';
// or
import AutomationBuilder from '@/components/campaigns/AutomationBuilder';
```

### 2. Basic Usage

```typescript
import AutomationBuilder from '@/components/campaigns/AutomationBuilder';

export default function WorkflowPage() {
  return (
    <AutomationBuilder 
      onSave={(workflow) => console.log('Workflow saved:', workflow)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### 3. With API Integration

```typescript
import AutomationBuilder from '@/components/campaigns/AutomationBuilder';
import automationClient from '@/services/automationClient';
import { useToast } from '@/components/ui/use-toast';

export default function WorkflowManager() {
  const { toast } = useToast();

  const handleSave = async (workflow) => {
    try {
      const response = await automationClient.saveWorkflow(workflow);
      toast({
        title: "Success",
        description: `Workflow saved with ID: ${response.workflowId}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleError = (error) => {
    toast({
      title: "Warning",
      description: error,
      variant: "destructive",
    });
  };

  return <AutomationBuilder onSave={handleSave} onError={handleError} />;
}
```

## Environment Configuration

### API Endpoint

Set the API base URL in your `.env` file:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

Or in your Vite config if using Vite:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.env.REACT_APP_API_URL': JSON.stringify(
      process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
    ),
  },
})
```

## Dependencies

All required dependencies are already installed in the project:

- `react` (18.3.1+)
- `react-dom` (18.3.1+)
- `lucide-react` (0.462.0+) - Icons
- Shadcn UI components (Button, Dialog, Input, Label, Select, etc.)
- `framer-motion` (11.18.2+) - Optional for animations

## Available UI Components Used

The builder uses these Shadcn UI components (already in the project):

- `Button` - Action buttons
- `Card` - Card containers
- `Dialog` - Modal dialogs
- `Alert` - Alert messages
- `Input` - Text input
- `Label` - Form labels
- `Select` - Dropdown selections
- `AlertDialog` - Confirmation dialogs
- `Tooltip` (optional) - Helpful tooltips

## Backend API Requirements

The component expects a backend API with the following endpoints:

### Workflow Management

```
POST   /api/workflows              # Save/create workflow
GET    /api/workflows              # List workflows
GET    /api/workflows/:id          # Get specific workflow
DELETE /api/workflows/:id          # Delete workflow
PATCH  /api/workflows/:id/toggle   # Enable/disable
POST   /api/workflows/:id/duplicate # Duplicate workflow
```

### Workflow Execution

```
POST   /api/workflows/:id/execute  # Execute workflow for contact
GET    /api/workflows/:id/logs     # Get execution logs
GET    /api/workflows/:id/stats    # Get workflow statistics
POST   /api/workflows/test         # Test workflow with sample data
```

### Validation

```
POST   /api/workflows/validate     # Validate workflow config
```

See `src/services/automationClient.ts` for detailed API client implementation.

## Styling & Customization

### Theme

The component uses Tailwind CSS with Shadcn UI themes. Customize by:

1. Modifying `tailwind.config.js`
2. Updating CSS variables in your theme file
3. Adjusting component className attributes

### Color Scheme

Current colors used:
- **Trigger**: Blue (`blue-50`, `blue-200`, `blue-600`)
- **Actions**: Green (`green-50`, `green-200`, `green-600`)
- **Destructive**: Red (`red-600`)

Modify in the component by changing Tailwind classes.

### Layout

The component uses a 4-column grid on large screens:
- Left (1 col): Trigger/Action library
- Main (3 cols): Builder and workflow list

Customize responsive breakpoints:

```typescript
// In AutomationBuilder.tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Adjust lg:col-span-1 and lg:col-span-3 as needed */}
</div>
```

## Performance Optimization

### Large Workflow Lists

For applications with many workflows, implement pagination:

```typescript
const [page, setPage] = useState(1);
const [limit] = useState(20);

const { workflows, total } = await automationClient.listWorkflows({
  limit,
  offset: (page - 1) * limit,
});
```

### Lazy Loading

Load workflow details only when needed:

```typescript
const [workflows, setWorkflows] = useState<Workflow[]>([]);
const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

// Load full details only when selected
const handleSelectWorkflow = async (workflowId: string) => {
  const workflow = await automationClient.getWorkflow(workflowId);
  setSelectedWorkflow(workflow);
};
```

## Testing

### Unit Tests

Example using Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import AutomationBuilder from '@/components/campaigns/AutomationBuilder';

describe('AutomationBuilder', () => {
  it('renders without crashing', () => {
    const { container } = render(<AutomationBuilder />);
    expect(container).toBeInTheDocument();
  });

  it('calls onSave when saving workflow', async () => {
    const onSave = vi.fn();
    const { getByText } = render(<AutomationBuilder onSave={onSave} />);
    
    // ... interact with component
    
    expect(onSave).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test with API client:

```typescript
import automationClient from '@/services/automationClient';

describe('automationClient', () => {
  it('saves workflow successfully', async () => {
    const workflow = {
      name: 'Test Workflow',
      // ... workflow config
    };

    const response = await automationClient.saveWorkflow(workflow);
    expect(response.workflowId).toBeDefined();
  });
});
```

## Debugging

### Enable Debug Logging

Add logging to track component state:

```typescript
const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

useEffect(() => {
  console.log('Selected workflow changed:', selectedWorkflow);
}, [selectedWorkflow]);
```

### API Debug

Monitor API calls:

```typescript
// In automationClient.ts
async saveWorkflow(workflow: Workflow) {
  console.log('Saving workflow:', workflow);
  const response = await fetch(...);
  console.log('Response:', response);
  return response.json();
}
```

### Browser DevTools

1. Open DevTools (F12)
2. Check Console for errors
3. Use Network tab to inspect API calls
4. Use React DevTools to inspect component state

## Troubleshooting

### Component Not Rendering

**Problem**: Component doesn't appear or shows blank

**Solutions**:
1. Check import statement is correct
2. Verify all Shadcn UI components are installed
3. Check Tailwind CSS is configured
4. Look for console errors

### Drag-Drop Not Working

**Problem**: Can't drag triggers/actions to canvas

**Solutions**:
1. Browser must support HTML5 Drag and Drop
2. Check no event handlers prevent propagation
3. Verify drag event listeners are attached
4. Test in supported browser (Chrome, Firefox, Safari)

### API Calls Failing

**Problem**: Save/Load operations fail

**Solutions**:
1. Verify API endpoint is correct
2. Check network connectivity
3. Verify API server is running
4. Check API response format matches expected types
5. Enable CORS if needed

### Styling Issues

**Problem**: Component looks broken or misaligned

**Solutions**:
1. Verify Tailwind CSS is compiled
2. Clear browser cache
3. Check for CSS conflicts
4. Verify Shadcn component styles are imported
5. Check for dark mode conflicts

## Security Considerations

### Validation

Always validate workflows on the server:

```typescript
// Backend
if (!workflow.trigger) {
  throw new Error('Workflow must have a trigger');
}
if (workflow.actions.length === 0) {
  throw new Error('Workflow must have at least one action');
}
```

### Sanitization

Sanitize user input for template variables:

```typescript
const sanitizeConfig = (config: Record<string, any>) => {
  // Remove dangerous characters/patterns
  return Object.entries(config).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? 
      value.replace(/[<>\"']/g, '') : 
      value;
    return acc;
  }, {});
};
```

### Authorization

Verify user has permission to manage workflows:

```typescript
// Backend
const canManageWorkflows = await checkUserPermissions(userId, 'workflows.manage');
if (!canManageWorkflows) {
  throw new Error('Unauthorized');
}
```

## Accessibility

The component includes accessibility features:

- Keyboard navigation support
- ARIA labels on buttons
- Semantic HTML
- Color contrast compliance

To improve further:

```typescript
<Button aria-label="Save workflow" onClick={handleSave}>
  <CheckCircle className="w-4 h-4 mr-2" />
  Save
</Button>
```

## Deployment

### Production Checklist

- [ ] API endpoints are production-ready
- [ ] Environment variables are configured
- [ ] Error handling is robust
- [ ] Loading states are implemented
- [ ] Validation is comprehensive
- [ ] Security checks are in place
- [ ] Performance is acceptable
- [ ] Accessibility is verified
- [ ] Tests pass
- [ ] Documentation is complete

## Support & Resources

- **Documentation**: See `README.md` in this directory
- **API Client**: See `src/services/automationClient.ts`
- **Types**: See `types.ts` in this directory
- **Demo**: See `AutomationBuilderDemo.tsx`

## Next Steps

1. Review the full documentation in `README.md`
2. Check out the demo in `AutomationBuilderDemo.tsx`
3. Implement backend API endpoints
4. Add authentication/authorization
5. Customize triggers and actions for your use case
6. Deploy and monitor in production
