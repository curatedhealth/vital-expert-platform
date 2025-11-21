-- ============================================================================
-- CREATE MIGRATION TRACKING TABLE
-- ============================================================================
-- Description: Creates the migration_tracking table required by all migrations
-- Date: 2025-11-18
-- Purpose: Track migration execution progress and status
-- ============================================================================

DO $$ BEGIN RAISE NOTICE 'Creating migration_tracking table...'; END $$;

-- Create migration_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'rollback')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying
CREATE INDEX IF NOT EXISTS idx_migration_tracking_name
  ON migration_tracking(migration_name);

CREATE INDEX IF NOT EXISTS idx_migration_tracking_status
  ON migration_tracking(status);

CREATE INDEX IF NOT EXISTS idx_migration_tracking_started
  ON migration_tracking(started_at DESC);

-- Add comment
COMMENT ON TABLE migration_tracking IS 'Tracks database migration execution history and status';

DO $$ BEGIN RAISE NOTICE '✅ migration_tracking table created successfully'; END $$;

-- Verify table exists
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'migration_tracking'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '✅ Verification passed: migration_tracking table exists';
  ELSE
    RAISE EXCEPTION '❌ Verification failed: migration_tracking table was not created';
  END IF;
END $$;
