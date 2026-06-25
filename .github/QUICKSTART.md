# CI/CD Setup Quick Start

Get your GitHub Actions workflows up and running in 5 minutes.

## Step 1: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click "Settings" → "Actions" → "General"
3. Ensure "Allow all actions and reusable workflows" is selected
4. Click "Save"

## Step 2: Enable Container Registry

For Docker image pushing to GitHub Container Registry:

1. Go to your personal settings: https://github.com/settings/profile
2. Click "Developer settings" → "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Select scope: `write:packages`
5. Copy the token and save it securely

*Note: GitHub Actions automatically provides a `GITHUB_TOKEN` for repo scope. This is used by default.*

## Step 3: Configure Branch Protection (Optional but Recommended)

For the `main` branch:

1. Go to Settings → Branches → Branch protection rules
2. Click "Add rule"
3. Pattern: `main`
4. Check: "Require status checks to pass before merging"
5. Add required checks:
   - `CI / Lint & Type Check`
   - `CI / Tests`
   - `CI / Build Application`
6. Click "Create"

## Step 4: Set Up Deployment (Optional)

To enable automatic production deployment:

### 4a. Generate SSH Key

On your local machine:

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
cat deploy_key
```

### 4b. Add Deploy Secrets

In GitHub (Settings → Secrets and variables → Actions):

| Secret Name | Value |
|---|---|
| `DEPLOY_KEY` | Contents of `deploy_key` file (private key) |
| `DEPLOY_HOST` | Your server hostname/IP (e.g., `prod.example.com`) |
| `DEPLOY_USER` | SSH username (e.g., `deploy`) |

### 4c. Configure Server

On your production server:

```bash
# Create deploy user
sudo useradd -m deploy

# Add public key
sudo -u deploy mkdir -p /home/deploy/.ssh
echo "PUBLIC_KEY_CONTENT" | sudo tee /home/deploy/.ssh/authorized_keys
sudo -u deploy chmod 700 /home/deploy/.ssh
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys

# Prepare deployment directory
sudo mkdir -p /app
sudo chown deploy:deploy /app
cd /app
git init --bare
```

### 4d. Create Server Deployment Script

Create `/app/deploy.sh`:

```bash
#!/bin/bash
set -e

cd /app

# Pull latest code
git fetch
git checkout main

# Pull latest Docker images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for health
for i in {1..30}; do
  if curl -sf http://localhost:5000/health || curl -sf http://localhost:3001/health; then
    echo "Deployment successful"
    exit 0
  fi
  sleep 10
done

echo "Deployment health check failed"
exit 1
```

Make it executable: `chmod +x /app/deploy.sh`

## Step 5: Test the Workflows

### Test CI Workflow

```bash
# Push to a branch
git checkout -b test/ci-workflow
echo "# Test" >> README.md
git add README.md
git commit -m "Test CI workflow"
git push origin test/ci-workflow
```

Visit GitHub Actions tab to see the workflow run.

### Test Docker Build (when ready)

Push to main:
```bash
git checkout main
git merge test/ci-workflow
git push origin main
```

This will trigger the Build & Push workflow.

### Test Deployment (when ready)

Via GitHub Actions:
1. Go to "Actions" → "Deploy to Production"
2. Click "Run workflow"
3. Select main branch
4. Click "Run"

## Common Issues

### "No such file or directory: npm"

```bash
# Make sure Node.js and npm are installed
node --version
npm --version
```

### "Permission denied" for deployment

Check SSH key permissions:
```bash
# On server
ls -la ~/.ssh/authorized_keys  # Should be 600
ls -la ~/.ssh                  # Should be 700
```

### Tests failing in CI but passing locally

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm ci
npm run test
```

### Docker build timeout

Increase timeout in workflow:
```yaml
timeout-minutes: 60
```

### Registry authentication failed

Ensure GitHub token has correct permissions:
```bash
# Check token scopes at:
# https://github.com/settings/tokens
```

## Verify Setup

Check that all components are working:

```bash
# 1. Test locally
npm run lint    # Should pass
npm run test    # Should pass
npm run build   # Should succeed

# 2. Check GitHub Actions
# Go to Actions tab - should see CI workflow running

# 3. Verify Docker build (after pushing to main)
# In Build & Push workflow step summary

# 4. Verify deployment (if configured)
# Check SSH connectivity to server
ssh deploy@DEPLOY_HOST "docker ps"
```

## Next Steps

1. **Review Workflows**: Read `.github/WORKFLOWS.md` for detailed documentation
2. **Customize**: Modify workflows for your specific needs
3. **Monitor**: Set up Slack/Discord notifications
4. **Optimize**: Profile and optimize CI pipeline times
5. **Expand**: Add additional security checks or deployment stages

## Quick Reference

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Lint, test, build on every push |
| `.github/workflows/build-and-push.yml` | Build and push Docker images |
| `.github/workflows/deploy.yml` | Deploy to production |
| `.github/workflows/security.yml` | Daily security scans |
| `.github/workflows/release.yml` | Manual release management |

## Support

For issues or questions:

1. Check `.github/WORKFLOWS.md` Troubleshooting section
2. View workflow logs in GitHub Actions tab
3. Run checks locally: `npm run lint`, `npm run test`, `npm run build`
4. Check GitHub Status: https://www.githubstatus.com/
