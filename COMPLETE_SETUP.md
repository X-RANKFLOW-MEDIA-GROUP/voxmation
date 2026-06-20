# Complete Voxmation Job Application System - Setup Guide

This guide covers all features implemented:
✅ Job listing & applications
✅ Admin authentication
✅ Database persistence (Supabase)
✅ Email notifications (SendGrid)
✅ Rate limiting
✅ Pagination & advanced filtering
✅ Status change notifications
✅ Activity logging
✅ Email queue & retry logic

---

## Prerequisites

1. **Supabase Account** - https://supabase.com
2. **SendGrid Account** - https://sendgrid.com
3. **Node.js 18+**
4. **.env.local file with credentials**

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://app.supabase.com
2. Create new project
3. Wait for database to provision
4. Copy Project URL and Anon Key

### 1.2 Run Migrations
```bash
# Option 1: Using Supabase CLI (Recommended)
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push

# Option 2: Manual - Copy SQL from supabase/migrations/001_create_job_applications.sql
# 1. Go to Supabase dashboard
# 2. Click "SQL Editor"
# 3. Click "New Query"
# 4. Paste the SQL and execute
```

### 1.3 Create Admin User
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@voxmation.com',
  crypt('your-secure-password', gen_salt('bf')),
  NOW()
);
```

### 1.4 Get Service Role Key
1. Go to Supabase Settings → API
2. Copy "Service Role" key (keep this secret!)

### 1.5 Update .env.local
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key
ADMIN_EMAIL=careers@voxmation.com

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_KEY_PREFIX=job-app

# Email Configuration
ADMIN_EMAILS=careers@voxmation.com,hiring@voxmation.com
```

---

## Step 2: Install Dependencies

```bash
npm install
npm install axios express-rate-limit
```

---

## Step 3: Update Server Configuration

The server now includes:
- ✅ Supabase persistence
- ✅ Rate limiting
- ✅ Email queue management
- ✅ Activity logging
- ✅ Status change notifications
- ✅ Pagination support

---

## Step 4: Admin Login

1. Start dev server: `npm run dev`
2. Go to `/admin/login`
3. Login with admin email and password from Step 1.3
4. View applications dashboard

---

## Step 5: Features Overview

### Job Listing Page (`/jobs`)
- Browse available positions
- Expandable job details
- Apply button

### Application Form (`/jobs/:jobId/apply`)
- Candidate information collection
- Resume upload
- Structured interview questions
- Form validation

### Admin Dashboard (`/admin/applications`)
- Protected route (login required)
- View all applications
- Search by name/email/phone
- Filter by status
- Sort by date applied
- Pagination (10 per page)
- Update candidate status
- Add notes
- Download resume
- View activity log
- Email contact links

### Automated Emails
1. **Confirmation Email** - Sent immediately to candidate
2. **Status Change Email** - Sent when admin updates status
3. **Rejection Email** - When marked as rejected
4. **Offer Email** - When marked as hired
5. **Admin Notification** - When new application submitted

### Rate Limiting
- Max 5 applications per IP per hour
- Prevents spam submissions
- Returns 429 Too Many Requests

### Activity Logging
- Tracks all status changes
- Records admin actions
- Timestamp for audit trail
- Queryable via admin dashboard

### Email Queue
- Retry logic for failed emails
- Up to 3 retry attempts
- Error tracking and logging
- Async processing

---

## API Endpoints

### Public
```
POST   /api/jobs/apply
       - Submit job application with resume upload

GET    /api/resumes/:filename
       - Download resume file (authenticated)
```

### Admin (Protected)
```
GET    /api/jobs/applications
       - List all applications with pagination
       - Query params: page, limit, status, search

PATCH  /api/jobs/applications/:id
       - Update application status
       - Body: { status, notes }

GET    /api/jobs/applications/:id
       - Get single application details

GET    /api/jobs/applications/stats
       - Get stats by status
```

---

## Environment Variables Reference

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=
ADMIN_EMAIL=

# Rate Limiting
RATE_LIMIT_WINDOW=3600000 # 1 hour in ms
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_KEY_PREFIX=job-app

# Additional
ADMIN_EMAILS=admin@example.com,hiring@example.com
APP_URL=http://localhost:5000
NODE_ENV=development
```

---

## Testing Checklist

- [ ] User can view job listing at `/jobs`
- [ ] User can expand job details
- [ ] User can fill application form
- [ ] User can upload resume
- [ ] User receives confirmation email
- [ ] Admin can login at `/admin/login`
- [ ] Admin can view applications
- [ ] Admin can search applications
- [ ] Admin can filter by status
- [ ] Admin can update application status
- [ ] Candidate receives status change email
- [ ] Admin receives new app notification
- [ ] Rate limiting blocks excess requests
- [ ] Activity log tracks all changes
- [ ] Pagination works with 100+ apps

---

## Troubleshooting

### Supabase Connection Issues
- Verify SUPABASE_URL in .env.local
- Check SERVICE_ROLE_KEY has permissions
- Ensure migrations were run successfully

### Email Not Sending
- Check SendGrid API key is correct
- Verify admin email is set
- Check email queue table for errors
- Review SendGrid dashboard for bounces

### Rate Limiting Not Working
- Ensure express-rate-limit is installed
- Check RATE_LIMIT_WINDOW and RATE_LIMIT_MAX_REQUESTS
- Clear Redis cache if using external store

### Admin Login Issues
- Verify admin user exists in Supabase auth
- Check email/password are correct
- Ensure JWT tokens are configured
- Clear browser cookies and try again

---

## Production Deployment

1. Set NODE_ENV=production
2. Use Supabase managed database
3. Enable SSL/HTTPS
4. Configure CORS properly
5. Use environment secrets (not .env file)
6. Set up monitoring & logging
7. Enable Supabase backups
8. Configure email retry limits
9. Use CDN for resume files
10. Set up log aggregation

---

## Next Steps

1. Run `npm run dev`
2. Complete all setup steps above
3. Test job application flow
4. Test admin login
5. Monitor email sending
6. Adjust rate limits as needed
7. Deploy to production

For support, contact: support@voxmation.com

---

**Last Updated:** 2024
**Version:** 1.0.0
