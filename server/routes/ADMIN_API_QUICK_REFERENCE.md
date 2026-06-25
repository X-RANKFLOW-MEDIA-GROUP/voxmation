# Admin API - Quick Reference Guide

## Overview
Complete admin account management with 7 endpoints for managing accounts and team members.

## Quick Start

### Authentication
All requests require JWT token in header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Base URL
```
http://localhost:3001/api/admin
```

## Endpoints

### 1️⃣ List Accounts
```http
GET /accounts?page=1&limit=10&status=active
```
Filter by: `status` (active|inactive|all), `type` (master|sub|all), `search` (name)

### 2️⃣ Get Account Details
```http
GET /accounts/{id}
```
Returns account with subscription info and all settings.

### 3️⃣ Update Account
```http
PATCH /accounts/{id}
```
Update: `plan`, `is_active`, `features`, `limits`, `branding`

**Body example:**
```json
{
  "plan": "enterprise",
  "limits": { "contacts": 100000 },
  "features": { "crm": true, "marketing": true }
}
```

### 4️⃣ List Members
```http
GET /accounts/{id}/members?page=1&limit=10&role=admin
```
Filter by: `role`, `status` (active|invited|all)

### 5️⃣ Add Member
```http
POST /accounts/{id}/members
```
**Body:**
```json
{
  "email": "user@example.com",
  "role": "manager",
  "permissions": ["manage_campaigns"],
  "send_invitation": true
}
```

Valid roles: `owner`, `admin`, `manager`, `agent`, `viewer`

### 6️⃣ Update Member
```http
PATCH /accounts/{id}/members/{memberId}
```
Update: `role`, `permissions`, `status`

### 7️⃣ Remove Member
```http
DELETE /accounts/{id}/members/{memberId}
```

## HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - New resource |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource missing |
| 409 | Conflict - Resource already exists |
| 500 | Server Error |

## Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Success Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

## Pagination Response Format
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Required Permissions
- Read operations: Admin or Owner role
- Update account: `manage_accounts` permission
- Manage members: `manage_members` permission

## Common Tasks

### List all active accounts
```bash
curl -X GET "http://localhost:3001/api/admin/accounts?status=active" \
  -H "Authorization: Bearer TOKEN"
```

### Get account with all details
```bash
curl -X GET "http://localhost:3001/api/admin/accounts/acc_123" \
  -H "Authorization: Bearer TOKEN"
```

### Upgrade account to enterprise
```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123" \
  -H "Authorization: Bearer TOKEN" \
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

### Add new admin member
```bash
curl -X POST "http://localhost:3001/api/admin/accounts/acc_123/members" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "role": "admin",
    "permissions": ["manage_accounts", "manage_members"],
    "send_invitation": true
  }'
```

### List account admins
```bash
curl -X GET "http://localhost:3001/api/admin/accounts/acc_123/members?role=admin" \
  -H "Authorization: Bearer TOKEN"
```

### Promote manager to admin
```bash
curl -X PATCH "http://localhost:3001/api/admin/accounts/acc_123/members/mem_456" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "permissions": ["manage_accounts", "manage_members"]
  }'
```

### Remove member from account
```bash
curl -X DELETE "http://localhost:3001/api/admin/accounts/acc_123/members/mem_456" \
  -H "Authorization: Bearer TOKEN"
```

## Available Roles
- **owner**: Full account control, all permissions
- **admin**: Administrative access, manage members and campaigns
- **manager**: Team and campaign management
- **agent**: Limited operational access
- **viewer**: Read-only access

## Available Features
- `crm`: Customer relationship management
- `marketing`: Marketing campaigns
- `phone`: Phone/call capabilities
- `sms`: SMS messaging
- `email`: Email capabilities
- `reports`: Advanced reporting

## Available Limits
- `contacts`: Max number of contacts
- `calls_per_month`: Monthly call limit
- `sms_per_month`: Monthly SMS limit
- `team_members`: Max team members

## Query Parameters

### Accounts List
| Param | Type | Default | Options |
|-------|------|---------|---------|
| page | number | 1 | Any positive integer |
| limit | number | 10 | 1-100 |
| status | string | active | active, inactive, all |
| type | string | all | master, sub, all |
| search | string | - | Account name |

### Members List
| Param | Type | Default | Options |
|-------|------|---------|---------|
| page | number | 1 | Any positive integer |
| limit | number | 10 | 1-100 |
| role | string | - | owner, admin, manager, agent, viewer |
| status | string | active | active, invited, all |

## Response Examples

### Successful Account List Response
```json
{
  "success": true,
  "data": [
    {
      "id": "acc_123",
      "name": "Company A",
      "plan": "pro",
      "is_active": true,
      "type": "master",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Successful Member Add Response
```json
{
  "success": true,
  "data": {
    "id": "mem_789",
    "email": "user@example.com",
    "role": "manager",
    "status": "active",
    "joined_at": "2024-06-25T16:20:00Z"
  },
  "message": "Member added successfully"
}
```

## Troubleshooting

### 401 Unauthorized
- Check JWT token is valid and not expired
- Verify token format in Authorization header
- Re-authenticate if needed

### 403 Forbidden
- Verify user has Admin or Owner role
- Check specific permission is granted (manage_accounts, manage_members)
- Contact account owner if needed

### 404 Not Found
- Verify account ID/member ID is correct
- Check resource hasn't been deleted
- Ensure proper pagination if listing

### 409 Conflict
- User might already be a member of account
- Try updating instead of adding
- Check if resource already exists

## Documentation Files

- **ADMIN_API.md**: Complete API documentation with examples
- **admin.examples.ts**: 17 TypeScript usage examples
- **admin.ts**: Source code implementation
- **types/admin.ts**: TypeScript type definitions

## Key Features

✅ Pagination and filtering
✅ Role-based access control
✅ Permission-based authorization
✅ Audit logging of all actions
✅ Member invitations with email
✅ Plan and feature management
✅ Bulk operations support
✅ Comprehensive error handling
✅ Multi-tenant isolation
✅ Input validation

---

For detailed documentation, see **ADMIN_API.md**
For code examples, see **admin.examples.ts**
