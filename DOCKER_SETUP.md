# Docker Setup Guide for Voxmation

This guide covers setting up and running the Voxmation project using Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Building](#building)
5. [Running](#running)
6. [Development](#development)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Security](#security)
10. [Performance](#performance)

## Prerequisites

- Docker 24.0+ ([Install](https://docs.docker.com/get-docker/))
- Docker Compose 2.20+ ([Install](https://docs.docker.com/compose/install/))
- 4GB RAM minimum (8GB recommended for production)
- 20GB disk space minimum

Verify installation:
```bash
docker --version
docker compose --version
```

## Quick Start

### Development Environment

```bash
# 1. Clone the repository
git clone <repo-url>
cd voxmation

# 2. Create environment file
cp .env.docker .env.local

# 3. Edit .env.local with your settings
nano .env.local  # or your preferred editor

# 4. Start services
docker compose up -d

# 5. View logs
docker compose logs -f backend frontend
```

Access the application:
- Frontend: http://localhost:5000
- Backend: http://localhost:3001
- API: http://localhost:3001/api

### Production Environment

```bash
# 1. Create production environment
cp .env.docker .env.production

# 2. Configure with production values
nano .env.production

# 3. Build optimized images
docker compose build --no-cache

# 4. Start services
docker compose -f docker-compose.yml up -d

# 5. Verify health
docker compose ps
```

## Configuration

### Environment Variables

Key environment variables in `.env.local`:

```bash
# Core
NODE_ENV=production
DEBUG=false

# API URLs
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5000

# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=voxmation

# Required Services
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Email
RESEND_API_KEY=re_your_api_key

# Voice
ELEVENLABS_API_KEY=sk_your_api_key

# Payment
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Port Configuration

Default ports (customizable via environment variables):

| Service | Port | Variable |
|---------|------|----------|
| Frontend | 5000 | `FRONTEND_PORT` |
| Backend | 3001 | `BACKEND_PORT` |
| PostgreSQL | 5432 | `POSTGRES_PORT` |
| Redis | 6379 | `REDIS_PORT` |
| NGINX | 80, 443 | - |

Change ports in `.env.local`:
```bash
FRONTEND_PORT=3000
BACKEND_PORT=8001
```

## Building

### Build All Images

```bash
# Build with cache (faster)
docker compose build

# Build without cache (fresher)
docker compose build --no-cache

# Build specific service
docker compose build backend
```

### Build Targets

The Dockerfile supports multiple targets:

- **dependencies**: Base dependencies layer
- **builder**: Compiles TypeScript and builds assets
- **backend-prod**: Backend only (minimal footprint)
- **frontend-prod**: Frontend only (minimal footprint)
- **development**: Full dev environment with hot reload
- **production**: Combined production image

Select target:
```bash
DOCKER_TARGET=backend-prod docker compose build
```

### Image Size Optimization

Production images are optimized using:
- Multi-stage builds (reduces final size by ~70%)
- Alpine Linux base (minimal OS footprint)
- Node module deduplication
- Aggressive caching strategies

Typical image sizes:
- Backend: ~180MB
- Frontend: ~220MB
- Dependencies (cache layer): ~350MB

## Running

### Start Services

```bash
# Start all services in background
docker compose up -d

# Start with logs visible
docker compose up

# Start specific services
docker compose up -d backend frontend postgres

# Start with specific environment
NODE_ENV=production docker compose up -d
```

### Stop Services

```bash
# Stop all services (preserves data)
docker compose stop

# Remove containers (preserves volumes)
docker compose down

# Remove everything including volumes (WARNING: data loss)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100

# With timestamps
docker compose logs -f --timestamps
```

### Check Status

```bash
# Service status
docker compose ps

# Service health
docker compose ps backend

# Inspect service
docker compose exec backend sh
```

## Development

### Hot Reload Development Mode

Set development target:
```bash
DOCKER_TARGET=development docker compose up -d
```

The development environment includes:
- Hot reload for both frontend and backend
- Volume mounts for source code
- Full debugging capabilities
- All development dependencies

### Local Development Without Docker

If you prefer local development:

```bash
# Install dependencies
npm install

# Start dev servers
npm run dev

# Runs on http://localhost:5000 (frontend) and 3001 (backend)
```

### Database Access

Connect to PostgreSQL:

```bash
# From host machine
psql -h localhost -U postgres -d voxmation

# From container
docker compose exec postgres psql -U postgres -d voxmation

# With password prompt
docker compose exec postgres psql -U postgres -d voxmation --password
```

### Redis Access

```bash
# From host machine
redis-cli -h localhost

# From container
docker compose exec redis redis-cli

# Monitor commands
docker compose exec redis redis-cli MONITOR
```

### Backend Shell Access

```bash
# Interactive shell
docker compose exec backend sh

# Run commands
docker compose exec backend npm run lint
docker compose exec backend npm test
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Backup strategy implemented
- [ ] Monitoring/logging configured
- [ ] Database backups automated
- [ ] Security review completed

### Production Startup

```bash
# 1. Pull latest code
git pull origin main

# 2. Build production images
docker compose build --no-cache

# 3. Backup database
docker compose exec postgres pg_dump -U postgres voxmation > backup-$(date +%Y%m%d).sql

# 4. Start services
docker compose up -d

# 5. Run migrations
docker compose exec backend npm run migrate

# 6. Verify health
docker compose ps
curl http://localhost:3001/health
```

### SSL/TLS Setup

1. Obtain certificates (Let's Encrypt):
```bash
# Using Certbot
certbot certonly --standalone -d yourdomain.com

# Copy to nginx directory
mkdir -p ssl/certs
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certs/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/certs/key.pem
```

2. Enable HTTPS in `nginx.conf`:
   - Uncomment HTTPS server block
   - Update domain name
   - Update certificate paths

3. Rebuild NGINX:
```bash
docker compose up -d nginx
```

### Auto-Restart Configuration

The `restart` policy is set to `unless-stopped`, meaning:
- Services restart automatically on failure
- Services do NOT restart after manual `docker compose stop`
- Use `docker compose start` to resume stopped services

Change policy in `docker-compose.yml`:
```yaml
restart: always  # Always restart (even if stopped)
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Restart services
docker compose restart

# Full reset (WARNING: preserves data in volumes)
docker compose down && docker compose up -d
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3001
netstat -tulpn | grep 3001

# Change port in .env.local
BACKEND_PORT=3002 docker compose up -d
```

### Database Connection Issues

```bash
# Test connection
docker compose exec postgres psql -U postgres -c "SELECT version();"

# Check logs
docker compose logs postgres

# Reset database
docker compose down -v  # WARNING: data loss
docker compose up -d postgres
```

### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -a

# Remove volumes
docker volume prune
```

### Memory Issues

```bash
# Check resource usage
docker compose stats

# Limit service memory in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Cannot Connect to Services from Host

```bash
# Check network
docker network ls
docker network inspect voxmation-network

# Restart networking
docker compose down
docker network prune
docker compose up -d
```

## Security

### Best Practices

1. **Never commit secrets**
   ```bash
   echo ".env.local" >> .gitignore
   echo ".env.production" >> .gitignore
   ```

2. **Use strong passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

3. **Enable HTTPS**
   - Obtain SSL certificate
   - Configure nginx.conf
   - Redirect HTTP to HTTPS

4. **Limit exposed ports**
   - Only expose 80/443 publicly
   - Keep database ports internal
   - Use network isolation

5. **Regular updates**
   ```bash
   # Update base images
   docker pull postgres:16-alpine
   docker pull redis:7-alpine
   docker pull nginx:alpine
   docker compose build --pull
   ```

6. **Implement backups**
   ```bash
   # Automated daily backup script
   docker compose exec postgres pg_dump -U postgres voxmation | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
   ```

### Network Isolation

Services communicate via internal Docker network (`voxmation-network`):
- Database only accessible to backend (not exposed)
- Redis only accessible internally
- Only frontend/backend exposed through NGINX

### Container Scanning

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image voxmation-backend:latest
```

## Performance

### Caching Strategy

1. **Frontend Assets**: 30-day cache via NGINX
2. **API Responses**: 1-minute cache (configurable)
3. **Database**: Connection pooling via Supabase
4. **Redis**: Session and transient data storage

### Load Testing

```bash
# Simple load test
docker run --rm -it --network voxmation-network \
  grafana/k6 run -v -u 100 -d 30s \
  https://gist.githubusercontent.com/example/load-test.js
```

### Monitoring Resources

```bash
# Real-time stats
docker compose stats --no-stream

# Continuous monitoring
watch -n 1 'docker compose stats --no-stream'
```

### Scale Services

For production with multiple instances:

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

Then use:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Useful Commands

```bash
# View compose configuration
docker compose config

# Validate compose file
docker compose config --quiet

# Export environment
docker compose config | grep POSTGRES_PASSWORD

# Service logs with grep
docker compose logs backend | grep ERROR

# Restart single service
docker compose restart backend

# Remove dangling volumes
docker volume prune

# Complete system cleanup (WARNING: data loss)
docker system prune -a --volumes
```

## Getting Help

- Check logs: `docker compose logs <service>`
- Review Dockerfile: Comments explain each stage
- Check docker-compose.yml: Services and dependencies documented
- .env.docker: All available environment variables

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NGINX Configuration Reference](https://nginx.org/en/docs/)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
- [Redis in Docker](https://hub.docker.com/_/redis)

---

Last Updated: 2024
