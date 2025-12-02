-- ============================================================================
-- CHECK ALL DIGITAL HEALTH ROLES AND THEIR PERSONA COUNTS
-- ============================================================================

-- Query 1: All DH Functions and their departments
SELECT 
  f.name as function_name,
  f.industry,
  COUNT(DISTINCT d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
  AND f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.id, f.name, f.industry
ORDER BY f.name;

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

-- Query 3: Summary by function - roles needing personas
SELECT 
  f.name as function_name,
  COUNT(DISTINCT r.id) as total_roles,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt = 0 THEN r.id END) as roles_without_personas,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt > 0 AND persona_counts.cnt < 4 THEN r.id END) as roles_incomplete,
  COUNT(DISTINCT CASE WHEN persona_counts.cnt >= 4 THEN r.id END) as roles_complete
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN (
  SELECT source_role_id, COUNT(*) as cnt 
  FROM personas 
  WHERE source_role_id IS NOT NULL 
  GROUP BY source_role_id
) persona_counts ON persona_counts.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY f.name
ORDER BY roles_without_personas DESC, f.name;

-- Query 4: Total DH personas created
SELECT 
  'Digital Health Personas Summary' as report,
  COUNT(DISTINCT r.id) as total_dh_roles,
  COUNT(DISTINCT p.id) as total_dh_personas,
  COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN r.id END) as roles_with_personas,
  COUNT(DISTINCT CASE WHEN p.id IS NULL THEN r.id END) as roles_without_personas
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';


