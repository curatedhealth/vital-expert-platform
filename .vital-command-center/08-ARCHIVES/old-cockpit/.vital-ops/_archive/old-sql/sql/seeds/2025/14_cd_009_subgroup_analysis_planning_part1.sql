-- =====================================================================================
-- 14_cd_009_subgroup_analysis_planning_part1.sql
-- UC_CD_009: Subgroup Analysis Planning - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_009
-- Dependencies: Foundation data must exist (use case UC_CD_009)
-- Execution Order: 14a (before part 2)
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
-- SECTION 1: WORKFLOWS (1 Workflow with 5 Tasks)
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
      'Subgroup Analysis Planning Workflow',
      'WFL-CD-009-001',
      'Complete workflow for planning pre-specified subgroup analyses in DTx clinical trials',
      1,
      jsonb_build_object(
        'duration_minutes', 150,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Pre-specified subgroup list with rationale',
          'Subgroup interaction testing plan',
          'Statistical power analysis for subgroups',
          'SAP section on subgroup analysis',
          'Interpretation framework and decision rules'
        ),
        'key_activities', json_build_array(
          'Identify candidate subgroups',
          'Define interaction testing approach',
          'Calculate subgroup power',
          'Create analysis plan',
          'Define interpretation rules'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P04_BIOSTAT', 'P05_REGAFF'),
        'fda_guidance', json_build_array('ICH E9', 'ICH E5', 'FDA Complex Trial Designs 2021')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_009' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (5 Tasks)
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
    -- Step 1: Identify Candidate Subgroups
    (
      'Subgroup Analysis Planning Workflow',
      'TSK-CD-009-01',
      'TSK-CD-009-01',
      'Identify Candidate Subgroups',
      'Identify all scientifically plausible patient subgroups based on baseline characteristics that may modify treatment effect',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30,
        'deliverable', 'Candidate subgroup list (8-15 subgroups)',
        'subgroup_categories', json_build_array(
          'Demographics (age, sex, race/ethnicity)',
          'Disease severity (mild/moderate/severe)',
          'Comorbidities (depression, anxiety, substance use)',
          'Prior treatment history (treatment-naive vs experienced)',
          'Genetic/biomarker (if applicable)',
          'Baseline digital engagement (high/low app users)',
          'Socioeconomic factors (insurance, education)'
        ),
        'rationale_required', json_build_array(
          'Biological plausibility',
          'Clinical relevance',
          'Payer/commercial importance',
          'FDA regulatory precedent'
        )
      )
    ),

    -- Step 2: Define Interaction Testing Approach
    (
      'Subgroup Analysis Planning Workflow',
      'TSK-CD-009-02',
      'TSK-CD-009-02',
      'Define Interaction Testing',
      'Design statistical tests for treatment-by-subgroup interactions and establish criteria for claiming subgroup-specific effects',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 35,
        'deliverable', 'Interaction testing methodology',
        'statistical_approaches', json_build_array(
          'Continuous subgroup: Regression interaction term',
          'Binary subgroup: Stratified analysis with Breslow-Day test',
          'Ordinal subgroup: Test for trend',
          'Multiple subgroups: Forest plot with interaction p-values'
        ),
        'interpretation_rules', json_build_array(
          'Interaction p<0.10 (exploratory threshold)',
          'Interaction p<0.05 (confirmatory threshold)',
          'Consistency across multiple endpoints',
          'Biological plausibility'
        ),
        'multiplicity_control', json_build_array(
          'No adjustment (exploratory analyses)',
          'Bonferroni correction (conservative)',
          'Hierarchical testing (if key subgroup)'
        )
      )
    ),

    -- Step 3: Calculate Subgroup-Specific Power
    (
      'Subgroup Analysis Planning Workflow',
      'TSK-CD-009-03',
      'TSK-CD-009-03',
      'Calculate Subgroup Power',
      'Estimate statistical power to detect treatment effects within key subgroups and interaction effects',
      3,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Subgroup power analysis table',
        'power_calculations', json_build_array(
          'Within-subgroup effect size',
          'Sample size per subgroup',
          'Power for interaction test',
          'Detectable effect size difference'
        ),
        'typical_outcomes', json_build_array(
          'Adequate power (≥80%) for key subgroups',
          'Moderate power (60-79%) for exploratory subgroups',
          'Low power (<60%) acknowledged as limitation'
        ),
        'interpretation', 'Most trials are underpowered for subgroup interactions; set realistic expectations'
      )
    ),

    -- Step 4: Create Statistical Analysis Plan Section
    (
      'Subgroup Analysis Planning Workflow',
      'TSK-CD-009-04',
      'TSK-CD-009-04',
      'Create SAP Section',
      'Draft Statistical Analysis Plan section documenting all pre-specified subgroup analyses, methods, and interpretation rules',
      4,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 35,
        'deliverable', 'SAP Section: Subgroup Analyses (5-8 pages)',
        'sap_sections', json_build_array(
          'List of pre-specified subgroups',
          'Scientific rationale for each',
          'Statistical methodology',
          'Interaction testing approach',
          'Multiplicity considerations',
          'Interpretation framework',
          'Forest plot specifications',
          'Reporting standards'
        ),
        'regulatory_alignment', json_build_array(
          'ICH E9 compliant',
          'FDA acceptable methodology',
          'Protocol consistency'
        )
      )
    ),

    -- Step 5: Define Interpretation Framework & Decision Rules
    (
      'Subgroup Analysis Planning Workflow',
      'TSK-CD-009-05',
      'TSK-CD-009-05',
      'Define Interpretation Framework',
      'Establish decision rules for interpreting subgroup results and criteria for pursuing subgroup-specific labeling claims',
      5,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 20,
        'deliverable', 'Subgroup interpretation framework and decision matrix',
        'decision_criteria', json_build_array(
          'Statistical significance of interaction',
          'Clinical meaningfulness of effect size difference',
          'Consistency across endpoints',
          'Biological plausibility',
          'Subgroup size and commercial relevance'
        ),
        'interpretation_scenarios', json_build_array(
          'Strong interaction → Pursue subgroup-specific claim',
          'Suggestive interaction → Exploratory labeling language',
          'No interaction → Overall population claim',
          'Reverse interaction → Safety concern, avoid subgroup'
        ),
        'regulatory_strategy', json_build_array(
          'FDA Pre-Submission discussion if key subgroup',
          'Labeling language options',
          'Post-approval study plans'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_009' AND tenant_id = sc.tenant_id)
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
  'UC-09 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_009';

-- Verify tasks
SELECT 
  'UC-09 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_009';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_009'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-09 PART 1 SEED FILE
-- =====================================================================================

