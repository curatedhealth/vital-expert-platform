-- =====================================================================
-- CHECK FUNCTION NAME MAPPINGS
-- Shows current function names and what they should be renamed to
-- =====================================================================

WITH pharma_tenant AS (
    SELECT id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
),
name_mappings AS (
    SELECT * FROM (VALUES
        ('Commercial', 'Commercial Organization'),
        ('Regulatory', 'Regulatory Affairs'),
        ('Research & Development', 'Research & Development (R&D)'),
        ('Manufacturing', 'Manufacturing & Supply Chain'),
        ('Finance', 'Finance & Accounting'),
        ('HR', 'Human Resources'),
        ('IT/Digital', 'Information Technology (IT) / Digital'),
        ('Legal', 'Legal & Compliance')
    ) AS v(current_name, required_name)
)

SELECT 
    'RENAME_FUNCTION' as action,
    f.name as current_name,
    nm.required_name as required_name,
    f.slug as current_slug,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    CASE 
        WHEN f.name::text = nm.required_name THEN '✅ Already correct'
        ELSE '⚠️ Needs rename'
    END as status
FROM pharma_tenant pt
INNER JOIN public.org_functions f ON f.tenant_id = pt.id
INNER JOIN name_mappings nm ON f.name::text = nm.current_name
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = f.tenant_id
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.tenant_id = f.tenant_id
GROUP BY f.id, f.name, nm.required_name, f.slug
ORDER BY f.name;

