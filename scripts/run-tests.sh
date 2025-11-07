#!/bin/bash
# Run all tests with coverage reporting

echo "🧪 Running Knowledge Pipeline Tests"
echo "===================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}❌ pytest not found. Installing test dependencies...${NC}"
    pip install -r tests/test-requirements.txt
fi

# Run unit tests
echo -e "\n${BLUE}📋 Running Unit Tests...${NC}"
pytest tests/test_knowledge_pipeline_unit.py -v --tb=short -m "not slow"

UNIT_EXIT=$?

# Run integration tests
echo -e "\n${BLUE}🔗 Running Integration Tests...${NC}"
pytest tests/test_knowledge_pipeline_integration.py -v --tb=short

INTEGRATION_EXIT=$?

# Run all tests with coverage
echo -e "\n${BLUE}📊 Running Full Test Suite with Coverage...${NC}"
pytest tests/ -v --cov=scripts --cov-report=html --cov-report=term-missing

COVERAGE_EXIT=$?

# Summary
echo -e "\n${BLUE}===================================="
echo "Test Summary"
echo -e "====================================${NC}"

if [ $UNIT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Unit Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Unit Tests: FAILED${NC}"
fi

if [ $INTEGRATION_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Integration Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Integration Tests: FAILED${NC}"
fi

if [ $COVERAGE_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Coverage Report: Generated${NC}"
    echo -e "${BLUE}📊 View coverage report: htmlcov/index.html${NC}"
else
    echo -e "${RED}❌ Coverage Report: FAILED${NC}"
fi

# Exit with error if any test failed
if [ $UNIT_EXIT -ne 0 ] || [ $INTEGRATION_EXIT -ne 0 ]; then
    exit 1
fi

echo -e "\n${GREEN}✅ All tests passed!${NC}"
exit 0

