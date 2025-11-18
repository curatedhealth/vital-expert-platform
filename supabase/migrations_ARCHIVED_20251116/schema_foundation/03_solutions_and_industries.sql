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
