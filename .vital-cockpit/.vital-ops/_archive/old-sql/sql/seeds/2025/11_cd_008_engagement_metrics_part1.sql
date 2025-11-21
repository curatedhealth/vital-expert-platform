-- =====================================================================================
-- 11_cd_008_engagement_metrics_part1.sql
-- UC_CD_008: DTx Engagement Metrics as Endpoints - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_008
-- Dependencies: Foundation data must exist (use case UC_CD_008)
-- Execution Order: 11a (before part 2)
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_slug TEXT := 'digital-health-startup';
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = v_tenant_slug;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant with slug "%" not found. Please create tenant first.', v_tenant_slug;
  END IF;
  
  RAISE NOTICE 'Using tenant: % (ID: %)', v_tenant_slug, v_tenant_id;
END $$;

CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- =====================================================================================
-- SECTION 1: WORKFLOWS (5 Phases)
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id,
  use_case_id,
  name,
  unique_id,
  description,
  position,
  metadata
)
SELECT
  sc.tenant_id,
  uc.id as use_case_id,
  wf_data.name,
  wf_data.unique_id,
  wf_data.description,
  wf_data.position,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    (
      'Phase 1: Engagement Definition',
      'WFL-CD-008-001',
      'Create comprehensive engagement taxonomy distinguishing usage (descriptive) from engagement (therapeutically meaningful)',
      1,
      jsonb_build_object(
        'duration_minutes', 30,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Engagement taxonomy document',
          'Usage vs engagement distinction',
          'Therapeutic rationale for each metric'
        ),
        'key_activities', json_build_array(
          'Define engagement categories',
          'Establish therapeutic rationale',
          'Distinguish usage from engagement'
        ),
        'primary_personas', json_build_array('P02_VPCLIN', 'P06_PMDIG', 'P01_CMO')
      )
    ),
    (
      'Phase 2: Operationalization',
      'WFL-CD-008-002',
      'Operationalize engagement metrics with precise measurement specifications, algorithms, and data capture requirements',
      2,
      jsonb_build_object(
        'duration_minutes', 40,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Operational definitions document',
          'Data capture specifications',
          'Quality assurance procedures'
        ),
        'key_activities', json_build_array(
          'Define operational metrics',
          'Specify measurement algorithms',
          'Design data quality checks'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT', 'P06_PMDIG', 'P02_VPCLIN')
      )
    ),
    (
      'Phase 3: Dose-Response Analysis',
      'WFL-CD-008-003',
      'Design dose-response analysis testing relationship between engagement levels and clinical outcomes',
      3,
      jsonb_build_object(
        'duration_minutes', 30,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Dose-response analysis plan',
          'Statistical model specification',
          'Engagement threshold validation'
        ),
        'key_activities', json_build_array(
          'Design dose-response models',
          'Establish engagement thresholds',
          'Plan statistical analyses'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT', 'P01_CMO')
      )
    ),
    (
      'Phase 4: Mediation Analysis',
      'WFL-CD-008-004',
      'Plan mediation analysis demonstrating engagement as mechanism of action linking intervention to outcomes',
      4,
      jsonb_build_object(
        'duration_minutes', 30,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Mediation analysis plan',
          'Causal pathway specification',
          'Statistical methods documentation'
        ),
        'key_activities', json_build_array(
          'Define mediation hypotheses',
          'Specify causal pathways',
          'Plan mediation analyses'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT', 'P01_CMO')
      )
    ),
    (
      'Phase 5: Regulatory Strategy',
      'WFL-CD-008-005',
      'Develop regulatory positioning strategy addressing FDA engagement-related questions and requirements',
      5,
      jsonb_build_object(
        'duration_minutes', 30,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Regulatory positioning document',
          'FDA engagement guidance alignment',
          'Submission section draft'
        ),
        'key_activities', json_build_array(
          'Review FDA guidance',
          'Develop regulatory narrative',
          'Prepare submission content'
        ),
        'primary_personas', json_build_array('P05_REGAFF', 'P01_CMO')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_008' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (5 Tasks, one per phase)
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  unique_id,
  title,
  objective,
  position,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  task_data.code,
  task_data.unique_id,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Phase 1: Engagement Definition (1 task)
    (
      'Phase 1: Engagement Definition',
      'TSK-CD-008-P1-01',
      'TSK-CD-008-P1-01',
      'Define Engagement Taxonomy',
      'Create comprehensive engagement taxonomy distinguishing usage metrics (descriptive) from engagement metrics (therapeutically meaningful) with clear therapeutic rationale',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Engagement Taxonomy Document (5-7 pages)',
        'key_components', json_build_array(
          'Usage metrics (app opens, session time) - descriptive only',
          'Engagement metrics (module completion, skill practice) - therapeutic',
          'Therapeutic rationale for each engagement metric',
          'Engagement levels (non-engaged, minimal, adequate, optimal)',
          'Measurement approach specification'
        ),
        'success_criteria', json_build_array(
          'Clear distinction between usage and engagement',
          'Therapeutic rationale documented for each metric',
          '3-4 engagement levels defined',
          'Product and clinical team alignment'
        )
      )
    ),

    -- Phase 2: Operationalization (1 task)
    (
      'Phase 2: Operationalization',
      'TSK-CD-008-P2-01',
      'TSK-CD-008-P2-01',
      'Operationalize Engagement Metrics',
      'Define precise operational definitions, measurement algorithms, data capture specifications, and quality assurance procedures for all engagement metrics',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 40,
        'deliverable', 'Operational Definitions & Data Capture Specifications',
        'specification_components', json_build_array(
          'Operational definition for each metric',
          'Measurement formula/algorithm',
          'Data sources and event logging',
          'Handling rules (missing data, anomalies)',
          'Quality checks and validation',
          'Edge cases and exceptions'
        ),
        'technical_considerations', json_build_array(
          'Event logging architecture',
          'Timestamp precision',
          'Duplicate detection',
          'Bot/test account filtering',
          'Data quality thresholds'
        )
      )
    ),

    -- Phase 3: Dose-Response Analysis (1 task)
    (
      'Phase 3: Dose-Response Analysis',
      'TSK-CD-008-P3-01',
      'TSK-CD-008-P3-01',
      'Design Dose-Response Analysis',
      'Develop comprehensive dose-response analysis plan testing relationship between engagement dose (low/medium/high) and clinical outcomes',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 30,
        'deliverable', 'Dose-Response Analysis Plan',
        'analysis_components', json_build_array(
          'Dose categorization (tertiles, quartiles, or evidence-based)',
          'Statistical models (linear, quadratic, categorical)',
          'Covariates and confounders',
          'Sensitivity analyses',
          'Threshold identification methods',
          'Power calculations'
        ),
        'key_hypotheses', json_build_array(
          'H1: Higher engagement → better outcomes',
          'H2: Threshold exists (minimum therapeutic dose)',
          'H3: Diminishing returns beyond optimal dose'
        ),
        'statistical_methods', json_build_array(
          'Linear mixed models',
          'Generalized estimating equations',
          'Spline regression for non-linearity',
          'ROC analysis for threshold detection'
        )
      )
    ),

    -- Phase 4: Mediation Analysis (1 task)
    (
      'Phase 4: Mediation Analysis',
      'TSK-CD-008-P4-01',
      'TSK-CD-008-P4-01',
      'Plan Mediation Analysis',
      'Design mediation analysis demonstrating engagement as mechanism of action (intervention → engagement → outcome causal pathway)',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 30,
        'deliverable', 'Mediation Analysis Plan with causal pathway specification',
        'mediation_framework', json_build_array(
          'Baron & Kenny steps',
          'Sobel test',
          'Bootstrap confidence intervals',
          'PROCESS macro approach',
          'Sensitivity to unmeasured confounding'
        ),
        'causal_pathways', json_build_array(
          'Direct effect: Intervention → Outcome',
          'Indirect effect: Intervention → Engagement → Outcome',
          'Proportion mediated calculation'
        ),
        'key_assumptions', json_build_array(
          'No unmeasured confounding',
          'Temporal ordering (engagement precedes outcome)',
          'Measurement without error (or error correction)'
        )
      )
    ),

    -- Phase 5: Regulatory Strategy (1 task)
    (
      'Phase 5: Regulatory Strategy',
      'TSK-CD-008-P5-01',
      'TSK-CD-008-P5-01',
      'Develop Regulatory Positioning',
      'Create regulatory positioning document addressing FDA engagement-related questions, demonstrating feasibility and clinical validity',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Regulatory Positioning Document & FDA Submission Section',
        'fda_concerns_addressed', json_build_array(
          'Will patients actually use the product? (Feasibility)',
          'Does engagement predict outcomes? (Validity)',
          'What happens with low engagement? (Safety/Efficacy)',
          'How is engagement monitored? (Quality assurance)',
          'What is therapeutic minimum dose? (Labeling)'
        ),
        'regulatory_evidence', json_build_array(
          'Engagement rates from pilot studies',
          'Dose-response analysis results',
          'Mediation analysis findings',
          'Real-world feasibility data',
          'Comparator engagement benchmarks'
        ),
        'submission_sections', json_build_array(
          'Protocol section on engagement',
          'SAP addendum for engagement analyses',
          'Clinical study report engagement chapter',
          'Label claim support (if applicable)'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_008' AND tenant_id = sc.tenant_id)
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  extra = EXCLUDED.extra;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Verify workflows
SELECT 
  'UC-08 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Verify tasks
SELECT 
  'UC-08 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_008';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_008'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-08 PART 1 SEED FILE
-- =====================================================================================

