-- ADMIN TABLES MIGRATION VERIFICATION SCRIPT
-- Run this after applying the migration to verify all tables, indexes, and functions

-- ============================================
-- 1. VERIFY TABLES EXIST
-- ============================================

\echo '=== VERIFYING TABLES EXIST ==='

SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. VERIFY TABLE SCHEMAS
-- ============================================

\echo '=== VERIFYING TABLE COLUMNS ==='

-- team_roles columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'team_roles'
ORDER BY ordinal_position;

-- team_members columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'team_members'
ORDER BY ordinal_position;

-- agent_performance columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_performance'
ORDER BY ordinal_position;

-- audit_logs columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- ============================================
-- 3. VERIFY INDEXES
-- ============================================

\echo '=== VERIFYING INDEXES ==='

SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================

\echo '=== VERIFYING RLS ENABLED ==='

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 5. VERIFY RLS POLICIES
-- ============================================

\echo '=== VERIFYING RLS POLICIES ==='

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 6. VERIFY TRIGGERS
-- ============================================

\echo '=== VERIFYING TRIGGERS ==='

SELECT
  trigger_schema,
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('team_roles', 'team_members', 'agent_performance')
  AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. VERIFY FUNCTIONS EXIST
-- ============================================

\echo '=== VERIFYING HELPER FUNCTIONS ==='

SELECT
  proname,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN (
  'get_user_effective_role',
  'user_has_permission',
  'log_audit_action',
  'calculate_agent_metrics',
  'archive_old_audit_logs',
  'get_team_statistics',
  'create_default_team_roles',
  'audit_trigger_func'
)
ORDER BY proname;

-- ============================================
-- 8. VERIFY CONSTRAINTS
-- ============================================

\echo '=== VERIFYING CONSTRAINTS ==='

-- team_roles constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'team_roles'
ORDER BY constraint_name;

-- team_members constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'team_members'
ORDER BY constraint_name;

-- agent_performance constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'agent_performance'
ORDER BY constraint_name;

-- audit_logs constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'audit_logs'
ORDER BY constraint_name;

-- ============================================
-- 9. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================

\echo '=== VERIFYING FOREIGN KEY RELATIONSHIPS ==='

SELECT
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND constraint_name LIKE '%fk%' OR constraint_name LIKE '%ref%'
ORDER BY table_name, constraint_name;

-- ============================================
-- 10. TEST INSERTS (SAMPLE DATA)
-- ============================================

\echo '=== TESTING SAMPLE DATA INSERTS ==='

-- Insert sample account (if needed)
-- INSERT INTO accounts (name, type) VALUES ('Test Account', 'master')
-- ON CONFLICT DO NOTHING;

-- Get an account ID for testing
SELECT id INTO temp_account_id FROM accounts LIMIT 1;

-- Insert sample role
INSERT INTO team_roles (
  account_id,
  name,
  description,
  permissions,
  color,
  is_default,
  is_system
) VALUES (
  (SELECT id FROM accounts LIMIT 1),
  'Test Manager',
  'Test role for verification',
  '{"test": true}'::JSONB,
  '#123456',
  false,
  false
) ON CONFLICT DO NOTHING
RETURNING id;

-- Verify role was inserted
SELECT id, name, account_id FROM team_roles
WHERE name = 'Test Manager'
LIMIT 1;

-- ============================================
-- 11. VERIFY TABLE SIZES
-- ============================================

\echo '=== TABLE SIZES ==='

SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as data_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) as indexes_size
FROM pg_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- ============================================
-- 12. VERIFY ROLE HIERARCHY
-- ============================================

\echo '=== VERIFYING ROLE HIERARCHY ==='

-- Test function: get_user_effective_role
-- (Run with a test user_id and account_id)
-- SELECT get_user_effective_role('account-id', 'user-id');

-- ============================================
-- 13. DATA INTEGRITY CHECKS
-- ============================================

\echo '=== DATA INTEGRITY CHECKS ==='

-- Check for orphaned team_members (user_id doesn't exist in auth.users)
SELECT COUNT(*) as orphaned_members
FROM team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id
WHERE u.id IS NULL;

-- Check for orphaned agent_performance (user_id doesn't exist in auth.users)
SELECT COUNT(*) as orphaned_performance
FROM agent_performance ap
LEFT JOIN auth.users u ON ap.user_id = u.id
WHERE u.id IS NULL;

-- Check for team_members with both null custom_role_id and default_role
SELECT COUNT(*) as invalid_members
FROM team_members
WHERE custom_role_id IS NULL AND default_role IS NULL;

-- Check for invalid period values
SELECT DISTINCT period
FROM agent_performance
WHERE period NOT IN ('daily', 'weekly', 'monthly');

-- Check for invalid status values
SELECT DISTINCT status
FROM team_members
WHERE status NOT IN ('active', 'inactive', 'suspended', 'invited');

-- ============================================
-- 14. SUMMARY REPORT
-- ============================================

\echo '=== MIGRATION VERIFICATION SUMMARY ==='
\echo 'Tables Created:'
SELECT COUNT(*) as table_count
FROM pg_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public';

\echo 'Total Indexes Created:'
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public';

\echo 'RLS Policies Created:'
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs')
  AND schemaname = 'public';

\echo 'Helper Functions Created:'
SELECT COUNT(*) as function_count
FROM pg_proc
WHERE proname IN (
  'get_user_effective_role',
  'user_has_permission',
  'log_audit_action',
  'calculate_agent_metrics',
  'archive_old_audit_logs',
  'get_team_statistics',
  'create_default_team_roles',
  'audit_trigger_func'
);

\echo 'Migration Verification Complete!'
