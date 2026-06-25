-- COMPREHENSIVE SUBSCRIPTION SYSTEM MIGRATION
-- Supports: Subscription Plans, Subscriptions, Invoices, Usage Metrics
-- Features: Multi-currency (EUR/USD), Stripe integration, Webhooks

-- ============================================================================
-- 1. SUBSCRIPTION PLANS TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,

  -- Pricing (Multi-currency)
  price_monthly_usd NUMERIC(10, 2) NOT NULL,
  price_yearly_usd NUMERIC(10, 2),
  price_monthly_eur NUMERIC(10, 2) NOT NULL,
  price_yearly_eur NUMERIC(10, 2),

  -- Stripe Configuration
  stripe_product_id TEXT,
  stripe_price_id_monthly_usd TEXT,
  stripe_price_id_yearly_usd TEXT,
  stripe_price_id_monthly_eur TEXT,
  stripe_price_id_yearly_eur TEXT,

  -- Features
  features JSONB DEFAULT '{
    "contacts": 1000,
    "users": 1,
    "calls_per_month": 100,
    "sms_per_month": 1000,
    "email_campaigns": 5,
    "automations": 10,
    "crm": true,
    "white_label": false,
    "api_access": false,
    "support_level": "email"
  }'::JSONB,

  -- Limits for enforcement
  limits JSONB DEFAULT '{
    "max_contacts": 1000,
    "max_users": 1,
    "max_api_calls_per_day": 5000,
    "max_sms_per_month": 1000,
    "max_emails_per_month": 5000,
    "max_concurrent_campaigns": 5,
    "storage_gb": 10
  }'::JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_monthly_eur CHECK (price_monthly_eur > 0),
  CONSTRAINT valid_monthly_usd CHECK (price_monthly_usd > 0)
);

CREATE INDEX idx_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_plans_order ON subscription_plans(display_order);

-- ============================================================================
-- 2. SUBSCRIPTIONS TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),

  -- Stripe Integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,

  -- Billing Details
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Pricing (locked at time of subscription)
  price_per_cycle NUMERIC(10, 2) NOT NULL,

  -- Status Management
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active',
    'paused',
    'canceled',
    'past_due',
    'trialing',
    'incomplete',
    'incomplete_expired'
  )),

  -- Period Management
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  trial_start DATE,
  trial_end DATE,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

CREATE INDEX idx_subscriptions_account ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_cust ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period ON subscriptions(current_period_start, current_period_end);

-- ============================================================================
-- 3. INVOICES TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe Integration
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Invoice Details
  invoice_number TEXT UNIQUE,

  -- Amount Details
  amount_subtotal NUMERIC(10, 2),
  amount_tax NUMERIC(10, 2),
  amount_total NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) DEFAULT 0,
  amount_due NUMERIC(10, 2),
  amount_remaining NUMERIC(10, 2),

  -- Currency
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'open',
    'paid',
    'uncollectible',
    'void'
  )),

  -- Dates
  issue_date DATE,
  due_date DATE,
  paid_date DATE,

  -- Document URLs
  pdf_url TEXT,
  hosted_invoice_url TEXT,

  -- Line Items
  line_items JSONB,

  -- Custom Data
  custom_fields JSONB,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_account ON invoices(account_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_paid ON invoices(paid_date DESC) WHERE paid_date IS NOT NULL;

-- ============================================================================
-- 4. USAGE METRICS TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Period (YYYY-MM-01)
  period DATE NOT NULL,

  -- API/Call Metrics
  api_calls_total INTEGER DEFAULT 0,
  api_calls_ai INTEGER DEFAULT 0,
  api_calls_failed INTEGER DEFAULT 0,
  api_calls_rate_limited INTEGER DEFAULT 0,

  -- Communication Metrics
  sms_sent INTEGER DEFAULT 0,
  sms_failed INTEGER DEFAULT 0,
  sms_cost NUMERIC(10, 2) DEFAULT 0,

  emails_sent INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_complained INTEGER DEFAULT 0,
  emails_cost NUMERIC(10, 2) DEFAULT 0,

  calls_initiated INTEGER DEFAULT 0,
  calls_completed INTEGER DEFAULT 0,
  calls_failed INTEGER DEFAULT 0,
  calls_cost NUMERIC(10, 2) DEFAULT 0,

  -- Contact Metrics
  contacts_total INTEGER DEFAULT 0,
  contacts_created INTEGER DEFAULT 0,
  contacts_deleted INTEGER DEFAULT 0,

  -- Campaign Metrics
  campaigns_created INTEGER DEFAULT 0,
  campaigns_executed INTEGER DEFAULT 0,
  opportunities_total INTEGER DEFAULT 0,
  opportunities_created INTEGER DEFAULT 0,

  -- Storage
  storage_used_mb INTEGER DEFAULT 0,

  -- Cost Calculation
  usage_cost NUMERIC(10, 2) DEFAULT 0,
  estimated_total_cost NUMERIC(10, 2) DEFAULT 0,

  -- Currency
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, period)
);

CREATE INDEX idx_usage_account ON usage_metrics(account_id);
CREATE INDEX idx_usage_period ON usage_metrics(period DESC);
CREATE INDEX idx_usage_account_period ON usage_metrics(account_id, period DESC);

-- ============================================================================
-- 5. WEBHOOK EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Event Details
  event_type TEXT NOT NULL,
  event_id TEXT UNIQUE,

  -- Source
  source TEXT DEFAULT 'stripe' CHECK (source IN ('stripe', 'internal')),

  -- References
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,

  -- Audit
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_status ON webhook_events(status);
CREATE INDEX idx_webhook_account ON webhook_events(account_id);
CREATE INDEX idx_webhook_received ON webhook_events(received_at DESC);

-- ============================================================================
-- 6. USAGE LIMITS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Current Period
  period DATE NOT NULL,

  -- Limits (from plan)
  max_api_calls NUMERIC,
  max_sms INTEGER,
  max_emails INTEGER,
  max_contacts INTEGER,
  max_concurrent_campaigns INTEGER,
  max_storage_mb INTEGER,

  -- Usage
  used_api_calls NUMERIC DEFAULT 0,
  used_sms INTEGER DEFAULT 0,
  used_emails INTEGER DEFAULT 0,
  used_contacts INTEGER DEFAULT 0,
  used_concurrent_campaigns INTEGER DEFAULT 0,
  used_storage_mb INTEGER DEFAULT 0,

  -- Alerts
  api_calls_warning_sent BOOLEAN DEFAULT false,
  sms_warning_sent BOOLEAN DEFAULT false,
  emails_warning_sent BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, period)
);

CREATE INDEX idx_usage_limits_account ON usage_limits(account_id);
CREATE INDEX idx_usage_limits_period ON usage_limits(period DESC);

-- ============================================================================
-- 7. PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Stripe Integration
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,

  -- Details
  type TEXT NOT NULL CHECK (type IN ('card', 'sepa_debit', 'us_bank_account')),
  brand TEXT, -- visa, mastercard, amex, etc.
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,

  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_account ON payment_methods(account_id);
CREATE INDEX idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(account_id) WHERE is_default = true;

-- ============================================================================
-- 8. BILLING HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Event
  event_type TEXT NOT NULL CHECK (event_type IN (
    'subscription_created',
    'subscription_renewed',
    'subscription_paused',
    'subscription_resumed',
    'subscription_canceled',
    'subscription_modified',
    'payment_succeeded',
    'payment_failed',
    'invoice_created',
    'invoice_paid',
    'credit_applied',
    'plan_upgraded',
    'plan_downgraded'
  )),

  -- Details
  details JSONB,

  -- Amount (if applicable)
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_billing_history_account ON billing_history(account_id);
CREATE INDEX idx_billing_history_subscription ON billing_history(subscription_id);
CREATE INDEX idx_billing_history_event ON billing_history(event_type);
CREATE INDEX idx_billing_history_date ON billing_history(created_at DESC);

-- ============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- SUBSCRIPTION_PLANS: Public read for active plans
DROP POLICY IF EXISTS "plans_select_public" ON subscription_plans;
CREATE POLICY "plans_select_public" ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- SUBSCRIPTIONS: Account members only
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- INVOICES: Account members only
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- USAGE_METRICS: Account members only
DROP POLICY IF EXISTS "usage_metrics_select" ON usage_metrics;
CREATE POLICY "usage_metrics_select" ON usage_metrics
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- PAYMENT_METHODS: Account members only
DROP POLICY IF EXISTS "payment_methods_select" ON payment_methods;
CREATE POLICY "payment_methods_select" ON payment_methods
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payment_methods_insert" ON payment_methods;
CREATE POLICY "payment_methods_insert" ON payment_methods
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "payment_methods_update" ON payment_methods;
CREATE POLICY "payment_methods_update" ON payment_methods
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "payment_methods_delete" ON payment_methods;
CREATE POLICY "payment_methods_delete" ON payment_methods
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- BILLING_HISTORY: Account members only
DROP POLICY IF EXISTS "billing_history_select" ON billing_history;
CREATE POLICY "billing_history_select" ON billing_history
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 10. INSERT DEFAULT PLANS (Multi-currency)
-- ============================================================================

INSERT INTO subscription_plans (
  name, slug, description, display_order,
  price_monthly_usd, price_yearly_usd,
  price_monthly_eur, price_yearly_eur,
  is_active, is_featured,
  features, limits
)
VALUES
  (
    'Starter',
    'starter',
    'Perfect for getting started',
    1,
    9.99, 99.99,
    8.99, 89.99,
    true, true,
    jsonb_build_object(
      'contacts', 1000,
      'users', 1,
      'calls_per_month', 100,
      'sms_per_month', 1000,
      'email_campaigns', 5,
      'automations', 10,
      'crm', true,
      'white_label', false,
      'api_access', false,
      'support_level', 'email'
    ),
    jsonb_build_object(
      'max_contacts', 1000,
      'max_users', 1,
      'max_api_calls_per_day', 500,
      'max_sms_per_month', 1000,
      'max_emails_per_month', 5000,
      'max_concurrent_campaigns', 5,
      'storage_gb', 10
    )
  ),
  (
    'Professional',
    'professional',
    'For growing teams',
    2,
    49.99, 499.99,
    44.99, 449.99,
    true, true,
    jsonb_build_object(
      'contacts', 10000,
      'users', 5,
      'calls_per_month', 5000,
      'sms_per_month', 10000,
      'email_campaigns', 50,
      'automations', 100,
      'crm', true,
      'white_label', true,
      'api_access', true,
      'support_level', 'priority'
    ),
    jsonb_build_object(
      'max_contacts', 10000,
      'max_users', 5,
      'max_api_calls_per_day', 5000,
      'max_sms_per_month', 10000,
      'max_emails_per_month', 50000,
      'max_concurrent_campaigns', 25,
      'storage_gb', 100
    )
  ),
  (
    'Enterprise',
    'enterprise',
    'Custom solution for large teams',
    3,
    299.99, 2999.99,
    269.99, 2699.99,
    true, false,
    jsonb_build_object(
      'contacts', 100000,
      'users', 50,
      'calls_per_month', 50000,
      'sms_per_month', 100000,
      'email_campaigns', 500,
      'automations', 1000,
      'crm', true,
      'white_label', true,
      'api_access', true,
      'support_level', '24/7'
    ),
    jsonb_build_object(
      'max_contacts', 100000,
      'max_users', 50,
      'max_api_calls_per_day', 50000,
      'max_sms_per_month', 100000,
      'max_emails_per_month', 500000,
      'max_concurrent_campaigns', 250,
      'storage_gb', 1000
    )
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 11. FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function to get account subscription with plan details
CREATE OR REPLACE FUNCTION get_account_subscription(account_uuid UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_id UUID,
  plan_name TEXT,
  status TEXT,
  currency TEXT,
  price_per_cycle NUMERIC,
  current_period_start DATE,
  current_period_end DATE,
  trial_end DATE,
  cancel_at_period_end BOOLEAN,
  features JSONB,
  limits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.plan_id,
    p.name,
    s.status,
    s.currency,
    s.price_per_cycle,
    s.current_period_start,
    s.current_period_end,
    s.trial_end,
    s.cancel_at_period_end,
    p.features,
    p.limits
  FROM subscriptions s
  JOIN subscription_plans p ON s.plan_id = p.id
  WHERE s.account_id = account_uuid
    AND s.status IN ('active', 'trialing', 'paused')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate usage percentage
CREATE OR REPLACE FUNCTION get_usage_percentage(account_uuid UUID)
RETURNS TABLE(
  metric TEXT,
  used NUMERIC,
  limit_val NUMERIC,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT DATE_TRUNC('month', CURRENT_DATE)::DATE as period_start
  ),
  limits AS (
    SELECT
      ul.max_api_calls,
      ul.max_sms,
      ul.max_emails,
      ul.max_contacts
    FROM usage_limits ul
    WHERE ul.account_id = account_uuid
      AND ul.period = (SELECT period_start FROM current_period)
    LIMIT 1
  ),
  usage AS (
    SELECT
      um.api_calls_total,
      um.sms_sent,
      um.emails_sent,
      um.contacts_total
    FROM usage_metrics um
    WHERE um.account_id = account_uuid
      AND um.period = (SELECT period_start FROM current_period)
    LIMIT 1
  )
  SELECT
    'API Calls'::TEXT,
    (SELECT api_calls_total FROM usage)::NUMERIC,
    (SELECT max_api_calls FROM limits),
    ROUND(
      ((SELECT api_calls_total FROM usage)::NUMERIC / NULLIF((SELECT max_api_calls FROM limits), 0)) * 100,
      2
    )
  UNION ALL
  SELECT
    'SMS',
    (SELECT sms_sent FROM usage)::NUMERIC,
    (SELECT max_sms FROM limits)::NUMERIC,
    ROUND(
      ((SELECT sms_sent FROM usage)::NUMERIC / NULLIF((SELECT max_sms FROM limits), 0)) * 100,
      2
    )
  UNION ALL
  SELECT
    'Emails',
    (SELECT emails_sent FROM usage)::NUMERIC,
    (SELECT max_emails FROM limits)::NUMERIC,
    ROUND(
      ((SELECT emails_sent FROM usage)::NUMERIC / NULLIF((SELECT max_emails FROM limits), 0)) * 100,
      2
    )
  UNION ALL
  SELECT
    'Contacts',
    (SELECT contacts_total FROM usage)::NUMERIC,
    (SELECT max_contacts FROM limits)::NUMERIC,
    ROUND(
      ((SELECT contacts_total FROM usage)::NUMERIC / NULLIF((SELECT max_contacts FROM limits), 0)) * 100,
      2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record billing event
CREATE OR REPLACE FUNCTION record_billing_event(
  account_uuid UUID,
  subscription_uuid UUID,
  invoice_uuid UUID,
  event_text TEXT,
  details_json JSONB,
  amount_val NUMERIC DEFAULT NULL,
  currency_val TEXT DEFAULT 'USD'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO billing_history (account_id, subscription_id, invoice_id, event_type, details, amount, currency)
  VALUES (account_uuid, subscription_uuid, invoice_uuid, event_text, details_json, amount_val, currency_val)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. GRANTS FOR ANON AND AUTHENTICATED USERS
-- ============================================================================

-- Grant appropriate permissions
GRANT SELECT ON subscription_plans TO anon, authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT SELECT ON usage_metrics TO authenticated;
GRANT SELECT ON payment_methods TO authenticated;
GRANT SELECT ON billing_history TO authenticated;
GRANT SELECT ON webhook_events TO authenticated;
GRANT SELECT ON usage_limits TO authenticated;

-- Service role has full access (handled via auth)
