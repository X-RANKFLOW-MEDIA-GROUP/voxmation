-- ADMIN TABLES: Team Roles, Members, Agent Performance, Audit Logs
-- ================================================================

-- 1. TEAM_ROLES (Custom role definitions per account)
CREATE TABLE IF NOT EXISTS team_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Permissions as JSONB for flexibility
  permissions JSONB DEFAULT '{}',

  -- Role hierarchy/color for UI
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  display_order INTEGER DEFAULT 0,

  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- System roles (owner, admin, etc.) cannot be deleted

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, name),
  CONSTRAINT name_not_empty CHECK (name != '')
);

CREATE INDEX idx_team_roles_account ON team_roles(account_id);
CREATE INDEX idx_team_roles_is_default ON team_roles(account_id, is_default);
CREATE INDEX idx_team_roles_is_system ON team_roles(is_system);

-- 2. TEAM_MEMBERS (Enhanced team member tracking with custom roles)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Custom role from team_roles
  custom_role_id UUID REFERENCES team_roles(id) ON DELETE SET NULL,

  -- Default role fallback (owner, admin, manager, agent, viewer)
  default_role TEXT NOT NULL DEFAULT 'agent' CHECK (default_role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),

  -- Position/title
  title TEXT,
  department TEXT,

  -- Team assignment
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'invited')),
  invitation_token TEXT UNIQUE,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,

  -- Direct permissions override
  permissions JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, user_id),
  CONSTRAINT role_or_custom CHECK (custom_role_id IS NOT NULL OR default_role IS NOT NULL)
);

CREATE INDEX idx_team_members_account ON team_members(account_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_custom_role ON team_members(custom_role_id);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_active ON team_members(account_id, is_active);

-- 3. AGENT_PERFORMANCE (Track agent metrics and KPIs)
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Performance metrics
  calls_handled INTEGER DEFAULT 0,
  calls_answered INTEGER DEFAULT 0,
  calls_missed INTEGER DEFAULT 0,
  calls_transferred INTEGER DEFAULT 0,

  -- Duration metrics (in seconds)
  total_duration INTEGER DEFAULT 0,
  avg_duration_seconds NUMERIC(10, 2) DEFAULT 0,
  longest_call_seconds INTEGER,

  -- Quality metrics
  customer_satisfaction_score NUMERIC(3, 2), -- 0.0 - 5.0
  avg_customer_satisfaction NUMERIC(3, 2),

  -- Conversion metrics
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5, 2) DEFAULT 0, -- percentage

  -- Availability
  status_time_online INTEGER DEFAULT 0, -- seconds
  status_time_break INTEGER DEFAULT 0, -- seconds
  status_time_lunch INTEGER DEFAULT 0, -- seconds

  -- Dates
  date DATE NOT NULL,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly')),

  -- Metadata
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, user_id, date, period)
);

CREATE INDEX idx_agent_performance_account ON agent_performance(account_id);
CREATE INDEX idx_agent_performance_user ON agent_performance(user_id);
CREATE INDEX idx_agent_performance_date ON agent_performance(date);
CREATE INDEX idx_agent_performance_team ON agent_performance(team_id);
CREATE INDEX idx_agent_performance_conversion ON agent_performance(conversion_rate DESC);
CREATE INDEX idx_agent_performance_satisfaction ON agent_performance(avg_customer_satisfaction DESC);

-- 4. AUDIT_LOGS (Complete audit trail for compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_ip_address INET,

  -- Action details
  action TEXT NOT NULL, -- create, read, update, delete, export, login, logout, etc.
  resource_type TEXT NOT NULL, -- contacts, campaigns, calls, settings, etc.
  resource_id UUID,
  resource_name TEXT,

  -- Changes tracking
  changes JSONB DEFAULT '{}', -- {old_values: {}, new_values: {}, fields_changed: []}

  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial')),
  error_message TEXT,

  -- Metadata
  user_agent TEXT,
  referer TEXT,
  request_id TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Data retention - can be archived after 90 days
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_audit_logs_account ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_is_archived ON audit_logs(is_archived);
CREATE INDEX idx_audit_logs_account_timestamp ON audit_logs(account_id, timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS POLICIES)
-- ============================================

-- Enable RLS on all admin tables
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- TEAM_ROLES: Users can see roles of accounts they're members of
-- Only admins can create/modify roles
DROP POLICY IF EXISTS "team_roles_select" ON team_roles;
CREATE POLICY "team_roles_select" ON team_roles
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "team_roles_insert" ON team_roles;
CREATE POLICY "team_roles_insert" ON team_roles
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "team_roles_update" ON team_roles;
CREATE POLICY "team_roles_update" ON team_roles
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    AND is_system = false
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    AND is_system = false
  );

DROP POLICY IF EXISTS "team_roles_delete" ON team_roles;
CREATE POLICY "team_roles_delete" ON team_roles
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    AND is_system = false
  );

-- TEAM_MEMBERS: Users can see members of their accounts
-- Managers/admins can manage members
DROP POLICY IF EXISTS "team_members_select" ON team_members;
CREATE POLICY "team_members_select" ON team_members
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "team_members_insert" ON team_members;
CREATE POLICY "team_members_insert" ON team_members
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "team_members_update" ON team_members;
CREATE POLICY "team_members_update" ON team_members
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "team_members_delete" ON team_members;
CREATE POLICY "team_members_delete" ON team_members
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- AGENT_PERFORMANCE: Users can see performance data for their account
-- Managers/admins can see team member performance
DROP POLICY IF EXISTS "agent_performance_select" ON agent_performance;
CREATE POLICY "agent_performance_select" ON agent_performance
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "agent_performance_insert" ON agent_performance;
CREATE POLICY "agent_performance_insert" ON agent_performance
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "agent_performance_update" ON agent_performance;
CREATE POLICY "agent_performance_update" ON agent_performance
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- AUDIT_LOGS: Only admins/owners can view audit logs
-- System can insert (via triggers/functions), users cannot manually insert
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "audit_logs_insert_system" ON audit_logs;
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT
  WITH CHECK (
    -- Allow system inserts (null user_id indicates system action)
    user_id IS NULL OR
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get effective role for a user in an account
CREATE OR REPLACE FUNCTION get_user_effective_role(p_account_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  v_custom_role_id UUID;
  v_custom_role_name TEXT;
  v_default_role TEXT;
BEGIN
  SELECT custom_role_id, default_role INTO v_custom_role_id, v_default_role
  FROM team_members
  WHERE account_id = p_account_id AND user_id = p_user_id;

  IF v_custom_role_id IS NOT NULL THEN
    SELECT name INTO v_custom_role_name FROM team_roles WHERE id = v_custom_role_id;
    RETURN v_custom_role_name;
  END IF;

  RETURN COALESCE(v_default_role, 'viewer');
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_account_id UUID,
  p_permission_name TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
  v_has_permission BOOLEAN;
BEGIN
  -- Get team member permissions
  SELECT permissions INTO v_permissions
  FROM team_members
  WHERE account_id = p_account_id AND user_id = p_user_id;

  IF v_permissions IS NULL THEN
    RETURN false;
  END IF;

  -- Check if permission exists (simplified - check if key exists in JSONB)
  RETURN v_permissions ? p_permission_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Log an action (audit trail)
CREATE OR REPLACE FUNCTION log_audit_action(
  p_account_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT '{}'::JSONB,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    account_id,
    user_id,
    action,
    resource_type,
    resource_id,
    resource_name,
    changes,
    status
  ) VALUES (
    p_account_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_changes,
    'success'
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Calculate agent performance metrics
CREATE OR REPLACE FUNCTION calculate_agent_metrics(
  p_account_id UUID,
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE(
  calls_handled INTEGER,
  avg_duration NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as calls_handled,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time)))::NUMERIC as avg_duration,
    (COUNT(CASE WHEN converted THEN 1 END)::NUMERIC / COUNT(*) * 100)::NUMERIC as conversion_rate
  FROM calls
  WHERE account_id = p_account_id
    AND agent_id = p_user_id
    AND DATE(created_at) = p_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs(
  p_days_old INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE audit_logs
  SET is_archived = true, archived_at = NOW()
  WHERE is_archived = false
    AND created_at < NOW() - INTERVAL '1 day' * p_days_old;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Get team statistics
CREATE OR REPLACE FUNCTION get_team_statistics(p_account_id UUID)
RETURNS TABLE(
  total_members INTEGER,
  active_members INTEGER,
  avg_customer_satisfaction NUMERIC,
  total_calls INTEGER,
  total_conversions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT tm.id)::INTEGER as total_members,
    COUNT(DISTINCT CASE WHEN tm.is_active THEN tm.id END)::INTEGER as active_members,
    AVG(ap.avg_customer_satisfaction)::NUMERIC as avg_customer_satisfaction,
    SUM(ap.calls_handled)::INTEGER as total_calls,
    SUM(ap.conversions)::INTEGER as total_conversions
  FROM team_members tm
  LEFT JOIN agent_performance ap ON tm.user_id = ap.user_id AND ap.account_id = p_account_id
  WHERE tm.account_id = p_account_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- SEED DATA (Optional default roles)
-- ============================================

-- Create a function to seed default roles for a new account
CREATE OR REPLACE FUNCTION create_default_team_roles(p_account_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO team_roles (account_id, name, description, permissions, color, is_default, is_system)
  VALUES
    (p_account_id, 'Owner', 'Full account access and management', '{"all": true}'::JSONB, '#dc2626', true, true),
    (p_account_id, 'Admin', 'Administrative access and user management', '{"users": true, "settings": true, "reports": true}'::JSONB, '#f59e0b', false, true),
    (p_account_id, 'Manager', 'Team and performance management', '{"team_management": true, "performance_reports": true}'::JSONB, '#3b82f6', false, true),
    (p_account_id, 'Agent', 'Call handling and basic CRM access', '{"calls": true, "crm_basic": true}'::JSONB, '#10b981', false, true),
    (p_account_id, 'Viewer', 'Read-only access to reports', '{"reports_view": true}'::JSONB, '#6b7280', false, true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (Auto-audit and data maintenance)
-- ============================================

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  -- Log specific table changes
  IF TG_TABLE_NAME IN ('team_members', 'team_roles', 'agent_performance') THEN
    INSERT INTO audit_logs (
      account_id,
      user_id,
      action,
      resource_type,
      resource_id,
      changes,
      status
    ) VALUES (
      COALESCE(NEW.account_id, OLD.account_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'old_values', to_jsonb(OLD),
        'new_values', to_jsonb(NEW)
      ),
      'success'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to tables
DROP TRIGGER IF EXISTS team_members_audit ON team_members;
CREATE TRIGGER team_members_audit AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS team_roles_audit ON team_roles;
CREATE TRIGGER team_roles_audit AFTER INSERT OR UPDATE ON team_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS agent_performance_audit ON agent_performance;
CREATE TRIGGER agent_performance_audit AFTER INSERT OR UPDATE ON agent_performance
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
