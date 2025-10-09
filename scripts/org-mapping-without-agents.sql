-- =====================================================================
-- ORGANIZATIONAL MAPPING WITHOUT AGENTS
-- =====================================================================
-- This script establishes Functions → Departments → Roles mappings
-- Run this AFTER fixing the agents table schema

-- =====================================================================
-- STEP 1: DEPARTMENT TO FUNCTION MAPPINGS
-- =====================================================================

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

-- =====================================================================
-- STEP 2: ROLE TO DEPARTMENT AND FUNCTION MAPPINGS
-- =====================================================================

-- Commercial roles
UPDATE org_roles SET department_id = '27b232a1-68fc-44dd-8355-99bea58723a7', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '421d7944-05ce-4ec8-9059-45e8a4697312'; -- VP Marketing → Marketing → Commercial
UPDATE org_roles SET department_id = '27b232a1-68fc-44dd-8355-99bea58723a7', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '4d69a73e-b7a4-46b3-b162-bd8b79c31803'; -- Brand Director → Marketing → Commercial
UPDATE org_roles SET department_id = '27b232a1-68fc-44dd-8355-99bea58723a7', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '043b64d8-f3f3-47f1-ad10-67b9560ddd1e'; -- Product Manager → Marketing → Commercial
UPDATE org_roles SET department_id = '27b232a1-68fc-44dd-8355-99bea58723a7', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = 'e13f3a00-4518-4656-be3e-ece08fb13a63'; -- Marketing Manager → Marketing → Commercial
UPDATE org_roles SET department_id = '27b232a1-68fc-44dd-8355-99bea58723a7', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '44e34e2f-4408-48a4-a945-e99d00f42bc3'; -- Digital Marketing Specialist → Marketing → Commercial
UPDATE org_roles SET department_id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '29dbeb90-ef71-4fee-92fa-eb589fe2ca22'; -- VP Sales → Sales → Commercial
UPDATE org_roles SET department_id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '00ffd9cb-8bb9-47c3-8f84-67db003871d8'; -- National Sales Director → Sales → Commercial
UPDATE org_roles SET department_id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = 'ced1d987-84b2-4257-a844-44a2d64decfe'; -- Regional Sales Manager → Sales → Commercial
UPDATE org_roles SET department_id = 'cfcf1dc0-ea93-42f8-bfe6-11de90fcad0b', function_id = '25fe5d84-9cdf-4643-8b51-6eb5684a1b7c' WHERE id = '2fb87768-b406-4536-b49f-df6388f8532e'; -- Territory Manager → Sales → Commercial

-- Business Development roles
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '84498c52-8898-4158-bbdc-bbf610ba914c'; -- Chief Business Officer → Strategic Planning → Business Development
UPDATE org_roles SET department_id = '11d3ae96-cb3a-402e-bb19-34df64d0ac0f', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '59b8600f-96ab-4045-8b21-4d447d1ca6ac'; -- BD Director → BD&L → Business Development
UPDATE org_roles SET department_id = '11d3ae96-cb3a-402e-bb19-34df64d0ac0f', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = 'e3ee5f4f-66fa-4306-83a7-6b1ffa6f7c10'; -- Licensing Manager → BD&L → Business Development
UPDATE org_roles SET department_id = '11d3ae96-cb3a-402e-bb19-34df64d0ac0f', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '4c459e7c-8375-4810-82bb-13b8a492185b'; -- Alliance Manager → BD&L → Business Development
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '55efa404-8e27-49c3-a278-aeff9f4084c6'; -- Strategy Director → Strategic Planning → Business Development
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = 'b20757b8-e440-41f1-b440-98fd2f543f51'; -- Strategic Planner → Strategic Planning → Business Development
UPDATE org_roles SET department_id = '0d16aa8f-57bd-46e4-9992-4ea7d5be98b0', function_id = 'd545d3f1-596c-4631-96a5-f038f4a28578' WHERE id = '20368208-1414-49aa-8ef3-09086f7067f2'; -- Business Analyst → Strategic Planning → Business Development

-- Finance roles
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = 'e23b7700-688c-4cd6-8cb9-4f2786abe558'; -- CFO → Finance & Accounting → Finance
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = '26e98e22-9234-4ff2-8579-6854f3e9314c'; -- Finance Director → Finance & Accounting → Finance
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = '8f285d49-31fa-4372-aa78-9fbed5fcc9a7'; -- Controller → Finance & Accounting → Finance
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = 'a8135241-72ef-4268-902d-558c71ca4c24'; -- FP&A Manager → Finance & Accounting → Finance
UPDATE org_roles SET department_id = '409dba65-612f-40bc-9acf-e0bdfa998315', function_id = 'f8bef4c3-ea09-4913-8ce7-159f8bc41111' WHERE id = '2c97fc6c-77e7-452b-89e9-788ffa88a28c'; -- Cost Accountant → Finance & Accounting → Finance

-- IT/Digital roles
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = '8c59188e-f26d-4f83-92cd-5f27e88a6528'; -- CIO → Information Technology → IT/Digital
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = '8eba1752-a904-4627-b757-982f34c5c85c'; -- IT Director → Information Technology → IT/Digital
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- System Architect → Information Technology → IT/Digital
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = 'b2c3d4e5-f6g7-8901-bcde-f23456789012'; -- Data Scientist → Information Technology → IT/Digital
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = 'c3d4e5f6-g7h8-9012-cdef-345678901234'; -- Cybersecurity Specialist → Information Technology → IT/Digital
UPDATE org_roles SET department_id = 'ffceccd5-b42e-4ef3-bf56-336671cc306a', function_id = '2d60c9c9-5b2d-4e1f-8c19-e3b98aa57fd9' WHERE id = 'd4e5f6g7-h8i9-0123-def0-456789012345'; -- Digital Transformation Lead → Information Technology → IT/Digital

-- Legal roles
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'e5f6g7h8-i9j0-1234-ef01-567890123456'; -- General Counsel → Legal Affairs → Legal
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'f6g7h8i9-j0k1-2345-f012-678901234567'; -- Patent Attorney → Legal Affairs → Legal
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'g7h8i9j0-k1l2-3456-0123-789012345678'; -- Regulatory Attorney → Legal Affairs → Legal
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'h8i9j0k1-l2m3-4567-1234-890123456789'; -- Contract Manager → Legal Affairs → Legal
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'i9j0k1l2-m3n4-5678-2345-901234567890'; -- Compliance Lawyer → Legal Affairs → Legal
UPDATE org_roles SET department_id = '94ea736e-fecd-4d7f-8b44-8b4e82698ca4', function_id = '72f68b01-d6a3-4dad-a5a5-39bd8228e5da' WHERE id = 'j0k1l2m3-n4o5-6789-3456-012345678901'; -- IP Specialist → Legal Affairs → Legal

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check department mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

-- Check role mappings
SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

-- Show hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;
