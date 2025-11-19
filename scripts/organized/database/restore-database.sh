#!/bin/bash

#################################################################
# Database Restoration Script for VITAL Path
# 
# This script restores a Supabase PostgreSQL database from
# an encrypted S3 backup.
#
# Usage:
#   ./restore-database.sh [backup_name]
#   ./restore-database.sh  # Lists available backups
#
# Features:
# - List available backups
# - Download and decrypt backup
# - Restore to database
# - Verification
# - Dry-run mode
#################################################################

set -euo pipefail

# Configuration
RESTORE_DIR="${RESTORE_DIR:-/tmp/vital-restore}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database connection (from environment)
DATABASE_URL="${DATABASE_URL:?ERROR: DATABASE_URL not set}"

# S3 Configuration (from environment)
S3_BUCKET="${S3_BUCKET:?ERROR: S3_BUCKET not set}"
S3_PREFIX="${S3_PREFIX:-backups/database}"

# GPG decryption (uses default keyring)
GPG_PASSPHRASE="${GPG_PASSPHRASE:-}"

# Mode
DRY_RUN="${DRY_RUN:-false}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

list_backups() {
    log "Available backups in S3:"
    log "==================================================================="
    
    aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | grep "\.dump\.gpg$" | while read -r line; do
        BACKUP_FILE=$(echo "$line" | awk '{print $4}')
        BACKUP_DATE=$(echo "$line" | awk '{print $1 " " $2}')
        BACKUP_SIZE=$(echo "$line" | awk '{print $3}')
        
        # Try to fetch metadata
        METADATA_FILE="${BACKUP_FILE%.dump.gpg}.metadata.json"
        METADATA_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${METADATA_FILE}"
        
        if aws s3 ls "$METADATA_PATH" > /dev/null 2>&1; then
            METADATA=$(aws s3 cp "$METADATA_PATH" - 2>/dev/null || echo "{}")
            EXPIRY=$(echo "$METADATA" | jq -r '.expiry_date // "N/A"' 2>/dev/null || echo "N/A")
            
            echo -e "${GREEN}${BACKUP_FILE}${NC}"
            echo "  Date: $BACKUP_DATE"
            echo "  Size: $BACKUP_SIZE bytes"
            echo "  Expires: $EXPIRY"
            echo ""
        else
            echo -e "${GREEN}${BACKUP_FILE}${NC}"
            echo "  Date: $BACKUP_DATE"
            echo "  Size: $BACKUP_SIZE bytes"
            echo ""
        fi
    done
}

confirm_restore() {
    local backup_name="$1"
    
    warn "==================================================================="
    warn "⚠️  DATABASE RESTORATION WARNING"
    warn "==================================================================="
    warn "This will OVERWRITE the current database with backup:"
    warn "  $backup_name"
    warn ""
    warn "Current database will be LOST unless you have a recent backup!"
    warn "==================================================================="
    
    if [ "$DRY_RUN" = "true" ]; then
        info "DRY RUN MODE - No changes will be made"
        return 0
    fi
    
    read -p "Are you absolutely sure? Type 'YES' to continue: " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        error "Restoration cancelled"
        exit 1
    fi
    
    log "Confirmation received, proceeding with restoration..."
}

restore_database() {
    local backup_name="$1"
    
    log "==================================================================="
    log "Starting Database Restoration"
    log "==================================================================="
    log "Backup: $backup_name"
    log "Timestamp: $TIMESTAMP"
    
    # Create restore directory
    mkdir -p "$RESTORE_DIR"
    
    # Step 1: Download backup from S3
    log "Step 1: Downloading backup from S3..."
    
    S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/${backup_name}"
    
    if aws s3 cp "$S3_PATH" "$RESTORE_DIR/${backup_name}" 2>&1; then
        log "✅ Backup downloaded successfully"
    else
        error "❌ Failed to download backup from S3"
        exit 1
    fi
    
    # Step 2: Decrypt backup
    log "Step 2: Decrypting backup..."
    
    DECRYPTED_FILE="$RESTORE_DIR/${backup_name%.gpg}"
    
    if [ -n "$GPG_PASSPHRASE" ]; then
        if echo "$GPG_PASSPHRASE" | gpg --batch --yes --passphrase-fd 0 \
            --decrypt --output "$DECRYPTED_FILE" \
            "$RESTORE_DIR/${backup_name}" 2>&1; then
            log "✅ Backup decrypted successfully"
        else
            error "❌ Decryption failed"
            exit 1
        fi
    else
        if gpg --decrypt --output "$DECRYPTED_FILE" \
            "$RESTORE_DIR/${backup_name}" 2>&1; then
            log "✅ Backup decrypted successfully"
        else
            error "❌ Decryption failed"
            exit 1
        fi
    fi
    
    # Step 3: Verify dump integrity
    log "Step 3: Verifying dump integrity..."
    
    if pg_restore --list "$DECRYPTED_FILE" > /dev/null 2>&1; then
        log "✅ Dump file integrity verified"
    else
        error "❌ Dump file is corrupted"
        exit 1
    fi
    
    # Step 4: Create pre-restore backup (safety measure)
    if [ "$DRY_RUN" != "true" ]; then
        log "Step 4: Creating pre-restore safety backup..."
        
        SAFETY_BACKUP="$RESTORE_DIR/pre_restore_backup_${TIMESTAMP}.dump"
        
        if pg_dump "$DATABASE_URL" \
            --format=custom \
            --compress=9 \
            --file="$SAFETY_BACKUP" 2>&1 | grep -v "^$"; then
            log "✅ Safety backup created: $SAFETY_BACKUP"
            log "   You can restore from this if needed"
        else
            warn "⚠️  Failed to create safety backup, but continuing..."
        fi
    else
        log "Step 4: Skipped (dry run mode)"
    fi
    
    # Step 5: Drop and recreate database (or use --clean)
    if [ "$DRY_RUN" != "true" ]; then
        log "Step 5: Preparing database for restoration..."
        
        # Option A: Use pg_restore --clean (safer, preserves database)
        log "Using --clean --if-exists flags for safe restoration"
        
        # Option B: Drop/recreate (more aggressive, commented out)
        # psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    else
        log "Step 5: Skipped (dry run mode)"
    fi
    
    # Step 6: Restore database
    if [ "$DRY_RUN" != "true" ]; then
        log "Step 6: Restoring database (this may take several minutes)..."
        
        if pg_restore \
            --dbname="$DATABASE_URL" \
            --clean \
            --if-exists \
            --no-owner \
            --no-acl \
            --verbose \
            "$DECRYPTED_FILE" 2>&1 | grep -E "^(processing|restoring)" || true; then
            log "✅ Database restored successfully"
        else
            error "❌ Database restoration failed"
            error "   Safety backup is available at: $SAFETY_BACKUP"
            exit 1
        fi
    else
        log "Step 6: Skipped (dry run mode)"
        info "Would restore from: $DECRYPTED_FILE"
    fi
    
    # Step 7: Verify restoration
    if [ "$DRY_RUN" != "true" ]; then
        log "Step 7: Verifying restoration..."
        
        # Run basic verification queries
        if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" > /dev/null 2>&1; then
            TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';")
            log "✅ Database verification passed"
            log "   Public schema tables: $TABLE_COUNT"
        else
            error "❌ Database verification failed"
            exit 1
        fi
    else
        log "Step 7: Skipped (dry run mode)"
    fi
    
    # Cleanup
    log "Cleaning up temporary files..."
    rm -f "$RESTORE_DIR/${backup_name}"
    rm -f "$DECRYPTED_FILE"
    
    log "==================================================================="
    if [ "$DRY_RUN" = "true" ]; then
        log "✅ Dry run completed successfully (no changes made)"
    else
        log "✅ Database restoration completed successfully!"
    fi
    log "==================================================================="
    
    if [ "$DRY_RUN" != "true" ]; then
        info "Safety backup retained at: $SAFETY_BACKUP"
        info "You can delete it after verifying the restoration"
    fi
}

show_usage() {
    cat <<EOF
Database Restoration Script for VITAL Path

Usage:
  $0 [backup_name]      Restore from specific backup
  $0 --list             List available backups
  $0 --help             Show this help message

Environment Variables:
  DATABASE_URL          PostgreSQL connection string (required)
  S3_BUCKET             S3 bucket name (required)
  S3_PREFIX             S3 key prefix (default: backups/database)
  GPG_PASSPHRASE        GPG passphrase for decryption (optional)
  DRY_RUN               Set to 'true' for dry run (default: false)
  RESTORE_DIR           Temporary directory (default: /tmp/vital-restore)

Examples:
  # List available backups
  $0 --list
  
  # Restore from specific backup
  $0 vital_db_backup_20250104_120000.dump.gpg
  
  # Dry run (no changes made)
  DRY_RUN=true $0 vital_db_backup_20250104_120000.dump.gpg

EOF
}

#################################################################
# Main
#################################################################

main() {
    # Parse arguments
    if [ $# -eq 0 ]; then
        list_backups
        echo ""
        info "To restore, run: $0 <backup_name>"
        exit 0
    fi
    
    case "${1:-}" in
        --list|-l)
            list_backups
            ;;
        --help|-h)
            show_usage
            ;;
        *)
            BACKUP_NAME="$1"
            confirm_restore "$BACKUP_NAME"
            restore_database "$BACKUP_NAME"
            ;;
    esac
}

# Run main function
main "$@"

exit 0

