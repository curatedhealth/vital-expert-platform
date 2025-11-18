-- ========================================
-- FINAL PERSONA MAPPING - REMAINING 23 PERSONAS
-- ========================================
-- Purpose: Map last unmapped personas to roles
-- Date: 2025-11-17
-- ========================================

BEGIN;

-- ========================================
-- MEDICAL AFFAIRS (4 personas)
-- ========================================

-- Medical Evidence Manager -> Map to RWE Specialist role
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'rwe-specialist'
  AND p.title ILIKE '%Medical Evidence Manager%';

-- ========================================
-- MARKET ACCESS (19 personas)
-- ========================================

-- Contracting Director - Specialty Pharmacy (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'contracting-director-specialty-pharmacy'
  AND p.title ILIKE '%Contracting Director - Specialty Pharmacy%';

-- Evidence Synthesis Lead (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'evidence-synthesis-lead'
  AND p.title ILIKE '%Evidence Synthesis Lead%';

-- MA Analyst - Competitive Intelligence (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ma-analyst-competitive-intelligence'
  AND p.title ILIKE '%MA Analyst - Competitive Intelligence%';

-- MA Business Analyst (1 persona)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ma-business-analyst'
  AND p.title ILIKE '%MA Business Analyst%';

-- MA Process Improvement Manager (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ma-process-improvement-manager'
  AND p.title ILIKE '%MA Process Improvement Manager%';

-- MA Project Manager (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ma-project-manager'
  AND p.title ILIKE '%MA Project Manager%';

-- MA Strategy Manager (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'ma-strategy-manager'
  AND p.title ILIKE '%MA Strategy Manager%';

-- Medicare & Medicaid Director (2 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'medicare-medicaid-director'
  AND p.title ILIKE '%Medicare & Medicaid Director%';

-- Senior MA Analyst - Forecasting (3 personas)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'senior-ma-analyst-forecasting'
  AND p.title ILIKE '%Senior MA Analyst - Forecasting%';

COMMIT;

-- Validation
SELECT
  CASE
    WHEN function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d' THEN 'Medical Affairs'
    WHEN function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3' THEN 'Market Access'
    ELSE 'Other'
  END as function_name,
  COUNT(*) as total_personas,
  COUNT(role_id) as has_role,
  COUNT(*) - COUNT(role_id) as unmapped,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 1) as percent_mapped
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
GROUP BY function_id
ORDER BY function_name;
