# CallHistory Component

A comprehensive React component for displaying and managing call history with advanced features like recording playback, transcription display, and sentiment analysis.

## Features

### 1. **Call Table Display**
- Data: Formatted date and time of call
- Caller: Phone number and name
- Recipient: Phone number and name
- Duration: Call duration in MM:SS format
- Status: Call status with visual indicators
- Recording: Recording format and duration

### 2. **Filtering & Search**
- **Search**: By phone number, name, or call ID
- **Status Filter**: Filter by call status (initiated, ringing, in-progress, completed, failed, no-answer, busy, cancelled)
- **Direction Filter**: Filter by call direction (inbound, outbound)
- **Clear Filters**: Quick reset button

### 3. **Expandable Rows**
Click any row to expand and reveal:
- Audio player with controls
- Recording details (format, storage provider, duration)
- Full transcription with speaker turns
- Sentiment analysis with scores
- Key phrases and entities
- Word count, speaker count, confidence scores

### 4. **Recording Player**
- Play/Pause controls
- Progress bar
- Duration display
- Download button
- Format and storage information

### 5. **Transcription Analysis**
- **Overall Sentiment**: Positive, negative, neutral, mixed
- **Sentiment Score**: Confidence percentage (-1.0 to 1.0)
- **Key Phrases**: Auto-extracted phrases with frequency
- **Speaker Turns**: Chronological transcript with speaker labels
- **Metrics**:
  - Word count
  - Speaker count
  - Confidence score
  - Processing status

### 6. **Summary Statistics**
- Total calls
- Total duration
- Calls with recording
- Calls with transcription

## Usage

### Basic Usage

```tsx
import { CallHistory } from '@/src/components/calls';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';

interface CallWithDetails extends Call {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
}

export function MyComponent() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);

  return (
    <CallHistory
      calls={calls}
      isLoading={false}
      onCallSelect={(call) => console.log('Selected call:', call)}
    />
  );
}
```

### With Supabase Integration

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { CallHistory } from '@/src/components/calls';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';

export function CallHistoryPage() {
  const [calls, setCalls] = useState<(Call & { recording?: CallRecording; transcription?: CallTranscription })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const { data: callsData, error: callsError } = await supabase
          .from('calls')
          .select(`
            *,
            recording:call_recordings(
              id,
              recording_url,
              recording_data,
              duration_seconds,
              encoding,
              storage_provider,
              status
            ),
            transcription:call_transcriptions(
              id,
              full_transcript,
              transcript_data,
              overall_sentiment,
              sentiment_score,
              key_phrases,
              speaker_count,
              word_count,
              confidence_score,
              status
            )
          `)
          .order('initiated_at', { ascending: false })
          .limit(50);

        if (callsError) throw callsError;
        setCalls(callsData || []);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return <CallHistory calls={calls} isLoading={isLoading} />;
}
```

### With Real-time Subscriptions

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { CallHistory } from '@/src/components/calls';

export function RealtimeCallHistory() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchCalls = async () => {
      const { data } = await supabase
        .from('calls')
        .select(`
          *,
          recording:call_recordings(*),
          transcription:call_transcriptions(*)
        `)
        .order('initiated_at', { ascending: false });

      setCalls(data || []);
    };

    fetchCalls();

    // Subscribe to new calls
    const subscription = supabase
      .channel('calls-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'calls',
      }, (payload) => {
        setCalls((prev) => [payload.new as CallWithDetails, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'call_transcriptions',
      }, (payload) => {
        // Update call with new transcription
        const transcription = payload.new as CallTranscription;
        setCalls((prev) =>
          prev.map((call) =>
            call.id === transcription.call_id
              ? { ...call, transcription }
              : call
          )
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <CallHistory calls={calls} />;
}
```

## Props

```typescript
interface CallHistoryProps {
  /**
   * Array of calls with optional recording and transcription data
   */
  calls: CallWithDetails[];

  /**
   * Loading state for the table
   * @default false
   */
  isLoading?: boolean;

  /**
   * Callback when a call is selected (row clicked)
   */
  onCallSelect?: (call: Call) => void;
}
```

## Component Structure

```
CallHistory
├── Search Input
├── Filter Controls
│   ├── Status Filter
│   ├── Direction Filter
│   └── Clear Filters Button
├── Table
│   └── For each call:
│       ├── Expand Button
│       ├── Date & Time
│       ├── Caller Info
│       ├── Recipient Info
│       ├── Duration
│       ├── Status Badge
│       └── Recording Info
│           └── Expanded Row
│               ├── Recording Player
│               └── Transcription & Analysis
│                   ├── Sentiment Analysis
│                   ├── Key Metrics
│                   ├── Key Phrases
│                   ├── Full Transcript
│                   └── Speaker Turns
└── Summary Statistics
```

## Styling

The component uses Tailwind CSS and shadcn/ui components. Customize appearance using:

1. **Tailwind Classes**: Modify in CallHistory.tsx
2. **shadcn/ui Theme**: Edit in `globals.css`
3. **Custom CSS**: Add to your global styles

## Data Structure

### Call Object
```typescript
interface Call {
  id: string;
  account_id: string;
  call_sid: string;
  caller_phone: string;
  caller_name?: string;
  recipient_phone: string;
  recipient_name?: string;
  status: CallStatus;
  direction: CallDirection;
  initiated_at: string;
  answered_at?: string;
  duration_seconds?: number;
  disposition?: CallDisposition;
  created_at: string;
  updated_at: string;
}
```

### CallRecording Object
```typescript
interface CallRecording {
  id: string;
  call_id: string;
  recording_url: string;
  duration_seconds?: number;
  encoding: RecordingEncoding;
  storage_provider: StorageProvider;
  status: RecordingStatus;
}
```

### CallTranscription Object
```typescript
interface CallTranscription {
  id: string;
  call_id: string;
  full_transcript?: string;
  transcript_data: TranscriptionSpeakerTurn[];
  overall_sentiment: Sentiment;
  sentiment_score?: number;
  key_phrases: string[];
  speaker_count?: number;
  word_count?: number;
  confidence_score?: number;
  status: TranscriptionStatus;
}
```

## Accessibility

The component includes:
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation (Tab, Enter, Space)
- Focus management for expandable rows
- Screen reader friendly status indicators

## Performance

- Optimized rendering with React.memo
- Efficient filtering with useMemo
- Event handler optimization with useCallback
- Virtual scrolling support ready (for large datasets)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

- React 18+
- Tailwind CSS 3.4+
- shadcn/ui
- date-fns
- lucide-react
- clsx/cn utility

## Future Enhancements

- [ ] Virtual scrolling for large datasets
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced date range filtering
- [ ] Call quality metrics visualization
- [ ] Bulk actions (delete, tag)
- [ ] Call recording analysis charts
- [ ] Integration with CRM systems
- [ ] Custom column selection
- [ ] Dark mode optimization
- [ ] Mobile-responsive improvements

## Notes

- Ensure data includes nested recording and transcription objects
- Audio player requires CORS-enabled URLs
- Transcription data is truncated to 5 turns, expandable for full view
- Sentiment analysis requires transcription completion
- Recording status should be 'ready' before playback
