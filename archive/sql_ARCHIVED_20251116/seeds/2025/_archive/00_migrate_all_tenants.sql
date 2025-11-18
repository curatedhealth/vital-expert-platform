-- =====================================================================================
-- Migrate All Tenants from OLD DB to NEW DB
-- =====================================================================================
-- This script creates all 11 tenants from the OLD DB in the NEW DB
-- Based on actual schema from both databases
-- =====================================================================================

-- =====================================================================================
-- TENANT 1: Platform Tenant (00000000-0000-0000-0000-000000000001)
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'VITAL Platform',
    'vital-platform',
    NULL,
    'platform',
    NULL,
    'enterprise',
    'active',
    'active',
    NULL,
    true,
    'UTC',
    '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    type = EXCLUDED.type,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 2: Startup (11111111-1111-1111-1111-111111111111)
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Startup',
    'startup',
    NULL,
    'platform',
    NULL,
    'enterprise',
    'active',
    'active',
    NULL,
    true,
    'UTC',
    '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 3: Digital Health Startup (for seed files)
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Digital Health Startup',
    'digital-health-startup',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'Digital Health',
    true,
    'UTC',
    '{"description": "Primary tenant for seed data", "is_seed_tenant": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    subscription_status = 'active',
    status = 'active',
    industry = EXCLUDED.industry,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- =====================================================================================
-- TENANT 4: Digital Health Startups (Community)
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    'a2b50378-a21a-467b-ba4c-79ba93f64b2f',
    'Digital Health Startups',
    'digital-health-startups',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'digital-health',
    true,
    'UTC',
    '{"description": "Digital health and medtech startups community", "features": ["telemedicine", "wearables", "AI-diagnostics"], "plan": "enterprise"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 5: Pharma Companies
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    '18c6b106-6f99-4b29-9608-b9a623af37c2',
    'Pharma Companies',
    'pharma',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'pharmaceutical',
    true,
    'UTC',
    '{"description": "Pharmaceutical companies and drug manufacturers", "features": ["clinical-trials", "regulatory", "market-access"], "plan": "enterprise"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 6: Pharmaceutical Company
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    'e8f3d4c2-a1b5-4e6f-9c8d-7b2a3f1e4d5c',
    'Pharmaceutical Company',
    'pharma-company',
    NULL,
    'client',
    NULL,
    'standard',
    'active',
    'active',
    'Pharmaceutical',
    true,
    'UTC',
    '{"description": "Traditional pharmaceutical company organizational structure", "primary_products": ["Small Molecule Drugs", "Biologics", "Vaccines"], "regulatory_focus": "FDA, EMA, PMDA", "organization_type": "Large Enterprise"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 7: Biotech Company
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    gen_random_uuid(),
    'Biotech Company',
    'biotech-company',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'Biotechnology',
    true,
    'UTC',
    '{"description": "Biotechnology company"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 8: Consulting Firm
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    gen_random_uuid(),
    'Consulting Firm',
    'consulting-firm',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'Healthcare Consulting',
    true,
    'UTC',
    '{"description": "Healthcare consulting firm"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 9: Payer Organization
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    gen_random_uuid(),
    'Payer Organization',
    'payer-organization',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'Healthcare Payers',
    true,
    'UTC',
    '{"description": "Healthcare payer organization"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 10: Individual Freelancer
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    gen_random_uuid(),
    'Individual Freelancer',
    'individual-freelancer',
    NULL,
    'client',
    NULL,
    'trial',
    'active',
    'active',
    'Independent/Freelance',
    true,
    'UTC',
    '{"description": "Individual freelancer or consultant"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- TENANT 11: MedTech Company
-- =====================================================================================
INSERT INTO tenants (
    id,
    name,
    slug,
    domain,
    type,
    parent_tenant_id,
    subscription_tier,
    subscription_status,
    status,
    industry,
    encryption_enabled,
    timezone,
    metadata
)
VALUES (
    gen_random_uuid(),
    'MedTech Company',
    'medtech-company',
    NULL,
    'client',
    NULL,
    'enterprise',
    'active',
    'active',
    'Medical Devices',
    true,
    'UTC',
    '{"description": "Medical device and technology company"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    subscription_status = 'active',
    status = 'active',
    updated_at = NOW();

-- =====================================================================================
-- Verification and Summary
-- =====================================================================================
DO $$
DECLARE
    v_count INTEGER;
    v_active INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM tenants;
    SELECT COUNT(*) INTO v_active FROM tenants WHERE status = 'active';

    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '✅ TENANT MIGRATION COMPLETE';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Total tenants: %', v_count;
    RAISE NOTICE 'Active tenants: %', v_active;
    RAISE NOTICE '';
END $$;

-- Display all tenants
SELECT
    '=== ALL TENANTS ===' as info,
    name,
    slug,
    type,
    industry,
    subscription_tier,
    status
FROM tenants
ORDER BY
    CASE type
        WHEN 'platform' THEN 1
        WHEN 'client' THEN 2
        ELSE 3
    END,
    name;

-- Check for the critical tenant needed by seed files
SELECT
    '=== SEED FILE TENANT CHECK ===' as info,
    CASE
        WHEN EXISTS (SELECT 1 FROM tenants WHERE slug = 'digital-health-startup')
        THEN '✅ digital-health-startup tenant EXISTS - seed files will work'
        ELSE '❌ digital-health-startup tenant MISSING - seed files will fail'
    END as status;
