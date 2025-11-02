-- =====================================================================================
-- 17_ma_002_health_economics_part1.sql
-- UC_MA_002: Health Economics Model (DTx) - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_MA_002
-- Dependencies: Foundation data must exist (use case UC_MA_002)
-- Execution Order: 17a (before part 2)
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
      'Health Economics Modeling Workflow',
      'WFL-MA-002-001',
      'Complete workflow for developing cost-effectiveness and cost-utility models for DTx products',
      1,
      jsonb_build_object(
        'duration_minutes', 600,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Cost-effectiveness model',
          'ICER calculation',
          'Budget impact model',
          'Sensitivity analyses',
          'Model validation report',
          'Value narrative'
        ),
        'model_types', json_build_array('Decision Tree', 'Markov Model', 'Discrete Event Simulation'),
        'primary_personas', json_build_array('P22_HEOR', 'P21_MA_DIR', 'P04_BIOSTAT')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_MA_002' AND uc.tenant_id = sc.tenant_id
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
    -- Step 1: Define Model Architecture
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-01',
      'TSK-MA-002-01',
      'Define Model Architecture',
      'Establish model structure, comparators, time horizon, and perspective for health economic analysis',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 90,
        'deliverable', 'Model architecture document',
        'key_decisions', json_build_array(
          'Model type (Decision Tree, Markov, DES)',
          'Comparator selection (SOC, alternative DTx)',
          'Time horizon (1, 5, 10 years, lifetime)',
          'Perspective (payer, societal, healthcare system)',
          'Discount rate (3% or 5% per ISPOR)'
        ),
        'model_selection_criteria', json_build_array(
          'Disease characteristics (acute vs chronic)',
          'Data availability',
          'Decision-maker preferences',
          'Regulatory requirements'
        )
      )
    ),

    -- Step 2: Build Cost-Effectiveness Model
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-02',
      'TSK-MA-002-02',
      'Build Cost-Effectiveness Model',
      'Develop CEA model structure with health states, transitions, and clinical pathway',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 120,
        'deliverable', 'CEA model (Excel or TreeAge)',
        'model_components', json_build_array(
          'Health states definition',
          'Transition probabilities',
          'Costs per state',
          'Utilities (QALYs) per state',
          'Time cycle (month, quarter, year)'
        ),
        'dtx_specific_considerations', json_build_array(
          'Low marginal cost per additional user',
          'Scalability advantages',
          'Real-time data generation',
          'Personalization benefits'
        )
      )
    ),

    -- Step 3: Populate Clinical & Cost Inputs
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-03',
      'TSK-MA-002-03',
      'Populate Clinical & Cost Inputs',
      'Gather and input clinical efficacy data, cost data, and utility values from literature and trial results',
      3,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 90,
        'deliverable', 'Populated model with documented sources',
        'clinical_inputs', json_build_array(
          'Efficacy rates (response, remission)',
          'Adverse event rates',
          'Discontinuation rates',
          'Mortality rates (if applicable)'
        ),
        'cost_inputs', json_build_array(
          'DTx development costs (amortized)',
          'DTx delivery costs',
          'Comparator treatment costs',
          'Medical costs (hospitalizations, visits)',
          'Indirect costs (productivity loss)'
        ),
        'utility_inputs', json_build_array(
          'Baseline utility by health state',
          'Utility decrements for AEs',
          'Published EQ-5D or SF-6D values'
        )
      )
    ),

    -- Step 4: Calculate ICER
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-04',
      'TSK-MA-002-04',
      'Calculate ICER & Cost per QALY',
      'Run model to calculate Incremental Cost-Effectiveness Ratio and interpret against willingness-to-pay thresholds',
      4,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 60,
        'deliverable', 'ICER calculation and interpretation',
        'icer_formula', 'ICER = (Cost_DTx - Cost_Comparator) / (QALY_DTx - QALY_Comparator)',
        'wtp_thresholds', json_build_array(
          'US: $50K-$150K per QALY',
          'UK (NICE): £20K-£30K per QALY',
          'WHO: 1-3x GDP per capita'
        ),
        'interpretation', json_build_array(
          'Dominant: Less costly, more effective',
          'Cost-effective: ICER below WTP threshold',
          'Not cost-effective: ICER above WTP threshold',
          'Dominated: More costly, less effective'
        )
      )
    ),

    -- Step 5: Build Budget Impact Model
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-05',
      'TSK-MA-002-05',
      'Build Budget Impact Model',
      'Develop BIM projecting 3-5 year financial impact from payer perspective with PMPM calculations',
      5,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 120,
        'deliverable', 'Budget impact model with 3-5 year projections',
        'bim_components', json_build_array(
          'Target population estimation',
          'Market share/uptake assumptions',
          'Costs with vs without DTx',
          'Medical cost offsets',
          'PMPM impact'
        ),
        'time_horizons', json_build_array('Year 1', 'Year 3', 'Year 5'),
        'pmpm_calculation', '(Total cost with DTx - Total cost without DTx) / Members / 12 months'
      )
    ),

    -- Step 6: Perform Sensitivity Analyses
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-06',
      'TSK-MA-002-06',
      'Perform Sensitivity Analyses',
      'Conduct one-way, scenario, and probabilistic sensitivity analyses to test model robustness',
      6,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 120,
        'deliverable', 'Sensitivity analysis results and interpretation',
        'analysis_types', json_build_array(
          'One-way sensitivity: Vary each parameter individually',
          'Scenario analysis: Best case, worst case, base case',
          'Probabilistic sensitivity: Monte Carlo (1000+ iterations)',
          'Threshold analysis: Break-even pricing'
        ),
        'key_parameters_to_vary', json_build_array(
          'Efficacy rates (±20%)',
          'Costs (±30%)',
          'Utilities (±10%)',
          'Discount rate (0%, 3%, 5%)',
          'Time horizon'
        )
      )
    ),

    -- Step 7: Validate Model & Develop Value Narrative
    (
      'Health Economics Modeling Workflow',
      'TSK-MA-002-07',
      'TSK-MA-002-07',
      'Validate Model & Develop Value Narrative',
      'Perform model validation checks and translate economic outputs into compelling value messages for payers',
      7,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 90,
        'deliverable', 'Validation report and value narrative document',
        'validation_checks', json_build_array(
          'Internal validation: Formula accuracy, no circular references',
          'External validation: Compare to published models',
          'Face validity: Clinical expert review',
          'Stress testing: Extreme parameter values'
        ),
        'value_narrative_components', json_build_array(
          'Cost-effectiveness story',
          'Budget impact summary',
          'Key value messages',
          'Payer-specific customization'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_MA_002' AND tenant_id = sc.tenant_id)
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

SELECT 
  'MA-002 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_MA_002';

SELECT 
  'MA-002 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_MA_002';

-- =====================================================================================
-- END OF UC-MA-002 PART 1 SEED FILE
-- =====================================================================================

