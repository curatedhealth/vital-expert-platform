-- ================================================================
-- STRATEGIC OKR SEED MIGRATION
-- Populates okr and key_result tables linked to strategic pillars
-- Based on industry research and best practices
-- ================================================================
-- Version: 1.0
-- Date: 2025-11-29
-- Sources: OKR International, IBM, Quantive, Tability, Industry Reports
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 0: GET TENANT AND VERIFY PILLARS EXIST
-- ================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_pillar_count INTEGER;
BEGIN
  -- Get pharma tenant
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharma' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'vital-system' LIMIT 1;
  END IF;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  END IF;

  PERFORM set_config('app.seed_tenant_id', COALESCE(v_tenant_id::text, ''), false);

  -- Verify pillars exist
  SELECT COUNT(*) INTO v_pillar_count FROM strategic_pillars WHERE tenant_id = v_tenant_id;
  RAISE NOTICE 'Found % strategic pillars for tenant', v_pillar_count;
END $$;

-- ================================================================
-- SECTION 1: DIGITAL TRANSFORMATION OKRs (Theme: ST-DT-001)
-- ================================================================

-- OKR: AI & Machine Learning (Pillar: SP-DT-AI)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-DT-AI-001',
  'Deploy Gen AI capabilities across drug discovery and clinical development',
  'Transform R&D productivity by implementing AI/ML for target identification, compound screening, and clinical authoring with projected 30% timeline reduction.',
  'company',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-DT-AI' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

-- Key Results for OKR-DT-AI-001
INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-AI-001-01',
  'Implement AI-powered target identification in 3 therapeutic areas',
  'number', 0, 3, 'therapeutic areas', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-DT-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-AI-001-02',
  'Achieve 85% AI adoption rate among R&D scientists',
  'percentage', 25, 85, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-DT-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-AI-001-03',
  'Reduce clinical document authoring time by 50% using Gen AI',
  'percentage', 0, 50, '% reduction', 'not_started', 0.35
FROM okr o WHERE o.code = 'OKR-DT-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: Digital Clinical Trials (Pillar: SP-DT-CT)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-DT-CT-001',
  'Launch decentralized clinical trial platform for 50% of new studies',
  'Enable patient-centric clinical development through DCT capabilities including remote monitoring, digital biomarkers, and eConsent.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-DT-CT' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-CT-001-01',
  'Implement DCT capabilities in 50% of new Phase 2/3 trials',
  'percentage', 15, 50, '%', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-DT-CT-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-CT-001-02',
  'Improve patient retention rate by 20% through digital engagement',
  'percentage', 0, 20, '% improvement', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-DT-CT-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-DT-CT-001-03',
  'Reduce site-related costs by 30% via remote monitoring',
  'percentage', 0, 30, '% reduction', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-DT-CT-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 2: PATIENT CENTRICITY OKRs (Theme: ST-PC-001)
-- ================================================================

-- OKR: Patient Voice Integration (Pillar: SP-PC-PV)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-PC-PV-001',
  'Integrate patient voice systematically across all therapeutic areas',
  'Establish patient advisory boards and Voice of Patient programs to ensure patient perspectives inform development decisions.',
  'company',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-PC-PV' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PV-001-01',
  'Establish patient advisory boards in 100% of priority therapeutic areas',
  'percentage', 40, 100, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-PC-PV-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PV-001-02',
  'Generate Voice of Patient reports for 5 key programs',
  'number', 0, 5, 'reports', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-PC-PV-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PV-001-03',
  'Achieve 80% patient insight integration in development protocols',
  'percentage', 30, 80, '%', 'not_started', 0.35
FROM okr o WHERE o.code = 'OKR-PC-PV-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: PRO Excellence (Pillar: SP-PC-PRO)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-PC-PRO-001',
  'Implement FDA PFDD-compliant PRO endpoints in all Phase 3 trials',
  'Develop and validate fit-for-purpose PRO instruments per FDA Patient-Focused Drug Development guidance.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-PC-PRO' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PRO-001-01',
  'Include PRO endpoints in 100% of Phase 3 registration trials',
  'percentage', 60, 100, '%', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-PC-PRO-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PRO-001-02',
  'Validate 3 new fit-for-purpose PRO instruments',
  'number', 0, 3, 'instruments', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-PC-PRO-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-PC-PRO-001-03',
  'Achieve PRO label claim for 2 new product approvals',
  'number', 0, 2, 'label claims', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-PC-PRO-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 3: SCIENTIFIC INNOVATION & R&D OKRs (Theme: ST-RD-001)
-- ================================================================

-- OKR: Novel Modalities Leadership (Pillar: SP-RD-NM)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-RD-NM-001',
  'Build leading CGT and RNA therapeutics platform capabilities',
  'Establish world-class capabilities in cell therapy, gene therapy, and RNA-based medicines representing $197B pipeline opportunity.',
  'company',
  'aspirational',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-RD-NM' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-NM-001-01',
  'Advance 2 CGT programs to Phase 2 clinical development',
  'number', 0, 2, 'programs', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-RD-NM-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-NM-001-02',
  'File 3 new IND applications for novel modality candidates',
  'number', 0, 3, 'INDs', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-RD-NM-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-NM-001-03',
  'Establish manufacturing partnerships for 2 CGT platforms',
  'number', 0, 2, 'partnerships', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-RD-NM-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: AI Drug Discovery (Pillar: SP-RD-AI)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-RD-AI-001',
  'Reduce drug discovery timelines by 30% through AI platforms',
  'Leverage AI/ML to accelerate target identification, hit finding, and lead optimization.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-RD-AI' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-AI-001-01',
  'Achieve 30% reduction in hit-to-lead timeline using AI',
  'percentage', 0, 30, '% reduction', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-RD-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-AI-001-02',
  'Deploy ML-based toxicity prediction for 100% of new compounds',
  'percentage', 30, 100, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-RD-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-AI-001-03',
  'Identify 5 novel targets using AI-driven genomics analysis',
  'number', 0, 5, 'targets', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-RD-AI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: Clinical Development Innovation (Pillar: SP-RD-CD)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-RD-CD-001',
  'Improve clinical success rates through adaptive trial designs',
  'Address 6.7% Phase 1 success rate by implementing innovative trial designs and predictive biomarkers.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-RD-CD' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-CD-001-01',
  'Implement adaptive trial designs in 40% of Phase 2 studies',
  'percentage', 15, 40, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-RD-CD-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-CD-001-02',
  'Improve Phase 2 to Phase 3 transition rate by 15%',
  'percentage', 0, 15, '% improvement', 'not_started', 0.35
FROM okr o WHERE o.code = 'OKR-RD-CD-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RD-CD-001-03',
  'Reduce average trial duration by 4 months through protocol optimization',
  'number', 0, 4, 'months reduction', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-RD-CD-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 4: OPERATIONAL EXCELLENCE OKRs (Theme: ST-OE-001)
-- ================================================================

-- OKR: Manufacturing Excellence (Pillar: SP-OE-MX)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-OE-MX-001',
  'Achieve manufacturing excellence through continuous manufacturing',
  'Implement continuous manufacturing and QbD for improved quality and reduced costs.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-OE-MX' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-MX-001-01',
  'Implement continuous manufacturing for 3 key products',
  'number', 1, 3, 'products', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-OE-MX-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-MX-001-02',
  'Achieve 98% right-first-time manufacturing rate',
  'percentage', 92, 98, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-OE-MX-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-MX-001-03',
  'Reduce manufacturing costs by 15% through automation',
  'percentage', 0, 15, '% reduction', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-OE-MX-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: Supply Chain Resilience (Pillar: SP-OE-SC)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-OE-SC-001',
  'Build resilient supply chain with zero drug shortages',
  'Implement dual sourcing, backward integration, and risk monitoring to address 277 active drug shortages.',
  'company',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-OE-SC' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-SC-001-01',
  'Achieve dual sourcing for 100% of critical raw materials',
  'percentage', 60, 100, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-OE-SC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-SC-001-02',
  'Zero drug shortage incidents for key products',
  'number', 3, 0, 'incidents', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-OE-SC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-OE-SC-001-03',
  'Reduce API import dependence by 25% through backward integration',
  'percentage', 0, 25, '% reduction', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-OE-SC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 5: MARKET ACCESS & VALUE OKRs (Theme: ST-MA-001)
-- ================================================================

-- OKR: HEOR Excellence (Pillar: SP-MA-HEOR)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-MA-HEOR-001',
  'Integrate HEOR from Phase 2 for optimal market access',
  'Ensure early evidence generation with HEOR integrated by Phase 2 for all priority assets.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-MA-HEOR' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HEOR-001-01',
  'Complete HEOR evidence packages for 100% of Phase 3 assets',
  'percentage', 70, 100, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-MA-HEOR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HEOR-001-02',
  'Generate RWE studies for 5 key marketed products',
  'number', 2, 5, 'studies', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-MA-HEOR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HEOR-001-03',
  'Achieve favorable cost-effectiveness threshold in 80% of HTA submissions',
  'percentage', 60, 80, '%', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-MA-HEOR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: HTA Navigation / JCA Readiness (Pillar: SP-MA-HTA)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-MA-HTA-001',
  'Achieve 100% readiness for EU Joint Clinical Assessment (JCA)',
  'Prepare evidence packages and processes for JCA which started January 2025.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-MA-HTA' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HTA-001-01',
  'Complete JCA evidence packages for all 2025 submission candidates',
  'percentage', 0, 100, '%', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-MA-HTA-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HTA-001-02',
  'Train 100% of market access teams on JCA requirements',
  'percentage', 50, 100, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-MA-HTA-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-MA-HTA-001-03',
  'Achieve positive JCA outcome in first submission',
  'boolean', 0, 1, 'achieved', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-MA-HTA-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 6: REGULATORY EXCELLENCE OKRs (Theme: ST-RE-001)
-- ================================================================

-- OKR: Inspection Readiness (Pillar: SP-RE-IR)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-RE-IR-001',
  'Achieve zero critical findings in all regulatory inspections',
  'Maintain inspection readiness through robust QMS, documentation, and training programs.',
  'company',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-RE-IR' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-IR-001-01',
  'Zero critical findings in FDA/EMA inspections',
  'number', 2, 0, 'critical findings', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-RE-IR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-IR-001-02',
  'Complete 100% of self-inspections per schedule',
  'percentage', 85, 100, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-RE-IR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-IR-001-03',
  'Achieve 100% training compliance across all GxP roles',
  'percentage', 92, 100, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-RE-IR-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: Digital Compliance (Pillar: SP-RE-DC)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-RE-DC-001',
  'Deploy AI-powered compliance monitoring across operations',
  'Implement real-time monitoring and AI tools (45% industry adoption) for 32% compliance improvement.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-RE-DC' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-DC-001-01',
  'Implement AI-powered document review for 100% of regulatory submissions',
  'percentage', 30, 100, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-RE-DC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-DC-001-02',
  'Deploy real-time deviation monitoring across 100% of manufacturing sites',
  'percentage', 50, 100, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-RE-DC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-RE-DC-001-03',
  'Reduce CAPA closure time by 40% through AI-assisted root cause analysis',
  'percentage', 0, 40, '% reduction', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-RE-DC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- ================================================================
-- SECTION 7: COMMERCIAL EXCELLENCE OKRs (Theme: ST-CE-001)
-- ================================================================

-- OKR: Omnichannel Orchestration (Pillar: SP-CE-OC)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-CE-OC-001',
  'Achieve omnichannel maturity Stage 3+ across all markets',
  'Transform from 80% generic HCP communications to personalized, connected journeys for 5-10% revenue uplift.',
  'company',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-CE-OC' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-OC-001-01',
  'Reduce generic HCP communications from 80% to 30%',
  'percentage', 80, 30, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-CE-OC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-OC-001-02',
  'Achieve 50%+ HCP cross-channel engagement rate',
  'percentage', 25, 50, '%', 'on_track', 0.35
FROM okr o WHERE o.code = 'OKR-CE-OC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-OC-001-03',
  'Achieve 5% revenue uplift from omnichannel transformation',
  'percentage', 0, 5, '% uplift', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-CE-OC-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

-- OKR: 360 HCP View (Pillar: SP-CE-DI)
INSERT INTO okr (id, tenant_id, strategic_pillar_id, code, objective, description, level, objective_type, timeframe, period_start, period_end, status)
SELECT
  gen_random_uuid(),
  current_setting('app.seed_tenant_id', true)::uuid,
  sp.id,
  'OKR-CE-DI-001',
  'Build unified 360-degree HCP profile across all touchpoints',
  'Break departmental data silos to create unified HCP profiles across sales, marketing, and medical.',
  'department',
  'committed',
  'annual',
  '2025-01-01',
  '2025-12-31',
  'active'
FROM strategic_pillars sp
WHERE sp.code = 'SP-CE-DI' AND sp.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  objective = EXCLUDED.objective, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-DI-001-01',
  'Integrate 100% of HCP interaction data sources into CDP',
  'percentage', 40, 100, '%', 'on_track', 0.40
FROM okr o WHERE o.code = 'OKR-CE-DI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-DI-001-02',
  'Achieve 90% HCP profile completeness score',
  'percentage', 55, 90, '%', 'on_track', 0.30
FROM okr o WHERE o.code = 'OKR-CE-DI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

INSERT INTO key_result (id, okr_id, tenant_id, kr_code, description, metric_type, baseline_value, target_value, unit, status, weight)
SELECT gen_random_uuid(), o.id, o.tenant_id, 'KR-CE-DI-001-03',
  'Enable real-time HCP insights for 100% of field teams',
  'percentage', 30, 100, '%', 'not_started', 0.30
FROM okr o WHERE o.code = 'OKR-CE-DI-001' AND o.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (okr_id, kr_code) DO NOTHING;

COMMIT;

-- ================================================================
-- VERIFICATION REPORT
-- ================================================================

DO $$
DECLARE
  v_okrs INTEGER;
  v_krs INTEGER;
  v_pillars_with_okrs INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_okrs FROM okr WHERE tenant_id = current_setting('app.seed_tenant_id', true)::uuid;
  SELECT COUNT(*) INTO v_krs FROM key_result WHERE tenant_id = current_setting('app.seed_tenant_id', true)::uuid;
  SELECT COUNT(DISTINCT strategic_pillar_id) INTO v_pillars_with_okrs FROM okr
    WHERE tenant_id = current_setting('app.seed_tenant_id', true)::uuid AND strategic_pillar_id IS NOT NULL;

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'STRATEGIC OKR SEED COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'OKRs created: % objectives', v_okrs;
  RAISE NOTICE 'Key Results created: % metrics', v_krs;
  RAISE NOTICE 'Pillars with OKRs: % of 33', v_pillars_with_okrs;
  RAISE NOTICE '';
  RAISE NOTICE 'OKRs by Theme:';
  RAISE NOTICE '  Digital Transformation: 2 OKRs';
  RAISE NOTICE '  Patient Centricity: 2 OKRs';
  RAISE NOTICE '  Scientific Innovation: 3 OKRs';
  RAISE NOTICE '  Operational Excellence: 2 OKRs';
  RAISE NOTICE '  Market Access: 2 OKRs';
  RAISE NOTICE '  Regulatory Excellence: 2 OKRs';
  RAISE NOTICE '  Commercial Excellence: 2 OKRs';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Total: 15 OKRs, 45 Key Results';
  RAISE NOTICE '================================================================';
END $$;
