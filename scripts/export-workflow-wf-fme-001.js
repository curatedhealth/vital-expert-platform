// Export a full workflow definition (stages, tasks, agents, tools, RAG sources)
// for WF-FME-001 into a JSON file using Supabase.
//
// Usage (from repo root):
//   node scripts/export-workflow-wf-fme-001.js
//
// Output:
//   workflows/WF-FME-001.json

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const WORKFLOW_CODE = 'WF-FME-001';

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '❌ Missing Supabase configuration. Please ensure SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY are set in .env.local'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`🔄 Fetching workflow template for ${WORKFLOW_CODE}...`);

  // 1) Template
  const {
    data: template,
    error: templateError,
  } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('code', WORKFLOW_CODE)
    .maybeSingle();

  if (templateError) {
    console.error('❌ Failed to fetch workflow template:', templateError);
    process.exit(1);
  }

  if (!template) {
    console.error(`❌ No workflow template found for code ${WORKFLOW_CODE}`);
    process.exit(1);
  }

  // 2) Stages / phases
  console.log('🔄 Fetching stages / phases...');
  const {
    data: stages,
    error: stagesError,
  } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('template_id', template.id)
    .order('stage_number', { ascending: true });

  if (stagesError) {
    console.error('❌ Failed to fetch stages:', stagesError);
    process.exit(1);
  }

  const stageIds = stages.map((s) => s.id);

  // 3) Tasks
  console.log('🔄 Fetching tasks...');
  const {
    data: tasks,
    error: tasksError,
  } = await supabase
    .from('workflow_tasks')
    .select('*')
    .in('stage_id', stageIds)
    .order('task_number', { ascending: true });

  if (tasksError) {
    console.error('❌ Failed to fetch tasks:', tasksError);
    process.exit(1);
  }

  const taskIds = tasks.map((t) => t.id);

  // 4) Agents, tools, RAG sources
  console.log('🔄 Fetching agents, tools, and RAG sources...');
  const [agentsResult, toolsResult, ragsResult] = await Promise.all([
    taskIds.length
      ? supabase
          .from('workflow_task_agents')
          .select('*')
          .in('task_id', taskIds)
          .order('execution_order', { ascending: true })
      : { data: [], error: null },
    taskIds.length
      ? supabase
          .from('workflow_task_tools')
          .select('*')
          .in('task_id', taskIds)
      : { data: [], error: null },
    taskIds.length
      ? supabase
          .from('workflow_task_rag_sources')
          .select('*')
          .in('task_id', taskIds)
      : { data: [], error: null },
  ]);

  if (agentsResult.error) {
    console.error('⚠️ Agents fetch error (continuing):', agentsResult.error);
  }
  if (toolsResult.error) {
    console.error('⚠️ Tools fetch error (continuing):', toolsResult.error);
  }
  if (ragsResult.error) {
    console.error('⚠️ RAG sources fetch error (continuing):', ragsResult.error);
  }

  const agents = agentsResult.data || [];
  const tools = toolsResult.data || [];
  const rags = ragsResult.data || [];

  // 5) Build lookup maps
  const agentsByTask = new Map();
  const toolsByTask = new Map();
  const ragsByTask = new Map();

  agents.forEach((agent) => {
    if (!agentsByTask.has(agent.task_id)) {
      agentsByTask.set(agent.task_id, []);
    }
    agentsByTask.get(agent.task_id).push({
      id: agent.id,
      name: agent.agent_name,
      code: agent.agent_code || '',
      role: agent.agent_role || '',
      assignment_type: agent.assignment_type || 'primary',
      execution_order: agent.execution_order || 1,
    });
  });

  tools.forEach((tool) => {
    if (!toolsByTask.has(tool.task_id)) {
      toolsByTask.set(tool.task_id, []);
    }
    toolsByTask.get(tool.task_id).push({
      id: tool.id,
      name: tool.tool_name,
      code: tool.tool_code || '',
      category: tool.tool_category || 'general',
      is_required: tool.is_required ?? true,
    });
  });

  rags.forEach((rag) => {
    if (!ragsByTask.has(rag.task_id)) {
      ragsByTask.set(rag.task_id, []);
    }
    ragsByTask.get(rag.task_id).push({
      id: rag.id,
      name: rag.source_name,
      source_type: rag.source_type || 'document_store',
      description: rag.description || '',
    });
  });

  // 6) Assemble hierarchical JSON structure
  const stagesWithTasks = stages.map((stage) => {
    const stageTasks = tasks
      .filter((t) => t.stage_id === stage.id)
      .map((task) => ({
        id: task.id,
        task_number: task.task_number,
        code: task.task_code,
        name: task.task_name,
        description: task.description,
        task_type: task.task_type,
        estimated_duration_minutes: task.estimated_duration_minutes,
        agents: agentsByTask.get(task.id) || [],
        tools: toolsByTask.get(task.id) || [],
        rag_sources: ragsByTask.get(task.id) || [],
      }));

    return {
      id: stage.id,
      stage_number: stage.stage_number,
      name: stage.stage_name,
      description: stage.description,
      is_mandatory: stage.is_mandatory,
      estimated_duration_hours: stage.estimated_duration_hours,
      tasks: stageTasks,
    };
  });

  const result = {
    template: {
      id: template.id,
      code: template.code,
      name: template.name,
      description: template.description,
      execution_pattern: template.execution_pattern,
      category: template.category,
      estimated_duration_hours: template.estimated_duration_hours,
      priority: template.priority,
      status: template.status,
      version: template.version,
      created_at: template.created_at,
      updated_at: template.updated_at,
    },
    stages: stagesWithTasks,
    stats: {
      stages: stages.length,
      tasks: tasks.length,
      agents: agents.length,
      tools: tools.length,
      rag_sources: rags.length,
      exported_at: new Date().toISOString(),
    },
  };

  // 7) Write to JSON file
  const outDir = path.join(process.cwd(), 'workflows');
  const outPath = path.join(outDir, `${WORKFLOW_CODE}.json`);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Exported workflow to ${outPath}`);
}

main().catch((err) => {
  console.error('❌ Unexpected error while exporting workflow:', err);
  process.exit(1);
});


