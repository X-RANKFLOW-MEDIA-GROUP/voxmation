# CI/CD Setup Checklist

Use this checklist to ensure your GitHub Actions CI/CD is properly configured.

## Phase 1: Initial Setup (Required)

- [ ] Repository is on GitHub
- [ ] GitHub Actions is enabled (Settings → Actions)
- [ ] Repository has admin access
- [ ] `.github/workflows/` directory exists with workflow files

## Phase 2: CI/CD Workflows (Required)

### Workflow Files Present
- [ ] `.github/workflows/ci.yml` exists and is valid YAML
- [ ] `.github/workflows/build-and-push.yml` exists and is valid YAML
- [ ] `.github/workflows/deploy.yml` exists and is valid YAML
- [ ] `.github/workflows/security.yml` exists and is valid YAML
- [ ] `.github/workflows/release.yml` exists and is valid YAML

### Verify Files are Valid
```bash
# No YAML syntax errors
yamllint .github/workflows/
```

## Phase 3: Project Configuration (Required)

### Build Requirements
- [ ] `package.json` has `lint` script
- [ ] `package.json` has `test` script
- [ ] `package.json` has `build` script
- [ ] `package.json` has `preview` script (for frontend)
- [ ] `Dockerfile` exists with multi-stage build
- [ ] `docker-compose.prod.yml` exists
- [ ] `.dockerignore` exists with appropriate exclusions
- [ ] `tsconfig.json` configured for type checking

### Verification
```bash
# Test each script locally
npm run lint
npm run test
npm run build
npm run preview
npm run dev:server

# Test Docker build
docker build -t voxmation:test .
docker build -t voxmation:test --target frontend-prod .
docker build -t voxmation:test --target backend-prod .
```

## Phase 4: Container Registry (Required for Production)

### GitHub Container Registry Setup
- [ ] Understand image naming: `ghcr.io/OWNER/REPO:TAG`
- [ ] Container Registry is enabled for organization
- [ ] Read permissions on `.github/workflows/ci.yml`
- [ ] Verify `GITHUB_TOKEN` will have `packages:write` scope

### Test Locally
```bash
# Login to registry (requires personal access token with packages scope)
docker login ghcr.io -u USERNAME -p TOKEN

# Tag image
docker tag voxmation:test ghcr.io/OWNER/voxmation:test

# Push image
docker push ghcr.io/OWNER/voxmation:test
```

## Phase 5: Deployment Setup (Optional but Recommended)

### Pre-Deployment Requirements
- [ ] Have a production server or deployment target
- [ ] SSH access to production server
- [ ] Docker and Docker Compose installed on server
- [ ] Server directory structure ready (`/app` or similar)

### Generate Deployment Secrets
```bash
# Generate SSH key for deployments
ssh-keygen -t ed25519 -f deploy_key -N ""
# Keep deploy_key (private) safe
# Add deploy_key.pub to server's authorized_keys
```

### Add GitHub Secrets (Settings → Secrets and variables → Actions)
- [ ] `DEPLOY_KEY` = Contents of private key file
- [ ] `DEPLOY_HOST` = Server hostname/IP
- [ ] `DEPLOY_USER` = SSH username

### Server Configuration
```bash
# On production server:
- [ ] SSH is configured for key-based auth
- [ ] Deploy user exists and has Docker permissions
- [ ] /app directory exists and is owned by deploy user
- [ ] docker-compose.prod.yml is on server
- [ ] Docker images can be pulled from ghcr.io
- [ ] Port 5000 (frontend) and 3001 (backend) are accessible
```

### Verify Deployment Access
```bash
# From local machine
ssh -i deploy_key deploy@DEPLOY_HOST "docker ps"

# Should show existing containers (or empty list)
```

## Phase 6: Security Configuration (Optional but Recommended)

### Code Scanning
- [ ] CodeQL analysis enabled in `.github/workflows/security.yml`
- [ ] Semgrep configured for SAST scanning
- [ ] Trivy configured for container scanning
- [ ] Results uploading to GitHub Security tab

### Dependency Security
- [ ] `npm audit` runs in CI
- [ ] Vulnerable dependencies are tracked

### Secrets Protection
- [ ] No secrets in code or `.env` files
- [ ] Secrets stored only in GitHub Settings
- [ ] `.env` files are in `.gitignore`
- [ ] Secret scanning enabled (Settings → Security → Secret scanning)

## Phase 7: Branch Protection (Recommended)

### Main Branch Rules (Settings → Branches → Branch protection rules)
- [ ] Rule name: `main`
- [ ] Require pull request reviews: Yes (at least 1)
- [ ] Require status checks to pass:
  - [ ] `CI / Lint & Type Check`
  - [ ] `CI / Tests`
  - [ ] `CI / Build Application`
- [ ] Require branches to be up to date: Yes
- [ ] Require code reviews before merging: Yes
- [ ] Dismiss stale pull request approvals: Yes
- [ ] Require signed commits: Optional

## Phase 8: Testing & Validation

### Test CI Workflow
```bash
# 1. Create test branch
git checkout -b test/workflows

# 2. Make a small change
echo "# Test" >> README.md

# 3. Commit and push
git add README.md
git commit -m "Test CI workflow"
git push origin test/workflows

# 4. Watch Actions tab for workflow run
# Expected: All CI jobs pass
```

### Test Docker Build
```bash
# 1. Push to main (or use workflow_dispatch)
git checkout main
git merge test/workflows
git push origin main

# 2. Watch Actions tab
# Expected: Build & Push workflow runs and completes
# Expected: Docker images pushed to ghcr.io
```

### Test Deployment (if configured)
```bash
# Option 1: Manual trigger via Actions tab
# Go to "Deploy to Production" → "Run workflow" → "Run"

# Option 2: Via GitHub CLI
gh workflow run deploy.yml

# Watch the workflow for:
# - SSH connection succeeds
# - Docker images pulled
# - Containers started
# - Health check passes
```

### Test Security Scan
```bash
# Manually trigger
gh workflow run security.yml

# Check results:
# - CodeQL tab in Security
# - npm audit output
# - SARIF uploads to GitHub
```

### Test Release Workflow
```bash
# Go to Actions → Release → Run workflow
# Enter: version=1.0.0, release_type=patch
# Watch the workflow for:
# - Validation passes
# - All checks pass
# - Git tag created
# - GitHub Release created
# - Docker images tagged with version
```

## Phase 9: Documentation & Knowledge Transfer

- [ ] `.github/WORKFLOWS.md` read by team
- [ ] `.github/QUICKSTART.md` provided to team
- [ ] Team knows how to view logs: Actions tab
- [ ] Team knows how to trigger releases
- [ ] Team knows how to check deployment status
- [ ] Team knows where to find secrets

## Phase 10: Monitoring & Maintenance

### Ongoing Tasks
- [ ] Review workflow runs regularly (Actions tab)
- [ ] Monitor security scan results (Security tab)
- [ ] Keep dependencies updated
- [ ] Review and update workflows quarterly
- [ ] Monitor CI/CD performance metrics

### Monthly Review
- [ ] Are CI builds completing in reasonable time?
- [ ] Are any workflows consistently failing?
- [ ] Any new security vulnerabilities detected?
- [ ] Docker image sizes acceptable?
- [ ] Deployment frequency and success rate?

## Troubleshooting Reference

If something isn't working, check:

1. **Workflow won't run**: Check if GitHub Actions is enabled
2. **Tests failing**: Run locally: `npm run test`
3. **Lint errors**: Run locally: `npm run lint -- --fix`
4. **Build fails**: Run locally: `npm run build`
5. **Docker build fails**: Check Dockerfile syntax
6. **Deployment fails**: SSH to server and check logs
7. **Secrets not available**: Check Settings → Secrets configuration

## Estimated Time

- Phase 1: 5 minutes
- Phase 2: 5 minutes (files already created)
- Phase 3: 15 minutes (verify locally)
- Phase 4: 10 minutes (registry setup)
- Phase 5: 30 minutes (deployment setup, if needed)
- Phase 6: 15 minutes (security config)
- Phase 7: 10 minutes (branch protection)
- Phase 8: 20 minutes (testing)
- Phase 9: 10 minutes (documentation)
- Phase 10: Ongoing

**Total: ~2 hours for complete setup (without deployment: ~45 minutes)**

## Success Criteria

When complete, you should be able to:

- [ ] Push to main and see CI run automatically
- [ ] See all CI checks pass or fail clearly
- [ ] See Docker images built and pushed to registry
- [ ] Deploy to production with one click (if configured)
- [ ] See security scan results in Security tab
- [ ] Create a release with version tag

## Next Steps

1. Complete all checklist items above
2. Run test workflow (Phase 8)
3. Onboard team to new workflows
4. Set deployment to run automatically on main pushes
5. Monitor and optimize over time
