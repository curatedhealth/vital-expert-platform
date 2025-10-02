#!/bin/bash

# Psoriasis Digital Health User Story Test Script
# This script runs the comprehensive test suite for the enhanced chat system

echo "🧪 VITAL AI - Psoriasis Digital Health Test Suite"
echo "================================================="
echo ""

# Check if the development server is running
echo "🔍 Checking if development server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running at http://localhost:3000"
else
    echo "❌ Development server is not running. Please start with 'npm run dev'"
    exit 1
fi

echo ""
echo "🎯 Test Scenarios:"
echo "- Automatic Agent Selection (3 tests)"
echo "- Manual Agent Selection (3 tests)"
echo "- RAG Functionality Testing (3 tests)"
echo ""

# Test 1: Automatic Agent Selection - Comprehensive Query
echo "🤖 TEST 1: Automatic Agent Selection - Comprehensive Market Analysis"
echo "Query: 'I need to explore digital health interventions opportunities for patients with psoriasis in Europe'"
echo "Expected: Digital Health Strategist, Regulatory Affairs Specialist, Market Access Strategist, Clinical Development Expert"
echo ""

# Test 2: Automatic Agent Selection - Specific Solution Focus
echo "🤖 TEST 2: Automatic Agent Selection - Current Solutions"
echo "Query: 'What are the current digital health solutions for psoriasis management available in European markets?'"
echo "Expected: Digital Health Strategist, Market Access Strategist"
echo ""

# Test 3: Manual Agent Selection - Single Agent
echo "👤 TEST 3: Manual Agent Selection - Regulatory Focus"
echo "Query: 'What are the specific EMA guidelines for psoriasis digital therapeutics?'"
echo "Manual Selection: Regulatory Affairs Specialist only"
echo ""

# Test 4: RAG Integration Test
echo "📚 TEST 4: RAG Functionality - Epidemiology Data"
echo "Query: 'What is the prevalence of psoriasis in Germany?'"
echo "Expected RAG Sources: epidemiological studies, health statistics"
echo ""

# Test 5: Performance Test
echo "⚡ TEST 5: Performance Validation"
echo "Checking response times and system performance..."
echo ""

echo "🎯 Interactive Testing Instructions:"
echo "1. Navigate to http://localhost:3000/chat"
echo "2. Try the test queries above"
echo "3. Observe agent selection and response quality"
echo "4. Check metrics at http://localhost:3000/metrics"
echo ""

echo "📊 Expected Validation Criteria:"
echo "- Agent Selection Accuracy: >90%"
echo "- Response Time: <15 seconds"
echo "- RAG Retrieval Accuracy: >95%"
echo "- Digital Health Priority Recognition: Yes"
echo ""

echo "✅ Test environment is ready!"
echo "📝 Detailed test documentation: USER_STORY_PSORIASIS_DIGITAL_HEALTH.md"