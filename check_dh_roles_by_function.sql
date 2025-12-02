-- Count roles per Digital Health function
SELECT 
  f.name as function_name,
  f.slug as function_slug,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_roles r ON f.id = r.function_id AND r.tenant_id = f.tenant_id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.name, f.slug
ORDER BY role_count DESC;


