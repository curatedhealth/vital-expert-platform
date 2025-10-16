// FIXED: Proper agent selection implementation
import { selectAgentWithReasoning } from './intelligent-agent-router';
import { enhancedLangChainService } from './enhanced-langchain-service';

// Re-export missing functions from original file
export { routeByModeNode, suggestAgentsNode, getStepDescription } from './workflow-nodes';
export type { ToolOption } from './workflow-nodes';

// Mock agents for testing - replace with actual agent loading
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
  },
  {
    id: 'mental-health',
    name: 'Mental Health Specialist',
    display_name: 'Mental Health Specialist', 
    description: 'Specializes in mental health and psychological support',
    specialist_area: 'Mental Health',
    model: 'gpt-4',
    avatar: '🧠',
    capabilities: ['mental_health', 'counseling', 'therapy'],
    tools: ['mood_assessment', 'crisis_support']
  },
  {
    id: 'adhd-specialist',
    name: 'ADHD Specialist',
    display_name: 'ADHD Specialist',
    description: 'Expert in ADHD diagnosis, treatment, and management',
    specialist_area: 'ADHD',
    model: 'gpt-4',
    avatar: '🎯',
    capabilities: ['adhd', 'neurodiversity', 'focus_management'],
    tools: ['adhd_assessment', 'focus_tools']
  }
];

export async function selectAgentAutomaticNode(state: any): Promise<any> {
  console.log('🤖 Selecting agent automatically');
  console.log('🔍 Query for agent selection:', state.query);
  
  try {
    // Use intelligent agent selection
    const selectionResult = await selectAgentWithReasoning(
      state.query,
      MOCK_AGENTS,
      state.selectedAgent,
      state.chatHistory || []
    );
    
    console.log('✅ Agent selected:', {
      agentId: selectionResult.selectedAgent.id,
      agentName: selectionResult.selectedAgent.name,
      confidence: selectionResult.confidence,
      reasoning: selectionResult.reasoning
    });
    
    return {
      workflowStep: 'agent_selected',
      selectedAgent: selectionResult.selectedAgent,
      currentStep: `Agent selected: ${selectionResult.selectedAgent.name}`,
      metadata: {
        ...state.metadata,
        agentSelection: {
          confidence: selectionResult.confidence,
          reasoning: selectionResult.reasoning,
          alternatives: selectionResult.alternativeAgents?.length || 0
        }
      }
    };
  } catch (error) {
    console.error('❌ Agent selection failed:', error);
    
    // Fallback to first available agent
    const fallbackAgent = MOCK_AGENTS[0];
    console.log('🔄 Using fallback agent:', fallbackAgent.name);
    
    return {
      workflowStep: 'agent_selected',
      selectedAgent: fallbackAgent,
      currentStep: `Fallback agent selected: ${fallbackAgent.name}`,
      metadata: {
        ...state.metadata,
        agentSelection: {
          confidence: 0.5,
          reasoning: 'Fallback selection due to error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }
}

export async function processWithAgentNormalNode(state: any): Promise<any> {
  console.log('🔄 Processing with agent (normal mode)');
  console.log('🔍 Agent details:', {
    agentId: state.selectedAgent?.id,
    agentName: state.selectedAgent?.name,
    agentModel: state.selectedAgent?.model,
    query: state.query
  });
  
  // Check if we have a valid agent
  if (!state.selectedAgent || !state.selectedAgent.id) {
    console.error('❌ No valid agent provided for processing');
    return {
      workflowStep: 'error',
      answer: 'No agent available for processing your request.',
      currentStep: 'Error: No agent selected',
      error: 'No agent selected'
    };
  }
  
  try {
    // Use the enhanced LangChain service to generate a response
    const response = await enhancedLangChainService.queryWithChain(
      state.query,
      state.selectedAgent.id,
      state.sessionId || 'default',
      state.selectedAgent,
      state.userId || 'anonymous'
    );
    
    console.log('✅ Generated response:', {
      contentLength: response.answer?.length || 0,
      hasSources: !!response.sources
    });
    
    return {
      workflowStep: 'processing_complete',
      answer: response.answer || 'I apologize, but I was unable to generate a response.',
      currentStep: 'Response generated successfully',
      metadata: {
        ...state.metadata,
        processingTime: Date.now() - (state.metadata?.startTime || Date.now()),
        agentUsed: state.selectedAgent.name,
        modelUsed: state.selectedAgent.model || 'gpt-4'
      },
      sources: response.sources || [],
      citations: response.citations || []
    };
  } catch (error) {
    console.error('❌ Processing error:', error);
    return {
      workflowStep: 'error',
      answer: 'I encountered an error while processing your request. Please try again.',
      currentStep: 'Error during processing',
      error: error instanceof Error ? error.message : 'Unknown processing error'
    };
  }
}

export async function processWithAgentAutonomousNode(state: any): Promise<any> {
  console.log('🤖 Processing with agent (autonomous mode)');
  
  // For now, use the same logic as normal mode
  // TODO: Implement autonomous-specific processing
  return processWithAgentNormalNode(state);
}

export async function synthesizeResponseNode(state: any): Promise<any> {
  console.log('📝 Synthesizing response');
  console.log('🔍 State for synthesis:', {
    hasAnswer: !!state.answer,
    answerLength: state.answer?.length || 0,
    hasMetadata: !!state.metadata,
    hasSources: !!state.sources,
    workflowStep: state.workflowStep
  });
  
  // Ensure we have a valid answer
  if (!state.answer || state.answer.trim() === '') {
    console.warn('⚠️ No answer provided for synthesis, using fallback');
    return {
      workflowStep: 'synthesis_complete',
      answer: 'I apologize, but I was unable to generate a proper response to your question. Please try rephrasing your question or contact support if the issue persists.',
      currentStep: 'Response synthesis complete (fallback)',
      metadata: {
        ...state.metadata,
        fallbackUsed: true,
        synthesisReason: 'No answer provided'
      }
    };
  }
  
  return {
    workflowStep: 'synthesis_complete',
    answer: state.answer,
    currentStep: 'Response synthesis complete',
    metadata: state.metadata || {},
    sources: state.sources || [],
    citations: state.citations || []
  };
}
