-- Migration: 20251201_044_digital_health_workflows.sql
-- Purpose: Create workflows for Digital Health JTBDs with full 5-level WBS
--
-- HIERARCHY:
--   L1: workflow_templates  (Workflow - top container)
--   L2: workflow_stages     (Phase - major deliverable grouping)
--   L3: workflow_activities (Activity - group of related tasks)
--   L4: workflow_tasks      (Task - discrete unit of work)
--   L5: workflow_steps      (Step - atomic action)
--
-- WORKFLOWS CREATED:
--   WF-DH-001: Digital Therapeutics Clinical Validation (JTBD-DPS-001)
--   WF-DH-002: DTx Payer Coverage Strategy (JTBD-CMA-001)
--   WF-DH-003: Decentralized Clinical Trial Setup (JTBD-DCD-001)
--   WF-DH-004: SaMD Regulatory Submission (JTBD-RQC-001)

-- ============================================================================
-- STEP 1: Create L1 - Workflow Templates
-- ============================================================================

INSERT INTO workflow_templates (
  id, code, name, description, workflow_type, work_mode, estimated_duration_hours,
  complexity_level, status, version
) VALUES
-- WF-DH-001: Digital Therapeutics Clinical Validation
(
  'd0010000-0000-4000-a000-000000000001',
  'WF-DH-001',
  'Digital Therapeutics Clinical Validation Workflow',
  'End-to-end workflow for validating pharmaceutical-grade digital therapeutics including clinical evidence generation, regulatory framework alignment, and market preparation',
  'sequential',
  'project',
  160,
  'high',
  'active',
  '1.0'
),
-- WF-DH-002: DTx Payer Coverage Strategy
(
  'd0020000-0000-4000-a000-000000000001',
  'WF-DH-002',
  'DTx Payer Coverage Strategy Workflow',
  'Comprehensive workflow for securing payer coverage for digital therapeutics including value demonstration, HEOR evidence, and payer engagement',
  'sequential',
  'project',
  120,
  'high',
  'active',
  '1.0'
),
-- WF-DH-003: Decentralized Clinical Trial Setup
(
  'd0030000-0000-4000-a000-000000000001',
  'WF-DH-003',
  'Decentralized Clinical Trial Setup Workflow',
  'Workflow for implementing decentralized/hybrid clinical trials with digital endpoints, remote monitoring, and ePRO systems',
  'conditional',
  'project',
  200,
  'high',
  'active',
  '1.0'
),
-- WF-DH-004: SaMD Regulatory Submission
(
  'd0040000-0000-4000-a000-000000000001',
  'WF-DH-004',
  'SaMD Regulatory Submission Workflow',
  'Regulatory submission workflow for Software as Medical Device including 510(k), De Novo, or PMA pathway preparation',
  'sequential',
  'project',
  240,
  'high',
  'active',
  '1.0'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================================
-- STEP 2: Create L2 - Workflow Stages for WF-DH-001 (DTx Clinical Validation)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Clinical Evidence Planning', 'Define clinical validation strategy, endpoints, and study design', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Study Protocol Development', 'Develop and finalize clinical study protocol with IRB submission', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Clinical Data Collection', 'Execute clinical study and collect validation data', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-DH-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Analysis & Reporting', 'Analyze clinical data and generate validation report', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-001'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Regulatory Alignment', 'Prepare regulatory submission package and pre-submission meetings', true, 16
FROM workflow_templates wt WHERE wt.code = 'WF-DH-001'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Create L2 - Workflow Stages for WF-DH-002 (DTx Payer Coverage)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Value Proposition Development', 'Develop clinical and economic value proposition for DTx', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'HEOR Evidence Generation', 'Generate health economics and outcomes research evidence', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Payer Dossier Creation', 'Compile comprehensive payer value dossier', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Payer Engagement', 'Execute payer engagement strategy and negotiations', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-002'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Coverage Implementation', 'Implement coverage agreements and track access metrics', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-DH-002'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Create L2 - Workflow Stages for WF-DH-003 (DCT Setup)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'DCT Strategy & Design', 'Define decentralized trial strategy and hybrid model design', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Technology Platform Selection', 'Evaluate and select DCT technology platforms and vendors', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Digital Endpoint Validation', 'Validate digital biomarkers and ePRO instruments', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-DH-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Site & Patient Enablement', 'Train sites and enable patient remote participation', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-003'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Go-Live & Monitoring', 'Launch DCT operations with real-time monitoring', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-003'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create L2 - Workflow Stages for WF-DH-004 (SaMD Regulatory)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Regulatory Strategy', 'Define regulatory pathway and classification strategy', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Technical Documentation', 'Prepare software documentation and design history file', true, 64
FROM workflow_templates wt WHERE wt.code = 'WF-DH-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Clinical Evidence Compilation', 'Compile clinical evidence and performance data', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-DH-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Submission Preparation', 'Prepare and compile regulatory submission package', true, 56
FROM workflow_templates wt WHERE wt.code = 'WF-DH-004'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Agency Interaction', 'Manage pre-submission meetings and agency communications', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-004'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Create L3 - Activities for WF-DH-001 Stage 1 (Clinical Evidence Planning)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH001-S1-A1', 'Clinical Landscape Analysis', 'Analyze competitive clinical evidence and regulatory precedents', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH001-S1-A2', 'Endpoint Strategy Definition', 'Define primary and secondary clinical endpoints', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH001-S1-A3', 'Study Design Selection', 'Select optimal study design (RCT, single-arm, real-world)', 420
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH001-S1-A4', 'Resource & Timeline Planning', 'Plan study resources, budget, and timeline', 300
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 7: Create L4 - Tasks for DH001-S1-A1 (Clinical Landscape Analysis)
-- ============================================================================

INSERT INTO workflow_tasks (
  activity_id, stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type,
  t.duration, t.service_layer, t.ai_score, t.is_hitl, t.hitl_reason,
  t.inputs, t.outputs, t.role, t.tool, t.instructions, t.criteria
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'DH001-S1-A1-T1', 'Search Clinical Evidence Databases', 'Query PubMed, ClinicalTrials.gov for DTx evidence', 'automated', 60, 'L3_workflow', 90, FALSE, NULL, ARRAY['Search terms', 'Therapeutic area'], ARRAY['literature_results.json'], 'Clinical Research Associate', 'Literature Search', 'Execute systematic literature search using predefined terms', 'Complete search with >100 relevant results'),
  (2, 'DH001-S1-A1-T2', 'Analyze Competitor Clinical Programs', 'Review competitor DTx clinical validation approaches', 'manual', 120, 'L1_expert', 70, FALSE, NULL, ARRAY['Competitor list', 'ClinicalTrials.gov data'], ARRAY['competitor_analysis.xlsx'], 'Clinical Strategy Lead', 'Competitive Intelligence', 'Use Ask Expert to analyze competitor trial designs and endpoints', 'Competitive landscape documented with key insights'),
  (3, 'DH001-S1-A1-T3', 'Review Regulatory Precedents', 'Analyze FDA/EMA guidance and approved DTx submissions', 'manual', 90, 'L1_expert', 65, FALSE, NULL, ARRAY['FDA guidance docs', 'Approved DTx list'], ARRAY['regulatory_precedents.pdf'], 'Regulatory Affairs Specialist', 'Regulatory Research', 'Review De Novo, 510(k), and breakthrough device precedents', 'Regulatory pathway options documented'),
  (4, 'DH001-S1-A1-T4', 'Synthesize Landscape Findings', 'Compile comprehensive clinical landscape report', 'manual', 90, 'L1_expert', 75, TRUE, 'Clinical strategy requires expert synthesis', ARRAY['literature_results.json', 'competitor_analysis.xlsx', 'regulatory_precedents.pdf'], ARRAY['clinical_landscape_report.pdf'], 'Clinical Validation Director', 'Documentation', 'Use Ask Expert to synthesize findings into strategic recommendations', 'Report approved by clinical leadership')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH001-S1-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 8: Create L3 - Activities for WF-DH-002 Stage 1 (Value Proposition Development)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH002-S1-A1', 'Clinical Value Assessment', 'Quantify clinical outcomes and patient benefits', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-002' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH002-S1-A2', 'Economic Value Modeling', 'Develop cost-effectiveness and budget impact models', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-002' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH002-S1-A3', 'Payer Landscape Analysis', 'Map payer coverage policies and decision criteria', 300
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-002' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH002-S1-A4', 'Value Story Development', 'Create compelling value narrative for payers', 240
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-002' AND ws.stage_number = 1
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 10: Create L4 - Tasks for DH002-S1-A2 (Economic Value Modeling)
-- ============================================================================

INSERT INTO workflow_tasks (
  activity_id, stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type,
  t.duration, t.service_layer, t.ai_score, t.is_hitl, t.hitl_reason,
  t.inputs, t.outputs, t.role, t.tool, t.instructions, t.criteria
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'DH002-S1-A2-T1', 'Gather Cost Inputs', 'Collect healthcare utilization and cost data', 'automated', 90, 'L3_workflow', 85, FALSE, NULL, ARRAY['Claims data access', 'Literature sources'], ARRAY['cost_inputs.xlsx'], 'HEOR Analyst', 'Data Collection', 'Extract cost data from claims databases and published sources', 'All cost categories populated with sources'),
  (2, 'DH002-S1-A2-T2', 'Build Cost-Effectiveness Model', 'Develop Markov or decision tree model', 'manual', 180, 'L1_expert', 55, FALSE, NULL, ARRAY['cost_inputs.xlsx', 'Clinical efficacy data'], ARRAY['ce_model.xlsx'], 'Health Economist', 'Economic Modeling', 'Build model using standard HEOR methodology', 'Model validated with sensitivity analysis'),
  (3, 'DH002-S1-A2-T3', 'Calculate ICER and NNT', 'Compute incremental cost-effectiveness ratio', 'automated', 60, 'L3_workflow', 90, FALSE, NULL, ARRAY['ce_model.xlsx'], ARRAY['icer_results.json'], 'HEOR Analyst', 'Analytics', 'Run model scenarios and calculate key metrics', 'ICER below willingness-to-pay threshold'),
  (4, 'DH002-S1-A2-T4', 'Develop Budget Impact Model', 'Create 3-5 year budget impact projection', 'manual', 120, 'L1_expert', 60, FALSE, NULL, ARRAY['cost_inputs.xlsx', 'Market size data'], ARRAY['budget_impact_model.xlsx'], 'Health Economist', 'Economic Modeling', 'Model budget impact for typical health plan', 'Budget impact acceptable to target payers'),
  (5, 'DH002-S1-A2-T5', 'Validate Models with Experts', 'Review models with HEOR advisory board', 'review', 60, 'L2_panel', 40, TRUE, 'Economic models require external validation', ARRAY['ce_model.xlsx', 'budget_impact_model.xlsx'], ARRAY['model_validation_report.pdf'], 'HEOR Director', 'Expert Review', 'Use Ask Panel to gather expert feedback on model assumptions', 'Models approved by advisory board')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH002-S1-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 11: Create L3 - Activities for WF-DH-003 Stage 3 (Digital Endpoint Validation)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH003-S3-A1', 'Digital Biomarker Selection', 'Select and prioritize digital biomarkers for validation', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-003' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH003-S3-A2', 'Analytical Validation', 'Validate sensor accuracy and data quality', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-003' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH003-S3-A3', 'Clinical Correlation Study', 'Correlate digital measures with clinical outcomes', 720
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-003' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH003-S3-A4', 'Regulatory Qualification', 'Prepare biomarker qualification package for FDA', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-003' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 12: Create L4 - Tasks for DH003-S3-A3 (Clinical Correlation Study)
-- ============================================================================

INSERT INTO workflow_tasks (
  activity_id, stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type,
  t.duration, t.service_layer, t.ai_score, t.is_hitl, t.hitl_reason,
  t.inputs, t.outputs, t.role, t.tool, t.instructions, t.criteria
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'DH003-S3-A3-T1', 'Design Correlation Protocol', 'Design study protocol for biomarker-outcome correlation', 'manual', 180, 'L1_expert', 55, TRUE, 'Protocol design requires clinical expertise', ARRAY['Biomarker specs', 'Clinical endpoint definitions'], ARRAY['correlation_protocol.pdf'], 'Clinical Scientist', 'Protocol Development', 'Design prospective correlation study with appropriate endpoints', 'Protocol approved by IRB'),
  (2, 'DH003-S3-A3-T2', 'Collect Paired Data', 'Collect digital and clinical outcome data in parallel', 'automated', 240, 'L3_workflow', 80, FALSE, NULL, ARRAY['correlation_protocol.pdf', 'EDC system access'], ARRAY['paired_data.parquet'], 'Clinical Data Manager', 'Data Collection', 'Ensure synchronized collection of digital and clinical data', 'Complete paired datasets for all subjects'),
  (3, 'DH003-S3-A3-T3', 'Perform Statistical Correlation', 'Calculate correlation coefficients and agreement metrics', 'automated', 120, 'L3_workflow', 85, FALSE, NULL, ARRAY['paired_data.parquet'], ARRAY['correlation_results.json'], 'Biostatistician', 'Statistical Analysis', 'Calculate Pearson/Spearman correlations, Bland-Altman analysis', 'Correlation >0.7 for primary biomarker'),
  (4, 'DH003-S3-A3-T4', 'Validate Clinical Meaningfulness', 'Assess clinical relevance of digital measures', 'review', 90, 'L2_panel', 45, TRUE, 'Clinical meaningfulness requires expert consensus', ARRAY['correlation_results.json', 'Clinical context'], ARRAY['clinical_validation_report.pdf'], 'Medical Director', 'Clinical Review', 'Use Ask Panel to assess clinical utility of correlations', 'Clinical meaningfulness confirmed by experts'),
  (5, 'DH003-S3-A3-T5', 'Document Validation Evidence', 'Compile validation evidence package', 'manual', 60, 'L1_expert', 75, FALSE, NULL, ARRAY['correlation_results.json', 'clinical_validation_report.pdf'], ARRAY['biomarker_validation_package.pdf'], 'Regulatory Affairs Specialist', 'Documentation', 'Create comprehensive validation documentation for regulatory', 'Package meets FDA biomarker qualification standards')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH003-S3-A3'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 13: Create L3 - Activities for WF-DH-004 Stage 4 (Submission Preparation)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH004-S4-A1', 'Submission Strategy Finalization', 'Finalize submission type and content strategy', 240
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = 4
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH004-S4-A2', 'Document Compilation', 'Compile all required submission documents', 720
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = 4
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH004-S4-A3', 'Quality Review', 'Conduct comprehensive quality review of submission', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = 4
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH004-S4-A4', 'eCopy Preparation', 'Prepare electronic submission package', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = 4
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 5, 'DH004-S4-A5', 'Final Approval & Submission', 'Obtain final approvals and submit to FDA', 240
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-004' AND ws.stage_number = 4
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 14: Create L4 - Tasks for DH004-S4-A2 (Document Compilation)
-- ============================================================================

INSERT INTO workflow_tasks (
  activity_id, stage_id, task_number, task_code, task_name, description, task_type,
  estimated_duration_minutes, service_layer, ai_automation_score,
  is_hitl_checkpoint, hitl_reason, input_artifacts, output_artifacts,
  required_role, tool_category, instructions, success_criteria
)
SELECT
  a.id, a.stage_id, t.task_number, t.task_code, t.task_name, t.description, t.task_type,
  t.duration, t.service_layer, t.ai_score, t.is_hitl, t.hitl_reason,
  t.inputs, t.outputs, t.role, t.tool, t.instructions, t.criteria
FROM workflow_activities a
CROSS JOIN (VALUES
  (1, 'DH004-S4-A2-T1', 'Compile Software Documentation', 'Gather software design, architecture, and cybersecurity docs', 'automated', 180, 'L3_workflow', 75, FALSE, NULL, ARRAY['DHF documents', 'Software specs'], ARRAY['software_documentation/'], 'Regulatory Affairs Specialist', 'Document Management', 'Compile software lifecycle documents per FDA guidance', 'All software docs complete and cross-referenced'),
  (2, 'DH004-S4-A2-T2', 'Prepare Clinical Evidence Summary', 'Create clinical evidence summary for submission', 'manual', 150, 'L1_expert', 65, FALSE, NULL, ARRAY['Clinical study reports', 'Literature review'], ARRAY['clinical_evidence_summary.pdf'], 'Clinical Regulatory Writer', 'Medical Writing', 'Summarize clinical evidence supporting safety and efficacy', 'Summary addresses all clinical questions'),
  (3, 'DH004-S4-A2-T3', 'Draft Indications for Use', 'Develop precise indications for use statement', 'manual', 90, 'L1_expert', 50, TRUE, 'IFU requires careful regulatory and clinical alignment', ARRAY['Clinical evidence', 'Regulatory strategy'], ARRAY['indications_for_use.docx'], 'Regulatory Affairs Director', 'Regulatory Writing', 'Draft IFU consistent with clinical evidence and strategy', 'IFU approved by regulatory and clinical leadership'),
  (4, 'DH004-S4-A2-T4', 'Prepare Risk Analysis', 'Compile FMEA and risk management documentation', 'automated', 120, 'L3_workflow', 80, FALSE, NULL, ARRAY['FMEA documents', 'Risk management file'], ARRAY['risk_analysis_summary.pdf'], 'Quality Engineer', 'Quality Documentation', 'Summarize risk analysis and mitigation measures', 'Risk documentation complete per ISO 14971'),
  (5, 'DH004-S4-A2-T5', 'Create Submission Index', 'Generate comprehensive submission table of contents', 'automated', 60, 'L3_workflow', 90, FALSE, NULL, ARRAY['All submission documents'], ARRAY['submission_index.xlsx'], 'Regulatory Affairs Specialist', 'Document Management', 'Auto-generate index with hyperlinks to all documents', 'Index accurately reflects all submission components'),
  (6, 'DH004-S4-A2-T6', 'Verify Document Completeness', 'Check all required documents against FDA checklist', 'review', 90, 'L1_expert', 70, TRUE, 'Completeness check critical before submission', ARRAY['submission_index.xlsx', 'FDA checklist'], ARRAY['completeness_checklist.pdf'], 'Regulatory Affairs Director', 'Quality Review', 'Verify all documents present and properly formatted', 'No gaps identified in submission package')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH004-S4-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 15: Link Workflows to JTBDs
-- ============================================================================

-- Create workflow_jtbd junction table if not exists
CREATE TABLE IF NOT EXISTS workflow_jtbd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  relevance_score NUMERIC(3,2) DEFAULT 1.0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, jtbd_id)
);

-- Link workflows to JTBDs
INSERT INTO workflow_jtbd (workflow_id, jtbd_id, relevance_score, is_primary)
SELECT w.id, j.id, 0.95, TRUE
FROM workflow_templates w, jtbd j
WHERE (w.code = 'WF-DH-001' AND j.code = 'JTBD-DPS-001')
   OR (w.code = 'WF-DH-002' AND j.code = 'JTBD-CMA-001')
   OR (w.code = 'WF-DH-003' AND j.code = 'JTBD-DCD-001')
   OR (w.code = 'WF-DH-004' AND j.code = 'JTBD-RQC-001')
ON CONFLICT (workflow_id, jtbd_id) DO UPDATE SET relevance_score = EXCLUDED.relevance_score;

-- Link secondary JTBDs
INSERT INTO workflow_jtbd (workflow_id, jtbd_id, relevance_score, is_primary)
SELECT w.id, j.id, 0.80, FALSE
FROM workflow_templates w, jtbd j
WHERE (w.code = 'WF-DH-001' AND j.code IN ('JTBD-CVR-003', 'JTBD-DCD-002'))
   OR (w.code = 'WF-DH-002' AND j.code IN ('JTBD-CVR-004', 'JTBD-CMA-003'))
   OR (w.code = 'WF-DH-003' AND j.code IN ('JTBD-DCD-003', 'JTBD-DCD-004'))
   OR (w.code = 'WF-DH-004' AND j.code IN ('JTBD-RQC-002', 'JTBD-RQC-004'))
ON CONFLICT (workflow_id, jtbd_id) DO UPDATE SET relevance_score = EXCLUDED.relevance_score;

-- ============================================================================
-- STEP 17: Create Views for Digital Health Workflows
-- ============================================================================

CREATE OR REPLACE VIEW v_dh_workflow_summary AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  wt.complexity_level,
  wt.estimated_duration_hours,
  COUNT(DISTINCT ws.id) as stages_l2,
  COUNT(DISTINCT wa.id) as activities_l3,
  COUNT(DISTINCT t.id) as tasks_l4,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(CASE WHEN t.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
WHERE wt.code LIKE 'WF-DH-%'
GROUP BY wt.code, wt.name, wt.work_mode, wt.complexity_level, wt.estimated_duration_hours
ORDER BY wt.code;

CREATE OR REPLACE VIEW v_dh_workflow_jtbd_mapping AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  j.code as jtbd_code,
  j.name as jtbd_name,
  wj.relevance_score,
  wj.is_primary,
  j.strategic_priority,
  j.opportunity_score
FROM workflow_templates wt
JOIN workflow_jtbd wj ON wj.workflow_id = wt.id
JOIN jtbd j ON j.id = wj.jtbd_id
WHERE wt.code LIKE 'WF-DH-%'
ORDER BY wt.code, wj.is_primary DESC, wj.relevance_score DESC;

-- ============================================================================
-- STEP 18: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_jtbd_workflow ON workflow_jtbd(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jtbd_jtbd ON workflow_jtbd(jtbd_id);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- SELECT * FROM v_dh_workflow_summary;
-- SELECT * FROM v_dh_workflow_jtbd_mapping;
-- SELECT * FROM v_wbs_hierarchy WHERE workflow_code LIKE 'WF-DH-%' LIMIT 50;

