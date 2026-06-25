#!/bin/bash

# =====================================================================
# Docker Environment Initialization Script
# Sets up Docker environment and validates configuration
# =====================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo ""
    echo -e "${BLUE}===================================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===================================================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking Prerequisites"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_info "Docker found: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_info "Docker Compose found: $(docker compose --version)"

    # Check Docker daemon
    if ! docker ps &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    log_info "Docker daemon is running"
}

# Setup environment files
setup_environment() {
    log_step "Setting Up Environment Files"

    # Determine environment
    local env_file=".env.local"

    if [ "${ENV:-}" == "production" ]; then
        env_file=".env.production"
        log_info "Production environment detected"
    else
        log_info "Development environment"
    fi

    # Check if environment file exists
    if [ ! -f "$env_file" ]; then
        if [ -f ".env.docker" ]; then
            log_warn "$env_file not found, copying from .env.docker"
            cp .env.docker "$env_file"
            log_info "Environment file created: $env_file"
        else
            log_error "No .env.docker template found"
            exit 1
        fi
    else
        log_info "Environment file exists: $env_file"
    fi

    # Validate required variables
    validate_environment "$env_file"
}

# Validate environment variables
validate_environment() {
    local env_file=$1

    log_info "Validating environment variables..."

    # Required variables
    local required_vars=(
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "POSTGRES_PASSWORD"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep "^${var}=$" "$env_file"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warn "Missing or empty required variables in $env_file:"
        printf '%s\n' "${missing_vars[@]}" | sed 's/^/  - /'
        log_info "Please configure $env_file before starting services"
    else
        log_info "All required environment variables are set"
    fi
}

# Create data directories
setup_directories() {
    log_step "Creating Data Directories"

    local dirs=(
        "data/postgres"
        "data/redis"
        "data/uploads"
        "backups"
        "ssl/certs"
    )

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        else
            log_info "Directory exists: $dir"
        fi
    done

    # Set permissions
    chmod 755 data/*/
    chmod 755 backups/
    chmod 755 ssl/
}

# Validate docker-compose.yml
validate_docker_compose() {
    log_step "Validating Docker Compose Configuration"

    if docker compose config > /dev/null 2>&1; then
        log_info "Docker Compose configuration is valid"
    else
        log_error "Docker Compose configuration is invalid"
        docker compose config
        exit 1
    fi
}

# Build images
build_images() {
    log_step "Building Docker Images"

    if [ "${SKIP_BUILD:-false}" == "true" ]; then
        log_warn "Skipping image build (SKIP_BUILD=true)"
        return
    fi

    log_info "Building images... (this may take several minutes)"
    docker compose build

    if [ $? -eq 0 ]; then
        log_info "Image build completed successfully"
    else
        log_error "Image build failed"
        exit 1
    fi
}

# Start services
start_services() {
    log_step "Starting Services"

    log_info "Starting containers..."
    docker compose up -d

    if [ $? -eq 0 ]; then
        log_info "Services started"
    else
        log_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_services() {
    log_step "Waiting for Services to Be Healthy"

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."

        if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1 &&
           docker compose exec -T redis redis-cli ping > /dev/null 2>&1 &&
           docker compose exec -T backend curl -sf http://localhost:3001/health > /dev/null 2>&1; then

            log_info "All services are healthy"
            return 0
        fi

        sleep 2
        ((attempt++))
    done

    log_warn "Services did not become healthy within timeout"
    log_warn "Check logs with: docker compose logs"
}

# Display access information
display_info() {
    log_step "Setup Complete!"

    cat << EOF

Access Information:
  Frontend:  ${BLUE}http://localhost:5000${NC}
  Backend:   ${BLUE}http://localhost:3001${NC}
  Database:  ${BLUE}localhost:5432${NC}
  Redis:     ${BLUE}localhost:6379${NC}

Development Tools (if using docker-compose.dev.yml):
  PgAdmin:           ${BLUE}http://localhost:5050${NC}
  Redis Commander:   ${BLUE}http://localhost:8081${NC}
  MailHog (SMTP):    ${BLUE}http://localhost:8025${NC}

Useful Commands:
  View logs:         ${BLUE}docker compose logs -f${NC}
  Stop services:     ${BLUE}docker compose down${NC}
  Restart services:  ${BLUE}docker compose restart${NC}
  Run migrations:    ${BLUE}docker compose exec backend npm run migrate${NC}
  Database backup:   ${BLUE}./scripts/docker-backup.sh${NC}
  Health check:      ${BLUE}./scripts/docker-healthcheck.sh${NC}

Environment File: .env.local or .env.production

Next Steps:
  1. Configure environment variables in .env.local
  2. Run migrations: docker compose exec backend npm run migrate
  3. Visit http://localhost:5000 to access the application

For more information, see DOCKER_SETUP.md

EOF
}

# Error handler
trap 'log_error "Script failed at line $LINENO"' ERR

# Main execution
main() {
    log_step "Voxmation Docker Initialization"

    check_prerequisites
    setup_environment
    setup_directories
    validate_docker_compose
    build_images
    start_services
    wait_for_services
    display_info

    log_info "Initialization completed successfully"
}

# Display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Initialize Docker environment for Voxmation.

OPTIONS:
    -h, --help          Show this help message
    -e, --env ENV       Set environment (development or production)
    --skip-build        Skip Docker image build
    --dev               Run in development mode
    --prod              Run in production mode

EXAMPLES:
    $0                      # Standard initialization
    $0 --dev                # Development setup
    $0 --prod               # Production setup
    $0 --skip-build         # Skip building images

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -e|--env)
            ENV=$2
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dev)
            ENV=development
            shift
            ;;
        --prod)
            ENV=production
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main
main
