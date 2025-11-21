-- =====================================================================
-- SHOW PHARMA ROLES WITH THEIR PERSONA COUNTS
-- =====================================================================

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as archetypes
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
GROUP BY d.name, r.id, r.name
ORDER BY persona_count DESC, r.name;

