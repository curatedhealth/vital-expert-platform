-- =====================================================================
-- LIST ALL MEDICAL AFFAIRS ROLES IN THE DATABASE
-- =====================================================================

-- First, let's see what functions exist that might be Medical Affairs
SELECT '=== ALL FUNCTIONS ===' as section;
SELECT 
    id,
    name::text as function_name,
    description
FROM public.org_functions
ORDER BY name;

-- Now, let's see all roles that might be Medical Affairs
SELECT '=== ALL ROLES (Any Tenant) ===' as section;
SELECT 
    r.id,
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    t.name as tenant_name,
    r.function_id,
    r.department_id,
    r.tenant_id
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR r.name ILIKE '%medical%'
    OR r.name ILIKE '%msl%'
    OR r.name ILIKE '%medical information%'
    OR r.name ILIKE '%medical director%'
    OR r.name ILIKE '%medical advisor%'
  )
ORDER BY f.name NULLS LAST, d.name NULLS LAST, r.name;

-- Now, specifically for pharma tenant
SELECT '=== PHARMA TENANT ROLES (Medical Affairs related) ===' as section;
SELECT 
    r.id,
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    r.function_id,
    r.department_id
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR r.name ILIKE '%medical%'
    OR r.name ILIKE '%msl%'
    OR r.name ILIKE '%medical information%'
    OR r.name ILIKE '%medical director%'
    OR r.name ILIKE '%medical advisor%'
  )
ORDER BY f.name NULLS LAST, d.name NULLS LAST, r.name;

-- Summary count
SELECT '=== SUMMARY ===' as section;
SELECT 
    COUNT(DISTINCT r.id) as total_medical_affairs_roles,
    COUNT(DISTINCT r.function_id) as unique_functions,
    COUNT(DISTINCT r.department_id) as unique_departments
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR r.name ILIKE '%medical%'
  );

