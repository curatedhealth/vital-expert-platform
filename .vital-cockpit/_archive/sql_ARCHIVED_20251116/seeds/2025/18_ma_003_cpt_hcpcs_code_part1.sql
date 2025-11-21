-- ==================================================================================
-- 18_ma_003_cpt_hcpcs_code_part1.sql - UC_MA_003: CPT/HCPCS Code Strategy
-- ==================================================================================
DO $$ DECLARE v_tenant_slug TEXT := 'digital-health-startup'; v_tenant_id UUID;
BEGIN SELECT id INTO v_tenant_id FROM tenants WHERE slug = v_tenant_slug;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Tenant % not found', v_tenant_slug; END IF; END $$;

CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'CPT/HCPCS Code Strategy Workflow', 'WFL-MA-003-001',
  'Strategic approach to obtaining CPT or HCPCS codes for digital health reimbursement', 1,
  jsonb_build_object('duration_minutes', 180, 'complexity', 'ADVANCED',
    'deliverables', json_build_array('Code strategy', 'AMA application', 'Interim billing plan'),
    'code_types', json_build_array('Category I CPT', 'Category III CPT', 'HCPCS Level II'))
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_MA_003' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, metadata = EXCLUDED.metadata;

-- TASKS
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-003-01', 'TSK-MA-003-01', 'Assess Current Code Landscape', 'Evaluate existing CPT/HCPCS codes and identify gaps for digital health product', 1,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Code landscape assessment"}'::jsonb),
  ('TSK-MA-003-02', 'TSK-MA-003-02', 'Define Code Strategy', 'Determine optimal code pathway (Category I, III, or HCPCS) based on product maturity', 2,
   '{"complexity": "ADVANCED", "duration_minutes": 30, "deliverable": "Code strategy recommendation"}'::jsonb),
  ('TSK-MA-003-03', 'TSK-MA-003-03', 'Prepare Code Application', 'Draft application package for AMA CPT Panel or CMS HCPCS', 3,
   '{"complexity": "ADVANCED", "duration_minutes": 45, "deliverable": "Code application package"}'::jsonb),
  ('TSK-MA-003-04', 'TSK-MA-003-04', 'Develop Interim Billing Strategy', 'Create strategy for billing before code approval (unlisted codes, bundling)', 4,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Interim billing plan"}'::jsonb),
  ('TSK-MA-003-05', 'TSK-MA-003-05', 'Engage Stakeholders', 'Build support from professional societies and key payers', 5,
   '{"complexity": "ADVANCED", "duration_minutes": 30, "deliverable": "Stakeholder engagement plan"}'::jsonb),
  ('TSK-MA-003-06', 'TSK-MA-003-06', 'Submit & Track Application', 'Submit application and monitor progress through review process', 6,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 15, "deliverable": "Submission confirmation and tracking"}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-003-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, extra = EXCLUDED.extra;

SELECT 'MA-003 Part 1 Seeded' as status, COUNT(*) as tasks FROM dh_task WHERE code LIKE 'TSK-MA-003-%';

