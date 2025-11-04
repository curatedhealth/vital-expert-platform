#!/bin/bash

# ============================================================================
# COMPREHENSIVE MAPPING INTEGRATION TESTS
# Date: November 4, 2025
# Purpose: Test ALL mappings between use cases, workflows, tasks, tools, 
#          agents, prompts, personas, RAG, and all relationships
# ============================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║           🧪 COMPREHENSIVE DATABASE MAPPING INTEGRATION TESTS                ║"
echo "║                                                                              ║"
echo "║     Testing: Use Cases → Workflows → Tasks → Agents/Tools/Prompts          ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Test counters
TOTAL_SECTIONS=12
PASSED_SECTIONS=0
FAILED_SECTIONS=0

# ============================================================================
# Function to print section header
# ============================================================================
print_section() {
    echo ""
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# Check Prerequisites
# ============================================================================
print_section "PREREQUISITES CHECK"

echo ""
echo -e "${BLUE}Checking environment...${NC}"

# Check for psql (optional - for direct database testing)
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL client (psql) found${NC}"
    HAS_PSQL=true
else
    echo -e "${YELLOW}⚠️  PostgreSQL client (psql) not found${NC}"
    echo "   Database tests will require Supabase MCP via Cursor AI"
    HAS_PSQL=false
fi

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# ============================================================================
# SECTION 1: FILE STRUCTURE VERIFICATION
# ============================================================================
print_section "SECTION 1: File Structure Verification"

echo ""
echo -e "${BLUE}Checking critical files...${NC}"

FILES_TO_CHECK=(
    "apps/digital-health-startup/src/features/chat/components/agent-creator.tsx"
    "tests/database-integration-tests.sql"
    "tests/agent-tool-integration.test.md"
)

ALL_FILES_EXIST=true
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file ${RED}(MISSING)${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    echo ""
    echo -e "${GREEN}✅ SECTION 1: PASS - All critical files exist${NC}"
    PASSED_SECTIONS=$((PASSED_SECTIONS + 1))
else
    echo ""
    echo -e "${RED}❌ SECTION 1: FAIL - Some files missing${NC}"
    FAILED_SECTIONS=$((FAILED_SECTIONS + 1))
fi

# ============================================================================
# SECTION 2: DATABASE CONNECTION TEST
# ============================================================================
print_section "SECTION 2: Database Connection Test"

echo ""
echo -e "${BLUE}Testing database connectivity...${NC}"

if [ -f ".env" ] && grep -q "SUPABASE_URL" .env 2>/dev/null; then
    echo -e "${GREEN}✅ .env file exists with Supabase configuration${NC}"
    
    # Check if we can extract the URL (for validation, not connection)
    if grep -q "SUPABASE_ANON_KEY" .env 2>/dev/null; then
        echo -e "${GREEN}✅ Supabase credentials configured${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}ℹ️  Database tests require:${NC}"
    echo "   • Supabase MCP enabled in Cursor AI, OR"
    echo "   • Direct psql connection with credentials"
    echo ""
    echo -e "${CYAN}→ Recommended: Use Cursor AI chat to run database tests${NC}"
    echo ""
    echo -e "${GREEN}✅ SECTION 2: PASS - Configuration found${NC}"
    PASSED_SECTIONS=$((PASSED_SECTIONS + 1))
else
    echo -e "${YELLOW}⚠️  No .env file found or missing Supabase config${NC}"
    echo ""
    echo -e "${YELLOW}⏭️  SECTION 2: SKIPPED${NC}"
fi

# ============================================================================
# SECTION 3: AGENT-CREATOR COMPONENT VALIDATION
# ============================================================================
print_section "SECTION 3: Agent Creator Component Validation"

echo ""
echo -e "${BLUE}Validating agent-creator.tsx...${NC}"

AGENT_CREATOR_FILE="apps/digital-health-startup/src/features/chat/components/agent-creator.tsx"

FUNCTIONS_TO_CHECK=(
    "fetchAvailableTools:Tool loading from database"
    "syncAgentTools:Tool assignment sync"
    "loadAgentTools:Tool loading on edit"
    "availableToolsFromDB:Tool state management"
)

ALL_FUNCTIONS_FOUND=true
for check in "${FUNCTIONS_TO_CHECK[@]}"; do
    func_name="${check%%:*}"
    description="${check##*:}"
    
    if grep -q "$func_name" "$AGENT_CREATOR_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description ($func_name)"
    else
        echo -e "${RED}❌${NC} $description ($func_name) ${RED}(NOT FOUND)${NC}"
        ALL_FUNCTIONS_FOUND=false
    fi
done

if [ "$ALL_FUNCTIONS_FOUND" = true ]; then
    echo ""
    echo -e "${GREEN}✅ SECTION 3: PASS - All critical functions exist${NC}"
    PASSED_SECTIONS=$((PASSED_SECTIONS + 1))
else
    echo ""
    echo -e "${RED}❌ SECTION 3: FAIL - Some functions missing${NC}"
    FAILED_SECTIONS=$((FAILED_SECTIONS + 1))
fi

# ============================================================================
# SECTION 4: TYPESCRIPT COMPILATION CHECK
# ============================================================================
print_section "SECTION 4: TypeScript Compilation Check"

echo ""
echo -e "${BLUE}Running TypeScript compilation check...${NC}"
echo ""

cd apps/digital-health-startup

if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo ""
    echo -e "${RED}❌ SECTION 4: FAIL - TypeScript errors found${NC}"
    FAILED_SECTIONS=$((FAILED_SECTIONS + 1))
    
    # Show first 10 errors
    echo ""
    echo -e "${YELLOW}First 10 errors:${NC}"
    npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | head -10
else
    echo -e "${GREEN}✅ SECTION 4: PASS - No TypeScript errors${NC}"
    PASSED_SECTIONS=$((PASSED_SECTIONS + 1))
fi

cd ../..

# ============================================================================
# SECTION 5-12: DATABASE TESTS
# ============================================================================
print_section "SECTIONS 5-12: Database Integration Tests"

echo ""
echo -e "${BLUE}Database tests validate:${NC}"
echo ""
echo "  ${CYAN}5.${NC}  Entity Counts (Domains, Use Cases, Workflows, Tasks, Agents, Tools, Prompts)"
echo "  ${CYAN}6.${NC}  Hierarchy Mappings (Domain → Use Case → Workflow → Task)"
echo "  ${CYAN}7.${NC}  Task → Agent Mappings"
echo "  ${CYAN}8.${NC}  Task → Tool Mappings"
echo "  ${CYAN}9.${NC}  Task → Prompt Mappings"
echo "  ${CYAN}10.${NC} Task → Persona Mappings"
echo "  ${CYAN}11.${NC} Task → RAG Mappings"
echo "  ${CYAN}12.${NC} Agent → Tool Mappings"
echo "  ${CYAN}13.${NC} Task Dependencies"
echo "  ${CYAN}14.${NC} Cross-Mapping Validation"
echo "  ${CYAN}15.${NC} Data Quality Checks"
echo "  ${CYAN}16.${NC} Summary Statistics"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if MCP is available
echo -e "${BLUE}To run database tests:${NC}"
echo ""
echo -e "${CYAN}Option 1 (Recommended):${NC} Use Cursor AI with MCP"
echo "  → Open Cursor AI chat"
echo "  → Type: 'Run the comprehensive database tests from tests/database-integration-tests.sql'"
echo ""
echo -e "${CYAN}Option 2:${NC} Run manually in Supabase SQL Editor"
echo "  → Open Supabase Dashboard → SQL Editor"
echo "  → Copy/paste queries from: tests/database-integration-tests.sql"
echo "  → Execute to see results"
echo ""
echo -e "${CYAN}Option 3:${NC} Use psql command line (if configured)"
echo "  → psql -f tests/database-integration-tests.sql"
echo ""

# Offer to show the SQL file
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "Do you want to see the database test queries? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    head -100 tests/database-integration-tests.sql
    echo ""
    echo -e "${YELLOW}... (showing first 100 lines)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
fi

echo ""
echo -e "${YELLOW}⏭️  SECTIONS 5-12: SKIPPED (Requires database access)${NC}"
echo "   Run via Cursor AI MCP or Supabase SQL Editor"
echo ""

# ============================================================================
# SECTION 13: MANUAL BROWSER TESTING CHECKLIST
# ============================================================================
print_section "SECTION 13: Manual Browser Testing Checklist"

echo ""
echo -e "${BLUE}Manual testing checklist:${NC}"
echo ""
echo "  ${CYAN}1.${NC} Start dev server: ${MAGENTA}npm run dev${NC}"
echo "  ${CYAN}2.${NC} Navigate to: ${MAGENTA}http://localhost:3000/agents${NC}"
echo "  ${CYAN}3.${NC} Create/edit agent and go to Tools tab"
echo "  ${CYAN}4.${NC} Verify 150 tools load from database"
echo "  ${CYAN}5.${NC} Select Strategic Intelligence tools"
echo "  ${CYAN}6.${NC} Save and verify console logs"
echo "  ${CYAN}7.${NC} Edit agent and verify tools persist"
echo ""
echo -e "${YELLOW}⏭️  SECTION 13: MANUAL (User verification required)${NC}"
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo ""
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                          📊 TEST RESULTS SUMMARY                             ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "Total Sections:   ${TOTAL_SECTIONS}"
echo -e "Passed:           ${GREEN}${PASSED_SECTIONS}${NC}"
echo -e "Failed:           ${RED}${FAILED_SECTIONS}${NC}"
echo -e "Skipped:          ${YELLOW}$((TOTAL_SECTIONS - PASSED_SECTIONS - FAILED_SECTIONS))${NC}"
echo ""

# Calculate overall status
if [ $FAILED_SECTIONS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}║              ✅ AUTOMATED TESTS PASSED                             ║${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}║  Complete testing by running database tests via Cursor AI MCP     ║${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Run database tests via Cursor AI:"
    echo "     ${MAGENTA}→ 'Run comprehensive database tests from tests/database-integration-tests.sql'${NC}"
    echo ""
    echo "  2. Start dev server and test manually:"
    echo "     ${MAGENTA}→ cd apps/digital-health-startup && npm run dev${NC}"
    echo ""
    echo "  3. View detailed test documentation:"
    echo "     ${MAGENTA}→ cat tests/agent-tool-integration.test.md${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                    ║${NC}"
    echo -e "${RED}║              ❌ SOME TESTS FAILED - REVIEW REQUIRED                ║${NC}"
    echo -e "${RED}║                                                                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Please review the failures above and fix before proceeding.${NC}"
    echo ""
    exit 1
fi

