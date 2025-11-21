-- =====================================================================
-- DIAGNOSE WHY DEPARTMENTS AND ROLES WEREN'T POPULATED
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

SELECT '=== CURRENT PHARMA DATA ===' as section;

SELECT 
    'Functions' as type,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'Departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'Roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Check what source tenant was used
SELECT '=== SOURCE TENANT DATA ===' as section;

SELECT 
    tenant_id,
    COUNT(*) as function_count
FROM org_functions
WHERE tenant_id IS NOT NULL
GROUP BY tenant_id
ORDER BY function_count DESC;

-- Check if source tenant has departments
SELECT 
    'Source Departments' as type,
    COUNT(*) as count
FROM org_departments
WHERE tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
);

-- Check if source tenant has roles
SELECT 
    'Source Roles' as type,
    COUNT(*) as count
FROM org_roles
WHERE tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
);

-- Check function name matching
SELECT '=== FUNCTION NAME MATCHING ===' as section;

SELECT 
    source_f.name as source_function_name,
    source_f.id as source_function_id,
    pharma_f.name as pharma_function_name,
    pharma_f.id as pharma_function_id
FROM org_functions source_f
CROSS JOIN org_functions pharma_f
WHERE source_f.tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
AND pharma_f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
AND source_f.name = pharma_f.name
LIMIT 10;

-- Check if departments exist in source that could be copied
SELECT '=== AVAILABLE SOURCE DEPARTMENTS ===' as section;

SELECT 
    d.name as department_name,
    d.tenant_id,
    f.name as function_name,
    f.id as function_id
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
ORDER BY f.name, d.name
LIMIT 20;

