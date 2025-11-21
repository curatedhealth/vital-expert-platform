-- =====================================================================================
-- SEED FILE TEMPLATE FOR USE CASES
-- USE THIS AS A STARTING POINT FOR ALL FUTURE USE CASE SEED FILES
-- =====================================================================================
-- Last Updated: 2025-11-02
-- Based on learnings from UC-01 (06_cd_001_endpoint_selection_CLEAN.sql)
-- =====================================================================================

-- =====================================================================================
-- CRITICAL SCHEMA RULES (MUST FOLLOW!)
-- =====================================================================================
-- 
-- ✅ dh_workflow:
--    - Columns: tenant_id, use_case_id, name, description, position, unique_id, metadata
--    - NO 'code' column!
--    - unique_id format: 'WFL-XX-XXX-001', 'WFL-XX-XXX-002', etc.
--    - ON CONFLICT: (tenant_id, unique_id)
--
-- ✅ dh_task:
--    - Columns: tenant_id, workflow_id, code, title, objective, position, unique_id, extra
--    - Use 'title' and 'objective' (NOT 'name' and 'description'!)
--    - Use 'extra' for JSONB (NOT 'metadata'!)
--    - unique_id format: same as code (e.g., 'TSK-XX-XXX-PX-XX')
--    - ON CONFLICT: (workflow_id, code) ← NO tenant_id!
--
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
-- SECTION 1: WORKFLOWS
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
    -- Workflow 1
    (
      'Phase 1: [PHASE NAME]',
      '[DESCRIPTION]',
      1,
      'WFL-[DOMAIN]-[UC#]-001',  -- ← CHANGE THIS!
      jsonb_build_object(
        'estimated_duration_hours', 1.0,
        'duration_range', '45-60 minutes'
      )
    ),
    -- Workflow 2
    (
      'Phase 2: [PHASE NAME]',
      '[DESCRIPTION]',
      2,
      'WFL-[DOMAIN]-[UC#]-002',  -- ← CHANGE THIS!
      jsonb_build_object(
        'estimated_duration_hours', 1.0,
        'duration_range', '45-60 minutes'
      )
    )
    -- Add more workflows as needed...
) AS wf_data(name, description, position, unique_id, metadata)
WHERE uc.tenant_id = sc.tenant_id
  AND uc.code = 'UC_[DOMAIN]_[NUMBER]'  -- ← CHANGE THIS!
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  position = EXCLUDED.position,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: TASKS
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
    -- Task 1 for Phase 1
    (
      'Phase 1: [PHASE NAME]',  -- ← Must match workflow name exactly!
      'TSK-[DOMAIN]-[UC#]-P1-01',  -- ← Task code
      'TSK-[DOMAIN]-[UC#]-P1-01',  -- ← unique_id (same as code)
      '[TASK TITLE]',              -- ← Short title
      '[TASK OBJECTIVE DESCRIPTION]',  -- ← Longer description
      1,                           -- ← Position in workflow
      jsonb_build_object(
        'prompt_id', '1.1.1',
        'complexity', 'INTERMEDIATE',
        'estimated_duration_minutes', 30,
        'persona_lead', 'P01_CMO',
        'persona_support', json_build_array('P10_PATADV'),
        'prerequisites', json_build_array(
          'Prerequisite 1',
          'Prerequisite 2'
        ),
        'deliverable', 'Deliverable description',
        'quality_checks', json_build_array(
          'Quality check 1',
          'Quality check 2'
        )
      )
    ),
    -- Task 2 for Phase 1
    (
      'Phase 1: [PHASE NAME]',
      'TSK-[DOMAIN]-[UC#]-P1-02',
      'TSK-[DOMAIN]-[UC#]-P1-02',
      '[TASK TITLE]',
      '[TASK OBJECTIVE DESCRIPTION]',
      2,
      jsonb_build_object(
        'prompt_id', '1.1.2',
        'complexity', 'BASIC',
        'estimated_duration_minutes', 20
      )
    )
    -- Add more tasks as needed...
) AS t_data(workflow_name, code, unique_id, title, objective, position, extra)
WHERE wf.tenant_id = sc.tenant_id
  AND wf.name = t_data.workflow_name
  AND wf.use_case_id = (
    SELECT id FROM dh_use_case 
    WHERE tenant_id = sc.tenant_id 
      AND code = 'UC_[DOMAIN]_[NUMBER]'  -- ← CHANGE THIS!
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
  'Workflows Seeded' as status,
  COUNT(*) as workflow_count
FROM dh_workflow wf
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_[DOMAIN]_[NUMBER]');

SELECT 
  'Tasks Seeded' as status,
  COUNT(*) as task_count
FROM dh_task t
JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE t.tenant_id = (SELECT tenant_id FROM session_config)
  AND wf.use_case_id = (SELECT id FROM dh_use_case WHERE code = 'UC_[DOMAIN]_[NUMBER]');

-- =====================================================================================
-- CHECKLIST BEFORE RUNNING
-- =====================================================================================
-- [ ] Replaced all [DOMAIN], [UC#], [NUMBER] placeholders
-- [ ] Replaced all [PHASE NAME], [TASK TITLE], [DESCRIPTION] placeholders
-- [ ] Verified unique_id format matches pattern (WFL-XX-XXX-001, TSK-XX-XXX-P1-01)
-- [ ] Workflows use 'name' not 'code'
-- [ ] Tasks use 'title' and 'objective' not 'name' and 'description'
-- [ ] Tasks use 'extra' not 'metadata'
-- [ ] Workflow ON CONFLICT uses (tenant_id, unique_id)
-- [ ] Task ON CONFLICT uses (workflow_id, code)
-- [ ] Each task references correct workflow by name
-- [ ] All tuples have correct number of elements (no duplicates!)
-- =====================================================================================

