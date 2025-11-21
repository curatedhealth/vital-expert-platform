-- =====================================================================================
-- UC_RA_009: Software Validation Documentation - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_009', 'USC-RA-009', 'Software Validation Documentation', 'RA',
  'Comprehensive software validation documentation following FDA guidance and IEC 62304 standards for software lifecycle processes',
  'ADVANCED', 180,
  json_build_array('Software description', 'Intended use', 'Requirements specifications', 'Verification testing results', 'Change control procedures')::jsonb,
  json_build_array('Software Requirements Specification (SRS)', 'Software Design Specification (SDS)', 'V&V Plan', 'Test Protocols & Reports', 'Traceability Matrix')::jsonb,
  jsonb_build_object('fda_acceptance', '100% IEC 62304 compliance', 'traceability', 'Complete requirements traceability')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Software Validation Documentation Workflow', 'WFL-RA-009-001',
  'Comprehensive software validation per FDA guidance and IEC 62304', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED', 'pattern', 'STRUCTURED_TEMPLATE')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_009' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-009-01', 'TSK-RA-009-01', 'Determine Software Safety Classification', 'Classify software per IEC 62304 (Class A, B, or C based on risk)', 1, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-009-02', 'TSK-RA-009-02', 'Develop Software Requirements Specification (SRS)', 'Document all software requirements with unique IDs', 2, '{"complexity": "ADVANCED", "duration_minutes": 40}'::jsonb),
  ('TSK-RA-009-03', 'TSK-RA-009-03', 'Create Software Design Specification (SDS)', 'Document software architecture and detailed design', 3, '{"complexity": "ADVANCED", "duration_minutes": 35}'::jsonb),
  ('TSK-RA-009-04', 'TSK-RA-009-04', 'Develop Verification & Validation (V&V) Plan', 'Plan unit testing, integration testing, system testing strategies', 4, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-009-05', 'TSK-RA-009-05', 'Create Test Protocols', 'Develop detailed test cases for each requirement', 5, '{"complexity": "INTERMEDIATE", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-009-06', 'TSK-RA-009-06', 'Generate Traceability Matrix', 'Link requirements -> design -> code -> tests', 6, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-009-07', 'TSK-RA-009-07', 'Document Software Development Lifecycle', 'Document development planning, risk management, change control processes', 7, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb),
  ('TSK-RA-009-08', 'TSK-RA-009-08', 'Compile Software Validation Package', 'Assemble all validation documentation for FDA submission', 8, '{"complexity": "INTERMEDIATE", "duration_minutes": 10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-009-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-009-02', 'TSK-RA-009-01'), ('TSK-RA-009-03', 'TSK-RA-009-02'),
  ('TSK-RA-009-04', 'TSK-RA-009-03'), ('TSK-RA-009-05', 'TSK-RA-009-04'),
  ('TSK-RA-009-06', 'TSK-RA-009-05'), ('TSK-RA-009-08', 'TSK-RA-009-06'), ('TSK-RA-009-08', 'TSK-RA-009-07')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_009 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_009' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

