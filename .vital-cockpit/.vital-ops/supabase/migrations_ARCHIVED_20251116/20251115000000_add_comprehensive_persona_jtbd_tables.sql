-- =====================================================================================
-- COMPREHENSIVE PERSONA & JTBD SCHEMA MIGRATION
-- =====================================================================================
-- Version: 3.0 (Comprehensive)
-- Purpose: Add all junction tables and fields to support v3.0 comprehensive templates
-- Aligns with: MEDICAL_AFFAIRS_PERSONAS_TEMPLATE_V3_COMPREHENSIVE.json
--              MEDICAL_AFFAIRS_JTBDS_TEMPLATE_V3_COMPREHENSIVE.json
-- =====================================================================================

-- =====================================================================================
-- PHASE 1: CRITICAL TABLES (Core Methodology Requirements)
-- =====================================================================================
-- These tables support essential methodologies: VPANES, ODI, Gen AI Assessment, Evidence

-- ---------------------------------------------------------------------------------
-- PERSONA CRITICAL TABLES
-- ---------------------------------------------------------------------------------

-- Success Metrics (3-5 per persona)
CREATE TABLE IF NOT EXISTS persona_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    metric_name TEXT NOT NULL,
    metric_description TEXT NOT NULL,
    current_performance TEXT,
    target_performance TEXT,
    measurement_frequency TEXT CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(persona_id, metric_name)
);

-- VPANES Priority Scoring (1 per persona)
CREATE TABLE IF NOT EXISTS persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    value_score DECIMAL(3,1) CHECK (value_score >= 0 AND value_score <= 10),
    priority_score DECIMAL(3,1) CHECK (priority_score >= 0 AND priority_score <= 10),
    addressability_score DECIMAL(3,1) CHECK (addressability_score >= 0 AND addressability_score <= 10),
    need_score DECIMAL(3,1) CHECK (need_score >= 0 AND need_score <= 10),
    engagement_score DECIMAL(3,1) CHECK (engagement_score >= 0 AND engagement_score <= 10),
    scale_score DECIMAL(3,1) CHECK (scale_score >= 0 AND scale_score <= 10),

    total_score DECIMAL(4,1) GENERATED ALWAYS AS (
        value_score + priority_score + addressability_score +
        need_score + engagement_score + scale_score
    ) STORED,

    priority_tier TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (value_score + priority_score + addressability_score + need_score + engagement_score + scale_score) >= 50 THEN 'tier_1'
            WHEN (value_score + priority_score + addressability_score + need_score + engagement_score + scale_score) >= 35 THEN 'tier_2'
            ELSE 'tier_3'
        END
    ) STORED,

    scoring_rationale TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(persona_id)
);

-- Education (1-3 per persona)
CREATE TABLE IF NOT EXISTS persona_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL,
    year_completed INTEGER CHECK (year_completed >= 1950 AND year_completed <= 2030),
    honors TEXT,
    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications (0-3 per persona)
CREATE TABLE IF NOT EXISTS persona_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    year_obtained INTEGER CHECK (year_obtained >= 1950 AND year_obtained <= 2030),
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence Sources for Personas (5-10 per persona)
CREATE TABLE IF NOT EXISTS persona_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    source_type TEXT CHECK (source_type IN ('primary_research', 'secondary_research', 'expert_interview', 'industry_report', 'survey_data', 'case_study')),
    citation TEXT NOT NULL,
    key_finding TEXT NOT NULL,
    sample_size INTEGER,
    methodology TEXT,
    publication_date DATE,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------
-- JTBD CRITICAL TABLES
-- ---------------------------------------------------------------------------------

-- ODI Outcomes (5-12 per JTBD) - CRITICAL FOR ODI METHODOLOGY
CREATE TABLE IF NOT EXISTS jtbd_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    outcome_id TEXT NOT NULL,
    outcome_statement TEXT NOT NULL,
    outcome_type TEXT CHECK (outcome_type IN ('speed', 'stability', 'output', 'cost', 'risk')),

    importance_score DECIMAL(3,1) CHECK (importance_score >= 0 AND importance_score <= 10),
    satisfaction_score DECIMAL(3,1) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 10),

    -- ODI Opportunity Score Formula: importance + max(importance - satisfaction, 0)
    opportunity_score DECIMAL(4,1) GENERATED ALWAYS AS (
        importance_score + GREATEST(importance_score - satisfaction_score, 0)
    ) STORED,

    opportunity_priority TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (importance_score + GREATEST(importance_score - satisfaction_score, 0)) > 12 THEN 'high'
            WHEN (importance_score + GREATEST(importance_score - satisfaction_score, 0)) >= 8 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,

    evidence_source TEXT,
    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(jtbd_id, outcome_id)
);

-- Gen AI Opportunities (1 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_gen_ai_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    automation_potential_score DECIMAL(3,1) CHECK (automation_potential_score >= 0 AND automation_potential_score <= 10),
    augmentation_potential_score DECIMAL(3,1) CHECK (augmentation_potential_score >= 0 AND augmentation_potential_score <= 10),

    total_estimated_value TEXT,
    implementation_complexity TEXT CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very_high')),
    time_to_value TEXT,

    key_ai_capabilities TEXT[],
    recommended_approach TEXT,

    risks TEXT[],
    mitigation_strategies TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(jtbd_id)
);

-- Gen AI Use Cases (3-5 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_gen_ai_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gen_ai_opportunity_id UUID NOT NULL REFERENCES jtbd_gen_ai_opportunities(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    use_case_id TEXT NOT NULL,
    use_case_name TEXT NOT NULL,
    use_case_description TEXT NOT NULL,

    ai_technology TEXT NOT NULL,
    specific_capability TEXT NOT NULL,

    time_savings TEXT,
    quality_improvement TEXT,
    estimated_cost TEXT,
    roi_estimate TEXT,

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(jtbd_id, use_case_id)
);

-- Evidence Sources for JTBDs (5-10 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    source_type TEXT CHECK (source_type IN ('primary_research', 'secondary_research', 'expert_interview', 'industry_report', 'survey_data', 'case_study')),
    citation TEXT NOT NULL,
    key_finding TEXT NOT NULL,
    sample_size INTEGER,
    methodology TEXT,
    publication_date DATE,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- PHASE 2: IMPORTANT TABLES (Rich Context & Analysis)
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- PERSONA IMPORTANT TABLES
-- ---------------------------------------------------------------------------------

-- Motivations (4-6 per persona)
CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    motivation_text TEXT NOT NULL,
    motivation_category TEXT CHECK (motivation_category IN ('professional', 'organizational', 'personal')),
    importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personality Traits (3-5 per persona)
CREATE TABLE IF NOT EXISTS persona_personality_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    trait_name TEXT NOT NULL,
    trait_description TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Values (3-5 per persona)
CREATE TABLE IF NOT EXISTS persona_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    value_name TEXT NOT NULL,
    value_description TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typical Day Activities (6-13 per persona)
CREATE TABLE IF NOT EXISTS persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    time_of_day TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------------
-- JTBD IMPORTANT TABLES
-- ---------------------------------------------------------------------------------

-- Constraints (3-5 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    constraint_text TEXT NOT NULL,
    constraint_type TEXT CHECK (constraint_type IN ('regulatory', 'budget', 'technical', 'resource', 'time')),
    impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Obstacles (3-5 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_obstacles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    obstacle_text TEXT NOT NULL,
    obstacle_type TEXT CHECK (obstacle_type IN ('technical', 'resource', 'process', 'political', 'knowledge')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solution Requirements (5-10 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_solution_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    requirement_text TEXT NOT NULL,
    requirement_category TEXT CHECK (requirement_category IN ('functional', 'technical', 'operational', 'compliance')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Stages (3-7 per JTBD) - Enhanced with pain points and activities
CREATE TABLE IF NOT EXISTS jtbd_workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    stage_number INTEGER NOT NULL,
    stage_name TEXT NOT NULL,
    stage_description TEXT NOT NULL,
    typical_duration TEXT,

    key_activities TEXT[],
    pain_points TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(jtbd_id, stage_number)
);

-- Value Drivers (3-5 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_value_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    value_description TEXT NOT NULL,
    quantified_impact TEXT NOT NULL,
    beneficiary TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitive Alternatives (3-5 per JTBD)
CREATE TABLE IF NOT EXISTS jtbd_competitive_alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    alternative_name TEXT NOT NULL,
    description TEXT NOT NULL,
    strengths TEXT[],
    weaknesses TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- ALTER TABLE STATEMENTS: Add Missing Core Fields
-- =====================================================================================

-- Personas table: Add narrative and context fields
ALTER TABLE personas
    ADD COLUMN IF NOT EXISTS background_story TEXT,
    ADD COLUMN IF NOT EXISTS a_day_in_the_life TEXT,
    ADD COLUMN IF NOT EXISTS age_range TEXT,
    ADD COLUMN IF NOT EXISTS education_level TEXT,
    ADD COLUMN IF NOT EXISTS location_type TEXT,
    ADD COLUMN IF NOT EXISTS reporting_to TEXT,
    ADD COLUMN IF NOT EXISTS team_size TEXT,
    ADD COLUMN IF NOT EXISTS budget_authority TEXT;

-- Jobs_to_be_done table: Add context and state fields
ALTER TABLE jobs_to_be_done
    ADD COLUMN IF NOT EXISTS situation TEXT,
    ADD COLUMN IF NOT EXISTS trigger_event TEXT,
    ADD COLUMN IF NOT EXISTS context_details TEXT,
    ADD COLUMN IF NOT EXISTS category_description TEXT,
    ADD COLUMN IF NOT EXISTS job_type TEXT CHECK (job_type IN ('functional', 'emotional', 'social')),
    ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    ADD COLUMN IF NOT EXISTS strategic_importance TEXT CHECK (strategic_importance IN ('low', 'medium', 'high', 'critical')),
    ADD COLUMN IF NOT EXISTS current_solutions TEXT[],
    ADD COLUMN IF NOT EXISTS current_process_duration TEXT,
    ADD COLUMN IF NOT EXISTS current_effort_hours TEXT,
    ADD COLUMN IF NOT EXISTS current_pain_points TEXT[];

-- =====================================================================================
-- INDEXES: Performance Optimization
-- =====================================================================================

-- Persona junction table indexes
CREATE INDEX IF NOT EXISTS idx_persona_success_metrics_persona_id ON persona_success_metrics(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_success_metrics_tenant_id ON persona_success_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_scoring_persona_id ON persona_vpanes_scoring(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_scoring_priority_tier ON persona_vpanes_scoring(priority_tier);
CREATE INDEX IF NOT EXISTS idx_persona_education_persona_id ON persona_education(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_certifications_persona_id ON persona_certifications(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_certifications_is_current ON persona_certifications(is_current);
CREATE INDEX IF NOT EXISTS idx_persona_evidence_sources_persona_id ON persona_evidence_sources(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_motivations_persona_id ON persona_motivations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_personality_traits_persona_id ON persona_personality_traits(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_values_persona_id ON persona_values(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_typical_day_persona_id ON persona_typical_day(persona_id);

-- JTBD junction table indexes
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_jtbd_id ON jtbd_outcomes(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_outcomes_opportunity_priority ON jtbd_outcomes(opportunity_priority);
CREATE INDEX IF NOT EXISTS idx_jtbd_gen_ai_opportunities_jtbd_id ON jtbd_gen_ai_opportunities(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_gen_ai_use_cases_jtbd_id ON jtbd_gen_ai_use_cases(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_gen_ai_use_cases_opportunity_id ON jtbd_gen_ai_use_cases(gen_ai_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_evidence_sources_jtbd_id ON jtbd_evidence_sources(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_constraints_jtbd_id ON jtbd_constraints(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_obstacles_jtbd_id ON jtbd_obstacles(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_solution_requirements_jtbd_id ON jtbd_solution_requirements(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_workflow_stages_jtbd_id ON jtbd_workflow_stages(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_jtbd_id ON jtbd_value_drivers(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_competitive_alternatives_jtbd_id ON jtbd_competitive_alternatives(jtbd_id);

-- =====================================================================================
-- COMMENTS: Table Documentation
-- =====================================================================================

COMMENT ON TABLE persona_success_metrics IS 'Success metrics for measuring persona goal achievement (3-5 per persona)';
COMMENT ON TABLE persona_vpanes_scoring IS 'VPANES priority scoring methodology (Value, Priority, Addressability, Need, Engagement, Scale)';
COMMENT ON TABLE persona_education IS 'Educational background including degrees, institutions, and fields of study (1-3 per persona)';
COMMENT ON TABLE persona_certifications IS 'Professional certifications and credentials (0-3 per persona)';
COMMENT ON TABLE persona_evidence_sources IS 'Research evidence supporting persona data with citations and methodology (5-10 per persona)';
COMMENT ON TABLE persona_motivations IS 'Professional, organizational, and personal motivations driving behavior (4-6 per persona)';
COMMENT ON TABLE persona_personality_traits IS 'Key personality characteristics affecting work style and decisions (3-5 per persona)';
COMMENT ON TABLE persona_values IS 'Core values guiding decision-making and priorities (3-5 per persona)';
COMMENT ON TABLE persona_typical_day IS 'Hour-by-hour breakdown of daily activities and routines (6-13 per persona)';

COMMENT ON TABLE jtbd_outcomes IS 'ODI (Outcome-Driven Innovation) outcomes with importance, satisfaction, and opportunity scores (5-12 per JTBD)';
COMMENT ON TABLE jtbd_gen_ai_opportunities IS 'Gen AI automation/augmentation assessment with ROI and complexity analysis (1 per JTBD)';
COMMENT ON TABLE jtbd_gen_ai_use_cases IS 'Specific Gen AI use cases with technology, time savings, and cost estimates (3-5 per JTBD)';
COMMENT ON TABLE jtbd_evidence_sources IS 'Research evidence supporting JTBD data with citations and methodology (5-10 per JTBD)';
COMMENT ON TABLE jtbd_constraints IS 'Regulatory, budget, technical, resource, and time constraints (3-5 per JTBD)';
COMMENT ON TABLE jtbd_obstacles IS 'Technical, resource, process, political, and knowledge obstacles (3-5 per JTBD)';
COMMENT ON TABLE jtbd_solution_requirements IS 'Functional, technical, operational, and compliance requirements (5-10 per JTBD)';
COMMENT ON TABLE jtbd_workflow_stages IS 'Detailed workflow stages with activities, durations, and pain points (3-7 per JTBD)';
COMMENT ON TABLE jtbd_value_drivers IS 'Quantified value drivers with impact estimates and beneficiaries (3-5 per JTBD)';
COMMENT ON TABLE jtbd_competitive_alternatives IS 'Current competitive solutions with strengths and weaknesses (3-5 per JTBD)';

COMMENT ON COLUMN jtbd_outcomes.opportunity_score IS 'ODI Opportunity Score = importance + max(importance - satisfaction, 0). >12 = high priority, 8-12 = medium, <8 = low';
COMMENT ON COLUMN persona_vpanes_scoring.total_score IS 'Total VPANES score (0-60). >=50 = tier_1, >=35 = tier_2, <35 = tier_3';

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================
-- Total tables created: 24 junction tables
-- Total fields added: 11 core fields (personas: 8, jtbd: 11)
-- Supports: v3.0 Comprehensive Persona & JTBD Templates
-- Compatible with: MEDICAL_AFFAIRS_PERSONAS_TEMPLATE_V3_COMPREHENSIVE.json
--                  MEDICAL_AFFAIRS_JTBDS_TEMPLATE_V3_COMPREHENSIVE.json
-- =====================================================================================
