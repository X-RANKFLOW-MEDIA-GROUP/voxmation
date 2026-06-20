# How to Apply Database Migration

## Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire SQL code below
5. Click **Run**

---

## SQL Migration Script

```sql
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
```

---

## Option 2: Using Supabase CLI

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project
supabase link --project-ref <your-project-ref>

# 3. Push migrations
supabase db push
```

---

## What Gets Created

✅ **trials table**
- Stores trial information
- Auto-links to website_leads
- Auto-expires after 7 days
- Tracks status (active, expired, converted, cancelled)

✅ **api_keys table**
- Stores generated API keys
- Links to trials
- Tracks last usage
- Supports ElevenLabs integration

✅ **Indexes**
- Fast lookups by email
- Fast lookups by status
- Fast lookups by expiration date
- Fast lookups by API key

✅ **Trigger**
- Auto-updates `updated_at` timestamp on changes

---

## Next Steps

1. Run the SQL migration
2. Add environment variables to your `.env`:
   ```
   RESEND_API_KEY=sk_...
   ELEVENLABS_API_KEY=sk_...
   ```
3. Deploy the application
4. Test by submitting the demo form

The trial system will then work automatically! 🚀
