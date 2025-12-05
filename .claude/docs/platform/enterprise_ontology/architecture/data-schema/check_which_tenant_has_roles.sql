-- =====================================================================
-- CHECK WHICH TENANT HAS THE UNMAPPED ROLES
-- =====================================================================

SELECT 
    '=== UNMAPPED ROLES BY TENANT ===' as section;

SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.slug as tenant_slug,
    COUNT(r.id) as unmapped_roles_count,
    STRING_AGG(r.name, ', ' ORDER BY r.name) as role_names
FROM public.tenants t
LEFT JOIN public.org_roles r ON r.tenant_id = t.id 
  AND r.deleted_at IS NULL 
  AND r.department_id IS NULL
  AND (
    r.name ILIKE '%field medical%'
    OR r.name ILIKE '%medical science liaison%'
    OR r.name ILIKE '%medical info%'
    OR r.name ILIKE '%medical librarian%'
    OR r.name ILIKE '%medical communication%'
    OR r.name ILIKE '%medical writer%'
    OR r.name ILIKE '%medical monitor%'
    OR r.name ILIKE '%medical operations%'
    OR r.name ILIKE '%medical quality%'
    OR r.name ILIKE '%medical compliance%'
    OR r.name ILIKE '%medical excellence%'
    OR r.name ILIKE '%medical strategy%'
    OR r.name ILIKE '%medical education%'
    OR r.name ILIKE '%medical training%'
    OR r.name ILIKE '%global medical%'
    OR r.name ILIKE '%regional medical%'
    OR r.name ILIKE '%therapeutic area medical%'
    OR r.name ILIKE '%ta msl%'
  )
WHERE t.slug IN ('pharmaceuticals', 'pharma')
GROUP BY t.id, t.name, t.slug
ORDER BY unmapped_roles_count DESC;

-- Check all roles in both tenants
SELECT 
    '=== ALL ROLES IN BOTH TENANTS ===' as section;

SELECT 
    t.slug as tenant_slug,
    r.name as role_name,
    CASE WHEN r.department_id IS NULL THEN 'No Department' ELSE d.name END as department_name
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND t.slug IN ('pharmaceuticals', 'pharma')
  AND (
    r.name ILIKE '%medical%'
  )
ORDER BY t.slug, r.name
LIMIT 100;

