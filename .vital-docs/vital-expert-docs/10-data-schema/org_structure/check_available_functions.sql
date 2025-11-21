-- =====================================================================
-- CHECK AVAILABLE FUNCTIONS AND DEPARTMENTS
-- =====================================================================

-- Check all functions for Pharmaceuticals tenant
SELECT 
    'AVAILABLE_FUNCTIONS' as section,
    f.id,
    f.name,
    f.slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM public.org_functions f
LEFT JOIN public.org_departments d ON f.id = d.function_id
LEFT JOIN public.org_roles r ON f.id = r.function_id
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
GROUP BY f.id, f.name, f.slug
ORDER BY f.name;

-- Check departments under Medical Affairs (or similar)
SELECT 
    'MEDICAL_DEPARTMENTS' as section,
    d.id,
    d.name,
    d.slug,
    f.name as function_name
FROM public.org_departments d
JOIN public.org_functions f ON d.function_id = f.id
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.name::text ILIKE '%Medical%' OR d.name ILIKE '%Medical%' OR d.name ILIKE '%Field%')
ORDER BY f.name, d.name;

