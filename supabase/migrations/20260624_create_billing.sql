-- BILLING TABLES

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  price_monthly NUMERIC(10, 2) NOT NULL,
  price_yearly NUMERIC(10, 2),

  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,

  features JSONB DEFAULT '{
    "contacts": 1000,
    "users": 1,
    "calls_per_month": 100,
    "sms_per_month": 1000,
    "email_campaigns": 5,
    "automations": 10,
    "crm": true,
    "white_label": false,
    "api_access": false
  }',

  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_plans_order ON subscription_plans(display_order);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),

  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'canceled', 'past_due')),

  current_period_start DATE,
  current_period_end DATE,

  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,

  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),

  stripe_invoice_id TEXT UNIQUE,

  amount_paid NUMERIC(10, 2),
  amount_due NUMERIC(10, 2),
  amount_remaining NUMERIC(10, 2),

  currency TEXT DEFAULT 'USD',

  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),

  issue_date DATE,
  due_date DATE,
  paid_date DATE,

  pdf_url TEXT,
  hosted_invoice_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_account ON invoices(account_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date DESC);

-- Usage Metrics
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  period DATE NOT NULL, -- YYYY-MM-01

  calls_total INTEGER DEFAULT 0,
  calls_ai INTEGER DEFAULT 0,

  sms_sent INTEGER DEFAULT 0,
  sms_failed INTEGER DEFAULT 0,

  emails_sent INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,

  contacts_total INTEGER DEFAULT 0,
  opportunities_total INTEGER DEFAULT 0,

  estimated_cost NUMERIC(10, 2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, period)
);

CREATE INDEX idx_usage_account ON usage_metrics(account_id);
CREATE INDEX idx_usage_period ON usage_metrics(period DESC);

-- RLS POLICIES
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Plans are public
DROP POLICY IF EXISTS "plans_select" ON subscription_plans;
CREATE POLICY "plans_select" ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Subscriptions: Only account members can view
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- Invoices: Only account members can view
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- Usage: Only account members can view
DROP POLICY IF EXISTS "usage_metrics_select" ON usage_metrics;
CREATE POLICY "usage_metrics_select" ON usage_metrics
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- Insert default plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, display_order, features)
VALUES
  (
    'Starter',
    'starter',
    'Perfect for getting started',
    9.99,
    99.99,
    1,
    jsonb_build_object(
      'contacts', 1000,
      'users', 1,
      'calls_per_month', 100,
      'sms_per_month', 1000,
      'email_campaigns', 5,
      'automations', 10,
      'crm', true,
      'white_label', false,
      'api_access', false
    )
  ),
  (
    'Professional',
    'professional',
    'For growing teams',
    49.99,
    499.99,
    2,
    jsonb_build_object(
      'contacts', 10000,
      'users', 5,
      'calls_per_month', 5000,
      'sms_per_month', 10000,
      'email_campaigns', 50,
      'automations', 100,
      'crm', true,
      'white_label', true,
      'api_access', true
    )
  ),
  (
    'Enterprise',
    'enterprise',
    'Custom solution for large teams',
    299.99,
    2999.99,
    3,
    jsonb_build_object(
      'contacts', 100000,
      'users', 50,
      'calls_per_month', 50000,
      'sms_per_month', 100000,
      'email_campaigns', 500,
      'automations', 1000,
      'crm', true,
      'white_label', true,
      'api_access', true
    )
  )
ON CONFLICT DO NOTHING;
