-- Quick Summary Verification
SELECT 
    'SUMMARY' as section,
    'Total Functions' as metric,
    COUNT(DISTINCT f.id)::text as value
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Total Departments',
    COUNT(DISTINCT d.id)::text
FROM public.org_departments d
INNER JOIN public.tenants t ON d.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Total Roles',
    COUNT(DISTINCT r.id)::text
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Duplicate Functions',
    COUNT(*)::text
FROM (
    SELECT f.name::text
    FROM public.org_functions f
    INNER JOIN public.tenants t ON f.tenant_id = t.id
    WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
    GROUP BY f.name::text
    HAVING COUNT(*) > 1
) duplicates;

