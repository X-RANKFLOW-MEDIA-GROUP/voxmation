# CallHistory Component - Usage Examples

## Example 1: Basic Implementation with Mock Data

```tsx
'use client';

import React, { useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { Call, CallRecording, CallTranscription, CallStatus } from '@/types/calls_and_voice.types';

const mockCalls = [
  {
    id: '1',
    account_id: 'acc-1',
    call_sid: 'CA123456789',
    caller_phone: '+1 (555) 123-4567',
    caller_name: 'John Doe',
    recipient_phone: '+1 (555) 987-6543',
    recipient_name: 'Jane Smith',
    status: 'completed' as CallStatus,
    direction: 'inbound' as const,
    initiated_at: '2024-06-25T10:30:00Z',
    answered_at: '2024-06-25T10:30:05Z',
    started_at: '2024-06-25T10:30:05Z',
    ended_at: '2024-06-25T10:35:23Z',
    duration_seconds: 318,
    cost: 0.25,
    currency: 'USD',
    disposition: 'answered' as const,
    tags: [],
    custom_fields: {},
    created_at: '2024-06-25T10:30:00Z',
    updated_at: '2024-06-25T10:35:23Z',
    recording: {
      id: 'rec-1',
      account_id: 'acc-1',
      call_id: '1',
      recording_sid: 'RE123456789',
      duration_seconds: 318,
      recording_url: 'https://example.com/recordings/recording-1.wav',
      storage_provider: 'twilio' as const,
      status: 'ready' as const,
      encoding: 'wav' as const,
      channels: 1,
      sample_rate: 8000,
      tags: [],
      is_archived: false,
      is_favorite: false,
      is_encrypted: false,
      custom_fields: {},
      created_at: '2024-06-25T10:35:25Z',
      updated_at: '2024-06-25T10:35:25Z',
    },
    transcription: {
      id: 'trans-1',
      account_id: 'acc-1',
      call_id: '1',
      full_transcript: 'Customer: Hi, I need help with my order... Agent: Sure, what order number?...',
      transcript_data: [
        {
          speaker: 'caller' as const,
          text: 'Hi, I need help with my order',
          start_time: 0,
          end_time: 3,
          confidence: 0.95,
        },
        {
          speaker: 'recipient' as const,
          text: 'Sure, what order number?',
          start_time: 3,
          end_time: 5,
          confidence: 0.98,
        },
      ],
      overall_sentiment: 'positive' as const,
      sentiment_score: 0.75,
      key_phrases: ['order number', 'help', 'customer service'],
      speaker_count: 2,
      word_count: 156,
      confidence_score: 0.96,
      status: 'completed' as const,
      language: 'en-US',
      tags: [],
      is_favorite: false,
      custom_fields: {},
      created_at: '2024-06-25T10:35:30Z',
      updated_at: '2024-06-25T10:45:00Z',
    },
  },
];

export default function BasicExample() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Call History</h1>
      <CallHistory calls={mockCalls} />
    </div>
  );
}
```

## Example 2: With Supabase Integration

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { createClient } from '@/src/integrations/supabase/client';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';

type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

export default function SupabaseExample() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setIsLoading(true);

        // Get current user's account
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setError('Not authenticated');
          return;
        }

        // Fetch calls with relationships
        const { data, error: callsError } = await supabase
          .from('calls')
          .select(`
            *,
            recording:call_recordings(
              id,
              call_id,
              recording_url,
              duration_seconds,
              encoding,
              storage_provider,
              status,
              channels,
              sample_rate
            ),
            transcription:call_transcriptions(
              id,
              call_id,
              full_transcript,
              transcript_data,
              overall_sentiment,
              sentiment_score,
              key_phrases,
              speaker_count,
              word_count,
              confidence_score,
              status,
              language
            )
          `)
          .eq('account_id', user.id)
          .order('initiated_at', { ascending: false })
          .limit(100);

        if (callsError) throw callsError;

        // Normalize recording and transcription to single objects or null
        const normalizedCalls = (data || []).map((call) => ({
          ...call,
          recording: Array.isArray(call.recording) ? call.recording[0] : call.recording,
          transcription: Array.isArray(call.transcription) ? call.transcription[0] : call.transcription,
        }));

        setCalls(normalizedCalls);
      } catch (err) {
        console.error('Error fetching calls:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-4 rounded text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Call History</h1>
      <CallHistory calls={calls} isLoading={isLoading} />
    </div>
  );
}
```

## Example 3: With Real-time Updates

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { createClient } from '@/src/integrations/supabase/client';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';

type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

export default function RealtimeExample() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchAndSubscribeCalls = async () => {
      try {
        // Initial fetch
        const { data } = await supabase
          .from('calls')
          .select(`
            *,
            recording:call_recordings(*),
            transcription:call_transcriptions(*)
          `)
          .order('initiated_at', { ascending: false })
          .limit(100);

        const normalizedCalls = (data || []).map((call) => ({
          ...call,
          recording: Array.isArray(call.recording) ? call.recording[0] : call.recording,
          transcription: Array.isArray(call.transcription) ? call.transcription[0] : call.transcription,
        }));

        setCalls(normalizedCalls);
        setIsLoading(false);

        // Subscribe to new calls
        const callsSubscription = supabase
          .channel('new-calls')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'calls',
            },
            (payload) => {
              const newCall = {
                ...payload.new,
                recording: null,
                transcription: null,
              } as CallWithDetails;

              setCalls((prev) => [newCall, ...prev]);
            }
          )
          .subscribe();

        // Subscribe to transcription updates
        const transcriptionSubscription = supabase
          .channel('transcription-updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'call_transcriptions',
            },
            (payload) => {
              const transcription = payload.new as CallTranscription;
              setCalls((prev) =>
                prev.map((call) =>
                  call.id === transcription.call_id
                    ? { ...call, transcription }
                    : call
                )
              );
            }
          )
          .subscribe();

        return () => {
          callsSubscription.unsubscribe();
          transcriptionSubscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error setting up real-time:', err);
        setIsLoading(false);
      }
    };

    const unsubscribe = fetchAndSubscribeCalls();
    return () => {
      unsubscribe?.then((fn) => fn?.());
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Real-time Call History</h1>
      <CallHistory calls={calls} isLoading={isLoading} />
    </div>
  );
}
```

## Example 4: With Filtering and Selection

```tsx
'use client';

import React, { useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { Call } from '@/types/calls_and_voice.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

// ... mockCalls from Example 1 ...

export default function FilteringExample() {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const handleCallSelect = (call: Call) => {
    setSelectedCall(call);
    console.log('Selected call:', call);
  };

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CallHistory
          calls={mockCalls}
          onCallSelect={handleCallSelect}
        />
      </div>

      <div className="lg:col-span-1">
        {selectedCall ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Call ID</p>
                <p className="font-mono text-sm">{selectedCall.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Caller</p>
                <p className="font-medium">{selectedCall.caller_phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p className="font-medium">{selectedCall.recipient_phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {selectedCall.duration_seconds} seconds
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{selectedCall.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Direction</p>
                <p className="font-medium capitalize">{selectedCall.direction}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Select a call to view details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

## Example 5: Dashboard Integration

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { createClient } from '@/src/integrations/supabase/client';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

export default function DashboardExample() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const { data } = await supabase
          .from('calls')
          .select(`
            *,
            recording:call_recordings(*),
            transcription:call_transcriptions(*)
          `)
          .order('initiated_at', { ascending: false })
          .limit(50);

        const normalizedCalls = (data || []).map((call) => ({
          ...call,
          recording: Array.isArray(call.recording) ? call.recording[0] : call.recording,
          transcription: Array.isArray(call.transcription) ? call.transcription[0] : call.transcription,
        }));

        setCalls(normalizedCalls);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Calculate statistics
  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.status === 'completed').length,
    failed: calls.filter((c) => c.status === 'failed').length,
    avgDuration:
      calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) /
      Math.max(calls.length, 1),
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Calls Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          View and analyze all incoming and outgoing calls
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.floor(stats.avgDuration)}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call History Table */}
      <CallHistory calls={calls} isLoading={isLoading} />
    </div>
  );
}
```

## Example 6: With Date Range Filter (Extended)

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { CallHistory } from '@/src/components/calls';
import { Button } from '@/src/components/ui/button';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';
import { format, subDays } from 'date-fns';

type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export default function DateRangeExample() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  // Filter calls by date range
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const callDate = new Date(call.initiated_at);
      return callDate >= dateRange.startDate && callDate <= dateRange.endDate;
    });
  }, [calls, dateRange]);

  const presets = [
    { label: 'Last 24 hours', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Call History</h1>
        <p className="text-muted-foreground">
          {format(dateRange.startDate, 'MMM dd, yyyy')} -{' '}
          {format(dateRange.endDate, 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Date Range Presets */}
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            onClick={() =>
              setDateRange({
                startDate: subDays(new Date(), preset.days),
                endDate: new Date(),
              })
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Call History */}
      <CallHistory calls={filteredCalls} />
    </div>
  );
}
```

## Example 7: Export to CSV

```tsx
'use client';

import React, { useState } from 'react';
import { CallHistory } from '@/src/components/calls';
import { Button } from '@/src/components/ui/button';
import { Call, CallRecording, CallTranscription } from '@/types/calls_and_voice.types';
import { Download } from 'lucide-react';

type CallWithDetails = Call & {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
};

export default function ExportExample() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);

  const exportToCSV = () => {
    const headers = [
      'Date/Time',
      'Caller',
      'Recipient',
      'Duration (s)',
      'Status',
      'Direction',
      'Disposition',
      'Recording',
      'Transcription',
    ];

    const rows = calls.map((call) => [
      new Date(call.initiated_at).toISOString(),
      call.caller_phone,
      call.recipient_phone,
      call.duration_seconds || 0,
      call.status,
      call.direction,
      call.disposition || 'N/A',
      call.recording ? 'Yes' : 'No',
      call.transcription ? 'Yes' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calls_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Call History</h1>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </div>

      <CallHistory calls={calls} />
    </div>
  );
}
```

These examples cover the main use cases for the CallHistory component. Mix and match based on your specific needs!
