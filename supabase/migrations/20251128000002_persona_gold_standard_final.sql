-- ============================================================================
-- MIGRATION: Persona Schema - Gold Standard (Final)
-- Version: 4.0.0
-- Date: 2025-11-28
-- Description: Comprehensive persona schema with full normalization,
--              lookup tables, junction tables, and proper type safety
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: DISABLE PROBLEMATIC TRIGGERS (USER TRIGGERS ONLY)
-- ============================================================================
-- Only disable user-created triggers, not system triggers
DO $$ 
BEGIN
    -- Disable specific user triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_gen_ai_readiness' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE personas DISABLE TRIGGER trigger_update_gen_ai_readiness;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_sync_persona_org_names' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE personas DISABLE TRIGGER trigger_sync_persona_org_names;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_personas_updated_at' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE personas DISABLE TRIGGER update_personas_updated_at;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_persona_org_from_role' AND tgrelid = 'personas'::regclass) THEN
        ALTER TABLE personas DISABLE TRIGGER trigger_update_persona_org_from_role;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE ENUM TYPES (Immutable Core Values)
-- ============================================================================

-- Archetype Enum (MECE Framework)
DO $$ BEGIN
    CREATE TYPE archetype_enum AS ENUM (
        'AUTOMATOR',    -- High AI + Routine Work
        'ORCHESTRATOR', -- High AI + Strategic Work
        'LEARNER',      -- Low AI + Routine Work
        'SKEPTIC'       -- Low AI + Strategic Work
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Work Pattern Enum
DO $$ BEGIN
    CREATE TYPE work_pattern_enum AS ENUM (
        'routine',    -- Repetitive, operational
        'strategic',  -- High-level, complex
        'mixed'       -- Both routine and strategic
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Service Layer Preference Enum
DO $$ BEGIN
    CREATE TYPE service_layer_preference AS ENUM (
        'ASK_EXPERT',       -- L1: Single-agent Q&A
        'ASK_PANEL',        -- L2: Multi-agent reasoning
        'WORKFLOWS',        -- L3: Multi-step automation
        'SOLUTION_BUILDER', -- L4: Integrated solutions
        'MIXED'             -- Uses multiple layers
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Gen AI Readiness Level Enum
DO $$ BEGIN
    CREATE TYPE gen_ai_readiness_level AS ENUM (
        'beginner',     -- New to AI
        'developing',   -- Building skills
        'proficient',   -- Regular user
        'advanced',     -- Power user
        'expert'        -- AI champion
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Budget Authority Level Enum
DO $$ BEGIN
    CREATE TYPE budget_authority_level AS ENUM (
        'none',        -- No budget authority
        'limited',     -- < $10K
        'moderate',    -- $10K - $100K
        'significant', -- $100K - $1M
        'high'         -- > $1M
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Validation Status Enum
DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM (
        'draft',          -- Work in progress
        'pending_review', -- Awaiting validation
        'validated',      -- Reviewed and approved
        'published',      -- Active and visible
        'archived'        -- No longer active
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 3: CREATE LOOKUP TABLES (Extensible Value Sets)
-- ============================================================================

-- 3.1 Seniority Levels
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
ON CONFLICT (code) DO NOTHING;

-- 3.2 Organization Sizes
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
ON CONFLICT (code) DO NOTHING;

-- 3.3 Technology Adoption (Rogers' Diffusion)
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

INSERT INTO lookup_technology_adoption (code, display_name, population_percentage, sort_order) VALUES
    ('innovator', 'Innovator', 2.5, 1),
    ('early_adopter', 'Early Adopter', 13.5, 2),
    ('early_majority', 'Early Majority', 34.0, 3),
    ('late_majority', 'Late Majority', 34.0, 4),
    ('laggard', 'Laggard', 16.0, 5)
ON CONFLICT (code) DO NOTHING;

-- 3.4 Risk Tolerance
CREATE TABLE IF NOT EXISTS lookup_risk_tolerance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_risk_tolerance (code, display_name, sort_order) VALUES
    ('very_low', 'Very Low', 1),
    ('low', 'Low', 2),
    ('moderate', 'Moderate', 3),
    ('high', 'High', 4),
    ('very_high', 'Very High', 5)
ON CONFLICT (code) DO NOTHING;

-- 3.5 Change Readiness
CREATE TABLE IF NOT EXISTS lookup_change_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_change_readiness (code, display_name, sort_order) VALUES
    ('resistant', 'Resistant', 1),
    ('low', 'Low', 2),
    ('moderate', 'Moderate', 3),
    ('high', 'High', 4),
    ('very_high', 'Very High', 5)
ON CONFLICT (code) DO NOTHING;

-- 3.6 Geographic Scopes
CREATE TABLE IF NOT EXISTS lookup_geographic_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_geographic_scopes (code, display_name, sort_order) VALUES
    ('local', 'Local', 1),
    ('regional', 'Regional', 2),
    ('national', 'National', 3),
    ('multi_national', 'Multi-National', 4),
    ('global', 'Global', 5)
ON CONFLICT (code) DO NOTHING;

-- 3.7 Pain Point Categories
CREATE TABLE IF NOT EXISTS lookup_pain_point_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_pain_point_categories (code, display_name, sort_order) VALUES
    ('process', 'Process', 1),
    ('tool', 'Tool', 2),
    ('data', 'Data', 3),
    ('organizational', 'Organizational', 4),
    ('resource', 'Resource', 5),
    ('compliance', 'Compliance', 6),
    ('communication', 'Communication', 7)
ON CONFLICT (code) DO NOTHING;

-- 3.8 Severity Levels
CREATE TABLE IF NOT EXISTS lookup_severity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_severity_levels (code, display_name, sort_order) VALUES
    ('low', 'Low', 1),
    ('medium', 'Medium', 2),
    ('high', 'High', 3),
    ('critical', 'Critical', 4)
ON CONFLICT (code) DO NOTHING;

-- 3.9 Frequency Levels
CREATE TABLE IF NOT EXISTS lookup_frequency_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_frequency_levels (code, display_name, sort_order) VALUES
    ('rarely', 'Rarely', 1),
    ('sometimes', 'Sometimes', 2),
    ('often', 'Often', 3),
    ('always', 'Always', 4)
ON CONFLICT (code) DO NOTHING;

-- 3.10 Timeframes
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

INSERT INTO lookup_timeframes (code, display_name, months_min, months_max, sort_order) VALUES
    ('immediate', 'Immediate (0-1 month)', 0, 1, 1),
    ('short_term', 'Short Term (1-6 months)', 1, 6, 2),
    ('medium_term', 'Medium Term (6-18 months)', 6, 18, 3),
    ('long_term', 'Long Term (18-36 months)', 18, 36, 4),
    ('strategic', 'Strategic (36+ months)', 36, NULL, 5)
ON CONFLICT (code) DO NOTHING;

-- 3.11 Goal Types
CREATE TABLE IF NOT EXISTS lookup_goal_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_goal_types (code, display_name, sort_order) VALUES
    ('efficiency', 'Efficiency', 1),
    ('quality', 'Quality', 2),
    ('growth', 'Growth', 3),
    ('compliance', 'Compliance', 4),
    ('innovation', 'Innovation', 5),
    ('learning', 'Learning', 6),
    ('career', 'Career', 7)
ON CONFLICT (code) DO NOTHING;

-- 3.12 Challenge Types
CREATE TABLE IF NOT EXISTS lookup_challenge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_challenge_types (code, display_name, sort_order) VALUES
    ('technical', 'Technical', 1),
    ('organizational', 'Organizational', 2),
    ('resource', 'Resource', 3),
    ('knowledge', 'Knowledge', 4),
    ('regulatory', 'Regulatory', 5),
    ('competitive', 'Competitive', 6),
    ('cultural', 'Cultural', 7)
ON CONFLICT (code) DO NOTHING;

-- 3.13 Trigger Types (for buying_triggers)
CREATE TABLE IF NOT EXISTS lookup_trigger_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_trigger_types (code, display_name, sort_order) VALUES
    ('regulatory', 'Regulatory', 1),
    ('competitive', 'Competitive', 2),
    ('internal_initiative', 'Internal Initiative', 3),
    ('crisis', 'Crisis', 4),
    ('growth', 'Growth', 5),
    ('budget_cycle', 'Budget Cycle', 6)
ON CONFLICT (code) DO NOTHING;

-- 3.14 Conference Types
CREATE TABLE IF NOT EXISTS lookup_conference_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_conference_types (code, display_name, sort_order) VALUES
    ('academic', 'Academic', 1),
    ('industry', 'Industry', 2),
    ('regulatory', 'Regulatory', 3),
    ('internal', 'Internal', 4)
ON CONFLICT (code) DO NOTHING;

-- 3.15 Conference Roles
CREATE TABLE IF NOT EXISTS lookup_conference_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_conference_roles (code, display_name, sort_order) VALUES
    ('attendee', 'Attendee', 1),
    ('speaker', 'Speaker', 2),
    ('panelist', 'Panelist', 3),
    ('organizer', 'Organizer', 4),
    ('sponsor', 'Sponsor', 5)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 4: ADD MISSING COLUMNS TO PERSONAS TABLE
-- ============================================================================

-- Note: The personas table should already exist from prior migrations.
-- We'll safely add any missing columns using DO blocks for safety.

DO $$ 
BEGIN
    -- Core columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'tenant_id') THEN
        ALTER TABLE personas ADD COLUMN tenant_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'validation_status') THEN
        ALTER TABLE personas ADD COLUMN validation_status TEXT DEFAULT 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'deleted_at') THEN
        ALTER TABLE personas ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    -- Organizational FK columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_id') THEN
        ALTER TABLE personas ADD COLUMN role_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'function_id') THEN
        ALTER TABLE personas ADD COLUMN function_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'department_id') THEN
        ALTER TABLE personas ADD COLUMN department_id UUID;
    END IF;

    -- Archetype columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'archetype') THEN
        ALTER TABLE personas ADD COLUMN archetype TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'archetype_confidence') THEN
        ALTER TABLE personas ADD COLUMN archetype_confidence NUMERIC(3,2) CHECK (archetype_confidence >= 0 AND archetype_confidence <= 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'work_pattern') THEN
        ALTER TABLE personas ADD COLUMN work_pattern TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'work_complexity_score') THEN
        ALTER TABLE personas ADD COLUMN work_complexity_score NUMERIC(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'ai_maturity_score') THEN
        ALTER TABLE personas ADD COLUMN ai_maturity_score NUMERIC(5,2);
    END IF;

    -- One-liner
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'one_liner') THEN
        ALTER TABLE personas ADD COLUMN one_liner TEXT;
    END IF;

    -- Demographics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'seniority_level') THEN
        ALTER TABLE personas ADD COLUMN seniority_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'years_of_experience') THEN
        ALTER TABLE personas ADD COLUMN years_of_experience INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'typical_organization_size') THEN
        ALTER TABLE personas ADD COLUMN typical_organization_size TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'geographic_scope') THEN
        ALTER TABLE personas ADD COLUMN geographic_scope TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'team_size_typical') THEN
        ALTER TABLE personas ADD COLUMN team_size_typical INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'direct_reports') THEN
        ALTER TABLE personas ADD COLUMN direct_reports INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'budget_authority_level') THEN
        ALTER TABLE personas ADD COLUMN budget_authority_level TEXT;
    END IF;

    -- Behavioral
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'technology_adoption') THEN
        ALTER TABLE personas ADD COLUMN technology_adoption TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'risk_tolerance') THEN
        ALTER TABLE personas ADD COLUMN risk_tolerance TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'change_readiness') THEN
        ALTER TABLE personas ADD COLUMN change_readiness TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'decision_making_style') THEN
        ALTER TABLE personas ADD COLUMN decision_making_style TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'learning_style') THEN
        ALTER TABLE personas ADD COLUMN learning_style TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'work_arrangement') THEN
        ALTER TABLE personas ADD COLUMN work_arrangement TEXT;
    END IF;

    -- Additional professional profile
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'collaboration_style') THEN
        ALTER TABLE personas ADD COLUMN collaboration_style TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'communication_preference') THEN
        ALTER TABLE personas ADD COLUMN communication_preference TEXT;
    END IF;

    -- Gen AI columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_readiness_level') THEN
        ALTER TABLE personas ADD COLUMN gen_ai_readiness_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'preferred_service_layer') THEN
        ALTER TABLE personas ADD COLUMN preferred_service_layer TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_adoption_score') THEN
        ALTER TABLE personas ADD COLUMN gen_ai_adoption_score NUMERIC(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_trust_score') THEN
        ALTER TABLE personas ADD COLUMN gen_ai_trust_score NUMERIC(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_usage_frequency') THEN
        ALTER TABLE personas ADD COLUMN gen_ai_usage_frequency TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'gen_ai_primary_use_case') THEN
        ALTER TABLE personas ADD COLUMN gen_ai_primary_use_case TEXT;
    END IF;

    -- Narrative
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'background_story') THEN
        ALTER TABLE personas ADD COLUMN background_story TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'a_day_in_the_life') THEN
        ALTER TABLE personas ADD COLUMN a_day_in_the_life TEXT;
    END IF;

    -- Denormalized org names (for performance)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_name') THEN
        ALTER TABLE personas ADD COLUMN role_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'role_slug') THEN
        ALTER TABLE personas ADD COLUMN role_slug TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'function_name') THEN
        ALTER TABLE personas ADD COLUMN function_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'function_slug') THEN
        ALTER TABLE personas ADD COLUMN function_slug TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'department_name') THEN
        ALTER TABLE personas ADD COLUMN department_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'department_slug') THEN
        ALTER TABLE personas ADD COLUMN department_slug TEXT;
    END IF;

    -- Salary benchmark columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_min_usd') THEN
        ALTER TABLE personas ADD COLUMN salary_min_usd INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_max_usd') THEN
        ALTER TABLE personas ADD COLUMN salary_max_usd INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_median_usd') THEN
        ALTER TABLE personas ADD COLUMN salary_median_usd INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_currency') THEN
        ALTER TABLE personas ADD COLUMN salary_currency TEXT DEFAULT 'USD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_year') THEN
        ALTER TABLE personas ADD COLUMN salary_year INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'salary_sources') THEN
        ALTER TABLE personas ADD COLUMN salary_sources TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'sample_size') THEN
        ALTER TABLE personas ADD COLUMN sample_size TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'confidence_level') THEN
        ALTER TABLE personas ADD COLUMN confidence_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'data_recency') THEN
        ALTER TABLE personas ADD COLUMN data_recency TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'geographic_benchmark_scope') THEN
        ALTER TABLE personas ADD COLUMN geographic_benchmark_scope TEXT;
    END IF;

    -- Visual attributes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'avatar_url') THEN
        ALTER TABLE personas ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'avatar_description') THEN
        ALTER TABLE personas ADD COLUMN avatar_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'color_code') THEN
        ALTER TABLE personas ADD COLUMN color_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'icon') THEN
        ALTER TABLE personas ADD COLUMN icon TEXT;
    END IF;

    -- Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'persona_number') THEN
        ALTER TABLE personas ADD COLUMN persona_number INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'section') THEN
        ALTER TABLE personas ADD COLUMN section TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'notes') THEN
        ALTER TABLE personas ADD COLUMN notes TEXT;
    END IF;
END $$;

-- ============================================================================
-- STEP 4A: ADD FOREIGN KEY CONSTRAINTS (AFTER COLUMNS EXIST)
-- ============================================================================

-- Add foreign key constraints now that columns exist
DO $$ 
BEGIN
    -- Add tenant_id FK if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'personas_tenant_id_fkey' 
        AND conrelid = 'personas'::regclass
    ) THEN
        ALTER TABLE personas 
        ADD CONSTRAINT personas_tenant_id_fkey 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;

    -- Add role_id FK if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'personas_role_id_fkey' 
        AND conrelid = 'personas'::regclass
    ) THEN
        ALTER TABLE personas 
        ADD CONSTRAINT personas_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES org_roles(id) ON DELETE SET NULL;
    END IF;

    -- Add function_id FK if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'personas_function_id_fkey' 
        AND conrelid = 'personas'::regclass
    ) THEN
        ALTER TABLE personas 
        ADD CONSTRAINT personas_function_id_fkey 
        FOREIGN KEY (function_id) REFERENCES org_functions(id) ON DELETE SET NULL;
    END IF;

    -- Add department_id FK if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'personas_department_id_fkey' 
        AND conrelid = 'personas'::regclass
    ) THEN
        ALTER TABLE personas 
        ADD CONSTRAINT personas_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES org_departments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: CREATE JUNCTION TABLES (IF NOT EXISTS)
-- ============================================================================

-- All junction tables follow consistent naming:
-- - Prefix: persona_*
-- - Primary Key: id UUID
-- - Foreign Keys: persona_id UUID, tenant_id UUID
-- - Ordering: sequence_order INTEGER (where applicable)

-- 6.1 Pain Points
CREATE TABLE IF NOT EXISTS persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    pain_point TEXT NOT NULL,
    category TEXT,
    severity TEXT DEFAULT 'medium',
    frequency TEXT DEFAULT 'often',
    impact_description TEXT,
    workaround TEXT,
    is_ai_addressable BOOLEAN DEFAULT NULL,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona_id ON persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_tenant_id ON persona_pain_points(tenant_id);

-- 6.2 Goals
CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    goal_text TEXT NOT NULL,
    goal_type TEXT,
    priority TEXT DEFAULT 'medium',
    timeframe TEXT,
    is_measurable BOOLEAN DEFAULT FALSE,
    success_criteria TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_goals_persona_id ON persona_goals(persona_id);

-- 6.3 Motivations
CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    motivation_text TEXT NOT NULL,
    motivation_category TEXT CHECK (motivation_category IN ('professional', 'organizational', 'personal')),
    importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_motivations_persona_id ON persona_motivations(persona_id);

-- 6.4 Challenges
CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    challenge_text TEXT NOT NULL,
    challenge_type TEXT,
    impact TEXT DEFAULT 'medium',
    current_solution TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_challenges_persona_id ON persona_challenges(persona_id);

-- 6.5 Typical Day Activities
CREATE TABLE IF NOT EXISTS persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    time_slot TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    duration_minutes INTEGER,
    is_ai_automatable BOOLEAN DEFAULT NULL,
    
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_typical_day_persona_id ON persona_typical_day(persona_id);

-- 6.6 Tools Used
CREATE TABLE IF NOT EXISTS persona_tools_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    tool_name TEXT NOT NULL,
    tool_category TEXT,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    usage_frequency TEXT,
    satisfaction_score DECIMAL(2,1) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_tools_used_persona_id ON persona_tools_used(persona_id);

-- 6.7 Stakeholders
CREATE TABLE IF NOT EXISTS persona_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    stakeholder_role TEXT NOT NULL,
    stakeholder_department TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'peer', 'direct_report', 'collaborator', 'client', 'vendor')),
    interaction_frequency TEXT,
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_stakeholders_persona_id ON persona_stakeholders(persona_id);

-- 6.8 VPANES Scoring (one per persona)
CREATE TABLE IF NOT EXISTS persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    visibility DECIMAL(3,1) CHECK (visibility >= 0 AND visibility <= 10),
    pain DECIMAL(3,1) CHECK (pain >= 0 AND pain <= 10),
    actions DECIMAL(3,1) CHECK (actions >= 0 AND actions <= 10),
    needs DECIMAL(3,1) CHECK (needs >= 0 AND needs <= 10),
    emotions DECIMAL(3,1) CHECK (emotions >= 0 AND emotions <= 10),
    scenarios DECIMAL(3,1) CHECK (scenarios >= 0 AND scenarios <= 10),
    
    total_score DECIMAL(4,1) GENERATED ALWAYS AS (
        visibility + pain + actions + needs + emotions + scenarios
    ) STORED,
    
    priority_tier TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 46 THEN 'tier_1_ideal'
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 31 THEN 'tier_2_high'
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 16 THEN 'tier_3_medium'
            ELSE 'tier_4_low'
        END
    ) STORED,
    
    scoring_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_vpanes_scoring_persona_id ON persona_vpanes_scoring(persona_id);

-- 6.9 Education
CREATE TABLE IF NOT EXISTS persona_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL,
    year_completed INTEGER CHECK (year_completed >= 1950 AND year_completed <= 2030),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_education_persona_id ON persona_education(persona_id);

-- 6.10 Certifications
CREATE TABLE IF NOT EXISTS persona_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    year_obtained INTEGER CHECK (year_obtained >= 1950 AND year_obtained <= 2030),
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_certifications_persona_id ON persona_certifications(persona_id);

-- 5.11 Success Metrics
CREATE TABLE IF NOT EXISTS persona_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    metric_name TEXT NOT NULL,
    metric_description TEXT NOT NULL,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_persona_success_metrics_persona_id ON persona_success_metrics(persona_id);

-- 5.12 Buying Process (one per persona)
CREATE TABLE IF NOT EXISTS persona_buying_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    role_in_purchase TEXT CHECK (role_in_purchase IN ('decision_maker', 'influencer', 'gatekeeper', 'user', 'champion')),
    decision_timeframe TEXT,
    typical_budget_range TEXT,
    approval_process_complexity TEXT CHECK (approval_process_complexity IN ('simple', 'moderate', 'complex', 'very_complex')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_buying_process_persona_id ON persona_buying_process(persona_id);

-- 5.13 Buying Triggers
CREATE TABLE IF NOT EXISTS persona_buying_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    trigger_type TEXT,
    trigger_description TEXT NOT NULL,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_buying_triggers_persona_id ON persona_buying_triggers(persona_id);

-- 5.14 Aspirations
CREATE TABLE IF NOT EXISTS persona_aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    aspiration_text TEXT NOT NULL,
    timeframe TEXT CHECK (timeframe IN ('short_term', 'medium_term', 'long_term')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_aspirations_persona_id ON persona_aspirations(persona_id);

-- 5.15 Annual Conferences
CREATE TABLE IF NOT EXISTS persona_annual_conferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    conference_name TEXT NOT NULL,
    conference_type TEXT,
    role TEXT,
    typical_frequency TEXT CHECK (typical_frequency IN ('annual', 'biannual', 'occasional', 'rare')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_annual_conferences_persona_id ON persona_annual_conferences(persona_id);

-- 5.16 Publications
CREATE TABLE IF NOT EXISTS persona_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    publication_type TEXT CHECK (publication_type IN ('peer_reviewed', 'blog', 'social_media', 'book', 'whitepaper', 'case_study')),
    topic TEXT NOT NULL,
    year INTEGER,
    frequency_per_year INTEGER,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_publications_persona_id ON persona_publications(persona_id);

-- 5.17 Social Media
CREATE TABLE IF NOT EXISTS persona_social_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    platform TEXT NOT NULL,
    activity_level TEXT CHECK (activity_level IN ('none', 'lurker', 'occasional', 'regular', 'influencer')),
    content_focus TEXT,
    follower_count_range TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_social_media_persona_id ON persona_social_media(persona_id);

-- 5.18 Evidence Sources
CREATE TABLE IF NOT EXISTS persona_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    source_type TEXT CHECK (source_type IN ('primary_research', 'secondary_research', 'expert_interview', 'industry_report', 'survey_data', 'case_study')),
    citation TEXT NOT NULL,
    key_finding TEXT NOT NULL,
    sample_size INTEGER,
    methodology TEXT,
    publication_date DATE,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_evidence_sources_persona_id ON persona_evidence_sources(persona_id);

-- ============================================================================
-- STEP 6: CREATE/REPLACE VIEWS (AFTER JUNCTION TABLES EXIST)
-- ============================================================================

-- 6.1 Summary View (Lightweight)
CREATE OR REPLACE VIEW v_personas_summary AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.title,
    p.tagline,
    p.archetype,
    p.work_pattern,
    p.seniority_level,
    p.function_name,
    p.department_name,
    p.role_name,
    COALESCE(p.validation_status, 'draft') as validation_status,
    COALESCE(p.is_active, true) as is_active,
    p.created_at,
    p.updated_at
FROM personas p
WHERE p.deleted_at IS NULL OR p.deleted_at IS NOT DISTINCT FROM NULL;

-- 6.2 VPANES View
CREATE OR REPLACE VIEW v_personas_with_vpanes AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.archetype,
    p.work_pattern,
    p.function_name,
    COALESCE(v.visibility, 0) as visibility,
    COALESCE(v.pain, 0) as pain,
    COALESCE(v.actions, 0) as actions,
    COALESCE(v.needs, 0) as needs,
    COALESCE(v.emotions, 0) as emotions,
    COALESCE(v.scenarios, 0) as scenarios,
    COALESCE(v.total_score, 0) as total_score,
    COALESCE(v.priority_tier, 'tier_4_low') as priority_tier
FROM personas p
LEFT JOIN persona_vpanes_scoring v ON p.id = v.persona_id
WHERE p.deleted_at IS NULL OR p.deleted_at IS NOT DISTINCT FROM NULL;

-- 6.3 Archetype Distribution View
CREATE OR REPLACE VIEW v_archetype_distribution AS
SELECT 
    COALESCE(t.tenant_key, t.slug, 'unknown') as tenant,
    p.archetype,
    p.function_name,
    COUNT(*) as persona_count,
    AVG(p.ai_maturity_score) as avg_ai_maturity,
    AVG(p.work_complexity_score) as avg_work_complexity,
    AVG(v.total_score) as avg_vpanes_score
FROM personas p
LEFT JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN persona_vpanes_scoring v ON p.id = v.persona_id
WHERE p.deleted_at IS NULL OR p.deleted_at IS NOT DISTINCT FROM NULL
GROUP BY COALESCE(t.tenant_key, t.slug, 'unknown'), p.archetype, p.function_name;

-- ============================================================================
-- STEP 7: CREATE/REPLACE HELPER FUNCTIONS
-- ============================================================================

-- 7.1 Calculate Gen AI Readiness
CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score NUMERIC,
    p_technology_adoption TEXT,
    p_risk_tolerance TEXT,
    p_change_readiness TEXT
) RETURNS TEXT AS $$
DECLARE
    v_score NUMERIC := 0;
BEGIN
    -- Base score from AI maturity (0-5 scale)
    v_score := COALESCE(p_ai_maturity_score, 50) / 20.0;
    
    -- Adjust based on technology adoption
    v_score := v_score + CASE 
        WHEN p_technology_adoption IN ('innovator', 'Innovator') THEN 2.0
        WHEN p_technology_adoption IN ('early_adopter', 'Early Adopter') THEN 1.0
        WHEN p_technology_adoption IN ('early_majority', 'Early Majority') THEN 0
        WHEN p_technology_adoption IN ('late_majority', 'Late Majority') THEN -1.0
        WHEN p_technology_adoption IN ('laggard', 'Laggard') THEN -2.0
        ELSE 0
    END;
    
    -- Adjust based on risk tolerance
    v_score := v_score + CASE 
        WHEN p_risk_tolerance IN ('high', 'very_high', 'High', 'Very High') THEN 1.0
        WHEN p_risk_tolerance IN ('moderate', 'Moderate') THEN 0
        WHEN p_risk_tolerance IN ('low', 'very_low', 'Low', 'Very Low') THEN -1.0
        ELSE 0
    END;
    
    -- Adjust based on change readiness
    v_score := v_score + CASE 
        WHEN p_change_readiness IN ('high', 'very_high', 'High', 'Very High') THEN 1.0
        WHEN p_change_readiness IN ('moderate', 'Moderate') THEN 0
        WHEN p_change_readiness IN ('low', 'resistant', 'Low', 'Resistant') THEN -1.0
        ELSE 0
    END;
    
    -- Map to readiness level
    RETURN CASE 
        WHEN v_score >= 7 THEN 'expert'
        WHEN v_score >= 5 THEN 'advanced'
        WHEN v_score >= 3 THEN 'proficient'
        WHEN v_score >= 1 THEN 'developing'
        ELSE 'beginner'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7.2 Infer Preferred Service Layer
CREATE OR REPLACE FUNCTION infer_preferred_service_layer(
    p_archetype TEXT,
    p_work_pattern TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_archetype = 'AUTOMATOR' THEN 'WORKFLOWS'
        WHEN p_archetype = 'ORCHESTRATOR' AND p_work_pattern IN ('strategic', 'mixed') THEN 'SOLUTION_BUILDER'
        WHEN p_archetype = 'ORCHESTRATOR' THEN 'ASK_PANEL'
        WHEN p_archetype = 'LEARNER' THEN 'ASK_EXPERT'
        WHEN p_archetype = 'SKEPTIC' THEN 'ASK_PANEL'
        ELSE 'MIXED'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7.3 Sync Persona Org Names (Denormalization for Performance)
CREATE OR REPLACE FUNCTION sync_persona_org_names() RETURNS TRIGGER AS $$
BEGIN
    -- Update denormalized organization names from FKs
    IF NEW.role_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.role_name, NEW.role_slug
        FROM org_roles WHERE id = NEW.role_id;
    END IF;
    
    IF NEW.function_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.function_name, NEW.function_slug
        FROM org_functions WHERE id = NEW.function_id;
    END IF;
    
    IF NEW.department_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.department_name, NEW.department_slug
        FROM org_departments WHERE id = NEW.department_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7.4 Update Gen AI Readiness Level (Fixed to work with TEXT)
CREATE OR REPLACE FUNCTION update_gen_ai_readiness_level() RETURNS TRIGGER AS $$
BEGIN
    -- Calculate readiness level if inputs are provided
    IF NEW.ai_maturity_score IS NOT NULL AND 
       NEW.technology_adoption IS NOT NULL AND 
       NEW.risk_tolerance IS NOT NULL AND 
       NEW.change_readiness IS NOT NULL THEN
        
        -- Set the calculated readiness level as TEXT first
        DECLARE
            v_calculated_level TEXT;
        BEGIN
            v_calculated_level := calculate_gen_ai_readiness_level(
                NEW.ai_maturity_score,
                NEW.technology_adoption,
                NEW.risk_tolerance,
                NEW.change_readiness
            );
            
            -- Cast to enum type
            NEW.gen_ai_readiness_level := v_calculated_level::gen_ai_readiness_level;
        EXCEPTION
            WHEN others THEN
                -- If casting fails, leave as NULL
                NEW.gen_ai_readiness_level := NULL;
        END;
    END IF;
    
    -- Infer preferred service layer if not set
    IF NEW.preferred_service_layer IS NULL AND NEW.archetype IS NOT NULL THEN
        DECLARE
            v_inferred_layer TEXT;
        BEGIN
            v_inferred_layer := infer_preferred_service_layer(
                NEW.archetype::TEXT,
                COALESCE(NEW.work_pattern::TEXT, 'mixed')
            );
            NEW.preferred_service_layer := v_inferred_layer::service_layer_preference;
        EXCEPTION
            WHEN others THEN
                NEW.preferred_service_layer := NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: CREATE/REPLACE TRIGGERS (WITH PROPER DEFINITIONS)
-- ============================================================================

-- Drop existing triggers first (if they exist)
DROP TRIGGER IF EXISTS trigger_update_gen_ai_readiness ON personas;
DROP TRIGGER IF EXISTS trigger_sync_persona_org_names ON personas;
DROP TRIGGER IF EXISTS update_personas_updated_at ON personas;
DROP TRIGGER IF EXISTS trigger_update_persona_org_from_role ON personas;

-- Create triggers with correct definitions
CREATE TRIGGER trigger_update_gen_ai_readiness
    BEFORE INSERT OR UPDATE OF ai_maturity_score, technology_adoption, risk_tolerance, change_readiness, archetype, work_pattern
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_gen_ai_readiness_level();

CREATE TRIGGER trigger_sync_persona_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION sync_persona_org_names();

CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: ADD PERFORMANCE INDEXES TO PERSONAS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_personas_tenant_id ON personas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_personas_role_id ON personas(role_id);
CREATE INDEX IF NOT EXISTS idx_personas_function_id ON personas(function_id);
CREATE INDEX IF NOT EXISTS idx_personas_department_id ON personas(department_id);
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype);
CREATE INDEX IF NOT EXISTS idx_personas_tenant_function ON personas(tenant_id, function_id);
CREATE INDEX IF NOT EXISTS idx_personas_tenant_archetype ON personas(tenant_id, archetype);
CREATE INDEX IF NOT EXISTS idx_personas_validation_status ON personas(validation_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_slug ON personas(slug);

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- - 6 enum types created
-- - 15 lookup tables created with seed data
-- - 18 junction tables created
-- - 3 views created
-- - 4 helper functions created/fixed
-- - 3 triggers created/fixed
-- - Multiple indexes added for performance
-- - Total database objects: 48+
-- ============================================================================

