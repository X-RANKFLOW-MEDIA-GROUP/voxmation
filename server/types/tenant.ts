/**
 * Tenant Context Types
 * Extensão do Express Request para suportar multi-tenant
 */

export interface TenantContext {
  accountId: string;
  tenantId: string;
  account: AccountRecord;
  branding: BrandingData;
  settings: SettingsData;
}

export interface AccountRecord {
  id: string;
  name: string;
  type: "master" | "sub";
  parent_account_id?: string | null;
  subdomain?: string | null;
  custom_domain?: string | null;
  branding: BrandingData;
  settings: SettingsData;
  plan: "free" | "starter" | "pro" | "enterprise";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BrandingData {
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  company_name?: string;
  company_description?: string;
  custom_css?: string;
  custom_js?: string;
  footer_text?: string;
  support_email?: string;
  support_phone?: string;
  social_links?: Record<string, string>;
}

export interface SettingsData {
  features?: {
    crm?: boolean;
    marketing?: boolean;
    phone?: boolean;
    sms?: boolean;
    email?: boolean;
    reports?: boolean;
    [key: string]: any;
  };
  limits?: {
    contacts?: number;
    calls_per_month?: number;
    sms_per_month?: number;
    team_members?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * User context (from auth token)
 */
export interface UserContext {
  userId: string;
  email: string;
  role: "owner" | "admin" | "manager" | "agent" | "viewer";
  permissions: string[];
  accountId: string;
}

/**
 * Combined request context
 */
export interface RequestContext extends TenantContext {
  user?: UserContext;
  isAuthenticated: boolean;
}
