-- =====================================================================================
-- UC_RA_010: Post-Market Surveillance Planning - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: Development of PMS plans to monitor device safety and effectiveness after market authorization
-- Complexity: INTERMEDIATE
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
SELECT sc.tenant_id, d.id, 'UC_RA_010', 'USC-RA-010', 'Post-Market Surveillance Planning',
  'Development of Post-Market Surveillance (PMS) plans to monitor device safety and effectiveness after market authorization, satisfying FDA and EU MDR requirements', 'Intermediate',
  jsonb_build_object('estimated_duration_minutes', 120,
    'prerequisites', json_build_array('Device risk classification', 'Identified risks', 'Market size', 'Regulatory requirements'),
    'deliverables', json_build_array('PMS Plan', 'Data collection procedures', 'Analysis schedule', 'Adverse event monitoring', 'PMCF protocol'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, metadata = EXCLUDED.metadata;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Post-Market Surveillance Workflow', 'WFL-RA-010-001',
  'Comprehensive post-market surveillance plan development for FDA and EU MDR', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'INTERMEDIATE')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_RA_010' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- TASKS (6 tasks)
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-010-01', 'TSK-RA-010-01', 'Define PMS Scope', 'Establish surveillance objectives', 1, '{}'::jsonb),
  ('TSK-RA-010-02', 'TSK-RA-010-02', 'Identify Data Sources', 'Determine surveillance data sources', 2, '{}'::jsonb),
  ('TSK-RA-010-03', 'TSK-RA-010-03', 'Design Data Collection', 'Develop collection procedures', 3, '{}'::jsonb),
  ('TSK-RA-010-04', 'TSK-RA-010-04', 'Establish AE Monitoring', 'FDA MDR and EU vigilance', 4, '{}'::jsonb),
  ('TSK-RA-010-05', 'TSK-RA-010-05', 'Develop Analysis Schedule', 'Define analysis and reporting', 5, '{}'::jsonb),
  ('TSK-RA-010-06', 'TSK-RA-010-06', 'Create PMCF Protocol', 'Post-Market Clinical Follow-up', 6, '{}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-010-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- DEPENDENCIES
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
  ('TSK-RA-010-02', 'TSK-RA-010-01'), ('TSK-RA-010-03', 'TSK-RA-010-02'),
  ('TSK-RA-010-04', 'TSK-RA-010-03'), ('TSK-RA-010-05', 'TSK-RA-010-04'), ('TSK-RA-010-06', 'TSK-RA-010-03')
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
  WHERE uc.code = 'UC_RA_010' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UC_RA_010: Post-Market Surveillance Planning';
  RAISE NOTICE 'Tasks: %', v_task_count;
  RAISE NOTICE '✓ UC_RA_010 seeded successfully!';
  RAISE NOTICE '';
END $$;
