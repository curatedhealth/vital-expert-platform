-- =====================================================================================
-- UC_RA_008: Cybersecurity Documentation (FDA) - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_008', 'USC-RA-008', 'Cybersecurity Documentation (FDA)', 'RA',
  'Comprehensive cybersecurity documentation for FDA submissions following 2023 guidance on Management of Cybersecurity in Medical Devices',
  'ADVANCED', 150,
  json_build_array('Device architecture and data flow', 'Cybersecurity risks identified', 'Threat modeling results', 'Controls implemented')::jsonb,
  json_build_array('Cybersecurity Management Plan', 'Threat Modeling Report', 'Software Bill of Materials (SBOM)', 'Vulnerability Management Plan', 'Incident Response Plan')::jsonb,
  jsonb_build_object('fda_acceptance', '100% compliance with 2023 guidance', 'completeness', 'All required elements present')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Cybersecurity Documentation Workflow', 'WFL-RA-008-001',
  'Comprehensive cybersecurity documentation per FDA 2023 guidance', 1,
  jsonb_build_object('duration_minutes', 150, 'complexity', 'ADVANCED', 'pattern', 'CHECKLIST_WITH_TEMPLATES')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_008' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-008-01', 'TSK-RA-008-01', 'Conduct Threat Modeling (STRIDE)', 'Identify assets, threats, vulnerabilities using STRIDE methodology', 1, '{"complexity": "ADVANCED", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-008-02', 'TSK-RA-008-02', 'Generate Software Bill of Materials (SBOM)', 'Create comprehensive SBOM with components, versions, licenses, vulnerabilities', 2, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-008-03', 'TSK-RA-008-03', 'Document Cybersecurity Controls', 'Document authentication, authorization, encryption, audit logging, secure communications', 3, '{"complexity": "ADVANCED", "duration_minutes": 25}'::jsonb),
  ('TSK-RA-008-04', 'TSK-RA-008-04', 'Develop Vulnerability Management Plan', 'Plan for vulnerability scanning, patching process, disclosure procedures', 4, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-008-05', 'TSK-RA-008-05', 'Create Incident Response Plan', 'Develop plan for detecting, responding to, and recovering from cybersecurity incidents', 5, '{"complexity": "INTERMEDIATE", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-008-06', 'TSK-RA-008-06', 'Prepare Secure Product Development Framework (SPDF)', 'Document secure SDLC practices and processes', 6, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-008-07', 'TSK-RA-008-07', 'Compile Cybersecurity Submission Package', 'Assemble all cybersecurity documentation for FDA submission', 7, '{"complexity": "INTERMEDIATE", "duration_minutes": 15}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-008-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-008-03', 'TSK-RA-008-01'), ('TSK-RA-008-04', 'TSK-RA-008-03'),
  ('TSK-RA-008-05', 'TSK-RA-008-01'), ('TSK-RA-008-07', 'TSK-RA-008-02'),
  ('TSK-RA-008-07', 'TSK-RA-008-04'), ('TSK-RA-008-07', 'TSK-RA-008-05'), ('TSK-RA-008-07', 'TSK-RA-008-06')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_008 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_008' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

