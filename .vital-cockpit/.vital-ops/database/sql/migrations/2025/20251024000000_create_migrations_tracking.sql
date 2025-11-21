-- Create schema_migrations tracking table
-- This table tracks which migrations have been applied to the database
-- Created: 2025-01-25

BEGIN;

-- Create the migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execution_time_ms INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  rollback_sql TEXT
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_migrations_applied_at
ON schema_migrations(applied_at DESC);

-- Add comment
COMMENT ON TABLE schema_migrations IS
'Tracks database schema migrations for version control and audit trail';

COMMENT ON COLUMN schema_migrations.id IS
'Migration ID in format: YYYYMMDDHHMMSS_description';

COMMENT ON COLUMN schema_migrations.checksum IS
'SHA-256 checksum of migration file to detect modifications';

COMMENT ON COLUMN schema_migrations.rollback_sql IS
'Optional SQL to rollback this migration';

COMMIT;
