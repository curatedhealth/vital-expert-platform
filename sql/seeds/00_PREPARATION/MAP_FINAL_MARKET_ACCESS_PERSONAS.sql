-- ========================================
-- MAP FINAL 19 MARKET ACCESS PERSONAS
-- ========================================
-- Purpose: Map remaining Market Access personas to closest available roles
-- Date: 2025-11-17
-- ========================================

BEGIN;

-- Contracting Director - Specialty Pharmacy -> Payer Account Manager (closest match)
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'payer-payer-account-manager'
  AND p.title ILIKE '%Contracting Director%';

-- Evidence Synthesis Lead -> Value Evidence Director
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'veo-value-evidence-director'
  AND p.title ILIKE '%Evidence Synthesis Lead%';

-- MA Analyst - Competitive Intelligence -> MA Data Analyst
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'analytics-ma-data-analyst'
  AND p.title ILIKE '%MA Analyst - Competitive Intelligence%';

-- MA Business Analyst -> MA Data Analyst
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'analytics-ma-data-analyst'
  AND p.title ILIKE '%MA Business Analyst%';

-- MA Process Improvement Manager -> MA Process Excellence Manager
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'operations-ma-process-excellence-manager'
  AND p.title ILIKE '%MA Process Improvement Manager%';

-- MA Project Manager -> Market Access Manager
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'market-access-manager'
  AND p.title ILIKE '%MA Project Manager%';

-- MA Strategy Manager -> MA Strategy & Planning Manager
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'operations-ma-strategy-planning-manager'
  AND p.title ILIKE '%MA Strategy Manager%';

-- Medicare & Medicaid Director -> Government Policy Analyst
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'govt-policy-analyst'
  AND p.title ILIKE '%Medicare & Medicaid Director%';

-- Senior MA Analyst - Forecasting -> Senior MA Analyst
UPDATE personas p
SET
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.slug = 'analytics-senior-ma-analyst'
  AND p.title ILIKE '%Senior MA Analyst - Forecasting%';

COMMIT;

-- Final validation
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
  AND function_id IN ('bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', '4087be09-38e0-4c84-81e6-f79dd38151d3')
GROUP BY function_id
ORDER BY function_name;
