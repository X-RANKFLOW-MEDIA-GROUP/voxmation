/**
 * Admin API Types
 * Type definitions for admin account and member management
 */

import { AccountRecord, BrandingData, SettingsData } from "./tenant";

/**
 * Account with subscription info
 */
export interface AdminAccount extends AccountRecord {
  subscription?: Subscription | null;
  member_count?: number;
}

/**
 * Subscription information
 */
export interface Subscription {
  id: string;
  account_id: string;
  plan_id: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  trial_end?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Account member with user info
 */
export interface AccountMember {
  id: string;
  account_id: string;
  user_id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  role: "owner" | "admin" | "manager" | "agent" | "viewer";
  permissions: string[];
  status: "active" | "inactive" | "invited";
  joined_at: string;
  created_at: string;
}

/**
 * Request body for updating account
 */
export interface UpdateAccountRequest {
  plan?: "free" | "starter" | "pro" | "enterprise";
  is_active?: boolean;
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
  branding?: Partial<BrandingData>;
}

/**
 * Request body for adding member
 */
export interface AddMemberRequest {
  email: string;
  role: "owner" | "admin" | "manager" | "agent" | "viewer";
  permissions?: string[];
  send_invitation?: boolean;
}

/**
 * Request body for updating member
 */
export interface UpdateMemberRequest {
  role?: "owner" | "admin" | "manager" | "agent" | "viewer";
  permissions?: string[];
  status?: "active" | "inactive" | "invited";
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Admin audit log entry
 */
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  account_id: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

/**
 * Query parameters for listing accounts
 */
export interface ListAccountsQuery {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "all";
  type?: "master" | "sub" | "all";
  search?: string;
}

/**
 * Query parameters for listing members
 */
export interface ListMembersQuery {
  page?: number;
  limit?: number;
  role?: "owner" | "admin" | "manager" | "agent" | "viewer";
  status?: "active" | "invited" | "all";
}

/**
 * Extended request object with admin context
 */
export interface AdminRequest {
  accountId?: string;
  userId?: string;
  userRole?: string;
  userPermissions?: string[];
}

/**
 * Features configuration
 */
export interface FeaturesConfig {
  crm?: boolean;
  marketing?: boolean;
  phone?: boolean;
  sms?: boolean;
  email?: boolean;
  reports?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Limits configuration
 */
export interface LimitsConfig {
  contacts?: number;
  calls_per_month?: number;
  sms_per_month?: number;
  team_members?: number;
  [key: string]: number | undefined;
}

/**
 * Plan information
 */
export interface PlanInfo {
  id: string;
  name: "free" | "starter" | "pro" | "enterprise";
  display_name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: "monthly" | "annual";
  features: FeaturesConfig;
  limits: LimitsConfig;
  is_active: boolean;
  display_order: number;
}
