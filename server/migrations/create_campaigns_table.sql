-- Email Campaigns Table Schema
-- This migration creates tables for email campaign management

-- Campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) DEFAULT 'Voxmation',
  recipients JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  send_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,

  -- Indexes
  CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_campaigns_account_id ON email_campaigns(account_id);
CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_created_at ON email_campaigns(created_at DESC);

-- Campaign queue items table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  attempt_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX idx_queue_campaign_id ON email_queue(campaign_id);
CREATE INDEX idx_queue_status ON email_queue(status);
CREATE INDEX idx_queue_created_at ON email_queue(created_at DESC);
CREATE INDEX idx_queue_pending ON email_queue(campaign_id, status) WHERE status = 'pending';

-- Campaign statistics view
CREATE OR REPLACE VIEW email_campaign_stats AS
SELECT
  c.id,
  c.account_id,
  c.name,
  c.status,
  COUNT(*) as total_recipients,
  COUNT(CASE WHEN q.status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN q.status = 'failed' THEN 1 END) as failed_count,
  COUNT(CASE WHEN q.status = 'pending' THEN 1 END) as pending_count,
  c.created_at,
  c.updated_at
FROM email_campaigns c
LEFT JOIN email_queue q ON c.id = q.campaign_id
GROUP BY c.id, c.account_id, c.name, c.status, c.created_at, c.updated_at;

-- Audit log table for campaigns
CREATE TABLE IF NOT EXISTS campaign_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  account_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_campaign_audit FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_account_audit FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_campaign_id ON campaign_audit_log(campaign_id);
CREATE INDEX idx_audit_account_id ON campaign_audit_log(account_id);
CREATE INDEX idx_audit_created_at ON campaign_audit_log(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_campaigns_timestamp ON email_campaigns;
CREATE TRIGGER update_campaigns_timestamp
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_timestamp();

-- Permissions
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY campaigns_select_policy ON email_campaigns
  FOR SELECT USING (account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY campaigns_insert_policy ON email_campaigns
  FOR INSERT WITH CHECK (account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY campaigns_update_policy ON email_campaigns
  FOR UPDATE USING (account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid()));

CREATE POLICY campaigns_delete_policy ON email_campaigns
  FOR DELETE USING (account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid()));

-- Queue RLS policies
CREATE POLICY queue_select_policy ON email_queue
  FOR SELECT USING (campaign_id IN (
    SELECT id FROM email_campaigns
    WHERE account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid())
  ));

-- Audit log RLS policy
CREATE POLICY audit_select_policy ON campaign_audit_log
  FOR SELECT USING (account_id IN (SELECT account_id FROM user_accounts WHERE user_id = auth.uid()));
