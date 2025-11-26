#!/bin/bash
#
# run_graphrag_tests.sh - Run GraphRAG test suite
#
# Usage:
#   ./run_graphrag_tests.sh              # Run all tests
#   ./run_graphrag_tests.sh unit         # Run only unit tests
#   ./run_graphrag_tests.sh integration  # Run only integration tests
#   ./run_graphrag_tests.sh coverage     # Run with detailed coverage report

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║         GraphRAG Service Test Suite                         ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}❌ pytest is not installed${NC}"
    echo "Install with: pip install pytest pytest-asyncio pytest-cov"
    exit 1
fi

# Navigate to AI engine directory
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
AI_ENGINE_DIR="$(cd ../.. && pwd)"

echo -e "${YELLOW}📂 Working directory: $AI_ENGINE_DIR${NC}"
echo ""

# Set Python path
export PYTHONPATH="$AI_ENGINE_DIR/src:$PYTHONPATH"

# Run tests based on argument
case "${1:-all}" in
    unit)
        echo -e "${GREEN}🧪 Running unit tests...${NC}"
        python -m pytest tests/graphrag/test_clients.py -v --tb=short
        ;;
    
    integration)
        echo -e "${GREEN}🔗 Running integration tests...${NC}"
        python -m pytest tests/graphrag/test_graphrag_integration.py -v --tb=short
        ;;
    
    api)
        echo -e "${GREEN}🌐 Running API endpoint tests...${NC}"
        python -m pytest tests/graphrag/test_api_endpoints.py -v --tb=short
        ;;
    
    coverage)
        echo -e "${GREEN}📊 Running tests with coverage report...${NC}"
        python -m pytest tests/graphrag/ \
            -v \
            --tb=short \
            --cov=graphrag \
            --cov-report=term-missing \
            --cov-report=html \
            --cov-branch
        
        echo ""
        echo -e "${GREEN}✅ Coverage report generated: htmlcov/index.html${NC}"
        ;;
    
    fast)
        echo -e "${GREEN}⚡ Running fast tests only (excluding slow)...${NC}"
        python -m pytest tests/graphrag/ -v --tb=short -m "not slow"
        ;;
    
    all|*)
        echo -e "${GREEN}🚀 Running all GraphRAG tests...${NC}"
        python -m pytest tests/graphrag/ -v --tb=short
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║            ✅ All Tests Passed! 🎉                           ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}║            ❌ Tests Failed                                   ║${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

