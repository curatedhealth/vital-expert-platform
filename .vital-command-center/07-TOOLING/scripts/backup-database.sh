#!/bin/bash

#################################################################
# Automated Database Backup Script for VITAL Path
# 
# This script creates encrypted backups of the Supabase PostgreSQL database
# and uploads them to S3-compatible storage (AWS S3, Backblaze B2, etc.)
#
# Features:
# - Automated daily backups via cron
# - GPG encryption for security
# - Retention policy (30 days)
# - Backup verification
# - Error notifications
#
# Requirements:
# - postgresql-client (pg_dump)
# - awscli or s3cmd
# - gpg
#################################################################

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/tmp/vital-backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="vital_db_backup_${TIMESTAMP}"
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Database connection (from environment)
DATABASE_URL="${DATABASE_URL:?ERROR: DATABASE_URL not set}"

# S3 Configuration (from environment)
S3_BUCKET="${S3_BUCKET:?ERROR: S3_BUCKET not set}"
S3_PREFIX="${S3_PREFIX:-backups/database}"

# GPG encryption key (from environment)
GPG_RECIPIENT="${GPG_RECIPIENT:?ERROR: GPG_RECIPIENT not set}"

# Notification webhook (optional)
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

#################################################################
# Functions
#################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN $(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

notify_slack() {
    local message="$1"
    local status="${2:-info}"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="good"
        [ "$status" = "error" ] && color="danger"
        [ "$status" = "warning" ] && color="warning"
        
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"VITAL Path Database Backup\",
                    \"text\": \"$message\",
                    \"footer\": \"Backup System\",
                    \"ts\": $(date +%s)
                }]
            }" 2>/dev/null || warn "Failed to send Slack notification"
    fi
}

cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "$BACKUP_DIR/${BACKUP_NAME}"*
}

#################################################################
# Main Backup Process
#################################################################

main() {
    log "==================================================================="
    log "Starting VITAL Path Database Backup"
    log "==================================================================="
    log "Timestamp: $TIMESTAMP"
    log "Backup Name: $BACKUP_NAME"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Step 1: Create database dump
    log "Step 1: Creating database dump..."
    
    if pg_dump "$DATABASE_URL" \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="$BACKUP_DIR/${BACKUP_NAME}.dump" 2>&1 | grep -v "^$"; then
        log "✅ Database dump created successfully"
    else
        error "❌ Database dump failed"
        notify_slack "Database backup failed: pg_dump error" "error"
        exit 1
    fi
    
    # Step 2: Verify dump file
    log "Step 2: Verifying dump file..."
    
    if [ -f "$BACKUP_DIR/${BACKUP_NAME}.dump" ]; then
        DUMP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.dump" | cut -f1)
        log "✅ Dump file exists (Size: $DUMP_SIZE)"
        
        # Verify dump is not corrupted
        if pg_restore --list "$BACKUP_DIR/${BACKUP_NAME}.dump" > /dev/null 2>&1; then
            log "✅ Dump file integrity verified"
        else
            error "❌ Dump file is corrupted"
            notify_slack "Database backup failed: corrupted dump file" "error"
            cleanup
            exit 1
        fi
    else
        error "❌ Dump file not found"
        notify_slack "Database backup failed: dump file not created" "error"
        exit 1
    fi
    
    # Step 3: Encrypt backup
    log "Step 3: Encrypting backup..."
    
    if gpg --encrypt \
        --recipient "$GPG_RECIPIENT" \
        --trust-model always \
        --output "$BACKUP_DIR/${BACKUP_NAME}.dump.gpg" \
        "$BACKUP_DIR/${BACKUP_NAME}.dump" 2>&1; then
        log "✅ Backup encrypted successfully"
        
        # Remove unencrypted dump
        rm -f "$BACKUP_DIR/${BACKUP_NAME}.dump"
    else
        error "❌ Encryption failed"
        notify_slack "Database backup failed: encryption error" "error"
        cleanup
        exit 1
    fi
    
    # Step 4: Upload to S3
    log "Step 4: Uploading to S3..."
    
    S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.dump.gpg"
    
    if aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.dump.gpg" "$S3_PATH" \
        --storage-class STANDARD_IA \
        --metadata "backup-date=$TIMESTAMP,retention-days=$RETENTION_DAYS" 2>&1; then
        log "✅ Backup uploaded to S3: $S3_PATH"
    else
        error "❌ S3 upload failed"
        notify_slack "Database backup failed: S3 upload error" "error"
        cleanup
        exit 1
    fi
    
    # Step 5: Verify S3 upload
    log "Step 5: Verifying S3 upload..."
    
    if aws s3 ls "$S3_PATH" > /dev/null 2>&1; then
        S3_SIZE=$(aws s3 ls "$S3_PATH" | awk '{print $3}')
        log "✅ S3 upload verified (Size: $S3_SIZE bytes)"
    else
        error "❌ S3 verification failed"
        notify_slack "Database backup warning: S3 verification failed" "warning"
    fi
    
    # Step 6: Clean up old backups
    log "Step 6: Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d || date -v -${RETENTION_DAYS}d +%Y%m%d)
    
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
        BACKUP_FILE=$(echo "$line" | awk '{print $4}')
        
        if [ -n "$BACKUP_FILE" ]; then
            BACKUP_DATE=$(echo "$BACKUP_FILE" | grep -oP '\d{8}' | head -1 || echo "")
            
            if [ -n "$BACKUP_DATE" ] && [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
                log "Deleting old backup: $BACKUP_FILE"
                aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" || warn "Failed to delete $BACKUP_FILE"
            fi
        fi
    done
    
    # Step 7: Create backup metadata
    log "Step 7: Creating backup metadata..."
    
    cat > "$BACKUP_DIR/${BACKUP_NAME}.metadata.json" <<EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "${TIMESTAMP}",
    "date": "$(date -Iseconds)",
    "database": "vital_path",
    "size_bytes": $(stat -f%z "$BACKUP_DIR/${BACKUP_NAME}.dump.gpg" 2>/dev/null || stat -c%s "$BACKUP_DIR/${BACKUP_NAME}.dump.gpg"),
    "encrypted": true,
    "s3_path": "${S3_PATH}",
    "retention_days": ${RETENTION_DAYS},
    "expiry_date": "$(date -d "+${RETENTION_DAYS} days" -Iseconds || date -v +${RETENTION_DAYS}d -Iseconds)"
}
EOF
    
    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.metadata.json" \
        "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.metadata.json" || warn "Failed to upload metadata"
    
    # Cleanup local files
    cleanup
    
    # Success notification
    log "==================================================================="
    log "✅ Backup completed successfully!"
    log "==================================================================="
    log "Backup file: ${BACKUP_NAME}.dump.gpg"
    log "S3 location: $S3_PATH"
    log "Retention: $RETENTION_DAYS days"
    
    notify_slack "✅ Database backup completed successfully\nFile: ${BACKUP_NAME}.dump.gpg\nSize: $DUMP_SIZE" "good"
}

# Trap errors and cleanup
trap 'error "Backup script failed"; notify_slack "Database backup failed unexpectedly" "error"; cleanup; exit 1' ERR

# Run main function
main

exit 0

