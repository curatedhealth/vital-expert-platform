-- =====================================================================================
-- UC_RA_010: Post-Market Surveillance Planning - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_010', 'USC-RA-010', 'Post-Market Surveillance Planning', 'RA',
  'Development of Post-Market Surveillance (PMS) plans to monitor device safety and effectiveness after market authorization, satisfying FDA and EU MDR requirements',
  'INTERMEDIATE', 120,
  json_build_array('Device risk classification', 'Identified risks', 'Market size', 'Regulatory requirements (FDA, EU MDR)', 'Data sources')::jsonb,
  json_build_array('Post-Market Surveillance Plan', 'Data collection procedures', 'Analysis and reporting schedule', 'Adverse event monitoring system', 'PMCF/PMSR protocol')::jsonb,
  jsonb_build_object('regulatory_compliance', '100% FDA/EU MDR compliance', 'data_capture', '95% completeness')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Post-Market Surveillance Planning Workflow', 'WFL-RA-010-001',
  'Comprehensive post-market surveillance plan development for FDA and EU MDR', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'INTERMEDIATE', 'pattern', 'COT_WITH_CHECKLIST')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_010' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-010-01', 'TSK-RA-010-01', 'Define PMS Scope & Objectives', 'Establish surveillance objectives based on device risk and regulatory requirements', 1, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-010-02', 'TSK-RA-010-02', 'Identify Surveillance Data Sources', 'Determine sources: adverse events, registries, claims data, in-app data, surveys', 2, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-010-03', 'TSK-RA-010-03', 'Design Data Collection Procedures', 'Develop procedures for passive (adverse events) and active (PMCF) data collection', 3, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-010-04', 'TSK-RA-010-04', 'Establish Adverse Event Monitoring System', 'Implement FDA MDR and EU vigilance reporting procedures', 4, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-010-05', 'TSK-RA-010-05', 'Develop Analysis & Reporting Schedule', 'Define analysis frequency, reporting templates, and trigger thresholds', 5, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-010-06', 'TSK-RA-010-06', 'Create PMCF Protocol (EU MDR)', 'Develop Post-Market Clinical Follow-up protocol for EU market', 6, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-010-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-010-02', 'TSK-RA-010-01'), ('TSK-RA-010-03', 'TSK-RA-010-02'),
  ('TSK-RA-010-04', 'TSK-RA-010-03'), ('TSK-RA-010-05', 'TSK-RA-010-04'),
  ('TSK-RA-010-06', 'TSK-RA-010-03')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_010 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_010' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

