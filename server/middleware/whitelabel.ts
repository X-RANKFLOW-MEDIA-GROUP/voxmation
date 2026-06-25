import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";
import NodeCache from "node-cache";

/**
 * Cache de accounts e branding para evitar queries repetidas
 * TTL: 5 minutos (300 segundos)
 */
const accountCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Types para extensão do Express Request
 */
declare global {
  namespace Express {
    interface Request {
      account?: AccountRecord;
      branding?: BrandingData;
      accountId?: string;
      tenantId?: string;
    }
  }
}

/**
 * Account record from database
 */
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

/**
 * Branding configuration for white-label
 */
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

/**
 * Account settings for features and limits
 */
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
 * Get subdomain from hostname
 * Examples:
 *  - clientea.voxmation.com -> clientea
 *  - staging.clientea.voxmation.com -> staging.clientea
 *  - localhost:3000 -> null
 */
function extractSubdomain(hostname: string): string | null {
  // Localhost and IP addresses
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return null;
  }

  const mainDomains = ["voxmation.com", "voxmation.app", "voxmation.io"];
  const parts = hostname.split(".");

  // Check if it's a main domain
  const isMainDomain = mainDomains.some((domain) =>
    hostname.endsWith(domain)
  );

  if (!isMainDomain || parts.length <= 2) {
    return null;
  }

  // Get subdomain (everything before the main domain)
  const mainDomainParts = mainDomains.find((d) =>
    hostname.endsWith(d)
  )?.split(".");
  const numMainParts = mainDomainParts?.length || 2;
  const subdomain = parts.slice(0, parts.length - numMainParts).join(".");

  return subdomain.length > 0 ? subdomain : null;
}

/**
 * Load account from database by identifier
 */
async function loadAccountFromDatabase(
  identifier: string,
  type: "subdomain" | "custom_domain"
): Promise<AccountRecord | null> {
  if (!supabase) {
    console.warn("⚠️  Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq(type, identifier)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.warn(`Account lookup error (${type}=${identifier}):`, error);
      }
      return null;
    }

    return data as AccountRecord;
  } catch (error) {
    console.error(`Error loading account (${type}=${identifier}):`, error);
    return null;
  }
}

/**
 * Load master account (fallback)
 */
async function loadMasterAccount(): Promise<AccountRecord | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("type", "master")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data as AccountRecord;
  } catch (error) {
    console.error("Error loading master account:", error);
    return null;
  }
}

/**
 * Resolve account from hostname (subdomain or custom domain)
 * Priority:
 *  1. Subdomain match
 *  2. Custom domain match
 *  3. Master account (fallback)
 */
async function resolveAccountFromHostname(
  hostname: string
): Promise<AccountRecord | null> {
  const cacheKey = `account:${hostname}`;

  // Check cache first
  const cached = accountCache.get<AccountRecord>(cacheKey);
  if (cached) {
    return cached;
  }

  let account: AccountRecord | null = null;

  // Try 1: Subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    account = await loadAccountFromDatabase(subdomain, "subdomain");
  }

  // Try 2: Custom domain
  if (!account) {
    account = await loadAccountFromDatabase(hostname, "custom_domain");
  }

  // Try 3: Master account (localhost, main domain)
  if (!account) {
    account = await loadMasterAccount();
  }

  // Cache the result (even if null, to avoid repeated lookups)
  if (account) {
    accountCache.set(cacheKey, account);
  }

  return account;
}

/**
 * Main White-Label Middleware
 *
 * Detects account por subdomain ou custom_domain
 * Carrega branding e settings
 * Injeta req.account e req.branding
 * Suporta multi-tenant com isolamento completo
 */
export const whitelabelMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hostname = req.hostname || "";

    // Resolve account from hostname
    const account = await resolveAccountFromHostname(hostname);

    if (account) {
      // Attach account and branding to request
      req.account = account;
      req.accountId = account.id;
      req.tenantId = account.id; // Alias for multi-tenant isolation
      req.branding = normalizeBranding(account.branding);

      // Log tenant context (useful for debugging)
      console.log(`[Tenant] ${account.id} (${account.name}) - ${hostname}`);

      // Inject account metadata into response headers
      res.setHeader("X-Account-ID", account.id);
      res.setHeader("X-Account-Name", account.name);
      res.setHeader("X-Account-Type", account.type);
      res.setHeader("X-Branding-Primary", req.branding.primary_color || "");

      // Set branding cookie for frontend (avoid parsing JSON in frontend)
      res.cookie("x-account-id", account.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    } else {
      console.warn(`No account found for hostname: ${hostname}`);
      // Continue without account - frontend will handle gracefully
    }

    next();
  } catch (error) {
    console.error("White-label middleware error:", error);
    // Continue without failing - graceful degradation
    next();
  }
};

/**
 * Normalize branding data with defaults
 */
export function normalizeBranding(branding?: BrandingData): BrandingData {
  return {
    primary_color: branding?.primary_color || "#37ca37",
    secondary_color: branding?.secondary_color || "#188bf6",
    tertiary_color: branding?.tertiary_color || "#f59e0b",
    logo_url: branding?.logo_url || undefined,
    logo_dark_url: branding?.logo_dark_url || undefined,
    favicon_url: branding?.favicon_url || undefined,
    company_name: branding?.company_name || "Voxmation",
    company_description: branding?.company_description || undefined,
    custom_css: branding?.custom_css || undefined,
    custom_js: branding?.custom_js || undefined,
    footer_text: branding?.footer_text || "Powered by Voxmation",
    support_email: branding?.support_email || undefined,
    support_phone: branding?.support_phone || undefined,
    social_links: branding?.social_links || {},
  };
}

/**
 * Require account middleware
 * Used on routes that require valid account context
 * Fails with 400 if no account is resolved
 */
export const requireAccount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.account || !req.accountId) {
    res.status(400).json({
      error: "Invalid account context",
      message: "Unable to resolve account for hostname",
    });
    return;
  }

  next();
};

/**
 * Validate account is active
 */
export const requireActiveAccount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.account) {
    res.status(400).json({ error: "Account context not found" });
    return;
  }

  if (!req.account.is_active) {
    res.status(403).json({
      error: "Account is inactive",
      message: "This account has been deactivated",
    });
    return;
  }

  next();
};

/**
 * Check if account has feature enabled
 */
export const requireFeature = (featureName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.account) {
      res.status(400).json({ error: "Account context not found" });
      return;
    }

    const features = req.account.settings?.features || {};
    if (!features[featureName]) {
      res.status(403).json({
        error: `Feature '${featureName}' not enabled`,
        message: `This feature is not available for your plan (${req.account.plan})`,
      });
      return;
    }

    next();
  };
};

/**
 * Clear cache for account (useful after updates)
 */
export function clearAccountCache(accountId?: string): void {
  if (accountId) {
    // Clear specific account cache entries
    const keys = accountCache.keys();
    keys.forEach((key) => {
      if (key.includes(accountId)) {
        accountCache.del(key);
      }
    });
  } else {
    // Clear all cache
    accountCache.flushAll();
  }
}

/**
 * Get cached account
 */
export function getCachedAccount(hostname: string): AccountRecord | undefined {
  return accountCache.get(`account:${hostname}`);
}

/**
 * Set cached account manually (useful for updates)
 */
export function setCachedAccount(hostname: string, account: AccountRecord): void {
  accountCache.set(`account:${hostname}`, account);
}
