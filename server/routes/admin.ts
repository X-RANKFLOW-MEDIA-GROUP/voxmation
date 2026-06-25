import { Router, Request, Response } from "express";
import { supabase } from "../supabase";
import { tenantMiddleware, requireRole, requirePermission } from "../middleware/tenantMiddleware";

const router = Router();

// Apply tenant middleware to all admin routes
router.use(tenantMiddleware);

// Require admin or owner role for all admin endpoints
router.use(requireRole("admin", "owner"));

/**
 * GET /api/admin/accounts
 * Get all accounts (with optional filtering and pagination)
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 * - status: 'active' | 'inactive' | 'all' (default 'active')
 * - type: 'master' | 'sub' | 'all' (default 'all')
 * - search: string (search by account name or email)
 *
 * Response:
 * {
 *   success: boolean
 *   data: Account[]
 *   pagination: {
 *     page: number
 *     limit: number
 *     total: number
 *     pages: number
 *   }
 * }
 */
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || "active";
    const type = (req.query.type as string) || "all";
    const search = req.query.search as string;

    let query = supabase.from("accounts").select(
      `
      id,
      name,
      type,
      plan,
      is_active,
      parent_account_id,
      subdomain,
      custom_domain,
      created_at,
      updated_at,
      branding,
      settings,
      account_members(count)
    `,
      { count: "exact" }
    );

    // Filter by status
    if (status !== "all") {
      query = query.eq("is_active", status === "active");
    }

    // Filter by type
    if (type !== "all") {
      query = query.eq("type", type);
    }

    // Search by name
    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch accounts",
    });
  }
});

/**
 * GET /api/admin/accounts/:id
 * Get specific account details
 *
 * Response:
 * {
 *   success: boolean
 *   data: {
 *     id: string
 *     name: string
 *     type: 'master' | 'sub'
 *     plan: 'free' | 'starter' | 'pro' | 'enterprise'
 *     is_active: boolean
 *     parent_account_id?: string
 *     subdomain?: string
 *     custom_domain?: string
 *     branding: BrandingData
 *     settings: SettingsData
 *     subscription?: {
 *       id: string
 *       plan_id: string
 *       status: string
 *       current_period_start: string
 *       current_period_end: string
 *       trial_end?: string
 *     }
 *     created_at: string
 *     updated_at: string
 *   }
 * }
 */
router.get("/accounts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select(
        `
        id,
        name,
        type,
        plan,
        is_active,
        parent_account_id,
        subdomain,
        custom_domain,
        branding,
        settings,
        created_at,
        updated_at
      `
      )
      .eq("id", id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }

    // Get subscription info if available
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        trial_end
      `
      )
      .eq("account_id", id)
      .eq("status", "active")
      .single();

    return res.json({
      success: true,
      data: {
        ...account,
        subscription: subscription || null,
      },
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch account",
    });
  }
});

/**
 * PATCH /api/admin/accounts/:id
 * Update account plan and/or features
 *
 * Request body:
 * {
 *   plan?: 'free' | 'starter' | 'pro' | 'enterprise'
 *   is_active?: boolean
 *   features?: {
 *     crm?: boolean
 *     marketing?: boolean
 *     phone?: boolean
 *     sms?: boolean
 *     email?: boolean
 *     reports?: boolean
 *     [key: string]: boolean
 *   }
 *   limits?: {
 *     contacts?: number
 *     calls_per_month?: number
 *     sms_per_month?: number
 *     team_members?: number
 *     [key: string]: number
 *   }
 *   branding?: {
 *     [key: string]: any
 *   }
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   data: Account
 *   message: string
 * }
 */
router.patch(
  "/accounts/:id",
  requirePermission("manage_accounts"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { plan, is_active, features, limits, branding } = req.body;

      // Get current account settings
      const { data: currentAccount, error: fetchError } = await supabase
        .from("accounts")
        .select("settings, branding")
        .eq("id", id)
        .single();

      if (fetchError || !currentAccount) {
        return res.status(404).json({
          success: false,
          error: "Account not found",
        });
      }

      // Prepare update object
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (plan) {
        updateData.plan = plan;
      }

      if (is_active !== undefined) {
        updateData.is_active = is_active;
      }

      // Merge settings
      if (features || limits) {
        updateData.settings = {
          ...currentAccount.settings,
          features: features || currentAccount.settings?.features,
          limits: limits || currentAccount.settings?.limits,
        };
      }

      // Merge branding
      if (branding) {
        updateData.branding = {
          ...currentAccount.branding,
          ...branding,
        };
      }

      // Update account
      const { data: updatedAccount, error: updateError } = await supabase
        .from("accounts")
        .update(updateData)
        .eq("id", id)
        .select();

      if (updateError) throw updateError;

      // Log the update action
      await logAdminAction(req.userId!, id, "account_updated", {
        plan,
        is_active,
        features,
        limits,
      });

      return res.json({
        success: true,
        data: updatedAccount?.[0],
        message: "Account updated successfully",
      });
    } catch (error) {
      console.error("Error updating account:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update account",
      });
    }
  }
);

/**
 * GET /api/admin/accounts/:id/members
 * Get all members of an account with pagination
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 * - role: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer' (optional)
 * - status: 'active' | 'invited' | 'all' (default 'active')
 *
 * Response:
 * {
 *   success: boolean
 *   data: AccountMember[]
 *   pagination: {
 *     page: number
 *     limit: number
 *     total: number
 *     pages: number
 *   }
 * }
 */
router.get("/accounts/:id/members", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const status = (req.query.status as string) || "active";

    // Verify account exists
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }

    let query = supabase
      .from("account_members")
      .select(
        `
        id,
        user_id,
        account_id,
        role,
        permissions,
        status,
        joined_at,
        created_at,
        users(
          id,
          email,
          user_metadata
        )
      `,
        { count: "exact" }
      )
      .eq("account_id", id);

    // Filter by role
    if (role) {
      query = query.eq("role", role);
    }

    // Filter by status
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order("joined_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform response to include user info
    const members = (data || []).map((member: any) => ({
      id: member.id,
      account_id: member.account_id,
      user_id: member.user_id,
      email: member.users?.email,
      user_metadata: member.users?.user_metadata || {},
      role: member.role,
      permissions: member.permissions,
      status: member.status,
      joined_at: member.joined_at,
      created_at: member.created_at,
    }));

    return res.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching account members:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch account members",
    });
  }
});

/**
 * POST /api/admin/accounts/:id/members
 * Add or invite a new member to account
 *
 * Request body:
 * {
 *   email: string
 *   role: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer'
 *   permissions?: string[]
 *   send_invitation?: boolean (default true)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   data: AccountMember
 *   message: string
 * }
 */
router.post(
  "/accounts/:id/members",
  requirePermission("manage_members"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { email, role, permissions, send_invitation = true } = req.body;

      // Validate required fields
      if (!email || !role) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: email and role",
        });
      }

      // Validate role
      const validRoles = ["owner", "admin", "manager", "agent", "viewer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
      }

      // Verify account exists
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, name")
        .eq("id", id)
        .single();

      if (accountError || !account) {
        return res.status(404).json({
          success: false,
          error: "Account not found",
        });
      }

      // Check if user already exists in account
      const { data: existingMember } = await supabase
        .from("account_members")
        .select("id")
        .eq("account_id", id)
        .eq("email", email)
        .single();

      if (existingMember) {
        return res.status(409).json({
          success: false,
          error: "User is already a member of this account",
        });
      }

      // Try to find existing user by email
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      let userId: string;
      let status = "active";

      if (existingUser) {
        // User exists, add them directly
        userId = existingUser.id;
      } else {
        // User doesn't exist, create invitation
        status = "invited";
        // For new users, we'll create a placeholder user ID
        // In production, you might want to use a different approach
        userId = `invite_${Date.now()}`;
      }

      // Add member to account
      const { data: newMember, error: addError } = await supabase
        .from("account_members")
        .insert([
          {
            account_id: id,
            user_id: userId,
            email,
            role,
            permissions: permissions || [],
            status,
            joined_at: new Date().toISOString(),
          },
        ])
        .select();

      if (addError) throw addError;

      // Send invitation email if requested
      if (send_invitation && status === "invited") {
        await sendInvitationEmail(email, account.name, id, role);
      }

      // Log the action
      await logAdminAction(req.userId!, id, "member_added", {
        email,
        role,
        status,
      });

      return res.status(201).json({
        success: true,
        data: newMember?.[0],
        message: `Member ${
          status === "invited" ? "invited" : "added"
        } successfully`,
      });
    } catch (error) {
      console.error("Error adding account member:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to add account member",
      });
    }
  }
);

/**
 * PATCH /api/admin/accounts/:id/members/:memberId
 * Update account member role and/or permissions
 *
 * Request body:
 * {
 *   role?: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer'
 *   permissions?: string[]
 *   status?: 'active' | 'inactive' | 'invited'
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   data: AccountMember
 *   message: string
 * }
 */
router.patch(
  "/accounts/:id/members/:memberId",
  requirePermission("manage_members"),
  async (req: Request, res: Response) => {
    try {
      const { id, memberId } = req.params;
      const { role, permissions, status } = req.body;

      // Verify account exists
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", id)
        .single();

      if (accountError || !account) {
        return res.status(404).json({
          success: false,
          error: "Account not found",
        });
      }

      // Verify member exists
      const { data: member, error: memberError } = await supabase
        .from("account_members")
        .select("id, role")
        .eq("id", memberId)
        .eq("account_id", id)
        .single();

      if (memberError || !member) {
        return res.status(404).json({
          success: false,
          error: "Member not found",
        });
      }

      // Prepare update object
      const updateData: Record<string, any> = {};

      if (role) {
        const validRoles = ["owner", "admin", "manager", "agent", "viewer"];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
          });
        }
        updateData.role = role;
      }

      if (permissions !== undefined) {
        updateData.permissions = permissions;
      }

      if (status) {
        updateData.status = status;
      }

      // Update member
      const { data: updatedMember, error: updateError } = await supabase
        .from("account_members")
        .update(updateData)
        .eq("id", memberId)
        .eq("account_id", id)
        .select();

      if (updateError) throw updateError;

      // Log the action
      await logAdminAction(req.userId!, id, "member_updated", {
        member_id: memberId,
        ...updateData,
      });

      return res.json({
        success: true,
        data: updatedMember?.[0],
        message: "Member updated successfully",
      });
    } catch (error) {
      console.error("Error updating account member:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update account member",
      });
    }
  }
);

/**
 * DELETE /api/admin/accounts/:id/members/:memberId
 * Remove member from account
 *
 * Response:
 * {
 *   success: boolean
 *   message: string
 * }
 */
router.delete(
  "/accounts/:id/members/:memberId",
  requirePermission("manage_members"),
  async (req: Request, res: Response) => {
    try {
      const { id, memberId } = req.params;

      // Verify account exists
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", id)
        .single();

      if (accountError || !account) {
        return res.status(404).json({
          success: false,
          error: "Account not found",
        });
      }

      // Verify member exists and belongs to account
      const { data: member, error: memberError } = await supabase
        .from("account_members")
        .select("id")
        .eq("id", memberId)
        .eq("account_id", id)
        .single();

      if (memberError || !member) {
        return res.status(404).json({
          success: false,
          error: "Member not found",
        });
      }

      // Delete member
      const { error: deleteError } = await supabase
        .from("account_members")
        .delete()
        .eq("id", memberId);

      if (deleteError) throw deleteError;

      // Log the action
      await logAdminAction(req.userId!, id, "member_removed", {
        member_id: memberId,
      });

      return res.json({
        success: true,
        message: "Member removed successfully",
      });
    } catch (error) {
      console.error("Error removing account member:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove account member",
      });
    }
  }
);

/**
 * Helper function to log admin actions
 */
async function logAdminAction(
  adminUserId: string,
  accountId: string,
  action: string,
  details: any
) {
  if (!supabase) return;

  try {
    await supabase.from("admin_audit_logs").insert([
      {
        admin_user_id: adminUserId,
        account_id: accountId,
        action,
        details,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Don't throw - logging errors shouldn't break the main operation
  }
}

/**
 * Helper function to send invitation email
 */
async function sendInvitationEmail(
  email: string,
  accountName: string,
  accountId: string,
  role: string
) {
  // This is a placeholder - implement based on your email service
  console.log(
    `Invitation email would be sent to ${email} for ${accountName} with role ${role}`
  );

  // In production, integrate with your email service (SendGrid, AWS SES, etc.)
  // Example:
  // await sendEmail({
  //   to: email,
  //   subject: `You've been invited to ${accountName}`,
  //   html: `<p>You have been invited to join ${accountName} as a ${role}.</p>...`
  // });
}

export default router;
