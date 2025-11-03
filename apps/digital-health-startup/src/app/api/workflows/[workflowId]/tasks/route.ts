import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;
    const supabase = getServiceSupabaseClient();

    console.log('Fetching tasks for workflow:', workflowId);

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('dh_task')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('position', { ascending: true });

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError);
      throw tasksError;
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks`);

    // Fetch task assignments (agents, tools, RAGs) for all tasks
    const taskIds = tasks?.map(t => t.id) || [];
    
    // Fetch agents
    const { data: taskAgents } = await supabase
      .from('dh_task_agent')
      .select(`
        task_id,
        assignment_type,
        execution_order,
        dh_agent!inner (
          id,
          code,
          name,
          type,
          capabilities
        )
      `)
      .in('task_id', taskIds);

    // Fetch tools
    const { data: taskTools } = await supabase
      .from('dh_task_tool')
      .select(`
        task_id,
        dh_tool!inner (
          id,
          code,
          name,
          type,
          category
        )
      `)
      .in('task_id', taskIds);

    // Fetch RAG sources
    const { data: taskRags } = await supabase
      .from('dh_task_rag')
      .select(`
        task_id,
        dh_rag_source!inner (
          id,
          code,
          name,
          source_type,
          description
        )
      `)
      .in('task_id', taskIds);

    // Organize assignments by task
    const tasksWithAssignments = tasks?.map(task => ({
      ...task,
      agents: taskAgents?.filter(ta => ta.task_id === task.id).map(ta => ({
        ...ta.dh_agent,
        assignment_type: ta.assignment_type,
        execution_order: ta.execution_order
      })) || [],
      tools: taskTools?.filter(tt => tt.task_id === task.id).map(tt => tt.dh_tool) || [],
      rags: taskRags?.filter(tr => tr.task_id === task.id).map(tr => tr.dh_rag_source) || []
    })) || [];

    console.log(`✅ Added assignments to tasks`);

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksWithAssignments,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

