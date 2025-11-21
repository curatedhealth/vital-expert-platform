-- =====================================================================================
-- UC_RA_002: 510(k) vs De Novo Pathway Determination - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Strategic determination of optimal FDA premarket pathway
-- Dependencies: UC_RA_001
-- Complexity: ADVANCED
-- Pattern: COT_WITH_PRECEDENT
-- =====================================================================================
-- This file contains:
--   - Use Case definition
--   - Workflow definition
--   - Task definitions (6 tasks)
--   - Task dependencies
--   - Agent assignments (10 assignments)
--   - Persona assignments (4 assignments)
--   - Tool assignments (2 assignments)
--   - RAG source assignments (3 assignments)
--   - Verification queries
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
  RAISE NOTICE '✓ Using tenant_id: %', v_tenant_id;
END $$;

-- =====================================================================================
-- SECTION 1: USE CASE DEFINITION
-- =====================================================================================

INSERT INTO dh_use_case (
  tenant_id,
  domain_id,
  code,
  unique_id,
  title,
  summary,
  complexity,
  metadata
)
SELECT 
  sc.tenant_id,
  d.id,
  'UC_RA_002',
  'USC-RA-002',
  '510(k) vs De Novo Pathway Determination',
  'Strategic determination of optimal FDA premarket pathway for digital health medical devices: Traditional 510(k), Special 510(k), or De Novo classification',
  'Advanced',
  jsonb_build_object(
    'estimated_duration_minutes', 120,
    'prerequisites', json_build_array(
      'Device description and intended use',
      'SaMD classification (from UC_RA_001)',
      'Available predicate devices',
      'Novelty assessment',
      'Clinical data available'
    ),
    'deliverables', json_build_array(
      'Recommended regulatory pathway',
      'Predicate device analysis (if 510(k))',
      'Rationale and risk assessment',
      'Data requirements gap analysis',
      'Timeline and cost estimates',
      'Contingency plans'
    ),
    'success_metrics', jsonb_build_object(
      'pathway_accuracy', '90% recommendation success rate',
      'time_to_decision', '2 hours vs 2 weeks manual',
      'data_gap_identification', '100% gap analysis completeness'
    )
  )
FROM session_config sc
CROSS JOIN dh_domain d
WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) 
DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 2: WORKFLOW DEFINITION
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
DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

-- =====================================================================================
-- SECTION 3: TASK DEFINITIONS
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
  wf.id,
  task_data.code,
  task_data.unique_id,
  task_data.title,
  task_data.objective,
  task_data.position,
  task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-01', 'TSK-RA-002-01', 'Assess Device Novelty', 'Determine if device represents novel technology without legally marketed predicate', 1, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-002-02', 'TSK-RA-002-02', 'Search for Predicate Devices', 'Conduct systematic search in FDA 510(k) database for potential predicates', 2, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-002-03', 'TSK-RA-002-03', 'Evaluate Substantial Equivalence', 'Assess substantial equivalence criteria vs potential predicates', 3, '{"complexity": "EXPERT", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-002-04', 'TSK-RA-002-04', 'Analyze De Novo Precedents', 'Review similar De Novo classifications for DTx and digital health products', 4, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-002-05', 'TSK-RA-002-05', 'Compare Pathway Requirements', 'Compare data requirements, timelines, costs across pathways', 5, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-002-06', 'TSK-RA-002-06', 'Make Pathway Recommendation', 'Synthesize analysis and recommend optimal pathway with contingencies', 6, '{"complexity": "ADVANCED", "duration_minutes": 15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf
WHERE wf.unique_id = 'WFL-RA-002-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id)
DO UPDATE SET 
  title = EXCLUDED.title,
  objective = EXCLUDED.objective;

-- =====================================================================================
-- SECTION 4: TASK DEPENDENCIES
-- =====================================================================================

INSERT INTO dh_task_dependency (
  tenant_id,
  task_id,
  depends_on_task_id
)
SELECT
  sc.tenant_id,
  t_curr.id,
  t_prev.id
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
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- =====================================================================================
-- SECTION 5: AGENT ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_agent (
  tenant_id,
  task_id,
  agent_id,
  assignment_type,
  execution_order,
  requires_human_approval,
  max_retries,
  retry_strategy,
  is_parallel,
  approval_persona_code,
  approval_stage,
  on_failure,
  metadata
)
SELECT
  sc.tenant_id,
  t.id,
  a.id,
  agent_data.assignment_type,
  agent_data.execution_order,
  agent_data.requires_human_approval,
  agent_data.max_retries,
  agent_data.retry_strategy,
  agent_data.is_parallel,
  agent_data.approval_persona_code,
  agent_data.approval_stage,
  agent_data.on_failure,
  agent_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assess novelty"}'::jsonb),
  ('TSK-RA-002-02', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Search 510(k) database"}'::jsonb),
  ('TSK-RA-002-02', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Search FDA databases"}'::jsonb),
  ('TSK-RA-002-03', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Evaluate substantial equivalence"}'::jsonb),
  ('TSK-RA-002-03', 'AGT-REGULATORY-COMPLIANCE', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate equivalence analysis"}'::jsonb),
  ('TSK-RA-002-04', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Retrieve De Novo precedents"}'::jsonb),
  ('TSK-RA-002-04', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Search DTx De Novo examples"}'::jsonb),
  ('TSK-RA-002-05', 'AGT-DECISION-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Compare pathway requirements"}'::jsonb),
  ('TSK-RA-002-06', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Recommend pathway"}'::jsonb),
  ('TSK-RA-002-06', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, true, 2, 'LINEAR', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Generate pathway report"}'::jsonb)
) AS agent_data(
  task_code, agent_code, assignment_type, execution_order, requires_human_approval,
  max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata
)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET execution_order = EXCLUDED.execution_order;

-- =====================================================================================
-- SECTION 6: PERSONA ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_persona (
  tenant_id,
  task_id,
  persona_id,
  responsibility,
  review_timing,
  escalation_to_persona_code,
  metadata
)
SELECT
  sc.tenant_id,
  t.id,
  p.id,
  persona_data.responsibility,
  persona_data.review_timing,
  persona_data.escalation_to_persona_code,
  persona_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-01', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve novelty assessment"}'::jsonb),
  ('TSK-RA-002-03', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve substantial equivalence"}'::jsonb),
  ('TSK-RA-002-06', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final pathway approval"}'::jsonb),
  ('TSK-RA-002-06', 'P04_REGDIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Technical review"}'::jsonb)
) AS persona_data(
  task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata
)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET review_timing = EXCLUDED.review_timing;

-- =====================================================================================
-- SECTION 7: TOOL ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_tool (
  tenant_id,
  task_id,
  tool_id,
  purpose
)
SELECT
  sc.tenant_id,
  t.id,
  tool.id,
  tool_data.purpose
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-02', 'TOOL-REGULATORY-DB', '510(k) database search'),
  ('TSK-RA-002-04', 'TOOL-REGULATORY-DB', 'De Novo precedent search'),
  ('TSK-RA-002-06', 'TOOL-DOCUMENT-MGMT', 'Generate pathway report')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET purpose = EXCLUDED.purpose;

-- =====================================================================================
-- SECTION 8: RAG SOURCE ASSIGNMENTS
-- =====================================================================================

INSERT INTO dh_task_rag (
  tenant_id,
  task_id,
  rag_source_id,
  note
)
SELECT
  sc.tenant_id,
  t.id,
  rag.id,
  rag_data.note
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-02', 'RAG-FDA-GUIDANCE', '510(k) substantial equivalence criteria, predicate device requirements'),
  ('TSK-RA-002-04', 'RAG-FDA-DIGITAL-HEALTH', 'De Novo pathway for DTx, digital therapeutics precedents, reSET EndeavorRx'),
  ('TSK-RA-002-05', 'RAG-FDA-GUIDANCE', '510(k) vs De Novo comparison, pathway selection criteria, review timelines')
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

-- =====================================================================================
-- SECTION 9: VERIFICATION QUERIES
-- =====================================================================================

DO $$
DECLARE
  v_task_count INT;
  v_agent_count INT;
  v_persona_count INT;
  v_tool_count INT;
  v_rag_count INT;
BEGIN
  SELECT 
    COUNT(DISTINCT t.id),
    COUNT(DISTINCT ta.id),
    COUNT(DISTINCT tp.id),
    COUNT(DISTINCT tt.id),
    COUNT(DISTINCT tr.id)
  INTO v_task_count, v_agent_count, v_persona_count, v_tool_count, v_rag_count
  FROM dh_use_case uc
  CROSS JOIN dh_workflow wf
  LEFT JOIN dh_task t ON t.workflow_id = wf.id
  LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
  LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
  LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
  LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
  WHERE uc.code = 'UC_RA_002'
    AND wf.use_case_id = uc.id
    AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_002: 510(k) vs De Novo Pathway';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tasks:              %', v_task_count;
  RAISE NOTICE 'Agent Assignments:  %', v_agent_count;
  RAISE NOTICE 'Persona Assignments: %', v_persona_count;
  RAISE NOTICE 'Tool Assignments:   %', v_tool_count;
  RAISE NOTICE 'RAG Assignments:    %', v_rag_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ UC_RA_002 seeded successfully!';
  RAISE NOTICE '';
END $$;

-- =====================================================================================
-- Additional verification: Show task details
-- =====================================================================================

SELECT 
  'UC_RA_002: 510(k) vs De Novo Pathway Determination' as use_case,
  COUNT(DISTINCT uc.id) as use_cases,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks,
  COUNT(DISTINCT td.id) as dependencies,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments,
  COUNT(DISTINCT tt.id) as tool_assignments,
  COUNT(DISTINCT tr.id) as rag_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_dependency td ON td.task_id = t.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_002';

