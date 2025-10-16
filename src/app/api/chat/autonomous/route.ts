import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { validateChatRequest } from '../middleware';
import { reasoningEmitter } from '@/features/chat/services/reasoning-emitter';

export async function POST(request: NextRequest) {
  try {
    // Validate request using middleware
    const { 
      message, 
      userId, 
      sessionId, 
      agent, 
      interactionMode = 'automatic', 
      autonomousMode = true, // Force autonomous mode
      selectedTools = [],
      chatHistory = []
    } = await validateChatRequest(request);

    console.log(`🚀 Autonomous Chat API: ${interactionMode} + Autonomous mode`);
    console.log(`🔍 [Autonomous API] Agent: ${agent?.name || 'none'}`);

    // Start reasoning visualization
    reasoningEmitter.startReasoning();
    
    // Add initial step
    reasoningEmitter.addStep({
      type: 'planning',
      title: 'Autonomous Query Analysis',
      description: 'AI is analyzing your question with full autonomous capabilities',
      status: 'running'
    });

    // Use LangGraph workflow with autonomous mode
    const stream = await streamModeAwareWorkflow({
      query: message,
      chatHistory: chatHistory || [],
      selectedAgent: agent,
      interactionMode: interactionMode || 'automatic',
      autonomousMode: true, // Force autonomous mode
      selectedTools: selectedTools || [],
      // Add reasoning callback
      onStateUpdate: (state) => {
        if (state.workflowStep) {
          const stepTypeMap = {
            'agent_selected': 'agent_selection',
            'knowledge_retrieved': 'rag_retrieval',
            'tools_executed': 'tool_use',
            'response_generated': 'synthesis'
          };

          reasoningEmitter.addStep({
            type: stepTypeMap[state.workflowStep] || 'planning',
            title: state.workflowStep.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: state.metadata?.description || '',
            status: 'completed',
            tokens: state.metadata?.tokens,
            cost: state.metadata?.cost
          });
        }
      }
    });

    // Return SSE stream for real-time updates
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Autonomous API Route Error:', error);
    reasoningEmitter.addStep({
      type: 'validation',
      title: 'Error',
      description: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
    
    return NextResponse.json(
      { error: 'Failed to process autonomous request' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}