-- ============================================================================
-- VITAL Path: Full Agent Configuration Migration
-- ============================================================================
-- This migration processes all 254 agents and migrates their configurations
-- with comprehensive progress tracking and error handling
-- ============================================================================

-- Batch migration script with progress tracking
DO $$
DECLARE
  v_batch_size INT := 254;  -- Full agent count
  v_total_agents INT;
  v_processed INT := 0;
  v_successful INT := 0;
  v_failed INT := 0;
  v_agent_record RECORD;
  v_migration_result JSON;
  v_start_time TIMESTAMP := NOW();
  v_batch_num INT := 1;
  v_progress_interval INT := 25;  -- Report progress every 25 agents
BEGIN
  -- Count total unmigrated agents
  SELECT COUNT(*) INTO v_total_agents
  FROM agents
  WHERE deleted_at IS NULL AND config_migrated = false;

  RAISE NOTICE '
================================================================================
Starting Agent Configuration Migration
================================================================================
Total Agents to Migrate: %
Batch Size: % (full migration)
Start Time: %
================================================================================
  ', v_total_agents, v_batch_size, v_start_time;

  -- Process agents in batches
  FOR v_agent_record IN
    SELECT id, name
    FROM agents
    WHERE deleted_at IS NULL AND config_migrated = false
    ORDER BY created_at ASC
  LOOP
    -- Migrate single agent
    BEGIN
      SELECT migrate_agent_config(v_agent_record.id) INTO v_migration_result;

      v_processed := v_processed + 1;

      IF (v_migration_result->>'success')::BOOLEAN THEN
        v_successful := v_successful + 1;
      ELSE
        v_failed := v_failed + 1;
        RAISE WARNING 'Failed to migrate agent % (%): %',
          v_agent_record.id,
          v_agent_record.name,
          v_migration_result->>'error';
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        v_failed := v_failed + 1;
        v_processed := v_processed + 1;
        RAISE WARNING 'Exception migrating agent % (%): % - %',
          v_agent_record.id,
          v_agent_record.name,
          SQLERRM,
          SQLSTATE;
    END;

    -- Progress update every 25 agents
    IF v_processed % v_progress_interval = 0 THEN
      RAISE NOTICE '[%] Progress: % / % agents (%.1f%%) - % successful, % failed, Elapsed: %',
        TO_CHAR(NOW(), 'HH24:MI:SS'),
        v_processed,
        v_total_agents,
        CASE WHEN v_total_agents > 0 THEN (v_processed::NUMERIC / v_total_agents * 100) ELSE 0 END,
        v_successful,
        v_failed,
        AGE(NOW(), v_start_time);
    END IF;
  END LOOP;

  -- Final summary
  RAISE NOTICE '
================================================================================
Migration Complete!
================================================================================
Total Agents:    %
Successful:      % (%.2f%%)
Failed:          % (%.2f%%)
Start Time:      %
End Time:        %
Duration:        %
================================================================================',
    v_total_agents,
    v_successful,
    CASE WHEN v_total_agents > 0 THEN (v_successful::NUMERIC / v_total_agents * 100) ELSE 0 END,
    v_failed,
    CASE WHEN v_total_agents > 0 THEN (v_failed::NUMERIC / v_total_agents * 100) ELSE 0 END,
    v_start_time,
    NOW(),
    AGE(NOW(), v_start_time);

  -- Verify migration completeness
  DECLARE
    v_remaining INT;
  BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM agents
    WHERE deleted_at IS NULL AND config_migrated = false;

    IF v_remaining > 0 THEN
      RAISE WARNING 'WARNING: % agents remain unmigrated', v_remaining;
    ELSE
      RAISE NOTICE 'SUCCESS: All agents have been migrated!';
    END IF;
  END;

END $$;

-- Verification queries
-- Uncomment to run manual verification after migration

/*
-- Count migration status
SELECT
  config_migrated,
  COUNT(*) as agent_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM agents WHERE deleted_at IS NULL) * 100, 2) as percentage
FROM agents
WHERE deleted_at IS NULL
GROUP BY config_migrated
ORDER BY config_migrated;

-- List failed migrations (if any)
SELECT
  id,
  name,
  created_at,
  updated_at,
  config_migrated
FROM agents
WHERE deleted_at IS NULL
  AND config_migrated = false
ORDER BY created_at
LIMIT 20;

-- Sample successful migrations
SELECT
  id,
  name,
  config_migrated,
  updated_at
FROM agents
WHERE deleted_at IS NULL
  AND config_migrated = true
ORDER BY updated_at DESC
LIMIT 10;
*/
