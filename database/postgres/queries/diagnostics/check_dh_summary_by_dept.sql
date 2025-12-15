-- Summary by Department - shows which departments have persona coverage
SELECT 
  f.name as function_name,
  d.name as department_name,
  COUNT(DISTINCT r.id) as total_roles,
  SUM(CASE WHEN persona_cnt = 0 THEN 1 ELSE 0 END) as no_personas,
  SUM(CASE WHEN persona_cnt = 4 THEN 1 ELSE 0 END) as complete_4_4,
  CASE 
    WHEN SUM(CASE WHEN persona_cnt = 0 THEN 1 ELSE 0 END) = COUNT(DISTINCT r.id) THEN '❌ ALL NEED PERSONAS'
    WHEN SUM(CASE WHEN persona_cnt = 4 THEN 1 ELSE 0 END) = COUNT(DISTINCT r.id) THEN '✅ ALL COMPLETE'
    ELSE '⚠️ PARTIAL'
  END as status
FROM (
  SELECT r.id, r.department_id, COUNT(p.id) as persona_cnt
  FROM org_roles r
  JOIN org_functions f ON r.function_id = f.id
  LEFT JOIN personas p ON p.source_role_id = r.id
  WHERE f.industry = 'Digital Health'
    AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  GROUP BY r.id, r.department_id
) role_counts
JOIN org_roles r ON r.id = role_counts.id
JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
GROUP BY f.name, d.name
ORDER BY 
  CASE WHEN SUM(CASE WHEN persona_cnt = 0 THEN 1 ELSE 0 END) = COUNT(DISTINCT r.id) THEN 0 ELSE 1 END,
  f.name, d.name;


