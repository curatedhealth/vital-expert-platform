#!/bin/bash

# Test Runner Script for AI Engine
# Installs dependencies and runs all tests

set -e  # Exit on error

echo "🧪 AI Engine Test Runner"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to AI engine directory
cd "$(dirname "$0")"

echo "📦 Installing test dependencies..."
python3 -m pip install -q -r test-requirements.txt

echo ""
echo "🔧 Running Unit Tests..."
echo "------------------------"
python3 -m pytest tests/unit/ -v --tb=short --cov=src/vital_shared --cov-report=term-missing

UNIT_EXIT_CODE=$?

echo ""
echo "🔗 Running Integration Tests..."
echo "--------------------------------"
python3 -m pytest tests/integration/ -v --tb=short

INTEGRATION_EXIT_CODE=$?

echo ""
echo "📊 Test Summary"
echo "==============="

if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Unit Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Unit Tests: FAILED${NC}"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Integration Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Integration Tests: FAILED${NC}"
fi

echo ""

# Generate coverage report
if [ $UNIT_EXIT_CODE -eq 0 ] || [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo "📈 Generating coverage report..."
    python3 -m pytest --cov=src/vital_shared --cov-report=html --cov-report=term
    echo ""
    echo -e "${GREEN}Coverage report generated at: htmlcov/index.html${NC}"
fi

# Exit with error if any tests failed
if [ $UNIT_EXIT_CODE -ne 0 ] || [ $INTEGRATION_EXIT_CODE -ne 0 ]; then
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All tests passed!${NC}"
exit 0

