# Voxmation Deployment Commands

Copy-paste ready commands for common deployment tasks. Customize values in `[brackets]`.

---

## Table of Contents

- [Local Development](#local-development)
- [Docker Commands](#docker-commands)
- [Database Management](#database-management)
- [Vercel Deployment](#vercel-deployment)
- [Backend Deployment](#backend-deployment)
- [Monitoring & Logs](#monitoring--logs)
- [Emergency Commands](#emergency-commands)

---

## Local Development

### Initial Setup

```bash
# Clone repository
git clone https://github.com/[username]/voxmation.git
cd voxmation

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp .env.development.example .env.development

# Edit with your credentials
nano .env

# Start Docker services
docker-compose up -d postgres redis

# Wait for services to be healthy
sleep 10 && docker-compose ps

# Apply database migrations
for migration in supabase/migrations/*.sql; do
  psql -d voxmation -f "$migration"
done

# Start development servers
npm run dev
```

### Daily Development

```bash
# Start all services
docker-compose up -d
npm run dev

# View logs
npm run logs

# Run tests
npm test

# Lint code
npm run lint

# Stop services
docker-compose down
```

---

## Docker Commands

### Build Images

```bash
# Build for development
docker build --target development -t voxmation:dev .

# Build for production
docker build --target production -t voxmation:latest .

# Build specific service only
docker build --target backend-prod -t voxmation-backend:latest .
docker build --target frontend-prod -t voxmation-frontend:latest .

# Build with custom tag and date
docker build --target production \
  -t voxmation:$(date +%Y%m%d-%H%M%S) \
  -t voxmation:latest \
  .

# Build with buildx for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t voxmation:latest \
  --push \
  .
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Start in foreground (see logs)
docker-compose up

# Start specific service
docker-compose up -d backend

# Rebuild images before starting
docker-compose up -d --build

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes (WARNING: deletes data)
docker-compose down -v

# View status
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# View last 100 lines of logs
docker-compose logs --tail 100

# Export logs to file
docker-compose logs > logs.txt

# Restart service
docker-compose restart backend

# Execute command in running container
docker-compose exec backend sh
docker-compose exec backend npm run build
docker-compose exec postgres psql -U postgres -d voxmation
```

### Registry Operations

```bash
# Login to Docker Hub
docker login

# Tag image for registry
docker tag voxmation:latest [username]/voxmation:latest
docker tag voxmation:latest [username]/voxmation:1.0.0

# Push to Docker Hub
docker push [username]/voxmation:latest
docker push [username]/voxmation:1.0.0

# Push to AWS ECR
aws ecr get-login-password --region [region] | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.[region].amazonaws.com
docker tag voxmation:latest [account-id].dkr.ecr.[region].amazonaws.com/voxmation:latest
docker push [account-id].dkr.ecr.[region].amazonaws.com/voxmation:latest

# Push to Google Cloud Registry
gcloud auth configure-docker
docker tag voxmation:latest gcr.io/[project-id]/voxmation:latest
docker push gcr.io/[project-id]/voxmation:latest

# Pull image
docker pull [username]/voxmation:latest

# List images
docker images | grep voxmation

# Remove image
docker rmi voxmation:latest

# Get image details
docker image inspect voxmation:latest
```

### Container Management

```bash
# View container logs
docker logs [container-id]

# Follow logs in real-time
docker logs -f [container-id]

# Get last 50 lines
docker logs --tail 50 [container-id]

# Execute command in container
docker exec [container-id] npm run build

# Access container shell
docker exec -it [container-id] sh
docker exec -it [container-id] bash

# Copy file from container
docker cp [container-id]:/app/file.txt ./file.txt

# Copy file to container
docker cp ./file.txt [container-id]:/app/

# Get container stats
docker stats [container-id]

# Inspect container
docker inspect [container-id]

# Stop container
docker stop [container-id]

# Kill container
docker kill [container-id]

# Remove container
docker rm [container-id]
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove dangling images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (use with caution)
docker system prune -a --volumes
```

---

## Database Management

### PostgreSQL via psql

```bash
# Connect to local database
psql -d voxmation -U postgres -h localhost

# Connect to Supabase database
psql "postgresql://postgres:[password]@[db-identifier].supabase.co:5432/postgres"

# List databases
\l

# List tables
\dt

# Describe table
\d [table-name]

# List sequences
\ds

# List functions
\df

# List views
\dv

# List indexes
\di

# Exit psql
\q

# Run query
SELECT * FROM organizations LIMIT 5;

# Run SQL from file
\i migrations/001_create_tables.sql

# Export query results to CSV
\copy (SELECT * FROM organizations) TO '/tmp/orgs.csv' WITH CSV HEADER

# Import from CSV
\copy organizations FROM '/tmp/orgs.csv' WITH CSV HEADER

# Get table size
SELECT pg_size_pretty(pg_total_relation_size('[table-name]'));

# Get database size
SELECT pg_size_pretty(pg_database_size('voxmation'));
```

### Migrations via Docker

```bash
# Apply migrations
docker-compose exec postgres psql -U postgres -d voxmation -f /docker-entrypoint-initdb.d/migration.sql

# Or manually in container shell
docker-compose exec postgres sh
psql -U postgres -d voxmation
\i /docker-entrypoint-initdb.d/001_create_tables.sql

# Apply all migrations in order
for file in supabase/migrations/*.sql; do
  echo "Applying: $file"
  docker-compose exec -T postgres psql -U postgres -d voxmation < "$file"
done
```

### Backup & Restore

```bash
# Backup database
pg_dump voxmation > backup-$(date +%Y%m%d-%H%M%S).sql

# Backup from Docker
docker-compose exec -T postgres pg_dump -U postgres voxmation > backup.sql

# Restore from backup
psql voxmation < backup.sql

# Restore via Docker
docker-compose exec -T postgres psql -U postgres voxmation < backup.sql

# Backup to Supabase
psql "postgresql://postgres:[password]@[db-identifier].supabase.co:5432/postgres" \
  -c "SELECT version();"
```

### Data Operations

```bash
# Count rows in table
SELECT COUNT(*) FROM organizations;

# Clear table (DELETE all rows)
DELETE FROM organizations;

# Reset table (DELETE and reset ID sequence)
DELETE FROM organizations;
ALTER SEQUENCE organizations_id_seq RESTART WITH 1;

# Update records
UPDATE organizations SET status = 'active' WHERE created_at < NOW() - INTERVAL '30 days';

# Add column
ALTER TABLE organizations ADD COLUMN new_column VARCHAR(255);

# Drop column
ALTER TABLE organizations DROP COLUMN old_column;

# Create index
CREATE INDEX idx_org_owner ON organizations(owner_id);

# Drop index
DROP INDEX idx_org_owner;

# Create unique constraint
ALTER TABLE organizations ADD CONSTRAINT unique_email UNIQUE(email);

# List slow queries
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

---

## Vercel Deployment

### Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
cd voxmation
vercel link

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL
vercel env add SENTRY_DSN
```

### Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Specify environment
vercel --prod --env production

# Check deployment status
vercel status

# View deployment logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# List deployments
vercel list

# Rollback to previous deployment
vercel rollback

# View deployment info
vercel inspect [deployment-url]
```

### Environment Variables

```bash
# List environment variables
vercel env list

# Get specific environment variable
vercel env pull

# Set environment variable
vercel env add STRIPE_SECRET_KEY

# Remove environment variable
vercel env rm VARIABLE_NAME

# View environment variables by environment
vercel env list production
vercel env list preview
vercel env list development
```

### Custom Domain

```bash
# Add custom domain
vercel domain add yourdomain.com

# List domains
vercel domains list

# Remove domain
vercel domain remove yourdomain.com

# Update DNS records (shown by Vercel)
# Add CNAME: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.19.19
```

---

## Backend Deployment

### Build & Test

```bash
# Build application
npm run build

# Run tests
npm test

# Run specific test file
npm test -- user.test.ts

# Generate test coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint -- --fix

# Type check
npm run type-check
```

### Environment Configuration

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit environment variables
nano .env.production

# Validate environment setup
bash DEPLOYMENT_VALIDATION.sh production

# Show all variables
grep -E "^[A-Z_]+" .env.production

# Encrypt sensitive values (if using git-crypt)
git-crypt lock
git-crypt unlock
```

### Deploy to Self-Hosted Server

```bash
# SSH into server
ssh [user]@[domain.com]

# Navigate to app directory
cd /home/deploy/voxmation

# Pull latest code
git pull origin main

# Update dependencies
npm ci --frozen-lockfile --production=true

# Set environment variables
nano .env.production

# Build application
npm run build

# Stop existing services
docker-compose down

# Pull latest Docker image
docker pull [username]/voxmation:latest

# Start services
docker-compose --env-file .env.production up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create voxmation

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set VITE_SUPABASE_URL=https://xxx.supabase.co
heroku config:set VITE_SUPABASE_ANON_KEY=eyJhbGc...
heroku config:set NODE_ENV=production

# Deploy code
git push heroku main

# View logs
heroku logs --tail

# Run migrations
heroku run npm run db:migrate

# Restart app
heroku restart

# Access app shell
heroku ps:exec
```

### Deploy to AWS

```bash
# Create ECS task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster voxmation-cluster \
  --service-name voxmation-service \
  --task-definition voxmation:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:...,containerName=voxmation,containerPort=3001

# Update service with new image
aws ecs update-service \
  --cluster voxmation-cluster \
  --service voxmation-service \
  --force-new-deployment

# View service status
aws ecs describe-services \
  --cluster voxmation-cluster \
  --services voxmation-service

# View task logs
aws logs tail /ecs/voxmation --follow

# Scale service
aws ecs update-service \
  --cluster voxmation-cluster \
  --service voxmation-service \
  --desired-count 4
```

---

## Monitoring & Logs

### Docker Logs

```bash
# View backend logs
docker logs voxmation-backend

# Follow logs in real-time
docker logs -f voxmation-backend

# View last 100 lines
docker logs --tail 100 voxmation-backend

# View logs with timestamps
docker logs -t voxmation-backend

# View logs with grep filter
docker logs voxmation-backend | grep ERROR

# View logs for specific time period
docker logs --since 2h voxmation-backend

# Save logs to file
docker logs voxmation-backend > logs.txt 2>&1

# View all service logs
docker-compose logs -f
```

### Application Logs

```bash
# View application logs from running server
tail -f /var/log/voxmation/application.log

# Search logs
grep "ERROR" /var/log/voxmation/application.log

# View last 500 lines
tail -500 /var/log/voxmation/application.log

# Stream logs with grep
tail -f /var/log/voxmation/application.log | grep "payment"

# Archive old logs
gzip /var/log/voxmation/application.log.*
```

### Health Checks

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost:5000/

# Check API connectivity
curl http://localhost:3001/api/organizations

# Check with headers
curl -v -H "Authorization: Bearer token" http://localhost:3001/api/organizations

# Check CORS headers
curl -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3001 -v

# Performance test
ab -n 100 -c 10 http://localhost:3001/health

# Load test
wrk -t4 -c100 -d30s http://localhost:3001/health
```

### System Monitoring

```bash
# Docker resource usage
docker stats

# Monitor specific container
docker stats voxmation-backend

# System resources
top
htop

# Disk usage
df -h

# Memory usage
free -h

# Network connections
netstat -tlnp

# Open ports
lsof -i -P -n

# Process monitoring
ps aux | grep node
```

---

## Emergency Commands

### Service Recovery

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Hard stop and start
docker-compose down
docker-compose up -d

# Check service health
docker-compose ps

# View error logs
docker-compose logs | grep -i error

# Force rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Recovery

```bash
# Connect to database
docker-compose exec postgres sh

# Check database integrity
VACUUM ANALYZE;

# Kill long-running queries
SELECT pid, query FROM pg_stat_activity WHERE query_start < NOW() - INTERVAL '1 hour';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_start < NOW() - INTERVAL '1 hour';

# Check table corruption
REINDEX TABLE organizations;

# Restore from backup
docker-compose exec postgres psql -U postgres < backup.sql
```

### Performance Recovery

```bash
# Check for slow queries
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# Reset statistics
SELECT pg_stat_statements_reset();

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Clear Docker cache
docker builder prune -a

# Increase container resources (docker-compose.yml)
# Edit: deploy.resources.limits
docker-compose up -d
```

### Emergency Rollback

```bash
# Revert to previous version
git checkout main~1
docker build -t voxmation:rollback .
docker-compose down
docker tag voxmation:rollback voxmation:latest
docker-compose up -d

# Or with specific image
docker tag voxmation:[previous-date] voxmation:latest
docker-compose restart

# Verify rollback
docker-compose ps
curl http://localhost:3001/health
```

### Debugging

```bash
# Get shell access to backend
docker-compose exec backend sh

# View environment variables in container
docker-compose exec backend env | sort

# Check npm scripts available
docker-compose exec backend npm run

# Run test in container
docker-compose exec backend npm test

# Check installed dependencies
docker-compose exec backend npm list

# View network connectivity
docker-compose exec backend ping postgres

# Check file permissions
docker-compose exec backend ls -la /app
```

---

## Git Operations

### Branching & Commits

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request (GitHub)
gh pr create --title "Add new feature" --body "Description"

# Review pull request
gh pr view --web

# Merge pull request
gh pr merge [pr-number]

# Delete branch after merge
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Release Management

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# List tags
git tag -l

# Create release on GitHub
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes here"

# View releases
gh release list

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## Quick Command Reference

```bash
# Local development
npm install && npm run dev

# Build for production
npm run build

# Test locally
docker-compose up -d && npm test

# Deploy to production
git push origin main && vercel --prod

# Monitor deployment
docker-compose logs -f && vercel logs --follow

# Emergency rollback
docker-compose down && git checkout main~1 && docker-compose up -d

# Health check
curl http://localhost:3001/health && curl https://yourdomain.com/health

# Validate deployment
bash DEPLOYMENT_VALIDATION.sh production

# View all logs
docker-compose logs | tail -100

# Full cleanup and restart
docker-compose down -v && docker-compose up -d --build
```

---

**Last Updated**: 2026-06-25  
**For more details, see DEPLOYMENT_GUIDE.md**
