-- =====================================================================
-- QUERY PHARMACEUTICALS TENANT ORG-STRUCTURE DATA
-- Shows all functions, departments, and roles with their relationships
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 1. FUNCTIONS
-- =====================================================================

SELECT '=== FUNCTIONS ===' as section;

SELECT 
    name as function_name,
    slug,
    description,
    is_active,
    created_at
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY name;

-- Function counts
SELECT 
    'Total Functions' as metric,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'Active Functions',
    COUNT(*)
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
AND is_active = true;

-- =====================================================================
-- 2. DEPARTMENTS BY FUNCTION
-- =====================================================================

SELECT '=== DEPARTMENTS BY FUNCTION ===' as section;

SELECT 
    f.name as function_name,
    d.name as department_name,
    d.slug,
    d.description,
    d.is_active,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY f.id, f.name, d.id, d.name, d.slug, d.description, d.is_active
ORDER BY f.name, d.name;

-- Department counts by function
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

-- Total department counts
SELECT 
    'Total Departments' as metric,
    COUNT(*) as count
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'Active Departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
AND is_active = true;

-- =====================================================================
-- 3. ROLES BY DEPARTMENT AND FUNCTION
-- =====================================================================

SELECT '=== ROLES BY DEPARTMENT ===' as section;

SELECT 
    f.name as function_name,
    d.name as department_name,
    r.name as role_name,
    r.slug,
    r.seniority_level,
    r.is_active
FROM org_roles r
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY f.name, d.name, r.seniority_level, r.name
LIMIT 100;

-- Role counts by seniority level
SELECT 
    COALESCE(seniority_level, 'Not Specified') as seniority_level,
    COUNT(*) as role_count
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY seniority_level
ORDER BY 
    CASE seniority_level
        WHEN 'Executive' THEN 1
        WHEN 'Senior' THEN 2
        WHEN 'Mid' THEN 3
        WHEN 'Junior' THEN 4
        WHEN 'Entry' THEN 5
        ELSE 6
    END;

-- Role counts by function
SELECT 
    f.name as function_name,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY f.id, f.name
ORDER BY role_count DESC;

-- Total role counts
SELECT 
    'Total Roles' as metric,
    COUNT(*) as count
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'Active Roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
AND is_active = true;

-- =====================================================================
-- 4. HIERARCHY SUMMARY
-- =====================================================================

SELECT '=== HIERARCHY SUMMARY ===' as section;

SELECT 
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(DISTINCT r.id) as roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Executive') as executive_roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Senior') as senior_roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Mid') as mid_roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Junior') as junior_roles
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
GROUP BY f.id, f.name
ORDER BY departments DESC, roles DESC;

-- =====================================================================
-- 5. COMPLETE HIERARCHY TREE
-- =====================================================================

SELECT '=== COMPLETE HIERARCHY TREE ===' as section;

SELECT 
    f.name as function_name,
    d.name as department_name,
    r.name as role_name,
    r.seniority_level
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
ORDER BY f.name, d.name, 
    CASE r.seniority_level
        WHEN 'Executive' THEN 1
        WHEN 'Senior' THEN 2
        WHEN 'Mid' THEN 3
        WHEN 'Junior' THEN 4
        WHEN 'Entry' THEN 5
        ELSE 6
    END,
    r.name;

