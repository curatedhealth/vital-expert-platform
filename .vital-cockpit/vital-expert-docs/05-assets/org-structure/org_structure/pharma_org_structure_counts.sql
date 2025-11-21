-- =====================================================================
-- PHARMA ORG-STRUCTURE COUNTS
-- Shows functions, departments, and roles with detailed counts
-- =====================================================================

-- 1. FUNCTIONS WITH COUNTS
SELECT 
    'FUNCTIONS' as section,
    f.name::text as function_name,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT r.id) FILTER (WHERE r.department_id IS NOT NULL) as roles_with_dept,
    COUNT(DISTINCT r.id) FILTER (WHERE r.department_id IS NULL) as roles_without_dept,
    f.is_active
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, f.slug, f.is_active
ORDER BY f.name::text;

-- 2. DEPARTMENTS BY FUNCTION WITH COUNTS
SELECT 
    'DEPARTMENTS' as section,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Executive') as executive_roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Senior') as senior_roles,
    COUNT(DISTINCT r.id) FILTER (WHERE r.seniority_level = 'Mid') as mid_roles,
    d.is_active
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
INNER JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.tenant_id = d.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, d.id, d.name, d.is_active
ORDER BY f.name::text, d.name;

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

-- 4. FUNCTIONS SORTED BY DEPARTMENT COUNT
SELECT 
    'FUNCTION_RANKING' as section,
    f.name::text as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    ROUND(COUNT(DISTINCT r.id)::numeric / NULLIF(COUNT(DISTINCT d.id), 0), 2) as avg_roles_per_dept
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name
ORDER BY department_count DESC, role_count DESC;

-- 5. DUPLICATE FUNCTIONS DETAILED
SELECT 
    'DUPLICATES' as section,
    f.name::text as function_name,
    f.id as function_id,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    f.created_at
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
AND f.name::text IN (
    SELECT f2.name::text
    FROM public.org_functions f2
    INNER JOIN public.tenants t2 ON f2.tenant_id = t2.id
    WHERE t2.slug = 'pharmaceuticals' OR t2.name ILIKE '%pharmaceutical%'
    GROUP BY f2.name::text
    HAVING COUNT(*) > 1
)
GROUP BY f.id, f.name, f.slug, f.created_at
ORDER BY f.name::text, f.created_at;

