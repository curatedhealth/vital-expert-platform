-- Query 2: All DH Roles with persona counts
SELECT 
  f.name as function_name,
  d.name as department_name,
  r.name as role_name,
  r.slug as role_slug,
  r.seniority_level,
  COUNT(p.id) as persona_count,
  CASE 
    WHEN COUNT(p.id) = 0 THEN '❌ NEEDS PERSONAS'
    WHEN COUNT(p.id) < 4 THEN '⚠️ INCOMPLETE (' || COUNT(p.id) || '/4)'
    WHEN COUNT(p.id) = 4 THEN '✅ Complete (4/4)'
    ELSE '⚠️ Extra (' || COUNT(p.id) || '/4)'
  END as status
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name, d.name, r.name, r.slug, r.seniority_level
ORDER BY f.name, d.name, r.seniority_level, r.name;


