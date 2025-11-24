#!/bin/bash

# API Testing Script
# Tests all newly created API endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing VITAL Path API Infrastructure"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get all Ask Expert modes with workflows
echo -e "${BLUE}Test 1: Get all Ask Expert modes${NC}"
echo "GET $BASE_URL/api/services/ask-expert/modes"
echo ""
curl -s "$BASE_URL/api/services/ask-expert/modes" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Browse node library
echo -e "${BLUE}Test 2: Browse node library${NC}"
echo "GET $BASE_URL/api/nodes"
echo ""
curl -s "$BASE_URL/api/nodes" | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Get Ask Expert Mode 2 with workflow
echo -e "${BLUE}Test 3: Get Ask Expert Mode 2 details${NC}"
echo "GET $BASE_URL/api/modes/ae_mode_2"
echo ""
curl -s "$BASE_URL/api/modes/ae_mode_2" | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Browse pre-built workflow templates
echo -e "${BLUE}Test 4: Browse workflow templates${NC}"
echo "GET $BASE_URL/api/templates?type=workflow&featured=true"
echo ""
curl -s "$BASE_URL/api/templates?type=workflow&featured=true" | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Get all Ask Panel modes
echo -e "${BLUE}Test 5: Get all Ask Panel modes${NC}"
echo "GET $BASE_URL/api/services/ask-panel/modes"
echo ""
curl -s "$BASE_URL/api/services/ask-panel/modes" | jq '.'
echo ""
echo "---"
echo ""

# Test 6: Get built-in nodes only
echo -e "${BLUE}Test 6: Get built-in nodes${NC}"
echo "GET $BASE_URL/api/nodes?builtin=true"
echo ""
curl -s "$BASE_URL/api/nodes?builtin=true" | jq '.'
echo ""
echo "---"
echo ""

# Test 7: Browse all templates
echo -e "${BLUE}Test 7: Browse all templates${NC}"
echo "GET $BASE_URL/api/templates"
echo ""
curl -s "$BASE_URL/api/templates" | jq '.'
echo ""
echo "---"
echo ""

# Test 8: Get workflow library
echo -e "${BLUE}Test 8: Browse workflow library${NC}"
echo "GET $BASE_URL/api/workflows/library"
echo ""
curl -s "$BASE_URL/api/workflows/library" | jq '.'
echo ""
echo "---"
echo ""

# Summary
echo ""
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo ""
echo "If you see JSON responses above, your APIs are working correctly!"
echo ""
echo "Next steps:"
echo "  1. Check that service modes returned 4 for ask-expert, 6 for ask-panel"
echo "  2. Verify 7 built-in nodes in node library"
echo "  3. Confirm workflow templates are linked to modes"
echo ""

