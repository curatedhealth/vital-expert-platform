-- =====================================================================================
-- UC_RA_005: Clinical Evaluation Report (CER) - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Development of Clinical Evaluation Reports (CER) for medical devices, required for CE Mark (EU MDR)
-- Dependencies: UC_RA_001, UC_RA_002, UC_RA_003
-- Complexity: ADVANCED
-- Pattern: STRUCTURED_GENERATION
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
SELECT sc.tenant_id, d.id, 'UC_RA_005', 'USC-RA-005', 'Clinical Evaluation Report (CER)',
  'Development of Clinical Evaluation Reports (CER) for medical devices, required for CE Mark (EU MDR) and expected by FDA for novel DTx', 'Advanced',
  jsonb_build_object('estimated_duration_minutes', 180,
    'prerequisites', json_build_array('Device description', 'Clinical data (trials, literature, PMCF)', 'Risk analysis', 'Intended use and claims'),
    'deliverables', json_build_array('Complete CER document (MEDDEV 2.7/1 Rev 4 compliant)', 'Clinical data summary tables', 'Risk-benefit analysis', 'Literature review methodology'),
    'success_metrics', jsonb_build_object('cer_quality', 'MEDDEV 2.7/1 compliant', 'notified_body_acceptance', '95% acceptance rate'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'CER Development Workflow', 'WFL-RA-005-001',
  'Comprehensive Clinical Evaluation Report development per MEDDEV 2.7/1 Rev 4', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED', 'pattern', 'STRUCTURED_GENERATION')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_005' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, metadata = EXCLUDED.metadata;

-- TASKS
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-005-01', 'TSK-RA-005-01', 'Define CER Scope & Clinical Context', 'Establish disease/condition background, current management, unmet need', 1, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-005-02', 'TSK-RA-005-02', 'Conduct Systematic Literature Review', 'Perform MEDDEV-compliant systematic literature review', 2, '{"complexity": "ADVANCED", "duration_minutes": 40}'::jsonb),
  ('TSK-RA-005-03', 'TSK-RA-005-03', 'Appraise Clinical Studies', 'Assess validity and relevance of each identified study', 3, '{"complexity": "ADVANCED", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-005-04', 'TSK-RA-005-04', 'Summarize Clinical Data', 'Extract and synthesize safety and performance data', 4, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-005-05', 'TSK-RA-005-05', 'Perform Risk-Benefit Analysis', 'Analyze benefit-risk determination addressing all identified risks', 5, '{"complexity": "EXPERT", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-005-06', 'TSK-RA-005-06', 'Address PMCF Plan', 'Outline Post-Market Clinical Follow-up strategy', 6, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-005-07', 'TSK-RA-005-07', 'Compile Complete CER Document', 'Assemble all sections into MEDDEV 2.7/1 compliant CER', 7, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-005-08', 'TSK-RA-005-08', 'CER Review & Finalization', 'Clinical and regulatory review, notified body readiness check', 8, '{"complexity": "INTERMEDIATE", "duration_minutes": 10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-005-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective;

-- DEPENDENCIES (Note: Task 6 PMCF can run in parallel with task 5)
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-005-02', 'TSK-RA-005-01'), ('TSK-RA-005-03', 'TSK-RA-005-02'),
  ('TSK-RA-005-04', 'TSK-RA-005-03'), ('TSK-RA-005-05', 'TSK-RA-005-04'),
  ('TSK-RA-005-07', 'TSK-RA-005-05'), ('TSK-RA-005-07', 'TSK-RA-005-06'),
  ('TSK-RA-005-08', 'TSK-RA-005-07')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- AGENTS
INSERT INTO dh_task_agent (tenant_id, task_id, agent_id, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order, agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy, agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage, agent_data.on_failure, agent_data.metadata
FROM session_config sc CROSS JOIN (VALUES
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
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET execution_order = EXCLUDED.execution_order;

-- PERSONAS
INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing, persona_data.escalation_to_persona_code, persona_data.metadata
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-005-04', 'P06_DTXCMO', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical data review"}'::jsonb),
  ('TSK-RA-005-05', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P03_REGDIR', '{"role": "Approve risk-benefit"}'::jsonb),
  ('TSK-RA-005-05', 'P06_DTXCMO', 'CONSULT', 'AFTER_AGENT_RUNS', NULL, '{"role": "Clinical benefit input"}'::jsonb),
  ('TSK-RA-005-08', 'P04_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Final CER approval"}'::jsonb),
  ('TSK-RA-005-08', 'P02_MEDICAL_DIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Medical review"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET review_timing = EXCLUDED.review_timing;

-- TOOLS
INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, purpose)
SELECT sc.tenant_id, t.id, tool.id, tool_data.purpose FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-005-02', 'TOOL-LITERATURE-SEARCH', 'Systematic literature review'),
  ('TSK-RA-005-07', 'TOOL-DOCUMENT-MGMT', 'CER compilation')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id) DO UPDATE SET purpose = EXCLUDED.purpose;

-- RAGS
INSERT INTO dh_task_rag (tenant_id, task_id, rag_source_id, note)
SELECT sc.tenant_id, t.id, rag.id, rag_data.note FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-005-01', 'RAG-CLINICAL-ENDPOINTS', 'Disease background, current management, unmet medical need'),
  ('TSK-RA-005-02', 'RAG-PUBMED', 'Systematic literature review methodology, PRISMA guidelines'),
  ('TSK-RA-005-05', 'RAG-EMA-GUIDANCE', 'EU MDR risk-benefit analysis, MEDDEV 2.7/1 Rev 4 requirements'),
  ('TSK-RA-005-07', 'RAG-EMA-GUIDANCE', 'MEDDEV 2.7/1 Rev 4 template, CER structure requirements')
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
  WHERE uc.code = 'UC_RA_005' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE ''; RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_005: Clinical Evaluation Report (CER)';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tasks: %, Agents: %, Personas: %, Tools: %, RAGs: %', v_task_count, v_agent_count, v_persona_count, v_tool_count, v_rag_count;
  RAISE NOTICE '========================================'; RAISE NOTICE '✓ UC_RA_005 seeded successfully!'; RAISE NOTICE '';
END $$;
