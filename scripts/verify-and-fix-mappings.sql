-- =====================================================================
-- VERIFY AND FIX ORGANIZATIONAL MAPPINGS
-- =====================================================================

-- First, let's check the current state
SELECT 'Current department mappings' as status;
SELECT department_name, function_id FROM org_departments ORDER BY department_name;

-- Check if the function IDs exist
SELECT 'Available functions' as status;
SELECT id, department_name FROM org_functions ORDER BY department_name;

-- Now let's try the mappings again with explicit verification
UPDATE org_departments 
SET function_id = '82282793-ae2e-4cd0-b6fd-5fa647761eb4' 
WHERE id = 'cf985588-bb97-4757-8bf1-5f2a5633b6ec' 
AND department_name = 'Epidemiology';

UPDATE org_departments 
SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' 
WHERE id = '27b232a1-68fc-44dd-8355-99bea58723a7' 
AND department_name = 'Marketing';

UPDATE org_departments 
SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' 
WHERE id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b' 
AND department_name = 'Sales';

UPDATE org_departments 
SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' 
WHERE id = '623cdf78-823d-45f8-affc-748d2f1a3811' 
AND department_name = 'Market Access';

UPDATE org_departments 
SET function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' 
WHERE id = '63edf949-e2e4-422a-9866-19938d9b16ca' 
AND department_name = 'HEOR';

UPDATE org_departments 
SET function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' 
WHERE id = '11d3ae96-cb3a-402e-bb19-34df64d0ac0f' 
AND department_name = 'BD&L';

UPDATE org_departments 
SET function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' 
WHERE id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0' 
AND department_name = 'Strategic Planning';

UPDATE org_departments 
SET function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' 
WHERE id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4' 
AND department_name = 'Legal Affairs';

UPDATE org_departments 
SET function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' 
WHERE id = '409dba65-612f-40bc-9acf-e0bdfa998315' 
AND department_name = 'Finance & Accounting';

UPDATE org_departments 
SET function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' 
WHERE id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a' 
AND department_name = 'Information Technology';

-- Verify the updates
SELECT 'Updated department mappings' as status;
SELECT department_name, function_id FROM org_departments ORDER BY department_name;

-- Check how many were updated
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;
