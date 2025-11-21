-- ==================================================================================
-- 21_ma_006_budget_impact_part1.sql - UC_MA_006: Budget Impact Model
-- 22_ma_007_comparative_effectiveness_part1.sql - UC_MA_007: Comparative Effectiveness
-- 23_ma_008_value_based_contracting_part1.sql - UC_MA_008: Value-Based Contracting
-- 24_ma_009_hta_submission_part1.sql - UC_MA_009: HTA Submission
-- 25_ma_010_patient_assistance_part1.sql - UC_MA_010: Patient Assistance
-- ==================================================================================
-- NOTE: This is a COMBINED file for efficiency. Split into individual files for production.
-- ==================================================================================

CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT); DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- UC_MA_006: Budget Impact Model
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Budget Impact Modeling Workflow', 'WFL-MA-006-001',
  'Development of budget impact models projecting financial impact from payer perspective', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED', 'deliverables', json_build_array('BIM model', 'PMPM impact', '3-year projection'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_006' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-006-01','TSK-MA-006-01','Define BIM Scope','Define target population, time horizon, perspective for budget impact analysis',1,'{"complexity":"INTERMEDIATE","duration_minutes":30}'::jsonb),
  ('TSK-MA-006-02','TSK-MA-006-02','Estimate Target Population','Calculate eligible population and current treatment patterns',2,'{"complexity":"INTERMEDIATE","duration_minutes":30}'::jsonb),
  ('TSK-MA-006-03','TSK-MA-006-03','Project Market Uptake','Forecast product adoption over 3-5 years',3,'{"complexity":"INTERMEDIATE","duration_minutes":30}'::jsonb),
  ('TSK-MA-006-04','TSK-MA-006-04','Calculate Costs & Offsets','Model costs with/without product including medical cost offsets',4,'{"complexity":"ADVANCED","duration_minutes":40}'::jsonb),
  ('TSK-MA-006-05','TSK-MA-006-05','Calculate PMPM Impact','Compute per-member-per-month budget impact',5,'{"complexity":"INTERMEDIATE","duration_minutes":25}'::jsonb),
  ('TSK-MA-006-06','TSK-MA-006-06','Perform Sensitivity Analysis','Test scenarios for uptake, pricing, and cost offsets',6,'{"complexity":"ADVANCED","duration_minutes":25}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-006-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- UC_MA_007: Comparative Effectiveness
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Comparative Effectiveness Workflow', 'WFL-MA-007-001',
  'Comprehensive comparative effectiveness analysis vs standard of care or competitors', 1,
  jsonb_build_object('duration_minutes', 240, 'complexity', 'EXPERT', 'deliverables', json_build_array('Effectiveness report', 'NMA', 'ITC'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-007-01','TSK-MA-007-01','Define Comparative Strategy','Identify comparators and analysis approach (head-to-head, ITC, NMA)',1,'{"complexity":"EXPERT","duration_minutes":45}'::jsonb),
  ('TSK-MA-007-02','TSK-MA-007-02','Conduct Systematic Literature Review','Systematic search for comparative evidence',2,'{"complexity":"ADVANCED","duration_minutes":60}'::jsonb),
  ('TSK-MA-007-03','TSK-MA-007-03','Perform Comparative Analysis','Execute statistical comparison (direct or indirect)',3,'{"complexity":"EXPERT","duration_minutes":60}'::jsonb),
  ('TSK-MA-007-04','TSK-MA-007-04','Assess Evidence Quality','Grade evidence using GRADE or similar framework',4,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-007-05','TSK-MA-007-05','Develop Evidence Synthesis','Create comprehensive comparative effectiveness report',5,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-007-06','TSK-MA-007-06','Create Visual Presentations','Develop forest plots and evidence tables',6,'{"complexity":"INTERMEDIATE","duration_minutes":15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-007-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- UC_MA_008: Value-Based Contracting
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Value-Based Contracting Workflow', 'WFL-MA-008-001',
  'Design of outcomes-based or value-based contracts with payers', 1,
  jsonb_build_object('duration_minutes', 210, 'complexity', 'EXPERT', 'deliverables', json_build_array('VBC proposal', 'Outcome metrics', 'Payment model'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_008' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-008-01','TSK-MA-008-01','Assess VBC Feasibility','Determine if product and data support outcomes-based contracting',1,'{"complexity":"EXPERT","duration_minutes":30}'::jsonb),
  ('TSK-MA-008-02','TSK-MA-008-02','Define Outcome Metrics','Select measurable outcomes tied to clinical value',2,'{"complexity":"EXPERT","duration_minutes":30}'::jsonb),
  ('TSK-MA-008-03','TSK-MA-008-03','Design Payment Model','Structure payment/rebate mechanism',3,'{"complexity":"EXPERT","duration_minutes":30}'::jsonb),
  ('TSK-MA-008-04','TSK-MA-008-04','Model Financial Scenarios','Project financial outcomes under different performance scenarios',4,'{"complexity":"ADVANCED","duration_minutes":45}'::jsonb),
  ('TSK-MA-008-05','TSK-MA-008-05','Create Monitoring Plan','Design data collection and reporting framework',5,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-008-06','TSK-MA-008-06','Develop Contract Terms','Draft legal and operational contract language',6,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-008-07','TSK-MA-008-07','Prepare Proposal Package','Assemble complete VBC proposal for payer presentation',7,'{"complexity":"INTERMEDIATE","duration_minutes":15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-008-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- UC_MA_009: HTA Submission
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'HTA Submission Workflow', 'WFL-MA-009-001',
  'Preparation for Health Technology Assessment submissions to NICE, CADTH, IQWIG, etc', 1,
  jsonb_build_object('duration_minutes', 360, 'complexity', 'EXPERT', 'deliverables', json_build_array('HTA dossier', 'CEA model', 'Patient input'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_009' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-009-01','TSK-MA-009-01','Select Target HTA Bodies','Prioritize HTA submissions (NICE, CADTH, etc)',1,'{"complexity":"INTERMEDIATE","duration_minutes":30}'::jsonb),
  ('TSK-MA-009-02','TSK-MA-009-02','Review HTA Requirements','Understand specific requirements for each HTA body',2,'{"complexity":"ADVANCED","duration_minutes":45}'::jsonb),
  ('TSK-MA-009-03','TSK-MA-009-03','Prepare Clinical Evidence Package','Compile and synthesize clinical trial data',3,'{"complexity":"ADVANCED","duration_minutes":60}'::jsonb),
  ('TSK-MA-009-04','TSK-MA-009-04','Develop Economic Model','Build HTA-specific economic model (NICE format)',4,'{"complexity":"EXPERT","duration_minutes":90}'::jsonb),
  ('TSK-MA-009-05','TSK-MA-009-05','Gather Patient Input','Collect patient perspectives and experiences',5,'{"complexity":"INTERMEDIATE","duration_minutes":30}'::jsonb),
  ('TSK-MA-009-06','TSK-MA-009-06','Assemble HTA Dossier','Compile complete submission dossier (100-200 pages)',6,'{"complexity":"EXPERT","duration_minutes":60}'::jsonb),
  ('TSK-MA-009-07','TSK-MA-009-07','Conduct Internal Review','Review for completeness and accuracy',7,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-009-08','TSK-MA-009-08','Submit & Track Application','Submit to HTA body and manage review process',8,'{"complexity":"INTERMEDIATE","duration_minutes":15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-009-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- UC_MA_010: Patient Assistance Program
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Patient Assistance Program Workflow', 'WFL-MA-010-001',
  'Design of patient assistance programs or co-pay support to improve access', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'INTERMEDIATE', 'deliverables', json_build_array('PAP design', 'Eligibility criteria', 'Compliance framework'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_010' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-010-01','TSK-MA-010-01','Assess Access Barriers','Identify patient populations facing cost barriers',1,'{"complexity":"INTERMEDIATE","duration_minutes":25}'::jsonb),
  ('TSK-MA-010-02','TSK-MA-010-02','Define Program Structure','Choose PAP type (co-pay, free drug, savings card)',2,'{"complexity":"INTERMEDIATE","duration_minutes":25}'::jsonb),
  ('TSK-MA-010-03','TSK-MA-010-03','Establish Eligibility Criteria','Define income and insurance eligibility rules',3,'{"complexity":"INTERMEDIATE","duration_minutes":25}'::jsonb),
  ('TSK-MA-010-04','TSK-MA-010-04','Develop Compliance Framework','Ensure Anti-Kickback Statute compliance',4,'{"complexity":"ADVANCED","duration_minutes":30}'::jsonb),
  ('TSK-MA-010-05','TSK-MA-010-05','Create Operational Plan','Design application process and program administration',5,'{"complexity":"INTERMEDIATE","duration_minutes":15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-010-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

SELECT 'MA-006 through MA-010 Part 1 Seeded' as status,
  (SELECT COUNT(*) FROM dh_workflow WHERE unique_id LIKE 'WFL-MA-%') as total_workflows,
  (SELECT COUNT(*) FROM dh_task WHERE code LIKE 'TSK-MA-%') as total_tasks;

