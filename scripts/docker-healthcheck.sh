#!/bin/bash

# =====================================================================
# Docker Health Check Script
# Monitors the health status of all services
# =====================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HEALTH_CHECK_TIMEOUT=30
MAX_RETRIES=3

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_service_health() {
    local service=$1
    local endpoint=$2
    local max_retries=${3:-$MAX_RETRIES}

    log_info "Checking health of $service..."

    for attempt in $(seq 1 $max_retries); do
        if docker compose exec -T "$service" curl -sf "$endpoint" > /dev/null 2>&1; then
            log_info "$service is healthy"
            return 0
        fi

        if [ $attempt -lt $max_retries ]; then
            log_warn "$service health check attempt $attempt failed, retrying..."
            sleep 5
        fi
    done

    log_error "$service is NOT healthy after $max_retries attempts"
    return 1
}

check_container_running() {
    local service=$1

    if docker compose ps "$service" 2>/dev/null | grep -q "Up"; then
        log_info "$service container is running"
        return 0
    else
        log_error "$service container is NOT running"
        return 1
    fi
}

get_service_stats() {
    local service=$1

    log_info "Stats for $service:"
    docker compose stats --no-stream "$service" 2>/dev/null || true
}

# Main execution
main() {
    log_info "Starting health checks..."
    local failed_services=0

    # Check if docker compose is available
    if ! command -v docker compose &> /dev/null; then
        log_error "docker compose not found"
        exit 1
    fi

    # Check if services are running
    if ! docker compose ps &>/dev/null; then
        log_error "Docker Compose services not running"
        exit 1
    fi

    echo ""

    # Check Backend
    if ! check_container_running backend; then
        ((failed_services++))
    elif ! check_service_health backend "http://localhost:3001/health"; then
        ((failed_services++))
    fi
    echo ""

    # Check Frontend
    if ! check_container_running frontend; then
        ((failed_services++))
    elif ! check_service_health frontend "http://localhost:5000"; then
        ((failed_services++))
    fi
    echo ""

    # Check PostgreSQL
    if ! check_container_running postgres; then
        ((failed_services++))
    elif docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "PostgreSQL is healthy"
    else
        log_error "PostgreSQL is NOT healthy"
        ((failed_services++))
    fi
    echo ""

    # Check Redis
    if ! check_container_running redis; then
        ((failed_services++))
    elif docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis is healthy"
    else
        log_error "Redis is NOT healthy"
        ((failed_services++))
    fi
    echo ""

    # Check NGINX
    if ! check_container_running nginx; then
        ((failed_services++))
    elif docker compose exec -T nginx nginx -t > /dev/null 2>&1; then
        log_info "NGINX is healthy"
    else
        log_error "NGINX configuration is invalid"
        ((failed_services++))
    fi
    echo ""

    # Display resource usage
    log_info "Resource usage:"
    docker compose stats --no-stream
    echo ""

    # Summary
    if [ $failed_services -eq 0 ]; then
        log_info "All services are healthy!"
        exit 0
    else
        log_error "$failed_services service(s) failed health checks"
        exit 1
    fi
}

# Display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Health check script for Docker Compose services.

OPTIONS:
    -h, --help          Show this help message
    -s, --service       Check specific service
    -v, --verbose       Verbose output
    -q, --quiet         Quiet output (no color)

EXAMPLES:
    $0                      # Check all services
    $0 --service backend    # Check only backend
    $0 --verbose            # Verbose health check

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -s|--service)
            SERVICE_CHECK=$2
            shift 2
            ;;
        -v|--verbose)
            set -x
            shift
            ;;
        -q|--quiet)
            NC=''
            RED=''
            GREEN=''
            YELLOW=''
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run health checks
main
