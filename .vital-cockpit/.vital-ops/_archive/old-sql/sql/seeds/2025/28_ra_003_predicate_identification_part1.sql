-- =====================================================================================
-- UC_RA_003: Predicate Device Identification - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN
  RAISE EXCEPTION 'No tenant_id in session_config';
END IF; END $$;

INSERT INTO dh_use_case (
  tenant_id, code, unique_id, title, domain, description,
  complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics
)
SELECT sc.tenant_id, 'UC_RA_003', 'USC-RA-003', 'Predicate Device Identification', 'RA',
  'Systematic identification and analysis of potential predicate devices for 510(k) submissions',
  'ADVANCED', 90,
  json_build_array('Device description', 'Intended use', 'Technological characteristics', 'Performance specifications')::jsonb,
  json_build_array('3-5 predicate candidates', 'Substantial equivalence matrix', 'Primary predicate recommendation', 'Risk mitigation for differences')::jsonb,
  jsonb_build_object('predicate_quality', '90% acceptance rate by FDA', 'time_saved', '75% vs manual search')
FROM session_config sc
ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Predicate Search & Analysis Workflow', 'WFL-RA-003-001',
  'Systematic predicate device identification with substantial equivalence analysis', 1,
  jsonb_build_object('duration_minutes', 90, 'complexity', 'ADVANCED', 'pattern', 'RAG_WITH_SEARCH')
FROM session_config sc
CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_003' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-003-01', 'TSK-RA-003-01', 'Define Search Criteria', 'Extract intended use, technological characteristics, and product code', 1, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-003-02', 'TSK-RA-003-02', 'Search FDA 510(k) Database', 'Conduct systematic search for devices with similar intended use', 2, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-003-03', 'TSK-RA-003-03', 'Review K-Summaries', 'Analyze 510(k) summary documents for potential predicates', 3, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-003-04', 'TSK-RA-003-04', 'Build Substantial Equivalence Matrix', 'Compare your device vs predicates on intended use, technology, performance', 4, '{"complexity": "EXPERT", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-003-05', 'TSK-RA-003-05', 'Recommend Primary Predicate', 'Select best predicate and document rationale', 5, '{"complexity": "ADVANCED", "duration_minutes": 10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-003-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-003-02', 'TSK-RA-003-01'), ('TSK-RA-003-03', 'TSK-RA-003-02'),
  ('TSK-RA-003-04', 'TSK-RA-003-03'), ('TSK-RA-003-05', 'TSK-RA-003-04')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_003 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_003' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

