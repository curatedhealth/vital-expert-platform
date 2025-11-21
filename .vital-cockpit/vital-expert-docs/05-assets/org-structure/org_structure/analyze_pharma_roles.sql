-- =====================================================================
-- ANALYZE PHARMA ROLES - Current State
-- Shows all roles in Pharmaceuticals tenant and their current assignments
-- =====================================================================

SELECT 
    r.id,
    r.name as role_name,
    r.slug as role_slug,
    r.description,
    r.function_id,
    f.name as function_name,
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
ORDER BY r.name;

