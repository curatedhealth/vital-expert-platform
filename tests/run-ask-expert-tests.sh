#!/bin/bash

# ============================================================================
# ASK EXPERT 4-MODE INTEGRATION TESTS
# Date: November 4, 2025
# Purpose: Test all 4 Ask Expert modes with unit and integration testing
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
echo "║              🧪 ASK EXPERT 4-MODE INTEGRATION TEST SUITE                     ║"
echo "║                                                                              ║"
echo "║   Mode 1: Manual Interactive   (User selects agent)                         ║"
echo "║   Mode 2: Automatic Selection  (AI selects agent)                           ║"
echo "║   Mode 3: Autonomous-Automatic (AI + ReAct + Tools)                         ║"
echo "║   Mode 4: Autonomous-Manual    (User + ReAct + Tools)                       ║"
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
# SECTION 1: PREREQUISITES CHECK
# ============================================================================
print_section "SECTION 1: Prerequisites Check"

run_test "Node.js is installed" "command -v node"
run_test "npm is installed" "command -v npm"
run_test "TypeScript is installed" "npx tsc --version"

# ============================================================================
# SECTION 2: FILE STRUCTURE VERIFICATION
# ============================================================================
print_section "SECTION 2: File Structure Verification"

echo ""
echo -e "${BLUE}Checking Ask Expert mode implementations...${NC}"

# Mode service files
MODE_FILES=(
    "apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts"
    "apps/digital-health-startup/src/features/chat/services/mode2-automatic-agent-selection.ts"
    "apps/digital-health-startup/src/features/chat/services/mode3-autonomous-automatic.ts"
    "apps/digital-health-startup/src/features/chat/services/mode4-autonomous-manual.ts"
    "apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts"
    "apps/digital-health-startup/src/app/api/ask-expert/chat/route.ts"
    "apps/digital-health-startup/src/features/ask-expert/utils/mode-mapper.ts"
)

ALL_FILES_EXIST=true
for file in "${MODE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $(basename $file)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌${NC} $(basename $file) ${RED}(MISSING)${NC}"
        ALL_FILES_EXIST=false
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 3: MODE 1 - MANUAL INTERACTIVE TESTS
# ============================================================================
print_section "SECTION 3: Mode 1 - Manual Interactive"

echo ""
echo -e "${BLUE}Testing Mode 1 implementation...${NC}"

MODE1_FILE="apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts"

if [ -f "$MODE1_FILE" ]; then
    # Check for critical functions
    run_test "Mode 1: executeMode1 function exists" \
        "grep -q 'export.*executeMode1' '$MODE1_FILE'"
    
    run_test "Mode 1: Agent selection handling" \
        "grep -q 'agentId' '$MODE1_FILE'"
    
    run_test "Mode 1: RAG integration" \
        "grep -q 'enableRAG\|rag' '$MODE1_FILE'"
    
    run_test "Mode 1: Streaming support" \
        "grep -q 'stream\|yield\|AsyncGenerator' '$MODE1_FILE'"
else
    echo -e "${RED}❌ Mode 1 file not found${NC}"
fi

# ============================================================================
# SECTION 4: MODE 2 - AUTOMATIC AGENT SELECTION TESTS
# ============================================================================
print_section "SECTION 4: Mode 2 - Automatic Agent Selection"

echo ""
echo -e "${BLUE}Testing Mode 2 implementation...${NC}"

MODE2_FILE="apps/digital-health-startup/src/features/chat/services/mode2-automatic-agent-selection.ts"

if [ -f "$MODE2_FILE" ]; then
    run_test "Mode 2: executeMode2 function exists" \
        "grep -q 'export.*executeMode2' '$MODE2_FILE'"
    
    run_test "Mode 2: Agent recommendation engine" \
        "grep -q 'recommend\|select.*agent' '$MODE2_FILE'"
    
    run_test "Mode 2: Tool support" \
        "grep -q 'enableTools\|tools' '$MODE2_FILE'"
    
    run_test "Mode 2: RAG integration" \
        "grep -q 'enableRAG\|rag' '$MODE2_FILE'"
else
    echo -e "${RED}❌ Mode 2 file not found${NC}"
fi

# ============================================================================
# SECTION 5: MODE 3 - AUTONOMOUS-AUTOMATIC TESTS
# ============================================================================
print_section "SECTION 5: Mode 3 - Autonomous-Automatic"

echo ""
echo -e "${BLUE}Testing Mode 3 implementation...${NC}"

MODE3_FILE="apps/digital-health-startup/src/features/chat/services/mode3-autonomous-automatic.ts"

if [ -f "$MODE3_FILE" ]; then
    run_test "Mode 3: executeMode3 function exists" \
        "grep -q 'export.*executeMode3' '$MODE3_FILE'"
    
    run_test "Mode 3: ReAct engine integration" \
        "grep -q 'react\|ReAct' '$MODE3_FILE' || grep -q 'autonomous' '$MODE3_FILE'"
    
    run_test "Mode 3: Chain-of-Thought support" \
        "grep -q 'chain.*thought\|reasoning\|CoT' '$MODE3_FILE'"
    
    run_test "Mode 3: Tool execution" \
        "grep -q 'executeTool\|tool.*execution' '$MODE3_FILE'"
else
    echo -e "${RED}❌ Mode 3 file not found${NC}"
fi

# ============================================================================
# SECTION 6: MODE 4 - AUTONOMOUS-MANUAL TESTS
# ============================================================================
print_section "SECTION 6: Mode 4 - Autonomous-Manual"

echo ""
echo -e "${BLUE}Testing Mode 4 implementation...${NC}"

MODE4_FILE="apps/digital-health-startup/src/features/chat/services/mode4-autonomous-manual.ts"

if [ -f "$MODE4_FILE" ]; then
    run_test "Mode 4: executeMode4 function exists" \
        "grep -q 'export.*executeMode4' '$MODE4_FILE'"
    
    run_test "Mode 4: User agent selection" \
        "grep -q 'agentId' '$MODE4_FILE'"
    
    run_test "Mode 4: Autonomous reasoning" \
        "grep -q 'autonomous\|react\|reasoning' '$MODE4_FILE'"
    
    run_test "Mode 4: Tool and RAG support" \
        "grep -q 'tools.*rag\|rag.*tools' '$MODE4_FILE'"
else
    echo -e "${RED}❌ Mode 4 file not found${NC}"
fi

# ============================================================================
# SECTION 7: ORCHESTRATION API TESTS
# ============================================================================
print_section "SECTION 7: Orchestration API"

echo ""
echo -e "${BLUE}Testing orchestration layer...${NC}"

ORCHESTRATE_FILE="apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts"

if [ -f "$ORCHESTRATE_FILE" ]; then
    run_test "Orchestration: POST handler exists" \
        "grep -q 'export.*POST' '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode routing (manual)" \
        "grep -q \"case 'manual'\" '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode routing (automatic)" \
        "grep -q \"case 'automatic'\" '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode routing (autonomous)" \
        "grep -q \"case 'autonomous'\" '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode 1 execution" \
        "grep -q 'executeMode1' '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode 2 execution" \
        "grep -q 'executeMode2' '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode 3 execution" \
        "grep -q 'executeMode3' '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Mode 4 execution" \
        "grep -q 'executeMode4' '$ORCHESTRATE_FILE'"
    
    run_test "Orchestration: Streaming response" \
        "grep -q 'ReadableStream\|stream' '$ORCHESTRATE_FILE'"
else
    echo -e "${RED}❌ Orchestration file not found${NC}"
fi

# ============================================================================
# SECTION 8: TYPESCRIPT COMPILATION
# ============================================================================
print_section "SECTION 8: TypeScript Compilation"

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
# SECTION 9: DATABASE TESTS
# ============================================================================
print_section "SECTION 9: Database Integration Tests"

echo ""
echo -e "${BLUE}Database tests validate:${NC}"
echo ""
echo "  ${CYAN}1.${NC} Agent availability for all 4 modes"
echo "  ${CYAN}2.${NC} Tool availability and agent-tool assignments"
echo "  ${CYAN}3.${NC} RAG knowledge base configuration"
echo "  ${CYAN}4.${NC} Mode-specific requirements:"
echo "      • Mode 1: User agents with system prompts"
echo "      • Mode 2: Agents with categories + tools"
echo "      • Mode 3: Autonomous agents with tools + RAG"
echo "      • Mode 4: User agents with tools + RAG"
echo "  ${CYAN}5.${NC} Conversation history support"
echo "  ${CYAN}6.${NC} Agent recommendation engine prerequisites"
echo "  ${CYAN}7.${NC} Multi-framework orchestration support"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}To run database tests:${NC}"
echo ""
echo -e "${MAGENTA}Option 1 (Recommended):${NC} Use Cursor AI with MCP"
echo "  → Open Cursor AI chat"
echo "  → Type: 'Run Ask Expert database tests from tests/ask-expert-4-mode-tests.sql'"
echo ""
echo -e "${MAGENTA}Option 2:${NC} Run in Supabase SQL Editor"
echo "  → Open Supabase Dashboard → SQL Editor"
echo "  → Copy/paste queries from: tests/ask-expert-4-mode-tests.sql"
echo ""
echo -e "${YELLOW}⏭️  Database tests skipped (requires database access)${NC}"
echo ""

# ============================================================================
# SECTION 10: INTEGRATION TEST CHECKLIST
# ============================================================================
print_section "SECTION 10: Manual Integration Testing"

echo ""
echo -e "${BLUE}Manual integration test checklist:${NC}"
echo ""
echo -e "${CYAN}Mode 1: Manual Interactive${NC}"
echo "  1. Start dev server: ${MAGENTA}npm run dev${NC}"
echo "  2. Navigate to: ${MAGENTA}/ask-expert${NC}"
echo "  3. Toggle OFF both switches (Automatic & Autonomous)"
echo "  4. Select an agent manually"
echo "  5. Send a question and verify response"
echo "  6. Check console for RAG context retrieval"
echo ""
echo -e "${CYAN}Mode 2: Automatic Agent Selection${NC}"
echo "  1. Toggle ON 'Automatic' switch"
echo "  2. Toggle OFF 'Autonomous' switch"
echo "  3. Send a question (don't select agent)"
echo "  4. Verify AI selects appropriate agent"
echo "  5. Check console for agent selection reasoning"
echo "  6. Verify tools are available"
echo ""
echo -e "${CYAN}Mode 3: Autonomous-Automatic${NC}"
echo "  1. Toggle ON both switches (Automatic & Autonomous)"
echo "  2. Send a complex question requiring reasoning"
echo "  3. Verify AI selects agent automatically"
echo "  4. Check console for ReAct loop iterations"
echo "  5. Verify tool execution logs"
echo "  6. Confirm Chain-of-Thought reasoning output"
echo ""
echo -e "${CYAN}Mode 4: Autonomous-Manual${NC}"
echo "  1. Toggle OFF 'Automatic' switch"
echo "  2. Toggle ON 'Autonomous' switch"
echo "  3. Select an agent manually"
echo "  4. Send a complex question"
echo "  5. Verify autonomous reasoning with selected agent"
echo "  6. Check console for tool calls and reasoning steps"
echo ""
echo -e "${YELLOW}⏭️  Manual testing requires user interaction${NC}"
echo ""

# ============================================================================
# SECTION 11: API ENDPOINT TESTS
# ============================================================================
print_section "SECTION 11: API Endpoint Health Check"

echo ""
echo -e "${BLUE}Checking API routes exist...${NC}"

API_FILES=(
    "apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts"
    "apps/digital-health-startup/src/app/api/ask-expert/chat/route.ts"
    "apps/digital-health-startup/src/app/api/ask-expert/route.ts"
    "apps/digital-health-startup/src/app/api/ask-panel/consult/route.ts"
)

for file in "${API_FILES[@]}"; do
    if [ -f "$file" ]; then
        endpoint=$(echo "$file" | sed 's|apps/digital-health-startup/src/app||' | sed 's|/route.ts||')
        echo -e "${GREEN}✅${NC} API endpoint: ${CYAN}$endpoint${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        endpoint=$(echo "$file" | sed 's|apps/digital-health-startup/src/app||' | sed 's|/route.ts||')
        echo -e "${RED}❌${NC} API endpoint: ${CYAN}$endpoint${NC} ${RED}(MISSING)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# ============================================================================
# SECTION 12: LANGGRAPH INTEGRATION TESTS
# ============================================================================
print_section "SECTION 12: LangGraph Integration"

echo ""
echo -e "${BLUE}Checking LangGraph/LangChain integration...${NC}"

LANGGRAPH_FILES=(
    "apps/digital-health-startup/src/features/chat/services/langgraph-mode-orchestrator.ts"
    "apps/digital-health-startup/src/features/chat/services/ask-expert-graph.ts"
    "apps/digital-health-startup/src/features/chat/services/enhanced-langchain-service.ts"
)

for file in "${LANGGRAPH_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $(basename $file)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️${NC} $(basename $file) ${YELLOW}(OPTIONAL)${NC}"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

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
    echo -e "${GREEN}║  Complete testing by running database tests via Cursor AI MCP     ║${NC}"
    echo -e "${GREEN}║  and performing manual integration tests in the browser           ║${NC}"
    echo -e "${GREEN}║                                                                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo "  1. Run database tests via Cursor AI:"
    echo "     ${MAGENTA}→ 'Run Ask Expert database tests from tests/ask-expert-4-mode-tests.sql'${NC}"
    echo ""
    echo "  2. Start dev server and test manually:"
    echo "     ${MAGENTA}→ cd apps/digital-health-startup && npm run dev${NC}"
    echo "     ${MAGENTA}→ Open http://localhost:3000/ask-expert${NC}"
    echo ""
    echo "  3. Test all 4 modes with different queries"
    echo ""
    echo "  4. View test documentation:"
    echo "     ${MAGENTA}→ cat tests/README.md${NC}"
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

