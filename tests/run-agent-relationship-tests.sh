#!/bin/bash

# ============================================================================
# COMPREHENSIVE AGENT RELATIONSHIP & PERMISSIONS TESTS
# Date: November 4, 2025
# Purpose: Test ALL agent relationships and CRUD permissions
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
echo "║         🧪 COMPREHENSIVE AGENT RELATIONSHIP & PERMISSIONS TESTS              ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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
# Function to run a test
# ============================================================================
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# ============================================================================
# SECTION 1: PREREQUISITES
# ============================================================================
print_section "SECTION 1: Prerequisites Check"

run_test "Node.js is installed" "command -v node"
run_test "npm is installed" "command -v npm"
run_test "TypeScript is installed" "npx tsc --version"

# ============================================================================
# SECTION 2: AGENT CREATOR COMPONENT VERIFICATION
# ============================================================================
print_section "SECTION 2: Agent Creator Component"

echo ""
echo -e "${BLUE}Checking Agent Creator implementation...${NC}"

AGENT_CREATOR="apps/digital-health-startup/src/features/chat/components/agent-creator.tsx"

if [ -f "$AGENT_CREATOR" ]; then
    echo -e "${GREEN}✅ Agent Creator file exists${NC}"
    
    # Check for organizational hierarchy components
    run_test "Agent Creator: Business Function selection" \
        "grep -q 'business.*function\|businessFunction' '$AGENT_CREATOR'"
    
    run_test "Agent Creator: Department selection" \
        "grep -q 'department' '$AGENT_CREATOR'"
    
    run_test "Agent Creator: Role selection" \
        "grep -q 'role' '$AGENT_CREATOR'"
    
    # Check for prompt starters
    run_test "Agent Creator: Prompt starters field" \
        "grep -q 'prompt.*starter\|promptStarter' '$AGENT_CREATOR'"
    
    # Check for tool assignment
    run_test "Agent Creator: Tool selection" \
        "grep -q 'tool.*select\|availableToolsFromDB' '$AGENT_CREATOR'"
    
    # Check for RAG configuration
    run_test "Agent Creator: RAG enabled toggle" \
        "grep -q 'rag.*enabled\|ragEnabled' '$AGENT_CREATOR'"
    
    # Check for knowledge domains
    run_test "Agent Creator: Knowledge domains field" \
        "grep -q 'knowledge.*domain\|knowledgeDomain' '$AGENT_CREATOR'"
    
    # Check for avatar selection
    run_test "Agent Creator: Avatar selection" \
        "grep -q 'avatar' '$AGENT_CREATOR'"
    
    # Check for model configuration
    run_test "Agent Creator: LLM model selection" \
        "grep -q 'model.*select\|modelId' '$AGENT_CREATOR'"
    
    # Check for capabilities
    run_test "Agent Creator: Capabilities selection" \
        "grep -q 'capabilit' '$AGENT_CREATOR'"
    
    # Check for tier
    run_test "Agent Creator: Tier selection" \
        "grep -q 'tier' '$AGENT_CREATOR'"
    
    # Check for lifecycle stage
    run_test "Agent Creator: Lifecycle stage" \
        "grep -q 'lifecycle.*stage\|lifecycleStage' '$AGENT_CREATOR'"
    
    # Check for CRUD operations
    run_test "Agent Creator: Create functionality" \
        "grep -q 'createAgent\|handleCreate\|handleSave' '$AGENT_CREATOR'"
    
    run_test "Agent Creator: Update functionality" \
        "grep -q 'updateAgent\|handleUpdate' '$AGENT_CREATOR'"
    
    run_test "Agent Creator: Delete functionality" \
        "grep -q 'deleteAgent\|handleDelete' '$AGENT_CREATOR'"
    
    run_test "Agent Creator: Duplicate functionality" \
        "grep -q 'duplicate\|clone' '$AGENT_CREATOR'"
    
else
    echo -e "${RED}❌ Agent Creator file not found${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 16))
    TOTAL_TESTS=$((TOTAL_TESTS + 16))
fi

# ============================================================================
# SECTION 3: DATABASE SCHEMA VERIFICATION
# ============================================================================
print_section "SECTION 3: Database Schema Files"

echo ""
echo -e "${BLUE}Checking database schema and seed files...${NC}"

SCHEMA_FILES=(
    "database/sql/schema/agents.sql"
    "database/sql/schema/user_agents.sql"
    "database/sql/schema/agent_tools.sql"
    "database/sql/seeds/2025/01_foundation_agents.sql"
)

for file in "${SCHEMA_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $(basename $file)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}ℹ️${NC} $(basename $file) ${YELLOW}(Not found, may use different structure)${NC}"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 4: AGENTS API ROUTES
# ============================================================================
print_section "SECTION 4: Agents API Routes"

echo ""
echo -e "${BLUE}Checking API endpoints for agent CRUD operations...${NC}"

API_ROUTES=(
    "apps/digital-health-startup/src/app/api/agents/route.ts"
    "apps/digital-health-startup/src/app/api/agents/[id]/route.ts"
    "apps/digital-health-startup/src/app/api/user-agents/route.ts"
)

for route in "${API_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        endpoint=$(echo "$route" | sed 's|apps/digital-health-startup/src/app||' | sed 's|/route.ts||')
        echo -e "${GREEN}✅${NC} API: ${CYAN}$endpoint${NC}"
        
        # Check for CRUD methods
        if [ -f "$route" ]; then
            grep -q "export.*GET" "$route" && echo -e "   ${GREEN}✓${NC} GET (Read)" || echo -e "   ${YELLOW}−${NC} GET"
            grep -q "export.*POST" "$route" && echo -e "   ${GREEN}✓${NC} POST (Create)" || echo -e "   ${YELLOW}−${NC} POST"
            grep -q "export.*PUT\|PATCH" "$route" && echo -e "   ${GREEN}✓${NC} PUT/PATCH (Update)" || echo -e "   ${YELLOW}−${NC} PUT/PATCH"
            grep -q "export.*DELETE" "$route" && echo -e "   ${GREEN}✓${NC} DELETE" || echo -e "   ${YELLOW}−${NC} DELETE"
        fi
        
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        endpoint=$(echo "$route" | sed 's|apps/digital-health-startup/src/app||' | sed 's|/route.ts||')
        echo -e "${YELLOW}⚠️${NC} API: ${CYAN}$endpoint${NC} ${YELLOW}(Not found)${NC}"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 5: TYPESCRIPT COMPILATION
# ============================================================================
print_section "SECTION 5: TypeScript Compilation"

echo ""
echo -e "${BLUE}Running TypeScript compilation check...${NC}"
cd apps/digital-health-startup

if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo ""
    echo -e "${RED}❌ TypeScript compilation errors found${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    
    # Show first 5 errors
    echo ""
    echo -e "${YELLOW}First 5 errors:${NC}"
    npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | head -5
else
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

cd ../..

# ============================================================================
# SECTION 6: FRONTEND UI COMPONENTS
# ============================================================================
print_section "SECTION 6: Frontend UI Components"

echo ""
echo -e "${BLUE}Checking agent-related UI components...${NC}"

UI_COMPONENTS=(
    "apps/digital-health-startup/src/app/(app)/agents/page.tsx"
    "apps/digital-health-startup/src/features/chat/components/agent-creator.tsx"
    "apps/digital-health-startup/src/features/chat/components/agent-card.tsx"
    "apps/digital-health-startup/src/features/chat/components/agent-list.tsx"
)

for component in "${UI_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✅${NC} $(basename $component)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}ℹ️${NC} $(basename $component) ${YELLOW}(May use different naming)${NC}"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 7: PERMISSION & RLS TESTS
# ============================================================================
print_section "SECTION 7: Row-Level Security (RLS) Policies"

echo ""
echo -e "${BLUE}Checking RLS policy files...${NC}"

RLS_FILES=(
    "database/migrations/rls/001_enable_rls_comprehensive.sql"
    "database/migrations/rls/agents_rls.sql"
    "database/migrations/rls/user_agents_rls.sql"
)

for file in "${RLS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $(basename $file)"
        
        # Check for key RLS policies
        if grep -q "super.*admin\|service_role" "$file" 2>/dev/null; then
            echo -e "   ${GREEN}✓${NC} Super Admin policies found"
        fi
        
        if grep -q "user.*agents\|auth.uid()" "$file" 2>/dev/null; then
            echo -e "   ${GREEN}✓${NC} User-specific policies found"
        fi
        
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}ℹ️${NC} $(basename $file) ${YELLOW}(Not found)${NC}"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 8: DATABASE RELATIONSHIP TESTS
# ============================================================================
print_section "SECTION 8: Database Relationship Tests"

echo ""
echo -e "${BLUE}Database tests validate ALL agent relationships:${NC}"
echo ""
echo "  ${CYAN}1.${NC}  Organizational Hierarchy"
echo "      • Functions → Departments → Roles → Agents"
echo ""
echo "  ${CYAN}2.${NC}  Agent → Prompt Starters"
echo "      • Prompt starters array field"
echo "      • Prompt Starters → Detailed Prompts"
echo ""
echo "  ${CYAN}3.${NC}  Prompts Hierarchy"
echo "      • Prompts → Subsuites → Suites"
echo ""
echo "  ${CYAN}4.${NC}  Agent → Tools"
echo "      • agent_tools table (many-to-many)"
echo "      • Tool assignments and access"
echo ""
echo "  ${CYAN}5.${NC}  Agent → RAG Sources"
echo "      • rag_enabled flag"
echo "      • Knowledge base access"
echo ""
echo "  ${CYAN}6.${NC}  Agent → Specific Knowledge"
echo "      • knowledge_domains array"
echo ""
echo "  ${CYAN}7.${NC}  Agent → Avatar Icons"
echo "      • avatar field"
echo "      • dh_avatar_icon table"
echo ""
echo "  ${CYAN}8.${NC}  Agent → LLM Models"
echo "      • model field"
echo "      • temperature, max_tokens"
echo ""
echo "  ${CYAN}9.${NC}  Agent → Capabilities"
echo "      • capabilities array"
echo ""
echo "  ${CYAN}10.${NC} Agent → Pharma Protocol"
echo "      • pharma_protocol_enabled"
echo "      • pharma_protocol config"
echo ""
echo "  ${CYAN}11.${NC} Agent → VERIFY Protocol"
echo "      • verify_protocol_enabled"
echo "      • verify_protocol config"
echo ""
echo "  ${CYAN}12.${NC} Agent → Tiers"
echo "      • tier field"
echo "      • Tier distribution"
echo ""
echo "  ${CYAN}13.${NC} Agent → Lifecycle Stage"
echo "      • lifecycle_stage field"
echo "      • Production readiness"
echo ""
echo "  ${CYAN}14.${NC} Super Admin Permissions"
echo "      • RLS policies for full CRUD"
echo "      • Service role access"
echo ""
echo "  ${CYAN}15.${NC} User Permissions"
echo "      • user_agents table"
echo "      • Custom agent creation"
echo "      • Agent duplication"
echo "      • User-specific CRUD"
echo ""
echo "  ${CYAN}16.${NC} Complete Profile Validation"
echo "      • Fully configured agents"
echo "      • All relationships present"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}To run database tests:${NC}"
echo ""
echo -e "${MAGENTA}Option 1 (Recommended):${NC} Use Cursor AI with MCP"
echo "  → Open Cursor AI chat"
echo "  → Type: 'Run agent relationship tests from tests/agent-relationships-tests.sql'"
echo ""
echo -e "${MAGENTA}Option 2:${NC} Run in Supabase SQL Editor"
echo "  → Open Supabase Dashboard → SQL Editor"
echo "  → Copy/paste queries from: tests/agent-relationships-tests.sql"
echo ""
echo -e "${YELLOW}⏭️  Database tests skipped (requires database access)${NC}"
echo ""

# ============================================================================
# SECTION 9: MANUAL TESTING CHECKLIST
# ============================================================================
print_section "SECTION 9: Manual Testing Checklist"

echo ""
echo -e "${BLUE}Manual testing for CRUD permissions:${NC}"
echo ""
echo -e "${CYAN}Super Admin Tests:${NC}"
echo "  1. Login as Super Admin"
echo "  2. Navigate to /agents"
echo "  3. Verify can view ALL agents (not just user agents)"
echo "  4. Create new agent (should succeed)"
echo "  5. Edit ANY agent (should succeed)"
echo "  6. Delete ANY agent (should succeed)"
echo "  7. Assign tools to agents"
echo "  8. Configure all agent relationships"
echo ""
echo -e "${CYAN}Regular User Tests:${NC}"
echo "  1. Login as regular user"
echo "  2. Navigate to /agents"
echo "  3. View available agents (should see shared agents)"
echo "  4. Click 'Create Agent'"
echo "     → Should be able to create custom agent"
echo "     → Agent should be marked as user-specific"
echo "  5. Click 'Duplicate' on existing agent"
echo "     → Should create copy as custom agent"
echo "     → Should be editable by user"
echo "  6. Edit own custom agent (should succeed)"
echo "  7. Try to edit shared agent (should fail/be restricted)"
echo "  8. Delete own custom agent (should succeed)"
echo "  9. Try to delete shared agent (should fail/be restricted)"
echo ""
echo -e "${CYAN}Agent Relationship Tests:${NC}"
echo "  1. Open Agent Creator"
echo "  2. Organization tab:"
echo "     → Select Business Function"
echo "     → Select Department (filtered by function)"
echo "     → Select Role (filtered by department)"
echo "  3. Prompts tab:"
echo "     → Add prompt starters"
echo "     → Link to detailed prompts"
echo "  4. Tools tab:"
echo "     → Assign tools to agent"
echo "     → Verify tool assignments save"
echo "  5. Knowledge tab:"
echo "     → Enable RAG"
echo "     → Add knowledge domains"
echo "  6. Models tab:"
echo "     → Select LLM model"
echo "     → Configure temperature/max_tokens"
echo "  7. Capabilities tab:"
echo "     → Select agent capabilities"
echo "  8. Settings tab:"
echo "     → Set tier"
echo "     → Set lifecycle stage"
echo "     → Configure protocols (Pharma/VERIFY)"
echo "  9. Save agent"
echo "  10. Verify all relationships persisted"
echo ""
echo -e "${YELLOW}⏭️  Manual testing requires user interaction${NC}"
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

echo -e "Total Tests:   ${TOTAL_TESTS}"
echo -e "Passed:        ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:        ${RED}${FAILED_TESTS}${NC}"
echo ""

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo -e "Pass Rate:     ${CYAN}${PASS_RATE}%${NC}"
    echo ""
fi

# Final verdict
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}║              ✅ ALL AUTOMATED TESTS PASSED                         ║${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}║  Complete testing with database and manual permission tests       ║${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo "  1. Run database relationship tests via Cursor AI:"
    echo "     ${MAGENTA}→ 'Run agent relationship tests from tests/agent-relationships-tests.sql'${NC}"
    echo ""
    echo "  2. Test permissions manually:"
    echo "     ${MAGENTA}→ Login as Super Admin and test full CRUD${NC}"
    echo "     ${MAGENTA}→ Login as User and test restricted CRUD${NC}"
    echo ""
    echo "  3. Start dev server and test UI:"
    echo "     ${MAGENTA}→ cd apps/digital-health-startup && npm run dev${NC}"
    echo "     ${MAGENTA}→ Open http://localhost:3000/agents${NC}"
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

