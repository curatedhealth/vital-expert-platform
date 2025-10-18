// CRITICAL: Enhanced error logging and handling
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced POST handler with comprehensive error logging
 */
export async function POST(request: NextRequest) {
  console.log('🚀 [Chat API] Request received');
  
  try {
    // Step 1: Parse request body
    console.log('📝 [Chat API] Step 1: Parsing request body...');
    let body;
    try {
      body = await request.json();
      console.log('✅ [Chat API] Request body parsed successfully');
      console.log('🔍 [Chat API] Request parameters:', {
        hasMessage: !!body.message,
        messageLength: body.message?.length || 0,
        hasAgent: !!body.agent,
        agentId: body.agent?.id,
        agentName: body.agent?.name,
        interactionMode: body.interactionMode,
        autonomousMode: body.autonomousMode,
        hasUserId: !!body.userId,
        hasSessionId: !!body.sessionId
      });
    } catch (parseError: any) {
      console.error('❌ [Chat API] JSON parsing failed:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError.message,
          step: 'parse_request'
        },
        { status: 400 }
      );
    }

    // Step 2: Validate required fields
    console.log('🔍 [Chat API] Step 2: Validating request...');
    const {
      message,
      userId = 'anonymous',
      sessionId = `session-${Date.now()}`,
      agent,
      interactionMode = 'automatic',
      autonomousMode = false,
      selectedTools = [],
      chatHistory = []
    } = body;

    if (!message?.trim()) {
      console.error('❌ [Chat API] Validation failed: Empty message');
      return NextResponse.json(
        { 
          error: 'Message is required',
          step: 'validate_request'
        },
        { status: 400 }
      );
    }

    console.log('✅ [Chat API] Validation passed');
    console.log(`🎯 [Chat API] Mode: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'}`);

    // Step 3: Import dependencies
    console.log('📦 [Chat API] Step 3: Loading dependencies...');
    try {
      // Test import paths
      const { streamModeAwareWorkflow } = await import('@/features/chat/services/ask-expert-graph');
      console.log('✅ [Chat API] Workflow module loaded');
      
      const { reasoningEmitter } = await import('@/features/chat/services/reasoning-emitter');
      console.log('✅ [Chat API] Reasoning emitter loaded');

      // Step 4: Initialize reasoning
      console.log('🧠 [Chat API] Step 4: Initializing reasoning visualization...');
      try {
        reasoningEmitter.startReasoning();
        reasoningEmitter.addStep({
          type: 'planning',
          title: 'Query Analysis',
          description: 'Understanding user intent and requirements',
          status: 'running'
        });
        console.log('✅ [Chat API] Reasoning initialized');
      } catch (reasoningError: any) {
        console.error('⚠️ [Chat API] Reasoning initialization failed (non-critical):', reasoningError);
        // Continue anyway - reasoning is optional
      }

      // Step 5: Execute workflow
      console.log('🚀 [Chat API] Step 5: Executing workflow...');
      console.log('🔍 [Chat API] Workflow input:', {
        query: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        chatHistoryLength: chatHistory?.length || 0,
        selectedAgent: agent ? {
          id: agent.id,
          name: agent.name,
          display_name: agent.display_name
        } : null,
        interactionMode,
        autonomousMode,
        selectedToolsCount: selectedTools?.length || 0,
        userId,
        sessionId
      });

      const streamGenerator = streamModeAwareWorkflow({
        query: message,
        chatHistory: chatHistory || [],
        selectedAgent: agent || null,
        interactionMode: interactionMode || 'automatic',
        autonomousMode: autonomousMode || false,
        selectedTools: selectedTools || [],
        userId,
        sessionId,
        // Add onStateUpdate callback
        onStateUpdate: (state: any) => {
          try {
            if (state.workflowStep) {
              const stepTypeMap: Record<string, any> = {
                'agent_selected': 'agent_selection',
                'knowledge_retrieved': 'rag_retrieval',
                'tools_executed': 'tool_use',
                'response_generated': 'synthesis'
              };

              reasoningEmitter.addStep({
                type: stepTypeMap[state.workflowStep] || 'planning',
                title: state.workflowStep.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                description: state.metadata?.description || '',
                status: 'completed',
                tokens: state.metadata?.tokens,
                cost: state.metadata?.cost
              });
            }
          } catch (err) {
            console.error('⚠️ Reasoning update failed:', err);
          }
        }
      });

      console.log('✅ [Chat API] Workflow stream initiated');

      // Step 6: Create SSE stream
      console.log('📡 [Chat API] Step 6: Creating SSE response stream...');
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            console.log('🌊 [Chat API] Starting to read from workflow stream...');
            let eventCount = 0;
            
            for await (const event of streamGenerator) {
              eventCount++;
              
              try {
                // Log each event for debugging
                console.log(`📊 [Chat API] Event #${eventCount}:`, {
                  type: event.type,
                  hasContent: !!event.content,
                  contentLength: event.content?.length || 0
                });
                
                // Format as SSE and send
                const sseData = `data: ${JSON.stringify(event)}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              } catch (eventError: any) {
                console.error(`❌ [Chat API] Error processing event #${eventCount}:`, eventError);
                // Send error event
                const errorEvent = `data: ${JSON.stringify({
                  type: 'error',
                  message: eventError.message,
                  eventNumber: eventCount
                })}\n\n`;
                controller.enqueue(encoder.encode(errorEvent));
              }
            }
            
            console.log(`✅ [Chat API] Stream completed. Total events: ${eventCount}`);
            
            // Send final [DONE] marker as JSON
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({type: 'done'})}\n\n`));
            controller.close();
            
          } catch (streamError: any) {
            console.error('❌ [Chat API] Fatal stream error:', streamError);
            
            // Send error to client
            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              message: streamError.message,
              stack: process.env.NODE_ENV === 'development' ? streamError.stack : undefined
            })}\n\n`;
            controller.enqueue(encoder.encode(errorEvent));
            controller.close();
          }
        },
        cancel() {
          console.log('⚠️ [Chat API] Stream cancelled by client');
        }
      });

      console.log('✅ [Chat API] SSE stream created successfully');

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });

    } catch (importError: any) {
      console.error('❌ [Chat API] Dependency import failed:', importError);
      console.error('Import error stack:', importError.stack);
      
      return NextResponse.json(
        { 
          error: 'Failed to load required services',
          details: importError.message,
          step: 'import_dependencies',
          hint: 'Check that all required packages are installed'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ [Chat API] Unhandled error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        step: 'unknown',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  console.log('🔍 [Chat API] OPTIONS request received');
  
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

/**
 * GET handler for health check
 */
export async function GET() {
  console.log('🏥 [Chat API] Health check');
  
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/chat',
    methods: ['POST', 'OPTIONS'],
    timestamp: new Date().toISOString()
  });
}
