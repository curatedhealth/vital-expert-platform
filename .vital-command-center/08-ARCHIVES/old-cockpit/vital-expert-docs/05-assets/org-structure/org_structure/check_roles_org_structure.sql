-- =====================================================================
-- CHECK IF ROLES HAVE FUNCTION_ID AND DEPARTMENT_ID
-- =====================================================================

-- Check the 3 roles that have personas mapped
SELECT 
    'ROLES_STATUS' as section,
    r.id,
    r.name as role_name,
    r.function_id,
    r.department_id,
    f.name as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND r.name::text IN ('Medical Science Liaison', 'Medical Information Manager', 'Medical Affairs Director')
GROUP BY r.id, r.name, r.function_id, r.department_id, f.name, d.name
ORDER BY r.name;

-- Check if there are other roles with the same names that DO have org structure
SELECT 
    'SIMILAR_ROLES_WITH_ORG_STRUCTURE' as section,
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
AND (
    r.name::text ILIKE '%Medical Science Liaison%'
    OR r.name::text ILIKE '%Medical Information Manager%'
    OR r.name::text ILIKE '%Medical Affairs Director%'
)
AND r.function_id IS NOT NULL
AND r.department_id IS NOT NULL
ORDER BY r.name;

