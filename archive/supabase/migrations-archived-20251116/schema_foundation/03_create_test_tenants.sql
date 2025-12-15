-- =============================================================================
-- PHASE 3: CREATE TWO TEST TENANTS
-- =============================================================================
-- Purpose: Create Digital Health Startups and Pharmaceuticals tenants for testing
-- Prerequisites: Phase 2 (Multi-Tenancy Foundation) must be completed
-- Time: ~5 minutes
-- Impact: Creates 2 test tenants for multi-tenant testing
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: CREATE DIGITAL HEALTH STARTUPS TENANT
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Creating Digital Health Startups Tenant';
  RAISE NOTICE '========================================';
END $$;

INSERT INTO public.tenants (
  id,
  parent_tenant_id,
  name,
  slug,
  contact_email,
  contact_name,
  tier,
  status,
  max_users,
  max_agents,
  features,
  metadata,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  NULL, -- Top-level tenant (no parent)
  'Digital Health Startups',
  'digital-health',
  'admin@digitalhealth.vital.ai',
  'Innovation Team',
  'enterprise',
  'active',
  100, -- Max 100 users
  50,  -- Max 50 custom agents
  jsonb_build_object(
    'custom_agents', true,
    'panel_discussions', true,
    'api_access', true,
    'white_label', false,
    'sso', true,
    'advanced_analytics', true,
    'max_consultations_per_month', 1000,
    'max_tokens_per_month', 10000000
  ),
  jsonb_build_object(
    'industry_focus', ARRAY['digital_health', 'telehealth', 'wearables', 'health_apps'],
    'data_residency', 'us',
    'compliance_requirements', ARRAY['HIPAA', 'SOC2'],
    'onboarding_completed', true,
    'billing_cycle', 'monthly',
    'contract_start_date', '2025-01-01',
    'primary_use_cases', ARRAY['innovation', 'product_development', 'market_research']
  ),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  contact_email = EXCLUDED.contact_email,
  contact_name = EXCLUDED.contact_name,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  max_users = EXCLUDED.max_users,
  max_agents = EXCLUDED.max_agents,
  features = EXCLUDED.features,
  metadata = EXCLUDED.metadata,
  updated_at = now();

DO $$
BEGIN
  RAISE NOTICE '✅ Digital Health Startups tenant created';
  RAISE NOTICE '   ID: 11111111-1111-1111-1111-111111111111';
  RAISE NOTICE '   Slug: digital-health';
  RAISE NOTICE '   Tier: enterprise';
  RAISE NOTICE '   Max Users: 100';
  RAISE NOTICE '   Max Agents: 50';
END $$;

-- =============================================================================
-- STEP 2: CREATE PHARMACEUTICALS TENANT
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Creating Pharmaceuticals Tenant';
  RAISE NOTICE '========================================';
END $$;

INSERT INTO public.tenants (
  id,
  parent_tenant_id,
  name,
  slug,
  contact_email,
  contact_name,
  tier,
  status,
  max_users,
  max_agents,
  features,
  metadata,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  NULL, -- Top-level tenant (no parent)
  'Pharmaceuticals',
  'pharma',
  'admin@pharma.vital.ai',
  'Medical Affairs Lead',
  'enterprise',
  'active',
  500, -- Max 500 users
  200, -- Max 200 custom agents
  jsonb_build_object(
    'custom_agents', true,
    'panel_discussions', true,
    'api_access', true,
    'white_label', true,
    'sso', true,
    'advanced_analytics', true,
    'dedicated_support', true,
    'max_consultations_per_month', 5000,
    'max_tokens_per_month', 50000000
  ),
  jsonb_build_object(
    'industry_focus', ARRAY['pharmaceuticals', 'biotech', 'medical_affairs', 'market_access'],
    'data_residency', 'us',
    'compliance_requirements', ARRAY['HIPAA', 'GDPR', 'SOC2', 'GxP'],
    'onboarding_completed', true,
    'billing_cycle', 'annual',
    'contract_start_date', '2025-01-01',
    'contract_value_annual', 250000,
    'primary_use_cases', ARRAY['medical_affairs', 'regulatory', 'commercial_excellence', 'market_access']
  ),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  contact_email = EXCLUDED.contact_email,
  contact_name = EXCLUDED.contact_name,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  max_users = EXCLUDED.max_users,
  max_agents = EXCLUDED.max_agents,
  features = EXCLUDED.features,
  metadata = EXCLUDED.metadata,
  updated_at = now();

DO $$
BEGIN
  RAISE NOTICE '✅ Pharmaceuticals tenant created';
  RAISE NOTICE '   ID: 22222222-2222-2222-2222-222222222222';
  RAISE NOTICE '   Slug: pharma';
  RAISE NOTICE '   Tier: enterprise';
  RAISE NOTICE '   Max Users: 500';
  RAISE NOTICE '   Max Agents: 200';
END $$;

-- =============================================================================
-- STEP 3: VERIFY TENANT CREATION
-- =============================================================================

DO $$
DECLARE
  tenant_count INTEGER;
  dh_tenant_exists BOOLEAN;
  pharma_tenant_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Verifying Tenant Creation';
  RAISE NOTICE '========================================';

  -- Count total tenants
  SELECT COUNT(*) INTO tenant_count FROM tenants WHERE deleted_at IS NULL;

  -- Check Digital Health tenant
  SELECT EXISTS(
    SELECT 1 FROM tenants
    WHERE id = '11111111-1111-1111-1111-111111111111'
    AND deleted_at IS NULL
  ) INTO dh_tenant_exists;

  -- Check Pharma tenant
  SELECT EXISTS(
    SELECT 1 FROM tenants
    WHERE id = '22222222-2222-2222-2222-222222222222'
    AND deleted_at IS NULL
  ) INTO pharma_tenant_exists;

  RAISE NOTICE 'Total active tenants: %', tenant_count;

  IF dh_tenant_exists THEN
    RAISE NOTICE '✅ Digital Health Startups tenant verified';
  ELSE
    RAISE EXCEPTION '❌ Digital Health Startups tenant NOT found';
  END IF;

  IF pharma_tenant_exists THEN
    RAISE NOTICE '✅ Pharmaceuticals tenant verified';
  ELSE
    RAISE EXCEPTION '❌ Pharmaceuticals tenant NOT found';
  END IF;

  IF tenant_count < 2 THEN
    RAISE WARNING '⚠️  Expected at least 2 tenants, found %', tenant_count;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TENANT CREATION COMPLETE';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- STEP 4: DISPLAY TENANT SUMMARY
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tenant Summary';
  RAISE NOTICE '========================================';
END $$;

SELECT
  name as "Tenant Name",
  slug as "Slug",
  tier as "Tier",
  status as "Status",
  max_users as "Max Users",
  max_agents as "Max Agents",
  features->>'max_consultations_per_month' as "Max Consultations/Mo",
  features->>'max_tokens_per_month' as "Max Tokens/Mo",
  metadata->>'industry_focus' as "Industry Focus"
FROM tenants
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
)
ORDER BY name;

-- =============================================================================
-- OPTIONAL: CREATE TEST ADMIN USERS FOR EACH TENANT
-- =============================================================================
-- NOTE: This section is commented out as it requires auth.users to exist
-- Uncomment and modify after user authentication is set up

/*
-- Create test admin for Digital Health
INSERT INTO tenant_members (
  tenant_id,
  user_id,
  role,
  invitation_status,
  joined_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'YOUR-USER-ID-HERE', -- Replace with actual user ID from auth.users
  'owner',
  'active',
  now()
) ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Create test admin for Pharmaceuticals
INSERT INTO tenant_members (
  tenant_id,
  user_id,
  role,
  invitation_status,
  joined_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'YOUR-USER-ID-HERE', -- Replace with actual user ID from auth.users
  'owner',
  'active',
  now()
) ON CONFLICT (tenant_id, user_id) DO NOTHING;
*/

COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries after applying this migration to verify success
-- =============================================================================

-- 1. Check tenant count
-- SELECT COUNT(*) as total_tenants FROM tenants WHERE deleted_at IS NULL;
-- Expected: At least 2 (default + 2 new tenants)

-- 2. View all tenants with details
-- SELECT
--   id,
--   name,
--   slug,
--   tier,
--   status,
--   max_users,
--   max_agents,
--   created_at
-- FROM tenants
-- WHERE deleted_at IS NULL
-- ORDER BY created_at;

-- 3. Check feature flags
-- SELECT
--   name,
--   features->>'custom_agents' as custom_agents,
--   features->>'panel_discussions' as panel_discussions,
--   features->>'api_access' as api_access,
--   features->>'white_label' as white_label
-- FROM tenants
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- 4. Check metadata
-- SELECT
--   name,
--   metadata->'industry_focus' as industry_focus,
--   metadata->'compliance_requirements' as compliance,
--   metadata->'primary_use_cases' as use_cases
-- FROM tenants
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================
-- If you need to remove the test tenants, run:
/*
BEGIN;

-- Soft delete test tenants (RECOMMENDED - preserves data)
UPDATE tenants
SET deleted_at = now()
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- OR Hard delete test tenants (DESTRUCTIVE - removes all related data via CASCADE)
-- DELETE FROM tenants
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

COMMIT;
*/

-- =============================================================================
-- NEXT STEPS
-- =============================================================================
-- 1. ✅ Phase 3 complete - Two test tenants created
-- 2. ⏳ Proceed to Phase 4: Fix NULL-permissive fields
-- 3. ⏳ Continue with remaining schema foundation phases (5-8)
-- 4. ⏳ Begin data migration with tenant assignment
-- =============================================================================
