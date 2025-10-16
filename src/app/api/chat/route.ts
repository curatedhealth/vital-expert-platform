import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { validateChatRequest, ValidationError } from './middleware';
import { ErrorRecoveryService } from '@/core/services/error-recovery.service';
import { enhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';

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

    // Create streaming response using working LangChain service
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🚀 Using enhanced LangChain service for chat');
          
          // Send reasoning event
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              description: '🔄 AI Assistant is analyzing your question',
              data: {
                selectedAgent: agent,
                timestamp: Date.now(),
                mode: `${interactionMode}_${autonomousMode ? 'autonomous' : 'normal'}`,
                agent: agent?.name || 'AI Assistant',
                interactionMode,
                autonomousMode,
                metadata: {}
              }
            })}\n\n`)
          );

          // Use the working LangChain service directly
          const response = await enhancedLangChainService.queryWithChain(
            message,
            agent?.id || 'default-agent',
            sessionId || `session-${Date.now()}`,
            agent,
            userId || 'anonymous'
          );

          console.log('✅ LangChain service response:', {
            hasAnswer: !!response.answer,
            answerLength: response.answer?.length || 0,
            hasSources: !!response.sources
          });

          // Send content chunks
          if (response.answer) {
            // Split response into chunks for streaming effect
            const chunks = response.answer.match(/.{1,50}/g) || [response.answer];
            
            for (const chunk of chunks) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({
                  type: 'content',
                  content: chunk,
                  metadata: {
                    selectedAgent: agent,
                    sources: response.sources || [],
                    citations: response.citations || [],
                    tokenUsage: response.tokenUsage || {},
                    reasoning: 'Enhanced LangChain processing',
                    workflowSteps: ['query_analysis', 'knowledge_retrieval', 'response_generation'],
                    agent: agent?.name || 'AI Assistant',
                    interactionMode,
                    autonomousMode,
                    reasoningSteps: []
                  }
                })}\n\n`)
              );
              
              // Small delay for streaming effect
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          // Send final response
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'final',
              content: response.answer || 'I apologize, but I was unable to generate a response.',
              metadata: {
                selectedAgent: agent,
                sources: response.sources || [],
                citations: response.citations || [],
                tokenUsage: response.tokenUsage || {},
                reasoning: 'Enhanced LangChain processing complete',
                workflowSteps: ['query_analysis', 'knowledge_retrieval', 'response_generation'],
                agent: agent?.name || 'AI Assistant',
                interactionMode,
                autonomousMode,
                reasoningSteps: []
              }
            })}\n\n`)
          );
          
          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'complete',
              content: 'Workflow completed successfully'
            })}\n\n`)
          );
          
          controller.close();
        } catch (error) {
          console.error('❌ LangChain service execution failed:', error);
          
          // Send error as SSE
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Service execution failed',
              metadata: {
                selectedAgent: agent,
                sources: [],
                citations: [],
                tokenUsage: {},
                reasoning: 'Error in LangChain service',
                workflowSteps: [],
                error: error instanceof Error ? error.message : 'Unknown error',
                fallbackUsed: true,
                interactionMode,
                autonomousMode,
                reasoningSteps: []
              }
            })}\n\n`)
          );
          
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Handle other errors with recovery
    const fallbackAgent = await ErrorRecoveryService.recoverFromAgentError(error as Error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallbackAgent: fallbackAgent,
        recoveryUsed: true
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}