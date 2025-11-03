import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = getServiceSupabaseClient();

    console.log(`[API] Fetching complete use case data for: ${code}`);
    const startTime = Date.now();

    // Step 1: Fetch use case
    const { data: useCase, error: useCaseError } = await supabase
      .from('dh_use_case')
      .select('*')
      .eq('code', code)
      .single();

    if (useCaseError) {
      console.error('[API] Use case fetch error:', useCaseError);
      throw useCaseError;
    }

    if (!useCase) {
      return NextResponse.json(
        { success: false, error: 'Use case not found' },
        { status: 404 }
      );
    }

    // Step 2: Fetch all workflows for this use case
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select('*')
      .eq('use_case_id', useCase.id)
      .order('position', { ascending: true });

    if (workflowsError) throw workflowsError;

    const workflowIds = workflows?.map(w => w.id) || [];
    
    if (workflowIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { useCase, workflows: [], tasksByWorkflow: {} },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 3: Fetch all tasks for these workflows
    const { data: tasks, error: tasksError } = await supabase
      .from('dh_task')
      .select('*')
      .in('workflow_id', workflowIds)
      .order('position', { ascending: true });

    if (tasksError) throw tasksError;

    const taskIds = tasks?.map(t => t.id) || [];
    
    if (taskIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { useCase, workflows: workflows || [], tasksByWorkflow: {} },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 4: Fetch all assignments in parallel
    const [taskAgentsResult, taskToolsResult, taskRagsResult] = await Promise.all([
      supabase
        .from('dh_task_agent')
        .select('task_id, assignment_type, execution_order, agent_id')
        .in('task_id', taskIds),
      
      supabase
        .from('dh_task_tool')
        .select('task_id, tool_id')
        .in('task_id', taskIds),
      
      supabase
        .from('dh_task_rag')
        .select('task_id, rag_source_id')
        .in('task_id', taskIds),
    ]);

    if (taskAgentsResult.error) throw taskAgentsResult.error;
    if (taskToolsResult.error) throw taskToolsResult.error;
    if (taskRagsResult.error) throw taskRagsResult.error;

    const taskAgentIds = [...new Set(taskAgentsResult.data?.map((ta: any) => ta.agent_id) || [])];
    const taskToolIds = [...new Set(taskToolsResult.data?.map((tt: any) => tt.tool_id) || [])];
    const taskRagIds = [...new Set(taskRagsResult.data?.map((tr: any) => tr.rag_source_id) || [])];

    // Step 5: Fetch the actual agents, tools, and RAG sources
    const [agentsResult, toolsResult, ragsResult] = await Promise.all([
      taskAgentIds.length > 0 ? supabase.from('dh_agent').select('*').in('id', taskAgentIds) : Promise.resolve({ data: [] }),
      taskToolIds.length > 0 ? supabase.from('dh_tool').select('*').in('id', taskToolIds) : Promise.resolve({ data: [] }),
      taskRagIds.length > 0 ? supabase.from('dh_rag_source').select('*').in('id', taskRagIds) : Promise.resolve({ data: [] }),
    ]);

    const agents = agentsResult.data || [];
    const tools = toolsResult.data || [];
    const rags = ragsResult.data || [];
    const taskAgents = taskAgentsResult.data || [];
    const taskTools = taskToolsResult.data || [];
    const taskRags = taskRagsResult.data || [];

    // Step 6: Organize data by workflow
    const tasksByWorkflow: Record<string, any[]> = {};
    
    workflows?.forEach(workflow => {
      const workflowTasks = (tasks || [])
        .filter(t => t.workflow_id === workflow.id)
        .map(task => {
          // Find agents for this task
          const taskAgentAssignments = taskAgents.filter((ta: any) => ta.task_id === task.id);
          const taskAgentData = taskAgentAssignments.map((ta: any) => {
            const agent = agents.find((a: any) => a.id === ta.agent_id);
            return agent ? {
              ...agent,
              assignment_type: ta.assignment_type,
              execution_order: ta.execution_order,
            } : null;
          }).filter(Boolean);

          // Find tools for this task
          const taskToolAssignments = taskTools.filter((tt: any) => tt.task_id === task.id);
          const taskToolData = taskToolAssignments.map((tt: any) => {
            return tools.find((t: any) => t.id === tt.tool_id);
          }).filter(Boolean);

          // Find RAGs for this task
          const taskRagAssignments = taskRags.filter((tr: any) => tr.task_id === task.id);
          const taskRagData = taskRagAssignments.map((tr: any) => {
            return rags.find((r: any) => r.id === tr.rag_source_id);
          }).filter(Boolean);

          return {
            ...task,
            agents: taskAgentData.sort((a: any, b: any) => a.execution_order - b.execution_order),
            tools: taskToolData,
            rags: taskRagData,
          };
        });
      
      tasksByWorkflow[workflow.id] = workflowTasks;
    });

    const elapsed = Date.now() - startTime;
    console.log(`[API] ✅ Fetched use case with ${workflows?.length || 0} workflows and ${taskIds.length} tasks in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      data: {
        useCase,
        workflows: workflows || [],
        tasksByWorkflow,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] ❌ Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch use case',
        details: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: {
          message: error instanceof Error ? error.message : 'Unknown',
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        }
      },
      { status: 500 }
    );
  }
}
