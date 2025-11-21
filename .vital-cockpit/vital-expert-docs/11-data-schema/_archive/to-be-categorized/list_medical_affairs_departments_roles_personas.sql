-- =====================================================================
-- MEDICAL AFFAIRS: DEPARTMENTS, ROLES, AND PERSONA COUNTS
-- =====================================================================

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(DISTINCT p.id) as persona_count,
    COALESCE(STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text), 'No personas') as archetypes
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND (
    f.name::text ILIKE '%medical%affairs%' 
    OR f.name::text ILIKE '%medical affairs%'
    OR f.name::text ILIKE 'medical%'
  )
GROUP BY d.name, r.id, r.name
ORDER BY d.name NULLS LAST, r.name;


