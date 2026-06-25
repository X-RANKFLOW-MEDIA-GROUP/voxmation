# Calls & Voice System - Implementation Examples

Complete code examples for integrating with the Calls & Voice system.

## Table of Contents

1. [Supabase Client Setup](#supabase-client-setup)
2. [Call Operations](#call-operations)
3. [Recording Management](#recording-management)
4. [Transcription Handling](#transcription-handling)
5. [IVR Menu Management](#ivr-menu-management)
6. [Twilio Integration](#twilio-integration)
7. [Analytics Queries](#analytics-queries)

---

## Supabase Client Setup

### TypeScript Client Initialization

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/calls_and_voice.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For service role operations (backend only)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Call Operations

### Create a Call Record

```typescript
import { Call, CallInsert } from '@/types/calls_and_voice.types';

async function createCall(
  accountId: string,
  callData: {
    callSid: string;
    callerPhone: string;
    recipientPhone: string;
    ivRMenuId?: string;
    contactId?: string;
    campaignId?: string;
  }
): Promise<Call> {
  const insert: CallInsert = {
    account_id: accountId,
    call_sid: callData.callSid,
    caller_phone: callData.callerPhone,
    recipient_phone: callData.recipientPhone,
    status: 'initiated',
    direction: 'inbound',
    initiated_at: new Date().toISOString(),
    ivr_menu_id: callData.ivRMenuId,
    contact_id: callData.contactId,
    campaign_id: callData.campaignId,
    currency: 'USD',
    voice_mail_detected: false,
    tags: [],
    custom_fields: {},
  };

  const { data, error } = await supabase
    .from('calls')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Update Call Status

```typescript
async function updateCallStatus(
  callId: string,
  accountId: string,
  updates: {
    status?: 'ringing' | 'in-progress' | 'completed' | 'failed';
    answeredAt?: string;
    endedAt?: string;
    duration?: number;
    disposition?: 'answered' | 'voicemail' | 'busy' | 'no-answer' | 'failed' | 'transferred';
    cost?: number;
    qualityScore?: number;
  }
): Promise<Call> {
  const { data, error } = await supabase
    .from('calls')
    .update({
      status: updates.status,
      answered_at: updates.answeredAt,
      ended_at: updates.endedAt,
      duration_seconds: updates.duration,
      disposition: updates.disposition,
      cost: updates.cost,
      quality_score: updates.qualityScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', callId)
    .eq('account_id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Get Call Details

```typescript
async function getCallDetails(
  callId: string,
  accountId: string
): Promise<{
  call: Call;
  recording: CallRecording | null;
  transcription: CallTranscription | null;
  notes: CallNote[];
  logs: CallLog[];
}> {
  const { data: call, error: callError } = await supabase
    .from('calls')
    .select('*')
    .eq('id', callId)
    .eq('account_id', accountId)
    .single();

  if (callError) throw callError;

  const { data: recording } = await supabase
    .from('call_recordings')
    .select('*')
    .eq('call_id', callId)
    .eq('account_id', accountId)
    .maybeSingle();

  const { data: transcription } = await supabase
    .from('call_transcriptions')
    .select('*')
    .eq('call_id', callId)
    .eq('account_id', accountId)
    .maybeSingle();

  const { data: notes } = await supabase
    .from('call_notes')
    .select('*')
    .eq('call_id', callId)
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  const { data: logs } = await supabase
    .from('call_logs')
    .select('*')
    .eq('call_id', callId)
    .eq('account_id', accountId)
    .order('logged_at', { ascending: false });

  return {
    call,
    recording: recording || null,
    transcription: transcription || null,
    notes: notes || [],
    logs: logs || [],
  };
}
```

### List Calls with Pagination

```typescript
async function listCalls(
  accountId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    direction?: 'inbound' | 'outbound';
    searchPhone?: string;
  } = {}
): Promise<{ calls: Call[]; total: number }> {
  const { page = 1, limit = 20, status, direction, searchPhone } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('calls')
    .select('*', { count: 'exact' })
    .eq('account_id', accountId);

  if (status) query = query.eq('status', status);
  if (direction) query = query.eq('direction', direction);
  if (searchPhone) {
    query = query.or(
      `caller_phone.ilike.%${searchPhone}%,recipient_phone.ilike.%${searchPhone}%`
    );
  }

  const { data, count, error } = await query
    .order('initiated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    calls: data || [],
    total: count || 0,
  };
}
```

---

## Recording Management

### Store Recording Metadata

```typescript
import { CallRecordingInsert } from '@/types/calls_and_voice.types';

async function storeRecording(
  accountId: string,
  callId: string,
  recordingData: {
    recordingSid: string;
    recordingUrl: string;
    durationSeconds: number;
    storageProvider: 'twilio' | 's3' | 'gcs' | 'local';
    encoding?: 'ulaw' | 'wav' | 'mp3' | 'ogg';
  }
): Promise<CallRecording> {
  const insert: CallRecordingInsert = {
    account_id: accountId,
    call_id: callId,
    recording_sid: recordingData.recordingSid,
    recording_url: recordingData.recordingUrl,
    duration_seconds: recordingData.durationSeconds,
    storage_provider: recordingData.storageProvider,
    encoding: recordingData.encoding || 'ulaw',
    channels: 1,
    sample_rate: 8000,
    status: 'ready',
    is_archived: false,
    is_favorite: false,
    is_encrypted: false,
    tags: [],
    custom_fields: {},
  };

  const { data, error } = await supabase
    .from('call_recordings')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Archive Recording

```typescript
async function archiveRecording(
  recordingId: string,
  accountId: string
): Promise<void> {
  const { error } = await supabase
    .from('call_recordings')
    .update({
      is_archived: true,
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordingId)
    .eq('account_id', accountId);

  if (error) throw error;
}
```

### Get Recording with Signed URL

```typescript
async function getRecordingWithSignedUrl(
  recordingId: string,
  accountId: string
): Promise<{ url: string; expiresIn: number }> {
  const { data: recording, error: fetchError } = await supabase
    .from('call_recordings')
    .select('recording_url, storage_provider')
    .eq('id', recordingId)
    .eq('account_id', accountId)
    .single();

  if (fetchError) throw fetchError;

  // If stored in S3, generate signed URL (example)
  if (recording.storage_provider === 's3') {
    const { data, error } = await supabase.storage
      .from('call-recordings')
      .createSignedUrl(recording.recording_url, 3600);

    if (error) throw error;
    return { url: data.signedUrl, expiresIn: 3600 };
  }

  // Return direct Twilio URL
  return { url: recording.recording_url, expiresIn: -1 };
}
```

---

## Transcription Handling

### Store Transcription with NLP Analysis

```typescript
import { CallTranscriptionInsert, TranscriptionSpeakerTurn } from '@/types/calls_and_voice.types';

async function storeTranscription(
  accountId: string,
  callId: string,
  transcriptionData: {
    fullTranscript: string;
    speakerTurns: TranscriptionSpeakerTurn[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    sentimentScore: number;
    keyPhrases: string[];
    entities: Record<string, any>;
    wordCount: number;
    speakerCount: number;
  }
): Promise<CallTranscription> {
  const insert: CallTranscriptionInsert = {
    account_id: accountId,
    call_id: callId,
    full_transcript: transcriptionData.fullTranscript,
    transcript_data: transcriptionData.speakerTurns,
    transcription_provider: 'google',
    language: 'en-US',
    confidence_score: 92,
    status: 'completed',
    completed_at: new Date().toISOString(),
    duration_seconds: Math.round(
      (transcriptionData.speakerTurns[transcriptionData.speakerTurns.length - 1]?.end_time ?? 0)
    ),
    word_count: transcriptionData.wordCount,
    speaker_count: transcriptionData.speakerCount,
    key_phrases: transcriptionData.keyPhrases,
    entities: transcriptionData.entities,
    overall_sentiment: transcriptionData.sentiment,
    sentiment_score: transcriptionData.sentimentScore,
    emotion_analysis: {},
    tags: [],
    custom_fields: {},
    is_favorite: false,
  };

  const { data, error } = await supabase
    .from('call_transcriptions')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Get Transcriptions by Sentiment

```typescript
async function getTranscriptionsBySentiment(
  accountId: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  daysBack: number = 7
): Promise<CallTranscription[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('call_transcriptions')
    .select('*')
    .eq('account_id', accountId)
    .eq('overall_sentiment', sentiment)
    .gte('created_at', cutoffDate.toISOString())
    .order('sentiment_score', { ascending: sentiment === 'negative' })
    .limit(50);

  if (error) throw error;
  return data || [];
}
```

### Search Transcriptions

```typescript
async function searchTranscriptions(
  accountId: string,
  searchText: string,
  options: {
    limit?: number;
    daysBack?: number;
  } = {}
): Promise<CallTranscription[]> {
  const { limit = 20, daysBack = 30 } = options;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('call_transcriptions')
    .select('*')
    .eq('account_id', accountId)
    .gte('created_at', cutoffDate.toISOString())
    .textSearch(
      'full_transcript',
      searchText,
      {
        type: 'websearch',
        config: 'english',
      }
    )
    .limit(limit);

  if (error) throw error;
  return data || [];
}
```

---

## IVR Menu Management

### Create IVR Menu

```typescript
import { IVRMenuInsert, MenuOption } from '@/types/calls_and_voice.types';

async function createIVRMenu(
  accountId: string,
  createdBy: string,
  menuData: {
    name: string;
    description: string;
    greetingPromptId: string;
    menuOptions: MenuOption[];
  }
): Promise<IVRMenu> {
  const insert: IVRMenuInsert = {
    account_id: accountId,
    created_by: createdBy,
    name: menuData.name,
    description: menuData.description,
    greeting_prompt_id: menuData.greetingPromptId,
    menu_structure: menuData.menuOptions,
    timeout_seconds: 10,
    max_retries: 3,
    record_calls: true,
    record_caller_input: false,
    is_active: true,
    status: 'draft',
    total_calls_handled: 0,
    total_transfers: 0,
    average_duration_seconds: 0,
    tags: [],
    custom_fields: {},
  };

  const { data, error } = await supabase
    .from('ivr_menus')
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Example Menu Structure

```typescript
const salesAndSupportMenu: MenuOption[] = [
  {
    key: '1',
    label: 'Sales',
    action: 'transfer',
    value: '+1-555-0100',
    description: 'Transfer to sales team',
  },
  {
    key: '2',
    label: 'Technical Support',
    action: 'transfer',
    value: '+1-555-0200',
    description: 'Transfer to support team',
  },
  {
    key: '3',
    label: 'Billing',
    action: 'transfer',
    value: '+1-555-0300',
    description: 'Transfer to billing',
  },
  {
    key: '4',
    label: 'Press 4 to repeat this menu',
    action: 'repeat',
    description: 'Repeat the menu options',
  },
  {
    key: '0',
    label: 'Operator',
    action: 'transfer',
    value: '+1-555-0999',
    description: 'Transfer to operator',
  },
];
```

### Activate IVR Menu

```typescript
async function activateIVRMenu(
  menuId: string,
  accountId: string
): Promise<void> {
  const { error } = await supabase
    .from('ivr_menus')
    .update({
      status: 'active',
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', menuId)
    .eq('account_id', accountId);

  if (error) throw error;
}
```

### Get IVR Menu Statistics

```typescript
async function getIVRMenuStats(
  menuId: string,
  accountId: string
): Promise<{
  menu: IVRMenu;
  stats: {
    callsPerDay: number;
    transferRate: number;
    completionRate: number;
  };
}> {
  const { data: menu, error: menuError } = await supabase
    .from('ivr_menus')
    .select('*')
    .eq('id', menuId)
    .eq('account_id', accountId)
    .single();

  if (menuError) throw menuError;

  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact' })
    .eq('ivr_menu_id', menuId)
    .eq('account_id', accountId)
    .gte('initiated_at', new Date(Date.now() - 86400000).toISOString());

  return {
    menu,
    stats: {
      callsPerDay: totalCalls || 0,
      transferRate: menu.total_transfers / Math.max(menu.total_calls_handled, 1),
      completionRate:
        (menu.total_calls_handled - menu.total_transfers) /
        Math.max(menu.total_calls_handled, 1),
    },
  };
}
```

---

## Twilio Integration

### Webhook Handler for Call Status Updates

```typescript
import { Request, Response } from 'express';

export async function handleTwilioCallStatus(
  req: Request,
  res: Response
): Promise<void> {
  const { CallSid, CallStatus, CallDuration, Direction, From, To } = req.body;
  const accountId = req.user.accountId; // From JWT or session

  try {
    // Map Twilio statuses to our statuses
    const statusMap: Record<string, string> = {
      initiated: 'initiated',
      ringing: 'ringing',
      in-progress: 'in-progress',
      completed: 'completed',
      failed: 'failed',
      busy: 'busy',
      'no-answer': 'no-answer',
    };

    // Get existing call
    const { data: call, error: fetchError } = await supabase
      .from('calls')
      .select('*')
      .eq('call_sid', CallSid)
      .eq('account_id', accountId)
      .single();

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Update call status
    await updateCallStatus(call.id, accountId, {
      status: statusMap[CallStatus],
      endedAt: CallStatus === 'completed' ? new Date().toISOString() : undefined,
      duration: CallStatus === 'completed' ? parseInt(CallDuration) : undefined,
    });

    // Log call event
    await supabase.from('call_logs').insert({
      account_id: accountId,
      call_id: call.id,
      event_type: CallStatus as any,
      event_data: { CallSid, CallStatus, CallDuration },
      logged_at: new Date().toISOString(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Webhook Handler for Recording Completion

```typescript
export async function handleTwilioRecording(
  req: Request,
  res: Response
): Promise<void> {
  const {
    RecordingSid,
    RecordingUrl,
    RecordingDuration,
    CallSid,
  } = req.body;
  const accountId = req.user.accountId;

  try {
    // Find the call
    const { data: call, error: fetchError } = await supabase
      .from('calls')
      .select('*')
      .eq('call_sid', CallSid)
      .eq('account_id', accountId)
      .single();

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Store recording
    await storeRecording(accountId, call.id, {
      recordingSid: RecordingSid,
      recordingUrl: RecordingUrl,
      durationSeconds: parseInt(RecordingDuration),
      storageProvider: 'twilio',
    });

    // Log event
    await supabase.from('call_logs').insert({
      account_id: accountId,
      call_id: call.id,
      event_type: 'recording_stopped',
      event_data: { RecordingSid, RecordingUrl },
      logged_at: new Date().toISOString(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Recording webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Analytics Queries

### Call Summary Statistics

```typescript
async function getCallStatistics(
  accountId: string,
  daysBack: number = 30
): Promise<{
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  avgDuration: number;
  totalCost: number;
  completedCalls: number;
  failedCalls: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .eq('account_id', accountId)
    .gte('initiated_at', cutoffDate.toISOString());

  if (error) throw error;

  const calls = data || [];

  return {
    totalCalls: calls.length,
    inboundCalls: calls.filter((c) => c.direction === 'inbound').length,
    outboundCalls: calls.filter((c) => c.direction === 'outbound').length,
    avgDuration:
      calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) /
      Math.max(calls.length, 1),
    totalCost: calls.reduce((sum, c) => sum + (c.cost || 0), 0),
    completedCalls: calls.filter((c) => c.status === 'completed').length,
    failedCalls: calls.filter((c) => c.status === 'failed').length,
  };
}
```

### Sentiment Trend Analysis

```typescript
async function getSentimentTrend(
  accountId: string,
  daysBack: number = 30
): Promise<Array<{ date: string; sentiment: string; count: number }>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('call_transcriptions')
    .select('created_at, overall_sentiment')
    .eq('account_id', accountId)
    .gte('created_at', cutoffDate.toISOString());

  if (error) throw error;

  // Group by date and sentiment
  const grouped: Record<string, Record<string, number>> = {};
  (data || []).forEach((row) => {
    const date = new Date(row.created_at).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = {};
    grouped[date][row.overall_sentiment || 'unknown'] =
      (grouped[date][row.overall_sentiment || 'unknown'] || 0) + 1;
  });

  // Flatten to array
  const result: Array<{ date: string; sentiment: string; count: number }> = [];
  Object.entries(grouped).forEach(([date, sentiments]) => {
    Object.entries(sentiments).forEach(([sentiment, count]) => {
      result.push({ date, sentiment, count });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}
```

### Top Contacts by Call Volume

```typescript
async function getTopContacts(
  accountId: string,
  limit: number = 10
): Promise<
  Array<{ phone: string; name: string; callCount: number; avgDuration: number }>
> {
  const { data, error } = await supabase
    .from('calls')
    .select('caller_phone, caller_name, duration_seconds')
    .eq('account_id', accountId)
    .order('initiated_at', { ascending: false })
    .limit(1000);

  if (error) throw error;

  // Group by phone
  const grouped: Record<
    string,
    { name: string; calls: number; totalDuration: number }
  > = {};
  (data || []).forEach((call) => {
    const phone = call.caller_phone;
    if (!grouped[phone]) {
      grouped[phone] = {
        name: call.caller_name || '',
        calls: 0,
        totalDuration: 0,
      };
    }
    grouped[phone].calls++;
    grouped[phone].totalDuration += call.duration_seconds || 0;
  });

  // Convert to array and sort
  const result = Object.entries(grouped)
    .map(([phone, data]) => ({
      phone,
      name: data.name,
      callCount: data.calls,
      avgDuration: Math.round(data.totalDuration / data.calls),
    }))
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, limit);

  return result;
}
```

---

## More Examples Available

For additional implementation examples, see:

- `docs/MIGRATION_CALLS_AND_VOICE.md` - Complete schema documentation
- `types/calls_and_voice.types.ts` - Full TypeScript type definitions
- `supabase/migrations/20260625_create_calls_and_voice_system.sql` - Database schema
