-- =====================================================================
-- DETAILED LIST: Medical Affairs Departments and Roles
-- =====================================================================

-- Departments with their roles
SELECT 
    '=== DEPARTMENTS AND THEIR ROLES ===' as section;

SELECT 
    d.name as department_name,
    f.name::text as function_name,
    r.name as role_name,
    t.name as tenant_name,
    CASE WHEN r.deleted_at IS NULL THEN 'Active' ELSE 'Deleted' END as role_status
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE d.deleted_at IS NULL
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR d.name ILIKE '%medical%'
  )
ORDER BY d.name, r.deleted_at NULLS FIRST, r.name;

-- Summary by department
SELECT 
    '=== SUMMARY BY DEPARTMENT ===' as section;

SELECT 
    d.name as department_name,
    f.name::text as function_name,
    COUNT(DISTINCT CASE WHEN r.deleted_at IS NULL THEN r.id END) as active_roles,
    COUNT(DISTINCT CASE WHEN r.deleted_at IS NOT NULL THEN r.id END) as deleted_roles,
    COUNT(DISTINCT r.id) as total_roles
FROM public.org_departments d
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id
WHERE d.deleted_at IS NULL
  AND (
    f.name::text ILIKE '%medical%' 
    OR f.name::text ILIKE '%affairs%'
    OR d.name ILIKE '%medical%'
  )
GROUP BY d.id, d.name, f.name
ORDER BY active_roles DESC, d.name;

-- All active roles (grouped by department)
SELECT 
    '=== ALL ACTIVE ROLES BY DEPARTMENT ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    f.name::text as function_name,
    r.name as role_name,
    t.name as tenant_name
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
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
ORDER BY d.name NULLS LAST, r.name;

-- Simple table format: Department, Role, Persona Count
SELECT 
    '=== SIMPLE TABLE: Department | Role | Persona Count ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
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
GROUP BY d.name, r.id, r.name
ORDER BY d.name NULLS LAST, r.name;

