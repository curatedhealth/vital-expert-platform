-- Count ALL roles under Digital Health functions
-- Expected: 189 roles based on the enrichment summary

SELECT 
  'Digital Health Total Roles' as metric,
  COUNT(*) as count
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';
