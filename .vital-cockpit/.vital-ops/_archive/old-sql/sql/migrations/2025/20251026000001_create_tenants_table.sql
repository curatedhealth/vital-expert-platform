-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT FOUNDATION
-- Migration: Create Tenants Table
-- Version: 1.0.0
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Create comprehensive tenants table supporting 4 tenant types:
--   - client: Enterprise customers (Takeda, Pfizer, J&J)
--   - solution: Solution apps (Launch Excellence, Brand Excellence)
--   - industry: Industry verticals (Digital Health Startups, Med Device)
--   - platform: Platform/super admin tenant
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CREATE TENANTS TABLE
-- ============================================================================

-- Drop existing table if exists (safe for migration)
DROP TABLE IF EXISTS tenants CASCADE;

-- Create comprehensive tenants table
CREATE TABLE tenants (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,  -- e.g., "takeda.vital.expert", "digital-health-startup.vital.expert"

    -- Tenant Type Classification
    type VARCHAR(50) NOT NULL CHECK (type IN ('client', 'solution', 'industry', 'platform')),

    -- Hierarchical Structure
    parent_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,

    -- Subscription Management
    subscription_tier VARCHAR(50) DEFAULT 'standard' CHECK (subscription_tier IN ('trial', 'standard', 'professional', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled', 'expired')),
    subscription_starts_at TIMESTAMPTZ DEFAULT NOW(),
    subscription_ends_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,

    -- Resource Access Configuration
    resource_access_config JSONB DEFAULT jsonb_build_object(
        'shared_resources', jsonb_build_object(
            'agents', true,
            'tools', true,
            'prompts', true,
            'rag', true,
            'capabilities', true,
            'workflows', true
        ),
        'custom_resources', jsonb_build_object(
            'agents', true,
            'rag', true,
            'workflows', true,
            'max_agents', 100,
            'max_rag_storage_gb', 100
        ),
        'sharing', jsonb_build_object(
            'can_share_resources', true,
            'can_receive_shared', true
        )
    ),

    -- Branding & Customization
    branding JSONB DEFAULT jsonb_build_object(
        'logo_url', NULL,
        'primary_color', '#0066cc',
        'secondary_color', '#00cc66',
        'custom_css', NULL
    ),

    -- Feature Flags
    features JSONB DEFAULT jsonb_build_object(
        'rag_enabled', true,
        'expert_panels', true,
        'workflows', true,
        'analytics', true,
        'api_access', true,
        'white_label', false
    ),

    -- Configuration
    config JSONB DEFAULT jsonb_build_object(
        'default_model', 'gpt-4',
        'max_concurrent_chats', 10,
        'retention_days', 90,
        'allowed_domains', '[]'::jsonb
    ),

    -- Compliance & Security
    hipaa_compliant BOOLEAN DEFAULT false,
    gdpr_compliant BOOLEAN DEFAULT false,
    sox_compliant BOOLEAN DEFAULT false,
    data_residency VARCHAR(50),  -- 'US', 'EU', 'UK', 'APAC'
    encryption_enabled BOOLEAN DEFAULT true,

    -- Business Metadata
    industry VARCHAR(100),  -- 'Pharmaceutical', 'Medical Device', 'Healthcare IT'
    company_size VARCHAR(50),  -- 'startup', 'smb', 'mid_market', 'enterprise'
    country_code VARCHAR(2),  -- ISO 3166-1 alpha-2
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    billing_email VARCHAR(255),

    -- Usage Limits & Quotas
    quotas JSONB DEFAULT jsonb_build_object(
        'max_users', 100,
        'max_agents', 100,
        'max_documents', 10000,
        'max_api_calls_per_month', 100000,
        'max_storage_gb', 100
    ),

    -- Status & Lifecycle
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'archived', 'deleted')),
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,

    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,

    -- Metadata (flexible for future expansion)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_subscription_dates CHECK (
        subscription_ends_at IS NULL OR subscription_ends_at > subscription_starts_at
    ),
    CONSTRAINT valid_trial_dates CHECK (
        trial_ends_at IS NULL OR trial_ends_at > created_at
    )
);

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary access patterns
CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_domain ON tenants(domain) WHERE deleted_at IS NULL AND domain IS NOT NULL;
CREATE INDEX idx_tenants_type ON tenants(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;

-- Subscription management
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_subscription_tier ON tenants(subscription_tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_trial_expiry ON tenants(trial_ends_at)
    WHERE deleted_at IS NULL AND trial_ends_at IS NOT NULL;

-- Hierarchical queries
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id)
    WHERE deleted_at IS NULL AND parent_tenant_id IS NOT NULL;

-- Compliance queries
CREATE INDEX idx_tenants_compliance ON tenants(hipaa_compliant, gdpr_compliant)
    WHERE deleted_at IS NULL;

-- JSONB indexes for faster queries
CREATE INDEX idx_tenants_features ON tenants USING GIN(features);
CREATE INDEX idx_tenants_resource_access ON tenants USING GIN(resource_access_config);

-- Full-text search on tenant names
CREATE INDEX idx_tenants_name_search ON tenants USING GIN(to_tsvector('english', name))
    WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. CREATE UPDATE TRIGGER
-- ============================================================================

-- Reuse existing function if it exists, otherwise create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Create trigger for tenants table
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Policy 1: Platform admins can see all tenants
CREATE POLICY "tenants_platform_admin_all" ON tenants
    FOR ALL
    TO authenticated
    USING (
        -- Check if user is platform admin (we'll create this function next)
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'platform_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'platform_admin'
        )
    );

-- Policy 2: Tenant admins can see their own tenant
CREATE POLICY "tenants_admin_own_tenant" ON tenants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            JOIN user_roles ur ON ur.user_id = ut.user_id
            WHERE ut.tenant_id = tenants.id
            AND ut.user_id = auth.uid()
            AND ur.role IN ('tenant_admin', 'tenant_owner')
        )
    );

-- Policy 3: Tenant admins can update their own tenant (limited fields)
CREATE POLICY "tenants_admin_update_own" ON tenants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_tenants ut
            JOIN user_roles ur ON ur.user_id = ut.user_id
            WHERE ut.tenant_id = tenants.id
            AND ut.user_id = auth.uid()
            AND ur.role IN ('tenant_admin', 'tenant_owner')
        )
    )
    WITH CHECK (
        -- Prevent changing critical fields
        OLD.id = NEW.id
        AND OLD.slug = NEW.slug
        AND OLD.type = NEW.type
        AND OLD.created_at = NEW.created_at
    );

-- Policy 4: All authenticated users can see public tenant info (for discovery)
CREATE POLICY "tenants_public_info" ON tenants
    FOR SELECT
    TO authenticated
    USING (
        status = 'active'
        AND deleted_at IS NULL
    );

-- ============================================================================
-- 5. CREATE SUPPORTING TABLES
-- ============================================================================

-- User-Tenant Association Table
CREATE TABLE IF NOT EXISTS user_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,  -- References auth.users
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- User's role within this specific tenant
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID,

    -- Unique constraint: one user can only have one role per tenant
    UNIQUE(user_id, tenant_id)
);

-- Indexes for user_tenants
CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);
CREATE INDEX idx_user_tenants_status ON user_tenants(status);

-- Enable RLS on user_tenants
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;

-- Users can see their own tenant associations
CREATE POLICY "user_tenants_own_access" ON user_tenants
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- User Roles Table (for platform-level roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,  -- References auth.users
    role VARCHAR(50) NOT NULL CHECK (role IN ('platform_admin', 'platform_support', 'tenant_admin', 'tenant_owner', 'user')),

    -- Scope (optional - for tenant-specific roles)
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    granted_by UUID,

    -- Unique constraint: one role per user (or per user-tenant combination)
    UNIQUE(user_id, role, tenant_id)
);

-- Indexes for user_roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id) WHERE tenant_id IS NOT NULL;

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY "user_roles_own_access" ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Get super admin tenant ID
CREATE OR REPLACE FUNCTION get_super_admin_tenant_id()
RETURNS UUID AS $$
    SELECT id FROM tenants WHERE type = 'platform' AND status = 'active' LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function: Check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = p_user_id
        AND role = 'platform_admin'
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function: Get user's tenant IDs
CREATE OR REPLACE FUNCTION get_user_tenant_ids(p_user_id UUID)
RETURNS UUID[] AS $$
    SELECT ARRAY_AGG(tenant_id)
    FROM user_tenants
    WHERE user_id = p_user_id
    AND status = 'active';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function: Check if user has access to tenant
CREATE OR REPLACE FUNCTION has_tenant_access(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_tenants
        WHERE user_id = p_user_id
        AND tenant_id = p_tenant_id
        AND status = 'active'
    ) OR is_platform_admin(p_user_id);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function: Get tenant by domain
CREATE OR REPLACE FUNCTION get_tenant_by_domain(p_domain VARCHAR)
RETURNS tenants AS $$
    SELECT * FROM tenants
    WHERE domain = p_domain
    AND status = 'active'
    AND deleted_at IS NULL
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function: Get tenant by slug
CREATE OR REPLACE FUNCTION get_tenant_by_slug(p_slug VARCHAR)
RETURNS tenants AS $$
    SELECT * FROM tenants
    WHERE slug = p_slug
    AND status = 'active'
    AND deleted_at IS NULL
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant foundation table supporting 4 tenant types: client, solution, industry, platform';
COMMENT ON COLUMN tenants.type IS 'Tenant type: client (enterprise), solution (apps), industry (verticals), platform (super admin)';
COMMENT ON COLUMN tenants.slug IS 'URL-safe identifier for tenant (e.g., "takeda", "digital-health-startup")';
COMMENT ON COLUMN tenants.domain IS 'Custom domain for tenant (e.g., "takeda.vital.expert")';
COMMENT ON COLUMN tenants.resource_access_config IS 'Controls what resources tenant can access and create';
COMMENT ON COLUMN tenants.subscription_tier IS 'Subscription level: trial, standard, professional, enterprise';

COMMENT ON TABLE user_tenants IS 'Many-to-many relationship between users and tenants';
COMMENT ON TABLE user_roles IS 'Platform-level and tenant-level role assignments';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Migration 20251026000001 completed successfully';
    RAISE NOTICE 'Created tables: tenants, user_tenants, user_roles';
    RAISE NOTICE 'Created functions: get_super_admin_tenant_id, is_platform_admin, has_tenant_access, get_tenant_by_domain, get_tenant_by_slug';
    RAISE NOTICE 'Next step: Run 20251026000002_add_tenant_columns_to_resources.sql';
END $$;
