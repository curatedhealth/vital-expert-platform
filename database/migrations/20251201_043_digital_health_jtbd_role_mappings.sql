-- ============================================================================
-- MIGRATION 043: DIGITAL HEALTH JTBD-ROLE MAPPINGS
-- Version: 1.0.0 | Date: 2025-12-01
-- Purpose: Map Digital Health JTBDs to appropriate roles
-- ============================================================================

BEGIN;

-- Get tenant ID
DO $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE name ILIKE '%digital health%' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        SELECT id INTO v_tenant_id FROM tenants WHERE tenant_key = 'vital-system' LIMIT 1;
    END IF;
    PERFORM set_config('app.dh_tenant_id', v_tenant_id::text, false);
END $$;

-- ============================================================================
-- JTBD-ROLE MAPPINGS
-- Maps JTBDs to primary and secondary roles
-- ============================================================================

-- Digital Platforms & Solutions JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'high',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DPS-001', 'JTBD-DPS-002', 'JTBD-DPS-003', 'JTBD-DPS-004', 'JTBD-DPS-005', 'JTBD-DPS-006')
  AND r.name ILIKE '%product%manager%'
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Map to Software Engineers
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.90,
    'high',
    'daily'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DPS-002', 'JTBD-DPS-004', 'JTBD-DPS-005', 'JTBD-DPS-006')
  AND (r.name ILIKE '%software%' OR r.name ILIKE '%engineer%' OR r.name ILIKE '%developer%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Map to UX Designers
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'high',
    'daily'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DPS-003', 'JTBD-PPE-001', 'JTBD-PPE-002', 'JTBD-PPE-004')
  AND (r.name ILIKE '%ux%' OR r.name ILIKE '%design%' OR r.name ILIKE '%experience%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Commercialization & Market Access JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-CMA-001', 'JTBD-CMA-002', 'JTBD-CMA-003', 'JTBD-CMA-004')
  AND (r.name ILIKE '%market access%' OR r.name ILIKE '%commercial%' OR r.name ILIKE '%pricing%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Map to Sales roles
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.90,
    'high',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-CMA-005', 'JTBD-CMA-006')
  AND (r.name ILIKE '%sales%' OR r.name ILIKE '%business development%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Patient & Provider Experience JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'high',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-PPE-001', 'JTBD-PPE-002', 'JTBD-PPE-003', 'JTBD-PPE-004', 'JTBD-PPE-005')
  AND (r.name ILIKE '%patient%' OR r.name ILIKE '%experience%' OR r.name ILIKE '%engagement%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Technology & IT Infrastructure JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'daily'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-TIT-001', 'JTBD-TIT-002', 'JTBD-TIT-003', 'JTBD-TIT-004')
  AND (r.name ILIKE '%infrastructure%' OR r.name ILIKE '%security%' OR r.name ILIKE '%devops%' OR r.name ILIKE '%cloud%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Digital Clinical Development JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DCD-001', 'JTBD-DCD-002', 'JTBD-DCD-003', 'JTBD-DCD-004')
  AND (r.name ILIKE '%clinical%' OR r.name ILIKE '%trial%' OR r.name ILIKE '%biomarker%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Digital Health Strategy & Innovation JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'monthly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DSI-001', 'JTBD-DSI-002', 'JTBD-DSI-003', 'JTBD-DSI-004')
  AND (r.name ILIKE '%strategy%' OR r.name ILIKE '%innovation%' OR r.name ILIKE '%digital%' OR r.name ILIKE '%transformation%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Legal & IP JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-LIP-001', 'JTBD-LIP-002', 'JTBD-LIP-003', 'JTBD-LIP-004')
  AND (r.name ILIKE '%legal%' OR r.name ILIKE '%ip%' OR r.name ILIKE '%counsel%' OR r.name ILIKE '%compliance%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Data Science & Analytics JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'daily'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-DSA-001', 'JTBD-DSA-002', 'JTBD-DSA-003', 'JTBD-DSA-004')
  AND (r.name ILIKE '%data%' OR r.name ILIKE '%analytics%' OR r.name ILIKE '%scientist%' OR r.name ILIKE '%ml%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Regulatory, Quality & Compliance JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-RQC-001', 'JTBD-RQC-002', 'JTBD-RQC-003', 'JTBD-RQC-004')
  AND (r.name ILIKE '%regulatory%' OR r.name ILIKE '%quality%' OR r.name ILIKE '%compliance%' OR r.name ILIKE '%qms%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

-- Clinical Validation & RWE JTBDs
INSERT INTO jtbd_roles (id, tenant_id, jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT 
    gen_random_uuid(),
    current_setting('app.dh_tenant_id')::uuid,
    j.id,
    r.id,
    r.name,
    0.95,
    'critical',
    'weekly'
FROM jtbd j
CROSS JOIN org_roles r
WHERE j.code IN ('JTBD-CVR-001', 'JTBD-CVR-002', 'JTBD-CVR-003', 'JTBD-CVR-004')
  AND (r.name ILIKE '%clinical%' OR r.name ILIKE '%validation%' OR r.name ILIKE '%evidence%' OR r.name ILIKE '%heor%')
  AND r.tenant_id = current_setting('app.dh_tenant_id')::uuid
  AND NOT EXISTS (SELECT 1 FROM jtbd_roles jr WHERE jr.jtbd_id = j.id AND jr.role_id = r.id);

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count mappings by JTBD function
SELECT 
    CASE 
        WHEN j.code LIKE 'JTBD-DPS%' THEN 'Digital Platforms & Solutions'
        WHEN j.code LIKE 'JTBD-CMA%' THEN 'Commercialization & Market Access'
        WHEN j.code LIKE 'JTBD-PPE%' THEN 'Patient & Provider Experience'
        WHEN j.code LIKE 'JTBD-TIT%' THEN 'Technology & IT Infrastructure'
        WHEN j.code LIKE 'JTBD-DCD%' THEN 'Digital Clinical Development'
        WHEN j.code LIKE 'JTBD-DSI%' THEN 'Digital Health Strategy & Innovation'
        WHEN j.code LIKE 'JTBD-LIP%' THEN 'Legal & IP for Digital'
        WHEN j.code LIKE 'JTBD-DSA%' THEN 'Data Science & Analytics'
        WHEN j.code LIKE 'JTBD-RQC%' THEN 'Regulatory, Quality & Compliance'
        WHEN j.code LIKE 'JTBD-CVR%' THEN 'Clinical Validation & RWE'
        ELSE 'Other'
    END as function_area,
    COUNT(DISTINCT j.id) as jtbds,
    COUNT(jr.id) as role_mappings
FROM jtbd j
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.code LIKE 'JTBD-D%' OR j.code LIKE 'JTBD-C%' OR j.code LIKE 'JTBD-P%' 
   OR j.code LIKE 'JTBD-T%' OR j.code LIKE 'JTBD-L%' OR j.code LIKE 'JTBD-R%'
GROUP BY 1
ORDER BY 1;

-- Summary
SELECT 
    COUNT(DISTINCT j.id) as total_jtbds,
    COUNT(DISTINCT jr.role_id) as unique_roles_mapped,
    COUNT(jr.id) as total_mappings
FROM jtbd j
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.code LIKE 'JTBD-D%' OR j.code LIKE 'JTBD-C%' OR j.code LIKE 'JTBD-P%' 
   OR j.code LIKE 'JTBD-T%' OR j.code LIKE 'JTBD-L%' OR j.code LIKE 'JTBD-R%';



