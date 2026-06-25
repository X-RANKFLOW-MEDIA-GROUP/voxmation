# Login Implementation - Quick Start Guide

## 5-Minute Setup

### Step 1: Files Already Created
✓ `/src/pages/Login.tsx` - Login page component
✓ `/src/hooks/useAuth.ts` - Authentication hook
✓ `/src/components/ProtectedRoute.tsx` - Route protection
✓ `/server/routes/auth.ts` - API endpoints
✓ `/src/App.tsx` - Updated with login route

### Step 2: Verify Imports (1 minute)

Check that `Login.tsx` has these imports:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
```

If missing, ensure these packages are installed:

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Step 3: Environment Variables (1 minute)

Add to `.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# JWT (create a secure random string)
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Optional
AUTH_REDIRECT_URL=http://localhost:5173
```

### Step 4: Database Setup (1 minute)

Ensure Supabase has these tables:

**accounts**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'sub',
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  branding JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  plan TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**account_members**
```sql
CREATE TABLE account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5: Test Login (2 minutes)

1. Start the server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/login`

3. Test with Supabase credentials:
   ```
   Email: test@example.com
   Password: Test123456!
   ```

4. Check browser console - should see success response

## What's Included

### Frontend (React)

| File | Purpose |
|------|---------|
| `src/pages/Login.tsx` | Login UI with validation & branding |
| `src/hooks/useAuth.ts` | Auth state & methods |
| `src/components/ProtectedRoute.tsx` | Route guard |

### Backend (Node/Express)

| File | Purpose |
|------|---------|
| `server/routes/auth.ts` | Auth API endpoints |
| `server/index.ts` | Route registration |

### Documentation

| File | Purpose |
|------|---------|
| `LOGIN_IMPLEMENTATION.md` | Full documentation |
| `LOGIN_USAGE_EXAMPLES.md` | Code examples |
| `LOGIN_QUICK_START.md` | This file |

## Core Features

### 1. Login Form
- Email/password fields
- Form validation (Zod + React Hook Form)
- Password visibility toggle
- Loading state
- Error messages

### 2. White-Label Support
- Auto-fetch branding from `/api/branding`
- Custom colors, logo, company name
- Multi-tenant by subdomain/domain
- Responsive design

### 3. Authentication
- POST to `/api/auth/login`
- JWT token generation
- Token stored in localStorage
- Redirect to `/portal/dashboard`

### 4. Session Management
- Auto-load auth state on mount
- Logout functionality
- Token expiry handling
- Protected routes

## Common Tasks

### Task 1: Add Forgot Password Link

The login page already has a link to `/forgot-password`. Create the page:

```typescript
// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setSubmitted(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <Button type="submit">Send Reset Link</Button>
      {submitted && <p>Check your email!</p>}
    </form>
  );
};
```

Add route to App.tsx:
```typescript
<Route path="/forgot-password" element={<ForgotPassword />} />
```

### Task 2: Add Sign Up Page

```typescript
// src/pages/Signup.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(
      form.email,
      form.password,
      form.fullName
    );
    if (success) {
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6">
      <input
        type="text"
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({...form, fullName: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={form.password}
        onChange={(e) => setForm({...form, password: e.target.value})}
        className="w-full p-2 border rounded"
      />
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
};
```

### Task 3: Protect a Route

```typescript
// In App.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route
  path="/portal/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Task 4: Use Auth in Components

```typescript
import { useAuth } from "@/hooks/useAuth";

export const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <p>Please log in</p>;

  return (
    <div>
      <p>Hello, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Task 5: Add Custom Branding

Update branding in Supabase `accounts` table:

```sql
UPDATE accounts
SET branding = jsonb_build_object(
  'primary_color', '#FF6B6B',
  'secondary_color', '#4ECDC4',
  'company_name', 'Acme Corp',
  'logo_url', 'https://example.com/logo.png',
  'footer_text', 'Powered by Acme'
)
WHERE id = 'your-account-id';
```

The login page will auto-fetch and apply these settings.

## API Endpoints

### POST /api/auth/login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123...",
    "email": "test@example.com"
  },
  "accountId": "acc_123..."
}
```

### POST /api/auth/register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### POST /api/auth/logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/branding
```bash
curl http://localhost:3001/api/branding
```

Response:
```json
{
  "primary_color": "#37ca37",
  "secondary_color": "#188bf6",
  "company_name": "Voxmation",
  "logo_url": "https://..."
}
```

## Troubleshooting

### ❌ "Module not found: zod"
```bash
npm install zod @hookform/resolvers
```

### ❌ "Login button doesn't respond"
Check browser console for errors. Ensure:
- API server is running on port 3001
- Supabase credentials are correct in .env
- Network tab shows POST to /api/auth/login

### ❌ "Token not saving"
Check if localStorage is disabled in browser:
1. Open DevTools
2. Application → Cookies → Clear Site Data
3. Try again

### ❌ "Redirects to login after login"
Check:
- Browser console for errors
- localStorage has `auth_token`
- ProtectedRoute receives valid token

### ❌ "White label colors not applying"
1. Check /api/branding returns data
2. Check account in database has branding object
3. Check CSS variables are set: `--primary`, `--secondary`

## Next Steps

1. **Customize Login Page**
   - Change button colors in Login.tsx
   - Add company logo
   - Modify form fields

2. **Add More Auth Features**
   - Social login (Google, GitHub)
   - Two-factor authentication
   - Session management

3. **Secure Your App**
   - Add rate limiting to auth endpoints
   - Implement password complexity rules
   - Add email verification flow

4. **Monitor & Log**
   - Track login attempts
   - Log failed authentication
   - Monitor session duration

## File Checklist

- [x] `/src/pages/Login.tsx` - Created
- [x] `/src/hooks/useAuth.ts` - Created
- [x] `/src/components/ProtectedRoute.tsx` - Created
- [x] `/server/routes/auth.ts` - Created
- [x] `/server/index.ts` - Updated
- [x] `/src/App.tsx` - Updated with route

## Support

For detailed documentation, see:
- `LOGIN_IMPLEMENTATION.md` - Full guide
- `LOGIN_USAGE_EXAMPLES.md` - Code examples

For Supabase help:
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database

For React Hook Form:
- https://react-hook-form.com/
