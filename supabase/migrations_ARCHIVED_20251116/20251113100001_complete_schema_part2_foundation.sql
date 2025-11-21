-- =============================================================================
-- PHASE 02: Identity & Multi-Tenancy Infrastructure
-- =============================================================================
-- PURPOSE: Create 5-level tenant hierarchy and user identity system
-- TABLES: 6 tables (user_profiles, tenants, tenant_members, tenant_organizations, tenant_usage_tracking, api_keys)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: user_profiles (extends Supabase auth.users)
-- =============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Professional Information
  job_title TEXT,
  department TEXT,
  organization TEXT,

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{
    "email": true,
    "in_app": true,
    "weekly_digest": true
  }'::jsonb,

  -- System Fields
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_last_seen ON user_profiles(last_seen_at DESC);

COMMENT ON TABLE user_profiles IS 'Extended user profile information linked to Supabase auth.users';

-- =============================================================================
-- TABLE 2: tenants (5-level hierarchy with ltree)
-- =============================================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Hierarchy (ltree for efficient queries)
  parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  tenant_path LTREE NOT NULL, -- e.g., 'platform.provider123.client456'
  tenant_level INTEGER NOT NULL CHECK (tenant_level BETWEEN 0 AND 4),

  -- Tenant Type by Level:
  -- Level 0: Platform (root)
  -- Level 1: Solution Provider
  -- Level 2: Enterprise Client
  -- Level 3: Partner Org
  -- Level 4: Trial Tenant

  -- Subscription & Limits
  status tenant_status DEFAULT 'active' NOT NULL,
  tier tenant_tier DEFAULT 'free' NOT NULL,

  -- Resource Limits
  max_users INTEGER DEFAULT 5 NOT NULL,
  max_agents INTEGER DEFAULT 10 NOT NULL,
  max_storage_gb INTEGER DEFAULT 1 NOT NULL,
  max_api_calls_per_month INTEGER DEFAULT 10000 NOT NULL,

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{}'::jsonb,
  -- Example features:
  -- {
  --   "custom_agents": true,
  --   "panel_discussions": true,
  --   "workflow_automation": true,
  --   "white_label": false,
  --   "sso": false,
  --   "api_access": true
  -- }

  -- Billing
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_tenant_path CHECK (nlevel(tenant_path) = tenant_level + 1),
  CONSTRAINT root_has_no_parent CHECK (
    (tenant_level = 0 AND parent_id IS NULL) OR
    (tenant_level > 0 AND parent_id IS NOT NULL)
  )
);

-- Indexes for tenants
CREATE INDEX idx_tenants_parent ON tenants(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_path_gist ON tenants USING GIST(tenant_path) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_path_btree ON tenants(tenant_path) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_level ON tenants(tenant_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_tier ON tenants(tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;

COMMENT ON TABLE tenants IS '5-level tenant hierarchy: Platform → Solution Provider → Enterprise Client → Partner Org → Trial Tenant';
COMMENT ON COLUMN tenants.tenant_path IS 'Materialized path using ltree for efficient hierarchy queries';
COMMENT ON COLUMN tenants.tenant_level IS '0=Platform, 1=Solution Provider, 2=Enterprise Client, 3=Partner Org, 4=Trial Tenant';

-- =============================================================================
-- TABLE 3: tenant_members (user-tenant assignments with roles)
-- =============================================================================
CREATE TABLE tenant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Role & Permissions
  role tenant_role DEFAULT 'member' NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES user_profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, user_id)
);

-- Indexes for tenant_members
CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenant_members_role ON tenant_members(tenant_id, role) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenant_members_active ON tenant_members(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE tenant_members IS 'User membership in tenants with role-based access control';

-- =============================================================================
-- TABLE 4: tenant_organizations (optional organizational metadata)
-- =============================================================================
CREATE TABLE tenant_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Organization Details
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  industry TEXT,
  company_size TEXT,

  -- Contact Information
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,

  -- Tax & Legal
  tax_id TEXT,
  business_registration_number TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(tenant_id)
);

-- Indexes for tenant_organizations
CREATE INDEX idx_tenant_orgs_tenant ON tenant_organizations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenant_orgs_industry ON tenant_organizations(industry) WHERE deleted_at IS NULL;

COMMENT ON TABLE tenant_organizations IS 'Extended organizational information for enterprise tenants';

-- =============================================================================
-- TABLE 5: tenant_usage_tracking (real-time usage metrics)
-- =============================================================================
CREATE TABLE tenant_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Usage Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage Metrics
  active_users INTEGER DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  storage_used_gb NUMERIC(10,2) DEFAULT 0,

  -- Service-Specific Usage
  expert_consultations INTEGER DEFAULT 0,
  panel_discussions INTEGER DEFAULT 0,
  workflow_executions INTEGER DEFAULT 0,

  -- Cost Tracking
  estimated_cost_usd NUMERIC(10,2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(tenant_id, period_start, period_end)
);

-- Indexes for tenant_usage_tracking
CREATE INDEX idx_usage_tenant ON tenant_usage_tracking(tenant_id);
CREATE INDEX idx_usage_period ON tenant_usage_tracking(period_start DESC, period_end DESC);

COMMENT ON TABLE tenant_usage_tracking IS 'Monthly usage tracking for billing and quota enforcement';

-- =============================================================================
-- TABLE 6: api_keys (tenant API authentication)
-- =============================================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Key Details
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "vtal_1234...")

  -- Permissions & Limits
  scopes JSONB DEFAULT '["read"]'::jsonb,
  rate_limit_per_minute INTEGER DEFAULT 60,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for api_keys
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix) WHERE deleted_at IS NULL;
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE api_keys IS 'API authentication keys for programmatic tenant access';

-- =============================================================================
-- CREATE DEFAULT PLATFORM TENANT (Level 0)
-- =============================================================================

INSERT INTO tenants (
  id,
  name,
  slug,
  parent_id,
  tenant_path,
  tenant_level,
  status,
  tier,
  max_users,
  max_agents,
  max_storage_gb,
  max_api_calls_per_month,
  features
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'VITAL.expert Platform',
  'platform',
  NULL,
  'platform',
  0,
  'active',
  'enterprise',
  999999,
  999999,
  999999,
  999999999,
  jsonb_build_object(
    'custom_agents', true,
    'panel_discussions', true,
    'workflow_automation', true,
    'white_label', true,
    'sso', true,
    'api_access', true,
    'unlimited', true
  )
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get all child tenants (recursive)
CREATE OR REPLACE FUNCTION get_child_tenants(parent_tenant_id UUID)
RETURNS TABLE(id UUID, name TEXT, tenant_level INTEGER, tenant_path LTREE)
LANGUAGE SQL STABLE AS $$
  SELECT id, name, tenant_level, tenant_path
  FROM tenants
  WHERE tenant_path <@ (SELECT tenant_path FROM tenants WHERE id = parent_tenant_id)
  AND deleted_at IS NULL
  ORDER BY tenant_path;
$$;

-- Function to get all parent tenants (ancestry)
CREATE OR REPLACE FUNCTION get_parent_tenants(child_tenant_id UUID)
RETURNS TABLE(id UUID, name TEXT, tenant_level INTEGER, tenant_path LTREE)
LANGUAGE SQL STABLE AS $$
  SELECT t.id, t.name, t.tenant_level, t.tenant_path
  FROM tenants t
  WHERE t.tenant_path @> (SELECT tenant_path FROM tenants WHERE id = child_tenant_id)
  AND t.deleted_at IS NULL
  ORDER BY t.tenant_level;
$$;

-- Function to check if user has access to tenant (direct or inherited)
CREATE OR REPLACE FUNCTION user_has_tenant_access(
  p_user_id UUID,
  p_tenant_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL STABLE AS $$
  SELECT EXISTS(
    SELECT 1
    FROM tenant_members tm
    JOIN tenants t ON tm.tenant_id = t.id
    WHERE tm.user_id = p_user_id
    AND tm.is_active = true
    AND tm.deleted_at IS NULL
    AND t.deleted_at IS NULL
    AND (
      -- Direct membership
      t.id = p_tenant_id
      OR
      -- Membership in parent tenant (hierarchical access)
      (SELECT tenant_path FROM tenants WHERE id = p_tenant_id) <@ t.tenant_path
    )
  );
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    tenant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('user_profiles', 'tenants', 'tenant_members', 'tenant_organizations', 'tenant_usage_tracking', 'api_keys');

    SELECT COUNT(*) INTO tenant_count FROM tenants;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 02 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Default tenants: %', tenant_count;
    RAISE NOTICE 'Helper functions: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenant Hierarchy Levels:';
    RAISE NOTICE '  Level 0: Platform (root)';
    RAISE NOTICE '  Level 1: Solution Provider';
    RAISE NOTICE '  Level 2: Enterprise Client';
    RAISE NOTICE '  Level 3: Partner Org';
    RAISE NOTICE '  Level 4: Trial Tenant';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 03 (Solutions & Industries)';
    RAISE NOTICE '';
END $$;
-- =============================================================================
-- PHASE 03: Solutions & Industries Foundation
-- =============================================================================
-- PURPOSE: Create solutions marketplace and industry taxonomy
-- TABLES: 7 tables (industries, solutions, solution_industry_matrix, solution_versions, solution_installations, solution_prompt_suites, services_registry)
-- TIME: ~10 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: industries (pharmaceutical/healthcare taxonomy)
-- =============================================================================
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Hierarchy (optional parent for sub-industries)
  parent_id UUID REFERENCES industries(id) ON DELETE CASCADE,

  -- Metadata
  icon TEXT, -- Icon identifier or emoji
  color TEXT, -- Brand color hex code
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for industries
CREATE INDEX idx_industries_parent ON industries(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_industries_slug ON industries(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_industries_active ON industries(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE industries IS 'Healthcare and pharmaceutical industry taxonomy';

-- =============================================================================
-- TABLE 2: solutions (5 predefined solutions)
-- =============================================================================
CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,

  -- Solution Type
  -- Launch Excellence, Brand Excellence, Strategic Foresight (PULSE), Commercial Excellence, Medical Excellence
  solution_type TEXT NOT NULL,

  -- Status & Visibility
  status solution_status DEFAULT 'development' NOT NULL,
  is_public BOOLEAN DEFAULT false, -- Available in marketplace
  is_featured BOOLEAN DEFAULT false,

  -- Version
  current_version TEXT DEFAULT '1.0.0',

  -- Pricing
  pricing_model TEXT, -- 'free', 'subscription', 'usage_based', 'enterprise'
  base_price_usd NUMERIC(10,2),

  -- Assets
  icon_url TEXT,
  cover_image_url TEXT,
  demo_video_url TEXT,

  -- Metadata
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature descriptions
  benefits JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  install_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for solutions
CREATE INDEX idx_solutions_tenant ON solutions(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_slug ON solutions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_type ON solutions(solution_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_status ON solutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_public ON solutions(is_public) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_featured ON solutions(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_tags ON solutions USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE solutions IS 'Solution packages available in the marketplace (5 predefined solutions)';

-- =============================================================================
-- TABLE 3: solution_industry_matrix (compatibility mapping)
-- =============================================================================
CREATE TABLE solution_industry_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,

  -- Compatibility Score
  compatibility_score DECIMAL(3,2) CHECK (compatibility_score BETWEEN 0 AND 1),
  -- 0.0 = Not compatible, 1.0 = Fully optimized

  -- Customization Required
  requires_customization BOOLEAN DEFAULT false,
  customization_notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, industry_id)
);

-- Indexes for solution_industry_matrix
CREATE INDEX idx_sol_ind_matrix_solution ON solution_industry_matrix(solution_id);
CREATE INDEX idx_sol_ind_matrix_industry ON solution_industry_matrix(industry_id);
CREATE INDEX idx_sol_ind_matrix_score ON solution_industry_matrix(compatibility_score DESC);
CREATE INDEX idx_sol_ind_matrix_active ON solution_industry_matrix(is_active);

COMMENT ON TABLE solution_industry_matrix IS 'Solution-industry compatibility mapping with compatibility scores';

-- =============================================================================
-- TABLE 4: solution_versions (version history)
-- =============================================================================
CREATE TABLE solution_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,

  -- Version Details
  version_number TEXT NOT NULL,
  release_notes TEXT,

  -- Changes
  added_features JSONB DEFAULT '[]'::jsonb,
  removed_features JSONB DEFAULT '[]'::jsonb,
  bug_fixes JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_current BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(solution_id, version_number)
);

-- Indexes for solution_versions
CREATE INDEX idx_sol_versions_solution ON solution_versions(solution_id);
CREATE INDEX idx_sol_versions_current ON solution_versions(is_current) WHERE is_current = true;
CREATE INDEX idx_sol_versions_released ON solution_versions(released_at DESC);

COMMENT ON TABLE solution_versions IS 'Version history and release notes for solutions';

-- =============================================================================
-- TABLE 5: solution_installations (tenant solution assignments)
-- =============================================================================
CREATE TABLE solution_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,

  -- Installation Details
  installed_version TEXT,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  installed_by UUID REFERENCES user_profiles(id),

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,

  -- Customization
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, solution_id)
);

-- Indexes for solution_installations
CREATE INDEX idx_sol_installs_tenant ON solution_installations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sol_installs_solution ON solution_installations(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sol_installs_active ON solution_installations(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_sol_installs_last_used ON solution_installations(last_used_at DESC);

COMMENT ON TABLE solution_installations IS 'Tracks which solutions are installed/assigned to which tenants';

-- =============================================================================
-- TABLE 6: solution_prompt_suites (solution-specific prompt suites)
-- =============================================================================
CREATE TABLE solution_prompt_suites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,

  -- Suite Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'discovery', 'analysis', 'recommendation', 'execution'

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(solution_id, name)
);

-- Indexes for solution_prompt_suites
CREATE INDEX idx_sol_suites_solution ON solution_prompt_suites(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sol_suites_category ON solution_prompt_suites(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_sol_suites_active ON solution_prompt_suites(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE solution_prompt_suites IS 'Prompt suite collections specific to each solution';

-- =============================================================================
-- TABLE 7: services_registry (4 core services configuration)
-- =============================================================================
CREATE TABLE services_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Service Identity
  service_name TEXT NOT NULL, -- 'ask_expert', 'ask_panel', 'workflows', 'solutions_marketplace'
  service_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Status
  is_enabled BOOLEAN DEFAULT true,
  is_beta BOOLEAN DEFAULT false,

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  -- Example config for ask_expert:
  -- {
  --   "max_concurrent_chats": 5,
  --   "default_model": "gpt-4",
  --   "enable_streaming": true,
  --   "max_message_length": 4000
  -- }

  -- Limits
  rate_limit_per_hour INTEGER,
  quota_per_month INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, service_name)
);

-- Indexes for services_registry
CREATE INDEX idx_services_tenant ON services_registry(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_name ON services_registry(service_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_enabled ON services_registry(is_enabled) WHERE deleted_at IS NULL;

COMMENT ON TABLE services_registry IS 'Configuration registry for 4 core services: Ask Expert, Ask Panel, Workflows, Solutions Marketplace';

-- =============================================================================
-- SEED DATA: Industries (6 healthcare/pharma industries)
-- =============================================================================

INSERT INTO industries (id, name, slug, description, icon, color, sort_order, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Pharmaceutical', 'pharmaceutical', 'Traditional pharmaceutical companies developing small molecule drugs', '💊', '#0066CC', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'Biotechnology', 'biotechnology', 'Biotech companies developing biologics and advanced therapies', '🧬', '#00AA66', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Medical Devices', 'medical-devices', 'Medical device and equipment manufacturers', '🏥', '#CC0066', 3, true),
  ('10000000-0000-0000-0000-000000000004', 'Healthcare Payers', 'healthcare-payers', 'Insurance companies, managed care organizations, PBMs', '🏦', '#6600CC', 4, true),
  ('10000000-0000-0000-0000-000000000005', 'Digital Health', 'digital-health', 'Digital therapeutics, telehealth, health tech startups', '📱', '#FF6600', 5, true),
  ('10000000-0000-0000-0000-000000000006', 'Healthcare Consulting', 'healthcare-consulting', 'Management consulting firms serving healthcare', '📊', '#0099CC', 6, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED DATA: Platform Services Registry (4 core services)
-- =============================================================================

INSERT INTO services_registry (id, tenant_id, service_name, service_slug, display_name, description, is_enabled, config) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'ask_expert',
    'ask-expert',
    'Ask an Expert',
    '1:1 AI consultant conversations for personalized advice',
    true,
    jsonb_build_object(
      'max_concurrent_chats', 10,
      'default_model', 'gpt-4',
      'enable_streaming', true,
      'max_message_length', 4000,
      'enable_attachments', true
    )
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'ask_panel',
    'ask-panel',
    'Ask a Panel',
    'Multi-agent panel discussions with diverse expert perspectives',
    true,
    jsonb_build_object(
      'min_panel_size', 3,
      'max_panel_size', 7,
      'default_rounds', 2,
      'enable_voting', true,
      'enable_consensus', true
    )
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'workflows',
    'workflows',
    'Workflows',
    'Multi-step automated processes with task orchestration',
    true,
    jsonb_build_object(
      'max_concurrent_workflows', 5,
      'enable_scheduling', true,
      'enable_approvals', true,
      'max_steps_per_workflow', 50
    )
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'solutions_marketplace',
    'solutions',
    'Solutions Marketplace',
    'Pre-packaged solutions for specific use cases',
    true,
    jsonb_build_object(
      'allow_custom_solutions', true,
      'require_approval', false,
      'enable_ratings', true
    )
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    industry_count INTEGER;
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('industries', 'solutions', 'solution_industry_matrix', 'solution_versions', 'solution_installations', 'solution_prompt_suites', 'services_registry');

    SELECT COUNT(*) INTO industry_count FROM industries;
    SELECT COUNT(*) INTO service_count FROM services_registry;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 03 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Industries seeded: %', industry_count;
    RAISE NOTICE 'Services registered: %', service_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Industries: Pharmaceutical, Biotechnology, Medical Devices, Healthcare Payers, Digital Health, Healthcare Consulting';
    RAISE NOTICE 'Services: Ask Expert, Ask Panel, Workflows, Solutions Marketplace';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 04 (Organizational Hierarchy)';
    RAISE NOTICE '';
END $$;
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
