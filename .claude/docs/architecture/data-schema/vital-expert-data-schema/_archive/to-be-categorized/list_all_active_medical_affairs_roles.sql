-- =====================================================================
-- LIST ALL ACTIVE MEDICAL AFFAIRS ROLES WITH DEPARTMENTS
-- =====================================================================

SELECT 
    d.name as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count,
    t.slug as tenant_slug
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL  -- Only active roles
  AND t.slug IN ('pharmaceuticals', 'pharma')  -- Pharma tenants
  AND (
    r.name ILIKE '%medical%'
    OR r.function_id IN (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%')
  )
GROUP BY d.name, r.id, r.name, t.slug
ORDER BY d.name NULLS LAST, r.name;

