-- ============================================================================
-- Fix Existing Tools Table or Create New
-- Date: 2025-11-02
-- Purpose: Handle existing tools table with different schema
-- ============================================================================

-- Check if tools table exists and has different schema
DO $$
BEGIN
  -- If tools table exists but doesn't have tool_code column, we need to migrate it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') THEN
    
    -- Check if tool_code column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tools' AND column_name = 'tool_code'
    ) THEN
      RAISE NOTICE '⚠️ Tools table exists but has different schema. Dropping and recreating...';
      
      -- Drop dependent objects first
      DROP MATERIALIZED VIEW IF EXISTS tool_analytics CASCADE;
      DROP TABLE IF EXISTS tool_executions CASCADE;
      DROP TABLE IF EXISTS agent_tools CASCADE;
      DROP TABLE IF EXISTS tools CASCADE;
      
      RAISE NOTICE '✅ Old tools tables dropped';
    ELSE
      RAISE NOTICE '✅ Tools table has correct schema';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ Tools table does not exist, will create new';
  END IF;
END $$;

-- Now run the main migration
\i /Users/hichamnaim/Downloads/Cursor/VITAL\ path/database/sql/migrations/2025/20251102_create_tools_registry.sql

