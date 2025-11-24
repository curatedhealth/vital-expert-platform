-- ============================================================================
-- VITAL Platform - Work Hierarchy Normalized Schema
-- ZERO JSONB - Fully Normalized Tables
-- Standards: APQC PCF, ISO 9001, PMBOK, PRINCE2
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- PART 1: OPERATIONS DOMAIN (Process-Based)
-- Hierarchy: Process → Activity → Task → Step
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 1: PROCESSES
-- End-to-end value streams
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS processes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    -- Identity
    code text NOT NULL,
    name text NOT NULL,
    description text,
    version text DEFAULT '1.0',

    -- Classification (APQC aligned)
    process_category text NOT NULL CHECK (process_category IN (
        'operate', 'manage', 'support'  -- APQC Level 1
    )),
    process_group text,  -- APQC Level 2
    functional_area text,  -- medical_affairs, commercial, etc.

    -- Lifecycle
    status text NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'under_review', 'deprecated', 'archived'
    )),
    effective_date date,
    review_date date,

    -- Ownership
    process_owner_id uuid REFERENCES user_profiles(id),
    organization_id uuid REFERENCES organizations(id),

    -- JTBD Integration
    primary_jtbd_id uuid REFERENCES jobs_to_be_done(id),

    -- Metrics
    target_cycle_time interval,
    target_cost numeric(12,2),

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES user_profiles(id),

    CONSTRAINT unique_process_code UNIQUE (tenant_id, code)
);

-- Process SLA targets (normalized from JSONB)
CREATE TABLE IF NOT EXISTS process_sla_targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id uuid NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    sla_name text NOT NULL,
    metric_type text NOT NULL,  -- 'time', 'quality', 'cost', 'compliance'
    target_value text NOT NULL,
    unit_of_measure text NOT NULL,
    measurement_frequency text,

    created_at timestamptz DEFAULT now()
);

-- Process KPIs (normalized)
CREATE TABLE IF NOT EXISTS process_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id uuid NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    kpi_name text NOT NULL,
    kpi_description text,
    target_value text,
    current_value text,
    unit_of_measure text,
    measurement_frequency text,
    data_source text,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Level 2: ACTIVITIES (within Process)
-- Major building blocks
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS process_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id uuid NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    -- Identity
    sequence_order integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,

    -- Purpose
    purpose_statement text,  -- "To ensure..."

    -- Timing
    typical_duration interval,
    is_milestone boolean DEFAULT false,

    -- Ownership
    activity_owner_role text,  -- Role name, not user

    -- JTBD Integration
    jtbd_stage_id uuid REFERENCES jtbd_workflow_stages(id),

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT unique_activity_order UNIQUE (process_id, sequence_order),
    CONSTRAINT unique_activity_code UNIQUE (process_id, code)
);

-- Activity entry criteria (normalized from JSONB)
CREATE TABLE IF NOT EXISTS activity_entry_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid NOT NULL REFERENCES process_activities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    is_mandatory boolean DEFAULT true,
    verification_method text,
    sequence_order integer DEFAULT 1,

    created_at timestamptz DEFAULT now()
);

-- Activity exit criteria (normalized from JSONB)
CREATE TABLE IF NOT EXISTS activity_exit_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid NOT NULL REFERENCES process_activities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    is_mandatory boolean DEFAULT true,
    verification_method text,
    sequence_order integer DEFAULT 1,

    created_at timestamptz DEFAULT now()
);

-- Activity deliverables (normalized from JSONB)
CREATE TABLE IF NOT EXISTS activity_deliverables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid NOT NULL REFERENCES process_activities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    deliverable_name text NOT NULL,
    deliverable_type text,  -- 'document', 'data', 'decision', 'approval'
    description text,
    template_id uuid,  -- Reference to template
    is_mandatory boolean DEFAULT true,

    created_at timestamptz DEFAULT now()
);

-- Activity pain points (normalized)
CREATE TABLE IF NOT EXISTS activity_pain_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id uuid NOT NULL REFERENCES process_activities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    pain_point_text text NOT NULL,
    pain_point_type text CHECK (pain_point_type IN (
        'technical', 'resource', 'process', 'knowledge', 'compliance'
    )),
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency text,  -- 'always', 'often', 'sometimes', 'rarely'

    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 2: PROJECTS DOMAIN (Change-Based)
-- Hierarchy: Project → Phase → Work Package → Task → Step
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level 1: PROJECTS
-- (May already exist - adding missing columns)
-- ----------------------------------------------------------------------------

-- Add columns if projects table exists
DO $$
BEGIN
    -- Add project_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'projects' AND column_name = 'project_type') THEN
        ALTER TABLE projects ADD COLUMN project_type text
            CHECK (project_type IN ('waterfall', 'agile', 'hybrid'));
    END IF;

    -- Add primary_jtbd_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'projects' AND column_name = 'primary_jtbd_id') THEN
        ALTER TABLE projects ADD COLUMN primary_jtbd_id uuid REFERENCES jobs_to_be_done(id);
    END IF;

    -- Add budget if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget numeric(12,2);
    END IF;
END $$;

-- Project objectives (normalized)
CREATE TABLE IF NOT EXISTS project_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    objective_text text NOT NULL,
    objective_type text CHECK (objective_type IN (
        'business', 'technical', 'compliance', 'quality'
    )),
    is_primary boolean DEFAULT false,
    success_metric text,
    target_value text,

    created_at timestamptz DEFAULT now()
);

-- Project deliverables (normalized)
CREATE TABLE IF NOT EXISTS project_deliverables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    deliverable_name text NOT NULL,
    description text,
    deliverable_type text,
    due_date date,
    acceptance_criteria text,
    status text DEFAULT 'pending',

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Project success criteria (normalized)
CREATE TABLE IF NOT EXISTS project_success_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    measurement_method text,
    target_value text,
    is_mandatory boolean DEFAULT true,

    created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Level 2: PROJECT PHASES
-- Time-sequenced sections
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS project_phases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    -- Identity
    phase_number integer NOT NULL,
    name text NOT NULL,
    description text,

    -- Timing
    planned_start_date date,
    planned_end_date date,
    actual_start_date date,
    actual_end_date date,

    -- Milestone
    milestone_name text,
    is_gate_review boolean DEFAULT false,
    gate_criteria text,

    -- Status
    status text DEFAULT 'not_started' CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )),

    -- JTBD Integration
    jtbd_stage_id uuid REFERENCES jtbd_workflow_stages(id),

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT unique_phase_order UNIQUE (project_id, phase_number)
);

-- Phase entry criteria (normalized)
CREATE TABLE IF NOT EXISTS phase_entry_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id uuid NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    is_mandatory boolean DEFAULT true,
    verification_method text,

    created_at timestamptz DEFAULT now()
);

-- Phase exit criteria (normalized)
CREATE TABLE IF NOT EXISTS phase_exit_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id uuid NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    is_mandatory boolean DEFAULT true,
    verification_method text,

    created_at timestamptz DEFAULT now()
);

-- Phase deliverables (normalized)
CREATE TABLE IF NOT EXISTS phase_deliverables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id uuid NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    deliverable_name text NOT NULL,
    deliverable_type text,
    description text,
    is_mandatory boolean DEFAULT true,

    created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Level 3: WORK PACKAGES
-- WBS decomposition units
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS work_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id uuid NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    -- Identity
    wbs_code text NOT NULL,  -- e.g., "1.2.3"
    name text NOT NULL,
    description text,

    -- Scope
    scope_statement text,

    -- Ownership
    owner_id uuid REFERENCES user_profiles(id),
    responsible_team text,

    -- Estimates
    estimated_effort_hours numeric(8,2),
    estimated_cost numeric(12,2),

    -- Timing
    planned_start_date date,
    planned_end_date date,
    actual_start_date date,
    actual_end_date date,

    -- Status
    status text DEFAULT 'not_started' CHECK (status IN (
        'not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'
    )),
    percent_complete integer DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT unique_wbs_code UNIQUE (phase_id, wbs_code)
);

-- Work package acceptance criteria (normalized)
CREATE TABLE IF NOT EXISTS work_package_acceptance_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_package_id uuid NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    criterion_text text NOT NULL,
    verification_method text,
    is_met boolean DEFAULT false,

    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 3: SHARED LEVELS (Task & Step)
-- Used by both Operations and Projects
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level: TASKS
-- Discrete work units (shared between domains)
-- ----------------------------------------------------------------------------

-- Add columns to existing tasks table
DO $$
BEGIN
    -- Add activity_id for operations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'activity_id') THEN
        ALTER TABLE tasks ADD COLUMN activity_id uuid REFERENCES process_activities(id);
    END IF;

    -- Add work_package_id for projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'work_package_id') THEN
        ALTER TABLE tasks ADD COLUMN work_package_id uuid REFERENCES work_packages(id);
    END IF;

    -- Add jtbd_activity_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'jtbd_activity_id') THEN
        ALTER TABLE tasks ADD COLUMN jtbd_activity_id uuid REFERENCES jtbd_workflow_activities(id);
    END IF;

    -- Add priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ADD COLUMN priority text DEFAULT 'medium'
            CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    END IF;

    -- Add estimated_duration_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'estimated_duration_minutes') THEN
        ALTER TABLE tasks ADD COLUMN estimated_duration_minutes integer;
    END IF;
END $$;

-- Task inputs (normalized)
CREATE TABLE IF NOT EXISTS task_inputs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    input_name text NOT NULL,
    input_type text,  -- 'data', 'document', 'approval', 'parameter'
    description text,
    is_required boolean DEFAULT true,
    source text,  -- Where it comes from

    created_at timestamptz DEFAULT now()
);

-- Task outputs (normalized)
CREATE TABLE IF NOT EXISTS task_outputs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    output_name text NOT NULL,
    output_type text,  -- 'data', 'document', 'notification', 'artifact'
    description text,
    destination text,  -- Where it goes

    created_at timestamptz DEFAULT now()
);

-- Task dependencies (normalized - replaces task_prerequisites)
CREATE TABLE IF NOT EXISTS task_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    dependency_type text DEFAULT 'finish_to_start' CHECK (dependency_type IN (
        'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
    )),
    lag_minutes integer DEFAULT 0,

    created_at timestamptz DEFAULT now(),

    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
    CONSTRAINT unique_task_dependency UNIQUE (task_id, depends_on_task_id)
);

-- ----------------------------------------------------------------------------
-- Level: STEPS (within Tasks)
-- Atomic actions
-- ----------------------------------------------------------------------------

-- Rename or create task_steps if steps exists differently
CREATE TABLE IF NOT EXISTS task_steps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    -- Identity
    sequence_order integer NOT NULL,
    name text NOT NULL,
    description text,

    -- Execution
    step_type text CHECK (step_type IN (
        'api_call', 'db_operation', 'file_operation', 'computation',
        'validation', 'notification', 'wait', 'decision', 'manual'
    )),
    tool_id uuid REFERENCES tools(id),

    -- Control flow
    is_conditional boolean DEFAULT false,
    condition_expression text,
    on_success_action text DEFAULT 'continue',
    on_failure_action text DEFAULT 'stop' CHECK (on_failure_action IN (
        'stop', 'retry', 'skip', 'escalate'
    )),
    max_retries integer DEFAULT 0,

    -- Timing
    timeout_seconds integer,
    estimated_duration_seconds integer,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT unique_step_order UNIQUE (task_id, sequence_order)
);

-- Step parameters (normalized from JSONB)
CREATE TABLE IF NOT EXISTS step_parameters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id uuid NOT NULL REFERENCES task_steps(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    parameter_name text NOT NULL,
    parameter_value text,
    parameter_type text,  -- 'string', 'number', 'boolean', 'array', 'object'
    is_required boolean DEFAULT true,
    default_value text,

    created_at timestamptz DEFAULT now(),

    CONSTRAINT unique_step_param UNIQUE (step_id, parameter_name)
);

-- ============================================================================
-- PART 4: NORMALIZE EXISTING JTBD JSONB FIELDS
-- ============================================================================

-- jobs_to_be_done.success_criteria → Already in jtbd_success_criteria
-- jobs_to_be_done.kpis → Need to migrate to jtbd_kpis
-- jobs_to_be_done.pain_points → Already in jtbd_obstacles
-- jobs_to_be_done.desired_outcomes → Already in jtbd_outcomes

-- Normalize jtbd_gen_ai_opportunities JSONB fields

-- key_ai_capabilities (normalized from array)
CREATE TABLE IF NOT EXISTS jtbd_gen_ai_capabilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL REFERENCES jtbd_gen_ai_opportunities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    capability_name text NOT NULL,
    capability_category text,  -- 'nlp', 'vision', 'analytics', 'automation'
    importance_level text CHECK (importance_level IN ('required', 'preferred', 'nice_to_have')),

    created_at timestamptz DEFAULT now()
);

-- risks (normalized from array)
CREATE TABLE IF NOT EXISTS jtbd_gen_ai_risks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL REFERENCES jtbd_gen_ai_opportunities(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    risk_description text NOT NULL,
    risk_category text CHECK (risk_category IN (
        'technical', 'data', 'compliance', 'adoption', 'cost', 'security'
    )),
    likelihood text CHECK (likelihood IN ('low', 'medium', 'high')),
    impact text CHECK (impact IN ('low', 'medium', 'high', 'critical')),

    created_at timestamptz DEFAULT now()
);

-- mitigation_strategies (normalized from array)
CREATE TABLE IF NOT EXISTS jtbd_gen_ai_mitigations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id uuid NOT NULL REFERENCES jtbd_gen_ai_risks(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    strategy_description text NOT NULL,
    owner_role text,
    timeline text,
    status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),

    created_at timestamptz DEFAULT now()
);

-- Normalize jtbd_competitive_alternatives JSONB fields

-- strengths (normalized from array)
CREATE TABLE IF NOT EXISTS alternative_strengths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alternative_id uuid NOT NULL REFERENCES jtbd_competitive_alternatives(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    strength_text text NOT NULL,
    importance_level text CHECK (importance_level IN ('low', 'medium', 'high')),

    created_at timestamptz DEFAULT now()
);

-- weaknesses (normalized from array)
CREATE TABLE IF NOT EXISTS alternative_weaknesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alternative_id uuid NOT NULL REFERENCES jtbd_competitive_alternatives(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    weakness_text text NOT NULL,
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    created_at timestamptz DEFAULT now()
);

-- Normalize jtbd_workflow_stages JSONB fields

-- key_activities (normalized from array)
CREATE TABLE IF NOT EXISTS workflow_stage_key_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id uuid NOT NULL REFERENCES jtbd_workflow_stages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    activity_text text NOT NULL,
    sequence_order integer DEFAULT 1,
    is_critical boolean DEFAULT false,

    created_at timestamptz DEFAULT now()
);

-- pain_points in stages (normalized from array)
CREATE TABLE IF NOT EXISTS workflow_stage_pain_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id uuid NOT NULL REFERENCES jtbd_workflow_stages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    pain_point_text text NOT NULL,
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 5: LINKING TABLES
-- ============================================================================

-- Link JTBD to Process/Project
CREATE TABLE IF NOT EXISTS jtbd_process_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    process_id uuid NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    mapping_type text DEFAULT 'primary' CHECK (mapping_type IN ('primary', 'secondary', 'supporting')),

    created_at timestamptz DEFAULT now(),

    CONSTRAINT unique_jtbd_process UNIQUE (jtbd_id, process_id)
);

CREATE TABLE IF NOT EXISTS jtbd_project_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),

    mapping_type text DEFAULT 'primary' CHECK (mapping_type IN ('primary', 'secondary', 'supporting')),

    created_at timestamptz DEFAULT now(),

    CONSTRAINT unique_jtbd_project UNIQUE (jtbd_id, project_id)
);

-- ============================================================================
-- PART 6: INDEXES
-- ============================================================================

-- Processes
CREATE INDEX IF NOT EXISTS idx_processes_tenant ON processes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_jtbd ON processes(primary_jtbd_id);

-- Activities
CREATE INDEX IF NOT EXISTS idx_activities_process ON process_activities(process_id);
CREATE INDEX IF NOT EXISTS idx_activities_sequence ON process_activities(process_id, sequence_order);

-- Phases
CREATE INDEX IF NOT EXISTS idx_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_phases_sequence ON project_phases(project_id, phase_number);

-- Work Packages
CREATE INDEX IF NOT EXISTS idx_work_packages_phase ON work_packages(phase_id);
CREATE INDEX IF NOT EXISTS idx_work_packages_status ON work_packages(status);

-- Tasks (shared)
CREATE INDEX IF NOT EXISTS idx_tasks_activity ON tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_work_package ON tasks(work_package_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Steps
CREATE INDEX IF NOT EXISTS idx_steps_task ON task_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_steps_sequence ON task_steps(task_id, sequence_order);

-- ============================================================================
-- PART 7: ENABLE RLS
-- ============================================================================

ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_sla_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_entry_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_exit_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_entry_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_exit_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_parameters ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 8: COMPREHENSIVE VIEWS
-- ============================================================================

-- Operations hierarchy view
CREATE OR REPLACE VIEW v_operations_hierarchy AS
SELECT
    p.id as process_id,
    p.code as process_code,
    p.name as process_name,
    p.process_category,
    p.functional_area,
    p.status as process_status,

    a.id as activity_id,
    a.sequence_order as activity_sequence,
    a.code as activity_code,
    a.name as activity_name,

    t.id as task_id,
    t.name as task_name,

    s.id as step_id,
    s.sequence_order as step_sequence,
    s.name as step_name,
    s.step_type,

    j.id as jtbd_id,
    j.code as jtbd_code,
    j.name as jtbd_name,

    p.tenant_id

FROM processes p
LEFT JOIN process_activities a ON a.process_id = p.id
LEFT JOIN tasks t ON t.activity_id = a.id
LEFT JOIN task_steps s ON s.task_id = t.id
LEFT JOIN jobs_to_be_done j ON p.primary_jtbd_id = j.id

ORDER BY
    p.name,
    a.sequence_order,
    t.name,
    s.sequence_order;

-- Projects hierarchy view
CREATE OR REPLACE VIEW v_projects_hierarchy AS
SELECT
    pr.id as project_id,
    pr.name as project_name,

    ph.id as phase_id,
    ph.phase_number,
    ph.name as phase_name,
    ph.status as phase_status,

    wp.id as work_package_id,
    wp.wbs_code,
    wp.name as work_package_name,
    wp.status as work_package_status,
    wp.percent_complete,

    t.id as task_id,
    t.name as task_name,

    s.id as step_id,
    s.sequence_order as step_sequence,
    s.name as step_name,
    s.step_type,

    j.id as jtbd_id,
    j.code as jtbd_code,
    j.name as jtbd_name,

    pr.organization_id as tenant_id

FROM projects pr
LEFT JOIN project_phases ph ON ph.project_id = pr.id
LEFT JOIN work_packages wp ON wp.phase_id = ph.id
LEFT JOIN tasks t ON t.work_package_id = wp.id
LEFT JOIN task_steps s ON s.task_id = t.id
LEFT JOIN jobs_to_be_done j ON pr.primary_jtbd_id = j.id

ORDER BY
    pr.name,
    ph.phase_number,
    wp.wbs_code,
    t.name,
    s.sequence_order;

-- ============================================================================
-- PART 9: COMMENTS
-- ============================================================================

COMMENT ON TABLE processes IS 'Operations domain: End-to-end value streams (APQC aligned)';
COMMENT ON TABLE process_activities IS 'Major building blocks within a process';
COMMENT ON TABLE project_phases IS 'Projects domain: Time-sequenced sections with gate reviews';
COMMENT ON TABLE work_packages IS 'WBS decomposition units owned by single team';
COMMENT ON TABLE task_steps IS 'Atomic actions within tasks - cannot be further decomposed';

COMMENT ON VIEW v_operations_hierarchy IS 'Complete operations hierarchy: Process → Activity → Task → Step';
COMMENT ON VIEW v_projects_hierarchy IS 'Complete projects hierarchy: Project → Phase → Work Package → Task → Step';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

SELECT 'Work hierarchy normalized schema complete - ZERO JSONB' as status;
