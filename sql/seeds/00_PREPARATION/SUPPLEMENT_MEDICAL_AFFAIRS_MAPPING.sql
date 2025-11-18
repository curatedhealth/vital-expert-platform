-- ========================================
-- SUPPLEMENTAL MEDICAL AFFAIRS PERSONA MAPPING
-- ========================================
-- Purpose: Map remaining 52 unmapped Medical Affairs personas
-- Date: 2025-11-17
-- ========================================

BEGIN;

-- Clinical Trial Physician (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'clinical-trial-physician'
  AND p.title ILIKE '%Clinical Trial Physician%';

-- Epidemiologist (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'epidemiologist'
  AND p.title ILIKE '%Epidemiologist%';

-- Head of Medical Excellence (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-medical-excellence'
  AND p.title ILIKE '%Head Medical Excellence%';

-- Head of Medical Strategy (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'head-of-medical-strategy'
  AND p.title ILIKE '%Head Medical Strategy%';

-- Medical Affairs Clinical Liaison (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-affairs-clinical-liaison'
  AND p.title ILIKE '%Medical Affairs Clinical Liaison%';

-- Medical Analytics Manager - map to Medical Operations Manager (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-operations-manager'
  AND p.title ILIKE '%Medical Analytics Manager%';

-- Medical Business Partner (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-business-partner'
  AND p.title ILIKE '%Medical Business Partner%';

-- Medical Compliance Manager (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-compliance-manager'
  AND p.title ILIKE '%Medical Compliance Manager%';

-- Medical Evidence Manager - map to RWE Specialist (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'rwe-specialist'
  AND p.title ILIKE '%Medical Evidence Manager%';

-- Medical Monitor (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-monitor'
  AND p.title ILIKE '%Medical Monitor%';

-- Medical Operations Manager (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-operations-manager'
  AND p.title ILIKE '%Medical Operations Manager%';

-- Medical Quality Manager (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-quality-manager'
  AND p.title ILIKE '%Medical Quality Manager%';

-- Medical Training Manager (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medical-training-manager'
  AND p.title ILIKE '%Medical Training Manager%';

-- Safety Physician (4 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'safety-physician'
  AND p.title ILIKE '%Safety Physician%';

-- Study Site Medical Lead (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  department_id = r.department_id,
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'study-site-medical-lead'
  AND p.title ILIKE '%Study Site Medical Lead%';

COMMIT;

-- Validation
SELECT
  COUNT(*) as total_ma_personas,
  COUNT(function_id) as has_function,
  COUNT(department_id) as has_department,
  COUNT(role_id) as has_role,
  COUNT(*) - COUNT(role_id) as unmapped_roles
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d';
