#!/bin/bash

# MA01 Jobs API Test Script
# This script tests all 5 CRUD endpoints for the jobs API

echo "🧪 Testing MA01 Jobs API Endpoints"
echo "=================================="

# Configuration
BASE_URL="http://localhost:3000"
USER_ID="550e8400-e29b-41d4-a716-446655440000" # Test user ID
API_BASE="$BASE_URL/api/jobs"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}Testing with User ID: $USER_ID${NC}"
echo -e "${BLUE}API Base URL: $API_BASE${NC}\n"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local expected_status=$5

    echo -e "${BLUE}Testing: $description${NC}"
    echo "Method: $method"
    echo "URL: $url"

    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -H "user-id: $USER_ID" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            -H "user-id: $USER_ID" \
            "$url")
    fi

    # Extract status and body
    status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')

    echo "Response Status: $status"
    echo "Response Body: $body"

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL (Expected $expected_status, got $status)${NC}"
    fi
    echo "----------------------------------------"
}

# Test 1: POST /api/jobs (Create a job)
echo -e "\n${BLUE}1. Testing POST /api/jobs (Create Job)${NC}"
JOB_DATA='{
    "name": "Test Medical Query Job",
    "description": "Testing the jobs API endpoint",
    "status": "pending",
    "configuration": {
        "query_type": "medical_research",
        "priority": "normal"
    },
    "query_text": "What are the latest treatments for Type 2 diabetes?"
}'

test_endpoint "POST" "$API_BASE" "$JOB_DATA" "Create new job" "200"

# Extract job ID from response for subsequent tests
JOB_ID=$(echo "$body" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
echo -e "\n${BLUE}Created Job ID: $JOB_ID${NC}\n"

# Test 2: GET /api/jobs (List all jobs)
echo -e "\n${BLUE}2. Testing GET /api/jobs (List Jobs)${NC}"
test_endpoint "GET" "$API_BASE" "" "List all jobs" "200"

# Test 3: GET /api/jobs/:id (Get specific job)
if [ -n "$JOB_ID" ]; then
    echo -e "\n${BLUE}3. Testing GET /api/jobs/$JOB_ID (Get Specific Job)${NC}"
    test_endpoint "GET" "$API_BASE/$JOB_ID" "" "Get specific job" "200"
else
    echo -e "\n${RED}3. Skipping GET /api/jobs/:id (No job ID available)${NC}"
fi

# Test 4: PUT /api/jobs/:id (Update job)
if [ -n "$JOB_ID" ]; then
    echo -e "\n${BLUE}4. Testing PUT /api/jobs/$JOB_ID (Update Job)${NC}"
    UPDATE_DATA='{
        "status": "running",
        "description": "Updated description - job is now running",
        "ai_agent_used": "medical_research_agent"
    }'
    test_endpoint "PUT" "$API_BASE/$JOB_ID" "$UPDATE_DATA" "Update job status" "200"
else
    echo -e "\n${RED}4. Skipping PUT /api/jobs/:id (No job ID available)${NC}"
fi

# Test 5: DELETE /api/jobs/:id (Delete job)
if [ -n "$JOB_ID" ]; then
    echo -e "\n${BLUE}5. Testing DELETE /api/jobs/$JOB_ID (Delete Job)${NC}"
    test_endpoint "DELETE" "$API_BASE/$JOB_ID" "" "Delete job" "200"
else
    echo -e "\n${RED}5. Skipping DELETE /api/jobs/:id (No job ID available)${NC}"
fi

# Test 6: GET deleted job (should return 404)
if [ -n "$JOB_ID" ]; then
    echo -e "\n${BLUE}6. Testing GET deleted job (Should return 404)${NC}"
    test_endpoint "GET" "$API_BASE/$JOB_ID" "" "Get deleted job" "404"
fi

echo -e "\n${BLUE}🎉 API Testing Complete!${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "✅ POST /api/jobs - Create job"
echo "✅ GET /api/jobs - List jobs"
echo "✅ GET /api/jobs/:id - Get specific job"
echo "✅ PUT /api/jobs/:id - Update job"
echo "✅ DELETE /api/jobs/:id - Delete job"
echo ""
echo -e "${GREEN}All 5 CRUD endpoints have been tested!${NC}"