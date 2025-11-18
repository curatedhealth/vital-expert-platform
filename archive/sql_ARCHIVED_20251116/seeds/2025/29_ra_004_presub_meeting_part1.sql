-- =====================================================================================
-- UC_RA_004: Pre-Submission Meeting Preparation - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_004', 'USC-RA-004', 'Pre-Submission Meeting Preparation', 'RA',
  'Comprehensive preparation for FDA Pre-Submission (Pre-Sub) meetings to maximize value from FDA feedback',
  'INTERMEDIATE', 120,
  json_build_array('Device description', 'Proposed regulatory strategy', 'Clinical development plan', 'Data available')::jsonb,
  json_build_array('Pre-Sub meeting request package', 'Prioritized question list', 'Background materials', 'Meeting agenda', 'Follow-up strategy')::jsonb,
  jsonb_build_object('fda_acceptance', '95% meeting granted rate', 'question_quality', 'Clear, answerable questions')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Pre-Sub Package Development Workflow', 'WFL-RA-004-001',
  'Systematic preparation of FDA Pre-Submission meeting materials', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'INTERMEDIATE', 'pattern', 'STRUCTURED_TEMPLATE')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_004' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-004-01', 'TSK-RA-004-01', 'Define Meeting Objectives', 'Identify key decisions needed from FDA and prioritize topics', 1, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-004-02', 'TSK-RA-004-02', 'Formulate Strategic Questions', 'Draft 5-10 specific, answerable questions for FDA', 2, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-004-03', 'TSK-RA-004-03', 'Prepare Background Section', 'Compile device description, intended use, technology overview, regulatory precedent', 3, '{"complexity": "INTERMEDIATE", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-004-04', 'TSK-RA-004-04', 'Develop Clinical Study Summary', 'Summarize proposed clinical study design, endpoints, statistical approach', 4, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-004-05', 'TSK-RA-004-05', 'Compile Cover Letter & Package', 'Assemble complete Pre-Sub request per FDA format', 5, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-004-06', 'TSK-RA-004-06', 'Review & Finalize', 'Internal review, stakeholder alignment, final QC', 6, '{"complexity": "INTERMEDIATE", "duration_minutes": 10}'::jsonb),
  ('TSK-RA-004-07', 'TSK-RA-004-07', 'Prepare Meeting Strategy', 'Develop meeting agenda, speaker assignments, follow-up plan', 7, '{"complexity": "INTERMEDIATE", "duration_minutes": 10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-004-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-004-02', 'TSK-RA-004-01'), ('TSK-RA-004-03', 'TSK-RA-004-01'),
  ('TSK-RA-004-04', 'TSK-RA-004-01'), ('TSK-RA-004-05', 'TSK-RA-004-02'),
  ('TSK-RA-004-05', 'TSK-RA-004-03'), ('TSK-RA-004-05', 'TSK-RA-004-04'),
  ('TSK-RA-004-06', 'TSK-RA-004-05'), ('TSK-RA-004-07', 'TSK-RA-004-06')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_004 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_004' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

