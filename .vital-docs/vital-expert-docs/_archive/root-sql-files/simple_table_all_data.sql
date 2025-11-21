-- =====================================================================
-- SIMPLE TABLE: All Departments, Roles, Persona Counts
-- Shows everything without complex filters
-- =====================================================================

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY d.name, r.id, r.name
ORDER BY persona_count DESC, d.name NULLS LAST, r.name
LIMIT 100;

