# Calls & Voice System - Quick Reference

## Migration Files

| File | Lines | Purpose |
|------|-------|---------|
| `supabase/migrations/20260625_create_calls_and_voice_system.sql` | 752 | SQL migration with all 8 tables, RLS, triggers, functions |
| `docs/MIGRATION_CALLS_AND_VOICE.md` | 507 | Comprehensive documentation and usage examples |
| `types/calls_and_voice.types.ts` | 425 | TypeScript type definitions for all tables |

## Tables Summary

```
voice_prompts (voice messages)
    ↓
ivr_menus (IVR configuration)
    ↓
calls (main call records) ← call_recordings
                        ← call_transcriptions (sentiment analysis)
                        ← call_logs (activity audit trail)
                        ← call_notes (user annotations)
    ↓
call_queues (call center operations)
```

## Core Fields Checklist

### calls table
- [x] `call_sid` - Twilio identifier (UNIQUE)
- [x] `caller_phone` / `recipient_phone` - Phone numbers
- [x] `status` - Call state (initiated → completed/failed)
- [x] `direction` - inbound/outbound
- [x] `initiated_at` / `answered_at` / `ended_at` - Timestamps
- [x] `duration_seconds` - Auto-calculated
- [x] `cost` - Billing amount
- [x] `quality_score` - Voice quality (0-100)
- [x] `disposition` - Call outcome
- [x] `contact_id` / `campaign_id` - References

### call_recordings table
- [x] `recording_sid` - Twilio identifier (UNIQUE)
- [x] `recording_url` - Playback URL
- [x] `storage_provider` - twilio/s3/gcs/local
- [x] `encoding` - ulaw/wav/mp3/ogg
- [x] `is_encrypted` - Compliance flag
- [x] `status` - pending/processing/ready/archived

### call_transcriptions table
- [x] `full_transcript` - Complete text
- [x] `transcript_data` - Structured speaker turns
- [x] `overall_sentiment` - positive/negative/neutral/mixed
- [x] `sentiment_score` - -1.0 to 1.0
- [x] `emotion_analysis` - Per-speaker emotion data
- [x] `key_phrases` - Extracted important phrases
- [x] `entities` - NER: names, companies, dates
- [x] `word_count` - Auto-calculated
- [x] `speaker_count` - Number of speakers

### ivr_menus table
- [x] `menu_structure` - JSON array of menu options
- [x] `greeting_prompt_id` - Voice prompt reference
- [x] `timeout_seconds` - Inactivity timeout
- [x] `max_retries` - Retry limit
- [x] `record_calls` - Recording enabled flag

### voice_prompts table
- [x] `prompt_text` - TTS content
- [x] `audio_url` - Pre-recorded file
- [x] `language` - ISO language code
- [x] `voice_type` - male/female/custom
- [x] `voice_speed` - 0.5-2.0 multiplier
- [x] `prompt_type` - Classification

## RLS Policy Pattern

All 8 tables follow this pattern:

```sql
-- SELECT
account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid()
)

-- DELETE (admins only)
account_id IN (
  SELECT account_id FROM account_members
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
)
```

## Key Features

### Multi-Tenancy
- All tables include `account_id` for tenant isolation
- RLS policies enforce account membership checks
- Service role has full access for backend jobs

### Twilio Integration
- `call_sid` as unique external identifier
- `recording_sid` for recording tracking
- Webhook callbacks via `call_logs`
- Status updates: initiated → ringing → in-progress → completed

### Advanced NLP & Analysis
- Sentiment analysis: positive/negative/neutral/mixed
- Emotion detection per speaker turn
- Entity extraction: names, organizations, dates
- Key phrase identification
- Structured speaker turn data with confidence scores

### Analytics & Metrics
- Call duration (auto-calculated)
- Cost tracking per call
- Quality scores
- Queue metrics: wait time, answer rate, AHT
- Prompt usage tracking
- IVR statistics

### Compliance & Security
- Soft-delete support for recordings (`deleted_at`)
- Encryption support (`is_encrypted`, `encryption_key_id`)
- Archival functionality
- Full audit trail via call_logs
- User-specific notes and annotations

### Flexible Storage
- Twilio native (default)
- AWS S3 (long-term)
- Google Cloud Storage
- Local on-premise
- Binary data support for local storage

## Indexes by Purpose

| Index | Tables | Purpose |
|-------|--------|---------|
| `account_id` | ALL | Multi-tenant isolation |
| `call_sid` / `recording_sid` | calls / recordings | Twilio webhook lookup |
| `status` | calls / recordings / transcriptions | Filter by state |
| `initiated_at` / `created_at` | Most tables | Chronological queries |
| `caller_phone` / `recipient_phone` | calls | Contact matching |
| `sentiment` | transcriptions | Sentiment-based analysis |

## Triggers

| Trigger | Table | Function |
|---------|-------|----------|
| `trg_calls_update_duration` | calls | Auto-calculate duration from timestamps |
| `trg_ivr_menus_increment_usage` | ivr_menus | Increment prompt usage count |
| `trg_transcriptions_calc_metrics` | call_transcriptions | Auto-calculate word count |

## Common Queries

### Get all calls for an account
```sql
SELECT * FROM calls
WHERE account_id = $1
ORDER BY initiated_at DESC
LIMIT 50;
```

### Find negative sentiment calls
```sql
SELECT c.*, ct.overall_sentiment, ct.sentiment_score
FROM calls c
LEFT JOIN call_transcriptions ct ON c.id = ct.call_id
WHERE c.account_id = $1
  AND ct.overall_sentiment = 'negative'
ORDER BY c.initiated_at DESC;
```

### Get call with all related data
```sql
SELECT 
  c.*,
  cr.recording_url,
  ct.full_transcript,
  ARRAY_AGG(cn.note_text) as notes
FROM calls c
LEFT JOIN call_recordings cr ON c.id = cr.call_id
LEFT JOIN call_transcriptions ct ON c.id = ct.call_id
LEFT JOIN call_notes cn ON c.id = cn.call_id
WHERE c.id = $1 AND c.account_id = $2
GROUP BY c.id, cr.id, ct.id;
```

### Get IVR menu stats
```sql
SELECT 
  im.name,
  im.status,
  COUNT(c.id) as call_count,
  AVG(c.duration_seconds) as avg_duration,
  SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END)::float / COUNT(c.id) as completion_rate
FROM ivr_menus im
LEFT JOIN calls c ON im.id = c.ivr_menu_id
WHERE im.account_id = $1
GROUP BY im.id
ORDER BY call_count DESC;
```

### Transcription analytics
```sql
SELECT 
  overall_sentiment,
  COUNT(*) as count,
  AVG(sentiment_score) as avg_score,
  AVG(word_count) as avg_words
FROM call_transcriptions
WHERE account_id = $1
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY overall_sentiment;
```

## Data Volume Estimates

**Per 10,000 calls/month:**
- calls: ~5 MB
- call_logs: ~25-50 MB (5-10 events per call)
- call_transcriptions: ~20-50 MB (2-5 KB avg)
- call_recordings: External storage only
- **Total: ~75-150 MB** (excluding recordings)

**Storage requirements:**
- 100K calls/month: ~750 MB - 1.5 GB
- 1M calls/month: ~7.5 GB - 15 GB

## Deployment Checklist

- [ ] Apply migration: `supabase migration up`
- [ ] Verify tables: `supabase db ls-tables`
- [ ] Test RLS policies with authenticated user
- [ ] Configure Twilio webhooks:
  - Call status updates → `/api/webhooks/twilio/calls`
  - Recording completion → `/api/webhooks/twilio/recordings`
- [ ] Set up transcription service:
  - Configure API credentials
  - Set up async job queue
- [ ] Create TypeScript types from schema
- [ ] Implement backend services:
  - Call logging service
  - Transcription job processor
  - Analytics aggregation
- [ ] Build UI components:
  - Call history view with filters
  - Recording player with timestamp controls
  - Transcription viewer with sentiment highlighting
  - IVR menu builder
  - Call queue management dashboard

## Support & Resources

- **Full Migration Documentation:** `docs/MIGRATION_CALLS_AND_VOICE.md`
- **TypeScript Types:** `types/calls_and_voice.types.ts`
- **Migration File:** `supabase/migrations/20260625_create_calls_and_voice_system.sql`
- **Related:** Multi-tenant setup (`20260624_create_multi_tenant.sql`)

## Version Info

- Created: 2026-06-25
- Database: PostgreSQL (Supabase)
- Tables: 8
- Policies: 32 (4 per table)
- Functions: 3
- Triggers: 3
- Lines of SQL: 752
