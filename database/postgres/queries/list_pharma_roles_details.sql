-- =====================================================================
-- LIST ALL PHARMA ROLES WITH FULL DETAILS
-- =====================================================================

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name,
    COUNT(p.id) as persona_count,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as archetypes
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
GROUP BY r.id, r.name, r.function_id, f.name, r.department_id, d.name
ORDER BY r.name;

