-- =====================================================================================
-- 13_cd_007_sample_size_calculation_part1.sql
-- UC_CD_007: Sample Size Calculation for DTx Trials - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_007
-- Dependencies: Foundation data must exist (use case UC_CD_007)
-- Execution Order: 13a (before part 2)
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
-- SECTION 1: WORKFLOWS (1 Workflow with 7 Tasks)
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
      'Sample Size Calculation Workflow',
      'WFL-CD-007-001',
      'Complete workflow for calculating and justifying sample size for DTx clinical trials',
      1,
      jsonb_build_object(
        'duration_minutes', 165,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Study parameters definition',
          'Effect size estimate',
          'Variability estimate',
          'Sample size calculation',
          'Attrition-adjusted sample size',
          'Sensitivity analysis table',
          'Sample size justification report (5-8 pages)'
        ),
        'key_activities', json_build_array(
          'Define study parameters',
          'Estimate effect size',
          'Estimate variability',
          'Calculate sample size',
          'Adjust for attrition',
          'Perform sensitivity analyses',
          'Finalize justification'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT', 'P01_CMO', 'P02_VPCLIN', 'P05_REGAFF')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (7 Tasks)
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
    -- Step 1: Define Study Parameters
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-01',
      'TSK-CD-007-01',
      'Define Study Parameters',
      'Define core study parameters: trial design, endpoint type, hypothesis, alpha, power, and allocation ratio',
      1,
      jsonb_build_object(
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20,
        'deliverable', 'Study parameters document',
        'key_parameters', json_build_array(
          'Trial design (superiority/non-inferiority)',
          'Endpoint type (continuous/binary/time-to-event)',
          'Hypothesis (one-sided/two-sided)',
          'Alpha (Type I error, typically 0.05)',
          'Power (typically 0.80 or 0.90)',
          'Allocation ratio (typically 1:1)'
        ),
        'success_criteria', json_build_array(
          'All parameters clearly defined',
          'Design aligns with regulatory strategy',
          'Choices justified'
        )
      )
    ),

    -- Step 2: Estimate Effect Size
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-02',
      'TSK-CD-007-02',
      'Estimate Effect Size',
      'Estimate expected treatment effect based on literature review, pilot data, or clinical meaningfulness (MCID)',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30,
        'deliverable', 'Effect size estimate with justification',
        'data_sources', json_build_array(
          'Literature review (similar interventions)',
          'Pilot study data',
          'MCID (Minimally Clinically Important Difference)',
          'Regulatory guidance',
          'Expert clinical opinion'
        ),
        'effect_size_metrics', json_build_array(
          'Continuous: Mean difference (Cohen d)',
          'Binary: Risk difference or odds ratio',
          'Time-to-event: Hazard ratio'
        )
      )
    ),

    -- Step 3: Estimate Variability
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-03',
      'TSK-CD-007-03',
      'Estimate Variability',
      'Estimate variability (standard deviation for continuous endpoints, event rate for binary) from literature or pilot data',
      3,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 25,
        'deliverable', 'Variability estimate with source documentation',
        'continuous_endpoints', json_build_array(
          'Standard deviation (SD)',
          'Standard error (SE)',
          'Coefficient of variation (CV)'
        ),
        'binary_endpoints', json_build_array(
          'Control group event rate',
          'Treatment group event rate',
          'Baseline prevalence'
        ),
        'data_sources', json_build_array(
          'Published trials',
          'Pilot data',
          'Registry data',
          'Natural history studies'
        )
      )
    ),

    -- Step 4: Calculate Sample Size
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-04',
      'TSK-CD-007-04',
      'Calculate Sample Size',
      'Perform power analysis to calculate required sample size per arm using appropriate statistical formula',
      4,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'deliverable', 'Sample size calculation (N per arm, total N)',
        'statistical_methods', json_build_array(
          'Continuous: Two-sample t-test',
          'Binary: Two-proportion z-test',
          'Time-to-event: Log-rank test',
          'Non-inferiority: Adjusted margin'
        ),
        'software_tools', json_build_array(
          'R (pwr package)',
          'SAS (PROC POWER)',
          'PASS',
          'G*Power',
          'nQuery'
        )
      )
    ),

    -- Step 5: Adjust for Attrition
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-05',
      'TSK-CD-007-05',
      'Adjust for Attrition',
      'Inflate sample size to account for expected dropout/attrition based on similar trial precedent',
      5,
      jsonb_build_object(
        'complexity', 'BASIC',
        'estimated_duration_minutes', 15,
        'deliverable', 'Attrition-adjusted sample size',
        'typical_attrition_rates', json_build_array(
          'DTx depression trials: 20-30%',
          'DTx substance use: 30-40%',
          'DTx chronic disease: 15-25%',
          'DTx behavioral: 20-35%'
        ),
        'adjustment_formula', 'N_adjusted = N / (1 - attrition_rate)',
        'justification_required', json_build_array(
          'Similar trial attrition rates',
          'Pilot study dropout data',
          'Engagement strategy',
          'Retention plan'
        )
      )
    ),

    -- Step 6: Perform Sensitivity Analyses
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-06',
      'TSK-CD-007-06',
      'Sensitivity Analyses',
      'Test robustness of sample size across plausible ranges of effect size, variability, and attrition',
      6,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25,
        'deliverable', 'Sensitivity analysis table',
        'scenarios', json_build_array(
          'Base case (most likely)',
          'Optimistic (larger effect, lower variability)',
          'Pessimistic (smaller effect, higher variability)',
          'Conservative (higher attrition)'
        ),
        'parameters_to_vary', json_build_array(
          'Effect size (±20-30%)',
          'Standard deviation (±20%)',
          'Attrition rate (±10%)',
          'Power (80% vs 90%)'
        )
      )
    ),

    -- Step 7: Finalize Justification
    (
      'Sample Size Calculation Workflow',
      'TSK-CD-007-07',
      'TSK-CD-007-07',
      'Finalize Sample Size Justification',
      'Prepare comprehensive sample size justification report for protocol, IRB, and regulatory submissions',
      7,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Sample size justification report (5-8 pages)',
        'report_sections', json_build_array(
          'Executive summary',
          'Study design and objectives',
          'Primary endpoint definition',
          'Effect size estimate and justification',
          'Variability estimate and source',
          'Power analysis methodology',
          'Sample size calculation',
          'Attrition adjustment',
          'Sensitivity analyses',
          'Recruitment feasibility',
          'References'
        ),
        'regulatory_alignment', json_build_array(
          'FDA ICH E9 Statistical Principles',
          'Protocol section 11.2 (Sample Size)',
          'IRB submission requirements'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_007' AND tenant_id = sc.tenant_id)
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
  'UC-07 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_007';

-- Verify tasks
SELECT 
  'UC-07 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_007';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_007'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-07 PART 1 SEED FILE
-- =====================================================================================

