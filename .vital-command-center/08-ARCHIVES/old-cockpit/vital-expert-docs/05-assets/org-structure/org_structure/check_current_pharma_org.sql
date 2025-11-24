-- =====================================================================
-- CHECK CURRENT PHARMA ORG-STRUCTURE
-- Quick check to see what functions and departments currently exist
-- =====================================================================

-- Current Functions
SELECT 
    'FUNCTIONS' as type,
    f.name as name,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, f.slug
ORDER BY f.name;

-- Current Departments by Function
SELECT 
    'DEPARTMENTS' as type,
    f.name as function_name,
    d.name as department_name,
    d.slug,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
INNER JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, d.id, d.name, d.slug
ORDER BY f.name, d.name;

-- Summary Counts
SELECT 
    'SUMMARY' as type,
    'Functions' as metric,
    COUNT(DISTINCT f.id)::text as count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Departments',
    COUNT(DISTINCT d.id)::text
FROM public.org_departments d
INNER JOIN public.tenants t ON d.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Roles',
    COUNT(DISTINCT r.id)::text
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%';

