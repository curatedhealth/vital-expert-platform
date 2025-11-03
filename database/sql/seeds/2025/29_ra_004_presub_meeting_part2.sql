-- =====================================================================================
-- UC_RA_004: Pre-Submission Meeting Preparation - Part 2: Task Assignments
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
  ('TSK-RA-004-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define objectives"}'::jsonb),
  ('TSK-RA-004-02', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Draft questions"}'::jsonb),
  ('TSK-RA-004-02', 'AGT-REGULATORY-INTELLIGENCE', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Research FDA precedent"}'::jsonb),
  ('TSK-RA-004-03', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Write background section"}'::jsonb),
  ('TSK-RA-004-04', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CLINDEV_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Summarize clinical study"}'::jsonb),
  ('TSK-RA-004-04', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Summarize statistical approach"}'::jsonb),
  ('TSK-RA-004-05', 'AGT-SUBMISSION-COMPILER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Compile Pre-Sub package"}'::jsonb),
  ('TSK-RA-004-06', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 1, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate completeness"}'::jsonb),
  ('TSK-RA-004-06', 'AGT-REGULATORY-COMPLIANCE', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Check FDA format compliance"}'::jsonb),
  ('TSK-RA-004-07', 'AGT-PROJECT-COORDINATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Prepare meeting strategy"}'::jsonb)
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
  ('TSK-RA-004-01', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve objectives"}'::jsonb),
  ('TSK-RA-004-02', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve questions"}'::jsonb),
  ('TSK-RA-004-02', 'P06_DTXCMO', 'CONSULT', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical input on questions"}'::jsonb),
  ('TSK-RA-004-04', 'P01_CLINDEV_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve clinical summary"}'::jsonb),
  ('TSK-RA-004-06', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final package approval"}'::jsonb),
  ('TSK-RA-004-07', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve meeting strategy"}'::jsonb)
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
  ('TSK-RA-004-07', 'TOOL-PROJECT-MGMT', 'Meeting coordination')
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
  ('TSK-RA-004-02', 'RAG-FDA-GUIDANCE', 'Pre-Submission program guidance, Q-Submission guidance, meeting best practices',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "Pre-Sub guidance"}'::jsonb),
  ('TSK-RA-004-02', 'RAG-FDA-DIGITAL-HEALTH', 'DTx Pre-Sub questions examples, digital health meeting precedents',
   '{"max_results": 5, "similarity_threshold": 0.75}'::jsonb, '{"purpose": "Question examples"}'::jsonb),
  ('TSK-RA-004-05', 'RAG-FDA-GUIDANCE', 'Pre-Sub request format, submission checklist, meeting package requirements',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "Format requirements"}'::jsonb)
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

SELECT 'UC_RA_004 Part 2 Seeded' as status;

