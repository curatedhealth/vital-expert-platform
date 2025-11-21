-- =============================================================================
-- DATABASE STATE CHECK
-- =============================================================================
-- Run this query to see what tables currently exist in your database
-- This will help determine if we need to rebuild the schema or just add tenant_id
-- =============================================================================

-- Check what tables exist in public schema
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if core tables exist
DO $$
DECLARE
  agents_exists BOOLEAN;
  personas_exists BOOLEAN;
  jtbd_exists BOOLEAN;
  workflows_exists BOOLEAN;
BEGIN
  -- Check agents
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'agents'
  ) INTO agents_exists;

  -- Check personas
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'personas'
  ) INTO personas_exists;

  -- Check jobs_to_be_done
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'jobs_to_be_done'
  ) INTO jtbd_exists;

  -- Check workflows
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workflows'
  ) INTO workflows_exists;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE STATE CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'agents table exists: %', agents_exists;
  RAISE NOTICE 'personas table exists: %', personas_exists;
  RAISE NOTICE 'jobs_to_be_done table exists: %', jtbd_exists;
  RAISE NOTICE 'workflows table exists: %', workflows_exists;
  RAISE NOTICE '';

  IF NOT agents_exists THEN
    RAISE WARNING '❌ Core tables are MISSING!';
    RAISE WARNING 'The database reset dropped all tables.';
    RAISE WARNING 'You need to restore from backup OR rebuild schema from migrations.';
  ELSE
    RAISE NOTICE '✅ Core tables exist - safe to proceed with Phase 2';
  END IF;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- Check what ENUM types exist
SELECT
  typname as enum_name,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typnamespace = 'public'::regnamespace
GROUP BY typname
ORDER BY typname;
