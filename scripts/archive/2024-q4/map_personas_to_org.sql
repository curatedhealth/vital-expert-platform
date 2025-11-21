-- ============================================================================
-- MAP PERSONAS TO ORGANIZATIONAL STRUCTURE
-- Link Personas → Roles → Departments → Functions
-- ============================================================================

BEGIN;

-- Map based on persona titles to corresponding roles

-- 1. HEALTH ECONOMICS DIRECTOR → Director HEOR
UPDATE personas SET
  role_id = (SELECT id FROM org_roles WHERE name = 'Director HEOR' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  function_id = (SELECT id FROM org_functions WHERE name = 'Market Access' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = (SELECT id FROM org_departments WHERE name = 'HEOR' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda')
WHERE title = 'HEALTH ECONOMICS DIRECTOR' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 2. MEDICAL AFFAIRS DIRECTOR → Medical Director
UPDATE personas SET
  role_id = (SELECT id FROM org_roles WHERE name = 'Medical Director' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  function_id = (SELECT id FROM org_functions WHERE name = 'Medical Affairs' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = NULL
WHERE title = 'MEDICAL AFFAIRS DIRECTOR' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 3. Dr. Sarah Chen - VP Clinical Development → Clinical Development Director (closest match)
UPDATE personas SET
  role_id = (SELECT id FROM org_roles WHERE name = 'Clinical Development Director' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  function_id = (SELECT id FROM org_functions WHERE name = 'Clinical' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = (SELECT id FROM org_departments WHERE name = 'Clinical Operations' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda')
WHERE name = 'Dr. Sarah Chen' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 4. Dr. Michael Zhang - Director, Clinical Trial Operations → Clinical Development Director
UPDATE personas SET
  role_id = (SELECT id FROM org_roles WHERE name = 'Clinical Development Director' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  function_id = (SELECT id FROM org_functions WHERE name = 'Clinical' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = (SELECT id FROM org_departments WHERE name = 'Clinical Operations' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda')
WHERE name = 'Dr. Michael Zhang' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 5. Dr. Robert Kim - Senior Director, Regulatory Affairs → Map to Regulatory function (no specific role yet)
UPDATE personas SET
  role_id = NULL,
  function_id = (SELECT id FROM org_functions WHERE name = 'Regulatory' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = NULL
WHERE name = 'Dr. Robert Kim' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 6. Dr. Jennifer Walsh - Chief Medical Officer → Medical Director (closest match)
UPDATE personas SET
  role_id = (SELECT id FROM org_roles WHERE name = 'Medical Director' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  function_id = (SELECT id FROM org_functions WHERE name = 'Medical Affairs' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
  department_id = NULL
WHERE name = 'Dr. Jennifer Walsh' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- 7. Maria Rodriguez - Senior Product Manager, Digital Health → No direct match, leave unmapped
-- (This is a digital health persona, not pharmaceutical)

-- 8. Alex Rivera - CEO & Co-Founder → No direct match, leave unmapped
-- (This is a digital health persona, not pharmaceutical)

COMMIT;

-- Verification
SELECT
  'Personas' as entity,
  COUNT(*) as total,
  COUNT(role_id) as has_role,
  COUNT(function_id) as has_function,
  COUNT(department_id) as has_department
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- Show mapped personas
SELECT
  p.name,
  p.title,
  r.name as role,
  f.name as function,
  d.name as department
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY p.name;

-- ✅ Personas mapped to org structure
