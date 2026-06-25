# GitHub Actions CI/CD Workflows

This document describes the automated CI/CD pipelines for Voxmation.

## Overview

The CI/CD system consists of four main workflows:

1. **CI** - Continuous Integration on every push and pull request
2. **Build & Push** - Docker image building and registry push
3. **Deploy** - Production deployment
4. **Security** - Automated security scanning
5. **Release** - Manual release management

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to `main`/`develop`, all pull requests

**Jobs**:

#### Lint & Type Check
- **Timeout**: 10 minutes
- **Runs**: `eslint` for code linting
- **Runs**: `tsc --noEmit` for TypeScript type checking
- **Fail Fast**: Yes - blocks other jobs on failure

#### Tests
- **Timeout**: 15 minutes
- **Depends on**: Lint job (fail fast strategy)
- **Runs**: `vitest run` for unit tests
- **Coverage**: Uploads to Codecov (optional)

#### Build
- **Timeout**: 20 minutes
- **Depends on**: Lint job
- **Runs**: `npm run build` (client + SSR + prerender)
- **Artifacts**: Stores `dist` and `dist-ssr` directories
- **Retention**: 1 day

#### CI Summary
- **Reports**: Overall CI status in GitHub step summary
- **Condition**: Always runs, fails if any job failed

**Key Features**:
- Concurrency control: Cancels previous runs on new push
- Fast feedback: Critical checks run first
- Clear reporting: Step summaries for each job

### 2. Build & Push Workflow (`.github/workflows/build-and-push.yml`)

**Triggers**: 
- Push to `main` with changes to Dockerfile, docker files, or source
- Manual workflow dispatch

**Jobs**:

#### Prepare
- **Timeout**: 10 minutes
- **Validates**: Dockerfile exists, build context is correct

#### Build & Push
- **Timeout**: 45 minutes
- **Builds Three Images**:
  1. Main image (production target)
  2. Frontend image (frontend-prod target)
  3. Backend image (backend-prod target)
- **Registry**: GitHub Container Registry (ghcr.io)
- **Tags**: 
  - Branch name (e.g., `main-latest`)
  - Semantic version if tag follows pattern
  - SHA-based tag
  - `latest` for default branch

#### Features
- BuildKit cache optimization
- Layer caching via GitHub Actions Cache
- Image digest summary
- Optional vulnerability scanning comment

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers**:
- Push to `main`
- Manual workflow dispatch
- Completion of Build & Push workflow

**Jobs**:

#### Validate
- **Timeout**: 10 minutes
- **Checks**: Deployment configuration and required secrets

#### Deploy
- **Timeout**: 30 minutes
- **Method**: SSH to production server
- **Commands**:
  - Docker pull latest image
  - `docker-compose up -d` to deploy

**Required Secrets**:
- `DEPLOY_KEY` - SSH private key
- `DEPLOY_HOST` - Server hostname/IP
- `DEPLOY_USER` - SSH username

#### Health Check
- **Attempts**: 30 (with 10-second intervals)
- **Endpoints**: Checks both frontend (5000) and backend (3001) health
- **Timeout**: 5 minutes total

#### Post-Deploy
- Generates deployment report
- Suggests next steps for verification

### 4. Security Workflow (`.github/workflows/security.yml`)

**Triggers**:
- Push to `main`/`develop`
- All pull requests
- Daily schedule (2 AM UTC)

**Jobs**:

#### Dependency Check
- **Runs**: `npm audit` against moderate and critical vulnerabilities
- **Timeout**: 15 minutes

#### CodeQL Analysis
- **Language**: JavaScript/TypeScript
- **Queries**: Security and quality checks
- **Results**: Uploaded to GitHub Security tab
- **Timeout**: 30 minutes

#### SAST (Semgrep)
- **Runs**: Security audit checks for TypeScript/Node.js
- **Output**: SARIF format for GitHub integration
- **Timeout**: 20 minutes

#### Container Scan (Trivy)
- **Image**: Production Docker image
- **Severity**: CRITICAL and HIGH only (reported)
- **Timeout**: 20 minutes
- **Output**: SARIF format

#### License Check
- **Validates**: Production dependency licenses
- **Output**: Listed in summary

### 5. Release Workflow (`.github/workflows/release.yml`)

**Triggers**: Manual workflow dispatch

**Input Options**:
- `version` - Release version (semantic: X.Y.Z)
- `release_type` - patch, minor, major, or custom

**Jobs**:

#### Validate
- Checks version format (semantic versioning)
- Ensures tag doesn't already exist

#### Test
- Runs full CI pipeline (lint, type check, test, build)
- Ensures release is stable

#### Release
- Creates and pushes git tag
- Creates GitHub Release with notes

#### Docker Release
- Builds all three images with version tags
- Pushes to registry with semantic version
- Updates `latest` tags

**Release Notes Include**:
- Release type
- Docker image URLs
- Commit reference
- Verification checklist

## Configuration

### Required Secrets

For production deployment, configure these repository secrets:

```bash
DEPLOY_KEY          # SSH private key (base64 encoded or pem format)
DEPLOY_HOST         # e.g., "production.example.com"
DEPLOY_USER         # e.g., "deploy"
```

### Optional Configuration

#### Codecov Integration
Add codecov.yml to repository root for coverage tracking:

```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"
```

#### Branch Protection Rules
Configure for `main` branch:
- Require status checks to pass:
  - `CI / Lint & Type Check`
  - `CI / Tests`
  - `CI / Build Application`
- Require PR reviews before merge
- Dismiss stale PR approvals when new commits pushed

## Usage

### Running Workflows

#### CI (Automatic)
Triggered on every push and PR. No manual action needed.

#### Build & Push (Automatic)
Triggered on push to main with relevant file changes.

To force rebuild:
```bash
git commit --allow-empty -m "Trigger Docker build"
git push origin main
```

#### Deploy (Manual)
Via Actions tab:
1. Go to "Actions" → "Deploy to Production"
2. Click "Run workflow"
3. Select branch and click "Run"

Or via CLI:
```bash
gh workflow run deploy.yml
```

#### Security (Scheduled)
Runs daily. Manually trigger via:
```bash
gh workflow run security.yml
```

#### Release (Manual)
Via Actions tab:
1. Go to "Actions" → "Release"
2. Click "Run workflow"
3. Enter version (e.g., "1.0.0")
4. Select release type
5. Click "Run"

### Monitoring

#### GitHub Actions Dashboard
- View all workflow runs: https://github.com/YOUR_ORG/voxmation/actions
- View specific workflow: Click on workflow name
- View job logs: Click on failed job for detailed output

#### Step Summaries
Each workflow generates a summary visible in the Actions tab:
- Test coverage
- Build size
- Docker image digests
- Deployment status

## Troubleshooting

### CI Failures

**Lint errors**: Run locally to fix:
```bash
npm run lint -- --fix
```

**Type errors**: Check TypeScript compilation:
```bash
npx tsc --noEmit
```

**Test failures**: Run tests locally:
```bash
npm run test
```

**Build failures**: Check build output:
```bash
npm run build
```

### Docker Build Issues

**Build timeout**: Increase timeout in workflow (change `timeout-minutes`)

**Registry authentication**: Ensure `GITHUB_TOKEN` has `packages:write` permission

**Layer caching issues**: Clear cache via Actions settings

### Deployment Issues

**SSH connection fails**:
- Verify `DEPLOY_HOST` is correct
- Check `DEPLOY_KEY` is valid (should be base64 encoded if needed)
- Ensure server's IP is in GitHub Actions IP whitelist

**Health check fails**:
- SSH to server: `ssh user@host "docker ps"`
- Check container logs: `docker logs <container>`
- Verify ports are exposed: `docker port <container>`

**Secrets not found**:
- Go to Settings → Secrets and variables → Actions
- Ensure secrets are named exactly as expected
- Secrets are not available in pull requests from forks

## Performance Optimization

### Cache Strategy
- Node modules cached per branch
- Docker layers cached via BuildKit
- GitHub Actions cache stores build artifacts

### Parallel Execution
- Lint and Build run in parallel after dependencies cached
- Tests run after Lint (fail fast strategy)
- Security jobs run in parallel

### Fail Fast
- Linting runs before tests and build
- Issues reported immediately
- Saves CI time and resources

## Best Practices

1. **Keep builds fast**
   - Run only necessary checks in CI
   - Use caching aggressively
   - Parallelize independent jobs

2. **Clear feedback**
   - Step summaries explain what happened
   - Job names are descriptive
   - Error messages point to solution

3. **Security first**
   - Security workflow runs on schedule
   - Vulnerabilities block releases
   - Secrets stored securely

4. **Deployment safety**
   - Health checks before considering deployment done
   - Pre-deployment validation
   - Easy rollback (revert and redeploy)

5. **Documentation**
   - Keep this file updated
   - Add comments to complex workflow steps
   - Link to external docs when relevant

## Related Files

- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/build-and-push.yml` - Docker builds
- `.github/workflows/deploy.yml` - Production deployment
- `.github/workflows/security.yml` - Security scanning
- `.github/workflows/release.yml` - Release management
- `Dockerfile` - Multi-stage Docker build
- `package.json` - Scripts and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting rules

## Future Enhancements

- [ ] Integration tests in CI
- [ ] E2E tests with Playwright/Cypress
- [ ] Performance benchmarking
- [ ] Slack/Discord notifications
- [ ] Automatic changelog generation
- [ ] Blue-green deployment strategy
- [ ] Database migration checks
- [ ] Feature flag validation
- [ ] Load testing before deployment
- [ ] Canary deployment to subset of servers
