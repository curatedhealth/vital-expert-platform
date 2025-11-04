/**
 * Workflow Execution API
 * POST /api/workflows/[id]/execute - Execute workflow with Python AI Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { langGraphCodeGenerator } from '@/features/workflow-designer/generators/langgraph/LangGraphCodeGenerator';

// Python AI Engine URL (from environment or default)
const PYTHON_AI_ENGINE_URL = process.env.PYTHON_AI_ENGINE_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { inputs = {}, streaming = false, debug = false, breakpoints = [] } = body;

    // Load workflow from database
    const { data: workflow, error: fetchError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Check permission
    if (workflow.user_id !== user.id && !workflow.is_public) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    console.log(`🚀 [Execute] Starting workflow execution: ${workflow.name}`);

    // Generate Python code from workflow definition
    const codeResult = langGraphCodeGenerator.generate(workflow.workflow_definition);
    
    if (codeResult.errors.length > 0) {
      return NextResponse.json({
        error: 'Code generation failed',
        details: codeResult.errors
      }, { status: 400 });
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: id,
        status: 'pending',
        inputs,
        executed_by: user.id,
        tenant_id: workflow.tenant_id,
        execution_state: {
          nodes: workflow.workflow_definition.nodes.map((n: any) => ({
            id: n.id,
            status: 'pending'
          }))
        }
      })
      .select()
      .single();

    if (executionError) {
      console.error('Error creating execution record:', executionError);
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 });
    }

    console.log(`📝 [Execute] Execution record created: ${execution.id}`);

    // Execute via Python AI Engine (following Golden Rule)
    try {
      const pythonResponse = await fetch(`${PYTHON_AI_ENGINE_URL}/execute-langgraph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: codeResult.code,
          inputs,
          config: {
            thread_id: execution.id,
            debug,
            breakpoints
          }
        }),
      });

      if (!pythonResponse.ok) {
        throw new Error(`Python AI Engine error: ${pythonResponse.statusText}`);
      }

      // Update execution status
      await supabase
        .from('workflow_executions')
        .update({ status: 'running' })
        .eq('id', execution.id);

      // If streaming, return the stream
      if (streaming) {
        const stream = new ReadableStream({
          async start(controller) {
            const reader = pythonResponse.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
              controller.close();
              return;
            }

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));

                // Update execution state in real-time
                // (In production, use WebSocket or Server-Sent Events)
              }

              // Mark execution as completed
              await supabase
                .from('workflow_executions')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', execution.id);

              controller.close();
            } catch (error) {
              // Mark execution as failed
              await supabase
                .from('workflow_executions')
                .update({
                  status: 'failed',
                  error_message: error instanceof Error ? error.message : 'Execution failed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', execution.id);

              controller.error(error);
            }
          }
        });

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        // Non-streaming: wait for complete response
        const result = await pythonResponse.json();

        // Update execution with results
        await supabase
          .from('workflow_executions')
          .update({
            status: 'completed',
            outputs: result,
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - new Date(execution.created_at).getTime()
          })
          .eq('id', execution.id);

        // Update workflow execution count
        await supabase.rpc('increment_workflow_executions', {
          workflow_id: id
        });

        return NextResponse.json({
          execution_id: execution.id,
          status: 'completed',
          result
        });
      }
    } catch (pythonError) {
      console.error('❌ [Execute] Python AI Engine error:', pythonError);

      // Update execution as failed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_message: pythonError instanceof Error ? pythonError.message : 'Python execution failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);

      return NextResponse.json({
        error: 'Workflow execution failed',
        details: pythonError instanceof Error ? pythonError.message : 'Unknown error',
        execution_id: execution.id
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/workflows/[id]/execute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get execution history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get executions for this workflow
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching executions:', error);
      return NextResponse.json({ error: 'Failed to fetch executions' }, { status: 500 });
    }

    return NextResponse.json(executions);
  } catch (error) {
    console.error('Error in GET /api/workflows/[id]/execute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

