import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const supabase = await createClient();
    const { taskId } = params;
    const body = await request.json();
    const { 
      agentIds = [], 
      toolIds = [], 
      ragIds = [], 
      userPrompt = '',
      humanInLoop = false,
      pharmaProtocol = false,
      verifyProtocol = false,
    } = body;

    // Get current user/tenant (you may need to adjust this based on your auth setup)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the task to verify it exists and get tenant_id
    const { data: task, error: taskError } = await supabase
      .from('dh_task')
      .select('id, tenant_id')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const tenant_id = task.tenant_id;

    // Delete existing assignments
    await Promise.all([
      supabase.from('dh_task_agent').delete().eq('task_id', taskId),
      supabase.from('dh_task_tool').delete().eq('task_id', taskId),
      supabase.from('dh_task_rag').delete().eq('task_id', taskId),
    ]);

    // Insert new agent assignments
    if (agentIds.length > 0) {
      const agentAssignments = agentIds.map((agentId: string, index: number) => ({
        tenant_id,
        task_id: taskId,
        agent_id: agentId,
        assignment_type: index === 0 ? 'PRIMARY_EXECUTOR' : 'CO_EXECUTOR',
        execution_order: index + 1,
        is_parallel: false,
        max_retries: 3,
        retry_strategy: 'EXPONENTIAL_BACKOFF',
        requires_human_approval: false,
        on_failure: 'CONTINUE',
        execution_count: 0,
      }));

      const { error: agentError } = await supabase
        .from('dh_task_agent')
        .insert(agentAssignments);

      if (agentError) {
        console.error('Error inserting agent assignments:', agentError);
        return NextResponse.json(
          { success: false, error: 'Failed to save agent assignments' },
          { status: 500 }
        );
      }
    }

    // Insert new tool assignments
    if (toolIds.length > 0) {
      const toolAssignments = toolIds.map((toolId: string) => ({
        tenant_id,
        task_id: taskId,
        tool_id: toolId,
        connection_config: {},
        is_required: false,
      }));

      const { error: toolError } = await supabase
        .from('dh_task_tool')
        .insert(toolAssignments);

      if (toolError) {
        console.error('Error inserting tool assignments:', toolError);
        return NextResponse.json(
          { success: false, error: 'Failed to save tool assignments' },
          { status: 500 }
        );
      }
    }

    // Insert new RAG assignments
    if (ragIds.length > 0) {
      const ragAssignments = ragIds.map((ragId: string) => ({
        tenant_id,
        task_id: taskId,
        rag_source_id: ragId,
        search_config: {},
        citation_required: false,
        is_required: false,
      }));

      const { error: ragError } = await supabase
        .from('dh_task_rag')
        .insert(ragAssignments);

      if (ragError) {
        console.error('Error inserting RAG assignments:', ragError);
        return NextResponse.json(
          { success: false, error: 'Failed to save RAG assignments' },
          { status: 500 }
        );
      }
    }

    // Update task with user prompt and protocol settings
    const { error: updateError } = await supabase
      .from('dh_task')
      .update({
        extra: {
          userPrompt,
        },
        guardrails: {
          humanInLoop,
        },
        run_policy: {
          pharmaProtocol,
          verifyProtocol,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task:', updateError);
    }

    // Fetch updated task with all assignments
    const { data: updatedTask, error: fetchError } = await supabase
      .from('dh_task')
      .select(`
        id,
        title,
        agents:dh_task_agent(
          id,
          agent:dh_agent(id, code, name)
        ),
        tools:dh_task_tool(
          id,
          tool:dh_tool(id, code, name)
        ),
        rags:dh_task_rag(
          id,
          rag_source:dh_rag_source(id, code, name)
        )
      `)
      .eq('id', taskId)
      .single();

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task assignments updated successfully',
    });
  } catch (error) {
    console.error('Error in task assignments API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const supabase = await createClient();
    const { taskId } = params;

    const { data: task, error } = await supabase
      .from('dh_task')
      .select(`
        id,
        code,
        title,
        objective,
        position,
        extra,
        agents:dh_task_agent(
          id,
          assignment_type,
          execution_order,
          agent:dh_agent(id, code, name, agent_type)
        ),
        tools:dh_task_tool(
          id,
          tool:dh_tool(id, code, name, category, tool_type)
        ),
        rags:dh_task_rag(
          id,
          rag_source:dh_rag_source(id, code, name, source_type)
        )
      `)
      .eq('id', taskId)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

