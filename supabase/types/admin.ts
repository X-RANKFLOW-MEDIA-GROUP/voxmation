/**
 * Admin Tables TypeScript Types
 * Generated from: 20260625_create_admin_tables.sql
 */

// ============================================
// TEAM_ROLES
// ============================================

export interface TeamRole {
  id: string;
  account_id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  color: string;
  icon: string | null;
  display_order: number;
  is_default: boolean;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamRoleInput = Omit<
  TeamRole,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>;

export interface TeamRoleFormData {
  name: string;
  description?: string;
  permissions: Record<string, any>;
  color?: string;
  icon?: string;
  display_order?: number;
  is_default?: boolean;
}

// ============================================
// TEAM_MEMBERS
// ============================================

export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'invited';
export type DefaultRole = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';

export interface TeamMember {
  id: string;
  account_id: string;
  user_id: string;
  custom_role_id: string | null;
  default_role: DefaultRole;
  title: string | null;
  department: string | null;
  team_id: string | null;
  status: MemberStatus;
  invitation_token: string | null;
  invitation_sent_at: string | null;
  invitation_expires_at: string | null;
  permissions: Record<string, any>;
  metadata: Record<string, any>;
  is_active: boolean;
  joined_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamMemberInput = Omit<
  TeamMember,
  'id' | 'created_at' | 'updated_at' | 'invitation_token'
>;

export interface TeamMemberFormData {
  user_id: string;
  custom_role_id?: string;
  default_role?: DefaultRole;
  title?: string;
  department?: string;
  team_id?: string;
  permissions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TeamMemberWithUser extends TeamMember {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
  };
  role?: TeamRole;
}

export interface InvitationPayload {
  email: string;
  custom_role_id?: string;
  default_role?: DefaultRole;
  title?: string;
  department?: string;
  team_id?: string;
}

// ============================================
// AGENT_PERFORMANCE
// ============================================

export type PerformancePeriod = 'daily' | 'weekly' | 'monthly';

export interface AgentPerformance {
  id: string;
  account_id: string;
  user_id: string;
  team_id: string | null;
  calls_handled: number;
  calls_answered: number;
  calls_missed: number;
  calls_transferred: number;
  total_duration: number;
  avg_duration_seconds: number;
  longest_call_seconds: number | null;
  customer_satisfaction_score: number | null;
  avg_customer_satisfaction: number | null;
  conversions: number;
  conversion_rate: number;
  status_time_online: number;
  status_time_break: number;
  status_time_lunch: number;
  date: string; // YYYY-MM-DD
  period: PerformancePeriod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AgentPerformanceInput = Omit<
  AgentPerformance,
  'id' | 'created_at' | 'updated_at'
>;

export interface AgentPerformanceFormData {
  calls_handled: number;
  calls_answered: number;
  calls_missed?: number;
  calls_transferred?: number;
  total_duration: number;
  avg_duration_seconds: number;
  conversions: number;
  conversion_rate: number;
  customer_satisfaction_score?: number;
  status_time_online?: number;
  status_time_break?: number;
  status_time_lunch?: number;
  notes?: string;
}

export interface AgentMetrics {
  calls_handled: number;
  avg_duration: number;
  conversion_rate: number;
}

export interface AgentPerformanceSummary extends AgentPerformance {
  agent_name?: string;
  agent_email?: string;
}

export interface PerformanceFilter {
  date_from?: string;
  date_to?: string;
  team_id?: string;
  period?: PerformancePeriod;
  min_conversion_rate?: number;
  max_avg_duration?: number;
}

// ============================================
// AUDIT_LOGS
// ============================================

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout'
  | 'bulk_action';

export type AuditStatus = 'success' | 'failure' | 'partial';

export type AuditResourceType =
  | 'contacts'
  | 'campaigns'
  | 'calls'
  | 'settings'
  | 'team_members'
  | 'team_roles'
  | 'agent_performance'
  | 'audit_logs'
  | 'account';

export interface AuditLogChanges {
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  fields_changed?: string[];
}

export interface AuditLog {
  id: string;
  account_id: string;
  user_id: string | null;
  user_email: string | null;
  user_ip_address: string | null;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string | null;
  resource_name: string | null;
  changes: AuditLogChanges;
  status: AuditStatus;
  error_message: string | null;
  user_agent: string | null;
  referer: string | null;
  request_id: string | null;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
}

export type AuditLogInput = Omit<
  AuditLog,
  'id' | 'created_at' | 'timestamp' | 'is_archived' | 'archived_at'
>;

export interface AuditLogFormData {
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id?: string;
  resource_name?: string;
  changes?: AuditLogChanges;
  status?: AuditStatus;
  error_message?: string;
}

export interface AuditLogFilter {
  action?: AuditAction;
  resource_type?: AuditResourceType;
  status?: AuditStatus;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  is_archived?: boolean;
  search?: string; // Search in resource_name or user_email
}

export interface AuditLogSummary {
  total_logs: number;
  by_action: Record<AuditAction, number>;
  by_resource: Record<AuditResourceType, number>;
  by_status: Record<AuditStatus, number>;
  last_7_days: number;
}

// ============================================
// AGGREGATE TYPES
// ============================================

export interface TeamStatistics {
  total_members: number;
  active_members: number;
  avg_customer_satisfaction: number | null;
  total_calls: number | null;
  total_conversions: number | null;
}

export interface TeamPerformanceReport {
  date_range: {
    start: string;
    end: string;
  };
  team_statistics: TeamStatistics;
  top_performers: AgentPerformanceSummary[];
  performance_trends: {
    date: string;
    avg_conversion_rate: number;
    avg_satisfaction: number;
    total_calls: number;
  }[];
}

export interface RolePermissionMatrix {
  [key: string]: {
    [permission: string]: boolean;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface AuditActionPayload {
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id?: string;
  resource_name?: string;
  changes?: AuditLogChanges;
  user_id?: string;
}

export interface CreateInvitationResponse {
  invitation_token: string;
  invitation_url: string;
  expires_at: string;
}

export interface BulkUploadTeamMembersPayload {
  members: Array<{
    email: string;
    title?: string;
    department?: string;
    custom_role_id?: string;
  }>;
  send_invitations: boolean;
}

export interface ExportAuditLogsPayload {
  format: 'csv' | 'json' | 'pdf';
  filters: AuditLogFilter;
}

// ============================================
// PERMISSION TYPES
// ============================================

export type PermissionScope =
  | 'all'
  | 'calls'
  | 'crm'
  | 'crm_basic'
  | 'team_management'
  | 'performance_reports'
  | 'reports_view'
  | 'users'
  | 'settings'
  | 'reports'
  | 'training'
  | 'export'
  | 'audit_logs';

export interface PermissionSet {
  [key: string]: boolean | PermissionSet;
}

export const DEFAULT_PERMISSIONS: Record<DefaultRole, PermissionSet> = {
  owner: {
    all: true,
  },
  admin: {
    users: true,
    settings: true,
    reports: true,
    calls: true,
    crm: true,
    team_management: true,
    audit_logs: true,
  },
  manager: {
    team_management: true,
    performance_reports: true,
    reports: true,
    calls: true,
    crm: true,
  },
  agent: {
    calls: true,
    crm_basic: true,
  },
  viewer: {
    reports_view: true,
  },
};

// ============================================
// DATABASE FUNCTION RETURN TYPES
// ============================================

export interface GetEffectiveRoleResult {
  role: string;
}

export interface UserHasPermissionResult {
  has_permission: boolean;
}

export interface CalculateAgentMetricsResult {
  calls_handled: number;
  avg_duration: number;
  conversion_rate: number;
}
