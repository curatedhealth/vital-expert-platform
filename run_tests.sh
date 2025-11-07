#!/bin/bash
# Knowledge Pipeline Test Runner
# ===============================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Knowledge Pipeline Test Suite${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Parse arguments
TEST_TYPE="${1:-all}"
RUN_LIVE="${RUN_LIVE_TESTS:-0}"

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}⚠️  pytest not found. Installing test dependencies...${NC}"
    pip3 install -r tests/requirements-test.txt
fi

# Function to run tests
run_tests() {
    local test_path="$1"
    local markers="$2"
    local description="$3"
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if [ -z "$markers" ]; then
        pytest "$test_path" -v
    else
        pytest "$test_path" -v -m "$markers"
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ $description PASSED${NC}"
        return 0
    else
        echo -e "\n${RED}❌ $description FAILED${NC}"
        return $exit_code
    fi
}

# Main test execution
case "$TEST_TYPE" in
    unit)
        echo -e "${YELLOW}Running unit tests only...${NC}"
        run_tests "tests/knowledge/search" "unit" "Search Unit Tests"
        run_tests "tests/knowledge/scraping" "unit" "Scraping Unit Tests"
        ;;
    
    integration)
        echo -e "${YELLOW}Running integration tests...${NC}"
        run_tests "tests/knowledge/integration" "integration and not slow" "Integration Tests"
        ;;
    
    search)
        echo -e "${YELLOW}Running search tests...${NC}"
        run_tests "tests/knowledge/search" "" "All Search Tests"
        ;;
    
    scraping)
        echo -e "${YELLOW}Running scraping tests...${NC}"
        run_tests "tests/knowledge/scraping" "" "All Scraping Tests"
        ;;
    
    live)
        echo -e "${YELLOW}Running live API tests (requires internet)...${NC}"
        RUN_LIVE_TESTS=1 run_tests "tests/knowledge/integration" "slow" "Live API Tests"
        ;;
    
    coverage)
        echo -e "${YELLOW}Running all tests with coverage report...${NC}"
        pytest tests/ -v --cov=scripts --cov=services/ai-engine/src/services/knowledge \
            --cov-report=term-missing --cov-report=html:htmlcov -m "not slow"
        
        echo -e "\n${GREEN}✅ Coverage report generated in htmlcov/index.html${NC}"
        ;;
    
    all)
        echo -e "${YELLOW}Running all tests (except live)...${NC}"
        run_tests "tests/" "not slow" "All Tests"
        ;;
    
    fast)
        echo -e "${YELLOW}Running fast tests only...${NC}"
        pytest tests/ -v -m "not slow and not integration" --tb=short
        ;;
    
    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo ""
        echo "Usage: $0 [test_type]"
        echo ""
        echo "Test types:"
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests"
        echo "  search      - Run search tests"
        echo "  scraping    - Run scraping tests"
        echo "  live        - Run live API tests (requires internet)"
        echo "  coverage    - Run all tests with coverage report"
        echo "  fast        - Run fast tests only"
        echo "  all         - Run all tests except live (default)"
        echo ""
        echo "Environment variables:"
        echo "  RUN_LIVE_TESTS=1  - Enable live API tests"
        exit 1
        ;;
esac

EXIT_CODE=$?

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}  ✅ ALL TESTS PASSED${NC}"
else
    echo -e "${RED}  ❌ SOME TESTS FAILED${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

exit $EXIT_CODE

