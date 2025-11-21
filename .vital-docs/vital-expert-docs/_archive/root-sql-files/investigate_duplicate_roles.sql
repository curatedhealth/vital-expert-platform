-- =====================================================================
-- INVESTIGATE DUPLICATE ROLES
-- Finds roles with duplicate names and shows why they exist
-- =====================================================================

-- =====================================================================
-- ROLES WITH DUPLICATE NAMES
-- =====================================================================
SELECT 
    '=== ROLES WITH DUPLICATE NAMES ===' as section;

SELECT 
    r.name as role_name,
    COUNT(*) as duplicate_count,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.function_id) as function_count,
    COUNT(DISTINCT r.department_id) as department_count,
    STRING_AGG(DISTINCT t.name, ', ') as tenant_names,
    STRING_AGG(DISTINCT f.name::text, ', ') as function_names,
    STRING_AGG(DISTINCT d.name, ', ') as department_names
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
GROUP BY r.name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, r.name;

-- =====================================================================
-- DETAILED VIEW: All Duplicate Roles with Full Details
-- =====================================================================
SELECT 
    '=== DETAILED VIEW: All Duplicate Roles ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    t.name as tenant_name,
    t.slug as tenant_slug,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count,
    r.created_at,
    r.updated_at
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT name 
      FROM public.org_roles 
      WHERE deleted_at IS NULL 
      GROUP BY name 
      HAVING COUNT(*) > 1
  )
GROUP BY r.id, r.name, r.slug, t.name, t.slug, f.name, d.name, r.created_at, r.updated_at
ORDER BY r.name, t.name, f.name, d.name;

-- =====================================================================
-- DUPLICATE ROLES BY TENANT
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES BY TENANT ===' as section;

SELECT 
    t.name as tenant_name,
    r.name as role_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(r.id::text, ', ') as role_ids,
    STRING_AGG(
        COALESCE(f.name::text, 'No Function') || ' / ' || COALESCE(d.name, 'No Department'),
        ' | '
    ) as function_dept_combinations
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
GROUP BY t.id, t.name, r.name
HAVING COUNT(*) > 1
ORDER BY t.name, duplicate_count DESC, r.name;

-- =====================================================================
-- DUPLICATE ROLES WITHIN SAME FUNCTION/DEPARTMENT
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES IN SAME FUNCTION/DEPARTMENT (Potential Real Duplicates) ===' as section;

SELECT 
    r.name as role_name,
    t.name as tenant_name,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(r.id::text, ', ') as role_ids,
    STRING_AGG(r.slug, ', ') as role_slugs
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
GROUP BY r.name, t.id, t.name, f.id, f.name, d.id, d.name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, r.name;

-- =====================================================================
-- SUMMARY STATISTICS
-- =====================================================================
SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names,
    COUNT(*) as total_roles,
    COUNT(*) - COUNT(DISTINCT r.name) as duplicate_roles_count,
    COUNT(DISTINCT CASE WHEN dup_counts.dup_count > 1 THEN r.name END) as role_names_with_duplicates
FROM public.org_roles r
LEFT JOIN (
    SELECT name, COUNT(*) as dup_count
    FROM public.org_roles
    WHERE deleted_at IS NULL
    GROUP BY name
    HAVING COUNT(*) > 1
) dup_counts ON r.name = dup_counts.name
WHERE r.deleted_at IS NULL;

