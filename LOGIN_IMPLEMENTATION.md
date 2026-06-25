# Login Implementation Guide

## Overview

A complete, production-ready login system with white-label support, form validation, and automatic branding detection.

## Files Created/Updated

### Frontend Components

#### 1. `/src/pages/Login.tsx` (Updated)
The main login page component with:
- **Form with validation** using React Hook Form + Zod
- **Email/Password fields** with error handling
- **Password visibility toggle** for better UX
- **Automatic branding detection** from `/api/branding`
- **White-label support** (logo, colors, company name, footer text)
- **Forgot password link** (ready to implement)
- **Sign up redirect** link
- **Support contact link** from branding

**Features:**
- Built with shadcn/ui components (Card, Button, Input, Form, Alert)
- Full TypeScript support with Zod schema validation
- Responsive design (mobile-friendly)
- Accessibility features (ARIA labels, semantic HTML)
- CSS variables for theme customization

**Key Props/State:**
```typescript
interface BrandingConfig {
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  logo_url?: string;
  company_name?: string;
  company_description?: string;
  footer_text?: string;
  support_email?: string;
  support_phone?: string;
}
```

#### 2. `/src/hooks/useAuth.ts` (New)
Authentication state management hook with:
- **login(email, password)** - Authenticate user
- **register(email, password, fullName?, companyName?)** - Create new account
- **logout()** - Sign out user
- **refreshToken(refreshToken)** - Refresh expired token
- **getAuthHeader()** - Get Authorization header
- **State:** user, token, accountId, isLoading, isAuthenticated, error

**Usage Example:**
```typescript
const { user, isAuthenticated, login, logout, error } = useAuth();

if (isAuthenticated) {
  return <Dashboard user={user} />;
}

const handleLogin = async () => {
  const success = await login(email, password);
  if (success) navigate('/portal/dashboard');
};
```

#### 3. `/src/components/ProtectedRoute.tsx` (New)
Route protection component for authenticated-only pages:
```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

### Backend Routes

#### 4. `/server/routes/auth.ts` (New)
Authentication API endpoints:

**POST `/api/auth/login`**
- Request: `{ email: string, password: string }`
- Response: `{ success: boolean, token: string, user: AuthUser, accountId?: string }`
- Authenticates with Supabase
- Returns JWT token for client-side storage
- Includes error handling with user-friendly messages

**POST `/api/auth/logout`**
- Logs out user from Supabase
- Clears session

**POST `/api/auth/refresh`**
- Request: `{ refresh_token: string }`
- Refreshes expired access token
- Returns new JWT token

**POST `/api/auth/register`**
- Request: `{ email, password, fullName?, companyName? }`
- Creates new user account
- Returns confirmation message

### Server Integration

#### 5. `/server/index.ts` (Updated)
- Added `import authRoutes from "./routes/auth"`
- Registered routes: `app.use("/api/auth", authRoutes)`

## White-Label Support

### Automatic Branding Detection

The system automatically detects and applies white-label branding based on:
1. **Subdomain** (e.g., `clienta.voxmation.com`)
2. **Custom domain** (e.g., `crm.clienta.com`)
3. **Master account** (fallback for main domain)

### Branding Customization

Branding is fetched from `/api/branding` endpoint and includes:

```typescript
{
  primary_color: "#37ca37",           // Main brand color
  secondary_color: "#188bf6",         // Secondary color
  tertiary_color: "#f59e0b",          // Accent color
  logo_url: "https://...",            // Company logo
  logo_dark_url: "https://...",       // Dark theme logo
  favicon_url: "https://...",         // Browser tab icon
  company_name: "Acme Corp",          // Display name
  company_description: "...",         // Tagline/description
  footer_text: "Powered by Voxmation",// Footer branding
  support_email: "support@...",       // Support contact
  support_phone: "+1-..."             // Support phone
}
```

### Implementation in Login Page

The Login component:
1. Fetches branding on mount
2. Applies colors to CSS variables
3. Updates document title
4. Updates favicon
5. Uses colors in button styles
6. Displays custom logo and company name

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  User accesses /login                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Load branding config │ (GET /api/branding)
         └───────────┬───────────┘
                     │
         ┌───────────▼────────────────┐
         │  Apply theme colors & logo │
         └───────────┬────────────────┘
                     │
        ┌────────────▼──────────────┐
        │   User enters credentials │
        └────────────┬──────────────┘
                     │
        ┌────────────▼──────────────┐
        │  Form validation (Zod)    │
        └────────────┬──────────────┘
                     │
        ┌────────────▼──────────────┐
        │   POST /api/auth/login    │
        └────────────┬──────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  Supabase authenticates user   │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  Store token in localStorage   │
    └────────────────┬────────────────┘
                     │
    ┌────────────────▼────────────────┐
    │  Redirect to /portal/dashboard  │
    └────────────────────────────────┘
```

## API Response Examples

### Successful Login
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "user_metadata": { "full_name": "John Doe" }
  },
  "accountId": "acc_123456",
  "message": "Login successful"
}
```

### Failed Login
```json
{
  "success": false,
  "error": "AUTHENTICATION_FAILED",
  "message": "Invalid email or password"
}
```

## Environment Variables

Required in `.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (for custom token generation)
JWT_SECRET=your-secret-key-min-32-chars

# Authentication
AUTH_TOKEN_EXPIRY=24h
AUTH_REDIRECT_URL=http://localhost:5173

# Optional: Email/SMTP for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Installation & Setup

### 1. Install Dependencies

Already included in project:
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Integration
- `jsonwebtoken` - JWT token generation

```bash
npm install
```

### 2. Configure Supabase

Ensure your Supabase project has:
- Auth enabled with Email/Password provider
- `accounts` table (for white-label support)
- `account_members` table (user-account relationship)

### 3. Update Routes (if using React Router)

```typescript
import { Login } from "@/pages/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/portal/Dashboard";

const router = [
  { path: "/login", element: <Login /> },
  {
    path: "/portal/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
];
```

### 4. Use Auth Hook in Components

```typescript
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header>
      <span>Welcome, {user?.email}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
};
```

## Security Best Practices

1. **Token Storage**
   - Tokens stored in localStorage (vulnerable to XSS)
   - Consider using httpOnly cookies for production
   - Implement token rotation/refresh mechanism

2. **HTTPS Only**
   - Always use HTTPS in production
   - Set secure cookies flag

3. **Password Requirements**
   - Enforce minimum 8 characters (adjust in schema)
   - Add complexity requirements (uppercase, numbers, symbols)
   - Consider 2FA for sensitive accounts

4. **Input Validation**
   - All inputs validated with Zod
   - Email format validated
   - SQL injection prevention (via Supabase)

5. **Error Handling**
   - Generic error messages to prevent user enumeration
   - Detailed logs on server side
   - Rate limiting (can be added)

## Customization

### Change Primary Colors
```typescript
// In Login component
const primaryColor = branding.primary_color || "#yourcolor";
```

### Add Additional Form Fields
```typescript
// Update Zod schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(), // Add new field
});

// Add FormField in JSX
```

### Customize Button Styles
```typescript
<Button
  style={{
    backgroundColor: primaryColor,
    borderColor: secondaryColor,
  }}
>
  Sign in
</Button>
```

### Add Logo Light/Dark Variants
```typescript
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const logoUrl = isDarkMode ? branding.logo_dark_url : branding.logo_url;
```

## Testing

### Manual Testing Checklist

- [ ] Login page loads and fetches branding
- [ ] Logo and colors display correctly
- [ ] Form validation works (invalid email, short password)
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows error message
- [ ] Token stored in localStorage
- [ ] Logout clears token and redirects to login
- [ ] Protected routes redirect unauthenticated users
- [ ] White-label branding applies on subdomain

### Example Test Credentials

```
Email: test@example.com
Password: Test123456!
```

## Troubleshooting

### Login fails with "Invalid email or password"
- Check Supabase auth credentials
- Verify user exists in Supabase auth
- Check SUPABASE_URL and SUPABASE_ANON_KEY

### Branding not loading
- Check `/api/branding` endpoint returns data
- Verify white-label middleware is active
- Check account record in database

### Token not stored
- Check localStorage not disabled in browser
- Verify API returns `token` field
- Check browser console for errors

### Protected routes not working
- Verify ProtectedRoute component wraps children
- Check useAuth hook loads token on mount
- Verify token in localStorage

## Future Enhancements

1. **OAuth Login** (Google, GitHub, Microsoft)
2. **Two-Factor Authentication** (TOTP, SMS)
3. **Social Login** Integration
4. **Session Management** (multiple devices)
5. **Password Reset Flow** with email verification
6. **Account Recovery** options
7. **Login History** and device tracking
8. **Rate Limiting** on failed attempts
9. **WebAuthn/Biometric** support
10. **Dark Mode** branding variants

## Support

For issues or questions:
- Check server logs: `/server/routes/auth.ts`
- Check browser console for client errors
- Review Supabase dashboard for auth issues
- Verify environment variables are set correctly
