-- =============================================================================
-- PHASE 16: Workflow Execution Runtime
-- =============================================================================
-- PURPOSE: Track workflow and task execution at runtime
-- TABLES: 5 tables (workflow_executions, workflow_execution_steps, workflow_approvals, workflow_logs, execution_context)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: workflow_executions (runtime execution instances)
-- =============================================================================
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Trigger
  triggered_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  trigger_type TEXT DEFAULT 'manual', -- 'manual', 'scheduled', 'webhook', 'event'

  -- Status
  status workflow_status DEFAULT 'running',
  current_step_id UUID,

  -- Input/Output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb, -- Shared context between steps

  -- Progress
  total_steps INTEGER,
  completed_steps INTEGER DEFAULT 0,
  failed_steps INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2),

  -- Metrics
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,2) DEFAULT 0,
  duration_seconds INTEGER,

  -- Error Handling
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_workflow_execs_tenant ON workflow_executions(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflow_execs_workflow ON workflow_executions(workflow_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflow_execs_triggered_by ON workflow_executions(triggered_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflow_execs_status ON workflow_executions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflow_execs_started ON workflow_executions(started_at DESC);

COMMENT ON TABLE workflow_executions IS 'Runtime execution instances of workflows';

-- =============================================================================
-- TABLE 2: workflow_execution_steps (individual step executions)
-- =============================================================================
CREATE TABLE workflow_execution_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Status
  status task_status DEFAULT 'pending',

  -- Input/Output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,

  -- Execution Details
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  model_used TEXT,

  -- Metrics
  tokens_used INTEGER,
  cost_usd NUMERIC(10,6),
  duration_ms INTEGER,

  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_workflow_exec_steps_execution ON workflow_execution_steps(execution_id);
CREATE INDEX idx_workflow_exec_steps_step ON workflow_execution_steps(step_id);
CREATE INDEX idx_workflow_exec_steps_task ON workflow_execution_steps(task_id);
CREATE INDEX idx_workflow_exec_steps_status ON workflow_execution_steps(status);
CREATE INDEX idx_workflow_exec_steps_started ON workflow_execution_steps(started_at DESC);

COMMENT ON TABLE workflow_execution_steps IS 'Individual step executions within workflow runs';

-- =============================================================================
-- TABLE 3: workflow_approvals (human approval steps)
-- =============================================================================
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE SET NULL,

  -- Approval Details
  approval_type TEXT, -- 'proceed', 'reject', 'modify'
  required_approvers UUID[] DEFAULT ARRAY[]::UUID[],
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  decision_notes TEXT,

  -- Metadata
  approval_data JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_workflow_approvals_execution ON workflow_approvals(execution_id);
CREATE INDEX idx_workflow_approvals_step ON workflow_approvals(step_id);
CREATE INDEX idx_workflow_approvals_approved_by ON workflow_approvals(approved_by);
CREATE INDEX idx_workflow_approvals_status ON workflow_approvals(status);

COMMENT ON TABLE workflow_approvals IS 'Human approval steps in workflow executions';

-- =============================================================================
-- TABLE 4: workflow_logs (detailed execution logs)
-- =============================================================================
CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE SET NULL,

  -- Log Details
  log_level TEXT NOT NULL, -- 'debug', 'info', 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,

  -- Context
  component TEXT, -- 'workflow', 'task', 'agent', 'tool', 'system'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_workflow_logs_execution ON workflow_logs(execution_id);
CREATE INDEX idx_workflow_logs_step ON workflow_logs(step_id);
CREATE INDEX idx_workflow_logs_level ON workflow_logs(log_level);
CREATE INDEX idx_workflow_logs_created ON workflow_logs(created_at DESC);

COMMENT ON TABLE workflow_logs IS 'Detailed execution logs for debugging and monitoring';

-- =============================================================================
-- TABLE 5: execution_context (shared context across executions)
-- =============================================================================
CREATE TABLE execution_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,

  -- Context Details
  context_key TEXT NOT NULL,
  context_value JSONB NOT NULL,
  context_type TEXT, -- 'variable', 'intermediate_result', 'config', 'metadata'

  -- Scope
  scope TEXT DEFAULT 'execution', -- 'execution', 'step', 'global'
  step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(execution_id, context_key, step_id)
);

-- Indexes
CREATE INDEX idx_exec_context_execution ON execution_context(execution_id);
CREATE INDEX idx_exec_context_step ON execution_context(step_id);
CREATE INDEX idx_exec_context_key ON execution_context(context_key);
CREATE INDEX idx_exec_context_scope ON execution_context(scope);

COMMENT ON TABLE execution_context IS 'Shared context data across workflow execution';

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
    AND tablename IN ('workflow_executions', 'workflow_execution_steps', 'workflow_approvals', 'workflow_logs', 'execution_context');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 16 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Workflow Execution Runtime Features:';
    RAISE NOTICE '  - Real-time execution tracking';
    RAISE NOTICE '  - Step-by-step progress monitoring';
    RAISE NOTICE '  - Human approval workflow';
    RAISE NOTICE '  - Detailed execution logging';
    RAISE NOTICE '  - Shared context management';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 88 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 17 (Deliverables & Feedback)';
    RAISE NOTICE '';
END $$;
