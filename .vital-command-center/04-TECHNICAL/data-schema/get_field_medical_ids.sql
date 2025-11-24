-- ============================================
-- Get All IDs for Field Medical Department
-- Run this in Supabase Dashboard SQL Editor
-- ALL RESULTS IN ONE QUERY
-- ============================================

WITH tenant_data AS (
    SELECT 
        'TENANT' as entity_type,
        1 as sort_order,
        id::text as id,
        name as name,
        slug as slug,
        NULL as department_id,
        NULL as function_id,
        NULL as tenant_id
    FROM public.tenants
    WHERE slug IN ('pharmaceuticals', 'pharma')
      AND deleted_at IS NULL
    LIMIT 1
),
function_data AS (
    SELECT 
        'FUNCTION' as entity_type,
        2 as sort_order,
        id::text as id,
        name::text as name,
        slug as slug,
        NULL as department_id,
        NULL as function_id,
        NULL as tenant_id
    FROM public.org_functions
    WHERE name::text ILIKE '%medical%affairs%'
      AND deleted_at IS NULL
    LIMIT 1
),
department_data AS (
    SELECT 
        'DEPARTMENT' as entity_type,
        3 as sort_order,
        d.id::text as id,
        d.name as name,
        d.slug as slug,
        NULL as department_id,
        d.function_id::text as function_id,
        NULL as tenant_id
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE d.name ILIKE '%field%medical%'
      AND d.deleted_at IS NULL
      AND f.name::text ILIKE '%medical%affairs%'
    LIMIT 1
),
roles_data AS (
    SELECT 
        'ROLE' as entity_type,
        4 as sort_order,
        r.id::text as id,
        r.name as name,
        r.slug as slug,
        r.department_id::text as department_id,
        r.function_id::text as function_id,
        r.tenant_id::text as tenant_id
    FROM public.org_roles r
    LEFT JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.deleted_at IS NULL
      AND (
        d.name ILIKE '%field%medical%'
        OR r.name ILIKE '%field%medical%'
        OR r.name ILIKE '%medical science liaison%'
        OR r.name ILIKE '%msl%'
      )
)
SELECT 
    entity_type,
    id,
    name,
    slug,
    department_id,
    function_id,
    tenant_id
FROM (
    SELECT * FROM tenant_data
    UNION ALL
    SELECT * FROM function_data
    UNION ALL
    SELECT * FROM department_data
    UNION ALL
    SELECT * FROM roles_data
) combined
ORDER BY sort_order, name;

