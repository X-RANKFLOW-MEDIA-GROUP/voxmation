/**
 * Example: White-Label Multi-Tenant Integration
 *
 * Este arquivo demonstra como integrar o middleware white-label
 * em um servidor Express completo com isolamento de tenant.
 */

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  whitelabelMiddleware,
  requireAccount,
  requireActiveAccount,
  requireFeature,
  clearAccountCache,
} from "../middleware/whitelabel";
import { tenantMiddleware, requireRole, requirePermission } from "../middleware/tenantMiddleware";
import { supabase } from "../supabase";

/**
 * 1. CREATE EXPRESS APP WITH TENANT MIDDLEWARE
 */
export function createTenantApp(): Express {
  const app = express();

  // ======================================
  // MIDDLEWARE STACK (ORDER MATTERS!)
  // ======================================

  // 1. Parse JSON/CORS
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 2. White-Label: Detect tenant by hostname
  app.use(whitelabelMiddleware);

  // 3. Logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${req.hostname}] ${req.method} ${req.path}`, {
      accountId: req.accountId,
      accountName: req.account?.name,
    });
    next();
  });

  // 4. Optional: JWT authentication for protected routes
  // Uncomment if using Supabase auth
  // app.use(tenantMiddleware);

  // ======================================
  // PUBLIC ROUTES (No auth required)
  // ======================================

  /**
   * Health check
   */
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  /**
   * Get branding for current tenant
   */
  app.get("/api/branding", requireAccount, (req, res) => {
    res.json({
      success: true,
      account: {
        id: req.account?.id,
        name: req.account?.name,
        plan: req.account?.plan,
        type: req.account?.type,
      },
      branding: req.branding,
    });
  });

  /**
   * Get account settings (limited info)
   */
  app.get("/api/account/settings", requireAccount, (req, res) => {
    const features = req.account?.settings?.features || {};
    const limits = req.account?.settings?.limits || {};

    res.json({
      success: true,
      features,
      limits,
      plan: req.account?.plan,
    });
  });

  // ======================================
  // TENANT-ISOLATED ROUTES
  // ======================================

  /**
   * Create contact (CRM feature)
   * Automatically isolated to current tenant via req.accountId
   */
  app.post(
    "/api/crm/contacts",
    requireActiveAccount,
    requireFeature("crm"),
    async (req: Request, res: Response) => {
      try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
          res.status(400).json({ error: "Missing required fields" });
          return;
        }

        // Automatic tenant isolation via account_id
        const { data, error } = await supabase
          .from("contacts")
          .insert([
            {
              account_id: req.accountId, // <- TENANT ISOLATION
              name,
              email,
              phone,
            },
          ])
          .select();

        if (error) {
          res.status(400).json({ error: error.message });
          return;
        }

        res.json({ success: true, contact: data?.[0] });
      } catch (error) {
        res.status(500).json({
          error: "Failed to create contact",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  /**
   * Get contacts for current tenant
   */
  app.get(
    "/api/crm/contacts",
    requireActiveAccount,
    requireFeature("crm"),
    async (req: Request, res: Response) => {
      try {
        // Automatic tenant isolation via account_id
        const { data, error, count } = await supabase
          .from("contacts")
          .select("*", { count: "exact" })
          .eq("account_id", req.accountId!) // <- TENANT ISOLATION
          .order("created_at", { ascending: false });

        if (error) {
          res.status(400).json({ error: error.message });
          return;
        }

        res.json({
          success: true,
          contacts: data || [],
          total: count || 0,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to fetch contacts",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  /**
   * Send SMS (requires SMS feature)
   */
  app.post(
    "/api/sms/send",
    requireActiveAccount,
    requireFeature("sms"),
    async (req: Request, res: Response) => {
      try {
        const { phone, message } = req.body;

        if (!phone || !message) {
          res.status(400).json({ error: "Missing required fields" });
          return;
        }

        // SMS send logic here...
        // Rate limiting by account
        const monthlyUsage = await getMonthlySmsSent(req.accountId!);
        const limit = req.account?.settings?.limits?.sms_per_month || 10000;

        if (monthlyUsage >= limit) {
          res.status(429).json({
            error: "SMS quota exceeded",
            used: monthlyUsage,
            limit,
          });
          return;
        }

        // Send SMS...
        res.json({
          success: true,
          message: "SMS sent",
          phone,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to send SMS",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  /**
   * Get reports (requires reports feature)
   */
  app.get(
    "/api/reports",
    requireActiveAccount,
    requireFeature("reports"),
    async (req: Request, res: Response) => {
      try {
        // Fetch reports for current tenant
        const { data } = await supabase
          .from("reports")
          .select("*")
          .eq("account_id", req.accountId!) // <- TENANT ISOLATION
          .order("created_at", { ascending: false });

        res.json({
          success: true,
          reports: data || [],
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to fetch reports",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // ======================================
  // ADMIN ROUTES (Requires auth)
  // ======================================

  /**
   * Update account branding (owner only)
   */
  app.patch(
    "/api/admin/branding",
    requireActiveAccount,
    // requireRole("owner", "admin"), // Uncomment if using auth
    async (req: Request, res: Response) => {
      try {
        const { primary_color, logo_url, company_name } = req.body;

        const { data, error } = await supabase
          .from("accounts")
          .update({
            branding: {
              primary_color,
              logo_url,
              company_name,
            },
          })
          .eq("id", req.accountId!)
          .select();

        if (error) {
          res.status(400).json({ error: error.message });
          return;
        }

        // Clear cache so changes take effect immediately
        clearAccountCache(req.accountId!);

        res.json({
          success: true,
          message: "Branding updated",
          account: data?.[0],
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to update branding",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  /**
   * Get account usage stats
   */
  app.get(
    "/api/admin/usage",
    requireActiveAccount,
    async (req: Request, res: Response) => {
      try {
        // Fetch usage stats for current account
        const stats = await getAccountUsageStats(req.accountId!);

        res.json({
          success: true,
          stats,
          plan: req.account?.plan,
          limits: req.account?.settings?.limits,
        });
      } catch (error) {
        res.status(500).json({
          error: "Failed to fetch usage stats",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  return app;
}

/**
 * 2. HELPER FUNCTIONS
 */

/**
 * Get account usage stats
 */
async function getAccountUsageStats(accountId: string) {
  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("account_id", accountId);

  const { count: callsCount } = await supabase
    .from("calls")
    .select("*", { count: "exact" })
    .eq("account_id", accountId)
    .gte("created_at", getFirstOfMonth());

  return {
    contacts: contactsCount || 0,
    calls_this_month: callsCount || 0,
    sms_this_month: 0, // Implement based on your data
    team_members: 0, // Implement based on your data
  };
}

/**
 * Get monthly SMS sent count
 */
async function getMonthlySmsSent(accountId: string): Promise<number> {
  const { count } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact" })
    .eq("account_id", accountId)
    .gte("created_at", getFirstOfMonth());

  return count || 0;
}

/**
 * Get first day of current month
 */
function getFirstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * 3. EXAMPLE USAGE
 */

// Example: Run the server
export function startTenantServer(port: number = 3001) {
  const app = createTenantApp();

  app.listen(port, () => {
    console.log(`Tenant-aware server running on port ${port}`);
    console.log(`Supports multi-tenant via subdomains and custom domains`);
  });

  return app;
}

// Example: If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 3001;
  startTenantServer(Number(PORT));
}

/**
 * 4. QUERY PATTERNS FOR TENANT ISOLATION
 *
 * Always include account_id filter:
 *
 * Correct (isolated):
 *   .eq("account_id", req.accountId)
 *
 * Wrong (leaks data):
 *   .select("*") // No account filter!
 *
 * Pattern with joins:
 *   .select("*, contacts(*)")
 *   .eq("account_id", req.accountId)
 *   // contacts are auto-filtered by RLS if set up correctly
 *
 * Pattern with counts:
 *   .select("*", { count: "exact" })
 *   .eq("account_id", req.accountId)
 */
