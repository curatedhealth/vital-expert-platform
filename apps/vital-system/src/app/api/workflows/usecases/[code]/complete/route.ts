import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Domain categorization based on workflow codes and names
function getDomain(code: string, name: string): string {
  // Digital Health
  if (code.startsWith('WF-DH') || name.toLowerCase().includes('dtx') ||
      name.toLowerCase().includes('samd') || name.toLowerCase().includes('ai/ml') ||
      name.toLowerCase().includes('decentralized') || name.toLowerCase().includes('digital')) {
    return 'PD'; // Product Development for Digital Health
  }

  // Medical Affairs
  if (code.startsWith('WF-MA') || code.startsWith('WF-MIT') ||
      name.toLowerCase().includes('kol') || name.toLowerCase().includes('medical affairs')) {
    return 'MA'; // Market Access
  }

  // Field Medical Education
  if (code.startsWith('WF-FME') || name.toLowerCase().includes('field medical')) {
    return 'EG'; // Engagement
  }

  // Regulatory
  if (code.startsWith('WF-RSR') || name.toLowerCase().includes('regulatory')) {
    return 'RA'; // Regulatory Affairs
  }

  // Real-World Evidence
  if (code.startsWith('WF-RWE') || name.toLowerCase().includes('real-world') ||
      name.toLowerCase().includes('evidence')) {
    return 'RWE';
  }

  // Clinical Development
  if (name.toLowerCase().includes('clinical') || name.toLowerCase().includes('trial')) {
    return 'CD'; // Clinical Development
  }

  // Default to Product Development for cross-functional
  return 'PD';
}

// Complexity mapping based on workflow complexity_level
function getComplexity(level: string): string {
  switch (level) {
    case 'very_high':
      return 'Expert';
    case 'high':
      return 'Advanced';
    case 'medium':
      return 'Intermediate';
    case 'low':
      return 'Basic';
    default:
      return 'Intermediate';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    console.log(`[API] Fetching complete use case data for: ${code}`);
    const startTime = Date.now();

    // Step 1: Fetch workflow template by code
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('code', code)
      .is('deleted_at', null)
      .single();

    if (templateError) {
      console.error('[API] Workflow template fetch error:', templateError);
      
      // Handle "no rows" error (PGRST116) or table not found errors
      if (templateError.code === 'PGRST116' || templateError.code === '42P01' || 
          templateError.code === 'PGRST204' || templateError.code === 'PGRST205') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Workflow not found',
            details: `No workflow with code "${code}" exists. Available workflows can be viewed on the workflows list page.`,
            debugInfo: {
              message: templateError.message,
              code: templateError.code,
              hint: templateError.hint || 'The workflow code may be incorrect or the workflow may not exist yet.'
            }
          },
          { status: 404 }
        );
      }
      
      throw templateError;
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Transform template to use case format
    const useCase = {
      id: template.id,
      code: template.code || '',
      title: template.name,
      description: template.description || `${template.name} workflow`,
      domain: getDomain(template.code || '', template.name),
      complexity: getComplexity(template.complexity_level || 'medium'),
      estimated_duration_minutes: (template.estimated_duration_hours || 0) * 60,
      deliverables: [],
      prerequisites: [],
      success_metrics: {},
    };

    // Step 2: Fetch all stages for this workflow template
    const { data: stages, error: stagesError } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('template_id', template.id)
      .order('stage_number', { ascending: true });

    if (stagesError) {
      console.warn('[API] Stages fetch error (continuing):', stagesError);
    }

    const stageIds = stages?.map(s => s.id) || [];
    
    // Transform stages to workflows format
    const workflows = (stages || []).map((stage, idx) => ({
      id: stage.id,
      use_case_id: template.id,
      name: stage.stage_name,
      unique_id: `${code}-S${stage.stage_number}`,
      description: stage.description || '',
      position: stage.stage_number || idx + 1,
      metadata: {
        estimated_duration_hours: stage.estimated_duration_hours,
        is_mandatory: stage.is_mandatory,
      },
    }));

    if (stageIds.length === 0) {
      const elapsed = Date.now() - startTime;
      console.log(`[API] ✅ Fetched use case with 0 workflows in ${elapsed}ms`);
      
      return NextResponse.json({
        success: true,
        data: { useCase, workflows: [], tasksByWorkflow: {} },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 3: Fetch all tasks for these stages
    const { data: tasks, error: tasksError } = await supabase
      .from('workflow_tasks')
      .select('*')
      .in('stage_id', stageIds)
      .order('task_number', { ascending: true });

    if (tasksError) {
      console.warn('[API] Tasks fetch error (continuing):', tasksError);
    }

    const taskIds = tasks?.map(t => t.id) || [];

    // Step 4: Fetch agents, tools, and RAG sources for all tasks in parallel
    const [agentsResult, toolsResult, ragsResult] = await Promise.all([
      taskIds.length > 0 
        ? supabase
            .from('workflow_task_agents')
            .select('*')
            .in('task_id', taskIds)
            .order('execution_order', { ascending: true })
        : { data: [], error: null },
      taskIds.length > 0 
        ? supabase
            .from('workflow_task_tools')
            .select('*')
            .in('task_id', taskIds)
        : { data: [], error: null },
      taskIds.length > 0 
        ? supabase
            .from('workflow_task_rag_sources')
            .select('*')
            .in('task_id', taskIds)
        : { data: [], error: null },
    ]);

    const agents = agentsResult.data || [];
    const tools = toolsResult.data || [];
    const rags = ragsResult.data || [];

    if (agentsResult.error) console.warn('[API] Agents fetch error:', agentsResult.error);
    if (toolsResult.error) console.warn('[API] Tools fetch error:', toolsResult.error);
    if (ragsResult.error) console.warn('[API] RAGs fetch error:', ragsResult.error);

    // Create lookup maps for efficiency
    const agentsByTask = new Map<string, any[]>();
    const toolsByTask = new Map<string, any[]>();
    const ragsByTask = new Map<string, any[]>();

    agents.forEach(agent => {
      if (!agentsByTask.has(agent.task_id)) {
        agentsByTask.set(agent.task_id, []);
      }
      agentsByTask.get(agent.task_id)!.push({
        id: agent.id,
        name: agent.agent_name,
        code: agent.agent_code || '',
        role: agent.agent_role || '',
        assignment_type: agent.assignment_type || 'primary',
        execution_order: agent.execution_order || 1,
      });
    });

    tools.forEach(tool => {
      if (!toolsByTask.has(tool.task_id)) {
        toolsByTask.set(tool.task_id, []);
      }
      toolsByTask.get(tool.task_id)!.push({
        id: tool.id,
        name: tool.tool_name,
        code: tool.tool_code || '',
        category: tool.tool_category || 'general',
        is_required: tool.is_required ?? true,
      });
    });

    rags.forEach(rag => {
      if (!ragsByTask.has(rag.task_id)) {
        ragsByTask.set(rag.task_id, []);
      }
      ragsByTask.get(rag.task_id)!.push({
        id: rag.id,
        name: rag.source_name,
        source_type: rag.source_type || 'document_store',
        description: rag.description || '',
      });
    });

    // Step 5: Organize tasks by stage (workflow) with agents, tools, and RAGs
    const tasksByWorkflow: Record<string, any[]> = {};
    
    workflows.forEach(workflow => {
      const workflowTasks = (tasks || [])
        .filter(t => t.stage_id === workflow.id)
        .map(task => ({
          id: task.id,
          workflow_id: workflow.id,
          code: task.task_code || '',
          unique_id: task.task_code || task.id,
          title: task.task_name,
          objective: task.description || '',
          position: task.task_number || 1,
          extra: {
            task_type: task.task_type,
            estimated_duration_minutes: task.estimated_duration_minutes,
          },
          agents: agentsByTask.get(task.id) || [],
          tools: toolsByTask.get(task.id) || [],
          rags: ragsByTask.get(task.id) || [],
        }));
      
      tasksByWorkflow[workflow.id] = workflowTasks;
    });

    const elapsed = Date.now() - startTime;
    const totalTasks = Object.values(tasksByWorkflow).reduce((sum, t) => sum + t.length, 0);
    const totalAgents = agents.length;
    const totalTools = tools.length;
    const totalRags = rags.length;
    
    console.log(`[API] ✅ Fetched use case with ${workflows.length} stages, ${totalTasks} tasks, ${totalAgents} agents, ${totalTools} tools, ${totalRags} RAG sources in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      data: {
        useCase,
        workflows,
        tasksByWorkflow,
      },
      stats: {
        stages: workflows.length,
        tasks: totalTasks,
        agents: totalAgents,
        tools: totalTools,
        ragSources: totalRags,
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
