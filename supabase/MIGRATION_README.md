# Admin Tables Migration - Complete Setup Guide

## Overview

This migration (`20260625_create_admin_tables.sql`) adds comprehensive admin and team management capabilities to Voxmation, including:

- **Team Roles**: Custom, per-account role definitions with flexible permissions
- **Team Members**: Enhanced user management with role assignments and team organization
- **Agent Performance**: Complete call metrics and KPI tracking with daily/weekly/monthly aggregation
- **Audit Logs**: Comprehensive audit trail for compliance with archival support

## Files Included

```
supabase/
├── migrations/
│   └── 20260625_create_admin_tables.sql          # Main migration
├── types/
│   └── admin.ts                                   # TypeScript types
├── helpers/
│   └── admin_queries.sql                         # Useful SQL queries
├── verify_admin_migration.sql                    # Verification script
├── ADMIN_TABLES_GUIDE.md                         # Detailed table documentation
└── MIGRATION_README.md                           # This file
```

## Quick Start

### 1. Apply the Migration

**Option A: Using Supabase CLI (Local Development)**

```bash
cd /home/user/voxmation
supabase db push
```

This will apply all pending migrations, including `20260625_create_admin_tables.sql`.

**Option B: Using Supabase Dashboard**

1. Go to SQL Editor in your Supabase project
2. Open `20260625_create_admin_tables.sql`
3. Copy the entire content
4. Paste into a new query
5. Click "Run"

**Option C: Using Supabase API (for remote projects)**

The migration will be applied when you push to your deployment.

### 2. Verify the Migration

After applying, run the verification script:

```bash
# Using psql (if you have local access)
psql -f supabase/verify_admin_migration.sql

# Or via Supabase Dashboard:
# - Open SQL Editor
# - Copy contents of verify_admin_migration.sql
# - Run the query
```

Expected output: All 4 tables exist, RLS is enabled, indexes are created.

### 3. Initialize Default Roles (Optional)

For each existing account, seed default roles:

```sql
SELECT create_default_team_roles('your-account-id-here');
```

Or run for all accounts:

```sql
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

## Table Relationships

```
accounts (Master tenant)
  ├── team_roles (per account)
  ├── team_members (per account)
  │   ├── references team_roles (custom_role_id)
  │   ├── references teams (team_id)
  │   └── references auth.users (user_id)
  ├── agent_performance (per account)
  │   ├── references auth.users (user_id)
  │   └── references teams (team_id)
  └── audit_logs (per account)
      └── references auth.users (user_id)
```

## Database Schema

### team_roles
Custom roles with flexible permissions per account. System roles (owner, admin, manager, agent, viewer) are immutable.

### team_members
Users assigned to accounts with roles and team assignments. Supports invitation system.

### agent_performance
Daily/weekly/monthly KPI aggregation for agents including calls handled, conversion rates, and satisfaction scores.

### audit_logs
Immutable audit trail with complete change tracking for compliance and security analysis.

## Row Level Security (RLS)

All tables have RLS enabled with the following policy tiers:

| Table | Owner | Admin | Manager | Agent | Viewer |
|-------|-------|-------|---------|-------|--------|
| team_roles | Full | Create/Update | Read | Read | Read |
| team_members | Full | Full | Read/Update | Read | Read |
| agent_performance | Full | Full | Full | Self | Read |
| audit_logs | Full | Full | None | None | None |

## Helper Functions

### Query Functions

```sql
-- Get user's effective role in account
SELECT get_user_effective_role(account_id, user_id);

-- Check if user has permission
SELECT user_has_permission(account_id, 'permission_name');

-- Get team statistics
SELECT * FROM get_team_statistics(account_id);

-- Calculate agent metrics for a date
SELECT * FROM calculate_agent_metrics(account_id, user_id, date);
```

### Maintenance Functions

```sql
-- Log an action to audit trail
SELECT log_audit_action(
  account_id,
  'create',
  'contacts',
  resource_id,
  resource_name,
  changes_jsonb
);

-- Archive old audit logs (>90 days)
SELECT archive_old_audit_logs(90);

-- Seed default roles for new account
SELECT create_default_team_roles(account_id);
```

## Usage Examples

### Create Custom Role

```sql
INSERT INTO team_roles (
  account_id,
  name,
  description,
  permissions,
  color,
  is_default
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Senior Agent',
  'Experienced agents with training capabilities',
  '{"calls": true, "crm": true, "training": true, "reports": true}'::JSONB,
  '#8b5cf6',
  false
);
```

### Add Team Member

```sql
INSERT INTO team_members (
  account_id,
  user_id,
  custom_role_id,
  title,
  department,
  team_id,
  status,
  joined_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  '770e8400-e29b-41d4-a716-446655440000',
  'Senior Call Agent',
  'Sales',
  '880e8400-e29b-41d4-a716-446655440000',
  'active',
  NOW()
);
```

### Log Performance

```sql
INSERT INTO agent_performance (
  account_id,
  user_id,
  calls_handled,
  avg_duration_seconds,
  conversions,
  conversion_rate,
  avg_customer_satisfaction,
  status_time_online,
  date,
  period
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  47,
  285.50,
  12,
  25.53,
  4.2,
  28800, -- 8 hours in seconds
  CURRENT_DATE,
  'daily'
);
```

### Query Audit Logs

```sql
SELECT
  action,
  resource_type,
  resource_name,
  user_email,
  timestamp,
  changes
FROM audit_logs
WHERE account_id = '550e8400-e29b-41d4-a716-446655440000'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

## Performance Optimization Tips

### Indexes Strategy

The migration creates 18+ indexes optimized for:
- Account-scoped queries (most common)
- Timestamp range queries (audit logs)
- Performance aggregations (conversion_rate, satisfaction)
- Status filtering (active members, invited users)

### Query Best Practices

1. **Always filter by account_id first**
   ```sql
   SELECT * FROM team_members
   WHERE account_id = '...' AND status = 'active';
   ```

2. **Use date ranges for audit logs**
   ```sql
   SELECT * FROM audit_logs
   WHERE account_id = '...'
     AND timestamp BETWEEN start_date AND end_date;
   ```

3. **Aggregate performance data**
   ```sql
   SELECT date, SUM(calls_handled), AVG(conversion_rate)
   FROM agent_performance
   WHERE account_id = '...' AND date >= CURRENT_DATE - 30
   GROUP BY date;
   ```

## Audit Log Management

### Automatic Archival

Set up a cron job to archive old logs:

```bash
# Using Supabase Edge Functions (recommended)
# Or via a scheduled task in your application
SELECT archive_old_audit_logs(90);
```

### Data Retention Policy

- **Keep active:** Last 90 days
- **Archive:** >90 days old
- **Delete:** Based on your compliance requirements (e.g., 1-7 years)

### Compliance Reporting

Generate audit reports:

```sql
-- Audit summary (last 30 days)
SELECT
  DATE(timestamp) as date,
  action,
  COUNT(*) as action_count,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful
FROM audit_logs
WHERE account_id = '...'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp), action
ORDER BY date DESC;
```

## TypeScript Integration

Use the provided TypeScript types for type safety:

```typescript
import {
  TeamRole,
  TeamMember,
  AgentPerformance,
  AuditLog,
  DEFAULT_PERMISSIONS,
  PermissionScope
} from '@/supabase/types/admin';

// Type-safe queries
const role: TeamRole = {
  id: 'uuid',
  account_id: 'uuid',
  name: 'Senior Agent',
  permissions: { calls: true, crm: true },
  // ... other fields
};

// Type-safe function calls
const metrics = calculateAgentMetrics(accountId, userId, new Date());
```

## Troubleshooting

### RLS Policy Blocking Inserts

**Error:** `new row violates row-level security policy`

**Solution:** Verify user has correct role in account_members table:
```sql
SELECT role FROM account_members
WHERE account_id = '...' AND user_id = auth.uid();
```

### Orphaned Records

**Check for orphaned team_members:**
```sql
SELECT tm.id, tm.user_id
FROM team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id
WHERE u.id IS NULL;
```

### Trigger Not Firing

**Verify trigger is enabled:**
```sql
SELECT trigger_name, tgenabled
FROM pg_trigger
WHERE tgrelid = 'team_members'::regclass;
```

Enable if needed:
```sql
ALTER TABLE team_members ENABLE TRIGGER team_members_audit;
```

## Migration Rollback

If you need to rollback (not recommended in production):

```sql
-- Drop tables in reverse order (CASCADE removes constraints)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS agent_performance CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS team_roles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_effective_role CASCADE;
DROP FUNCTION IF EXISTS user_has_permission CASCADE;
DROP FUNCTION IF EXISTS log_audit_action CASCADE;
DROP FUNCTION IF EXISTS calculate_agent_metrics CASCADE;
DROP FUNCTION IF EXISTS archive_old_audit_logs CASCADE;
DROP FUNCTION IF EXISTS get_team_statistics CASCADE;
DROP FUNCTION IF EXISTS create_default_team_roles CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_func CASCADE;
```

## Related Documentation

- [ADMIN_TABLES_GUIDE.md](./ADMIN_TABLES_GUIDE.md) - Detailed schema documentation
- [admin_queries.sql](./helpers/admin_queries.sql) - Common SQL queries
- [admin.ts](./types/admin.ts) - TypeScript type definitions
- [verify_admin_migration.sql](./verify_admin_migration.sql) - Verification script

## Support & Next Steps

### Next Steps After Migration

1. [ ] Apply the migration to your Supabase project
2. [ ] Run verification script to confirm all tables/functions exist
3. [ ] Seed default roles for existing accounts
4. [ ] Create any custom roles needed for your use case
5. [ ] Integrate TypeScript types into your application
6. [ ] Implement permission checking in your API/UI
7. [ ] Set up audit log archival schedule
8. [ ] Create admin dashboard to view metrics and audit logs

### Integration Checklist

- [ ] Update Supabase client to handle new tables
- [ ] Add TypeScript types to your IDE
- [ ] Implement team member management UI
- [ ] Create performance dashboard
- [ ] Add audit log viewer (admin-only)
- [ ] Set up permission-based access control
- [ ] Create team invitation system
- [ ] Implement performance reporting

### Recommended Further Reading

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Database Indexing Best Practices](https://use-the-index-luke.com/)

## Contact & Issues

For issues with this migration:
1. Check [ADMIN_TABLES_GUIDE.md](./ADMIN_TABLES_GUIDE.md) for detailed documentation
2. Review the [troubleshooting section](#troubleshooting) above
3. Run [verify_admin_migration.sql](./verify_admin_migration.sql) to check schema integrity
4. Check Supabase logs in the dashboard

---

**Migration Created:** 2026-06-25  
**Version:** 1.0  
**Status:** Production Ready
