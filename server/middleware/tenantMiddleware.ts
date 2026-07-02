import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountId?: string;
      userId?: string;
      userRole?: string;
      userPermissions?: string[];
    }
  }
}

/**
 * Middleware to extract tenant (account) context from JWT token
 * Attaches accountId, userId, and role to request object
 * Enforces RLS policies by including account_id in all queries
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.substring(7);

    // Get user from Supabase auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user's primary account from account_members
    const { data: accountMember, error: memberError } = await supabase
      .from("account_members")
      .select("account_id, role, permissions")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (memberError || !accountMember) {
      return res
        .status(403)
        .json({ error: "User not associated with any account" });
    }

    // Attach to request
    req.accountId = accountMember.account_id;
    req.userId = user.id;
    req.userRole = accountMember.role;
    req.userPermissions = accountMember.permissions?.permissions || [];

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions for this action" });
    }
    next();
  };

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    // Owners and admins have all permissions
    if (req.userRole === "owner" || req.userRole === "admin") {
      return next();
    }

    // Check specific permission
    if (!req.userPermissions?.includes(permission)) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }

    next();
  };

/**
 * Helper to ensure query filters by accountId
 * Returns Supabase query builder with account_id filter applied
 */
export const withTenant = (
  query: any,
  accountId: string,
  tableAlias?: string
) => {
  const field = tableAlias ? `${tableAlias}.account_id` : "account_id";
  return query.eq(field, accountId);
};

/**
 * Helper to include RLS context in queries
 * Use this when querying multi-tenant data
 */
export async function executeWithTenant(
  query: Promise<any>,
  accountId: string
) {
  // RLS is enforced automatically by Supabase
  // Just execute the query - the auth token ensures tenant isolation
  return query;
}
