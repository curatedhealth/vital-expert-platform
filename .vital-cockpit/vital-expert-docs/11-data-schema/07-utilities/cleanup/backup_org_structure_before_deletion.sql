-- =============================================
-- BACKUP: Export All Functions, Departments, Roles
-- Before clean slate deletion
-- =============================================

-- BACKUP 1: Functions with all details
SELECT 
    '=== BACKUP: FUNCTIONS ===' as section;

SELECT 
    id,
    name,
    slug,
    tenant_id,
    created_at,
    updated_at,
    deleted_at,
    (SELECT name FROM tenants WHERE id = org_functions.tenant_id) as tenant_name,
    (SELECT COUNT(*) FROM org_departments WHERE function_id = org_functions.id) as department_count,
    (SELECT COUNT(*) FROM org_roles WHERE function_id = org_functions.id) as role_count
FROM public.org_functions
ORDER BY name;

-- BACKUP 2: Departments with all details
SELECT 
    '=== BACKUP: DEPARTMENTS ===' as section;

SELECT 
    d.id,
    d.name,
    d.slug,
    d.tenant_id,
    d.function_id,
    f.name as function_name,
    d.created_at,
    d.updated_at,
    d.deleted_at,
    (SELECT name FROM tenants WHERE id = d.tenant_id) as tenant_name,
    (SELECT COUNT(*) FROM org_roles WHERE department_id = d.id) as role_count
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
ORDER BY f.name, d.name;

-- BACKUP 3: Roles with all details
SELECT 
    '=== BACKUP: ROLES ===' as section;

SELECT 
    r.id,
    r.name,
    r.slug,
    r.tenant_id,
    r.function_id,
    r.department_id,
    f.name as function_name,
    d.name as department_name,
    r.created_at,
    r.updated_at,
    r.deleted_at,
    (SELECT name FROM tenants WHERE id = r.tenant_id) as tenant_name,
    (SELECT COUNT(*) FROM personas WHERE role_id = r.id AND deleted_at IS NULL) as active_persona_count,
    (SELECT COUNT(*) FROM personas WHERE role_id = r.id) as total_persona_count
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
ORDER BY f.name, d.name, r.name;

-- BACKUP 4: Unique function names (for recreation)
SELECT 
    '=== UNIQUE FUNCTION NAMES (For Recreation) ===' as section;

SELECT DISTINCT
    name,
    slug,
    COUNT(*) as occurrence_count,
    ARRAY_AGG(DISTINCT tenant_id::text) FILTER (WHERE tenant_id IS NOT NULL) as tenant_ids
FROM public.org_functions
GROUP BY name, slug
ORDER BY name;

-- BACKUP 5: Unique department names with their functions
SELECT 
    '=== UNIQUE DEPARTMENT NAMES (For Recreation) ===' as section;

SELECT DISTINCT
    d.name as department_name,
    d.slug as department_slug,
    f.name as function_name,
    COUNT(*) as occurrence_count,
    ARRAY_AGG(DISTINCT d.tenant_id::text) FILTER (WHERE d.tenant_id IS NOT NULL) as tenant_ids
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
GROUP BY d.name, d.slug, f.name
ORDER BY f.name, d.name;

-- BACKUP 6: Unique role names with their department and function
SELECT 
    '=== UNIQUE ROLE NAMES (For Recreation) ===' as section;

SELECT DISTINCT
    r.name as role_name,
    r.slug as role_slug,
    d.name as department_name,
    f.name as function_name,
    COUNT(*) as occurrence_count,
    ARRAY_AGG(DISTINCT r.tenant_id::text) FILTER (WHERE r.tenant_id IS NOT NULL) as tenant_ids,
    SUM((SELECT COUNT(*) FROM personas WHERE role_id = r.id AND deleted_at IS NULL)) as total_active_personas
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
GROUP BY r.name, r.slug, d.name, f.name
ORDER BY f.name, d.name, r.name;

-- BACKUP 7: Pharmaceuticals-specific structure (our primary focus)
SELECT 
    '=== PHARMACEUTICALS ORGANIZATIONAL STRUCTURE ===' as section;

WITH pharma_tenant AS (
    SELECT id FROM tenants WHERE slug IN ('pharmaceuticals', 'pharma') LIMIT 1
)
SELECT 
    f.name as function_name,
    f.slug as function_slug,
    d.name as department_name,
    d.slug as department_slug,
    r.name as role_name,
    r.slug as role_slug,
    r.id as role_id,
    (SELECT COUNT(*) FROM personas WHERE role_id = r.id AND deleted_at IS NULL) as active_personas
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.tenant_id IN (SELECT id FROM pharma_tenant)
   OR r.tenant_id IS NULL
ORDER BY f.name, d.name, r.name;

-- BACKUP 8: Statistics Summary
SELECT 
    '=== STATISTICS SUMMARY ===' as section;

SELECT 
    'Total Records' as metric,
    (SELECT COUNT(*) FROM org_functions) as functions,
    (SELECT COUNT(*) FROM org_departments) as departments,
    (SELECT COUNT(*) FROM org_roles) as roles,
    (SELECT COUNT(*) FROM personas) as personas
UNION ALL
SELECT 
    'Active Records' as metric,
    (SELECT COUNT(*) FROM org_functions WHERE deleted_at IS NULL) as functions,
    (SELECT COUNT(*) FROM org_departments WHERE deleted_at IS NULL) as departments,
    (SELECT COUNT(*) FROM org_roles WHERE deleted_at IS NULL) as roles,
    (SELECT COUNT(*) FROM personas WHERE deleted_at IS NULL) as personas
UNION ALL
SELECT 
    'Unique Names' as metric,
    (SELECT COUNT(DISTINCT name) FROM org_functions) as functions,
    (SELECT COUNT(DISTINCT name) FROM org_departments) as departments,
    (SELECT COUNT(DISTINCT name) FROM org_roles) as roles,
    NULL as personas
UNION ALL
SELECT 
    'Unique Slugs' as metric,
    (SELECT COUNT(DISTINCT slug) FROM org_functions) as functions,
    (SELECT COUNT(DISTINCT slug) FROM org_departments) as departments,
    (SELECT COUNT(DISTINCT slug) FROM org_roles) as roles,
    NULL as personas;

-- BACKUP 9: Personas summary (to know what we'll lose)
SELECT 
    '=== PERSONAS TO BE DELETED ===' as section;

SELECT 
    r.name as role_name,
    COUNT(p.id) as persona_count,
    ARRAY_AGG(p.name ORDER BY p.name) as persona_names
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
GROUP BY r.id, r.name
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;

