-- =====================================================================
-- L1: ORGANIZATIONAL STRUCTURE LAYER
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Enterprise organizational hierarchy and structure
-- Dependencies: 001_L0_domain_knowledge.sql
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE:
-- L1 defines the structural backbone of the enterprise:
--   Functions → Departments → Roles → Teams
--
-- This layer captures:
--   - What the BUSINESS EXPECTS from each structural unit
--   - NOT behavioral/persona details (that's L2)
--   - Cross-functional collaboration patterns
--   - Geographic hierarchy
--   - Role responsibilities and KPIs
-- =====================================================================

-- =====================================================================
-- BUSINESS FUNCTIONS (Top-level Organizational Units)
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_business_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID, -- NULL = global template
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Medical Affairs', 'Commercial', 'R&D'
  code VARCHAR(20),
  description TEXT,

  -- Function Attributes
  is_revenue_generating BOOLEAN DEFAULT false,
  is_support_function BOOLEAN DEFAULT false,
  regulatory_oversight_level VARCHAR(20) CHECK (regulatory_oversight_level IN (
    'none', 'low', 'medium', 'high', 'critical'
  )),
  strategic_priority VARCHAR(20) CHECK (strategic_priority IN (
    'low', 'medium', 'high', 'critical'
  )),

  -- Hierarchy
  parent_function_id UUID REFERENCES org_business_functions(id),
  level INTEGER DEFAULT 1,

  -- L0 Domain Alignment (primary focus areas)
  primary_therapeutic_areas UUID[], -- References l0_therapeutic_areas
  primary_products UUID[], -- References l0_products

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- DEPARTMENTS (Sub-units within Functions)
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Field Medical', 'Medical Information'
  code VARCHAR(20),
  description TEXT,

  -- Parent Function (required)
  function_id UUID NOT NULL REFERENCES org_business_functions(id),

  -- Department Attributes
  headcount_range VARCHAR(20) CHECK (headcount_range IN (
    'small', 'medium', 'large', 'enterprise' -- <10, 10-50, 50-200, 200+
  )),
  geographic_scope VARCHAR(50) CHECK (geographic_scope IN (
    'global', 'regional', 'country', 'site'
  )),
  operating_model VARCHAR(50) CHECK (operating_model IN (
    'centralized', 'decentralized', 'hybrid', 'federated'
  )),

  -- Hierarchy
  parent_department_id UUID REFERENCES org_departments(id),
  level INTEGER DEFAULT 1,

  -- L0 Domain Focus
  primary_therapeutic_areas UUID[],
  primary_products UUID[],

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROLE EXTENSIONS (Adding to existing org_roles table)
-- =====================================================================
-- Note: org_roles table exists in 001_gold_standard_schema.sql
-- Adding additional columns and relationships here

-- Function and Department linkage
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES org_business_functions(id);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES org_departments(id);

-- Role Classification
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);
-- CHECK constraint added separately for existing tables
-- role_type IN ('individual_contributor', 'people_manager', 'functional_lead', 'executive')

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS seniority_level INTEGER CHECK (seniority_level BETWEEN 1 AND 10);
-- 1-3: Junior, 4-6: Mid, 7-8: Senior, 9-10: Executive

-- Decision Authority
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS budget_authority_usd DECIMAL(15,2);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS hiring_authority BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS signing_authority TEXT[]; -- Types of documents/decisions

-- AI Maturity & Automation
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS expected_ai_maturity VARCHAR(20);
-- CHECK (expected_ai_maturity IN ('beginner', 'intermediate', 'advanced', 'expert'))
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS automation_exposure_percent INTEGER CHECK (automation_exposure_percent BETWEEN 0 AND 100);

-- =====================================================================
-- ROLE RESPONSIBILITIES (Normalized from JSONB)
-- =====================================================================

CREATE TABLE IF NOT EXISTS role_responsibilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Responsibility Details
  responsibility_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  responsibility_type VARCHAR(50) CHECK (responsibility_type IN (
    'primary', 'secondary', 'shared', 'delegated', 'advisory'
  )),
  category VARCHAR(100), -- 'Clinical', 'Operational', 'Strategic', 'Compliance'

  -- Time Allocation
  time_allocation_percent INTEGER CHECK (time_allocation_percent BETWEEN 0 AND 100),

  -- Cross-functional
  collaborating_functions UUID[], -- Functions this responsibility touches
  requires_approval_from UUID[], -- Roles that must approve

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROLE KPIs (Normalized Success Metrics)
-- =====================================================================

CREATE TABLE IF NOT EXISTS role_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- KPI Details
  kpi_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Measurement
  metric_type VARCHAR(50) CHECK (metric_type IN (
    'count', 'percentage', 'currency', 'duration', 'score', 'ratio'
  )),
  measurement_unit VARCHAR(50),
  measurement_frequency VARCHAR(50) CHECK (measurement_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  )),

  -- Targets
  target_value DECIMAL(15,2),
  threshold_red DECIMAL(15,2),
  threshold_yellow DECIMAL(15,2),
  threshold_green DECIMAL(15,2),

  -- Source
  data_source VARCHAR(255), -- 'CRM', 'Survey', 'System', 'Manual'

  -- Weight
  weight_percent INTEGER CHECK (weight_percent BETWEEN 0 AND 100),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- TEAMS (Cross-functional Working Groups)
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'Launch Team Alpha', 'Oncology Advisory Board'
  description TEXT,

  -- Classification
  team_type VARCHAR(50) CHECK (team_type IN (
    'standing', 'project', 'cross_functional', 'governance',
    'advisory', 'task_force', 'committee'
  )),

  -- Ownership
  primary_department_id UUID REFERENCES org_departments(id),
  sponsoring_function_id UUID REFERENCES org_business_functions(id),

  -- L0 Domain Focus
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),
  product_id UUID REFERENCES l0_products(id),

  -- Lifecycle
  formation_date DATE,
  expected_end_date DATE, -- NULL for standing teams
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
    'forming', 'active', 'on_hold', 'completed', 'disbanded'
  )),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS org_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES org_teams(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,

  -- Membership Details
  membership_type VARCHAR(50) CHECK (membership_type IN (
    'core', 'extended', 'advisor', 'sponsor', 'observer'
  )),
  team_role VARCHAR(100), -- 'Lead', 'Secretary', 'Member', 'SME'

  -- Dates
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, role_id)
);

-- =====================================================================
-- GEOGRAPHY HIERARCHY
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_geographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10), -- ISO codes for countries

  -- Hierarchy
  level VARCHAR(20) NOT NULL CHECK (level IN (
    'global', 'region', 'country', 'site'
  )),
  parent_geography_id UUID REFERENCES org_geographies(id),

  -- Regional Classification
  region_name VARCHAR(100), -- 'North America', 'Europe', 'APAC'

  -- Regulatory Context
  regulatory_jurisdiction_id UUID REFERENCES l0_regulatory_jurisdictions(id),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department-Geography Coverage
CREATE TABLE IF NOT EXISTS org_department_geographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  geography_id UUID NOT NULL REFERENCES org_geographies(id) ON DELETE CASCADE,

  is_primary BOOLEAN DEFAULT false,
  headcount INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, geography_id)
);

-- Role-Geography Assignment
CREATE TABLE IF NOT EXISTS org_role_geographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  geography_id UUID NOT NULL REFERENCES org_geographies(id) ON DELETE CASCADE,

  is_primary BOOLEAN DEFAULT false,
  allocation_percent INTEGER CHECK (allocation_percent BETWEEN 0 AND 100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, geography_id)
);

-- =====================================================================
-- CROSS-FUNCTIONAL COLLABORATION PATTERNS
-- =====================================================================

CREATE TABLE IF NOT EXISTS org_function_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_a_id UUID NOT NULL REFERENCES org_business_functions(id),
  function_b_id UUID NOT NULL REFERENCES org_business_functions(id),

  -- Collaboration Details
  collaboration_type VARCHAR(50) CHECK (collaboration_type IN (
    'primary', 'secondary', 'occasional', 'escalation_only'
  )),
  use_cases TEXT[], -- 'Launch', 'Messaging', 'Crisis Response'
  interaction_frequency VARCHAR(20) CHECK (interaction_frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'as_needed'
  )),

  -- Governance
  governance_required BOOLEAN DEFAULT false,
  escalation_path TEXT,

  -- Pain Points (for transformation opportunities)
  common_friction_points TEXT[],
  improvement_opportunities TEXT[],

  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique pair (order-independent)
  UNIQUE(function_a_id, function_b_id),
  CHECK(function_a_id != function_b_id)
);

-- =====================================================================
-- L1 → L0 JUNCTION TABLES (Domain Assignments)
-- =====================================================================

-- Department Therapeutic Area Focus
CREATE TABLE IF NOT EXISTS dept_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  therapeutic_area_id UUID NOT NULL REFERENCES l0_therapeutic_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  priority INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, therapeutic_area_id)
);

-- Department Product Focus
CREATE TABLE IF NOT EXISTS dept_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES l0_products(id) ON DELETE CASCADE,
  responsibility_type VARCHAR(50) CHECK (responsibility_type IN (
    'lead', 'support', 'consult', 'inform'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, product_id)
);

-- Role Domain Expertise
CREATE TABLE IF NOT EXISTS role_domain_expertise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),
  product_id UUID REFERENCES l0_products(id),
  disease_id UUID REFERENCES l0_diseases(id),

  expertise_level VARCHAR(20) CHECK (expertise_level IN (
    'awareness', 'working', 'proficient', 'expert', 'thought_leader'
  )),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- At least one domain reference required
  CHECK (therapeutic_area_id IS NOT NULL OR product_id IS NOT NULL OR disease_id IS NOT NULL)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Functions
CREATE INDEX IF NOT EXISTS idx_org_functions_tenant ON org_business_functions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_functions_parent ON org_business_functions(parent_function_id);
CREATE INDEX IF NOT EXISTS idx_org_functions_code ON org_business_functions(code);

-- Departments
CREATE INDEX IF NOT EXISTS idx_org_departments_function ON org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_parent ON org_departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_scope ON org_departments(geographic_scope);

-- Roles (extending existing)
CREATE INDEX IF NOT EXISTS idx_org_roles_function ON org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department ON org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_seniority ON org_roles(seniority_level);

-- Role Details
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role ON role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_type ON role_responsibilities(responsibility_type);
CREATE INDEX IF NOT EXISTS idx_role_kpis_role ON role_kpi_definitions(role_id);

-- Teams
CREATE INDEX IF NOT EXISTS idx_org_teams_department ON org_teams(primary_department_id);
CREATE INDEX IF NOT EXISTS idx_org_teams_function ON org_teams(sponsoring_function_id);
CREATE INDEX IF NOT EXISTS idx_org_teams_type ON org_teams(team_type);
CREATE INDEX IF NOT EXISTS idx_org_teams_status ON org_teams(status);
CREATE INDEX IF NOT EXISTS idx_org_team_members_team ON org_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_org_team_members_role ON org_team_members(role_id);

-- Geography
CREATE INDEX IF NOT EXISTS idx_org_geographies_level ON org_geographies(level);
CREATE INDEX IF NOT EXISTS idx_org_geographies_parent ON org_geographies(parent_geography_id);
CREATE INDEX IF NOT EXISTS idx_org_dept_geo_dept ON org_department_geographies(department_id);
CREATE INDEX IF NOT EXISTS idx_org_role_geo_role ON org_role_geographies(role_id);

-- Collaborations
CREATE INDEX IF NOT EXISTS idx_org_collaborations_a ON org_function_collaborations(function_a_id);
CREATE INDEX IF NOT EXISTS idx_org_collaborations_b ON org_function_collaborations(function_b_id);

-- Domain Assignments
CREATE INDEX IF NOT EXISTS idx_dept_ta_dept ON dept_therapeutic_areas(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_products_dept ON dept_products(department_id);
CREATE INDEX IF NOT EXISTS idx_role_domain_role ON role_domain_expertise(role_id);

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE org_business_functions IS 'L1: Top-level organizational units (Medical Affairs, Commercial, R&D)';
COMMENT ON TABLE org_departments IS 'L1: Departments within business functions';
COMMENT ON TABLE org_teams IS 'L1: Cross-functional or within-department teams';
COMMENT ON TABLE org_geographies IS 'L1: Geographic hierarchy (Global → Region → Country → Site)';
COMMENT ON TABLE org_function_collaborations IS 'L1: Cross-functional collaboration patterns and use cases';
COMMENT ON TABLE role_responsibilities IS 'L1: Normalized role responsibilities (from JSONB)';
COMMENT ON TABLE role_kpi_definitions IS 'L1: Role success metrics and KPIs';

-- =====================================================================
-- SEED DATA: Core Business Functions
-- =====================================================================

INSERT INTO org_business_functions (unique_id, name, code, description, is_revenue_generating, is_support_function, regulatory_oversight_level, strategic_priority)
VALUES
  -- Core Pharma Functions
  ('FN-MEDICAL-AFFAIRS', 'Medical Affairs', 'MA', 'Scientific engagement, evidence generation, medical information, and KOL management', false, false, 'high', 'critical'),
  ('FN-COMMERCIAL', 'Commercial', 'COM', 'Sales, marketing, market access, and commercial operations', true, false, 'medium', 'critical'),
  ('FN-RD', 'Research & Development', 'R&D', 'Drug discovery, clinical development, and regulatory affairs', false, false, 'critical', 'critical'),
  ('FN-MARKET-ACCESS', 'Market Access', 'MKT-ACC', 'Pricing, reimbursement, health economics, and payer engagement', true, false, 'high', 'high'),

  -- Support Functions
  ('FN-LEGAL', 'Legal & Compliance', 'LEGAL', 'Legal affairs, compliance, and ethics', false, true, 'critical', 'high'),
  ('FN-HR', 'Human Resources', 'HR', 'Talent management, L&D, compensation, and organizational development', false, true, 'low', 'medium'),
  ('FN-FINANCE', 'Finance', 'FIN', 'Financial planning, accounting, treasury, and investor relations', false, true, 'medium', 'high'),
  ('FN-IT', 'Information Technology', 'IT', 'Technology infrastructure, applications, and digital transformation', false, true, 'medium', 'high'),
  ('FN-OPS', 'Operations', 'OPS', 'Supply chain, manufacturing, and quality assurance', false, false, 'critical', 'high')
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description,
  strategic_priority = EXCLUDED.strategic_priority;

-- =====================================================================
-- SEED DATA: Medical Affairs Departments
-- =====================================================================

INSERT INTO org_departments (unique_id, name, code, function_id, description, geographic_scope, operating_model)
SELECT
  'DEPT-' || d.code,
  d.name,
  d.code,
  f.id,
  d.description,
  d.scope,
  d.model
FROM org_business_functions f
CROSS JOIN (VALUES
  ('FIELD-MEDICAL', 'Field Medical', 'Scientific liaisons and field-based medical engagement', 'regional', 'decentralized'),
  ('MEDICAL-INFO', 'Medical Information', 'Medical inquiry response and scientific communication', 'global', 'hybrid'),
  ('EVIDENCE-GEN', 'Evidence Generation', 'Real-world evidence, ISS/IIS, and publications', 'global', 'centralized'),
  ('MEDICAL-OPS', 'Medical Operations', 'Medical training, congress management, and medical governance', 'global', 'centralized'),
  ('HEOR', 'Health Economics & Outcomes Research', 'Health economic modeling, value assessment, and HEOR studies', 'global', 'hybrid'),
  ('MEDICAL-STRATEGY', 'Medical Strategy', 'Medical planning, launch excellence, and strategic initiatives', 'global', 'centralized')
) AS d(code, name, description, scope, model)
WHERE f.unique_id = 'FN-MEDICAL-AFFAIRS'
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description;

-- =====================================================================
-- SEED DATA: Cross-Functional Collaborations
-- =====================================================================

-- This will be populated after functions are inserted
INSERT INTO org_function_collaborations (function_a_id, function_b_id, collaboration_type, use_cases, interaction_frequency, governance_required, common_friction_points)
SELECT
  fa.id,
  fb.id,
  c.collab_type,
  c.uses,
  c.freq,
  c.gov,
  c.friction
FROM org_business_functions fa
CROSS JOIN org_business_functions fb
CROSS JOIN (VALUES
  ('FN-MEDICAL-AFFAIRS', 'FN-COMMERCIAL', 'primary', ARRAY['Launch', 'Messaging Review', 'Field Alignment'], 'weekly', true, ARRAY['MLR bottlenecks', 'Conflicting priorities', 'Messaging consistency']),
  ('FN-MEDICAL-AFFAIRS', 'FN-RD', 'primary', ARRAY['Clinical trials', 'Evidence gaps', 'Label expansion'], 'weekly', false, ARRAY['Data access', 'Timeline alignment', 'Publication rights']),
  ('FN-MEDICAL-AFFAIRS', 'FN-MARKET-ACCESS', 'primary', ARRAY['HEOR studies', 'Value dossiers', 'Payer engagement'], 'monthly', false, ARRAY['Data availability', 'Study prioritization']),
  ('FN-MEDICAL-AFFAIRS', 'FN-LEGAL', 'secondary', ARRAY['Compliance review', 'Adverse event reporting', 'Contract review'], 'as_needed', true, ARRAY['Review timelines', 'Risk interpretation']),
  ('FN-COMMERCIAL', 'FN-MARKET-ACCESS', 'primary', ARRAY['Pricing', 'Access strategy', 'Account planning'], 'weekly', false, ARRAY['Pricing vs access trade-offs'])
) AS c(fn_a, fn_b, collab_type, uses, freq, gov, friction)
WHERE fa.unique_id = c.fn_a AND fb.unique_id = c.fn_b
ON CONFLICT (function_a_id, function_b_id) DO UPDATE SET
  use_cases = EXCLUDED.use_cases,
  common_friction_points = EXCLUDED.common_friction_points;

-- =====================================================================
-- SEED DATA: Global Geography
-- =====================================================================

INSERT INTO org_geographies (unique_id, name, code, level, region_name)
VALUES
  -- Global
  ('GEO-GLOBAL', 'Global', 'GLB', 'global', NULL),
  -- Regions
  ('GEO-NA', 'North America', 'NA', 'region', 'North America'),
  ('GEO-EU', 'Europe', 'EU', 'region', 'Europe'),
  ('GEO-APAC', 'Asia Pacific', 'APAC', 'region', 'Asia Pacific'),
  ('GEO-LATAM', 'Latin America', 'LATAM', 'region', 'Latin America'),
  -- Key Countries
  ('GEO-US', 'United States', 'US', 'country', 'North America'),
  ('GEO-CA', 'Canada', 'CA', 'country', 'North America'),
  ('GEO-DE', 'Germany', 'DE', 'country', 'Europe'),
  ('GEO-FR', 'France', 'FR', 'country', 'Europe'),
  ('GEO-UK', 'United Kingdom', 'GB', 'country', 'Europe'),
  ('GEO-JP', 'Japan', 'JP', 'country', 'Asia Pacific'),
  ('GEO-CN', 'China', 'CN', 'country', 'Asia Pacific'),
  ('GEO-BR', 'Brazil', 'BR', 'country', 'Latin America')
ON CONFLICT (unique_id) DO UPDATE SET
  region_name = EXCLUDED.region_name;

-- Set parent relationships for geographies
UPDATE org_geographies SET parent_geography_id = (SELECT id FROM org_geographies WHERE unique_id = 'GEO-GLOBAL')
WHERE level = 'region';

UPDATE org_geographies g SET parent_geography_id = (
  SELECT id FROM org_geographies
  WHERE level = 'region' AND region_name = g.region_name
)
WHERE g.level = 'country';
