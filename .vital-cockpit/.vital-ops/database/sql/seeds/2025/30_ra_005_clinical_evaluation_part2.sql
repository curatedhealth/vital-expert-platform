-- =====================================================================================
-- UC_RA_005: Clinical Evaluation Report (CER) - Part 2: Task Assignments
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
  ('TSK-RA-005-01', 'AGT-CLINICAL-ENDPOINT', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Define clinical context"}'::jsonb),
  ('TSK-RA-005-02', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Conduct systematic review"}'::jsonb),
  ('TSK-RA-005-02', 'AGT-REGULATORY-INTELLIGENCE', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Search regulatory databases"}'::jsonb),
  ('TSK-RA-005-03', 'AGT-EVIDENCE-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Appraise studies"}'::jsonb),
  ('TSK-RA-005-04', 'AGT-EVIDENCE-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Summarize clinical data"}'::jsonb),
  ('TSK-RA-005-04', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Statistical analysis"}'::jsonb),
  ('TSK-RA-005-05', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P04_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Risk-benefit analysis"}'::jsonb),
  ('TSK-RA-005-05', 'AGT-CLINICAL-ENDPOINT', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical benefit assessment"}'::jsonb),
  ('TSK-RA-005-06', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Develop PMCF plan"}'::jsonb),
  ('TSK-RA-005-07', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Compile CER document"}'::jsonb),
  ('TSK-RA-005-07', 'AGT-SUBMISSION-COMPILER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Format per MEDDEV 2.7/1"}'::jsonb),
  ('TSK-RA-005-08', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 1, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate MEDDEV compliance"}'::jsonb),
  ('TSK-RA-005-08', 'AGT-REGULATORY-COMPLIANCE', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Check EU MDR compliance"}'::jsonb)
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
  ('TSK-RA-005-04', 'P06_DTXCMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical data review"}'::jsonb),
  ('TSK-RA-005-05', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve risk-benefit"}'::jsonb),
  ('TSK-RA-005-05', 'P06_DTXCMO', 'CONSULT', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical benefit input"}'::jsonb),
  ('TSK-RA-005-08', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final CER approval"}'::jsonb),
  ('TSK-RA-005-08', 'P02_MEDICAL_DIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Medical review"}'::jsonb)
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
  ('TSK-RA-005-07', 'TOOL-DOCUMENT-MGMT', 'CER compilation')
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
  ('TSK-RA-005-01', 'RAG-CLINICAL-ENDPOINTS', 'Disease background, current management, unmet medical need',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "Clinical context"}'::jsonb),
  ('TSK-RA-005-02', 'RAG-PUBMED', 'Systematic literature review methodology, PRISMA guidelines',
   '{"max_results": 10, "similarity_threshold": 0.75}'::jsonb, '{"purpose": "Literature search"}'::jsonb),
  ('TSK-RA-005-05', 'RAG-EMA-GUIDANCE', 'EU MDR risk-benefit analysis, MEDDEV 2.7/1 Rev 4 requirements',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "EU MDR compliance"}'::jsonb),
  ('TSK-RA-005-07', 'RAG-EMA-GUIDANCE', 'MEDDEV 2.7/1 Rev 4 template, CER structure requirements',
   '{"max_results": 5, "similarity_threshold": 0.9}'::jsonb, '{"purpose": "CER format"}'::jsonb)
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

SELECT 'UC_RA_005 Part 2 Seeded' as status;

