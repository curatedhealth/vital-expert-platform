-- ================================================================
-- STRATEGIC ONTOLOGY SEED MIGRATION
-- Populates strategic_themes, strategic_pillars, strategic_priorities
-- Based on evidence-based research from 7 Knowledge Domains
-- ================================================================
-- Version: 1.0
-- Date: 2025-11-29
-- Sources: McKinsey, BCG, Deloitte, IQVIA, FDA, EMA, ZS, Indegene
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 1: STRATEGIC THEMES (7 Themes)
-- ================================================================

-- Get pharma tenant for seeding
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharma' LIMIT 1;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'vital-system' LIMIT 1;
  END IF;
  PERFORM set_config('app.seed_tenant_id', COALESCE(v_tenant_id::text, ''), false);
END $$;

-- Insert Strategic Themes
-- Schema: id, tenant_id, code, name, description, start_year, end_year, status, parent_theme_id, success_metrics, progress_percentage
INSERT INTO strategic_themes (id, tenant_id, code, name, description, start_year, end_year, status, success_metrics, created_at, updated_at)
VALUES
  -- Theme 1: Digital Transformation
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-DT-001', 'Digital Transformation',
   'Fundamental shift from siloed systems to cloud-native platforms, AI-driven analytics, and connected devices across the pharmaceutical value chain.',
   2024, 2029, 'active',
   '{
     "value_potential": "$60-110B (Gen AI alone)",
     "key_statistics": {
       "ai_investment_intent": "85% of biopharma executives",
       "timeline_reduction": "Up to 30% for digitally mature companies",
       "gen_ai_value": "$60-110 billion"
     },
     "key_areas": ["AI/ML", "Cloud", "Connected Health", "Digital Trials"],
     "sources": ["McKinsey", "BCG", "Deloitte", "IQVIA", "ZS"],
     "evidence_year": 2024
   }'::jsonb, NOW(), NOW()),

  -- Theme 2: Patient Centricity
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-PC-001', 'Patient Centricity',
   'Putting the patient first through sustained two-way engagement that respectfully and compassionately works toward the best possible outcomes for patients and their families.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "perception_gap": "Only 45% of HCPs believe pharma provides high patient centricity",
       "fda_guidance": "4-part PFDD guidance series"
     },
     "key_areas": ["PROs", "Patient Voice", "PFDD", "Personalization"],
     "regulatory_frameworks": ["FDA PFDD", "EMA 2025 Strategy", "ICH"],
     "sources": ["FDA", "EMA", "ZS", "IQVIA", "Nature"],
     "evidence_year": 2024
   }'::jsonb, NOW(), NOW()),

  -- Theme 3: Scientific Innovation & R&D
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-RD-001', 'Scientific Innovation & R&D',
   'Bold innovation in drug discovery and development through novel modalities, AI-powered platforms, and strategic portfolio management to address declining productivity and the approaching patent cliff.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "pipeline_value": "$197B in novel modalities (60% of total)",
       "r_and_d_cost": "$2.23B per asset",
       "phase1_success": "6.7% (vs 10% decade ago)",
       "patent_cliff": "$350B at risk 2025-2029",
       "first_in_class_share": "50% (vs 20% in 2000)"
     },
     "key_areas": ["Novel Modalities", "AI Discovery", "CGT", "ADCs", "RNA"],
     "sources": ["IQVIA", "BCG", "Deloitte", "ASGCT"],
     "evidence_year": 2025
   }'::jsonb, NOW(), NOW()),

  -- Theme 4: Operational Excellence
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-OE-001', 'Operational Excellence',
   'Evolution of operations from cost center to strategic engine of resilience and growth through digitalization, automation, AI integration, and supply chain transformation.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "drug_shortages": "277 active (late 2024)",
       "patent_cliff": "$236B at risk 2025-2030",
       "manufacturing_cost_share": "30-40%",
       "compliance_improvement": "32% with real-time systems"
     },
     "key_technologies": ["AI", "Blockchain", "Digital Twins", "IoT"],
     "sources": ["Roland Berger", "Wiley", "Number Analytics"],
     "evidence_year": 2024
   }'::jsonb, NOW(), NOW()),

  -- Theme 5: Market Access & Value
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-MA-001', 'Market Access & Value Demonstration',
   'Ensuring premium-priced medicines reach patients by persuading payers and HTAs of clinical and economic value through early HEOR integration, value-based contracting, and real-world evidence.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "jca_effective": "January 2025",
       "vbc_trend": "Increasing prevalence"
     },
     "key_challenges": ["HTA divergence", "Payer scrutiny", "CGT costs"],
     "contract_types": ["Outcomes-based", "Risk-share", "Pay-for-performance"],
     "sources": ["Deloitte", "Tribeca Knowledge", "IntegriChain"],
     "evidence_year": 2025
   }'::jsonb, NOW(), NOW()),

  -- Theme 6: Regulatory Excellence
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-RE-001', 'Regulatory Excellence & Compliance',
   'Ensuring pharmaceutical products meet safety, efficacy, and quality standards through risk-based compliance, real-time monitoring, and technology-enabled regulatory management.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "non_compliance_cost": "$14.8M per violation",
       "ai_adoption": "45% of companies"
     },
     "key_agencies": ["FDA", "EMA", "MHRA", "PMDA"],
     "focus_areas": ["Data Integrity", "Risk Management", "CAPA", "Cleaning Validation"],
     "sources": ["FDA", "EMA", "ComplianceQuest", "Scilife"],
     "evidence_year": 2025
   }'::jsonb, NOW(), NOW()),

  -- Theme 7: Commercial Excellence
  (gen_random_uuid(), current_setting('app.seed_tenant_id', true)::uuid, 'ST-CE-001', 'Commercial Excellence',
   'Evolving from traditional sales rep-led models to personalized omnichannel strategies that deliver seamless, service-oriented HCP experiences across preferred channels.',
   2024, 2029, 'active',
   '{
     "key_statistics": {
       "hcp_generic_comms": "80%",
       "hcp_personally_engaged": "<20%",
       "revenue_uplift": "5-10%",
       "marketing_efficiency": "10-20%"
     },
     "key_challenges": ["Data silos", "360 view", "Personalization"],
     "sources": ["McKinsey", "Indegene", "P360"],
     "evidence_year": 2025
   }'::jsonb, NOW(), NOW())

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  success_metrics = EXCLUDED.success_metrics,
  updated_at = NOW();

-- ================================================================
-- SECTION 2: STRATEGIC PILLARS (33 Pillars)
-- ================================================================

-- Digital Transformation Pillars (5)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-DT-AI', 'AI & Machine Learning Integration',
       'Transform drug discovery, clinical development, and commercial operations through AI with potential $60-110B value generation.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-DT-001'
  AND t.tenant_id = current_setting('app.seed_tenant_id', true)::uuid
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-DT-OM', 'Operating Model Simplification',
       'Rewire biopharma operating models for accelerated decision-making (37 of 50 leaders pursuing simplification).',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-DT-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-DT-CT', 'Digital Clinical Trials',
       'Decentralized, digitally-enabled clinical development with digital biomarkers and RWD integration.',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-DT-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-DT-CH', 'Connected Health & Patient Engagement',
       'Direct-to-patient platforms combining telehealth, online pharmacies, and disease management.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-DT-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-DT-DA', 'Data & Analytics Transformation',
       'Unified, cloud-native data platforms with advanced analytics capabilities.',
       5, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-DT-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Patient Centricity Pillars (4)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-PC-PV', 'Patient Voice Integration',
       'Systematic incorporation of patient perspectives in drug development and commercialization through advisory boards and Voice of Patient reports.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-PC-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-PC-PRO', 'Patient-Reported Outcomes Excellence',
       'Development and validation of fit-for-purpose PRO instruments and endpoints per FDA PFDD guidance.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-PC-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-PC-PE', 'Patient Engagement & Support',
       'Direct-to-patient platforms, support programs, and patient journey optimization.',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-PC-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-PC-OBV', 'Outcome-Based Value Demonstration',
       'Shift from volume metrics to patient outcome metrics in business models and contracting.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-PC-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Scientific Innovation & R&D Pillars (5)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RD-NM', 'Novel Modalities Leadership',
       'Investment in cell therapy, gene therapy, RNA, ADCs, and emerging modalities ($197B pipeline value, 60% of total).',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RD-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RD-AI', 'AI-Powered Drug Discovery',
       'Leverage AI/ML to reduce timelines by up to 50% and costs by 20%.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RD-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RD-PE', 'Strategic Portfolio Excellence',
       'Concentrate R&D resources on core therapeutic strengths (70%+ revenue from top 2 TAs = 65% TSR increase).',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RD-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RD-CD', 'Clinical Development Innovation',
       'Optimize trial design, reduce timelines, improve success rates (address 6.7% Phase 1 success).',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RD-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RD-EI', 'External Innovation & Partnerships',
       'Early-stage acquisitions and partnerships for promising innovation vs. late-stage gap-plugging.',
       5, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RD-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Operational Excellence Pillars (5)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-OE-MX', 'Manufacturing Excellence',
       'Continuous manufacturing, QbD, process intensification, digital twins for quality and efficiency.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-OE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-OE-SC', 'Supply Chain Resilience',
       'Risk-averse optimization, localized sourcing, backward integration to address 277 active drug shortages.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-OE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-OE-DO', 'Digital Operations (OPEX 2.0)',
       'AI-powered optimization, predictive maintenance, real-time monitoring (32% compliance improvement).',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-OE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-OE-CO', 'Cost Optimization',
       'Process automation, energy efficiency, waste reduction to address 30-40% manufacturing cost share.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-OE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-OE-QC', 'Quality & Compliance Excellence',
       'Right-first-time manufacturing, regulatory readiness, zero critical audit findings.',
       5, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-OE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Market Access & Value Pillars (5)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-MA-HEOR', 'HEOR Excellence',
       'Early integration of health economics, cost-effectiveness, and outcomes research in development.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-MA-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-MA-PE', 'Payer Engagement Strategy',
       'Full stakeholder engagement from early development through post-launch.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-MA-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-MA-VBC', 'Value-Based Contracting',
       'Outcomes-based, risk-share, and performance-linked payment models.',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-MA-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-MA-HTA', 'HTA Navigation',
       'Evidence packages and strategies for global HTA submissions including JCA readiness.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-MA-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-MA-LX', 'Launch Excellence',
       'Speed to market with immediate access optimization.',
       5, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-MA-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Regulatory Excellence Pillars (4)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RE-IR', 'Inspection Readiness Excellence',
       'Robust QMS, documentation, training, and self-inspection programs.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RE-DC', 'Digital Compliance & AI',
       'Real-time monitoring, AI-powered compliance tools (45% adoption), and electronic systems.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RE-SE', 'Regulatory Submission Excellence',
       'eCTD preparation, first-cycle approvals, and global submission strategy.',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-RE-CA', 'CAPA Excellence',
       'Risk-informed corrective and preventive actions with effectiveness verification.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-RE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

-- Commercial Excellence Pillars (5)
INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-CE-OC', 'Omnichannel Orchestration',
       'Connected, seamless customer journeys across personal and non-personal channels.',
       1, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-CE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-CE-DI', 'Data Integration & 360 View',
       'Unified HCP profiles breaking down departmental data silos.',
       2, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-CE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-CE-AI', 'AI-Powered Engagement',
       'Personalization, next-best-action, and predictive analytics for HCP engagement.',
       3, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-CE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-CE-FF', 'Field Force Excellence',
       'Evolved rep role as solution consultants with digital enablement.',
       4, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-CE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

INSERT INTO strategic_pillars (id, theme_id, code, name, description, sequence_order, tenant_id, created_at, updated_at)
SELECT gen_random_uuid(), t.id, 'SP-CE-LX', 'Commercial Launch Excellence',
       'Coordinated multi-channel activation for maximum market impact (5-10% revenue uplift).',
       5, current_setting('app.seed_tenant_id', true)::uuid, NOW(), NOW()
FROM strategic_themes t WHERE t.code = 'ST-CE-001'
ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, theme_id = EXCLUDED.theme_id, updated_at = NOW();

COMMIT;

-- ================================================================
-- VERIFICATION REPORT
-- ================================================================

DO $$
DECLARE
  v_themes INTEGER;
  v_pillars INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_themes FROM strategic_themes;
  SELECT COUNT(*) INTO v_pillars FROM strategic_pillars;

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'STRATEGIC ONTOLOGY SEED COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Strategic Themes: % rows', v_themes;
  RAISE NOTICE 'Strategic Pillars: % rows', v_pillars;
  RAISE NOTICE '';
  RAISE NOTICE 'Themes by Code:';
  RAISE NOTICE '  ST-DT-001: Digital Transformation (5 pillars)';
  RAISE NOTICE '  ST-PC-001: Patient Centricity (4 pillars)';
  RAISE NOTICE '  ST-RD-001: Scientific Innovation (5 pillars)';
  RAISE NOTICE '  ST-OE-001: Operational Excellence (5 pillars)';
  RAISE NOTICE '  ST-MA-001: Market Access & Value (5 pillars)';
  RAISE NOTICE '  ST-RE-001: Regulatory Excellence (4 pillars)';
  RAISE NOTICE '  ST-CE-001: Commercial Excellence (5 pillars)';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Total Expected: 7 themes, 33 pillars';
  RAISE NOTICE '================================================================';
END $$;
