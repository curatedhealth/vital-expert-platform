#!/bin/bash
#
# 3-Phase Migration Executor
# Runs the 3-phase database migration strategy for schema standardization
#
# Usage:
#   ./scripts/run-3-phase-migrations.sh [phase] [environment]
#
# Phases: 1, 2, 3, or 'all'
# Environments: local, staging, production
#
# Examples:
#   ./scripts/run-3-phase-migrations.sh 1 local        # Run Phase 1 only (local)
#   ./scripts/run-3-phase-migrations.sh 2 staging      # Run Phase 2 only (staging)
#   ./scripts/run-3-phase-migrations.sh all local      # Run all phases (local)
#

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/database/postgres/migrations"

# Parse arguments
PHASE="${1:-1}"
ENVIRONMENT="${2:-local}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VITAL 3-Phase Migration Executor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Phase: $PHASE"
echo "Environment: $ENVIRONMENT"
echo "Migrations Directory: $MIGRATIONS_DIR"
echo ""

# Get database URL based on environment
case "$ENVIRONMENT" in
  local)
    DATABASE_URL="${DATABASE_URL:-postgresql://localhost:54322/postgres}"
    ;;
  staging)
    if [ -z "$STAGING_DATABASE_URL" ]; then
      echo -e "${RED}ERROR: STAGING_DATABASE_URL not set${NC}"
      exit 1
    fi
    DATABASE_URL="$STAGING_DATABASE_URL"
    ;;
  production)
    if [ -z "$PRODUCTION_DATABASE_URL" ]; then
      echo -e "${RED}ERROR: PRODUCTION_DATABASE_URL not set${NC}"
      exit 1
    fi
    DATABASE_URL="$PRODUCTION_DATABASE_URL"

    # Extra confirmation for production
    echo -e "${YELLOW}WARNING: You are about to run migrations on PRODUCTION${NC}"
    echo -e "${YELLOW}Press CTRL+C to cancel, or ENTER to continue...${NC}"
    read
    ;;
  *)
    echo -e "${RED}ERROR: Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid environments: local, staging, production"
    exit 1
    ;;
esac

echo "Database URL: ${DATABASE_URL:0:30}..."
echo ""

# ============================================================================
# Function: Create Backup
# ============================================================================

create_backup() {
  local phase=$1
  local backup_file="vital_backup_phase${phase}_$(date +%Y%m%d_%H%M%S).sql"

  echo -e "${YELLOW}Creating database backup before Phase ${phase}...${NC}"

  if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" > "$backup_file"
    echo -e "${GREEN}✓ Backup created: $backup_file${NC}"
    echo -e "${YELLOW}IMPORTANT: Keep this backup until migration is verified${NC}"
  else
    echo -e "${YELLOW}⚠ pg_dump not found, skipping backup${NC}"
    echo -e "${YELLOW}  Please ensure you have a recent backup!${NC}"
  fi

  echo ""
}

# ============================================================================
# Function: Run Migration
# ============================================================================

run_migration() {
  local phase=$1
  local migration_file=""

  case "$phase" in
    1)
      migration_file="$MIGRATIONS_DIR/20251126_006_phase1_add_standardized_columns.sql"
      ;;
    2)
      migration_file="$MIGRATIONS_DIR/20251126_007_phase2_migrate_data_dual_write.sql"
      ;;
    3)
      migration_file="$MIGRATIONS_DIR/20251126_008_phase3_drop_old_columns.sql"
      ;;
    *)
      echo -e "${RED}ERROR: Invalid phase: $phase${NC}"
      exit 1
      ;;
  esac

  if [ ! -f "$migration_file" ]; then
    echo -e "${RED}ERROR: Migration file not found: $migration_file${NC}"
    exit 1
  fi

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Running Phase $phase Migration${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""

  # Create backup before running migration
  create_backup "$phase"

  # Run migration
  echo -e "${YELLOW}Executing migration: $migration_file${NC}"

  if psql "$DATABASE_URL" < "$migration_file"; then
    echo ""
    echo -e "${GREEN}✓ Phase $phase migration complete${NC}"
  else
    echo ""
    echo -e "${RED}✗ Phase $phase migration failed${NC}"
    echo -e "${YELLOW}Check the backup file for rollback${NC}"
    exit 1
  fi

  echo ""
}

# ============================================================================
# Function: Validate Phase
# ============================================================================

validate_phase() {
  local phase=$1

  echo -e "${YELLOW}Validating Phase $phase...${NC}"

  case "$phase" in
    1)
      # Verify new columns exist
      local agents_col=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'owner_organization_id')")
      local workflows_col=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'organization_id')")

      if [ "$agents_col" = "t" ] && [ "$workflows_col" = "t" ]; then
        echo -e "${GREEN}✓ Phase 1 validation passed${NC}"
      else
        echo -e "${RED}✗ Phase 1 validation failed${NC}"
        exit 1
      fi
      ;;

    2)
      # Verify RLS policies exist
      local agents_policy=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'agents_isolation')")
      local workflows_policy=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'workflows_isolation')")

      if [ "$agents_policy" = "t" ] && [ "$workflows_policy" = "t" ]; then
        echo -e "${GREEN}✓ Phase 2 validation passed${NC}"
      else
        echo -e "${RED}✗ Phase 2 validation failed${NC}"
        exit 1
      fi

      # Verify data consistency
      local inconsistencies=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM agents WHERE tenant_id IS NOT NULL AND owner_organization_id IS NOT NULL AND tenant_id != owner_organization_id")

      if [ "$inconsistencies" = "0" ]; then
        echo -e "${GREEN}✓ Data consistency verified (0 inconsistencies)${NC}"
      else
        echo -e "${RED}✗ Data inconsistencies detected: $inconsistencies rows${NC}"
        exit 1
      fi
      ;;

    3)
      # Verify old columns removed
      local agents_old_col=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'tenant_id')")
      local workflows_old_col=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflows' AND column_name = 'tenant_id')")

      if [ "$agents_old_col" = "f" ] && [ "$workflows_old_col" = "f" ]; then
        echo -e "${GREEN}✓ Phase 3 validation passed (old columns removed)${NC}"
      else
        echo -e "${RED}✗ Phase 3 validation failed (old columns still exist)${NC}"
        exit 1
      fi
      ;;
  esac

  echo ""
}

# ============================================================================
# Function: Display Next Steps
# ============================================================================

display_next_steps() {
  local phase=$1

  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Next Steps for Phase $phase${NC}"
  echo -e "${BLUE}========================================${NC}"

  case "$phase" in
    1)
      echo ""
      echo "Phase 1 Complete! ✓"
      echo ""
      echo "Next Steps:"
      echo "  1. Monitor application for 24-48 hours"
      echo "  2. Verify no errors in application logs"
      echo "  3. Verify triggers are syncing data correctly"
      echo "  4. Run: SELECT * FROM agents WHERE tenant_id != owner_organization_id"
      echo "  5. If stable, proceed to Phase 2:"
      echo "     ./scripts/run-3-phase-migrations.sh 2 $ENVIRONMENT"
      ;;

    2)
      echo ""
      echo "Phase 2 Complete! ✓"
      echo ""
      echo "Next Steps:"
      echo "  1. Deploy application code to read from new columns"
      echo "  2. Monitor for 48 hours"
      echo "  3. Run security test suite: pnpm test apps/vital-system/src/__tests__/security"
      echo "  4. Verify no cross-organization data leaks"
      echo "  5. After 1-2 weeks of stability, proceed to Phase 3:"
      echo "     ./scripts/run-3-phase-migrations.sh 3 $ENVIRONMENT"
      echo ""
      echo "IMPORTANT:"
      echo "  - Keep monitoring for any data inconsistencies"
      echo "  - Rollback available if issues detected"
      ;;

    3)
      echo ""
      echo "Phase 3 Complete! ✓"
      echo ""
      echo "Schema Migration Fully Complete!"
      echo ""
      echo "Next Steps:"
      echo "  1. Monitor application for 24-48 hours"
      echo "  2. Run full test suite"
      echo "  3. Verify performance is stable"
      echo "  4. Archive backup file (keep for 90 days)"
      echo "  5. Update documentation"
      echo ""
      echo "IMPORTANT:"
      echo "  - Phase 3 is IRREVERSIBLE without backup"
      echo "  - Keep backup file: vital_backup_phase3_*.sql"
      ;;
  esac

  echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

case "$PHASE" in
  1|2|3)
    run_migration "$PHASE"
    validate_phase "$PHASE"
    display_next_steps "$PHASE"
    ;;

  all)
    echo -e "${YELLOW}WARNING: Running all 3 phases sequentially${NC}"
    echo -e "${YELLOW}This should ONLY be done in local development${NC}"
    echo ""

    if [ "$ENVIRONMENT" != "local" ]; then
      echo -e "${RED}ERROR: 'all' phases can only be run in local environment${NC}"
      exit 1
    fi

    echo -e "${YELLOW}Press CTRL+C to cancel, or ENTER to continue...${NC}"
    read

    # Phase 1
    run_migration 1
    validate_phase 1

    # Phase 2
    run_migration 2
    validate_phase 2

    # Phase 3
    run_migration 3
    validate_phase 3

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}All 3 Phases Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Schema standardization fully complete in local environment"
    ;;

  *)
    echo -e "${RED}ERROR: Invalid phase: $PHASE${NC}"
    echo "Valid phases: 1, 2, 3, or 'all'"
    exit 1
    ;;
esac

echo -e "${GREEN}Migration execution complete!${NC}"
echo ""
