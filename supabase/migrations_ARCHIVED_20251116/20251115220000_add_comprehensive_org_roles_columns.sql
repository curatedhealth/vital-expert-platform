-- =====================================================
-- ADD COMPREHENSIVE COLUMNS TO org_roles
-- Date: 2025-11-15
-- Purpose: Extend org_roles table to support detailed role specifications
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
    ON org_roles(function_id) WHERE deleted_at IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'org_roles' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE org_roles
    ADD COLUMN department_id UUID REFERENCES org_departments(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_org_roles_department
    ON org_roles(department_id) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- =====================================================
-- REPORTING STRUCTURE
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS reports_to TEXT,
ADD COLUMN IF NOT EXISTS dotted_line_reports_to TEXT;

-- =====================================================
-- LEADERSHIP & CAREER
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS leadership_level TEXT, -- L1, L2, L3, etc.
ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 5;

-- =====================================================
-- TEAM STRUCTURE
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS team_size_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_size_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS direct_reports_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS direct_reports_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS layers_below INTEGER DEFAULT 0;

-- Create enum for span_of_control if it doesn't exist
DO $$
BEGIN
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
ADD COLUMN IF NOT EXISTS span_of_control span_of_control_type DEFAULT 'individual_contributor';

-- =====================================================
-- EXPERIENCE REQUIREMENTS
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS years_total_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_total_max INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS years_industry_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS years_function_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prior_roles JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- EDUCATION REQUIREMENTS
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS degree_level_minimum TEXT, -- 'bachelors', 'masters', 'phd', etc.
ADD COLUMN IF NOT EXISTS preferred_degrees JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS credentials_required JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS credentials_preferred JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- BUDGET AUTHORITY
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS budget_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_max_usd INTEGER DEFAULT 0;

-- Create enum for budget_authority_type if it doesn't exist
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

-- Create enum for approval_limit_type if it doesn't exist
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

-- =====================================================
-- COMPENSATION
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS base_salary_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_salary_max_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comp_min_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comp_max_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS equity_eligible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bonus_target_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ltip_eligible BOOLEAN DEFAULT false;

-- =====================================================
-- GEOGRAPHIC SCOPE
-- =====================================================
-- Create enum for geographic_scope_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geographic_scope_type') THEN
    CREATE TYPE geographic_scope_type AS ENUM (
      'site',
      'city',
      'region',
      'country',
      'multi_country',
      'global'
    );
  END IF;
END $$;

ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS geographic_scope_type geographic_scope_type DEFAULT 'country',
ADD COLUMN IF NOT EXISTS geographic_regions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS geographic_primary_region TEXT,
ADD COLUMN IF NOT EXISTS geographic_countries JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- CONTEXT & SCOPE
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS therapeutic_areas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS company_sizes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS company_types JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- STAKEHOLDERS
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS internal_stakeholders JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS external_stakeholders JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- TECHNOLOGY & TOOLS
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS technology_platforms JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- ACTIVITIES & KPIs
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS key_activities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- CAREER PROGRESSION
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS typical_prior_role TEXT,
ADD COLUMN IF NOT EXISTS typical_next_role TEXT,
ADD COLUMN IF NOT EXISTS lateral_moves JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS time_in_role_years_min INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS time_in_role_years_max INTEGER DEFAULT 4;

-- =====================================================
-- TRAVEL REQUIREMENTS
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS travel_percentage_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS travel_percentage_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS international_travel BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overnight_travel_frequency TEXT; -- 'never', 'rarely', 'occasionally', 'frequently', 'constantly'

-- =====================================================
-- COMPLIANCE & REGIONAL
-- =====================================================
ALTER TABLE org_roles
ADD COLUMN IF NOT EXISTS compliance_requirements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS regional_variations JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_org_roles_leadership_level
ON org_roles(leadership_level) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_org_roles_career_level
ON org_roles(career_level DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_org_roles_scope_type
ON org_roles(geographic_scope_type) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_org_roles_comp_range
ON org_roles(base_salary_min_usd, base_salary_max_usd) WHERE deleted_at IS NULL;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN org_roles.leadership_level IS 'Leadership hierarchy level (L1=C-Suite, L2=VP, L3=Sr Director, etc.)';
COMMENT ON COLUMN org_roles.career_level IS 'Numeric career level (1-10, higher = more senior)';
COMMENT ON COLUMN org_roles.span_of_control IS 'Type of management responsibility';
COMMENT ON COLUMN org_roles.geographic_scope_type IS 'Geographic scope of the role';
COMMENT ON COLUMN org_roles.therapeutic_areas IS 'Array of therapeutic area objects with expertise levels';
COMMENT ON COLUMN org_roles.company_sizes IS 'Array of typical company sizes for this role';
COMMENT ON COLUMN org_roles.company_types IS 'Array of typical company types (e.g., Big Pharma, Biotech)';
COMMENT ON COLUMN org_roles.internal_stakeholders IS 'Array of internal stakeholder objects';
COMMENT ON COLUMN org_roles.external_stakeholders IS 'Array of external stakeholder objects';
COMMENT ON COLUMN org_roles.technology_platforms IS 'Array of technology platform objects with proficiency levels';
COMMENT ON COLUMN org_roles.key_activities IS 'Array of key activities/responsibilities';
COMMENT ON COLUMN org_roles.kpis IS 'Array of KPI objects with targets and measurement frequency';
COMMENT ON COLUMN org_roles.compliance_requirements IS 'Array of compliance and regulatory requirements';
COMMENT ON COLUMN org_roles.regional_variations IS 'Object with US, EU, APAC-specific requirements';

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration adds comprehensive role specification fields to org_roles
-- supporting detailed job descriptions with:
-- - Team structure and reporting relationships
-- - Experience and education requirements
-- - Budget authority and compensation ranges
-- - Geographic scope and travel requirements
-- - Stakeholders, technology, activities, and KPIs
-- - Career progression paths
-- =====================================================
