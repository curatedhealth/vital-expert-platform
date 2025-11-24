-- =====================================================================
-- GET FIRST UNPROCESSED ROLE (no personas yet)
-- =====================================================================

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    d.name as department_name,
    d.id as department_id,
    f.id as function_id,
    t.id as tenant_id,
    COUNT(p.id) as existing_personas
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND t.slug IN ('pharmaceuticals', 'pharma')
  AND (
    r.name ILIKE '%medical%'
    OR f.name::text ILIKE '%medical%affairs%'
  )
GROUP BY r.id, r.name, r.slug, d.name, d.id, f.id, t.id
HAVING COUNT(p.id) < 4
ORDER BY d.name NULLS LAST, r.name
LIMIT 1;

