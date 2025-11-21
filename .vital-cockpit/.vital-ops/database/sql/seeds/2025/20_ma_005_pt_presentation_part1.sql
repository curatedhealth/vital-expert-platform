-- ==================================================================================
-- 20_ma_005_pt_presentation_part1.sql + part2.sql - UC_MA_005: P&T Presentation
-- ==================================================================================

-- PART 1: Workflows & Tasks
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM tenants WHERE slug='digital-health-startup') THEN RAISE EXCEPTION 'Tenant not found'; END IF; END $$;
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT); DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, 'P&T Presentation Workflow', 'WFL-MA-005-001',
  'Development of compelling P&T Committee presentations for formulary approval', 1,
  jsonb_build_object('duration_minutes', 120, 'complexity', 'ADVANCED', 'deliverables', json_build_array('P&T deck', 'Speaker notes', 'Q&A prep'))
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = 'UC_MA_005' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.* FROM session_config sc
CROSS JOIN (VALUES
  ('TSK-MA-005-01','TSK-MA-005-01','Define Presentation Strategy','Understand P&T committee composition and tailor presentation approach',1,'{"complexity":"INTERMEDIATE","duration_minutes":20}'::jsonb),
  ('TSK-MA-005-02','TSK-MA-005-02','Develop Slide Deck','Create 15-20 slide deck covering disease burden, clinical evidence, economics',2,'{"complexity":"ADVANCED","duration_minutes":40}'::jsonb),
  ('TSK-MA-005-03','TSK-MA-005-03','Prepare Speaker Notes','Draft detailed speaker notes for each slide',3,'{"complexity":"INTERMEDIATE","duration_minutes":25}'::jsonb),
  ('TSK-MA-005-04','TSK-MA-005-04','Develop Q&A Preparation','Anticipate questions and prepare responses',4,'{"complexity":"ADVANCED","duration_minutes":25}'::jsonb),
  ('TSK-MA-005-05','TSK-MA-005-05','Conduct Internal Review','Review presentation with stakeholders and incorporate feedback',5,'{"complexity":"INTERMEDIATE","duration_minutes":10}'::jsonb)
) AS task_data(code, unique_id, title, objective, position, extra)
INNER JOIN dh_workflow wf ON wf.unique_id = 'WFL-MA-005-001' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

SELECT 'MA-005 Part 1 Seeded' as status;

