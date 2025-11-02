#!/bin/bash
# Railway Deployment Verification Script
# Tests the deployed AI Engine on Railway

RAILWAY_URL="https://ai-engine-production-1c26.up.railway.app"
LOCAL_URL="http://localhost:8000"

echo "================================================================================"
echo "🚀 VITAL AI ENGINE - DEPLOYMENT VERIFICATION"
echo "================================================================================"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "--------------------------------------------------------------------------------"
echo "Testing Railway: $RAILWAY_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PASS - Railway is healthy"
    echo "$BODY" | python3 -m json.tool 2>&1 | head -10
else
    echo "❌ FAIL - Railway returned HTTP $HTTP_CODE"
    echo "$BODY"
fi
echo ""

# Test 2: Agent Lookup by Name
echo "📋 Test 2: Agent Lookup by Name"
echo "--------------------------------------------------------------------------------"
echo "Testing agent search for 'clinical'..."
AGENT_RESPONSE=$(curl -s "$RAILWAY_URL/api/v1/agents/search?query=clinical&limit=5" 2>&1)
AGENT_COUNT=$(echo "$AGENT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")

if [ "$AGENT_COUNT" -gt "0" ]; then
    echo "✅ PASS - Found $AGENT_COUNT clinical agents"
    echo "$AGENT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  • {a['name']}\") for a in data[:5]]" 2>/dev/null
else
    echo "❌ FAIL - No agents found"
fi
echo ""

# Test 3: Mode 1 Endpoint
echo "📋 Test 3: Mode 1 Manual/Interactive"
echo "--------------------------------------------------------------------------------"
echo "Testing Mode 1 with clinical-trial-designer..."
MODE1_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/mode1/manual" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111" \
  -d '{
    "agent_id": "clinical-trial-designer",
    "message": "What is Phase 2?",
    "enable_rag": false,
    "enable_tools": false,
    "user_id": "test-user",
    "tenant_id": "11111111-1111-1111-1111-111111111111"
  }' 2>&1)

if echo "$MODE1_RESPONSE" | grep -q "agent_id"; then
    echo "✅ PASS - Mode 1 returned response"
    echo "$MODE1_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  • Agent: {d.get('agent_id', 'N/A')[:40]}...\"); print(f\"  • Content length: {len(d.get('content', ''))} chars\"); print(f\"  • Confidence: {d.get('confidence', 'N/A')}\")" 2>/dev/null
else
    echo "❌ FAIL - Mode 1 returned error"
    echo "$MODE1_RESPONSE" | head -5
fi
echo ""

# Test 4: Compare Local vs Railway
echo "📋 Test 4: Local vs Railway Comparison"
echo "--------------------------------------------------------------------------------"
echo "Comparing response times..."

LOCAL_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$LOCAL_URL/health" 2>&1 || echo "N/A")
RAILWAY_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$RAILWAY_URL/health" 2>&1 || echo "N/A")

echo "  • Local:   ${LOCAL_TIME}s"
echo "  • Railway: ${RAILWAY_TIME}s"
echo ""

# Summary
echo "================================================================================"
echo "📊 VERIFICATION SUMMARY"
echo "================================================================================"
echo ""
echo "🌐 Railway URL: $RAILWAY_URL"
echo "🏠 Local URL:   $LOCAL_URL"
echo ""
echo "✅ All tests complete!"
echo ""
echo "🎯 Next Steps:"
echo "  1. Check Railway dashboard for deployment logs"
echo "  2. Test Mode 1 through frontend UI"
echo "  3. Verify PHARMA & VERIFY protocols"
echo "  4. Begin Mode 2, 3, 4 testing"
echo ""
echo "================================================================================"

