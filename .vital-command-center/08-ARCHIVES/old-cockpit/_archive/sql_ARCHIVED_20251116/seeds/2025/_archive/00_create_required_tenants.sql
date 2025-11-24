-- =====================================================================================
-- 00_create_required_tenants.sql
-- Create Required Tenants for Seed Data Migration
-- =====================================================================================
-- Purpose: Create essential tenants needed by seed files
-- Execution Order: Run BEFORE any foundation seed files
-- =====================================================================================

-- Platform tenant (00000000-0000-0000-0000-000000000000)
INSERT INTO tenants (
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry,
    subscription_starts_at,
    encryption_enabled,
    timezone
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Platform',
    'platform',
    'platform',
    'platform',
    'active',
    'active',
    NULL,
    NOW(),
    true,
    'UTC'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- Digital Health Startup tenant (primary tenant for seed data)
INSERT INTO tenants (
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry,
    subscription_starts_at,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Digital Health Startup',
    'digital-health-startup',
    'client',
    'enterprise',
    'active',
    'active',
    'digital-health',
    NOW(),
    true,
    'UTC',
    jsonb_build_object(
        'description', 'Primary digital health startup tenant for platform resources',
        'features', jsonb_build_array('telemedicine', 'wearables', 'AI-diagnostics'),
        'is_seed_tenant', true
    )
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    subscription_status = 'active',
    status = 'active',
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Digital Health Startups (community tenant)
INSERT INTO tenants (
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry,
    subscription_starts_at,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    'a2b50378-a21a-467b-ba4c-79ba93f64b2f',
    'Digital Health Startups',
    'digital-health-startups',
    'client',
    'enterprise',
    'active',
    'active',
    'digital-health',
    NOW(),
    true,
    'UTC',
    jsonb_build_object(
        'description', 'Digital health and medtech startups community',
        'features', jsonb_build_array('telemedicine', 'wearables', 'AI-diagnostics'),
        'plan', 'enterprise'
    )
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- Pharma Companies tenant
INSERT INTO tenants (
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry,
    subscription_starts_at,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    '18c6b106-6f99-4b29-9608-b9a623af37c2',
    'Pharma Companies',
    'pharma',
    'client',
    'enterprise',
    'active',
    'active',
    'pharmaceutical',
    NOW(),
    true,
    'UTC',
    jsonb_build_object(
        'description', 'Pharmaceutical companies and drug manufacturers',
        'features', jsonb_build_array('clinical-trials', 'regulatory', 'market-access'),
        'plan', 'enterprise'
    )
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- Pharmaceutical Company (specific pharma org)
INSERT INTO tenants (
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry,
    subscription_starts_at,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    'e8f3d4c2-a1b5-4e6f-9c8d-7b2a3f1e4d5c',
    'Pharmaceutical Company',
    'pharma-company',
    'client',
    'enterprise',
    'active',
    'active',
    'pharmaceutical',
    NOW(),
    true,
    'UTC',
    jsonb_build_object(
        'description', 'Traditional pharmaceutical company organizational structure',
        'primary_products', jsonb_build_array('Small Molecule Drugs', 'Biologics', 'Vaccines'),
        'regulatory_focus', 'FDA, EMA, PMDA',
        'organization_type', 'Large Enterprise'
    )
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- Verify tenant creation
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM tenants WHERE status = 'active';
    RAISE NOTICE '✅ Active tenants created: %', v_count;

    -- List created tenants
    RAISE NOTICE '📋 Tenant List:';
    FOR v_count IN
        SELECT 1 FROM tenants WHERE status = 'active' ORDER BY slug
    LOOP
        RAISE NOTICE '   - % (%) [%]',
            (SELECT name FROM tenants WHERE status = 'active' ORDER BY slug OFFSET v_count-1 LIMIT 1),
            (SELECT slug FROM tenants WHERE status = 'active' ORDER BY slug OFFSET v_count-1 LIMIT 1),
            (SELECT id FROM tenants WHERE status = 'active' ORDER BY slug OFFSET v_count-1 LIMIT 1);
    END LOOP;
END $$;

-- Summary
SELECT
    '✅ TENANTS READY' as status,
    COUNT(*) as total_tenants,
    COUNT(*) FILTER (WHERE type = 'platform') as platform_tenants,
    COUNT(*) FILTER (WHERE type = 'client') as client_tenants,
    COUNT(*) FILTER (WHERE status = 'active') as active_tenants
FROM tenants;
