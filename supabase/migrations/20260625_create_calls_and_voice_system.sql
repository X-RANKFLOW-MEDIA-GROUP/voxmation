-- PHASE 5: CALLS & VOICE SYSTEM
-- Twilio integration, call tracking, IVR menus, voice prompts, and call analytics

-- ============================================
-- VOICE PROMPTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Prompt content
  prompt_text TEXT NOT NULL,  -- Text-to-speech content
  audio_url TEXT,  -- Pre-recorded audio file URL
  audio_duration_seconds INTEGER,

  -- Audio settings
  language TEXT DEFAULT 'en-US' CHECK (language IN ('en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'it-IT', 'ja-JP', 'zh-CN', 'other')),
  voice_type TEXT DEFAULT 'female' CHECK (voice_type IN ('male', 'female', 'custom')),
  voice_speed NUMERIC(3, 2) DEFAULT 1.0,  -- 0.5 to 2.0 multiplier
  voice_pitch NUMERIC(3, 2) DEFAULT 1.0,  -- 0.5 to 2.0 multiplier

  -- Prompt type
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('greeting', 'menu_option', 'hold_message', 'error_message', 'transfer_message', 'disconnect_message', 'custom')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  CONSTRAINT prompt_text_or_audio CHECK (prompt_text != '' OR audio_url IS NOT NULL),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_voice_prompts_account ON voice_prompts(account_id);
CREATE INDEX idx_voice_prompts_type ON voice_prompts(prompt_type);
CREATE INDEX idx_voice_prompts_active ON voice_prompts(is_active);
CREATE INDEX idx_voice_prompts_created ON voice_prompts(created_at DESC);

-- ============================================
-- IVR MENUS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ivr_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Menu configuration
  greeting_prompt_id UUID REFERENCES voice_prompts(id) ON DELETE SET NULL,
  menu_structure JSONB NOT NULL DEFAULT '{}',  -- Flexible JSON for menu options: [{"key": "1", "label": "Sales", "action": "transfer", "value": "+1234567890"}, ...]

  -- IVR settings
  timeout_seconds INTEGER DEFAULT 10,
  max_retries INTEGER DEFAULT 3,
  invalid_option_message TEXT,
  timeout_message TEXT,

  -- Recording options
  record_calls BOOLEAN DEFAULT false,
  record_caller_input BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),

  -- Analytics
  total_calls_handled INTEGER DEFAULT 0,
  total_transfers INTEGER DEFAULT 0,
  average_duration_seconds INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_ivr_menus_account ON ivr_menus(account_id);
CREATE INDEX idx_ivr_menus_status ON ivr_menus(status);
CREATE INDEX idx_ivr_menus_active ON ivr_menus(is_active);
CREATE INDEX idx_ivr_menus_created ON ivr_menus(created_at DESC);

-- ============================================
-- CALLS TABLE (Main call record)
-- ============================================

CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  ivr_menu_id UUID REFERENCES ivr_menus(id) ON DELETE SET NULL,

  -- Call identifiers
  call_sid TEXT NOT NULL UNIQUE,  -- Twilio Call SID
  parent_call_sid TEXT,  -- For transferred calls, reference to parent

  -- Call participants
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,

  -- Call status
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer', 'busy', 'cancelled')),
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),

  -- Call timing
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Call cost
  cost NUMERIC(10, 4),
  currency TEXT DEFAULT 'USD',

  -- Call quality metrics
  quality_score NUMERIC(5, 2),  -- 0-100
  voice_mail_detected BOOLEAN DEFAULT false,

  -- Call disposition
  disposition TEXT CHECK (disposition IN ('answered', 'voicemail', 'busy', 'no-answer', 'failed', 'transferred', 'disconnected', null)),
  disconnect_reason TEXT,
  disconnect_code INTEGER,

  -- Tags and custom fields
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calls_account ON calls(account_id);
CREATE INDEX idx_calls_contact ON calls(contact_id);
CREATE INDEX idx_calls_campaign ON calls(campaign_id);
CREATE INDEX idx_calls_call_sid ON calls(call_sid);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_direction ON calls(direction);
CREATE INDEX idx_calls_caller ON calls(caller_phone);
CREATE INDEX idx_calls_recipient ON calls(recipient_phone);
CREATE INDEX idx_calls_initiated ON calls(initiated_at DESC);
CREATE INDEX idx_calls_answered ON calls(answered_at DESC);

-- ============================================
-- CALL RECORDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,

  -- Recording details
  recording_sid TEXT NOT NULL UNIQUE,  -- Twilio Recording SID
  duration_seconds INTEGER,

  -- Recording URLs
  recording_url TEXT NOT NULL,
  recording_data BYTEA,  -- Binary recording data if stored locally

  -- Storage
  storage_provider TEXT DEFAULT 'twilio' CHECK (storage_provider IN ('twilio', 's3', 'gcs', 'local')),
  storage_path TEXT,

  -- Metadata
  channels INTEGER DEFAULT 1,  -- Mono/Stereo
  encoding TEXT DEFAULT 'ulaw' CHECK (encoding IN ('ulaw', 'wav', 'mp3', 'ogg')),
  sample_rate INTEGER DEFAULT 8000,  -- Hz

  -- Status
  status TEXT DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'ready', 'archived', 'deleted')),
  is_archived BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,

  -- Security
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key_id TEXT,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_call_recordings_account ON call_recordings(account_id);
CREATE INDEX idx_call_recordings_call ON call_recordings(call_id);
CREATE INDEX idx_call_recordings_recording_sid ON call_recordings(recording_sid);
CREATE INDEX idx_call_recordings_status ON call_recordings(status);
CREATE INDEX idx_call_recordings_created ON call_recordings(created_at DESC);

-- ============================================
-- CALL TRANSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS call_transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  call_recording_id UUID REFERENCES call_recordings(id) ON DELETE SET NULL,

  -- Transcription content
  full_transcript TEXT,

  -- Structured transcript (speaker turns)
  transcript_data JSONB DEFAULT '[]',  -- Array of {speaker, text, start_time, end_time, confidence}

  -- Transcription metadata
  transcription_provider TEXT DEFAULT 'twilio' CHECK (transcription_provider IN ('twilio', 'google', 'aws', 'assembly_ai', 'custom')),
  language TEXT DEFAULT 'en-US',
  confidence_score NUMERIC(5, 2),  -- Average confidence 0-100

  -- Transcription status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'error')),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Analysis
  duration_seconds INTEGER,
  word_count INTEGER,
  speaker_count INTEGER,

  -- Key information extraction
  key_phrases TEXT[] DEFAULT ARRAY[]::text[],
  entities JSONB DEFAULT '{}',  -- Extracted entities: names, companies, dates, etc.

  -- Sentiment & emotion analysis
  overall_sentiment TEXT CHECK (overall_sentiment IN ('positive', 'negative', 'neutral', 'mixed', null)),
  sentiment_score NUMERIC(5, 2),  -- -1.0 to 1.0
  emotion_analysis JSONB DEFAULT '{}',  -- {speaker_turn_id: {emotion: score}}

  -- Custom fields
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  is_favorite BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_transcriptions_account ON call_transcriptions(account_id);
CREATE INDEX idx_call_transcriptions_call ON call_transcriptions(call_id);
CREATE INDEX idx_call_transcriptions_recording ON call_transcriptions(call_recording_id);
CREATE INDEX idx_call_transcriptions_status ON call_transcriptions(status);
CREATE INDEX idx_call_transcriptions_sentiment ON call_transcriptions(overall_sentiment);
CREATE INDEX idx_call_transcriptions_created ON call_transcriptions(created_at DESC);

-- ============================================
-- CALL LOGS TABLE (Detailed call activity log)
-- ============================================

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,

  -- Log entry details
  event_type TEXT NOT NULL CHECK (event_type IN ('initiated', 'ringing', 'answered', 'held', 'transferred', 'conference', 'ivr_input', 'recording_started', 'recording_stopped', 'voicemail', 'disconnected', 'failed')),
  event_data JSONB DEFAULT '{}',

  -- Timestamp
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Additional context
  details TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[]
);

CREATE INDEX idx_call_logs_account ON call_logs(account_id);
CREATE INDEX idx_call_logs_call ON call_logs(call_id);
CREATE INDEX idx_call_logs_event_type ON call_logs(event_type);
CREATE INDEX idx_call_logs_logged_at ON call_logs(logged_at DESC);

-- ============================================
-- CALL NOTES TABLE (For user annotations)
-- ============================================

CREATE TABLE IF NOT EXISTS call_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  note_text TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('general', 'follow_up', 'issue', 'feedback', 'action_item')),

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_notes_account ON call_notes(account_id);
CREATE INDEX idx_call_notes_call ON call_notes(call_id);
CREATE INDEX idx_call_notes_created_by ON call_notes(created_by);
CREATE INDEX idx_call_notes_created ON call_notes(created_at DESC);

-- ============================================
-- CALL QUEUE TABLE (For call center operations)
-- ============================================

CREATE TABLE IF NOT EXISTS call_queues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Queue settings
  max_queue_size INTEGER,
  priority_level INTEGER DEFAULT 0,

  -- Queue status
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),

  -- Routing strategy
  routing_strategy TEXT DEFAULT 'round_robin' CHECK (routing_strategy IN ('round_robin', 'least_busy', 'fifo', 'priority', 'skill_based')),

  -- SLA settings
  average_wait_time_seconds INTEGER,
  answer_rate NUMERIC(5, 2),

  -- Queue metrics
  current_queue_length INTEGER DEFAULT 0,
  total_calls_handled INTEGER DEFAULT 0,
  total_calls_missed INTEGER DEFAULT 0,
  average_handle_time_seconds INTEGER,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_call_queues_account ON call_queues(account_id);
CREATE INDEX idx_call_queues_status ON call_queues(status);
CREATE INDEX idx_call_queues_active ON call_queues(is_active);
CREATE INDEX idx_call_queues_created ON call_queues(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================

ALTER TABLE voice_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivr_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_queues ENABLE ROW LEVEL SECURITY;

-- VOICE_PROMPTS: Users can only access prompts in their account
DROP POLICY IF EXISTS "voice_prompts_select" ON voice_prompts;
CREATE POLICY "voice_prompts_select" ON voice_prompts
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "voice_prompts_insert" ON voice_prompts;
CREATE POLICY "voice_prompts_insert" ON voice_prompts
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "voice_prompts_update" ON voice_prompts;
CREATE POLICY "voice_prompts_update" ON voice_prompts
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "voice_prompts_delete" ON voice_prompts;
CREATE POLICY "voice_prompts_delete" ON voice_prompts
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- IVR_MENUS: Users can only access menus in their account
DROP POLICY IF EXISTS "ivr_menus_select" ON ivr_menus;
CREATE POLICY "ivr_menus_select" ON ivr_menus
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ivr_menus_insert" ON ivr_menus;
CREATE POLICY "ivr_menus_insert" ON ivr_menus
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ivr_menus_update" ON ivr_menus;
CREATE POLICY "ivr_menus_update" ON ivr_menus
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ivr_menus_delete" ON ivr_menus;
CREATE POLICY "ivr_menus_delete" ON ivr_menus
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- CALLS: Users can only access calls in their account
DROP POLICY IF EXISTS "calls_select" ON calls;
CREATE POLICY "calls_select" ON calls
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "calls_insert" ON calls;
CREATE POLICY "calls_insert" ON calls
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "calls_update" ON calls;
CREATE POLICY "calls_update" ON calls
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- CALL_RECORDINGS: Users can only access recordings in their account
DROP POLICY IF EXISTS "call_recordings_select" ON call_recordings;
CREATE POLICY "call_recordings_select" ON call_recordings
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_recordings_insert" ON call_recordings;
CREATE POLICY "call_recordings_insert" ON call_recordings
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_recordings_update" ON call_recordings;
CREATE POLICY "call_recordings_update" ON call_recordings
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_recordings_delete" ON call_recordings;
CREATE POLICY "call_recordings_delete" ON call_recordings
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- CALL_TRANSCRIPTIONS: Users can only access transcriptions in their account
DROP POLICY IF EXISTS "call_transcriptions_select" ON call_transcriptions;
CREATE POLICY "call_transcriptions_select" ON call_transcriptions
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_transcriptions_insert" ON call_transcriptions;
CREATE POLICY "call_transcriptions_insert" ON call_transcriptions
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_transcriptions_update" ON call_transcriptions;
CREATE POLICY "call_transcriptions_update" ON call_transcriptions
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- CALL_LOGS: Users can only access logs in their account
DROP POLICY IF EXISTS "call_logs_select" ON call_logs;
CREATE POLICY "call_logs_select" ON call_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_logs_insert" ON call_logs;
CREATE POLICY "call_logs_insert" ON call_logs
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- CALL_NOTES: Users can only access notes in their account
DROP POLICY IF EXISTS "call_notes_select" ON call_notes;
CREATE POLICY "call_notes_select" ON call_notes
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_notes_insert" ON call_notes;
CREATE POLICY "call_notes_insert" ON call_notes
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_notes_update" ON call_notes;
CREATE POLICY "call_notes_update" ON call_notes
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_notes_delete" ON call_notes;
CREATE POLICY "call_notes_delete" ON call_notes
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- CALL_QUEUES: Users can only access queues in their account
DROP POLICY IF EXISTS "call_queues_select" ON call_queues;
CREATE POLICY "call_queues_select" ON call_queues
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_queues_insert" ON call_queues;
CREATE POLICY "call_queues_insert" ON call_queues
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_queues_update" ON call_queues;
CREATE POLICY "call_queues_update" ON call_queues
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "call_queues_delete" ON call_queues;
CREATE POLICY "call_queues_delete" ON call_queues
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update call duration
CREATE OR REPLACE FUNCTION update_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calls_update_duration ON calls;
CREATE TRIGGER trg_calls_update_duration
BEFORE UPDATE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_call_duration();

-- Function to increment voice prompt usage
CREATE OR REPLACE FUNCTION increment_prompt_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.greeting_prompt_id IS NOT NULL THEN
    UPDATE voice_prompts
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = NEW.greeting_prompt_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ivr_menus_increment_usage ON ivr_menus;
CREATE TRIGGER trg_ivr_menus_increment_usage
AFTER INSERT ON ivr_menus
FOR EACH ROW
EXECUTE FUNCTION increment_prompt_usage();

-- Function to calculate transcription word count
CREATE OR REPLACE FUNCTION calculate_transcription_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_transcript IS NOT NULL THEN
    NEW.word_count = array_length(string_to_array(NEW.full_transcript, ' '), 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transcriptions_calc_metrics ON call_transcriptions;
CREATE TRIGGER trg_transcriptions_calc_metrics
BEFORE INSERT OR UPDATE ON call_transcriptions
FOR EACH ROW
EXECUTE FUNCTION calculate_transcription_metrics();

-- ============================================
-- GRANTS (For service role access)
-- ============================================

-- Grant service role access for background jobs and Twilio webhooks
GRANT ALL ON voice_prompts TO service_role;
GRANT ALL ON ivr_menus TO service_role;
GRANT ALL ON calls TO service_role;
GRANT ALL ON call_recordings TO service_role;
GRANT ALL ON call_transcriptions TO service_role;
GRANT ALL ON call_logs TO service_role;
GRANT ALL ON call_notes TO service_role;
GRANT ALL ON call_queues TO service_role;

-- Grant function execution
GRANT EXECUTE ON FUNCTION update_call_duration TO service_role;
GRANT EXECUTE ON FUNCTION increment_prompt_usage TO service_role;
GRANT EXECUTE ON FUNCTION calculate_transcription_metrics TO service_role;
