#!/bin/bash
# =====================================================================================
# Execute All Regulatory Affairs (RA) Use Case Seeds
# =====================================================================================
# This script executes all RA use case seed files in the correct order
# Prerequisites: Foundation seeds must be executed first
# =====================================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database connection
DB_URL="${DATABASE_URL:-$(grep SUPABASE_DB_URL .env.local 2>/dev/null | cut -d= -f2)}"

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    echo "Set DATABASE_URL environment variable or add SUPABASE_DB_URL to .env.local"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Regulatory Affairs (RA) Seed Execution${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if foundation seeds exist
echo -e "${YELLOW}Checking prerequisites...${NC}"
FOUNDATION_CHECK=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM dh_agent WHERE code LIKE 'AGT-%'" 2>/dev/null || echo "0")

if [ "$FOUNDATION_CHECK" -lt 5 ]; then
    echo -e "${RED}❌ Error: Foundation seeds not found${NC}"
    echo "Please run foundation seed files first:"
    echo "  - 00_foundation_agents.sql"
    echo "  - 01_foundation_personas.sql"
    echo "  - 02_foundation_tools.sql"
    echo "  - 03_foundation_rag_sources.sql"
    echo "  - 05_foundation_prompts.sql"
    exit 1
fi

echo -e "${GREEN}✅ Foundation seeds found${NC}"
echo ""

# Change to seeds directory
cd "$(dirname "$0")"

# Array of RA seed files in order
RA_FILES=(
    "26_ra_001_samd_classification_part1.sql"
    "26_ra_001_samd_classification_part2.sql"
    "27_ra_002_pathway_determination_part1.sql"
    "27_ra_002_pathway_determination_part2.sql"
    "28_ra_003_predicate_identification_part1.sql"
    "28_ra_003_predicate_identification_part2.sql"
    "29_ra_004_presub_meeting_part1.sql"
    "29_ra_004_presub_meeting_part2.sql"
    "30_ra_005_clinical_evaluation_part1.sql"
    "30_ra_005_clinical_evaluation_part2.sql"
    "31_ra_006_breakthrough_designation_part1.sql"
    "31_ra_006_breakthrough_designation_part2.sql"
    "32_ra_007_international_harmonization_part1.sql"
    "32_ra_007_international_harmonization_part2.sql"
    "33_ra_008_cybersecurity_documentation_part1.sql"
    "33_ra_008_cybersecurity_documentation_part2.sql"
    "34_ra_009_software_validation_part1.sql"
    "34_ra_009_software_validation_part2.sql"
    "35_ra_010_post_market_surveillance_part1.sql"
    "35_ra_010_post_market_surveillance_part2.sql"
)

TOTAL_FILES=${#RA_FILES[@]}
SUCCESS_COUNT=0
FAILED_COUNT=0

echo -e "${BLUE}Starting RA seed execution (${TOTAL_FILES} files)...${NC}"
echo ""

# Execute each file
for i in "${!RA_FILES[@]}"; do
    FILE="${RA_FILES[$i]}"
    FILE_NUM=$((i + 1))
    
    echo -e "${YELLOW}[${FILE_NUM}/${TOTAL_FILES}]${NC} Executing: ${FILE}"
    
    if [ ! -f "$FILE" ]; then
        echo -e "${RED}  ❌ File not found: ${FILE}${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi
    
    # Execute with session_config wrapper
    if psql "$DB_URL" <<EOF
-- Create session_config for this execution
CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- Execute the seed file
\i $FILE
EOF
    then
        echo -e "${GREEN}  ✅ Success${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}  ❌ Failed${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        
        # Ask user if they want to continue
        read -p "Continue with remaining files? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Execution stopped by user${NC}"
            break
        fi
    fi
    
    echo ""
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Execution Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total files: ${TOTAL_FILES}"
echo -e "${GREEN}Successful: ${SUCCESS_COUNT}${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: ${FAILED_COUNT}${NC}"
fi
echo ""

# Verify seeding
echo -e "${YELLOW}Verifying RA use cases...${NC}"
psql "$DB_URL" <<'VERIFY'
SELECT 
    '✅ RA Use Cases Seeded' as status,
    COUNT(*) as total_use_cases,
    SUM(CASE WHEN code LIKE 'UC_RA_%' THEN 1 ELSE 0 END) as ra_use_cases
FROM dh_use_case
WHERE domain = 'RA';

SELECT 
    '📊 RA Workflows & Tasks' as status,
    COUNT(DISTINCT wf.id) as workflows,
    COUNT(DISTINCT t.id) as tasks
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.domain = 'RA';

SELECT 
    '🎯 RA Use Cases by Complexity' as status,
    complexity,
    COUNT(*) as count
FROM dh_use_case
WHERE domain = 'RA'
GROUP BY complexity
ORDER BY 
    CASE complexity
        WHEN 'INTERMEDIATE' THEN 1
        WHEN 'ADVANCED' THEN 2
        WHEN 'EXPERT' THEN 3
    END;
VERIFY

if [ $FAILED_COUNT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 All RA use cases seeded successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}⚠️  Some files failed to execute${NC}"
    echo -e "${YELLOW}========================================${NC}"
    exit 1
fi

