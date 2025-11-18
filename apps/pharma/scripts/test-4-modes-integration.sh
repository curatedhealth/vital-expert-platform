#!/bin/bash

# Test script to verify all 4 modes are integrated
echo "🧪 Testing Ask Expert 4-Mode Integration"
echo "========================================"

# Test Mode 1: Manual Interactive
echo ""
echo "📋 Testing Mode 1: Manual Interactive"
echo "-------------------------------------"
curl -X POST http://localhost:3000/api/ask-expert/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "manual",
    "agentId": "test-agent-1",
    "message": "What is the capital of France?",
    "conversationHistory": [],
    "enableRAG": true,
    "enableTools": false
  }' \
  --max-time 10 \
  --silent --show-error || echo "❌ Mode 1 test failed"

# Test Mode 2: Automatic Agent Selection
echo ""
echo "📋 Testing Mode 2: Automatic Agent Selection"
echo "---------------------------------------------"
curl -X POST http://localhost:3000/api/ask-expert/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "automatic",
    "message": "What is the capital of France?",
    "conversationHistory": [],
    "enableRAG": true,
    "enableTools": false,
    "userId": "test-user-1"
  }' \
  --max-time 10 \
  --silent --show-error || echo "❌ Mode 2 test failed"

# Test Mode 3: Autonomous-Automatic
echo ""
echo "📋 Testing Mode 3: Autonomous-Automatic"
echo "---------------------------------------"
curl -X POST http://localhost:3000/api/ask-expert/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "autonomous",
    "message": "What is the capital of France?",
    "conversationHistory": [],
    "enableRAG": true,
    "enableTools": true,
    "userId": "test-user-1",
    "maxIterations": 5,
    "confidenceThreshold": 0.9
  }' \
  --max-time 15 \
  --silent --show-error || echo "❌ Mode 3 test failed"

# Test Mode 4: Autonomous-Manual
echo ""
echo "📋 Testing Mode 4: Autonomous-Manual"
echo "-----------------------------------"
curl -X POST http://localhost:3000/api/ask-expert/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "multi-expert",
    "agentId": "test-agent-1",
    "message": "What is the capital of France?",
    "conversationHistory": [],
    "enableRAG": true,
    "enableTools": true,
    "maxIterations": 5,
    "confidenceThreshold": 0.9
  }' \
  --max-time 15 \
  --silent --show-error || echo "❌ Mode 4 test failed"

echo ""
echo "✅ All 4 modes tested!"
echo ""
echo "Mode Summary:"
echo "• Mode 1: Manual Interactive (user selects agent)"
echo "• Mode 2: Automatic Agent Selection (AI selects agent)"
echo "• Mode 3: Autonomous-Automatic (AI selects agent + ReAct reasoning)"
echo "• Mode 4: Autonomous-Manual (user selects agent + ReAct reasoning)"
echo ""
echo "Frontend Integration:"
echo "• Toggle combinations determine mode"
echo "• Streaming responses handled for all modes"
echo "• Autonomous metadata displayed for Mode 3 & 4"
echo "• Agent selection info displayed for Mode 2 & 3"
