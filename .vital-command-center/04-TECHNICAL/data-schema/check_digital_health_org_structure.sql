-- =====================================================================
-- CHECK DIGITAL HEALTH ORG STRUCTURE
-- Query existing functions and departments for Digital Health tenant
-- =====================================================================

-- Digital Health Tenant ID: 684f6c2c-b50d-4726-ad92-c76c3b785a89

-- =====================================================================
-- 1. FUNCTIONS COUNT AND LIST
-- =====================================================================

SELECT '=== DIGITAL HEALTH FUNCTIONS ===' as section;

SELECT 
    id,
    name,
    slug,
    tenant_id,
    is_active,
    created_at
FROM org_functions
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
ORDER BY name;

SELECT 
    'Total Functions' as metric,
    COUNT(*)::text as value
FROM org_functions
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';

-- =====================================================================
-- 2. DEPARTMENTS COUNT AND LIST
-- =====================================================================

SELECT '=== DIGITAL HEALTH DEPARTMENTS ===' as section;

SELECT 
    d.id,
    d.name as department_name,
    d.slug,
    d.tenant_id,
    d.function_id,
    f.name as function_name,
    d.is_active,
    d.created_at
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
ORDER BY f.name, d.name;

SELECT 
    'Total Departments' as metric,
    COUNT(*)::text as value
FROM org_departments
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';

-- =====================================================================
-- 3. DEPARTMENTS BY FUNCTION
-- =====================================================================

SELECT '=== DEPARTMENTS BY FUNCTION ===' as section;

SELECT 
    f.name as function_name,
    COUNT(d.id) as department_count,
    STRING_AGG(d.name, ', ' ORDER BY d.name) as departments
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
WHERE f.tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
GROUP BY f.id, f.name
ORDER BY department_count DESC, f.name;

-- =====================================================================
-- 4. EXISTING ROLES COUNT
-- =====================================================================

SELECT '=== EXISTING ROLES ===' as section;

SELECT 
    'Total Roles' as metric,
    COUNT(*)::text as value
FROM org_roles
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';

SELECT 
    d.name as department_name,
    f.name as function_name,
    COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
GROUP BY d.id, d.name, f.name
ORDER BY role_count DESC, f.name, d.name;

-- =====================================================================
-- 5. DEPARTMENTS WITHOUT ROLES
-- =====================================================================

SELECT '=== DEPARTMENTS WITHOUT ROLES ===' as section;

SELECT 
    d.id,
    d.name as department_name,
    f.name as function_name,
    COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
GROUP BY d.id, d.name, f.name
HAVING COUNT(r.id) = 0
ORDER BY f.name, d.name;

