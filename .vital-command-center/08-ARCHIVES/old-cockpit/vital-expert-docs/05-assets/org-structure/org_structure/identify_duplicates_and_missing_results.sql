-- =====================================================================
-- IDENTIFY DUPLICATES AND MISSING FUNCTIONS/DEPARTMENTS
-- Returns results as query rows (not just NOTICE messages)
-- =====================================================================

-- Get Pharmaceuticals tenant ID
WITH pharma_tenant AS (
    SELECT id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)

-- 1. DUPLICATE FUNCTIONS (Same name, different slugs)
SELECT 
    'DUPLICATE_FUNCTION' as issue_type,
    f.name as function_name,
    COUNT(*) as duplicate_count,
    string_agg(f.slug, ', ' ORDER BY f.created_at) as slugs,
    string_agg(f.id::text, ', ' ORDER BY f.created_at) as ids,
    SUM((SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id)) as total_departments,
    SUM((SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id)) as total_roles
FROM pharma_tenant pt
INNER JOIN public.org_functions f ON f.tenant_id = pt.id
GROUP BY f.name
HAVING COUNT(*) > 1
ORDER BY f.name

UNION ALL

-- 2. MISSING FUNCTIONS (From Comprehensive List)
SELECT 
    'MISSING_FUNCTION' as issue_type,
    v.function_name as function_name,
    0 as duplicate_count,
    NULL as slugs,
    NULL as ids,
    0 as total_departments,
    0 as total_roles
FROM pharma_tenant pt
CROSS JOIN (VALUES
    ('Medical Affairs'),
    ('Market Access'),
    ('Commercial Organization'),
    ('Regulatory Affairs'),
    ('Research & Development (R&D)'),
    ('Manufacturing & Supply Chain'),
    ('Finance & Accounting'),
    ('Human Resources'),
    ('Information Technology (IT) / Digital'),
    ('Legal & Compliance'),
    ('Corporate Communications'),
    ('Strategic Planning / Corporate Development'),
    ('Business Intelligence / Analytics'),
    ('Procurement'),
    ('Facilities / Workplace Services')
) AS v(function_name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.org_functions f
    WHERE f.tenant_id = pt.id
    AND f.name::text = v.function_name
)
ORDER BY issue_type, function_name;

