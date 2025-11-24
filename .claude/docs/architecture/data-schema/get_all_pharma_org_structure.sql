-- =====================================================================
-- GET ALL ORGANIZATIONAL STRUCTURE FOR PHARMACEUTICALS TENANT
-- Shows all functions, departments, and roles with IDs and names
-- =====================================================================

-- =====================================================================
-- 1. ALL FUNCTIONS
-- =====================================================================
SELECT 
    '=== ALL FUNCTIONS ===' as section;

SELECT 
    f.id as function_id,
    f.name::text as function_name,
    f.slug as function_slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    f.is_active,
    f.created_at
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)
GROUP BY f.id, f.name::text, f.slug, f.is_active, f.created_at
ORDER BY f.name::text;

-- =====================================================================
-- 1B. ALL FUNCTIONS (Simple - No Aggregations)
-- =====================================================================
SELECT 
    '=== ALL FUNCTIONS (Simple List) ===' as section;

SELECT 
    f.id as function_id,
    f.name::text as function_name,
    f.slug as function_slug,
    f.is_active,
    f.created_at
FROM public.org_functions f
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)
ORDER BY f.name::text;

-- =====================================================================
-- 2. ALL DEPARTMENTS
-- =====================================================================
SELECT 
    '=== ALL DEPARTMENTS ===' as section;

SELECT 
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    d.function_id,
    f.name::text as function_name,
    COUNT(DISTINCT r.id) as role_count,
    d.is_active,
    d.created_at
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE d.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (d.deleted_at IS NULL)
GROUP BY d.id, d.name, d.slug, d.function_id, f.name::text, d.is_active, d.created_at
ORDER BY f.name::text, d.name;

-- =====================================================================
-- 2B. ALL DEPARTMENTS (Simple - No Aggregations)
-- =====================================================================
SELECT 
    '=== ALL DEPARTMENTS (Simple List) ===' as section;

SELECT 
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    d.function_id,
    f.name::text as function_name,
    d.is_active,
    d.created_at
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
WHERE d.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (d.deleted_at IS NULL)
ORDER BY f.name::text, d.name;

-- =====================================================================
-- 3. ALL ROLES
-- =====================================================================
SELECT 
    '=== ALL ROLES ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    r.is_active,
    r.created_at
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.tenant_id = r.tenant_id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)
GROUP BY r.id, r.name, r.slug, r.function_id, f.name::text, r.department_id, d.name, r.is_active, r.created_at
ORDER BY f.name::text, d.name, r.name;

-- =====================================================================
-- 3B. ALL ROLES (Simple - No Aggregations)
-- =====================================================================
SELECT 
    '=== ALL ROLES (Simple List) ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name,
    r.is_active,
    r.created_at
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)
ORDER BY f.name::text, d.name, r.name;

-- =====================================================================
-- 4. HIERARCHICAL VIEW: Functions -> Departments -> Roles (ALL)
-- =====================================================================
SELECT 
    '=== HIERARCHICAL VIEW: Functions -> Departments -> Roles (ALL) ===' as section;

SELECT 
    f.id as function_id,
    f.name::text as function_name,
    d.id as department_id,
    d.name as department_name,
    r.id as role_id,
    r.name as role_name,
    COUNT(DISTINCT p.id) as persona_count
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.department_id = d.id AND r.tenant_id = f.tenant_id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.tenant_id = f.tenant_id
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)
AND (d.deleted_at IS NULL OR d.id IS NULL)
AND (r.deleted_at IS NULL OR r.id IS NULL)
GROUP BY f.id, f.name::text, d.id, d.name, r.id, r.name
ORDER BY f.name::text, d.name, r.name;

-- =====================================================================
-- 4B. COMPLETE FLAT LIST: All Functions, Departments, Roles
-- =====================================================================
SELECT 
    '=== COMPLETE FLAT LIST: All Functions, Departments, Roles ===' as section;

SELECT 
    'Function' as entity_type,
    f.id as entity_id,
    f.name::text as entity_name,
    f.slug as entity_slug,
    NULL::uuid as parent_id,
    NULL::text as parent_name,
    f.is_active,
    f.created_at
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
    d.slug as entity_slug,
    d.function_id as parent_id,
    f.name::text as parent_name,
    d.is_active,
    d.created_at
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
    r.slug as entity_slug,
    r.department_id as parent_id,
    d.name as parent_name,
    r.is_active,
    r.created_at
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)

ORDER BY entity_type, parent_name, entity_name;

-- =====================================================================
-- 5. SUMMARY STATISTICS
-- =====================================================================
SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    COUNT(DISTINCT f.id) as total_functions,
    COUNT(DISTINCT d.id) as total_departments,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT p.id) as total_personas,
    COUNT(DISTINCT CASE WHEN r.function_id IS NOT NULL AND r.department_id IS NOT NULL THEN r.id END) as roles_with_function_and_dept,
    COUNT(DISTINCT CASE WHEN r.function_id IS NULL OR r.department_id IS NULL THEN r.id END) as roles_missing_function_or_dept,
    COUNT(DISTINCT CASE WHEN p.function_id IS NOT NULL AND p.department_id IS NOT NULL AND p.role_id IS NOT NULL THEN p.id END) as fully_mapped_personas
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
LEFT JOIN public.personas p ON p.tenant_id = f.tenant_id
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL);

-- =====================================================================
-- 6. ROLES MISSING FUNCTION_ID OR DEPARTMENT_ID (ALL ROLES)
-- =====================================================================
SELECT 
    '=== ROLES MISSING FUNCTION_ID OR DEPARTMENT_ID ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name,
    CASE 
        WHEN r.function_id IS NULL AND r.department_id IS NULL THEN 'Missing Both'
        WHEN r.function_id IS NULL THEN 'Missing Function'
        WHEN r.department_id IS NULL THEN 'Missing Department'
        ELSE 'Complete'
    END as mapping_status
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.deleted_at IS NULL)
ORDER BY 
    CASE 
        WHEN r.function_id IS NULL AND r.department_id IS NULL THEN 1
        WHEN r.function_id IS NULL THEN 2
        WHEN r.department_id IS NULL THEN 3
        ELSE 4
    END,
    r.name;

-- =====================================================================
-- 7. PERSONAS MISSING FUNCTION_ID, DEPARTMENT_ID, OR ROLE_ID
-- =====================================================================
SELECT 
    '=== PERSONAS MISSING FUNCTION_ID, DEPARTMENT_ID, OR ROLE_ID ===' as section;

SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    p.function_id,
    f.name::text as function_name,
    p.department_id,
    d.name as department_name,
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN 'Missing All'
        WHEN p.role_id IS NULL THEN 'Missing Role'
        WHEN p.function_id IS NULL THEN 'Missing Function'
        WHEN p.department_id IS NULL THEN 'Missing Department'
    END as missing_status
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL)
AND (p.role_id IS NULL OR p.function_id IS NULL OR p.department_id IS NULL)
ORDER BY 
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN 1
        WHEN p.role_id IS NULL THEN 2
        WHEN p.function_id IS NULL THEN 3
        WHEN p.department_id IS NULL THEN 4
    END,
    p.name
LIMIT 100;

