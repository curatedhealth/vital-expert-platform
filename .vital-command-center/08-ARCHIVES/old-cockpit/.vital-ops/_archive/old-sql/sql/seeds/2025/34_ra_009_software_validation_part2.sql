-- =====================================================================================
-- UC_RA_009: Software Validation Documentation - Part 2: Task Assignments
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
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order,
  agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy,
  agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage,
  agent_data.on_failure, agent_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-009-01', 'AGT-REGULATORY-COMPLIANCE', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Classify software safety"}'::jsonb),
  ('TSK-RA-009-02', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P07_DATASC', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft SRS"}'::jsonb),
  ('TSK-RA-009-03', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P07_DATASC', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft SDS"}'::jsonb),
  ('TSK-RA-009-04', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P07_DATASC', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Develop V&V plan"}'::jsonb),
  ('TSK-RA-009-05', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Create test protocols"}'::jsonb),
  ('TSK-RA-009-06', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Generate traceability matrix"}'::jsonb),
  ('TSK-RA-009-07', 'AGT-REGULATORY-COMPLIANCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Document SDLC"}'::jsonb),
  ('TSK-RA-009-08', 'AGT-SUBMISSION-COMPILER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Compile validation package"}'::jsonb),
  ('TSK-RA-009-08', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate completeness"}'::jsonb)
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval,
  max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET execution_order = EXCLUDED.execution_order;

INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing,
  persona_data.escalation_to_persona_code, persona_data.metadata
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-009-01', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve classification"}'::jsonb),
  ('TSK-RA-009-02', 'P07_DATASC', 'APPROVE', 'AFTER_AGENT_RUNS', 'P06_DTXCMO', '{"role": "Approve SRS"}'::jsonb),
  ('TSK-RA-009-03', 'P07_DATASC', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve SDS"}'::jsonb),
  ('TSK-RA-009-04', 'P07_DATASC', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve V&V plan"}'::jsonb),
  ('TSK-RA-009-08', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final package approval"}'::jsonb),
  ('TSK-RA-009-08', 'P07_DATASC', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Technical review"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET review_timing = EXCLUDED.review_timing;

INSERT INTO dh_task_tool (
  tenant_id, task_id, tool_id, purpose
)
SELECT sc.tenant_id, t.id, tool.id,
  tool_data.purpose
FROM session_config sc
CROSS JOIN (VALUES
  (
  ('TSK-RA-009-06', 'TOOL-VERSION-CONTROL', 'Traceability'),
  ('TSK-RA-009-08', 'TOOL-DOCUMENT-MGMT', 'Package compilation')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id)
DO UPDATE SET purpose = EXCLUDED.purpose;

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, note
)
SELECT sc.tenant_id, t.id, rag.id,
  rag_data.note
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-009-01', 'RAG-FDA-GUIDANCE', 'IEC 62304 software safety classification, Class A B C criteria, risk-based approach',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "Classification guidance"}'::jsonb),
  ('TSK-RA-009-02', 'RAG-FDA-GUIDANCE', 'Software Requirements Specification template, FDA software validation guidance',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "SRS guidance"}'::jsonb),
  ('TSK-RA-009-04', 'RAG-FDA-GUIDANCE', 'Verification and validation, software testing requirements, IEC 62304 V&V',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "V&V guidance"}'::jsonb),
  ('TSK-RA-009-07', 'RAG-FDA-GUIDANCE', 'Software Development Lifecycle, SDLC documentation, change control',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "SDLC guidance"}'::jsonb)
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

SELECT 'UC_RA_009 Part 2 Seeded' as status;

