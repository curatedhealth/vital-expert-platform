-- =====================================================================
-- DIAGNOSTIC AND SETUP SCRIPT FOR DIGITAL HEALTH ORG STRUCTURE
-- This script will:
-- 1. Find the Digital Health tenant ID
-- 2. Check if functions and departments exist
-- 3. Provide guidance on what needs to be done
-- =====================================================================

-- =====================================================================
-- STEP 1: FIND DIGITAL HEALTH TENANT
-- =====================================================================

SELECT '=== STEP 1: FINDING DIGITAL HEALTH TENANT ===' as step;

SELECT 
    id,
    name,
    slug,
    created_at
FROM tenants
WHERE slug ILIKE '%digital%health%'
   OR slug ILIKE '%digital-health%'
   OR name ILIKE '%digital health%'
ORDER BY created_at DESC;

-- Store the tenant ID for reference
DO $$
DECLARE
    digital_health_tenant_id uuid;
BEGIN
    SELECT id INTO digital_health_tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF digital_health_tenant_id IS NULL THEN
        RAISE NOTICE '❌ Digital Health tenant not found!';
        RAISE NOTICE '   Please create the tenant first.';
    ELSE
        RAISE NOTICE '✅ Digital Health Tenant ID: %', digital_health_tenant_id;
        RAISE NOTICE '';
    END IF;
END $$;

-- =====================================================================
-- STEP 2: CHECK EXISTING FUNCTIONS
-- =====================================================================

SELECT '=== STEP 2: CHECKING EXISTING FUNCTIONS ===' as step;

WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Functions for Digital Health' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No functions found - Need to populate'
        WHEN COUNT(*) < 9 THEN '⚠️  Partial functions found - May need to complete'
        ELSE '✅ Functions exist'
    END as status
FROM org_functions f
CROSS JOIN digital_health_tenant t
WHERE f.tenant_id = t.tenant_id;

-- List existing functions
WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    f.id,
    f.name,
    f.slug,
    f.tenant_id,
    f.is_active
FROM org_functions f
CROSS JOIN digital_health_tenant t
WHERE f.tenant_id = t.tenant_id
ORDER BY f.name;

-- =====================================================================
-- STEP 3: CHECK EXISTING DEPARTMENTS
-- =====================================================================

SELECT '=== STEP 3: CHECKING EXISTING DEPARTMENTS ===' as step;

WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Departments for Digital Health' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No departments found - Need to populate'
        WHEN COUNT(*) < 40 THEN '⚠️  Partial departments found - May need to complete'
        ELSE '✅ Departments exist'
    END as status
FROM org_departments d
CROSS JOIN digital_health_tenant t
WHERE d.tenant_id = t.tenant_id;

-- List existing departments by function
WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    f.name as function_name,
    COUNT(d.id) as department_count,
    STRING_AGG(d.name, ', ' ORDER BY d.name) as departments
FROM org_functions f
CROSS JOIN digital_health_tenant t
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
WHERE f.tenant_id = t.tenant_id
GROUP BY f.id, f.name
ORDER BY department_count DESC, f.name;

-- =====================================================================
-- STEP 4: CHECK EXISTING ROLES
-- =====================================================================

SELECT '=== STEP 4: CHECKING EXISTING ROLES ===' as step;

WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Roles for Digital Health' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No roles found - Need to populate'
        ELSE '✅ Roles exist'
    END as status
FROM org_roles r
CROSS JOIN digital_health_tenant t
WHERE r.tenant_id = t.tenant_id;

-- =====================================================================
-- STEP 5: SUMMARY AND RECOMMENDATIONS
-- =====================================================================

SELECT '=== STEP 5: SUMMARY AND RECOMMENDATIONS ===' as step;

WITH digital_health_tenant AS (
    SELECT id as tenant_id
    FROM tenants
    WHERE slug ILIKE '%digital%health%'
       OR slug ILIKE '%digital-health%'
       OR name ILIKE '%digital health%'
    ORDER BY created_at DESC
    LIMIT 1
),
counts AS (
    SELECT 
        (SELECT COUNT(*) FROM org_functions f WHERE f.tenant_id = t.tenant_id) as func_count,
        (SELECT COUNT(*) FROM org_departments d WHERE d.tenant_id = t.tenant_id) as dept_count,
        (SELECT COUNT(*) FROM org_roles r WHERE r.tenant_id = t.tenant_id) as role_count
    FROM digital_health_tenant t
)
SELECT 
    'Summary' as section,
    func_count as functions,
    dept_count as departments,
    role_count as roles,
    CASE 
        WHEN func_count = 0 THEN 'Run: populate_digital_health_org_fresh.sql (or equivalent)'
        WHEN dept_count = 0 THEN 'Run: populate_digital_health_org_fresh.sql (or equivalent)'
        WHEN role_count = 0 THEN 'Run: populate_digital_health_roles_from_json.sql'
        ELSE '✅ All data populated'
    END as next_action
FROM counts;

-- =====================================================================
-- STEP 6: GET THE ACTUAL TENANT ID FOR USE IN SCRIPTS
-- =====================================================================

SELECT '=== STEP 6: TENANT ID FOR USE IN SCRIPTS ===' as step;

SELECT 
    id::text as tenant_id,
    name as tenant_name,
    slug as tenant_slug,
    'Use this ID in your populate scripts' as instruction
FROM tenants
WHERE slug ILIKE '%digital%health%'
   OR slug ILIKE '%digital-health%'
   OR name ILIKE '%digital health%'
ORDER BY created_at DESC
LIMIT 1;

