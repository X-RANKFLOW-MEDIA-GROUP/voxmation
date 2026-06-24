-- PHASE 1: MULTI-TENANT ARCHITECTURE
-- Master accounts & Sub-accounts with complete isolation

-- 1. ACCOUNTS TABLE (Master + Sub-accounts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('master', 'sub')),
  parent_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,

  -- Branding (JSON for flexibility)
  branding JSONB DEFAULT '{
    "primary_color": "#37ca37",
    "secondary_color": "#188bf6",
    "logo_url": null,
    "company_name": null
  }',

  -- Settings
  settings JSONB DEFAULT '{
    "features": {
      "crm": true,
      "marketing": true,
      "phone": true,
      "sms": true,
      "email": true,
      "reports": true
    },
    "limits": {
      "contacts": 10000,
      "calls_per_month": 5000,
      "sms_per_month": 10000,
      "team_members": 10
    }
  }',

  plan TEXT DEFAULT 'starter' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Indexes for multi-tenant queries
  CONSTRAINT name_not_empty CHECK (name != '')
);

CREATE INDEX idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX idx_accounts_subdomain ON accounts(subdomain);
CREATE INDEX idx_accounts_type ON accounts(type);

-- 2. ACCOUNT MEMBERS (Users per account with roles)
CREATE TABLE IF NOT EXISTS account_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),
  permissions JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, user_id)
);

CREATE INDEX idx_account_members_user ON account_members(user_id);
CREATE INDEX idx_account_members_account ON account_members(account_id);
CREATE INDEX idx_account_members_role ON account_members(role);

-- 3. PROFILES (Refactored to include account_id for tenant isolation)
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_account ON profiles(account_id);
CREATE INDEX idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 4. ACCOUNT SETTINGS (Per-account customizations)
CREATE TABLE IF NOT EXISTS account_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  settings_key TEXT NOT NULL,
  settings_value JSONB NOT NULL,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, settings_key)
);

CREATE INDEX idx_account_settings_account ON account_settings(account_id);

-- ============================================
-- ROW LEVEL SECURITY (Multi-Tenant Isolation)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS: Users can only see accounts they are members of
DROP POLICY IF EXISTS "accounts_select_own" ON accounts;
CREATE POLICY "accounts_select_own" ON accounts
  FOR SELECT
  USING (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- ACCOUNT_MEMBERS: Users can only manage members of their accounts
DROP POLICY IF EXISTS "account_members_select" ON account_members;
CREATE POLICY "account_members_select" ON account_members
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "account_members_insert" ON account_members;
CREATE POLICY "account_members_insert" ON account_members
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- PROFILES: Users can only see profiles in their accounts
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- ACCOUNT_SETTINGS: Users can see/modify settings of their accounts
DROP POLICY IF EXISTS "account_settings_select" ON account_settings;
CREATE POLICY "account_settings_select" ON account_settings
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "account_settings_update" ON account_settings;
CREATE POLICY "account_settings_update" ON account_settings
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's primary account
CREATE OR REPLACE FUNCTION get_user_account_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT account_id FROM account_members
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user has role in account
CREATE OR REPLACE FUNCTION user_has_role(p_account_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS(
      SELECT 1 FROM account_members
      WHERE user_id = auth.uid()
        AND account_id = p_account_id
        AND role = ANY(ARRAY[p_role, 'owner', 'admin'])
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;
