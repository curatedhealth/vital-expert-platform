
-- Organizational Structure Mapping Script
-- Run this in your Supabase SQL editor

-- Department to Function Mappings
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

-- Role to Department Mappings (sample - you can expand this)
-- These are based on the CSV data structure
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '20368208-1414-49aa-8ef3-09086f7067f2'; -- Business Analyst → Strategic Planning → Business Development
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = 'e23b7700-688c-4cd6-8cb9-4f2786abe558'; -- CFO → Finance & Accounting → Finance
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '84498c52-8898-4158-bbdc-bbf610ba914c'; -- Chief Business Officer → Strategic Planning → Business Development
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = '8c59188e-f26d-4f83-92cd-5f27e88a6528'; -- CIO → Information Technology → IT/Digital

-- Agent to Role Mappings (sample)
-- Update agents with their corresponding roles and departments
UPDATE agents SET 
  business_function = 'Research & Development',
  department = 'Drug Discovery',
  role = 'Principal Scientist'
WHERE name ILIKE '%scientist%' OR name ILIKE '%research%';

UPDATE agents SET 
  business_function = 'Clinical Development',
  department = 'Clinical Operations',
  role = 'Clinical Trial Manager'
WHERE name ILIKE '%clinical%' OR name ILIKE '%trial%';

UPDATE agents SET 
  business_function = 'Regulatory Affairs',
  department = 'Global Regulatory',
  role = 'Regulatory Affairs Manager'
WHERE name ILIKE '%regulatory%' OR name ILIKE '%compliance%';

UPDATE agents SET 
  business_function = 'Quality',
  department = 'Quality Assurance',
  role = 'QA Manager'
WHERE name ILIKE '%quality%' OR name ILIKE '%qa%';

UPDATE agents SET 
  business_function = 'Commercial',
  department = 'Marketing',
  role = 'Marketing Manager'
WHERE name ILIKE '%marketing%' OR name ILIKE '%commercial%';

UPDATE agents SET 
  business_function = 'Finance',
  department = 'Finance & Accounting',
  role = 'Finance Director'
WHERE name ILIKE '%finance%' OR name ILIKE '%accounting%';

UPDATE agents SET 
  business_function = 'IT/Digital',
  department = 'Information Technology',
  role = 'IT Director'
WHERE name ILIKE '%it%' OR name ILIKE '%digital%' OR name ILIKE '%technology%';

UPDATE agents SET 
  business_function = 'Legal',
  department = 'Legal Affairs',
  role = 'General Counsel'
WHERE name ILIKE '%legal%' OR name ILIKE '%counsel%';

-- Verify the mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

SELECT 
  'Agents with business_function' as type,
  COUNT(*) as count
FROM agents 
WHERE business_function IS NOT NULL;

-- Show sample hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;
