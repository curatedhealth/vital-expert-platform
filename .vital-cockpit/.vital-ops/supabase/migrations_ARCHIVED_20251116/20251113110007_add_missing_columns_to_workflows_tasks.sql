-- =============================================================================
-- Add Missing Columns to Existing workflows and tasks Tables
-- =============================================================================
-- This migration adds columns that exist in gold standard but missing in old schema

-- Add missing columns to workflows table
DO $$
BEGIN
  -- slug
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'slug'
  ) THEN
    ALTER TABLE workflows ADD COLUMN slug TEXT;
    -- Generate slugs from name for existing rows
    UPDATE workflows SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
    RAISE NOTICE 'Added slug column to workflows';
  END IF;

  -- workflow_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'workflow_type'
  ) THEN
    ALTER TABLE workflows ADD COLUMN workflow_type TEXT DEFAULT 'standard';
    RAISE NOTICE 'Added workflow_type column to workflows';
  END IF;

  -- is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE workflows ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to workflows';
  END IF;

  -- tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'tags'
  ) THEN
    ALTER TABLE workflows ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Added tags column to workflows';
  END IF;

  -- jtbd_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'jtbd_id'
  ) THEN
    ALTER TABLE workflows ADD COLUMN jtbd_id UUID REFERENCES jtbd_library(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added jtbd_id column to workflows';
  END IF;

  -- solution_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'solution_id'
  ) THEN
    ALTER TABLE workflows ADD COLUMN solution_id UUID;
    RAISE NOTICE 'Added solution_id column to workflows';
  END IF;

  -- version
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'version'
  ) THEN
    ALTER TABLE workflows ADD COLUMN version TEXT DEFAULT '1.0.0';
    RAISE NOTICE 'Added version column to workflows';
  END IF;

  RAISE NOTICE '✅ workflows table columns updated';
END $$;

-- Add missing columns to tasks table
DO $$
BEGIN
  -- slug
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'slug'
  ) THEN
    ALTER TABLE tasks ADD COLUMN slug TEXT;
    -- Generate slugs from name for existing rows
    UPDATE tasks SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
    RAISE NOTICE 'Added slug column to tasks';
  END IF;

  -- task_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'task_type'
  ) THEN
    ALTER TABLE tasks ADD COLUMN task_type TEXT DEFAULT 'standard';
    RAISE NOTICE 'Added task_type column to tasks';
  END IF;

  -- is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to tasks';
  END IF;

  RAISE NOTICE '✅ tasks table columns updated';
END $$;
