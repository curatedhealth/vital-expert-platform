-- =====================================================================
-- VERIFY: Medical Affairs Roles and Departments Still Exist
-- =====================================================================

-- Check all Medical Affairs departments
SELECT '=== MEDICAL AFFAIRS DEPARTMENTS ===' as section;
SELECT 
    d.id,
    d.name as department_name,
    f.name::text as function_name,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE d.deleted_at IS NULL
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR d.name ILIKE '%medical%'
  )
GROUP BY d.id, d.name, f.name
ORDER BY d.name;

-- Check all Medical Affairs roles (any tenant)
SELECT '=== ALL MEDICAL AFFAIRS ROLES (Any Tenant) ===' as section;
SELECT 
    r.id,
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    t.name as tenant_name,
    CASE WHEN r.deleted_at IS NULL THEN 'Active' ELSE 'Deleted' END as role_status
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR r.name ILIKE '%medical%'
    OR r.name ILIKE '%msl%'
    OR r.name ILIKE '%medical information%'
    OR r.name ILIKE '%medical director%'
  )
ORDER BY t.name, f.name NULLS LAST, d.name NULLS LAST, r.name;

-- Count summary
SELECT '=== SUMMARY COUNTS ===' as section;
SELECT 
    (SELECT COUNT(*) FROM public.org_departments WHERE deleted_at IS NULL AND (name ILIKE '%medical%' OR function_id IN (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%'))) as medical_departments,
    (SELECT COUNT(*) FROM public.org_roles WHERE deleted_at IS NULL AND (name ILIKE '%medical%' OR function_id IN (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%'))) as medical_roles,
    (SELECT COUNT(*) FROM public.org_roles WHERE deleted_at IS NOT NULL AND (name ILIKE '%medical%' OR function_id IN (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%'))) as deleted_medical_roles;

