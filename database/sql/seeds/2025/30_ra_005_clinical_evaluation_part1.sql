-- =====================================================================================
-- UC_RA_005: Clinical Evaluation Report (CER) - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_005', 'USC-RA-005', 'Clinical Evaluation Report (CER)', 'RA',
  'Development of Clinical Evaluation Reports (CER) for medical devices, required for CE Mark (EU MDR) and expected by FDA for novel DTx',
  'ADVANCED', 180,
  json_build_array('Device description', 'Clinical data (trials, literature, PMCF)', 'Risk analysis', 'Intended use and claims')::jsonb,
  json_build_array('Complete CER document (MEDDEV 2.7/1 Rev 4 compliant)', 'Clinical data summary tables', 'Risk-benefit analysis', 'Literature review methodology')::jsonb,
  jsonb_build_object('cer_quality', 'MEDDEV 2.7/1 compliant', 'notified_body_acceptance', '95% acceptance rate')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'CER Development Workflow', 'WFL-RA-005-001',
  'Comprehensive Clinical Evaluation Report development per MEDDEV 2.7/1 Rev 4', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED', 'pattern', 'STRUCTURED_GENERATION')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_005' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
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
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-005-02', 'TSK-RA-005-01'), ('TSK-RA-005-03', 'TSK-RA-005-02'),
  ('TSK-RA-005-04', 'TSK-RA-005-03'), ('TSK-RA-005-05', 'TSK-RA-005-04'),
  ('TSK-RA-005-07', 'TSK-RA-005-05'), ('TSK-RA-005-07', 'TSK-RA-005-06'),
  ('TSK-RA-005-08', 'TSK-RA-005-07')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_005 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_005' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

