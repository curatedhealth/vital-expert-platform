-- Migration: 20251201_031_l6_insights_analytics_workflows.sql
-- Purpose: Seed L6 Workflows for Medical Affairs Insights & Analytics
-- Source: JTBD_INSIGHTS_ANALYTICS_ENRICHED_WORKFLOWS.json
-- Contains: 10 detailed workflows (6 BAU, 4 Project) with Activities, Tasks, Steps
-- Also includes: JTBD seeding, function mappings, role mappings (cross-functional)

-- ============================================================================
-- STEP 1: Insert JTBDs for Insights & Analytics (MUST come first)
-- ============================================================================
-- Valid values:
--   job_type: 'main', 'related', 'consumption_chain'
--   frequency: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
--   recommended_service_layer: 'L1_expert', 'L2_panel', 'L3_workflow', 'L4_solution'
--   functional_area: 'Medical Affairs', 'Commercial', 'Market Access', 'Clinical', 'Regulatory', 'Research & Development', 'Operations', 'IT/Digital'

-- JTBD-MAI-001: KOL Engagement Analysis (BAU)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '11111111-0001-0001-0001-000000000001',
  'JTBD-MAI-001',
  'Analyze KOL Engagement Effectiveness',
  'When evaluating field medical impact, I want to analyze KOL engagement patterns and outcomes so that I can optimize MSL territory strategies and demonstrate value of scientific exchange.',
  'evaluating field medical impact',
  'KOL engagement patterns need analysis',
  'optimize MSL territory strategies and demonstrate value of scientific exchange',
  'main',
  'medium',
  'monthly',
  'L1_expert',
  'Medical Affairs'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-MAI-002: Scientific Literature Monitoring (BAU)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '11111111-0001-0001-0001-000000000002',
  'JTBD-MAI-002',
  'Monitor Scientific Landscape and Literature',
  'When tracking therapeutic area developments, I want to systematically monitor and analyze scientific publications and congress data so that I can identify trends, gaps, and opportunities for medical strategy.',
  'tracking therapeutic area developments',
  'scientific publications and congress data need systematic analysis',
  'identify trends, gaps, and opportunities for medical strategy',
  'main',
  'medium',
  'weekly',
  'L3_workflow',
  'Medical Affairs'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-MAI-003: Medical Affairs ROI (BAU)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '11111111-0001-0001-0001-000000000003',
  'JTBD-MAI-003',
  'Measure Medical Affairs ROI and Impact',
  'When demonstrating Medical Affairs value, I want to quantify the impact of medical activities on business outcomes so that I can justify investments and optimize resource allocation.',
  'demonstrating Medical Affairs value',
  'medical activities need impact quantification',
  'justify investments and optimize resource allocation',
  'main',
  'high',
  'quarterly',
  'L3_workflow',
  'Medical Affairs'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-MAI-004: Field Medical Insights (BAU)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '11111111-0001-0001-0001-000000000004',
  'JTBD-MAI-004',
  'Generate Field Medical Insights from Interactions',
  'When MSLs engage with HCPs, I want to capture and synthesize insights from field interactions so that I can inform medical strategy and identify unmet needs.',
  'MSLs engage with HCPs',
  'insights from field interactions need capture and synthesis',
  'inform medical strategy and identify unmet needs',
  'main',
  'medium',
  'weekly',
  'L3_workflow',
  'Medical Affairs'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-MAI-005: KOL Profiling and Mapping (Project)
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '11111111-0001-0001-0001-000000000005',
  'JTBD-MAI-005',
  'Build KOL Profiling and Mapping Intelligence',
  'When planning scientific engagement, I want to comprehensively profile and map KOLs so that I can identify the right experts and optimize engagement strategies.',
  'planning scientific engagement',
  'comprehensive KOL profiling and mapping needed',
  'identify the right experts and optimize engagement strategies',
  'main',
  'high',
  'yearly',
  'L3_workflow',
  'Medical Affairs'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-XFI-001: Customer 360 (Project) - Cross-functional primary = Commercial
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0001-0001-0001-000000000001',
  'JTBD-XFI-001',
  'Create Integrated Customer 360 View',
  'When engaging HCPs across functions, I want to integrate medical, commercial, and access interactions into a unified customer view so that I can optimize omnichannel engagement and personalization.',
  'engaging HCPs across functions',
  'medical, commercial, and access interactions need integration',
  'optimize omnichannel engagement and personalization',
  'main',
  'high',
  'yearly',
  'L4_solution',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-XFI-002: Evidence-Payer Alignment (Project) - Cross-functional primary = Market Access
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0001-0001-0001-000000000002',
  'JTBD-XFI-002',
  'Align Evidence Generation with Payer Needs',
  'When planning evidence studies, I want to align medical evidence generation with payer evidence requirements so that I can maximize impact on market access decisions.',
  'planning evidence studies',
  'evidence generation needs payer alignment',
  'maximize impact on market access decisions',
  'main',
  'high',
  'yearly',
  'L3_workflow',
  'Market Access'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-XFI-003: Launch Performance (BAU) - Cross-functional primary = Commercial
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0001-0001-0001-000000000003',
  'JTBD-XFI-003',
  'Measure Integrated Launch Performance',
  'When launching products, I want to track integrated performance across medical, commercial, and access metrics so that I can optimize launch tactics and identify gaps.',
  'launching products',
  'integrated performance needs tracking',
  'optimize launch tactics and identify gaps',
  'main',
  'high',
  'weekly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-XFI-004: Competitive Intelligence (BAU) - Cross-functional primary = Commercial
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0001-0001-0001-000000000004',
  'JTBD-XFI-004',
  'Generate Integrated Competitive Intelligence',
  'When monitoring competition, I want to synthesize competitive insights across medical, commercial, and access dimensions so that I can inform integrated competitive strategy.',
  'monitoring competition',
  'competitive insights need cross-functional synthesis',
  'inform integrated competitive strategy',
  'main',
  'high',
  'monthly',
  'L3_workflow',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- JTBD-XFI-005: Integrated Forecasting (Project) - Cross-functional primary = Commercial
INSERT INTO jtbd (id, code, name, job_statement, when_situation, circumstance, desired_outcome, job_type, complexity, frequency, recommended_service_layer, functional_area)
VALUES (
  '22222222-0001-0001-0001-000000000005',
  'JTBD-XFI-005',
  'Build Integrated Forecasting Models',
  'When forecasting performance, I want to incorporate medical, access, and commercial factors into integrated forecasting models so that I can improve forecast accuracy and scenario planning.',
  'forecasting performance',
  'integrated factors need incorporation into models',
  'improve forecast accuracy and scenario planning',
  'main',
  'high',
  'yearly',
  'L4_solution',
  'Commercial'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, job_statement = EXCLUDED.job_statement;

-- ============================================================================
-- STEP 2: Update ODI scores for new JTBDs
-- ============================================================================

UPDATE jtbd SET importance_score = 8.5, satisfaction_score = 4.2 WHERE code = 'JTBD-MAI-001';
UPDATE jtbd SET importance_score = 8.8, satisfaction_score = 3.8 WHERE code = 'JTBD-MAI-002';
UPDATE jtbd SET importance_score = 9.2, satisfaction_score = 4.0 WHERE code = 'JTBD-MAI-003';
UPDATE jtbd SET importance_score = 8.2, satisfaction_score = 4.5 WHERE code = 'JTBD-MAI-004';
UPDATE jtbd SET importance_score = 9.0, satisfaction_score = 3.5 WHERE code = 'JTBD-MAI-005';
UPDATE jtbd SET importance_score = 9.5, satisfaction_score = 3.0 WHERE code = 'JTBD-XFI-001';
UPDATE jtbd SET importance_score = 9.3, satisfaction_score = 3.8 WHERE code = 'JTBD-XFI-002';
UPDATE jtbd SET importance_score = 9.0, satisfaction_score = 4.2 WHERE code = 'JTBD-XFI-003';
UPDATE jtbd SET importance_score = 8.7, satisfaction_score = 4.0 WHERE code = 'JTBD-XFI-004';
UPDATE jtbd SET importance_score = 9.2, satisfaction_score = 3.5 WHERE code = 'JTBD-XFI-005';

-- ============================================================================
-- STEP 3: Map JTBDs to Functions
-- ============================================================================

-- Medical Affairs JTBDs (MAI series)
INSERT INTO jtbd_functions (jtbd_id, function_id, function_name, relevance_score)
SELECT j.id, f.id, f.name, 1.0
FROM jtbd j, org_functions f
WHERE j.code IN ('JTBD-MAI-001', 'JTBD-MAI-002', 'JTBD-MAI-003', 'JTBD-MAI-004', 'JTBD-MAI-005')
  AND f.name = 'Medical Affairs'
ON CONFLICT DO NOTHING;

-- Cross-Functional JTBDs - Map to MULTIPLE functions
INSERT INTO jtbd_functions (jtbd_id, function_id, function_name, relevance_score)
SELECT j.id, f.id, f.name, 0.9
FROM jtbd j, org_functions f
WHERE j.code IN ('JTBD-XFI-001', 'JTBD-XFI-003', 'JTBD-XFI-004')
  AND f.name IN ('Medical Affairs', 'Commercial', 'Market Access')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_functions (jtbd_id, function_id, function_name, relevance_score)
SELECT j.id, f.id, f.name, 0.95
FROM jtbd j, org_functions f
WHERE j.code = 'JTBD-XFI-002'
  AND f.name IN ('Medical Affairs', 'Market Access')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_functions (jtbd_id, function_id, function_name, relevance_score)
SELECT j.id, f.id, f.name, 0.9
FROM jtbd j, org_functions f
WHERE j.code = 'JTBD-XFI-005'
  AND f.name IN ('Commercial', 'Medical Affairs', 'Market Access')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Map JTBDs to Roles (Primary, Secondary, Cross-Functional)
-- ============================================================================

-- JTBD-MAI-001: KOL Engagement Analysis
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-001'
  AND r.name IN ('Field Medical Director', 'MSL Manager', 'Medical Affairs Analytics Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.7, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-001'
  AND r.name IN ('Medical Science Liaison', 'Medical Affairs Director', 'Commercial Analytics Manager')
ON CONFLICT DO NOTHING;

-- JTBD-MAI-002: Literature Monitoring
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-002'
  AND r.name IN ('Medical Information Manager', 'Scientific Communications Lead', 'Medical Affairs Analytics Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.7, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-002'
  AND r.name IN ('Medical Science Liaison', 'Publications Manager', 'Competitive Intelligence Analyst')
ON CONFLICT DO NOTHING;

-- JTBD-MAI-003: ROI Measurement
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-003'
  AND r.name IN ('VP Medical Affairs', 'Medical Affairs Director', 'Medical Affairs Analytics Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.7, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-003'
  AND r.name IN ('HEOR Director', 'Field Medical Director', 'Finance Business Partner', 'Commercial Analytics Manager')
ON CONFLICT DO NOTHING;

-- JTBD-MAI-004: Field Insights
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-004'
  AND r.name IN ('MSL Manager', 'Medical Affairs Analytics Lead', 'Medical Insights Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.7, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-004'
  AND r.name IN ('Medical Science Liaison', 'Medical Affairs Director', 'Commercial Insights Manager')
ON CONFLICT DO NOTHING;

-- JTBD-MAI-005: KOL Profiling (Project)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-005'
  AND r.name IN ('Field Medical Director', 'MSL Manager', 'Medical Affairs Analytics Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.7, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-MAI-005'
  AND r.name IN ('Medical Science Liaison', 'Medical Affairs Director', 'Commercial Analytics Manager')
ON CONFLICT DO NOTHING;

-- JTBD-XFI-001: Customer 360 (Cross-Functional Project)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-001'
  AND r.name IN ('Medical Affairs Analytics Lead', 'Commercial Data Scientist', 'CRM Manager')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.8, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-001'
  AND r.name IN ('MSL Manager', 'Sales Analytics Manager', 'Digital Engagement Director')
ON CONFLICT DO NOTHING;

-- JTBD-XFI-002: Evidence-Payer Alignment (Cross-Functional Project)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-002'
  AND r.name IN ('HEOR Director', 'Value Evidence Lead', 'Medical Affairs Director')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.8, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-002'
  AND r.name IN ('Real-World Evidence Lead', 'Market Access Director', 'Payer Strategy Lead')
ON CONFLICT DO NOTHING;

-- JTBD-XFI-003: Launch Performance (Cross-Functional BAU)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-003'
  AND r.name IN ('Brand Lead', 'Medical Affairs Director', 'Market Access Director')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.8, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-003'
  AND r.name IN ('Commercial Analytics Manager', 'Field Medical Director', 'Finance Business Partner')
ON CONFLICT DO NOTHING;

-- JTBD-XFI-004: Competitive Intelligence (Cross-Functional BAU)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-004'
  AND r.name IN ('Competitive Intelligence Lead', 'Strategy Analyst', 'Medical Affairs Analytics Lead')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.8, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-004'
  AND r.name IN ('Commercial Analytics Manager', 'Market Access Analyst', 'Brand Lead')
ON CONFLICT DO NOTHING;

-- JTBD-XFI-005: Integrated Forecasting (Cross-Functional Project)
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 1.0, true
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-005'
  AND r.name IN ('Commercial Data Scientist', 'Finance Business Partner', 'Forecasting Analyst')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, is_primary)
SELECT j.id, r.id, r.name, 0.8, false
FROM jtbd j, org_roles r
WHERE j.code = 'JTBD-XFI-005'
  AND r.name IN ('Brand Lead', 'Market Access Director', 'Medical Affairs Director')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Insert BAU Workflow Templates (linked to JTBDs)
-- ============================================================================

-- BAU-001: KOL Engagement Analysis (Monthly, 20 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-MAI-001',
  'KOL Engagement Analysis Workflow',
  'When evaluating field medical impact, analyze KOL engagement patterns and outcomes to optimize MSL territory strategies and demonstrate value of scientific exchange.',
  'sequential',
  'routine',
  20,
  'medium',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-MAI-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- BAU-002: Scientific Literature Monitoring (Weekly/Monthly, 24 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-MAI-002',
  'Scientific Literature Monitoring Workflow',
  'When tracking therapeutic area developments, systematically monitor and analyze scientific publications and congress data to identify trends, gaps, and opportunities for medical strategy.',
  'sequential',
  'routine',
  24,
  'medium',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-MAI-002'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- BAU-003: Medical Affairs ROI Measurement (Quarterly/Annual, 38 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-MAI-003',
  'Medical Affairs ROI Measurement Workflow',
  'When demonstrating Medical Affairs value, quantify the impact of medical activities on business outcomes to justify investments and optimize resource allocation.',
  'sequential',
  'routine',
  38,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-MAI-003'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- BAU-004: Field Medical Insights (Weekly/Monthly, 14 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-MAI-004',
  'Field Medical Insights Workflow',
  'When MSLs engage with HCPs, capture and synthesize insights from field interactions to inform medical strategy and identify unmet needs.',
  'sequential',
  'routine',
  14,
  'medium',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-MAI-004'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- BAU-005: Launch Performance Tracking (Weekly during launch, 22 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-XFI-003',
  'Integrated Launch Performance Tracking Workflow',
  'When launching products, track integrated performance across medical, commercial, and access metrics to optimize launch tactics and identify gaps.',
  'sequential',
  'routine',
  22,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-XFI-003'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- BAU-006: Competitive Intelligence (Monthly, 42 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-XFI-004',
  'Integrated Competitive Intelligence Workflow',
  'When monitoring competition, synthesize competitive insights across medical, commercial, and access dimensions to inform integrated competitive strategy.',
  'parallel',
  'routine',
  42,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-XFI-004'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- ============================================================================
-- STEP 6: Insert Project Workflow Templates (linked to JTBDs)
-- ============================================================================

-- PROJECT-001: KOL Profiling and Mapping (Annual/Launch, 80 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-MAI-005',
  'KOL Profiling and Mapping Project',
  'When planning scientific engagement, comprehensively profile and map KOLs to identify the right experts and optimize engagement strategies.',
  'sequential',
  'project',
  80,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-MAI-005'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- PROJECT-002: Customer 360 Platform Build (One-time, 240 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-XFI-001',
  'Customer 360 Platform Build Project',
  'When engaging HCPs across functions, integrate medical, commercial, and access interactions into a unified customer view to optimize omnichannel engagement and personalization.',
  'conditional',
  'project',
  240,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-XFI-001'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- PROJECT-003: Evidence-Payer Alignment (Per product/launch, 108 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-XFI-002',
  'Integrated Evidence Planning Project',
  'When planning evidence studies, align medical evidence generation with payer evidence requirements to maximize impact on market access decisions.',
  'conditional',
  'project',
  108,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-XFI-002'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- PROJECT-004: Integrated Forecasting Model (Annual, 117 hours)
INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version, jtbd_id)
SELECT
  'WF-XFI-005',
  'Integrated Forecasting Model Build Project',
  'When forecasting performance, incorporate medical, access, and commercial factors into integrated forecasting models to improve forecast accuracy and scenario planning.',
  'conditional',
  'project',
  117,
  'high',
  'active',
  '1.0',
  j.id
FROM jtbd j WHERE j.code = 'JTBD-XFI-005'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, jtbd_id = EXCLUDED.jtbd_id;

-- ============================================================================
-- STEP 7: Insert Workflow Stages for KOL Engagement Analysis (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Data Collection & Preparation', 'Extract CRM interaction data, validate data quality, and enrich with external data sources', true, 5
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Analysis & Modeling', 'Calculate engagement metrics, segment KOL engagement patterns, and perform trend analysis', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Insight Generation & Reporting', 'Generate insights summary, build dashboard/report, and review with stakeholders', true, 6
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Action Planning & Follow-up', 'Define action items and communicate to MSL team', true, 2
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-001'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: Insert Workflow Stages for Literature Monitoring (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Literature Search & Collection', 'Execute saved searches across PubMed, Embase, preprint servers; collect congress abstracts; deduplicate and organize', true, 4
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Screening & Prioritization', 'Screen abstracts for relevance, full-text review of key papers, competitive publication tracking', true, 9
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Trend Analysis & Synthesis', 'Quantify publication trends, identify emerging themes via NLP, synthesize strategic implications', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Dissemination & Action', 'Create literature digest, distribute to stakeholders, update evidence library', true, 4
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-002'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 9: Insert Workflow Stages for ROI Measurement (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Define Measurement Framework', 'Align on ROI metrics with Finance, map activities to outcomes, document logic model', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Data Collection & Integration', 'Gather activity data from CRM, obtain outcome data from Commercial, integrate and validate', true, 10
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Analysis & Valuation', 'Calculate activity metrics, model ROI and attribution, benchmark performance', true, 13
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Reporting & Communication', 'Create ROI report, present to leadership, inform budget planning', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-003'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 10: Insert Workflow Stages for Field Insights (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Insight Capture', 'MSLs document interaction insights in CRM, tag by topic/product, submit weekly summaries', true, 2
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Insight Aggregation & Quality Review', 'Aggregate regional insights, remove duplicates, quality check and enrich', true, 3
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Analysis & Theme Identification', 'Quantify insight themes, sentiment and urgency analysis, cross-reference with other sources', true, 5
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Synthesis & Dissemination', 'Create insights report, present to MA leadership, share cross-functionally', true, 4
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-004'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 11: Insert Workflow Stages for KOL Profiling Project
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Project Scoping & Planning', 'Define KOL criteria and tiers, identify data sources, create project plan', true, 9
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Data Collection', 'Extract publication data, collect clinical trial data, gather congress data, analyze digital presence, integrate CRM data', true, 25
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Profiling & Scoring', 'Build comprehensive profiles, develop influence scoring model, segment and tier KOLs', true, 18
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Mapping & Visualization', 'Create network maps, geographic mapping, build KOL dashboard', true, 18
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Validation & Rollout', 'Validate with MSL team, train users, launch and communicate', true, 10
FROM workflow_templates wt WHERE wt.code = 'WF-MAI-005'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 12: Insert Workflow Stages for Customer 360 Project
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Requirements & Design', 'Gather business requirements from Medical/Commercial/Access, inventory data sources, design data model', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Data Integration & ETL', 'Build data pipelines, implement ID matching, validate data quality', true, 80
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Analytics & Scoring', 'Build engagement scoring model, create customer segments, build predictive models', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Visualization & Access', 'Build Customer 360 dashboard, integrate with CRM, set up self-service access', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Governance & Maintenance', 'Establish data governance, train users, plan ongoing maintenance', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-001'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 13: Insert Workflow Stages for Evidence-Payer Project
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Payer Evidence Needs Assessment', 'Conduct payer research, document evidence requirements, prioritize by market', true, 34
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Evidence Gap Analysis', 'Inventory existing evidence, map to requirements, prioritize gaps', true, 18
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Evidence Generation Planning', 'Design studies to fill gaps, develop resource plan, create evidence roadmap', true, 30
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Cross-Functional Alignment', 'Review with Medical Affairs, Commercial, finalize integrated plan', true, 12
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Execution & Tracking', 'Initiate studies, track progress, communicate evidence readiness', true, 14
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-002'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 14: Insert Workflow Stages for Launch Performance (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Data Collection', 'Gather commercial metrics, access metrics, and medical metrics', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Integration & Analysis', 'Integrate data sources, compare to launch plan, diagnose performance drivers', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Reporting & Communication', 'Update launch dashboard, prepare launch report, conduct review meeting', true, 5
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Action & Optimization', 'Define corrective actions, communicate to field teams, escalate critical issues', true, 3
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-003'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 15: Insert Workflow Stages for Competitive Intelligence (BAU)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Intelligence Gathering', 'Monitor news/announcements, track clinical trials, gather market data, monitor scientific activity', true, 13
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Analysis & Synthesis', 'Analyze commercial, medical/scientific, and access positions; synthesize integrated view', true, 14
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Reporting & Dissemination', 'Create CI report, update dashboard, distribute to stakeholders', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Strategic Response Planning', 'Assess response options, coordinate cross-functional response, implement response', true, 7
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-004'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 16: Insert Workflow Stages for Forecasting Project
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Model Design & Planning', 'Define forecasting approach, identify input variables, design model architecture', true, 22
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Data Collection & Preparation', 'Gather historical data, collect assumption inputs, prepare data for modeling', true, 22
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Model Building & Validation', 'Build base forecast model, incorporate cross-functional factors, validate accuracy, build scenario capabilities', true, 44
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Review & Alignment', 'Review with Commercial, Access, Medical, finalize with Finance', true, 15
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Operationalization', 'Document model, set up update process, train stakeholders', true, 14
FROM workflow_templates wt WHERE wt.code = 'WF-XFI-005'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 17: Create summary view for L6 workflow analysis
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_summary AS
SELECT
  wt.id as template_id,
  wt.code,
  wt.name as workflow_name,
  wt.work_mode,
  wt.workflow_type,
  wt.complexity_level,
  wt.estimated_duration_hours,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_tasks wtask ON wtask.stage_id = ws.id
WHERE wt.status = 'active'
GROUP BY wt.id, wt.code, wt.name, wt.work_mode, wt.workflow_type, wt.complexity_level, wt.estimated_duration_hours
ORDER BY wt.work_mode, wt.code;

-- ============================================================================
-- STEP 18: Create enhanced workflow view with JTBD linkage
-- ============================================================================

CREATE OR REPLACE VIEW v_workflow_with_jtbd AS
SELECT
  wt.id as template_id,
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  wt.workflow_type,
  wt.estimated_duration_hours,
  wt.complexity_level,
  j.id as jtbd_id,
  j.code as jtbd_code,
  j.name as jtbd_name,
  j.opportunity_score,
  j.odi_tier,
  j.importance_score,
  j.satisfaction_score,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count
FROM workflow_templates wt
LEFT JOIN jtbd j ON wt.jtbd_id = j.id
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_tasks wtask ON wtask.stage_id = ws.id
WHERE wt.status = 'active'
GROUP BY wt.id, wt.code, wt.name, wt.work_mode, wt.workflow_type, wt.estimated_duration_hours, wt.complexity_level,
         j.id, j.code, j.name, j.opportunity_score, j.odi_tier, j.importance_score, j.satisfaction_score
ORDER BY j.opportunity_score DESC NULLS LAST;

-- ============================================================================
-- STEP 19: Create cross-functional JTBD summary view
-- ============================================================================

CREATE OR REPLACE VIEW v_jtbd_cross_functional_summary AS
SELECT
  j.code,
  j.name,
  j.job_type,
  j.complexity,
  j.frequency,
  j.opportunity_score,
  j.odi_tier,
  COUNT(DISTINCT jf.function_id) as function_count,
  STRING_AGG(DISTINCT jf.function_name, ', ' ORDER BY jf.function_name) as functions,
  COUNT(DISTINCT jr.role_id) as role_count,
  SUM(CASE WHEN jr.is_primary THEN 1 ELSE 0 END) as primary_role_count,
  SUM(CASE WHEN NOT jr.is_primary THEN 1 ELSE 0 END) as supporting_role_count
FROM jtbd j
LEFT JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.code LIKE 'JTBD-MAI-%' OR j.code LIKE 'JTBD-XFI-%'
GROUP BY j.id, j.code, j.name, j.job_type, j.complexity, j.frequency, j.opportunity_score, j.odi_tier
ORDER BY j.opportunity_score DESC NULLS LAST;

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================
-- SELECT * FROM v_workflow_summary;
-- SELECT * FROM v_workflow_with_jtbd;
-- SELECT * FROM v_jtbd_cross_functional_summary;
-- SELECT COUNT(*) as template_count, work_mode FROM workflow_templates GROUP BY work_mode;
-- SELECT COUNT(*) as stage_count FROM workflow_stages;
-- SELECT COUNT(*) as jtbd_count FROM jtbd WHERE code LIKE 'JTBD-MAI-%' OR code LIKE 'JTBD-XFI-%';
