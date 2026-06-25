# Voxmation Deployment Quick Reference

Fast lookup guide for common deployment tasks. See DEPLOYMENT_GUIDE.md for detailed instructions.

---

## Local Development (2 minutes)

```bash
# 1. Install & setup
npm install
cp .env.example .env
# Edit .env with your credentials

# 2. Start services
docker-compose up -d postgres redis
npm run dev

# 3. Access
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/swagger
```

---

## Docker Deployment (5 minutes)

```bash
# Build production image
docker build --target production -t voxmation:latest .

# Or use Docker Compose
docker-compose --env-file .env.production up -d

# Verify
docker-compose ps
docker-compose logs -f
curl http://localhost:3001/health
```

---

## Vercel Frontend (Automatic on push)

```bash
# 1. Connect repo to Vercel
# Go to https://vercel.com/import → Select repository

# 2. Set environment variables
# Settings → Environment Variables
# Add: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

# 3. Deploy
git push origin main
# Automatic deployment triggers

# 4. Add custom domain
# Settings → Domains → Add Domain
# Add DNS records in registrar
```

---

## Supabase (5 minutes)

```bash
# 1. Create project
# Go to https://app.supabase.com → New project

# 2. Get credentials
# Settings → Database → Copy URL & Keys

# 3. Add to .env
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 4. Apply migrations
# SQL Editor → Copy & run migrations in order:
# - 20260624_create_multi_tenant.sql
# - 20260624_create_crm_tables.sql
# - 20260624_create_billing.sql
# - etc.

# 5. Test
curl https://xxx.supabase.co/rest/v1/organizations \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

---

## External Services Setup

### Twilio SMS (2 minutes)

```bash
# 1. Sign up: https://www.twilio.com
# 2. Get phone number: Console → Phone Numbers
# 3. Copy credentials
export TWILIO_ACCOUNT_SID=ACxxxx...
export TWILIO_AUTH_TOKEN=xxxx...
export TWILIO_PHONE_NUMBER=+1234567890

# 4. Add to .env
# 5. Test
node -e "
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
client.messages.create({
  body: 'Test',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+1234567890'
}).then(m => console.log('Sent:', m.sid));
"
```

### ElevenLabs Voice (2 minutes)

```bash
# 1. Sign up: https://elevenlabs.io
# 2. Get API key: API Keys
# 3. Add to .env
export ELEVENLABS_API_KEY=sk_xxxx...

# 4. Configure in code (server/routes/calls.ts):
# voiceId: 'EXAVITQu4vr4xnSDxMaL' // Bella

# 5. Test via API
curl https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","model_id":"eleven_monolingual_v1"}'
```

### Resend Email (2 minutes)

```bash
# 1. Sign up: https://resend.com
# 2. Get API key: API Keys
# 3. Verify domain: Domains → Add Domain → Copy DNS records
# 4. Add to .env
export RESEND_API_KEY=re_xxxx...
export RESEND_FROM_EMAIL=noreply@yourdomain.com

# 5. Test
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'test@example.com',
  subject: 'Test',
  html: '<h1>Hello</h1>'
}).then(r => console.log(r));
"
```

### Stripe Payments (3 minutes)

```bash
# 1. Sign up: https://stripe.com
# 2. Get keys: Developers → API Keys
# 3. Add to .env
export STRIPE_SECRET_KEY=sk_test_xxxx...
export STRIPE_PUBLISHABLE_KEY=pk_test_xxxx...

# 4. Setup webhook
# Developers → Webhooks → Add endpoint
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: payment_intent.succeeded, payment_intent.payment_failed, etc.
# Copy webhook secret to .env
export STRIPE_WEBHOOK_SECRET=whsec_xxxx...

# 5. Test
stripe login
stripe trigger payment_intent.succeeded
```

### Sentry Monitoring (2 minutes)

```bash
# 1. Sign up: https://sentry.io
# 2. Create project: React for frontend, Node.js for backend
# 3. Copy DSN values
# 4. Add to .env
export SENTRY_DSN=https://xxxx@sentry.io/projectid

# 5. Test error capture
# Frontend: Sentry.captureException(new Error('test'))
# Backend: Sentry.captureException(new Error('test'))
# Check Issues tab in Sentry dashboard
```

---

## Deployment Checklist

**Before going live:**

```bash
# 1. Verify all environment variables
grep -E "^[A-Z_]+=" .env | wc -l
# Should be >= 15 variables

# 2. Test database connection
npm run test:db

# 3. Build application
npm run build
# Check: dist/ and dist-ssr/ created

# 4. Run tests
npm test

# 5. Start Docker
docker-compose up -d
docker-compose ps
# All services should be "Up (healthy)"

# 6. Test endpoints
curl http://localhost:3001/health
curl http://localhost:5000/

# 7. Check logs
docker-compose logs | grep -i error
# Should be no critical errors

# 8. Deploy to Vercel
git push origin main
# Wait for automatic deployment

# 9. Verify production
curl https://yourdomain.com/api/health
curl https://yourdomain.com/
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `VITE_SUPABASE_URL` not found | Run `cp .env.example .env` and edit |
| Port 3001 already in use | `lsof -i :3001` then kill process |
| Docker image build fails | `docker build --no-cache .` |
| Database connection refused | `docker-compose up -d postgres` |
| Frontend can't reach API | Check `VITE_API_URL` in .env |
| Stripe webhook not received | Verify domain in Stripe dashboard |
| Email not sending | Check RESEND_API_KEY and domain verified |
| SMS not sending | Verify phone number in TWILIO_PHONE_NUMBER |
| Sentry not capturing errors | Check SENTRY_DSN matches project |

---

## Environment Variables Template

Copy this and fill in your values:

```env
# Core
NODE_ENV=production
PORT=3001

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API
VITE_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Voice (ElevenLabs)
ELEVENLABS_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring (Sentry)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production

# Optional
VITE_SEGMENT_WRITE_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Docker Commands

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f [service]         # All services or specific
docker-compose logs -f backend --tail 100 # Last 100 lines

# Stop services
docker-compose stop                 # Keep data
docker-compose down                 # Remove containers
docker-compose down -v              # Remove containers & volumes

# Restart services
docker-compose restart backend      # Restart specific service
docker-compose restart              # Restart all

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d voxmation

# View resource usage
docker stats

# Rebuild images
docker-compose build                # Rebuild changed services
docker-compose build --no-cache     # Full rebuild

# Push to registry
docker login
docker tag voxmation:latest yourusername/voxmation:latest
docker push yourusername/voxmation:latest
```

---

## Database Commands

```bash
# Connect via psql
psql -d voxmation -U postgres -h localhost

# Common queries
\dt                     # List tables
\d table_name           # Show table structure
SELECT * FROM organizations;

# Run migration
psql -d voxmation -f supabase/migrations/[filename].sql

# Backup
pg_dump voxmation > backup.sql

# Restore
psql voxmation < backup.sql

# Check size
SELECT pg_size_pretty(pg_database_size('voxmation'));

# Kill slow queries
SELECT pid, query, query_start FROM pg_stat_activity 
WHERE query_start < NOW() - INTERVAL '5 minutes';
```

---

## Useful URLs

- **Local Frontend**: http://localhost:5000
- **Local Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/swagger
- **Supabase**: https://app.supabase.com
- **Vercel**: https://vercel.com/dashboard
- **Stripe**: https://dashboard.stripe.com
- **Twilio**: https://console.twilio.com
- **ElevenLabs**: https://app.elevenlabs.io
- **Resend**: https://resend.com
- **Sentry**: https://sentry.io

---

## Deployment Support

- **Issues**: https://github.com/yourusername/voxmation/issues
- **Documentation**: See DEPLOYMENT_GUIDE.md for detailed instructions
- **Emergency**: Check server logs with `docker-compose logs`

---

**Last Updated**: 2026-06-25
