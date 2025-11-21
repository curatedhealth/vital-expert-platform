-- =====================================================================
-- DIAGNOSTIC: Check what's in the database
-- =====================================================================

-- Check tenants
SELECT '=== TENANTS ===' as section;
SELECT id, name, slug FROM public.tenants LIMIT 10;

-- Check functions
SELECT '=== FUNCTIONS ===' as section;
SELECT id, name, name::text as name_text FROM public.org_functions LIMIT 20;

-- Check Medical Affairs function specifically
SELECT '=== MEDICAL AFFAIRS FUNCTION ===' as section;
SELECT id, name, name::text as name_text 
FROM public.org_functions 
WHERE name::text ILIKE '%medical%' OR name::text ILIKE '%affairs%'
LIMIT 10;

-- Check roles in pharma tenant
SELECT '=== ROLES IN PHARMA TENANT ===' as section;
SELECT 
    r.id,
    r.name as role_name,
    r.function_id,
    f.name as function_name,
    r.department_id,
    d.name as department_name
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
LIMIT 20;

-- Check personas
SELECT '=== PERSONAS ===' as section;
SELECT 
    COUNT(*) as total_personas,
    COUNT(DISTINCT role_id) as roles_with_personas
FROM public.personas
WHERE deleted_at IS NULL;

