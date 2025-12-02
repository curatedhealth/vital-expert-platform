-- Count ALL roles under Digital Health functions using junction table
SELECT 
  'Digital Health Total Roles (via junction)' as metric,
  COUNT(DISTINCT r.id) as count
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
JOIN function_industries fi ON f.id = fi.function_id
JOIN industries i ON fi.industry_id = i.id
WHERE i.slug = 'digital_health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


