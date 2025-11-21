#!/bin/bash
# ==================================================================================
# execute_all_ma_usecases.sh - Execute ALL Market Access Use Cases
# ==================================================================================
set -e  # Exit on error

# Configuration
DB_NAME="${DB_NAME:-your_database_name}"
DB_USER="${DB_USER:-your_username}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 MARKET ACCESS USE CASES - COMPLETE SEEDING 🚀        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo -e "${YELLOW}User: ${DB_USER}${NC}"
echo -e "${YELLOW}Host: ${DB_HOST}:${DB_PORT}${NC}"
echo ""

# Function to execute SQL file
execute_sql() {
    local file=$1
    local desc=$2
    echo -e "${BLUE}▶ Executing: ${file}${NC}"
    echo -e "  ${desc}"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Success${NC}"
    else
        echo -e "  ${RED}❌ Failed${NC}"
        echo -e "${RED}Error executing ${file}${NC}"
        exit 1
    fi
    echo ""
}

# UC_MA_001: Payer Value Dossier
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_001: Payer Value Dossier Development${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "16_ma_001_value_dossier_part1.sql" "Part 1: Workflows & Tasks (8 tasks)"
execute_sql "16_ma_001_value_dossier_part2.sql" "Part 2: Assignments"

# UC_MA_002: Health Economics Model
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_002: Health Economics Model (DTx)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "17_ma_002_health_economics_part1.sql" "Part 1: Workflows & Tasks (7 tasks)"
execute_sql "17_ma_002_health_economics_part2.sql" "Part 2: Assignments"

# UC_MA_003: CPT/HCPCS Code Strategy
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_003: CPT/HCPCS Code Strategy${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "18_ma_003_cpt_hcpcs_code_part1.sql" "Part 1: Workflows & Tasks (6 tasks)"
execute_sql "18_ma_003_cpt_hcpcs_code_part2.sql" "Part 2: Assignments"

# UC_MA_004: Formulary Positioning
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_004: Formulary Positioning Strategy${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "19_ma_004_formulary_positioning_part1.sql" "Part 1: Workflows & Tasks (5 tasks)"
execute_sql "19_ma_004_formulary_positioning_part2.sql" "Part 2: Assignments"

# UC_MA_005: P&T Presentation
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_005: P&T Committee Presentation${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "20_ma_005_pt_presentation_part1.sql" "Part 1: Workflows & Tasks (5 tasks)"
execute_sql "20_ma_005_pt_presentation_part2.sql" "Part 2: Assignments"

# UC_MA_006-010: Combined Files
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW} UC_MA_006-010: Batch Execution (5 use cases)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
execute_sql "21-25_ma_006-010_combined_part1.sql" "Part 1: All workflows & tasks for MA_006-010"
execute_sql "21-25_ma_006-010_combined_part2.sql" "Part 2: All assignments for MA_006-010"

# Verification
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ALL MARKET ACCESS USE CASES SEEDED SUCCESSFULLY! ✅  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Verification Query:${NC}"
echo ""

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
  uc.code, 
  uc.title,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
WHERE uc.code LIKE 'UC_MA_%'
GROUP BY uc.code, uc.title
ORDER BY uc.code;
"

echo ""
echo -e "${GREEN}🎉 Market Access Architecture Complete! 🎉${NC}"
echo -e "${BLUE}📁 Files Seeded: 14${NC}"
echo -e "${BLUE}📋 Use Cases: 10${NC}"
echo -e "${BLUE}⚙️  Workflows: 10${NC}"
echo -e "${BLUE}✅ Tasks: ~63${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test workflows via UI/API"
echo -e "  2. Verify agent execution"
echo -e "  3. Confirm human approvals"
echo -e "  4. Move to next domain (RA, PD, EG, etc.)"
echo ""

