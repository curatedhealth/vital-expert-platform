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

interface OrchestrateRequest {
  mode: 'manual' | 'automatic' | 'autonomous' | 'multi-expert';
  agentId?: string; // For manual mode (Mode 1 & Mode 4)
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Optional settings (user can toggle)
  enableRAG?: boolean;
  enableTools?: boolean;

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

              const mode1Stream = await executeMode1({
                agentId: body.agentId,
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG ?? false,
                enableTools: body.enableTools ?? false,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000
              });

              // Stream chunks
              for await (const chunk of mode1Stream) {
                const event = {
                  type: 'chunk',
                  content: chunk,
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              }

              // Send completion
              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
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
                userId: body.userId
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
                enableRAG: body.enableRAG ?? true,
                enableTools: body.enableTools ?? true,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                userId: body.userId,
                maxIterations: body.maxIterations ?? 10,
                confidenceThreshold: body.confidenceThreshold ?? 0.95
              });

              // Stream autonomous chunks
              for await (const chunk of mode3Stream) {
                const event = {
                  type: chunk.type,
                  content: chunk.content,
                  metadata: chunk.metadata,
                  timestamp: chunk.timestamp
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              }

              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              break;
            }

            case 'multi-expert': {
              // MODE 4: Autonomous-Manual
              if (!body.agentId) {
                controller.enqueue(encoder.encode('data: {"error":"Agent ID required for multi-expert mode"}\n\n'));
                controller.close();
                return;
              }

              console.log('🎯 [Orchestrate] Routing to Mode 4: Autonomous-Manual');

              const mode4Stream = await executeMode4({
                agentId: body.agentId,
                message: body.message,
                conversationHistory: body.conversationHistory,
                enableRAG: body.enableRAG ?? true,
                enableTools: body.enableTools ?? true,
                model: body.model,
                temperature: body.temperature ?? 0.7,
                maxTokens: body.maxTokens ?? 2000,
                maxIterations: body.maxIterations ?? 10,
                confidenceThreshold: body.confidenceThreshold ?? 0.95
              });

              // Stream autonomous chunks
              for await (const chunk of mode4Stream) {
                const event = {
                  type: chunk.type,
                  content: chunk.content,
                  metadata: chunk.metadata,
                  timestamp: chunk.timestamp
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              }

              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              break;
            }

            default:
              controller.enqueue(encoder.encode('data: {"error":"Invalid mode"}\n\n'));
          }

          controller.close();
        } catch (error) {
          console.error('❌ [Orchestrate] Error:', error);
          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
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
