# Calls & Voice System Migration Guide

**File:** `supabase/migrations/20260625_create_calls_and_voice_system.sql`

This migration implements a complete calls and voice management system for Voxmation, including IVR menus, voice prompts, call tracking, transcriptions, and analytics.

## Tables Overview

### 1. **voice_prompts**
Manages reusable voice messages and prompts for IVR systems.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `name` - Prompt display name
- `prompt_text` - Text-to-speech content
- `audio_url` - Pre-recorded audio file URL
- `language` - Supported languages (en-US, es-ES, fr-FR, etc.)
- `voice_type` - Male/Female/Custom
- `voice_speed` - TTS speed multiplier (0.5 - 2.0)
- `voice_pitch` - TTS pitch multiplier (0.5 - 2.0)
- `prompt_type` - Classification (greeting, menu_option, hold_message, etc.)
- `usage_count` - Auto-incremented when used

**Indexes:**
- `account_id` - Multi-tenant queries
- `prompt_type` - Filter by prompt classification
- `is_active` - Find active prompts
- `created_at` - Chronological ordering

---

### 2. **ivr_menus**
Interactive Voice Response menu configuration and management.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `name` - Menu name
- `greeting_prompt_id` - Reference to voice_prompts
- `menu_structure` - JSON structure defining menu options
  ```json
  [
    {
      "key": "1",
      "label": "Sales",
      "action": "transfer",
      "value": "+1234567890"
    },
    {
      "key": "2",
      "label": "Support",
      "action": "transfer",
      "value": "+0987654321"
    }
  ]
  ```
- `timeout_seconds` - Time before prompt repetition (default: 10)
- `max_retries` - Maximum retries before disconnect (default: 3)
- `record_calls` - Enable/disable call recording
- `record_caller_input` - Capture DTMF input
- `status` - draft/active/paused/archived
- Analytics fields: `total_calls_handled`, `total_transfers`, `average_duration_seconds`

**Indexes:**
- `account_id` - Tenant isolation
- `status` - Filter by status
- `is_active` - Find active menus
- `created_at` - Recent creation tracking

---

### 3. **calls**
Core call records with comprehensive metadata and status tracking.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `contact_id` - Reference to contacts (nullable)
- `campaign_id` - Reference to campaigns (nullable)
- `ivr_menu_id` - Reference to IVR menu used
- `call_sid` - Twilio Call SID (UNIQUE - external identifier)
- `parent_call_sid` - For transferred calls
- `caller_phone` - Calling party phone number
- `caller_name` - Calling party name (optional)
- `recipient_phone` - Called party phone number
- `recipient_name` - Called party name (optional)
- `status` - initiated/ringing/in-progress/completed/failed/no-answer/busy/cancelled
- `direction` - inbound/outbound
- `initiated_at` - Call start time
- `answered_at` - Answer time
- `started_at` - Conversation start time
- `ended_at` - Call end time
- `duration_seconds` - Auto-calculated from timestamps
- `cost` - Billing cost
- `currency` - ISO 4217 code (default: USD)
- `quality_score` - 0-100 quality metric
- `voice_mail_detected` - VM detection flag
- `disposition` - Call outcome (answered/voicemail/busy/failed/transferred)
- `disconnect_reason` - Human-readable disconnect reason
- `disconnect_code` - SIP/Twilio error code

**Indexes:**
- `account_id` - Tenant isolation
- `contact_id` - Link to contacts
- `campaign_id` - Link to campaigns
- `call_sid` - External ID lookup
- `status` - Filter by call status
- `direction` - Inbound/outbound queries
- `caller_phone` - Phone-based lookups
- `recipient_phone` - Phone-based lookups
- `initiated_at` - Chronological queries

---

### 4. **call_recordings**
Audio recording storage and management.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `call_id` - Reference to calls (NOT NULL)
- `recording_sid` - Twilio Recording SID (UNIQUE)
- `duration_seconds` - Recording length
- `recording_url` - Public/private recording URL
- `recording_data` - Binary audio data (optional local storage)
- `storage_provider` - twilio/s3/gcs/local
- `storage_path` - Path in storage provider
- `channels` - Mono (1) or Stereo (2)
- `encoding` - ulaw/wav/mp3/ogg
- `sample_rate` - Hertz (default: 8000)
- `status` - pending/processing/ready/archived/deleted
- `is_archived` - Soft delete flag
- `is_favorite` - User favorite marking
- `is_encrypted` - Encryption status
- `encryption_key_id` - Reference to encryption key

**Indexes:**
- `account_id` - Tenant isolation
- `call_id` - Link to calls
- `recording_sid` - External ID lookup
- `status` - Filter by processing status
- `created_at` - Recent recordings

---

### 5. **call_transcriptions**
Speech-to-text transcriptions with NLP analysis.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `call_id` - Reference to calls (NOT NULL)
- `call_recording_id` - Reference to recording (optional)
- `full_transcript` - Complete transcript text
- `transcript_data` - Structured speaker turns
  ```json
  [
    {
      "speaker": "caller",
      "text": "Hello, how can I help you?",
      "start_time": 0.5,
      "end_time": 2.3,
      "confidence": 0.95
    }
  ]
  ```
- `transcription_provider` - twilio/google/aws/assembly_ai/custom
- `language` - ISO language code
- `confidence_score` - Average confidence 0-100
- `status` - pending/processing/completed/failed/error
- `processing_started_at` - Processing start timestamp
- `completed_at` - Completion timestamp
- `error_message` - Error details if failed

**NLP Analysis Fields:**
- `key_phrases` - Extracted important phrases
- `entities` - Named entity recognition (names, companies, dates)
- `overall_sentiment` - positive/negative/neutral/mixed
- `sentiment_score` - -1.0 (negative) to 1.0 (positive)
- `emotion_analysis` - Detailed emotion scores per speaker turn
  ```json
  {
    "turn_1": {
      "happiness": 0.8,
      "frustration": 0.2,
      "confusion": 0.1
    }
  }
  ```

**Metrics:**
- `duration_seconds` - Recording duration
- `word_count` - Total words (auto-calculated)
- `speaker_count` - Number of distinct speakers

**Indexes:**
- `account_id` - Tenant isolation
- `call_id` - Link to calls
- `recording_id` - Link to recordings
- `status` - Filter by transcription status
- `overall_sentiment` - Sentiment-based queries
- `created_at` - Recent transcriptions

---

### 6. **call_logs**
Detailed activity log for each call event.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `call_id` - Reference to calls (NOT NULL)
- `event_type` - initiated/ringing/answered/held/transferred/conference/ivr_input/recording_started/recording_stopped/voicemail/disconnected/failed
- `event_data` - Flexible JSON for event-specific data
- `logged_at` - Event timestamp
- `details` - Human-readable event description

**Indexes:**
- `account_id` - Tenant isolation
- `call_id` - Link to calls
- `event_type` - Filter by event
- `logged_at` - Chronological queries

---

### 7. **call_notes**
User annotations and notes on calls.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `call_id` - Reference to calls (NOT NULL)
- `created_by` - Reference to profiles
- `note_text` - Annotation text
- `note_type` - general/follow_up/issue/feedback/action_item
- `is_pinned` - Pin important notes to top

**Indexes:**
- `account_id` - Tenant isolation
- `call_id` - Link to calls
- `created_by` - User's notes
- `created_at` - Chronological ordering

---

### 8. **call_queues**
Call center queue management and SLA tracking.

**Key Fields:**
- `id` - UUID primary key
- `account_id` - Multi-tenant isolation
- `name` - Queue name
- `description` - Queue purpose
- `max_queue_size` - Maximum concurrent calls (optional)
- `priority_level` - Queue priority (0 = lowest)
- `is_active` - Enable/disable queue
- `status` - open/paused/closed
- `routing_strategy` - round_robin/least_busy/fifo/priority/skill_based
- `average_wait_time_seconds` - SLA tracking
- `answer_rate` - Percentage of calls answered

**Metrics:**
- `current_queue_length` - Calls waiting
- `total_calls_handled` - Cumulative
- `total_calls_missed` - Missed SLA
- `average_handle_time_seconds` - AHT metric

**Indexes:**
- `account_id` - Tenant isolation
- `status` - Filter by queue status
- `is_active` - Find active queues
- `created_at` - Recent creation

---

## Row Level Security (RLS) Policies

All tables have RLS enabled with consistent multi-tenant isolation:

### SELECT Policy
```sql
account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid()
)
```
Users can only view data from accounts they're members of.

### INSERT Policy
```sql
account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid()
)
```
Users can only insert data into accounts they're members of.

### UPDATE Policy
Same as SELECT - users can modify their account data.

### DELETE Policy
```sql
account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
)
```
Only account owners and admins can delete data.

---

## Helper Functions & Triggers

### 1. `update_call_duration()`
**Trigger:** `trg_calls_update_duration` (BEFORE UPDATE on calls)
- Automatically calculates `duration_seconds` from `started_at` and `ended_at`
- Converts EPOCH difference to integer seconds

### 2. `increment_prompt_usage()`
**Trigger:** `trg_ivr_menus_increment_usage` (AFTER INSERT on ivr_menus)
- Increments `usage_count` on associated voice_prompts
- Updates `updated_at` timestamp

### 3. `calculate_transcription_metrics()`
**Trigger:** `trg_transcriptions_calc_metrics` (BEFORE INSERT/UPDATE on call_transcriptions)
- Automatically calculates `word_count` from `full_transcript`
- Splits text on spaces and counts array length

---

## Integration Points

### Twilio Webhook Integration
The migration supports Twilio webhooks for real-time updates:
- `call_sid` acts as the unique identifier for webhook callbacks
- `call_logs` records all Twilio events
- Timestamps automatically updated via webhooks

### Transcription Services
Supports multiple transcription providers:
- **Twilio** - Native Twilio transcription
- **Google Cloud Speech-to-Text** - Higher accuracy
- **AWS Transcribe** - Batch processing
- **AssemblyAI** - Advanced NLP features
- **Custom** - Self-hosted solutions

### Storage Options
Recording storage flexibility:
- **Twilio** - Default, expires per policy
- **AWS S3** - Long-term archival
- **Google Cloud Storage** - Enterprise archival
- **Local** - On-premise deployment

---

## Performance Optimization

### Indexes Strategy
- Account-based filtering is primary (multi-tenant)
- Status and timestamp queries are frequent
- Phone number lookups for contact matching
- External IDs (call_sid, recording_sid) for webhook processing

### Data Volume Considerations
- Call records: ~500 bytes per record
- Recordings: Large BLOB/file references only
- Transcriptions: ~2-5 KB per call
- Logs: ~500 bytes per event (typically 5-10 events per call)

**Example storage for 10,000 calls/month:**
- Calls: ~5 MB
- Call logs: ~25-50 MB
- Transcriptions: ~20-50 MB
- Recordings: External storage (S3/Twilio)

---

## Usage Examples

### Create a Voice Prompt
```sql
INSERT INTO voice_prompts (account_id, created_by, name, prompt_text, language, voice_type)
VALUES (
  'acc-123',
  'user-456',
  'Main Menu Greeting',
  'Welcome to Acme Corp. Press 1 for Sales, 2 for Support.',
  'en-US',
  'female'
);
```

### Create an IVR Menu
```sql
INSERT INTO ivr_menus (account_id, created_by, name, greeting_prompt_id, menu_structure)
VALUES (
  'acc-123',
  'user-456',
  'Main IVR',
  'prompt-789',
  '[
    {"key": "1", "label": "Sales", "action": "transfer", "value": "+1-555-0100"},
    {"key": "2", "label": "Support", "action": "transfer", "value": "+1-555-0200"}
  ]'::jsonb
);
```

### Log an Incoming Call
```sql
INSERT INTO calls (account_id, call_sid, caller_phone, recipient_phone, status, direction, initiated_at)
VALUES (
  'acc-123',
  'CA1234567890',
  '+1-555-0001',
  '+1-555-0050',
  'initiated',
  'inbound',
  NOW()
);
```

### Add Transcription
```sql
INSERT INTO call_transcriptions (account_id, call_id, full_transcript, transcription_provider, status)
VALUES (
  'acc-123',
  'call-999',
  'Customer: How much is shipping? Agent: Shipping is free for orders over $100.',
  'google',
  'processing'
);
```

### Query Calls with Sentiment Analysis
```sql
SELECT 
  c.id,
  c.caller_phone,
  ct.full_transcript,
  ct.overall_sentiment,
  ct.sentiment_score
FROM calls c
LEFT JOIN call_transcriptions ct ON c.id = ct.call_id
WHERE c.account_id = 'acc-123'
  AND ct.overall_sentiment = 'negative'
  AND c.initiated_at > NOW() - INTERVAL '7 days'
ORDER BY c.initiated_at DESC;
```

---

## Security Considerations

1. **Recording Encryption** - Use `is_encrypted` + `encryption_key_id` for HIPAA/PCI compliance
2. **Soft Deletes** - Recordings support `deleted_at` for compliance hold periods
3. **Access Control** - RLS ensures users only access their account data
4. **Admin Operations** - Service role has full access for backend jobs
5. **Phone Number Privacy** - Consider PII redaction in logs

---

## Migration Steps

1. **Apply migration:**
   ```bash
   supabase migration up
   ```

2. **Verify tables:**
   ```bash
   supabase db ls-tables
   ```

3. **Test RLS policies:**
   - Authenticate with test user
   - Verify account isolation
   - Test INSERT/UPDATE/DELETE permissions

4. **Configure Twilio webhooks:**
   - Point Twilio to `/api/webhooks/twilio/call-status`
   - Point Twilio to `/api/webhooks/twilio/recording`

5. **Set up transcription service:**
   - Configure API keys in environment
   - Set up background job for async transcription

---

## Related Migrations

- `20260624_create_multi_tenant.sql` - Account & multi-tenant setup
- `20260624_create_crm_tables.sql` - Contacts & accounts
- `20260625_create_campaigns_system.sql` - Email/SMS campaigns

---

## Future Enhancements

- [ ] Call transfer logs with blind/warm transfer tracking
- [ ] Conference call support with participant tracking
- [ ] Call coaching & recording review system
- [ ] Real-time call analytics dashboard
- [ ] SMS transcription integration
- [ ] Voicemail transcription to email
- [ ] Call heat maps and geographic analytics
- [ ] Competitor call pricing comparison
