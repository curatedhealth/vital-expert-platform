-- ==========================================
-- FILE: reset_workflows_tasks_only.sql
-- PURPOSE: Empty ONLY workflows and tasks (preserves all JTBDs, roles, personas, etc.)
-- DEPENDENCIES: Workflow and task tables only
-- GOLDEN RULES: Maintains referential integrity, preserves all other data
-- ==========================================

-- ==========================================
-- SECTION 1: CREATE BACKUP (Safety First)
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== CREATING BACKUPS ===';
END $$;

-- Backup workflow data
CREATE TABLE IF NOT EXISTS workflow_templates_backup_pre_reset AS SELECT * FROM workflow_templates;
CREATE TABLE IF NOT EXISTS workflow_stages_backup_pre_reset AS SELECT * FROM workflow_stages;
CREATE TABLE IF NOT EXISTS workflow_tasks_backup_pre_reset AS SELECT * FROM workflow_tasks;
CREATE TABLE IF NOT EXISTS jtbd_workflow_stages_backup_pre_reset AS SELECT * FROM jtbd_workflow_stages;
CREATE TABLE IF NOT EXISTS jtbd_workflow_activities_backup_pre_reset AS SELECT * FROM jtbd_workflow_activities;

-- Backup task data
CREATE TABLE IF NOT EXISTS tasks_backup_pre_reset AS SELECT * FROM tasks;
CREATE TABLE IF NOT EXISTS task_steps_backup_pre_reset AS SELECT * FROM task_steps;

DO $$
BEGIN
  RAISE NOTICE '✓ Backups created with suffix _backup_pre_reset';
END $$;

-- ==========================================
-- SECTION 2: DELETE WORKFLOW DATA (NEW MODEL)
-- ==========================================

DO $$
DECLARE
  row_count INTEGER;
BEGIN
  RAISE NOTICE '=== DELETING NEW WORKFLOW MODEL ===';
  
  -- New workflow model child tables (bottom-up)
  DELETE FROM workflow_task_pain_points;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_task_pain_points', row_count;
  
  DELETE FROM workflow_task_data_requirements;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_task_data_requirements', row_count;
  
  DELETE FROM workflow_task_skills;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_task_skills', row_count;
  
  DELETE FROM workflow_task_tools;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_task_tools', row_count;
  
  DELETE FROM workflow_tasks;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_tasks', row_count;
  
  DELETE FROM workflow_stages;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_stages', row_count;
  
  DELETE FROM workflow_templates;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from workflow_templates', row_count;
END $$;

-- ==========================================
-- SECTION 3: DELETE LEGACY JTBD WORKFLOW MODEL
-- ==========================================

DO $$
DECLARE
  row_count INTEGER;
BEGIN
  RAISE NOTICE '=== DELETING LEGACY JTBD WORKFLOW MODEL ===';
  
  -- Legacy JTBD workflow model child tables (bottom-up)
  DELETE FROM jtbd_activity_pain_points;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_activity_pain_points', row_count;
  
  DELETE FROM jtbd_activity_required_data;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_activity_required_data', row_count;
  
  DELETE FROM jtbd_activity_required_tools;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_activity_required_tools', row_count;
  
  DELETE FROM jtbd_activity_required_skills;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_activity_required_skills', row_count;
  
  DELETE FROM jtbd_workflow_activities;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_workflow_activities', row_count;
  
  DELETE FROM jtbd_stage_pain_points;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_stage_pain_points', row_count;
  
  DELETE FROM jtbd_stage_key_activities;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_stage_key_activities', row_count;
  
  DELETE FROM jtbd_workflow_stages;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from jtbd_workflow_stages', row_count;
END $$;

-- ==========================================
-- SECTION 4: DELETE TASK DATA
-- ==========================================

DO $$
DECLARE
  row_count INTEGER;
BEGIN
  RAISE NOTICE '=== DELETING TASK DATA ===';
  
  -- Task child tables (bottom-up)
  DELETE FROM step_parameters;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from step_parameters', row_count;
  
  DELETE FROM task_steps;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_steps', row_count;
  
  DELETE FROM task_input_definitions;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_input_definitions', row_count;
  
  DELETE FROM task_output_definitions;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_output_definitions', row_count;
  
  DELETE FROM task_dependencies;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_dependencies', row_count;
  
  DELETE FROM task_prerequisites;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_prerequisites', row_count;
  
  DELETE FROM task_agents;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_agents', row_count;
  
  DELETE FROM task_tools;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_tools', row_count;
  
  DELETE FROM task_skills;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_skills', row_count;
  
  DELETE FROM task_inputs;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_inputs', row_count;
  
  DELETE FROM task_outputs;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from task_outputs', row_count;
  
  -- Core tasks
  DELETE FROM tasks;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  RAISE NOTICE '✓ Deleted % rows from tasks', row_count;
END $$;

-- ==========================================
-- SECTION 5: VERIFICATION QUERIES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== CLEANUP COMPLETE - VERIFICATION ===';
END $$;

-- Verify all workflow and task tables are empty
SELECT 
  'Workflow Tables (New)' as category,
  (SELECT COUNT(*) FROM workflow_templates) as templates,
  (SELECT COUNT(*) FROM workflow_stages) as stages,
  (SELECT COUNT(*) FROM workflow_tasks) as tasks,
  (SELECT COUNT(*) FROM workflow_task_tools) as task_tools,
  (SELECT COUNT(*) FROM workflow_task_skills) as task_skills,
  (SELECT COUNT(*) FROM workflow_task_data_requirements) as task_data,
  (SELECT COUNT(*) FROM workflow_task_pain_points) as task_pains
UNION ALL
SELECT 
  'Workflow Tables (Legacy)',
  (SELECT COUNT(*) FROM jtbd_workflow_stages),
  (SELECT COUNT(*) FROM jtbd_workflow_activities),
  (SELECT COUNT(*) FROM jtbd_stage_key_activities),
  (SELECT COUNT(*) FROM jtbd_stage_pain_points),
  (SELECT COUNT(*) FROM jtbd_activity_required_skills),
  (SELECT COUNT(*) FROM jtbd_activity_required_tools),
  (SELECT COUNT(*) FROM jtbd_activity_required_data)
UNION ALL
SELECT 
  'Task Tables',
  (SELECT COUNT(*) FROM tasks),
  (SELECT COUNT(*) FROM task_steps),
  (SELECT COUNT(*) FROM step_parameters),
  (SELECT COUNT(*) FROM task_input_definitions),
  (SELECT COUNT(*) FROM task_output_definitions),
  (SELECT COUNT(*) FROM task_dependencies),
  (SELECT COUNT(*) FROM task_tools);

-- Verify JTBD and org data is PRESERVED
SELECT 
  'PRESERVED Data' as category,
  (SELECT COUNT(*) FROM jtbd) as jtbds,
  (SELECT COUNT(*) FROM org_roles) as roles,
  (SELECT COUNT(*) FROM org_functions) as functions,
  (SELECT COUNT(*) FROM org_departments) as departments,
  (SELECT COUNT(*) FROM personas) as personas,
  (SELECT COUNT(*) FROM jtbd_roles) as jtbd_role_mappings,
  (SELECT COUNT(*) FROM value_categories) as value_categories;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CLEANUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  DELETED:';
  RAISE NOTICE '  • All workflow_templates and children';
  RAISE NOTICE '  • All jtbd_workflow_stages and children (legacy)';
  RAISE NOTICE '  • All tasks and children';
  RAISE NOTICE '';
  RAISE NOTICE '✅ PRESERVED (100% untouched):';
  RAISE NOTICE '  • ALL JTBDs (jtbd table)';
  RAISE NOTICE '  • ALL JTBD mappings (jtbd_roles, jtbd_functions, jtbd_departments, jtbd_personas)';
  RAISE NOTICE '  • ALL JTBD outcomes, pain points, success criteria';
  RAISE NOTICE '  • ALL JTBD value & AI assessments';
  RAISE NOTICE '  • ALL organizational structure (functions, departments, roles, personas)';
  RAISE NOTICE '  • ALL reference data (value_categories, value_drivers, ai_intervention_types)';
  RAISE NOTICE '  • ALL lang_components';
  RAISE NOTICE '';
  RAISE NOTICE '💾 Backups: Tables with suffix _backup_pre_reset';
  RAISE NOTICE '';
  RAISE NOTICE '🌱 Ready for fresh workflow & task seeding!';
END $$;


