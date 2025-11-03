#!/bin/bash
#
# ============================================================================
# VITAL Documentation Cleanup Script
# ============================================================================
#
# Purpose: Organize 405+ root-level markdown files into structured directories
# When: Post-MVP (Week 2)
# Time: 2-3 hours (including verification)
# Risk: MEDIUM (creates backup, can be rolled back)
#
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups/doc-cleanup-$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false

# Statistics
MOVED_COUNT=0
KEPT_COUNT=0
ERROR_COUNT=0

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# Backup Function
# ============================================================================

create_backup() {
    print_header "Creating Backup"
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup all root markdown files
    for file in "${PROJECT_ROOT}"/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "${BACKUP_DIR}/"
        fi
    done
    
    # Backup all root shell scripts
    for file in "${PROJECT_ROOT}"/*.sh; do
        if [ -f "$file" ]; then
            cp "$file" "${BACKUP_DIR}/"
        fi
    done
    
    print_success "Backup created at: ${BACKUP_DIR}"
    print_info "Total files backed up: $(ls -1 "${BACKUP_DIR}" | wc -l)"
}

# ============================================================================
# Directory Structure Creation
# ============================================================================

create_directory_structure() {
    print_header "Creating Directory Structure"
    
    # Main documentation directories
    mkdir -p "${PROJECT_ROOT}/docs/architecture/current"
    mkdir -p "${PROJECT_ROOT}/docs/architecture/decisions"
    mkdir -p "${PROJECT_ROOT}/docs/architecture/archive"
    
    mkdir -p "${PROJECT_ROOT}/docs/guides/deployment"
    mkdir -p "${PROJECT_ROOT}/docs/guides/development"
    mkdir -p "${PROJECT_ROOT}/docs/guides/testing"
    mkdir -p "${PROJECT_ROOT}/docs/guides/operations"
    
    mkdir -p "${PROJECT_ROOT}/docs/reports/audits"
    mkdir -p "${PROJECT_ROOT}/docs/reports/performance"
    mkdir -p "${PROJECT_ROOT}/docs/reports/security"
    
    mkdir -p "${PROJECT_ROOT}/docs/implementation/features"
    mkdir -p "${PROJECT_ROOT}/docs/implementation/integrations"
    mkdir -p "${PROJECT_ROOT}/docs/implementation/workflows"
    
    mkdir -p "${PROJECT_ROOT}/docs/status/phases"
    mkdir -p "${PROJECT_ROOT}/docs/status/milestones"
    mkdir -p "${PROJECT_ROOT}/docs/status/current"
    
    mkdir -p "${PROJECT_ROOT}/docs/archive/2025-10/fixes"
    mkdir -p "${PROJECT_ROOT}/docs/archive/2025-10/debug"
    mkdir -p "${PROJECT_ROOT}/docs/archive/2025-11/fixes"
    mkdir -p "${PROJECT_ROOT}/docs/archive/2025-11/debug"
    mkdir -p "${PROJECT_ROOT}/docs/archive/2025-11/phases"
    mkdir -p "${PROJECT_ROOT}/docs/archive/deprecated"
    
    # Scripts directories
    mkdir -p "${PROJECT_ROOT}/scripts/setup"
    mkdir -p "${PROJECT_ROOT}/scripts/deployment"
    mkdir -p "${PROJECT_ROOT}/scripts/database"
    mkdir -p "${PROJECT_ROOT}/scripts/testing"
    mkdir -p "${PROJECT_ROOT}/scripts/utilities"
    mkdir -p "${PROJECT_ROOT}/scripts/archive"
    
    print_success "Directory structure created"
}

# ============================================================================
# File Categorization and Movement
# ============================================================================

move_file() {
    local source="$1"
    local dest="$2"
    local reason="$3"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "[DRY RUN] Would move: $(basename "$source") → $dest"
        ((MOVED_COUNT++))
        return
    fi
    
    if [ -f "$source" ]; then
        # Create destination directory if needed
        mkdir -p "$(dirname "$dest")"
        
        # Move file
        if mv "$source" "$dest"; then
            print_success "Moved: $(basename "$source") → $(dirname "$dest")"
            ((MOVED_COUNT++))
        else
            print_error "Failed to move: $(basename "$source")"
            ((ERROR_COUNT++))
        fi
    fi
}

categorize_and_move_files() {
    print_header "Categorizing and Moving Files"
    
    cd "${PROJECT_ROOT}"
    
    # ========================================================================
    # Category 1: Keep at Root (Essential Files)
    # ========================================================================
    
    print_info "Processing: Essential files (keep at root)"
    
    # These stay at root
    KEEP_AT_ROOT=(
        "README.md"
        "LICENSE"
        "CONTRIBUTING.md"
        "DOCUMENTATION_INDEX.md"
        "PRE_DEPLOYMENT_CLEANUP_AUDIT.md"
    )
    
    for file in "${KEEP_AT_ROOT[@]}"; do
        if [ -f "$file" ]; then
            print_info "Keeping at root: $file"
            ((KEPT_COUNT++))
        fi
    done
    
    # ========================================================================
    # Category 2: Archive (Historical/Completed Work) - 300+ files
    # ========================================================================
    
    print_info "Processing: Historical/Completed work → archive"
    
    # Phase completions
    for file in PHASE_*_COMPLETE*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/phases/$(basename "$file")"
    done
    
    # All "COMPLETE" files
    for file in *_COMPLETE*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/phases/$(basename "$file")"
    done
    
    # All "FIX" and "FIXED" files
    for file in *_FIX*.md *_FIXED*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/fixes/$(basename "$file")"
    done
    
    # All "DEBUG" and "ANALYSIS" files
    for file in *_DEBUG*.md *_ANALYSIS*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/debug/$(basename "$file")"
    done
    
    # Status files
    for file in *_STATUS*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/status/$(basename "$file")"
    done
    
    # Summary files
    for file in *_SUMMARY*.md; do
        [ -f "$file" ] && move_file "$file" "docs/archive/2025-11/summaries/$(basename "$file")"
    done
    
    # ========================================================================
    # Category 3: Reports/Audits - 50+ files
    # ========================================================================
    
    print_info "Processing: Reports and audits"
    
    for file in *_AUDIT*.md *AUDIT*.md; do
        [ -f "$file" ] && move_file "$file" "docs/reports/audits/$(basename "$file")"
    done
    
    for file in *_REPORT*.md *REPORT*.md; do
        [ -f "$file" ] && move_file "$file" "docs/reports/audits/$(basename "$file")"
    done
    
    # ========================================================================
    # Category 4: Guides
    # ========================================================================
    
    print_info "Processing: Guides and documentation"
    
    # Deployment guides
    for file in *DEPLOY*.md *DEPLOYMENT*.md; do
        [ -f "$file" ] && move_file "$file" "docs/guides/deployment/$(basename "$file")"
    done
    
    # Setup guides
    for file in *SETUP*.md; do
        [ -f "$file" ] && move_file "$file" "docs/guides/development/$(basename "$file")"
    done
    
    # Testing guides
    for file in *TEST*.md *TESTING*.md; do
        [ -f "$file" ] && move_file "$file" "docs/guides/testing/$(basename "$file")"
    done
    
    # Monitoring guides
    for file in *MONITOR*.md; do
        [ -f "$file" ] && move_file "$file" "docs/guides/operations/$(basename "$file")"
    done
    
    # ========================================================================
    # Category 5: Implementation
    # ========================================================================
    
    print_info "Processing: Implementation details"
    
    for file in *IMPLEMENTATION*.md; do
        [ -f "$file" ] && move_file "$file" "docs/implementation/features/$(basename "$file")"
    done
    
    for file in *INTEGRATION*.md; do
        [ -f "$file" ] && move_file "$file" "docs/implementation/integrations/$(basename "$file")"
    done
    
    # ========================================================================
    # Category 6: Architecture
    # ========================================================================
    
    print_info "Processing: Architecture documents"
    
    for file in *ARCHITECTURE*.md; do
        [ -f "$file" ] && move_file "$file" "docs/architecture/current/$(basename "$file")"
    done
    
    # ========================================================================
    # Category 7: Everything Else → Archive
    # ========================================================================
    
    print_info "Processing: Remaining files → archive"
    
    for file in *.md; do
        # Skip if already processed or in keep list
        skip=false
        for keep in "${KEEP_AT_ROOT[@]}"; do
            if [ "$(basename "$file")" = "$keep" ]; then
                skip=true
                break
            fi
        done
        
        if [ "$skip" = false ] && [ -f "$file" ]; then
            move_file "$file" "docs/archive/2025-11/misc/$(basename "$file")"
        fi
    done
}

# ============================================================================
# Shell Scripts Organization
# ============================================================================

organize_shell_scripts() {
    print_header "Organizing Shell Scripts"
    
    cd "${PROJECT_ROOT}"
    
    # Deployment scripts
    for file in deploy-*.sh; do
        [ -f "$file" ] && move_file "$file" "scripts/deployment/$(basename "$file")"
    done
    
    # Database scripts
    mv scripts/deploy-rls.sh scripts/database/ 2>/dev/null || true
    mv scripts/verify-rls.sh scripts/database/ 2>/dev/null || true
    
    # Cleanup scripts
    for file in *CLEANUP*.sh cleanup*.sh; do
        [ -f "$file" ] && move_file "$file" "scripts/archive/$(basename "$file")"
    done
    
    # Setup scripts
    for file in setup*.sh; do
        [ -f "$file" ] && move_file "$file" "scripts/setup/$(basename "$file")"
    done
    
    # Create test user script
    for file in create-test-user.sh; do
        [ -f "$file" ] && move_file "$file" "scripts/database/$(basename "$file")"
    done
    
    print_success "Shell scripts organized"
}

# ============================================================================
# Create Navigation READMEs
# ============================================================================

create_navigation_readmes() {
    print_header "Creating Navigation READMEs"
    
    # Main docs README
    cat > "${PROJECT_ROOT}/docs/README.md" << 'EOF'
# VITAL Documentation

## Directory Structure

- **architecture/** - System architecture, ADRs, design documents
- **api/** - API documentation and specifications
- **guides/** - How-to guides (deployment, development, testing, operations)
- **reports/** - Audit reports, performance reports, security reports
- **implementation/** - Feature implementations and technical details
- **status/** - Project status, phase completions, milestones
- **archive/** - Historical documents and completed work

## Quick Links

- [Project Overview](../README.md)
- [Deployment Guide](./guides/deployment/)
- [Architecture Overview](./architecture/current/)
- [Latest Status](./status/current/)

## Contributing

When adding new documentation:
1. Place it in the appropriate directory
2. Update the relevant README
3. Link from DOCUMENTATION_INDEX.md if critical
EOF
    
    print_success "Navigation READMEs created"
}

# ============================================================================
# Verification
# ============================================================================

verify_cleanup() {
    print_header "Verification"
    
    cd "${PROJECT_ROOT}"
    
    local root_md_count=$(ls -1 *.md 2>/dev/null | wc -l)
    local root_sh_count=$(ls -1 *.sh 2>/dev/null | wc -l)
    
    print_info "Root markdown files remaining: ${root_md_count}"
    print_info "Root shell scripts remaining: ${root_sh_count}"
    
    if [ "$root_md_count" -le 10 ]; then
        print_success "Root directory cleaned successfully!"
    else
        print_warning "Root directory still has ${root_md_count} markdown files"
    fi
}

# ============================================================================
# Statistics Report
# ============================================================================

print_statistics() {
    print_header "Cleanup Statistics"
    
    echo ""
    echo "Files moved:  ${MOVED_COUNT}"
    echo "Files kept:   ${KEPT_COUNT}"
    echo "Errors:       ${ERROR_COUNT}"
    echo ""
    echo "Backup location: ${BACKUP_DIR}"
    echo ""
    
    if [ "${ERROR_COUNT}" -eq 0 ]; then
        print_success "Cleanup completed successfully!"
    else
        print_warning "Cleanup completed with ${ERROR_COUNT} errors"
    fi
}

# ============================================================================
# Rollback Function
# ============================================================================

rollback() {
    print_header "Rolling Back Changes"
    
    if [ ! -d "${BACKUP_DIR}" ]; then
        print_error "Backup directory not found: ${BACKUP_DIR}"
        exit 1
    fi
    
    cd "${PROJECT_ROOT}"
    
    # Restore all backed up files
    for file in "${BACKUP_DIR}"/*; do
        if [ -f "$file" ]; then
            cp "$file" "${PROJECT_ROOT}/"
            print_info "Restored: $(basename "$file")"
        fi
    done
    
    print_success "Rollback completed"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "VITAL Documentation Cleanup Script"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                print_warning "DRY RUN MODE - No files will be moved"
                shift
                ;;
            --rollback)
                rollback
                exit 0
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --dry-run     Simulate cleanup without moving files"
                echo "  --rollback    Restore from most recent backup"
                echo "  --help        Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Confirm before proceeding
    if [ "$DRY_RUN" = false ]; then
        echo ""
        print_warning "This will reorganize 400+ files in your repository."
        print_warning "A backup will be created at: ${BACKUP_DIR}"
        echo ""
        read -p "Continue? (type 'yes' to proceed): " confirm
        
        if [ "$confirm" != "yes" ]; then
            print_info "Cleanup cancelled"
            exit 0
        fi
    fi
    
    # Execute cleanup steps
    create_backup
    create_directory_structure
    categorize_and_move_files
    organize_shell_scripts
    create_navigation_readmes
    verify_cleanup
    print_statistics
    
    print_header "Cleanup Complete!"
    
    if [ "$DRY_RUN" = false ]; then
        echo ""
        print_info "Next steps:"
        echo "  1. Review the changes: git status"
        echo "  2. Test that deployment scripts still work"
        echo "  3. Update any broken links in code"
        echo "  4. Commit changes: git add . && git commit -m 'Organize documentation'"
        echo ""
        print_info "To rollback: $0 --rollback"
        echo ""
    fi
}

# Run main function
main "$@"

