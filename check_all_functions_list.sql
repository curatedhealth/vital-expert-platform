-- List ALL functions and their industry assignments
SELECT 
  f.name as function_name,
  f.slug,
  f.industry as industry_column,
  i.name as industry_via_junction
FROM org_functions f
LEFT JOIN function_industries fi ON f.id = fi.function_id
LEFT JOIN industries i ON fi.industry_id = i.id
WHERE f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY f.industry, f.name;


