import { NextRequest, NextResponse } from 'next/server';
import { streamEnhancedModeAwareWorkflow } from '@/features/autonomous/enhanced-ask-expert-graph';
import { autonomousOrchestrator } from '@/features/autonomous/autonomous-orchestrator';
import { safetyManager } from '@/features/autonomous/safety-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      mode = 'automatic',
      agentId,
      selectedAgent,
      selectedTools = [],
      chatHistory = [],
      maxIterations = 50,
      maxCost = 100,
      supervisionLevel = 'medium',
      userId = 'anonymous',
      sessionId = `session_${Date.now()}`,
      streaming = true
    } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Validate mode
    if (!['manual', 'automatic'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be either "manual" or "automatic"' },
        { status: 400 }
      );
    }

    // Validate manual mode requirements
    if (mode === 'manual' && !selectedAgent) {
      return NextResponse.json(
        { error: 'Selected agent is required for manual mode' },
        { status: 400 }
      );
    }

    // Check safety limits
    const safetyCheck = safetyManager.canExecute(query, 0);
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Request blocked by safety manager',
          violations: safetyCheck.violations,
          warnings: safetyCheck.warnings
        },
        { status: 403 }
      );
    }

    console.log('🚀 [Autonomous API] Starting autonomous execution:', {
      query: query.substring(0, 100),
      mode,
      selectedAgent: selectedAgent?.name,
      maxIterations,
      maxCost,
      supervisionLevel,
      streaming
    });

    if (streaming) {
      // Return streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const encoder = new TextEncoder();
            
            // Send initial response
            const initialResponse = {
              type: 'start',
              message: 'Starting autonomous execution...',
              data: {
                query,
                mode,
                selectedAgent: selectedAgent?.name,
                maxIterations,
                maxCost,
                supervisionLevel
              }
            };
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(initialResponse)}\n\n`)
            );

            // Stream the workflow execution
            for await (const event of streamEnhancedModeAwareWorkflow({
              query,
              agentId,
              sessionId,
              userId,
              selectedAgent,
              interactionMode: mode as 'automatic' | 'manual',
              autonomousMode: true,
              selectedTools,
              chatHistory,
              maxIterations,
              maxCost,
              supervisionLevel
            })) {
              const eventData = {
                type: event.type,
                step: event.step,
                description: event.description,
                data: event.data,
                content: event.content,
                metadata: event.metadata,
                message: event.message,
                timestamp: new Date().toISOString()
              };

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
              );
            }

            // Send completion event
            const completionEvent = {
              type: 'complete',
              message: 'Autonomous execution completed successfully',
              timestamp: new Date().toISOString()
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`)
            );

            controller.close();
          } catch (error) {
            console.error('❌ [Autonomous API] Streaming error:', error);
            
            const errorEvent = {
              type: 'error',
              message: error instanceof Error ? error.message : 'Unknown error occurred',
              timestamp: new Date().toISOString()
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Return non-streaming response
      const result = await autonomousOrchestrator.execute(query, {
        mode: mode as 'manual' | 'automatic',
        agent: selectedAgent,
        maxIterations,
        maxCost,
        maxDuration: 60, // 60 minutes
        supervisionLevel: supervisionLevel as 'none' | 'low' | 'medium' | 'high',
        userId,
        sessionId
      });

      return NextResponse.json({
        success: result.success,
        goal: result.goal,
        completedTasks: result.completedTasks,
        finalResult: result.finalResult,
        evidence: result.evidence,
        verificationProofs: result.verificationProofs,
        metrics: result.metrics,
        insights: result.insights,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ [Autonomous API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get current execution status
    const status = autonomousOrchestrator.getStatus();
    
    // Get safety metrics
    const safetyMetrics = safetyManager.getMetrics();
    const safetyStatus = safetyManager.getStatusReport();

    return NextResponse.json({
      status,
      safety: {
        metrics: safetyMetrics,
        status: safetyStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Autonomous API] GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Stop current execution
    autonomousOrchestrator.stop();

    return NextResponse.json({
      success: true,
      message: 'Autonomous execution stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Autonomous API] DELETE error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'pause':
        autonomousOrchestrator.pause();
        return NextResponse.json({
          success: true,
          message: 'Autonomous execution paused',
          timestamp: new Date().toISOString()
        });

      case 'resume':
        autonomousOrchestrator.resume();
        return NextResponse.json({
          success: true,
          message: 'Autonomous execution resumed',
          timestamp: new Date().toISOString()
        });

      case 'stop':
        autonomousOrchestrator.stop();
        return NextResponse.json({
          success: true,
          message: 'Autonomous execution stopped',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "pause", "resume", or "stop"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ [Autonomous API] PATCH error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
