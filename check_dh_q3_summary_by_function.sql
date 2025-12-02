-- Query 3: Summary by function - roles needing personas
SELECT 
  f.name as function_name,
  COUNT(DISTINCT r.id) as total_roles,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt = 0 THEN r.id END) as roles_without_personas,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt > 0 AND persona_counts.cnt < 4 THEN r.id END) as roles_incomplete,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt >= 4 THEN r.id END) as roles_complete
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN (
  SELECT source_role_id, COUNT(*) as cnt 
  FROM personas 
  WHERE source_role_id IS NOT NULL 
  GROUP BY source_role_id
) persona_counts ON persona_counts.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name
ORDER BY roles_without_personas DESC, f.name;


