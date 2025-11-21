-- =====================================================================
-- CHECK ROLES FUNCTION_ID
-- =====================================================================

SELECT 
    r.id,
    r.name as role_name,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name,
    r.tenant_id,
    t.name as tenant_name
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND r.name IN ('Medical Affairs Director', 'Medical Information Manager')
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1);

