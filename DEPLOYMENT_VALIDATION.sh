#!/bin/bash

################################################################################
# Voxmation Deployment Validation Script
#
# This script validates deployment configurations and tests all external
# service connections. Run this before deploying to production.
#
# Usage: bash DEPLOYMENT_VALIDATION.sh [environment]
# Examples:
#   bash DEPLOYMENT_VALIDATION.sh development
#   bash DEPLOYMENT_VALIDATION.sh production
#   bash DEPLOYMENT_VALIDATION.sh
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
ENV_FILE=".env.${ENVIRONMENT}"
FAILED_CHECKS=0
PASSED_CHECKS=0

# Functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
  ((PASSED_CHECKS++))
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  ((FAILED_CHECKS++))
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

check_env_file() {
  print_header "Environment Variables"

  if [[ ! -f "$ENV_FILE" ]]; then
    print_error "Environment file not found: $ENV_FILE"
    return 1
  fi

  print_success "Environment file exists: $ENV_FILE"

  # Source environment variables
  set -a
  source "$ENV_FILE"
  set +a

  return 0
}

check_required_env_vars() {
  print_header "Required Environment Variables"

  local required_vars=(
    "NODE_ENV"
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "VITE_API_URL"
    "RESEND_API_KEY"
    "RESEND_FROM_EMAIL"
    "ELEVENLABS_API_KEY"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENTRY_DSN"
  )

  local missing_vars=()

  for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
      missing_vars+=("$var")
      print_error "Missing: $var"
    else
      # Mask sensitive values
      local value="${!var}"
      if [[ ${#value} -gt 20 ]]; then
        value="${value:0:10}...${value: -5}"
      fi
      print_success "$var = $value"
    fi
  done

  if [[ ${#missing_vars[@]} -gt 0 ]]; then
    print_error "Missing ${#missing_vars[@]} required environment variables"
    return 1
  fi

  return 0
}

check_dependencies() {
  print_header "System Dependencies"

  local deps=(
    "node"
    "npm"
    "docker"
    "docker-compose"
    "psql"
    "curl"
    "git"
  )

  for dep in "${deps[@]}"; do
    if command -v "$dep" &> /dev/null; then
      local version=$($dep --version 2>&1 | head -n 1)
      print_success "$dep: $version"
    else
      print_error "$dep not found"
    fi
  done
}

check_node_project() {
  print_header "Node.js Project Configuration"

  if [[ ! -f "package.json" ]]; then
    print_error "package.json not found"
    return 1
  fi

  print_success "package.json exists"

  if [[ ! -d "node_modules" ]]; then
    print_warning "node_modules not found - running npm install"
    npm install --silent
  else
    print_success "node_modules installed"
  fi

  # Check key packages
  if grep -q '"@sentry/react"' package.json; then
    print_success "Sentry dependencies installed"
  else
    print_error "Sentry dependencies missing"
  fi

  if grep -q '"@supabase/supabase-js"' package.json; then
    print_success "Supabase dependencies installed"
  else
    print_error "Supabase dependencies missing"
  fi
}

check_supabase_connection() {
  print_header "Supabase Connection"

  print_info "Testing Supabase API endpoint..."

  local response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    "$VITE_SUPABASE_URL/rest/v1/")

  if [[ "$response" == "200" ]]; then
    print_success "Supabase API accessible (HTTP $response)"
  else
    print_error "Supabase API returned HTTP $response"
    return 1
  fi

  # Try to query a table
  print_info "Testing database query..."
  response=$(curl -s -w "\n%{http_code}" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    "$VITE_SUPABASE_URL/rest/v1/organizations?limit=1" | tail -n 1)

  if [[ "$response" == "200" ]]; then
    print_success "Database accessible"
  else
    print_warning "Database query returned HTTP $response (may require authentication)"
  fi

  return 0
}

check_resend_email() {
  print_header "Resend Email Service"

  print_info "Testing Resend API..."

  local response=$(curl -s -X GET \
    -H "Authorization: Bearer $RESEND_API_KEY" \
    -w "%{http_code}" -o /dev/null \
    "https://api.resend.com/emails/verification/ping")

  if [[ "$response" == "200" ]]; then
    print_success "Resend API accessible (HTTP $response)"
  else
    print_error "Resend API returned HTTP $response"
    return 1
  fi

  return 0
}

check_twilio_sms() {
  print_header "Twilio SMS Service"

  print_info "Testing Twilio API..."

  local auth=$(echo -n "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" | base64)
  local response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "Authorization: Basic $auth" \
    "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json")

  if [[ "$response" == "200" ]]; then
    print_success "Twilio API accessible (HTTP $response)"
  else
    print_error "Twilio API returned HTTP $response"
    return 1
  fi

  return 0
}

check_elevenlabs_voice() {
  print_header "ElevenLabs Voice Service"

  print_info "Testing ElevenLabs API..."

  local response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    "https://api.elevenlabs.io/v1/user")

  if [[ "$response" == "200" ]]; then
    print_success "ElevenLabs API accessible (HTTP $response)"
  else
    print_error "ElevenLabs API returned HTTP $response"
    return 1
  fi

  return 0
}

check_stripe_payment() {
  print_header "Stripe Payment Service"

  print_info "Testing Stripe API..."

  local auth=$(echo -n "$STRIPE_SECRET_KEY:" | base64)
  local response=$(curl -s -w "%{http_code}" -o /dev/null \
    -H "Authorization: Basic $auth" \
    "https://api.stripe.com/v1/account")

  if [[ "$response" == "200" ]]; then
    print_success "Stripe API accessible (HTTP $response)"
  else
    print_error "Stripe API returned HTTP $response"
    return 1
  fi

  return 0
}

check_sentry_monitoring() {
  print_header "Sentry Error Tracking"

  print_info "Validating Sentry DSN..."

  # Extract project ID from DSN
  local project_id=$(echo "$SENTRY_DSN" | grep -oE '[0-9]+$')

  if [[ -z "$project_id" ]]; then
    print_error "Invalid Sentry DSN format"
    return 1
  fi

  print_success "Sentry DSN appears valid (Project ID: $project_id)"

  return 0
}

check_docker_setup() {
  print_header "Docker Configuration"

  if ! command -v docker &> /dev/null; then
    print_warning "Docker not installed - skipping Docker checks"
    return 0
  fi

  if [[ ! -f "Dockerfile" ]]; then
    print_error "Dockerfile not found"
    return 1
  fi

  print_success "Dockerfile exists"

  if [[ ! -f "docker-compose.yml" ]]; then
    print_error "docker-compose.yml not found"
    return 1
  fi

  print_success "docker-compose.yml exists"

  # Check Docker daemon
  if docker ps &> /dev/null; then
    print_success "Docker daemon is running"
  else
    print_error "Cannot connect to Docker daemon"
    return 1
  fi

  return 0
}

check_database_migrations() {
  print_header "Database Migrations"

  local migration_dir="supabase/migrations"

  if [[ ! -d "$migration_dir" ]]; then
    print_error "Migrations directory not found: $migration_dir"
    return 1
  fi

  local migration_count=$(ls -1 "$migration_dir"/*.sql 2>/dev/null | wc -l)

  if [[ $migration_count -eq 0 ]]; then
    print_error "No migration files found in $migration_dir"
    return 1
  fi

  print_success "Found $migration_count migration files"

  # List migrations
  for migration in "$migration_dir"/*.sql; do
    print_info "$(basename "$migration")"
  done

  return 0
}

check_build() {
  print_header "Build Configuration"

  # Check build script exists
  if grep -q '"build"' package.json; then
    print_success "Build script configured in package.json"
  else
    print_error "Build script not found in package.json"
    return 1
  fi

  # Check vite config exists
  if [[ -f "vite.config.ts" ]]; then
    print_success "Vite configuration found"
  else
    print_error "Vite configuration not found"
    return 1
  fi

  # Check TypeScript config exists
  if [[ -f "tsconfig.json" ]]; then
    print_success "TypeScript configuration found"
  else
    print_error "TypeScript configuration not found"
    return 1
  fi

  return 0
}

check_git_setup() {
  print_header "Git Configuration"

  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    return 1
  fi

  print_success "Git repository initialized"

  # Check remote
  if git config --get remote.origin.url &> /dev/null; then
    local remote=$(git config --get remote.origin.url)
    print_success "Git remote configured: $remote"
  else
    print_warning "No git remote configured"
  fi

  # Check for uncommitted changes
  if git status --porcelain | grep -q .; then
    print_warning "Uncommitted changes detected"
  else
    print_success "No uncommitted changes"
  fi

  return 0
}

check_environment_security() {
  print_header "Security Checks"

  # Check .env is in .gitignore
  if grep -q '\.env' .gitignore 2>/dev/null; then
    print_success ".env files in .gitignore"
  else
    print_error ".env files not in .gitignore - risk of exposing secrets!"
  fi

  # Check for exposed secrets in git history
  print_info "Checking for exposed secrets in recent commits..."
  if git log -p --follow -S "AKIA" -S "sk_" -S "pk_" --since="1 week ago" | grep -E "(AKIA|sk_|pk_)" &> /dev/null; then
    print_warning "Potential secrets detected in git history - review immediately"
  else
    print_success "No obvious secrets in git history"
  fi

  # Check environment file permissions
  if [[ -f "$ENV_FILE" ]]; then
    local perms=$(stat -f%A "$ENV_FILE" 2>/dev/null || stat -c%a "$ENV_FILE" 2>/dev/null)
    if [[ "$perms" == "600" ]] || [[ "$perms" == "640" ]]; then
      print_success "Environment file permissions secure ($perms)"
    else
      print_warning "Environment file permissions may be too permissive ($perms)"
    fi
  fi

  return 0
}

print_summary() {
  print_header "Validation Summary"

  local total=$((PASSED_CHECKS + FAILED_CHECKS))

  echo -e "\nPassed:  ${GREEN}$PASSED_CHECKS${NC}"
  echo -e "Failed:  ${RED}$FAILED_CHECKS${NC}"
  echo -e "Total:   $total"

  if [[ $FAILED_CHECKS -eq 0 ]]; then
    echo -e "\n${GREEN}✓ All validation checks passed!${NC}"
    echo -e "${GREEN}System is ready for deployment to $ENVIRONMENT${NC}\n"
    return 0
  else
    echo -e "\n${RED}✗ $FAILED_CHECKS validation check(s) failed${NC}"
    echo -e "${RED}Please fix issues above before deploying${NC}\n"
    return 1
  fi
}

# Main execution
main() {
  clear

  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║       Voxmation Deployment Validation Script                   ║"
  echo "║       Environment: $ENVIRONMENT"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  # Run all checks
  check_env_file || exit 1
  check_required_env_vars || true
  check_dependencies || true
  check_node_project || true
  check_supabase_connection || true
  check_resend_email || true
  check_twilio_sms || true
  check_elevenlabs_voice || true
  check_stripe_payment || true
  check_sentry_monitoring || true
  check_docker_setup || true
  check_database_migrations || true
  check_build || true
  check_git_setup || true
  check_environment_security || true

  # Print summary
  print_summary

  if [[ $FAILED_CHECKS -gt 0 ]]; then
    exit 1
  fi
}

# Run main function
main "$@"
