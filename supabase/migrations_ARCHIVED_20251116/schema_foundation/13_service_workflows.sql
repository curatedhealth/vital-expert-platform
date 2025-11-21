-- =============================================================================
-- PHASE 13: Service - Workflows (Multi-Step Automation)
-- =============================================================================
-- PURPOSE: Create workflow orchestration system
-- TABLES: 10 tables (workflows, tasks, steps, workflow_tasks, task_agents, task_tools, task_skills, task_prerequisites, workflow_step_definitions, workflow_step_connections)
-- TIME: ~25 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: workflows (multi-step processes)
-- =============================================================================
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',

  -- Classification
  workflow_type TEXT, -- 'sequential', 'parallel', 'conditional', 'hybrid'
  category TEXT, -- 'analysis', 'planning', 'execution', 'reporting'
  complexity complexity_type DEFAULT 'medium',

  -- Associations
  jtbd_id UUID REFERENCES jobs_to_be_done(id) ON DELETE SET NULL,
  solution_id UUID REFERENCES solutions(id) ON DELETE SET NULL,

  -- Configuration
  is_template BOOLEAN DEFAULT false,
  allow_manual_override BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,

  -- Execution
  estimated_duration_minutes INTEGER,
  max_concurrent_executions INTEGER DEFAULT 1,

  -- Status
  status workflow_status DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,

  -- Usage
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug, version)
);

-- Indexes for workflows
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_slug ON workflows(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_type ON workflows(workflow_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_status ON workflows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_jtbd ON workflows(jtbd_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_solution ON workflows(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_active ON workflows(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE workflows IS 'Multi-step automated processes';

-- =============================================================================
-- TABLE 2: tasks (individual workflow tasks)
-- =============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Task Configuration
  task_type TEXT, -- 'analysis', 'generation', 'review', 'decision', 'integration'
  execution_mode TEXT DEFAULT 'automatic', -- 'automatic', 'manual', 'approval_required'

  -- Input/Output Specification
  input_schema JSONB,
  output_schema JSONB,
  -- Example:
  -- {
  --   "type": "object",
  --   "properties": {
  --     "product_name": {"type": "string", "required": true},
  --     "launch_date": {"type": "string", "format": "date"}
  --   }
  -- }

  -- Execution
  estimated_duration_minutes INTEGER,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 300,

  -- Model Configuration
  model_config_id UUID REFERENCES model_configurations(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for tasks
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_slug ON tasks(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_type ON tasks(task_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_active ON tasks(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE tasks IS 'Reusable task definitions for workflows';

-- =============================================================================
-- TABLE 3: steps (task execution steps)
-- =============================================================================
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,

  -- Step Configuration
  step_type TEXT, -- 'prompt', 'tool_call', 'human_review', 'condition', 'loop'
  instruction TEXT,

  -- Conditional Logic
  condition_expression JSONB, -- JSON logic for branching
  loop_config JSONB, -- Loop configuration if step_type = 'loop'

  -- Tool/Prompt Association
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,

  -- Error Handling
  on_error TEXT DEFAULT 'retry', -- 'retry', 'skip', 'fail', 'continue'
  max_retries INTEGER DEFAULT 3,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, step_order)
);

-- Indexes for steps
CREATE INDEX idx_steps_task ON steps(task_id);
CREATE INDEX idx_steps_order ON steps(step_order);
CREATE INDEX idx_steps_type ON steps(step_type);
CREATE INDEX idx_steps_prompt ON steps(prompt_id);
CREATE INDEX idx_steps_tool ON steps(tool_id);

COMMENT ON TABLE steps IS 'Execution steps within tasks';

-- =============================================================================
-- JUNCTION TABLE 1: workflow_tasks (tasks in workflows)
-- =============================================================================
CREATE TABLE workflow_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Position & Dependencies
  task_order INTEGER NOT NULL,
  depends_on_task_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Prerequisites

  -- Execution Control
  is_required BOOLEAN DEFAULT true,
  is_parallel BOOLEAN DEFAULT false, -- Can run in parallel with siblings

  -- Input/Output Mapping
  input_mapping JSONB, -- How to map workflow inputs to task inputs
  output_mapping JSONB, -- How to map task outputs to workflow context

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(workflow_id, task_id)
);

-- Indexes
CREATE INDEX idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX idx_workflow_tasks_task ON workflow_tasks(task_id);
CREATE INDEX idx_workflow_tasks_order ON workflow_tasks(task_order);

COMMENT ON TABLE workflow_tasks IS 'Maps tasks to workflows with ordering and dependencies';

-- =============================================================================
-- JUNCTION TABLE 2: task_agents (agents assigned to tasks)
-- =============================================================================
CREATE TABLE task_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role
  agent_role TEXT DEFAULT 'executor', -- 'executor', 'reviewer', 'approver'
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, agent_id, agent_role)
);

-- Indexes
CREATE INDEX idx_task_agents_task ON task_agents(task_id);
CREATE INDEX idx_task_agents_agent ON task_agents(agent_id);
CREATE INDEX idx_task_agents_role ON task_agents(agent_role);

COMMENT ON TABLE task_agents IS 'Agents assigned to execute tasks';

-- =============================================================================
-- JUNCTION TABLE 3: task_tools (tools used in tasks)
-- =============================================================================
CREATE TABLE task_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,

  -- Configuration
  is_required BOOLEAN DEFAULT false,
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, tool_id)
);

-- Indexes
CREATE INDEX idx_task_tools_task ON task_tools(task_id);
CREATE INDEX idx_task_tools_tool ON task_tools(tool_id);

COMMENT ON TABLE task_tools IS 'Tools available to tasks';

-- =============================================================================
-- JUNCTION TABLE 4: task_skills (skills required for tasks)
-- =============================================================================
CREATE TABLE task_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Requirements
  required_proficiency domain_expertise DEFAULT 'intermediate',
  is_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, skill_id)
);

-- Indexes
CREATE INDEX idx_task_skills_task ON task_skills(task_id);
CREATE INDEX idx_task_skills_skill ON task_skills(skill_id);

COMMENT ON TABLE task_skills IS 'Skills required for task execution';

-- =============================================================================
-- TABLE 4: task_prerequisites (task dependencies)
-- =============================================================================
CREATE TABLE task_prerequisites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Dependency Type
  dependency_type TEXT DEFAULT 'blocking', -- 'blocking', 'informational', 'optional'

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, prerequisite_task_id),
  CHECK (task_id != prerequisite_task_id)
);

-- Indexes
CREATE INDEX idx_task_prereqs_task ON task_prerequisites(task_id);
CREATE INDEX idx_task_prereqs_prerequisite ON task_prerequisites(prerequisite_task_id);

COMMENT ON TABLE task_prerequisites IS 'Task dependency relationships';

-- =============================================================================
-- TABLE 5: workflow_step_definitions (visual workflow designer nodes)
-- =============================================================================
CREATE TABLE workflow_step_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Node Details
  node_type TEXT NOT NULL, -- 'start', 'end', 'task', 'decision', 'parallel', 'merge'
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Visual Position (for workflow designer UI)
  position_x INTEGER,
  position_y INTEGER,

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_workflow_step_defs_workflow ON workflow_step_definitions(workflow_id);
CREATE INDEX idx_workflow_step_defs_task ON workflow_step_definitions(task_id);
CREATE INDEX idx_workflow_step_defs_type ON workflow_step_definitions(node_type);

COMMENT ON TABLE workflow_step_definitions IS 'Visual workflow designer node definitions';

-- =============================================================================
-- TABLE 6: workflow_step_connections (edges between nodes)
-- =============================================================================
CREATE TABLE workflow_step_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_id UUID NOT NULL REFERENCES workflow_step_definitions(id) ON DELETE CASCADE,
  to_step_id UUID NOT NULL REFERENCES workflow_step_definitions(id) ON DELETE CASCADE,

  -- Connection Details
  connection_type TEXT DEFAULT 'default', -- 'default', 'condition_true', 'condition_false', 'error'
  condition_expression JSONB,

  -- Metadata
  label TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(workflow_id, from_step_id, to_step_id, connection_type)
);

-- Indexes
CREATE INDEX idx_workflow_connections_workflow ON workflow_step_connections(workflow_id);
CREATE INDEX idx_workflow_connections_from ON workflow_step_connections(from_step_id);
CREATE INDEX idx_workflow_connections_to ON workflow_step_connections(to_step_id);

COMMENT ON TABLE workflow_step_connections IS 'Connections between workflow nodes (edges in graph)';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('workflows', 'tasks', 'steps', 'workflow_tasks', 'task_agents', 'task_tools', 'task_skills', 'task_prerequisites', 'workflow_step_definitions', 'workflow_step_connections');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 13 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Workflows Service Features:';
    RAISE NOTICE '  - Multi-step process automation';
    RAISE NOTICE '  - Task orchestration';
    RAISE NOTICE '  - Dependency management';
    RAISE NOTICE '  - Visual workflow designer';
    RAISE NOTICE '  - Agent/tool/skill assignment';
    RAISE NOTICE '  - Conditional branching';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 77 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 14 (Solutions Marketplace)';
    RAISE NOTICE '';
END $$;
