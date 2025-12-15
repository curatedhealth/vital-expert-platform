-- =============================================================================
-- PHASE 04: Organizational Hierarchy & Structure
-- =============================================================================
-- PURPOSE: Create organizational taxonomy (functions, departments, roles, responsibilities)
-- TABLES: 15 tables (org_functions, org_departments, org_roles, org_responsibilities, + 5 junction tables + 6 additional org tables)
-- TIME: ~20 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: org_functions (14 organizational functions)
-- =============================================================================
CREATE TABLE org_functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name functional_area_type NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,

  -- Metadata
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, name)
);

-- Indexes for org_functions
CREATE INDEX idx_org_functions_tenant ON org_functions(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_functions_parent ON org_functions(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_functions_slug ON org_functions(slug) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_functions IS '14 primary organizational functions across healthcare/pharma companies';

-- =============================================================================
-- TABLE 2: org_departments (departments within functions)
-- =============================================================================
CREATE TABLE org_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for org_departments
CREATE INDEX idx_org_departments_tenant ON org_departments(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_departments_slug ON org_departments(slug) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_departments IS 'Departments that exist within organizational functions';

-- =============================================================================
-- TABLE 3: org_roles (job roles)
-- =============================================================================
CREATE TABLE org_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Level/Seniority
  seniority_level TEXT, -- 'junior', 'mid', 'senior', 'executive', 'c-suite'
  reports_to_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for org_roles
CREATE INDEX idx_org_roles_tenant ON org_roles(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_roles_slug ON org_roles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_roles_seniority ON org_roles(seniority_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_roles_reports_to ON org_roles(reports_to_role_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_roles IS 'Job roles and titles within organizations';

-- =============================================================================
-- TABLE 4: org_responsibilities (specific responsibilities)
-- =============================================================================
CREATE TABLE org_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'strategic', 'operational', 'compliance', 'leadership'

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for org_responsibilities
CREATE INDEX idx_org_responsibilities_tenant ON org_responsibilities(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_responsibilities_category ON org_responsibilities(category) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_responsibilities IS 'Specific responsibilities assigned to roles';

-- =============================================================================
-- JUNCTION TABLE 1: function_departments
-- =============================================================================
CREATE TABLE function_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,

  -- Metadata
  is_primary BOOLEAN DEFAULT false, -- Primary function for this department

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(function_id, department_id)
);

-- Indexes
CREATE INDEX idx_func_dept_function ON function_departments(function_id);
CREATE INDEX idx_func_dept_department ON function_departments(department_id);

COMMENT ON TABLE function_departments IS 'Maps departments to their organizational functions';

-- =============================================================================
-- JUNCTION TABLE 2: function_roles
-- =============================================================================
CREATE TABLE function_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,

  -- Metadata
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(function_id, role_id)
);

-- Indexes
CREATE INDEX idx_func_role_function ON function_roles(function_id);
CREATE INDEX idx_func_role_role ON function_roles(role_id);

COMMENT ON TABLE function_roles IS 'Maps roles to organizational functions';

-- =============================================================================
-- JUNCTION TABLE 3: department_roles
-- =============================================================================
CREATE TABLE department_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,

  -- Metadata
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(department_id, role_id)
);

-- Indexes
CREATE INDEX idx_dept_role_department ON department_roles(department_id);
CREATE INDEX idx_dept_role_role ON department_roles(role_id);

COMMENT ON TABLE department_roles IS 'Maps roles to departments';

-- =============================================================================
-- JUNCTION TABLE 4: role_responsibilities
-- =============================================================================
CREATE TABLE role_responsibilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
  responsibility_id UUID NOT NULL REFERENCES org_responsibilities(id) ON DELETE CASCADE,

  -- Priority
  priority INTEGER DEFAULT 0, -- Higher = more important

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(role_id, responsibility_id)
);

-- Indexes
CREATE INDEX idx_role_resp_role ON role_responsibilities(role_id);
CREATE INDEX idx_role_resp_responsibility ON role_responsibilities(responsibility_id);
CREATE INDEX idx_role_resp_priority ON role_responsibilities(priority DESC);

COMMENT ON TABLE role_responsibilities IS 'Maps responsibilities to roles with priority';

-- =============================================================================
-- JUNCTION TABLE 5: function_industries
-- =============================================================================
CREATE TABLE function_industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(function_id, industry_id)
);

-- Indexes
CREATE INDEX idx_func_ind_function ON function_industries(function_id);
CREATE INDEX idx_func_ind_industry ON function_industries(industry_id);
CREATE INDEX idx_func_ind_relevance ON function_industries(relevance_score DESC);

COMMENT ON TABLE function_industries IS 'Maps organizational functions to industries with relevance scores';

-- =============================================================================
-- TABLE 5: org_teams (cross-functional teams)
-- =============================================================================
CREATE TABLE org_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  team_type TEXT, -- 'permanent', 'project', 'task_force'

  -- Leadership
  lead_user_id UUID REFERENCES user_profiles(id),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_org_teams_tenant ON org_teams(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_teams_lead ON org_teams(lead_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_teams_type ON org_teams(team_type) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_teams IS 'Cross-functional teams within organizations';

-- =============================================================================
-- TABLE 6: org_team_members
-- =============================================================================
CREATE TABLE org_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES org_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX idx_team_members_team ON org_team_members(team_id);
CREATE INDEX idx_team_members_user ON org_team_members(user_id);
CREATE INDEX idx_team_members_role ON org_team_members(role_id);

COMMENT ON TABLE org_team_members IS 'Team membership with role assignments';

-- =============================================================================
-- TABLE 7: org_hierarchy (reporting structure)
-- =============================================================================
CREATE TABLE org_hierarchy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Reporting Structure
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reports_to_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(tenant_id, user_id, effective_from)
);

-- Indexes
CREATE INDEX idx_org_hier_tenant ON org_hierarchy(tenant_id);
CREATE INDEX idx_org_hier_user ON org_hierarchy(user_id);
CREATE INDEX idx_org_hier_reports_to ON org_hierarchy(reports_to_user_id);
CREATE INDEX idx_org_hier_role ON org_hierarchy(role_id);
CREATE INDEX idx_org_hier_function ON org_hierarchy(function_id);
CREATE INDEX idx_org_hier_department ON org_hierarchy(department_id);
CREATE INDEX idx_org_hier_active ON org_hierarchy(is_active);

COMMENT ON TABLE org_hierarchy IS 'Organizational reporting structure and role assignments';

-- =============================================================================
-- TABLE 8: org_locations (office locations)
-- =============================================================================
CREATE TABLE org_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  location_type TEXT, -- 'headquarters', 'office', 'lab', 'manufacturing', 'remote'

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  timezone TEXT,

  -- Contact
  phone TEXT,
  email TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_org_locations_tenant ON org_locations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_locations_type ON org_locations(location_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_locations_country ON org_locations(country) WHERE deleted_at IS NULL;

COMMENT ON TABLE org_locations IS 'Physical office locations for organizations';

-- =============================================================================
-- TABLE 9: org_certifications (professional certifications)
-- =============================================================================
CREATE TABLE org_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL UNIQUE,
  issuing_organization TEXT,
  description TEXT,
  certification_type TEXT, -- 'professional', 'technical', 'compliance'

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_org_certifications_type ON org_certifications(certification_type);

COMMENT ON TABLE org_certifications IS 'Professional certifications relevant to roles';

-- =============================================================================
-- SEED DATA: 14 Organizational Functions
-- =============================================================================

INSERT INTO org_functions (id, tenant_id, name, slug, description, icon, color, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Commercial', 'commercial', 'Sales, marketing, brand management', '💼', '#0066CC', 1),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Medical Affairs', 'medical-affairs', 'Medical science liaisons, publications, evidence generation', '⚕️', '#00AA66', 2),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'Market Access', 'market-access', 'Payer relations, HEOR, pricing, reimbursement', '🏦', '#6600CC', 3),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Clinical', 'clinical', 'Clinical trials, clinical operations, medical monitoring', '🔬', '#CC0066', 4),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'Regulatory', 'regulatory', 'Regulatory affairs, submissions, compliance', '📋', '#FF6600', 5),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'Research & Development', 'research-development', 'Drug discovery, preclinical, translational medicine', '🧪', '#0099CC', 6),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'Manufacturing', 'manufacturing', 'Production, supply chain, quality operations', '🏭', '#996600', 7),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'Quality', 'quality', 'Quality assurance, quality control, validation', '✓', '#009966', 8),
  ('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'Operations', 'operations', 'Business operations, process improvement, project management', '⚙️', '#666666', 9),
  ('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'IT/Digital', 'it-digital', 'Information technology, digital transformation, data analytics', '💻', '#0066FF', 10),
  ('30000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'Legal', 'legal', 'Legal counsel, contracts, intellectual property', '⚖️', '#333333', 11),
  ('30000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'Finance', 'finance', 'Financial planning, accounting, investor relations', '💰', '#006633', 12),
  ('30000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'HR', 'hr', 'Human resources, talent acquisition, learning & development', '👥', '#CC6600', 13),
  ('30000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'Business Development', 'business-development', 'Partnerships, licensing, M&A', '🤝', '#9900CC', 14)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('org_functions', 'org_departments', 'org_roles', 'org_responsibilities', 'function_departments', 'function_roles', 'department_roles', 'role_responsibilities', 'function_industries', 'org_teams', 'org_team_members', 'org_hierarchy', 'org_locations', 'org_certifications');

    SELECT COUNT(*) INTO function_count FROM org_functions;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 04 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Organizational functions seeded: %', function_count;
    RAISE NOTICE '';
    RAISE NOTICE '14 Functions: Commercial, Medical Affairs, Market Access, Clinical, Regulatory, R&D, Manufacturing, Quality, Operations, IT/Digital, Legal, Finance, HR, Business Development';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 05 (Core AI Assets)';
    RAISE NOTICE '';
END $$;
