-- =====================================================================================
-- UC_RA_007: International Harmonization Strategy - Part 1: Workflows & Tasks
-- =====================================================================================

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM session_config) THEN RAISE EXCEPTION 'No tenant_id'; END IF; END $$;

INSERT INTO dh_use_case (tenant_id, code, unique_id, title, domain, description, complexity, estimated_duration_minutes, prerequisites, deliverables, success_metrics)
SELECT sc.tenant_id, 'UC_RA_007', 'USC-RA-007', 'International Harmonization Strategy', 'RA',
  'Strategic approach to harmonizing regulatory submissions across FDA (US), EMA (EU), PMDA (Japan), Health Canada, and other global bodies',
  'EXPERT', 240,
  json_build_array('Target markets (US, EU, Japan, etc.)', 'Product classification by jurisdiction', 'Clinical data available', 'Market prioritization')::jsonb,
  json_build_array('Multi-jurisdictional regulatory strategy', 'Harmonized clinical development plan', 'Submission sequencing', 'Data sharing opportunities', 'Risk assessment by jurisdiction')::jsonb,
  jsonb_build_object('harmonization_efficiency', '40% time reduction vs sequential', 'global_success_rate', '90%+ multi-market approval')
FROM session_config sc ON CONFLICT (tenant_id, code) DO UPDATE SET title = EXCLUDED.title;

-- Workflow 1: Multi-Jurisdictional Analysis
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Global Regulatory Landscape Analysis', 'WFL-RA-007-001',
  'Comprehensive analysis of regulatory requirements across target markets', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'EXPERT', 'pattern', 'MULTI_JURISDICTIONAL')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- Workflow 2: Harmonization Strategy Development
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Harmonization Strategy Development', 'WFL-RA-007-002',
  'Development of unified global regulatory strategy with optimal sequencing', 2,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'EXPERT', 'pattern', 'STRATEGIC_PLANNING')
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_RA_007' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- Tasks for Workflow 1
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-007-01', 'TSK-RA-007-01', 'Map Regulatory Requirements by Jurisdiction', 'Identify classification, pathways, data requirements for each market', 1, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-007-02', 'TSK-RA-007-02', 'Analyze FDA Requirements', 'Detailed analysis of US FDA requirements for product', 2, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-03', 'TSK-RA-007-03', 'Analyze EMA/EU MDR Requirements', 'Detailed analysis of EU requirements and CE Mark pathway', 3, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-04', 'TSK-RA-007-04', 'Analyze PMDA/Health Canada Requirements', 'Analysis of Japan, Canada, and other target markets', 4, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-05', 'TSK-RA-007-05', 'Identify Harmonization Opportunities', 'Find common requirements, data sharing opportunities, aligned endpoints', 5, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-007-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- Tasks for Workflow 2
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-007-06', 'TSK-RA-007-06', 'Design Harmonized Clinical Trial', 'Design ONE pivotal trial accepted by multiple agencies', 1, '{"complexity": "EXPERT", "duration_minutes": 40}'::jsonb),
  ('TSK-RA-007-07', 'TSK-RA-007-07', 'Develop Submission Sequencing Strategy', 'Determine parallel vs sequential approach and optimal order', 2, '{"complexity": "EXPERT", "duration_minutes": 30}'::jsonb),
  ('TSK-RA-007-08', 'TSK-RA-007-08', 'Plan Quality Management Harmonization', 'Align ISO 13485, IEC 62304, and other quality standards', 3, '{"complexity": "ADVANCED", "duration_minutes": 20}'::jsonb),
  ('TSK-RA-007-09', 'TSK-RA-007-09', 'Create Global Regulatory Timeline', 'Develop integrated timeline with dependencies and milestones', 4, '{"complexity": "ADVANCED", "duration_minutes": 30}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = 'WFL-RA-007-002' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- Dependencies for Workflow 1
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-007-02', 'TSK-RA-007-01'), ('TSK-RA-007-03', 'TSK-RA-007-01'),
  ('TSK-RA-007-04', 'TSK-RA-007-01'), ('TSK-RA-007-05', 'TSK-RA-007-02'),
  ('TSK-RA-007-05', 'TSK-RA-007-03'), ('TSK-RA-007-05', 'TSK-RA-007-04')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

-- Dependencies for Workflow 2 (depends on Workflow 1 completion)
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id, dependency_type)
SELECT sc.tenant_id, t_curr.id, t_prev.id, 'BLOCKS' FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-RA-007-06', 'TSK-RA-007-05'), ('TSK-RA-007-07', 'TSK-RA-007-06'),
  ('TSK-RA-007-08', 'TSK-RA-007-05'), ('TSK-RA-007-09', 'TSK-RA-007-07')
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, task_id, depends_on_task_id) DO NOTHING;

SELECT 'UC_RA_007 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id INNER JOIN dh_use_case uc ON uc.id = wf.use_case_id
WHERE uc.code = 'UC_RA_007' AND uc.tenant_id = (SELECT tenant_id FROM session_config);

