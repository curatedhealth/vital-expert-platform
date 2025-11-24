-- =====================================================================
-- ANALYZE DUPLICATES WITH DETAILED COUNTS
-- Shows role and department counts for each duplicate function
-- =====================================================================

-- 1. DETAILED ANALYSIS OF EACH DUPLICATE
SELECT 
    'DUPLICATE_ANALYSIS' as section,
    f.name::text as function_name,
    f.id as function_id,
    f.slug,
    f.created_at,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT r.id) FILTER (WHERE r.department_id IS NOT NULL) as roles_with_dept,
    COUNT(DISTINCT r.id) FILTER (WHERE r.department_id IS NULL) as roles_without_dept,
    ROW_NUMBER() OVER (
        PARTITION BY f.name::text 
        ORDER BY 
            COUNT(DISTINCT d.id) DESC, 
            COUNT(DISTINCT r.id) DESC, 
            f.created_at ASC
    ) as priority_rank
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE (t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%')
AND f.name::text IN (
    SELECT f2.name::text
    FROM public.org_functions f2
    INNER JOIN public.tenants t2 ON f2.tenant_id = t2.id
    WHERE t2.slug = 'pharmaceuticals' OR t2.name ILIKE '%pharmaceutical%'
    GROUP BY f2.name::text
    HAVING COUNT(*) > 1
)
GROUP BY f.id, f.name, f.slug, f.created_at
ORDER BY f.name::text, priority_rank;

-- 2. SUMMARY BY FUNCTION NAME
SELECT 
    'DUPLICATE_SUMMARY' as section,
    f.name::text as function_name,
    COUNT(DISTINCT f.id) as duplicate_count,
    SUM((SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id)) as total_departments,
    SUM((SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id)) as total_roles,
    MAX((SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id)) as max_dept_count,
    MAX((SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id)) as max_role_count,
    MIN((SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id)) as min_dept_count,
    MIN((SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id)) as min_role_count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE (t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%')
AND f.name::text IN (
    SELECT f2.name::text
    FROM public.org_functions f2
    INNER JOIN public.tenants t2 ON f2.tenant_id = t2.id
    WHERE t2.slug = 'pharmaceuticals' OR t2.name ILIKE '%pharmaceutical%'
    GROUP BY f2.name::text
    HAVING COUNT(*) > 1
)
GROUP BY f.name::text
ORDER BY f.name::text;

