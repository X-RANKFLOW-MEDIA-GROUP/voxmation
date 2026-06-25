# Voxmation Deployment Guide

Complete step-by-step instructions for deploying Voxmation across local development, Docker, Vercel, Supabase, and cloud platforms. This guide covers all services including Twilio, ElevenLabs, Stripe, and Sentry integration.

**Table of Contents:**
- [Part 1: Local Development Setup](#part-1-local-development-setup)
- [Part 2: Docker Deployment](#part-2-docker-deployment)
- [Part 3: Supabase Backend Setup](#part-3-supabase-backend-setup)
- [Part 4: Vercel Frontend Deployment](#part-4-vercel-frontend-deployment)
- [Part 5: External Services Configuration](#part-5-external-services-configuration)
- [Part 6: Domain & DNS Setup](#part-6-domain--dns-setup)
- [Part 7: Monitoring with Sentry](#part-7-monitoring-with-sentry)
- [Part 8: SSL/TLS Configuration](#part-8-ssltls-configuration)
- [Part 9: Troubleshooting](#part-9-troubleshooting)

---

## Part 1: Local Development Setup

### 1.1 Prerequisites

Before starting, ensure you have the following installed:

```bash
# Required versions
node --version        # v22.0.0 or higher
npm --version         # v10.0.0 or higher
docker --version      # Docker 24.0 or higher
docker-compose --version  # Docker Compose v2.0 or higher
git --version         # v2.40 or higher
```

**Installation:**

- **Node.js & npm**: Download from https://nodejs.org (LTS recommended)
- **Docker**: https://docs.docker.com/get-docker/
- **Docker Compose**: Included with Docker Desktop on Mac/Windows
- **Git**: https://git-scm.com/downloads

### 1.2 Clone Repository

```bash
git clone https://github.com/yourusername/voxmation.git
cd voxmation
```

### 1.3 Install Dependencies

```bash
# Install all npm dependencies
npm install

# Verify installation
npm list | head -20
```

**Expected output:**
```
vite_react_shadcn_ts@0.0.0
├── @hookform/resolvers@3.10.0
├── @radix-ui/react-accordion@1.2.11
├── @sentry/node@10.60.0
├── @supabase/supabase-js@2.108.2
├── express@5.2.1
├── stripe@16.4.0
├── twilio@4.19.3
└── ... (many more)
```

### 1.4 Environment Setup

#### Step 1: Copy example environment files

```bash
# Root project environment
cp .env.example .env

# Sentry configuration
cp .env.sentry.example .env.sentry

# Docvault (if using)
cp docvault/.env.example docvault/.env
```

#### Step 2: Edit `.env` file with your configuration

```bash
# Create/edit .env in root directory
nano .env
```

**Minimal configuration for local development:**

```env
# ===== SUPABASE CONFIGURATION =====
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ===== API CONFIGURATION =====
VITE_API_URL=http://localhost:3001
NODE_ENV=development
PORT=3001

# ===== EMAIL SERVICE (RESEND) =====
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ===== VOICE SERVICE (ELEVENLABS) =====
ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key_here

# ===== SMS SERVICE (TWILIO) =====
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# ===== PAYMENT PROCESSING (STRIPE) =====
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ===== SENTRY ERROR TRACKING =====
SENTRY_DSN=https://key@sentry.io/projectid
SENTRY_ENVIRONMENT=development

# ===== OPTIONAL: ANALYTICS =====
VITE_SEGMENT_WRITE_KEY=your_segment_key_here

# ===== DEBUG OPTIONS =====
DEBUG=true
LOG_LEVEL=debug
```

#### Step 3: Verify .env is in .gitignore

```bash
# Check that .env is ignored
grep -E "^\.env" .gitignore

# Should output:
# .env
# .env.local
```

**NEVER commit `.env` files to version control.**

### 1.5 Database Setup (Local PostgreSQL)

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis in background
docker-compose up -d postgres redis

# Wait for services to be healthy
sleep 10

# Verify database is running
docker-compose ps

# Expected output:
# NAME                 STATUS
# voxmation-postgres   Up 2 seconds (healthy)
# voxmation-redis      Up 2 seconds (healthy)
```

#### Option B: Using Local PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb voxmation

# Verify connection
psql -d voxmation -c "SELECT version();"
```

### 1.6 Database Migrations

#### Step 1: Review migration files

```bash
# List all migration files
ls -la supabase/migrations/

# Expected output:
# 20260308205318_c6a9aad7-9457-4ac3-846f-704ede548178.sql
# 20260311102909_8d4ea994-f308-4f96-ba57-38db259f5fbd.sql
# ... and more
```

#### Step 2: Apply migrations locally

```bash
# Run all migration files in order
for migration in supabase/migrations/*.sql; do
  echo "Applying: $migration"
  psql -d voxmation -f "$migration" || exit 1
done
```

#### Step 3: Verify migrations

```bash
# List tables
psql -d voxmation -c "\dt"

# Check sample table structure
psql -d voxmation -c "\d organizations"

# Expected columns: id, name, email, created_at, updated_at, ...
```

### 1.7 Start Development Servers

#### Terminal 1: Backend Server

```bash
# Start Express backend server
npm run dev:server

# Expected output:
# ✓ Server running at http://localhost:3001
# ✓ Health check: GET /health
# ✓ API docs: GET /swagger
```

#### Terminal 2: Frontend Server (in new terminal)

```bash
# Start Vite development server
npm run dev:vite

# Expected output:
# VITE v5.4.19  ready in 245 ms
#
# ➜  Local:   http://localhost:5000/
# ➜  press h to show help
```

#### Alternative: Start both concurrently

```bash
# In single terminal (requires concurrently package)
npm run dev

# Starts both servers together with hot reload enabled
```

### 1.8 Verify Local Setup

```bash
# In a new terminal, test the backend
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-25T..."}

# Test the frontend
curl http://localhost:5000

# Should return HTML (frontend is running)
```

### 1.9 Access Local Application

Open your browser and navigate to:

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/swagger
- **PostgreSQL**: localhost:5432 (psql)
- **Redis**: localhost:6379 (redis-cli)

---

## Part 2: Docker Deployment

### 2.1 Docker Build Stages

The Dockerfile has 6 stages optimized for different use cases:

1. **dependencies** - Shared base with npm install
2. **builder** - Compiles TypeScript and builds assets
3. **backend-prod** - Express server only
4. **frontend-prod** - Vite frontend with SSR
5. **development** - Full dev environment with hot reload
6. **production** - Combined optimized image

### 2.2 Building Docker Images

#### Build for Development

```bash
# Build development image with hot reload
docker build \
  --target development \
  --tag voxmation:dev \
  --build-arg NODE_ENV=development \
  .

# Verify image was created
docker images | grep voxmation:dev
```

#### Build for Production

```bash
# Build production image (all stages)
docker build \
  --target production \
  --tag voxmation:latest \
  --tag voxmation:1.0.0 \
  --build-arg NODE_ENV=production \
  .

# Build just backend
docker build \
  --target backend-prod \
  --tag voxmation-backend:latest \
  .

# Build just frontend
docker build \
  --target frontend-prod \
  --tag voxmation-frontend:latest \
  .
```

#### Build with Docker Buildx (Multi-architecture)

```bash
# For ARM64 (Apple Silicon, AWS Graviton)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --target production \
  --tag voxmation:latest \
  --push \
  .
```

### 2.3 Running Containers Locally

#### Single Backend Container

```bash
# Run backend container
docker run \
  --name voxmation-backend \
  --publish 3001:3001 \
  --env VITE_SUPABASE_URL=https://your-project.supabase.co \
  --env VITE_SUPABASE_ANON_KEY=your_key \
  --env SUPABASE_SERVICE_ROLE_KEY=your_role_key \
  --env NODE_ENV=production \
  voxmation-backend:latest

# Check logs
docker logs -f voxmation-backend
```

#### Single Frontend Container

```bash
# Run frontend container
docker run \
  --name voxmation-frontend \
  --publish 5000:5000 \
  --env VITE_API_URL=http://localhost:3001 \
  --env VITE_SUPABASE_URL=https://your-project.supabase.co \
  --env NODE_ENV=production \
  voxmation-frontend:latest

# Check logs
docker logs -f voxmation-frontend
```

#### Stop and Remove Containers

```bash
# Stop all containers
docker stop voxmation-backend voxmation-frontend

# Remove containers
docker rm voxmation-backend voxmation-frontend

# Remove images
docker rmi voxmation-backend:latest voxmation-frontend:latest
```

### 2.4 Docker Compose Deployment

#### Create .env file for Docker Compose

```bash
# Copy and customize environment
cp .env.docker .env.production

# Edit with your values
nano .env.production
```

**Sample `.env.production`:**

```env
# ===== DEPLOYMENT CONFIGURATION =====
NODE_ENV=production
DOCKER_TARGET=production
RESTART_POLICY=unless-stopped

# ===== DATABASE CONFIGURATION =====
POSTGRES_DB=voxmation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_random_password_here
POSTGRES_PORT=5432

# ===== REDIS CONFIGURATION =====
REDIS_PORT=6379

# ===== SERVICE PORTS =====
BACKEND_PORT=3001
FRONTEND_PORT=5000

# ===== API CONFIGURATION =====
VITE_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# ===== SUPABASE =====
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_role_key

# ===== EMAIL SERVICE =====
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ===== VOICE SERVICE =====
ELEVENLABS_API_KEY=sk_your_key

# ===== SMS SERVICE =====
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# ===== PAYMENT PROCESSING =====
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key

# ===== ERROR TRACKING =====
SENTRY_DSN=https://key@sentry.io/projectid

# ===== STORAGE =====
VOLUMES_PATH=./data
```

#### Deploy with Docker Compose

```bash
# Start all services in production mode
docker-compose --env-file .env.production up -d

# Verify services are running
docker-compose ps

# Expected output:
# NAME                 STATUS
# voxmation-backend    Up 2 seconds (healthy)
# voxmation-frontend   Up 2 seconds (healthy)
# voxmation-postgres   Up 2 seconds (healthy)
# voxmation-redis      Up 2 seconds (healthy)
# voxmation-nginx      Up 2 seconds (healthy)
```

#### Check Service Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Export logs to file
docker-compose logs > deployment.log
```

#### Health Checks

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend health
curl http://localhost:5000

# Check via docker-compose
docker-compose ps

# All should show "Up X seconds (healthy)"
```

#### Stop Deployment

```bash
# Stop services (keep data)
docker-compose stop

# Stop and remove containers (keep volumes)
docker-compose down

# Remove everything including volumes (CAREFUL!)
docker-compose down -v
```

### 2.5 Docker Image Registry (Docker Hub / ECR)

#### Push to Docker Hub

```bash
# Login to Docker Hub
docker login -u yourusername

# Tag images
docker tag voxmation:latest yourusername/voxmation:latest
docker tag voxmation:latest yourusername/voxmation:1.0.0

# Push images
docker push yourusername/voxmation:latest
docker push yourusername/voxmation:1.0.0
```

#### Push to AWS ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name voxmation

# Get ECR URI
ECR_URI=$(aws ecr describe-repositories --query 'repositories[0].repositoryUri' --output text)

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI

# Tag and push
docker tag voxmation:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

#### Push to Google Container Registry

```bash
# Set project ID
PROJECT_ID=your-gcp-project

# Configure Docker
gcloud auth configure-docker

# Tag image
docker tag voxmation:latest gcr.io/$PROJECT_ID/voxmation:latest

# Push
docker push gcr.io/$PROJECT_ID/voxmation:latest
```

---

## Part 3: Supabase Backend Setup

### 3.1 Create Supabase Project

#### Via Web Dashboard

1. Go to https://app.supabase.com
2. Click "New project"
3. **Project name**: voxmation
4. **Database password**: Generate strong password (save securely)
5. **Region**: Choose closest to your users
6. **Pricing plan**: Free (upgradeable later)
7. Click "Create new project"

#### Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create project
supabase projects create --name voxmation --region us-east-1

# List projects
supabase projects list
```

### 3.2 Get Connection Credentials

1. Go to **Settings** → **Database**
2. Copy the following:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **Anon Key**: Under "API Credentials"
   - **Service Role Key**: Under "API Credentials"

Add to `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3.3 Apply Database Migrations

#### Option A: Using Supabase Dashboard

1. Go to **SQL Editor**
2. Create a new query
3. Copy entire contents of each migration file
4. Execute in order:
   - `20260624_create_multi_tenant.sql`
   - `20260624_create_crm_tables.sql`
   - `20260624_create_billing.sql`
   - `20260619000000_create_trials_and_api_keys.sql`
   - `20260625_create_campaigns_system.sql`
   - `20260625_create_subscription_system.sql`
   - `20260625_create_calls_and_voice_system.sql`
   - `20260625_create_admin_tables.sql`

#### Option B: Using Supabase CLI

```bash
# Link to your Supabase project
supabase link --project-ref your_project_ref

# Push migrations (if using local Supabase)
supabase db push

# Or manually run migrations
for migration in supabase/migrations/*.sql; do
  psql "postgresql://user:password@your-project.supabase.co:5432/postgres" \
    -f "$migration"
done
```

#### Option C: Using Direct SQL Connection

```bash
# Get connection string from Supabase Settings
# Format: postgresql://user:password@host:port/postgres

# Connect using psql
psql "postgresql://postgres:yourpassword@db.xxxxxxxxxxxx.supabase.co:5432/postgres"

# Then run migrations
\i supabase/migrations/20260624_create_multi_tenant.sql
\i supabase/migrations/20260624_create_crm_tables.sql
-- ... continue with each migration
```

### 3.4 Configure Row Level Security (RLS)

RLS ensures users can only access their own data.

```sql
-- Example: Organizations table RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT
  USING (auth.uid()::text = owner_id OR auth.uid() IN (
    SELECT user_id FROM organization_members WHERE organization_id = id
  ));

-- Policy: Only organization owner can update
CREATE POLICY "Owner can update organization" ON organizations
  FOR UPDATE
  USING (auth.uid()::text = owner_id);
```

Run these in Supabase SQL Editor.

### 3.5 Create Database Functions

```sql
-- Example: Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.6 Create Webhooks (Optional)

Supabase webhooks can trigger functions on database events.

1. Go to **Database** → **Webhooks**
2. Click "Create a new webhook"
3. **Name**: `on_organization_created`
4. **Table**: `organizations`
5. **Events**: `INSERT`
6. **Webhook URL**: `https://yourdomain.com/api/webhooks/supabase`
7. Click "Create webhook"

### 3.7 Verify Supabase Connection

```javascript
// In src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Connection failed:', err);
    return false;
  }
}

await testConnection();
```

Run this test:

```bash
# In Node.js or browser console
node -e "$(cat test-supabase.ts)"
```

---

## Part 4: Vercel Frontend Deployment

### 4.1 Create Vercel Account & Project

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories
4. Click "Import Project"
5. Select your voxmation repository
6. Click "Import"

### 4.2 Configure Build Settings

In Vercel dashboard:

1. Go to your project
2. **Settings** → **Build & Development Settings**
3. Configure as follows:

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm ci
```

**Development Command:**
```
npm run dev
```

### 4.3 Set Environment Variables

In Vercel dashboard:

1. **Settings** → **Environment Variables**
2. Click "Add New"
3. Add each variable for each environment (Production, Preview, Development)

**Production Environment Variables:**

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
VITE_API_URL = https://api.yourdomain.com
SENTRY_DSN = https://key@sentry.io/projectid
SENTRY_ENVIRONMENT = production
VITE_SEGMENT_WRITE_KEY = your_key (optional)
```

**Preview Environment Variables** (same as production for now):

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_API_URL = https://api-preview.yourdomain.com
SENTRY_ENVIRONMENT = preview
```

**Development Environment Variables:**

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_API_URL = http://localhost:3001
SENTRY_ENVIRONMENT = development
```

### 4.4 Trigger First Deployment

```bash
# Push to GitHub
git add .
git commit -m "Configure Vercel deployment"
git push origin main

# Vercel automatically deploys on push
# Monitor progress at https://vercel.com/dashboard
```

### 4.5 Configure Custom Domain

In Vercel dashboard:

1. **Settings** → **Domains**
2. Click "Add Domain"
3. Enter domain: `yourdomain.com`
4. Follow DNS configuration instructions
5. Vercel provides:
   - **CNAME**: `cname.vercel-dns.com`
   - Or A records for root domain

**Add DNS Records** (in your domain registrar):

```
CNAME  www  cname.vercel-dns.com
A      @    76.76.19.19
A      @    76.76.19.20
A      @    76.76.19.21
A      @    76.76.19.22
```

### 4.6 Enable GitHub Integration

Vercel automatically integrates with GitHub. To enhance:

1. **Settings** → **Git**
2. Enable:
   - [x] Deploy on Push
   - [x] Automatic PR Previews
   - [x] Redeploy on Push

3. Configure branch deployments:
   - **Production branch**: `main`
   - **Preview branch**: `develop`

### 4.7 Monitor Deployment

```bash
# Via Vercel CLI
npm install -g vercel

# Login
vercel login

# Check deployment status
vercel status

# View logs
vercel logs --follow

# Deploy manually
vercel --prod
```

### 4.8 Setup Deployment Notifications

In Vercel **Settings** → **Integrations**:

1. Add Slack integration
2. Select events to notify:
   - Deployment started
   - Deployment succeeded
   - Deployment failed

---

## Part 5: External Services Configuration

### 5.1 Twilio SMS Setup

#### Create Twilio Account

1. Go to https://www.twilio.com
2. Sign up (free trial includes $15 credit)
3. Go to **Console Dashboard**
4. Note your:
   - **Account SID**
   - **Auth Token**

#### Get Twilio Phone Number

1. In Console, go to **Phone Numbers** → **Manage Numbers**
2. Click "Get a Phone Number"
3. Choose country and number type (SMS-capable)
4. Confirm and save the phone number

#### Add to Environment

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12025551234
```

#### Test Twilio Integration

```bash
# Create test script: test-twilio.js
cat > test-twilio.js << 'EOF'
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    body: 'Hello from Voxmation!',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1234567890' // Your test number
  })
  .then(message => console.log('Message sent:', message.sid))
  .catch(err => console.error('Error:', err));
EOF

# Run test
node test-twilio.js
```

### 5.2 ElevenLabs Voice Setup

#### Create ElevenLabs Account

1. Go to https://elevenlabs.io
2. Sign up (free plan: 10,000 characters/month)
3. Go to **API Keys**
4. Copy your API key

#### Add to Environment

```env
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Configure Voice Parameters

In `server/routes/calls.ts`:

```typescript
// Voice synthesis configuration
const voiceConfig = {
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella (female)
  modelId: 'eleven_monolingual_v1',
  stability: 0.5,
  similarityBoost: 0.8,
  apiKey: process.env.ELEVENLABS_API_KEY,
};

// Test voice synthesis
const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voiceId}', {
  method: 'POST',
  headers: {
    'xi-api-key': voiceConfig.apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, this is a test message from Voxmation',
    model_id: voiceConfig.modelId,
    voice_settings: {
      stability: voiceConfig.stability,
      similarity_boost: voiceConfig.similarityBoost,
    },
  }),
});

const audioBlob = await response.blob();
console.log('Audio generated:', audioBlob.size, 'bytes');
```

#### Available ElevenLabs Voices

```
- EXAVITQu4vr4xnSDxMaL: Bella (female, warm)
- MF3mGyEYCHffgLQ3SqOy: Ava (female, professional)
- TxGEqnHWrfWFTfGW9XjX: Josh (male, friendly)
- IKne3meq5aSrNqLZpdB5: Sam (male, deep)
```

### 5.3 Resend Email Setup

#### Create Resend Account

1. Go to https://resend.com
2. Sign up with email
3. Go to **API Keys**
4. Create API Key
5. Copy key starting with `re_`

#### Add to Environment

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Verify Domain (for production)

1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Add DNS records provided by Resend
5. Click "Verify"

#### Test Email Service

```bash
# Create test script: test-email.js
cat > test-email.js << 'EOF'
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'your-email@example.com',
      subject: 'Test from Voxmation',
      html: '<h1>Welcome to Voxmation!</h1><p>Your deployment is working.</p>',
    });
    
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendTestEmail();
EOF

# Run test
node test-email.js
```

### 5.4 Stripe Payment Setup

#### Create Stripe Account

1. Go to https://stripe.com
2. Sign up and verify email
3. Go to **Developers** → **API Keys**
4. Copy:
   - **Publishable Key** (pk_test_... or pk_live_...)
   - **Secret Key** (sk_test_... or sk_live_...)

#### Add to Environment

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Setup Webhooks

Stripe will send events to your API when payments occur.

1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
5. Click "Add endpoint"
6. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

#### Create Products and Prices

In Stripe dashboard:

1. Go to **Products**
2. Click "Create product"
3. **Name**: Professional Plan
4. **Type**: Service
5. Add price:
   - **Price**: $99
   - **Billing period**: Monthly
6. Click "Create product"

#### Test Stripe Integration

```bash
# Create test script: test-stripe.js
cat > test-stripe.js << 'EOF'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900, // $99.00
      currency: 'usd',
      metadata: {
        orderId: 'test-order-123'
      }
    });
    
    console.log('Payment intent created:', paymentIntent.client_secret);
  } catch (error) {
    console.error('Error:', error);
  }
}

createPaymentIntent();
EOF

# Run test
node test-stripe.js
```

### 5.5 Google OAuth Setup (Optional)

#### Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create new project: `voxmation`
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: Web application
6. **Authorized JavaScript origins**:
   - `http://localhost:5000`
   - `https://yourdomain.com`
   - `https://api.yourdomain.com`
7. **Authorized redirect URIs**:
   - `http://localhost:5000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

#### Add to Environment

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## Part 6: Domain & DNS Setup

### 6.1 Purchase Domain

Options:
- **Vercel Domains** (easiest for Vercel hosting)
- **GoDaddy**, **Namecheap**, **Google Domains**, **Route 53**

### 6.2 Point Domain to Vercel

In your domain registrar, add:

```
CNAME  www  cname.vercel-dns.com.

# Or for root domain (@)
A      @    76.76.19.19
A      @    76.76.19.20
A      @    76.76.19.21
A      @    76.76.19.22
```

Verify in Vercel dashboard → **Domains** (may take 24-48 hours).

### 6.3 Configure Subdomains

For separate API and frontend subdomains:

```
# Frontend (main app)
A      @            76.76.19.19
CNAME  www          cname.vercel-dns.com.

# API server (backend)
CNAME  api          your-backend-hostname.com.

# Alternative: Use AWS/DigitalOcean/Heroku for API
CNAME  api          your-backend-platform.com.
```

### 6.4 Add MX Records for Email

If using Resend for emails with custom domain:

```
MX    @    10  mg.resend.dev.
TXT   @         v=spf1 include:mg.resend.dev ~all
TXT   default._domainkey.yourdomain.com  v=DKIM1; k=rsa; p=...
```

(Exact records provided by Resend during domain verification)

### 6.5 Test DNS Configuration

```bash
# Check DNS propagation
nslookup yourdomain.com
# or
dig yourdomain.com
# or
host yourdomain.com

# Test specific records
dig CNAME www.yourdomain.com
dig A yourdomain.com
dig MX yourdomain.com
```

---

## Part 7: Monitoring with Sentry

### 7.1 Create Sentry Project

1. Go to https://sentry.io
2. Sign up and create organization
3. Click "Create Project"
4. **Platform**: JavaScript (React)
5. **Alert Rule**: Default
6. Click "Create Project"
7. Copy **DSN**: `https://key@sentry.io/projectid`

#### Create separate projects for Frontend and Backend

1. Frontend project: Select "React"
2. Backend project: Select "Node.js"

### 7.2 Configure Sentry in Application

#### Frontend Configuration

In `src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: import.meta.env.VITE_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### Backend Configuration

In `server/index.ts` (already configured):

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV !== "production",
});

const app = express();
app.use(Sentry.Handlers.requestHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
```

### 7.3 Add Environment Variables

```env
# Frontend
VITE_SENTRY_DSN=https://your-frontend-key@sentry.io/frontend-project-id
VITE_SENTRY_ENVIRONMENT=production

# Backend
SENTRY_DSN=https://your-backend-key@sentry.io/backend-project-id
```

### 7.4 Test Error Reporting

```javascript
// Frontend test
import * as Sentry from "@sentry/react";

Sentry.captureException(new Error("Test error from frontend"));

// Backend test
app.get('/test-error', (req, res) => {
  throw new Error("Test error from backend");
});

// Trigger test
curl http://localhost:3001/test-error
```

Check Sentry dashboard → **Issues** to see reported errors.

### 7.5 Configure Alerts

In Sentry dashboard:

1. Go to **Alerts**
2. Click "Create Alert Rule"
3. **When**: An issue is first seen
4. **Then**: Send to Email or Slack
5. Configure notifications

---

## Part 8: SSL/TLS Configuration

### 8.1 Using Let's Encrypt (Free)

#### Via Certbot with Docker

```bash
# Create SSL directory
mkdir -p ssl/certs
mkdir -p ssl/conf.d

# Install certbot
docker run -it --rm --name certbot \
  -v "$(pwd)/ssl/certs:/etc/letsencrypt" \
  certbot/certbot certonly \
  --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

#### Via Docker Compose with Auto-renewal

Add to `docker-compose.yml`:

```yaml
certbot:
  image: certbot/certbot
  container_name: voxmation-certbot
  volumes:
    - ./ssl/certs:/etc/letsencrypt
  command: >
    certonly --webroot --webroot-path=/var/www/certbot
    -d yourdomain.com
    -d www.yourdomain.com
    -d api.yourdomain.com
    --email your-email@example.com
    --agree-tos
    --non-interactive
    --renew-with-new-domains
  depends_on:
    - nginx

  # Auto-renew every 12 hours
  schedule: "0 0,12 * * *"
```

### 8.2 Nginx SSL Configuration

Create `nginx.conf`:

```nginx
events {
  worker_connections 1024;
}

http {
  upstream frontend {
    server voxmation-frontend:5000;
  }

  upstream backend {
    server voxmation-backend:3001;
  }

  # HTTP redirect to HTTPS
  server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
  }

  # HTTPS server
  server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/nginx/certs/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/live/yourdomain.com/privkey.pem;

    # Security headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Frontend
    location / {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }

  # API subdomain
  server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/certs/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Backend API
    location / {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
}
```

### 8.3 Auto-renewal with Cron

```bash
# Add to crontab
crontab -e

# Add this line to renew SSL daily
0 3 * * * docker run --rm -v /path/to/ssl:/etc/letsencrypt certbot/certbot renew --quiet && docker-compose -f /path/to/docker-compose.yml exec -T nginx nginx -s reload
```

---

## Part 9: Troubleshooting

### 9.1 Connection Issues

#### Backend cannot connect to Supabase

```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/organizations?limit=1 \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"

# Expected: Returns JSON with data or error
```

**Fixes:**
- Verify URL and keys in Supabase dashboard
- Check firewall allows outbound HTTPS
- Ensure Supabase project is running

#### Frontend cannot reach Backend API

```bash
# Check API URL configuration
grep VITE_API_URL .env

# Test backend is running
curl http://localhost:3001/health

# Check CORS headers
curl -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3001 -v
```

**Fixes:**
- Verify `VITE_API_URL` points to correct backend
- Check backend CORS configuration
- Ensure backend is running on correct port

### 9.2 Database Issues

#### Migrations failed to apply

```bash
# Check if migrations exist
ls -la supabase/migrations/

# Check database schema
psql -d voxmation -c "\dt"

# Verify migration was applied
psql -d voxmation -c "SELECT * FROM schema_migrations;"

# Manually re-run migration
psql -d voxmation -f supabase/migrations/[migration-file].sql
```

**Fixes:**
- Check for SQL syntax errors in migration file
- Ensure all dependencies are created first
- Check PostgreSQL logs: `docker logs voxmation-postgres`

#### Row Level Security (RLS) blocking queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'organizations';

-- Temporarily disable RLS for debugging
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

### 9.3 Docker Issues

#### Container fails to start

```bash
# Check logs
docker logs voxmation-backend

# Common errors:
# - "Port already in use": Change port in docker-compose.yml
# - "No such file": Check volume mounts
# - "Connection refused": Services not ready, increase start_period

# Rebuild image
docker-compose build --no-cache backend
```

#### Out of disk space

```bash
# Check space usage
docker system df

# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune

# Remove all stopped containers
docker container prune
```

### 9.4 Performance Issues

#### Slow database queries

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Create indexes on frequently queried columns
CREATE INDEX idx_organizations_owner_id 
ON organizations(owner_id);

CREATE INDEX idx_contacts_organization_id 
ON contacts(organization_id);
```

#### Memory leaks in Node.js

```bash
# Monitor memory usage
docker stats voxmation-backend

# If consistently increasing:
# 1. Check for circular references in code
# 2. Review event listener cleanup
# 3. Profile with clinic.js:
npm install -g clinic
clinic doctor -- npm run dev:server
```

### 9.5 Deployment Issues

#### Vercel deployment fails

```bash
# Check build logs in Vercel dashboard
# Go to Deployments > [Latest] > Logs

# Common issues:
# - Missing environment variables: Add in Vercel Settings > Environment Variables
# - Build command fails: Ensure npm run build works locally
# - Output directory wrong: Check dist/ vs out/

# Test build locally
npm run build
ls -la dist/
```

#### Docker image won't push to registry

```bash
# Check image exists
docker images | grep voxmation

# Check registry credentials
docker login

# Verify tag format
docker tag voxmation:latest yourusername/voxmation:latest

# Check image size
docker image inspect yourusername/voxmation:latest | grep Size

# Push with verbose output
docker push -v yourusername/voxmation:latest
```

### 9.6 Security Issues

#### Expose sensitive data in logs

```bash
# Check for secrets in logs
docker logs voxmation-backend | grep -E "sk_|pk_|api_key|password"

# Remove from environment if found
unset STRIPE_SECRET_KEY  # Don't store in shell history
```

#### CORS errors in production

```bash
# Check CORS configuration
curl -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  https://api.yourdomain.com -v

# Expected headers:
# Access-Control-Allow-Origin: https://yourdomain.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE

# Fix in server/index.ts
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
}));
```

### 9.7 Email Issues

#### Emails not sending

```bash
# Test email service directly
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'test@example.com',
  subject: 'Test',
  html: 'Test'
}).then(r => console.log(r)).catch(e => console.error(e));
"

# Common issues:
# - Domain not verified in Resend: Add SPF/DKIM records
# - API key invalid: Check in Resend dashboard
# - Rate limiting: Check Resend logs for limit exceeded
```

#### SPF/DKIM failures

```bash
# Check SPF record
dig TXT yourdomain.com | grep spf

# Check DKIM record
dig TXT default._domainkey.yourdomain.com

# Expected:
# v=spf1 include:mg.resend.dev ~all
# v=DKIM1; k=rsa; p=...

# Re-verify domain in Resend if records missing
```

### 9.8 SMS Issues

#### Twilio SMS not sending

```bash
# Test SMS directly
node -e "
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  body: 'Test message',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+1234567890'
}).then(m => console.log(m.sid)).catch(e => console.error(e));
"

# Common issues:
# - Phone number not verified (trial accounts)
# - International numbers require different format
# - Rate limiting (free tier has limits)
```

### 9.9 Payment Issues

#### Stripe webhook not received

```bash
# Check webhook in Stripe dashboard
# Developers > Webhooks > [your endpoint]

# Verify endpoint is accessible
curl https://yourdomain.com/api/webhooks/stripe

# Test webhook locally
stripe trigger payment_intent.succeeded

# Check logs
docker logs voxmation-backend | grep stripe
```

### 9.10 Sentry Issues

#### Errors not appearing in Sentry

```bash
# Verify DSN is correct
echo $SENTRY_DSN

# Test error capture
curl -X POST "https://sentry.io/api/0/projects/[org]/[project]/events/" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test error"}'

# Check Sentry project settings
# Settings > Client Keys > DSN should match environment variable
```

---

## Deployment Checklist

Before going to production, verify:

- [ ] All environment variables set in each service
- [ ] Database migrations applied successfully
- [ ] SSL/TLS certificates configured
- [ ] Backups configured for database
- [ ] Monitoring (Sentry) enabled
- [ ] Error handling and logging tested
- [ ] Performance tested under load
- [ ] Security audit completed
- [ ] Backup and disaster recovery tested
- [ ] Team trained on deployment process
- [ ] Runbook created for common issues
- [ ] Status page configured
- [ ] Incident response plan documented

## Support & Resources

**Official Documentation:**
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Docker: https://docs.docker.com
- Express.js: https://expressjs.com
- Stripe: https://stripe.com/docs
- Twilio: https://www.twilio.com/docs
- ElevenLabs: https://elevenlabs.io/docs
- Sentry: https://docs.sentry.io
- Let's Encrypt: https://letsencrypt.org/docs

**Community Support:**
- GitHub Issues: https://github.com/yourusername/voxmation/issues
- Slack Community: [Your Slack workspace]
- Email Support: support@voxmation.com

---

**Last Updated**: 2026-06-25  
**Maintained By**: Voxmation Team  
**Version**: 1.0.0
