#!/bin/bash
# =====================================================================================
# execute_remaining_cd_usecases.sh
# Execute all remaining Clinical Development use case seed files
# =====================================================================================

set -e  # Exit on error

echo "======================================================================="
echo "🚀 EXECUTING REMAINING CLINICAL DEVELOPMENT USE CASES"
echo "======================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection parameters (adjust as needed)
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-digital_health}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Function to execute a SQL file
execute_sql() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${BLUE}📄 Executing: ${filename}${NC}"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"; then
        echo -e "${GREEN}✅ Success: ${filename}${NC}"
        echo ""
    else
        echo -e "${RED}❌ Failed: ${filename}${NC}"
        echo "Error executing $filename. Stopping execution."
        exit 1
    fi
}

# Change to seeds directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $(pwd)"
echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# Confirm before proceeding
read -p "Continue with execution? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Execution cancelled."
    exit 0
fi

echo ""
echo "======================================================================="
echo "📦 UC_CD_005: PRO Instrument Selection"
echo "======================================================================="
execute_sql "2025/12_cd_005_pro_instrument_selection_part1.sql"
execute_sql "2025/12_cd_005_pro_instrument_selection_part2.sql"

echo ""
echo "======================================================================="
echo "📦 UC_CD_007: Sample Size Calculation"
echo "======================================================================="
execute_sql "2025/13_cd_007_sample_size_calculation_part1.sql"
execute_sql "2025/13_cd_007_sample_size_calculation_part2.sql"

echo ""
echo "======================================================================="
echo "📦 UC_CD_009: Subgroup Analysis Planning"
echo "======================================================================="
execute_sql "2025/14_cd_009_subgroup_analysis_planning_part1.sql"
execute_sql "2025/14_cd_009_subgroup_analysis_planning_part2.sql"

echo ""
echo "======================================================================="
echo "📦 UC_CD_010: Clinical Trial Protocol Development"
echo "======================================================================="
execute_sql "2025/15_cd_010_protocol_development_part1.sql"
execute_sql "2025/15_cd_010_protocol_development_part2.sql"

echo ""
echo "======================================================================="
echo "✅ ALL USE CASES EXECUTED SUCCESSFULLY!"
echo "======================================================================="
echo ""

# Verification query
echo "Running verification query..."
echo ""

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
SELECT 
  '🎉 Clinical Development Use Cases Summary' as report,
  '' as separator;

SELECT 
  uc.code,
  uc.title,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks,
  (SELECT COUNT(*) FROM dh_task_agent ta 
   INNER JOIN dh_task t2 ON t2.id = ta.task_id 
   INNER JOIN dh_workflow wf2 ON wf2.id = t2.workflow_id 
   WHERE wf2.use_case_id = uc.id) as agent_assignments,
  (SELECT COUNT(*) FROM dh_task_persona tp 
   INNER JOIN dh_task t3 ON t3.id = tp.task_id 
   INNER JOIN dh_workflow wf3 ON wf3.id = t3.workflow_id 
   WHERE wf3.use_case_id = uc.id) as persona_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code IN ('UC_CD_005', 'UC_CD_007', 'UC_CD_009', 'UC_CD_010')
GROUP BY uc.id, uc.code, uc.title
ORDER BY uc.code;

SELECT 
  '' as separator,
  '✅ Execution Complete - All use cases seeded successfully!' as status;
SQL

echo ""
echo "======================================================================="
echo "🎊 DONE! All Clinical Development use cases are now seeded."
echo "======================================================================="
echo ""
echo "Next steps:"
echo "  1. Review the verification output above"
echo "  2. Check CLINICAL_DEVELOPMENT_COMPLETE_FINAL.md for full documentation"
echo "  3. Start using the workflows in your application!"
echo ""

