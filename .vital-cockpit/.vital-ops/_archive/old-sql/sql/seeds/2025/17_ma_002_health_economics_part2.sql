-- =====================================================================================
-- 17_ma_002_health_economics_part2.sql
-- UC_MA_002: Health Economics Model (DTx) - Part 2: Assignments
-- =====================================================================================

CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config (tenant_id, tenant_slug) SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- TASK DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, note)
SELECT sc.tenant_id, t.id, dt.id, dep_data.note FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-002-02', 'TSK-MA-002-01', 'Model build requires architecture'),
  ('TSK-MA-002-03', 'TSK-MA-002-02', 'Input population requires model structure'),
  ('TSK-MA-002-04', 'TSK-MA-002-03', 'ICER calculation requires inputs'),
  ('TSK-MA-002-05', 'TSK-MA-002-01', 'BIM requires architecture decisions'),
  ('TSK-MA-002-05', 'TSK-MA-002-03', 'BIM uses same inputs'),
  ('TSK-MA-002-06', 'TSK-MA-002-04', 'Sensitivity requires base case ICER'),
  ('TSK-MA-002-06', 'TSK-MA-002-05', 'Sensitivity includes BIM scenarios'),
  ('TSK-MA-002-07', 'TSK-MA-002-04', 'Validation requires complete model'),
  ('TSK-MA-002-07', 'TSK-MA-002-06', 'Narrative uses sensitivity results')
) AS dep_data(task_code, depends_on_code, note)
INNER JOIN dh_task t ON t.code = dep_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_task dt ON dt.code = dep_data.depends_on_code AND dt.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO UPDATE SET note = EXCLUDED.note;

-- AGENT ASSIGNMENTS
INSERT INTO dh_task_agent (tenant_id, task_id, agent_id, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order, agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy, agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage, agent_data.on_failure, agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-002-01', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Define architecture"}'::jsonb),
  ('TSK-MA-002-02', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Build CEA model"}'::jsonb),
  ('TSK-MA-002-03', 'AGT-LITERATURE-SEARCH', 'CO_EXECUTOR', 1, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Gather inputs"}'::jsonb),
  ('TSK-MA-002-03', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 2, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Populate model"}'::jsonb),
  ('TSK-MA-002-04', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Calculate ICER"}'::jsonb),
  ('TSK-MA-002-05', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Build BIM"}'::jsonb),
  ('TSK-MA-002-06', 'AGT-BIOSTATISTICS', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Sensitivity analyses"}'::jsonb),
  ('TSK-MA-002-07', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P22_HEOR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Validate and narrate"}'::jsonb)
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET execution_order = EXCLUDED.execution_order, metadata = EXCLUDED.metadata;

-- PERSONA ASSIGNMENTS
INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing, persona_data.escalation_to_persona_code, persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-002-01', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "Architecture approval"}'::jsonb),
  ('TSK-MA-002-02', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Model structure approval"}'::jsonb),
  ('TSK-MA-002-03', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Input validation"}'::jsonb),
  ('TSK-MA-002-04', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P21_MA_DIR', '{"role": "ICER interpretation"}'::jsonb),
  ('TSK-MA-002-05', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "BIM approval"}'::jsonb),
  ('TSK-MA-002-06', 'P22_HEOR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Sensitivity review"}'::jsonb),
  ('TSK-MA-002-06', 'P04_BIOSTAT', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Statistical review"}'::jsonb),
  ('TSK-MA-002-07', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final approval"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET metadata = EXCLUDED.metadata;

-- TOOL MAPPINGS
INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, connection_config)
SELECT sc.tenant_id, t.id, tool.id, tool_data.connection_config FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-002-02', 'TOOL-R-STATS', '{"software": "R", "purpose": "CEA modeling", "packages": ["heemod", "BCEA"]}'::jsonb),
  ('TSK-MA-002-03', 'TOOL-PUBMED', '{"database": "PubMed", "purpose": "Literature search for inputs"}'::jsonb),
  ('TSK-MA-002-05', 'TOOL-R-STATS', '{"software": "R", "purpose": "BIM modeling"}'::jsonb),
  ('TSK-MA-002-06', 'TOOL-R-STATS', '{"software": "R", "purpose": "PSA and sensitivity", "packages": ["BCEA"]}'::jsonb)
) AS tool_data(task_code, tool_code, connection_config)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id) DO UPDATE SET connection_config = EXCLUDED.connection_config;

-- RAG SOURCE MAPPINGS
INSERT INTO dh_task_rag (tenant_id, task_id, rag_source_id, query_context, search_config)
SELECT sc.tenant_id, t.id, rag.id, rag_data.query_context, rag_data.search_config FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-002-01', 'RAG-ISPOR-CEA', 'ISPOR guidelines for model structure', '{"focus": "Model selection", "priority": "high"}'::jsonb),
  ('TSK-MA-002-04', 'RAG-ISPOR-CEA', 'ISPOR CEA methodology', '{"focus": "ICER calculation", "priority": "high"}'::jsonb),
  ('TSK-MA-002-05', 'RAG-ISPOR-BIM', 'ISPOR BIM guidelines', '{"focus": "Budget impact", "priority": "high"}'::jsonb),
  ('TSK-MA-002-07', 'RAG-ISPOR-CEA', 'ISPOR validation checklist', '{"focus": "Model validation", "priority": "high"}'::jsonb)
) AS rag_data(task_code, rag_code, query_context, search_config)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id) DO UPDATE SET query_context = EXCLUDED.query_context;

SELECT 'MA-002 Part 2 Complete' as status;

