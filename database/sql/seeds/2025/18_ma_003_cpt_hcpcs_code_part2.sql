-- ==================================================================================
-- 18_ma_003_cpt_hcpcs_code_part2.sql - UC_MA_003 Part 2: Assignments
-- ==================================================================================
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, note)
SELECT sc.tenant_id, t.id, dt.id, dep_data.note FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-003-02', 'TSK-MA-003-01', 'Strategy requires landscape'),
  ('TSK-MA-003-03', 'TSK-MA-003-02', 'Application requires strategy'),
  ('TSK-MA-003-04', 'TSK-MA-003-02', 'Interim billing aligns with strategy'),
  ('TSK-MA-003-05', 'TSK-MA-003-03', 'Stakeholder support for application'),
  ('TSK-MA-003-06', 'TSK-MA-003-03', 'Submit after prep'),
  ('TSK-MA-003-06', 'TSK-MA-003-05', 'Submit with stakeholder support')
) AS dep_data(task_code, depends_on_code, note)
INNER JOIN dh_task t ON t.code = dep_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_task dt ON dt.code = dep_data.depends_on_code AND dt.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO UPDATE SET note = EXCLUDED.note;

-- AGENTS
INSERT INTO dh_task_agent (tenant_id, task_id, agent_id, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
SELECT sc.tenant_id, t.id, a.id, agent_data.assignment_type, agent_data.execution_order, agent_data.requires_human_approval, agent_data.max_retries, agent_data.retry_strategy, agent_data.is_parallel, agent_data.approval_persona_code, agent_data.approval_stage, agent_data.on_failure, agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-003-01', 'AGT-LITERATURE-SEARCH', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb),
  ('TSK-MA-003-02', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb),
  ('TSK-MA-003-03', 'AGT-CLINICAL-REPORT-WRITER', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb),
  ('TSK-MA-003-04', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P21_MA_DIR', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb),
  ('TSK-MA-003-05', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P24_PAYER_REL', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb),
  ('TSK-MA-003-06', 'AGT-WORKFLOW-ORCHESTRATOR', 'PRIMARY_EXECUTOR', 1, true, 2, 'EXPONENTIAL_BACKOFF', false, 'P05_REGAFF', 'AFTER_EXECUTION', 'ESCALATE_TO_HUMAN', '{}'::jsonb)
) AS agent_data(task_code, agent_code, assignment_type, execution_order, requires_human_approval, max_retries, retry_strategy, is_parallel, approval_persona_code, approval_stage, on_failure, metadata)
INNER JOIN dh_task t ON t.code = agent_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_agent a ON a.code = agent_data.agent_code AND a.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, agent_id, assignment_type) DO UPDATE SET metadata = EXCLUDED.metadata;

-- PERSONAS
INSERT INTO dh_task_persona (tenant_id, task_id, persona_id, responsibility, review_timing, escalation_to_persona_code, metadata)
SELECT sc.tenant_id, t.id, p.id, persona_data.responsibility, persona_data.review_timing, persona_data.escalation_to_persona_code, persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-003-01', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-02', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-02', 'P05_REGAFF', 'REVIEW', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-03', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-04', 'P21_MA_DIR', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-05', 'P24_PAYER_REL', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb),
  ('TSK-MA-003-06', 'P05_REGAFF', 'APPROVE', 'AFTER_AGENT_RUNS', NULL, '{}'::jsonb)
) AS persona_data(task_code, persona_code, responsibility, review_timing, escalation_to_persona_code, metadata)
INNER JOIN dh_task t ON t.code = persona_data.task_code AND t.tenant_id = sc.tenant_id
INNER JOIN dh_persona p ON p.code = persona_data.persona_code AND p.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, persona_id, responsibility) DO UPDATE SET metadata = EXCLUDED.metadata;

SELECT 'MA-003 Part 2 Complete' as status;

