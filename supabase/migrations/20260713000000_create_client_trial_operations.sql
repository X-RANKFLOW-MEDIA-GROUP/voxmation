-- VOXmation production trial lifecycle.
-- The seven-day clock starts only after a client-approved go-live.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Repair the legacy profile shape so the multi-tenant AuthContext can load it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
UPDATE profiles SET auth_user_id = id WHERE auth_user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_user_id_unique ON profiles(auth_user_id);

-- Normalize the legacy call record so provider webhooks can be idempotent and
-- the portal can distinguish onboarding tests from live client traffic.
ALTER TABLE calls ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS provider_call_id TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS provider_conversation_id TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS provider_agent_id TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cost_amount NUMERIC(12, 6);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cost_currency TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS agent_version TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS calls_provider_conversation_unique
  ON calls(provider, provider_conversation_id)
  WHERE provider IS NOT NULL AND provider_conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS calls_account_created_idx ON calls(account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS client_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  invite_email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL DEFAULT 'other',
  service_area TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  source TEXT NOT NULL DEFAULT 'sales',
  internal_owner TEXT,
  next_action TEXT,
  next_action_at TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN (
    'accepted', 'intake', 'agent_configured', 'number_connected', 'testing',
    'awaiting_approval', 'live', 'converted', 'expired', 'cancelled', 'blocked'
  )),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  intake_completed_at TIMESTAMPTZ,
  agent_configured_at TIMESTAMPTZ,
  number_connected_at TIMESTAMPTZ,
  test_call_passed_at TIMESTAMPTZ,
  client_approved_at TIMESTAMPTZ,
  live_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  phone_mode TEXT CHECK (phone_mode IN ('new_number', 'call_forwarding', 'port_existing')),
  business_phone TEXT,
  forwarding_phone TEXT,
  escalation_phone TEXT,
  twilio_phone_number TEXT,
  twilio_phone_sid TEXT,
  elevenlabs_agent_id TEXT,
  elevenlabs_phone_number_id TEXT,
  voice_id TEXT,
  voice_name TEXT NOT NULL DEFAULT 'Rachel',
  prompt_version INTEGER NOT NULL DEFAULT 0,

  intake JSONB NOT NULL DEFAULT '{}'::jsonb,
  readiness JSONB NOT NULL DEFAULT '{
    "business_profile": false,
    "hours": false,
    "services": false,
    "call_rules": false,
    "agent": false,
    "phone": false,
    "test_call": false,
    "client_approval": false
  }'::jsonb,
  terms_accepted_at TIMESTAMPTZ,
  recording_consent_acknowledged_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT live_trial_has_dates CHECK (
    status <> 'live' OR (live_at IS NOT NULL AND trial_started_at IS NOT NULL AND trial_ends_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS client_trials_one_open_per_email
  ON client_trials (LOWER(invite_email))
  WHERE status NOT IN ('converted', 'expired', 'cancelled');
CREATE INDEX IF NOT EXISTS client_trials_owner_idx ON client_trials(owner_user_id);
CREATE INDEX IF NOT EXISTS client_trials_account_idx ON client_trials(account_id);
CREATE INDEX IF NOT EXISTS client_trials_status_idx ON client_trials(status, next_action_at);
CREATE INDEX IF NOT EXISTS client_trials_expiry_idx ON client_trials(trial_ends_at) WHERE status = 'live';

CREATE TABLE IF NOT EXISTS client_trial_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES client_trials(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_trial_invites_trial_idx ON client_trial_invites(trial_id);

CREATE TABLE IF NOT EXISTS client_trial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES client_trials(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_trial_events_trial_idx
  ON client_trial_events(trial_id, created_at DESC);

CREATE TABLE IF NOT EXISTS client_trial_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES client_trials(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  assigned_to TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS client_trial_tasks_queue_idx
  ON client_trial_tasks(status, due_at) WHERE status IN ('open', 'in_progress');

CREATE TABLE IF NOT EXISTS client_trial_agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES client_trials(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider_agent_id TEXT,
  environment TEXT NOT NULL DEFAULT 'testing' CHECK (environment IN ('testing', 'production', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trial_id, version)
);

CREATE TABLE IF NOT EXISTS client_trial_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES client_trials(id) ON DELETE CASCADE,
  message_key TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trial_id, message_key, channel)
);
CREATE INDEX IF NOT EXISTS client_trial_messages_queue_idx
  ON client_trial_messages(status, due_at) WHERE status = 'pending';

ALTER TABLE client_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trial_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trial_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trial_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_trial_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_trials_select_own ON client_trials;
CREATE POLICY client_trials_select_own ON client_trials FOR SELECT USING (
  owner_user_id = auth.uid() OR account_id IN (
    SELECT account_id FROM account_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS client_trials_update_own ON client_trials;
CREATE POLICY client_trials_update_own ON client_trials FOR UPDATE USING (
  owner_user_id = auth.uid() OR account_id IN (
    SELECT account_id FROM account_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
) WITH CHECK (
  owner_user_id = auth.uid() OR account_id IN (
    SELECT account_id FROM account_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

DROP POLICY IF EXISTS client_trial_events_select_own ON client_trial_events;
CREATE POLICY client_trial_events_select_own ON client_trial_events FOR SELECT USING (
  trial_id IN (SELECT id FROM client_trials WHERE owner_user_id = auth.uid())
);

DROP POLICY IF EXISTS client_trial_tasks_select_own ON client_trial_tasks;
CREATE POLICY client_trial_tasks_select_own ON client_trial_tasks FOR SELECT USING (
  trial_id IN (SELECT id FROM client_trials WHERE owner_user_id = auth.uid())
);

DROP POLICY IF EXISTS client_trial_versions_select_own ON client_trial_agent_versions;
CREATE POLICY client_trial_versions_select_own ON client_trial_agent_versions FOR SELECT USING (
  trial_id IN (SELECT id FROM client_trials WHERE owner_user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION touch_client_trial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_trials_touch ON client_trials;
CREATE TRIGGER client_trials_touch BEFORE UPDATE ON client_trials
FOR EACH ROW EXECUTE FUNCTION touch_client_trial_updated_at();

DROP TRIGGER IF EXISTS client_trial_tasks_touch ON client_trial_tasks;
CREATE TRIGGER client_trial_tasks_touch BEFORE UPDATE ON client_trial_tasks
FOR EACH ROW EXECUTE FUNCTION touch_client_trial_updated_at();

-- Hourly expiration can be invoked by Supabase Cron:
-- SELECT cron.schedule('expire-client-trials', '5 * * * *', $$SELECT expire_client_trials()$$);
CREATE OR REPLACE FUNCTION expire_client_trials()
RETURNS INTEGER AS $$
DECLARE affected INTEGER;
BEGIN
  WITH expired AS (
    UPDATE client_trials
      SET status = 'expired', expired_at = NOW(), updated_at = NOW(),
          next_action = 'Contact client for reactivation', next_action_at = NOW()
    WHERE status = 'live' AND trial_ends_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO affected FROM expired;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
