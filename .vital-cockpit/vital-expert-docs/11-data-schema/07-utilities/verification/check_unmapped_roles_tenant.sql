-- =====================================================================
-- CHECK: Which Tenant Do Unmapped Roles Belong To?
-- =====================================================================

SELECT 
    t.slug as tenant_slug,
    t.name as tenant_name,
    COUNT(r.id) as unmapped_roles_count,
    STRING_AGG(r.name, ', ' ORDER BY r.name) as role_names
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
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
GROUP BY t.id, t.slug, t.name
ORDER BY unmapped_roles_count DESC;

-- Also check all unmapped medical roles by tenant
SELECT 
    '=== ALL UNMAPPED MEDICAL ROLES BY TENANT ===' as section;

SELECT 
    t.slug as tenant_slug,
    t.name as tenant_name,
    r.name as role_name,
    r.id as role_id,
    r.function_id,
    f.name::text as function_name
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name ILIKE '%medical%'
ORDER BY t.slug, r.name;

