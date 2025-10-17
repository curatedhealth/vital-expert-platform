import { NextRequest, NextResponse } from 'next/server';
import { autonomousOrchestrator } from '@/features/autonomous/autonomous-orchestrator';
import { safetyManager } from '@/features/autonomous/safety-manager';
import { memoryManager } from '@/features/autonomous/memory-manager';
import { evidenceVerifier } from '@/features/autonomous/evidence-verifier';

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
      enableRealTimeUpdates = true
    } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check safety limits
    const safetyCheck = safetyManager.checkExecutionSafety({
      maxIterations,
      maxCost,
      supervisionLevel,
      userId,
      sessionId
    });

    if (!safetyCheck.allowed) {
      return NextResponse.json(
        { error: 'Execution blocked by safety manager', details: safetyCheck.reason },
        { status: 403 }
      );
    }

    // Create a readable stream for real-time updates
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Helper function to send data
        const sendData = (data: any) => {
          const jsonData = JSON.stringify(data);
          const chunk = `data: ${jsonData}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        };

        // Helper function to send error
        const sendError = (error: any) => {
          const errorData = { type: 'error', error: error.message || error };
          sendData(errorData);
        };

        // Helper function to send completion
        const sendComplete = (result: any) => {
          sendData({ type: 'complete', result });
          controller.close();
        };

        // Execute autonomous workflow with real-time updates
        (async () => {
          try {
            // Send initial status
            sendData({
              type: 'status',
              message: 'Starting autonomous execution...',
              timestamp: new Date().toISOString()
            });

            // Set up event listeners for real-time updates
            const eventListeners = {
              'goal:extracted': (goal: any) => {
                sendData({
                  type: 'goal',
                  data: goal,
                  timestamp: new Date().toISOString()
                });
              },
              'tasks:generated': (tasks: any) => {
                sendData({
                  type: 'tasks',
                  data: tasks,
                  timestamp: new Date().toISOString()
                });
              },
              'task:started': (task: any) => {
                sendData({
                  type: 'task_started',
                  data: task,
                  timestamp: new Date().toISOString()
                });
              },
              'task:completed': (task: any) => {
                sendData({
                  type: 'task_completed',
                  data: task,
                  timestamp: new Date().toISOString()
                });
              },
              'task:failed': (task: any) => {
                sendData({
                  type: 'task_failed',
                  data: task,
                  timestamp: new Date().toISOString()
                });
              },
              'evidence:collected': (evidence: any) => {
                sendData({
                  type: 'evidence',
                  data: evidence,
                  timestamp: new Date().toISOString()
                });
              },
              'memory:updated': (memory: any) => {
                sendData({
                  type: 'memory',
                  data: memory,
                  timestamp: new Date().toISOString()
                });
              },
              'progress:updated': (progress: any) => {
                sendData({
                  type: 'progress',
                  data: progress,
                  timestamp: new Date().toISOString()
                });
              },
              'safety:check': (check: any) => {
                sendData({
                  type: 'safety',
                  data: check,
                  timestamp: new Date().toISOString()
                });
              },
              'execution:completed': (result: any) => {
                sendComplete(result);
              },
              'execution:failed': (error: any) => {
                sendError(error);
              }
            };

            // Register event listeners
            Object.entries(eventListeners).forEach(([event, handler]) => {
              autonomousOrchestrator.on(event, handler);
            });

            // Execute autonomous workflow
            const result = await autonomousOrchestrator.execute(query, {
              mode,
              agent: selectedAgent,
              agentId,
              tools: selectedTools,
              maxIterations,
              maxCost,
              supervisionLevel,
              userId,
              sessionId,
              enableRealTimeUpdates
            });

            // Clean up event listeners
            Object.entries(eventListeners).forEach(([event, handler]) => {
              autonomousOrchestrator.off(event, handler);
            });

            // Send final result
            sendComplete(result);

          } catch (error) {
            console.error('❌ [Autonomous Stream] Execution failed:', error);
            sendError(error);
          }
        })();
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ [Autonomous Stream] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
