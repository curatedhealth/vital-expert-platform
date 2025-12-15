-- =====================================================================
-- PERSONA GOLD STANDARD SCHEMA MIGRATION
-- =====================================================================
-- Version: 2.0.0 (Gold Standard)
-- Date: November 28, 2025
-- Purpose: Create a clean, normalized, scalable persona schema
-- 
-- PRINCIPLES:
-- 1. NO JSONB for structured data - everything normalized
-- 2. Proper inheritance from roles/functions/departments
-- 3. Lookup tables instead of check constraints for extensibility
-- 4. Junction tables with rich attributes
-- 5. Consistent naming conventions
-- 6. Comprehensive indexes for performance
-- =====================================================================

-- =====================================================================
-- PHASE 1: CREATE ENUM TYPES (Immutable core values)
-- These are true enums that won't change often
-- =====================================================================

-- 1.1 Archetype enum (MECE framework - fixed 4 values)
DO $$ BEGIN
    CREATE TYPE archetype_enum AS ENUM ('AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.2 Work pattern enum
DO $$ BEGIN
    CREATE TYPE work_pattern_enum AS ENUM ('routine', 'strategic', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.3 Budget authority enum
DO $$ BEGIN
    CREATE TYPE budget_authority_enum AS ENUM ('none', 'limited', 'moderate', 'significant', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.4 Gen AI readiness enum
DO $$ BEGIN
    CREATE TYPE gen_ai_readiness_enum AS ENUM ('beginner', 'developing', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.5 Service layer preference enum
DO $$ BEGIN
    CREATE TYPE service_layer_enum AS ENUM ('ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER', 'MIXED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1.6 Validation status enum
DO $$ BEGIN
    CREATE TYPE validation_status_enum AS ENUM ('draft', 'pending_review', 'validated', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================================
-- PHASE 2: CREATE LOOKUP TABLES (Extensible value sets)
-- These can be extended without schema changes
-- =====================================================================

-- 2.1 Seniority Levels
CREATE TABLE IF NOT EXISTS lookup_seniority_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_seniority_levels (code, display_name, years_experience_min, years_experience_max, sort_order) VALUES
    ('entry', 'Entry Level', 0, 2, 1),
    ('junior', 'Junior', 2, 4, 2),
    ('mid', 'Mid-Level', 4, 7, 3),
    ('senior', 'Senior', 7, 12, 4),
    ('lead', 'Lead', 10, 15, 5),
    ('manager', 'Manager', 8, 15, 6),
    ('director', 'Director', 12, 20, 7),
    ('vp', 'Vice President', 15, 25, 8),
    ('c_level', 'C-Level Executive', 20, 40, 9)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    years_experience_min = EXCLUDED.years_experience_min,
    years_experience_max = EXCLUDED.years_experience_max;

-- 2.2 Organization Sizes
CREATE TABLE IF NOT EXISTS lookup_organization_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    employee_min INTEGER,
    employee_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_organization_sizes (code, display_name, employee_min, employee_max, sort_order) VALUES
    ('startup', 'Startup (1-50)', 1, 50, 1),
    ('small', 'Small (51-200)', 51, 200, 2),
    ('medium', 'Medium (201-1000)', 201, 1000, 3),
    ('large', 'Large (1001-10000)', 1001, 10000, 4),
    ('enterprise', 'Enterprise (10000+)', 10001, NULL, 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    employee_min = EXCLUDED.employee_min,
    employee_max = EXCLUDED.employee_max;

-- 2.3 Technology Adoption Levels (Rogers' Diffusion of Innovation)
CREATE TABLE IF NOT EXISTS lookup_technology_adoption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    population_percentage DECIMAL(4,1),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_technology_adoption (code, display_name, description, population_percentage, sort_order) VALUES
    ('innovator', 'Innovator', 'First to adopt, risk-taking', 2.5, 1),
    ('early_adopter', 'Early Adopter', 'Opinion leaders, embrace change', 13.5, 2),
    ('early_majority', 'Early Majority', 'Deliberate, adopt before average', 34.0, 3),
    ('late_majority', 'Late Majority', 'Skeptical, adopt after average', 34.0, 4),
    ('laggard', 'Laggard', 'Traditional, last to adopt', 16.0, 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.4 Risk Tolerance Levels
CREATE TABLE IF NOT EXISTS lookup_risk_tolerance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_risk_tolerance (code, display_name, description, sort_order) VALUES
    ('very_low', 'Very Low', 'Extremely risk-averse, requires extensive proof', 1),
    ('low', 'Low', 'Risk-averse, prefers proven solutions', 2),
    ('moderate', 'Moderate', 'Balanced approach to risk', 3),
    ('high', 'High', 'Comfortable with calculated risks', 4),
    ('very_high', 'Very High', 'Risk-seeking, first-mover mentality', 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.5 Change Readiness Levels
CREATE TABLE IF NOT EXISTS lookup_change_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_change_readiness (code, display_name, description, sort_order) VALUES
    ('resistant', 'Resistant', 'Actively resists change', 1),
    ('low', 'Low', 'Reluctant to change, needs significant support', 2),
    ('moderate', 'Moderate', 'Accepts change with proper justification', 3),
    ('high', 'High', 'Embraces change, adapts quickly', 4),
    ('very_high', 'Very High', 'Champions change, drives transformation', 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.6 Geographic Scopes
CREATE TABLE IF NOT EXISTS lookup_geographic_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_geographic_scopes (code, display_name, description, sort_order) VALUES
    ('local', 'Local', 'Single city or region', 1),
    ('regional', 'Regional', 'Multiple regions within a country', 2),
    ('national', 'National', 'Entire country', 3),
    ('multi_national', 'Multi-National', 'Multiple countries', 4),
    ('global', 'Global', 'Worldwide scope', 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.7 Pain Point Categories
CREATE TABLE IF NOT EXISTS lookup_pain_point_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_pain_point_categories (code, display_name, description, sort_order) VALUES
    ('process', 'Process', 'Workflow and process inefficiencies', 1),
    ('tool', 'Tool', 'Technology and tool limitations', 2),
    ('data', 'Data', 'Data access, quality, or integration issues', 3),
    ('organizational', 'Organizational', 'Structure, culture, or politics', 4),
    ('resource', 'Resource', 'Time, budget, or staffing constraints', 5),
    ('compliance', 'Compliance', 'Regulatory or compliance burden', 6),
    ('communication', 'Communication', 'Information flow or collaboration', 7)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.8 Severity Levels
CREATE TABLE IF NOT EXISTS lookup_severity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_severity_levels (code, display_name, description, sort_order) VALUES
    ('low', 'Low', 'Minor inconvenience', 1),
    ('medium', 'Medium', 'Noticeable impact on productivity', 2),
    ('high', 'High', 'Significant impact on work', 3),
    ('critical', 'Critical', 'Blocks critical work or creates major risk', 4)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.9 Frequency Levels
CREATE TABLE IF NOT EXISTS lookup_frequency_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_frequency_levels (code, display_name, description, sort_order) VALUES
    ('rarely', 'Rarely', 'Less than monthly', 1),
    ('sometimes', 'Sometimes', 'Monthly', 2),
    ('often', 'Often', 'Weekly', 3),
    ('always', 'Always', 'Daily or constant', 4)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- 2.10 Timeframe Levels
CREATE TABLE IF NOT EXISTS lookup_timeframes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    months_min INTEGER,
    months_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_timeframes (code, display_name, description, months_min, months_max, sort_order) VALUES
    ('immediate', 'Immediate', 'Within 1 month', 0, 1, 1),
    ('short_term', 'Short Term', '1-6 months', 1, 6, 2),
    ('medium_term', 'Medium Term', '6-18 months', 6, 18, 3),
    ('long_term', 'Long Term', '18-36 months', 18, 36, 4),
    ('strategic', 'Strategic', '3+ years', 36, NULL, 5)
ON CONFLICT (code) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- =====================================================================
-- PHASE 3: ENSURE CORE PERSONA TABLE EXISTS WITH ALL COLUMNS
-- Add any missing columns to existing table
-- =====================================================================

-- 3.1 Add missing columns to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS one_liner TEXT;

-- Archetype columns
ALTER TABLE personas ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS archetype_confidence NUMERIC(3,2);
ALTER TABLE personas ADD COLUMN IF NOT EXISTS work_pattern TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS work_complexity_score NUMERIC(5,2);
ALTER TABLE personas ADD COLUMN IF NOT EXISTS ai_maturity_score NUMERIC(5,2);

-- Professional context
ALTER TABLE personas ADD COLUMN IF NOT EXISTS seniority_level TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS years_in_current_role INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS years_in_industry INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS years_in_function INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS education_level TEXT;

-- Organization context
ALTER TABLE personas ADD COLUMN IF NOT EXISTS typical_organization_size TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS geographic_scope TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS reporting_to TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS team_size_typical INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS direct_reports INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS budget_authority TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS budget_authority_level TEXT;

-- Behavioral attributes
ALTER TABLE personas ADD COLUMN IF NOT EXISTS work_style TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS work_arrangement TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS decision_making_style TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS learning_style TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS technology_adoption TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS change_readiness TEXT;

-- Gen AI profile
ALTER TABLE personas ADD COLUMN IF NOT EXISTS gen_ai_readiness_level TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS preferred_service_layer TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS gen_ai_adoption_score NUMERIC(5,2);
ALTER TABLE personas ADD COLUMN IF NOT EXISTS gen_ai_trust_score NUMERIC(5,2);
ALTER TABLE personas ADD COLUMN IF NOT EXISTS gen_ai_usage_frequency TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS gen_ai_primary_use_case TEXT;

-- Narrative
ALTER TABLE personas ADD COLUMN IF NOT EXISTS background_story TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS a_day_in_the_life TEXT;

-- Salary benchmarks
ALTER TABLE personas ADD COLUMN IF NOT EXISTS salary_min_usd INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS salary_max_usd INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS salary_median_usd INTEGER;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD';
ALTER TABLE personas ADD COLUMN IF NOT EXISTS salary_year INTEGER;

-- Metadata
ALTER TABLE personas ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'draft';
ALTER TABLE personas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Denormalized names (for backward compatibility and query performance)
ALTER TABLE personas ADD COLUMN IF NOT EXISTS role_name TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS role_slug TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS function_name TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS function_slug TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS department_name TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS department_slug TEXT;

-- 3.2 Create unique constraint on slug if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'personas_tenant_slug_unique'
    ) THEN
        ALTER TABLE personas ADD CONSTRAINT personas_tenant_slug_unique UNIQUE (tenant_id, slug);
    END IF;
EXCEPTION WHEN others THEN
    -- Constraint might already exist with different name
    NULL;
END $$;

-- =====================================================================
-- PHASE 4: CREATE/UPDATE JUNCTION TABLES WITH PROPER SCHEMA
-- =====================================================================

-- 4.1 Pain Points (with rich attributes)
CREATE TABLE IF NOT EXISTS persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    pain_point TEXT NOT NULL,
    category TEXT, -- FK to lookup_pain_point_categories.code
    severity TEXT DEFAULT 'medium', -- FK to lookup_severity_levels.code
    frequency TEXT DEFAULT 'often', -- FK to lookup_frequency_levels.code
    impact_description TEXT,
    workaround TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Goals
CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    goal_text TEXT NOT NULL,
    goal_type TEXT DEFAULT 'professional', -- professional, personal, organizational, career
    timeframe TEXT DEFAULT 'medium_term', -- FK to lookup_timeframes.code
    priority INTEGER DEFAULT 1,
    success_criteria TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Motivations
CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    motivation_text TEXT NOT NULL,
    motivation_category TEXT DEFAULT 'professional', -- professional, organizational, personal
    importance TEXT DEFAULT 'high', -- low, medium, high, critical
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 Typical Day Activities
CREATE TABLE IF NOT EXISTS persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    time_block TEXT NOT NULL, -- e.g., "6:00 AM", "9:00 AM"
    activity TEXT NOT NULL,
    duration_minutes INTEGER,
    activity_category TEXT, -- strategic, operational, administrative, meetings, personal
    ai_assisted BOOLEAN DEFAULT FALSE,
    ai_opportunity TEXT, -- Description of how AI could help
    
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 Challenges
CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    challenge_text TEXT NOT NULL,
    challenge_type TEXT, -- technical, organizational, resource, strategic, operational
    severity TEXT DEFAULT 'medium',
    root_cause TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.6 Tools Used
CREATE TABLE IF NOT EXISTS persona_tools_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    tool_name TEXT NOT NULL,
    tool_category TEXT, -- crm, analytics, communication, productivity, specialized
    usage_frequency TEXT DEFAULT 'often', -- rarely, sometimes, often, always
    proficiency_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
    pain_points TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.7 Information Sources
CREATE TABLE IF NOT EXISTS persona_information_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    source_name TEXT NOT NULL,
    source_type TEXT, -- publication, website, conference, peer, social_media, newsletter
    frequency TEXT DEFAULT 'often',
    trust_level TEXT DEFAULT 'high', -- low, medium, high, very_high
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.8 Education
CREATE TABLE IF NOT EXISTS persona_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL,
    year_completed INTEGER,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.9 Certifications
CREATE TABLE IF NOT EXISTS persona_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    year_obtained INTEGER,
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.10 Success Metrics
CREATE TABLE IF NOT EXISTS persona_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    metric_name TEXT NOT NULL,
    metric_description TEXT NOT NULL,
    metric_type TEXT, -- efficiency, quality, growth, compliance, financial
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.11 VPANES Scoring
CREATE TABLE IF NOT EXISTS persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    visibility_score INTEGER CHECK (visibility_score BETWEEN 0 AND 10),
    pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    actions_score INTEGER CHECK (actions_score BETWEEN 0 AND 10),
    needs_score INTEGER CHECK (needs_score BETWEEN 0 AND 10),
    emotions_score INTEGER CHECK (emotions_score BETWEEN 0 AND 10),
    scenarios_score INTEGER CHECK (scenarios_score BETWEEN 0 AND 10),
    
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(visibility_score, 0) + 
        COALESCE(pain_score, 0) + 
        COALESCE(actions_score, 0) + 
        COALESCE(needs_score, 0) + 
        COALESCE(emotions_score, 0) + 
        COALESCE(scenarios_score, 0)
    ) STORED,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id)
);

-- 4.12 Aspirations
CREATE TABLE IF NOT EXISTS persona_aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    aspiration_text TEXT NOT NULL,
    timeframe TEXT DEFAULT 'medium_term', -- short_term, medium_term, long_term
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.13 Personality Traits
CREATE TABLE IF NOT EXISTS persona_personality_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    trait_name TEXT NOT NULL,
    trait_description TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.14 Values
CREATE TABLE IF NOT EXISTS persona_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    value_name TEXT NOT NULL,
    value_description TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.15 Buying Process
CREATE TABLE IF NOT EXISTS persona_buying_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    role_in_purchase TEXT, -- Decision Maker, Influencer, Gatekeeper, User
    decision_timeframe TEXT,
    typical_budget_range TEXT,
    approval_process_complexity TEXT, -- simple, moderate, complex, very_complex
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id)
);

-- 4.16 Buying Triggers
CREATE TABLE IF NOT EXISTS persona_buying_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    trigger_type TEXT, -- regulatory, competitive, internal_initiative, crisis, growth
    trigger_description TEXT NOT NULL,
    urgency_level TEXT DEFAULT 'medium', -- immediate, high, medium, low
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.17 Objections
CREATE TABLE IF NOT EXISTS persona_objections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    objection_text TEXT NOT NULL,
    objection_type TEXT, -- cost, time, risk, complexity, trust, change
    response_strategy TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.18 Adoption Barriers
CREATE TABLE IF NOT EXISTS persona_adoption_barriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    barrier_text TEXT NOT NULL,
    barrier_type TEXT, -- technical, organizational, skill, trust, budget, time
    severity TEXT DEFAULT 'medium',
    mitigation_strategy TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.19 Communication Preferences
CREATE TABLE IF NOT EXISTS persona_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    channel TEXT NOT NULL, -- email, phone, video, in_person, chat, social
    preference_level TEXT DEFAULT 'preferred', -- preferred, acceptable, avoid
    best_time TEXT,
    notes TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.20 Content Preferences
CREATE TABLE IF NOT EXISTS persona_content_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    content_type TEXT NOT NULL, -- whitepaper, case_study, video, webinar, podcast, infographic
    preference_level TEXT DEFAULT 'preferred', -- preferred, acceptable, avoid
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.21 Jobs to Be Done (JTBD)
CREATE TABLE IF NOT EXISTS persona_jtbd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    jtbd_id UUID REFERENCES jobs_to_be_done(id) ON DELETE SET NULL,
    
    job_statement TEXT NOT NULL,
    job_type TEXT DEFAULT 'functional', -- functional, emotional, social
    importance TEXT DEFAULT 'high',
    current_satisfaction TEXT DEFAULT 'medium',
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 5: CREATE ROLE-LEVEL TABLES (Shared by all 4 personas)
-- =====================================================================

-- 5.1 Role Responsibilities (inherited by personas)
CREATE TABLE IF NOT EXISTS role_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    responsibility TEXT NOT NULL,
    category TEXT, -- strategic, operational, administrative, technical
    importance TEXT DEFAULT 'high',
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Role Skills (inherited by personas)
CREATE TABLE IF NOT EXISTS role_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    skill_name TEXT NOT NULL,
    skill_category TEXT, -- technical, soft, domain, leadership
    proficiency_required TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Role KPIs (inherited by personas)
CREATE TABLE IF NOT EXISTS role_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    kpi_name TEXT NOT NULL,
    kpi_description TEXT,
    measurement_frequency TEXT, -- daily, weekly, monthly, quarterly, annually
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 6: CREATE COMPREHENSIVE VIEWS
-- Note: Views are created AFTER all tables to ensure dependencies exist
-- =====================================================================

-- 6.1 Full Persona View (with all inherited data)
-- Only include VPANES if the table exists
CREATE OR REPLACE VIEW v_personas_complete AS
SELECT 
    -- Persona identity
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.title,
    p.tagline,
    p.one_liner,
    
    -- Role info (inherited)
    p.role_id,
    COALESCE(r.name, p.role_name) as role_name,
    COALESCE(r.slug, p.role_slug) as role_slug,
    
    -- Function info (inherited)
    p.function_id,
    COALESCE(f.name::text, p.function_name) as function_name,
    COALESCE(f.slug, p.function_slug) as function_slug,
    
    -- Department info (inherited)
    p.department_id,
    COALESCE(d.name, p.department_name) as department_name,
    COALESCE(d.slug, p.department_slug) as department_slug,
    
    -- Archetype
    p.archetype,
    p.archetype_confidence,
    p.work_pattern,
    p.work_complexity_score,
    p.ai_maturity_score,
    
    -- Professional context
    p.seniority_level,
    p.years_of_experience,
    p.years_in_current_role,
    p.years_in_industry,
    p.years_in_function,
    p.education_level,
    
    -- Organization context
    p.typical_organization_size,
    p.organization_type,
    p.geographic_scope,
    p.reporting_to,
    p.team_size,
    p.team_size_typical,
    p.direct_reports,
    p.budget_authority,
    p.budget_authority_level,
    
    -- Behavioral attributes
    p.work_style,
    p.work_arrangement,
    p.decision_making_style,
    p.learning_style,
    p.technology_adoption,
    p.risk_tolerance,
    p.change_readiness,
    
    -- Gen AI profile
    p.gen_ai_readiness_level,
    p.preferred_service_layer,
    p.gen_ai_adoption_score,
    p.gen_ai_trust_score,
    p.gen_ai_usage_frequency,
    p.gen_ai_primary_use_case,
    
    -- Narrative
    p.background_story,
    p.a_day_in_the_life,
    
    -- Salary
    p.salary_min_usd,
    p.salary_max_usd,
    p.salary_median_usd,
    p.salary_currency,
    p.salary_year,
    
    -- Metadata
    p.is_active,
    p.validation_status,
    p.created_at,
    p.updated_at,
    p.deleted_at,
    
    -- Tenant info
    t.name as tenant_name,
    t.slug as tenant_slug

FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.is_active = true AND p.deleted_at IS NULL;

COMMENT ON VIEW v_personas_complete IS 'Complete persona view with inherited role/function/department data and VPANES scores';

-- 6.2 Persona Summary View (for listings)
CREATE OR REPLACE VIEW v_personas_summary AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.title,
    p.tagline,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.seniority_level,
    COALESCE(r.name, p.role_name) as role_name,
    COALESCE(f.name::text, p.function_name) as function_name,
    p.preferred_service_layer,
    p.is_active,
    p.created_at
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW v_personas_summary IS 'Lightweight persona summary for listings and search results';

-- 6.3 Archetype Distribution View
CREATE OR REPLACE VIEW v_archetype_distribution AS
SELECT 
    p.tenant_id,
    t.name as tenant_name,
    p.archetype,
    COUNT(*) as persona_count,
    AVG(p.ai_maturity_score) as avg_ai_maturity,
    AVG(p.work_complexity_score) as avg_work_complexity
FROM personas p
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.is_active = true AND p.deleted_at IS NULL
GROUP BY p.tenant_id, t.name, p.archetype
ORDER BY p.tenant_id, p.archetype;

COMMENT ON VIEW v_archetype_distribution IS 'Distribution of archetypes across tenants with average scores';

-- =====================================================================
-- PHASE 7: CREATE INDEXES FOR PERFORMANCE
-- =====================================================================

-- Persona table indexes
CREATE INDEX IF NOT EXISTS idx_personas_tenant_id ON personas(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_role_id ON personas(role_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_function_id ON personas(function_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_tenant_archetype ON personas(tenant_id, archetype) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_seniority ON personas(seniority_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_ai_maturity ON personas(ai_maturity_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_slug ON personas(slug) WHERE deleted_at IS NULL;

-- Junction table indexes
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_motivations_persona ON persona_motivations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_typical_day_persona ON persona_typical_day(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_persona ON persona_tools_used(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_education_persona ON persona_education(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_certifications_persona ON persona_certifications(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_vpanes_persona ON persona_vpanes_scoring(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_aspirations_persona ON persona_aspirations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_buying_process_persona ON persona_buying_process(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_buying_triggers_persona ON persona_buying_triggers(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbd_persona ON persona_jtbd(persona_id);

-- Role table indexes
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_skills_role ON role_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_role_kpis_role ON role_kpis(role_id);

-- Lookup table indexes
CREATE INDEX IF NOT EXISTS idx_lookup_seniority_code ON lookup_seniority_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_org_size_code ON lookup_organization_sizes(code);
CREATE INDEX IF NOT EXISTS idx_lookup_tech_adoption_code ON lookup_technology_adoption(code);
CREATE INDEX IF NOT EXISTS idx_lookup_risk_tolerance_code ON lookup_risk_tolerance(code);
CREATE INDEX IF NOT EXISTS idx_lookup_change_readiness_code ON lookup_change_readiness(code);
CREATE INDEX IF NOT EXISTS idx_lookup_geographic_code ON lookup_geographic_scopes(code);
CREATE INDEX IF NOT EXISTS idx_lookup_pain_category_code ON lookup_pain_point_categories(code);
CREATE INDEX IF NOT EXISTS idx_lookup_severity_code ON lookup_severity_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_frequency_code ON lookup_frequency_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_timeframe_code ON lookup_timeframes(code);

-- =====================================================================
-- PHASE 8: CREATE HELPER FUNCTIONS
-- =====================================================================

-- 8.1 Function to calculate Gen AI readiness level
CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score NUMERIC,
    p_technology_adoption TEXT,
    p_risk_tolerance TEXT,
    p_change_readiness TEXT
) RETURNS TEXT AS $$
DECLARE
    v_score NUMERIC := 0;
BEGIN
    -- Base score from AI maturity (0-100 scale, contributes 40%)
    IF p_ai_maturity_score IS NOT NULL THEN
        v_score := v_score + (p_ai_maturity_score * 0.4);
    END IF;
    
    -- Technology adoption score (contributes 25%)
    CASE LOWER(COALESCE(p_technology_adoption, ''))
        WHEN 'innovator' THEN v_score := v_score + 25;
        WHEN 'early_adopter', 'early adopter' THEN v_score := v_score + 20;
        WHEN 'early_majority', 'early majority' THEN v_score := v_score + 15;
        WHEN 'late_majority', 'late majority' THEN v_score := v_score + 10;
        WHEN 'laggard' THEN v_score := v_score + 5;
        ELSE v_score := v_score + 10;
    END CASE;
    
    -- Risk tolerance score (contributes 20%)
    CASE LOWER(COALESCE(p_risk_tolerance, ''))
        WHEN 'very_high', 'very high' THEN v_score := v_score + 20;
        WHEN 'high' THEN v_score := v_score + 16;
        WHEN 'moderate' THEN v_score := v_score + 12;
        WHEN 'low' THEN v_score := v_score + 8;
        WHEN 'very_low', 'very low' THEN v_score := v_score + 4;
        ELSE v_score := v_score + 10;
    END CASE;
    
    -- Change readiness score (contributes 15%)
    CASE LOWER(COALESCE(p_change_readiness, ''))
        WHEN 'very_high', 'very high' THEN v_score := v_score + 15;
        WHEN 'high' THEN v_score := v_score + 12;
        WHEN 'moderate' THEN v_score := v_score + 9;
        WHEN 'low' THEN v_score := v_score + 6;
        WHEN 'resistant' THEN v_score := v_score + 3;
        ELSE v_score := v_score + 8;
    END CASE;
    
    -- Determine readiness level
    IF v_score >= 80 THEN RETURN 'advanced';
    ELSIF v_score >= 60 THEN RETURN 'intermediate';
    ELSIF v_score >= 40 THEN RETURN 'developing';
    ELSE RETURN 'beginner';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8.2 Function to infer preferred service layer from archetype
CREATE OR REPLACE FUNCTION infer_preferred_service_layer(
    p_archetype TEXT,
    p_work_pattern TEXT
) RETURNS TEXT AS $$
BEGIN
    CASE UPPER(COALESCE(p_archetype, ''))
        WHEN 'AUTOMATOR' THEN RETURN 'WORKFLOWS';
        WHEN 'ORCHESTRATOR' THEN 
            IF p_work_pattern = 'strategic' THEN RETURN 'SOLUTION_BUILDER';
            ELSE RETURN 'ASK_PANEL';
            END IF;
        WHEN 'LEARNER' THEN RETURN 'ASK_EXPERT';
        WHEN 'SKEPTIC' THEN RETURN 'ASK_PANEL';
        ELSE RETURN 'MIXED';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8.3 Trigger function to auto-calculate readiness
CREATE OR REPLACE FUNCTION trigger_calculate_gen_ai_readiness()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ai_maturity_score IS NOT NULL THEN
        NEW.gen_ai_readiness_level := calculate_gen_ai_readiness_level(
            NEW.ai_maturity_score,
            NEW.technology_adoption,
            NEW.risk_tolerance,
            NEW.change_readiness
        );
    END IF;
    
    IF NEW.preferred_service_layer IS NULL AND NEW.archetype IS NOT NULL THEN
        NEW.preferred_service_layer := infer_preferred_service_layer(
            NEW.archetype,
            NEW.work_pattern
        );
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8.4 Create or replace trigger
DROP TRIGGER IF EXISTS trigger_update_gen_ai_readiness ON personas;
CREATE TRIGGER trigger_update_gen_ai_readiness
    BEFORE INSERT OR UPDATE OF ai_maturity_score, technology_adoption, risk_tolerance, change_readiness, archetype, work_pattern
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_gen_ai_readiness();

-- 8.5 Trigger function to sync org names
CREATE OR REPLACE FUNCTION trigger_sync_persona_org_names()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync role info
    IF NEW.role_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.role_name, NEW.role_slug
        FROM org_roles WHERE id = NEW.role_id;
    END IF;
    
    -- Sync function info
    IF NEW.function_id IS NOT NULL THEN
        SELECT name::text, slug INTO NEW.function_name, NEW.function_slug
        FROM org_functions WHERE id = NEW.function_id;
    END IF;
    
    -- Sync department info
    IF NEW.department_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.department_name, NEW.department_slug
        FROM org_departments WHERE id = NEW.department_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_persona_org_names ON personas;
CREATE TRIGGER trigger_sync_persona_org_names
    BEFORE INSERT OR UPDATE OF role_id, function_id, department_id
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_sync_persona_org_names();

-- =====================================================================
-- PHASE 9: COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE personas IS 'Core persona table - 4 personas per role (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)';
COMMENT ON TABLE persona_pain_points IS 'Pain points specific to each persona archetype (5-10 per persona)';
COMMENT ON TABLE persona_goals IS 'Goals specific to each persona archetype (3-7 per persona)';
COMMENT ON TABLE persona_motivations IS 'Motivations driving persona behavior (3-5 per persona)';
COMMENT ON TABLE persona_typical_day IS 'Hour-by-hour daily activities (6-12 per persona)';
COMMENT ON TABLE persona_challenges IS 'Workplace challenges faced (3-7 per persona)';
COMMENT ON TABLE persona_tools_used IS 'Technology tools used daily (5-10 per persona)';
COMMENT ON TABLE persona_information_sources IS 'Where persona gets information (3-7 per persona)';
COMMENT ON TABLE persona_education IS 'Educational background (1-3 per persona)';
COMMENT ON TABLE persona_certifications IS 'Professional certifications (0-5 per persona)';
COMMENT ON TABLE persona_success_metrics IS 'KPIs persona tracks (3-5 per persona)';
COMMENT ON TABLE persona_vpanes_scoring IS 'VPANES priority scoring (1 per persona)';
COMMENT ON TABLE persona_aspirations IS 'Career aspirations (2-4 per persona)';
COMMENT ON TABLE persona_personality_traits IS 'Key personality characteristics (3-5 per persona)';
COMMENT ON TABLE persona_values IS 'Core values guiding decisions (3-5 per persona)';
COMMENT ON TABLE persona_buying_process IS 'Purchase decision process (1 per persona)';
COMMENT ON TABLE persona_buying_triggers IS 'What triggers purchase decisions (3-5 per persona)';
COMMENT ON TABLE persona_objections IS 'Common objections to solutions (3-5 per persona)';
COMMENT ON TABLE persona_adoption_barriers IS 'Barriers to AI adoption (3-5 per persona)';
COMMENT ON TABLE persona_communication_preferences IS 'Preferred communication channels (2-4 per persona)';
COMMENT ON TABLE persona_content_preferences IS 'Preferred content types (3-5 per persona)';
COMMENT ON TABLE persona_jtbd IS 'Jobs to be done for this persona (3-7 per persona)';
COMMENT ON TABLE role_responsibilities IS 'Responsibilities shared by all 4 personas of a role';
COMMENT ON TABLE role_skills IS 'Skills required for a role (shared by all 4 personas)';
COMMENT ON TABLE role_kpis IS 'KPIs for a role (shared by all 4 personas)';

-- Lookup table comments
COMMENT ON TABLE lookup_seniority_levels IS 'Reference table for seniority levels';
COMMENT ON TABLE lookup_organization_sizes IS 'Reference table for organization sizes';
COMMENT ON TABLE lookup_technology_adoption IS 'Reference table for technology adoption levels (Rogers curve)';
COMMENT ON TABLE lookup_risk_tolerance IS 'Reference table for risk tolerance levels';
COMMENT ON TABLE lookup_change_readiness IS 'Reference table for change readiness levels';
COMMENT ON TABLE lookup_geographic_scopes IS 'Reference table for geographic scope levels';
COMMENT ON TABLE lookup_pain_point_categories IS 'Reference table for pain point categories';
COMMENT ON TABLE lookup_severity_levels IS 'Reference table for severity levels';
COMMENT ON TABLE lookup_frequency_levels IS 'Reference table for frequency levels';
COMMENT ON TABLE lookup_timeframes IS 'Reference table for timeframe periods';

-- =====================================================================
-- PHASE 10: CREATE VPANES-ENABLED VIEWS (After all tables exist)
-- =====================================================================

-- 10.1 Full Persona View with VPANES (joins directly to personas table)
CREATE OR REPLACE VIEW v_personas_with_vpanes AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.seniority_level,
    p.role_name,
    p.function_name,
    p.preferred_service_layer,
    v.visibility_score,
    v.pain_score,
    v.actions_score,
    v.needs_score,
    v.emotions_score,
    v.scenarios_score,
    v.total_score as vpanes_total_score,
    p.is_active,
    p.created_at
FROM personas p
LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW v_personas_with_vpanes IS 'Persona view including VPANES scoring data';

-- 10.2 Archetype Distribution with VPANES
CREATE OR REPLACE VIEW v_archetype_distribution_with_vpanes AS
SELECT 
    p.tenant_id,
    t.name as tenant_name,
    p.archetype,
    COUNT(*) as persona_count,
    AVG(p.ai_maturity_score) as avg_ai_maturity,
    AVG(p.work_complexity_score) as avg_work_complexity,
    AVG(v.total_score) as avg_vpanes_score
FROM personas p
LEFT JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE p.is_active = true AND p.deleted_at IS NULL
GROUP BY p.tenant_id, t.name, p.archetype
ORDER BY p.tenant_id, p.archetype;

COMMENT ON VIEW v_archetype_distribution_with_vpanes IS 'Archetype distribution with average VPANES scores';

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Summary:
-- - 5 enum types created
-- - 10 lookup tables created with seed data
-- - 21 junction tables for personas
-- - 3 junction tables for roles
-- - 3 views for querying
-- - 40+ indexes for performance
-- - Helper functions for calculations
-- - Triggers for auto-calculation
-- =====================================================================

