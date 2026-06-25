# Voxmation Docker Configuration - Complete Guide

## Overview

This directory contains a complete, production-ready Docker setup for the Voxmation project. The configuration provides:

- **Multi-stage builds** for optimized image sizes
- **Development and production environments** with separate compose files
- **Health checks** for all services
- **Security best practices** including non-root users and proper signal handling
- **Performance optimization** with caching, compression, and resource limits
- **Automated backup and monitoring** scripts

## Files Included

### Core Configuration

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build supporting dev/prod/backend/frontend targets |
| `docker-compose.yml` | Main orchestration file with all services |
| `docker-compose.dev.yml` | Development overrides with debug tools |
| `docker-compose.prod.yml` | Production overrides with optimization |
| `.dockerignore` | Build context exclusions for faster builds |
| `.env.docker` | Template for environment variables |
| `nginx.conf` | NGINX reverse proxy configuration |

### Documentation & Scripts

| File | Purpose |
|------|---------|
| `DOCKER_SETUP.md` | Comprehensive setup and troubleshooting guide |
| `DOCKER_README.md` | This file - quick reference |
| `scripts/docker-init.sh` | Automated initialization script |
| `scripts/docker-backup.sh` | Database backup utility |
| `scripts/docker-healthcheck.sh` | Service health monitoring |

## Quick Start (5 Minutes)

### 1. Prerequisites

```bash
# Check Docker installation
docker --version
docker compose --version
```

### 2. Initialize Environment

```bash
# Copy environment template
cp .env.docker .env.local

# Edit with your configuration
nano .env.local
```

**Required variables to configure:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
POSTGRES_PASSWORD=choose_a_password
RESEND_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
```

### 3. Start Services

```bash
# Option A: Automated initialization
./scripts/docker-init.sh --dev

# Option B: Manual startup
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 4. Access Application

- **Frontend**: http://localhost:5000
- **Backend**: http://localhost:3001
- **PgAdmin**: http://localhost:5050 (development only)
- **Redis Commander**: http://localhost:8081 (development only)

## Architecture

### Services

```
┌─────────────────────────────────────────────────┐
│                    NGINX                        │
│              (Reverse Proxy)                    │
│            Port: 80, 443                        │
└────────────┬──────────────────────┬─────────────┘
             │                      │
         ┌───▼────┐            ┌───▼────┐
         │Frontend │            │Backend │
         │  5000   │            │ 3001   │
         └────┬────┘            └───┬────┘
              │                     │
      ┌───────┴─────────────────────┴────────┐
      │                                      │
   ┌──▼──┐                            ┌─────▼──┐
   │Redis│                            │ Postgres
   │6379 │                            │ 5432
   └─────┘                            └────────┘
```

### Build Targets

The Dockerfile supports multiple targets:

```dockerfile
# Minimal, production-optimized backend (~180MB)
DOCKER_TARGET=backend-prod docker compose build

# Minimal, production-optimized frontend (~220MB)
DOCKER_TARGET=frontend-prod docker compose build

# Full development environment with hot reload
DOCKER_TARGET=development docker compose build

# Default: Combined production image
DOCKER_TARGET=production docker compose build
```

## Usage Patterns

### Development Workflow

```bash
# 1. Start development environment with hot reload
./scripts/docker-init.sh --dev

# 2. View logs
docker compose logs -f backend

# 3. Shell access for debugging
docker compose exec backend sh

# 4. Run tests
docker compose exec backend npm test

# 5. Database access
docker compose exec postgres psql -U postgres -d voxmation

# 6. Stop services
docker compose down
```

### Production Deployment

```bash
# 1. Create production environment
cp .env.docker .env.production
# Edit with production values
nano .env.production

# 2. Build optimized images
docker compose build --no-cache

# 3. Apply migrations
docker compose exec backend npm run migrate

# 4. Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Verify health
./scripts/docker-healthcheck.sh

# 6. Setup backups
(crontab -l; echo "0 2 * * * /app/scripts/docker-backup.sh") | crontab -
```

### Database Operations

```bash
# Backup database
./scripts/docker-backup.sh

# Connect to database
docker compose exec postgres psql -U postgres -d voxmation

# View recent backups
ls -lah backups/

# Restore from backup
docker compose exec postgres psql -U postgres -d voxmation < backups/backup-20240101-120000.sql
```

## Configuration Guide

### Environment Variables

Located in `.env.local` or `.env.production`:

```bash
# Core
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# Ports (customizable)
BACKEND_PORT=3001
FRONTEND_PORT=5000
POSTGRES_PORT=5432
REDIS_PORT=6379

# API URLs
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5000

# Database
POSTGRES_DB=voxmation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password

# Required APIs
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Third-party Services
RESEND_API_KEY=re_your_key
ELEVENLABS_API_KEY=sk_your_key
STRIPE_SECRET_KEY=sk_test_your_key
TWILIO_ACCOUNT_SID=your_sid
```

### Port Configuration

Change ports without rebuilding:

```bash
# Run with custom ports
BACKEND_PORT=8001 FRONTEND_PORT=3000 docker compose up -d

# Or edit .env.local
BACKEND_PORT=8001
FRONTEND_PORT=3000
```

### Resource Limits

Control CPU and memory per service in `docker-compose.yml` or `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## Common Tasks

### Check Service Health

```bash
# Automated health check
./scripts/docker-healthcheck.sh

# Manual checks
docker compose ps
docker compose exec backend curl http://localhost:3001/health
docker compose exec postgres pg_isready -U postgres
docker compose exec redis redis-cli ping
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# With timestamps
docker compose logs -f --timestamps
```

### Database Management

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d voxmation

# List tables
docker compose exec postgres psql -U postgres -d voxmation -c "\dt"

# Export data
docker compose exec postgres pg_dump -U postgres -d voxmation > data.sql

# Import data
docker compose exec -T postgres psql -U postgres -d voxmation < data.sql
```

### Cache Operations

```bash
# Connect to Redis
docker compose exec redis redis-cli

# Monitor commands
docker compose exec redis redis-cli MONITOR

# Clear cache
docker compose exec redis redis-cli FLUSHALL
```

## Security

### Built-in Features

- **Non-root users**: Services run as unprivileged users
- **Signal handling**: dumb-init ensures proper container shutdown
- **Health checks**: Automatic detection of failed services
- **HTTPS support**: NGINX configured for SSL/TLS
- **Secrets management**: Environment variables not in image
- **Network isolation**: Services communicate via internal network
- **Resource limits**: CPU and memory constraints per service

### Production Hardening

1. **SSL/TLS Setup**
   ```bash
   # Obtain certificate
   certbot certonly --standalone -d yourdomain.com
   
   # Copy to nginx directory
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certs/cert.pem
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/certs/key.pem
   
   # Enable in nginx.conf (uncomment HTTPS block)
   docker compose up -d nginx
   ```

2. **Strong Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

3. **Backup Strategy**
   ```bash
   # Automated daily backups via cron
   (crontab -l 2>/dev/null; echo "0 2 * * * /app/scripts/docker-backup.sh") | crontab -
   ```

4. **Update Images Regularly**
   ```bash
   docker pull postgres:16-alpine
   docker pull redis:7-alpine
   docker pull nginx:alpine
   docker compose build --pull --no-cache
   ```

## Troubleshooting

### Services won't start

```bash
# Check for errors
docker compose logs backend

# Verify configuration
docker compose config

# Restart everything
docker compose restart

# Full reset (preserves data in volumes)
docker compose down && docker compose up -d
```

### Port conflicts

```bash
# Find process using port
lsof -i :3001

# Change port in .env.local
BACKEND_PORT=3002 docker compose up -d
```

### Database connection issues

```bash
# Check PostgreSQL status
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1;"

# Reset database (WARNING: data loss)
docker compose down -v
docker compose up -d postgres
```

### Memory issues

```bash
# Check resource usage
docker compose stats

# Reduce limits or increase system memory
docker system prune -a
```

## Performance Tips

1. **Use volume mounts for development**
   - Hot reload without rebuilding
   - Faster iteration cycles

2. **Enable layer caching**
   - Docker caches intermediate layers
   - Faster rebuilds after small changes

3. **Limit concurrent services**
   - Only run what you need
   - Reduces CPU/memory usage

4. **Monitor resource usage**
   ```bash
   docker compose stats --no-stream
   ```

5. **Use .dockerignore**
   - Reduces build context size
   - Faster image uploads to registries

## Image Sizes

Typical production image sizes:

| Image | Size | Notes |
|-------|------|-------|
| backend-prod | ~180MB | Node.js + Express |
| frontend-prod | ~220MB | Node.js + Vite + React |
| dependencies | ~350MB | Cache layer |
| postgres | ~200MB | Alpine Linux |
| redis | ~50MB | Alpine Linux |

**Total for production setup: ~700MB for all images**

## Useful Commands

```bash
# Service management
docker compose up -d              # Start in background
docker compose down               # Stop and remove containers
docker compose restart            # Restart services
docker compose ps                 # List running services

# Logs and debugging
docker compose logs -f            # View all logs
docker compose logs -f backend    # View specific service
docker compose exec backend sh    # Shell access

# Database operations
docker compose exec postgres psql -U postgres -d voxmation
docker compose exec redis redis-cli

# System management
docker system df                  # Show Docker disk usage
docker system prune -a            # Clean up unused images
docker volume prune               # Clean up unused volumes

# Configuration
docker compose config             # Show final configuration
docker compose config --quiet     # Validate (no output)
```

## Next Steps

1. **Configure Environment**
   ```bash
   cp .env.docker .env.local
   nano .env.local
   ```

2. **Start Services**
   ```bash
   ./scripts/docker-init.sh --dev
   ```

3. **Access Application**
   - Visit http://localhost:5000

4. **Run Migrations** (if needed)
   ```bash
   docker compose exec backend npm run migrate
   ```

5. **Verify Health**
   ```bash
   ./scripts/docker-healthcheck.sh
   ```

## Support

For detailed information:
- **Setup Guide**: See `DOCKER_SETUP.md`
- **Dockerfile Details**: See `Dockerfile` comments
- **Docker Compose Details**: See `docker-compose.yml` comments
- **NGINX Configuration**: See `nginx.conf` comments

---

**Version**: 1.0
**Last Updated**: 2024
**Compatibility**: Docker 24.0+, Docker Compose 2.20+
