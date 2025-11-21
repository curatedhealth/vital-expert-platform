-- =====================================================================
-- VERIFY CONSOLIDATED PHARMA ORG-STRUCTURE
-- Shows the final state after consolidation and normalization
-- =====================================================================

-- 1. FUNCTIONS SUMMARY
SELECT 
    'FUNCTIONS' as section,
    f.name as function_name,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    f.is_active,
    f.created_at
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, f.slug, f.is_active, f.created_at
ORDER BY f.name;

-- 2. DEPARTMENTS BY FUNCTION
SELECT 
    'DEPARTMENTS' as section,
    f.name as function_name,
    d.name as department_name,
    d.slug,
    COUNT(DISTINCT r.id) as role_count,
    d.is_active
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
INNER JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, d.id, d.name, d.slug, d.is_active
ORDER BY f.name, d.name;

-- 3. SUMMARY STATISTICS
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
    'Functions with Departments',
    COUNT(DISTINCT f.id)::text
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
INNER JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'SUMMARY',
    'Departments with Roles',
    COUNT(DISTINCT d.id)::text
FROM public.org_departments d
INNER JOIN public.tenants t ON d.tenant_id = t.id
INNER JOIN public.org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%';

-- 4. FUNCTIONS WITH DEPARTMENT COUNTS
SELECT 
    'FUNCTION_DEPTS' as section,
    f.name as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name
ORDER BY department_count DESC, role_count DESC;

-- 5. CHECK FOR DUPLICATES (Should be zero) - WITH DETAILED COUNTS
SELECT 
    'DUPLICATES_CHECK' as section,
    f.name::text as function_name,
    COUNT(*) as duplicate_count,
    string_agg(f.slug, ', ' ORDER BY f.created_at) as slugs,
    string_agg(f.id::text, ', ' ORDER BY f.created_at) as function_ids,
    SUM((SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id)) as total_departments,
    SUM((SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id)) as total_roles
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.name::text
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, total_roles DESC;

