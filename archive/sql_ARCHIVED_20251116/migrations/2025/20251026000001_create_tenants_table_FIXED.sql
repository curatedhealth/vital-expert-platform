-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT FOUNDATION (FIXED - NO CIRCULAR DEPENDENCIES)
-- Migration: Create Tenants Table
-- Version: 1.0.1 (FIXED)
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
-- 1. CREATE TENANTS TABLE (NO RLS YET)
-- ============================================================================

-- Drop existing tables if they exist (safe for migration)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_tenants CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Create comprehensive tenants table
CREATE TABLE tenants (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,

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
    resource_access_config JSONB DEFAULT '{}'::jsonb,
    branding JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '{}'::jsonb,
    config JSONB DEFAULT '{}'::jsonb,

    -- Compliance & Security
    hipaa_compliant BOOLEAN DEFAULT false,
    gdpr_compliant BOOLEAN DEFAULT false,
    sox_compliant BOOLEAN DEFAULT false,
    data_residency VARCHAR(50),
    encryption_enabled BOOLEAN DEFAULT true,

    -- Business Metadata
    industry VARCHAR(100),
    company_size VARCHAR(50),
    country_code VARCHAR(2),
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    billing_email VARCHAR(255),

    -- Usage Limits & Quotas
    quotas JSONB DEFAULT '{}'::jsonb,

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

    -- Metadata
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
-- 2. CREATE SUPPORTING TABLES (BEFORE RLS POLICIES)
-- ============================================================================

-- User-Tenant Association Table
CREATE TABLE user_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID,
    UNIQUE(user_id, tenant_id)
);

-- User Roles Table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('platform_admin', 'platform_support', 'tenant_admin', 'tenant_owner', 'user')),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    granted_by UUID,
    UNIQUE(user_id, role, tenant_id)
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenants indexes
CREATE INDEX idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_domain ON tenants(domain) WHERE deleted_at IS NULL AND domain IS NOT NULL;
CREATE INDEX idx_tenants_type ON tenants(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id) WHERE deleted_at IS NULL AND parent_tenant_id IS NOT NULL;

-- User-tenants indexes
CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);
CREATE INDEX idx_user_tenants_status ON user_tenants(status);

-- User-roles indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id) WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- 4. CREATE UPDATE TRIGGER
-- ============================================================================

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

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS (BEFORE RLS POLICIES)
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
-- 6. CREATE ROW LEVEL SECURITY (RLS) POLICIES (AFTER TABLES & FUNCTIONS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "tenants_platform_admin_all" ON tenants
    FOR ALL
    TO authenticated
    USING (
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

CREATE POLICY "tenants_public_info" ON tenants
    FOR SELECT
    TO authenticated
    USING (
        status = 'active'
        AND deleted_at IS NULL
    );

-- User-tenants policies
CREATE POLICY "user_tenants_own_access" ON user_tenants
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- User-roles policies
CREATE POLICY "user_roles_own_access" ON user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant foundation table supporting 4 tenant types: client, solution, industry, platform';
COMMENT ON COLUMN tenants.type IS 'Tenant type: client (enterprise), solution (apps), industry (verticals), platform (super admin)';
COMMENT ON COLUMN tenants.slug IS 'URL-safe identifier for tenant';
COMMENT ON COLUMN tenants.domain IS 'Custom domain for tenant';
COMMENT ON TABLE user_tenants IS 'Many-to-many relationship between users and tenants';
COMMENT ON TABLE user_roles IS 'Platform-level and tenant-level role assignments';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20251026000001 (FIXED) completed successfully';
    RAISE NOTICE '   Created tables: tenants, user_tenants, user_roles';
    RAISE NOTICE '   Created functions: get_super_admin_tenant_id, is_platform_admin, has_tenant_access, get_tenant_by_domain, get_tenant_by_slug';
    RAISE NOTICE '   Created RLS policies for all tables';
    RAISE NOTICE '   Next step: Run 20251026000002_add_tenant_columns_to_resources.sql';
END $$;
