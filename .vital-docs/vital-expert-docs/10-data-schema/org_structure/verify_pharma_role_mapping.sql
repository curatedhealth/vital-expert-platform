-- =====================================================================
-- VERIFY PHARMA ROLE MAPPING
-- Shows mapping results and identifies unmapped roles
-- =====================================================================

WITH pharma_tenant AS (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
),
role_status AS (
    SELECT 
        r.id,
        r.name,
        CASE 
            WHEN r.function_id IS NULL AND r.department_id IS NULL THEN 'UNMAPPED'
            WHEN r.function_id IS NOT NULL AND r.department_id IS NULL THEN 'FUNCTION_ONLY'
            WHEN r.function_id IS NOT NULL AND r.department_id IS NOT NULL THEN 'FULLY_MAPPED'
            ELSE 'PARTIAL'
        END as mapping_status
    FROM public.org_roles r
    CROSS JOIN pharma_tenant pt
    WHERE r.tenant_id = pt.id
)
SELECT 
    mapping_status,
    COUNT(*) as role_count,
    (
        SELECT STRING_AGG(name, ', ' ORDER BY name)
        FROM (
            SELECT name 
            FROM role_status rs2 
            WHERE rs2.mapping_status = rs.mapping_status 
            ORDER BY name 
            LIMIT 5
        ) sub
    ) as sample_roles
FROM role_status rs
GROUP BY mapping_status
ORDER BY mapping_status;

-- Detailed view: Show all unmapped roles
SELECT 
    'UNMAPPED_ROLES' as section,
    r.id,
    r.name as role_name,
    r.slug,
    r.description,
    r.function_id,
    r.department_id
FROM public.org_roles r
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (r.function_id IS NULL AND r.department_id IS NULL)
ORDER BY r.name;

-- Summary by function
SELECT 
    'BY_FUNCTION' as section,
    f.name as function_name,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT CASE WHEN r.department_id IS NOT NULL THEN r.id END) as roles_with_department,
    COUNT(DISTINCT d.id) as departments_with_roles
FROM public.org_roles r
JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id AND d.function_id = f.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND r.function_id IS NOT NULL
GROUP BY f.name
ORDER BY role_count DESC;

