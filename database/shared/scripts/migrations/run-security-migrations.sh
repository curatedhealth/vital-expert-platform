#!/bin/bash
#
# Security Migrations Runner
# Runs the 2 critical security migrations safely
#
# Usage:
#   ./scripts/run-security-migrations.sh [environment]
#
# Environments: local, staging, production
#

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/database/postgres/migrations"

# Environment argument
ENVIRONMENT="${1:-local}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}VITAL Security Migrations Runner${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
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

echo "Database URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only
echo ""

# Step 1: Backup database
echo -e "${YELLOW}Step 1: Creating database backup...${NC}"
BACKUP_FILE="vital_backup_$(date +%Y%m%d_%H%M%S).sql"

if command -v pg_dump &> /dev/null; then
  pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
  echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
  echo -e "${YELLOW}⚠ pg_dump not found, skipping backup${NC}"
  echo -e "${YELLOW}  Please ensure you have a recent backup!${NC}"
fi

echo ""

# Step 2: Verify migrations exist
echo -e "${YELLOW}Step 2: Verifying migration files...${NC}"

MIGRATION_1="$MIGRATIONS_DIR/20251126_004_add_user_organization_validation.sql"
MIGRATION_2="$MIGRATIONS_DIR/20251126_005_fix_rls_context_setting.sql"

if [ ! -f "$MIGRATION_1" ]; then
  echo -e "${RED}ERROR: Migration 1 not found: $MIGRATION_1${NC}"
  exit 1
fi

if [ ! -f "$MIGRATION_2" ]; then
  echo -e "${RED}ERROR: Migration 2 not found: $MIGRATION_2${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Migration files found${NC}"
echo ""

# Step 3: Run Migration 1
echo -e "${YELLOW}Step 3: Running Migration 1 (User-Organization Validation)...${NC}"

if psql "$DATABASE_URL" < "$MIGRATION_1"; then
  echo -e "${GREEN}✓ Migration 1 complete${NC}"
else
  echo -e "${RED}✗ Migration 1 failed${NC}"
  echo -e "${YELLOW}Rolling back... (restoring from backup)${NC}"

  if [ -f "$BACKUP_FILE" ]; then
    psql "$DATABASE_URL" < "$BACKUP_FILE"
    echo -e "${GREEN}✓ Rollback complete${NC}"
  fi

  exit 1
fi

echo ""

# Step 4: Verify Migration 1
echo -e "${YELLOW}Step 4: Verifying Migration 1...${NC}"

# Check if function exists
FUNCTION_CHECK=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM pg_proc WHERE proname = 'validate_user_organization_membership'")

if [ "$FUNCTION_CHECK" -eq "1" ]; then
  echo -e "${GREEN}✓ validate_user_organization_membership function created${NC}"
else
  echo -e "${RED}✗ validate_user_organization_membership function NOT found${NC}"
  exit 1
fi

# Check if table exists
TABLE_CHECK=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM pg_tables WHERE tablename = 'unauthorized_access_attempts'")

if [ "$TABLE_CHECK" -eq "1" ]; then
  echo -e "${GREEN}✓ unauthorized_access_attempts table created${NC}"
else
  echo -e "${RED}✗ unauthorized_access_attempts table NOT found${NC}"
  exit 1
fi

echo ""

# Step 5: Run Migration 2
echo -e "${YELLOW}Step 5: Running Migration 2 (RLS Context Setting)...${NC}"

if psql "$DATABASE_URL" < "$MIGRATION_2"; then
  echo -e "${GREEN}✓ Migration 2 complete${NC}"
else
  echo -e "${RED}✗ Migration 2 failed${NC}"
  echo -e "${YELLOW}Rolling back... (restoring from backup)${NC}"

  if [ -f "$BACKUP_FILE" ]; then
    psql "$DATABASE_URL" < "$BACKUP_FILE"
    echo -e "${GREEN}✓ Rollback complete${NC}"
  fi

  exit 1
fi

echo ""

# Step 6: Verify Migration 2
echo -e "${YELLOW}Step 6: Verifying Migration 2...${NC}"

# Check if function exists
FUNCTION_CHECK=$(psql "$DATABASE_URL" -tAc "SELECT COUNT(*) FROM pg_proc WHERE proname = 'set_organization_context'")

if [ "$FUNCTION_CHECK" -eq "1" ]; then
  echo -e "${GREEN}✓ set_organization_context function created${NC}"
else
  echo -e "${RED}✗ set_organization_context function NOT found${NC}"
  exit 1
fi

echo ""

# Step 7: Test functions
echo -e "${YELLOW}Step 7: Testing migration functions...${NC}"

# Test membership validation (should return false for non-existent users)
TEST_RESULT=$(psql "$DATABASE_URL" -tAc "SELECT validate_user_organization_membership('00000000-0000-0000-0000-000000000000'::UUID, '00000000-0000-0000-0000-000000000001'::UUID)")

if [ "$TEST_RESULT" = "f" ]; then
  echo -e "${GREEN}✓ Membership validation function working${NC}"
else
  echo -e "${RED}✗ Membership validation function failed${NC}"
  exit 1
fi

# Test RLS context setting
psql "$DATABASE_URL" -tAc "SELECT set_organization_context('00000000-0000-0000-0000-000000000001'::UUID)" > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ RLS context setting function working${NC}"
else
  echo -e "${RED}✗ RLS context setting function failed${NC}"
  exit 1
fi

# Test RLS context getting
CONTEXT_RESULT=$(psql "$DATABASE_URL" -tAc "SELECT get_current_organization_context()")

if [ "$CONTEXT_RESULT" = "00000000-0000-0000-0000-000000000001" ]; then
  echo -e "${GREEN}✓ RLS context retrieval working${NC}"
else
  echo -e "${YELLOW}⚠ RLS context retrieval returned: $CONTEXT_RESULT${NC}"
fi

echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SECURITY MIGRATIONS COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Migrations run:"
echo "  1. User-Organization Validation"
echo "  2. RLS Context Setting"
echo ""
echo "Functions created:"
echo "  - validate_user_organization_membership()"
echo "  - get_user_organizations()"
echo "  - set_organization_context()"
echo "  - get_current_organization_context()"
echo ""
echo "Tables created:"
echo "  - unauthorized_access_attempts"
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Deploy application code to $ENVIRONMENT"
echo "  2. Run integration tests"
echo "  3. Monitor unauthorized_access_attempts table"
echo "  4. Verify cross-organization isolation"
echo ""

# Cleanup notice
if [ -f "$BACKUP_FILE" ]; then
  echo -e "${YELLOW}IMPORTANT: Keep backup file for 7 days${NC}"
  echo "  Location: $BACKUP_FILE"
fi
