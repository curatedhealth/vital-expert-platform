-- Count departments per Digital Health function
SELECT 
  f.name as function_name,
  COUNT(d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON f.id = d.function_id AND d.tenant_id = f.tenant_id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.name
ORDER BY department_count DESC;


