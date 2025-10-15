import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { validateChatRequest, ValidationError } from './middleware';
import { ErrorRecoveryService } from '@/core/services/error-recovery.service';

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

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream workflow execution
          for await (const event of streamModeAwareWorkflow({
            query: message,
            agentId: agent?.id,
            sessionId: sessionId || `session-${Date.now()}`,
            userId: userId || 'anonymous',
            selectedAgent: agent,
            interactionMode,
            autonomousMode,
            selectedTools,
            chatHistory
          })) {
            // CRITICAL: Preserve ALL original fields
            // Do NOT transform or rename fields
            const sseData = {
              ...event,  // Spread ALL original fields
              _meta: {   // Add metadata without affecting original
                timestamp: Date.now(),
                source: 'workflow',
                sessionId: sessionId || `session-${Date.now()}`
              }
            };

            // Send exactly as is
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(sseData)}\n\n`)
            );
          }
          
          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'complete',
              content: 'Workflow completed successfully'
            })}\n\n`)
          );
          
          controller.close();
        } catch (error) {
          console.error('❌ Workflow execution failed:', error);
          
          // Send error as SSE
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              content: error instanceof Error ? error.message : 'Workflow execution failed'
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