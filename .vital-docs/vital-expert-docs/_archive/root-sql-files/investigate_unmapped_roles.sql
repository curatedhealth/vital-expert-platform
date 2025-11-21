-- =====================================================================
-- INVESTIGATE: Unmapped Roles - Check Tenant, Function, Everything
-- =====================================================================

-- Simple check: Which tenant has these specific roles?
SELECT 
    r.name as role_name,
    t.id as tenant_id,
    t.slug as tenant_slug,
    t.name as tenant_name,
    r.function_id,
    f.name::text as function_name,
    r.department_id,
    d.name as department_name
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name IN (
    'Medical Operations Manager',
    'Medical Quality Manager',
    'Medical Science Liaison',
    'Medical Training Manager',
    'Medical Writer',
    'Medical Writer Publications',
    'Medical Writer Regulatory',
    'Regional Medical Director',
    'Senior Medical Info Specialist',
    'Senior Medical Science Liaison',
    'TA MSL Lead'
  )
ORDER BY t.slug, r.name;

