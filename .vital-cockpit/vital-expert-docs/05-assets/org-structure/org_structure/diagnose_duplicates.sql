-- =====================================================================
-- DIAGNOSE DUPLICATE FUNCTIONS
-- Detailed analysis of why duplicates exist and what's preventing merge
-- =====================================================================

WITH pharma_tenant AS (
    SELECT id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)

-- Show detailed info about each duplicate
SELECT 
    f.name::text as function_name,
    f.id as function_id,
    f.slug,
    f.created_at,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    string_agg(DISTINCT d.name, ', ' ORDER BY d.name) FILTER (WHERE d.id IS NOT NULL) as departments,
    CASE 
        WHEN COUNT(DISTINCT d.id) > 0 OR COUNT(DISTINCT r.id) > 0 THEN 'Has Data'
        ELSE 'Empty'
    END as status
FROM pharma_tenant pt
INNER JOIN public.org_functions f ON f.tenant_id = pt.id
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
WHERE f.name::text IN (
    SELECT f2.name::text
    FROM pharma_tenant pt2
    INNER JOIN public.org_functions f2 ON f2.tenant_id = pt2.id
    GROUP BY f2.name::text
    HAVING COUNT(*) > 1
)
GROUP BY f.id, f.name, f.slug, f.created_at
ORDER BY f.name::text, f.created_at;

