-- =====================================================================================
-- UC_RA_002: 510(k) vs De Novo Pathway Determination - Part 1: Workflows & Tasks
-- =====================================================================================
-- Purpose: Strategic determination of optimal FDA premarket pathway
-- Dependencies: UC_RA_001
-- Complexity: ADVANCED
-- Pattern: COT_WITH_PRECEDENT
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant_id found in session_config';
  END IF;
END $$;

-- =====================================================================================
-- USE CASE
-- =====================================================================================

INSERT INTO dh_use_case (
  tenant_id, code, unique_id, title, domain, description,
  complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics
)
SELECT
  sc.tenant_id,
  'UC_RA_002',
  'USC-RA-002',
  '510(k) vs De Novo Pathway Determination',
  'RA',
  'Strategic determination of optimal FDA premarket pathway for digital health medical devices: Traditional 510(k), Special 510(k), or De Novo classification',
  'ADVANCED',
  120,
  json_build_array(
    'Device description and intended use',
    'SaMD classification (from UC_RA_001)',
    'Available predicate devices',
    'Novelty assessment',
    'Clinical data available'
  )::jsonb,
  json_build_array(
    'Recommended regulatory pathway',
    'Predicate device analysis (if 510(k))',
    'Rationale and risk assessment',
    'Data requirements gap analysis',
    'Timeline and cost estimates',
    'Contingency plans'
  )::jsonb,
  jsonb_build_object(
    'pathway_accuracy', '90% recommendation success rate',
    'time_to_decision', '2 hours vs 2 weeks manual',
    'data_gap_identification', '100% gap analysis completeness'
  )
FROM session_config sc
ON CONFLICT (tenant_id, code)
DO UPDATE SET title = EXCLUDED.title;

-- =====================================================================================
-- WORKFLOW
-- =====================================================================================

INSERT INTO dh_workflow (
  tenant_id, use_case_id, name, unique_id, description, position, metadata
)
SELECT
  sc.tenant_id,
  uc.id,
  'Pathway Selection Workflow',
  'WFL-RA-002-001',
  'Comprehensive analysis workflow for FDA pathway determination with precedent analysis',
  1,
  jsonb_build_object(
    'duration_minutes', 120,
    'complexity', 'ADVANCED',
    'pattern', 'COT_WITH_PRECEDENT'
  )
FROM session_config sc
CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_002' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET name = EXCLUDED.name;

-- =====================================================================================
-- TASKS
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
  ('TSK-RA-002-01', 'TSK-RA-002-01', 'Assess Device Novelty', 'Determine if device represents novel technology without legally marketed predicate', 1,
   '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-002-02', 'TSK-RA-002-02', 'Search for Predicate Devices', 'Conduct systematic search in FDA 510(k) database for potential predicates', 2,
   '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-002-03', 'TSK-RA-002-03', 'Evaluate Substantial Equivalence', 'Assess substantial equivalence criteria vs potential predicates', 3,
   '{"complexity": "EXPERT", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-002-04', 'TSK-RA-002-04', 'Analyze De Novo Precedents', 'Review similar De Novo classifications for DTx and digital health products', 4,
   '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-002-05', 'TSK-RA-002-05', 'Compare Pathway Requirements', 'Compare data requirements, timelines, costs across pathways', 5,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-002-06', 'TSK-RA-002-06', 'Make Pathway Recommendation', 'Synthesize analysis and recommend optimal pathway with contingencies', 6,
   '{"complexity": "ADVANCED", "duration_minutes": 15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf
WHERE wf.unique_id = 'WFL-RA-002-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET title = EXCLUDED.title;

-- =====================================================================================
-- TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT
  sc.tenant_id,
  t_curr.id,
  t_prev.id,
  'BLOCKS'
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-02', 'TSK-RA-002-01'),
  ('TSK-RA-002-03', 'TSK-RA-002-02'),
  ('TSK-RA-002-05', 'TSK-RA-002-03'),
  ('TSK-RA-002-05', 'TSK-RA-002-04'),
  ('TSK-RA-002-06', 'TSK-RA-002-05')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

-- VERIFICATION
SELECT 'UC_RA_002 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_002' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

