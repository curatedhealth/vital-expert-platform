/**
 * Execution Stream API - Server-Sent Events (SSE)
 * GET /api/executions/[id]/stream - Stream real-time execution updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: executionId } = params;

  // Verify execution exists and user has access
  const { data: execution, error: fetchError } = await supabase
    .from('workflow_executions')
    .select('*, workflows!inner(user_id)')
    .eq('id', executionId)
    .single();

  if (fetchError || !execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
  }

  // Check permission
  if (execution.workflows.user_id !== user.id) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  console.log(`📡 [SSE] Starting stream for execution: ${executionId}`);

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial state
        const initialData = {
          type: 'state_update',
          state: execution.execution_state,
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        // Poll database for updates
        let lastState = execution.execution_state;
        const pollInterval = setInterval(async () => {
          try {
            const { data: updated, error } = await supabase
              .from('workflow_executions')
              .select('status, execution_state, outputs, error_message, duration_ms')
              .eq('id', executionId)
              .single();

            if (error) {
              console.error('Error polling execution:', error);
              return;
            }

            // Check if state changed
            if (JSON.stringify(updated.execution_state) !== JSON.stringify(lastState)) {
              lastState = updated.execution_state;
              
              const updateData = {
                type: 'state_update',
                state: updated.execution_state,
                status: updated.status,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`));
            }

            // Send metrics
            if (updated.duration_ms) {
              const metricsData = {
                type: 'metrics',
                metrics: {
                  elapsedTime: updated.duration_ms,
                  totalTokens: updated.execution_state?.totalTokens || 0,
                  estimatedCost: (updated.execution_state?.totalTokens || 0) * 0.00002, // Rough estimate
                },
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(metricsData)}\n\n`));
            }

            // Check if completed or failed
            if (updated.status === 'completed') {
              const completeData = {
                type: 'complete',
                result: updated.outputs,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
              clearInterval(pollInterval);
              controller.close();
            } else if (updated.status === 'failed') {
              const errorData = {
                type: 'error',
                error: updated.error_message || 'Execution failed',
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
              clearInterval(pollInterval);
              controller.close();
            }
          } catch (pollError) {
            console.error('Error in polling interval:', pollError);
          }
        }, 500); // Poll every 500ms

        // Cleanup after 5 minutes (timeout)
        const timeout = setTimeout(() => {
          clearInterval(pollInterval);
          controller.close();
          console.log(`⏰ [SSE] Timeout for execution: ${executionId}`);
        }, 5 * 60 * 1000);

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          clearTimeout(timeout);
          controller.close();
          console.log(`🔌 [SSE] Client disconnected from execution: ${executionId}`);
        });
      } catch (error) {
        console.error('Error in SSE stream:', error);
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

