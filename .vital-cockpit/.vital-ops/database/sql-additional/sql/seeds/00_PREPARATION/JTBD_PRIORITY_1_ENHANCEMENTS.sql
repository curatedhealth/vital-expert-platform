-- ============================================================================
-- JTBD SCHEMA ENHANCEMENTS - PRIORITY 1: Core Enhancements
-- ============================================================================
-- Description: Implements 4 critical tables to enhance JTBD schema
--              1. jtbd_kpis - Structured KPI tracking
--              2. jtbd_success_criteria - Measurable success criteria
--              3. jtbd_workflow_activities - Detailed workflow breakdown
--              4. jtbd_dependencies - Job dependencies and sequences
--
-- Author: Claude Code
-- Date: 2025-11-17
-- Dependencies: Requires jobs_to_be_done, jtbd_workflow_stages tables
-- ============================================================================

-- ============================================================================
-- PREREQUISITE: Create Enum Types if they don't exist
-- ============================================================================

-- Create priority_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_type') THEN
        CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END $$;

COMMENT ON TYPE priority_type IS 'Priority levels for items: low, medium, high, critical';

-- ============================================================================
-- 1. JTBD KPIs - Normalize KPI tracking with baseline/target/current values
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    kpi_code text NOT NULL,  -- e.g., "KPI-001"
    kpi_name text NOT NULL,
    kpi_description text,
    kpi_type text CHECK (kpi_type IN ('time', 'cost', 'quality', 'volume', 'compliance')),

    -- Measurement
    measurement_unit text,  -- e.g., "hours", "dollars", "%"
    baseline_value numeric,
    target_value numeric,
    current_value numeric,

    -- Metadata
    data_source text,
    measurement_frequency frequency_type,
    owner text,
    priority priority_type DEFAULT 'medium',

    -- Tracking
    sequence_order integer DEFAULT 1,
    is_primary boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(jtbd_id, kpi_code)
);

-- Indexes for jtbd_kpis
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_jtbd_id ON jtbd_kpis(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_type ON jtbd_kpis(kpi_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_priority ON jtbd_kpis(priority);
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_tenant_id ON jtbd_kpis(tenant_id);

COMMENT ON TABLE jtbd_kpis IS 'Structured KPI tracking for Jobs To Be Done with baseline, target, and current values';
COMMENT ON COLUMN jtbd_kpis.kpi_code IS 'Unique identifier code for the KPI (e.g., KPI-001)';
COMMENT ON COLUMN jtbd_kpis.kpi_type IS 'Category of KPI: time, cost, quality, volume, or compliance';
COMMENT ON COLUMN jtbd_kpis.baseline_value IS 'Starting/current state value before improvement';
COMMENT ON COLUMN jtbd_kpis.target_value IS 'Desired future state value';
COMMENT ON COLUMN jtbd_kpis.current_value IS 'Current measured value (updated over time)';
COMMENT ON COLUMN jtbd_kpis.is_primary IS 'Indicates if this is the primary KPI for this JTBD';

-- ============================================================================
-- 2. JTBD SUCCESS CRITERIA - Measurable criteria for job completion
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_success_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    criterion_text text NOT NULL,
    criterion_type text CHECK (criterion_type IN ('quantitative', 'qualitative', 'behavioral', 'outcome')),
    measurement_method text,
    acceptance_threshold text,

    -- Validation
    is_measurable boolean DEFAULT true,
    validation_status text CHECK (validation_status IN ('draft', 'validated', 'deprecated')),
    validation_date date,

    -- Priority
    priority priority_type DEFAULT 'medium',
    sequence_order integer DEFAULT 1,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for jtbd_success_criteria
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_jtbd_id ON jtbd_success_criteria(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_type ON jtbd_success_criteria(criterion_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_status ON jtbd_success_criteria(validation_status);
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_tenant_id ON jtbd_success_criteria(tenant_id);

COMMENT ON TABLE jtbd_success_criteria IS 'Measurable success criteria defining what "done" looks like for a JTBD';
COMMENT ON COLUMN jtbd_success_criteria.criterion_type IS 'Type of criterion: quantitative (numeric), qualitative (subjective), behavioral (action-based), or outcome (result-based)';
COMMENT ON COLUMN jtbd_success_criteria.measurement_method IS 'How this criterion will be measured or validated';
COMMENT ON COLUMN jtbd_success_criteria.acceptance_threshold IS 'The threshold that must be met for success';
COMMENT ON COLUMN jtbd_success_criteria.validation_status IS 'Current validation state: draft, validated, or deprecated';

-- ============================================================================
-- 3. JTBD WORKFLOW ACTIVITIES - Detailed activity breakdown for workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_workflow_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_stage_id uuid NOT NULL REFERENCES jtbd_workflow_stages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    activity_name text NOT NULL,
    activity_description text,
    activity_type text CHECK (activity_type IN ('manual', 'automated', 'decision', 'review', 'approval')),

    -- Execution
    typical_duration text,  -- e.g., "2 hours"
    effort_level text CHECK (effort_level IN ('low', 'medium', 'high', 'very_high')),
    automation_potential numeric(3,2) CHECK (automation_potential BETWEEN 0 AND 1),

    -- Dependencies
    depends_on_activity_id uuid REFERENCES jtbd_workflow_activities(id),
    is_critical_path boolean DEFAULT false,
    is_bottleneck boolean DEFAULT false,

    -- Resources
    required_skills text[],
    required_tools text[],
    required_data text[],

    sequence_order integer DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for jtbd_workflow_activities
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_stage_id ON jtbd_workflow_activities(workflow_stage_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_type ON jtbd_workflow_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_critical ON jtbd_workflow_activities(is_critical_path) WHERE is_critical_path = true;
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_bottleneck ON jtbd_workflow_activities(is_bottleneck) WHERE is_bottleneck = true;
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_tenant_id ON jtbd_workflow_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_activities_depends_on ON jtbd_workflow_activities(depends_on_activity_id);

COMMENT ON TABLE jtbd_workflow_activities IS 'Detailed breakdown of activities within workflow stages, enabling bottleneck identification and automation targeting';
COMMENT ON COLUMN jtbd_workflow_activities.activity_type IS 'Type of activity: manual, automated, decision point, review, or approval';
COMMENT ON COLUMN jtbd_workflow_activities.automation_potential IS 'Score from 0-1 indicating potential for automation (1 = highly automatable)';
COMMENT ON COLUMN jtbd_workflow_activities.is_critical_path IS 'Indicates if this activity is on the critical path for job completion';
COMMENT ON COLUMN jtbd_workflow_activities.is_bottleneck IS 'Indicates if this activity is a known bottleneck';
COMMENT ON COLUMN jtbd_workflow_activities.depends_on_activity_id IS 'Reference to prerequisite activity that must complete first';

-- ============================================================================
-- 4. JTBD DEPENDENCIES - Job dependencies and sequences
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    dependent_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,

    dependency_type text NOT NULL CHECK (dependency_type IN (
        'prerequisite',      -- Must be completed before
        'parallel',          -- Can be done simultaneously
        'related',           -- Related but not blocking
        'alternative',       -- Alternative approach
        'complementary'      -- Enhances but not required
    )),

    strength text CHECK (strength IN ('weak', 'medium', 'strong')),
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(source_jtbd_id, dependent_jtbd_id),
    CHECK (source_jtbd_id != dependent_jtbd_id)  -- Prevent self-reference
);

-- Indexes for jtbd_dependencies
CREATE INDEX IF NOT EXISTS idx_jtbd_dependencies_source ON jtbd_dependencies(source_jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_dependencies_dependent ON jtbd_dependencies(dependent_jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_dependencies_type ON jtbd_dependencies(dependency_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_dependencies_strength ON jtbd_dependencies(strength);

COMMENT ON TABLE jtbd_dependencies IS 'Defines relationships and dependencies between Jobs To Be Done for sequencing and critical path analysis';
COMMENT ON COLUMN jtbd_dependencies.dependency_type IS 'Type of dependency: prerequisite (blocking), parallel (concurrent), related (informational), alternative (substitute), or complementary (enhancing)';
COMMENT ON COLUMN jtbd_dependencies.strength IS 'Strength of the dependency relationship: weak, medium, or strong';
COMMENT ON COLUMN jtbd_dependencies.source_jtbd_id IS 'The source job that others depend on';
COMMENT ON COLUMN jtbd_dependencies.dependent_jtbd_id IS 'The job that depends on the source job';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT
    'jtbd_kpis' as table_name,
    COUNT(*) as row_count
FROM jtbd_kpis

UNION ALL

SELECT
    'jtbd_success_criteria' as table_name,
    COUNT(*) as row_count
FROM jtbd_success_criteria

UNION ALL

SELECT
    'jtbd_workflow_activities' as table_name,
    COUNT(*) as row_count
FROM jtbd_workflow_activities

UNION ALL

SELECT
    'jtbd_dependencies' as table_name,
    COUNT(*) as row_count
FROM jtbd_dependencies;

-- ============================================================================
-- Summary of Enhancement
-- ============================================================================
-- These 4 tables provide:
-- 1. Structured KPI tracking with baseline/target/current metrics
-- 2. Clear success criteria definition for JTBD completion
-- 3. Detailed workflow activity breakdown for bottleneck analysis
-- 4. Job dependency mapping for sequencing and critical path planning
--
-- Next Steps:
-- - Phase 2: AI/ML enhancements (tags, similarity, recommendations)
-- - Phase 3: Analytics & tracking (metrics history, adoption tracking)
-- - Phase 4: Collaboration (stakeholders, comments)
-- - Phase 5: Integration (content mappings, project mappings)
-- ============================================================================
