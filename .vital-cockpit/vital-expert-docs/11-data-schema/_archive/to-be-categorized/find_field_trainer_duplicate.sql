-- Find ALL roles with slug 'medical-field-trainer' including the duplicate
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
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id AND deleted_at IS NULL) as persona_count,
    (SELECT COUNT(*) FROM public.personas WHERE role_id = r.id) as total_personas_including_deleted
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.slug = 'medical-field-trainer'
ORDER BY r.created_at;

