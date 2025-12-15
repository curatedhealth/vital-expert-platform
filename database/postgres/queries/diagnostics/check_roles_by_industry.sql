-- Count roles grouped by industry (via function)
SELECT 
  COALESCE(f.industry, 'NO INDUSTRY SET') as industry,
  COUNT(r.id) as role_count
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
WHERE r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.industry
ORDER BY role_count DESC;


