-- =====================================================================================
-- 06_cd_001_endpoint_selection.sql (CLEAN VERSION)
-- UC-01: DTx Clinical Endpoint Selection & Validation
-- =====================================================================================
-- This is a CLEAN version with correct schema alignment
-- All workflows have unique_id manually specified
-- All tasks have unique_id matching their code
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: SESSION CONFIGURATION
-- =====================================================================================

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
  description,
  position,
  unique_id,
  metadata
)
SELECT
  sc.tenant_id,
  uc.id as use_case_id,
  wf_data.name,
  wf_data.description,
  wf_data.position,
  wf_data.unique_id,
  wf_data.metadata
FROM session_config sc
CROSS JOIN dh_use_case uc
CROSS JOIN (
  VALUES
    -- Phase 1
    (
      'Phase 1: Foundation & Context',
      'Establish clear clinical context and identify patient-centered outcomes',
      1,
      'WFL-CD-001-001',
      jsonb_build_object(
        'estimated_duration_hours', 1.0,
        'duration_range', '45-60 minutes'
      )
    ),
    -- Phase 2
    (
      'Phase 2: Research & Precedent Analysis',
      'Research regulatory precedent and review FDA guidance',
      2,
      'WFL-CD-001-002',
      jsonb_build_object(
        'estimated_duration_hours', 1.0,
        'duration_range', '45-60 minutes'
      )
    ),
    -- Phase 3
    (
      'Phase 3: Endpoint Identification',
      'Generate and evaluate endpoint candidates',
      3,
      'WFL-CD-001-003',
      jsonb_build_object(
        'estimated_duration_hours', 0.75,
        'duration_range', '40-50 minutes'
      )
    ),
    -- Phase 4
    (
      'Phase 4: Validation & Feasibility',
      'Assess psychometric properties and feasibility',
      4,
      'WFL-CD-001-004',
      jsonb_build_object(
        'estimated_duration_hours', 1.17,
        'duration_range', '60-70 minutes'
      )
    ),
    -- Phase 5
    (
      'Phase 5: Risk & Decision',
      'Assess regulatory risk and make final recommendation',
      5,
      'WFL-CD-001-005',
      jsonb_build_object(
        'estimated_duration_hours', 0.83,
        'duration_range', '50-60 minutes'
      )
    )
) AS wf_data(name, description, position, unique_id, metadata)
WHERE uc.tenant_id = sc.tenant_id
  AND uc.code = 'UC_CD_001'
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: TASKS (13 Steps)
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id,
  workflow_id,
  code,
  title,
  objective,
  position,
  unique_id,
  extra
)
SELECT
  sc.tenant_id,
  wf.id as workflow_id,
  t_data.code,
  t_data.title,
  t_data.objective,
  t_data.position,
  t_data.unique_id,
  t_data.extra
FROM session_config sc
CROSS JOIN dh_workflow wf
CROSS JOIN (
  VALUES
    -- PHASE 1 TASKS
    (
      'Phase 1: Foundation & Context',
      'TSK-CD-001-P1-01',
      'TSK-CD-001-P1-01',
      'Define Clinical Context',
      'Establish clear understanding of clinical problem, target population, and intervention approach',
      1,
      jsonb_build_object(
        'prompt_id', '1.1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30
      )
    ),
    (
      'Phase 1: Foundation & Context',
      'TSK-CD-001-P1-02',
      'TSK-CD-001-P1-02',
      'Identify Patient-Centered Outcomes',
      'Identify outcomes that matter most to patients',
      2,
      jsonb_build_object(
        'prompt_id', '1.1.2',
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20
      )
    ),
    
    -- PHASE 2 TASKS
    (
      'Phase 2: Research & Precedent Analysis',
      'TSK-CD-001-P2-01',
      'TSK-CD-001-P2-01',
      'Research DTx Regulatory Precedent',
      'Identify what endpoints FDA has accepted for similar DTx products',
      1,
      jsonb_build_object(
        'prompt_id', '2.1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30
      )
    ),
    (
      'Phase 2: Research & Precedent Analysis',
      'TSK-CD-001-P2-02',
      'TSK-CD-001-P2-02',
      'Review FDA Guidance Documents',
      'Understand FDA current thinking on digital health endpoints',
      2,
      jsonb_build_object(
        'prompt_id', '2.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20
      )
    ),
    
    -- PHASE 3 TASKS
    (
      'Phase 3: Endpoint Identification',
      'TSK-CD-001-P3-01',
      'TSK-CD-001-P3-01',
      'Identify Primary Endpoint Candidates',
      'Generate 2-3 strong candidate primary endpoints',
      1,
      jsonb_build_object(
        'prompt_id', '3.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25
      )
    ),
    (
      'Phase 3: Endpoint Identification',
      'TSK-CD-001-P3-02',
      'TSK-CD-001-P3-02',
      'Develop Secondary Endpoint Package',
      'Identify 3-5 secondary endpoints that support commercial value story',
      2,
      jsonb_build_object(
        'prompt_id', '3.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20
      )
    ),
    
    -- PHASE 4 TASKS
    (
      'Phase 4: Validation & Feasibility',
      'TSK-CD-001-P4-01',
      'TSK-CD-001-P4-01',
      'Evaluate Psychometric Properties',
      'Assess psychometric strength of each candidate endpoint',
      1,
      jsonb_build_object(
        'prompt_id', '4.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25
      )
    ),
    (
      'Phase 4: Validation & Feasibility',
      'TSK-CD-001-P4-02',
      'TSK-CD-001-P4-02',
      'Assess Digital Implementation Feasibility',
      'Confirm each endpoint can be implemented in digital platform',
      2,
      jsonb_build_object(
        'prompt_id', '4.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 20
      )
    ),
    (
      'Phase 4: Validation & Feasibility',
      'TSK-CD-001-P4-03',
      'TSK-CD-001-P4-03',
      'Evaluate Patient Burden',
      'Ensure assessment burden is acceptable to patients',
      3,
      jsonb_build_object(
        'prompt_id', '4.3.1',
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20
      )
    ),
    
    -- PHASE 5 TASKS
    (
      'Phase 5: Risk & Decision',
      'TSK-CD-001-P5-01',
      'TSK-CD-001-P5-01',
      'Assess Regulatory Risk',
      'Evaluate FDA acceptance risk for each endpoint option',
      1,
      jsonb_build_object(
        'prompt_id', '5.1.1',
        'complexity', 'ADVANCED',
        'estimated_duration_minutes', 25
      )
    ),
    (
      'Phase 5: Risk & Decision',
      'TSK-CD-001-P5-02',
      'TSK-CD-001-P5-02',
      'Create Decision Matrix',
      'Build structured comparison of all endpoint options',
      2,
      jsonb_build_object(
        'prompt_id', '5.2.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 10
      )
    ),
    (
      'Phase 5: Risk & Decision',
      'TSK-CD-001-P5-03',
      'TSK-CD-001-P5-03',
      'Make Final Recommendation',
      'Synthesize all inputs and make final endpoint recommendation',
      3,
      jsonb_build_object(
        'prompt_id', '5.2.2',
        'complexity', 'EXPERT',
        'estimated_duration_minutes', 10
      )
    ),
    (
      'Phase 5: Risk & Decision',
      'TSK-CD-001-P5-04',
      'TSK-CD-001-P5-04',
      'Prepare Stakeholder Communication',
      'Create executive summary and presentation materials',
      4,
      jsonb_build_object(
        'prompt_id', '5.2.3',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 10
      )
    )
) AS t_data(workflow_name, code, unique_id, title, objective, position, extra)
WHERE wf.tenant_id = sc.tenant_id
  AND wf.name = t_data.workflow_name
  AND wf.use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = sc.tenant_id 
      AND code = 'UC_CD_001'
  )
ON CONFLICT (workflow_id, code)
DO UPDATE SET
  title = EXCLUDED.title,
  objective = EXCLUDED.objective,
  position = EXCLUDED.position,
  unique_id = EXCLUDED.unique_id,
  extra = EXCLUDED.extra,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

SELECT 
  'UC-01 Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_001');

SELECT 
  'UC-01 Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_CD_001');

-- =====================================================================================
-- END OF SEED FILE
-- =====================================================================================

