# GitHub Actions CI/CD Setup for Voxmation

Comprehensive GitHub Actions workflows for continuous integration, continuous deployment, and release management.

## Quick Start (5 minutes)

1. **Enable GitHub Actions**: Settings → Actions → Allow all actions
2. **Read**: `.github/QUICKSTART.md`
3. **Verify locally**: `npm run lint && npm run test && npm run build`
4. **Push to main**: Workflows will run automatically

See `.github/QUICKSTART.md` for detailed first-time setup.

## Workflows Overview

### 1. CI Workflow (`.github/workflows/ci.yml`)
**Runs on**: Every push and pull request
**Checks**:
- ESLint linting
- TypeScript type checking
- Unit tests
- Application build
**Time**: ~5-10 minutes
**Fail Fast**: Yes - stops on first error

### 2. Build & Push (`.github/workflows/build-and-push.yml`)
**Runs on**: Push to main with code changes
**Tasks**:
- Builds Docker images (main, frontend, backend)
- Pushes to GitHub Container Registry (ghcr.io)
- Creates layer caches for faster builds
**Time**: ~20-30 minutes
**Images**: 
- `ghcr.io/OWNER/voxmation:latest`
- `ghcr.io/OWNER/voxmation:frontend-latest`
- `ghcr.io/OWNER/voxmation:backend-latest`

### 3. Deploy (`.github/workflows/deploy.yml`)
**Runs on**: Push to main (requires secrets)
**Tasks**:
- SSH to production server
- Pulls latest Docker images
- Starts/restarts containers
- Runs health checks
- Reports deployment status
**Time**: ~10-15 minutes
**Prerequisites**: `DEPLOY_KEY`, `DEPLOY_HOST`, `DEPLOY_USER` secrets

### 4. Security (`.github/workflows/security.yml`)
**Runs on**: Daily schedule + push + PR
**Scans**:
- npm audit (dependency vulnerabilities)
- CodeQL (code vulnerabilities)
- Semgrep SAST (source code analysis)
- Trivy (container image scan)
- License compliance
**Time**: ~20-30 minutes
**Results**: Visible in GitHub Security tab

### 5. Release (`.github/workflows/release.yml`)
**Runs on**: Manual trigger via Actions tab
**Tasks**:
- Validates version format (semantic versioning)
- Runs full CI pipeline
- Creates git tag and GitHub Release
- Builds and pushes versioned Docker images
**Version Format**: X.Y.Z (e.g., 1.0.0)

## File Structure

```
.github/
├── workflows/                 # Workflow definitions
│   ├── ci.yml                # CI pipeline
│   ├── build-and-push.yml    # Docker build & push
│   ├── deploy.yml            # Production deployment
│   ├── security.yml          # Security scanning
│   └── release.yml           # Release management
├── README.md                 # This file
├── QUICKSTART.md            # 5-minute setup guide
├── WORKFLOWS.md             # Detailed workflow documentation
├── SETUP_CHECKLIST.md       # Complete setup verification
└── DEPLOYMENT_GUIDE.md      # Production deployment guide
```

## Key Features

### Fail Fast Strategy
- Linting runs first (fastest check)
- Blocks further jobs on failure
- Provides immediate feedback
- Saves CI/CD time

### Comprehensive Testing
- Unit tests with vitest
- Code quality with ESLint
- Type safety with TypeScript
- Build verification

### Docker Optimization
- Multi-stage builds (already in Dockerfile)
- Layer caching via GitHub Actions Cache
- BuildKit optimizations
- Multiple image variants (main, frontend, backend)

### Production Ready
- SSH-based deployment
- Health checks before considering deployment done
- Automatic rollback possible (via git revert)
- Full deployment logging

### Security First
- Dependency scanning (npm audit)
- Code vulnerability scanning (CodeQL + Semgrep)
- Container image scanning (Trivy)
- License compliance checking
- Secret scanning enabled

### Clear Feedback
- GitHub step summaries
- Job status reports
- Detailed error messages
- Deployment notifications

## Getting Started

### For First-Time Setup

1. Read: `.github/QUICKSTART.md` (5 minutes)
2. Follow: `.github/SETUP_CHECKLIST.md` (2 hours, including testing)
3. Review: `.github/WORKFLOWS.md` (detailed reference)
4. Optional: `.github/DEPLOYMENT_GUIDE.md` (production setup)

### For Team Members

1. Understand the workflows: `.github/WORKFLOWS.md`
2. Follow branch protection rules: merge to main requires passing CI
3. Create releases: Use Actions tab → Release workflow
4. Monitor: Check Actions tab for build status

## Common Tasks

### View Workflow Status
Go to: `https://github.com/OWNER/voxmation/actions`

### View Job Logs
1. Click on workflow run
2. Click on failed job
3. Expand step for details

### Trigger Deployment
Via Actions tab:
1. Go to "Actions" → "Deploy to Production"
2. Click "Run workflow"
3. Select main branch
4. Click "Run"

Or via CLI:
```bash
gh workflow run deploy.yml
```

### Create a Release
Via Actions tab:
1. Go to "Actions" → "Release"
2. Click "Run workflow"
3. Enter version (e.g., 1.0.0)
4. Select release type
5. Click "Run"

### View Security Scan Results
1. Go to "Security" tab
2. Click "Code scanning alerts"
3. Review CodeQL, Semgrep, and Trivy findings

## Required Configuration

### GitHub Actions Settings
- [ ] Actions enabled (Settings → Actions)
- [ ] `read:packages` scope for pulling from registry
- [ ] `write:packages` scope for pushing to registry

### Repository Secrets (for deployment)
```
DEPLOY_KEY         # SSH private key
DEPLOY_HOST        # Server hostname
DEPLOY_USER        # SSH username
```

### Branch Protection (recommended)
- [ ] Require CI status checks pass
- [ ] Require PR reviews before merge
- [ ] Dismiss stale approvals on new commits

## Performance

### CI Pipeline
- Lint & Type Check: ~2-3 min
- Tests: ~5-8 min
- Build: ~5-10 min
- **Total**: ~10-15 minutes

### Docker Build
- Initial build: ~15-20 min
- Cached builds: ~5-10 min
- Push to registry: ~2-5 min
- **Total**: ~10-30 minutes

### Deployment
- SSH connection: ~5 seconds
- Pull images: ~2-5 min
- Start containers: ~1 min
- Health check: ~1-2 min
- **Total**: ~10-15 minutes

## Troubleshooting

### Workflow Won't Start
- Check GitHub Actions is enabled
- Check branch name matches trigger (main/develop)
- Check event type (push/PR/schedule)

### Tests Failing in CI
```bash
# Reproduce locally
npm ci
npm run test

# Fix issues
npm run lint -- --fix
npm run test -- --reporter=verbose
```

### Docker Build Fails
```bash
# Test build locally
docker build -t test . --target production

# Check Dockerfile syntax
docker build --progress=plain .
```

### Deployment Fails
- SSH to server: `ssh user@host "docker ps"`
- Check logs: `docker logs container-name`
- View errors: Check Actions tab for full logs

See `.github/WORKFLOWS.md` Troubleshooting section for more.

## Documentation Index

| File | Purpose | Read Time |
|---|---|---|
| `README.md` (this file) | Overview and quick reference | 5 min |
| `QUICKSTART.md` | First-time setup guide | 10 min |
| `SETUP_CHECKLIST.md` | Complete setup verification | 20 min |
| `WORKFLOWS.md` | Detailed workflow documentation | 20 min |
| `DEPLOYMENT_GUIDE.md` | Production deployment setup | 30 min |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         GitHub Repository (main branch)                 │
└────────────────────┬────────────────────────────────────┘
                     │ (git push)
                     ▼
        ┌────────────────────────────┐
        │   CI Workflow (ci.yml)      │
        │  ├─ Lint & Type Check      │
        │  ├─ Tests                  │
        │  └─ Build                  │
        └────────┬───────────────────┘
                 │ (if success)
                 ▼
   ┌──────────────────────────────────────┐
   │  Build & Push (build-and-push.yml)   │
   │  ├─ Build Docker Images              │
   │  ├─ Push to ghcr.io                  │
   │  └─ Cache layers                     │
   └──────────┬───────────────────────────┘
              │ (if success)
              ▼
   ┌──────────────────────────────────┐
   │   Deploy (deploy.yml)             │
   │   ├─ SSH to server               │
   │   ├─ Pull images                 │
   │   ├─ docker-compose up -d        │
   │   └─ Health check                │
   └──────────┬───────────────────────┘
              │
              ▼
   ┌──────────────────────────────┐
   │  Production Server            │
   │  (running Docker containers)  │
   └──────────────────────────────┘

Parallel: Security (security.yml)
├─ npm audit
├─ CodeQL
├─ Semgrep
└─ Trivy
```

## Best Practices

1. **Always run locally first**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Use meaningful commit messages**
   - Helps with release notes and history

3. **Review CI logs before merging**
   - Understand what each job does
   - Check coverage reports

4. **Test deployments in staging**
   - Don't deploy directly to production on first try
   - Verify each step works

5. **Monitor after deployment**
   - Check health endpoints
   - Review application logs
   - Monitor resource usage

6. **Keep secrets secure**
   - Never commit `.env` files
   - Rotate keys regularly
   - Use GitHub Secrets for sensitive data

## Support & Help

### Getting Help
1. Read relevant documentation (this README, QUICKSTART, WORKFLOWS)
2. Check GitHub Actions logs (Actions tab)
3. Run commands locally to debug
4. Check GitHub status: https://www.githubstatus.com/

### Reporting Issues
1. Note the workflow that failed
2. Copy the error message
3. Check if issue is reproducible locally
4. Create GitHub issue with details

## Contributing

To modify workflows:

1. Create a branch: `git checkout -b feature/workflow-update`
2. Edit workflow file in `.github/workflows/`
3. Test locally if possible
4. Create PR with description of changes
5. Wait for approval
6. Merge to main

## Next Steps

1. **Complete Setup**: Follow `.github/SETUP_CHECKLIST.md`
2. **Test Workflows**: Push to branch and watch Actions tab
3. **Enable Deployment**: Configure SSH secrets and server
4. **Team Onboarding**: Share these docs with team
5. **Monitor & Optimize**: Track CI/CD metrics over time

## License

These workflows are part of the Voxmation project. See main LICENSE file.

---

**Last Updated**: 2024-06-25
**Workflow Version**: 1.0.0
**Node Version**: 22
**Docker Base**: alpine
