-- =====================================================================
-- STEP-BY-STEP ORGANIZATIONAL MAPPING EXECUTION
-- =====================================================================
-- Execute each step separately and verify results

-- =====================================================================
-- STEP 1: DEPARTMENT TO FUNCTION MAPPINGS
-- =====================================================================
-- Execute this first, then run verification query

UPDATE org_departments SET function_id = '82282793-ae2e-4cd0-b6fd-5fa647761eb4' WHERE id = 'cf985588-bb97-4757-8bf1-5f2a5633b6ec'; -- Epidemiology → Pharmacovigilance
UPDATE org_departments SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '27b232a1-68fc-44dd-8355-99bea58723a7'; -- Marketing → Commercial
UPDATE org_departments SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b'; -- Sales → Commercial
UPDATE org_departments SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '623cdf78-823d-45f8-affc-748d2f1a3811'; -- Market Access → Commercial
UPDATE org_departments SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '63edf949-e2e4-422a-9866-19938d9b16ca'; -- HEOR → Commercial
UPDATE org_departments SET function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '11d3ae96-cb3a-402e-bb19-34df64d0ac0f'; -- BD&L → Business Development
UPDATE org_departments SET function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0'; -- Strategic Planning → Business Development
UPDATE org_departments SET function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4'; -- Legal Affairs → Legal
UPDATE org_departments SET function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = '409dba65-612f-40bc-9acf-e0bdfa998315'; -- Finance & Accounting → Finance
UPDATE org_departments SET function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a'; -- Information Technology → IT/Digital

-- VERIFICATION QUERY FOR STEP 1:
-- Run this after executing the above updates
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

-- Show which departments are mapped
SELECT 
  f.department_name as function_name,
  d.department_name as department_name
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
ORDER BY f.department_name, d.department_name;
