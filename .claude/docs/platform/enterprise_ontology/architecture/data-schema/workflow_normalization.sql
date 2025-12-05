-- ==========================================
-- FILE: workflow_normalization.sql
-- PURPOSE: Complete workflow normalization integrating with JTBD system
-- PHASE: Workflow Integration
-- DEPENDENCIES: JTBD Phase 1-4 complete
-- GOLDEN RULES: Rule #1 (Zero JSONB for structured config), Rule #2 (Full Normalization), Rule #5 (work_mode explicit)
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== WORKFLOW NORMALIZATION & JTBD INTEGRATION ===';
  RAISE NOTICE 'Implementing LangGraph-ready workflow model...';
END $$;

-- ==========================================
-- PHASE 1: Add work_mode and binding metadata
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 1: Adding work_mode and binding metadata...';
END $$;

-- 1.1: Enhance workflow_templates
ALTER TABLE workflow_templates
  ADD COLUMN IF NOT EXISTS work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'adhoc')),
  ADD COLUMN IF NOT EXISTS binding_type TEXT CHECK (binding_type IN ('process', 'project', 'standalone')),
  ADD COLUMN IF NOT EXISTS process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS project_type_id UUID REFERENCES project_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workflow_templates_work_mode ON workflow_templates(work_mode);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_binding ON workflow_templates(binding_type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_process ON workflow_templates(process_id) WHERE process_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_templates_project_type ON workflow_templates(project_type_id) WHERE project_type_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Enhanced workflow_templates with work_mode and binding metadata';
END $$;

-- 1.2: Add work_mode to tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'both')),
  ADD COLUMN IF NOT EXISTS typical_frequency TEXT CHECK (typical_frequency IN ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'adhoc'));

CREATE INDEX IF NOT EXISTS idx_tasks_work_mode ON tasks(work_mode);
CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON tasks(typical_frequency);

DO $$
BEGIN
  RAISE NOTICE '✓ Enhanced tasks with work_mode and typical_frequency';
END $$;

-- 1.3: Add work_mode to processes and projects
ALTER TABLE processes
  ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'routine' CHECK (work_mode IN ('routine', 'operational'));

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'project' CHECK (work_mode IN ('project', 'strategic', 'tactical'));

DO $$
BEGIN
  RAISE NOTICE '✓ Added work_mode to processes and projects';
END $$;

-- ==========================================
-- PHASE 2: Create task input/output definitions
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 2: Creating normalized task input/output definitions...';
END $$;

-- 2.1: Task input definitions
CREATE TABLE IF NOT EXISTS task_input_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array', 'file', etc.
  description TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  default_value TEXT,
  validation_rule TEXT,
  example_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_task_input_name UNIQUE(task_id, name)
);

CREATE INDEX IF NOT EXISTS idx_task_input_definitions_task ON task_input_definitions(task_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Created task_input_definitions';
END $$;

-- 2.2: Task output definitions
CREATE TABLE IF NOT EXISTS task_output_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  description TEXT,
  example_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_task_output_name UNIQUE(task_id, name)
);

CREATE INDEX IF NOT EXISTS idx_task_output_definitions_task ON task_output_definitions(task_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Created task_output_definitions';
END $$;

-- ==========================================
-- PHASE 3: LangGraph Component Registry
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 3: Creating LangGraph component registry...';
END $$;

-- 3.1: Component registry
CREATE TABLE IF NOT EXISTS lang_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  component_type TEXT NOT NULL CHECK (component_type IN ('tool', 'llm_chain', 'router', 'parallel', 'subgraph', 'condition', 'transform')),
  python_module TEXT NOT NULL,
  callable_name TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Component metadata
  input_schema JSONB, -- Keep JSONB for dynamic component definitions
  output_schema JSONB,
  config_schema JSONB,
  
  -- Documentation
  usage_example TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT unique_lang_component_slug UNIQUE(slug)
);

CREATE INDEX IF NOT EXISTS idx_lang_components_type ON lang_components(component_type);
CREATE INDEX IF NOT EXISTS idx_lang_components_active ON lang_components(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_lang_components_module ON lang_components(python_module);

DO $$
BEGIN
  RAISE NOTICE '✓ Created lang_components registry';
END $$;

-- 3.2: Link task_steps to components
ALTER TABLE task_steps
  ADD COLUMN IF NOT EXISTS component_id UUID REFERENCES lang_components(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_task_steps_component ON task_steps(component_id) WHERE component_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Linked task_steps to lang_components';
END $$;

-- ==========================================
-- PHASE 4: Workflow-Task-JTBD Integration Views
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 4: Creating workflow integration views...';
END $$;

-- 4.1: Routine workflows view
CREATE OR REPLACE VIEW v_routine_workflows AS
SELECT 
  wt.id,
  wt.name,
  wt.jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  wt.work_mode,
  wt.binding_type,
  wt.process_id,
  p.name as process_name,
  wt.workflow_type,
  wt.description,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count
FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN processes p ON wt.process_id = p.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
WHERE wt.work_mode = 'routine'
GROUP BY wt.id, wt.name, wt.jtbd_id, j.code, j.name, wt.work_mode, 
         wt.binding_type, wt.process_id, p.name, wt.workflow_type, wt.description;

DO $$
BEGIN
  RAISE NOTICE '✓ Created v_routine_workflows';
END $$;

-- 4.2: Project workflows view
CREATE OR REPLACE VIEW v_project_workflows AS
SELECT 
  wt.id,
  wt.name,
  wt.jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  wt.work_mode,
  wt.binding_type,
  wt.project_type_id,
  pt.name as project_type_name,
  wt.workflow_type,
  wt.description,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count
FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN project_types pt ON wt.project_type_id = pt.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
WHERE wt.work_mode = 'project'
GROUP BY wt.id, wt.name, wt.jtbd_id, j.code, j.name, wt.work_mode, 
         wt.binding_type, wt.project_type_id, pt.name, wt.workflow_type, wt.description;

DO $$
BEGIN
  RAISE NOTICE '✓ Created v_project_workflows';
END $$;

-- 4.3: Complete workflow structure view
CREATE OR REPLACE VIEW v_workflow_complete AS
SELECT 
  wt.id as workflow_id,
  wt.name as workflow_name,
  wt.work_mode,
  wt.binding_type,
  wt.workflow_type,
  
  -- JTBD linkage
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.complexity as jtbd_complexity,
  
  -- Stage info
  ws.id as stage_id,
  ws.stage_number,
  ws.stage_name,
  
  -- Task info (workflow_tasks are self-contained, not linked to tasks table yet)
  wtask.id as workflow_task_id,
  wtask.task_number,
  wtask.task_name,
  wtask.task_type,
  wtask.estimated_duration_minutes,
  
  -- Counts
  COUNT(DISTINCT wtask.id) as task_count
  
FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
GROUP BY 
  wt.id, wt.name, wt.work_mode, wt.binding_type, wt.workflow_type,
  j.id, j.code, j.name, j.complexity,
  ws.id, ws.stage_number, ws.stage_name,
  wtask.id, wtask.task_number, wtask.task_name, wtask.task_type, wtask.estimated_duration_minutes;

DO $$
BEGIN
  RAISE NOTICE '✓ Created v_workflow_complete';
END $$;

-- 4.4: JTBD with workflow coverage view
CREATE OR REPLACE VIEW v_jtbd_workflow_coverage AS
SELECT 
  j.id as jtbd_id,
  j.code,
  j.name,
  j.job_type,
  j.complexity,
  j.frequency,
  
  COUNT(DISTINCT wt.id) as workflow_count,
  COUNT(DISTINCT CASE WHEN wt.work_mode = 'routine' THEN wt.id END) as routine_workflow_count,
  COUNT(DISTINCT CASE WHEN wt.work_mode = 'project' THEN wt.id END) as project_workflow_count,
  
  STRING_AGG(DISTINCT wt.name, ', ' ORDER BY wt.name) as workflow_names,
  
  -- Total complexity metrics
  SUM(ws_counts.stage_count) as total_stages,
  SUM(wtask_counts.task_count) as total_tasks
  
FROM jtbd j
LEFT JOIN workflow_templates wt ON j.id = wt.jtbd_id
LEFT JOIN LATERAL (
  SELECT COUNT(*) as stage_count 
  FROM workflow_stages 
  WHERE template_id = wt.id
) ws_counts ON TRUE
LEFT JOIN LATERAL (
  SELECT COUNT(DISTINCT wtask.id) as task_count
  FROM workflow_stages ws
  JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
  WHERE ws.template_id = wt.id
) wtask_counts ON TRUE
WHERE j.deleted_at IS NULL
GROUP BY j.id, j.code, j.name, j.job_type, j.complexity, j.frequency;

DO $$
BEGIN
  RAISE NOTICE '✓ Created v_jtbd_workflow_coverage';
END $$;

-- ==========================================
-- PHASE 5: Seed LangGraph Components
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 5: Seeding common LangGraph components...';
END $$;

-- Seed common components
INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version) VALUES
  ('OpenAI Chat', 'openai-chat', 'OpenAI chat completion', 'llm_chain', 'langchain.chat_models', 'ChatOpenAI', '1.0.0'),
  ('Claude Chat', 'claude-chat', 'Anthropic Claude chat', 'llm_chain', 'langchain.chat_models', 'ChatAnthropic', '1.0.0'),
  ('Vector Store Retriever', 'vector-retriever', 'Retrieve from vector store', 'tool', 'langchain.retrievers', 'VectorStoreRetriever', '1.0.0'),
  ('SQL Database Tool', 'sql-database', 'Query SQL database', 'tool', 'langchain.tools', 'SQLDatabaseTool', '1.0.0'),
  ('Python REPL', 'python-repl', 'Execute Python code', 'tool', 'langchain.tools', 'PythonREPLTool', '1.0.0'),
  ('HTTP Request', 'http-request', 'Make HTTP API calls', 'tool', 'langchain.tools', 'RequestsGetTool', '1.0.0'),
  ('Conditional Router', 'conditional-router', 'Route based on conditions', 'router', 'langgraph.graph', 'ConditionalEdge', '1.0.0'),
  ('Parallel Executor', 'parallel-exec', 'Execute nodes in parallel', 'parallel', 'langgraph.graph', 'parallel', '1.0.0'),
  ('Data Transform', 'data-transform', 'Transform data between steps', 'transform', 'vital.transforms', 'DataTransform', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  component_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO component_count FROM lang_components;
  RAISE NOTICE '✓ Seeded % LangGraph components', component_count;
END $$;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

DO $$
DECLARE
  workflow_count INTEGER;
  routine_count INTEGER;
  project_count INTEGER;
  task_count INTEGER;
  component_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== WORKFLOW NORMALIZATION VERIFICATION ===';
  
  SELECT COUNT(*) INTO workflow_count FROM workflow_templates;
  RAISE NOTICE 'Total workflow templates: %', workflow_count;
  
  SELECT COUNT(*) INTO routine_count FROM workflow_templates WHERE work_mode = 'routine';
  RAISE NOTICE 'Routine workflows: %', routine_count;
  
  SELECT COUNT(*) INTO project_count FROM workflow_templates WHERE work_mode = 'project';
  RAISE NOTICE 'Project workflows: %', project_count;
  
  SELECT COUNT(*) INTO task_count FROM tasks WHERE work_mode IS NOT NULL;
  RAISE NOTICE 'Tasks with work_mode: %', task_count;
  
  SELECT COUNT(*) INTO component_count FROM lang_components WHERE is_active = TRUE;
  RAISE NOTICE 'Active LangGraph components: %', component_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '✓✓✓ WORKFLOW NORMALIZATION COMPLETE ✓✓✓';
END $$;

-- Human-readable verification
SELECT 
  'Workflow Templates' as entity,
  COUNT(*)::TEXT as total,
  COUNT(CASE WHEN work_mode = 'routine' THEN 1 END)::TEXT as routine,
  COUNT(CASE WHEN work_mode = 'project' THEN 1 END)::TEXT as project,
  COUNT(CASE WHEN work_mode = 'adhoc' THEN 1 END)::TEXT as adhoc
FROM workflow_templates

UNION ALL

SELECT 
  'Tasks',
  COUNT(*)::TEXT,
  COUNT(CASE WHEN work_mode = 'routine' THEN 1 END)::TEXT,
  COUNT(CASE WHEN work_mode = 'project' THEN 1 END)::TEXT,
  COUNT(CASE WHEN work_mode = 'both' THEN 1 END)::TEXT
FROM tasks

UNION ALL

SELECT 
  'LangGraph Components',
  COUNT(*)::TEXT,
  COUNT(CASE WHEN component_type = 'tool' THEN 1 END)::TEXT as tools,
  COUNT(CASE WHEN component_type = 'llm_chain' THEN 1 END)::TEXT as llm_chains,
  COUNT(CASE WHEN is_active THEN 1 END)::TEXT as active
FROM lang_components;

