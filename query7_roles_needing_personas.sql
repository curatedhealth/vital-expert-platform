-- =====================================================================
-- QUERY 7: ROLES NEEDING PERSONAS (< 4 personas)
-- =====================================================================

SELECT 
  r.name as role_name,
  r.slug,
  d.name as department_name,
  f.name as function_name,
  COUNT(p.id) as current_persona_count,
  4 - COUNT(p.id) as personas_needed
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY r.id, r.name, r.slug, d.name, f.name
HAVING COUNT(p.id) < 4
ORDER BY COUNT(p.id) ASC, f.name, d.name, r.name;

