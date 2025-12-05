-- ============================================================================
-- JTBD Schema Completeness Migration
-- Ensures all JTBD tables, columns, and relationships exist
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Functional Area Type
DO $$ BEGIN
    CREATE TYPE functional_area_type AS ENUM (
        'medical_affairs', 'market_access', 'regulatory_affairs', 'commercial',
        'clinical_development', 'research', 'manufacturing', 'quality', 'supply_chain'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Job Category Type
DO $$ BEGIN
    CREATE TYPE job_category_type AS ENUM ('strategic', 'operational', 'tactical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Complexity Type
DO $$ BEGIN
    CREATE TYPE complexity_type AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Frequency Type
DO $$ BEGIN
    CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- JTBD Status
DO $$ BEGIN
    CREATE TYPE jtbd_status AS ENUM ('draft', 'active', 'under_review', 'archived', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mapping Source Type
DO $$ BEGIN
    CREATE TYPE mapping_source_type AS ENUM ('manual', 'ai_generated', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Outcome Type
DO $$ BEGIN
    CREATE TYPE outcome_type AS ENUM ('speed', 'stability', 'output', 'cost', 'risk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Obstacle Type
DO $$ BEGIN
    CREATE TYPE obstacle_type AS ENUM ('technical', 'resource', 'process', 'political', 'knowledge');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Constraint Type
DO $$ BEGIN
    CREATE TYPE constraint_type AS ENUM ('regulatory', 'budget', 'technical', 'resource', 'time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Severity Type
DO $$ BEGIN
    CREATE TYPE severity_type AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Requirement Category
DO $$ BEGIN
    CREATE TYPE requirement_category_type AS ENUM ('functional', 'technical', 'operational', 'compliance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Evidence Source Type
DO $$ BEGIN
    CREATE TYPE evidence_source_type AS ENUM (
        'primary_research', 'secondary_research', 'expert_interview',
        'industry_report', 'survey_data', 'case_study'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Confidence Level
DO $$ BEGIN
    CREATE TYPE confidence_level_type AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE TABLE: jobs_to_be_done
-- ============================================================================

-- Add missing columns to jobs_to_be_done if they don't exist
DO $$
BEGIN
    -- Add industry_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jobs_to_be_done' AND column_name = 'industry_id') THEN
        ALTER TABLE jobs_to_be_done ADD COLUMN industry_id uuid REFERENCES industries(id);
    END IF;

    -- Add org_function_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jobs_to_be_done' AND column_name = 'org_function_id') THEN
        ALTER TABLE jobs_to_be_done ADD COLUMN org_function_id uuid REFERENCES org_functions(id);
    END IF;

    -- Add unique_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jobs_to_be_done' AND column_name = 'unique_id') THEN
        ALTER TABLE jobs_to_be_done ADD COLUMN unique_id varchar UNIQUE;
    END IF;

    -- Add jtbd_code if missing (alias for code standardization)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'jobs_to_be_done' AND column_name = 'jtbd_code') THEN
        ALTER TABLE jobs_to_be_done ADD COLUMN jtbd_code varchar;
    END IF;
END $$;

-- ============================================================================
-- JUNCTION TABLE: jtbd_personas
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_personas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    persona_id uuid NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    relevance_score numeric(3,2) NOT NULL CHECK (relevance_score BETWEEN 0 AND 1),
    is_primary boolean DEFAULT false,
    notes text,
    mapping_source mapping_source_type DEFAULT 'manual',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(jtbd_id, persona_id)
);

-- ============================================================================
-- ODI TABLE: jtbd_outcomes
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_outcomes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    outcome_id text NOT NULL,
    outcome_statement text NOT NULL,
    outcome_type text CHECK (outcome_type IN ('speed', 'stability', 'output', 'cost', 'risk')),
    importance_score numeric(3,1) CHECK (importance_score BETWEEN 0 AND 10),
    satisfaction_score numeric(3,1) CHECK (satisfaction_score BETWEEN 0 AND 10),
    opportunity_score numeric(4,1) GENERATED ALWAYS AS (
        importance_score + GREATEST(importance_score - satisfaction_score, 0)
    ) STORED,
    opportunity_priority text GENERATED ALWAYS AS (
        CASE
            WHEN (importance_score + GREATEST(importance_score - satisfaction_score, 0)) > 12 THEN 'high'
            WHEN (importance_score + GREATEST(importance_score - satisfaction_score, 0)) >= 8 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,
    evidence_source text,
    sequence_order integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(jtbd_id, outcome_id)
);

-- ============================================================================
-- TABLE: jtbd_obstacles
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_obstacles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    obstacle_text text NOT NULL,
    obstacle_type text CHECK (obstacle_type IN ('technical', 'resource', 'process', 'political', 'knowledge')),
    severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_constraints
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_constraints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    constraint_text text NOT NULL,
    constraint_type text CHECK (constraint_type IN ('regulatory', 'budget', 'technical', 'resource', 'time')),
    impact text CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_workflow_stages
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_workflow_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    stage_number integer NOT NULL,
    stage_name text NOT NULL,
    stage_description text NOT NULL,
    typical_duration text,
    key_activities text[],
    pain_points text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(jtbd_id, stage_number)
);

-- ============================================================================
-- TABLE: jtbd_competitive_alternatives
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_competitive_alternatives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    alternative_name text NOT NULL,
    description text NOT NULL,
    strengths text[],
    weaknesses text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_value_drivers
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_value_drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    value_description text NOT NULL,
    quantified_impact text NOT NULL,
    beneficiary text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_solution_requirements
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_solution_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    requirement_text text NOT NULL,
    requirement_category text CHECK (requirement_category IN ('functional', 'technical', 'operational', 'compliance')),
    priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_gen_ai_opportunities
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_gen_ai_opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE UNIQUE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    automation_potential_score numeric(3,1) CHECK (automation_potential_score BETWEEN 0 AND 10),
    augmentation_potential_score numeric(3,1) CHECK (augmentation_potential_score BETWEEN 0 AND 10),
    total_estimated_value text,
    implementation_complexity text CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very_high')),
    time_to_value text,
    key_ai_capabilities text[],
    recommended_approach text,
    risks text[],
    mitigation_strategies text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_gen_ai_use_cases
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_gen_ai_use_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gen_ai_opportunity_id uuid NOT NULL REFERENCES jtbd_gen_ai_opportunities(id) ON DELETE CASCADE,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    use_case_id text NOT NULL,
    use_case_name text NOT NULL,
    use_case_description text NOT NULL,
    ai_technology text NOT NULL,
    specific_capability text NOT NULL,
    time_savings text,
    quality_improvement text,
    estimated_cost text,
    roi_estimate text,
    sequence_order integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(jtbd_id, use_case_id)
);

-- ============================================================================
-- TABLE: jtbd_evidence_sources
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_evidence_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    source_type text CHECK (source_type IN (
        'primary_research', 'secondary_research', 'expert_interview',
        'industry_report', 'survey_data', 'case_study'
    )),
    citation text NOT NULL,
    key_finding text NOT NULL,
    sample_size integer,
    methodology text,
    publication_date date,
    confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: capability_jtbd_mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS capability_jtbd_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    relevance_score numeric(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
    is_required boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(capability_id, jtbd_id)
);

-- ============================================================================
-- TABLE: jtbd_kpis
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    kpi_name text NOT NULL,
    kpi_description text,
    target_value text,
    current_value text,
    unit_of_measure text,
    measurement_frequency text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_success_criteria
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_success_criteria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    criterion_text text NOT NULL,
    is_mandatory boolean DEFAULT false,
    verification_method text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TABLE: jtbd_dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_dependencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    dependent_jtbd_id uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    dependency_type text DEFAULT 'blocks',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(source_jtbd_id, dependent_jtbd_id),
    CHECK (source_jtbd_id != dependent_jtbd_id)
);

-- ============================================================================
-- TABLE: jtbd_workflow_activities (child of jtbd_workflow_stages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS jtbd_workflow_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_stage_id uuid NOT NULL REFERENCES jtbd_workflow_stages(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    activity_name text NOT NULL,
    activity_description text,
    sequence_order integer DEFAULT 1,
    estimated_duration text,
    responsible_role text,
    tools_used text[],
    outputs text[],
    depends_on_activity_id uuid REFERENCES jtbd_workflow_activities(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- jtbd_personas indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_personas_jtbd_id ON jtbd_personas(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_personas_persona_id ON jtbd_personas(persona_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_personas_relevance ON jtbd_personas(relevance_score DESC);

-- jtbd_outcomes indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_jtbd_id ON jtbd_outcomes(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_tenant_id ON jtbd_outcomes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_opportunity ON jtbd_outcomes(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_priority ON jtbd_outcomes(opportunity_priority);

-- jtbd_obstacles indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_obstacles_jtbd_id ON jtbd_obstacles(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_obstacles_severity ON jtbd_obstacles(severity);

-- jtbd_constraints indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_constraints_jtbd_id ON jtbd_constraints(jtbd_id);

-- jtbd_workflow_stages indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_stages_jtbd_id ON jtbd_workflow_stages(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_stages_order ON jtbd_workflow_stages(jtbd_id, stage_number);

-- jtbd_gen_ai_opportunities indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_gen_ai_opportunities_jtbd_id ON jtbd_gen_ai_opportunities(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_gen_ai_automation ON jtbd_gen_ai_opportunities(automation_potential_score DESC);

-- jtbd_evidence_sources indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_evidence_sources_jtbd_id ON jtbd_evidence_sources(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_evidence_sources_type ON jtbd_evidence_sources(source_type);

-- capability_jtbd_mapping indexes
CREATE INDEX IF NOT EXISTS idx_capability_jtbd_mapping_capability ON capability_jtbd_mapping(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_jtbd_mapping_jtbd ON capability_jtbd_mapping(jtbd_id);

-- jobs_to_be_done org mapping indexes
CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_industry ON jobs_to_be_done(industry_id);
CREATE INDEX IF NOT EXISTS idx_jobs_to_be_done_function ON jobs_to_be_done(org_function_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all JTBD tables
ALTER TABLE jtbd_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_obstacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_competitive_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_value_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_solution_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_gen_ai_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_gen_ai_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_jtbd_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_success_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jtbd_workflow_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPREHENSIVE VIEW: v_jtbd_complete
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_complete AS
SELECT
    j.id as jtbd_id,
    j.code,
    j.jtbd_code,
    j.unique_id,
    j.name,
    j.description,
    j.functional_area,
    j.job_category,
    j.complexity,
    j.frequency,
    j.status,
    j.validation_score,
    j.tenant_id,

    -- Industry & Function (Org Mapping)
    i.name as industry_name,
    f.name as function_name,

    -- Aggregated counts
    (SELECT COUNT(*) FROM jtbd_personas WHERE jtbd_id = j.id) as persona_count,
    (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = j.id) as outcome_count,
    (SELECT COUNT(*) FROM jtbd_obstacles WHERE jtbd_id = j.id) as obstacle_count,
    (SELECT COUNT(*) FROM jtbd_constraints WHERE jtbd_id = j.id) as constraint_count,
    (SELECT COUNT(*) FROM jtbd_workflow_stages WHERE jtbd_id = j.id) as workflow_stage_count,
    (SELECT COUNT(*) FROM jtbd_value_drivers WHERE jtbd_id = j.id) as value_driver_count,
    (SELECT COUNT(*) FROM jtbd_evidence_sources WHERE jtbd_id = j.id) as evidence_count,

    -- ODI metrics
    (SELECT AVG(opportunity_score) FROM jtbd_outcomes WHERE jtbd_id = j.id) as avg_opportunity_score,
    (SELECT MAX(opportunity_score) FROM jtbd_outcomes WHERE jtbd_id = j.id) as max_opportunity_score,

    -- Gen AI potential
    gai.automation_potential_score,
    gai.augmentation_potential_score,
    gai.total_estimated_value,
    (SELECT COUNT(*) FROM jtbd_gen_ai_use_cases WHERE jtbd_id = j.id) as ai_use_case_count,

    -- Timestamps
    j.created_at,
    j.updated_at

FROM jobs_to_be_done j
LEFT JOIN industries i ON j.industry_id = i.id
LEFT JOIN org_functions f ON j.org_function_id = f.id
LEFT JOIN jtbd_gen_ai_opportunities gai ON gai.jtbd_id = j.id
WHERE j.deleted_at IS NULL;

-- ============================================================================
-- COMPREHENSIVE VIEW: v_jtbd_org_hierarchy
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_org_hierarchy AS
SELECT
    j.id as jtbd_id,
    j.code,
    j.jtbd_code,
    j.unique_id,
    j.name as jtbd_name,
    j.functional_area,
    j.job_category,
    j.complexity,
    j.tenant_id,

    -- Industry
    i.name as industry_name,

    -- Function
    f.name as function_name,

    -- Persona details
    p.id as persona_id,
    p.name as persona_name,
    p.seniority_level,
    jp.relevance_score,
    jp.is_primary,

    -- Role
    r.name as role_name,

    -- Department
    d.name as department_name

FROM jobs_to_be_done j
LEFT JOIN industries i ON j.industry_id = i.id
LEFT JOIN org_functions f ON j.org_function_id = f.id
LEFT JOIN jtbd_personas jp ON jp.jtbd_id = j.id
LEFT JOIN personas p ON p.id = jp.persona_id
LEFT JOIN org_roles r ON r.id = p.role_id
LEFT JOIN org_departments d ON d.id = p.department_id
WHERE j.deleted_at IS NULL;

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE jtbd_outcomes IS 'ODI (Outcome-Driven Innovation) outcomes with importance/satisfaction scoring';
COMMENT ON COLUMN jtbd_outcomes.opportunity_score IS 'Calculated as: importance + MAX(importance - satisfaction, 0)';
COMMENT ON COLUMN jtbd_outcomes.opportunity_priority IS 'HIGH (>12), MEDIUM (8-12), LOW (<8)';
COMMENT ON COLUMN jtbd_outcomes.outcome_type IS 'speed, stability, output, cost, risk';

COMMENT ON TABLE jtbd_personas IS 'Junction table linking JTBDs to personas with relevance scoring';
COMMENT ON TABLE jtbd_gen_ai_opportunities IS 'AI automation/augmentation potential assessment per JTBD';
COMMENT ON TABLE jtbd_workflow_stages IS 'Process stages for completing the JTBD';
COMMENT ON TABLE jtbd_value_drivers IS 'Quantified value creation opportunities';

COMMENT ON VIEW v_jtbd_complete IS 'Comprehensive JTBD view with all metrics and counts';
COMMENT ON VIEW v_jtbd_org_hierarchy IS 'JTBD view with full organizational hierarchy';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

SELECT 'JTBD Schema migration complete. All tables, indexes, and views created.' as status;
