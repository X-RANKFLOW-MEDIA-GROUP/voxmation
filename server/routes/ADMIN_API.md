# Admin Account Management API

Comprehensive API documentation for managing accounts and members in the Voxmation platform.

## Authentication & Authorization

All admin endpoints require:
1. **Valid JWT token** in the `Authorization: Bearer <token>` header
2. **Admin or Owner role** in the account
3. **Appropriate permissions** for specific operations

### Required Permissions

- `manage_accounts`: Update account plans and features
- `manage_members`: Add, update, or remove team members

Owners and admins automatically have all permissions.

---

## Endpoints

### 1. GET /api/admin/accounts

List all accounts with optional filtering and pagination.

**Authentication**: Required (Admin or Owner)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page |
| `status` | string | "active" | Filter by status: `active`, `inactive`, or `all` |
| `type` | string | "all" | Filter by type: `master`, `sub`, or `all` |
| `search` | string | - | Search by account name |

**Request Example**:
```bash
curl -X GET "http://localhost:3001/api/admin/accounts?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "acc_123",
      "name": "Company A",
      "type": "master",
      "plan": "pro",
      "is_active": true,
      "parent_account_id": null,
      "subdomain": "company-a",
      "custom_domain": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-06-25T15:45:00Z",
      "branding": {
        "primary_color": "#007bff",
        "company_name": "Company A"
      },
      "settings": {
        "features": {
          "crm": true,
          "marketing": true,
          "phone": true
        },
        "limits": {
          "contacts": 10000,
          "calls_per_month": 50000
        }
      },
      "account_members": [
        {
          "count": 5
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**Error Response** (500):
```json
{
  "success": false,
  "error": "Failed to fetch accounts"
}
```

---

### 2. GET /api/admin/accounts/:id

Get detailed information about a specific account.

**Authentication**: Required (Admin or Owner)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |

**Request Example**:
```bash
curl -X GET "http://localhost:3001/api/admin/accounts/acc_123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "acc_123",
    "name": "Company A",
    "type": "master",
    "plan": "pro",
    "is_active": true,
    "parent_account_id": null,
    "subdomain": "company-a",
    "custom_domain": null,
    "branding": {
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "logo_url": "https://example.com/logo.png",
      "company_name": "Company A",
      "company_description": "Leading SaaS platform"
    },
    "settings": {
      "features": {
        "crm": true,
        "marketing": true,
        "phone": true,
        "sms": true,
        "email": true,
        "reports": true
      },
      "limits": {
        "contacts": 10000,
        "calls_per_month": 50000,
        "sms_per_month": 5000,
        "team_members": 25
      }
    },
    "subscription": {
      "id": "sub_456",
      "plan_id": "plan_pro",
      "status": "active",
      "current_period_start": "2024-06-01T00:00:00Z",
      "current_period_end": "2024-07-01T00:00:00Z",
      "trial_end": null
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-06-25T15:45:00Z"
  }
}
```

**Error Responses**:

404 - Account not found:
```json
{
  "success": false,
  "error": "Account not found"
}
```

---

### 3. PATCH /api/admin/accounts/:id

Update account plan, features, limits, or branding.

**Authentication**: Required (Admin or Owner)
**Permission**: `manage_accounts`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |

**Request Body**:
```json
{
  "plan": "enterprise",
  "is_active": true,
  "features": {
    "crm": true,
    "marketing": true,
    "phone": true,
    "sms": true,
    "email": true,
    "reports": true
  },
  "limits": {
    "contacts": 50000,
    "calls_per_month": 100000,
    "sms_per_month": 10000,
    "team_members": 50
  },
  "branding": {
    "primary_color": "#FF5733",
    "company_name": "Updated Company A"
  }
}
```

**Request Example**:
```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "enterprise",
    "features": {
      "crm": true,
      "marketing": true
    },
    "limits": {
      "contacts": 50000
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "acc_123",
    "name": "Company A",
    "type": "master",
    "plan": "enterprise",
    "is_active": true,
    "settings": {
      "features": {
        "crm": true,
        "marketing": true,
        "phone": true,
        "sms": true,
        "email": true,
        "reports": true
      },
      "limits": {
        "contacts": 50000,
        "calls_per_month": 100000
      }
    },
    "updated_at": "2024-06-25T16:00:00Z"
  },
  "message": "Account updated successfully"
}
```

**Error Responses**:

404 - Account not found:
```json
{
  "success": false,
  "error": "Account not found"
}
```

403 - Insufficient permissions:
```json
{
  "success": false,
  "error": "Missing permission: manage_accounts"
}
```

---

### 4. GET /api/admin/accounts/:id/members

List all members of an account with pagination and filtering.

**Authentication**: Required (Admin or Owner)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page |
| `role` | string | - | Filter by role: `owner`, `admin`, `manager`, `agent`, `viewer` |
| `status` | string | "active" | Filter by status: `active`, `invited`, or `all` |

**Request Example**:
```bash
curl -X GET "http://localhost:3001/api/admin/accounts/acc_123/members?page=1&role=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "mem_789",
      "account_id": "acc_123",
      "user_id": "usr_001",
      "email": "john@company.com",
      "user_metadata": {
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "role": "admin",
      "permissions": ["manage_accounts", "manage_members"],
      "status": "active",
      "joined_at": "2024-02-20T10:00:00Z",
      "created_at": "2024-02-20T10:00:00Z"
    },
    {
      "id": "mem_790",
      "account_id": "acc_123",
      "user_id": "usr_002",
      "email": "jane@company.com",
      "user_metadata": {
        "full_name": "Jane Smith"
      },
      "role": "manager",
      "permissions": ["manage_campaigns"],
      "status": "active",
      "joined_at": "2024-03-15T14:30:00Z",
      "created_at": "2024-03-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Account not found"
}
```

---

### 5. POST /api/admin/accounts/:id/members

Add or invite a new member to an account.

**Authentication**: Required (Admin or Owner)
**Permission**: `manage_members`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |

**Request Body**:
```json
{
  "email": "newmember@example.com",
  "role": "manager",
  "permissions": ["manage_campaigns", "view_reports"],
  "send_invitation": true
}
```

**Valid Roles**:
- `owner` - Full account control
- `admin` - Administrative access
- `manager` - Team and campaign management
- `agent` - Limited operational access
- `viewer` - Read-only access

**Request Example**:
```bash
curl -X POST "http://localhost:3001/api/admin/accounts/acc_123/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "role": "manager",
    "permissions": ["manage_campaigns"],
    "send_invitation": true
  }'
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "mem_791",
    "account_id": "acc_123",
    "user_id": "invite_1719340800000",
    "email": "newmember@example.com",
    "role": "manager",
    "permissions": ["manage_campaigns"],
    "status": "invited",
    "joined_at": "2024-06-25T16:20:00Z",
    "created_at": "2024-06-25T16:20:00Z"
  },
  "message": "Member invited successfully"
}
```

**Error Responses**:

400 - Missing required fields:
```json
{
  "success": false,
  "error": "Missing required fields: email and role"
}
```

400 - Invalid role:
```json
{
  "success": false,
  "error": "Invalid role. Must be one of: owner, admin, manager, agent, viewer"
}
```

404 - Account not found:
```json
{
  "success": false,
  "error": "Account not found"
}
```

409 - Member already exists:
```json
{
  "success": false,
  "error": "User is already a member of this account"
}
```

403 - Insufficient permissions:
```json
{
  "success": false,
  "error": "Missing permission: manage_members"
}
```

---

### 6. PATCH /api/admin/accounts/:id/members/:memberId

Update a member's role, permissions, or status.

**Authentication**: Required (Admin or Owner)
**Permission**: `manage_members`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |
| `memberId` | string | Member ID |

**Request Body**:
```json
{
  "role": "admin",
  "permissions": ["manage_accounts", "manage_members", "manage_campaigns"],
  "status": "active"
}
```

**Request Example**:
```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123/members/mem_791" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "permissions": ["manage_accounts", "manage_members"]
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "mem_791",
    "account_id": "acc_123",
    "user_id": "usr_003",
    "email": "newmember@example.com",
    "role": "admin",
    "permissions": ["manage_accounts", "manage_members"],
    "status": "active",
    "joined_at": "2024-06-25T16:20:00Z",
    "created_at": "2024-06-25T16:20:00Z"
  },
  "message": "Member updated successfully"
}
```

**Error Responses**:

404 - Member not found:
```json
{
  "success": false,
  "error": "Member not found"
}
```

400 - Invalid role:
```json
{
  "success": false,
  "error": "Invalid role. Must be one of: owner, admin, manager, agent, viewer"
}
```

---

### 7. DELETE /api/admin/accounts/:id/members/:memberId

Remove a member from an account.

**Authentication**: Required (Admin or Owner)
**Permission**: `manage_members`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Account ID |
| `memberId` | string | Member ID |

**Request Example**:
```bash
curl -X DELETE "http://localhost:3001/api/admin/accounts/acc_123/members/mem_791" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Error Responses**:

404 - Member not found:
```json
{
  "success": false,
  "error": "Member not found"
}
```

---

## Usage Examples

### Example 1: Get All Active Accounts

```bash
curl -X GET "http://localhost:3001/api/admin/accounts?status=active&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 2: Upgrade Account Plan

```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "enterprise",
    "limits": {
      "contacts": 100000,
      "calls_per_month": 500000,
      "team_members": 100
    }
  }'
```

### Example 3: Add New Team Member

```bash
curl -X POST "http://localhost:3001/api/admin/accounts/acc_123/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@company.com",
    "role": "admin",
    "permissions": ["manage_accounts", "manage_members", "manage_campaigns"],
    "send_invitation": true
  }'
```

### Example 4: Get Account Members with Specific Role

```bash
curl -X GET "http://localhost:3001/api/admin/accounts/acc_123/members?role=manager&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 5: Demote Admin to Manager

```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123/members/mem_791" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager",
    "permissions": ["manage_campaigns"]
  }'
```

---

## Data Models

### Account Object

```typescript
{
  id: string;                          // Unique account identifier
  name: string;                        // Account display name
  type: "master" | "sub";              // Account type
  plan: "free" | "starter" | "pro" | "enterprise"; // Current plan
  is_active: boolean;                  // Account status
  parent_account_id?: string;          // Parent account (for sub-accounts)
  subdomain?: string;                  // Subdomain for white-label
  custom_domain?: string;              // Custom domain
  branding: BrandingData;              // Branding settings
  settings: SettingsData;              // Features and limits
  subscription?: Subscription;         // Active subscription
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
}
```

### Member Object

```typescript
{
  id: string;                          // Member record ID
  account_id: string;                  // Associated account ID
  user_id: string;                     // Supabase user ID
  email: string;                       // User email
  user_metadata: Record<string, any>;  // User profile data
  role: "owner" | "admin" | "manager" | "agent" | "viewer"; // Role
  permissions: string[];               // Specific permissions
  status: "active" | "inactive" | "invited"; // Status
  joined_at: string;                   // ISO timestamp
  created_at: string;                  // ISO timestamp
}
```

### Subscription Object

```typescript
{
  id: string;                          // Subscription ID
  plan_id: string;                     // Billing plan ID
  status: string;                      // "active", "cancelled", etc.
  current_period_start: string;        // ISO timestamp
  current_period_end: string;          // ISO timestamp
  trial_end?: string;                  // ISO timestamp (optional)
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad request (invalid data)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (resource already exists)
- `500` - Internal server error

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role and permission checks are enforced at the middleware level
3. **Row-Level Security**: Supabase RLS policies ensure users can only access their own accounts
4. **Audit Logging**: All admin actions are logged for compliance and monitoring
5. **Rate Limiting**: Consider implementing rate limiting for these endpoints in production

---

## Implementation Notes

- The API uses JWT tokens from Supabase authentication
- Tenant context is extracted from the token and enforced on all queries
- Permissions are granular and can be customized per role
- Admin actions are logged to `admin_audit_logs` table
- Invitation emails are sent when inviting new members (if `send_invitation=true`)

---

## Database Tables Required

- `accounts` - Account information
- `account_members` - User-account relationships
- `subscriptions` - Active subscriptions
- `users` - Supabase auth users
- `admin_audit_logs` - Admin action audit trail

Ensure these tables exist and have proper RLS policies configured.
