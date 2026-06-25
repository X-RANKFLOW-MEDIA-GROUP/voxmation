/**
 * Admin API Examples
 * Practical examples and use cases for the admin account management API
 */

// ============================================================================
// EXAMPLE 1: List All Accounts with Pagination
// ============================================================================

export const example1_listAllAccounts = async () => {
  const response = await fetch("http://localhost:3001/api/admin/accounts", {
    method: "GET",
    headers: {
      Authorization: "Bearer YOUR_JWT_TOKEN",
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  console.log("All accounts:", result.data);
  console.log("Total accounts:", result.pagination.total);
  console.log("Pages:", result.pagination.pages);
};

// ============================================================================
// EXAMPLE 2: List Active Accounts Only
// ============================================================================

export const example2_listActiveAccounts = async () => {
  const response = await fetch(
    "http://localhost:3001/api/admin/accounts?status=active&limit=20",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();
  const activeAccounts = result.data.filter((acc: any) => acc.is_active);
  console.log("Active accounts:", activeAccounts);
};

// ============================================================================
// EXAMPLE 3: Search Accounts by Name
// ============================================================================

export const example3_searchAccountsByName = async (searchTerm: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts?search=${encodeURIComponent(
      searchTerm
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();
  console.log(`Accounts matching "${searchTerm}":`, result.data);
};

// ============================================================================
// EXAMPLE 4: Get Single Account with Subscription
// ============================================================================

export const example4_getAccountDetails = async (accountId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log("Account name:", result.data.name);
    console.log("Current plan:", result.data.plan);
    console.log("Active features:", result.data.settings.features);
    console.log("Contact limits:", result.data.settings.limits.contacts);

    if (result.data.subscription) {
      console.log("Subscription status:", result.data.subscription.status);
      console.log("Period end:", result.data.subscription.current_period_end);
    }
  }
};

// ============================================================================
// EXAMPLE 5: Upgrade Account Plan
// ============================================================================

export const example5_upgradeAccountPlan = async (accountId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan: "enterprise",
        limits: {
          contacts: 100000,
          calls_per_month: 500000,
          sms_per_month: 50000,
          team_members: 100,
        },
      }),
    }
  );

  const result = await response.json();
  console.log("Account upgraded:", result.message);
  console.log("New plan:", result.data.plan);
};

// ============================================================================
// EXAMPLE 6: Enable/Disable Features
// ============================================================================

export const example6_enableFeatures = async (
  accountId: string,
  features: Record<string, boolean>
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features: {
          crm: features.crm ?? true,
          marketing: features.marketing ?? true,
          phone: features.phone ?? true,
          sms: features.sms ?? true,
          email: features.email ?? true,
          reports: features.reports ?? true,
        },
      }),
    }
  );

  const result = await response.json();
  console.log("Features updated:", result.data.settings.features);
};

// ============================================================================
// EXAMPLE 7: Deactivate Account
// ============================================================================

export const example7_deactivateAccount = async (accountId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_active: false,
      }),
    }
  );

  const result = await response.json();
  console.log("Account deactivated:", result.message);
  console.log("Active status:", result.data.is_active);
};

// ============================================================================
// EXAMPLE 8: List Account Members
// ============================================================================

export const example8_listAccountMembers = async (accountId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();
  console.log("Total members:", result.pagination.total);
  console.log("Members:", result.data);

  // Show distribution by role
  const roleDistribution = result.data.reduce((acc: any, member: any) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});
  console.log("Members by role:", roleDistribution);
};

// ============================================================================
// EXAMPLE 9: List Admin Members Only
// ============================================================================

export const example9_listAdmins = async (accountId: string) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members?role=admin`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();
  console.log("Admin members:", result.data);
};

// ============================================================================
// EXAMPLE 10: Add New Team Member
// ============================================================================

export const example10_addTeamMember = async (
  accountId: string,
  email: string,
  role: "admin" | "manager" | "agent" | "viewer" = "manager"
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        role,
        permissions: getPermissionsForRole(role),
        send_invitation: true,
      }),
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log("Member added:", result.message);
    console.log("Status:", result.data.status);
    console.log("Email:", result.data.email);
  } else {
    console.error("Error:", result.error);
  }
};

// ============================================================================
// EXAMPLE 11: Promote Team Member to Admin
// ============================================================================

export const example11_promoteToAdmin = async (
  accountId: string,
  memberId: string
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members/${memberId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "admin",
        permissions: [
          "manage_accounts",
          "manage_members",
          "manage_campaigns",
          "manage_automations",
          "view_analytics",
        ],
      }),
    }
  );

  const result = await response.json();
  console.log("Member promoted:", result.message);
  console.log("New role:", result.data.role);
};

// ============================================================================
// EXAMPLE 12: Demote Admin to Manager
// ============================================================================

export const example12_demoteToManager = async (
  accountId: string,
  memberId: string
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members/${memberId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "manager",
        permissions: ["manage_campaigns", "manage_automations", "view_analytics"],
      }),
    }
  );

  const result = await response.json();
  console.log("Member demoted:", result.message);
  console.log("New role:", result.data.role);
};

// ============================================================================
// EXAMPLE 13: Deactivate Member
// ============================================================================

export const example13_deactivateMember = async (
  accountId: string,
  memberId: string
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members/${memberId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "inactive",
      }),
    }
  );

  const result = await response.json();
  console.log("Member deactivated:", result.message);
  console.log("Status:", result.data.status);
};

// ============================================================================
// EXAMPLE 14: Remove Member from Account
// ============================================================================

export const example14_removeMember = async (
  accountId: string,
  memberId: string
) => {
  const response = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );

  const result = await response.json();
  console.log("Result:", result.message);
};

// ============================================================================
// EXAMPLE 15: Batch Operations - Upgrade Multiple Accounts
// ============================================================================

export const example15_batchUpgradeAccounts = async (
  accountIds: string[]
) => {
  const results = [];

  for (const accountId of accountIds) {
    const response = await fetch(
      `http://localhost:3001/api/admin/accounts/${accountId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: "pro",
          limits: {
            contacts: 50000,
            calls_per_month: 100000,
          },
        }),
      }
    );

    const result = await response.json();
    results.push({
      accountId,
      success: result.success,
      plan: result.data?.plan,
    });
  }

  console.log("Batch upgrade results:", results);
  return results;
};

// ============================================================================
// EXAMPLE 16: Invite Multiple Team Members
// ============================================================================

export const example16_inviteMultipleMembers = async (
  accountId: string,
  invites: Array<{ email: string; role: string }>
) => {
  const results = [];

  for (const invite of invites) {
    const response = await fetch(
      `http://localhost:3001/api/admin/accounts/${accountId}/members`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invite.email,
          role: invite.role,
          permissions: getPermissionsForRole(invite.role as any),
          send_invitation: true,
        }),
      }
    );

    const result = await response.json();
    results.push({
      email: invite.email,
      success: result.success,
      status: result.data?.status,
    });
  }

  console.log("Invitation results:", results);
  return results;
};

// ============================================================================
// EXAMPLE 17: Get Account Statistics
// ============================================================================

export const example17_getAccountStats = async (accountId: string) => {
  // Fetch account details
  const accountResponse = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );
  const account = await accountResponse.json();

  // Fetch members
  const membersResponse = await fetch(
    `http://localhost:3001/api/admin/accounts/${accountId}/members?limit=100`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
    }
  );
  const members = await membersResponse.json();

  // Compile statistics
  const stats = {
    accountName: account.data.name,
    plan: account.data.plan,
    isActive: account.data.is_active,
    totalMembers: members.pagination.total,
    activeMembers: members.data.filter((m: any) => m.status === "active").length,
    invitedMembers: members.data.filter((m: any) => m.status === "invited").length,
    roleDistribution: members.data.reduce((acc: any, member: any) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {}),
    enabledFeatures: Object.entries(account.data.settings.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    limits: account.data.settings.limits,
  };

  console.log("Account Statistics:", stats);
  return stats;
};

// ============================================================================
// Helper Function: Get Default Permissions for Role
// ============================================================================

function getPermissionsForRole(
  role: "owner" | "admin" | "manager" | "agent" | "viewer"
): string[] {
  const permissionsByRole = {
    owner: [
      "manage_accounts",
      "manage_members",
      "manage_campaigns",
      "manage_automations",
      "manage_billing",
      "view_analytics",
    ],
    admin: [
      "manage_members",
      "manage_campaigns",
      "manage_automations",
      "view_analytics",
    ],
    manager: ["manage_campaigns", "manage_automations", "view_analytics"],
    agent: ["manage_campaigns"],
    viewer: ["view_analytics"],
  };

  return permissionsByRole[role];
}

// ============================================================================
// USAGE GUIDE
// ============================================================================

/*
To use these examples:

1. Replace "YOUR_JWT_TOKEN" with your actual JWT token from authentication
2. Call any example function with the required parameters
3. Each function demonstrates a common admin operation

Example usage:
  await example4_getAccountDetails("acc_123");
  await example10_addTeamMember("acc_123", "john@example.com", "manager");
  await example11_promoteToAdmin("acc_123", "mem_456");

For batch operations:
  const accountIds = ["acc_123", "acc_456", "acc_789"];
  await example15_batchUpgradeAccounts(accountIds);

  const invites = [
    { email: "john@example.com", role: "admin" },
    { email: "jane@example.com", role: "manager" },
    { email: "bob@example.com", role: "agent" }
  ];
  await example16_inviteMultipleMembers("acc_123", invites);
*/
