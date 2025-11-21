#!/bin/bash

echo "🧪 Testing Mode 2 Fixes"
echo "======================="

echo ""
echo "✅ Fixes Applied:"
echo "• Created Pinecone index 'vital-knowledge'"
echo "• Fixed database search syntax error"
echo "• Added fallback agent selection"

echo ""
echo "🔍 Testing Agent Selector Service..."

cd apps/digital-health-startup

# Test the agent selector directly
node -e "
const { AgentSelectorService } = require('./src/features/chat/services/agent-selector-service.ts');
const { createClient } = require('@supabase/supabase-js');

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const agentSelector = new AgentSelectorService(supabase);

// Test query analysis
console.log('🔍 Testing query analysis...');
agentSelector.analyzeQuery('Design a comprehensive strategy integrating clinical, regulatory, and commercial considerations')
  .then(result => {
    console.log('✅ Query analysis result:', result);
    
    // Test candidate search
    console.log('🔍 Testing candidate search...');
    return agentSelector.findCandidateAgents(
      'Design a comprehensive strategy integrating clinical, regulatory, and commercial considerations',
      result.domains,
      5
    );
  })
  .then(agents => {
    console.log('✅ Found agents:', agents.length);
    if (agents.length > 0) {
      console.log('📋 First agent:', agents[0].name);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });
"
