-- =====================================================================================
-- 09_cd_003_rct_design_part1.sql
-- UC_CD_003: DTx RCT Design & Clinical Trial Strategy - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_003
-- Dependencies: Foundation data must exist (use case UC_CD_003)
-- Execution Order: 9a (before part 2)
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
      'Phase 1: Study Design Framework',
      'WFL-CD-003-001',
      'Define study objectives, hypotheses, and select appropriate trial design framework (superiority/non-inferiority)',
      1,
      jsonb_build_object(
        'duration_minutes', 80,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Study objectives specification',
          'Primary and secondary hypotheses',
          'Trial design framework selection',
          'Design rationale document'
        ),
        'key_activities', json_build_array(
          'Define study objectives',
          'Formulate hypotheses',
          'Select trial design type'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT')
      )
    ),
    (
      'Phase 2: Comparator & Population Design',
      'WFL-CD-003-002',
      'Design comparator and blinding strategy, develop inclusion/exclusion criteria for target population',
      2,
      jsonb_build_object(
        'duration_minutes', 105,
        'complexity', 'EXPERT',
        'deliverables', json_build_array(
          'Comparator and blinding strategy document',
          'Inclusion/exclusion criteria specification',
          'Sham app design requirements (if applicable)',
          'Population feasibility assessment'
        ),
        'key_activities', json_build_array(
          'Comparator selection and justification',
          'Blinding strategy design',
          'I/E criteria development',
          'Recruitment feasibility analysis'
        ),
        'primary_personas', json_build_array('P01_CMO', 'P05_REGAFF', 'P02_VPCLIN')
      )
    ),
    (
      'Phase 3: Intervention & Assessment Protocol',
      'WFL-CD-003-003',
      'Specify DTx intervention protocol including dosing/usage requirements and plan visit schedule with assessment timeline',
      3,
      jsonb_build_object(
        'duration_minutes', 85,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Intervention protocol specification',
          'DTx dosing and engagement criteria',
          'Visit schedule and assessment plan',
          'Data collection instruments list'
        ),
        'key_activities', json_build_array(
          'Define intervention protocol',
          'Specify minimum usage criteria',
          'Design visit schedule',
          'Select assessment tools'
        ),
        'primary_personas', json_build_array('P06_PMDIG', 'P12_CLINICAL_OPS', 'P02_VPCLIN')
      )
    ),
    (
      'Phase 4: Operational Planning',
      'WFL-CD-003-004',
      'Develop recruitment and retention strategies, outline statistical analysis plan and sample size considerations',
      4,
      jsonb_build_object(
        'duration_minutes', 90,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Recruitment strategy and timelines',
          'Retention strategy and dropout mitigation',
          'Statistical Analysis Plan overview',
          'Sample size calculation summary'
        ),
        'key_activities', json_build_array(
          'Recruitment strategy development',
          'Retention planning',
          'SAP overview',
          'Sample size estimation'
        ),
        'primary_personas', json_build_array('P12_CLINICAL_OPS', 'P12_CLINICAL_OPS', 'P04_BIOSTAT')
      )
    ),
    (
      'Phase 5: Regulatory & Ethics Planning',
      'WFL-CD-003-005',
      'Plan FDA/IRB interactions, document complete RCT design ready for protocol development',
      5,
      jsonb_build_object(
        'duration_minutes', 55,
        'complexity', 'ADVANCED',
        'deliverables', json_build_array(
          'Regulatory strategy document',
          'IRB submission plan',
          'Complete RCT Design Document',
          'Stakeholder presentation'
        ),
        'key_activities', json_build_array(
          'Regulatory strategy',
          'IRB planning',
          'Final design documentation',
          'Stakeholder review'
        ),
        'primary_personas', json_build_array('P05_REGAFF', 'P01_CMO')
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_003' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (10 Tasks across 5 phases)
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
    -- Phase 1: Study Design Framework (2 tasks)
    (
      'Phase 1: Study Design Framework',
      'TSK-CD-003-P1-01',
      'TSK-CD-003-P1-01',
      'Define Study Objectives & Hypotheses',
      'Establish clear primary and secondary objectives with testable hypotheses aligned with endpoints from UC_CD_001',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Study objectives specification with primary and secondary hypotheses',
        'key_outputs', json_build_array(
          'Primary objective statement',
          'Secondary objectives list',
          'Null and alternative hypotheses',
          'Success criteria definition'
        ),
        'required_inputs', json_build_array('Endpoint strategy from UC_CD_001', 'Clinical indication', 'Target population')
      )
    ),
    (
      'Phase 1: Study Design Framework',
      'TSK-CD-003-P1-02',
      'TSK-CD-003-P1-02',
      'Select Trial Design Framework',
      'Determine appropriate trial design type (superiority/non-inferiority/equivalence) with regulatory and scientific rationale',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 40,
        'deliverable', 'Trial design framework selection with justification',
        'design_options', json_build_array('Superiority', 'Non-inferiority', 'Equivalence'),
        'key_considerations', json_build_array(
          'Regulatory precedent',
          'Clinical standard of care',
          'Commercial positioning',
          'Sample size implications'
        )
      )
    ),

    -- Phase 2: Comparator & Population Design (2 tasks)
    (
      'Phase 2: Comparator & Population Design',
      'TSK-CD-003-P2-01',
      'TSK-CD-003-P2-01',
      'Design Comparator & Blinding Strategy',
      'Select comparator type (sham/TAU/active control/waitlist) and develop blinding/allocation strategy for FDA acceptability',
      1,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 45,
        'deliverable', 'Comparator and blinding strategy document',
        'comparator_options', json_build_array('Sham app', 'Treatment as usual', 'Active control', 'Waitlist'),
        'blinding_levels', json_build_array('Single-blind', 'Double-blind', 'Triple-blind', 'Open-label'),
        'key_outputs', json_build_array(
          'Comparator selection rationale',
          'Blinding strategy specification',
          'Sham app requirements (if applicable)',
          'Allocation concealment method'
        )
      )
    ),
    (
      'Phase 2: Comparator & Population Design',
      'TSK-CD-003-P2-02',
      'TSK-CD-003-P2-02',
      'Develop Inclusion/Exclusion Criteria',
      'Define eligibility criteria balancing scientific rigor with recruitment feasibility and generalizability',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 50,
        'deliverable', 'Inclusion/exclusion criteria specification with feasibility analysis',
        'key_criteria_categories', json_build_array(
          'Disease severity/stage',
          'Comorbidities',
          'Concomitant medications',
          'Technology access',
          'Cognitive/language requirements'
        ),
        'feasibility_factors', json_build_array(
          'Eligible patient population size',
          'Recruitment timeline impact',
          'Site screening burden'
        )
      )
    ),

    -- Phase 3: Intervention & Assessment Protocol (2 tasks)
    (
      'Phase 3: Intervention & Assessment Protocol',
      'TSK-CD-003-P3-01',
      'TSK-CD-003-P3-01',
      'Specify Intervention Protocol & Dosing',
      'Define DTx intervention protocol including minimum usage requirements, feature specifications, and adherence monitoring',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 40,
        'deliverable', 'Intervention protocol specification document',
        'protocol_components', json_build_array(
          'Minimum usage criteria (dose)',
          'Feature access permissions',
          'Intervention fidelity monitoring',
          'Adherence definition and tracking'
        ),
        'key_questions', json_build_array(
          'What constitutes adequate exposure?',
          'How will usage be monitored?',
          'What happens with low adherence?'
        )
      )
    ),
    (
      'Phase 3: Intervention & Assessment Protocol',
      'TSK-CD-003-P3-02',
      'TSK-CD-003-P3-02',
      'Design Visit Schedule & Assessment Plan',
      'Plan visit schedule and assessment timeline minimizing patient burden while capturing necessary endpoints',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 35,
        'deliverable', 'Visit schedule and assessment plan',
        'visit_types', json_build_array('Screening', 'Baseline', 'Treatment visits', 'End of treatment', 'Follow-up'),
        'assessment_types', json_build_array('Primary endpoints', 'Secondary endpoints', 'Safety assessments', 'Adherence metrics'),
        'burden_considerations', json_build_array(
          'Assessment time per visit',
          'Visit frequency',
          'Home vs clinic visits',
          'Digital data capture'
        )
      )
    ),

    -- Phase 4: Operational Planning (2 tasks)
    (
      'Phase 4: Operational Planning',
      'TSK-CD-003-P4-01',
      'TSK-CD-003-P4-01',
      'Develop Recruitment & Retention Strategy',
      'Create comprehensive recruitment strategy and retention plan to achieve target enrollment with acceptable dropout rates',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 40,
        'deliverable', 'Recruitment and retention strategy document',
        'recruitment_channels', json_build_array(
          'Clinical sites',
          'Digital advertising',
          'Patient registries',
          'Referral networks'
        ),
        'retention_tactics', json_build_array(
          'Participant incentives',
          'Communication strategy',
          'Burden reduction',
          'Engagement monitoring'
        ),
        'key_metrics', json_build_array('Enrollment rate', 'Screen failure rate', 'Dropout rate', 'Protocol completion rate')
      )
    ),
    (
      'Phase 4: Operational Planning',
      'TSK-CD-003-P4-02',
      'TSK-CD-003-P4-02',
      'Outline Statistical Analysis Plan',
      'Develop SAP overview including primary analysis method, handling of missing data, and sensitivity analyses',
      2,
      jsonb_build_object(
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 45,
        'deliverable', 'Statistical Analysis Plan overview',
        'sap_components', json_build_array(
          'Primary analysis method',
          'Sample size calculation',
          'Missing data handling',
          'Sensitivity analyses',
          'Subgroup analyses',
          'Interim analysis plan'
        ),
        'analysis_populations', json_build_array('ITT', 'Per-protocol', 'mITT', 'Safety')
      )
    ),

    -- Phase 5: Regulatory & Ethics Planning (2 tasks)
    (
      'Phase 5: Regulatory & Ethics Planning',
      'TSK-CD-003-P5-01',
      'TSK-CD-003-P5-01',
      'Plan Regulatory & Ethical Strategy',
      'Develop FDA Pre-Sub strategy and IRB submission plan ensuring design meets regulatory and ethical requirements',
      1,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 30,
        'deliverable', 'Regulatory strategy and IRB submission plan',
        'regulatory_activities', json_build_array(
          'FDA Pre-Submission meeting',
          'IDE determination',
          'IND requirements assessment'
        ),
        'irb_requirements', json_build_array(
          'Informed consent',
          'Risk assessment',
          'Data safety monitoring plan',
          'Adverse event reporting'
        )
      )
    ),
    (
      'Phase 5: Regulatory & Ethics Planning',
      'TSK-CD-003-P5-02',
      'TSK-CD-003-P5-02',
      'Finalize RCT Design Documentation',
      'Compile complete RCT Design Document synthesizing all design elements and prepare stakeholder presentation',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 25,
        'deliverable', 'Complete RCT Design Document (30-40 pages) and stakeholder presentation',
        'document_sections', json_build_array(
          'Executive summary',
          'Study objectives and design',
          'Population and comparator',
          'Intervention protocol',
          'Assessments and endpoints',
          'Statistical considerations',
          'Operational plan',
          'Regulatory strategy'
        ),
        'presentation_audiences', json_build_array('Executive team', 'Board of directors', 'Investors', 'FDA (if Pre-Sub)')
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_003' AND tenant_id = sc.tenant_id)
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
  'UC-03 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Verify tasks
SELECT 
  'UC-03 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_003';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_003'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-03 PART 1 SEED FILE
-- =====================================================================================

