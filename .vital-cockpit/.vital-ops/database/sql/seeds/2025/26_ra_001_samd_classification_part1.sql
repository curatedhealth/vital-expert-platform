-- =====================================================================================
-- UC_RA_001: FDA Software Classification (SaMD) - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Systematic determination of FDA Software as a Medical Device (SaMD) classification
-- Dependencies: Foundation agents, personas, tools, RAG sources
-- Complexity: INTERMEDIATE
-- Pattern: DECISION_TREE
-- =====================================================================================

-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Create temp table if it doesn't exist
  CREATE TEMP TABLE IF NOT EXISTS session_config (
    tenant_id UUID,
    tenant_slug TEXT
  );
  
  -- Clear and repopulate
  DELETE FROM session_config;
  
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant "digital-health-startup" not found';
  END IF;
  RAISE NOTICE 'Using tenant_id: %', v_tenant_id;
END $$;

-- =====================================================================================
-- SECTION 1: USE CASE
-- =====================================================================================

INSERT INTO dh_use_case (
  tenant_id, code, unique_id, title, domain, description, 
  complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics
)
SELECT 
  sc.tenant_id,
  'UC_RA_001',
  'USC-RA-001',
  'FDA Software Classification (SaMD)',
  'RA',
  'Systematic approach to determining whether a digital health product meets FDA definition of Software as a Medical Device (SaMD) and requires regulatory oversight',
  'INTERMEDIATE',
  90,
  json_build_array(
    'Product description and features',
    'Intended use statement',
    'Target user information',
    'Clinical claims or indications',
    'Data processing functions'
  )::jsonb,
  json_build_array(
    'SaMD classification determination (Yes/No)',
    'Device class determination (I, II, or III if applicable)',
    'Regulatory pathway recommendation',
    'Rationale with FDA guidance citations',
    'Risk assessment report'
  )::jsonb,
  jsonb_build_object(
    'accuracy', '95% classification accuracy vs FDA precedent',
    'time_saved', '80% reduction vs manual analysis',
    'citation_quality', 'All determinations cite current FDA guidance'
  )
FROM session_config sc
ON CONFLICT (tenant_id, code) 
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

-- =====================================================================================
-- SECTION 2: WORKFLOW
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id, use_case_id, name, unique_id, description, position, metadata
)
SELECT
  sc.tenant_id,
  uc.id,
  'FDA SaMD Classification Workflow',
  'WFL-RA-001-001',
  'Decision tree workflow for systematic FDA software classification determination',
  1,
  jsonb_build_object(
    'duration_minutes', 90,
    'complexity', 'INTERMEDIATE',
    'pattern', 'DECISION_TREE',
    'deliverables', json_build_array(
      'Classification determination',
      'Device class (if SaMD)',
      'Pathway recommendation',
      'Risk assessment'
    )
  )
FROM session_config sc
CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_001' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET name = EXCLUDED.name;

-- =====================================================================================
-- SECTION 3: TASKS
-- =====================================================================================

INSERT INTO dh_task (
  tenant_id, workflow_id, code, unique_id, title, objective, position, extra
)
SELECT
  sc.tenant_id,
  wf.id,
  task_data.code,
  task_data.unique_id,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  -- Task 1: Product Analysis
  (
    'TSK-RA-001-01',
    'TSK-RA-001-01',
    'Analyze Product Description & Intended Use',
    'Extract and structure product features, intended use statement, target users, and clinical claims',
    1,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 15, "deliverable": "Structured product summary"}'::jsonb
  ),
  
  -- Task 2: Device Definition Assessment
  (
    'TSK-RA-001-02',
    'TSK-RA-001-02',
    'Assess FD&C Act Section 201(h) Device Definition',
    'Determine if product meets legal definition of "device" under Federal Food, Drug, and Cosmetic Act',
    2,
    '{"complexity": "ADVANCED", "duration_minutes": 15, "deliverable": "Device definition assessment", "key_question": "Does it diagnose, cure, mitigate, treat, or prevent disease?"}'::jsonb
  ),
  
  -- Task 3: Enforcement Discretion Review
  (
    'TSK-RA-001-03',
    'TSK-RA-001-03',
    'Apply FDA Enforcement Discretion Criteria',
    'Check if product falls under FDA enforcement discretion per 2019 guidance (low risk wellness)',
    3,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 15, "deliverable": "Enforcement discretion determination", "guidance": "Policy for Device Software Functions (2019)"}'::jsonb
  ),
  
  -- Task 4: Risk Level Assessment
  (
    'TSK-RA-001-04',
    'TSK-RA-001-04',
    'Determine Risk Level & Device Class',
    'Assess risk level (serious injury/death potential) and determine device class (I, II, or III)',
    4,
    '{"complexity": "ADVANCED", "duration_minutes": 20, "deliverable": "Risk assessment & class determination"}'::jsonb
  ),
  
  -- Task 5: Pathway Recommendation
  (
    'TSK-RA-001-05',
    'TSK-RA-001-05',
    'Recommend Regulatory Pathway',
    'Based on classification, recommend specific regulatory pathway (510(k), De Novo, PMA, or exempt)',
    5,
    '{"complexity": "ADVANCED", "duration_minutes": 15, "deliverable": "Pathway recommendation with rationale"}'::jsonb
  ),
  
  -- Task 6: Final Report Generation
  (
    'TSK-RA-001-06',
    'TSK-RA-001-06',
    'Generate Classification Report',
    'Compile comprehensive classification report with citations, precedent analysis, and recommendations',
    6,
    '{"complexity": "INTERMEDIATE", "duration_minutes": 10, "deliverable": "FDA SaMD Classification Report (5-8 pages)"}'::jsonb
  )
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf
WHERE wf.unique_id = 'WFL-RA-001-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET title = EXCLUDED.title;

-- =====================================================================================
-- SECTION 4: TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT
  sc.tenant_id,
  t_curr.id,
  t_prev.id,
  'BLOCKS'
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-001-02', 'TSK-RA-001-01'),  -- Device definition depends on product analysis
  ('TSK-RA-001-03', 'TSK-RA-001-02'),  -- Enforcement discretion depends on device definition
  ('TSK-RA-001-04', 'TSK-RA-001-03'),  -- Risk assessment depends on enforcement discretion
  ('TSK-RA-001-05', 'TSK-RA-001-04'),  -- Pathway recommendation depends on risk assessment
  ('TSK-RA-001-06', 'TSK-RA-001-05')   -- Report generation depends on pathway recommendation
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

-- =====================================================================================
-- VERIFICATION
-- =====================================================================================

SELECT 
  'UC_RA_001 Part 1 Seeded' as status,
  COUNT(DISTINCT t.id) as tasks_created,
  COUNT(DISTINCT td.id) as dependencies_created
FROM dh_use_case uc
CROSS JOIN dh_workflow wf
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_dependency td ON td.task_id = t.id
WHERE uc.code = 'UC_RA_001'
  AND wf.use_case_id = uc.id
  AND uc.tenant_id = (SELECT tenant_id FROM session_config);

