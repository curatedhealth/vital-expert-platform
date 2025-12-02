-- =====================================================================
-- QUERY 6: SUMMARY STATISTICS
-- =====================================================================

SELECT 
  (SELECT COUNT(*) FROM org_roles r
   JOIN org_departments d ON r.department_id = d.id
   JOIN org_functions f ON d.function_id = f.id
   WHERE f.industry = 'Digital Health'
   AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244') as total_dh_roles,
   
  (SELECT COUNT(*) FROM org_roles r
   JOIN org_departments d ON r.department_id = d.id
   JOIN org_functions f ON d.function_id = f.id
   WHERE f.industry = 'Digital Health'
   AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
   AND r.description IS NOT NULL 
   AND r.description != ''
   AND r.seniority_level IS NOT NULL
   AND r.geographic_scope IS NOT NULL) as roles_with_complete_fields,
   
  (SELECT COUNT(*) FROM personas p
   JOIN org_roles r ON p.source_role_id = r.id
   JOIN org_departments d ON r.department_id = d.id
   JOIN org_functions f ON d.function_id = f.id
   WHERE f.industry = 'Digital Health') as total_dh_personas;
