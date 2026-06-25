-- PHASE 4: EMAIL/SMS/CAMPAIGNS SYSTEM
-- Email Campaigns, SMS Campaigns, Automations, Templates, and Logging

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  preview_text TEXT,

  -- Template metadata
  category TEXT CHECK (category IN ('promotional', 'transactional', 'newsletter', 'drip', 'welcome', 'other')),
  tags TEXT[] DEFAULT ARRAY[]::text[],

  -- Template variables for personalization
  variables JSONB DEFAULT '[]',  -- e.g., [{"name": "first_name", "required": true}, {"name": "company", "required": false}]

  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_email_templates_account ON email_templates(account_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_templates_created ON email_templates(created_at DESC);

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  email_template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,

  name TEXT NOT NULL,
  description TEXT,

  -- Campaign targeting and segmentation
  recipient_list_type TEXT DEFAULT 'segment' CHECK (recipient_list_type IN ('segment', 'static_list', 'all_contacts')),
  segment_ids UUID[] DEFAULT ARRAY[]::uuid[],
  recipient_count INTEGER DEFAULT 0,

  -- Campaign settings
  from_email TEXT NOT NULL,
  from_name TEXT,
  reply_to_email TEXT,

  -- Scheduling
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  start_sending_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,

  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT false,
  ab_test_subject_variants TEXT[] DEFAULT ARRAY[]::text[],
  ab_test_variant_split_percent INTEGER CHECK (ab_test_variant_split_percent >= 50 AND ab_test_variant_split_percent <= 100),

  -- Analytics
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,

  open_rate NUMERIC(5, 2) DEFAULT 0,
  click_rate NUMERIC(5, 2) DEFAULT 0,
  bounce_rate NUMERIC(5, 2) DEFAULT 0,

  -- Campaign metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_email_campaigns_account ON email_campaigns(account_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_template ON email_campaigns(email_template_id);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_created ON email_campaigns(created_at DESC);

-- ============================================
-- SMS CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Campaign targeting
  recipient_list_type TEXT DEFAULT 'segment' CHECK (recipient_list_type IN ('segment', 'static_list', 'all_contacts')),
  segment_ids UUID[] DEFAULT ARRAY[]::uuid[],
  recipient_count INTEGER DEFAULT 0,

  -- SMS message
  message_template TEXT NOT NULL,

  -- Scheduling
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  start_sending_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,

  -- Analytics
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,

  delivery_rate NUMERIC(5, 2) DEFAULT 0,
  click_rate NUMERIC(5, 2) DEFAULT 0,

  -- Campaign metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  CONSTRAINT message_not_empty CHECK (message_template != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_sms_campaigns_account ON sms_campaigns(account_id);
CREATE INDEX idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX idx_sms_campaigns_scheduled ON sms_campaigns(scheduled_at);
CREATE INDEX idx_sms_campaigns_created ON sms_campaigns(created_at DESC);

-- ============================================
-- AUTOMATIONS TABLE (Drip campaigns, workflows, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Automation type
  type TEXT NOT NULL CHECK (type IN ('drip', 'trigger', 'welcome', 'abandoned_cart', 're_engagement', 'custom')),

  -- Trigger conditions
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('contact_tag', 'contact_property', 'contact_created', 'contact_updated', 'time_based', 'event_based')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}',  -- Flexible structure for different trigger types

  -- Automation workflow
  workflow JSONB NOT NULL DEFAULT '[]',  -- Array of steps with emails, delays, conditions

  -- Settings
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  is_recurring BOOLEAN DEFAULT false,
  max_contacts_per_day INTEGER,

  -- Analytics
  total_contacts INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  last_triggered_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  UNIQUE(account_id, name)
);

CREATE INDEX idx_automations_account ON automations(account_id);
CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_type ON automations(type);
CREATE INDEX idx_automations_trigger ON automations(trigger_type);
CREATE INDEX idx_automations_created ON automations(created_at DESC);

-- ============================================
-- AUTOMATION EXECUTIONS (Track individual automation runs)
-- ============================================

CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Execution status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  progress_step INTEGER DEFAULT 0,

  -- Execution metadata
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Execution details
  workflow_data JSONB DEFAULT '{}',  -- Stores the actual workflow execution state
  error_message TEXT,

  -- Context
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_automation_executions_account ON automation_executions(account_id);
CREATE INDEX idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX idx_automation_executions_contact ON automation_executions(contact_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);
CREATE INDEX idx_automation_executions_triggered ON automation_executions(triggered_at DESC);

-- ============================================
-- EMAIL LOGS (Track individual email sends)
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Campaign/Automation reference
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  automation_execution_id UUID REFERENCES automation_executions(id) ON DELETE SET NULL,

  -- Email details
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'complained', 'failed')),
  bounce_type TEXT CHECK (bounce_type IN ('soft', 'hard', 'permanent')),

  -- Engagement tracking
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,

  -- Event tracking
  events JSONB DEFAULT '[]',  -- Track all events: sent, delivered, opened, clicked, etc.

  -- Message ID for tracking
  message_id TEXT,
  external_message_id TEXT,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_logs_account ON email_logs(account_id);
CREATE INDEX idx_email_logs_contact ON email_logs(contact_id);
CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_automation ON email_logs(automation_execution_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_opened ON email_logs(opened);
CREATE INDEX idx_email_logs_clicked ON email_logs(clicked);
CREATE INDEX idx_email_logs_message_id ON email_logs(message_id);

-- ============================================
-- SMS LOGS (Track individual SMS sends)
-- ============================================

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Campaign/Automation reference
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE SET NULL,
  automation_execution_id UUID REFERENCES automation_executions(id) ON DELETE SET NULL,

  -- SMS details
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'undeliverable')),
  failure_reason TEXT,

  -- Engagement tracking
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  reply_message TEXT,

  -- Event tracking
  events JSONB DEFAULT '[]',

  -- Message ID for tracking
  message_id TEXT,
  external_message_id TEXT,

  -- Cost tracking
  cost NUMERIC(10, 4),

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::text[],
  custom_fields JSONB DEFAULT '{}',

  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_account ON sms_logs(account_id);
CREATE INDEX idx_sms_logs_contact ON sms_logs(contact_id);
CREATE INDEX idx_sms_logs_campaign ON sms_logs(campaign_id);
CREATE INDEX idx_sms_logs_automation ON sms_logs(automation_execution_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_recipient ON sms_logs(recipient_phone);
CREATE INDEX idx_sms_logs_sent ON sms_logs(sent_at DESC);
CREATE INDEX idx_sms_logs_clicked ON sms_logs(clicked);
CREATE INDEX idx_sms_logs_replied ON sms_logs(replied);
CREATE INDEX idx_sms_logs_message_id ON sms_logs(message_id);

-- ============================================
-- WEBHOOKS TABLE (For third-party integrations)
-- ============================================

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Webhook configuration
  url TEXT NOT NULL,

  -- Event triggers
  events TEXT[] NOT NULL,  -- e.g., ['email.sent', 'email.opened', 'email.clicked', 'sms.delivered']

  -- Headers and authentication
  headers JSONB DEFAULT '{}',
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'basic', 'bearer', 'api_key')),
  auth_config JSONB DEFAULT '{}',

  -- Settings
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_multiplier": 2}',

  -- Metadata
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_error_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT name_not_empty CHECK (name != ''),
  CONSTRAINT url_not_empty CHECK (url != ''),
  UNIQUE(account_id, url)
);

CREATE INDEX idx_webhooks_account ON webhooks(account_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);
CREATE INDEX idx_webhooks_created ON webhooks(created_at DESC);

-- ============================================
-- WEBHOOK LOGS (Track webhook executions)
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

  -- Event information
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,

  -- Request details
  request_headers JSONB DEFAULT '{}',
  request_body JSONB NOT NULL,

  -- Response details
  status_code INTEGER,
  response_headers JSONB DEFAULT '{}',
  response_body JSONB,
  response_time_ms INTEGER,

  -- Retry information
  attempt_number INTEGER DEFAULT 1,
  next_retry_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retry')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_account ON webhook_logs(account_id);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- EMAIL_TEMPLATES: Users can only access templates in their account
DROP POLICY IF EXISTS "email_templates_select" ON email_templates;
CREATE POLICY "email_templates_select" ON email_templates
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_templates_insert" ON email_templates;
CREATE POLICY "email_templates_insert" ON email_templates
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_templates_update" ON email_templates;
CREATE POLICY "email_templates_update" ON email_templates
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_templates_delete" ON email_templates;
CREATE POLICY "email_templates_delete" ON email_templates
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- EMAIL_CAMPAIGNS: Users can only access campaigns in their account
DROP POLICY IF EXISTS "email_campaigns_select" ON email_campaigns;
CREATE POLICY "email_campaigns_select" ON email_campaigns
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_campaigns_insert" ON email_campaigns;
CREATE POLICY "email_campaigns_insert" ON email_campaigns
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_campaigns_update" ON email_campaigns;
CREATE POLICY "email_campaigns_update" ON email_campaigns
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_campaigns_delete" ON email_campaigns;
CREATE POLICY "email_campaigns_delete" ON email_campaigns
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- SMS_CAMPAIGNS: Users can only access campaigns in their account
DROP POLICY IF EXISTS "sms_campaigns_select" ON sms_campaigns;
CREATE POLICY "sms_campaigns_select" ON sms_campaigns
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sms_campaigns_insert" ON sms_campaigns;
CREATE POLICY "sms_campaigns_insert" ON sms_campaigns
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sms_campaigns_update" ON sms_campaigns;
CREATE POLICY "sms_campaigns_update" ON sms_campaigns
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sms_campaigns_delete" ON sms_campaigns;
CREATE POLICY "sms_campaigns_delete" ON sms_campaigns
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- AUTOMATIONS: Users can only access automations in their account
DROP POLICY IF EXISTS "automations_select" ON automations;
CREATE POLICY "automations_select" ON automations
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "automations_insert" ON automations;
CREATE POLICY "automations_insert" ON automations
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "automations_update" ON automations;
CREATE POLICY "automations_update" ON automations
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "automations_delete" ON automations;
CREATE POLICY "automations_delete" ON automations
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- AUTOMATION_EXECUTIONS: Users can only access executions in their account
DROP POLICY IF EXISTS "automation_executions_select" ON automation_executions;
CREATE POLICY "automation_executions_select" ON automation_executions
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "automation_executions_insert" ON automation_executions;
CREATE POLICY "automation_executions_insert" ON automation_executions
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- EMAIL_LOGS: Users can only access logs in their account
DROP POLICY IF EXISTS "email_logs_select" ON email_logs;
CREATE POLICY "email_logs_select" ON email_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_logs_insert" ON email_logs;
CREATE POLICY "email_logs_insert" ON email_logs
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- SMS_LOGS: Users can only access logs in their account
DROP POLICY IF EXISTS "sms_logs_select" ON sms_logs;
CREATE POLICY "sms_logs_select" ON sms_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sms_logs_insert" ON sms_logs;
CREATE POLICY "sms_logs_insert" ON sms_logs
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- WEBHOOKS: Users can only access webhooks in their account
DROP POLICY IF EXISTS "webhooks_select" ON webhooks;
CREATE POLICY "webhooks_select" ON webhooks
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "webhooks_insert" ON webhooks;
CREATE POLICY "webhooks_insert" ON webhooks
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "webhooks_update" ON webhooks;
CREATE POLICY "webhooks_update" ON webhooks
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "webhooks_delete" ON webhooks;
CREATE POLICY "webhooks_delete" ON webhooks
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- WEBHOOK_LOGS: Users can only access logs in their account
DROP POLICY IF EXISTS "webhook_logs_select" ON webhook_logs;
CREATE POLICY "webhook_logs_select" ON webhook_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "webhook_logs_insert" ON webhook_logs;
CREATE POLICY "webhook_logs_insert" ON webhook_logs
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update email campaign analytics
CREATE OR REPLACE FUNCTION update_email_campaign_stats(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns
  SET
    total_sent = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id),
    total_delivered = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND status = 'delivered'),
    total_bounced = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND status = 'bounced'),
    total_opened = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND opened = true),
    total_clicked = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND clicked = true),
    total_unsubscribed = (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND unsubscribed = true),
    open_rate = CASE
      WHEN (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id) > 0
      THEN ROUND(((SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND opened = true)::numeric /
                  (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id)) * 100, 2)
      ELSE 0
    END,
    click_rate = CASE
      WHEN (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id) > 0
      THEN ROUND(((SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id AND clicked = true)::numeric /
                  (SELECT COUNT(*) FROM email_logs WHERE campaign_id = p_campaign_id)) * 100, 2)
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update SMS campaign analytics
CREATE OR REPLACE FUNCTION update_sms_campaign_stats(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE sms_campaigns
  SET
    total_sent = (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id),
    total_delivered = (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND status = 'delivered'),
    total_failed = (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND status = 'failed'),
    total_clicked = (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND clicked = true),
    total_replied = (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND replied = true),
    delivery_rate = CASE
      WHEN (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id) > 0
      THEN ROUND(((SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND status = 'delivered')::numeric /
                  (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id)) * 100, 2)
      ELSE 0
    END,
    click_rate = CASE
      WHEN (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id) > 0
      THEN ROUND(((SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id AND clicked = true)::numeric /
                  (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = p_campaign_id)) * 100, 2)
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update email campaign stats when email_logs change
CREATE OR REPLACE FUNCTION trigger_update_email_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    PERFORM update_email_campaign_stats(NEW.campaign_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_logs_update_stats ON email_logs;
CREATE TRIGGER trg_email_logs_update_stats
AFTER INSERT OR UPDATE ON email_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_email_campaign_stats();

-- Trigger to update SMS campaign stats when sms_logs change
CREATE OR REPLACE FUNCTION trigger_update_sms_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    PERFORM update_sms_campaign_stats(NEW.campaign_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sms_logs_update_stats ON sms_logs;
CREATE TRIGGER trg_sms_logs_update_stats
AFTER INSERT OR UPDATE ON sms_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_sms_campaign_stats();

-- Trigger to increment template usage count
CREATE OR REPLACE FUNCTION trigger_increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_template_id IS NOT NULL THEN
    UPDATE email_templates
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = NEW.email_template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaigns_increment_template_usage ON email_campaigns;
CREATE TRIGGER trg_campaigns_increment_template_usage
AFTER INSERT ON email_campaigns
FOR EACH ROW
EXECUTE FUNCTION trigger_increment_template_usage();

-- ============================================
-- GRANTS (For service role access)
-- ============================================

-- Grant service role access for background jobs and webhooks
GRANT ALL ON email_templates TO service_role;
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON sms_campaigns TO service_role;
GRANT ALL ON automations TO service_role;
GRANT ALL ON automation_executions TO service_role;
GRANT ALL ON email_logs TO service_role;
GRANT ALL ON sms_logs TO service_role;
GRANT ALL ON webhooks TO service_role;
GRANT ALL ON webhook_logs TO service_role;

-- Grant function execution
GRANT EXECUTE ON FUNCTION update_email_campaign_stats TO service_role;
GRANT EXECUTE ON FUNCTION update_sms_campaign_stats TO service_role;
