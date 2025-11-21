-- =====================================================================
-- VERIFY PHARMACEUTICALS TENANT AFTER POPULATION
-- Quick verification to confirm data was populated correctly
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

SELECT '=== PHARMACEUTICALS TENANT DATA SUMMARY ===' as section;

-- Counts
SELECT 
    'org_functions' as table_name,
    COUNT(*) as total_count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Sample Functions
SELECT '=== SAMPLE FUNCTIONS ===' as section;

SELECT 
    name,
    slug,
    is_active,
    created_at
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY name
LIMIT 10;

-- Sample Departments with Functions
SELECT '=== SAMPLE DEPARTMENTS ===' as section;

SELECT 
    d.name as department_name,
    d.slug,
    f.name as function_name,
    d.is_active
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY f.name, d.name
LIMIT 15;

-- Sample Roles with Departments and Functions
SELECT '=== SAMPLE ROLES ===' as section;

SELECT 
    r.name as role_name,
    r.slug,
    f.name as function_name,
    d.name as department_name,
    r.seniority_level,
    r.is_active
FROM org_roles r
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY f.name, d.name, r.name
LIMIT 15;

-- Hierarchy Structure
SELECT '=== HIERARCHY STRUCTURE ===' as section;

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

-- Data Integrity Check
SELECT '=== DATA INTEGRITY CHECK ===' as section;

SELECT 
    'Orphaned Departments' as issue_type,
    COUNT(*) as count
FROM org_departments d
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (d.function_id IS NULL 
         OR d.function_id NOT IN (
             SELECT id FROM org_functions 
             WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         ))
UNION ALL
SELECT 
    'Orphaned Roles',
    COUNT(*)
FROM org_roles r
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        r.function_id IS NULL 
        OR r.function_id NOT IN (
            SELECT id FROM org_functions 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
        OR r.department_id IS NULL
        OR r.department_id NOT IN (
            SELECT id FROM org_departments 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
    )
UNION ALL
SELECT 
    'Cross-Tenant Links',
    COUNT(*)
FROM org_departments d
INNER JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Final Summary
SELECT '=== FINAL SUMMARY ===' as section;

WITH pharma_data AS (
    SELECT 
        (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as functions_count,
        (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as departments_count,
        (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as roles_count,
        (SELECT COUNT(*) FROM org_departments d
         WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         AND (d.function_id IS NULL OR d.function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) as departments_orphaned,
        (SELECT COUNT(*) FROM org_roles r
         WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         AND (r.function_id IS NULL OR r.department_id IS NULL 
              OR r.function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
              OR r.department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) as roles_orphaned
)
SELECT 
    'Pharmaceuticals Tenant Org-Structure' as report_title,
    functions_count,
    departments_count,
    roles_count,
    departments_orphaned as issues_departments,
    roles_orphaned as issues_roles,
    CASE 
        WHEN functions_count > 0 AND departments_count > 0 AND roles_count > 0 
            AND departments_orphaned = 0 AND roles_orphaned = 0
        THEN '✅ PASS - Data normalized and complete'
        ELSE '❌ FAIL - Issues found'
    END as validation_status
FROM pharma_data;

