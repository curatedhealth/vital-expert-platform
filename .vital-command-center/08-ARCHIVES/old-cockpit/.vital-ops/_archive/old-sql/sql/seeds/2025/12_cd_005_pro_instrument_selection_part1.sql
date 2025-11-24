-- =====================================================================================
-- 12_cd_005_pro_instrument_selection_part1.sql
-- UC_CD_005: Patient-Reported Outcome (PRO) Instrument Selection - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_005
-- Dependencies: Foundation data must exist (use case UC_CD_005)
-- Execution Order: 12a (before part 2)
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
-- SECTION 1: WORKFLOWS (1 Workflow with 8 Tasks)
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
      'PRO Instrument Selection Workflow',
      'WFL-CD-005-001',
      'Complete workflow for selecting validated Patient-Reported Outcome (PRO) instruments for DTx clinical trials',
      1,
      jsonb_build_object(
        'duration_minutes', 180,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Clinical construct definition',
          'PRO literature review',
          'Psychometric comparison table',
          'FDA compliance assessment',
          'Digital feasibility analysis',
          'Patient burden evaluation',
          'PRO selection justification',
          'Licensing strategy'
        ),
        'key_activities', json_build_array(
          'Define clinical construct',
          'Search PRO literature',
          'Evaluate psychometrics',
          'Assess FDA compliance',
          'Check digital feasibility',
          'Evaluate patient burden',
          'Make final selection',
          'Plan licensing'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT', 'P05_REGAFF')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_005' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (8 Tasks)
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
    -- Step 1: Define Clinical Construct
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-01',
      'TSK-CD-005-01',
      'Define Clinical Construct',
      'Clearly define the clinical construct (symptom, function, quality of life) that the PRO must measure, ensuring alignment with treatment mechanism and patient experience',
      1,
      jsonb_build_object(
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20,
        'deliverable', 'Clinical construct definition document',
        'key_questions', json_build_array(
          'What symptom or function does DTx aim to improve?',
          'What do patients care about most?',
          'What is the mechanism of therapeutic effect?',
          'What timeframe are we measuring (acute vs chronic)?'
        ),
        'success_criteria', json_build_array(
          'Clear construct definition',
          'Patient perspective included',
          'Clinically meaningful'
        )
      )
    ),

    -- Step 2: Literature Search for Existing PROs
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-02',
      'TSK-CD-005-02',
      'PRO Literature Search',
      'Conduct systematic literature search to identify all validated PRO instruments measuring the target construct in similar populations',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 45,
        'deliverable', 'PRO candidate list with 5-7 instruments',
        'search_databases', json_build_array(
          'PubMed/MEDLINE',
          'PROQOLID database',
          'ePROVIDE',
          'PROMIS Item Banks',
          'FDA PRO labeling database'
        ),
        'search_terms', json_build_array(
          'PRO + indication',
          'Patient-reported outcome + disease',
          'Questionnaire + symptom',
          'Scale + assessment'
        )
      )
    ),

    -- Step 3: Evaluate Psychometric Properties
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-03',
      'TSK-CD-005-03',
      'Evaluate Psychometric Properties',
      'Compare psychometric properties (reliability, validity, responsiveness, MCID) of candidate PRO instruments',
      3,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Psychometric comparison table',
        'key_metrics', json_build_array(
          'Internal consistency (Cronbach alpha >0.80)',
          'Test-retest reliability (ICC >0.70)',
          'Construct validity (correlation with similar measures)',
          'Known-groups validity (discriminates disease severity)',
          'Responsiveness (detects change with treatment)',
          'MCID established (clinically meaningful threshold)',
          'Floor/ceiling effects (<15%)'
        )
      )
    ),

    -- Step 4: Assess FDA Regulatory Compliance
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-04',
      'TSK-CD-005-04',
      'Assess FDA Compliance',
      'Evaluate regulatory acceptability based on FDA PRO Guidance (2009) and precedent use in FDA submissions',
      4,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'FDA compliance assessment report',
        'fda_criteria', json_build_array(
          'Content validity (measures what patients care about)',
          'Psychometric validation in target population',
          'Prior FDA acceptance in similar indications',
          'No modifications from validated version',
          'Appropriate recall period',
          'Response options appropriate'
        ),
        'precedent_search', json_build_array(
          'FDA Drugs@FDA label search',
          'Clinical trial registry (endpoints used)',
          'FDA PRO guidance examples'
        )
      )
    ),

    -- Step 5: Evaluate Digital Feasibility
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-05',
      'TSK-CD-005-05',
      'Evaluate Digital Feasibility',
      'Assess technical feasibility of implementing PRO as ePRO in DTx platform, including validation requirements',
      5,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 25,
        'deliverable', 'ePRO implementation feasibility report',
        'technical_considerations', json_build_array(
          'ePRO validation exists vs migration study needed',
          'Display format (single page vs multi-page)',
          'Skip logic and branching',
          'Scoring algorithm complexity',
          'Data quality checks',
          'Device compatibility (smartphone/tablet/web)'
        ),
        'licensing_considerations', json_build_array(
          'Open source vs proprietary',
          'Licensing fees',
          'Usage restrictions'
        )
      )
    ),

    -- Step 6: Assess Patient Burden
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-06',
      'TSK-CD-005-06',
      'Assess Patient Burden',
      'Evaluate patient burden (completion time, cognitive load, frequency) and patient preferences based on pilot data or patient advisory input',
      6,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'deliverable', 'Patient burden and acceptability report',
        'burden_factors', json_build_array(
          'Completion time (target <10 minutes)',
          'Number of items',
          'Reading level (target 6th grade)',
          'Cognitive demand',
          'Emotional sensitivity',
          'Frequency of administration (daily/weekly/monthly)'
        ),
        'patient_input_methods', json_build_array(
          'Patient advisory board feedback',
          'Pilot study completion rates',
          'Qualitative interviews',
          'Patient preference studies'
        )
      )
    ),

    -- Step 7: Make Final Selection Decision
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-07',
      'TSK-CD-005-07',
      'Final PRO Selection Decision',
      'Synthesize all evaluation criteria and make final PRO selection decision with comprehensive justification',
      7,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 30,
        'deliverable', 'PRO selection justification document (5-10 pages)',
        'decision_framework', json_build_array(
          'Weighted scoring matrix',
          'FDA acceptability (weight: 30%)',
          'Psychometric quality (weight: 25%)',
          'Clinical meaningfulness (weight: 20%)',
          'Patient burden (weight: 15%)',
          'Digital feasibility (weight: 10%)'
        ),
        'justification_sections', json_build_array(
          'Selected PRO and rationale',
          'Alternative PROs considered',
          'Trade-offs and limitations',
          'Risk mitigation plan',
          'Implementation plan'
        )
      )
    ),

    -- Step 8: Plan Licensing & IP Strategy
    (
      'PRO Instrument Selection Workflow',
      'TSK-CD-005-08',
      'TSK-CD-005-08',
      'Plan Licensing & IP Strategy',
      'Develop licensing agreement strategy, cost structure, and intellectual property considerations for PRO usage',
      8,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20,
        'deliverable', 'PRO licensing strategy document',
        'licensing_components', json_build_array(
          'Copyright holder identification',
          'License type (academic, commercial, trial-specific)',
          'Fees structure (one-time vs per-patient)',
          'Geographic scope',
          'Translation rights',
          'Modification restrictions',
          'Publication rights'
        ),
        'cost_considerations', json_build_array(
          'License acquisition fees',
          'Per-use fees in clinical trial',
          'Commercial use fees (if applicable)',
          'Translation costs',
          'ePRO platform integration fees'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_005' AND tenant_id = sc.tenant_id)
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
  'UC-05 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_005';

-- Verify tasks
SELECT 
  'UC-05 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_005';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_005'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-05 PART 1 SEED FILE
-- =====================================================================================

