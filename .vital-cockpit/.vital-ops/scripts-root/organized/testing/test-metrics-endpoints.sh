#!/bin/bash
# Test Metrics Endpoints
# Verifies that all metrics endpoints are working correctly

set -e

echo "🧪 Testing Metrics Endpoints"
echo "============================="
echo ""

APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🌐 Application URL: $APP_URL"
echo ""

# Check if application is running
if ! curl -s "$APP_URL" > /dev/null 2>&1; then
    echo "⚠️  WARNING: Application may not be running at $APP_URL"
    echo "   Start the app with: npm run dev"
    echo ""
fi

# Test 1: Main metrics endpoint (Prometheus format)
echo "📊 Test 1: Main Metrics Endpoint (/api/metrics)"
echo "------------------------------------------------"
if curl -s "$APP_URL/api/metrics?format=prometheus" | grep -q "agent_search_total\|rag_latency"; then
    echo "✅ Metrics endpoint responding with agent/RAG metrics"
else
    echo "⚠️  Metrics endpoint may not have agent/RAG metrics yet"
fi
echo ""

# Test 2: Mode 1 metrics endpoint - Stats
echo "📊 Test 2: Mode 1 Metrics - Stats"
echo "-----------------------------------"
STATS_RESPONSE=$(curl -s "$APP_URL/api/ask-expert/mode1/metrics?endpoint=stats")
if echo "$STATS_RESPONSE" | grep -q "success.*true\|totalRequests"; then
    echo "✅ Mode 1 stats endpoint working"
    echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo "⚠️  Mode 1 stats endpoint may need data"
    echo "$STATS_RESPONSE"
fi
echo ""

# Test 3: Mode 1 metrics endpoint - Health
echo "📊 Test 3: Mode 1 Metrics - Health Check"
echo "------------------------------------------"
HEALTH_RESPONSE=$(curl -s "$APP_URL/api/ask-expert/mode1/metrics?endpoint=health")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true\|healthy"; then
    echo "✅ Mode 1 health endpoint working"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "⚠️  Mode 1 health endpoint may need verification"
    echo "$HEALTH_RESPONSE"
fi
echo ""

# Test 4: Verify Prometheus can scrape
echo "📊 Test 4: Prometheus Scraping (if running)"
echo "--------------------------------------------"
if curl -s http://localhost:9090/api/v1/targets > /dev/null 2>&1; then
    TARGETS=$(curl -s http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | "\(.labels.job) - \(.health) - \(.lastError // "OK")"' 2>/dev/null)
    if [ -n "$TARGETS" ]; then
        echo "✅ Prometheus targets:"
        echo "$TARGETS"
    else
        echo "⚠️  Prometheus running but no targets configured"
    fi
else
    echo "⚠️  Prometheus not running (start with: cd monitoring && docker-compose up -d)"
fi
echo ""

# Test 5: Check specific agent metrics
echo "📊 Test 5: Agent Operation Metrics"
echo "------------------------------------"
AGENT_METRICS=$(curl -s "$APP_URL/api/metrics?format=prometheus" | grep -E "^(agent_search|graphrag|agent_selection)" | head -5)
if [ -n "$AGENT_METRICS" ]; then
    echo "✅ Agent operation metrics found:"
    echo "$AGENT_METRICS"
else
    echo "⚠️  No agent operation metrics yet (generate some agent operations to see metrics)"
fi
echo ""

echo "✅ Metrics endpoint testing complete!"
echo ""
echo "💡 Tips:"
echo "   - Generate some agent operations to populate metrics"
echo "   - Wait 15-30 seconds for Prometheus to scrape"
echo "   - View metrics in Grafana: http://localhost:3002"
echo ""

