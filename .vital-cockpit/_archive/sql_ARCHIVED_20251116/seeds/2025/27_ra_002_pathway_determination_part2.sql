-- =====================================================================================
-- UC_RA_002: 510(k) vs De Novo Pathway Determination - Part 2: Task Assignments
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



INSERT INTO dh_task_agent (
  tenant_id, task_id, agent_id, assignment_type, execution_order,
  requires_human_approval, max_retries, retry_strategy, is_parallel,
  approval_persona_code, approval_stage, on_failure, metadata
)
SELECT
  sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order,
  agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy,
  agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage,
  agent_data.on_failure, agent_data.metadata
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
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval,
  max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type)
DO UPDATE SET execution_order = EXCLUDED.execution_order;

INSERT INTO dh_task_persona (
  tenant_id, task_id, persona_id, responsibility, review_timing,
  escalation_to_persona_code, metadata
)
SELECT
  sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing,
  persona_data.escalation_to_persona_code, persona_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-01', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve novelty assessment"}'::jsonb),
  ('TSK-RA-002-03', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve substantial equivalence"}'::jsonb),
  ('TSK-RA-002-06', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final pathway approval"}'::jsonb),
  ('TSK-RA-002-06', 'P04_REGDIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Technical review"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility)
DO UPDATE SET review_timing = EXCLUDED.review_timing;

INSERT INTO dh_task_tool (
  tenant_id, task_id, tool_id, purpose
)
SELECT
  sc.tenant_id, t.id, tool.id,
  tool_data.purpose
FROM session_config sc
CROSS JOIN (VALUES
  (
  ('TSK-RA-002-04', 'TOOL-REGULATORY-DB', 'De Novo precedent search'),
  ('TSK-RA-002-06', 'TOOL-DOCUMENT-MGMT', 'Generate pathway report')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET purpose = EXCLUDED.purpose;

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, note
)
SELECT
  sc.tenant_id, t.id, rag.id,
  rag_data.note
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-002-02', 'RAG-FDA-GUIDANCE', '510(k) substantial equivalence criteria, predicate device requirements',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "510(k) requirements"}'::jsonb),
  ('TSK-RA-002-04', 'RAG-FDA-DIGITAL-HEALTH', 'De Novo pathway for DTx, digital therapeutics precedents, reSET EndeavorRx',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "De Novo precedents"}'::jsonb),
  ('TSK-RA-002-05', 'RAG-FDA-GUIDANCE', '510(k) vs De Novo comparison, pathway selection criteria, review timelines',
   '{"max_results": 5, "similarity_threshold": 0.75}'::jsonb, '{"purpose": "Pathway comparison"}'::jsonb)
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

SELECT 'UC_RA_002 Part 2 Seeded' as status,
  COUNT(DISTINCT ta.id) as agents, COUNT(DISTINCT tp.id) as personas,
  COUNT(DISTINCT tt.id) as tools, COUNT(DISTINCT tr.id) as rags
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_002' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

