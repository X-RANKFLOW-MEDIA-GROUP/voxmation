# Admin Tables Migration Guide

**Migration File:** `20260625_create_admin_tables.sql`

## Overview

This migration creates a comprehensive admin and management system for Voxmation, including custom role management, team member tracking, agent performance metrics, and complete audit logging with Row Level Security (RLS) policies.

## Tables Created

### 1. **team_roles** - Custom Role Definitions

Custom roles per account with flexible permissions system.

**Schema:**
```sql
- id: UUID (Primary Key)
- account_id: UUID (Foreign Key → accounts)
- name: TEXT (Unique per account)
- description: TEXT
- permissions: JSONB (flexible permission structure)
- color: TEXT (UI color representation)
- icon: TEXT (icon identifier)
- display_order: INTEGER
- is_default: BOOLEAN (marks role as default)
- is_system: BOOLEAN (system roles cannot be deleted)
- created_by: UUID (Foreign Key → auth.users)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Key Features:**
- Per-account custom roles
- System roles (Owner, Admin, Manager, Agent, Viewer) cannot be deleted
- Flexible JSONB permissions for scalability
- Color-coded for UI representation
- Unique constraint on (account_id, name)

### 2. **team_members** - Enhanced Team Member Tracking

Manages users within an account with role assignments and status tracking.

**Schema:**
```sql
- id: UUID (Primary Key)
- account_id: UUID (Foreign Key → accounts)
- user_id: UUID (Foreign Key → auth.users)
- custom_role_id: UUID (Foreign Key → team_roles) [Optional]
- default_role: TEXT (Fallback role: owner, admin, manager, agent, viewer)
- title: TEXT (Job title)
- department: TEXT
- team_id: UUID (Foreign Key → teams)
- status: TEXT (active, inactive, suspended, invited)
- invitation_token: TEXT (Unique)
- invitation_sent_at: TIMESTAMP
- invitation_expires_at: TIMESTAMP
- permissions: JSONB (Direct permission overrides)
- metadata: JSONB (Additional data)
- is_active: BOOLEAN
- joined_at: TIMESTAMP
- last_active_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Key Features:**
- Custom role OR default role (constraint ensures one is set)
- Team assignment for organizational structure
- Invitation system with tokens and expiration
- Direct permission overrides per member
- Status tracking (active, inactive, suspended, invited)
- Last activity tracking

### 3. **agent_performance** - Agent KPI Tracking

Tracks agent call metrics, quality scores, and conversion rates with daily/weekly/monthly granularity.

**Schema:**
```sql
- id: UUID (Primary Key)
- account_id: UUID (Foreign Key → accounts)
- user_id: UUID (Foreign Key → auth.users)
- team_id: UUID (Foreign Key → teams)
- calls_handled: INTEGER
- calls_answered: INTEGER
- calls_missed: INTEGER
- calls_transferred: INTEGER
- total_duration: INTEGER (seconds)
- avg_duration_seconds: NUMERIC(10, 2)
- longest_call_seconds: INTEGER
- customer_satisfaction_score: NUMERIC(3, 2) (0.0 - 5.0)
- avg_customer_satisfaction: NUMERIC(3, 2)
- conversions: INTEGER
- conversion_rate: NUMERIC(5, 2) (percentage)
- status_time_online: INTEGER (seconds)
- status_time_break: INTEGER (seconds)
- status_time_lunch: INTEGER (seconds)
- date: DATE
- period: TEXT (daily, weekly, monthly)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Key Features:**
- Multiple period options (daily, weekly, monthly aggregation)
- Comprehensive call metrics (answered, missed, transferred)
- Quality metrics (customer satisfaction, conversion rate)
- Availability tracking (online, break, lunch time)
- Unique constraint on (account_id, user_id, date, period)
- Indexed on conversion_rate and satisfaction for fast analytics

### 4. **audit_logs** - Complete Audit Trail

Comprehensive audit logging for compliance and security with archival support.

**Schema:**
```sql
- id: UUID (Primary Key)
- account_id: UUID (Foreign Key → accounts)
- user_id: UUID (Foreign Key → auth.users) [Optional - null for system actions]
- user_email: TEXT
- user_ip_address: INET
- action: TEXT (create, read, update, delete, export, login, logout, etc.)
- resource_type: TEXT (contacts, campaigns, calls, settings, etc.)
- resource_id: UUID
- resource_name: TEXT
- changes: JSONB ({old_values: {}, new_values: {}, fields_changed: []})
- status: TEXT (success, failure, partial)
- error_message: TEXT
- user_agent: TEXT
- referer: TEXT
- request_id: TEXT (for request tracing)
- metadata: JSONB
- timestamp: TIMESTAMP
- created_at: TIMESTAMP
- is_archived: BOOLEAN (for retention policies)
- archived_at: TIMESTAMP
```

**Key Features:**
- Comprehensive change tracking with old/new values
- IP address logging for security
- User agent and referrer tracking
- Request ID for tracing distributed calls
- Status tracking (success, failure, partial)
- Archival support for data retention policies (90-day default)
- Indexed on account_id, timestamp for efficient querying

## Row Level Security (RLS) Policies

### team_roles
- **SELECT:** Users can see roles of accounts they're members of
- **INSERT:** Only account admins/owners
- **UPDATE:** Only admins/owners, system roles cannot be modified
- **DELETE:** Only account owners, system roles cannot be deleted

### team_members
- **SELECT:** All members can see team members in their accounts
- **INSERT:** Only admins/managers/owners
- **UPDATE:** Only admins/managers/owners
- **DELETE:** Only admins/owners

### agent_performance
- **SELECT:** All team members can view (for their account)
- **INSERT:** Only managers/admins/owners
- **UPDATE:** Only managers/admins/owners
- **DELETE:** (Allowed for admins via standard policy)

### audit_logs
- **SELECT:** Only admins/owners can view
- **INSERT:** System inserts (null user_id) OR admin inserts
- **UPDATE/DELETE:** Not allowed (audit trail immutability)

## Helper Functions

### 1. `get_user_effective_role(p_account_id, p_user_id)`
Returns the effective role name for a user in an account.
- Checks custom_role_id first, then default_role
- Returns role name or 'viewer' if not found

### 2. `user_has_permission(p_account_id, p_permission_name, p_user_id)`
Checks if a user has a specific permission in an account.
- Checks team_members.permissions JSONB
- Returns boolean

### 3. `log_audit_action(...)`
Manually log an audit action.
```sql
SELECT log_audit_action(
  account_id,
  'create',
  'contacts',
  resource_id,
  'John Doe',
  '{"email": "john@example.com"}'::JSONB
);
```

### 4. `calculate_agent_metrics(p_account_id, p_user_id, p_date)`
Calculate metrics for an agent on a specific date.
Returns: calls_handled, avg_duration, conversion_rate

### 5. `archive_old_audit_logs(p_days_old)`
Archive audit logs older than specified days (default: 90).
Returns: count of archived records

### 6. `get_team_statistics(p_account_id)`
Get aggregate team statistics.
Returns: total_members, active_members, avg_customer_satisfaction, total_calls, total_conversions

### 7. `create_default_team_roles(p_account_id)`
Seed default roles when creating a new account.

## Triggers

### audit_trigger_func()
Automatically logs changes to team_members, team_roles, and agent_performance tables.
- Attached to: team_members, team_roles, agent_performance
- Triggers on: INSERT, UPDATE, DELETE
- Records complete old/new values in audit_logs

## Database Indexes

Optimized indexes for common queries:

```sql
-- team_roles
idx_team_roles_account
idx_team_roles_is_default
idx_team_roles_is_system

-- team_members
idx_team_members_account
idx_team_members_user
idx_team_members_custom_role
idx_team_members_status
idx_team_members_team
idx_team_members_active

-- agent_performance
idx_agent_performance_account
idx_agent_performance_user
idx_agent_performance_date
idx_agent_performance_team
idx_agent_performance_conversion
idx_agent_performance_satisfaction

-- audit_logs
idx_audit_logs_account
idx_audit_logs_user
idx_audit_logs_timestamp
idx_audit_logs_action
idx_audit_logs_resource
idx_audit_logs_status
idx_audit_logs_is_archived
idx_audit_logs_account_timestamp
```

## Usage Examples

### Create Custom Role
```sql
INSERT INTO team_roles (account_id, name, description, permissions, color)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Senior Agent',
  'Experienced agents with training capabilities',
  '{"calls": true, "crm": true, "training": true}'::JSONB,
  '#8b5cf6'
);
```

### Add Team Member with Custom Role
```sql
INSERT INTO team_members (account_id, user_id, custom_role_id, title, team_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  '770e8400-e29b-41d4-a716-446655440000',
  'Senior Call Agent',
  '880e8400-e29b-41d4-a716-446655440000'
);
```

### Log Agent Performance
```sql
INSERT INTO agent_performance (
  account_id, user_id, calls_handled, avg_duration_seconds,
  conversions, conversion_rate, date, period
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  47,
  285.50,
  12,
  25.53,
  '2026-06-25',
  'daily'
);
```

### Query Audit Trail
```sql
SELECT action, resource_type, changes, status, timestamp
FROM audit_logs
WHERE account_id = '550e8400-e29b-41d4-a716-446655440000'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

### Get Team Statistics
```sql
SELECT * FROM get_team_statistics('550e8400-e29b-41d4-a716-446655440000');
```

## Data Retention Policy

### Audit Logs
- Default retention: 90 days
- Archive older logs using: `SELECT archive_old_audit_logs(90);`
- Can be automated via cron job:
  ```sql
  SELECT cron.schedule('archive_audit_logs', '0 2 * * *', 'SELECT archive_old_audit_logs(90)');
  ```

## Integration Notes

### With Existing Tables
- **accounts:** Parent table for multi-tenant isolation
- **teams:** Referenced for team assignment (ensure teams table exists)
- **calls:** Referenced in agent_performance calculation
- **auth.users:** Referenced for user relationships

### API Integration Points
1. **Team Management API:** Query team_roles, team_members
2. **Performance Dashboard:** Query agent_performance with filtering
3. **Audit Dashboard:** Query audit_logs with RLS enforcement
4. **Admin Settings:** Manage roles and permissions

## Security Considerations

1. **RLS Enforcement:** All tables protected with account-level isolation
2. **Audit Immutability:** No UPDATE/DELETE on audit_logs
3. **System Roles:** Cannot be modified or deleted
4. **IP Logging:** Audit logs capture client IP for security analysis
5. **Permission-Based Access:** Granular permission system for future expansion

## Performance Optimization

### Key Indexes
- Timestamp indexes on audit_logs for range queries
- Account+timestamp composite for efficient account audits
- Conversion_rate DESC for top performer queries
- Status indexes for filtering active members

### Query Optimization Tips
1. Always filter by account_id first (RLS will enforce this)
2. Use period field in agent_performance for aggregations
3. Archive old audit logs regularly
4. Cache team_roles as they rarely change

## Migration Checklist

- [ ] Review all table schemas and constraints
- [ ] Verify RLS policies match security requirements
- [ ] Test all helper functions
- [ ] Seed default roles for existing accounts
- [ ] Create indexes and verify performance
- [ ] Set up audit log archival schedule
- [ ] Test audit triggers
- [ ] Document custom permissions for your use case
