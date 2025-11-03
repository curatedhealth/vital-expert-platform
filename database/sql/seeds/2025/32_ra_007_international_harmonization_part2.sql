-- =====================================================================================
-- UC_RA_007: International Harmonization Strategy - Part 2: Task Assignments
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
  -- Workflow 1 Agents
  ('TSK-RA-007-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Map requirements"}'::jsonb),
  ('TSK-RA-007-02', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze FDA requirements"}'::jsonb),
  ('TSK-RA-007-03', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze EU MDR requirements"}'::jsonb),
  ('TSK-RA-007-04', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze Japan/Canada"}'::jsonb),
  ('TSK-RA-007-05', 'AGT-DECISION-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Identify harmonization opportunities"}'::jsonb),
  ('TSK-RA-007-05', 'AGT-REGULATORY-STRATEGY', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Assess data sharing"}'::jsonb),
  
  -- Workflow 2 Agents
  ('TSK-RA-007-06', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CLINDEV_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design harmonized trial"}'::jsonb),
  ('TSK-RA-007-06', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Harmonized statistical plan"}'::jsonb),
  ('TSK-RA-007-07', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Determine sequencing"}'::jsonb),
  ('TSK-RA-007-07', 'AGT-DECISION-SYNTHESIZER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Parallel vs sequential analysis"}'::jsonb),
  ('TSK-RA-007-08', 'AGT-REGULATORY-COMPLIANCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Plan quality harmonization"}'::jsonb),
  ('TSK-RA-007-09', 'AGT-PROJECT-COORDINATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Create global timeline"}'::jsonb)
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
  ('TSK-RA-007-05', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve harmonization opportunities"}'::jsonb),
  ('TSK-RA-007-06', 'P01_CLINDEV_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P06_DTXCMO', '{"role": "Approve trial design"}'::jsonb),
  ('TSK-RA-007-06', 'P04_REGDIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review of trial"}'::jsonb),
  ('TSK-RA-007-07', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve sequencing strategy"}'::jsonb),
  ('TSK-RA-007-09', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve global timeline"}'::jsonb)
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
  ('TSK-RA-007-03', 'TOOL-REGULATORY-DB', 'EMA research'),
  ('TSK-RA-007-09', 'TOOL-PROJECT-MGMT', 'Timeline creation')
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
  ('TSK-RA-007-02', 'RAG-FDA-GUIDANCE', 'FDA submission requirements, De Novo process, 510(k) pathway',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "FDA requirements"}'::jsonb),
  ('TSK-RA-007-03', 'RAG-EMA-GUIDANCE', 'EU MDR requirements, CE Mark process, notified body requirements',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "EU requirements"}'::jsonb),
  ('TSK-RA-007-05', 'RAG-ICH-GUIDELINES', 'ICH harmonization guidelines, international standards, IMDRF guidance',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "Harmonization guidance"}'::jsonb),
  ('TSK-RA-007-06', 'RAG-ICH-GUIDELINES', 'ICH E9 statistical principles, globally accepted endpoints',
   '{"max_results": 5, "similarity_threshold": 0.8}'::jsonb, '{"purpose": "Trial harmonization"}'::jsonb),
  ('TSK-RA-007-08', 'RAG-ISO-STANDARDS', 'ISO 13485 quality management, IEC 62304 software lifecycle',
   '{"max_results": 5, "similarity_threshold": 0.85}'::jsonb, '{"purpose": "Quality standards"}'::jsonb)
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id)
DO UPDATE SET note = EXCLUDED.note;

SELECT 'UC_RA_007 Part 2 Seeded' as status;

