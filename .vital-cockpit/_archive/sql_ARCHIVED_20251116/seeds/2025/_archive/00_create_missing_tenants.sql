-- =====================================================================================
-- Create Missing Tenants for Seed Files
-- =====================================================================================
-- Based on NEW DB schema: tenant_path (ltree), tenant_level, tier, etc.
-- Only creates tenants that don't already exist
-- =====================================================================================

-- =====================================================================================
-- CRITICAL: Digital Health Startup (needed by all seed files)
-- =====================================================================================
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
    features,
    metadata,
    settings
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Digital Health Startup',
    'digital-health-startup',
    NULL,
    'digital_health_startup'::ltree,
    0,
    'active',
    'professional',
    25,
    100,
    25,
    100000,
    '{"api_access": true, "custom_agents": true, "workflow_automation": true, "panel_discussions": true}'::jsonb,
    '{"description": "Primary tenant for seed data", "is_seed_tenant": true, "industry": "Digital Health"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Platform Tenant (root tenant)
-- =====================================================================================
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
    features,
    metadata,
    settings
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'VITAL Platform',
    'vital-platform',
    NULL,
    'vital_platform'::ltree,
    0,
    'active',
    'enterprise',
    999999,
    999999,
    999999,
    999999999,
    '{"unlimited": true, "api_access": true, "white_label": true, "custom_agents": true, "panel_discussions": true, "workflow_automation": true, "sso": true}'::jsonb,
    '{"is_platform": true}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Startup Tenant
-- =====================================================================================
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
    features,
    metadata,
    settings
)
VALUES (
    gen_random_uuid(),
    'Startup',
    'startup',
    NULL,
    'startup'::ltree,
    0,
    'active',
    'professional',
    10,
    50,
    10,
    50000,
    '{"api_access": true, "custom_agents": true, "workflow_automation": true}'::jsonb,
    '{"industry": "Technology"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Pharma Companies Tenant
-- =====================================================================================
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
    features,
    metadata,
    settings
)
VALUES (
    '18c6b106-6f99-4b29-9608-b9a623af37c2',
    'Pharma Companies',
    'pharma',
    NULL,
    'pharma'::ltree,
    0,
    'active',
    'enterprise',
    100,
    500,
    100,
    1000000,
    '{"sso": true, "api_access": true, "custom_agents": true, "panel_discussions": true, "workflow_automation": true, "clinical_development": true, "regulatory_affairs": true, "market_access": true, "medical_affairs": true}'::jsonb,
    '{"industry": "Pharmaceutical", "description": "Pharmaceutical companies community"}'::jsonb,
    '{"modules": {"heor": true, "pricing_reimbursement": true, "payer_strategy": true}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Pharmaceutical Company Tenant
-- =====================================================================================
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
    features,
    metadata,
    settings
)
VALUES (
    'e8f3d4c2-a1b5-4e6f-9c8d-7b2a3f1e4d5c',
    'Pharmaceutical Company',
    'pharma-company',
    NULL,
    'pharma_company'::ltree,
    0,
    'active',
    'enterprise',
    50,
    250,
    50,
    500000,
    '{"api_access": true, "custom_agents": true, "panel_discussions": true, "workflow_automation": true}'::jsonb,
    '{"industry": "Pharmaceutical", "description": "Traditional pharmaceutical company", "organization_type": "Large Enterprise"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Additional Industry Tenants
-- =====================================================================================

-- Biotech Company
INSERT INTO tenants (
    name, slug, parent_id, tenant_path, tenant_level, status, tier,
    max_users, max_agents, max_storage_gb, max_api_calls_per_month,
    features, metadata, settings
)
VALUES (
    'Biotech Company', 'biotech-company', NULL, 'biotech_company'::ltree, 0, 'active', 'enterprise',
    50, 250, 50, 500000,
    '{"api_access": true, "custom_agents": true}'::jsonb,
    '{"industry": "Biotechnology"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Consulting Firm
INSERT INTO tenants (
    name, slug, parent_id, tenant_path, tenant_level, status, tier,
    max_users, max_agents, max_storage_gb, max_api_calls_per_month,
    features, metadata, settings
)
VALUES (
    'Consulting Firm', 'consulting-firm', NULL, 'consulting_firm'::ltree, 0, 'active', 'professional',
    25, 100, 25, 100000,
    '{"api_access": true, "custom_agents": true}'::jsonb,
    '{"industry": "Healthcare Consulting"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Payer Organization
INSERT INTO tenants (
    name, slug, parent_id, tenant_path, tenant_level, status, tier,
    max_users, max_agents, max_storage_gb, max_api_calls_per_month,
    features, metadata, settings
)
VALUES (
    'Payer Organization', 'payer-organization', NULL, 'payer_organization'::ltree, 0, 'active', 'enterprise',
    100, 500, 100, 1000000,
    '{"api_access": true, "custom_agents": true}'::jsonb,
    '{"industry": "Healthcare Payers"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Individual Freelancer
INSERT INTO tenants (
    name, slug, parent_id, tenant_path, tenant_level, status, tier,
    max_users, max_agents, max_storage_gb, max_api_calls_per_month,
    features, metadata, settings
)
VALUES (
    'Individual Freelancer', 'individual-freelancer', NULL, 'individual_freelancer'::ltree, 0, 'active', 'professional',
    1, 10, 1, 10000,
    '{"api_access": false, "custom_agents": false}'::jsonb,
    '{"industry": "Independent/Freelance"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- MedTech Company
INSERT INTO tenants (
    name, slug, parent_id, tenant_path, tenant_level, status, tier,
    max_users, max_agents, max_storage_gb, max_api_calls_per_month,
    features, metadata, settings
)
VALUES (
    'MedTech Company', 'medtech-company', NULL, 'medtech_company'::ltree, 0, 'active', 'enterprise',
    50, 250, 50, 500000,
    '{"api_access": true, "custom_agents": true}'::jsonb,
    '{"industry": "Medical Devices"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================================
-- Verification
-- =====================================================================================
DO $$
DECLARE
    v_total INTEGER;
    v_active INTEGER;
    v_seed_tenant_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_total FROM tenants;
    SELECT COUNT(*) INTO v_active FROM tenants WHERE status = 'active';
    SELECT EXISTS(SELECT 1 FROM tenants WHERE slug = 'digital-health-startup') INTO v_seed_tenant_exists;

    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '✅ TENANT MIGRATION COMPLETE';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Total tenants: %', v_total;
    RAISE NOTICE 'Active tenants: %', v_active;
    RAISE NOTICE '';

    IF v_seed_tenant_exists THEN
        RAISE NOTICE '✅ CRITICAL: digital-health-startup tenant EXISTS';
        RAISE NOTICE '   → Seed files will work correctly';
    ELSE
        RAISE NOTICE '❌ WARNING: digital-health-startup tenant MISSING';
        RAISE NOTICE '   → Seed files will FAIL';
    END IF;

    RAISE NOTICE '';
END $$;

-- Display all tenants
SELECT
    name,
    slug,
    tenant_level,
    tier,
    status,
    max_users,
    max_agents
FROM tenants
ORDER BY tenant_level, name;
