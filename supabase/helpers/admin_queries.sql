-- Admin Tables SQL Helper Queries
-- These are useful queries for common admin operations

-- ============================================
-- TEAM ROLE QUERIES
-- ============================================

-- Get all roles for an account
-- SELECT * FROM team_roles WHERE account_id = '...';

-- Get default role for account
-- SELECT * FROM team_roles
-- WHERE account_id = '...' AND is_default = true;

-- Get system roles
-- SELECT * FROM team_roles
-- WHERE is_system = true
-- ORDER BY display_order;

-- ============================================
-- TEAM MEMBER QUERIES
-- ============================================

-- Get all team members with full details
SELECT
  tm.id,
  tm.user_id,
  tm.title,
  tm.department,
  tm.status,
  tm.is_active,
  COALESCE(tr.name, tm.default_role) as role_name,
  tm.created_at
FROM team_members tm
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE tm.account_id = '{account_id}'
ORDER BY tm.created_at DESC;

-- Get active team members by team
SELECT
  tm.id,
  tm.user_id,
  tm.title,
  COALESCE(tr.name, tm.default_role) as role,
  t.name as team_name
FROM team_members tm
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
LEFT JOIN teams t ON tm.team_id = t.id
WHERE tm.account_id = '{account_id}'
  AND tm.is_active = true
  AND (tm.team_id = '{team_id}' OR '{team_id}' IS NULL)
ORDER BY tm.title, tm.created_at;

-- Get pending invitations
SELECT
  id,
  user_id,
  title,
  status,
  invitation_sent_at,
  invitation_expires_at,
  COALESCE(tr.name, default_role) as role
FROM team_members tm
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE tm.account_id = '{account_id}'
  AND tm.status = 'invited'
  AND tm.invitation_expires_at > NOW()
ORDER BY tm.invitation_sent_at DESC;

-- Get expired invitations
SELECT
  id,
  user_id,
  title,
  invitation_sent_at,
  invitation_expires_at
FROM team_members
WHERE account_id = '{account_id}'
  AND status = 'invited'
  AND invitation_expires_at < NOW()
ORDER BY invitation_expires_at DESC;

-- Count active members by role
SELECT
  COALESCE(tr.name, tm.default_role) as role,
  COUNT(tm.id) as member_count
FROM team_members tm
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE tm.account_id = '{account_id}' AND tm.is_active = true
GROUP BY COALESCE(tr.name, tm.default_role)
ORDER BY member_count DESC;

-- Get members with direct permission overrides
SELECT
  tm.id,
  tm.user_id,
  tm.title,
  COALESCE(tr.name, tm.default_role) as role,
  tm.permissions,
  tm.created_at
FROM team_members tm
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE tm.account_id = '{account_id}'
  AND tm.permissions IS NOT NULL
  AND tm.permissions != '{}'::jsonb
ORDER BY tm.created_at DESC;

-- ============================================
-- AGENT PERFORMANCE QUERIES
-- ============================================

-- Get agent performance for today
SELECT
  ap.user_id,
  ap.calls_handled,
  ap.avg_duration_seconds,
  ap.conversion_rate,
  ap.avg_customer_satisfaction,
  ap.date,
  COALESCE(tr.name, tm.default_role) as role
FROM agent_performance ap
JOIN team_members tm ON ap.user_id = tm.user_id AND ap.account_id = tm.account_id
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE ap.account_id = '{account_id}'
  AND ap.date = CURRENT_DATE
  AND ap.period = 'daily'
ORDER BY ap.conversion_rate DESC;

-- Get daily performance for a specific date range
SELECT
  ap.date,
  ap.user_id,
  ap.calls_handled,
  ap.avg_duration_seconds,
  ap.conversion_rate,
  ap.avg_customer_satisfaction,
  ap.status_time_online,
  ap.status_time_break,
  ap.status_time_lunch
FROM agent_performance ap
WHERE ap.account_id = '{account_id}'
  AND ap.date BETWEEN '{start_date}' AND '{end_date}'
  AND ap.period = 'daily'
ORDER BY ap.date DESC, ap.conversion_rate DESC;

-- Get top performers by conversion rate
SELECT
  ap.user_id,
  tm.title,
  COALESCE(tr.name, tm.default_role) as role,
  SUM(ap.calls_handled) as total_calls,
  AVG(ap.conversion_rate)::NUMERIC(5, 2) as avg_conversion_rate,
  AVG(ap.avg_customer_satisfaction)::NUMERIC(3, 2) as avg_satisfaction,
  MAX(ap.date) as last_update
FROM agent_performance ap
JOIN team_members tm ON ap.user_id = tm.user_id AND ap.account_id = tm.account_id
LEFT JOIN team_roles tr ON tm.custom_role_id = tr.id
WHERE ap.account_id = '{account_id}'
  AND ap.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ap.user_id, tm.title, COALESCE(tr.name, tm.default_role)
ORDER BY avg_conversion_rate DESC
LIMIT 10;

-- Get team performance summary
SELECT
  t.name as team_name,
  COUNT(DISTINCT ap.user_id) as agent_count,
  SUM(ap.calls_handled) as total_calls,
  AVG(ap.conversion_rate)::NUMERIC(5, 2) as avg_conversion_rate,
  AVG(ap.avg_customer_satisfaction)::NUMERIC(3, 2) as avg_satisfaction,
  SUM(ap.status_time_online) as total_online_time
FROM agent_performance ap
JOIN team_members tm ON ap.user_id = tm.user_id AND ap.account_id = tm.account_id
LEFT JOIN teams t ON tm.team_id = t.id
WHERE ap.account_id = '{account_id}'
  AND ap.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY t.name
ORDER BY total_calls DESC;

-- Get agent performance trend (last 30 days)
SELECT
  ap.date,
  COUNT(DISTINCT ap.user_id) as active_agents,
  SUM(ap.calls_handled) as total_calls,
  AVG(ap.conversion_rate)::NUMERIC(5, 2) as avg_conversion_rate,
  AVG(ap.avg_customer_satisfaction)::NUMERIC(3, 2) as avg_satisfaction,
  AVG(ap.avg_duration_seconds)::NUMERIC(10, 2) as avg_call_duration
FROM agent_performance ap
WHERE ap.account_id = '{account_id}'
  AND ap.date >= CURRENT_DATE - INTERVAL '30 days'
  AND ap.period = 'daily'
GROUP BY ap.date
ORDER BY ap.date DESC;

-- Get agent with lowest performance
SELECT
  ap.user_id,
  tm.title,
  SUM(ap.calls_handled) as total_calls,
  AVG(ap.conversion_rate)::NUMERIC(5, 2) as avg_conversion_rate,
  AVG(ap.avg_customer_satisfaction)::NUMERIC(3, 2) as avg_satisfaction
FROM agent_performance ap
JOIN team_members tm ON ap.user_id = tm.user_id AND ap.account_id = tm.account_id
WHERE ap.account_id = '{account_id}'
  AND ap.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ap.user_id, tm.title
HAVING COUNT(DISTINCT ap.date) >= 10 -- At least 10 days of data
ORDER BY avg_conversion_rate ASC
LIMIT 5;

-- ============================================
-- AUDIT LOG QUERIES
-- ============================================

-- Get all audit logs for account (last 30 days)
SELECT
  al.id,
  al.action,
  al.resource_type,
  al.resource_name,
  al.status,
  al.user_email,
  al.timestamp
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.timestamp >= NOW() - INTERVAL '30 days'
  AND al.is_archived = false
ORDER BY al.timestamp DESC
LIMIT 100;

-- Get audit logs for specific resource
SELECT
  al.id,
  al.action,
  al.user_email,
  al.status,
  al.changes,
  al.timestamp
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.resource_type = '{resource_type}'
  AND al.resource_id = '{resource_id}'::uuid
ORDER BY al.timestamp DESC;

-- Get audit logs by user
SELECT
  al.action,
  al.resource_type,
  al.resource_name,
  al.status,
  al.timestamp
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.user_id = '{user_id}'::uuid
  AND al.timestamp >= NOW() - INTERVAL '90 days'
ORDER BY al.timestamp DESC;

-- Get failed operations
SELECT
  al.id,
  al.action,
  al.resource_type,
  al.resource_name,
  al.user_email,
  al.error_message,
  al.timestamp
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND (al.status = 'failure' OR al.status = 'partial')
  AND al.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY al.timestamp DESC;

-- Audit log summary
SELECT
  DATE(al.timestamp) as date,
  al.action,
  al.resource_type,
  COUNT(*) as action_count,
  SUM(CASE WHEN al.status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN al.status = 'failure' THEN 1 ELSE 0 END) as failure_count
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.timestamp >= NOW() - INTERVAL '30 days'
  AND al.is_archived = false
GROUP BY DATE(al.timestamp), al.action, al.resource_type
ORDER BY date DESC, action_count DESC;

-- Get audit logs by IP address (security analysis)
SELECT
  al.user_ip_address,
  al.user_email,
  COUNT(*) as action_count,
  COUNT(DISTINCT DATE(al.timestamp)) as active_days,
  MIN(al.timestamp) as first_seen,
  MAX(al.timestamp) as last_seen
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.timestamp >= NOW() - INTERVAL '30 days'
  AND al.user_ip_address IS NOT NULL
GROUP BY al.user_ip_address, al.user_email
ORDER BY action_count DESC;

-- Get changes to sensitive resources
SELECT
  al.id,
  al.action,
  al.resource_type,
  al.resource_name,
  al.user_email,
  al.changes,
  al.timestamp
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.resource_type IN ('team_members', 'team_roles', 'settings')
  AND al.action IN ('create', 'update', 'delete')
  AND al.timestamp >= NOW() - INTERVAL '30 days'
ORDER BY al.timestamp DESC;

-- ============================================
-- AUDIT LOG STATISTICS
-- ============================================

-- Audit activity summary (last 7 days)
SELECT
  DATE(al.timestamp)::TEXT as date,
  COUNT(*) as total_actions,
  COUNT(DISTINCT al.user_id) as unique_users,
  COUNT(DISTINCT al.action) as unique_actions,
  SUM(CASE WHEN al.status = 'success' THEN 1 ELSE 0 END) as successful_actions,
  SUM(CASE WHEN al.status = 'failure' THEN 1 ELSE 0 END) as failed_actions
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.timestamp >= NOW() - INTERVAL '7 days'
  AND al.is_archived = false
GROUP BY DATE(al.timestamp)
ORDER BY date DESC;

-- Most common actions
SELECT
  al.action,
  COUNT(*) as count,
  COUNT(DISTINCT al.user_id) as unique_users,
  COUNT(DISTINCT DATE(al.timestamp)) as days_active
FROM audit_logs al
WHERE al.account_id = '{account_id}'
  AND al.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY al.action
ORDER BY count DESC;

-- ============================================
-- RETENTION & ARCHIVAL
-- ============================================

-- Count records eligible for archival (> 90 days old)
SELECT
  COUNT(*) as archival_eligible_count
FROM audit_logs
WHERE account_id = '{account_id}'
  AND is_archived = false
  AND created_at < NOW() - INTERVAL '90 days';

-- Get breakdown by age for archival planning
SELECT
  CASE
    WHEN created_at < NOW() - INTERVAL '180 days' THEN '180+ days'
    WHEN created_at < NOW() - INTERVAL '90 days' THEN '90-180 days'
    WHEN created_at < NOW() - INTERVAL '30 days' THEN '30-90 days'
    ELSE '< 30 days'
  END as age_bracket,
  COUNT(*) as record_count,
  ROUND(AVG(LENGTH(changes::TEXT))::NUMERIC, 2) as avg_size_bytes
FROM audit_logs
WHERE account_id = '{account_id}' AND is_archived = false
GROUP BY age_bracket
ORDER BY created_at DESC;

-- ============================================
-- DATA QUALITY CHECKS
-- ============================================

-- Find team members with missing metadata
SELECT
  id,
  user_id,
  title,
  metadata,
  created_at
FROM team_members
WHERE account_id = '{account_id}'
  AND (metadata IS NULL OR metadata = '{}'::jsonb)
ORDER BY created_at DESC;

-- Find agents with no recent performance data
SELECT
  tm.id,
  tm.user_id,
  tm.title,
  MAX(ap.date) as last_performance_date,
  CURRENT_DATE - MAX(ap.date) as days_since_update
FROM team_members tm
LEFT JOIN agent_performance ap ON tm.user_id = ap.user_id AND tm.account_id = ap.account_id
WHERE tm.account_id = '{account_id}'
  AND tm.is_active = true
  AND tm.default_role = 'agent'
GROUP BY tm.id, tm.user_id, tm.title
HAVING MAX(ap.date) IS NULL OR MAX(ap.date) < CURRENT_DATE - INTERVAL '7 days'
ORDER BY last_performance_date DESC NULLS FIRST;

-- Find duplicate audit logs (potential error)
SELECT
  action,
  resource_type,
  resource_id,
  user_id,
  timestamp::DATE,
  COUNT(*) as duplicate_count
FROM audit_logs
WHERE account_id = '{account_id}'
GROUP BY action, resource_type, resource_id, user_id, timestamp::DATE
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
