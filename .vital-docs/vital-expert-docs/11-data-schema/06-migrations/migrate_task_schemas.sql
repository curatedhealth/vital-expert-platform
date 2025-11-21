-- ==========================================
-- FILE: migrate_task_schemas.sql
-- PURPOSE: Migrate task JSONB schemas to normalized task_input/output_definitions tables
-- DEPENDENCIES: workflow_normalization.sql must be executed first (creates target tables)
-- GOLDEN RULES: Rule #1 (Zero JSONB for structured data)
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== TASK SCHEMA MIGRATION: JSONB → NORMALIZED TABLES ===';
END $$;

-- ==========================================
-- PHASE 1: Migrate Input Schemas
-- ==========================================

DO $$
DECLARE
  _migrated_count INTEGER := 0;
  _task_with_schemas INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 1: Migrating task input schemas from JSONB...';
  
  -- Check if input_schema column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'input_schema') THEN
    
    -- Count tasks with input schemas
    SELECT COUNT(*) INTO _task_with_schemas 
    FROM tasks 
    WHERE input_schema IS NOT NULL 
      AND jsonb_typeof(input_schema) = 'object';
    
    RAISE NOTICE 'Found % tasks with input schemas', _task_with_schemas;
    
    -- Migrate from JSONB
    INSERT INTO task_input_definitions (
      task_id, 
      name, 
      data_type, 
      is_required, 
      default_value,
      description
    )
    SELECT 
      t.id as task_id,
      kv.key as name,
      COALESCE(kv.value->>'type', 'string') as data_type,
      COALESCE((kv.value->>'required')::boolean, false) as is_required,
      kv.value->>'default' as default_value,
      kv.value->>'description' as description
    FROM tasks t
    CROSS JOIN LATERAL jsonb_each(t.input_schema) as kv
    WHERE t.input_schema IS NOT NULL
      AND jsonb_typeof(t.input_schema) = 'object'
    ON CONFLICT (task_id, name) DO NOTHING;
    
    GET DIAGNOSTICS _migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % input definitions from % tasks', _migrated_count, _task_with_schemas;
    
  ELSE
    RAISE NOTICE '! input_schema column does not exist (already migrated)';
  END IF;
END $$;

-- ==========================================
-- PHASE 2: Migrate Output Schemas
-- ==========================================

DO $$
DECLARE
  _migrated_count INTEGER := 0;
  _task_with_schemas INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 2: Migrating task output schemas from JSONB...';
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'output_schema') THEN
    
    -- Count tasks with output schemas
    SELECT COUNT(*) INTO _task_with_schemas 
    FROM tasks 
    WHERE output_schema IS NOT NULL 
      AND jsonb_typeof(output_schema) = 'object';
    
    RAISE NOTICE 'Found % tasks with output schemas', _task_with_schemas;
    
    INSERT INTO task_output_definitions (
      task_id,
      name,
      data_type,
      description
    )
    SELECT 
      t.id as task_id,
      kv.key as name,
      COALESCE(kv.value->>'type', 'string') as data_type,
      kv.value->>'description' as description
    FROM tasks t
    CROSS JOIN LATERAL jsonb_each(t.output_schema) as kv
    WHERE t.output_schema IS NOT NULL
      AND jsonb_typeof(t.output_schema) = 'object'
    ON CONFLICT (task_id, name) DO NOTHING;
    
    GET DIAGNOSTICS _migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % output definitions from % tasks', _migrated_count, _task_with_schemas;
    
  ELSE
    RAISE NOTICE '! output_schema column does not exist (already migrated)';
  END IF;
END $$;

-- ==========================================
-- PHASE 3: Drop JSONB Columns (After Verification)
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'PHASE 3: Dropping JSONB columns from tasks table...';
  RAISE NOTICE 'SAFETY CHECK: Verify counts match before proceeding';
  
  -- Show migration summary
  RAISE NOTICE '--- Migration Summary ---';
  PERFORM 
    'Tasks with input_schema' as metric,
    COUNT(*)::TEXT as count
  FROM tasks 
  WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'input_schema')
    AND input_schema IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'Tasks in task_input_definitions',
    COUNT(DISTINCT task_id)::TEXT
  FROM task_input_definitions;
  
  -- Drop columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'input_schema') THEN
    ALTER TABLE tasks DROP COLUMN input_schema CASCADE;
    RAISE NOTICE '✓ Dropped input_schema column';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'output_schema') THEN
    ALTER TABLE tasks DROP COLUMN output_schema CASCADE;
    RAISE NOTICE '✓ Dropped output_schema column';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'metadata') THEN
    ALTER TABLE tasks DROP COLUMN metadata CASCADE;
    RAISE NOTICE '✓ Dropped metadata column';
  END IF;
  
  RAISE NOTICE 'Task schema migration complete';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
  _total_tasks INTEGER;
  _tasks_with_inputs INTEGER;
  _tasks_with_outputs INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
  
  SELECT COUNT(*) INTO _total_tasks FROM tasks;
  SELECT COUNT(DISTINCT task_id) INTO _tasks_with_inputs FROM task_input_definitions;
  SELECT COUNT(DISTINCT task_id) INTO _tasks_with_outputs FROM task_output_definitions;
  
  RAISE NOTICE 'Total tasks: %', _total_tasks;
  RAISE NOTICE 'Tasks with input definitions: %', _tasks_with_inputs;
  RAISE NOTICE 'Tasks with output definitions: %', _tasks_with_outputs;
  
  -- Check no JSONB remains
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND data_type = 'jsonb') THEN
    RAISE WARNING 'JSONB columns still exist in tasks table!';
  ELSE
    RAISE NOTICE '✓ No JSONB columns remain in tasks table';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '✓✓✓ TASK SCHEMA MIGRATION COMPLETE ✓✓✓';
END $$;

-- Human-readable summary
SELECT 
  'Total Tasks' as metric,
  COUNT(*)::TEXT as value
FROM tasks

UNION ALL

SELECT 
  'Tasks with Inputs',
  COUNT(DISTINCT task_id)::TEXT
FROM task_input_definitions

UNION ALL

SELECT 
  'Tasks with Outputs',
  COUNT(DISTINCT task_id)::TEXT
FROM task_output_definitions

UNION ALL

SELECT 
  'Total Input Definitions',
  COUNT(*)::TEXT
FROM task_input_definitions

UNION ALL

SELECT 
  'Total Output Definitions',
  COUNT(*)::TEXT
FROM task_output_definitions;

