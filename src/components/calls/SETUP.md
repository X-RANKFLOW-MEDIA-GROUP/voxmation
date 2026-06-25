# CallHistory Component - Setup & Integration Guide

## Quick Start

### 1. Verify Dependencies

The CallHistory component requires the following packages (already installed in this project):

- `react` >= 18.0
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@radix-ui/*` - Accessible components (via shadcn/ui)
- `tailwindcss` >= 3.4

Check your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

### 2. Import the Component

```tsx
import { CallHistory } from '@/src/components/calls';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';
```

### 3. Basic Implementation

```tsx
export function MyCallPage() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);

  return (
    <CallHistory
      calls={calls}
      isLoading={false}
      onCallSelect={(call) => console.log(call)}
    />
  );
}
```

## Database Setup

### Supabase Tables Required

The component expects the following Supabase tables:

#### `calls` table
```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  call_sid VARCHAR UNIQUE NOT NULL,
  caller_phone VARCHAR NOT NULL,
  caller_name VARCHAR,
  recipient_phone VARCHAR NOT NULL,
  recipient_name VARCHAR,
  status VARCHAR NOT NULL,
  direction VARCHAR NOT NULL,
  initiated_at TIMESTAMP NOT NULL,
  answered_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  disposition VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `call_recordings` table
```sql
CREATE TABLE call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  call_id UUID REFERENCES calls(id),
  recording_sid VARCHAR UNIQUE NOT NULL,
  duration_seconds INTEGER,
  recording_url VARCHAR NOT NULL,
  encoding VARCHAR NOT NULL,
  storage_provider VARCHAR NOT NULL,
  channels INTEGER DEFAULT 1,
  sample_rate INTEGER,
  status VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `call_transcriptions` table
```sql
CREATE TABLE call_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  call_id UUID REFERENCES calls(id),
  full_transcript TEXT,
  transcript_data JSONB,
  overall_sentiment VARCHAR,
  sentiment_score DECIMAL,
  key_phrases TEXT[],
  speaker_count INTEGER,
  word_count INTEGER,
  confidence_score DECIMAL,
  status VARCHAR NOT NULL,
  language VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Data Fetching Patterns

### Pattern 1: Simple Fetch with Supabase

```tsx
import { createClient } from '@/src/integrations/supabase/client';

async function fetchCalls() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      recording:call_recordings(*)!left,
      transcription:call_transcriptions(*)!left
    `)
    .eq('account_id', accountId)
    .order('initiated_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  // Normalize data
  return data.map(call => ({
    ...call,
    recording: Array.isArray(call.recording) ? call.recording[0] : call.recording,
    transcription: Array.isArray(call.transcription) ? call.transcription[0] : call.transcription,
  }));
}
```

### Pattern 2: Paginated Fetch

```tsx
async function fetchCallsPaginated(page: number, pageSize: number = 50) {
  const supabase = createClient();
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('calls')
    .select(
      `
        *,
        recording:call_recordings(*)!left,
        transcription:call_transcriptions(*)!left
      `,
      { count: 'exact' }
    )
    .order('initiated_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data.map(call => ({
      ...call,
      recording: Array.isArray(call.recording) ? call.recording[0] : call.recording,
      transcription: Array.isArray(call.transcription) ? call.transcription[0] : call.transcription,
    })),
    total: count,
  };
}
```

### Pattern 3: Real-time Subscription

```tsx
function subscribeToNewCalls(callback: (call: CallWithDetails) => void) {
  const supabase = createClient();

  return supabase
    .channel('new-calls')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'calls',
      },
      (payload) => {
        const newCall: CallWithDetails = {
          ...payload.new,
          recording: null,
          transcription: null,
        };
        callback(newCall);
      }
    )
    .subscribe();
}
```

## TypeScript Types

### Complete Type Definition

```tsx
import type {
  Call,
  CallRecording,
  CallTranscription,
  CallStatus,
  CallDirection,
  CallDisposition,
  Sentiment,
} from '@/types/calls_and_voice.types';

// Extended call with relationships
type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

// Component props
interface CallHistoryProps {
  calls: CallWithDetails[];
  isLoading?: boolean;
  onCallSelect?: (call: Call) => void;
}
```

## Styling & Customization

### Tailwind Configuration

Ensure your `tailwind.config.ts` includes:

```ts
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Your custom colors
      },
    },
  },
  plugins: [],
};
```

### Component Colors

Customize badge colors by modifying the `getStatusColor` function in CallHistory.tsx:

```tsx
const getStatusColor = (status: CallStatus): BadgeVariant => {
  switch (status) {
    case 'completed':
      return 'default'; // Green
    case 'in-progress':
      return 'secondary'; // Blue
    case 'failed':
      return 'destructive'; // Red
    // ... more cases
  }
};
```

### Custom CSS Variables

Add to your global CSS:

```css
:root {
  --call-status-completed: rgb(34 197 94); /* Green */
  --call-status-failed: rgb(239 68 68); /* Red */
  --call-status-in-progress: rgb(59 130 246); /* Blue */
}
```

## Performance Optimization

### 1. Memoization

The component uses `useMemo` for filtered calls:

```tsx
const filteredCalls = useMemo(() => {
  return calls.filter(/* ... */);
}, [calls, searchQuery, selectedStatuses, selectedDirections]);
```

### 2. Virtual Scrolling (Optional)

For datasets with 1000+ calls, add virtual scrolling:

```tsx
import { FixedSizeList } from 'react-window';

// Wrap TableBody with FixedSizeList
<FixedSizeList
  height={600}
  itemCount={filteredCalls.length}
  itemSize={56}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Row content */}
    </div>
  )}
</FixedSizeList>
```

### 3. Lazy Loading Transcriptions

Load transcriptions only when row is expanded:

```tsx
const [transcription, setTranscription] = useState<CallTranscription | null>(null);

const loadTranscription = async (callId: string) => {
  const { data } = await supabase
    .from('call_transcriptions')
    .select('*')
    .eq('call_id', callId)
    .single();
  
  setTranscription(data);
};
```

## Accessibility

### ARIA Labels

The component includes semantic HTML and ARIA labels:

```tsx
<Button
  aria-label="Expand call details"
  onClick={() => toggleExpanded(call.id)}
>
  <ChevronDown />
</Button>
```

### Keyboard Navigation

- **Tab**: Move between interactive elements
- **Enter/Space**: Expand/collapse rows
- **Escape**: Close dropdowns

## Browser Compatibility

Tested and supported:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android

## Environment Variables

If using external recording storage:

```env
# .env.local
NEXT_PUBLIC_RECORDING_STORAGE_URL=https://your-storage.com
RECORDING_ACCESS_TOKEN=your_token
```

## Testing

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CallHistory } from '@/src/components/calls';

describe('CallHistory', () => {
  it('should render call table', () => {
    render(<CallHistory calls={mockCalls} />);
    expect(screen.getByText('Call History')).toBeInTheDocument();
  });

  it('should filter by status', async () => {
    const user = userEvent.setup();
    render(<CallHistory calls={mockCalls} />);

    const filterButton = screen.getByText(/Status/i);
    await user.click(filterButton);
    // ... assertions
  });

  it('should expand row on click', async () => {
    const user = userEvent.setup();
    const { container } = render(<CallHistory calls={mockCalls} />);

    const expandButton = container.querySelector('[aria-label="Expand call details"]');
    await user.click(expandButton);
    // ... assertions
  });
});
```

## Troubleshooting

### Issue: Recording URL returns 403

**Solution**: Ensure recording URLs are CORS-enabled and include proper authentication tokens.

```tsx
// Add auth token to recording URL if needed
const recordingUrl = `${call.recording.recording_url}?token=${accessToken}`;
```

### Issue: Sentiment analysis not showing

**Solution**: Ensure transcription status is 'completed':

```tsx
if (call.transcription?.status === 'completed') {
  // Show sentiment
}
```

### Issue: Performance degradation with large datasets

**Solution**: Implement pagination or virtual scrolling:

```tsx
// Add pagination
const [page, setPage] = useState(1);
const pageSize = 50;
const paginatedCalls = filteredCalls.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

### Issue: Component not rendering

**Solution**: Verify imports and type definitions:

```tsx
// Ensure types are imported from correct location
import { Call } from '@/types/calls_and_voice.types';

// Verify component path
import { CallHistory } from '@/src/components/calls';
```

## Migration from Old Component

If replacing an existing call history component:

1. **Update imports**: Change old import path to new component
2. **Update data shape**: Ensure calls include `recording` and `transcription` objects
3. **Update event handlers**: Map old callbacks to `onCallSelect`
4. **Test filtering**: Verify status and direction filters work correctly

## Related Documentation

- [CallHistory Component README](./README.md)
- [Usage Examples](./EXAMPLES.md)
- [Types Reference](./types.ts)
- [Calls API Documentation](../../CALLS_API_README.md)

## Support

For issues or feature requests:

1. Check the README.md and EXAMPLES.md
2. Review the component source code
3. Check browser console for errors
4. Verify Supabase connection and data

## Next Steps

1. Integrate with your dashboard/page
2. Fetch real call data from Supabase
3. Customize styling to match your design system
4. Add additional filters or columns as needed
5. Implement export/analytics features
