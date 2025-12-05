-- =====================================================================
-- CHECK: Do These Roles Exist? What's Their Current State?
-- =====================================================================

-- Check if roles exist with exact name match
SELECT 
    r.name as role_name,
    t.slug as tenant_slug,
    r.department_id,
    d.name as department_name,
    r.deleted_at
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.name IN (
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
ORDER BY r.name, t.slug;

-- Check with ILIKE (case-insensitive, flexible matching)
SELECT 
    r.name as role_name,
    t.slug as tenant_slug,
    r.department_id,
    d.name as department_name,
    CASE WHEN r.deleted_at IS NULL THEN 'Active' ELSE 'Deleted' END as status
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.name ILIKE '%medical operations manager%'
   OR r.name ILIKE '%medical quality manager%'
   OR r.name ILIKE '%medical science liaison%'
   OR r.name ILIKE '%medical training manager%'
   OR r.name ILIKE '%medical writer%'
   OR r.name ILIKE '%regional medical director%'
   OR r.name ILIKE '%senior medical info specialist%'
   OR r.name ILIKE '%senior medical science liaison%'
   OR r.name ILIKE '%ta msl lead%'
ORDER BY r.name, t.slug;

-- Check ALL roles with "No Department" in pharma tenants
SELECT 
    r.name as role_name,
    t.slug as tenant_slug,
    r.department_id,
    f.name::text as function_name
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND t.slug IN ('pharmaceuticals', 'pharma')
  AND r.name ILIKE '%medical%'
ORDER BY r.name;

