-- =====================================================================
-- VERIFY PERSONA MAPPING RESULTS
-- Check how many personas were successfully mapped to roles
-- =====================================================================

-- Summary: Mapping status
SELECT 
    'MAPPING_SUMMARY' as section,
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped,
    COUNT(CASE WHEN role_id IS NULL THEN 1 END) as still_unmapped,
    ROUND(100.0 * COUNT(role_id) / NULLIF(COUNT(*), 0), 2) as percent_mapped
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL);

-- Sample of successfully mapped personas
SELECT 
    'MAPPED_PERSONAS_SAMPLE' as section,
    p.name as persona_name,
    p.slug as persona_slug,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NOT NULL
AND (p.deleted_at IS NULL)
ORDER BY f.name, d.name, r.name, p.name
LIMIT 50;

-- Roles with multiple personas (showing the 3-5 personas per role pattern)
SELECT 
    'ROLES_WITH_PERSONAS' as section,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count,
    STRING_AGG(p.name, ', ' ORDER BY p.name) as persona_names
FROM public.org_roles r
JOIN public.personas p ON p.role_id = r.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL)
GROUP BY r.id, r.name, f.name, d.name
HAVING COUNT(p.id) >= 1
ORDER BY persona_count DESC, r.name
LIMIT 50;

-- Still unmapped personas (if any)
SELECT 
    'UNMAPPED_PERSONAS' as section,
    p.id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.role_id,
    p.function_id,
    p.department_id
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NULL
AND (p.deleted_at IS NULL)
ORDER BY p.name
LIMIT 50;

-- Distribution by function
SELECT 
    'BY_FUNCTION' as section,
    f.name as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT d.id) as department_count
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL)
GROUP BY f.name
ORDER BY persona_count DESC;

