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
