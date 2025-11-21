#!/bin/bash

echo "🔍 Debugging Mode 1 Agent Selection Issue"
echo "=========================================="

echo ""
echo "📋 Current Status:"
echo "• Server running on port 3000"
echo "• Ask Expert page loads"
echo "• Sidebar shows 260 agents (4 filtered)"
echo "• User sent message but got error response"

echo ""
echo "🔍 Likely Issue:"
echo "• No agent is actually SELECTED for Mode 1"
echo "• User needs to CLICK on an agent to select it first"
echo "• Mode 1 requires an agent to be selected before sending messages"

echo ""
echo "📋 Testing Steps:"
echo "1. Open http://localhost:3000/ask-expert"
echo "2. Log in if not already logged in"
echo "3. In the sidebar, CLICK on an agent (e.g., 'digital_therapeutic_specialist')"
echo "4. Verify the agent shows as selected (should have visual indicator)"
echo "5. Send a message - should work now"

echo ""
echo "🔧 Visual Indicators to Look For:"
echo "• Selected agent should have different background color"
echo "• Selected agent should show 'data-active' styling"
echo "• 'New Chat' button should show '1 selected' badge if agent is selected"

echo ""
echo "⚠️  If Still Getting Error:"
echo "• Check browser console for JavaScript errors"
echo "• Check network tab for failed API calls"
echo "• Verify the selected agent ID is being sent to the API"

echo ""
echo "🧪 Quick Test:"
echo "• Try clicking on 'digital_therapeutic_specialist' agent"
echo "• Then send message: 'Hello, can you help me?'"
echo "• Should work if agent is properly selected"
