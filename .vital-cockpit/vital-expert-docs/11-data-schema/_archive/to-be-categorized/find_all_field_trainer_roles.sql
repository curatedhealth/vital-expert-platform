-- Find ALL active roles with slug 'medical-field-trainer'
-- Including both soft-deleted and active
SELECT 
    r.id,
    r.name,
    r.slug,
    r.tenant_id,
    t.name as tenant_name,
    r.department_id,
    d.name as department_name,
    r.function_id,
    f.name::text as function_name,
    r.created_at,
    r.deleted_at,
    CASE WHEN r.deleted_at IS NULL THEN 'ACTIVE' ELSE 'SOFT-DELETED' END as status,
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL) as active_personas,
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id) as total_personas
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.slug = 'medical-field-trainer'
ORDER BY 
    CASE WHEN r.deleted_at IS NULL THEN 0 ELSE 1 END,
    r.created_at;

