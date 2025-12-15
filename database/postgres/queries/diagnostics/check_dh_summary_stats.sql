-- Summary statistics for ALL 189 DH roles and their persona coverage
SELECT 
  'Digital Health Persona Coverage' as report,
  COUNT(DISTINCT r.id) as total_roles,
  SUM(CASE WHEN persona_cnt = 0 THEN 1 ELSE 0 END) as roles_no_personas,
  SUM(CASE WHEN persona_cnt > 0 AND persona_cnt < 4 THEN 1 ELSE 0 END) as roles_incomplete,
  SUM(CASE WHEN persona_cnt = 4 THEN 1 ELSE 0 END) as roles_complete,
  SUM(CASE WHEN persona_cnt > 4 THEN 1 ELSE 0 END) as roles_extra,
  ROUND(100.0 * SUM(CASE WHEN persona_cnt = 4 THEN 1 ELSE 0 END) / COUNT(DISTINCT r.id), 1) as percent_complete
FROM (
  SELECT r.id, COUNT(p.id) as persona_cnt
  FROM org_roles r
  JOIN org_functions f ON r.function_id = f.id
  LEFT JOIN personas p ON p.source_role_id = r.id
  WHERE f.industry = 'Digital Health'
    AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  GROUP BY r.id
) role_counts;
