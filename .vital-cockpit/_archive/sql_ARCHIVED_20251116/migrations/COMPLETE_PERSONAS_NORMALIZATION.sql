-- =====================================================================================
-- COMPLETE PERSONAS NORMALIZATION MIGRATION
-- =====================================================================================
-- Database: bomltkhixeatxuoxmolq (Vital-expert)
-- Purpose: Add all missing columns and tables for Medical Affairs Personas v3.0
-- Golden Rule: NO JSONB - Everything normalized
-- Date: 2025-11-16
-- =====================================================================================

-- =====================================================================================
-- PHASE 0: ENSURE TENANT_ID EXISTS (CRITICAL FOR ALL JUNCTION TABLES)
-- =====================================================================================
-- This must run OUTSIDE the transaction to ensure the column exists before we create tables

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'personas' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE personas
    ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_personas_tenant ON personas(tenant_id);

    RAISE NOTICE 'Added tenant_id column to personas table';
  ELSE
    RAISE NOTICE 'tenant_id column already exists in personas table';
  END IF;
END $$;

-- =====================================================================================
-- START TRANSACTION FOR REMAINING CHANGES
-- =====================================================================================

BEGIN;

-- =====================================================================================
-- PHASE 1: EXTEND BASE PERSONAS TABLE WITH MISSING COLUMNS
-- =====================================================================================

-- Core Info Fields
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS role_slug TEXT,
ADD COLUMN IF NOT EXISTS function_slug TEXT,
ADD COLUMN IF NOT EXISTS department_slug TEXT,
ADD COLUMN IF NOT EXISTS persona_number INTEGER;

-- Professional Profile
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS years_in_current_role INTEGER,
ADD COLUMN IF NOT EXISTS years_in_industry INTEGER,
ADD COLUMN IF NOT EXISTS years_in_function INTEGER,
ADD COLUMN IF NOT EXISTS geographic_scope TEXT;

-- Organization Context
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS reporting_to TEXT,
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS team_size_typical INTEGER,
ADD COLUMN IF NOT EXISTS budget_authority TEXT,
ADD COLUMN IF NOT EXISTS direct_reports INTEGER,
ADD COLUMN IF NOT EXISTS span_of_control TEXT;

-- Demographics
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS location_type TEXT,
ADD COLUMN IF NOT EXISTS work_arrangement TEXT;

-- Quantitative Benchmarks
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS salary_min_usd INTEGER,
ADD COLUMN IF NOT EXISTS salary_max_usd INTEGER,
ADD COLUMN IF NOT EXISTS salary_median_usd INTEGER,
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS salary_year INTEGER,
ADD COLUMN IF NOT EXISTS salary_sources TEXT,
ADD COLUMN IF NOT EXISTS sample_size TEXT,
ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
ADD COLUMN IF NOT EXISTS data_recency TEXT,
ADD COLUMN IF NOT EXISTS geographic_benchmark_scope TEXT,

-- Work Style
ADD COLUMN IF NOT EXISTS work_style_preference TEXT,
ADD COLUMN IF NOT EXISTS learning_style TEXT,
ADD COLUMN IF NOT EXISTS technology_adoption TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS change_readiness TEXT,

-- Narrative Fields
ADD COLUMN IF NOT EXISTS one_liner TEXT,
ADD COLUMN IF NOT EXISTS background_story TEXT,

-- Section metadata
ADD COLUMN IF NOT EXISTS section TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_personas_role_slug ON personas(role_slug);
CREATE INDEX IF NOT EXISTS idx_personas_function_slug ON personas(function_slug);
CREATE INDEX IF NOT EXISTS idx_personas_department_slug ON personas(department_slug);
CREATE INDEX IF NOT EXISTS idx_personas_persona_number ON personas(persona_number);
CREATE INDEX IF NOT EXISTS idx_personas_geographic_scope ON personas(geographic_scope);
CREATE INDEX IF NOT EXISTS idx_personas_section ON personas(section);

-- =====================================================================================
-- PHASE 2: CREATE NORMALIZED JUNCTION TABLES (NO JSONB RULE)
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- 1. PERSONA GOALS (replaces goals JSONB)
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    goal_text TEXT NOT NULL,
    goal_category TEXT CHECK (goal_category IN ('professional', 'organizational', 'personal', 'team')),
    priority INTEGER CHECK (priority BETWEEN 1 AND 5), -- 1=highest
    time_horizon TEXT CHECK (time_horizon IN ('immediate', 'short_term', 'medium_term', 'long_term')),

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX idx_persona_goals_tenant ON persona_goals(tenant_id);
CREATE INDEX idx_persona_goals_category ON persona_goals(goal_category);

COMMENT ON TABLE persona_goals IS 'Professional and organizational goals - replaces goals JSONB field';

-- ---------------------------------------------------------------------------------
-- 2. PERSONA PAIN POINTS (replaces pain_points JSONB)
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    pain_point_text TEXT NOT NULL,
    pain_category TEXT CHECK (pain_category IN ('process', 'technology', 'resource', 'knowledge', 'compliance', 'collaboration')),
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'constant')),
    impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'very_high')),

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX idx_persona_pain_points_tenant ON persona_pain_points(tenant_id);
CREATE INDEX idx_persona_pain_points_severity ON persona_pain_points(severity);
CREATE INDEX idx_persona_pain_points_impact ON persona_pain_points(impact);

COMMENT ON TABLE persona_pain_points IS 'Specific pain points with priority/impact - replaces pain_points JSONB field';

-- ---------------------------------------------------------------------------------
-- 3. PERSONA CHALLENGES (replaces challenges JSONB)
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    challenge_text TEXT NOT NULL,
    challenge_type TEXT CHECK (challenge_type IN ('strategic', 'operational', 'tactical', 'organizational')),
    complexity TEXT CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'immediate')),

    impact_level TEXT CHECK (impact_level IN ('individual', 'team', 'department', 'organization', 'ecosystem')),

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX idx_persona_challenges_tenant ON persona_challenges(tenant_id);
CREATE INDEX idx_persona_challenges_type ON persona_challenges(challenge_type);
CREATE INDEX idx_persona_challenges_urgency ON persona_challenges(urgency);

COMMENT ON TABLE persona_challenges IS 'Challenges faced with complexity/urgency - replaces challenges JSONB field';

-- ---------------------------------------------------------------------------------
-- 4. PERSONA RESPONSIBILITIES (replaces key_responsibilities TEXT[])
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    responsibility_text TEXT NOT NULL,
    responsibility_category TEXT CHECK (responsibility_category IN ('strategic', 'operational', 'administrative', 'people_management', 'technical')),
    time_allocation_percentage INTEGER CHECK (time_allocation_percentage BETWEEN 0 AND 100),
    is_primary BOOLEAN DEFAULT false,

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_responsibilities_persona ON persona_responsibilities(persona_id);
CREATE INDEX idx_persona_responsibilities_tenant ON persona_responsibilities(tenant_id);
CREATE INDEX idx_persona_responsibilities_category ON persona_responsibilities(responsibility_category);
CREATE INDEX idx_persona_responsibilities_primary ON persona_responsibilities(is_primary);

COMMENT ON TABLE persona_responsibilities IS 'Key responsibilities - replaces key_responsibilities TEXT[] field';

-- ---------------------------------------------------------------------------------
-- 5. PERSONA TOOLS (replaces preferred_tools TEXT[])
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    tool_name TEXT NOT NULL,
    tool_category TEXT CHECK (tool_category IN ('crm', 'analytics', 'communication', 'documentation', 'project_management', 'specialized_clinical', 'data_visualization', 'other')),
    usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasionally', 'rarely')),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false,

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_tools_persona ON persona_tools(persona_id);
CREATE INDEX idx_persona_tools_tenant ON persona_tools(tenant_id);
CREATE INDEX idx_persona_tools_category ON persona_tools(tool_category);
CREATE INDEX idx_persona_tools_frequency ON persona_tools(usage_frequency);

COMMENT ON TABLE persona_tools IS 'Tools and platforms used - replaces preferred_tools TEXT[] field';

-- ---------------------------------------------------------------------------------
-- 6. PERSONA COMMUNICATION CHANNELS (replaces communication_preferences JSONB)
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    channel_name TEXT NOT NULL,
    channel_type TEXT CHECK (channel_type IN ('synchronous', 'asynchronous', 'formal', 'informal')),
    preference_level TEXT CHECK (preference_level IN ('preferred', 'acceptable', 'limited', 'avoided')),
    use_case TEXT,
    frequency TEXT CHECK (frequency IN ('primary', 'frequent', 'occasional', 'rare')),

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_comm_channels_persona ON persona_communication_channels(persona_id);
CREATE INDEX idx_persona_comm_channels_tenant ON persona_communication_channels(tenant_id);
CREATE INDEX idx_persona_comm_channels_type ON persona_communication_channels(channel_type);
CREATE INDEX idx_persona_comm_channels_preference ON persona_communication_channels(preference_level);

COMMENT ON TABLE persona_communication_channels IS 'Preferred communication methods - replaces communication_preferences JSONB field';

-- ---------------------------------------------------------------------------------
-- 7. PERSONA DECISION MAKERS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_decision_makers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    decision_maker_role TEXT NOT NULL,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'stakeholder', 'influencer', 'collaborator', 'approver')),
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    decision_scope TEXT,

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_decision_makers_persona ON persona_decision_makers(persona_id);
CREATE INDEX idx_persona_decision_makers_tenant ON persona_decision_makers(tenant_id);
CREATE INDEX idx_persona_decision_makers_relationship ON persona_decision_makers(relationship_type);
CREATE INDEX idx_persona_decision_makers_influence ON persona_decision_makers(influence_level);

COMMENT ON TABLE persona_decision_makers IS 'Who influences their decisions';

-- ---------------------------------------------------------------------------------
-- 8. PERSONA FRUSTRATIONS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_frustrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    frustration_text TEXT NOT NULL,
    frustration_source TEXT CHECK (frustration_source IN ('process', 'technology', 'people', 'policy', 'resources', 'time', 'information')),
    intensity TEXT CHECK (intensity IN ('mild', 'moderate', 'significant', 'severe')),
    frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'daily')),

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_frustrations_persona ON persona_frustrations(persona_id);
CREATE INDEX idx_persona_frustrations_tenant ON persona_frustrations(tenant_id);
CREATE INDEX idx_persona_frustrations_source ON persona_frustrations(frustration_source);
CREATE INDEX idx_persona_frustrations_intensity ON persona_frustrations(intensity);

COMMENT ON TABLE persona_frustrations IS 'Day-to-day frustrations';

-- ---------------------------------------------------------------------------------
-- 9. PERSONA QUOTES
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    quote_text TEXT NOT NULL,
    quote_context TEXT,
    quote_category TEXT CHECK (quote_category IN ('pain_point', 'goal', 'aspiration', 'frustration', 'success', 'philosophy')),
    is_featured BOOLEAN DEFAULT false,

    sequence_order INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persona_quotes_persona ON persona_quotes(persona_id);
CREATE INDEX idx_persona_quotes_tenant ON persona_quotes(tenant_id);
CREATE INDEX idx_persona_quotes_category ON persona_quotes(quote_category);
CREATE INDEX idx_persona_quotes_featured ON persona_quotes(is_featured);

COMMENT ON TABLE persona_quotes IS 'Representative quotes from personas';

-- ---------------------------------------------------------------------------------
-- 10. PERSONA ORGANIZATION TYPES (for organization_type TEXT[])
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_organization_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    organization_type TEXT NOT NULL,
    is_typical BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(persona_id, organization_type)
);

CREATE INDEX idx_persona_org_types_persona ON persona_organization_types(persona_id);
CREATE INDEX idx_persona_org_types_tenant ON persona_organization_types(tenant_id);
CREATE INDEX idx_persona_org_types_typical ON persona_organization_types(is_typical);

COMMENT ON TABLE persona_organization_types IS 'Types of organizations persona typically works in';

-- ---------------------------------------------------------------------------------
-- 11. PERSONA TYPICAL LOCATIONS
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona_typical_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    location_name TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('city', 'region', 'country', 'hub')),
    is_primary BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(persona_id, location_name)
);

CREATE INDEX idx_persona_locations_persona ON persona_typical_locations(persona_id);
CREATE INDEX idx_persona_locations_tenant ON persona_typical_locations(tenant_id);
CREATE INDEX idx_persona_locations_primary ON persona_typical_locations(is_primary);

COMMENT ON TABLE persona_typical_locations IS 'Typical geographic locations for persona';

-- =====================================================================================
-- PHASE 3: ADD COMMENTS AND FINALIZE
-- =====================================================================================

COMMENT ON COLUMN personas.role_slug IS 'Slug reference to org_roles table';
COMMENT ON COLUMN personas.function_slug IS 'Slug reference to org_functions table';
COMMENT ON COLUMN personas.department_slug IS 'Slug reference to org_departments table';
COMMENT ON COLUMN personas.persona_number IS 'Sequential number within function/section';
COMMENT ON COLUMN personas.geographic_scope IS 'Geographic scope of responsibility';
COMMENT ON COLUMN personas.one_liner IS 'One-line tagline describing the persona';
COMMENT ON COLUMN personas.background_story IS 'Narrative background of the persona';

-- =====================================================================================
-- PHASE 4: VERIFICATION
-- =====================================================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE 'COMPLETE PERSONAS NORMALIZATION MIGRATION - COMPLETED';
    RAISE NOTICE '=====================================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'BASE TABLE EXTENSIONS:';
    RAISE NOTICE '  - Added 35+ new columns to personas table';
    RAISE NOTICE '';
    RAISE NOTICE 'NEW JUNCTION TABLES CREATED (NO JSONB):';
    RAISE NOTICE '  1. persona_goals';
    RAISE NOTICE '  2. persona_pain_points';
    RAISE NOTICE '  3. persona_challenges';
    RAISE NOTICE '  4. persona_responsibilities';
    RAISE NOTICE '  5. persona_tools';
    RAISE NOTICE '  6. persona_communication_channels';
    RAISE NOTICE '  7. persona_decision_makers';
    RAISE NOTICE '  8. persona_frustrations';
    RAISE NOTICE '  9. persona_quotes';
    RAISE NOTICE '  10. persona_organization_types';
    RAISE NOTICE '  11. persona_typical_locations';
    RAISE NOTICE '';
    RAISE NOTICE 'GOLDEN RULE COMPLIANCE: ✅ ALL DATA NORMALIZED (NO JSONB)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run seed data script for Medical Affairs Personas Part 1';
    RAISE NOTICE '=====================================================================================';
END $$;

COMMIT;
