#!/bin/bash

# =====================================================================
# Database Backup Script
# Creates and manages PostgreSQL backups
# =====================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-voxmation}"
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null; then
    log_error "docker compose not found"
    exit 1
fi

# Check if PostgreSQL service is running
if ! docker compose ps postgres 2>/dev/null | grep -q "Up"; then
    log_error "PostgreSQL service is not running"
    exit 1
fi

log_info "Starting database backup..."
log_info "Backup file: $BACKUP_FILE"

# Perform backup
if docker compose exec -T postgres \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | \
    gzip > "$BACKUP_FILE"; then

    local file_size
    file_size=$(du -h "$BACKUP_FILE" | cut -f1)

    log_info "Backup completed successfully"
    log_info "File size: $file_size"

    # List recent backups
    log_info "Recent backups:"
    ls -lh "$BACKUP_DIR"/backup-*.sql.gz | tail -5
else
    log_error "Backup failed"
    exit 1
fi

# Cleanup old backups
log_info "Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."

find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime "+$BACKUP_RETENTION_DAYS" | while read -r old_backup; do
    log_warn "Removing old backup: $old_backup"
    rm -f "$old_backup"
done

log_info "Cleanup completed"

# Optional: Upload to remote storage
if [ "${BACKUP_UPLOAD_ENABLED:-false}" == "true" ]; then
    log_info "Uploading backup to remote storage..."

    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE" \
            "s3://${S3_BACKUP_BUCKET}/database/$(basename "$BACKUP_FILE")" \
            --sse AES256

        log_info "Backup uploaded to S3"
    elif command -v gsutil &> /dev/null; then
        gsutil cp "$BACKUP_FILE" \
            "gs://${GCS_BACKUP_BUCKET}/database/$(basename "$BACKUP_FILE")"

        log_info "Backup uploaded to Google Cloud Storage"
    else
        log_warn "No cloud storage CLI found (aws or gsutil)"
    fi
fi

log_info "Backup process completed"

# Display summary
echo ""
echo "Backup Summary:"
echo "- File: $BACKUP_FILE"
echo "- Size: $file_size"
echo "- Database: $POSTGRES_DB"
echo "- Timestamp: $TIMESTAMP"
echo ""
