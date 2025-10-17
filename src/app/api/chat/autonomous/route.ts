import { NextRequest, NextResponse } from 'next/server';
import { AutonomousOrchestrator } from '../../../../features/autonomous/autonomous-orchestrator';

export async function POST(request: NextRequest) {
  console.log('🚀 [Autonomous API] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Autonomous API] Request body:', { 
      query: body.query, 
      mode: body.mode,
      isAutonomousMode: body.isAutonomousMode,
      agent: body.agent
    });

    const { query, mode = 'automatic', agent = null } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create a streaming response with proper autonomous workflow
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Initialize autonomous orchestrator
        const orchestrator = new AutonomousOrchestrator();
        
        // Set up event listeners for streaming
        orchestrator.on('start', (data) => {
          console.log('🚀 [Orchestrator] Execution started:', data);
          const event = {
            type: 'reasoning',
            step: 'initialization',
            status: 'in_progress',
            description: `Initializing autonomous analysis for "${query}"...`,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('goal:extracted', (goal) => {
          console.log('🎯 [Orchestrator] Goal extracted:', goal);
          const event = {
            type: 'reasoning',
            step: 'goal_extraction',
            status: 'completed',
            description: `Goal identified: ${goal.description}`,
            timestamp: new Date().toISOString(),
            data: { goal }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('tasks:generated', (tasks) => {
          console.log('📋 [Orchestrator] Tasks generated:', tasks);
          const event = {
            type: 'task_planning',
            step: 'task_creation',
            status: 'completed',
            description: `Created ${tasks.length} tasks for execution`,
            timestamp: new Date().toISOString(),
            data: { tasks: tasks.map(t => ({ id: t.id, description: t.description, type: t.type, priority: t.priority })) }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('task:started', (task) => {
          console.log('🔄 [Orchestrator] Task started:', task);
          const event = {
            type: 'task_update',
            taskId: task.id,
            status: 'in_progress',
            description: `Executing: ${task.description}`,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('task:completed', (task) => {
          console.log('✅ [Orchestrator] Task completed:', task);
          const event = {
            type: 'task_completed',
            taskId: task.id,
            result: task.result,
            description: `Completed: ${task.description}`,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('agent:selected', (agent) => {
          console.log('🤖 [Orchestrator] Agent selected:', agent);
          const event = {
            type: 'agent_selection',
            step: 'agent_orchestration',
            status: 'completed',
            description: `Selected agent: ${agent.name} - ${agent.description}`,
            timestamp: new Date().toISOString(),
            data: { agent }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('content', (content) => {
          console.log('📝 [Orchestrator] Content generated:', content);
          const event = {
            type: 'content',
            content: content,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        });

        orchestrator.on('complete', (result) => {
          console.log('✅ [Orchestrator] Execution completed:', result);
          const event = {
            type: 'complete',
            message: 'Autonomous analysis completed successfully',
            timestamp: new Date().toISOString(),
            data: result
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          controller.close();
        });

        orchestrator.on('error', (error) => {
          console.error('❌ [Orchestrator] Error:', error);
          const event = {
            type: 'error',
            message: error.message || 'An error occurred during autonomous analysis',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          controller.close();
        });

        // Execute autonomous workflow
        const executeAutonomous = async () => {
          try {
            const options = {
              mode: mode as 'manual' | 'automatic',
              agent: agent,
              maxIterations: 10,
              maxCost: 50,
              maxDuration: 30,
              supervisionLevel: 'medium' as const,
              userId: 'hicham.naim@curated.health',
              sessionId: `session_${Date.now()}`,
              availableAgents: [] // Will be populated by orchestrator
            };

            console.log('🚀 [API] Starting autonomous execution with options:', options);
            const result = await orchestrator.execute(query, options);
            console.log('✅ [API] Autonomous execution completed:', result);
            
          } catch (error) {
            console.error('❌ [API] Autonomous execution failed:', error);
            
            // Send error event
            const errorEvent = {
              type: 'error',
              message: `Autonomous analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
            controller.close();
          }
        };

        // Start execution
        executeAutonomous();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('❌ [Autonomous API] Error:', error);
    console.error('❌ [Autonomous API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
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
