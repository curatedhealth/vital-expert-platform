-- =====================================================================================
-- UC_RA_008: Cybersecurity Documentation (FDA) - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Comprehensive cybersecurity documentation for FDA submissions following 2023 guidance
-- Complexity: ADVANCED
-- =====================================================================================

-- Setup session_config
DO $$
DECLARE v_tenant_id UUID;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
  DELETE FROM session_config;
  INSERT INTO session_config (tenant_id, tenant_slug) SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Tenant not found'; END IF;
  RAISE NOTICE '✓ Using tenant_id: %', v_tenant_id;
END $$;

-- USE CASE
INSERT INTO dh_use_case (tenant_id, domain_id, code, unique_id, title, summary, complexity, metadata)
SELECT sc.tenant_id, d.id, 'UC_RA_008', 'USC-RA-008', 'Cybersecurity Documentation (FDA)',
  'Comprehensive cybersecurity documentation for FDA submissions following 2023 guidance on Management of Cybersecurity in Medical Devices', 'Advanced',
  jsonb_build_object('estimated_duration_minutes', 150,
    'prerequisites', json_build_array('Device architecture', 'Cybersecurity risks', 'Threat modeling', 'Controls implemented'),
    'deliverables', json_build_array('Cybersecurity Management Plan', 'Threat Modeling Report', 'SBOM', 'Vulnerability Management Plan', 'Incident Response Plan'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Cybersecurity Documentation Workflow', 'WFL-RA-008-001',
  'Comprehensive cybersecurity documentation per FDA 2023 guidance', 1,
  jsonb_build_object('duration_minutes', 150, 'complexity', 'ADVANCED')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_008' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- TASKS (7 tasks)
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-008-01', 'TSK-RA-008-01', 'Conduct Threat Modeling', 'STRIDE methodology', 1, '{}'::jsonb),
  ('TSK-RA-008-02', 'TSK-RA-008-02', 'Generate SBOM', 'Software Bill of Materials', 2, '{}'::jsonb),
  ('TSK-RA-008-03', 'TSK-RA-008-03', 'Document Cybersecurity Controls', 'Auth, encryption, logging', 3, '{}'::jsonb),
  ('TSK-RA-008-04', 'TSK-RA-008-04', 'Develop Vulnerability Plan', 'Vulnerability management', 4, '{}'::jsonb),
  ('TSK-RA-008-05', 'TSK-RA-008-05', 'Create Incident Response Plan', 'Incident response', 5, '{}'::jsonb),
  ('TSK-RA-008-06', 'TSK-RA-008-06', 'Prepare SPDF', 'Secure Product Development Framework', 6, '{}'::jsonb),
  ('TSK-RA-008-07', 'TSK-RA-008-07', 'Compile Package', 'Assemble all documentation', 7, '{}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-008-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-008-03', 'TSK-RA-008-01'), ('TSK-RA-008-04', 'TSK-RA-008-03'),
  ('TSK-RA-008-07', 'TSK-RA-008-02'), ('TSK-RA-008-07', 'TSK-RA-008-04'), ('TSK-RA-008-07', 'TSK-RA-008-06')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- VERIFICATION
DO $$
DECLARE v_task_count INT;
BEGIN
  SELECT COUNT(DISTINCT t.id) INTO v_task_count
  FROM dh_use_case uc CROSS JOIN dh_workflow wf LEFT JOIN dh_task t ON t.workflow_id = wf.id
  WHERE uc.code = 'UC_RA_008' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_008: Cybersecurity Documentation';
  RAISE NOTICE 'Tasks: %', v_task_count;
  RAISE NOTICE '✓ UC_RA_008 seeded successfully!';
  RAISE NOTICE '';
END $$;
