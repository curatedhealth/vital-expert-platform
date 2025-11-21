-- =====================================================================
-- GET ALL PHARMA TENANT FUNCTIONS, DEPARTMENTS, AND ROLES
-- Returns all functions, departments, and roles with IDs and names
-- =====================================================================

-- =====================================================================
-- ALL FUNCTIONS (ID and Name)
-- =====================================================================
SELECT 
    f.id as function_id,
    f.name::text as function_name
FROM public.org_functions f
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)
ORDER BY f.name::text;

-- =====================================================================
-- ALL DEPARTMENTS (ID and Name)
-- =====================================================================
SELECT 
    d.id as department_id,
    d.name as department_name
FROM public.org_departments d
WHERE d.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (d.deleted_at IS NULL)
ORDER BY d.name;

-- =====================================================================
-- ALL ROLES (ID and Name)
-- =====================================================================
SELECT 
    r.id as role_id,
    r.name as role_name
FROM public.org_roles r
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)
ORDER BY r.name;

-- =====================================================================
-- UNIFIED VIEW: All Functions, Departments, and Roles in One Result Set
-- =====================================================================
SELECT 
    'Function' as entity_type,
    f.id as entity_id,
    f.name::text as entity_name,
    NULL::uuid as parent_id,
    NULL::text as parent_name
FROM public.org_functions f
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)

UNION ALL

SELECT 
    'Department' as entity_type,
    d.id as entity_id,
    d.name as entity_name,
    d.function_id as parent_id,
    f.name::text as parent_name
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
WHERE d.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (d.deleted_at IS NULL)

UNION ALL

SELECT 
    'Role' as entity_type,
    r.id as entity_id,
    r.name as entity_name,
    r.department_id as parent_id,
    d.name as parent_name
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)

ORDER BY entity_type, parent_name, entity_name;

