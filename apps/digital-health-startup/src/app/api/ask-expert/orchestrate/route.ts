/**
 * SIMPLIFIED Ask Expert Orchestration API
 *
 * Routes to 4 simple, focused mode handlers:
 * - Mode 1: Manual Interactive (user selects agent)
 * - Mode 2: Automatic Agent Selection (orchestrator selects best agent)
 * - Mode 3: Autonomous-Automatic (orchestrator selects agent + autonomous reasoning)
 * - Mode 4: Autonomous-Manual (user selects agent + autonomous reasoning)
 */

import { NextRequest } from 'next/server';
import { executeMode1 } from '@/features/chat/services/mode1-manual-interactive';
import { executeMode2 } from '@/features/chat/services/mode2-automatic-agent-selection';
import { executeMode3 } from '@/features/chat/services/mode3-autonomous-automatic';
import { executeMode4 } from '@/features/chat/services/mode4-autonomous-manual';
import {
  withTimeout,
  MODE1_TIMEOUTS,
  TimeoutError,
} from '@/features/ask-expert/mode-1/utils/timeout-handler';
import { createClient } from '@/lib/supabase/server';

interface OrchestrateRequest {
  mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert';
  agentId?: string; // For manual mode (Mode 1 & Mode 4)
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Optional settings (user can toggle)
  enableRAG?: boolean;
  enableTools?: boolean;
  requestedTools?: string[];
  selectedRagDomains?: string[];

  // Model override from prompt composer
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string; // For Mode 2 & Mode 3 agent selection
  
  // Autonomous mode settings
  maxIterations?: number;
  confidenceThreshold?: number;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body: OrchestrateRequest = await request.json();

    // Validate
    if (!body.mode || !body.message) {
      return new Response('Missing required fields: mode, message', { status: 400 });
    }

    // Get user session and tenant ID for metrics tracking
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let tenantId: string | undefined;
    let sessionId: string | undefined;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      tenantId = profile?.tenant_id || undefined;
      sessionId = `session_${Date.now()}_${user.id}`;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Route to appropriate mode handler
          switch (body.mode) {
            case 'manual': {
              // MODE 1: Manual Interactive
              if (!body.agentId) {
                controller.enqueue(encoder.encode('data: {"error":"Agent ID required for manual mode"}\n\n'));
                controller.close();
                return;
              }

              console.log('🎯 [Orchestrate] Routing to Mode 1: Manual Interactive');

              try {
                // Execute Mode 1 - returns AsyncGenerator
              const mode1Stream = executeMode1({
                agentId: body.agentId,
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG !== false, // Default to true, only disable if explicitly false
                enableTools: body.enableTools ?? false,
                requestedTools: body.requestedTools,
                selectedRagDomains: body.selectedRagDomains,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                userId: user?.id,
                tenantId,
                  sessionId,
                });

                // Stream chunks with timeout protection
                const startTime = Date.now();
                try {
                  for await (const chunk of mode1Stream) {
                    // Check if we've exceeded the full request timeout
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= MODE1_TIMEOUTS.FULL_REQUEST) {
                      throw new TimeoutError(
                        'Request timed out after 60 seconds'
                      );
                    }

                    const event = {
                      type: 'chunk',
                      content: chunk,
                      timestamp: new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                  }

                  // Send completion
                  controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                } catch (streamError) {
                  if (streamError instanceof TimeoutError) {
                    const errorEvent = {
                      type: 'error',
                      message: streamError.message,
                      code: 'TIMEOUT_ERROR',
                      timestamp: new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                  } else {
                    throw streamError;
                  }
                }
              } catch (error) {
                const errorEvent = {
                  type: 'error',
                  message: error instanceof Error ? error.message : 'Unknown error',
                  code: error instanceof TimeoutError ? 'TIMEOUT_ERROR' : 'EXECUTION_ERROR',
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
              }
              break;
            }

            case 'automatic': {
              // MODE 2: Automatic Agent Selection
              console.log('🎯 [Orchestrate] Routing to Mode 2: Automatic Agent Selection');

              const mode2Stream = await executeMode2({
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG ?? true,
                enableTools: body.enableTools ?? false,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                userId: body.userId || user?.id,
                tenantId,
                sessionId,
              });

              // Stream chunks with agent selection info
              for await (const chunk of mode2Stream) {
                const event = {
                  type: chunk.type || 'chunk',
                  content: chunk.content,
                  agent: chunk.selectedAgent, // Include selected agent info
                  selectionReason: chunk.selectionReason,
                  confidence: chunk.confidence,
                  timestamp: chunk.timestamp || new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              }

              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              break;
            }

            case 'autonomous': {
              // MODE 3: Autonomous-Automatic
              console.log('🎯 [Orchestrate] Routing to Mode 3: Autonomous-Automatic');

              const mode3Stream = await executeMode3({
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG !== false, // Default to true, only disable if explicitly false
                enableTools: body.enableTools ?? true,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                userId: body.userId || user?.id,
                tenantId,
                sessionId,
                maxIterations: body.maxIterations ?? 10,
                confidenceThreshold: body.confidenceThreshold ?? 0.95
              });

              // Stream autonomous chunks
              try {
                for await (const chunk of mode3Stream) {
                  if (controller.desiredSize === null) {
                    console.log('⚠️ [Orchestrate] Controller closed, stopping Mode 3 stream');
                    break;
                  }
                  
                  const event = {
                    type: chunk.type,
                    content: chunk.content,
                    metadata: chunk.metadata,
                    timestamp: chunk.timestamp
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                }

                if (controller.desiredSize !== null) {
                  controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                }
              } catch (error) {
                console.error('❌ [Orchestrate] Error streaming Mode 3:', error);
                if (controller.desiredSize !== null) {
                  controller.enqueue(encoder.encode(`data: {"error":"${error instanceof Error ? error.message : 'Unknown error'}"}\n\n`));
                }
              }
              break;
            }

            case 'multi-expert': {
              // MODE 4: Autonomous-Manual
              if (!body.agentId) {
                const errorEvent = {
                  type: 'error',
                  message: 'Agent ID required for multi-expert mode',
                  content: 'Agent ID required for multi-expert mode',
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                controller.close();
                return;
              }

              console.log('🎯 [Orchestrate] Routing to Mode 4: Autonomous-Manual');

              try {
                const mode4Stream = await executeMode4({
                  agentId: body.agentId,
                  message: body.message,
                  conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG !== false, // Default to true, only disable if explicitly false
                enableTools: body.enableTools ?? true,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                maxIterations: body.maxIterations ?? 10,
                confidenceThreshold: body.confidenceThreshold ?? 0.95
              });

                // Stream autonomous chunks
                try {
                  for await (const chunk of mode4Stream) {
                    if (controller.desiredSize === null) {
                      console.log('⚠️ [Orchestrate] Controller closed, stopping Mode 4 stream');
                      break;
                    }
                    
                    // If chunk is an error, forward it directly
                    if (chunk.type === 'error') {
                      const errorEvent = {
                        type: 'error',
                        message: chunk.content || 'Error during Mode 4 execution',
                        content: chunk.content || 'Error during Mode 4 execution',
                        metadata: chunk.metadata,
                        timestamp: chunk.timestamp || new Date().toISOString()
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                      break; // Stop streaming on error
                    }
                    
                    const event = {
                      type: chunk.type,
                      content: chunk.content,
                      metadata: chunk.metadata,
                      timestamp: chunk.timestamp
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                  }

                  if (controller.desiredSize !== null) {
                    controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                  }
                } catch (streamError) {
                  console.error('❌ [Orchestrate] Error streaming Mode 4:', streamError);
                  if (controller.desiredSize !== null) {
                    const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown error during Mode 4 streaming';
                    const errorEvent = {
                      type: 'error',
                      message: errorMessage,
                      content: errorMessage,
                      timestamp: new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                  }
                }
              } catch (mode4Error) {
                console.error('❌ [Orchestrate] Error executing Mode 4:', mode4Error);
                if (controller.desiredSize !== null) {
                  const errorMessage = mode4Error instanceof Error ? mode4Error.message : 'Unknown error during Mode 4 execution';
                  const errorEvent = {
                    type: 'error',
                    message: errorMessage,
                    content: errorMessage,
                    timestamp: new Date().toISOString()
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                }
              }
              break;
            }

            default:
              const errorEvent = {
                type: 'error',
                message: 'Invalid mode',
                content: 'Invalid mode',
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error('❌ [Orchestrate] Top-level error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorEvent = {
            type: 'error',
            message: errorMessage,
            content: errorMessage,
            timestamp: new Date().toISOString()
          };
          try {
            if (controller.desiredSize !== null) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
            }
          } catch (enqueueError) {
            console.error('❌ [Orchestrate] Failed to enqueue error:', enqueueError);
          }
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('❌ [Orchestrate] Request error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}
