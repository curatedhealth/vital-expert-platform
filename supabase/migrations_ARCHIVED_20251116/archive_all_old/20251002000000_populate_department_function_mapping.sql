-- Migration: Populate org_departments.function_id based on logical department-to-function mapping
-- Date: 2025-01-02
-- Purpose: Enable cascading dropdowns (Function -> Department -> Role)

-- Update departments with their corresponding business function
-- Based on pharmaceutical industry organizational structure

-- Research & Development departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-001')
WHERE department_name IN ('Drug Discovery', 'Preclinical Development', 'Translational Medicine');

-- Clinical Development departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-002')
WHERE department_name IN ('Clinical Development', 'Clinical Operations', 'Biostatistics', 'Data Management');

-- Regulatory Affairs departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-003')
WHERE department_name IN ('Global Regulatory', 'Regulatory CMC', 'Regulatory Intelligence');

-- Manufacturing departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-004')
WHERE department_name IN ('Drug Substance', 'Drug Product', 'Supply Chain');

-- Quality departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-005')
WHERE department_name IN ('Quality Assurance', 'Quality Control', 'Quality Compliance');

-- Medical Affairs departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-006')
WHERE department_name IN ('Medical Science Liaisons', 'Medical Information', 'Medical Communications');

-- Pharmacovigilance departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-007')
WHERE department_name IN ('Drug Safety', 'Risk Management', 'Epidemiology');

-- Commercial departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-008')
WHERE department_name IN ('Marketing', 'Sales');

-- Business Development departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-009')
WHERE department_name IN ('BD&L', 'Strategic Planning');

-- Legal departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-010')
WHERE department_name IN ('Legal Affairs');

-- Finance departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-011')
WHERE department_name IN ('Finance & Accounting');

-- IT/Digital departments
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'BF-012')
WHERE department_name IN ('Information Technology');

-- Market Access departments (FUNC-013)
UPDATE org_departments SET function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-013')
WHERE department_name IN ('Market Access', 'HEOR');

-- Verify the update
SELECT
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;

-- Show any departments that are still unmapped
SELECT department_name
FROM org_departments
WHERE function_id IS NULL
ORDER BY department_name;
