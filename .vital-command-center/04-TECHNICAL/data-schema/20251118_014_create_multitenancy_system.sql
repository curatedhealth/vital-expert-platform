-- ============================================================================
-- MULTITENANCY SYSTEM FOR VITAL EXPERT PLATFORM MVP
-- ============================================================================
-- Three-tenant MVP:
-- 1. VITAL Expert Platform (system/admin tenant) - Full features
-- 2. Digital Health - Digital health apps & agents
-- 3. Pharmaceuticals - Pharma-specific features & compliance
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TENANTS TABLE (extends organizations)
-- ============================================================================
-- We'll use the existing `organizations` table as our tenant base
-- and add tenant-specific metadata via the settings jsonb column

-- Add tenant_type column to organizations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'tenant_type'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN tenant_type VARCHAR(50) DEFAULT 'standard'
        CHECK (tenant_type IN ('system', 'digital_health', 'pharmaceuticals', 'standard'));
    END IF;
END$$;

-- Add tenant_key column for unique tenant identification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'tenant_key'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN tenant_key VARCHAR(100) UNIQUE;
    END IF;
END$$;

-- Add is_active column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END$$;

-- ============================================================================
-- FEATURE FLAGS TABLE
-- ============================================================================
-- Global feature flag definitions
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'apps', 'agents', 'compliance', 'analytics', 'ui'
    default_enabled BOOLEAN DEFAULT false,

    -- Tier availability
    available_tiers TEXT[] DEFAULT ARRAY['enterprise'], -- Which subscription tiers can access

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TENANT FEATURE FLAGS TABLE (Per-Tenant Overrides)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,

    -- Override value
    enabled BOOLEAN NOT NULL,

    -- Optional configuration for this feature
    config JSONB DEFAULT '{}',

    -- Metadata
    notes TEXT,
    enabled_by UUID, -- User who enabled/disabled

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, feature_flag_id)
);

-- ============================================================================
-- TENANT APPS TABLE
-- ============================================================================
-- Defines which apps/routes are visible and enabled per tenant
CREATE TABLE IF NOT EXISTS public.tenant_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- App identification
    app_key VARCHAR(100) NOT NULL, -- 'dashboard', 'chat', 'agents', 'knowledge', etc.
    app_name VARCHAR(255) NOT NULL,
    app_description TEXT,
    app_route VARCHAR(255), -- '/dashboard', '/chat', etc.
    app_icon VARCHAR(100),

    -- Visibility & access
    is_visible BOOLEAN DEFAULT true,
    is_enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    -- Access control
    required_role VARCHAR(50), -- 'admin', 'user', 'viewer', null (all)

    -- Configuration
    config JSONB DEFAULT '{}', -- App-specific config

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, app_key)
);

-- ============================================================================
-- TENANT CONFIGURATIONS TABLE
-- ============================================================================
-- Detailed tenant-specific configurations
CREATE TABLE IF NOT EXISTS public.tenant_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- UI/Branding Configuration
    ui_config JSONB DEFAULT '{
        "theme": "default",
        "primary_color": "#4F46E5",
        "logo_url": null,
        "favicon_url": null,
        "custom_css": null
    }',

    -- Feature Configuration
    enabled_features TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of feature_flag keys
    disabled_features TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- App Configuration
    enabled_apps TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of app_keys
    app_settings JSONB DEFAULT '{}', -- App-specific settings

    -- Agent Configuration
    enabled_agent_tiers INTEGER[] DEFAULT ARRAY[1, 2, 3], -- Which tiers of agents are available
    enabled_knowledge_domains TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which knowledge domains
    agent_settings JSONB DEFAULT '{}',

    -- Resource Limits
    limits JSONB DEFAULT '{
        "max_agents": 100,
        "max_conversations": 1000,
        "max_documents": 500,
        "max_storage_mb": 5000,
        "max_api_calls_per_day": 10000
    }',

    -- Compliance & Security
    compliance_settings JSONB DEFAULT '{
        "hipaa_enabled": false,
        "gdpr_enabled": true,
        "phi_allowed": false,
        "pii_allowed": true,
        "audit_logging": true,
        "data_retention_days": 365,
        "right_to_erasure": true,
        "data_portability": true,
        "consent_management": true
    }',

    -- Integration Settings
    integrations JSONB DEFAULT '{}',

    -- Custom Settings
    custom_settings JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TENANT AGENT ASSIGNMENTS TABLE
-- ============================================================================
-- Maps which agents are available to which tenants
CREATE TABLE IF NOT EXISTS public.tenant_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,

    -- Access control
    is_enabled BOOLEAN DEFAULT true,

    -- Custom agent configuration for this tenant
    custom_config JSONB DEFAULT '{}',

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, agent_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_type ON public.organizations(tenant_type);
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_key ON public.organizations(tenant_key);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON public.feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_active ON public.feature_flags(is_active);

-- Tenant feature flags indexes
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant ON public.tenant_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_flag ON public.tenant_feature_flags(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_enabled ON public.tenant_feature_flags(enabled);

-- Tenant apps indexes
CREATE INDEX IF NOT EXISTS idx_tenant_apps_tenant ON public.tenant_apps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_key ON public.tenant_apps(app_key);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_visible ON public.tenant_apps(is_visible);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_enabled ON public.tenant_apps(is_enabled);

-- Tenant configurations indexes
CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant ON public.tenant_configurations(tenant_id);

-- Tenant agents indexes
CREATE INDEX IF NOT EXISTS idx_tenant_agents_tenant ON public.tenant_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_agents_agent ON public.tenant_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_tenant_agents_enabled ON public.tenant_agents(is_enabled);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can read their organization" ON public.organizations;
DROP POLICY IF EXISTS "Service role full access to feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Users can read active feature_flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Service role full access to tenant_feature_flags" ON public.tenant_feature_flags;
DROP POLICY IF EXISTS "Service role full access to tenant_apps" ON public.tenant_apps;
DROP POLICY IF EXISTS "Service role full access to tenant_configurations" ON public.tenant_configurations;
DROP POLICY IF EXISTS "Service role full access to tenant_agents" ON public.tenant_agents;

-- Organizations policies
CREATE POLICY "Service role full access to organizations"
    ON public.organizations FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Feature flags policies
CREATE POLICY "Service role full access to feature_flags"
    ON public.feature_flags FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can read active feature_flags"
    ON public.feature_flags FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Tenant feature flags policies
CREATE POLICY "Service role full access to tenant_feature_flags"
    ON public.tenant_feature_flags FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Tenant apps policies
CREATE POLICY "Service role full access to tenant_apps"
    ON public.tenant_apps FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Tenant configurations policies
CREATE POLICY "Service role full access to tenant_configurations"
    ON public.tenant_configurations FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- Tenant agents policies
CREATE POLICY "Service role full access to tenant_agents"
    ON public.tenant_agents FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get tenant configuration
CREATE OR REPLACE FUNCTION get_tenant_config(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_config JSONB;
BEGIN
    SELECT to_jsonb(tc.*) INTO v_config
    FROM tenant_configurations tc
    WHERE tc.tenant_id = p_tenant_id;

    RETURN v_config;
END;
$$;

-- Function to check if feature is enabled for tenant
CREATE OR REPLACE FUNCTION is_feature_enabled(p_tenant_id UUID, p_feature_key VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_default_enabled BOOLEAN;
BEGIN
    -- Check for tenant-specific override
    SELECT tff.enabled INTO v_enabled
    FROM tenant_feature_flags tff
    JOIN feature_flags ff ON tff.feature_flag_id = ff.id
    WHERE tff.tenant_id = p_tenant_id
    AND ff.flag_key = p_feature_key;

    -- If override exists, return it
    IF FOUND THEN
        RETURN v_enabled;
    END IF;

    -- Otherwise, return default from feature_flags
    SELECT default_enabled INTO v_default_enabled
    FROM feature_flags
    WHERE flag_key = p_feature_key
    AND is_active = true;

    RETURN COALESCE(v_default_enabled, false);
END;
$$;

-- Function to get enabled apps for tenant
CREATE OR REPLACE FUNCTION get_tenant_apps(p_tenant_id UUID)
RETURNS TABLE (
    app_key VARCHAR,
    app_name VARCHAR,
    app_route VARCHAR,
    app_icon VARCHAR,
    display_order INTEGER,
    config JSONB
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        ta.app_key,
        ta.app_name,
        ta.app_route,
        ta.app_icon,
        ta.display_order,
        ta.config
    FROM tenant_apps ta
    WHERE ta.tenant_id = p_tenant_id
    AND ta.is_visible = true
    AND ta.is_enabled = true
    ORDER BY ta.display_order, ta.app_name;
$$;

-- Function to get enabled agents for tenant
CREATE OR REPLACE FUNCTION get_tenant_agents(p_tenant_id UUID)
RETURNS TABLE (
    agent_id UUID,
    agent_name VARCHAR,
    agent_tier INTEGER,
    agent_domains TEXT[]
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        a.id as agent_id,
        a.name as agent_name,
        a.tier as agent_tier,
        a.knowledge_domains as agent_domains
    FROM tenant_agents ta
    JOIN agents a ON ta.agent_id = a.id
    WHERE ta.tenant_id = p_tenant_id
    AND ta.is_enabled = true
    AND a.status = 'active'
    ORDER BY a.tier, a.name;
$$;

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_feature_flags_updated_at ON public.tenant_feature_flags;
CREATE TRIGGER update_tenant_feature_flags_updated_at
    BEFORE UPDATE ON public.tenant_feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_apps_updated_at ON public.tenant_apps;
CREATE TRIGGER update_tenant_apps_updated_at
    BEFORE UPDATE ON public.tenant_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_configurations_updated_at ON public.tenant_configurations;
CREATE TRIGGER update_tenant_configurations_updated_at
    BEFORE UPDATE ON public.tenant_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_agents_updated_at ON public.tenant_agents;
CREATE TRIGGER update_tenant_agents_updated_at
    BEFORE UPDATE ON public.tenant_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.feature_flags IS 'Global feature flag definitions for platform-wide features';
COMMENT ON TABLE public.tenant_feature_flags IS 'Per-tenant feature flag overrides';
COMMENT ON TABLE public.tenant_apps IS 'Defines which apps/routes are visible and enabled per tenant';
COMMENT ON TABLE public.tenant_configurations IS 'Detailed tenant-specific configurations including UI, features, limits, and compliance';
COMMENT ON TABLE public.tenant_agents IS 'Maps which agents are available to which tenants';

COMMENT ON COLUMN public.organizations.tenant_type IS 'Type of tenant: system (VITAL), digital_health, pharmaceuticals, or standard';
COMMENT ON COLUMN public.organizations.tenant_key IS 'Unique identifier key for the tenant (e.g., vital-system, digital-health, pharma)';
COMMENT ON COLUMN public.feature_flags.available_tiers IS 'Which subscription tiers can access this feature';
COMMENT ON COLUMN public.tenant_configurations.ui_config IS 'UI/branding configuration (theme, colors, logo, etc.)';
COMMENT ON COLUMN public.tenant_configurations.limits IS 'Resource usage limits for the tenant';
COMMENT ON COLUMN public.tenant_configurations.compliance_settings IS 'HIPAA and other compliance settings';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Multitenancy System created successfully!';
    RAISE NOTICE '   - Tables: feature_flags, tenant_feature_flags, tenant_apps, tenant_configurations, tenant_agents';
    RAISE NOTICE '   - Organizations table enhanced with tenant_type and tenant_key';
    RAISE NOTICE '   - Helper Functions: get_tenant_config(), is_feature_enabled(), get_tenant_apps(), get_tenant_agents()';
    RAISE NOTICE '   - Ready for seed data migration';
END $$;
