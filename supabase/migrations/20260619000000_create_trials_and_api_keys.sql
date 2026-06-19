-- Create trials table
CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES website_leads(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  business_name VARCHAR(100) NOT NULL,
  industry VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active', -- active, expired, converted, cancelled
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL UNIQUE REFERENCES trials(id) ON DELETE CASCADE,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  elevenlabs_key VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_trials_email ON trials(email);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trials_expires_at ON trials(expires_at);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX idx_api_keys_trial_id ON api_keys(trial_id);

-- Create trigger to update updated_at on trials
CREATE OR REPLACE FUNCTION update_trials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trials_updated_at
BEFORE UPDATE ON trials
FOR EACH ROW
EXECUTE FUNCTION update_trials_updated_at();
