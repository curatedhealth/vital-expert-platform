-- ==================================================================================================================================
-- UC_RA_006: FDA Breakthrough Designation Strategy - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Strategic assessment and application for FDA Breakthrough Device Designation for expedited review
-- Dependencies: UC_RA_001, UC_RA_002
-- Complexity: EXPERT
-- Pattern: COT_WITH_CRITERIA
-- =====================================================================================

-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
  DELETE FROM session_config;
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Tenant "digital-health-startup" not found'; END IF;
  RAISE NOTICE '✓ Using tenant_id: %', v_tenant_id;
END $$;

-- USE CASE
INSERT INTO dh_use_case (tenant_id, domain_id, code, unique_id, title, summary, complexity, metadata)
SELECT sc.tenant_id, d.id, 'UC_RA_006', 'USC-RA-006', 'FDA Breakthrough Designation Strategy',
  'Strategic assessment and application for FDA Breakthrough Device Designation for expedited review', 'Expert',
  jsonb_build_object('estimated_duration_minutes', 120,
    'prerequisites', json_build_array('Device description', 'Life-threatening/debilitating indication', 'Clinical data or preliminary evidence', 'Unmet medical need assessment'),
    'deliverables', json_build_array('Breakthrough Designation application', 'Eligibility assessment', 'Unmet need justification', 'Preliminary data summary', 'Expedited pathway strategy'),
    'success_metrics', jsonb_build_object('designation_success', '70% application grant rate', 'time_to_market', '25% reduction in approval timeline'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Breakthrough Designation Workflow', 'WFL-RA-006-001',
  'Systematic breakthrough designation assessment and application development', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'EXPERT', 'pattern', 'COT_WITH_CRITERIA')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_006' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, metadata = EXCLUDED.metadata;

-- TASKS
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-01', 'TSK-RA-006-01', 'Assess Life-Threatening/Debilitating Criteria', 'Determine if indication meets FDA criteria for serious disease', 1, '{"complexity": "EXPERT", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-006-02', 'TSK-RA-006-02', 'Evaluate More Effective Treatment Claim', 'Assess if device provides significant improvement vs standard of care', 2, '{"complexity": "EXPERT", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-006-03', 'TSK-RA-006-03', 'Document Unmet Medical Need', 'Establish unmet need and inadequacy of alternatives', 3, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-006-04', 'TSK-RA-006-04', 'Compile Preliminary Clinical Evidence', 'Summarize clinical, non-clinical, or other relevant data', 4, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-006-05', 'TSK-RA-006-05', 'Develop Expedited Pathway Strategy', 'Plan Sprint discussions, data generation, submission strategy', 5, '{"complexity": "EXPERT", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-006-06', 'TSK-RA-006-06', 'Prepare Breakthrough Application', 'Compile complete designation request with supporting documentation', 6, '{"complexity": "ADVANCED", "duration_minutes": 10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-006-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective;

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-02', 'TSK-RA-006-01'), ('TSK-RA-006-03', 'TSK-RA-006-02'),
  ('TSK-RA-006-04', 'TSK-RA-006-03'), ('TSK-RA-006-05', 'TSK-RA-006-04'),
  ('TSK-RA-006-06', 'TSK-RA-006-05')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- AGENTS
INSERT INTO dh_task_agent (tenant_id, task_id, agent_id, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order, agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy, agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage, agent_data.on_failure, agent_data.metadata
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Assess disease severity"}'::jsonb),
  ('TSK-RA-006-01', 'AGT-CLINICAL-ENDPOINT', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Clinical impact analysis"}'::jsonb),
  ('TSK-RA-006-02', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Evaluate treatment claim"}'::jsonb),
  ('TSK-RA-006-02', 'AGT-EVIDENCE-SYNTHESIZER', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Comparative effectiveness"}'::jsonb),
  ('TSK-RA-006-03', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Unmet need research"}'::jsonb),
  ('TSK-RA-006-03', 'AGT-CLINICAL-REPORT-WRITER', 'CO_EXECUTOR', 2, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Document unmet need"}'::jsonb),
  ('TSK-RA-006-04', 'AGT-EVIDENCE-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Compile evidence"}'::jsonb),
  ('TSK-RA-006-04', 'AGT-BIOSTATISTICS', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', true, NULL, NULL, 'RETRY', '{"role": "Statistical evidence"}'::jsonb),
  ('TSK-RA-006-05', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Develop expedited strategy"}'::jsonb),
  ('TSK-RA-006-05', 'AGT-PROJECT-COORDINATOR', 'CO_EXECUTOR', 2, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Plan Sprint discussions"}'::jsonb),
  ('TSK-RA-006-06', 'AGT-SUBMISSION-COMPILER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Compile application"}'::jsonb),
  ('TSK-RA-006-06', 'AGT-DOCUMENT-VALIDATOR', 'VALIDATOR', 2, false, 1, 'NONE', false, NULL, NULL, 'FAIL', '{"role": "Validate completeness"}'::jsonb)
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET execution_order = EXCLUDED.execution_order;

-- PERSONAS
INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing, persona_data.escalation_to_persona_code, persona_data.metadata
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-01', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve eligibility"}'::jsonb),
  ('TSK-RA-006-01', 'P06_DTXCMO', 'CONSULT', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical severity input"}'::jsonb),
  ('TSK-RA-006-02', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve superiority claim"}'::jsonb),
  ('TSK-RA-006-02', 'P06_DTXCMO', 'VALIDATE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Validate clinical claims"}'::jsonb),
  ('TSK-RA-006-05', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve strategy"}'::jsonb),
  ('TSK-RA-006-06', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final application approval"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET review_timing = EXCLUDED.review_timing;

-- TOOLS
INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, purpose)
SELECT sc.tenant_id, t.id, tool.id, tool_data.purpose FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-03', 'TOOL-LITERATURE-SEARCH', 'Unmet need research'),
  ('TSK-RA-006-06', 'TOOL-DOCUMENT-MGMT', 'Application compilation')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id) DO UPDATE SET purpose = EXCLUDED.purpose;

-- RAGS
INSERT INTO dh_task_rag (tenant_id, task_id, rag_source_id, note)
SELECT sc.tenant_id, t.id, rag.id, rag_data.note FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-006-01', 'RAG-FDA-GUIDANCE', 'Breakthrough Device Program guidance, life-threatening disease criteria'),
  ('TSK-RA-006-02', 'RAG-FDA-DIGITAL-HEALTH', 'DTx breakthrough precedents, EndeavorRx reSET-O examples'),
  ('TSK-RA-006-05', 'RAG-FDA-GUIDANCE', 'Sprint discussions, expedited review process, breakthrough benefits')
) AS rag_data(task_code, rag_code, note)
INNER JOIN dh_task t ON t.code = rag_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_rag_source rag ON rag.code = rag_data.rag_code AND rag.tenant_id = sc.tenant_id
ON CONFLICT (task_id, rag_source_id) DO UPDATE SET note = EXCLUDED.note;

-- VERIFICATION
DO $$
DECLARE v_task_count INT; v_agent_count INT; v_persona_count INT; v_tool_count INT; v_rag_count INT;
BEGIN
  SELECT COUNT(DISTINCT t.id), COUNT(DISTINCT ta.id), COUNT(DISTINCT tp.id), COUNT(DISTINCT tt.id), COUNT(DISTINCT tr.id)
  INTO v_task_count, v_agent_count, v_persona_count, v_tool_count, v_rag_count
  FROM dh_use_case uc CROSS JOIN dh_workflow wf LEFT JOIN dh_task t ON t.workflow_id = wf.id
  LEFT JOIN dh_task_agent ta ON ta.task_id = t.id LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
  LEFT JOIN dh_task_tool tt ON tt.task_id = t.id LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
  WHERE uc.code = 'UC_RA_006' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE ''; RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_006: FDA Breakthrough Designation Strategy';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tasks: %, Agents: %, Personas: %, Tools: %, RAGs: %', v_task_count, v_agent_count, v_persona_count, v_tool_count, v_rag_count;
  RAISE NOTICE '========================================'; RAISE NOTICE '✓ UC_RA_006 seeded successfully!'; RAISE NOTICE '';
END $$;
