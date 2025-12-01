-- Verify Digital Health Enrichment Migration Results
-- ================================================

-- 1. Check the 2 new departments were created
SELECT '=== NEW DEPARTMENTS ===' as section;
SELECT 
  d.name as department_name,
  d.slug,
  d.description,
  f.name as function_name
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
WHERE d.slug IN ('clinical-validation-dh', 'real-world-evidence-dh')
ORDER BY d.name;

-- 2. Count departments by Digital Health function (should now be 40 total)
SELECT '=== DEPARTMENT COUNT BY DH FUNCTION ===' as section;
SELECT 
  f.name as function_name,
  COUNT(d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
GROUP BY f.name
ORDER BY department_count DESC;

-- 3. Check new roles in Clinical Validation department
SELECT '=== CLINICAL VALIDATION ROLES ===' as section;
SELECT 
  r.name as role_name,
  r.slug,
  r.seniority_level,
  r.geographic_scope
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
WHERE d.slug = 'clinical-validation-dh'
ORDER BY r.seniority_level, r.name;

-- 4. Check new roles in Real-World Evidence department
SELECT '=== REAL-WORLD EVIDENCE ROLES ===' as section;
SELECT 
  r.name as role_name,
  r.slug,
  r.seniority_level,
  r.geographic_scope
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
WHERE d.slug = 'real-world-evidence-dh'
ORDER BY r.seniority_level, r.name;

-- 5. Total role count for Digital Health functions
SELECT '=== TOTAL DH ROLE COUNT ===' as section;
SELECT 
  f.name as function_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.industry = 'Digital Health'
GROUP BY f.name
ORDER BY role_count DESC;

-- 6. Check Digital Health JTBDs were created
SELECT '=== DIGITAL HEALTH JTBDs ===' as section;
SELECT 
  code,
  name,
  job_category,
  complexity,
  priority
FROM jtbd
WHERE code LIKE 'JTBD-DH-%'
ORDER BY code;

-- 7. Summary
SELECT '=== SUMMARY ===' as section;
SELECT 
  (SELECT COUNT(*) FROM org_departments d 
   JOIN org_functions f ON d.function_id = f.id 
   WHERE f.industry = 'Digital Health') as total_dh_departments,
  (SELECT COUNT(*) FROM org_roles r 
   JOIN org_departments d ON r.department_id = d.id 
   JOIN org_functions f ON d.function_id = f.id 
   WHERE f.industry = 'Digital Health') as total_dh_roles,
  (SELECT COUNT(*) FROM jtbd WHERE code LIKE 'JTBD-DH-%') as total_dh_jtbds;

