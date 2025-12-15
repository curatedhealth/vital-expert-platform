-- ================================================================
-- JTBD-ROLE BULK MAPPING MIGRATION
-- Maps 354 unmapped JTBDs to appropriate roles
-- ================================================================
-- Version: 1.0
-- Date: 2025-11-29
-- Strategy: Map by functional_area + jtbd_type + complexity
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 0: GET TENANT
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharma' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants WHERE name ILIKE '%pharma%' LIMIT 1;
  END IF;
  PERFORM set_config('app.seed_tenant_id', v_tenant_id::text, false);
  RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
END $$;

-- ================================================================
-- SECTION 1: MAPPING STRATEGY
-- ================================================================
-- Strategy:
-- 1. Medical Affairs JTBDs -> MSL, Medical Director, HEOR roles
-- 2. Market Access JTBDs -> Market Access Director, Payer Liaison roles
-- 3. Commercial JTBDs -> Commercial Lead roles
-- 4. Regulatory JTBDs -> Regulatory Officer roles
-- 5. Strategic JTBDs -> Director/VP level roles
-- 6. Operational JTBDs -> Senior/Mid level roles
-- 7. Tactical JTBDs -> Entry/Mid level roles

-- ================================================================
-- SECTION 2: MEDICAL AFFAIRS JTBD MAPPINGS
-- ================================================================

-- Map Medical Affairs Strategic JTBDs to VP/Director roles
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  CASE
    WHEN j.jtbd_type = 'strategic' THEN 0.95
    WHEN j.jtbd_type = 'operational' THEN 0.85
    ELSE 0.75
  END,
  CASE
    WHEN j.strategic_priority = 'critical' THEN 'critical'
    WHEN j.strategic_priority = 'high' THEN 'high'
    ELSE 'medium'
  END,
  COALESCE(j.frequency::text, 'monthly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug IN ('vp-medical-affairs', 'medical-director-ta')
  ORDER BY
    CASE WHEN j.jtbd_type = 'strategic' THEN 0 ELSE 1 END,
    RANDOM()
  LIMIT 1
) r
WHERE j.functional_area = 'Medical Affairs'
AND j.jtbd_type = 'strategic'
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- Map Medical Affairs Operational JTBDs to MSL/Senior roles
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  0.85,
  'high',
  COALESCE(j.frequency::text, 'weekly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug IN ('msl', 'senior-msl', 'msl-manager', 'heor-specialist', 'mi-manager')
  ORDER BY RANDOM()
  LIMIT 1
) r
WHERE j.functional_area = 'Medical Affairs'
AND j.jtbd_type = 'operational'
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- Map Medical Affairs Tactical JTBDs to Mid/Entry roles
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  0.75,
  'medium',
  COALESCE(j.frequency::text, 'daily')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug IN ('msl', 'mi-specialist', 'heor-analyst', 'medical-writer')
  ORDER BY RANDOM()
  LIMIT 1
) r
WHERE j.functional_area = 'Medical Affairs'
AND j.jtbd_type = 'tactical'
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- ================================================================
-- SECTION 3: MARKET ACCESS JTBD MAPPINGS
-- ================================================================

-- Map Market Access JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  CASE
    WHEN j.jtbd_type = 'strategic' THEN 0.95
    WHEN j.jtbd_type = 'operational' THEN 0.85
    ELSE 0.75
  END,
  CASE
    WHEN j.strategic_priority = 'critical' THEN 'critical'
    WHEN j.strategic_priority = 'high' THEN 'high'
    ELSE 'medium'
  END,
  COALESCE(j.frequency::text, 'quarterly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug IN ('vp-market-access', 'market-access-director', 'payer-liaison', 'payer-evidence-lead', 'heor-director')
  ORDER BY
    CASE
      WHEN j.jtbd_type = 'strategic' AND slug IN ('vp-market-access', 'market-access-director') THEN 0
      WHEN j.jtbd_type = 'operational' AND slug IN ('payer-liaison', 'heor-director') THEN 0
      ELSE 1
    END,
    RANDOM()
  LIMIT 1
) r
WHERE j.functional_area = 'Market Access'
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- ================================================================
-- SECTION 4: COMMERCIAL JTBD MAPPINGS
-- ================================================================

INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  0.85,
  'high',
  COALESCE(j.frequency::text, 'monthly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug = 'commercial-lead'
  LIMIT 1
) r
WHERE j.functional_area IN ('Commercial', 'Commercial Organization')
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- ================================================================
-- SECTION 5: REGULATORY JTBD MAPPINGS
-- ================================================================

INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  0.90,
  'critical',
  COALESCE(j.frequency::text, 'quarterly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug = 'chief-regulatory-officer'
  LIMIT 1
) r
WHERE j.functional_area IN ('Regulatory', 'Regulatory Affairs')
AND NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
);

-- ================================================================
-- SECTION 6: CATCH-ALL FOR REMAINING UNMAPPED JTBDs
-- ================================================================

-- Map any remaining unmapped JTBDs based on complexity
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  r.id,
  r.name,
  0.70,
  'medium',
  COALESCE(j.frequency::text, 'monthly')
FROM jtbd j
CROSS JOIN LATERAL (
  SELECT id, name FROM org_roles
  WHERE slug IN (
    CASE
      WHEN j.complexity IN ('very_high', 'high') THEN 'vp-medical-affairs'
      WHEN j.complexity = 'medium' THEN 'msl-manager'
      ELSE 'msl'
    END
  )
  LIMIT 1
) r
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
)
AND r.id IS NOT NULL;

-- Final catch-all for any still unmapped (use MSL as default)
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id')::uuid,
  j.id,
  (SELECT id FROM org_roles WHERE slug = 'msl' LIMIT 1),
  'Medical Science Liaison',
  0.60,
  'medium',
  'monthly'
FROM jtbd j
WHERE NOT EXISTS (
  SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id
)
AND EXISTS (SELECT 1 FROM org_roles WHERE slug = 'msl');

COMMIT;

-- ================================================================
-- SUMMARY REPORT
-- ================================================================

DO $$
DECLARE
  v_total_mappings INTEGER;
  v_unique_jtbds INTEGER;
  v_unique_roles INTEGER;
  v_unmapped INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_mappings FROM jtbd_roles;
  SELECT COUNT(DISTINCT jtbd_id) INTO v_unique_jtbds FROM jtbd_roles;
  SELECT COUNT(DISTINCT role_id) INTO v_unique_roles FROM jtbd_roles;
  SELECT COUNT(*) INTO v_unmapped FROM jtbd WHERE id NOT IN (SELECT DISTINCT jtbd_id FROM jtbd_roles);

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JTBD-ROLE BULK MAPPING COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Total JTBD-Role Mappings: %', v_total_mappings;
  RAISE NOTICE 'Unique JTBDs with Roles: %', v_unique_jtbds;
  RAISE NOTICE 'Unique Roles with JTBDs: %', v_unique_roles;
  RAISE NOTICE 'JTBDs Still Unmapped: %', v_unmapped;
  RAISE NOTICE '================================================================';
END $$;
