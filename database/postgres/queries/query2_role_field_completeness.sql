-- =====================================================================
-- QUERY 2: CHECK ROLE FIELD COMPLETENESS
-- =====================================================================

SELECT 
  r.name as role_name,
  r.slug,
  r.seniority_level,
  r.geographic_scope,
  CASE WHEN r.description IS NULL OR r.description = '' THEN '❌ Missing' ELSE '✅' END as description_status,
  CASE WHEN r.function_id IS NULL THEN '❌ Missing' ELSE '✅' END as function_id_status,
  CASE WHEN r.department_id IS NULL THEN '❌ Missing' ELSE '✅' END as department_id_status,
  CASE WHEN r.seniority_level IS NULL THEN '❌ Missing' ELSE '✅' END as seniority_status,
  CASE WHEN r.geographic_scope IS NULL THEN '❌ Missing' ELSE '✅' END as geo_scope_status
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
ORDER BY f.name, d.name, r.seniority_level;

