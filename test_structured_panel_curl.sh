#!/bin/bash
# Quick test script for Structured Panel Debate using curl

# Configuration
AI_ENGINE_URL="${AI_ENGINE_URL:-http://localhost:8000}"
ENDPOINT="${AI_ENGINE_URL}/api/ask-panel-enhanced/stream"

# Default tenant ID
TENANT_ID="${TENANT_ID:-c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244}"

# Test question
QUESTION="How can the integration between the Analytics Consultant Specialist and Accountant Specialist improve the accuracy of financial projections in healthcare settings?"

# Agent IDs - REPLACE THESE with actual agent IDs from your database
# You can get agent IDs by:
# 1. Querying Supabase: SELECT id FROM agents WHERE status = 'active' LIMIT 5;
# 2. Using the API: curl http://localhost:3000/api/agents?status=active
# 3. Checking the frontend when selecting agents

AGENT_IDS='["REPLACE_WITH_AGENT_ID_1", "REPLACE_WITH_AGENT_ID_2", "REPLACE_WITH_AGENT_ID_3"]'

echo "=========================================="
echo "🧪 Testing Structured Panel Debate"
echo "=========================================="
echo ""
echo "📋 Question: ${QUESTION:0:80}..."
echo "🔗 Endpoint: ${ENDPOINT}"
echo "👥 Agents: (replace AGENT_IDS in script)"
echo ""

# Check if agent IDs are still placeholders
if [[ "$AGENT_IDS" == *"REPLACE"* ]]; then
    echo "❌ ERROR: Please replace AGENT_IDS with actual agent IDs from your database"
    echo ""
    echo "To get agent IDs, run:"
    echo "  psql \$DATABASE_URL -c \"SELECT id, name FROM agents WHERE status = 'active' LIMIT 5;\""
    echo ""
    echo "Or use the API:"
    echo "  curl http://localhost:3000/api/agents?status=active | jq '.agents[0:3] | .[].id'"
    echo ""
    exit 1
fi

# Create request body
REQUEST_BODY=$(cat <<EOF
{
  "question": "${QUESTION}",
  "template_slug": "structured_panel",
  "selected_agent_ids": ${AGENT_IDS},
  "tenant_id": "${TENANT_ID}",
  "enable_debate": true,
  "max_rounds": 2,
  "require_consensus": false
}
EOF
)

echo "📤 Sending request..."
echo ""
echo "Request body:"
echo "$REQUEST_BODY" | jq '.' 2>/dev/null || echo "$REQUEST_BODY"
echo ""
echo "=========================================="
echo "📥 Streaming responses (looking for debate rounds)..."
echo "=========================================="
echo ""

# Make the request and process SSE stream
curl -N -s -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -d "${REQUEST_BODY}" \
  | while IFS= read -r line; do
    if [[ "$line" == data:* ]]; then
      # Extract JSON from "data: {...}"
      json_data="${line#data: }"
      
      # Parse and display relevant information
      if command -v jq &> /dev/null; then
        event_type=$(echo "$json_data" | jq -r '.type // "unknown"')
        node=$(echo "$json_data" | jq -r '.node // "unknown"')
        role=$(echo "$json_data" | jq -r '.data.role // "unknown"')
        content=$(echo "$json_data" | jq -r '.data.content // ""' | head -c 150)
        
        if [[ "$event_type" == "message" ]]; then
          echo "[$node] $role: ${content}..."
          
          # Highlight debate rounds
          if [[ "$node" == "panel_debate_round" ]]; then
            if [[ "$role" == "orchestrator" ]] && [[ "$content" == *"Round"* ]]; then
              echo "  ⭐ DEBATE ROUND DETECTED!"
            fi
            if [[ "$role" != "orchestrator" ]]; then
              echo "  💬 Expert response in debate"
            fi
          fi
        elif [[ "$event_type" == "complete" ]]; then
          echo ""
          echo "✅ Panel consultation complete!"
        elif [[ "$event_type" == "error" ]]; then
          error_msg=$(echo "$json_data" | jq -r '.data.error // "Unknown error"')
          echo "❌ Error: $error_msg"
        fi
      else
        # Fallback: just show raw data
        echo "$json_data"
      fi
    fi
  done

echo ""
echo "=========================================="
echo "✅ Test complete!"
echo "=========================================="
echo ""
echo "Look for:"
echo "  ✅ 'DEBATE ROUND DETECTED' messages"
echo "  ✅ Expert responses in debate rounds"
echo "  ✅ Experts referencing each other"
echo ""


