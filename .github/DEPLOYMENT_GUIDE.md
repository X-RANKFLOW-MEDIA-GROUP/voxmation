# Production Deployment Guide

Complete guide for setting up and managing production deployments with GitHub Actions.

## Architecture

```
GitHub Repository
    ↓
CI Workflow (lint, test, build)
    ↓
Build & Push Workflow (docker build, push to registry)
    ↓
Deploy Workflow (SSH to server, docker pull, docker-compose up)
    ↓
Production Server (running Docker containers)
```

## Prerequisites

1. **Production Server**
   - Linux server (Ubuntu 20.04+, Debian 11+, etc.)
   - SSH access enabled
   - Docker and Docker Compose installed
   - Sufficient disk space for images and containers

2. **GitHub Repository**
   - Admin access
   - GitHub Actions enabled
   - Container Registry enabled

3. **Credentials**
   - SSH key pair for GitHub Actions
   - User account on server with Docker permissions

## Step-by-Step Deployment Setup

### Step 1: Prepare Production Server

#### 1.1 Install Docker and Docker Compose

```bash
# SSH into server
ssh user@production.example.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 1.2 Create Deployment User

```bash
# Create user with home directory
sudo useradd -m -s /bin/bash deploy

# Add to docker group
sudo usermod -aG docker deploy

# Verify docker access
sudo -u deploy docker ps
```

#### 1.3 Create Application Directory

```bash
# Create app directory
sudo mkdir -p /app
sudo chown deploy:deploy /app
sudo chmod 755 /app

# Create subdirectories
sudo -u deploy mkdir -p /app/uploads /app/logs

# Initialize git repo
cd /app
sudo -u deploy git init --bare
cd -

# Create post-receive hook for automatic deployment
sudo -u deploy cat > /app/hooks/post-receive << 'EOF'
#!/bin/bash
set -e

WORK_DIR=/app/work
REPO_DIR=/app

# Create working directory if it doesn't exist
mkdir -p $WORK_DIR

# Clone or update the repository
if [ ! -d "$WORK_DIR/.git" ]; then
  git clone $REPO_DIR $WORK_DIR
else
  cd $WORK_DIR
  git fetch origin
fi

cd $WORK_DIR

# Checkout main branch
git checkout main

# Pull latest Docker images
docker-compose -f docker-compose.prod.yml pull

# Stop and remove old containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Log deployment
echo "Deployment completed at $(date)" >> /var/log/app-deployments.log

# Health check
for i in {1..30}; do
  if curl -sf http://localhost:5000/health || curl -sf http://localhost:3001/health; then
    echo "Health check passed" >> /var/log/app-deployments.log
    exit 0
  fi
  sleep 10
done

echo "Health check failed" >> /var/log/app-deployments.log
exit 1
EOF

sudo chmod +x /app/hooks/post-receive
sudo chown deploy:deploy /app/hooks/post-receive
```

#### 1.4 Create docker-compose.prod.yml on Server

If not already present, create `/app/docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  app:
    image: ghcr.io/YOUR_ORG/voxmation:latest
    container_name: voxmation-app
    restart: always
    ports:
      - "5000:5000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.example.com
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: voxmation-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 1.5 Create Environment File

```bash
# Create .env file with production secrets
sudo -u deploy cat > /app/.env << 'EOF'
NODE_ENV=production
VITE_API_URL=https://api.example.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
ELEVENLABS_API_KEY=your_elevenlabs_key
EOF

# Secure permissions
sudo -u deploy chmod 600 /app/.env
```

#### 1.6 Configure Nginx (Optional)

```bash
# Create nginx.conf
sudo -u deploy cat > /app/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3001;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            access_log off;
            proxy_pass http://app/health;
        }
    }
}
EOF
```

#### 1.7 Set Up Logging

```bash
# Create log directory
sudo mkdir -p /var/log/app
sudo chown deploy:deploy /var/log/app

# Create logrotate config
sudo cat > /etc/logrotate.d/app << 'EOF'
/var/log/app/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0640 deploy deploy
    sharedscripts
}
EOF
```

### Step 2: Generate SSH Keys for GitHub Actions

On **your local machine** (not the server):

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N "" -C "github-actions"

# Display private key (for GitHub secret)
cat ~/.ssh/github-deploy

# Display public key (for server)
cat ~/.ssh/github-deploy.pub
```

### Step 3: Add Public Key to Server

```bash
# On server, add the public key
sudo -u deploy bash << 'EOF'
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'PUBKEY'
[PASTE_PUBLIC_KEY_HERE]
PUBKEY
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
EOF
```

### Step 4: Configure GitHub Secrets

In your GitHub repository (Settings → Secrets and variables → Actions):

| Name | Value |
|---|---|
| `DEPLOY_KEY` | Contents of `~/.ssh/github-deploy` (private key) |
| `DEPLOY_HOST` | Your server hostname/IP (e.g., `production.example.com`) |
| `DEPLOY_USER` | `deploy` |

### Step 5: Test SSH Connection

```bash
# From your local machine
ssh -i ~/.ssh/github-deploy deploy@production.example.com "docker ps"

# Should return list of containers (or empty list if first run)
```

### Step 6: Authenticate with Container Registry

```bash
# On server, login to GitHub Container Registry
sudo -u deploy docker login ghcr.io -u USERNAME -p TOKEN

# USERNAME: Your GitHub username
# TOKEN: GitHub personal access token with packages:read scope

# Verify login
sudo -u deploy docker pull ghcr.io/YOUR_ORG/voxmation:latest
```

## Deployment Workflow

### Automatic Deployment Flow

1. **Developer pushes to main branch**
   ```bash
   git push origin main
   ```

2. **CI workflow runs** (lint, test, build)
   - Validates code quality
   - Runs tests
   - Confirms build succeeds

3. **Build & Push workflow runs** (if CI passes)
   - Builds Docker image
   - Pushes to ghcr.io
   - Creates image digests

4. **Deploy workflow runs** (if Build & Push passes)
   - SSH to production server
   - Pulls latest image
   - Runs `docker-compose up -d`
   - Performs health check

### Manual Deployment

Via GitHub Actions UI:

1. Go to Actions → Deploy to Production
2. Click "Run workflow"
3. Select branch (usually main)
4. Click "Run"

Or via CLI:

```bash
gh workflow run deploy.yml
```

## Monitoring & Maintenance

### View Logs

```bash
# SSH to server
ssh deploy@production.example.com

# View application logs
docker logs -f voxmation-app

# View docker-compose logs
docker-compose -f docker-compose.prod.yml logs -f

# View system deployment logs
tail -f /var/log/app-deployments.log

# View container health
docker ps
```

### Update Environment Variables

```bash
# SSH to server
ssh deploy@production.example.com

# Edit environment
nano /app/.env

# Restart containers
docker-compose -f docker-compose.prod.yml restart app
```

### Rollback Deployment

```bash
# Option 1: Deploy previous image tag
# Edit docker-compose.prod.yml to use previous version
# docker-compose -f docker-compose.prod.yml pull
# docker-compose -f docker-compose.prod.yml up -d

# Option 2: Git revert and push
git revert HEAD
git push origin main
# This will trigger another deployment with the reverted code
```

### Monitor Disk Space

```bash
# SSH to server
ssh deploy@production.example.com

# Check disk usage
df -h

# Clean up old images
docker image prune -a

# Clean up unused volumes
docker volume prune
```

### Database Backups

```bash
# Backup database (example for PostgreSQL)
pg_dump -h localhost -U username dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# Schedule daily backups with cron
# (Add to deploy user's crontab with `crontab -e`)
0 2 * * * pg_dump -h localhost -U username dbname > /app/backups/backup_$(date +\%Y\%m\%d).sql
```

## Troubleshooting Deployment

### Issue: SSH Connection Fails

```bash
# Check if server is reachable
ping production.example.com

# Check SSH connectivity
ssh -v deploy@production.example.com

# Verify key permissions on server
ssh deploy@production.example.com "ls -la ~/.ssh"
# Should show: authorized_keys with 600 permissions
```

### Issue: Docker Images Won't Pull

```bash
# SSH to server and check registry auth
ssh deploy@production.example.com

# Verify docker login
docker logout ghcr.io
docker login ghcr.io -u USERNAME -p TOKEN

# Try pulling manually
docker pull ghcr.io/YOUR_ORG/voxmation:latest
```

### Issue: Containers Won't Start

```bash
# Check logs
docker logs voxmation-app

# Check environment variables
docker inspect voxmation-app | grep -i env

# Check ports aren't already in use
sudo lsof -i :3001
sudo lsof -i :5000
```

### Issue: Health Check Fails

```bash
# SSH to server
ssh deploy@production.example.com

# Manually test health endpoint
curl -v http://localhost:3001/health
curl -v http://localhost:5000/health

# Check container status
docker ps
docker logs voxmation-app

# Restart container
docker-compose -f docker-compose.prod.yml restart app
```

## Security Best Practices

1. **SSH Keys**
   - Generate separate key for CI/CD
   - Rotate keys regularly
   - Store private key only in GitHub Secrets

2. **Environment Variables**
   - Store secrets in `.env` on server, not in docker-compose.yml
   - Set `.env` permissions to 600
   - Never commit `.env` to git

3. **Docker Registry**
   - Use GitHub token with packages:read scope only
   - Rotate tokens regularly
   - Consider private registry for sensitive images

4. **Server Access**
   - Limit SSH access (key-based auth only)
   - Use UFW or security groups to limit port access
   - Regular security updates: `apt update && apt upgrade`

5. **Monitoring**
   - Monitor disk space regularly
   - Monitor CPU and memory usage
   - Set up alerts for deployment failures

## Disaster Recovery

### Scenario 1: Server Disk Full

```bash
# SSH and clean up
ssh deploy@production.example.com

# Remove old images
docker image prune -a

# Check logs
du -sh /app/*

# Clean logs if needed
sudo truncate -s 0 /var/log/app-deployments.log
```

### Scenario 2: Database Corruption

```bash
# Restore from backup
# (Depends on your database system)
# Example for PostgreSQL:
psql -U username dbname < /app/backups/backup_20240101.sql
```

### Scenario 3: Complete Failure

```bash
# 1. Spin up new server
# 2. Follow Steps 1-6 in this guide
# 3. Deploy latest code: gh workflow run deploy.yml
```

## Performance Optimization

1. **Docker Image Size**
   - Use multi-stage builds (already configured in Dockerfile)
   - Minimize layers
   - Clean up package managers

2. **Build Time**
   - Docker layer caching
   - GitHub Actions cache
   - Parallel job execution

3. **Deployment Time**
   - Health checks prevent premature transition
   - Keep to 5-10 minutes typical deployment
   - Consider blue-green deployment for zero downtime

## Monitoring Dashboard

Consider setting up monitoring for:

- Deployment frequency
- Deployment success rate
- Time to deploy
- Container health
- Resource utilization
- Security vulnerabilities

Tools:
- GitHub Actions insights
- Prometheus + Grafana
- DataDog
- New Relic
- Sentry (error tracking)
