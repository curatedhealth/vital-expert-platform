-- =====================================================================================
-- Cleanup Duplicate Tenants - Keep Only Essential Ones
-- =====================================================================================
-- Platform: Keep vital-platform (delete platform)
-- Pharma: Keep pharmaceuticals (delete pharma, pharma-company)
-- Digital Health: Keep digital-health-startup (delete digital-health-startups)
-- =====================================================================================

-- Start transaction for safety
BEGIN;

-- =====================================================================================
-- STEP 1: Display current tenants before cleanup
-- =====================================================================================
SELECT
    '=== BEFORE CLEANUP ===' as info,
    id,
    name,
    slug,
    tier,
    max_users
FROM tenants
ORDER BY name;

-- =====================================================================================
-- STEP 2: Delete duplicate platform tenant
-- =====================================================================================
DELETE FROM tenants WHERE slug = 'platform';

-- =====================================================================================
-- STEP 3: Delete duplicate pharma tenants
-- =====================================================================================
DELETE FROM tenants WHERE slug IN ('pharma', 'pharma-company');

-- =====================================================================================
-- STEP 4: Delete duplicate digital health tenant
-- =====================================================================================
DELETE FROM tenants WHERE slug = 'digital-health-startups';

-- =====================================================================================
-- STEP 5: Delete other unnecessary tenants (optional - keep if you want them)
-- =====================================================================================
-- Uncomment these if you want to remove them:
-- DELETE FROM tenants WHERE slug = 'startup';
-- DELETE FROM tenants WHERE slug = 'biotech-company';
-- DELETE FROM tenants WHERE slug = 'consulting-firm';
-- DELETE FROM tenants WHERE slug = 'payer-organization';
-- DELETE FROM tenants WHERE slug = 'individual-freelancer';
-- DELETE FROM tenants WHERE slug = 'medtech-company';

-- =====================================================================================
-- STEP 6: Verify remaining tenants
-- =====================================================================================
SELECT
    '=== AFTER CLEANUP ===' as info,
    id,
    name,
    slug,
    tier,
    max_users,
    max_agents
FROM tenants
ORDER BY name;

-- =====================================================================================
-- STEP 7: Summary
-- =====================================================================================
DO $$
DECLARE
    v_total INTEGER;
    v_critical_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_total FROM tenants;
    SELECT EXISTS(SELECT 1 FROM tenants WHERE slug = 'digital-health-startup') INTO v_critical_exists;

    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '✅ TENANT CLEANUP COMPLETE';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Remaining tenants: %', v_total;
    RAISE NOTICE '';

    IF v_critical_exists THEN
        RAISE NOTICE '✅ CRITICAL: digital-health-startup tenant EXISTS';
        RAISE NOTICE '   → Seed files will work';
    ELSE
        RAISE NOTICE '❌ ERROR: digital-health-startup tenant MISSING';
        RAISE NOTICE '   → Seed files will FAIL';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Essential tenants kept:';
    RAISE NOTICE '  - vital-platform (Platform)';
    RAISE NOTICE '  - pharmaceuticals (Pharma)';
    RAISE NOTICE '  - digital-health-startup (Digital Health - CRITICAL for seed files)';
    RAISE NOTICE '';
END $$;

-- Commit the changes
COMMIT;

-- Final display
SELECT
    '=== FINAL TENANT LIST ===' as info,
    name,
    slug,
    tenant_level,
    tier,
    status
FROM tenants
ORDER BY name;
