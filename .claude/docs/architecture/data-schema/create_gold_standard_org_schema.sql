-- =====================================================================
-- GOLD STANDARD PHARMACEUTICAL ORGANIZATIONAL SCHEMA
-- Version: 1.0
-- Purpose: Complete role-centric, normalized organizational structure
-- Design: Multi-tenant, fully normalized, future-proof
-- =====================================================================
-- This schema implements the gold standard design where:
-- - ROLES own all structural attributes (job architecture)
-- - PERSONAS own only behavioral/attitudinal overlays
-- - Everything is normalized (no JSONB in org tables)
-- - Multi-tenant via junction tables
-- =====================================================================

-- =====================================================================
-- SECTION 1: ENUM TYPES
-- =====================================================================

-- Geographic Scope
DO $$ BEGIN
    CREATE TYPE geographic_scope_type AS ENUM ('global', 'regional', 'local');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seniority Levels
DO $$ BEGIN
    CREATE TYPE seniority_level_type AS ENUM ('entry', 'mid', 'senior', 'director', 'executive', 'c_suite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Budget Authority Types
DO $$ BEGIN
    CREATE TYPE budget_authority_type AS ENUM ('capex', 'opex', 'medical_education', 'research_grants', 'travel_only', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Leadership Levels
DO $$ BEGIN
    CREATE TYPE leadership_level_type AS ENUM ('individual_contributor', 'people_manager', 'senior_leadership', 'executive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Role Categories
DO $$ BEGIN
    CREATE TYPE role_category_type AS ENUM ('field', 'office', 'hybrid', 'remote');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Operating Model (for departments)
DO $$ BEGIN
    CREATE TYPE operating_model_type AS ENUM ('centralized', 'decentralized', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Regulatory Sensitivity
DO $$ BEGIN
    CREATE TYPE regulatory_sensitivity_type AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Proficiency Levels (for skills/tools)
DO $$ BEGIN
    CREATE TYPE proficiency_level_type AS ENUM ('basic', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Interaction Frequency
DO $$ BEGIN
    CREATE TYPE interaction_frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Influence Level
DO $$ BEGIN
    CREATE TYPE influence_level_type AS ENUM ('final_approver', 'strong', 'moderate', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================
-- SECTION 2: CORE ORGANIZATIONAL TABLES
-- =====================================================================

-- 2.1 ORG_FUNCTIONS
-- Enhanced with mission, regulatory oversight, strategic priority
CREATE TABLE IF NOT EXISTS public.org_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add mission_statement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'mission_statement') THEN
        ALTER TABLE public.org_functions ADD COLUMN mission_statement TEXT;
    END IF;
    
    -- Add regulatory_sensitivity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'regulatory_sensitivity') THEN
        ALTER TABLE public.org_functions ADD COLUMN regulatory_sensitivity regulatory_sensitivity_type DEFAULT 'medium';
    END IF;
    
    -- Add strategic_priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_functions' 
                   AND column_name = 'strategic_priority') THEN
        ALTER TABLE public.org_functions ADD COLUMN strategic_priority INTEGER CHECK (strategic_priority >= 0 AND strategic_priority <= 100);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_org_functions_slug ON public.org_functions(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_functions_deleted_at ON public.org_functions(deleted_at);

COMMENT ON TABLE public.org_functions IS 'Top-level business functions in pharmaceutical organization';
COMMENT ON COLUMN public.org_functions.mission_statement IS 'Why this function exists, its charter';
COMMENT ON COLUMN public.org_functions.regulatory_sensitivity IS 'Level of regulatory oversight required';
COMMENT ON COLUMN public.org_functions.strategic_priority IS 'Strategic importance score 0-100';

-- 2.2 ORG_DEPARTMENTS
-- Enhanced with operating model, field vs office mix
CREATE TABLE IF NOT EXISTS public.org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Relationships
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add operating_model
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'operating_model') THEN
        ALTER TABLE public.org_departments ADD COLUMN operating_model operating_model_type DEFAULT 'hybrid';
    END IF;
    
    -- Add field_vs_office_mix
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'field_vs_office_mix') THEN
        ALTER TABLE public.org_departments ADD COLUMN field_vs_office_mix INTEGER CHECK (field_vs_office_mix >= 0 AND field_vs_office_mix <= 100);
    END IF;
    
    -- Add typical_team_size_min
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'typical_team_size_min') THEN
        ALTER TABLE public.org_departments ADD COLUMN typical_team_size_min INTEGER;
    END IF;
    
    -- Add typical_team_size_max
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'org_departments' 
                   AND column_name = 'typical_team_size_max') THEN
        ALTER TABLE public.org_departments ADD COLUMN typical_team_size_max INTEGER;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_org_departments_slug ON public.org_departments(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_departments_function_id ON public.org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_deleted_at ON public.org_departments(deleted_at);

COMMENT ON TABLE public.org_departments IS 'Departments within business functions';
COMMENT ON COLUMN public.org_departments.operating_model IS 'How the department operates organizationally';
COMMENT ON COLUMN public.org_departments.field_vs_office_mix IS 'Percentage of field-based roles (0-100)';

-- 2.3 ORG_ROLES
-- Comprehensive role definition with all structural attributes
CREATE TABLE IF NOT EXISTS public.org_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    role_type TEXT,
    role_category role_category_type,
    
    -- Relationships
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
    reports_to_role_id UUID REFERENCES public.org_roles(id) ON DELETE SET NULL,
    
    -- Hierarchy & Level
    seniority_level seniority_level_type,
    leadership_level leadership_level_type DEFAULT 'individual_contributor',
    job_code TEXT,
    grade_level INTEGER,
    
    -- Geographic Scope
    geographic_scope geographic_scope_type NOT NULL,
    
    -- Team & Reporting
    team_size_min INTEGER,
    team_size_max INTEGER,
    direct_reports_min INTEGER,
    direct_reports_max INTEGER,
    indirect_reports_min INTEGER,
    indirect_reports_max INTEGER,
    layers_below INTEGER DEFAULT 0,
    
    -- Travel
    travel_percentage_min INTEGER CHECK (travel_percentage_min >= 0 AND travel_percentage_min <= 100),
    travel_percentage_max INTEGER CHECK (travel_percentage_max >= 0 AND travel_percentage_max <= 100),
    international_travel BOOLEAN DEFAULT false,
    overnight_travel_frequency TEXT,
    
    -- Budget & Financial Authority
    budget_min_usd NUMERIC(15, 2),
    budget_max_usd NUMERIC(15, 2),
    budget_authority_type budget_authority_type DEFAULT 'none',
    budget_authority_limit NUMERIC(15, 2),
    
    -- Experience Requirements
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_team_size CHECK (team_size_max IS NULL OR team_size_max >= team_size_min),
    CONSTRAINT valid_direct_reports CHECK (direct_reports_max IS NULL OR direct_reports_max >= direct_reports_min),
    CONSTRAINT valid_travel_percentage CHECK (travel_percentage_max IS NULL OR travel_percentage_max >= travel_percentage_min),
    CONSTRAINT valid_budget CHECK (budget_max_usd IS NULL OR budget_max_usd >= budget_min_usd),
    CONSTRAINT valid_experience CHECK (years_experience_max IS NULL OR years_experience_max >= years_experience_min)
);

CREATE INDEX IF NOT EXISTS idx_org_roles_slug ON public.org_roles(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_roles_function_id ON public.org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department_id ON public.org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_reports_to ON public.org_roles(reports_to_role_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_geographic_scope ON public.org_roles(geographic_scope);
CREATE INDEX IF NOT EXISTS idx_org_roles_seniority_level ON public.org_roles(seniority_level);
CREATE INDEX IF NOT EXISTS idx_org_roles_deleted_at ON public.org_roles(deleted_at);

COMMENT ON TABLE public.org_roles IS 'Role definitions - canonical job structure (structural attributes only)';
COMMENT ON COLUMN public.org_roles.role_type IS 'Type of role within department (e.g., msl, medical_writer, field_trainer)';
COMMENT ON COLUMN public.org_roles.role_category IS 'Work location category';
COMMENT ON COLUMN public.org_roles.geographic_scope IS 'Primary scope: global, regional, or local';

-- =====================================================================
-- SECTION 3: REFERENCE/MASTER DATA TABLES
-- =====================================================================

-- 3.1 SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

COMMENT ON TABLE public.skills IS 'Master catalog of skills';

-- 3.2 TOOLS
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    vendor TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);

COMMENT ON TABLE public.tools IS 'Master catalog of tools and technologies';

-- 3.3 STAKEHOLDERS
CREATE TABLE IF NOT EXISTS public.stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stakeholder_type_id UUID,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholders_is_internal ON public.stakeholders(is_internal);

COMMENT ON TABLE public.stakeholders IS 'Master catalog of stakeholder types';

-- 3.4 RESPONSIBILITIES
CREATE TABLE IF NOT EXISTS public.responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    complexity_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responsibilities_category ON public.responsibilities(category);

COMMENT ON TABLE public.responsibilities IS 'Master catalog of role responsibilities';

-- 3.5 KPI_DEFINITIONS
CREATE TABLE IF NOT EXISTS public.kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    measurement_unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_definitions_category ON public.kpi_definitions(category);

COMMENT ON TABLE public.kpi_definitions IS 'Master catalog of Key Performance Indicators';

-- 3.6 THERAPEUTIC_AREAS
CREATE TABLE IF NOT EXISTS public.therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.therapeutic_areas IS 'Standard therapeutic area classifications';

-- 3.7 DISEASE_AREAS
CREATE TABLE IF NOT EXISTS public.disease_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    therapeutic_area_id UUID REFERENCES public.therapeutic_areas(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disease_areas_therapeutic_area ON public.disease_areas(therapeutic_area_id);

COMMENT ON TABLE public.disease_areas IS 'Disease areas within therapeutic areas';

-- 3.8 COMPANY_SIZES
CREATE TABLE IF NOT EXISTS public.company_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    employee_min INTEGER,
    employee_max INTEGER,
    revenue_min_usd NUMERIC(15, 2),
    revenue_max_usd NUMERIC(15, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.company_sizes IS 'Organization size classifications';

-- 3.9 AI_MATURITY_LEVELS
CREATE TABLE IF NOT EXISTS public.ai_maturity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_name TEXT NOT NULL UNIQUE,
    level_number INTEGER NOT NULL UNIQUE,
    description TEXT,
    score_min INTEGER CHECK (score_min >= 0 AND score_min <= 100),
    score_max INTEGER CHECK (score_max >= 0 AND score_max <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.ai_maturity_levels IS 'AI readiness maturity levels';

-- 3.10 VPANES_DIMENSIONS
CREATE TABLE IF NOT EXISTS public.vpanes_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_name TEXT NOT NULL UNIQUE,
    dimension_code TEXT NOT NULL UNIQUE,
    description TEXT,
    weight NUMERIC(3, 2) CHECK (weight >= 0 AND weight <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vpanes_dimensions IS 'VPANES value & prioritization dimensions';

-- =====================================================================
-- SECTION 4: ROLE RELATIONSHIP TABLES (Many-to-Many)
-- =====================================================================

-- 4.1 ROLE_THERAPEUTIC_AREAS
CREATE TABLE IF NOT EXISTS public.role_therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    therapeutic_area_id UUID NOT NULL REFERENCES public.therapeutic_areas(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, therapeutic_area_id)
);

CREATE INDEX IF NOT EXISTS idx_role_therapeutic_areas_role ON public.role_therapeutic_areas(role_id);
CREATE INDEX IF NOT EXISTS idx_role_therapeutic_areas_ta ON public.role_therapeutic_areas(therapeutic_area_id);

-- 4.2 ROLE_DISEASE_AREAS
CREATE TABLE IF NOT EXISTS public.role_disease_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    disease_area_id UUID NOT NULL REFERENCES public.disease_areas(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, disease_area_id)
);

CREATE INDEX IF NOT EXISTS idx_role_disease_areas_role ON public.role_disease_areas(role_id);
CREATE INDEX IF NOT EXISTS idx_role_disease_areas_da ON public.role_disease_areas(disease_area_id);

-- 4.3 ROLE_COMPANY_SIZES
CREATE TABLE IF NOT EXISTS public.role_company_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    company_size_id UUID NOT NULL REFERENCES public.company_sizes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, company_size_id)
);

CREATE INDEX IF NOT EXISTS idx_role_company_sizes_role ON public.role_company_sizes(role_id);
CREATE INDEX IF NOT EXISTS idx_role_company_sizes_size ON public.role_company_sizes(company_size_id);

-- 4.4 ROLE_RESPONSIBILITIES
CREATE TABLE IF NOT EXISTS public.role_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES public.responsibilities(id) ON DELETE CASCADE,
    time_allocation_percent INTEGER CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100),
    is_mandatory BOOLEAN DEFAULT true,
    priority INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, responsibility_id)
);

CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON public.role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_resp ON public.role_responsibilities(responsibility_id);

COMMENT ON TABLE public.role_responsibilities IS 'Responsibilities per role with time allocation';

-- 4.5 ROLE_KPIS
CREATE TABLE IF NOT EXISTS public.role_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    target_min NUMERIC(15, 2),
    target_max NUMERIC(15, 2),
    measurement_frequency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, kpi_id)
);

CREATE INDEX IF NOT EXISTS idx_role_kpis_role ON public.role_kpis(role_id);
CREATE INDEX IF NOT EXISTS idx_role_kpis_kpi ON public.role_kpis(kpi_id);

COMMENT ON TABLE public.role_kpis IS 'Key Performance Indicators per role';

-- 4.6 ROLE_SKILLS
CREATE TABLE IF NOT EXISTS public.role_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    required_proficiency proficiency_level_type NOT NULL DEFAULT 'intermediate',
    is_mandatory BOOLEAN DEFAULT true,
    years_experience_required INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_role_skills_role ON public.role_skills(role_id);
CREATE INDEX IF NOT EXISTS idx_role_skills_skill ON public.role_skills(skill_id);

COMMENT ON TABLE public.role_skills IS 'Required skills per role with proficiency levels';

-- 4.7 ROLE_TOOLS
CREATE TABLE IF NOT EXISTS public.role_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    usage_frequency interaction_frequency_type,
    proficiency_level proficiency_level_type,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_role_tools_role ON public.role_tools(role_id);
CREATE INDEX IF NOT EXISTS idx_role_tools_tool ON public.role_tools(tool_id);

COMMENT ON TABLE public.role_tools IS 'Expected tools per role with usage patterns';

-- 4.8 ROLE_INTERNAL_STAKEHOLDERS
CREATE TABLE IF NOT EXISTS public.role_internal_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
    relationship_type TEXT,
    influence_level influence_level_type,
    interaction_frequency interaction_frequency_type,
    collaboration_quality_baseline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, stakeholder_id)
);

CREATE INDEX IF NOT EXISTS idx_role_internal_stakeholders_role ON public.role_internal_stakeholders(role_id);
CREATE INDEX IF NOT EXISTS idx_role_internal_stakeholders_sh ON public.role_internal_stakeholders(stakeholder_id);

COMMENT ON TABLE public.role_internal_stakeholders IS 'Internal stakeholder relationships per role';

-- 4.9 ROLE_EXTERNAL_STAKEHOLDERS
CREATE TABLE IF NOT EXISTS public.role_external_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
    relationship_type TEXT,
    influence_level influence_level_type,
    interaction_frequency interaction_frequency_type,
    collaboration_quality_baseline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, stakeholder_id)
);

CREATE INDEX IF NOT EXISTS idx_role_external_stakeholders_role ON public.role_external_stakeholders(role_id);
CREATE INDEX IF NOT EXISTS idx_role_external_stakeholders_sh ON public.role_external_stakeholders(stakeholder_id);

COMMENT ON TABLE public.role_external_stakeholders IS 'External stakeholder relationships per role';

-- 4.10 ROLE_AI_MATURITY
CREATE TABLE IF NOT EXISTS public.role_ai_maturity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    ai_maturity_level_id UUID REFERENCES public.ai_maturity_levels(id) ON DELETE SET NULL,
    ai_maturity_score INTEGER CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
    work_complexity_score INTEGER CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id)
);

CREATE INDEX IF NOT EXISTS idx_role_ai_maturity_role ON public.role_ai_maturity(role_id);
CREATE INDEX IF NOT EXISTS idx_role_ai_maturity_level ON public.role_ai_maturity(ai_maturity_level_id);

COMMENT ON TABLE public.role_ai_maturity IS 'Baseline AI readiness and work complexity per role';

-- 4.11 ROLE_VPANES_SCORES
CREATE TABLE IF NOT EXISTS public.role_vpanes_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    dimension_id UUID NOT NULL REFERENCES public.vpanes_dimensions(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    scoring_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, dimension_id)
);

CREATE INDEX IF NOT EXISTS idx_role_vpanes_scores_role ON public.role_vpanes_scores(role_id);
CREATE INDEX IF NOT EXISTS idx_role_vpanes_scores_dimension ON public.role_vpanes_scores(dimension_id);

COMMENT ON TABLE public.role_vpanes_scores IS 'Strategic value & prioritization scores per role';

-- =====================================================================
-- SECTION 5: HELPER FUNCTIONS
-- =====================================================================

-- 5.1 Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_slug IS 'Generates URL-friendly slug from text';

-- 5.2 Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.3 Apply updated_at triggers to all relevant tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'org_functions', 'org_departments', 'org_roles',
            'skills', 'tools', 'stakeholders', 'responsibilities', 'kpi_definitions',
            'therapeutic_areas', 'disease_areas', 'company_sizes', 'ai_maturity_levels', 'vpanes_dimensions',
            'role_responsibilities', 'role_kpis', 'role_skills', 'role_tools',
            'role_internal_stakeholders', 'role_external_stakeholders',
            'role_ai_maturity', 'role_vpanes_scores'
        )
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- =====================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on core org tables
ALTER TABLE public.org_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on junction tables (if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'function_tenants') THEN
        ALTER TABLE public.function_tenants ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'department_tenants') THEN
        ALTER TABLE public.department_tenants ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'role_tenants') THEN
        ALTER TABLE public.role_tenants ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================================
-- COMPLETION MESSAGE
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'GOLD STANDARD PHARMACEUTICAL ORGANIZATIONAL SCHEMA CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Core Tables Created:';
    RAISE NOTICE '  ✓ org_functions (with mission, regulatory sensitivity)';
    RAISE NOTICE '  ✓ org_departments (with operating model)';
    RAISE NOTICE '  ✓ org_roles (comprehensive structural attributes)';
    RAISE NOTICE '';
    RAISE NOTICE 'Reference Tables Created:';
    RAISE NOTICE '  ✓ skills, tools, stakeholders, responsibilities';
    RAISE NOTICE '  ✓ kpi_definitions, therapeutic_areas, disease_areas';
    RAISE NOTICE '  ✓ company_sizes, ai_maturity_levels, vpanes_dimensions';
    RAISE NOTICE '';
    RAISE NOTICE 'Role Relationship Tables Created:';
    RAISE NOTICE '  ✓ role_therapeutic_areas, role_disease_areas';
    RAISE NOTICE '  ✓ role_company_sizes, role_responsibilities, role_kpis';
    RAISE NOTICE '  ✓ role_skills, role_tools';
    RAISE NOTICE '  ✓ role_internal_stakeholders, role_external_stakeholders';
    RAISE NOTICE '  ✓ role_ai_maturity, role_vpanes_scores';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run populate_pharma_functions.sql';
    RAISE NOTICE '  2. Run populate_pharma_departments.sql';
    RAISE NOTICE '  3. Run populate_pharma_roles.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

