-- =====================================================================
-- QUICK VERIFICATION - PHARMA ORG-STRUCTURE
-- Run this to verify duplicates are resolved and slugs are clean
-- =====================================================================

-- 1. SUMMARY STATISTICS
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
) duplicates
UNION ALL
SELECT 
    'SUMMARY',
    'Functions with -pharma in slug',
    COUNT(*)::text
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE (t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%')
AND f.slug LIKE '%-pharma%';

-- 2. ALL FUNCTIONS WITH SLUGS (to verify clean slugs)
SELECT 
    'FUNCTIONS' as section,
    f.name::text as function_name,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.id, f.name, f.slug
ORDER BY f.name::text;

-- 3. DUPLICATES CHECK (should return no rows)
SELECT 
    'DUPLICATES_CHECK' as section,
    f.name::text as function_name,
    COUNT(*) as duplicate_count,
    string_agg(f.slug, ', ' ORDER BY f.created_at) as slugs
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
GROUP BY f.name::text
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 4. FUNCTIONS WITH PROBLEMATIC SLUGS (should return no rows)
SELECT 
    'PROBLEMATIC_SLUGS' as section,
    f.name::text as function_name,
    f.slug,
    CASE 
        WHEN f.slug LIKE '%-pharma%' THEN 'Has -pharma'
        WHEN f.slug ~ '\d+$' THEN 'Has trailing digits'
        WHEN f.slug LIKE '%-%' AND f.slug NOT LIKE '%-%' THEN 'Has multiple hyphens'
        ELSE 'OK'
    END as issue
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE (t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%')
AND (
    f.slug LIKE '%-pharma%'
    OR f.slug ~ '\d+$'  -- Has trailing digits
)
ORDER BY f.name::text;

