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

    let useCase: any = null;
    let isJTBD = false;

    // Step 1: Try fetching from dh_use_case first
    const { data: dhUseCase, error: useCaseError } = await supabase
      .from('dh_use_case')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (dhUseCase) {
      useCase = {
        ...dhUseCase,
        domain: dhUseCase.code?.split('_')[1] || 'UNKNOWN',
        source: 'Digital Health Use Cases',
      };
      console.log(`[API] ✅ Found Digital Health use case: ${code}`);
    } else {
      // Try fetching from jtbd_library (Medical Affairs)
      console.log(`[API] Trying to fetch JTBD with code: ${code}`);

      const { data: jtbd, error: jtbdError } = await supabase
        .from('jtbd_library')
        .select('*')
        .eq('jtbd_code', code)
        .maybeSingle();

      console.log(`[API] JTBD query result:`, { found: !!jtbd, error: jtbdError });

      // If not found by jtbd_code, try by id (only if it looks like a UUID)
      if (!jtbd && !jtbdError && isValidUuid(code)) {
        console.log(`[API] JTBD not found by jtbd_code, trying by id (UUID)...`);
        const { data: jtbdById, error: jtbdByIdError } = await supabase
          .from('jtbd_library')
          .select('*')
          .eq('id', code)
          .maybeSingle();

        console.log(`[API] JTBD by id result:`, { found: !!jtbdById, error: jtbdByIdError });

        if (jtbdById) {
          isJTBD = true;
          useCase = {
            id: jtbdById.id,
            code: jtbdById.jtbd_code || code,
            unique_id: jtbdById.unique_id,
            title: jtbdById.title || jtbdById.statement || 'Untitled JTBD',
            description: jtbdById.description || jtbdById.goal || '',
            domain: 'MA',
            complexity: jtbdById.complexity || 'INTERMEDIATE',
            estimated_duration_minutes: estimateDurationFromComplexity(jtbdById.complexity),
            strategic_pillar: jtbdById.function || 'Uncategorized',
            source: 'Medical Affairs JTBD Library',
            category: jtbdById.category,
            importance: jtbdById.importance,
            frequency: jtbdById.frequency,
            sector: 'Pharma',
            industry: 'Pharma',
            deliverables: parseJsonField(jtbdById.success_criteria) || [],
            prerequisites: parseJsonField(jtbdById.pain_points) || [],
            success_metrics: parseJsonField(jtbdById.success_criteria) || {},
          };
          console.log(`[API] ✅ Found JTBD by id: ${code}`);
        }
      }

      if (jtbd) {
        isJTBD = true;
        useCase = {
          id: jtbd.id,
          code: jtbd.jtbd_code || code,
          unique_id: jtbd.unique_id,
          title: jtbd.title || jtbd.statement || 'Untitled JTBD',
          description: jtbd.description || jtbd.goal || '',
          domain: 'MA',
          complexity: jtbd.complexity || 'INTERMEDIATE',
          estimated_duration_minutes: estimateDurationFromComplexity(jtbd.complexity),
          strategic_pillar: jtbd.function || 'Uncategorized',
          source: 'Medical Affairs JTBD Library',
          category: jtbd.category,
          importance: jtbd.importance,
          frequency: jtbd.frequency,
          sector: 'Pharma',
          industry: 'Pharma',
          deliverables: parseJsonField(jtbd.success_criteria) || [],
          prerequisites: parseJsonField(jtbd.pain_points) || [],
          success_metrics: parseJsonField(jtbd.success_criteria) || {},
        };
        console.log(`[API] ✅ Found JTBD by jtbd_code: ${code}`);
      }
    }

    if (!useCase) {
      console.log(`[API] ❌ Use case/JTBD not found: ${code}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Use case not found',
          details: `No use case or JTBD found with code: ${code}`,
          debugInfo: {
            code,
            checkedTables: ['dh_use_case', 'jtbd_library'],
          },
        },
        { status: 404 }
      );
    }

    // Step 2: Fetch all workflows for this use case
    // NOTE: Only query workflows if useCase.id is a valid UUID
    // JTBDs from jtbd_library have VARCHAR ids like "JTBD-MA-042" which will cause 22P02 error
    let workflows: any[] = [];
    let workflowsError: any = null;

    if (isValidUuid(useCase.id)) {
      const result = await supabase
        .from('dh_workflow')
        .select('*')
        .eq('use_case_id', useCase.id)
        .order('position', { ascending: true });

      workflows = result.data || [];
      workflowsError = result.error;

      if (workflowsError) throw workflowsError;
    } else {
      // JTBD from jtbd_library - no workflows in dh_workflow table yet
      console.log(`[API] Skipping workflow query for non-UUID use case id: ${useCase.id}`);
    }

    const workflowIds = workflows.map(w => w.id);

    if (workflowIds.length === 0) {
      console.log(`[API] No workflows found for use case: ${code}`);
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

// Helper functions
function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function estimateDurationFromComplexity(complexity?: string): number {
  if (!complexity) return 60;
  const lower = complexity.toLowerCase();
  if (lower.includes('expert') || lower.includes('high')) return 240;
  if (lower.includes('advanced')) return 120;
  if (lower.includes('intermediate') || lower.includes('medium')) return 60;
  if (lower.includes('beginner') || lower.includes('basic') || lower.includes('low')) return 30;
  return 60;
}

function parseJsonField(field: any): any {
  if (!field) return null;
  if (typeof field === 'object') return field;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  }
  return null;
}
