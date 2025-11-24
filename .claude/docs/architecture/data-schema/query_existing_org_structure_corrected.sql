-- =====================================================================
-- QUERY EXISTING ORG-STRUCTURE DATA IN SUPABASE (CORRECTED)
-- Based on actual schema: uses 'name' column for all tables
-- =====================================================================

-- =====================================================================
-- 1. COUNT BY TENANT
-- =====================================================================

SELECT '=== COUNTS BY TENANT ===' as section;

-- Count org_functions by tenant
SELECT 
    'org_functions' as table_name,
    CASE 
        WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
        WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharmaceuticals'
        WHEN tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89' THEN 'Digital Health'
        WHEN tenant_id IS NULL THEN 'NULL'
        ELSE 'Other/Unknown: ' || tenant_id::text
    END as tenant_name,
    COUNT(*) as count
FROM org_functions
GROUP BY tenant_id
ORDER BY table_name, tenant_name;

-- Count org_departments by tenant
SELECT 
    'org_departments' as table_name,
    CASE 
        WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
        WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharmaceuticals'
        WHEN tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89' THEN 'Digital Health'
        WHEN tenant_id IS NULL THEN 'NULL'
        ELSE 'Other/Unknown: ' || tenant_id::text
    END as tenant_name,
    COUNT(*) as count
FROM org_departments
GROUP BY tenant_id
ORDER BY table_name, tenant_name;

-- Count org_roles by tenant
SELECT 
    'org_roles' as table_name,
    CASE 
        WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
        WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharmaceuticals'
        WHEN tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89' THEN 'Digital Health'
        WHEN tenant_id IS NULL THEN 'NULL'
        ELSE 'Other/Unknown: ' || tenant_id::text
    END as tenant_name,
    COUNT(*) as count
FROM org_roles
GROUP BY tenant_id
ORDER BY table_name, tenant_name;

-- =====================================================================
-- 2. VITAL EXPERT PLATFORM DATA (Sample with names)
-- =====================================================================

SELECT '=== VITAL EXPERT PLATFORM FUNCTIONS ===' as section;

SELECT 
    id,
    name,
    slug,
    tenant_id,
    parent_id,
    is_active,
    created_at
FROM org_functions
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY name
LIMIT 20;

SELECT '=== VITAL EXPERT PLATFORM DEPARTMENTS ===' as section;

SELECT 
    d.id,
    d.name,
    d.slug,
    d.tenant_id,
    d.function_id,
    f.name as function_name,
    d.is_active,
    d.created_at
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY f.name, d.name
LIMIT 30;

SELECT '=== VITAL EXPERT PLATFORM ROLES ===' as section;

SELECT 
    r.id,
    r.name,
    r.slug,
    r.tenant_id,
    r.function_id,
    r.department_id,
    f.name as function_name,
    d.name as department_name,
    r.seniority_level,
    r.is_active,
    r.created_at
FROM org_roles r
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY f.name, d.name, r.name
LIMIT 30;

-- =====================================================================
-- 3. HIERARCHY STRUCTURE (VITAL Expert Platform)
-- =====================================================================

SELECT '=== HIERARCHY STRUCTURE (VITAL Expert Platform) ===' as section;

-- Functions with their department and role counts
SELECT 
    f.id as function_id,
    f.name as function_name,
    f.tenant_id,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.name, f.tenant_id
ORDER BY department_count DESC, role_count DESC;

-- Departments with their role counts
SELECT 
    d.id as department_id,
    d.name as department_name,
    d.tenant_id,
    d.function_id,
    f.name as function_name,
    COUNT(DISTINCT r.id) as role_count
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY d.id, d.name, d.tenant_id, d.function_id, f.name
ORDER BY role_count DESC
LIMIT 30;

-- =====================================================================
-- 4. CHECK FOR ANY DATA WITH NULL TENANT_ID
-- =====================================================================

SELECT '=== DATA WITH NULL TENANT_ID ===' as section;

SELECT 
    'org_functions' as table_name,
    COUNT(*) as null_tenant_count
FROM org_functions
WHERE tenant_id IS NULL
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id IS NULL
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id IS NULL;

-- =====================================================================
-- 5. ALL UNIQUE TENANT IDs
-- =====================================================================

SELECT '=== ALL UNIQUE TENANT IDs IN ORG STRUCTURE ===' as section;

SELECT DISTINCT tenant_id, 'org_functions' as source_table
FROM org_functions
WHERE tenant_id IS NOT NULL
UNION
SELECT DISTINCT tenant_id, 'org_departments'
FROM org_departments
WHERE tenant_id IS NOT NULL
UNION
SELECT DISTINCT tenant_id, 'org_roles'
FROM org_roles
WHERE tenant_id IS NOT NULL
ORDER BY tenant_id;

