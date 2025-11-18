-- =====================================================
-- FULLY NORMALIZED ORG ROLES SCHEMA
-- Date: 2025-11-15
-- Purpose: Create normalized tables to replace JSONB columns
-- =====================================================

-- =====================================================
-- THERAPEUTIC AREAS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  ta_code TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  expertise_level TEXT, -- 'basic', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, ta_code)
);

CREATE INDEX idx_role_ta_role ON role_therapeutic_areas(role_id);
CREATE INDEX idx_role_ta_code ON role_therapeutic_areas(ta_code);
CREATE INDEX idx_role_ta_primary ON role_therapeutic_areas(role_id, is_primary);

COMMENT ON TABLE role_therapeutic_areas IS 'Therapeutic areas associated with roles';

-- =====================================================
-- COMPANY SIZES
-- =====================================================
CREATE TABLE IF NOT EXISTS role_company_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  size_code TEXT NOT NULL, -- 'STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'
  is_typical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, size_code)
);

CREATE INDEX idx_role_company_size_role ON role_company_sizes(role_id);
CREATE INDEX idx_role_company_size_code ON role_company_sizes(size_code);

COMMENT ON TABLE role_company_sizes IS 'Company sizes where role typically exists';

-- =====================================================
-- COMPANY TYPES
-- =====================================================
CREATE TABLE IF NOT EXISTS role_company_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  type_code TEXT NOT NULL, -- 'BIG_PHARMA', 'BIOTECH', 'MEDTECH', 'DIGITAL_HEALTH'
  is_typical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, type_code)
);

CREATE INDEX idx_role_company_type_role ON role_company_types(role_id);
CREATE INDEX idx_role_company_type_code ON role_company_types(type_code);

COMMENT ON TABLE role_company_types IS 'Company types where role typically exists';

-- =====================================================
-- GEOGRAPHIC COUNTRIES
-- =====================================================
CREATE TABLE IF NOT EXISTS role_geographic_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL, -- ISO country code
  is_primary BOOLEAN DEFAULT false,
  coverage_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, country_code)
);

CREATE INDEX idx_role_geo_country_role ON role_geographic_countries(role_id);
CREATE INDEX idx_role_geo_country_code ON role_geographic_countries(country_code);
CREATE INDEX idx_role_geo_country_primary ON role_geographic_countries(role_id, is_primary);

COMMENT ON TABLE role_geographic_countries IS 'Countries/regions covered by role';

-- =====================================================
-- GEOGRAPHIC REGIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_geographic_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL, -- 'GLOBAL', 'EMEA', 'APAC', 'AMERICAS', 'USA', etc.
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, region_code)
);

CREATE INDEX idx_role_geo_region_role ON role_geographic_regions(role_id);
CREATE INDEX idx_role_geo_region_code ON role_geographic_regions(region_code);

COMMENT ON TABLE role_geographic_regions IS 'Geographic regions covered by role';

-- =====================================================
-- PRIOR ROLES (Career Path Prerequisites)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_prior_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  prior_role_name TEXT NOT NULL,
  years_required INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_prior_role ON role_prior_roles(role_id);

COMMENT ON TABLE role_prior_roles IS 'Typical prior roles before this position';

-- =====================================================
-- PREFERRED DEGREES
-- =====================================================
CREATE TABLE IF NOT EXISTS role_preferred_degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  degree_code TEXT NOT NULL, -- 'BS', 'MS', 'MBA', 'PhD', 'PharmD', 'MD'
  is_required BOOLEAN DEFAULT false,
  field_of_study TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, degree_code)
);

CREATE INDEX idx_role_degree_role ON role_preferred_degrees(role_id);
CREATE INDEX idx_role_degree_code ON role_preferred_degrees(degree_code);

COMMENT ON TABLE role_preferred_degrees IS 'Preferred degrees for role';

-- =====================================================
-- CREDENTIALS REQUIRED
-- =====================================================
CREATE TABLE IF NOT EXISTS role_credentials_required (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  credential_code TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, credential_code)
);

CREATE INDEX idx_role_cred_req_role ON role_credentials_required(role_id);
CREATE INDEX idx_role_cred_req_code ON role_credentials_required(credential_code);

COMMENT ON TABLE role_credentials_required IS 'Required certifications/credentials';

-- =====================================================
-- CREDENTIALS PREFERRED
-- =====================================================
CREATE TABLE IF NOT EXISTS role_credentials_preferred (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  credential_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, credential_code)
);

CREATE INDEX idx_role_cred_pref_role ON role_credentials_preferred(role_id);
CREATE INDEX idx_role_cred_pref_code ON role_credentials_preferred(credential_code);

COMMENT ON TABLE role_credentials_preferred IS 'Preferred certifications/credentials';

-- =====================================================
-- INTERNAL STAKEHOLDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_internal_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  stakeholder_code TEXT NOT NULL,
  interaction_level TEXT, -- 'low', 'medium', 'high'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, stakeholder_code)
);

CREATE INDEX idx_role_int_stake_role ON role_internal_stakeholders(role_id);
CREATE INDEX idx_role_int_stake_code ON role_internal_stakeholders(stakeholder_code);

COMMENT ON TABLE role_internal_stakeholders IS 'Internal stakeholders for role';

-- =====================================================
-- EXTERNAL STAKEHOLDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_external_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  stakeholder_code TEXT NOT NULL,
  interaction_level TEXT, -- 'low', 'medium', 'high'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, stakeholder_code)
);

CREATE INDEX idx_role_ext_stake_role ON role_external_stakeholders(role_id);
CREATE INDEX idx_role_ext_stake_code ON role_external_stakeholders(stakeholder_code);

COMMENT ON TABLE role_external_stakeholders IS 'External stakeholders for role';

-- =====================================================
-- TECHNOLOGY PLATFORMS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_technology_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  usage_level TEXT, -- 'basic', 'intermediate', 'advanced', 'expert'
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, platform_name)
);

CREATE INDEX idx_role_tech_role ON role_technology_platforms(role_id);
CREATE INDEX idx_role_tech_name ON role_technology_platforms(platform_name);

COMMENT ON TABLE role_technology_platforms IS 'Technology platforms used in role';

-- =====================================================
-- KEY ACTIVITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS role_key_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  activity_description TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  time_allocation_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_activity_role ON role_key_activities(role_id);
CREATE INDEX idx_role_activity_priority ON role_key_activities(role_id, priority DESC);

COMMENT ON TABLE role_key_activities IS 'Key activities and responsibilities';

-- =====================================================
-- KPIs
-- =====================================================
CREATE TABLE IF NOT EXISTS role_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  target TEXT,
  measurement_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annually'
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_kpi_role ON role_kpis(role_id);
CREATE INDEX idx_role_kpi_primary ON role_kpis(role_id, is_primary);

COMMENT ON TABLE role_kpis IS 'Key Performance Indicators for role';

-- =====================================================
-- LATERAL MOVES (Career Path Options)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_lateral_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  lateral_role_name TEXT NOT NULL,
  similarity_percentage INTEGER, -- How similar is this lateral role
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_lateral_role ON role_lateral_moves(role_id);

COMMENT ON TABLE role_lateral_moves IS 'Possible lateral career moves';

-- =====================================================
-- COMPLIANCE REQUIREMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  requirement_description TEXT NOT NULL,
  requirement_type TEXT, -- 'regulatory', 'legal', 'ethics', 'safety'
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_compliance_role ON role_compliance_requirements(role_id);
CREATE INDEX idx_role_compliance_type ON role_compliance_requirements(requirement_type);

COMMENT ON TABLE role_compliance_requirements IS 'Compliance and regulatory requirements';

-- =====================================================
-- REGIONAL VARIATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS role_regional_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL, -- 'US', 'EU', 'APAC', etc.
  variation_description TEXT NOT NULL,
  variation_category TEXT, -- 'regulatory', 'market', 'cultural', 'legal'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_role_regional_var_role ON role_regional_variations(role_id);
CREATE INDEX idx_role_regional_var_region ON role_regional_variations(region_code);

COMMENT ON TABLE role_regional_variations IS 'Regional-specific variations in role requirements';

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration creates fully normalized tables to replace JSONB columns
-- Each array in the original data becomes a separate table with proper relationships
-- Benefits:
-- - Query performance with proper indexes
-- - Data integrity with foreign keys
-- - Easy to filter and aggregate
-- - Flexible schema evolution
-- =====================================================
