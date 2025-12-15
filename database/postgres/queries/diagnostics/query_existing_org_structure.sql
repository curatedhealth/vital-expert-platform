-- =====================================================================
-- QUERY EXISTING ORG-STRUCTURE DATA IN SUPABASE
-- This script shows what functions, departments, and roles exist
-- =====================================================================

-- =====================================================================
-- 1. CHECK TABLE STRUCTURE
-- =====================================================================

SELECT '=== TABLE STRUCTURE ===' as section;

-- Show all columns in org_structure tables
SELECT 
    table_name,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as all_columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('org_functions', 'org_departments', 'org_roles')
GROUP BY table_name
ORDER BY table_name;

-- =====================================================================
-- 2. COUNT BY TENANT
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
-- 3. VITAL EXPERT PLATFORM DATA (Sample)
-- =====================================================================

SELECT '=== VITAL EXPERT PLATFORM DATA (Sample) ===' as section;

-- Sample Functions (just IDs and relationships)
SELECT 
    'Functions' as data_type,
    id,
    tenant_id,
    created_at
FROM org_functions
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY created_at
LIMIT 10;

-- Sample Departments (just IDs and relationships)
SELECT 
    'Departments' as data_type,
    id,
    tenant_id,
    function_id,
    created_at
FROM org_departments
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY created_at
LIMIT 10;

-- Sample Roles (just IDs and relationships)
SELECT 
    'Roles' as data_type,
    id,
    tenant_id,
    function_id,
    department_id,
    created_at
FROM org_roles
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY created_at
LIMIT 10;

-- =====================================================================
-- 4. ALL FUNCTIONS (Sample)
-- =====================================================================

SELECT '=== ALL FUNCTIONS (Sample) ===' as section;

-- Get sample functions
SELECT 
    id,
    tenant_id,
    created_at
FROM org_functions
ORDER BY tenant_id, created_at
LIMIT 20;

-- =====================================================================
-- 5. ALL DEPARTMENTS (Sample)
-- =====================================================================

SELECT '=== ALL DEPARTMENTS (Sample) ===' as section;

-- Get sample departments
SELECT 
    id,
    tenant_id,
    function_id,
    created_at
FROM org_departments
ORDER BY tenant_id, created_at
LIMIT 20;

-- =====================================================================
-- 6. ALL ROLES (Sample)
-- =====================================================================

SELECT '=== ALL ROLES (Sample) ===' as section;

-- Get sample roles
SELECT 
    id,
    tenant_id,
    function_id,
    department_id,
    created_at
FROM org_roles
ORDER BY tenant_id, created_at
LIMIT 20;

-- =====================================================================
-- 7. HIERARCHY STRUCTURE (VITAL Expert Platform)
-- =====================================================================

SELECT '=== HIERARCHY STRUCTURE (VITAL Expert Platform) ===' as section;

-- Functions with their department and role counts
SELECT 
    f.id as function_id,
    f.tenant_id,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.tenant_id
ORDER BY department_count DESC, role_count DESC;

-- Departments with their role counts
SELECT 
    d.id as department_id,
    d.tenant_id,
    d.function_id,
    COUNT(DISTINCT r.id) as role_count
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY d.id, d.tenant_id, d.function_id
ORDER BY role_count DESC
LIMIT 20;

-- =====================================================================
-- 8. CHECK FOR ANY DATA WITH NULL TENANT_ID
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

