-- Query 4: Total DH personas summary
SELECT 
  'Digital Health Personas Summary' as report,
  COUNT(DISTINCT r.id) as total_dh_roles,
  COUNT(DISTINCT p.id) as total_dh_personas,
  COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.id END) as roles_with_personas,
  COUNT(DISTINCT CASE WHEN p.id IS NULL THEN r.id END) as roles_without_personas
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


