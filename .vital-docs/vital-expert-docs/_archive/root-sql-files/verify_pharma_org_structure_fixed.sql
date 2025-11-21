-- =====================================================================
-- VERIFY PHARMACEUTICALS TENANT ORG-STRUCTURE DATA (FIXED VERSION)
-- This script first checks what columns exist, then verifies the data
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 0. CHECK ACTUAL COLUMN NAMES
-- =====================================================================

DO $$
DECLARE
    func_name_col TEXT;
    dept_name_col TEXT;
    role_name_col TEXT;
BEGIN
    -- Check org_functions name column
    SELECT column_name INTO func_name_col
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'org_functions'
        AND column_name IN ('department_name', 'name', 'function_name')
    LIMIT 1;
    
    -- Check org_departments name column
    SELECT column_name INTO dept_name_col
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'org_departments'
        AND column_name IN ('department_name', 'name')
    LIMIT 1;
    
    -- Check org_roles name column
    SELECT column_name INTO role_name_col
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'org_roles'
        AND column_name IN ('role_name', 'name')
    LIMIT 1;
    
    RAISE NOTICE 'org_functions name column: %', COALESCE(func_name_col, 'NOT FOUND');
    RAISE NOTICE 'org_departments name column: %', COALESCE(dept_name_col, 'NOT FOUND');
    RAISE NOTICE 'org_roles name column: %', COALESCE(role_name_col, 'NOT FOUND');
END $$;

-- =====================================================================
-- 1. VERIFY TENANT EXISTS
-- =====================================================================

SELECT '=== TENANT VERIFICATION ===' as section;

SELECT 
    id,
    name,
    slug,
    tenant_key,
    tenant_type,
    is_active
FROM organizations
WHERE tenant_key = 'pharma' OR tenant_key = 'pharmaceuticals'
ORDER BY created_at DESC;

-- =====================================================================
-- 2. VERIFY SCHEMA STRUCTURE
-- =====================================================================

SELECT '=== SCHEMA STRUCTURE CHECK ===' as section;

-- Check if tenant_id columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('org_functions', 'org_departments', 'org_roles')
    AND column_name IN ('tenant_id', 'allowed_tenants')
ORDER BY table_name, column_name;

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
-- 3. COUNT DATA BY TENANT (BASIC COUNTS)
-- =====================================================================

SELECT '=== DATA COUNTS BY TENANT ===' as section;

-- Count org_functions by tenant
SELECT 
    'org_functions' as table_name,
    CASE 
        WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
        WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharmaceuticals'
        WHEN tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89' THEN 'Digital Health'
        WHEN tenant_id IS NULL THEN 'NULL'
        ELSE 'Other/Unknown'
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
        ELSE 'Other/Unknown'
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
        ELSE 'Other/Unknown'
    END as tenant_name,
    COUNT(*) as count
FROM org_roles
GROUP BY tenant_id
ORDER BY table_name, tenant_name;

-- =====================================================================
-- 4. PHARMACEUTICALS TENANT SPECIFIC DATA
-- =====================================================================

SELECT '=== PHARMACEUTICALS TENANT DATA ===' as section;

-- Pharmaceuticals Functions
SELECT 
    'Functions' as data_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT id) as unique_ids
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Pharmaceuticals Departments
SELECT 
    'Departments' as data_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT function_id) as linked_functions
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Pharmaceuticals Roles
SELECT 
    'Roles' as data_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(DISTINCT function_id) as linked_functions,
    COUNT(DISTINCT department_id) as linked_departments
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- =====================================================================
-- 5. NORMALIZATION CHECKS - ORPHANED RECORDS
-- =====================================================================

SELECT '=== NORMALIZATION: ORPHANED RECORDS CHECK ===' as section;

-- Departments without valid function_id
SELECT 
    'Orphaned Departments (no function)' as issue_type,
    COUNT(*) as orphaned_count
FROM org_departments d
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (function_id IS NULL 
         OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'));

-- Roles without valid function_id or department_id
SELECT 
    'Orphaned Roles (no function or department)' as issue_type,
    COUNT(*) as orphaned_count
FROM org_roles r
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        function_id IS NULL 
        OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
        OR department_id IS NULL
        OR department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    );

-- =====================================================================
-- 6. RELATIONSHIP INTEGRITY
-- =====================================================================

SELECT '=== RELATIONSHIP INTEGRITY CHECK ===' as section;

-- Departments pointing to functions from different tenants
SELECT 
    'Cross-tenant Department-Function Links' as issue_type,
    COUNT(*) as issue_count
FROM org_departments d
INNER JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Roles pointing to functions/departments from different tenants
SELECT 
    'Cross-tenant Role-Function Links' as issue_type,
    COUNT(*) as issue_count
FROM org_roles r
INNER JOIN org_functions f ON r.function_id = f.id
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

SELECT 
    'Cross-tenant Role-Department Links' as issue_type,
    COUNT(*) as issue_count
FROM org_roles r
INNER JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND d.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- =====================================================================
-- 7. DATA COMPLETENESS
-- =====================================================================

SELECT '=== DATA COMPLETENESS CHECK ===' as section;

-- Functions with missing id (should never happen, but checking)
SELECT 
    'Functions with Missing id' as issue_type,
    COUNT(*) as issue_count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND id IS NULL;

-- Departments with missing function_id
SELECT 
    'Departments with Missing function_id' as issue_type,
    COUNT(*) as issue_count
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND function_id IS NULL;

-- Roles with missing relationships
SELECT 
    'Roles with Missing Relationships' as issue_type,
    COUNT(*) as issue_count
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (function_id IS NULL OR department_id IS NULL);

-- =====================================================================
-- 8. HIERARCHY STRUCTURE
-- =====================================================================

SELECT '=== HIERARCHY STRUCTURE CHECK ===' as section;

-- Functions with their department and role counts
SELECT 
    f.id as function_id,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY f.id
ORDER BY department_count DESC, role_count DESC;

-- Departments with their role counts
SELECT 
    d.id as department_id,
    f.id as function_id,
    COUNT(DISTINCT r.id) as role_count
FROM org_departments d
INNER JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY d.id, f.id
ORDER BY role_count DESC;

-- =====================================================================
-- 9. SUMMARY REPORT
-- =====================================================================

SELECT '=== SUMMARY REPORT ===' as section;

WITH pharma_data AS (
    SELECT 
        (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as functions_count,
        (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as departments_count,
        (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as roles_count,
        (SELECT COUNT(*) FROM org_departments d
         WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         AND (function_id IS NULL OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) as departments_orphaned,
        (SELECT COUNT(*) FROM org_roles r
         WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         AND (function_id IS NULL OR department_id IS NULL 
              OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
              OR department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) as roles_orphaned
)
SELECT 
    'Pharmaceuticals Tenant Org-Structure Summary' as report_title,
    functions_count,
    departments_count,
    roles_count,
    departments_orphaned as issues_departments,
    roles_orphaned as issues_roles,
    CASE 
        WHEN functions_count > 0 AND departments_count > 0 AND roles_count > 0 
            AND departments_orphaned = 0 AND roles_orphaned = 0
        THEN '✅ PASS'
        ELSE '❌ FAIL - Issues found'
    END as validation_status
FROM pharma_data;

