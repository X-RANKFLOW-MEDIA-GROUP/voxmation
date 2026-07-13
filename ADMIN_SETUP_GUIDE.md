# Admin Setup Guide

## Admin Login Credentials

The Voxmation admin dashboard uses Supabase authentication. 

### Demo/Test Credentials
- **Email**: `admin@voxmation.com`
- **Password**: `142522`

## Setting Up the Admin Account in Supabase

### Step 1: Create Admin User in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** (or use the Auth API)
4. Create a new user with:
   - Email: `admin@voxmation.com`
   - Password: `142522`
   - Auto-confirm email: **Yes** (recommended for dev/demo)

### Step 2: Access Admin Dashboard
1. Navigate to `/admin/login` on your Voxmation instance
2. You can either:
   - Manually enter the credentials, or
   - Click **"Use Demo Credentials"** button to auto-fill the form
3. Click **"Sign In"**
4. You will be redirected to `/admin/applications` dashboard

## Admin Features

The admin dashboard provides access to:
- Application management
- User administration
- System monitoring
- Admin-level analytics

## Security Notes

⚠️ **Important**: These demo credentials are for development and testing only.

For production deployments:
1. Change the admin password in Supabase
2. Use strong, unique credentials
3. Enable MFA (Multi-Factor Authentication)
4. Regularly audit admin access logs
5. Implement role-based access control (RBAC)

## Troubleshooting

### "Login failed" error
- Verify the credentials are correct in Supabase
- Check that the user account has been created and confirmed
- Review browser console for detailed error messages

### "Unauthorized" error after login
- Ensure the admin role is properly assigned in Supabase
- Check that the session token is being stored correctly in localStorage
- Verify the ProtectedAdminRoute component is properly configured

### Admin dashboard not loading
- Check network tab in browser DevTools for API errors
- Verify the `/admin/applications` route is defined in App.tsx
- Ensure ApplicationDashboard component is properly imported

## Supabase Authentication Flow

1. User enters email/password on `/admin/login`
2. AdminAuthContext calls `supabase.auth.signInWithPassword()`
3. Supabase returns authentication token
4. Token is stored in localStorage as `auth_token`
5. ProtectedAdminRoute validates token before granting access
6. User is redirected to `/admin/applications` dashboard

## Environment Variables

Ensure these Supabase environment variables are set:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are used by `@/lib/supabase-client` to initialize the Supabase client.

## Next Steps

- [ ] Set up admin account in Supabase
- [ ] Test login flow with demo credentials
- [ ] Configure admin roles and permissions
- [ ] Set up admin activity logging
- [ ] Document admin-specific workflows
