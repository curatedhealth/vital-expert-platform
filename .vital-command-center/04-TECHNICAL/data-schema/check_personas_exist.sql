-- =====================================================================
-- CHECK IF PERSONAS EXIST AND HOW THEY'RE LINKED
-- =====================================================================

-- Check all personas
SELECT '=== ALL PERSONAS ===' as section;
SELECT 
    COUNT(*) as total_personas,
    COUNT(DISTINCT role_id) as unique_roles_with_personas
FROM public.personas
WHERE deleted_at IS NULL;

-- Check personas with role details
SELECT '=== PERSONAS WITH ROLE INFO ===' as section;
SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.role_id,
    r.name as role_name,
    r.tenant_id,
    t.name as tenant_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE p.deleted_at IS NULL
LIMIT 20;

-- Check pharma tenant roles
SELECT '=== PHARMA TENANT ROLES ===' as section;
SELECT 
    COUNT(*) as total_roles,
    COUNT(DISTINCT department_id) as unique_departments
FROM public.org_roles
WHERE deleted_at IS NULL
  AND tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1);

