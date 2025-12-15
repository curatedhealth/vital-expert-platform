-- Migration: 20251201_045_digital_health_workflows_part2.sql
-- Purpose: Additional Digital Health workflows for remaining JTBDs
--
-- WORKFLOWS CREATED:
--   WF-DH-005: AI/ML Model Validation for Healthcare (JTBD-DSA-001)
--   WF-DH-006: Patient Engagement Platform Optimization (JTBD-PPE-001)
--   WF-DH-007: Digital Health IP Protection Strategy (JTBD-LIP-001)
--   WF-DH-008: Healthcare Interoperability Implementation (JTBD-TIT-001)

-- ============================================================================
-- STEP 1: Create L1 - Workflow Templates
-- ============================================================================

INSERT INTO workflow_templates (
  id, code, name, description, workflow_type, work_mode, estimated_duration_hours,
  complexity_level, status, version
) VALUES
-- WF-DH-005: AI/ML Model Validation
(
  'd0050000-0000-4000-a000-000000000001',
  'WF-DH-005',
  'AI/ML Model Validation for Healthcare Workflow',
  'End-to-end workflow for validating AI/ML models in healthcare including bias assessment, clinical validation, and regulatory documentation',
  'sequential',
  'project',
  180,
  'high',
  'active',
  '1.0'
),
-- WF-DH-006: Patient Engagement Platform Optimization
(
  'd0060000-0000-4000-a000-000000000001',
  'WF-DH-006',
  'Patient Engagement Platform Optimization Workflow',
  'BAU workflow for continuously optimizing patient engagement platforms using behavioral analytics and A/B testing',
  'sequential',
  'routine',
  40,
  'medium',
  'active',
  '1.0'
),
-- WF-DH-007: Digital Health IP Protection
(
  'd0070000-0000-4000-a000-000000000001',
  'WF-DH-007',
  'Digital Health IP Protection Strategy Workflow',
  'Workflow for protecting digital health innovations through patents, trade secrets, and licensing strategies',
  'sequential',
  'project',
  120,
  'high',
  'active',
  '1.0'
),
-- WF-DH-008: Healthcare Interoperability
(
  'd0080000-0000-4000-a000-000000000001',
  'WF-DH-008',
  'Healthcare Interoperability Implementation Workflow',
  'Workflow for implementing FHIR-based interoperability with EHR/EMR systems',
  'conditional',
  'project',
  160,
  'high',
  'active',
  '1.0'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================================
-- STEP 2: Create L2 - Stages for WF-DH-005 (AI/ML Model Validation)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Model Assessment & Planning', 'Assess model architecture, intended use, and validation requirements', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Data Quality & Bias Assessment', 'Evaluate training data quality and assess algorithmic bias', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Clinical Performance Validation', 'Validate model performance against clinical gold standards', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-DH-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Explainability & Documentation', 'Document model explainability and create regulatory documentation', true, 36
FROM workflow_templates wt WHERE wt.code = 'WF-DH-005'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Deployment & Monitoring Setup', 'Prepare for deployment with continuous monitoring', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-005'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Create L2 - Stages for WF-DH-006 (Patient Engagement Optimization)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Engagement Analytics Review', 'Analyze current engagement metrics and identify optimization opportunities', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-DH-006'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Hypothesis Development', 'Develop engagement improvement hypotheses based on behavioral insights', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-DH-006'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'A/B Test Execution', 'Design and execute A/B tests for engagement features', true, 16
FROM workflow_templates wt WHERE wt.code = 'WF-DH-006'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Results Analysis & Implementation', 'Analyze test results and implement winning variants', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-DH-006'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Create L2 - Stages for WF-DH-007 (IP Protection Strategy)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Innovation Inventory', 'Catalog digital health innovations and assess patentability', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-007'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'Prior Art Search', 'Conduct comprehensive prior art and freedom-to-operate analysis', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-007'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'Patent Application Preparation', 'Draft and file patent applications for key innovations', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-007'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Trade Secret Protection', 'Implement trade secret protection for non-patentable innovations', true, 16
FROM workflow_templates wt WHERE wt.code = 'WF-DH-007'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Licensing Strategy', 'Develop licensing and partnership strategies', true, 8
FROM workflow_templates wt WHERE wt.code = 'WF-DH-007'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Create L2 - Stages for WF-DH-008 (Interoperability Implementation)
-- ============================================================================

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 1, 'Interoperability Requirements', 'Define data exchange requirements and FHIR resource mapping', true, 32
FROM workflow_templates wt WHERE wt.code = 'WF-DH-008'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 2, 'API Development', 'Develop FHIR-compliant APIs and integration layer', true, 48
FROM workflow_templates wt WHERE wt.code = 'WF-DH-008'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 3, 'EHR Integration Testing', 'Test integrations with major EHR systems (Epic, Cerner, etc.)', true, 40
FROM workflow_templates wt WHERE wt.code = 'WF-DH-008'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 4, 'Security & Compliance', 'Implement security controls and ensure HIPAA compliance', true, 24
FROM workflow_templates wt WHERE wt.code = 'WF-DH-008'
ON CONFLICT DO NOTHING;

INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, 5, 'Go-Live & Support', 'Deploy integrations and establish support processes', true, 16
FROM workflow_templates wt WHERE wt.code = 'WF-DH-008'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Create L3 - Activities for WF-DH-005 Stage 2 (Data Quality & Bias)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH005-S2-A1', 'Training Data Audit', 'Audit training data sources, quality, and representativeness', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-005' AND ws.stage_number = 2
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH005-S2-A2', 'Bias Detection Analysis', 'Detect algorithmic bias across demographic groups', 600
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-005' AND ws.stage_number = 2
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH005-S2-A3', 'Bias Mitigation Implementation', 'Implement bias mitigation strategies', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-005' AND ws.stage_number = 2
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH005-S2-A4', 'Fairness Validation', 'Validate fairness metrics across protected classes', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-005' AND ws.stage_number = 2
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 7: Create L4 - Tasks for DH005-S2-A2 (Bias Detection Analysis)
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
  (1, 'DH005-S2-A2-T1', 'Define Protected Classes', 'Identify demographic groups for bias analysis', 'decision', 60, 'L2_panel', 50, TRUE, 'Protected class definition requires ethics input', ARRAY['Regulatory requirements', 'Patient demographics'], ARRAY['protected_classes.json'], 'Ethics Officer', 'Policy Review', 'Use Ask Panel to define relevant protected classes', 'Protected classes approved by ethics committee'),
  (2, 'DH005-S2-A2-T2', 'Stratify Model Predictions', 'Analyze model performance by demographic group', 'automated', 120, 'L3_workflow', 85, FALSE, NULL, ARRAY['Model predictions', 'Patient demographics'], ARRAY['stratified_performance.csv'], 'ML Engineer', 'Analytics', 'Calculate performance metrics stratified by protected class', 'Performance metrics available for all groups'),
  (3, 'DH005-S2-A2-T3', 'Calculate Fairness Metrics', 'Compute statistical parity, equalized odds, calibration', 'automated', 90, 'L3_workflow', 90, FALSE, NULL, ARRAY['stratified_performance.csv'], ARRAY['fairness_metrics.json'], 'ML Engineer', 'ML Pipeline', 'Calculate standard fairness metrics using Aequitas/Fairlearn', 'All fairness metrics computed'),
  (4, 'DH005-S2-A2-T4', 'Identify Bias Patterns', 'Analyze fairness metrics to identify bias patterns', 'manual', 90, 'L1_expert', 65, FALSE, NULL, ARRAY['fairness_metrics.json', 'Model architecture'], ARRAY['bias_analysis_report.pdf'], 'AI Ethics Specialist', 'Analysis', 'Use Ask Expert to interpret fairness metrics and identify root causes', 'Bias patterns documented with root cause analysis'),
  (5, 'DH005-S2-A2-T5', 'Document Bias Findings', 'Create comprehensive bias assessment report', 'manual', 60, 'L1_expert', 75, TRUE, 'Bias findings require leadership review', ARRAY['bias_analysis_report.pdf', 'fairness_metrics.json'], ARRAY['bias_assessment_final.pdf'], 'AI/ML Validation Lead', 'Documentation', 'Compile bias findings with recommendations', 'Report approved by validation lead')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH005-S2-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 8: Create L3 - Activities for WF-DH-006 Stage 3 (A/B Test Execution)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH006-S3-A1', 'Test Design', 'Design A/B test with proper statistical power', 180
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-006' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH006-S3-A2', 'Variant Development', 'Develop test variants and implement tracking', 240
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-006' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH006-S3-A3', 'Test Deployment', 'Deploy test to user segments with monitoring', 120
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-006' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH006-S3-A4', 'Data Collection', 'Collect engagement and outcome data during test', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-006' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 9: Create L4 - Tasks for DH006-S3-A1 (Test Design)
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
  (1, 'DH006-S3-A1-T1', 'Define Primary Metrics', 'Select primary engagement metrics for test', 'decision', 30, 'L1_expert', 60, FALSE, NULL, ARRAY['Engagement hypotheses', 'Historical metrics'], ARRAY['primary_metrics.json'], 'Product Manager', 'Analytics', 'Use Ask Expert to recommend optimal primary metrics', 'Primary metric selected with clear success criteria'),
  (2, 'DH006-S3-A1-T2', 'Calculate Sample Size', 'Determine required sample size for statistical power', 'automated', 30, 'L3_workflow', 95, FALSE, NULL, ARRAY['primary_metrics.json', 'Historical variance'], ARRAY['sample_size_calc.json'], 'Data Scientist', 'Statistics', 'Calculate sample size for 80% power, 5% significance', 'Sample size calculated with documented assumptions'),
  (3, 'DH006-S3-A1-T3', 'Design Randomization', 'Design user randomization strategy', 'automated', 45, 'L3_workflow', 85, FALSE, NULL, ARRAY['User segments', 'sample_size_calc.json'], ARRAY['randomization_plan.json'], 'Data Scientist', 'Experimentation', 'Design stratified randomization to balance key covariates', 'Randomization plan ensures balanced groups'),
  (4, 'DH006-S3-A1-T4', 'Document Test Protocol', 'Create comprehensive test protocol document', 'manual', 45, 'L1_expert', 70, TRUE, 'Test protocol requires stakeholder approval', ARRAY['All design artifacts'], ARRAY['test_protocol.pdf'], 'Product Manager', 'Documentation', 'Document test design, metrics, duration, and decision criteria', 'Protocol approved by product and analytics leads')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH006-S3-A1'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 10: Create L3 - Activities for WF-DH-008 Stage 3 (EHR Integration Testing)
-- ============================================================================

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 1, 'DH008-S3-A1', 'Test Environment Setup', 'Configure EHR sandbox environments for testing', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-008' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 2, 'DH008-S3-A2', 'Epic Integration Testing', 'Test FHIR integration with Epic sandbox', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-008' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 3, 'DH008-S3-A3', 'Cerner Integration Testing', 'Test FHIR integration with Cerner sandbox', 480
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-008' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 4, 'DH008-S3-A4', 'Data Mapping Validation', 'Validate data mapping accuracy across EHR systems', 360
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-008' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

INSERT INTO workflow_activities (stage_id, activity_number, activity_code, activity_name, description, estimated_duration_minutes)
SELECT ws.id, 5, 'DH008-S3-A5', 'Performance Testing', 'Test API performance under load', 240
FROM workflow_stages ws
JOIN workflow_templates wt ON wt.id = ws.template_id
WHERE wt.code = 'WF-DH-008' AND ws.stage_number = 3
ON CONFLICT (activity_code) DO UPDATE SET activity_name = EXCLUDED.activity_name;

-- ============================================================================
-- STEP 11: Create L4 - Tasks for DH008-S3-A2 (Epic Integration Testing)
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
  (1, 'DH008-S3-A2-T1', 'Configure Epic Sandbox', 'Set up Epic FHIR sandbox with test patient data', 'manual', 60, 'L3_workflow', 80, FALSE, NULL, ARRAY['Epic developer credentials', 'Test data spec'], ARRAY['epic_sandbox_config.json'], 'Integration Engineer', 'EHR Integration', 'Configure Epic App Orchard sandbox environment', 'Sandbox accessible with test patients'),
  (2, 'DH008-S3-A2-T2', 'Test Patient Read Operations', 'Verify FHIR Patient resource read operations', 'automated', 90, 'L3_workflow', 90, FALSE, NULL, ARRAY['epic_sandbox_config.json', 'FHIR API specs'], ARRAY['patient_read_results.json'], 'QA Engineer', 'API Testing', 'Execute automated test suite for Patient resource', 'All Patient read tests pass'),
  (3, 'DH008-S3-A2-T3', 'Test Observation Write Operations', 'Verify FHIR Observation resource write operations', 'automated', 90, 'L3_workflow', 85, FALSE, NULL, ARRAY['epic_sandbox_config.json', 'Observation mapping'], ARRAY['observation_write_results.json'], 'QA Engineer', 'API Testing', 'Test writing digital health observations to Epic', 'Observations successfully written and retrievable'),
  (4, 'DH008-S3-A2-T4', 'Test Error Handling', 'Verify graceful handling of API errors', 'automated', 60, 'L3_workflow', 90, FALSE, NULL, ARRAY['Error scenarios spec'], ARRAY['error_handling_results.json'], 'QA Engineer', 'API Testing', 'Test timeout, auth failure, and data validation errors', 'All error scenarios handled gracefully'),
  (5, 'DH008-S3-A2-T5', 'Validate Data Fidelity', 'Verify data accuracy after round-trip', 'review', 60, 'L1_expert', 70, TRUE, 'Data fidelity requires clinical validation', ARRAY['Test data', 'Retrieved data'], ARRAY['data_fidelity_report.pdf'], 'Clinical Informaticist', 'Data Quality', 'Compare source and retrieved data for accuracy', 'Data fidelity >99.9% for all fields'),
  (6, 'DH008-S3-A2-T6', 'Document Epic Integration', 'Create Epic integration documentation', 'manual', 60, 'L1_expert', 75, FALSE, NULL, ARRAY['All test results'], ARRAY['epic_integration_doc.pdf'], 'Technical Writer', 'Documentation', 'Document Epic-specific integration details and limitations', 'Documentation complete for Epic go-live')
) AS t(task_number, task_code, task_name, description, task_type, duration, service_layer, ai_score, is_hitl, hitl_reason, inputs, outputs, role, tool, instructions, criteria)
WHERE a.activity_code = 'DH008-S3-A2'
ON CONFLICT (task_code) DO UPDATE SET task_name = EXCLUDED.task_name, service_layer = EXCLUDED.service_layer;

-- ============================================================================
-- STEP 12: Link Additional Workflows to JTBDs
-- ============================================================================

INSERT INTO workflow_jtbd (workflow_id, jtbd_id, relevance_score, is_primary)
SELECT w.id, j.id, 0.95, TRUE
FROM workflow_templates w, jtbd j
WHERE (w.code = 'WF-DH-005' AND j.code = 'JTBD-DSA-001')
   OR (w.code = 'WF-DH-006' AND j.code = 'JTBD-PPE-001')
   OR (w.code = 'WF-DH-007' AND j.code = 'JTBD-LIP-001')
   OR (w.code = 'WF-DH-008' AND j.code = 'JTBD-TIT-001')
ON CONFLICT (workflow_id, jtbd_id) DO UPDATE SET relevance_score = EXCLUDED.relevance_score;

-- Link secondary JTBDs
INSERT INTO workflow_jtbd (workflow_id, jtbd_id, relevance_score, is_primary)
SELECT w.id, j.id, 0.75, FALSE
FROM workflow_templates w, jtbd j
WHERE (w.code = 'WF-DH-005' AND j.code IN ('JTBD-DSA-002', 'JTBD-DSA-004'))
   OR (w.code = 'WF-DH-006' AND j.code IN ('JTBD-PPE-002', 'JTBD-PPE-003'))
   OR (w.code = 'WF-DH-007' AND j.code IN ('JTBD-LIP-002', 'JTBD-DSI-004'))
   OR (w.code = 'WF-DH-008' AND j.code IN ('JTBD-TIT-002', 'JTBD-TIT-004'))
ON CONFLICT (workflow_id, jtbd_id) DO UPDATE SET relevance_score = EXCLUDED.relevance_score;

-- ============================================================================
-- STEP 14: Create Role-Workflow Mapping Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  role_name TEXT NOT NULL,
  role_type TEXT CHECK (role_type IN ('owner', 'contributor', 'reviewer', 'approver', 'informed')),
  stage_scope TEXT[], -- Which stages this role participates in
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, role_name)
);

-- Map roles to workflows
INSERT INTO workflow_roles (workflow_id, role_name, role_type, stage_scope)
SELECT w.id, r.role_name, r.role_type, r.stage_scope
FROM workflow_templates w
CROSS JOIN (VALUES
  ('WF-DH-001', 'Clinical Validation Director', 'owner', ARRAY['All']),
  ('WF-DH-001', 'Clinical Research Associate', 'contributor', ARRAY['Clinical Evidence Planning', 'Clinical Data Collection']),
  ('WF-DH-001', 'Biostatistician', 'contributor', ARRAY['Study Protocol Development', 'Analysis & Reporting']),
  ('WF-DH-001', 'Regulatory Affairs Specialist', 'contributor', ARRAY['Regulatory Alignment']),
  ('WF-DH-002', 'Market Access Director', 'owner', ARRAY['All']),
  ('WF-DH-002', 'Health Economist', 'contributor', ARRAY['HEOR Evidence Generation', 'Value Proposition Development']),
  ('WF-DH-002', 'Payer Account Manager', 'contributor', ARRAY['Payer Engagement', 'Coverage Implementation']),
  ('WF-DH-003', 'Clinical Operations Director', 'owner', ARRAY['All']),
  ('WF-DH-003', 'DCT Technology Lead', 'contributor', ARRAY['Technology Platform Selection', 'Digital Endpoint Validation']),
  ('WF-DH-003', 'Site Manager', 'contributor', ARRAY['Site & Patient Enablement', 'Go-Live & Monitoring']),
  ('WF-DH-004', 'Regulatory Affairs Director', 'owner', ARRAY['All']),
  ('WF-DH-004', 'Quality Engineer', 'contributor', ARRAY['Technical Documentation', 'Submission Preparation']),
  ('WF-DH-004', 'Clinical Regulatory Writer', 'contributor', ARRAY['Clinical Evidence Compilation', 'Submission Preparation']),
  ('WF-DH-005', 'AI/ML Validation Lead', 'owner', ARRAY['All']),
  ('WF-DH-005', 'ML Engineer', 'contributor', ARRAY['Data Quality & Bias Assessment', 'Clinical Performance Validation']),
  ('WF-DH-005', 'AI Ethics Specialist', 'contributor', ARRAY['Data Quality & Bias Assessment']),
  ('WF-DH-006', 'Patient Experience Director', 'owner', ARRAY['All']),
  ('WF-DH-006', 'Product Manager', 'contributor', ARRAY['Hypothesis Development', 'A/B Test Execution']),
  ('WF-DH-006', 'Data Scientist', 'contributor', ARRAY['Engagement Analytics Review', 'Results Analysis & Implementation']),
  ('WF-DH-007', 'IP Strategy Director', 'owner', ARRAY['All']),
  ('WF-DH-007', 'Patent Attorney', 'contributor', ARRAY['Prior Art Search', 'Patent Application Preparation']),
  ('WF-DH-008', 'Interoperability Architect', 'owner', ARRAY['All']),
  ('WF-DH-008', 'Integration Engineer', 'contributor', ARRAY['API Development', 'EHR Integration Testing']),
  ('WF-DH-008', 'Clinical Informaticist', 'reviewer', ARRAY['EHR Integration Testing', 'Security & Compliance'])
) AS r(workflow_code, role_name, role_type, stage_scope)
WHERE w.code = r.workflow_code
ON CONFLICT (workflow_id, role_name) DO UPDATE SET role_type = EXCLUDED.role_type;

-- ============================================================================
-- STEP 15: Update Views
-- ============================================================================

CREATE OR REPLACE VIEW v_dh_workflow_roles AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wr.role_name,
  wr.role_type,
  wr.stage_scope,
  r.id as org_role_id,
  d.name as department
FROM workflow_templates wt
JOIN workflow_roles wr ON wr.workflow_id = wt.id
LEFT JOIN org_roles r ON r.name = wr.role_name
LEFT JOIN org_departments d ON d.id = r.department_id
WHERE wt.code LIKE 'WF-DH-%'
ORDER BY wt.code, wr.role_type, wr.role_name;

CREATE OR REPLACE VIEW v_dh_workflow_automation_analysis AS
SELECT
  wt.code as workflow_code,
  wt.name as workflow_name,
  wt.work_mode,
  wt.complexity_level,
  wt.estimated_duration_hours,
  COUNT(DISTINCT t.id) as total_tasks,
  SUM(CASE WHEN t.ai_automation_score >= 80 THEN 1 ELSE 0 END) as high_automation_tasks,
  SUM(CASE WHEN t.ai_automation_score >= 50 AND t.ai_automation_score < 80 THEN 1 ELSE 0 END) as medium_automation_tasks,
  SUM(CASE WHEN t.ai_automation_score < 50 THEN 1 ELSE 0 END) as low_automation_tasks,
  ROUND(AVG(t.ai_automation_score)::numeric, 1) as avg_automation_score,
  SUM(CASE WHEN t.is_hitl_checkpoint THEN 1 ELSE 0 END) as hitl_checkpoints,
  COUNT(DISTINCT CASE WHEN t.service_layer = 'L1_expert' THEN t.id END) as l1_expert_tasks,
  COUNT(DISTINCT CASE WHEN t.service_layer = 'L2_panel' THEN t.id END) as l2_panel_tasks,
  COUNT(DISTINCT CASE WHEN t.service_layer = 'L3_workflow' THEN t.id END) as l3_workflow_tasks
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_activities wa ON wa.stage_id = ws.id
LEFT JOIN workflow_tasks t ON t.activity_id = wa.id
WHERE wt.code LIKE 'WF-DH-%'
GROUP BY wt.code, wt.name, wt.work_mode, wt.complexity_level, wt.estimated_duration_hours
ORDER BY wt.code;

-- ============================================================================
-- STEP 16: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workflow_roles_workflow ON workflow_roles(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_roles_role ON workflow_roles(role_id);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- SELECT * FROM v_dh_workflow_summary;
-- SELECT * FROM v_dh_workflow_automation_analysis;
-- SELECT * FROM v_dh_workflow_roles;
-- SELECT * FROM v_dh_workflow_jtbd_mapping;

