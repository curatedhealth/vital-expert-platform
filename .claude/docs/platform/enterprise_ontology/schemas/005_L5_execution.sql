-- =====================================================================
-- L5: EXECUTION LAYER (Processes, Workflows, Tasks, Steps, Components)
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Executable representation of work for humans and AI
-- Dependencies: 002_L1_organizational_structure.sql
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE (from EKG Strategy):
-- "Component Reuse at the Atomic Level - Every task_step references a
--  reusable LangGraph component, enabling:
--   - Code reuse
--   - Graph auto-generation
--   - Rapid workflow iteration
--   - Consistent quality and governance"
--
-- This layer captures HOW work gets executed:
--   Processes → Workflow Templates → Stages → Tasks → Steps → Components
--
-- Key design decisions:
--   1. Zero JSONB for structure - fully normalized
--   2. Steps bind to reusable LangGraph components
--   3. Parameters are normalized to step_parameters table
--   4. Handoffs capture cross-functional friction points
-- =====================================================================

-- =====================================================================
-- BUSINESS PROCESSES (High-level Business Capabilities)
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Medical Inquiry Response', 'KOL Engagement'
  description TEXT,

  -- Classification
  process_category VARCHAR(50) CHECK (process_category IN (
    'core', 'support', 'management', 'governance'
  )),
  process_type VARCHAR(50) CHECK (process_type IN (
    'operational', 'strategic', 'analytical', 'compliance'
  )),

  -- Ownership
  owner_function_id UUID REFERENCES org_business_functions(id),
  owner_department_id UUID REFERENCES org_departments(id),
  accountable_role_id UUID REFERENCES org_roles(id),

  -- Metrics
  typical_duration_days DECIMAL(5,1),
  sla_target_days DECIMAL(5,1),
  volume_per_month INTEGER, -- Typical monthly execution count

  -- Automation Potential
  automation_potential VARCHAR(20) CHECK (automation_potential IN (
    'none', 'low', 'medium', 'high', 'full'
  )),
  current_automation_level VARCHAR(20) CHECK (current_automation_level IN (
    'manual', 'assisted', 'semi_automated', 'automated'
  )),

  -- Compliance
  gxp_relevant BOOLEAN DEFAULT false,
  requires_documentation BOOLEAN DEFAULT true,
  regulatory_impact VARCHAR(20) CHECK (regulatory_impact IN (
    'none', 'low', 'medium', 'high', 'critical'
  )),

  -- L0 Domain Context
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),
  product_id UUID REFERENCES l0_products(id),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- WORKFLOW TEMPLATES (Reusable Workflow Blueprints)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  workflow_type VARCHAR(50) CHECK (workflow_type IN (
    'linear', 'branching', 'iterative', 'event_driven', 'parallel'
  )),

  -- Source Process
  source_process_id UUID REFERENCES ref_processes(id),

  -- Trigger
  trigger_type VARCHAR(50) CHECK (trigger_type IN (
    'manual', 'scheduled', 'event', 'condition', 'api'
  )),
  trigger_config JSONB DEFAULT '{}', -- Trigger-specific configuration

  -- Service Layer Routing
  default_service_layer VARCHAR(50) CHECK (default_service_layer IN (
    'ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER'
  )),
  complexity_level VARCHAR(20) CHECK (complexity_level IN (
    'simple', 'moderate', 'complex', 'expert'
  )),

  -- Execution Config
  max_duration_hours INTEGER,
  requires_human_approval BOOLEAN DEFAULT false,
  allow_parallel_execution BOOLEAN DEFAULT false,

  -- Governance
  gxp_validated BOOLEAN DEFAULT false,
  last_validation_date DATE,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- WORKFLOW STAGES (Logical Groupings within Workflows)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Ordering
  stage_order INTEGER NOT NULL,

  -- Stage Type
  stage_type VARCHAR(50) CHECK (stage_type IN (
    'initialization', 'processing', 'review', 'decision',
    'approval', 'handoff', 'completion', 'error_handling'
  )),

  -- Entry/Exit Criteria
  entry_criteria TEXT,
  exit_criteria TEXT,

  -- SLA
  sla_hours INTEGER,

  -- Metadata
  is_optional BOOLEAN DEFAULT false,
  can_skip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- WORKFLOW TASKS (Atomic Units of Work)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Ordering within Stage
  task_order INTEGER NOT NULL,

  -- Task Type
  task_type VARCHAR(50) CHECK (task_type IN (
    'human', 'ai_assisted', 'automated', 'decision', 'validation',
    'integration', 'notification', 'wait', 'parallel_gateway'
  )),

  -- Assignment
  responsible_role_id UUID REFERENCES org_roles(id),
  requires_expertise TEXT[], -- Required skills/competencies

  -- Timing
  estimated_duration_minutes INTEGER,
  sla_minutes INTEGER,

  -- AI Assistance
  ai_assistance_level VARCHAR(20) CHECK (ai_assistance_level IN (
    'none', 'suggestion', 'draft', 'automated', 'full'
  )),
  suggested_agent_id UUID REFERENCES ref_ai_agents(id),

  -- Dependencies
  depends_on_tasks UUID[], -- Task IDs this depends on
  dependency_type VARCHAR(20) CHECK (dependency_type IN (
    'all_complete', 'any_complete', 'condition'
  )),

  -- Decision/Branching
  is_decision_point BOOLEAN DEFAULT false,
  decision_options JSONB, -- For decision tasks

  -- Handoff
  is_handoff BOOLEAN DEFAULT false,
  handoff_to_function_id UUID REFERENCES org_business_functions(id),
  handoff_to_role_id UUID REFERENCES org_roles(id),

  -- Metadata
  is_optional BOOLEAN DEFAULT false,
  can_skip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- TASK INPUTS/OUTPUTS (Normalized Data Flow)
-- =====================================================================

CREATE TABLE IF NOT EXISTS task_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Input Definition
  input_name VARCHAR(100) NOT NULL,
  input_type VARCHAR(50) CHECK (input_type IN (
    'text', 'document', 'data', 'decision', 'reference', 'context'
  )),
  description TEXT,

  -- Source
  source_type VARCHAR(50) CHECK (source_type IN (
    'previous_task', 'external', 'user_input', 'system', 'rag', 'database'
  )),
  source_task_id UUID REFERENCES workflow_tasks(id),
  source_output_name VARCHAR(100),

  -- Validation
  is_required BOOLEAN DEFAULT true,
  validation_rules JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Output Definition
  output_name VARCHAR(100) NOT NULL,
  output_type VARCHAR(50) CHECK (output_type IN (
    'text', 'document', 'data', 'decision', 'artifact', 'notification'
  )),
  description TEXT,

  -- Destination
  persist_to_storage BOOLEAN DEFAULT false,
  storage_type VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- TASK STEPS (Atomic Code-level Building Blocks)
-- =====================================================================
-- Critical: Each step binds to a reusable LangGraph component

CREATE TABLE IF NOT EXISTS task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Ordering
  step_order INTEGER NOT NULL,

  -- LangGraph Component Binding (KEY RELATIONSHIP)
  component_id UUID NOT NULL REFERENCES lang_components(id),

  -- Step Type
  step_type VARCHAR(50) CHECK (step_type IN (
    'execute', 'condition', 'loop', 'parallel', 'aggregate',
    'transform', 'validate', 'notify', 'wait'
  )),

  -- Execution Config
  retry_count INTEGER DEFAULT 0,
  retry_delay_seconds INTEGER DEFAULT 0,
  timeout_seconds INTEGER,

  -- Error Handling
  on_error_action VARCHAR(50) CHECK (on_error_action IN (
    'fail', 'skip', 'retry', 'human_review', 'fallback'
  )),
  fallback_step_id UUID REFERENCES task_steps(id),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- STEP PARAMETERS (Fully Normalized - NO JSONB)
-- =====================================================================

CREATE TABLE IF NOT EXISTS step_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES task_steps(id) ON DELETE CASCADE,

  -- Parameter Definition
  parameter_name VARCHAR(100) NOT NULL,
  parameter_type VARCHAR(50) CHECK (parameter_type IN (
    'string', 'number', 'boolean', 'array', 'object', 'reference'
  )),

  -- Value
  value_string TEXT,
  value_number DECIMAL(15,4),
  value_boolean BOOLEAN,
  value_reference UUID, -- Reference to another entity

  -- Source (for dynamic values)
  source_type VARCHAR(50) CHECK (source_type IN (
    'static', 'input', 'context', 'previous_step', 'environment'
  )),
  source_path VARCHAR(255), -- JSONPath or reference path

  -- Validation
  is_required BOOLEAN DEFAULT true,
  default_value TEXT,
  validation_pattern VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(step_id, parameter_name)
);

-- =====================================================================
-- LANGGRAPH COMPONENTS (Reusable Computational Nodes)
-- =====================================================================

CREATE TABLE IF NOT EXISTS lang_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  component_category VARCHAR(50) CHECK (component_category IN (
    'retrieval', 'generation', 'transformation', 'validation',
    'integration', 'decision', 'notification', 'utility'
  )),
  component_type VARCHAR(50) CHECK (component_type IN (
    'rag_query', 'llm_call', 'api_call', 'data_transform',
    'human_input', 'condition', 'aggregator', 'router', 'custom'
  )),

  -- Implementation
  implementation_class VARCHAR(255), -- Python class path
  function_name VARCHAR(100),

  -- Interface (Normalized in separate tables)
  -- Input/output schemas defined in component_interfaces table

  -- AI Configuration
  default_model_provider VARCHAR(50),
  default_model_id VARCHAR(100),
  default_temperature DECIMAL(2,1),

  -- Governance
  requires_human_review BOOLEAN DEFAULT false,
  gxp_validated BOOLEAN DEFAULT false,
  validation_date DATE,

  -- Versioning
  version VARCHAR(20) DEFAULT '1.0',
  is_deprecated BOOLEAN DEFAULT false,
  superseded_by_id UUID REFERENCES lang_components(id),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component Interface Definitions
CREATE TABLE IF NOT EXISTS component_interfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES lang_components(id) ON DELETE CASCADE,

  -- Interface Type
  interface_type VARCHAR(20) NOT NULL CHECK (interface_type IN ('input', 'output')),

  -- Field Definition
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) CHECK (field_type IN (
    'string', 'number', 'boolean', 'array', 'object', 'document', 'embedding'
  )),
  description TEXT,

  -- Validation
  is_required BOOLEAN DEFAULT true,
  default_value TEXT,
  validation_pattern VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(component_id, interface_type, field_name)
);

-- =====================================================================
-- HANDOFFS (Cross-functional Transition Points)
-- =====================================================================

CREATE TABLE IF NOT EXISTS ref_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Medical Review Approval', 'Commercial Handoff'
  description TEXT,

  -- Source/Target Functions
  source_function_id UUID NOT NULL REFERENCES org_business_functions(id),
  target_function_id UUID NOT NULL REFERENCES org_business_functions(id),

  -- Source/Target Roles (more specific)
  source_role_id UUID REFERENCES org_roles(id),
  target_role_id UUID REFERENCES org_roles(id),

  -- Process Context
  process_id UUID REFERENCES ref_processes(id),
  workflow_template_id UUID REFERENCES workflow_templates(id),

  -- Timing
  typical_wait_time_hours DECIMAL(5,1),
  sla_hours DECIMAL(5,1),

  -- Characteristics
  is_blocking BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approval_type VARCHAR(50), -- 'single', 'multi', 'committee'

  -- Pain Point Analysis (for transformation)
  friction_score DECIMAL(3,1) CHECK (friction_score BETWEEN 0 AND 10),
  common_delays TEXT[],
  improvement_ideas TEXT[],

  -- Automation
  automation_opportunity VARCHAR(20) CHECK (automation_opportunity IN (
    'none', 'low', 'medium', 'high'
  )),
  suggested_automation TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- WORKFLOW EXECUTIONS (Runtime Instances)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id),
  tenant_id UUID NOT NULL,

  -- Execution Context
  initiated_by_user_id UUID,
  initiated_by_agent_id UUID REFERENCES ref_ai_agents(id),
  persona_id UUID REFERENCES personas(id),

  -- L0 Domain Context
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),
  product_id UUID REFERENCES l0_products(id),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'paused', 'waiting_human', 'completed',
    'failed', 'cancelled', 'expired'
  )),

  -- Progress
  current_stage_id UUID REFERENCES workflow_stages(id),
  current_task_id UUID REFERENCES workflow_tasks(id),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expected_completion_at TIMESTAMPTZ,

  -- Results
  final_output JSONB,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Execution Log
CREATE TABLE IF NOT EXISTS task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES workflow_tasks(id),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'skipped', 'waiting_human'
  )),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Execution Details
  executed_by_user_id UUID,
  executed_by_agent_id UUID REFERENCES ref_ai_agents(id),

  -- Results
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,

  -- Human Review (if applicable)
  human_review_required BOOLEAN DEFAULT false,
  human_reviewer_id UUID,
  human_review_decision VARCHAR(50),
  human_review_notes TEXT,
  human_reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Processes
CREATE INDEX IF NOT EXISTS idx_processes_function ON ref_processes(owner_function_id);
CREATE INDEX IF NOT EXISTS idx_processes_department ON ref_processes(owner_department_id);
CREATE INDEX IF NOT EXISTS idx_processes_category ON ref_processes(process_category);

-- Workflow Templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_process ON workflow_templates(source_process_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_service ON workflow_templates(default_service_layer);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger ON workflow_templates(trigger_type);

-- Stages
CREATE INDEX IF NOT EXISTS idx_workflow_stages_template ON workflow_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_order ON workflow_stages(template_id, stage_order);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_stage ON workflow_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_template ON workflow_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_type ON workflow_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_role ON workflow_tasks(responsible_role_id);

-- Steps
CREATE INDEX IF NOT EXISTS idx_task_steps_task ON task_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_task_steps_component ON task_steps(component_id);
CREATE INDEX IF NOT EXISTS idx_task_steps_order ON task_steps(task_id, step_order);

-- Parameters
CREATE INDEX IF NOT EXISTS idx_step_parameters_step ON step_parameters(step_id);

-- Components
CREATE INDEX IF NOT EXISTS idx_lang_components_category ON lang_components(component_category);
CREATE INDEX IF NOT EXISTS idx_lang_components_type ON lang_components(component_type);

-- Handoffs
CREATE INDEX IF NOT EXISTS idx_handoffs_source ON ref_handoffs(source_function_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_target ON ref_handoffs(target_function_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_process ON ref_handoffs(process_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_friction ON ref_handoffs(friction_score DESC);

-- Executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_template ON workflow_executions(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_tenant ON workflow_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_workflow ON task_executions(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_task ON task_executions(task_id);

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE ref_processes IS 'L5: High-level business processes with SLAs and automation potential';
COMMENT ON TABLE workflow_templates IS 'L5: Reusable workflow blueprints tied to processes';
COMMENT ON TABLE workflow_stages IS 'L5: Logical stages within workflows';
COMMENT ON TABLE workflow_tasks IS 'L5: Atomic units of work within stages';
COMMENT ON TABLE task_steps IS 'L5: Code-level steps within tasks, bound to LangGraph components';
COMMENT ON TABLE step_parameters IS 'L5: Normalized parameters for steps (zero JSONB)';
COMMENT ON TABLE lang_components IS 'L5: Reusable LangGraph computational nodes';
COMMENT ON TABLE ref_handoffs IS 'L5: Cross-functional handoff points (transformation opportunities)';
COMMENT ON TABLE workflow_executions IS 'L5: Runtime workflow instances';

-- =====================================================================
-- SEED DATA: Core LangGraph Components
-- =====================================================================

INSERT INTO lang_components (unique_id, name, component_category, component_type, description, implementation_class, requires_human_review, gxp_validated)
VALUES
  -- Retrieval Components
  ('COMP-RAG-QUERY', 'RAG Query', 'retrieval', 'rag_query', 'Retrieve relevant documents from vector store', 'vital.components.retrieval.RAGQuery', false, true),
  ('COMP-GRAPH-QUERY', 'Graph Query', 'retrieval', 'api_call', 'Query knowledge graph for entity relationships', 'vital.components.retrieval.GraphQuery', false, true),
  ('COMP-ENTITY-RESOLVE', 'Entity Resolver', 'retrieval', 'data_transform', 'Resolve entities against L0 domain', 'vital.components.retrieval.EntityResolver', false, true),

  -- Generation Components
  ('COMP-LLM-GENERATE', 'LLM Generate', 'generation', 'llm_call', 'Generate text using LLM', 'vital.components.generation.LLMGenerate', false, false),
  ('COMP-LLM-SUMMARIZE', 'LLM Summarize', 'generation', 'llm_call', 'Summarize input text', 'vital.components.generation.LLMSummarize', false, true),
  ('COMP-LLM-EXTRACT', 'LLM Extract', 'generation', 'llm_call', 'Extract structured data from text', 'vital.components.generation.LLMExtract', false, true),

  -- Transformation Components
  ('COMP-FORMAT-OUTPUT', 'Format Output', 'transformation', 'data_transform', 'Format data for output', 'vital.components.transform.FormatOutput', false, false),
  ('COMP-MERGE-CONTEXT', 'Merge Context', 'transformation', 'aggregator', 'Merge multiple context sources', 'vital.components.transform.MergeContext', false, false),
  ('COMP-FILTER-RESULTS', 'Filter Results', 'transformation', 'data_transform', 'Filter and rank results', 'vital.components.transform.FilterResults', false, false),

  -- Validation Components
  ('COMP-COMPLIANCE-CHECK', 'Compliance Check', 'validation', 'validation', 'Check content against compliance rules', 'vital.components.validation.ComplianceCheck', true, true),
  ('COMP-HALLUCINATION-CHECK', 'Hallucination Check', 'validation', 'validation', 'Detect potential hallucinations', 'vital.components.validation.HallucinationCheck', false, true),
  ('COMP-CITATION-CHECK', 'Citation Check', 'validation', 'validation', 'Verify citations and sources', 'vital.components.validation.CitationCheck', false, true),

  -- Decision Components
  ('COMP-ROUTE-QUERY', 'Route Query', 'decision', 'router', 'Route query to appropriate service layer', 'vital.components.decision.RouteQuery', false, false),
  ('COMP-CONDITION-CHECK', 'Condition Check', 'decision', 'condition', 'Evaluate condition and branch', 'vital.components.decision.ConditionCheck', false, false),

  -- Integration Components
  ('COMP-CRM-LOOKUP', 'CRM Lookup', 'integration', 'api_call', 'Lookup data from CRM system', 'vital.components.integration.CRMLookup', false, false),
  ('COMP-SAFETY-REPORT', 'Safety Report', 'integration', 'api_call', 'Submit to safety database', 'vital.components.integration.SafetyReport', true, true),

  -- Notification Components
  ('COMP-NOTIFY-USER', 'Notify User', 'notification', 'notification', 'Send notification to user', 'vital.components.notification.NotifyUser', false, false),
  ('COMP-NOTIFY-REVIEWER', 'Notify Reviewer', 'notification', 'notification', 'Notify human reviewer', 'vital.components.notification.NotifyReviewer', false, false),

  -- Human-in-the-loop
  ('COMP-HUMAN-REVIEW', 'Human Review', 'validation', 'human_input', 'Request human review and approval', 'vital.components.hitl.HumanReview', true, true),
  ('COMP-HUMAN-INPUT', 'Human Input', 'utility', 'human_input', 'Collect input from user', 'vital.components.hitl.HumanInput', false, false)
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description,
  gxp_validated = EXCLUDED.gxp_validated;

-- =====================================================================
-- SEED DATA: Core Medical Affairs Processes
-- =====================================================================

INSERT INTO ref_processes (unique_id, name, process_category, process_type, description, automation_potential, current_automation_level, gxp_relevant, requires_documentation)
VALUES
  ('PROC-MI-RESPONSE', 'Medical Inquiry Response', 'core', 'operational', 'End-to-end handling of medical inquiries from receipt to response delivery', 'high', 'assisted', true, true),
  ('PROC-KOL-ENGAGEMENT', 'KOL Engagement', 'core', 'strategic', 'Planning, executing, and documenting KOL interactions', 'medium', 'manual', true, true),
  ('PROC-CONTENT-REVIEW', 'Medical Content Review', 'governance', 'compliance', 'Medical, legal, regulatory review of promotional materials', 'medium', 'assisted', true, true),
  ('PROC-EVIDENCE-SYNTHESIS', 'Evidence Synthesis', 'core', 'analytical', 'Systematic review and synthesis of scientific evidence', 'high', 'assisted', false, true),
  ('PROC-CONGRESS-PREP', 'Congress Preparation', 'support', 'operational', 'Planning and preparation for scientific congresses', 'medium', 'manual', false, true),
  ('PROC-PUBLICATION-MGMT', 'Publication Management', 'core', 'operational', 'End-to-end management of scientific publications', 'medium', 'manual', false, true),
  ('PROC-ADVERSE-EVENT', 'Adverse Event Processing', 'core', 'compliance', 'Receipt, triage, and reporting of adverse events', 'medium', 'assisted', true, true),
  ('PROC-INSIGHT-GENERATION', 'Insight Generation', 'core', 'analytical', 'Analysis and synthesis of field medical insights', 'high', 'manual', false, true)
ON CONFLICT (unique_id) DO UPDATE SET
  automation_potential = EXCLUDED.automation_potential,
  current_automation_level = EXCLUDED.current_automation_level;
