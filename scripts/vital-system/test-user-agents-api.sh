#!/bin/bash

# Test script for user-agents API
echo "🧪 Testing User Agents API..."

# Test data
USER_ID="test-user-123"
AGENT_ID="test-agent-456"

echo "📝 Testing POST /api/user-agents (Add agent to user list)..."

# Test adding an agent
curl -X POST http://localhost:3000/api/user-agents \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"agentId\": \"$AGENT_ID\",
    \"isUserCopy\": true
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "📝 Testing GET /api/user-agents (Get user's agents)..."

# Test getting user's agents
curl -X GET "http://localhost:3000/api/user-agents?userId=$USER_ID" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "📝 Testing DELETE /api/user-agents (Remove agent from user list)..."

# Test removing an agent
curl -X DELETE http://localhost:3000/api/user-agents \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"agentId\": \"$AGENT_ID\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ API tests completed!"
echo ""
echo "📋 Manual Testing Steps:"
echo "1. Go to http://localhost:3000/agents"
echo "2. Click 'Add to Chat' on any agent"
echo "3. Navigate to http://localhost:3000/ask-expert"
echo "4. Verify the agent appears in the sidebar"
echo "5. Check browser console for success messages"
