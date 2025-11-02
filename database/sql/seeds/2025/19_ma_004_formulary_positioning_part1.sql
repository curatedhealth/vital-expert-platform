-- ==================================================================================
-- 19_ma_004_formulary_positioning_part1.sql - UC_MA_004: Formulary Positioning
-- ==================================================================================
DO $$ DECLARE v_tenant_slug TEXT := 'digital-health-startup'; v_tenant_id UUID;
BEGIN SELECT id INTO v_tenant_id FROM tenants WHERE slug = v_tenant_slug;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Tenant % not found', v_tenant_slug; END IF; END $$;

CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'Formulary Positioning Workflow', 'WFL-MA-004-001',
  'Strategic positioning within payer formularies and benefit designs', 1,
  jsonb_build_object('duration_minutes', 150, 'complexity', 'INTERMEDIATE',
    'deliverables', json_build_array('Tier recommendation', 'Access strategy', 'UM plan', 'Competitive positioning'))
FROM session_config sc CROSS JOIN dh_use_case uc
WHERE uc.code = 'UC_MA_004' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- TASKS
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-004-01', 'TSK-MA-004-01', 'Analyze Formulary Landscape', 'Assess current formulary structure and competitive positioning', 1,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Formulary landscape analysis"}'::jsonb),
  ('TSK-MA-004-02', 'TSK-MA-004-02', 'Define Tier Positioning Strategy', 'Determine optimal tier placement (Tier 1-4) based on value and competitive position', 2,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Tier positioning recommendation"}'::jsonb),
  ('TSK-MA-004-03', 'TSK-MA-004-03', 'Develop Access Strategy', 'Design strategy for prior authorization, step therapy, and other access restrictions', 3,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Access strategy document"}'::jsonb),
  ('TSK-MA-004-04', 'TSK-MA-004-04', 'Create Utilization Management Plan', 'Develop appropriate PA criteria and clinical policies', 4,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "UM plan and PA criteria"}'::jsonb),
  ('TSK-MA-004-05', 'TSK-MA-004-05', 'Prepare Negotiation Messaging', 'Create compelling value messages for payer negotiations', 5,
   '{"complexity": "INTERMEDIATE", "duration_minutes": 30, "deliverable": "Negotiation talking points"}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-004-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

SELECT 'MA-004 Part 1 Seeded' as status;

