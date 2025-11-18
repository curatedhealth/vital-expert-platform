#!/bin/bash
# =============================================================================
# Import All JTBDs - Automated Script
# =============================================================================
# This script imports all 237 JTBDs (127 Phase 2 + 110 Digital Health)
# with comprehensive error handling and progress reporting
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database credentials
DB_PASSWORD='flusd9fqEb4kkTJ1'
DB_HOST='db.bomltkhixeatxuoxmolq.supabase.co'
DB_PORT='5432'
DB_NAME='postgres'
DB_USER='postgres'
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# SQL files
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SQL_DIR="${PROJECT_ROOT}/database/sql/seeds/2025"

PHASE2_SQL="${SQL_DIR}/21_phase2_jtbds.sql"
DH_SQL="${SQL_DIR}/22_digital_health_jtbds.sql"

echo ""
echo -e "${BLUE}===============================================================================${NC}"
echo -e "${BLUE}                    JTBD IMPORT - AUTOMATED EXECUTION${NC}"
echo -e "${BLUE}===============================================================================${NC}"
echo ""

# Function to check database connection
check_connection() {
    echo -e "${YELLOW}🔌 Checking database connection...${NC}"
    if PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        return 1
    fi
}

# Function to check if file exists
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $(basename $file)${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        return 1
    fi
}

# Function to get current JTBD count
get_jtbd_count() {
    PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -t -c \
        "SELECT COUNT(*) FROM jobs_to_be_done WHERE deleted_at IS NULL;" 2>/dev/null | xargs || echo "0"
}

# Function to import SQL file
import_sql() {
    local file=$1
    local name=$2

    echo ""
    echo -e "${BLUE}📥 Importing: ${name}${NC}"
    echo -e "${YELLOW}   File: $(basename $file)${NC}"

    if PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" \
        -c "\set ON_ERROR_STOP on" \
        -f "$file" 2>&1; then
        echo -e "${GREEN}✅ Successfully imported: ${name}${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to import: ${name}${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}📋 Pre-flight checks...${NC}"
    echo ""

    # Check database connection
    if ! check_connection; then
        echo -e "${RED}❌ Cannot proceed without database connection${NC}"
        exit 1
    fi
    echo ""

    # Check SQL files exist
    echo -e "${YELLOW}📁 Checking SQL files...${NC}"
    check_file "$PHASE2_SQL" || exit 1
    check_file "$DH_SQL" || exit 1
    echo ""

    # Get initial count
    BEFORE_COUNT=$(get_jtbd_count)
    echo -e "${BLUE}📊 Current JTBD count: ${BEFORE_COUNT}${NC}"
    echo ""

    # Confirm before proceeding
    echo -e "${YELLOW}⚠️  Ready to import 237 JTBDs (127 Phase 2 + 110 Digital Health)${NC}"
    echo -e "${YELLOW}   This operation is idempotent (safe to run multiple times)${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Import cancelled${NC}"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}===============================================================================${NC}"
    echo -e "${BLUE}                        STARTING IMPORT${NC}"
    echo -e "${BLUE}===============================================================================${NC}"

    # Import Phase 2 JTBDs
    if ! import_sql "$PHASE2_SQL" "Phase 2 All JTBDs (127 JTBDs)"; then
        echo -e "${RED}❌ Import failed. Check errors above.${NC}"
        exit 1
    fi

    # Import Digital Health JTBDs
    if ! import_sql "$DH_SQL" "Digital Health JTBDs (110 JTBDs)"; then
        echo -e "${RED}❌ Import failed. Check errors above.${NC}"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}===============================================================================${NC}"
    echo -e "${BLUE}                        IMPORT COMPLETE${NC}"
    echo -e "${BLUE}===============================================================================${NC}"
    echo ""

    # Get final count
    AFTER_COUNT=$(get_jtbd_count)
    IMPORTED=$((AFTER_COUNT - BEFORE_COUNT))

    echo -e "${GREEN}✅ Import successful!${NC}"
    echo ""
    echo -e "${BLUE}📊 Statistics:${NC}"
    echo -e "   Before: ${BEFORE_COUNT} JTBDs"
    echo -e "   After:  ${AFTER_COUNT} JTBDs"
    echo -e "   ${GREEN}Imported: ${IMPORTED} JTBDs${NC}"
    echo ""

    # Display breakdown
    echo -e "${BLUE}📊 Functional Area Breakdown:${NC}"
    PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -c \
        "SELECT functional_area, COUNT(*) as count FROM jobs_to_be_done WHERE deleted_at IS NULL GROUP BY functional_area ORDER BY count DESC;"

    echo ""
    echo -e "${BLUE}📊 Complexity Distribution:${NC}"
    PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -c \
        "SELECT complexity, COUNT(*) as count FROM jobs_to_be_done WHERE deleted_at IS NULL GROUP BY complexity ORDER BY CASE complexity WHEN 'very_high' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END;"

    echo ""
    echo -e "${GREEN}✅ All imports completed successfully!${NC}"
    echo ""
}

# Run main function
main "$@"
