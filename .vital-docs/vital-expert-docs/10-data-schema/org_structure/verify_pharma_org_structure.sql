-- =====================================================================
-- VERIFY PHARMACEUTICALS TENANT ORG-STRUCTURE DATA
-- This script verifies that the Pharmaceuticals tenant has correct
-- org-structure data (business functions, departments, roles) and
-- ensures the schema is normalized
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b
-- Note: tenant_id should reference organizations(id), not tenants(id)

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

-- Check actual column names in org_functions
SELECT 
    'org_functions columns' as info,
    string_agg(column_name, ', ' ORDER BY column_name) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'org_functions'
    AND column_name IN ('department_name', 'name', 'function_name');

-- Check actual column names in org_departments
SELECT 
    'org_departments columns' as info,
    string_agg(column_name, ', ' ORDER BY column_name) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'org_departments'
    AND column_name IN ('department_name', 'name');

-- Check actual column names in org_roles
SELECT 
    'org_roles columns' as info,
    string_agg(column_name, ', ' ORDER BY column_name) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'org_roles'
    AND column_name IN ('role_name', 'name');

-- =====================================================================
-- 3. COUNT DATA BY TENANT
-- =====================================================================

SELECT '=== DATA COUNTS BY TENANT ===' as section;

-- Count org_functions by tenant
-- Note: Using COALESCE to handle both 'department_name' and 'name' column possibilities
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
-- Note: Using basic count first, then we'll check column names dynamically
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
-- 5. NORMALIZATION CHECKS - DUPLICATES
-- =====================================================================

SELECT '=== NORMALIZATION: DUPLICATE CHECK ===' as section;

-- Check for duplicate function names within Pharmaceuticals tenant
SELECT 
    'Duplicate Function Names' as issue_type,
    name,
    COUNT(*) as duplicate_count,
    array_agg(id::text) as ids
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY name
HAVING COUNT(*) > 1;

-- Check for duplicate department names within Pharmaceuticals tenant
SELECT 
    'Duplicate Department Names' as issue_type,
    name,
    COUNT(*) as duplicate_count,
    array_agg(id::text) as ids
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY name
HAVING COUNT(*) > 1;

-- Check for duplicate role names within Pharmaceuticals tenant
SELECT 
    'Duplicate Role Names' as issue_type,
    name,
    COUNT(*) as duplicate_count,
    array_agg(id::text) as ids
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY name
HAVING COUNT(*) > 1;

-- Check for duplicate slugs within Pharmaceuticals tenant (slug is the unique identifier)
SELECT 
    'Duplicate Slugs - Functions' as issue_type,
    slug,
    COUNT(*) as duplicate_count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

SELECT 
    'Duplicate Slugs - Departments' as issue_type,
    slug,
    COUNT(*) as duplicate_count
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

SELECT 
    'Duplicate Slugs - Roles' as issue_type,
    slug,
    COUNT(*) as duplicate_count
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- =====================================================================
-- 6. NORMALIZATION CHECKS - ORPHANED RECORDS
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
-- 7. RELATIONSHIP INTEGRITY
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
-- 8. DATA COMPLETENESS
-- =====================================================================

SELECT '=== DATA COMPLETENESS CHECK ===' as section;

-- Functions with missing required fields
SELECT 
    'Functions with Missing Data' as issue_type,
    COUNT(*) as issue_count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (name IS NULL OR slug IS NULL OR slug = '');

-- Departments with missing required fields
SELECT 
    'Departments with Missing Data' as issue_type,
    COUNT(*) as issue_count
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (name IS NULL OR name = '' OR slug IS NULL OR slug = '' OR function_id IS NULL);

-- Roles with missing required fields
SELECT 
    'Roles with Missing Data' as issue_type,
    COUNT(*) as issue_count
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (name IS NULL OR name = '' OR slug IS NULL OR slug = '');

-- =====================================================================
-- 9. HIERARCHY STRUCTURE
-- =====================================================================

SELECT '=== HIERARCHY STRUCTURE CHECK ===' as section;

-- Functions with their department counts
SELECT 
    f.name as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY f.id, f.name
ORDER BY department_count DESC, role_count DESC;

-- Departments with their role counts
SELECT 
    d.name as department_name,
    f.name as function_name,
    COUNT(DISTINCT r.id) as role_count
FROM org_departments d
INNER JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY d.id, d.name, f.name
ORDER BY role_count DESC;

-- =====================================================================
-- 10. SUMMARY REPORT
-- =====================================================================

SELECT '=== SUMMARY REPORT ===' as section;

WITH pharma_data AS (
    SELECT 
        (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as functions_count,
        (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as departments_count,
        (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as roles_count,
        (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' AND name IS NULL) as functions_missing_name,
        (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' AND function_id IS NULL) as departments_orphaned,
        (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' AND (function_id IS NULL OR department_id IS NULL)) as roles_orphaned
)
SELECT 
    'Pharmaceuticals Tenant Org-Structure Summary' as report_title,
    functions_count,
    departments_count,
    roles_count,
    functions_missing_name as issues_functions,
    departments_orphaned as issues_departments,
    roles_orphaned as issues_roles,
    CASE 
        WHEN functions_count > 0 AND departments_count > 0 AND roles_count > 0 
            AND functions_missing_name = 0 AND departments_orphaned = 0 AND roles_orphaned = 0
        THEN '✅ PASS'
        ELSE '❌ FAIL - Issues found'
    END as validation_status
FROM pharma_data;

