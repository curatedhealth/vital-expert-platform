-- ============================================================================
-- Persona/Agent Separation Migration
-- Date: 2025-11-02
-- Purpose: Separate human organizational roles (personas) from AI agents
-- 
-- Background:
--   Previously, both humans and AI were stored in dh_role table.
--   This migration creates separate tables for better clarity and functionality.
--
-- Tables Created:
--   1. dh_persona - Human organizational roles/job functions
--   2. dh_agent - AI agents that execute tasks
--   3. dh_task_persona - Human review/approval assignments
--   4. dh_task_agent - AI agent execution assignments
--   5. dh_workflow_persona - Human oversight for workflows
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure update trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 1: dh_persona (Human Organizational Roles)
-- ============================================================================
-- Represents human job functions who participate in workflows
-- Examples: Chief Medical Officer, Senior Biostatistician, etc.

CREATE TABLE IF NOT EXISTS dh_persona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identity
  code TEXT NOT NULL,                    -- P01_CMO, P02_VPCLIN, etc.
  name TEXT NOT NULL,                    -- "Chief Medical Officer"
  unique_id TEXT NOT NULL,               -- PER-P01-CMO (for portable references)
  
  -- Human-specific attributes
  expertise_level TEXT,                  -- EXPERT, ADVANCED, INTERMEDIATE, BEGINNER
  years_experience TEXT,                 -- "15+", "10-15", "5-10"
  education JSONB DEFAULT '[]'::jsonb,   -- ["MD", "PhD"]
  typical_titles JSONB DEFAULT '[]'::jsonb,  -- ["CMO", "VP Medical Affairs"]
  decision_authority TEXT,               -- VERY_HIGH, HIGH, MEDIUM, LOW
  
  -- Skills and capabilities
  capabilities JSONB DEFAULT '[]'::jsonb,    -- ["Clinical Trial Strategy", "FDA Interactions"]
  key_responsibilities JSONB DEFAULT '[]'::jsonb,  -- Main duties
  
  -- Organizational
  department TEXT,                       -- "Clinical Development", "Regulatory"
  reports_to TEXT,                       -- Reference to another persona code
  category_code TEXT,                    -- For grouping/filtering
  
  -- Contact & Availability
  typical_availability_hours INTEGER,    -- Hours per week typically available
  response_time_sla_hours INTEGER,       -- Expected response time for reviews
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, code),
  UNIQUE(tenant_id, unique_id),
  
  -- Validation
  CONSTRAINT chk_persona_expertise_level CHECK (
    expertise_level IS NULL OR 
    expertise_level IN ('EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER')
  ),
  CONSTRAINT chk_persona_decision_authority CHECK (
    decision_authority IS NULL OR
    decision_authority IN ('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'ADVISORY')
  )
);

-- Indexes
CREATE INDEX idx_persona_tenant ON dh_persona(tenant_id);
CREATE INDEX idx_persona_code ON dh_persona(tenant_id, code);
CREATE INDEX idx_persona_unique_id ON dh_persona(unique_id);
CREATE INDEX idx_persona_expertise ON dh_persona(expertise_level);
CREATE INDEX idx_persona_department ON dh_persona(department);

-- Update trigger
DROP TRIGGER IF EXISTS trg_persona_updated ON dh_persona;
CREATE TRIGGER trg_persona_updated
  BEFORE UPDATE ON dh_persona
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dh_persona IS 'Human organizational roles/personas who participate in workflows (human-in-the-loop)';
COMMENT ON COLUMN dh_persona.code IS 'Internal code (e.g., P01_CMO, P02_VPCLIN)';
COMMENT ON COLUMN dh_persona.unique_id IS 'Portable identifier (e.g., PER-P01-CMO)';
COMMENT ON COLUMN dh_persona.expertise_level IS 'Level of expertise: EXPERT, ADVANCED, INTERMEDIATE, BEGINNER';
COMMENT ON COLUMN dh_persona.decision_authority IS 'Decision-making authority level in organization';
COMMENT ON COLUMN dh_persona.reports_to IS 'Code of persona this role reports to (organizational hierarchy)';

-- ============================================================================
-- TABLE 2: dh_agent (AI Agents)
-- ============================================================================
-- Represents LangGraph/AI agents that autonomously execute workflow tasks

CREATE TABLE IF NOT EXISTS dh_agent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identity
  code TEXT NOT NULL,                    -- AGT-ENDPOINT-SELECTOR, AGT-PROTOCOL-WRITER
  name TEXT NOT NULL,                    -- "Endpoint Selection Agent"
  unique_id TEXT NOT NULL,               -- AGT-ENDPOINT-SELECTOR (for portable references)
  
  -- Agent-specific attributes
  agent_type TEXT NOT NULL,              -- ORCHESTRATOR, SPECIALIST, VALIDATOR, EXECUTOR, RETRIEVER
  framework TEXT DEFAULT 'langgraph',    -- "langgraph", "crewai", "autogen", "custom"
  model_config JSONB DEFAULT '{}'::jsonb,  -- {"model": "claude-sonnet-4", "temperature": 0.2, "max_tokens": 4000}
  
  -- Execution configuration
  capabilities JSONB DEFAULT '[]'::jsonb,     -- ["endpoint_analysis", "regulatory_review"]
  tools JSONB DEFAULT '[]'::jsonb,            -- Tool unique_ids this agent can use
  prompt_templates JSONB DEFAULT '[]'::jsonb, -- Prompt unique_ids this agent uses
  rag_sources JSONB DEFAULT '[]'::jsonb,      -- RAG source unique_ids this agent needs
  
  -- Autonomy level
  autonomy_level TEXT DEFAULT 'SUPERVISED',  -- FULL_AUTO, SUPERVISED, HUMAN_APPROVAL_REQUIRED
  max_iterations INTEGER DEFAULT 3,          -- Max retry/refinement iterations
  timeout_seconds INTEGER DEFAULT 1800,      -- 30 minutes default
  
  -- Guardrails
  guardrails JSONB DEFAULT '{}'::jsonb,           -- {"phi": "redact", "pii": "mask", "citation_required": true}
  validation_rules JSONB DEFAULT '{}'::jsonb,     -- Output validation requirements
  output_schema JSONB,                            -- Expected output structure
  
  -- Performance metrics
  success_rate DECIMAL(5,2),                -- Track agent performance (0-100)
  avg_execution_time_sec INTEGER,           -- Average execution time
  total_executions INTEGER DEFAULT 0,       -- Total number of times executed
  last_executed_at TIMESTAMPTZ,             -- Last execution timestamp
  
  -- Cost tracking
  estimated_cost_per_run DECIMAL(10,4),     -- Estimated $ cost per execution
  total_cost DECIMAL(10,2),                 -- Cumulative cost
  
  -- Status and versioning
  status TEXT DEFAULT 'active',             -- active, inactive, deprecated, testing, failed
  version TEXT DEFAULT 'v1.0',              -- Version identifier
  changelog JSONB DEFAULT '[]'::jsonb,      -- Version history
  
  -- Dependencies
  depends_on_agents JSONB DEFAULT '[]'::jsonb,  -- Other agent unique_ids this depends on
  can_delegate_to JSONB DEFAULT '[]'::jsonb,    -- Agents this can delegate subtasks to
  
  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],      -- For categorization and search
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, code),
  UNIQUE(tenant_id, unique_id),
  
  -- Validation
  CONSTRAINT chk_agent_type CHECK (
    agent_type IN ('ORCHESTRATOR', 'SPECIALIST', 'VALIDATOR', 'EXECUTOR', 'RETRIEVER', 'SYNTHESIZER')
  ),
  CONSTRAINT chk_agent_autonomy CHECK (
    autonomy_level IN ('FULL_AUTO', 'SUPERVISED', 'HUMAN_APPROVAL_REQUIRED')
  ),
  CONSTRAINT chk_agent_status CHECK (
    status IN ('active', 'inactive', 'deprecated', 'testing', 'failed')
  ),
  CONSTRAINT chk_agent_success_rate CHECK (
    success_rate IS NULL OR (success_rate >= 0 AND success_rate <= 100)
  )
);

-- Indexes
CREATE INDEX idx_agent_tenant ON dh_agent(tenant_id);
CREATE INDEX idx_agent_code ON dh_agent(tenant_id, code);
CREATE INDEX idx_agent_unique_id ON dh_agent(unique_id);
CREATE INDEX idx_agent_type ON dh_agent(agent_type);
CREATE INDEX idx_agent_status ON dh_agent(status);
CREATE INDEX idx_agent_autonomy ON dh_agent(autonomy_level);
CREATE INDEX idx_agent_tags ON dh_agent USING gin(tags);

-- Update trigger
DROP TRIGGER IF EXISTS trg_agent_updated ON dh_agent;
CREATE TRIGGER trg_agent_updated
  BEFORE UPDATE ON dh_agent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dh_agent IS 'AI agents (LangGraph/LLM) that autonomously execute workflow tasks';
COMMENT ON COLUMN dh_agent.code IS 'Internal code (e.g., AGT-ENDPOINT-SELECTOR)';
COMMENT ON COLUMN dh_agent.unique_id IS 'Portable identifier for cross-references';
COMMENT ON COLUMN dh_agent.agent_type IS 'Type of agent: ORCHESTRATOR, SPECIALIST, VALIDATOR, EXECUTOR, RETRIEVER, SYNTHESIZER';
COMMENT ON COLUMN dh_agent.autonomy_level IS 'Level of autonomy: FULL_AUTO, SUPERVISED, HUMAN_APPROVAL_REQUIRED';
COMMENT ON COLUMN dh_agent.guardrails IS 'Safety constraints (PHI handling, PII masking, citation requirements)';

-- ============================================================================
-- TABLE 3: dh_workflow_persona (Human Oversight for Workflows)
-- ============================================================================
-- Links workflows to human personas for overall oversight/approval

CREATE TABLE IF NOT EXISTS dh_workflow_persona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES dh_workflow(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES dh_persona(id) ON DELETE CASCADE,
  
  -- Human role in workflow
  responsibility TEXT NOT NULL,          -- APPROVE, REVIEW, SUPPORT, CONSULT, INFORM
  is_required BOOLEAN DEFAULT true,      -- Must this persona be involved?
  decision_authority TEXT,               -- FINAL, ADVISORY, INFORMATIONAL
  
  -- Timing
  review_stage TEXT,                     -- PRE_EXECUTION, DURING, POST_EXECUTION, ON_EXCEPTION
  estimated_time_minutes INTEGER,        -- Expected time investment
  
  -- Notification preferences
  notification_trigger TEXT,             -- WORKFLOW_START, WORKFLOW_COMPLETE, AGENT_ERROR, APPROVAL_NEEDED
  notification_method TEXT DEFAULT 'email',  -- email, slack, in_app
  
  -- Escalation
  escalation_after_hours INTEGER,        -- Auto-escalate if no response
  escalation_to_persona_id UUID REFERENCES dh_persona(id),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, workflow_id, persona_id, responsibility),
  
  -- Validation
  CONSTRAINT chk_workflow_persona_responsibility CHECK (
    responsibility IN ('APPROVE', 'REVIEW', 'SUPPORT', 'CONSULT', 'INFORM')
  ),
  CONSTRAINT chk_workflow_persona_authority CHECK (
    decision_authority IS NULL OR
    decision_authority IN ('FINAL', 'ADVISORY', 'INFORMATIONAL')
  ),
  CONSTRAINT chk_workflow_persona_stage CHECK (
    review_stage IS NULL OR
    review_stage IN ('PRE_EXECUTION', 'DURING', 'POST_EXECUTION', 'ON_EXCEPTION')
  )
);

-- Indexes
CREATE INDEX idx_workflow_persona_workflow ON dh_workflow_persona(workflow_id);
CREATE INDEX idx_workflow_persona_persona ON dh_workflow_persona(persona_id);
CREATE INDEX idx_workflow_persona_tenant ON dh_workflow_persona(tenant_id);

-- Comments
COMMENT ON TABLE dh_workflow_persona IS 'Assigns human personas to workflows for oversight, approval, and review';
COMMENT ON COLUMN dh_workflow_persona.responsibility IS 'Role: APPROVE, REVIEW, SUPPORT, CONSULT, INFORM';
COMMENT ON COLUMN dh_workflow_persona.review_stage IS 'When review occurs: PRE_EXECUTION, DURING, POST_EXECUTION, ON_EXCEPTION';

-- ============================================================================
-- TABLE 4: dh_task_agent (AI Agent Execution Assignments)
-- ============================================================================
-- Links tasks to AI agents for execution

CREATE TABLE IF NOT EXISTS dh_task_agent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES dh_agent(id) ON DELETE CASCADE,
  
  -- Agent assignment
  assignment_type TEXT NOT NULL DEFAULT 'PRIMARY_EXECUTOR',  -- PRIMARY_EXECUTOR, VALIDATOR, FALLBACK, REVIEWER
  execution_order INTEGER DEFAULT 1,     -- For multi-agent sequential tasks
  is_parallel BOOLEAN DEFAULT false,     -- Can run in parallel with other agents?
  
  -- Execution config
  max_retries INTEGER DEFAULT 2,
  retry_strategy TEXT DEFAULT 'EXPONENTIAL_BACKOFF',  -- EXPONENTIAL_BACKOFF, LINEAR, IMMEDIATE, NONE
  
  -- Human-in-the-loop triggers
  requires_human_approval BOOLEAN DEFAULT false,
  approval_persona_code TEXT,            -- Which persona must approve (references dh_persona.code)
  approval_stage TEXT,                   -- BEFORE_EXECUTION, AFTER_EXECUTION, ON_ERROR
  
  -- Error handling
  on_failure TEXT DEFAULT 'ESCALATE_TO_HUMAN',  -- ESCALATE_TO_HUMAN, RETRY, FALLBACK_AGENT, FAIL
  fallback_agent_id UUID REFERENCES dh_agent(id),
  
  -- Configuration overrides
  config_overrides JSONB DEFAULT '{}'::jsonb,  -- Override agent's default config for this task
  
  -- Performance tracking
  last_execution_status TEXT,            -- success, failure, timeout, cancelled
  last_execution_duration_sec INTEGER,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, task_id, agent_id, assignment_type),
  
  -- Validation
  CONSTRAINT chk_task_agent_assignment CHECK (
    assignment_type IN ('PRIMARY_EXECUTOR', 'VALIDATOR', 'FALLBACK', 'REVIEWER', 'CO_EXECUTOR')
  ),
  CONSTRAINT chk_task_agent_retry CHECK (
    retry_strategy IN ('EXPONENTIAL_BACKOFF', 'LINEAR', 'IMMEDIATE', 'NONE')
  ),
  CONSTRAINT chk_task_agent_failure CHECK (
    on_failure IN ('ESCALATE_TO_HUMAN', 'RETRY', 'FALLBACK_AGENT', 'FAIL', 'SKIP')
  ),
  CONSTRAINT chk_task_agent_approval_stage CHECK (
    approval_stage IS NULL OR
    approval_stage IN ('BEFORE_EXECUTION', 'AFTER_EXECUTION', 'ON_ERROR')
  )
);

-- Indexes
CREATE INDEX idx_task_agent_task ON dh_task_agent(task_id);
CREATE INDEX idx_task_agent_agent ON dh_task_agent(agent_id);
CREATE INDEX idx_task_agent_tenant ON dh_task_agent(tenant_id);
CREATE INDEX idx_task_agent_assignment ON dh_task_agent(assignment_type);
CREATE INDEX idx_task_agent_execution_order ON dh_task_agent(task_id, execution_order);

-- Update trigger
DROP TRIGGER IF EXISTS trg_task_agent_updated ON dh_task_agent;
CREATE TRIGGER trg_task_agent_updated
  BEFORE UPDATE ON dh_task_agent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dh_task_agent IS 'Assigns AI agents to tasks for execution with retry/fallback strategies';
COMMENT ON COLUMN dh_task_agent.assignment_type IS 'Role: PRIMARY_EXECUTOR, VALIDATOR, FALLBACK, REVIEWER, CO_EXECUTOR';
COMMENT ON COLUMN dh_task_agent.execution_order IS 'Order of execution for sequential multi-agent tasks';
COMMENT ON COLUMN dh_task_agent.on_failure IS 'Error handling: ESCALATE_TO_HUMAN, RETRY, FALLBACK_AGENT, FAIL, SKIP';

-- ============================================================================
-- TABLE 5: dh_task_persona (Human Review/Approval Assignments)
-- ============================================================================
-- Links tasks to human personas for review, approval, input

CREATE TABLE IF NOT EXISTS dh_task_persona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES dh_task(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES dh_persona(id) ON DELETE CASCADE,
  
  -- Review responsibility
  responsibility TEXT NOT NULL,          -- APPROVE, REVIEW, PROVIDE_INPUT, INFORM, VALIDATE
  is_blocking BOOLEAN DEFAULT false,     -- Must complete before task proceeds?
  
  -- Timing
  review_timing TEXT,                    -- BEFORE_AGENT_RUNS, AFTER_AGENT_RUNS, PARALLEL, ON_AGENT_ERROR
  estimated_time_minutes INTEGER,        -- Expected time for this review
  sla_hours INTEGER,                     -- Expected response time (SLA)
  
  -- Escalation
  escalation_after_hours INTEGER,        -- Auto-escalate if no response
  escalation_to_persona_code TEXT,       -- Which persona to escalate to (references dh_persona.code)
  escalation_notification BOOLEAN DEFAULT true,
  
  -- Approval workflow
  requires_signature BOOLEAN DEFAULT false,
  signature_type TEXT,                   -- ELECTRONIC, WET_SIGNATURE, BOTH
  approval_criteria TEXT,                -- What needs to be checked/validated
  
  -- Notification
  notification_trigger TEXT,             -- TASK_READY_FOR_REVIEW, AGENT_COMPLETE, ESCALATION
  notification_method TEXT DEFAULT 'email',
  
  -- Performance tracking
  last_review_status TEXT,               -- approved, rejected, changes_requested, skipped
  last_review_duration_minutes INTEGER,
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, task_id, persona_id, responsibility),
  
  -- Validation
  CONSTRAINT chk_task_persona_responsibility CHECK (
    responsibility IN ('APPROVE', 'REVIEW', 'PROVIDE_INPUT', 'INFORM', 'VALIDATE', 'CONSULT')
  ),
  CONSTRAINT chk_task_persona_timing CHECK (
    review_timing IS NULL OR
    review_timing IN ('BEFORE_AGENT_RUNS', 'AFTER_AGENT_RUNS', 'PARALLEL', 'ON_AGENT_ERROR')
  ),
  CONSTRAINT chk_task_persona_signature CHECK (
    signature_type IS NULL OR
    signature_type IN ('ELECTRONIC', 'WET_SIGNATURE', 'BOTH')
  )
);

-- Indexes
CREATE INDEX idx_task_persona_task ON dh_task_persona(task_id);
CREATE INDEX idx_task_persona_persona ON dh_task_persona(persona_id);
CREATE INDEX idx_task_persona_tenant ON dh_task_persona(tenant_id);
CREATE INDEX idx_task_persona_responsibility ON dh_task_persona(responsibility);
CREATE INDEX idx_task_persona_blocking ON dh_task_persona(is_blocking);
CREATE INDEX idx_task_persona_timing ON dh_task_persona(review_timing);

-- Update trigger
DROP TRIGGER IF EXISTS trg_task_persona_updated ON dh_task_persona;
CREATE TRIGGER trg_task_persona_updated
  BEFORE UPDATE ON dh_task_persona
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dh_task_persona IS 'Assigns human personas to tasks for review, approval, and input';
COMMENT ON COLUMN dh_task_persona.responsibility IS 'Role: APPROVE, REVIEW, PROVIDE_INPUT, INFORM, VALIDATE, CONSULT';
COMMENT ON COLUMN dh_task_persona.is_blocking IS 'If true, task cannot proceed until this persona completes their action';
COMMENT ON COLUMN dh_task_persona.review_timing IS 'When review occurs: BEFORE_AGENT_RUNS, AFTER_AGENT_RUNS, PARALLEL, ON_AGENT_ERROR';

-- ============================================================================
-- DATA MIGRATION: dh_role → dh_persona
-- ============================================================================
-- Migrate existing Human roles from dh_role to dh_persona

DO $$
BEGIN
  -- Only migrate if dh_role table exists and has Human entries
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'dh_role'
  ) THEN
    
    INSERT INTO dh_persona (
      tenant_id,
      code,
      name,
      unique_id,
      expertise_level,
      years_experience,
      education,
      typical_titles,
      decision_authority,
      capabilities,
      key_responsibilities,
      department,
      category_code,
      description,
      metadata,
      created_at,
      updated_at
    )
    SELECT 
      r.tenant_id,
      r.code,
      r.name,
      -- Convert AGT- prefix to PER- for personas
      CASE 
        WHEN r.unique_id LIKE 'AGT-%' THEN REPLACE(r.unique_id, 'AGT-', 'PER-')
        ELSE COALESCE(r.unique_id, 'PER-' || UPPER(REGEXP_REPLACE(r.code, '[^A-Z0-9]+', '-', 'g')))
      END,
      r.metadata->>'expertise_level',
      r.metadata->>'years_experience',
      COALESCE(r.metadata->'education', '[]'::jsonb),
      COALESCE(r.metadata->'typical_titles', '[]'::jsonb),
      r.metadata->>'decision_authority',
      COALESCE(r.metadata->'capabilities', '[]'::jsonb),
      COALESCE(r.metadata->'key_responsibilities', '[]'::jsonb),
      r.department,
      r.category_code,
      r.description,
      r.metadata,
      r.created_at,
      r.updated_at
    FROM dh_role r
    WHERE r.agent_type = 'Human'
    ON CONFLICT (tenant_id, code) DO NOTHING;
    
    RAISE NOTICE 'Migrated % Human roles from dh_role to dh_persona', 
      (SELECT COUNT(*) FROM dh_role WHERE agent_type = 'Human');
  ELSE
    RAISE NOTICE 'dh_role table does not exist, skipping migration';
  END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to resolve persona by unique_id or code
CREATE OR REPLACE FUNCTION fn_resolve_persona(
  p_tenant UUID,
  p_identifier TEXT  -- Can be unique_id or code
)
RETURNS UUID AS $$
  SELECT id 
  FROM dh_persona 
  WHERE tenant_id = p_tenant 
    AND (unique_id = p_identifier OR code = p_identifier)
  LIMIT 1;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fn_resolve_persona IS 'Resolve persona ID from unique_id or code';

-- Function to resolve agent by unique_id or code
CREATE OR REPLACE FUNCTION fn_resolve_agent(
  p_tenant UUID,
  p_identifier TEXT  -- Can be unique_id or code
)
RETURNS UUID AS $$
  SELECT id 
  FROM dh_agent 
  WHERE tenant_id = p_tenant 
    AND (unique_id = p_identifier OR code = p_identifier)
  LIMIT 1;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fn_resolve_agent IS 'Resolve agent ID from unique_id or code';

-- Function to get all personas for a task
CREATE OR REPLACE FUNCTION fn_get_task_personas(p_task_id UUID)
RETURNS TABLE (
  persona_code TEXT,
  persona_name TEXT,
  responsibility TEXT,
  is_blocking BOOLEAN,
  review_timing TEXT
) AS $$
  SELECT 
    p.code,
    p.name,
    tp.responsibility,
    tp.is_blocking,
    tp.review_timing
  FROM dh_task_persona tp
  JOIN dh_persona p ON tp.persona_id = p.id
  WHERE tp.task_id = p_task_id
  ORDER BY tp.is_blocking DESC, tp.responsibility;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fn_get_task_personas IS 'Get all personas assigned to a task with their responsibilities';

-- Function to get all agents for a task
CREATE OR REPLACE FUNCTION fn_get_task_agents(p_task_id UUID)
RETURNS TABLE (
  agent_code TEXT,
  agent_name TEXT,
  assignment_type TEXT,
  execution_order INTEGER,
  requires_human_approval BOOLEAN
) AS $$
  SELECT 
    a.code,
    a.name,
    ta.assignment_type,
    ta.execution_order,
    ta.requires_human_approval
  FROM dh_task_agent ta
  JOIN dh_agent a ON ta.agent_id = a.id
  WHERE ta.task_id = p_task_id
  ORDER BY ta.execution_order, ta.assignment_type;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fn_get_task_agents IS 'Get all agents assigned to a task with their execution details';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
DO $$
DECLARE
  v_persona_count INTEGER;
  v_agent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_persona_count FROM dh_persona;
  SELECT COUNT(*) INTO v_agent_count FROM dh_agent;
  
  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - dh_persona table created with % records', v_persona_count;
  RAISE NOTICE '  - dh_agent table created with % records', v_agent_count;
  RAISE NOTICE '  - dh_task_persona table created';
  RAISE NOTICE '  - dh_task_agent table created';
  RAISE NOTICE '  - dh_workflow_persona table created';
  RAISE NOTICE '  - Helper functions created';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

