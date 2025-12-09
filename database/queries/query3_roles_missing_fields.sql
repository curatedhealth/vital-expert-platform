-- =====================================================================
-- QUERY 3: LIST ROLES WITH MISSING FIELDS
-- =====================================================================

SELECT 
  r.name as role_name,
  r.slug,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN r.description IS NULL OR r.description = '' THEN 'description' END,
    CASE WHEN r.function_id IS NULL THEN 'function_id' END,
    CASE WHEN r.department_id IS NULL THEN 'department_id' END,
    CASE WHEN r.seniority_level IS NULL THEN 'seniority_level' END,
    CASE WHEN r.geographic_scope IS NULL THEN 'geographic_scope' END
  ], NULL) as missing_fields
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND (
    r.description IS NULL OR r.description = ''
    OR r.function_id IS NULL
    OR r.department_id IS NULL
    OR r.seniority_level IS NULL
    OR r.geographic_scope IS NULL
  )
ORDER BY r.name;

