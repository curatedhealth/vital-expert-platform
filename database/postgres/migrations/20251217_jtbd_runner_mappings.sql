-- Migration: JTBD-Runner Mappings
-- Purpose: Maps JTBDs to runners for each Ulwick job step
-- Version: 1.0
-- Date: 2025-12-17

-- =====================================================
-- JTBD Levels Enum
-- =====================================================

DO $$ BEGIN
    CREATE TYPE jtbd_level AS ENUM ('strategic', 'solution', 'workflow', 'task');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Job Steps Enum (Ulwick's 8 Universal Steps)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE job_step AS ENUM (
        'define',    -- Determine objectives and plan approach
        'locate',    -- Gather items and information needed
        'prepare',   -- Set up environment to do the job
        'confirm',   -- Verify ready to perform the job
        'execute',   -- Carry out the job
        'monitor',   -- Verify job is being successfully executed
        'modify',    -- Make alterations to improve execution
        'conclude'   -- Finish the job or prepare for next
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Runner Type Enum
-- =====================================================

DO $$ BEGIN
    CREATE TYPE runner_type AS ENUM ('task', 'family', 'orchestrator', 'infrastructure');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- AI Intervention Level Enum
-- =====================================================

DO $$ BEGIN
    CREATE TYPE ai_intervention_level AS ENUM (
        'ASSIST',      -- Human-led, AI supports
        'AUGMENT',     -- Human-led, AI enhances
        'AUTOMATE',    -- AI-led, human approves
        'ORCHESTRATE', -- AI coordinates multiple agents
        'REDESIGN'     -- AI transforms the process
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- JTBD Runner Mappings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS jtbd_runner_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- JTBD reference (nullable for default mappings)
    jtbd_id UUID REFERENCES jtbd(id) ON DELETE CASCADE,

    -- Tenant-specific customization
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- JTBD Level (for default mappings when jtbd_id is null)
    jtbd_level jtbd_level NOT NULL DEFAULT 'workflow',

    -- Job step (Ulwick's 8 steps)
    job_step job_step NOT NULL,

    -- Runner assignment
    runner_type runner_type NOT NULL,
    runner_id TEXT NOT NULL,  -- e.g., 'deep_research_runner', 'scan_runner'
    runner_category TEXT,      -- e.g., 'UNDERSTAND', 'EVALUATE', 'DECIDE'

    -- Service layer mapping
    service_layer TEXT CHECK (service_layer IN ('L1', 'L2', 'L3', 'L4', 'L5')),

    -- AI intervention level
    ai_intervention ai_intervention_level,

    -- Agent assignment (optional)
    default_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Priority and configuration
    is_default BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    configuration JSONB DEFAULT '{}',

    -- Metadata
    description TEXT,
    reasoning_pattern TEXT,  -- e.g., 'ToT', 'CoT', 'ReAct', 'Reflection'

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint for JTBD + step + runner
    UNIQUE NULLS NOT DISTINCT (jtbd_id, job_step, runner_id)
);

-- =====================================================
-- Default Runner Mappings (Templates)
-- =====================================================

CREATE TABLE IF NOT EXISTS default_runner_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Level and step
    jtbd_level jtbd_level NOT NULL,
    job_step job_step NOT NULL,

    -- Runner assignment
    runner_type runner_type NOT NULL,
    runner_id TEXT NOT NULL,
    runner_category TEXT,

    -- Service layer
    service_layer TEXT CHECK (service_layer IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    ai_intervention ai_intervention_level,

    -- Metadata
    description TEXT,
    reasoning_pattern TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint
    UNIQUE (jtbd_level, job_step)
);

-- =====================================================
-- Family Runner Selection Table
-- =====================================================

CREATE TABLE IF NOT EXISTS family_runner_selection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template family (maps to mission templates)
    template_family TEXT NOT NULL UNIQUE,

    -- Runner class
    runner_class TEXT NOT NULL,  -- e.g., 'DeepResearchRunner'
    runner_id TEXT NOT NULL,     -- e.g., 'deep_research_runner'

    -- Reasoning pattern
    reasoning_pattern TEXT NOT NULL,

    -- Use case description
    use_case TEXT,

    -- Is active
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_runner_mappings_jtbd ON jtbd_runner_mappings(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_runner_mappings_step ON jtbd_runner_mappings(job_step);
CREATE INDEX IF NOT EXISTS idx_runner_mappings_runner ON jtbd_runner_mappings(runner_id);
CREATE INDEX IF NOT EXISTS idx_runner_mappings_level ON jtbd_runner_mappings(jtbd_level);
CREATE INDEX IF NOT EXISTS idx_runner_mappings_tenant ON jtbd_runner_mappings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_default_mappings_level_step ON default_runner_mappings(jtbd_level, job_step);

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_runner_mappings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_runner_mappings_updated_at ON jtbd_runner_mappings;
CREATE TRIGGER trg_runner_mappings_updated_at
    BEFORE UPDATE ON jtbd_runner_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_runner_mappings_timestamp();

-- =====================================================
-- Seed Default Runner Mappings
-- =====================================================

-- Strategic JTBD (L5) defaults
INSERT INTO default_runner_mappings (jtbd_level, job_step, runner_type, runner_id, runner_category, service_layer, ai_intervention, reasoning_pattern, description)
VALUES
    ('strategic', 'define', 'task', 'frame_runner', 'DECIDE', 'L5', 'REDESIGN', 'Strategic framing', 'Frame strategic vision and goals'),
    ('strategic', 'locate', 'task', 'explore_runner', 'UNDERSTAND', 'L5', 'REDESIGN', 'Market exploration', 'Gather market intelligence'),
    ('strategic', 'prepare', 'task', 'schedule_runner', 'PLAN', 'L5', 'REDESIGN', 'Roadmap planning', 'Create strategic roadmap'),
    ('strategic', 'confirm', 'task', 'alignment_runner', 'ALIGN', 'L5', 'REDESIGN', 'Stakeholder alignment', 'Validate stakeholder alignment'),
    ('strategic', 'execute', 'orchestrator', 'solution_orchestrator', NULL, 'L5', 'REDESIGN', 'Solution orchestration', 'Coordinate solution-level activities'),
    ('strategic', 'monitor', 'task', 'trend_runner', 'WATCH', 'L5', 'REDESIGN', 'Trend monitoring', 'Track strategic progress'),
    ('strategic', 'modify', 'task', 'pivot_runner', 'ADAPT', 'L5', 'REDESIGN', 'Strategic pivot', 'Adjust strategic direction'),
    ('strategic', 'conclude', 'task', 'narrate_runner', 'SYNTHESIZE', 'L5', 'REDESIGN', 'Strategic narrative', 'Synthesize strategic outcomes')
ON CONFLICT (jtbd_level, job_step) DO NOTHING;

-- Solution JTBD (L4) defaults
INSERT INTO default_runner_mappings (jtbd_level, job_step, runner_type, runner_id, runner_category, service_layer, ai_intervention, reasoning_pattern, description)
VALUES
    ('solution', 'define', 'task', 'frame_runner', 'DECIDE', 'L4', 'ORCHESTRATE', 'Solution scoping', 'Define solution scope'),
    ('solution', 'locate', 'task', 'extract_runner', 'UNDERSTAND', 'L4', 'ORCHESTRATE', 'Requirements gathering', 'Gather requirements'),
    ('solution', 'prepare', 'task', 'dependency_runner', 'PLAN', 'L4', 'ORCHESTRATE', 'Dependency mapping', 'Sequence workflow steps'),
    ('solution', 'confirm', 'task', 'consistency_check_runner', 'VALIDATE', 'L4', 'ORCHESTRATE', 'Consistency validation', 'Validate solution readiness'),
    ('solution', 'execute', 'orchestrator', 'workflow_orchestrator', NULL, 'L4', 'ORCHESTRATE', 'Workflow orchestration', 'Coordinate workflow runners'),
    ('solution', 'monitor', 'task', 'baseline_runner', 'WATCH', 'L4', 'ORCHESTRATE', 'Baseline tracking', 'Track against baseline'),
    ('solution', 'modify', 'task', 'mutate_runner', 'REFINE', 'L4', 'ORCHESTRATE', 'Solution refinement', 'Revise solution approach'),
    ('solution', 'conclude', 'task', 'collect_runner', 'SYNTHESIZE', 'L4', 'ORCHESTRATE', 'Integration', 'Integrate deliverables')
ON CONFLICT (jtbd_level, job_step) DO NOTHING;

-- Workflow JTBD (L3) defaults
INSERT INTO default_runner_mappings (jtbd_level, job_step, runner_type, runner_id, runner_category, service_layer, ai_intervention, reasoning_pattern, description)
VALUES
    ('workflow', 'define', 'task', 'decompose_runner', 'PLAN', 'L3', 'AUTOMATE', 'Goal decomposition', 'Parse and decompose goals'),
    ('workflow', 'locate', 'infrastructure', 'knowledge_retriever', NULL, 'L3', 'AUTOMATE', 'RAG retrieval', 'Gather knowledge context'),
    ('workflow', 'prepare', 'task', 'decompose_runner', 'PLAN', 'L3', 'AUTOMATE', 'Task planning', 'Plan execution steps'),
    ('workflow', 'confirm', 'task', 'fact_check_runner', 'VALIDATE', 'L3', 'AUTOMATE', 'Readiness validation', 'Validate execution readiness'),
    ('workflow', 'execute', 'family', 'generic_runner', NULL, 'L3', 'AUTOMATE', 'Family execution', 'Execute family runner'),
    ('workflow', 'monitor', 'task', 'delta_runner', 'WATCH', 'L3', 'AUTOMATE', 'Progress tracking', 'Track execution progress'),
    ('workflow', 'modify', 'task', 'critic_runner', 'REFINE', 'L3', 'AUTOMATE', 'Output refinement', 'Refine outputs'),
    ('workflow', 'conclude', 'task', 'narrate_runner', 'SYNTHESIZE', 'L3', 'AUTOMATE', 'Narrative synthesis', 'Generate final report')
ON CONFLICT (jtbd_level, job_step) DO NOTHING;

-- Task JTBD (L1-L2) defaults
INSERT INTO default_runner_mappings (jtbd_level, job_step, runner_type, runner_id, runner_category, service_layer, ai_intervention, reasoning_pattern, description)
VALUES
    ('task', 'define', 'infrastructure', 'input_validator', NULL, 'L1', 'AUGMENT', 'Input validation', 'Validate input schema'),
    ('task', 'locate', 'infrastructure', 'knowledge_injector', NULL, 'L1', 'AUGMENT', 'Context injection', 'Inject knowledge context'),
    ('task', 'prepare', 'infrastructure', 'prompt_composer', NULL, 'L1', 'AUGMENT', 'Prompt composition', 'Compose task prompt'),
    ('task', 'confirm', 'infrastructure', 'schema_validator', NULL, 'L1', 'AUGMENT', 'Schema validation', 'Validate output schema'),
    ('task', 'execute', 'task', 'generic_task_runner', NULL, 'L1', 'AUGMENT', 'Task execution', 'Execute task runner'),
    ('task', 'conclude', 'task', 'format_runner', 'CREATE', 'L1', 'AUGMENT', 'Output formatting', 'Format final output')
ON CONFLICT (jtbd_level, job_step) DO NOTHING;

-- =====================================================
-- Seed Family Runner Selection
-- =====================================================

INSERT INTO family_runner_selection (template_family, runner_class, runner_id, reasoning_pattern, use_case)
VALUES
    ('DEEP_RESEARCH', 'DeepResearchRunner', 'deep_research_runner', 'ToT → CoT → Reflection', 'Research & Analysis'),
    ('STRATEGY', 'StrategyRunner', 'strategy_runner', 'Scenario → SWOT → Roadmap', 'Strategic Planning'),
    ('EVALUATION', 'EvaluationRunner', 'evaluation_runner', 'MCDA Scoring', 'Decision Support'),
    ('INVESTIGATION', 'InvestigationRunner', 'investigation_runner', 'RCA → Bayesian', 'Root Cause Analysis'),
    ('PROBLEM_SOLVING', 'ProblemSolvingRunner', 'problem_solving_runner', 'Hypothesis → Test → Iterate', 'Problem Resolution'),
    ('COMMUNICATION', 'CommunicationRunner', 'communication_runner', 'Audience → Format → Review', 'Content Creation'),
    ('MONITORING', 'MonitoringRunner', 'monitoring_runner', 'Baseline → Delta → Alert', 'Tracking & Alerting'),
    ('GENERIC', 'GenericRunner', 'generic_runner', 'Plan → Execute → Review', 'Default Fallback'),
    -- Domain runners
    ('FORESIGHT', 'ForesightRunner', 'foresight_runner', 'Trend → Forecast → Scenario', 'Trend Analysis & Forecasting'),
    ('BRAND_STRATEGY', 'BrandStrategyRunner', 'brand_strategy_runner', 'Position → Message → Plan', 'Commercial Planning'),
    ('DIGITAL_HEALTH', 'DigitalHealthRunner', 'digital_health_runner', 'DTx → RWE → Engagement', 'Digital Therapeutics'),
    ('MEDICAL_AFFAIRS', 'MedicalAffairsRunner', 'medical_affairs_runner', 'KOL → MSL → Scientific', 'Medical Affairs Activities'),
    ('MARKET_ACCESS', 'MarketAccessRunner', 'market_access_runner', 'HEOR → Price → Reimburse', 'Market Access Strategy'),
    ('DESIGN_THINKING', 'DesignThinkingRunner', 'design_thinking_runner', 'Research → Ideate → Prototype', 'User Research & Design')
ON CONFLICT (template_family) DO NOTHING;

-- =====================================================
-- Lookup Function: Get Runner for JTBD + Job Step
-- =====================================================

CREATE OR REPLACE FUNCTION get_runner_for_jtbd(
    p_jtbd_id UUID,
    p_job_step job_step,
    p_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    runner_type runner_type,
    runner_id TEXT,
    runner_category TEXT,
    service_layer TEXT,
    ai_intervention ai_intervention_level,
    is_default BOOLEAN,
    configuration JSONB
) AS $$
BEGIN
    -- First try: JTBD-specific mapping for tenant
    RETURN QUERY
    SELECT
        jrm.runner_type,
        jrm.runner_id,
        jrm.runner_category,
        jrm.service_layer,
        jrm.ai_intervention,
        jrm.is_default,
        jrm.configuration
    FROM jtbd_runner_mappings jrm
    WHERE jrm.jtbd_id = p_jtbd_id
      AND jrm.job_step = p_job_step
      AND (jrm.tenant_id = p_tenant_id OR jrm.tenant_id IS NULL)
    ORDER BY
        CASE WHEN jrm.tenant_id = p_tenant_id THEN 0 ELSE 1 END,
        jrm.is_default DESC,
        jrm.priority ASC
    LIMIT 1;

    IF NOT FOUND THEN
        -- Second try: Get JTBD level and use default mapping
        RETURN QUERY
        SELECT
            drm.runner_type,
            drm.runner_id,
            drm.runner_category,
            drm.service_layer,
            drm.ai_intervention,
            true::BOOLEAN as is_default,
            '{}'::JSONB as configuration
        FROM default_runner_mappings drm
        WHERE drm.jtbd_level = (
            SELECT COALESCE(j.jtbd_level::jtbd_level, 'workflow'::jtbd_level)
            FROM jtbd j
            WHERE j.id = p_jtbd_id
        )
        AND drm.job_step = p_job_step
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        -- Fallback: Use workflow level defaults
        RETURN QUERY
        SELECT
            drm.runner_type,
            drm.runner_id,
            drm.runner_category,
            drm.service_layer,
            drm.ai_intervention,
            true::BOOLEAN as is_default,
            '{}'::JSONB as configuration
        FROM default_runner_mappings drm
        WHERE drm.jtbd_level = 'workflow'
          AND drm.job_step = p_job_step
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Lookup Function: Get Family Runner for Template
-- =====================================================

CREATE OR REPLACE FUNCTION get_family_runner_for_template(
    p_template_family TEXT
)
RETURNS TABLE (
    runner_class TEXT,
    runner_id TEXT,
    reasoning_pattern TEXT,
    use_case TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        frs.runner_class,
        frs.runner_id,
        frs.reasoning_pattern,
        frs.use_case
    FROM family_runner_selection frs
    WHERE frs.template_family = UPPER(p_template_family)
      AND frs.is_active = true;

    IF NOT FOUND THEN
        -- Fallback to GENERIC
        RETURN QUERY
        SELECT
            frs.runner_class,
            frs.runner_id,
            frs.reasoning_pattern,
            frs.use_case
        FROM family_runner_selection frs
        WHERE frs.template_family = 'GENERIC'
          AND frs.is_active = true;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- View: Complete Runner Mappings by JTBD Level
-- =====================================================

CREATE OR REPLACE VIEW v_runner_mappings_by_level AS
SELECT
    drm.jtbd_level,
    drm.job_step,
    drm.runner_type,
    drm.runner_id,
    drm.runner_category,
    drm.service_layer,
    drm.ai_intervention,
    drm.reasoning_pattern,
    drm.description
FROM default_runner_mappings drm
ORDER BY
    CASE drm.jtbd_level
        WHEN 'strategic' THEN 1
        WHEN 'solution' THEN 2
        WHEN 'workflow' THEN 3
        WHEN 'task' THEN 4
    END,
    CASE drm.job_step
        WHEN 'define' THEN 1
        WHEN 'locate' THEN 2
        WHEN 'prepare' THEN 3
        WHEN 'confirm' THEN 4
        WHEN 'execute' THEN 5
        WHEN 'monitor' THEN 6
        WHEN 'modify' THEN 7
        WHEN 'conclude' THEN 8
    END;

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE jtbd_runner_mappings ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped read access
CREATE POLICY jtbd_runner_mappings_select_policy ON jtbd_runner_mappings
    FOR SELECT
    USING (
        tenant_id IS NULL  -- Global defaults are readable by all
        OR tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

-- Tenant-scoped insert access
CREATE POLICY jtbd_runner_mappings_insert_policy ON jtbd_runner_mappings
    FOR INSERT
    WITH CHECK (
        tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

-- Tenant-scoped update access
CREATE POLICY jtbd_runner_mappings_update_policy ON jtbd_runner_mappings
    FOR UPDATE
    USING (
        tenant_id = (current_setting('app.current_tenant_id', true))::UUID
    );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE jtbd_runner_mappings IS 'Maps JTBD + Job Step to appropriate runners, per JTBD_RUNNER_MAPPING.md';
COMMENT ON TABLE default_runner_mappings IS 'Default runner mappings by JTBD level, used as fallback';
COMMENT ON TABLE family_runner_selection IS 'Maps template families to family runners for workflow JTBD execution';
COMMENT ON FUNCTION get_runner_for_jtbd IS 'Get the appropriate runner for a JTBD at a specific job step';
COMMENT ON FUNCTION get_family_runner_for_template IS 'Get the family runner class for a mission template family';
