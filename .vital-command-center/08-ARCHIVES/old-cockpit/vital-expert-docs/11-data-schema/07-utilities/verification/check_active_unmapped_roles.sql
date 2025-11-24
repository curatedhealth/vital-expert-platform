-- =====================================================================
-- CHECK: Active (Non-Deleted) Unmapped Roles in Pharma Tenants
-- =====================================================================

SELECT 
    r.name as role_name,
    t.slug as tenant_slug,
    r.department_id,
    d.name as department_name,
    r.function_id,
    f.name::text as function_name,
    CASE WHEN r.deleted_at IS NULL THEN 'Active' ELSE 'Deleted' END as status
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL  -- Only active roles
  AND r.department_id IS NULL  -- Unmapped
  AND t.slug IN ('pharmaceuticals', 'pharma')  -- Pharma tenants only
  AND r.name ILIKE '%medical%'  -- Medical roles
ORDER BY t.slug, r.name;

