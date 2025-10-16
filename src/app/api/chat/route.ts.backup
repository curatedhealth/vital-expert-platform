// CRITICAL: Specify Node.js runtime for streaming and edge compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for streaming responses

import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { validateChatRequest, ValidationError } from './middleware';
import { ErrorRecoveryService } from '@/core/services/error-recovery.service';
import { enhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';
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
      autonomousMode = false, 
      selectedTools = [],
      chatHistory = []
    } = await validateChatRequest(request);

    console.log(`🚀 Chat API: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'} mode`);
    console.log(`🔍 [API] Received interactionMode: ${interactionMode}, selectedAgent: ${agent?.name || 'none'}`);
    console.log(`🔍 [API] Full agent object:`, JSON.stringify(agent, null, 2));

    // Start reasoning visualization
    reasoningEmitter.startReasoning();
    
    // Add initial step
    reasoningEmitter.addStep({
      type: 'planning',
      title: 'Query Analysis',
      description: 'Understanding user intent and requirements',
      status: 'running'
    });

    // CRITICAL FIX: Use LangGraph workflow instead of direct LangChain service
    const stream = await streamModeAwareWorkflow({
      query: message,
      chatHistory: chatHistory || [],
      selectedAgent: agent,
      interactionMode: interactionMode || 'automatic',
      autonomousMode: autonomousMode || false,
      selectedTools: selectedTools || [],
      // Add reasoning callback
      onStateUpdate: (state) => {
        // Emit reasoning updates based on workflow state
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
    console.error('API Route Error:', error);
    reasoningEmitter.addStep({
      type: 'validation',
      title: 'Error',
      description: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    });
    
    return NextResponse.json(
      { error: 'Failed to process request' },
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