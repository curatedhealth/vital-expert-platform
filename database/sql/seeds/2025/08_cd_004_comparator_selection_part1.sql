-- =====================================================================================
-- 08_cd_004_comparator_selection_part1.sql
-- UC_CD_004: Comparator Selection Strategy for DTx Clinical Trials
-- Part 1: Workflows and Tasks
-- =====================================================================================
-- Purpose: Seed workflows and tasks for comparator selection use case
-- Dependencies: Use case must exist, workflows and tasks tables must be created
-- Execution Order: 8 (after UC_CD_001, UC_CD_002)
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: TENANT LOOKUP & SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_tenant_slug TEXT := 'digital-health-startup';
BEGIN
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = v_tenant_slug;
  
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
-- SECTION 1: WORKFLOWS (3 Phases)
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
      'Phase 1: Requirements Analysis',
      'WFL-CD-004-001',
      'Analyze regulatory requirements, clinical context, and stakeholder input to define comparator selection criteria',
      1,
      jsonb_build_object(
        'duration_weeks', 2,
        'complexity', 'INTERMEDIATE',
        'deliverables', json_build_array(
          'Regulatory requirements summary',
          'Clinical context report',
          'Stakeholder feedback compilation'
        ),
        'key_activities', json_build_array(
          'Regulatory landscape review',
          'Clinical context assessment',
          'Stakeholder consultation'
        )
      )
    ),
    (
      'Phase 2: Options Evaluation',
      'WFL-CD-004-002',
      'Evaluate feasibility, risks, and comparative advantages of different comparator options (sham, TAU, active control)',
      2,
      jsonb_build_object(
        'duration_weeks', 2,
        'complexity', 'INTERMEDIATE',
        'deliverables', json_build_array(
          'Feasibility assessment report',
          'Risk matrix',
          'Comparative analysis dashboard'
        ),
        'key_activities', json_build_array(
          'Feasibility analysis',
          'Risk assessment',
          'Comparative analysis'
        )
      )
    ),
    (
      'Phase 3: Selection and Justification',
      'WFL-CD-004-003',
      'Apply decision framework, select optimal comparator, and develop comprehensive justification documentation',
      3,
      jsonb_build_object(
        'duration_weeks', 1,
        'complexity', 'INTERMEDIATE',
        'deliverables', json_build_array(
          'Comparator selection decision',
          'Comprehensive justification document',
          'Implementation roadmap'
        ),
        'key_activities', json_build_array(
          'Apply weighted scoring model',
          'Justification development',
          'Documentation preparation'
        )
      )
    )
) AS wf_data(name, unique_id, description, position, metadata)
WHERE uc.code = 'UC_CD_004' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: TASKS (10 Tasks across 3 phases)
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
    -- Phase 1: Requirements Analysis (3 tasks)
    (
      'Phase 1: Requirements Analysis',
      'TSK-CD-004-P1-01',
      'TSK-CD-004-P1-01',
      'Regulatory Precedent Analysis',
      'Analyze FDA/EMA precedent decisions for similar DTx products to identify acceptable comparator types and regulatory preferences',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 90,
        'deliverable', 'Regulatory requirements summary with precedent analysis',
        'key_databases', json_build_array('FDA Drugs@FDA', 'FDA 510(k)', 'EMA EudraCT'),
        'focus_areas', json_build_array('Comparator types accepted', 'Blinding requirements', 'Justification standards')
      )
    ),
    (
      'Phase 1: Requirements Analysis',
      'TSK-CD-004-P1-02',
      'TSK-CD-004-P1-02',
      'Clinical Context Assessment',
      'Evaluate standard of care, treatment guidelines, and clinical practice patterns to determine clinically appropriate comparator options',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 75,
        'deliverable', 'Clinical context report',
        'key_sources', json_build_array('Clinical guidelines', 'Real-world data', 'Treatment algorithms'),
        'assessment_areas', json_build_array('Standard of care', 'Treatment variations', 'Ethical considerations')
      )
    ),
    (
      'Phase 1: Requirements Analysis',
      'TSK-CD-004-P1-03',
      'TSK-CD-004-P1-03',
      'Stakeholder Input Collection',
      'Gather perspectives from clinical advisors, regulatory consultants, patient advocates, and payers on comparator preferences',
      3,
      jsonb_build_object(
        'complexity', 'BASIC',
        'estimated_duration_minutes', 60,
        'deliverable', 'Stakeholder feedback compilation',
        'stakeholders', json_build_array('Clinical advisors', 'Regulatory consultants', 'Patient advocates', 'Payer representatives'),
        'consultation_methods', json_build_array('Advisory board', 'Individual interviews', 'Surveys')
      )
    ),

    -- Phase 2: Options Evaluation (4 tasks)
    (
      'Phase 2: Options Evaluation',
      'TSK-CD-004-P2-01',
      'TSK-CD-004-P2-01',
      'Sham App Feasibility Analysis',
      'Assess technical feasibility, development timeline, and cost for creating a sham digital therapeutic application',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 90,
        'deliverable', 'Sham app feasibility report',
        'assessment_criteria', json_build_array('Technical complexity', 'Development cost', 'Timeline', 'Maintenance burden'),
        'sham_types', json_build_array('Full sham', 'Attention control', 'Minimal intervention')
      )
    ),
    (
      'Phase 2: Options Evaluation',
      'TSK-CD-004-P2-02',
      'TSK-CD-004-P2-02',
      'Active Control Evaluation',
      'Evaluate active comparator options including standard medications, therapies, or competitor DTx products',
      2,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 75,
        'deliverable', 'Active control evaluation report',
        'comparator_types', json_build_array('Pharmacotherapy', 'Behavioral therapy', 'Competitor DTx'),
        'evaluation_criteria', json_build_array('Clinical effectiveness', 'Cost', 'Availability', 'Sample size implications')
      )
    ),
    (
      'Phase 2: Options Evaluation',
      'TSK-CD-004-P2-03',
      'TSK-CD-004-P2-03',
      'Risk Assessment Matrix',
      'Develop comprehensive risk matrix covering regulatory, operational, scientific, ethical, and commercial risks',
      3,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 90,
        'deliverable', 'Risk assessment matrix with mitigation strategies',
        'risk_categories', json_build_array('Regulatory', 'Operational', 'Scientific', 'Ethical', 'Commercial', 'Technical'),
        'assessment_methodology', 'Likelihood x Impact scoring'
      )
    ),
    (
      'Phase 2: Options Evaluation',
      'TSK-CD-004-P2-04',
      'TSK-CD-004-P2-04',
      'Comparative Analysis Dashboard',
      'Create scoring matrix comparing all comparator options against weighted selection criteria',
      4,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 60,
        'deliverable', 'Comparative analysis dashboard with weighted scores',
        'criteria_categories', json_build_array('Regulatory acceptability', 'Scientific rigor', 'Operational feasibility', 'Cost', 'Timeline'),
        'analysis_methods', json_build_array('Weighted scoring', 'Sensitivity analysis', 'Scenario planning')
      )
    ),

    -- Phase 3: Selection and Justification (3 tasks)
    (
      'Phase 3: Selection and Justification',
      'TSK-CD-004-P3-01',
      'TSK-CD-004-P3-01',
      'Apply Decision Framework',
      'Use weighted scoring model and must-have criteria to select primary comparator and identify backup option',
      1,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 60,
        'deliverable', 'Comparator selection decision with scoring rationale',
        'decision_inputs', json_build_array('Weighted scores', 'Must-have criteria', 'Risk assessment', 'Stakeholder input'),
        'outputs', json_build_array('Primary comparator', 'Backup comparator', 'Rationale')
      )
    ),
    (
      'Phase 3: Selection and Justification',
      'TSK-CD-004-P3-02',
      'TSK-CD-004-P3-02',
      'Develop Justification Document',
      'Prepare comprehensive comparator justification addressing scientific rationale, regulatory alignment, and ethical considerations',
      2,
      jsonb_build_object(
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 120,
        'deliverable', 'Comprehensive justification document (15-20 pages)',
        'sections', json_build_array(
          'Scientific rationale',
          'Regulatory precedent',
          'Ethical justification',
          'Blinding strategy',
          'Risk mitigation',
          'Alternative considerations'
        ),
        'target_audiences', json_build_array('FDA reviewers', 'IRB/Ethics committee', 'Clinical investigators')
      )
    ),
    (
      'Phase 3: Selection and Justification',
      'TSK-CD-004-P3-03',
      'TSK-CD-004-P3-03',
      'Create Implementation Roadmap',
      'Develop detailed implementation plan including timeline, resources, responsibilities, and contingencies',
      3,
      jsonb_build_object(
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 75,
        'deliverable', 'Implementation roadmap with Gantt chart',
        'components', json_build_array(
          'Development timeline',
          'Resource allocation',
          'Responsibility matrix (RACI)',
          'Key milestones',
          'Risk mitigation plans',
          'Quality checkpoints'
        ),
        'planning_horizon', '12-16 weeks'
      )
    )
) AS task_data(
  workflow_name, code, unique_id, title, objective, position, extra
)
INNER JOIN dh_workflow wf ON wf.name = task_data.workflow_name 
  AND wf.use_case_id IN (SELECT id FROM dh_use_case WHERE code = 'UC_CD_004' AND tenant_id = sc.tenant_id)
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
  'UC-04 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_004';

-- Verify tasks
SELECT 
  'UC-04 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_CD_004';

-- Summary by workflow
SELECT 
  wf.name as workflow,
  wf.position,
  COUNT(t.id) as task_count
FROM dh_workflow wf
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code = 'UC_CD_004'
GROUP BY wf.name, wf.position
ORDER BY wf.position;

-- =====================================================================================
-- END OF UC-04 PART 1 SEED FILE
-- =====================================================================================

