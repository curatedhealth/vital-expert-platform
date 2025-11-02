-- =====================================================================================
-- 10_cd_006_adaptive_trial_design_part1.sql
-- UC_CD_006: DTx Adaptive Trial Design - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_006
-- Dependencies: Foundation data must exist (use case UC_CD_006)
-- Execution Order: 10a (before part 2)
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
-- SECTION 1: WORKFLOWS (6 Phases)
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
      'Phase 1: Strategy & Rationale',
      'WFL-CD-006-001',
      'Identify adaptive design opportunity and develop strategic rationale for why adaptive design adds value',
      1,
      jsonb_build_object(
        'duration_minutes', 30,
        'complexity', 'INTERMEDIATE',
        'deliverables', json_build_array(
          'Adaptation opportunity assessment',
          'Strategic rationale document',
          'Design type recommendation'
        ),
        'key_activities', json_build_array(
          'Identify uncertainty sources',
          'Assess ROI potential',
          'Develop strategic rationale'
        ),
        'primary_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT')
      )
    ),
    (
      'Phase 2: Design Specification',
      'WFL-CD-006-002',
      'Define precise adaptation rules, interim analysis timing, and decision boundaries',
      2,
      jsonb_build_object(
        'duration_minutes', 45,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Adaptation rules specification',
          'Interim analysis plan',
          'Decision boundaries document'
        ),
        'key_activities', json_build_array(
          'Define adaptation rules',
          'Specify interim analyses timing',
          'Set statistical boundaries'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT')
      )
    ),
    (
      'Phase 3: Statistical Validation',
      'WFL-CD-006-003',
      'Design and conduct simulation studies to validate operating characteristics (Type I error, power, sample size)',
      3,
      jsonb_build_object(
        'duration_minutes', 60,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Simulation study design',
          'Simulation results report',
          'Operating characteristics summary'
        ),
        'key_activities', json_build_array(
          'Design simulation scenarios',
          'Run Monte Carlo simulations',
          'Analyze operating characteristics'
        ),
        'primary_personas', json_build_array('P04_BIOSTAT', 'P09_DATASCIENCE')
      )
    ),
    (
      'Phase 4: Governance & Oversight',
      'WFL-CD-006-004',
      'Establish DSMB governance structure, charter, and communication protocols',
      4,
      jsonb_build_object(
        'duration_minutes', 40,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'DSMB charter',
          'DSMB membership plan',
          'Communication protocol'
        ),
        'key_activities', json_build_array(
          'Draft DSMB charter',
          'Define DSMB composition',
          'Plan communication firewall'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P04_BIOSTAT')
      )
    ),
    (
      'Phase 5: Regulatory Strategy',
      'WFL-CD-006-005',
      'Develop FDA interaction strategy and prepare regulatory documentation for adaptive design',
      5,
      jsonb_build_object(
        'duration_minutes', 35,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'FDA guidance review summary',
          'Pre-submission meeting plan',
          'Protocol adaptive design section'
        ),
        'key_activities', json_build_array(
          'Review FDA adaptive guidance',
          'Plan FDA pre-sub meeting',
          'Draft protocol section'
        ),
        'primary_personas', json_build_array('P05_REGAFF')
      )
    ),
    (
      'Phase 6: Feasibility & SAP',
      'WFL-CD-006-006',
      'Assess operational feasibility and complete Statistical Analysis Plan with adaptive design specifications',
      6,
      jsonb_build_object(
        'duration_minutes', 75,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Operational feasibility assessment',
          'IVRS/IWRS requirements',
          'Complete SAP with adaptive design section'
        ),
        'key_activities', json_build_array(
          'Assess operational feasibility',
          'Define IVRS modifications',
          'Complete SAP'
        ),
        'primary_personas', json_build_array('P02_VPCLIN', 'P04_BIOSTAT')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_006' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (13 Tasks across 6 phases)
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
    -- Phase 1: Strategy & Rationale (2 tasks)
    (
      'Phase 1: Strategy & Rationale',
      'TSK-CD-006-P1-01',
      'TSK-CD-006-P1-01',
      'Identify Adaptation Opportunity',
      'Assess sources of uncertainty and potential for adaptive design to add value in reducing cost, time, or improving decision-making',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 15,
        'deliverable', 'Adaptation opportunity assessment',
        'key_questions', json_build_array(
          'What are the key uncertainties (effect size, variance, dose)?',
          'How large is the trial (N>200)?',
          'Do we have limited historical data?',
          'Could early stopping save significant resources?'
        ),
        'decision_criteria', json_build_array(
          'Uncertainty level',
          'Trial size and cost',
          'Timeline flexibility',
          'Statistical expertise available'
        )
      )
    ),
    (
      'Phase 1: Strategy & Rationale',
      'TSK-CD-006-P1-02',
      'TSK-CD-006-P1-02',
      'Develop Strategic Rationale',
      'Articulate clear rationale for adaptive design including expected benefits, risks, and ROI analysis',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 15,
        'deliverable', 'Strategic rationale document with ROI analysis',
        'rationale_components', json_build_array(
          'Expected sample size savings',
          'Probability of early stopping',
          'Timeline impact',
          'Cost-benefit analysis',
          'Risk mitigation benefits'
        )
      )
    ),

    -- Phase 2: Design Specification (2 tasks)
    (
      'Phase 2: Design Specification',
      'TSK-CD-006-P2-01',
      'TSK-CD-006-P2-01',
      'Define Adaptation Rules',
      'Specify precise rules for how trial will adapt based on interim data (sample size re-estimation, early stopping, dose selection)',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 25,
        'deliverable', 'Adaptation rules specification document',
        'adaptation_types', json_build_array(
          'Sample size re-estimation',
          'Early efficacy stopping',
          'Futility stopping',
          'Dose/arm selection',
          'Population enrichment'
        ),
        'key_specifications', json_build_array(
          'Trigger conditions',
          'Decision algorithm',
          'Constraints and limits',
          'Blinding preservation'
        )
      )
    ),
    (
      'Phase 2: Design Specification',
      'TSK-CD-006-P2-02',
      'TSK-CD-006-P2-02',
      'Specify Interim Analyses',
      'Define timing of interim analyses, statistical boundaries (O''Brien-Fleming, Pocock), and alpha spending function',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 20,
        'deliverable', 'Interim analysis plan with statistical boundaries',
        'boundary_types', json_build_array(
          'O''Brien-Fleming (conservative early, liberal late)',
          'Pocock (constant boundaries)',
          'Haybittle-Peto (very conservative)',
          'Custom alpha spending function'
        ),
        'key_decisions', json_build_array(
          'Number of interim analyses',
          'Information fraction timing',
          'One-sided vs two-sided',
          'Futility boundaries'
        )
      )
    ),

    -- Phase 3: Statistical Validation (3 tasks)
    (
      'Phase 3: Statistical Validation',
      'TSK-CD-006-P3-01',
      'TSK-CD-006-P3-01',
      'Design Simulation Study',
      'Create simulation study plan covering all relevant scenarios to validate operating characteristics',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 20,
        'deliverable', 'Simulation study design document',
        'simulation_scenarios', json_build_array(
          'Null hypothesis (H0)',
          'Alternative hypothesis (H1)',
          'Intermediate effect sizes',
          'Variable variance scenarios',
          'Different sample sizes'
        ),
        'parameters_to_vary', json_build_array(
          'True effect size (d = 0, 0.3, 0.5, 0.7)',
          'Standard deviation (σ = baseline, 1.2×, 1.5×)',
          'Sample size per arm',
          'Dropout rate'
        )
      )
    ),
    (
      'Phase 3: Statistical Validation',
      'TSK-CD-006-P3-02',
      'TSK-CD-006-P3-02',
      'Conduct Simulations',
      'Run Monte Carlo simulations (5,000-10,000 iterations) to generate operating characteristic estimates',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 25,
        'deliverable', 'Simulation results with confidence intervals',
        'technical_requirements', json_build_array(
          'Simulation software (R gsDesign/rpact, SAS PROC SEQDESIGN)',
          'Random seed setting for reproducibility',
          'Parallel computing for speed',
          'QC independent validation'
        ),
        'outputs_per_scenario', json_build_array(
          'Type I error rate',
          'Power at H1',
          'Expected N',
          'Probability early stop',
          'Average study duration'
        )
      )
    ),
    (
      'Phase 3: Statistical Validation',
      'TSK-CD-006-P3-03',
      'TSK-CD-006-P3-03',
      'Analyze Operating Characteristics',
      'Summarize simulation results to confirm Type I error ≤0.05, power ≥80%, and expected sample size reduction',
      3,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 15,
        'deliverable', 'Operating characteristics summary report',
        'key_metrics', json_build_array(
          'Type I error: α ≤ 0.05',
          'Power at H1: ≥ 80%',
          'Expected N: 15-40% reduction',
          'Prob early stop efficacy: 15-25%',
          'Prob early stop futility: 30-40%'
        ),
        'validation_criteria', json_build_array(
          'Type I error controlled',
          'Power maintained or improved',
          'Expected savings demonstrated'
        )
      )
    ),

    -- Phase 4: Governance & Oversight (2 tasks)
    (
      'Phase 4: Governance & Oversight',
      'TSK-CD-006-P4-01',
      'TSK-CD-006-P4-01',
      'Draft DSMB Charter',
      'Create comprehensive DSMB charter defining membership, responsibilities, meeting schedule, and decision authority',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25,
        'deliverable', 'DSMB charter document',
        'charter_sections', json_build_array(
          'DSMB purpose and authority',
          'Membership composition (clinical, statistical, ethics)',
          'Meeting schedule (frequency, timing)',
          'Review materials and reports',
          'Decision-making process',
          'Communication protocols',
          'Confidentiality and firewall'
        ),
        'typical_membership', json_build_array(
          '3-5 independent experts',
          'At least 1 biostatistician',
          'Clinical experts in indication',
          'Optional ethicist'
        )
      )
    ),
    (
      'Phase 4: Governance & Oversight',
      'TSK-CD-006-P4-02',
      'TSK-CD-006-P4-02',
      'Plan Communication Protocols',
      'Define firewall procedures ensuring unblinded interim results remain with DSMB only and blinded team receives only go/no-go decisions',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 15,
        'deliverable', 'Communication protocol and firewall procedures',
        'firewall_components', json_build_array(
          'Unblinded team: DSMB + DSMB statistician only',
          'Blinded team: Sponsor, investigators, CRO',
          'Communication content: Go/no-go only',
          'Data access controls',
          'Document version control'
        ),
        'key_principles', json_build_array(
          'Preserve study integrity',
          'Minimize operational bias',
          'Maintain blinding',
          'Clear decision pathways'
        )
      )
    ),

    -- Phase 5: Regulatory Strategy (2 tasks)
    (
      'Phase 5: Regulatory Strategy',
      'TSK-CD-006-P5-01',
      'TSK-CD-006-P5-01',
      'Review FDA Adaptive Design Guidance',
      'Study FDA 2019 guidance on adaptive designs for clinical trials and align design with regulatory expectations',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 15,
        'deliverable', 'FDA guidance review summary with compliance checklist',
        'key_fda_guidance', json_build_array(
          'Adaptive Designs for Clinical Trials (2019)',
          'Master Protocols guidance (2018)',
          'Multiple Endpoints guidance',
          'Digital Health guidance (2022)'
        ),
        'fda_expectations', json_build_array(
          'Pre-specification in protocol',
          'Type I error control',
          'Operating characteristics documented',
          'DSMB charter included',
          'Pre-submission meeting recommended'
        )
      )
    ),
    (
      'Phase 5: Regulatory Strategy',
      'TSK-CD-006-P5-02',
      'TSK-CD-006-P5-02',
      'Draft Protocol Section',
      'Write comprehensive adaptive design section for clinical trial protocol meeting FDA submission standards',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 20,
        'deliverable', 'Protocol adaptive design section (8-12 pages)',
        'protocol_sections', json_build_array(
          'Rationale for adaptive design',
          'Type of adaptations permitted',
          'Interim analysis timing',
          'Statistical boundaries and alpha spending',
          'Decision rules and algorithms',
          'DSMB charter reference',
          'Type I error control',
          'Simulation results summary'
        )
      )
    ),

    -- Phase 6: Feasibility & SAP (2 tasks)
    (
      'Phase 6: Feasibility & SAP',
      'TSK-CD-006-P6-01',
      'TSK-CD-006-P6-01',
      'Assess Operational Feasibility',
      'Evaluate operational requirements for adaptive design including IVRS modifications, data management, and site communication',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Operational feasibility assessment with implementation plan',
        'feasibility_areas', json_build_array(
          'IVRS/IWRS capability for sample size changes',
          'Data management interim cut timing',
          'Site communication and training',
          'Budget flexibility for variable N',
          'Timeline contingency planning'
        ),
        'critical_requirements', json_build_array(
          'IVRS vendor supports adaptive designs',
          'EDC can handle interim data cuts',
          'Sites comfortable with blinded adaptations',
          'Budget has 20-40% contingency'
        )
      )
    ),
    (
      'Phase 6: Feasibility & SAP',
      'TSK-CD-006-P6-02',
      'TSK-CD-006-P6-02',
      'Complete Statistical Analysis Plan',
      'Finalize comprehensive SAP including detailed adaptive design specifications, simulation results, and analysis procedures',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 45,
        'deliverable', 'Complete SAP with adaptive design section (40-60 pages total)',
        'sap_adaptive_sections', json_build_array(
          'Adaptive design overview',
          'Interim analysis procedures',
          'Statistical boundaries and alpha spending',
          'Decision rules and stopping criteria',
          'Sample size re-estimation method',
          'Final analysis accounting for adaptations',
          'Sensitivity analyses',
          'Simulation study results appendix'
        ),
        'key_considerations', json_build_array(
          'Pre-specify all analyses before interim looks',
          'Document all decision algorithms',
          'Include code for reproducibility',
          'QC all statistical procedures'
        )
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_006' AND tenant_id = sc.tenant_id)
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
  'UC-06 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Verify tasks
SELECT 
  'UC-06 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_006';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_006'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-06 PART 1 SEED FILE
-- =====================================================================================

