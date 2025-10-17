// Debug the workflow directly
const { selectAgentWithReasoning } = require('./src/features/chat/services/intelligent-agent-router.ts');

const MOCK_AGENTS = [
  {
    id: 'general-health',
    name: 'General Health Advisor',
    display_name: 'General Health Advisor',
    description: 'Provides general health and wellness guidance',
    specialist_area: 'General Health',
    model: 'gpt-4',
    avatar: '👩‍⚕️',
    capabilities: ['general_health', 'wellness', 'preventive_care'],
    tools: ['health_assessment', 'symptom_checker']
  }
];

async function debugWorkflow() {
  console.log('🔍 Debugging workflow step by step...');
  
  // Test 1: Direct agent selection
  console.log('\n1️⃣ Testing direct agent selection...');
  try {
    const result = await selectAgentWithReasoning(
      'What is ADHD?',
      MOCK_AGENTS,
      null,
      []
    );
    console.log('✅ Agent selection result:', {
      hasSelectedAgent: !!result.selectedAgent,
      agentId: result.selectedAgent?.id,
      agentName: result.selectedAgent?.name,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('❌ Agent selection failed:', error.message);
  }
  
  // Test 2: Mock workflow node
  console.log('\n2️⃣ Testing workflow node...');
  try {
    const { selectAgentAutomaticNode } = require('./src/features/chat/services/workflow-nodes-fixed.ts');
    const state = {
      query: 'What is ADHD?',
      selectedAgent: null,
      interactionMode: 'automatic',
      autonomousMode: false,
      chatHistory: []
    };
    
    const nodeResult = await selectAgentAutomaticNode(state);
    console.log('✅ Workflow node result:', {
      workflowStep: nodeResult.workflowStep,
      hasSelectedAgent: !!nodeResult.selectedAgent,
      agentId: nodeResult.selectedAgent?.id,
      agentName: nodeResult.selectedAgent?.name
    });
  } catch (error) {
    console.error('❌ Workflow node failed:', error.message);
  }
}

debugWorkflow().catch(console.error);
