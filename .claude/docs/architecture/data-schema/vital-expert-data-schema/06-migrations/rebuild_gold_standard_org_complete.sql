-- =====================================================================
-- COMPLETE REBUILD: Gold Standard Pharmaceutical Org Structure
-- This script performs a complete clean slate rebuild
-- =====================================================================
-- PHASE 1: Complete deletion
-- PHASE 2: Create all enum types
-- PHASE 3: Create all tables with full schema
-- PHASE 4: Create all junction tables
-- PHASE 5: Create helper functions and triggers
-- =====================================================================

\echo '================================================================='
\echo 'PHASE 1: CLEAN SLATE - Deleting all existing org structure'
\echo '================================================================='

-- Drop all role junction tables first (they reference roles)
DROP TABLE IF EXISTS public.role_tenants CASCADE;
DROP TABLE IF EXISTS public.role_therapeutic_areas CASCADE;
DROP TABLE IF EXISTS public.role_disease_areas CASCADE;
DROP TABLE IF EXISTS public.role_company_sizes CASCADE;
DROP TABLE IF EXISTS public.role_responsibilities CASCADE;
DROP TABLE IF EXISTS public.role_kpis CASCADE;
DROP TABLE IF EXISTS public.role_skills CASCADE;
DROP TABLE IF EXISTS public.role_tools CASCADE;
DROP TABLE IF EXISTS public.role_internal_stakeholders CASCADE;
DROP TABLE IF EXISTS public.role_external_stakeholders CASCADE;
DROP TABLE IF EXISTS public.role_ai_maturity CASCADE;
DROP TABLE IF EXISTS public.role_vpanes_scores CASCADE;

-- Drop org tables (in reverse dependency order)
DROP TABLE IF EXISTS public.org_roles CASCADE;
DROP TABLE IF EXISTS public.department_tenants CASCADE;
DROP TABLE IF EXISTS public.org_departments CASCADE;
DROP TABLE IF EXISTS public.function_tenants CASCADE;
DROP TABLE IF EXISTS public.org_functions CASCADE;

-- Drop reference tables
DROP TABLE IF EXISTS public.disease_areas CASCADE;
DROP TABLE IF EXISTS public.therapeutic_areas CASCADE;
DROP TABLE IF EXISTS public.company_sizes CASCADE;
DROP TABLE IF EXISTS public.vpanes_dimensions CASCADE;
DROP TABLE IF EXISTS public.ai_maturity_levels CASCADE;
DROP TABLE IF EXISTS public.kpi_definitions CASCADE;
DROP TABLE IF EXISTS public.responsibilities CASCADE;
DROP TABLE IF EXISTS public.stakeholders CASCADE;
DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS influence_level_type CASCADE;
DROP TYPE IF EXISTS interaction_frequency_type CASCADE;
DROP TYPE IF EXISTS proficiency_level_type CASCADE;
DROP TYPE IF EXISTS regulatory_sensitivity_type CASCADE;
DROP TYPE IF EXISTS operating_model_type CASCADE;
DROP TYPE IF EXISTS role_category_type CASCADE;
DROP TYPE IF EXISTS leadership_level_type CASCADE;
DROP TYPE IF EXISTS budget_authority_type CASCADE;
DROP TYPE IF EXISTS seniority_level_type CASCADE;
DROP TYPE IF EXISTS geographic_scope_type CASCADE;

\echo '✓ Clean slate complete'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 2: Creating all enum types'
\echo '================================================================='

-- Geographic Scope
CREATE TYPE geographic_scope_type AS ENUM ('global', 'regional', 'local');

-- Seniority Levels
CREATE TYPE seniority_level_type AS ENUM ('entry', 'mid', 'senior', 'director', 'executive', 'c_suite');

-- Budget Authority Types
CREATE TYPE budget_authority_type AS ENUM ('capex', 'opex', 'medical_education', 'research_grants', 'travel_only', 'none');

-- Leadership Levels
CREATE TYPE leadership_level_type AS ENUM ('individual_contributor', 'people_manager', 'senior_leadership', 'executive');

-- Role Categories
CREATE TYPE role_category_type AS ENUM ('field', 'office', 'hybrid', 'remote');

-- Operating Model (for departments)
CREATE TYPE operating_model_type AS ENUM ('centralized', 'decentralized', 'hybrid');

-- Regulatory Sensitivity
CREATE TYPE regulatory_sensitivity_type AS ENUM ('low', 'medium', 'high', 'very_high');

-- Proficiency Levels (for skills/tools)
CREATE TYPE proficiency_level_type AS ENUM ('basic', 'intermediate', 'advanced', 'expert');

-- Interaction Frequency
CREATE TYPE interaction_frequency_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc');

-- Influence Level
CREATE TYPE influence_level_type AS ENUM ('final_approver', 'strong', 'moderate', 'low');

\echo '✓ All enum types created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 3: Creating core organizational tables'
\echo '================================================================='

-- ORG_FUNCTIONS
CREATE TABLE public.org_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    mission_statement TEXT,
    regulatory_sensitivity regulatory_sensitivity_type DEFAULT 'medium',
    strategic_priority INTEGER CHECK (strategic_priority >= 0 AND strategic_priority <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_org_functions_slug ON public.org_functions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_functions_deleted_at ON public.org_functions(deleted_at);

-- ORG_DEPARTMENTS
CREATE TABLE public.org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    operating_model operating_model_type DEFAULT 'hybrid',
    field_vs_office_mix INTEGER CHECK (field_vs_office_mix >= 0 AND field_vs_office_mix <= 100),
    typical_team_size_min INTEGER,
    typical_team_size_max INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_org_departments_slug ON public.org_departments(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_departments_function_id ON public.org_departments(function_id);
CREATE INDEX idx_org_departments_deleted_at ON public.org_departments(deleted_at);

-- ORG_ROLES
CREATE TABLE public.org_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    role_type TEXT,
    role_category role_category_type,
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
    reports_to_role_id UUID REFERENCES public.org_roles(id) ON DELETE SET NULL,
    seniority_level seniority_level_type,
    leadership_level leadership_level_type DEFAULT 'individual_contributor',
    job_code TEXT,
    grade_level INTEGER,
    geographic_scope geographic_scope_type NOT NULL,
    team_size_min INTEGER,
    team_size_max INTEGER,
    direct_reports_min INTEGER,
    direct_reports_max INTEGER,
    indirect_reports_min INTEGER,
    indirect_reports_max INTEGER,
    layers_below INTEGER DEFAULT 0,
    travel_percentage_min INTEGER CHECK (travel_percentage_min >= 0 AND travel_percentage_min <= 100),
    travel_percentage_max INTEGER CHECK (travel_percentage_max >= 0 AND travel_percentage_max <= 100),
    international_travel BOOLEAN DEFAULT false,
    overnight_travel_frequency TEXT,
    budget_min_usd NUMERIC(15, 2),
    budget_max_usd NUMERIC(15, 2),
    budget_authority_type budget_authority_type DEFAULT 'none',
    budget_authority_limit NUMERIC(15, 2),
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_team_size CHECK (team_size_max IS NULL OR team_size_max >= team_size_min),
    CONSTRAINT valid_direct_reports CHECK (direct_reports_max IS NULL OR direct_reports_max >= direct_reports_min),
    CONSTRAINT valid_travel_percentage CHECK (travel_percentage_max IS NULL OR travel_percentage_max >= travel_percentage_min),
    CONSTRAINT valid_budget CHECK (budget_max_usd IS NULL OR budget_max_usd >= budget_min_usd),
    CONSTRAINT valid_experience CHECK (years_experience_max IS NULL OR years_experience_max >= years_experience_min)
);

CREATE INDEX idx_org_roles_slug ON public.org_roles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_roles_function_id ON public.org_roles(function_id);
CREATE INDEX idx_org_roles_department_id ON public.org_roles(department_id);
CREATE INDEX idx_org_roles_reports_to ON public.org_roles(reports_to_role_id);
CREATE INDEX idx_org_roles_geographic_scope ON public.org_roles(geographic_scope);
CREATE INDEX idx_org_roles_seniority_level ON public.org_roles(seniority_level);
CREATE INDEX idx_org_roles_deleted_at ON public.org_roles(deleted_at);

\echo '✓ Core organizational tables created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 4: Creating reference/master data tables'
\echo '================================================================='

-- SKILLS
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON public.skills(category);

-- TOOLS
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    vendor TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tools_category ON public.tools(category);

-- STAKEHOLDERS
CREATE TABLE public.stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stakeholder_type_id UUID,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stakeholders_is_internal ON public.stakeholders(is_internal);

-- RESPONSIBILITIES
CREATE TABLE public.responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    complexity_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responsibilities_category ON public.responsibilities(category);

-- KPI_DEFINITIONS
CREATE TABLE public.kpi_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    measurement_unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpi_definitions_category ON public.kpi_definitions(category);

-- THERAPEUTIC_AREAS
CREATE TABLE public.therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DISEASE_AREAS
CREATE TABLE public.disease_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    therapeutic_area_id UUID REFERENCES public.therapeutic_areas(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disease_areas_therapeutic_area ON public.disease_areas(therapeutic_area_id);

-- COMPANY_SIZES
CREATE TABLE public.company_sizes (
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

-- AI_MATURITY_LEVELS
CREATE TABLE public.ai_maturity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_name TEXT NOT NULL UNIQUE,
    level_number INTEGER NOT NULL UNIQUE,
    description TEXT,
    score_min INTEGER CHECK (score_min >= 0 AND score_min <= 100),
    score_max INTEGER CHECK (score_max >= 0 AND score_max <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VPANES_DIMENSIONS
CREATE TABLE public.vpanes_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_name TEXT NOT NULL UNIQUE,
    dimension_code TEXT NOT NULL UNIQUE,
    description TEXT,
    weight NUMERIC(3, 2) CHECK (weight >= 0 AND weight <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

\echo '✓ Reference tables created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 5: Creating multi-tenant junction tables'
\echo '================================================================='

-- Function-Tenant Junction
CREATE TABLE public.function_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_id UUID NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(function_id, tenant_id)
);

CREATE INDEX idx_function_tenants_function ON public.function_tenants(function_id);
CREATE INDEX idx_function_tenants_tenant ON public.function_tenants(tenant_id);

-- Department-Tenant Junction
CREATE TABLE public.department_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(department_id, tenant_id)
);

CREATE INDEX idx_department_tenants_department ON public.department_tenants(department_id);
CREATE INDEX idx_department_tenants_tenant ON public.department_tenants(tenant_id);

-- Role-Tenant Junction
CREATE TABLE public.role_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, tenant_id)
);

CREATE INDEX idx_role_tenants_role ON public.role_tenants(role_id);
CREATE INDEX idx_role_tenants_tenant ON public.role_tenants(tenant_id);

\echo '✓ Multi-tenant junction tables created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 6: Creating role relationship junction tables'
\echo '================================================================='

-- ROLE_THERAPEUTIC_AREAS
CREATE TABLE public.role_therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    therapeutic_area_id UUID NOT NULL REFERENCES public.therapeutic_areas(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, therapeutic_area_id)
);

CREATE INDEX idx_role_therapeutic_areas_role ON public.role_therapeutic_areas(role_id);
CREATE INDEX idx_role_therapeutic_areas_ta ON public.role_therapeutic_areas(therapeutic_area_id);

-- ROLE_DISEASE_AREAS
CREATE TABLE public.role_disease_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    disease_area_id UUID NOT NULL REFERENCES public.disease_areas(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, disease_area_id)
);

CREATE INDEX idx_role_disease_areas_role ON public.role_disease_areas(role_id);
CREATE INDEX idx_role_disease_areas_da ON public.role_disease_areas(disease_area_id);

-- ROLE_COMPANY_SIZES
CREATE TABLE public.role_company_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    company_size_id UUID NOT NULL REFERENCES public.company_sizes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, company_size_id)
);

CREATE INDEX idx_role_company_sizes_role ON public.role_company_sizes(role_id);
CREATE INDEX idx_role_company_sizes_size ON public.role_company_sizes(company_size_id);

-- ROLE_RESPONSIBILITIES
CREATE TABLE public.role_responsibilities (
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

CREATE INDEX idx_role_responsibilities_role ON public.role_responsibilities(role_id);
CREATE INDEX idx_role_responsibilities_resp ON public.role_responsibilities(responsibility_id);

-- ROLE_KPIS
CREATE TABLE public.role_kpis (
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

CREATE INDEX idx_role_kpis_role ON public.role_kpis(role_id);
CREATE INDEX idx_role_kpis_kpi ON public.role_kpis(kpi_id);

-- ROLE_SKILLS
CREATE TABLE public.role_skills (
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

CREATE INDEX idx_role_skills_role ON public.role_skills(role_id);
CREATE INDEX idx_role_skills_skill ON public.role_skills(skill_id);

-- ROLE_TOOLS
CREATE TABLE public.role_tools (
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

CREATE INDEX idx_role_tools_role ON public.role_tools(role_id);
CREATE INDEX idx_role_tools_tool ON public.role_tools(tool_id);

-- ROLE_INTERNAL_STAKEHOLDERS
CREATE TABLE public.role_internal_stakeholders (
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

CREATE INDEX idx_role_internal_stakeholders_role ON public.role_internal_stakeholders(role_id);
CREATE INDEX idx_role_internal_stakeholders_sh ON public.role_internal_stakeholders(stakeholder_id);

-- ROLE_EXTERNAL_STAKEHOLDERS
CREATE TABLE public.role_external_stakeholders (
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

CREATE INDEX idx_role_external_stakeholders_role ON public.role_external_stakeholders(role_id);
CREATE INDEX idx_role_external_stakeholders_sh ON public.role_external_stakeholders(stakeholder_id);

-- ROLE_AI_MATURITY
CREATE TABLE public.role_ai_maturity (
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

CREATE INDEX idx_role_ai_maturity_role ON public.role_ai_maturity(role_id);
CREATE INDEX idx_role_ai_maturity_level ON public.role_ai_maturity(ai_maturity_level_id);

-- ROLE_VPANES_SCORES
CREATE TABLE public.role_vpanes_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    dimension_id UUID NOT NULL REFERENCES public.vpanes_dimensions(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    scoring_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, dimension_id)
);

CREATE INDEX idx_role_vpanes_scores_role ON public.role_vpanes_scores(role_id);
CREATE INDEX idx_role_vpanes_scores_dimension ON public.role_vpanes_scores(dimension_id);

\echo '✓ Role relationship junction tables created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'PHASE 7: Creating helper functions'
\echo '================================================================='

-- Slug generation function
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

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
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
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl);
    END LOOP;
END $$;

\echo '✓ Helper functions and triggers created'
\echo ''

-- =====================================================================
\echo '================================================================='
\echo 'REBUILD COMPLETE!'
\echo '================================================================='
\echo ''
\echo 'Gold Standard Pharmaceutical Organizational Schema Created:'
\echo '  ✓ 10 enum types'
\echo '  ✓ 3 core org tables (functions, departments, roles)'
\echo '  ✓ 10 reference/master data tables'
\echo '  ✓ 3 multi-tenant junction tables'
\echo '  ✓ 12 role relationship junction tables'
\echo '  ✓ Helper functions and triggers'
\echo ''
\echo 'Next Steps:'
\echo '  1. Run: populate_pharma_functions.sql'
\echo '  2. Run: populate_pharma_departments.sql'
\echo '  3. Run: populate_roles_01_medical_affairs.sql'
\echo '  4. Run: populate_roles_02_market_access.sql'
\echo '  5. Continue with remaining role population scripts'
\echo ''
\echo '================================================================='

