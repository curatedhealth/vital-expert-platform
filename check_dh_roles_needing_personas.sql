-- List roles that NEED personas (0 or less than 4)
SELECT 
    f.name as function_name,
    d.name as department_name,
    r.name as role_name,
    r.slug as role_slug,
    r.seniority_level,
    COUNT(p.id) as persona_count
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name, d.name, r.name, r.slug, r.seniority_level
HAVING COUNT(p.id) < 4
ORDER BY COUNT(p.id), f.name, d.name, r.name;
