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
  streamLangGraphMode,
  executeLangGraphMode,
} from '@/features/chat/services/langgraph-mode-orchestrator';
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
  
  // LangGraph integration (NEW)
  useLangGraph?: boolean; // Enable LangGraph workflow orchestration

  // Workflow integration (NEW)
  workflowId?: string; // ID of the workflow to use
  workflow?: any; // Workflow definition (nodes, edges, etc.)
  workflowFramework?: string; // Framework used by the workflow (langgraph, autogen, crewai)
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
          // Check if workflow is provided - use workflow execution
          if (body.workflowId && body.workflow) {
            console.log('🎯 [Orchestrate] Using workflow execution:', body.workflowId, 'Framework:', body.workflowFramework);
            
            try {
              // Route to workflow execution endpoint based on framework
              const workflowEndpoint = body.workflowFramework === 'langgraph' 
                ? '/api/langgraph-gui/execute'
                : body.workflowFramework === 'autogen'
                ? '/api/frameworks/autogen/execute'
                : body.workflowFramework === 'crewai'
                ? '/api/frameworks/crewai/execute'
                : '/api/langgraph-gui/execute'; // Default to langgraph

              // Forward request to workflow execution endpoint
              const workflowResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${workflowEndpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  workflow: body.workflow,
                  query: body.message,
                  conversationHistory: body.conversationHistory,
                  enableRAG: body.enableRAG,
                  enableTools: body.enableTools,
                  model: body.model,
                  temperature: body.temperature,
                  maxTokens: body.maxTokens,
                }),
              });

              if (!workflowResponse.ok) {
                throw new Error(`Workflow execution failed: ${workflowResponse.statusText}`);
              }

              // Stream the workflow response
              const reader = workflowResponse.body?.getReader();
              const decoder = new TextDecoder();

              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split('\n');

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.slice(6);
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                  }
                }
              }

              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              controller.close();
              return;

            } catch (workflowError) {
              console.error('❌ [Orchestrate] Workflow execution error:', workflowError);
              const errorEvent = {
                type: 'error',
                message: workflowError instanceof Error ? workflowError.message : 'Workflow execution failed',
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
              controller.close();
              return;
            }
          }

          // Check if LangGraph integration is enabled
          if (body.useLangGraph) {
            console.log('🎯 [Orchestrate] Using LangGraph workflow orchestration');
            
            try {
              // Use LangGraph for workflow management
              const langGraphStream = streamLangGraphMode({
                mode: body.mode,
                agentId: body.agentId,
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG ?? true,
                enableTools: body.enableTools ?? false,
                requestedTools: body.requestedTools,
                selectedRagDomains: body.selectedRagDomains,
                model: body.model,
                temperature: body.temperature,
                maxTokens: body.maxTokens,
                userId: body.userId || user?.id,
                tenantId,
                sessionId,
              });
              
              // Stream LangGraph workflow updates
              for await (const event of langGraphStream) {
                if (controller.desiredSize === null) {
                  console.log('⚠️ [Orchestrate] Controller closed, stopping LangGraph stream');
                  break;
                }
                
                // Stream workflow state updates
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                
                // Also stream any accumulated chunks from the state
                if (event.state?.streamedChunks && event.state.streamedChunks.length > 0) {
                  for (const chunk of event.state.streamedChunks) {
                    if (!chunk.startsWith('__mode')) { // Skip metadata chunks
                      const chunkEvent = {
                        type: 'chunk',
                        content: chunk,
                        timestamp: new Date().toISOString()
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkEvent)}\n\n`));
                    }
                  }
                }
              }
              
              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              controller.close();
              return;
              
            } catch (langGraphError) {
              console.error('❌ [Orchestrate] LangGraph error:', langGraphError);
              const errorEvent = {
                type: 'error',
                message: langGraphError instanceof Error ? langGraphError.message : 'LangGraph execution failed',
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
              controller.close();
              return;
            }
          }
          
          // Standard mode handler routing (existing logic)
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
                console.error('❌ [Orchestrate] Mode 1 error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const errorStack = error instanceof Error ? error.stack : undefined;
                const errorEvent = {
                  type: 'error',
                  message: errorMessage,
                  code: error instanceof TimeoutError ? 'TIMEOUT_ERROR' : 'EXECUTION_ERROR',
                  timestamp: new Date().toISOString(),
                  ...(errorStack && { stack: errorStack }),
                  ...(error instanceof Error && { name: error.name }),
                };
                try {
                  if (controller.desiredSize !== null) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                  }
                } catch (enqueueError) {
                  console.error('❌ [Orchestrate] Failed to enqueue error:', enqueueError);
                }
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
              // MODE 4: Agentic + Auto Selection (system picks agent + autonomous reasoning)
              // Golden Rule: 'autonomous' = Mode 4 (Agentic + Auto)
              console.log('🎯 [Orchestrate] Routing to Mode 4: Agentic + Auto Selection');

              try {
                const mode3Stream = executeMode3({
                  message: body.message,
                  conversationHistory: body.conversationHistory,
                  enableRAG: body.enableRAG !== false,
                  enableTools: body.enableTools ?? true,
                  requestedTools: body.requestedTools,
                  selectedRagDomains: body.selectedRagDomains,
                  model: body.model,
                  temperature: body.temperature ?? 0.7,
                  maxTokens: body.maxTokens ?? 2000,
                  maxIterations: body.maxIterations ?? 10,
                  confidenceThreshold: body.confidenceThreshold ?? 0.95,
                  userId: body.userId || user?.id,
                  tenantId,
                  sessionId
                });

                // Stream chunks (Mode 4 uses executeMode3 which yields AutonomousStreamChunk objects)
                for await (const chunk of mode3Stream) {
                  if (controller.desiredSize === null) {
                    console.log('⚠️ [Orchestrate] Controller closed, stopping Mode 4 stream');
                    break;
                  }

                  const event = {
                    type: chunk.type || 'chunk',
                    content: chunk.content,
                    metadata: chunk.metadata,
                    sources: chunk.sources,
                    timestamp: chunk.timestamp || new Date().toISOString()
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                }

                if (controller.desiredSize !== null) {
                  controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                }
              } catch (error) {
                console.error('❌ [Orchestrate] Error executing Mode 4:', error);
                if (controller.desiredSize !== null) {
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error during Mode 4 execution';
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

            case 'multi-expert': {
              // MODE 3: Agentic + Manual Selection (user picks agent + autonomous reasoning)
              // Golden Rule: 'multi-expert' = Mode 3 (Agentic + Manual)
              if (!body.agentId) {
                const errorEvent = {
                  type: 'error',
                  message: 'Agent ID required for Mode 3 (Agentic + Manual)',
                  content: 'Agent ID required for Mode 3 (Agentic + Manual)',
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
                controller.close();
                return;
              }

              console.log('🎯 [Orchestrate] Routing to Mode 3: Agentic + Manual Selection (user-selected agent)');

              try {
                const mode4Stream = executeMode4({
                  agentId: body.agentId,
                  message: body.message,
                  conversationHistory: body.conversationHistory,
                  enableRAG: body.enableRAG !== false,
                  enableTools: body.enableTools !== false, // Tools enabled by default
                  requestedTools: body.requestedTools,
                  selectedRagDomains: body.selectedRagDomains,
                  model: body.model,
                  temperature: body.temperature ?? 0.7,
                  maxTokens: body.maxTokens ?? 2000,
                  maxIterations: body.maxIterations ?? 10,
                  confidenceThreshold: body.confidenceThreshold ?? 0.95,
                  tenantId,
                  sessionId,
                  userId: body.userId || user?.id
                });

                // Stream chunks (Mode 3 uses executeMode4 which yields AutonomousStreamChunk objects)
                try {
                  for await (const chunk of mode4Stream) {
                    if (controller.desiredSize === null) {
                      console.log('⚠️ [Orchestrate] Controller closed, stopping Mode 3 stream');
                      break;
                    }

                    // Mode 3 yields objects with type, content, metadata
                    const event = {
                      type: chunk.type || 'chunk',
                      content: chunk.content,
                      metadata: chunk.metadata,
                      sources: chunk.sources,
                      timestamp: chunk.timestamp || new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                  }

                  if (controller.desiredSize !== null) {
                    controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
                  }
                } catch (streamError) {
                  console.error('❌ [Orchestrate] Error streaming Mode 3:', streamError);
                  if (controller.desiredSize !== null) {
                    const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown error during Mode 3 streaming';
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
                console.error('❌ [Orchestrate] Error executing Mode 3:', mode4Error);
                if (controller.desiredSize !== null) {
                  const errorMessage = mode4Error instanceof Error ? mode4Error.message : 'Unknown error during Mode 3 execution';
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
