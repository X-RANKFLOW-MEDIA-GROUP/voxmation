# Voxmation Deployment Checklist

Complete checklist before deploying to production. Work through each section systematically.

---

## Pre-Deployment (1 Week Before)

### Architecture & Planning

- [ ] Review deployment architecture diagram
- [ ] Identify all external dependencies (Supabase, Stripe, Twilio, etc.)
- [ ] Document expected traffic/load patterns
- [ ] Plan for scalability and auto-scaling
- [ ] Document disaster recovery procedures
- [ ] Create incident response plan
- [ ] Brief team on deployment procedure

### Code Quality

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Check for TypeScript errors: `npm run type-check` (if available)
- [ ] Review code for console.log statements to remove
- [ ] Check for hardcoded URLs/keys
- [ ] Review error handling in critical paths
- [ ] Ensure all async operations have proper error handling

### Security Review

- [ ] Run security audit: `npm audit`
- [ ] Review authentication/authorization logic
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify CORS configuration is correct
- [ ] Review password hashing strategy
- [ ] Check session management
- [ ] Verify sensitive data is not logged
- [ ] Review API rate limiting

### Documentation

- [ ] Update README with deployment instructions
- [ ] Document all environment variables
- [ ] Create database migration documentation
- [ ] Document API endpoints (Swagger already configured)
- [ ] Create troubleshooting guide
- [ ] Document backup/restore procedures
- [ ] Document rollback procedures

---

## 3 Days Before Deployment

### Environment Setup

- [ ] Create production Supabase project
- [ ] Create production Stripe account
- [ ] Create production Twilio account
- [ ] Create production ElevenLabs account
- [ ] Create production Resend account
- [ ] Create production Sentry projects (frontend + backend)
- [ ] Procure production domain name
- [ ] Set up SSL certificates (Let's Encrypt or custom)

### External Services Configuration

#### Supabase
- [ ] Project created and confirmed accessible
- [ ] Database credentials saved securely
- [ ] Row Level Security (RLS) policies configured
- [ ] Backup enabled in settings
- [ ] Database webhooks configured (optional)
- [ ] Database size within free tier or plan upgraded

#### Stripe
- [ ] Account verified and confirmed
- [ ] Payment processing enabled
- [ ] Products and pricing configured
- [ ] Webhook endpoint configured: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Webhook events selected: payment_intent.succeeded, payment_intent.payment_failed, etc.
- [ ] API keys copied and secured
- [ ] Webhook signing secret saved

#### Twilio
- [ ] Account verified and confirmed
- [ ] Phone number purchased and confirmed
- [ ] SMS sending tested from account
- [ ] Account upgraded from trial if needed
- [ ] International sending enabled if required
- [ ] Credentials saved securely

#### ElevenLabs
- [ ] Account created and verified
- [ ] API key generated and saved
- [ ] Voice selection finalized
- [ ] Character limits understood for pricing tier

#### Resend
- [ ] Account created and verified
- [ ] Custom domain added and DNS records verified
- [ ] SPF/DKIM records propagated and verified
- [ ] API key generated and saved
- [ ] Test email sent successfully

#### Sentry
- [ ] Frontend project created
- [ ] Backend project created
- [ ] DSNs copied and saved
- [ ] Slack/email notifications configured
- [ ] Performance monitoring settings reviewed

---

## 1 Day Before Deployment

### Final Testing

- [ ] Run validation script: `bash DEPLOYMENT_VALIDATION.sh production`
- [ ] Fix any validation failures
- [ ] Run full application build: `npm run build`
- [ ] Build Docker images: `docker build -t voxmation:latest .`
- [ ] Test Docker Compose locally: `docker-compose up`
- [ ] Verify all services start and are healthy
- [ ] Test database connectivity
- [ ] Test all API endpoints with real credentials
- [ ] Send test email via Resend
- [ ] Send test SMS via Twilio
- [ ] Process test payment via Stripe
- [ ] Verify error reporting in Sentry with test error

### Infrastructure Preparation

#### Docker/Container Registry
- [ ] DockerHub account created (or ECR/GCR)
- [ ] Repository created: `voxmation`
- [ ] Authentication configured locally: `docker login`
- [ ] Test push image and pull on different machine

#### Vercel (if using for frontend)
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build settings configured
- [ ] Environment variables added for production
- [ ] Custom domain configured
- [ ] Deploy preview tested

#### Database Backups
- [ ] Automated daily backups enabled in Supabase
- [ ] Backup retention set to 30+ days
- [ ] Backup restoration tested successfully
- [ ] Backup location verified (Supabase handles this)

#### Monitoring & Logging
- [ ] Sentry projects configured and tested
- [ ] Error notifications configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring tool configured (pingdom, statuspage, etc.)
- [ ] Logging aggregation configured if using custom logs

### Domain & DNS
- [ ] Domain registered and confirmed
- [ ] Nameservers updated to correct registrar
- [ ] DNS A/CNAME records added for domain
- [ ] DNS propagation verified: `dig yourdomain.com`
- [ ] MX records configured for email (if using custom domain with Resend)
- [ ] SSL certificates prepared (Let's Encrypt ready)

### Access & Permissions
- [ ] Production database access credentials secured
- [ ] Stripe account access configured for team
- [ ] Twilio account access configured for team
- [ ] Sentry access configured for team
- [ ] GitHub repository access reviewed
- [ ] Vercel access configured for team
- [ ] Docker registry access configured for team

---

## Deployment Day

### Pre-Deployment Final Check (2 hours before)

- [ ] All team members notified and available
- [ ] Incident response team on standby
- [ ] Maintenance window announced to users (if applicable)
- [ ] Latest code committed and merged to main
- [ ] All tests passing on main branch
- [ ] Backup of production database created (if existing)
- [ ] Recent code review completed

### Step 1: Prepare Environment (30 minutes)

```bash
# Pull latest code
git pull origin main

# Create production .env file
cp .env.production.example .env.production

# Edit with production credentials
nano .env.production

# Verify all variables set
bash DEPLOYMENT_VALIDATION.sh production

# Should output: "All validation checks passed!"
```

- [ ] All environment variables present
- [ ] All external service credentials working
- [ ] Validation script passes with no failures

### Step 2: Build Application (30 minutes)

```bash
# Install dependencies
npm ci

# Build frontend
npm run build:client

# Check output
ls -la dist/

# Build backend (if needed)
# Already included in application

# Verify build output
du -sh dist/
```

- [ ] Build completes without errors
- [ ] Build size is reasonable (< 10MB for frontend)
- [ ] dist/ directory exists with content

### Step 3: Build Docker Images (20 minutes)

```bash
# Build production image
docker build --target production \
  --tag voxmation:latest \
  --tag voxmation:$(date +%Y%m%d-%H%M%S) \
  .

# Verify image built
docker images | grep voxmation

# Tag for registry
docker tag voxmation:latest yourusername/voxmation:latest
docker tag voxmation:latest yourusername/voxmation:1.0.0
```

- [ ] Docker image builds successfully
- [ ] Image is tagged correctly
- [ ] Image size is reasonable

### Step 4: Test Deployment Locally (30 minutes)

```bash
# Create .env.production for docker-compose
cp .env.production .env.docker.production

# Start services locally with production image
docker-compose --env-file .env.docker.production up -d

# Wait for services to start
sleep 30

# Check all services healthy
docker-compose ps

# Should show all services as "Up (healthy)"

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:5000/

# Test database
docker-compose exec backend sh -c 'npm run test:db'

# Check logs for errors
docker-compose logs --tail 50

# Cleanup
docker-compose down
```

- [ ] All services start successfully
- [ ] No errors in logs
- [ ] Health checks pass
- [ ] Database is accessible
- [ ] API responds correctly

### Step 5: Push Docker Image to Registry (20 minutes)

```bash
# Login to registry
docker login

# Push image
docker push yourusername/voxmation:latest
docker push yourusername/voxmation:1.0.0

# Verify push
docker pull yourusername/voxmation:latest
```

- [ ] Image pushed successfully to registry
- [ ] Image can be pulled from registry

### Step 6: Deploy to Vercel (5 minutes, if using)

```bash
# Trigger deployment via git push or Vercel CLI
git push origin main

# Or via Vercel CLI
vercel --prod

# Monitor deployment
vercel logs --follow
```

- [ ] Deployment initiates automatically
- [ ] Build completes without errors
- [ ] Deployment successful message received

### Step 7: Deploy Backend Service (20 minutes)

Choose deployment platform (Docker, Heroku, AWS, etc.):

**Option A: Docker Compose (Self-hosted)**
```bash
ssh deploy@yourdomain.com
cd /home/deploy/voxmation

# Pull latest code
git pull origin main

# Pull Docker image
docker pull yourusername/voxmation:latest

# Start services
docker-compose --env-file .env.production up -d

# Monitor logs
docker-compose logs -f
```

**Option B: Heroku**
```bash
git push heroku main
heroku logs --tail
```

**Option C: AWS ECS**
```bash
# Update task definition with new image
aws ecs update-service \
  --cluster voxmation-cluster \
  --service voxmation-service \
  --force-new-deployment

# Monitor deployment
aws ecs describe-services \
  --cluster voxmation-cluster \
  --services voxmation-service
```

- [ ] Backend service deployed successfully
- [ ] Service is healthy and responding
- [ ] No critical errors in logs

### Step 8: Verify Production Deployment (30 minutes)

```bash
# Test frontend
curl https://yourdomain.com/

# Test backend
curl https://api.yourdomain.com/health

# Test database connection
curl https://api.yourdomain.com/api/organizations

# Test payment endpoint
curl -X POST https://api.yourdomain.com/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId":"professional"}'

# Check Sentry for errors
# Visit: https://sentry.io/organizations/your-org/issues/

# Check Vercel deployment
# Visit: https://vercel.com/dashboard
```

- [ ] Frontend loads and responds
- [ ] Backend API is accessible
- [ ] Database queries work
- [ ] Payment processing endpoints respond
- [ ] No critical errors in Sentry
- [ ] Vercel shows successful deployment

### Step 9: Smoke Tests (15 minutes)

Perform basic functionality tests:

- [ ] Can create new user account
- [ ] Can log in with credentials
- [ ] Can navigate through application
- [ ] Can create new contact/record
- [ ] Dashboard displays correctly
- [ ] Charts/analytics load
- [ ] Can send test email via Resend
- [ ] Can send test SMS via Twilio
- [ ] Can process test payment via Stripe
- [ ] File uploads work (if applicable)

---

## Post-Deployment (First 24 Hours)

### Immediate Monitoring (First 30 minutes)

- [ ] Monitor Sentry dashboard for errors
- [ ] Monitor server logs for critical issues
- [ ] Monitor Docker container resource usage
- [ ] Monitor database query performance
- [ ] Check API response times
- [ ] Monitor error rates in application
- [ ] Verify backup jobs initiated if configured

### User Notification

- [ ] Notify users of successful deployment
- [ ] Provide status page link
- [ ] Communicate expected improvements
- [ ] Provide support contact information

### Full Test Coverage (1-2 hours)

- [ ] Test authentication (signup, login, logout)
- [ ] Test main workflows
- [ ] Test all integrations with external services
- [ ] Test error handling (intentionally trigger errors)
- [ ] Test performance under normal load
- [ ] Test mobile responsiveness (if applicable)
- [ ] Test accessibility

### Monitoring Setup

- [ ] Verify logs are being collected
- [ ] Verify error tracking is working
- [ ] Verify performance monitoring is active
- [ ] Set up alert thresholds
- [ ] Configure on-call rotation

### First 24 Hours Continued

- [ ] Review Sentry dashboard hourly
- [ ] Monitor server metrics
- [ ] Monitor database performance
- [ ] Monitor payment processing
- [ ] Monitor email delivery
- [ ] Monitor SMS delivery
- [ ] Check user feedback channels
- [ ] Monitor application logs

### First Week

- [ ] Review performance metrics
- [ ] Analyze traffic patterns
- [ ] Review error logs for patterns
- [ ] Check billing/usage metrics
- [ ] Verify backup restoration works
- [ ] Optimize database queries if needed
- [ ] Scale resources if needed
- [ ] Document any issues encountered

---

## Rollback Procedure (If Needed)

Keep this procedure readily available in case deployment fails:

### Quick Rollback

```bash
# Restore to previous deployment
docker-compose down
git checkout main~1
docker build -t voxmation:rollback .
docker-compose up -d
```

### Database Rollback

```bash
# If migrations need to be reverted
# Connect to database
psql -d voxmation -U postgres

# Drop problematic tables
DROP TABLE IF EXISTS new_table;

# Or restore from backup
pg_restore -d voxmation backup.sql
```

### Vercel Rollback

1. Go to Vercel dashboard
2. Select deployment
3. Click "Promote to Production" on previous successful deployment

### Steps to Follow If Rollback Needed

1. Immediately alert the team
2. Start rollback procedure above
3. Verify services are healthy with rollback
4. Document what went wrong
5. Communicate status to users
6. Post-mortem meeting after systems stabilize

---

## Post-Deployment Checklist

### Within 1 Hour of Deployment

- [ ] All services running and healthy
- [ ] No critical errors in monitoring
- [ ] Basic functionality confirmed working
- [ ] Team notified of successful deployment

### Within 24 Hours

- [ ] Full test coverage completed
- [ ] No critical issues identified
- [ ] Performance metrics acceptable
- [ ] Monitoring and alerts functioning
- [ ] Users providing positive feedback (or no issues reported)

### Within 1 Week

- [ ] Performance metrics analyzed
- [ ] Any issues resolved or documented
- [ ] Optimization opportunities identified
- [ ] Deployment retrospective completed
- [ ] Lessons learned documented

---

## Critical Contacts

In case of deployment emergency:

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Deployment Lead | [Name] | [Phone] | [Email] |
| Technical Lead | [Name] | [Phone] | [Email] |
| DevOps | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| On-Call Engineer | [Name] | [Phone] | [Email] |

---

## Deployment Sign-Off

By checking these boxes, you confirm the deployment was successful and all systems are operational:

- [ ] Deployment completed without errors
- [ ] All services verified as healthy and operational
- [ ] No critical errors in monitoring dashboards
- [ ] Basic functionality tests passed
- [ ] Team notified and acknowledged
- [ ] Status page updated (if applicable)
- [ ] Users able to access application
- [ ] Payment processing verified as working
- [ ] External service integrations verified as working
- [ ] Monitoring and alerts functioning correctly

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approved By**: _______________  
**Notes**: _______________

---

## References

- **Deployment Guide**: See DEPLOYMENT_GUIDE.md
- **Quick Reference**: See DEPLOYMENT_QUICK_REFERENCE.md
- **Validation Script**: Run `bash DEPLOYMENT_VALIDATION.sh production`
- **Troubleshooting**: See DEPLOYMENT_GUIDE.md Part 9

---

**Last Updated**: 2026-06-25  
**Version**: 1.0.0
