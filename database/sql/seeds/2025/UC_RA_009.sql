-- =====================================================================================
-- UC_RA_009: Software Validation Documentation - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Comprehensive software validation documentation following FDA guidance and IEC 62304
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
SELECT sc.tenant_id, d.id, 'UC_RA_009', 'USC-RA-009', 'Software Validation Documentation',
  'Comprehensive software validation documentation following FDA guidance and IEC 62304 standards for software lifecycle processes', 'Advanced',
  jsonb_build_object('estimated_duration_minutes', 180,
    'prerequisites', json_build_array('Software description', 'Requirements specs', 'Verification testing'),
    'deliverables', json_build_array('SRS', 'SDS', 'V&V Plan', 'Test Protocols', 'Traceability Matrix'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Software Validation Workflow', 'WFL-RA-009-001',
  'Comprehensive software validation per FDA guidance and IEC 62304', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_009' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- TASKS (8 tasks)
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-009-01', 'TSK-RA-009-01', 'Software Safety Classification', 'IEC 62304 Class A/B/C', 1, '{}'::jsonb),
  ('TSK-RA-009-02', 'TSK-RA-009-02', 'Develop SRS', 'Software Requirements Spec', 2, '{}'::jsonb),
  ('TSK-RA-009-03', 'TSK-RA-009-03', 'Create SDS', 'Software Design Spec', 3, '{}'::jsonb),
  ('TSK-RA-009-04', 'TSK-RA-009-04', 'Develop V&V Plan', 'Verification & Validation Plan', 4, '{}'::jsonb),
  ('TSK-RA-009-05', 'TSK-RA-009-05', 'Create Test Protocols', 'Detailed test cases', 5, '{}'::jsonb),
  ('TSK-RA-009-06', 'TSK-RA-009-06', 'Generate Traceability Matrix', 'Requirements traceability', 6, '{}'::jsonb),
  ('TSK-RA-009-07', 'TSK-RA-009-07', 'Document SDLC', 'Software Development Lifecycle', 7, '{}'::jsonb),
  ('TSK-RA-009-08', 'TSK-RA-009-08', 'Compile Validation Package', 'Assemble all documentation', 8, '{}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-009-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-009-02', 'TSK-RA-009-01'), ('TSK-RA-009-03', 'TSK-RA-009-02'), ('TSK-RA-009-04', 'TSK-RA-009-03'),
  ('TSK-RA-009-05', 'TSK-RA-009-04'), ('TSK-RA-009-06', 'TSK-RA-009-05'),
  ('TSK-RA-009-08', 'TSK-RA-009-06'), ('TSK-RA-009-08', 'TSK-RA-009-07')
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
  WHERE uc.code = 'UC_RA_009' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_009: Software Validation Documentation';
  RAISE NOTICE 'Tasks: %', v_task_count;
  RAISE NOTICE '✓ UC_RA_009 seeded successfully!';
  RAISE NOTICE '';
END $$;
