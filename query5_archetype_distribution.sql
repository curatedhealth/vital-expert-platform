-- =====================================================================
-- QUERY 5: ARCHETYPE DISTRIBUTION PER ROLE (MECE CHECK)
-- =====================================================================

SELECT 
  r.name as role_name,
  COUNT(CASE WHEN p.archetype = 'AUTOMATOR' THEN 1 END) as automator_count,
  COUNT(CASE WHEN p.archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrator_count,
  COUNT(CASE WHEN p.archetype = 'LEARNER' THEN 1 END) as learner_count,
  COUNT(CASE WHEN p.archetype = 'SKEPTIC' THEN 1 END) as skeptic_count,
  CASE 
    WHEN COUNT(CASE WHEN p.archetype = 'AUTOMATOR' THEN 1 END) > 0
     AND COUNT(CASE WHEN p.archetype = 'ORCHESTRATOR' THEN 1 END) > 0
     AND COUNT(CASE WHEN p.archetype = 'LEARNER' THEN 1 END) > 0
     AND COUNT(CASE WHEN p.archetype = 'SKEPTIC' THEN 1 END) > 0 
    THEN '✅ Complete MECE'
    ELSE '❌ Missing archetypes'
  END as mece_status
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE f.industry = 'Digital Health'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
GROUP BY r.id, r.name
ORDER BY r.name;

