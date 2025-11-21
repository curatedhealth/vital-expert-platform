-- =============================================================================
-- PHASE 14: Service - Solutions Marketplace (Junction Tables)
-- =============================================================================
-- PURPOSE: Connect solutions to agents, workflows, prompts, templates, knowledge
-- TABLES: 6 tables (solution_agents, solution_workflows, solution_prompts, solution_templates, solution_knowledge, subscription_tiers)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- JUNCTION TABLE 1: solution_agents (agents included in solutions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS solution_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role in Solution
  agent_role TEXT, -- 'primary', 'supporting', 'optional'
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Configuration Override
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, agent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_agents_solution ON solution_agents(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_agents_agent ON solution_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_solution_agents_featured ON solution_agents(is_featured) WHERE is_featured = true;

COMMENT ON TABLE solution_agents IS 'Agents included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 2: solution_workflows (workflows in solutions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS solution_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Configuration
  is_default BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, workflow_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_workflows_solution ON solution_workflows(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_workflows_workflow ON solution_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_solution_workflows_default ON solution_workflows(is_default);

COMMENT ON TABLE solution_workflows IS 'Workflows included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 3: solution_prompts (prompts in solutions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS solution_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Organization
  category TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, prompt_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_prompts_solution ON solution_prompts(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_prompts_prompt ON solution_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_solution_prompts_category ON solution_prompts(category);

COMMENT ON TABLE solution_prompts IS 'Prompts included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 4: solution_templates (templates in solutions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS solution_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,

  -- Organization
  category TEXT,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, template_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_templates_solution ON solution_templates(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_templates_template ON solution_templates(template_id);

COMMENT ON TABLE solution_templates IS 'Templates included in solution packages';

-- =============================================================================
-- JUNCTION TABLE 5: solution_knowledge (knowledge sources in solutions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS solution_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, source_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_knowledge_solution ON solution_knowledge(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_knowledge_source ON solution_knowledge(source_id);
CREATE INDEX IF NOT EXISTS idx_solution_knowledge_score ON solution_knowledge(relevance_score DESC);

COMMENT ON TABLE solution_knowledge IS 'Knowledge sources included in solution packages';

-- =============================================================================
-- TABLE 1: subscription_tiers (pricing and feature tiers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Tier Level
  tier_level INTEGER NOT NULL, -- 0=free, 1=starter, 2=professional, 3=enterprise, 4=white_label

  -- Pricing
  price_usd_monthly NUMERIC(10,2),
  price_usd_annually NUMERIC(10,2),
  billing_period TEXT DEFAULT 'monthly', -- 'monthly', 'annually', 'custom'

  -- Limits
  max_users INTEGER,
  max_agents INTEGER,
  max_storage_gb INTEGER,
  max_api_calls_per_month INTEGER,
  max_workflows INTEGER,
  max_panels INTEGER,

  -- Features
  features JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "custom_agents": true,
  --   "panel_discussions": true,
  --   "workflow_automation": true,
  --   "white_label": false,
  --   "sso": false,
  --   "api_access": true,
  --   "priority_support": false
  -- }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_slug ON subscription_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_level ON subscription_tiers(tier_level);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);

COMMENT ON TABLE subscription_tiers IS 'Subscription tier definitions with pricing and limits';

-- =============================================================================
-- SEED DATA: Subscription Tiers
-- =============================================================================

INSERT INTO subscription_tiers (id, name, slug, description, tier_level, price_usd_monthly, price_usd_annually, max_users, max_agents, max_storage_gb, max_api_calls_per_month, max_workflows, max_panels, features) VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'Free',
    'free',
    'Get started with basic features',
    0,
    0.00,
    0.00,
    5,
    10,
    1,
    1000,
    5,
    0,
    jsonb_build_object(
      'custom_agents', false,
      'panel_discussions', false,
      'workflow_automation', true,
      'white_label', false,
      'sso', false,
      'api_access', false,
      'priority_support', false
    )
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Starter',
    'starter',
    'For small teams getting started',
    1,
    49.00,
    490.00,
    10,
    25,
    10,
    10000,
    20,
    5,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', false,
      'sso', false,
      'api_access', true,
      'priority_support', false
    )
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'Professional',
    'professional',
    'For growing teams',
    2,
    199.00,
    1990.00,
    50,
    100,
    100,
    50000,
    100,
    25,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', false,
      'sso', true,
      'api_access', true,
      'priority_support', true
    )
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'Enterprise',
    'enterprise',
    'For large organizations',
    3,
    NULL, -- Custom pricing
    NULL,
    999999,
    999999,
    999999,
    999999999,
    999999,
    999999,
    jsonb_build_object(
      'custom_agents', true,
      'panel_discussions', true,
      'workflow_automation', true,
      'white_label', true,
      'sso', true,
      'api_access', true,
      'priority_support', true,
      'dedicated_support', true,
      'custom_integrations', true,
      'sla', true
    )
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    tier_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('solution_agents', 'solution_workflows', 'solution_prompts', 'solution_templates', 'solution_knowledge', 'subscription_tiers');

    SELECT COUNT(*) INTO tier_count FROM subscription_tiers;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 14 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Subscription tiers seeded: %', tier_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Solutions Marketplace Features:';
    RAISE NOTICE '  - Solution-agent mapping';
    RAISE NOTICE '  - Solution-workflow mapping';
    RAISE NOTICE '  - Solution-prompt mapping';
    RAISE NOTICE '  - Solution-template mapping';
    RAISE NOTICE '  - Solution-knowledge mapping';
    RAISE NOTICE '  - Subscription tiers (Free, Starter, Professional, Enterprise)';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 83 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 15 (Agent Relationships)';
    RAISE NOTICE '';
END $$;
-- =============================================================================
-- PHASE 15: Agent Relationship Junction Tables
-- =============================================================================
-- PURPOSE: Verify all agent junction tables are created
-- TABLES: 8 tables (agent_prompts, agent_tools, agent_skills, agent_knowledge, agent_industries - already created in previous phases)
-- TIME: ~5 minutes (verification only)
-- =============================================================================

-- NOTE: Most agent junction tables were already created in earlier phases:
-- - agent_prompts (Phase 07)
-- - agent_tools (Phase 10)
-- - agent_skills (Phase 10)
-- - agent_knowledge (Phase 10)
-- - agent_industries (Phase 05)
-- - task_agents (Phase 13)

-- This phase adds any remaining agent relationship tables if needed

-- =============================================================================
-- VERIFICATION: Check all agent junction tables exist
-- =============================================================================

DO $$
DECLARE
    existing_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'agent_prompts',
        'agent_tools',
        'agent_skills',
        'agent_knowledge',
        'agent_industries',
        'task_agents'
    ];
    missing_table TEXT;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = ANY(expected_tables);

    IF existing_count < array_length(expected_tables, 1) THEN
        RAISE NOTICE 'WARNING: Not all agent junction tables exist';
        FOR missing_table IN
            SELECT unnest(expected_tables)
            EXCEPT
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        LOOP
            RAISE NOTICE 'Missing table: %', missing_table;
        END LOOP;
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ PHASE 15 COMPLETE (VERIFICATION)';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Agent junction tables verified: %', existing_count;
        RAISE NOTICE '';
        RAISE NOTICE 'Junction Tables:';
        RAISE NOTICE '  - agent_prompts (agents → prompts)';
        RAISE NOTICE '  - agent_tools (agents → tools)';
        RAISE NOTICE '  - agent_skills (agents → skills)';
        RAISE NOTICE '  - agent_knowledge (agents → knowledge)';
        RAISE NOTICE '  - agent_industries (agents → industries)';
        RAISE NOTICE '  - task_agents (tasks → agents)';
        RAISE NOTICE '';
        RAISE NOTICE 'Cumulative Progress: 83 tables verified';
        RAISE NOTICE '';
        RAISE NOTICE 'Next: Run Phase 16 (Workflow Execution Runtime)';
        RAISE NOTICE '';
    END IF;
END $$;
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
CREATE TABLE IF NOT EXISTS workflow_executions (
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
CREATE INDEX IF NOT EXISTS idx_workflow_execs_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execs_triggered_by ON workflow_executions(triggered_by);
CREATE INDEX IF NOT EXISTS idx_workflow_execs_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execs_started ON workflow_executions(started_at DESC);

COMMENT ON TABLE workflow_executions IS 'Runtime execution instances of workflows';

-- =============================================================================
-- TABLE 2: workflow_execution_steps (individual step executions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_execution_steps (
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
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_execution ON workflow_execution_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_step ON workflow_execution_steps(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_task ON workflow_execution_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_status ON workflow_execution_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_started ON workflow_execution_steps(started_at DESC);

COMMENT ON TABLE workflow_execution_steps IS 'Individual step executions within workflow runs';

-- =============================================================================
-- TABLE 3: workflow_approvals (human approval steps)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_approvals (
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
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_execution ON workflow_approvals(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_step ON workflow_approvals(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approved_by ON workflow_approvals(approved_by);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals(status);

COMMENT ON TABLE workflow_approvals IS 'Human approval steps in workflow executions';

-- =============================================================================
-- TABLE 4: workflow_logs (detailed execution logs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_logs (
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
CREATE INDEX IF NOT EXISTS idx_workflow_logs_execution ON workflow_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_step ON workflow_logs(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_level ON workflow_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created ON workflow_logs(created_at DESC);

COMMENT ON TABLE workflow_logs IS 'Detailed execution logs for debugging and monitoring';

-- =============================================================================
-- TABLE 5: execution_context (shared context across executions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS execution_context (
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
CREATE INDEX IF NOT EXISTS idx_exec_context_execution ON execution_context(execution_id);
CREATE INDEX IF NOT EXISTS idx_exec_context_step ON execution_context(step_id);
CREATE INDEX IF NOT EXISTS idx_exec_context_key ON execution_context(context_key);
CREATE INDEX IF NOT EXISTS idx_exec_context_scope ON execution_context(scope);

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
-- =============================================================================
-- PHASE 17: Deliverables & Feedback
-- =============================================================================
-- PURPOSE: Track outputs, artifacts, and user feedback
-- TABLES: 6 tables (deliverables, artifacts, consultation_feedback, votes, vote_records, deliverable_versions)
-- TIME: ~10 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: deliverables (workflow/consultation outputs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Source (one of these)
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panel_discussions(id) ON DELETE CASCADE,

  -- Deliverable Details
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT, -- 'report', 'analysis', 'recommendation', 'document', 'presentation'
  format TEXT DEFAULT 'markdown', -- 'markdown', 'pdf', 'docx', 'html', 'json'

  -- Content
  content TEXT,
  content_url TEXT, -- Link to file in storage

  -- Template
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'final', 'archived'
  version TEXT DEFAULT '1.0.0',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_workflow ON deliverables(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_consultation ON deliverables(consultation_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_panel ON deliverables(panel_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_type ON deliverables(deliverable_type);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);

COMMENT ON TABLE deliverables IS 'Output deliverables from workflows and consultations';

-- =============================================================================
-- TABLE 2: artifacts (intermediate outputs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Source
  execution_step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,

  -- Artifact Details
  name TEXT NOT NULL,
  artifact_type TEXT, -- 'data', 'chart', 'table', 'image', 'file'
  mime_type TEXT,

  -- Content
  content JSONB,
  file_url TEXT,
  file_size_bytes BIGINT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artifacts_step ON artifacts(execution_step_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_deliverable ON artifacts(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);

COMMENT ON TABLE artifacts IS 'Intermediate artifacts and attachments';

-- =============================================================================
-- TABLE 3: consultation_feedback (user ratings and feedback)
-- =============================================================================
CREATE TABLE IF NOT EXISTS consultation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source (one of these)
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panel_discussions(id) ON DELETE CASCADE,
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,

  -- Feedback
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,

  -- Categories
  was_helpful BOOLEAN,
  was_accurate BOOLEAN,
  was_complete BOOLEAN,

  -- Detailed Ratings
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  relevance_rating INTEGER CHECK (relevance_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_consultation ON consultation_feedback(consultation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_panel ON consultation_feedback(panel_id);
CREATE INDEX IF NOT EXISTS idx_feedback_workflow ON consultation_feedback(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON consultation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON consultation_feedback(rating);

COMMENT ON TABLE consultation_feedback IS 'User feedback and ratings for consultations and workflows';

-- =============================================================================
-- TABLE 4: votes (generic voting system)
-- =============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Vote Context
  vote_context TEXT NOT NULL, -- 'deliverable', 'recommendation', 'decision'
  context_id UUID NOT NULL, -- ID of the thing being voted on

  -- Vote Details
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vote_type TEXT, -- 'upvote', 'downvote', 'approve', 'reject'
  vote_weight INTEGER DEFAULT 1,

  -- Rationale
  comment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(vote_context, context_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_votes_context ON votes(vote_context, context_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(vote_type);

COMMENT ON TABLE votes IS 'Generic voting system for various contexts';

-- =============================================================================
-- TABLE 5: vote_records (audit trail for votes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vote_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,

  -- Change Details
  previous_vote_type TEXT,
  new_vote_type TEXT,
  change_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vote_records_vote ON vote_records(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_created ON vote_records(created_at DESC);

COMMENT ON TABLE vote_records IS 'Audit trail for vote changes';

-- =============================================================================
-- TABLE 6: deliverable_versions (version history)
-- =============================================================================
CREATE TABLE IF NOT EXISTS deliverable_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,

  -- Version Details
  version TEXT NOT NULL,
  content TEXT,
  content_url TEXT,

  -- Change Tracking
  change_summary TEXT,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(deliverable_id, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliverable_versions_deliverable ON deliverable_versions(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_versions_created ON deliverable_versions(created_at DESC);

COMMENT ON TABLE deliverable_versions IS 'Version history for deliverables';

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
    AND tablename IN ('deliverables', 'artifacts', 'consultation_feedback', 'votes', 'vote_records', 'deliverable_versions');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 17 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 94 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 18-25 (Governance & Monitoring)';
    RAISE NOTICE '';
END $$;
