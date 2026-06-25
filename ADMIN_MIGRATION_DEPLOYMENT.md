# Admin Tables Migration - Deployment Checklist

**Migration File:** `supabase/migrations/20260625_create_admin_tables.sql`

**Last Updated:** 2026-06-25

## Pre-Deployment

### [ ] Code Review
- [ ] Migration SQL reviewed for syntax errors
- [ ] RLS policies reviewed for security
- [ ] Functions reviewed for performance
- [ ] Triggers reviewed for data consistency

### [ ] Testing
- [ ] Migration tested on local Supabase instance
- [ ] All RLS policies tested with different roles
- [ ] Helper functions tested
- [ ] Triggers verified to fire correctly
- [ ] Verification script passes

### [ ] Documentation
- [ ] ADMIN_TABLES_GUIDE.md reviewed
- [ ] TypeScript types reviewed
- [ ] SQL helper queries documented
- [ ] README updated with new capabilities

### [ ] Environment Preparation
- [ ] Database backup scheduled
- [ ] Rollback procedure documented
- [ ] Team notified of deployment window
- [ ] Performance monitoring configured

## Deployment Steps

### [ ] 1. Backup Database
```bash
# Via Supabase Dashboard:
# - Navigate to Settings → Backups
# - Create manual backup

# Or via CLI (if available)
supabase db backup create --project-id $PROJECT_ID
```

### [ ] 2. Apply Migration

**Option A: Local Development**
```bash
cd /home/user/voxmation
supabase link --project-id $PROJECT_ID
supabase db push
```

**Option B: Supabase Dashboard**
1. Go to SQL Editor
2. Open `/supabase/migrations/20260625_create_admin_tables.sql`
3. Copy entire content
4. Paste into new query window
5. Click "Run"

**Option C: Supabase CLI Remote**
```bash
supabase migrations list --project-id $PROJECT_ID
# Verify migration appears as pending
supabase db push --project-id $PROJECT_ID
```

### [ ] 3. Verify Migration

Run verification script in SQL Editor:

```sql
-- Copy entire contents of verify_admin_migration.sql
-- Paste into new query window
-- Click "Run"
```

Expected output:
- [ ] 4 tables exist (team_roles, team_members, agent_performance, audit_logs)
- [ ] All columns present with correct types
- [ ] All indexes created (18+ indexes)
- [ ] RLS enabled on all tables
- [ ] 20+ RLS policies created
- [ ] 3 triggers active
- [ ] 8 helper functions available

### [ ] 4. Initialize Default Roles

```sql
-- For all existing accounts
DO $$
DECLARE
  v_account_id UUID;
BEGIN
  FOR v_account_id IN SELECT id FROM accounts WHERE type = 'master'
  LOOP
    PERFORM create_default_team_roles(v_account_id);
  END LOOP;
END $$;
```

### [ ] 5. Verify Default Roles Created

```sql
SELECT
  account_id,
  COUNT(*) as role_count,
  ARRAY_AGG(name ORDER BY name) as role_names
FROM team_roles
WHERE is_system = true
GROUP BY account_id
ORDER BY account_id;
```

Expected: Should show 5 system roles per account (Owner, Admin, Manager, Agent, Viewer)

### [ ] 6. Test RLS Policies

Create test user scenario:
```sql
-- Get a test user and account
SELECT u.id as user_id, am.account_id
FROM auth.users u
JOIN account_members am ON u.id = am.user_id
WHERE am.role IN ('admin', 'owner')
LIMIT 1;
```

Test RLS:
```sql
-- As admin user, should see own team members
SELECT COUNT(*) FROM team_members
WHERE account_id = 'test-account-id';

-- Should NOT see members from other accounts
```

### [ ] 7. Test Helper Functions

```sql
-- Test get_user_effective_role
SELECT get_user_effective_role(
  'test-account-id'::uuid,
  'test-user-id'::uuid
);

-- Test get_team_statistics
SELECT * FROM get_team_statistics('test-account-id'::uuid);

-- Test calculate_agent_metrics
SELECT * FROM calculate_agent_metrics(
  'test-account-id'::uuid,
  'test-user-id'::uuid,
  CURRENT_DATE
);
```

### [ ] 8. Verify Audit Triggers

```sql
-- Insert test team member
INSERT INTO team_members (
  account_id,
  user_id,
  default_role,
  status
) VALUES (
  'test-account-id',
  'test-user-id',
  'agent',
  'active'
);

-- Check audit log was created
SELECT * FROM audit_logs
WHERE resource_type = 'team_members'
ORDER BY created_at DESC
LIMIT 1;
```

Expected: Should see audit entry with action='insert'

## Post-Deployment

### [ ] 1. Performance Monitoring
- [ ] Monitor query performance on admin tables
- [ ] Check index usage: `SELECT * FROM pg_stat_user_indexes`
- [ ] Monitor trigger execution time
- [ ] Verify no slow queries in logs

### [ ] 2. Data Validation

Run data quality checks:

```sql
-- Check for orphaned records
SELECT COUNT(*) as orphaned_members
FROM team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id
WHERE u.id IS NULL;

-- Check for invalid constraints
SELECT COUNT(*) as invalid
FROM team_members
WHERE custom_role_id IS NULL AND default_role IS NULL;

-- Verify unique constraints
SELECT account_id, name, COUNT(*)
FROM team_roles
GROUP BY account_id, name
HAVING COUNT(*) > 1;
```

All counts should return 0 (no issues).

### [ ] 3. Application Integration

- [ ] Update Supabase client imports
- [ ] Add TypeScript type definitions to IDE
- [ ] Update API endpoints to use new tables
- [ ] Test team management features
- [ ] Test permission checks
- [ ] Test audit logging

### [ ] 4. Documentation Updates

- [ ] Update API documentation with new endpoints
- [ ] Update team member management docs
- [ ] Document permission scopes for your use case
- [ ] Create admin dashboard documentation
- [ ] Add new tables to data dictionary

### [ ] 5. Team Training

- [ ] Brief development team on new tables
- [ ] Demonstrate admin dashboard features
- [ ] Document permission hierarchy
- [ ] Explain RLS policies
- [ ] Share query examples

### [ ] 6. Monitoring Setup

```sql
-- Create monitoring query for slow operations
CREATE VIEW admin_tables_monitoring AS
SELECT
  schemaname,
  tablename,
  idx_scan as index_scans,
  seq_scan as sequential_scans,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs');

-- Run regularly
SELECT * FROM admin_tables_monitoring;
```

### [ ] 7. Archival Scheduling

Set up audit log archival:

```sql
-- Via Supabase Cron Extension (if enabled)
SELECT cron.schedule(
  'archive_old_audit_logs',
  '0 2 * * *', -- 2 AM daily
  'SELECT archive_old_audit_logs(90);'
);

-- Or via application cron job
-- Schedule daily: SELECT archive_old_audit_logs(90);
```

### [ ] 8. Backup Verification

- [ ] Verify backup contains new tables
- [ ] Test restore procedure
- [ ] Document backup/restore process
- [ ] Update disaster recovery plan

## Rollback Procedure (If Needed)

**WARNING**: Only use in emergency. Data loss possible.

```bash
# 1. Restore from backup
# Via Supabase Dashboard:
# - Navigate to Settings → Backups
# - Select backup before migration
# - Click "Restore"

# Or via CLI
supabase db restore --backup-id $BACKUP_ID --project-id $PROJECT_ID
```

## Post-Deployment Validation

### Week 1 Checklist

- [ ] Monitor error logs for issues
- [ ] Check RLS policy performance
- [ ] Verify audit logs accumulating
- [ ] Test agent performance reporting
- [ ] Test team member operations
- [ ] Review database size growth
- [ ] Confirm no permission issues
- [ ] Gather user feedback

### Week 2-4 Checklist

- [ ] Optimize slow queries if needed
- [ ] Review and analyze audit logs
- [ ] Generate first performance reports
- [ ] Fine-tune permission scopes
- [ ] Scale indexes if needed
- [ ] Update documentation based on learnings

## Performance Baselines

After deployment, record baseline metrics:

```sql
-- Table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename))
FROM pg_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs');

-- Index sizes
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE relname IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs');

-- Row counts
SELECT tablename, n_live_tup
FROM pg_stat_user_tables
WHERE tablename IN ('team_roles', 'team_members', 'agent_performance', 'audit_logs');
```

## Deployment Sign-Off

- [ ] **Database Admin**: ______________________ Date: __________
- [ ] **DevOps**: ______________________ Date: __________
- [ ] **Backend Lead**: ______________________ Date: __________
- [ ] **Product Manager**: ______________________ Date: __________

## Notes & Issues

**Issues Encountered:**
```
(Document any issues encountered during deployment)
```

**Resolution:**
```
(Document how issues were resolved)
```

**Lessons Learned:**
```
(Document lessons for future deployments)
```

---

**Deployment Date:** ________________  
**Deployed By:** ________________  
**Reviewed By:** ________________  

## Emergency Contact

If issues arise:
1. Check Supabase logs in dashboard
2. Run verification script
3. Review monitoring queries
4. Prepare rollback if critical
5. Contact database team

## Success Criteria

Migration is successful if:
- ✓ All 4 tables created with correct schema
- ✓ All RLS policies enforced
- ✓ All helper functions available
- ✓ Triggers firing correctly
- ✓ No performance degradation
- ✓ Default roles seeded for accounts
- ✓ Team can create and manage roles
- ✓ Audit trail recording changes
- ✓ Agent performance tracked
- ✓ Applications using new features without errors
