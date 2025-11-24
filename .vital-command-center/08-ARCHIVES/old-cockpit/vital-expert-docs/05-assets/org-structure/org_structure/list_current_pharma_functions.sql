-- =====================================================================
-- LIST CURRENT PHARMA FUNCTIONS
-- Shows all functions currently in the Pharmaceuticals tenant
-- =====================================================================

SELECT 
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

