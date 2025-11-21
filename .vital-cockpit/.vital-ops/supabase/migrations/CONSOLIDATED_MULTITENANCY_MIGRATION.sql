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
    agent_name VARCHAR
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        a.id as agent_id,
        a.name as agent_name
    FROM tenant_agents ta
    JOIN agents a ON ta.agent_id = a.id
    WHERE ta.tenant_id = p_tenant_id
    AND ta.is_enabled = true
    ORDER BY a.name;
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
-- ============================================================================
-- SEED DATA FOR VITAL EXPERT PLATFORM MVP TENANTS
-- ============================================================================
-- Three MVP Tenants:
-- 1. VITAL Expert Platform (system tenant) - Full features
-- 2. Digital Health - Digital health apps & agents
-- 3. Pharmaceuticals - Pharma-specific features & compliance
-- ============================================================================

-- ============================================================================
-- 1. CREATE THREE MVP TENANTS (Organizations)
-- ============================================================================

-- VITAL Expert Platform (System Tenant)
INSERT INTO public.organizations (
    name, slug, tenant_type, tenant_key,
    subscription_tier, subscription_status,
    is_active, settings, metadata
) VALUES (
    'VITAL Expert Platform',
    'vital-system',
    'system',
    'vital-system',
    'enterprise',
    'active',
    true,
    '{
        "description": "Multi-tenant admin and system platform",
        "contact_email": "admin@vitalpath.com",
        "website": "https://vitalpath.com"
    }',
    '{
        "is_system_tenant": true,
        "has_full_access": true,
        "can_manage_tenants": true
    }'
) ON CONFLICT (slug) DO UPDATE SET
    tenant_type = EXCLUDED.tenant_type,
    tenant_key = EXCLUDED.tenant_key,
    is_active = EXCLUDED.is_active;

-- Digital Health Tenant
INSERT INTO public.organizations (
    name, slug, tenant_type, tenant_key,
    subscription_tier, subscription_status,
    max_projects, max_users,
    is_active, settings, metadata
) VALUES (
    'Digital Health',
    'digital-health',
    'digital_health',
    'digital-health',
    'professional',
    'active',
    10,
    20,
    true,
    '{
        "description": "Digital health innovation platform",
        "focus_areas": ["digital_therapeutics", "remote_monitoring", "patient_engagement"],
        "contact_email": "info@digitalhealth.com"
    }',
    '{
        "industry": "digital_health",
        "primary_use_case": "digital_health_innovation"
    }'
) ON CONFLICT (slug) DO UPDATE SET
    tenant_type = EXCLUDED.tenant_type,
    tenant_key = EXCLUDED.tenant_key,
    is_active = EXCLUDED.is_active;

-- Pharmaceuticals Tenant
INSERT INTO public.organizations (
    name, slug, tenant_type, tenant_key,
    subscription_tier, subscription_status,
    max_projects, max_users,
    is_active, settings, metadata
) VALUES (
    'Pharmaceuticals',
    'pharmaceuticals',
    'pharmaceuticals',
    'pharma',
    'enterprise',
    'active',
    20,
    50,
    true,
    '{
        "description": "Pharmaceutical development and compliance platform",
        "focus_areas": ["regulatory_affairs", "clinical_development", "pharmacovigilance"],
        "contact_email": "compliance@pharma.com"
    }',
    '{
        "industry": "pharmaceuticals",
        "primary_use_case": "pharma_development",
        "compliance_required": true
    }'
) ON CONFLICT (slug) DO UPDATE SET
    tenant_type = EXCLUDED.tenant_type,
    tenant_key = EXCLUDED.tenant_key,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- 2. CREATE FEATURE FLAGS
-- ============================================================================

-- Core App Features
INSERT INTO public.feature_flags (flag_key, name, description, category, default_enabled, available_tiers) VALUES
('app_dashboard', 'Dashboard', 'Main dashboard app', 'apps', true, ARRAY['starter', 'professional', 'enterprise']),
('app_chat', 'Expert Chat', 'Chat with AI experts', 'apps', true, ARRAY['starter', 'professional', 'enterprise']),
('app_agents', 'Agent Management', 'Create and manage AI agents', 'apps', true, ARRAY['professional', 'enterprise']),
('app_knowledge', 'Knowledge Base', 'Document upload and RAG', 'apps', true, ARRAY['professional', 'enterprise']),
('app_ask_panel', 'Ask Panel', 'Multi-expert panel consultation', 'apps', true, ARRAY['enterprise']),
('app_solution_builder', 'Solution Builder', 'Build custom solutions', 'apps', true, ARRAY['professional', 'enterprise']),
('app_jtbd', 'Jobs-to-be-Done', 'JTBD analysis', 'apps', true, ARRAY['professional', 'enterprise']),
('app_prism', 'Prompt PRISM', 'Prompt engineering tool', 'apps', true, ARRAY['professional', 'enterprise']),
('app_capabilities', 'Capabilities', 'Capability management', 'apps', true, ARRAY['enterprise']),
('app_knowledge_domains', 'Knowledge Domains', 'Domain configuration', 'apps', true, ARRAY['enterprise']),
('app_patterns', 'Patterns', 'Design patterns library', 'apps', true, ARRAY['professional', 'enterprise'])
ON CONFLICT (flag_key) DO NOTHING;

-- Agent Features
INSERT INTO public.feature_flags (flag_key, name, description, category, default_enabled, available_tiers) VALUES
('agents_tier_1', 'Tier 1 Agents', 'Access to Tier 1 (Core) agents', 'agents', true, ARRAY['enterprise']),
('agents_tier_2', 'Tier 2 Agents', 'Access to Tier 2 (Specialized) agents', 'agents', true, ARRAY['professional', 'enterprise']),
('agents_tier_3', 'Tier 3 Agents', 'Access to Tier 3 (Emerging) agents', 'agents', true, ARRAY['starter', 'professional', 'enterprise']),
('agents_custom_creation', 'Custom Agent Creation', 'Create custom agents', 'agents', false, ARRAY['professional', 'enterprise']),
('agents_collaboration', 'Agent Collaboration', 'Multi-agent workflows', 'agents', false, ARRAY['enterprise'])
ON CONFLICT (flag_key) DO NOTHING;

-- Knowledge Domain Features
INSERT INTO public.feature_flags (flag_key, name, description, category, default_enabled, available_tiers) VALUES
('domain_regulatory_affairs', 'Regulatory Affairs', 'Regulatory affairs domain', 'domains', true, ARRAY['professional', 'enterprise']),
('domain_clinical_development', 'Clinical Development', 'Clinical development domain', 'domains', true, ARRAY['professional', 'enterprise']),
('domain_pharmacovigilance', 'Pharmacovigilance', 'Pharmacovigilance domain', 'domains', true, ARRAY['enterprise']),
('domain_digital_health', 'Digital Health', 'Digital health domain', 'domains', true, ARRAY['professional', 'enterprise']),
('domain_medical_devices', 'Medical Devices', 'Medical devices domain', 'domains', true, ARRAY['professional', 'enterprise']),
('domain_precision_medicine', 'Precision Medicine', 'Precision medicine domain', 'domains', true, ARRAY['enterprise']),
('domain_ai_ml_healthcare', 'AI/ML in Healthcare', 'AI/ML healthcare domain', 'domains', true, ARRAY['professional', 'enterprise'])
ON CONFLICT (flag_key) DO NOTHING;

-- Compliance Features
INSERT INTO public.feature_flags (flag_key, name, description, category, default_enabled, available_tiers) VALUES
('compliance_hipaa', 'HIPAA Compliance', 'HIPAA compliance features', 'compliance', false, ARRAY['enterprise']),
('compliance_gdpr', 'GDPR Compliance', 'GDPR compliance features', 'compliance', true, ARRAY['starter', 'professional', 'enterprise']),
('compliance_audit_logging', 'Audit Logging', 'Comprehensive audit logging', 'compliance', true, ARRAY['professional', 'enterprise']),
('compliance_phi_protection', 'PHI Protection', 'Protected health information safeguards', 'compliance', false, ARRAY['enterprise']),
('compliance_pii_protection', 'PII Protection', 'Personally identifiable information safeguards', 'compliance', true, ARRAY['starter', 'professional', 'enterprise']),
('compliance_data_retention', 'Data Retention', 'Custom data retention policies', 'compliance', true, ARRAY['professional', 'enterprise']),
('compliance_right_to_erasure', 'Right to Erasure', 'GDPR right to be forgotten', 'compliance', true, ARRAY['starter', 'professional', 'enterprise']),
('compliance_data_portability', 'Data Portability', 'GDPR data export/portability', 'compliance', true, ARRAY['starter', 'professional', 'enterprise']),
('compliance_consent_management', 'Consent Management', 'User consent tracking and management', 'compliance', true, ARRAY['starter', 'professional', 'enterprise'])
ON CONFLICT (flag_key) DO NOTHING;

-- Analytics Features
INSERT INTO public.feature_flags (flag_key, name, description, category, default_enabled, available_tiers) VALUES
('analytics_usage', 'Usage Analytics', 'Platform usage analytics', 'analytics', true, ARRAY['professional', 'enterprise']),
('analytics_performance', 'Performance Analytics', 'Agent performance metrics', 'analytics', true, ARRAY['professional', 'enterprise']),
('analytics_export', 'Export Analytics', 'Export analytics data', 'analytics', false, ARRAY['enterprise'])
ON CONFLICT (flag_key) DO NOTHING;

-- ============================================================================
-- 3. TENANT CONFIGURATIONS
-- ============================================================================

-- VITAL Expert Platform Configuration (System Tenant)
INSERT INTO public.tenant_configurations (
    tenant_id,
    ui_config,
    enabled_features,
    enabled_apps,
    enabled_agent_tiers,
    enabled_knowledge_domains,
    limits,
    compliance_settings,
    custom_settings
) SELECT
    id,
    '{
        "theme": "default",
        "primary_color": "#4F46E5",
        "logo_url": "/logos/vital-expert.png",
        "show_tenant_switcher": true
    }'::jsonb,
    ARRAY[
        'app_dashboard', 'app_chat', 'app_agents', 'app_knowledge', 'app_ask_panel',
        'app_solution_builder', 'app_jtbd', 'app_prism', 'app_capabilities',
        'app_knowledge_domains', 'app_patterns',
        'agents_tier_1', 'agents_tier_2', 'agents_tier_3',
        'agents_custom_creation', 'agents_collaboration',
        'compliance_hipaa', 'compliance_gdpr', 'compliance_audit_logging',
        'compliance_phi_protection', 'compliance_pii_protection',
        'compliance_data_retention', 'compliance_right_to_erasure',
        'compliance_data_portability', 'compliance_consent_management',
        'analytics_usage', 'analytics_performance', 'analytics_export'
    ],
    ARRAY[
        'dashboard', 'chat', 'agents', 'knowledge', 'ask-panel',
        'solution-builder', 'jobs-to-be-done', 'prism', 'capabilities',
        'knowledge-domains', 'patterns'
    ],
    ARRAY[1, 2, 3], -- All tiers
    ARRAY[
        'regulatory_affairs', 'clinical_development', 'pharmacovigilance',
        'digital_health', 'medical_devices', 'precision_medicine',
        'ai_ml_healthcare', 'quality_assurance', 'medical_affairs'
    ],
    '{
        "max_agents": 1000,
        "max_conversations": 100000,
        "max_documents": 10000,
        "max_storage_mb": 100000,
        "max_api_calls_per_day": 1000000
    }'::jsonb,
    '{
        "hipaa_enabled": true,
        "gdpr_enabled": true,
        "phi_allowed": true,
        "pii_allowed": true,
        "audit_logging": true,
        "data_retention_days": 2555,
        "right_to_erasure": true,
        "data_portability": true,
        "consent_management": true,
        "data_protection_officer": "dpo@vitalpath.com",
        "privacy_policy_url": "https://vitalpath.com/privacy"
    }'::jsonb,
    '{
        "is_system_tenant": true,
        "can_manage_all_tenants": true,
        "has_admin_access": true
    }'::jsonb
FROM public.organizations
WHERE tenant_key = 'vital-system'
ON CONFLICT (tenant_id) DO UPDATE SET
    ui_config = EXCLUDED.ui_config,
    enabled_features = EXCLUDED.enabled_features,
    enabled_apps = EXCLUDED.enabled_apps,
    limits = EXCLUDED.limits;

-- Digital Health Tenant Configuration
INSERT INTO public.tenant_configurations (
    tenant_id,
    ui_config,
    enabled_features,
    enabled_apps,
    enabled_agent_tiers,
    enabled_knowledge_domains,
    limits,
    compliance_settings,
    custom_settings
) SELECT
    id,
    '{
        "theme": "default",
        "primary_color": "#10B981",
        "logo_url": "/logos/digital-health.png",
        "show_tenant_switcher": false
    }'::jsonb,
    ARRAY[
        'app_dashboard', 'app_chat', 'app_agents', 'app_knowledge',
        'app_solution_builder', 'app_jtbd', 'app_prism',
        'agents_tier_2', 'agents_tier_3',
        'agents_custom_creation',
        'domain_digital_health', 'domain_precision_medicine', 'domain_ai_ml_healthcare',
        'compliance_gdpr', 'compliance_audit_logging', 'compliance_pii_protection',
        'compliance_data_retention', 'compliance_right_to_erasure',
        'compliance_data_portability', 'compliance_consent_management',
        'analytics_usage', 'analytics_performance'
    ],
    ARRAY[
        'dashboard', 'chat', 'agents', 'knowledge',
        'solution-builder', 'jobs-to-be-done', 'prism'
    ],
    ARRAY[2, 3], -- Tier 2 & 3 only
    ARRAY[
        'digital_health', 'precision_medicine', 'ai_ml_healthcare',
        'patient_engagement', 'telemedicine'
    ],
    '{
        "max_agents": 100,
        "max_conversations": 5000,
        "max_documents": 500,
        "max_storage_mb": 10000,
        "max_api_calls_per_day": 50000
    }'::jsonb,
    '{
        "hipaa_enabled": false,
        "gdpr_enabled": true,
        "phi_allowed": false,
        "pii_allowed": true,
        "audit_logging": true,
        "data_retention_days": 365,
        "right_to_erasure": true,
        "data_portability": true,
        "consent_management": true,
        "data_protection_officer": "privacy@digitalhealth.com",
        "privacy_policy_url": "https://digitalhealth.com/privacy"
    }'::jsonb,
    '{
        "focus": "digital_health_innovation",
        "primary_agents": ["digital_health_innovator", "patient_engagement_specialist"]
    }'::jsonb
FROM public.organizations
WHERE tenant_key = 'digital-health'
ON CONFLICT (tenant_id) DO UPDATE SET
    ui_config = EXCLUDED.ui_config,
    enabled_features = EXCLUDED.enabled_features,
    enabled_apps = EXCLUDED.enabled_apps,
    limits = EXCLUDED.limits;

-- Pharmaceuticals Tenant Configuration
INSERT INTO public.tenant_configurations (
    tenant_id,
    ui_config,
    enabled_features,
    enabled_apps,
    enabled_agent_tiers,
    enabled_knowledge_domains,
    limits,
    compliance_settings,
    custom_settings
) SELECT
    id,
    '{
        "theme": "default",
        "primary_color": "#0EA5E9",
        "logo_url": "/logos/pharmaceuticals.png",
        "show_tenant_switcher": false
    }'::jsonb,
    ARRAY[
        'app_dashboard', 'app_chat', 'app_agents', 'app_knowledge', 'app_ask_panel',
        'app_solution_builder', 'app_jtbd',
        'agents_tier_1', 'agents_tier_2', 'agents_tier_3',
        'agents_custom_creation', 'agents_collaboration',
        'domain_regulatory_affairs', 'domain_clinical_development', 'domain_pharmacovigilance',
        'domain_medical_devices',
        'compliance_hipaa', 'compliance_gdpr', 'compliance_audit_logging',
        'compliance_phi_protection', 'compliance_pii_protection',
        'compliance_data_retention', 'compliance_right_to_erasure',
        'compliance_data_portability', 'compliance_consent_management',
        'analytics_usage', 'analytics_performance', 'analytics_export'
    ],
    ARRAY[
        'dashboard', 'chat', 'agents', 'knowledge', 'ask-panel',
        'solution-builder', 'jobs-to-be-done'
    ],
    ARRAY[1, 2, 3], -- All tiers
    ARRAY[
        'regulatory_affairs', 'clinical_development', 'pharmacovigilance',
        'medical_devices', 'quality_assurance', 'drug_safety',
        'medical_affairs', 'clinical_operations'
    ],
    '{
        "max_agents": 250,
        "max_conversations": 20000,
        "max_documents": 2000,
        "max_storage_mb": 50000,
        "max_api_calls_per_day": 200000
    }'::jsonb,
    '{
        "hipaa_enabled": true,
        "gdpr_enabled": true,
        "phi_allowed": true,
        "pii_allowed": true,
        "audit_logging": true,
        "data_retention_days": 2555,
        "right_to_erasure": true,
        "data_portability": true,
        "consent_management": true,
        "requires_21_cfr_part_11": true,
        "data_protection_officer": "compliance@pharma.com",
        "privacy_policy_url": "https://pharma.com/privacy"
    }'::jsonb,
    '{
        "focus": "pharma_regulatory_compliance",
        "primary_agents": ["regulatory_affairs_specialist", "clinical_development_expert", "pharmacovigilance_specialist"],
        "compliance_frameworks": ["FDA", "EMA", "ICH"]
    }'::jsonb
FROM public.organizations
WHERE tenant_key = 'pharma'
ON CONFLICT (tenant_id) DO UPDATE SET
    ui_config = EXCLUDED.ui_config,
    enabled_features = EXCLUDED.enabled_features,
    enabled_apps = EXCLUDED.enabled_apps,
    limits = EXCLUDED.limits;

-- ============================================================================
-- 4. TENANT APPS (Define available apps per tenant)
-- ============================================================================

-- Apps for VITAL Expert Platform (System Tenant)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM public.organizations WHERE tenant_key = 'vital-system';

    INSERT INTO public.tenant_apps (tenant_id, app_key, app_name, app_description, app_route, app_icon, is_visible, is_enabled, display_order) VALUES
    (v_tenant_id, 'dashboard', 'Dashboard', 'Overview and metrics', '/dashboard', 'LayoutDashboard', true, true, 1),
    (v_tenant_id, 'chat', 'Expert Chat', 'Chat with AI experts', '/chat', 'MessageSquare', true, true, 2),
    (v_tenant_id, 'ask-panel', 'Ask Panel', 'Multi-expert consultation', '/ask-panel', 'Users', true, true, 3),
    (v_tenant_id, 'agents', 'Agents', 'Agent management', '/agents', 'Bot', true, true, 4),
    (v_tenant_id, 'knowledge', 'Knowledge', 'Document management', '/knowledge', 'Book', true, true, 5),
    (v_tenant_id, 'solution-builder', 'Solution Builder', 'Build solutions', '/solution-builder', 'Workflow', true, true, 6),
    (v_tenant_id, 'jobs-to-be-done', 'Jobs-to-be-Done', 'JTBD analysis', '/jobs-to-be-done', 'Target', true, true, 7),
    (v_tenant_id, 'prism', 'Prompt PRISM', 'Prompt engineering', '/prism', 'Sparkles', true, true, 8),
    (v_tenant_id, 'capabilities', 'Capabilities', 'Capability management', '/capabilities', 'Zap', true, true, 9),
    (v_tenant_id, 'knowledge-domains', 'Knowledge Domains', 'Domain configuration', '/knowledge-domains', 'Layers', true, true, 10),
    (v_tenant_id, 'patterns', 'Patterns', 'Design patterns', '/patterns', 'Grid', true, true, 11)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;
END $$;

-- Apps for Digital Health Tenant
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM public.organizations WHERE tenant_key = 'digital-health';

    INSERT INTO public.tenant_apps (tenant_id, app_key, app_name, app_description, app_route, app_icon, is_visible, is_enabled, display_order) VALUES
    (v_tenant_id, 'dashboard', 'Dashboard', 'Overview and metrics', '/dashboard', 'LayoutDashboard', true, true, 1),
    (v_tenant_id, 'chat', 'Expert Chat', 'Chat with AI experts', '/chat', 'MessageSquare', true, true, 2),
    (v_tenant_id, 'agents', 'Agents', 'Agent management', '/agents', 'Bot', true, true, 3),
    (v_tenant_id, 'knowledge', 'Knowledge', 'Document management', '/knowledge', 'Book', true, true, 4),
    (v_tenant_id, 'solution-builder', 'Solution Builder', 'Build digital health solutions', '/solution-builder', 'Workflow', true, true, 5),
    (v_tenant_id, 'jobs-to-be-done', 'Jobs-to-be-Done', 'Patient needs analysis', '/jobs-to-be-done', 'Target', true, true, 6),
    (v_tenant_id, 'prism', 'Prompt PRISM', 'Prompt engineering', '/prism', 'Sparkles', true, true, 7)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;
END $$;

-- Apps for Pharmaceuticals Tenant
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM public.organizations WHERE tenant_key = 'pharma';

    INSERT INTO public.tenant_apps (tenant_id, app_key, app_name, app_description, app_route, app_icon, is_visible, is_enabled, display_order) VALUES
    (v_tenant_id, 'dashboard', 'Dashboard', 'Regulatory compliance dashboard', '/dashboard', 'LayoutDashboard', true, true, 1),
    (v_tenant_id, 'chat', 'Expert Chat', 'Consult regulatory experts', '/chat', 'MessageSquare', true, true, 2),
    (v_tenant_id, 'ask-panel', 'Advisory Panel', 'Multi-expert panel', '/ask-panel', 'Users', true, true, 3),
    (v_tenant_id, 'agents', 'Agents', 'Regulatory agent management', '/agents', 'Bot', true, true, 4),
    (v_tenant_id, 'knowledge', 'Knowledge', 'Regulatory documents', '/knowledge', 'Book', true, true, 5),
    (v_tenant_id, 'solution-builder', 'Submission Builder', 'Build regulatory submissions', '/solution-builder', 'Workflow', true, true, 6),
    (v_tenant_id, 'jobs-to-be-done', 'Clinical Objectives', 'Clinical development planning', '/jobs-to-be-done', 'Target', true, true, 7)
    ON CONFLICT (tenant_id, app_key) DO NOTHING;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show created tenants
SELECT
    name,
    slug,
    tenant_type,
    tenant_key,
    subscription_tier,
    is_active
FROM public.organizations
WHERE tenant_type IN ('system', 'digital_health', 'pharmaceuticals')
ORDER BY
    CASE tenant_type
        WHEN 'system' THEN 1
        WHEN 'digital_health' THEN 2
        WHEN 'pharmaceuticals' THEN 3
    END;

-- Show feature flag counts
SELECT
    category,
    COUNT(*) as flag_count
FROM public.feature_flags
GROUP BY category
ORDER BY category;

-- Show tenant configurations
SELECT
    o.name as tenant_name,
    array_length(tc.enabled_features, 1) as feature_count,
    array_length(tc.enabled_apps, 1) as app_count,
    tc.enabled_agent_tiers,
    array_length(tc.enabled_knowledge_domains, 1) as domain_count
FROM public.tenant_configurations tc
JOIN public.organizations o ON tc.tenant_id = o.id
ORDER BY o.tenant_type;

-- Show tenant apps
SELECT
    o.name as tenant_name,
    COUNT(*) as app_count
FROM public.tenant_apps ta
JOIN public.organizations o ON ta.tenant_id = o.id
GROUP BY o.name
ORDER BY o.name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ MVP Tenant Seed Data created successfully!';
    RAISE NOTICE '   - 3 Tenants: VITAL Expert Platform, Digital Health, Pharmaceuticals';
    RAISE NOTICE '   - Feature Flags: Core apps, agents, domains, compliance, analytics';
    RAISE NOTICE '   - Tenant Configurations: UI, features, limits, compliance settings';
    RAISE NOTICE '   - Tenant Apps: Customized app visibility per tenant';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '   1. Implement TenantConfigurationService';
    RAISE NOTICE '   2. Implement FeatureFlagService';
    RAISE NOTICE '   3. Create tenant-aware middleware';
    RAISE NOTICE '   4. Build tenant switcher UI component';
END $$;
-- ============================================================================
-- UPDATE TENANT LOGOS
-- ============================================================================
-- Updates existing tenant configurations with logo URLs
-- ============================================================================

-- Update VITAL Expert Platform logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/vital-expert.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'vital-system'
);

-- Update Digital Health logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/digital-health.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'digital-health'
);

-- Update Pharmaceuticals logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/pharmaceuticals.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'pharma'
);

-- Verify updates
SELECT
    o.name as tenant_name,
    o.tenant_key,
    tc.ui_config->>'logo_url' as logo_url
FROM public.organizations o
JOIN public.tenant_configurations tc ON tc.tenant_id = o.id
WHERE o.tenant_type IN ('system', 'digital_health', 'pharmaceuticals')
ORDER BY o.name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Tenant logos updated successfully!';
    RAISE NOTICE '   - VITAL Expert Platform: /logos/vital-expert.png';
    RAISE NOTICE '   - Digital Health: /logos/digital-health.png';
    RAISE NOTICE '   - Pharmaceuticals: /logos/pharmaceuticals.png';
END $$;
