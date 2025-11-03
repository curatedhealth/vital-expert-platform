-- =====================================================================================
-- UC_RA_007: International Harmonization Strategy - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Strategic approach to harmonizing regulatory submissions across FDA, EMA, PMDA, Health Canada
-- Dependencies: UC_RA_001, UC_RA_002, UC_RA_003
-- Complexity: EXPERT
-- Pattern: MULTI_JURISDICTIONAL
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
SELECT sc.tenant_id, d.id, 'UC_RA_007', 'USC-RA-007', 'International Harmonization Strategy',
  'Strategic approach to harmonizing regulatory submissions across FDA (US), EMA (EU), PMDA (Japan), Health Canada, and other global bodies', 'Expert',
  jsonb_build_object('estimated_duration_minutes', 240,
    'prerequisites', json_build_array('Target markets (US, EU, Japan, etc.)', 'Product classification by jurisdiction', 'Clinical data available', 'Market prioritization'),
    'deliverables', json_build_array('Multi-jurisdictional regulatory strategy', 'Harmonized clinical development plan', 'Submission sequencing', 'Data sharing opportunities', 'Risk assessment by jurisdiction'),
    'success_metrics', jsonb_build_object('harmonization_efficiency', '40% time reduction vs sequential', 'global_success_rate', '90%+ multi-market approval'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW 1
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Global Regulatory Landscape Analysis', 'WFL-RA-007-001',
  'Comprehensive analysis of regulatory requirements across target markets', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'EXPERT', 'pattern', 'MULTI_JURISDICTIONAL')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, metadata = EXCLUDED.metadata;

-- WORKFLOW 2
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Harmonization Strategy Development', 'WFL-RA-007-002',
  'Development of unified global regulatory strategy with optimal sequencing', 2,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'EXPERT', 'pattern', 'STRATEGIC_PLANNING')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, metadata = EXCLUDED.metadata;

-- TASKS FOR WORKFLOW 1
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-01', 'TSK-RA-007-01', 'Map Regulatory Requirements by Jurisdiction', 'Identify classification, pathways, data requirements for each market', 1, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-007-02', 'TSK-RA-007-02', 'Analyze FDA Requirements', 'Detailed analysis of US FDA requirements for product', 2, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-03', 'TSK-RA-007-03', 'Analyze EMA/EU MDR Requirements', 'Detailed analysis of EU requirements and CE Mark pathway', 3, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-04', 'TSK-RA-007-04', 'Analyze PMDA/Health Canada Requirements', 'Analysis of Japan, Canada, and other target markets', 4, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-05', 'TSK-RA-007-05', 'Identify Harmonization Opportunities', 'Find common requirements, data sharing opportunities, aligned endpoints', 5, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-007-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective;

-- TASKS FOR WORKFLOW 2
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-06', 'TSK-RA-007-06', 'Design Harmonized Clinical Trial', 'Design ONE pivotal trial accepted by multiple agencies', 1, '{"complexity": "EXPERT", "duration_minutes": 40}'::jsonb),
  ('TSK-RA-007-07', 'TSK-RA-007-07', 'Develop Submission Sequencing Strategy', 'Determine parallel vs sequential approach and optimal order', 2, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-007-08', 'TSK-RA-007-08', 'Plan Quality Management Harmonization', 'Align ISO 13485, IEC 62304, and other quality standards', 3, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-09', 'TSK-RA-007-09', 'Create Global Regulatory Timeline', 'Develop integrated timeline with dependencies and milestones', 4, '{"complexity": "ADVANCED", "duration_minutes": 30}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-007-002' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective;

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-02', 'TSK-RA-007-01'), ('TSK-RA-007-03', 'TSK-RA-007-01'), ('TSK-RA-007-04', 'TSK-RA-007-01'),
  ('TSK-RA-007-05', 'TSK-RA-007-02'), ('TSK-RA-007-05', 'TSK-RA-007-03'), ('TSK-RA-007-05', 'TSK-RA-007-04'),
  ('TSK-RA-007-06', 'TSK-RA-007-05'), ('TSK-RA-007-07', 'TSK-RA-007-06'), ('TSK-RA-007-08', 'TSK-RA-007-05'), ('TSK-RA-007-09', 'TSK-RA-007-07')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- AGENTS
INSERT INTO dh_task_agent (tenant_id, task_id, agent_id, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order, agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy, agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage, agent_data.on_failure, agent_data.metadata
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-01', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Map requirements"}'::jsonb),
  ('TSK-RA-007-02', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze FDA"}'::jsonb),
  ('TSK-RA-007-03', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze EU MDR"}'::jsonb),
  ('TSK-RA-007-04', 'AGT-REGULATORY-INTELLIGENCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'LINEAR', false, NULL, NULL, 'RETRY', '{"role": "Analyze Japan/Canada"}'::jsonb),
  ('TSK-RA-007-05', 'AGT-DECISION-SYNTHESIZER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Identify harmonization"}'::jsonb),
  ('TSK-RA-007-06', 'AGT-PROTOCOL-DESIGNER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P01_CLINDEV_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Design harmonized trial"}'::jsonb),
  ('TSK-RA-007-07', 'AGT-REGULATORY-STRATEGY', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Determine sequencing"}'::jsonb),
  ('TSK-RA-007-08', 'AGT-REGULATORY-COMPLIANCE', 'PRIMARY_EXECUTOR', 1, false, 2, 'EXPONENTIAL_BACKOFF', false, NULL, NULL, 'RETRY', '{"role": "Plan quality harmonization"}'::jsonb),
  ('TSK-RA-007-09', 'AGT-PROJECT-COORDINATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P03_REGDIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{"role": "Create global timeline"}'::jsonb)
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET execution_order = EXCLUDED.execution_order;

-- PERSONAS
INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing, persona_data.escalation_to_persona_code, persona_data.metadata
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-05', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve harmonization opportunities"}'::jsonb),
  ('TSK-RA-007-06', 'P01_CLINDEV_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', 'P06_DTXCMO', '{"role": "Approve trial design"}'::jsonb),
  ('TSK-RA-007-06', 'P04_REGDIR', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{"role": "Regulatory review"}'::jsonb),
  ('TSK-RA-007-07', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve sequencing"}'::jsonb),
  ('TSK-RA-007-09', 'P03_REGDIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{"role": "Approve timeline"}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET review_timing = EXCLUDED.review_timing;

-- TOOLS
INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, purpose)
SELECT sc.tenant_id, t.id, tool.id, tool_data.purpose FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-03', 'TOOL-REGULATORY-DB', 'EMA research'),
  ('TSK-RA-007-09', 'TOOL-PROJECT-MGMT', 'Timeline creation')
) AS tool_data(task_code, tool_code, purpose)
INNER JOIN dh_task t ON t.code = tool_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_tool tool ON tool.code = tool_data.tool_code AND tool.tenant_id = sc.tenant_id
ON CONFLICT (task_id, tool_id) DO UPDATE SET purpose = EXCLUDED.purpose;

-- RAGS
INSERT INTO dh_task_rag (tenant_id, task_id, rag_source_id, note)
SELECT sc.tenant_id, t.id, rag.id, rag_data.note FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-007-02', 'RAG-FDA-GUIDANCE', 'FDA submission requirements, De Novo process, 510(k) pathway'),
  ('TSK-RA-007-03', 'RAG-EMA-GUIDANCE', 'EU MDR requirements, CE Mark process'),
  ('TSK-RA-007-05', 'RAG-ICH-GUIDELINES', 'ICH harmonization guidelines, IMDRF guidance'),
  ('TSK-RA-007-08', 'RAG-ISO-STANDARDS', 'ISO 13485, IEC 62304 standards')
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
  WHERE uc.code = 'UC_RA_007' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE ''; RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_007: International Harmonization Strategy';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tasks: %, Agents: %, Personas: %, Tools: %, RAGs: %', v_task_count, v_agent_count, v_persona_count, v_tool_count, v_rag_count;
  RAISE NOTICE '========================================'; RAISE NOTICE '✓ UC_RA_007 seeded successfully!'; RAISE NOTICE '';
END $$;
