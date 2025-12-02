-- Query 1: All DH Functions and their department counts
SELECT 
  f.name as function_name,
  f.industry,
  COUNT(DISTINCT d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.name, f.industry
ORDER BY f.name;


