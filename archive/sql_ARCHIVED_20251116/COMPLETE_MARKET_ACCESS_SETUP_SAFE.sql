-- =====================================================
-- COMPLETE MARKET ACCESS ROLE SETUP (SAFE VERSION)
-- Date: 2025-11-15
-- Purpose: Single file to create all tables and columns needed
-- This version DROPS existing normalized tables first to avoid conflicts
-- =====================================================

-- =====================================================
-- STEP 1: DROP OLD NORMALIZED TABLES IF THEY EXIST
-- (This ensures we start fresh with correct schema)
-- =====================================================
DROP TABLE IF EXISTS role_regional_variations CASCADE;
DROP TABLE IF EXISTS role_compliance_requirements CASCADE;
DROP TABLE IF EXISTS role_lateral_moves CASCADE;
DROP TABLE IF EXISTS role_kpis CASCADE;
DROP TABLE IF EXISTS role_key_activities CASCADE;
DROP TABLE IF EXISTS role_technology_platforms CASCADE;
DROP TABLE IF EXISTS role_external_stakeholders CASCADE;
DROP TABLE IF EXISTS role_internal_stakeholders CASCADE;
DROP TABLE IF EXISTS role_credentials_preferred CASCADE;
DROP TABLE IF EXISTS role_credentials_required CASCADE;
DROP TABLE IF EXISTS role_preferred_degrees CASCADE;
DROP TABLE IF EXISTS role_prior_roles CASCADE;
DROP TABLE IF EXISTS role_geographic_regions CASCADE;
DROP TABLE IF EXISTS role_geographic_countries CASCADE;
DROP TABLE IF EXISTS role_company_types CASCADE;
DROP TABLE IF EXISTS role_company_sizes CASCADE;
DROP TABLE IF EXISTS role_therapeutic_areas CASCADE;

-- =====================================================
-- STEP 2: ADD COMPREHENSIVE COLUMNS TO org_roles
-- =====================================================

-- First, add function_id and department_id if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'org_roles' AND column_name = 'function_id'
  ) THEN
    ALTER TABLE org_roles
    ADD COLUMN function_id UUID REFERENCES org_functions(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_org_roles_function
    ON org_roles(function_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'org_roles' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE org_roles
    ADD COLUMN department_id UUID REFERENCES org_departments(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_org_roles_department
    ON org_roles(department_id);
  END IF;
END $$;

-- REPORTING STRUCTURE
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS reports_to TEXT,
ADD COLUMN IF NOT EXISTS dotted_line_reports_to TEXT;

-- LEADERSHIP & CAREER
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS leadership_level TEXT,
ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 5;

-- TEAM STRUCTURE
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS team_size_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_size_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS direct_reports_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS direct_reports_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS layers_below INTEGER DEFAULT 0;

-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seniority_level') THEN
    CREATE TYPE seniority_level AS ENUM (
      'entry',
      'mid',
      'senior',
      'executive'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'span_of_control_type') THEN
    CREATE TYPE span_of_control_type AS ENUM (
      'individual_contributor',
      'people_manager',
      'manager_of_managers',
      'executive'
    );
  END IF;
END $$;

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS seniority_level seniority_level DEFAULT 'mid',
ADD COLUMN IF NOT EXISTS span_of_control span_of_control_type DEFAULT 'individual_contributor';

-- EXPERIENCE REQUIREMENTS
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS years_total_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_total_max INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS years_industry_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_function_min INTEGER DEFAULT 0;

-- EDUCATION REQUIREMENTS
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS degree_level_minimum TEXT;

-- BUDGET AUTHORITY
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS budget_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_max_usd INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_authority_type') THEN
    CREATE TYPE budget_authority_type AS ENUM (
      'none',
      'limited',
      'moderate',
      'substantial',
      'full'
    );
  END IF;
END $$;

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS budget_authority_type budget_authority_type DEFAULT 'none';

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS controls_headcount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS controls_contractors BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_limit_type') THEN
    CREATE TYPE approval_limit_type AS ENUM (
      'no_authority',
      'manager_approved',
      'director_approved',
      'vp_approved',
      'c_level_approved',
      'board_approved'
    );
  END IF;
END $$;

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS approval_limits approval_limit_type DEFAULT 'manager_approved';

-- COMPENSATION
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS base_salary_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_salary_max_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comp_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comp_max_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS equity_eligible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bonus_target_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ltip_eligible BOOLEAN DEFAULT false;

-- GEOGRAPHIC SCOPE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geographic_scope_type') THEN
    CREATE TYPE geographic_scope_type AS ENUM (
      'site',
      'city',
      'region',
      'country',
      'national',
      'multi_country',
      'global'
    );
  END IF;
END $$;

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS geographic_scope_type geographic_scope_type DEFAULT 'country',
ADD COLUMN IF NOT EXISTS geographic_primary_region TEXT;

-- CAREER PROGRESSION
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS typical_prior_role TEXT,
ADD COLUMN IF NOT EXISTS typical_next_role TEXT,
ADD COLUMN IF NOT EXISTS time_in_role_years_min INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS time_in_role_years_max INTEGER DEFAULT 4;

-- TRAVEL REQUIREMENTS
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS travel_percentage_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS travel_percentage_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS international_travel BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overnight_travel_frequency TEXT;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_org_roles_leadership_level
ON org_roles(leadership_level);

CREATE INDEX IF NOT EXISTS idx_org_roles_career_level
ON org_roles(career_level DESC);

CREATE INDEX IF NOT EXISTS idx_org_roles_scope_type
ON org_roles(geographic_scope_type);

CREATE INDEX IF NOT EXISTS idx_org_roles_comp_range
ON org_roles(base_salary_min_usd, base_salary_max_usd);

-- =====================================================
-- STEP 3: CREATE NORMALIZED RELATIONSHIP TABLES
-- =====================================================

CREATE TABLE role_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  ta_code TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  expertise_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, ta_code)
);

CREATE INDEX idx_role_ta_role ON role_therapeutic_areas(role_id);
CREATE INDEX idx_role_ta_code ON role_therapeutic_areas(ta_code);
CREATE INDEX idx_role_ta_primary ON role_therapeutic_areas(role_id, is_primary);

CREATE TABLE role_company_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  size_code TEXT NOT NULL,
  is_typical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, size_code)
);

CREATE INDEX idx_role_company_size_role ON role_company_sizes(role_id);
CREATE INDEX idx_role_company_size_code ON role_company_sizes(size_code);

CREATE TABLE role_company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  type_code TEXT NOT NULL,
  is_typical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, type_code)
);

CREATE INDEX idx_role_company_type_role ON role_company_types(role_id);
CREATE INDEX idx_role_company_type_code ON role_company_types(type_code);

CREATE TABLE role_geographic_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  coverage_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, country_code)
);

CREATE INDEX idx_role_geo_country_role ON role_geographic_countries(role_id);
CREATE INDEX idx_role_geo_country_code ON role_geographic_countries(country_code);
CREATE INDEX idx_role_geo_country_primary ON role_geographic_countries(role_id, is_primary);

CREATE TABLE role_geographic_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, region_code)
);

CREATE INDEX idx_role_geo_region_role ON role_geographic_regions(role_id);
CREATE INDEX idx_role_geo_region_code ON role_geographic_regions(region_code);

CREATE TABLE role_prior_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  prior_role_name TEXT NOT NULL,
  years_required INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_prior_role ON role_prior_roles(role_id);

CREATE TABLE role_preferred_degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  degree_code TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  field_of_study TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, degree_code)
);

CREATE INDEX idx_role_degree_role ON role_preferred_degrees(role_id);
CREATE INDEX idx_role_degree_code ON role_preferred_degrees(degree_code);

CREATE TABLE role_credentials_required (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  credential_code TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, credential_code)
);

CREATE INDEX idx_role_cred_req_role ON role_credentials_required(role_id);
CREATE INDEX idx_role_cred_req_code ON role_credentials_required(credential_code);

CREATE TABLE role_credentials_preferred (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  credential_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, credential_code)
);

CREATE INDEX idx_role_cred_pref_role ON role_credentials_preferred(role_id);
CREATE INDEX idx_role_cred_pref_code ON role_credentials_preferred(credential_code);

CREATE TABLE role_internal_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  stakeholder_code TEXT NOT NULL,
  interaction_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, stakeholder_code)
);

CREATE INDEX idx_role_int_stake_role ON role_internal_stakeholders(role_id);
CREATE INDEX idx_role_int_stake_code ON role_internal_stakeholders(stakeholder_code);

CREATE TABLE role_external_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  stakeholder_code TEXT NOT NULL,
  interaction_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, stakeholder_code)
);

CREATE INDEX idx_role_ext_stake_role ON role_external_stakeholders(role_id);
CREATE INDEX idx_role_ext_stake_code ON role_external_stakeholders(stakeholder_code);

CREATE TABLE role_technology_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  usage_level TEXT,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, platform_name)
);

CREATE INDEX idx_role_tech_role ON role_technology_platforms(role_id);
CREATE INDEX idx_role_tech_name ON role_technology_platforms(platform_name);

CREATE TABLE role_key_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  activity_description TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  time_allocation_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_activity_role ON role_key_activities(role_id);
CREATE INDEX idx_role_activity_priority ON role_key_activities(role_id, priority DESC);

CREATE TABLE role_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  target TEXT,
  measurement_frequency TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_kpi_role ON role_kpis(role_id);
CREATE INDEX idx_role_kpi_primary ON role_kpis(role_id, is_primary);

CREATE TABLE role_lateral_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  lateral_role_name TEXT NOT NULL,
  similarity_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_lateral_role ON role_lateral_moves(role_id);

CREATE TABLE role_compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  requirement_description TEXT NOT NULL,
  requirement_type TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_compliance_role ON role_compliance_requirements(role_id);
CREATE INDEX idx_role_compliance_type ON role_compliance_requirements(requirement_type);

CREATE TABLE role_regional_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL,
  variation_description TEXT NOT NULL,
  variation_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_regional_var_role ON role_regional_variations(role_id);
CREATE INDEX idx_role_regional_var_region ON role_regional_variations(region_code);

-- =====================================================
-- COMPLETION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ SETUP COMPLETE';
  RAISE NOTICE '✅ Dropped and recreated 17 normalized tables';
  RAISE NOTICE '✅ Added all columns to org_roles';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next: Run market_access_roles_part1_normalized.sql';
END $$;
