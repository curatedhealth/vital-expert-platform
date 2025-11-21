-- =====================================================================
-- DIAGNOSE PERSONA MAPPING ISSUE
-- Check why personas are mapped to different roles and missing departments
-- =====================================================================

-- Check personas with null function_name (the issue case)
SELECT 
    'PROBLEM_CASE' as section,
    p.id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.role_id,
    r.name as role_name,
    r.function_id as role_function_id,
    r.department_id as role_department_id,
    p.function_id as persona_function_id,
    p.department_id as persona_department_id,
    f.name as function_name,
    d.name as department_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NOT NULL
AND (p.function_id IS NULL OR p.department_id IS NULL)
AND (p.deleted_at IS NULL)
ORDER BY p.slug
LIMIT 20;

-- Check if roles have function_id and department_id
SELECT 
    'ROLES_WITHOUT_ORG_STRUCTURE' as section,
    r.id,
    r.name as role_name,
    r.function_id,
    r.department_id,
    f.name as function_name,
    d.name as department_name
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.function_id IS NULL OR r.department_id IS NULL)
ORDER BY r.name
LIMIT 20;

-- Check personas with same slug pattern but different roles
SELECT 
    'DUPLICATE_ROLE_MAPPINGS' as section,
    SUBSTRING(p.slug FROM '^[^-]+-[^-]+-(.+)$') as role_part_from_slug,
    COUNT(DISTINCT p.role_id) as different_roles_count,
    COUNT(DISTINCT p.id) as persona_count,
    STRING_AGG(DISTINCT r.name, ', ' ORDER BY r.name) as mapped_roles,
    STRING_AGG(DISTINCT p.name, ', ' ORDER BY p.name) as persona_names
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NOT NULL
AND (p.deleted_at IS NULL)
GROUP BY SUBSTRING(p.slug FROM '^[^-]+-[^-]+-(.+)$')
HAVING COUNT(DISTINCT p.role_id) > 1
ORDER BY different_roles_count DESC
LIMIT 20;

