/**
 * Phase 3: Drop Old Columns & Cleanup
 *
 * GOAL: Remove old columns after confirming new columns work correctly
 *
 * STRATEGY: Final cleanup after validation period
 * - Monitor application for 1-2 weeks using new columns
 * - Remove sync triggers (no longer needed)
 * - Drop old columns (tenant_id)
 * - Vacuum tables to reclaim space
 *
 * PREREQUISITES:
 * - Phase 2 completed successfully
 * - Application stable for 1-2 weeks using new columns
 * - No reported cross-organization data leaks
 * - Security tests passing 100%
 *
 * CRITICAL: This phase is NOT reversible without database backup
 *
 * ROLLBACK: Restore from backup taken before this migration
 *
 * RISK LEVEL: HIGH
 * - Irreversible data structure change
 * - Requires backup for rollback
 * - Must verify stability before executing
 */

-- ============================================================================
-- CRITICAL WARNING
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 3: DROP OLD COLUMNS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  CRITICAL WARNING ⚠️';
  RAISE NOTICE '';
  RAISE NOTICE 'This migration is IRREVERSIBLE';
  RAISE NOTICE 'Old columns will be permanently deleted';
  RAISE NOTICE '';
  RAISE NOTICE 'REQUIRED BEFORE PROCEEDING:';
  RAISE NOTICE '1. Create database backup';
  RAISE NOTICE '   Command: pg_dump $DATABASE_URL > backup_before_phase3_$(date +%%Y%%m%%d).sql';
  RAISE NOTICE '2. Verify application stable for 1-2 weeks';
  RAISE NOTICE '3. Verify security tests pass 100%%';
  RAISE NOTICE '4. Verify no cross-organization data leaks';
  RAISE NOTICE '5. Get approval from Tech Lead / DBA';
  RAISE NOTICE '';
  RAISE NOTICE 'Rollback requires: Restore from backup';
  RAISE NOTICE '';
  RAISE NOTICE 'Press CTRL+C to cancel within 10 seconds...';
  RAISE NOTICE '';

  -- 10 second delay for manual review
  PERFORM pg_sleep(10);

  RAISE NOTICE 'Proceeding with Phase 3...';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VALIDATION: Pre-Flight Checks
-- ============================================================================

DO $$
DECLARE
  phase2_complete BOOLEAN;
  agents_data_consistent BOOLEAN;
  workflows_data_consistent BOOLEAN;
  prompts_data_consistent BOOLEAN;
  audit_logs_data_consistent BOOLEAN;
  inconsistencies INTEGER := 0;
BEGIN
  -- Verify Phase 2 completed (RLS policies exist on new columns)
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'agents' AND policyname = 'agents_isolation'
  ) INTO phase2_complete;

  IF NOT phase2_complete THEN
    RAISE EXCEPTION 'PHASE 2 NOT COMPLETE: Run Phase 2 migration first';
  END IF;

  -- Verify data consistency between old and new columns
  SELECT (SELECT COUNT(*) FROM agents WHERE tenant_id != owner_organization_id AND tenant_id IS NOT NULL AND owner_organization_id IS NOT NULL) = 0
  INTO agents_data_consistent;

  SELECT (SELECT COUNT(*) FROM workflows WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL) = 0
  INTO workflows_data_consistent;

  SELECT (SELECT COUNT(*) FROM prompts WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL) = 0
  INTO prompts_data_consistent;

  SELECT (SELECT COUNT(*) FROM audit_logs WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL) = 0
  INTO audit_logs_data_consistent;

  -- Count total inconsistencies
  IF NOT agents_data_consistent THEN
    SELECT COUNT(*) INTO inconsistencies FROM agents WHERE tenant_id != owner_organization_id AND tenant_id IS NOT NULL AND owner_organization_id IS NOT NULL;
    RAISE EXCEPTION 'DATA INCONSISTENCY: % agents rows have mismatched tenant_id vs owner_organization_id', inconsistencies;
  END IF;

  IF NOT workflows_data_consistent THEN
    SELECT COUNT(*) INTO inconsistencies FROM workflows WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL;
    RAISE EXCEPTION 'DATA INCONSISTENCY: % workflows rows have mismatched tenant_id vs organization_id', inconsistencies;
  END IF;

  IF NOT prompts_data_consistent THEN
    SELECT COUNT(*) INTO inconsistencies FROM prompts WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL;
    RAISE EXCEPTION 'DATA INCONSISTENCY: % prompts rows have mismatched tenant_id vs organization_id', inconsistencies;
  END IF;

  IF NOT audit_logs_data_consistent THEN
    SELECT COUNT(*) INTO inconsistencies FROM audit_logs WHERE tenant_id != organization_id AND tenant_id IS NOT NULL AND organization_id IS NOT NULL;
    RAISE EXCEPTION 'DATA INCONSISTENCY: % audit_logs rows have mismatched tenant_id vs organization_id', inconsistencies;
  END IF;

  RAISE NOTICE '✓ Pre-flight checks passed';
  RAISE NOTICE '✓ Phase 2 complete';
  RAISE NOTICE '✓ Data consistency verified (0 inconsistencies)';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Remove Sync Triggers (No Longer Needed)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
DROP TRIGGER IF EXISTS trigger_sync_workflows_organization_id ON workflows;
DROP TRIGGER IF EXISTS trigger_sync_prompts_organization_id ON prompts;
DROP TRIGGER IF EXISTS trigger_sync_audit_logs_organization_id ON audit_logs;

RAISE NOTICE '✓ Removed sync triggers';

-- Drop trigger functions
DROP FUNCTION IF EXISTS sync_agents_organization_id();
DROP FUNCTION IF EXISTS sync_workflows_organization_id();
DROP FUNCTION IF EXISTS sync_prompts_organization_id();
DROP FUNCTION IF EXISTS sync_audit_logs_organization_id();

RAISE NOTICE '✓ Removed sync functions';

-- ============================================================================
-- STEP 2: Drop Old Columns
-- ============================================================================

-- Drop tenant_id from agents
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
RAISE NOTICE '✓ Dropped agents.tenant_id column';

-- Drop tenant_id from workflows
ALTER TABLE workflows DROP COLUMN IF EXISTS tenant_id;
RAISE NOTICE '✓ Dropped workflows.tenant_id column';

-- Drop tenant_id from prompts
ALTER TABLE prompts DROP COLUMN IF EXISTS tenant_id;
RAISE NOTICE '✓ Dropped prompts.tenant_id column';

-- Drop tenant_id from audit_logs
ALTER TABLE audit_logs DROP COLUMN IF EXISTS tenant_id;
RAISE NOTICE '✓ Dropped audit_logs.tenant_id column';

-- ============================================================================
-- STEP 3: Update NOT NULL Constraints (Optional - Enforce Data Quality)
-- ============================================================================

-- Make owner_organization_id NOT NULL for agents (business rule: all agents must belong to an org)
-- NOTE: Only uncomment if your business logic requires this
-- ALTER TABLE agents ALTER COLUMN owner_organization_id SET NOT NULL;

-- Make organization_id NOT NULL for workflows
-- NOTE: Only uncomment if your business logic requires this
-- ALTER TABLE workflows ALTER COLUMN organization_id SET NOT NULL;

RAISE NOTICE '✓ NOT NULL constraints (optional, commented out by default)';

-- ============================================================================
-- STEP 4: Vacuum Tables to Reclaim Space
-- ============================================================================

-- Vacuum agents table
VACUUM FULL agents;
RAISE NOTICE '✓ Vacuumed agents table';

-- Vacuum workflows table
VACUUM FULL workflows;
RAISE NOTICE '✓ Vacuumed workflows table';

-- Vacuum prompts table
VACUUM FULL prompts;
RAISE NOTICE '✓ Vacuumed prompts table';

-- Vacuum audit_logs table
VACUUM FULL audit_logs;
RAISE NOTICE '✓ Vacuumed audit_logs table';

-- ============================================================================
-- STEP 5: Analyze Tables for Query Planner
-- ============================================================================

ANALYZE agents;
ANALYZE workflows;
ANALYZE prompts;
ANALYZE audit_logs;

RAISE NOTICE '✓ Analyzed tables for query planner';

-- ============================================================================
-- STEP 6: Verify Old Columns Removed
-- ============================================================================

DO $$
DECLARE
  agents_tenant_id_exists BOOLEAN;
  workflows_tenant_id_exists BOOLEAN;
  prompts_tenant_id_exists BOOLEAN;
  audit_logs_tenant_id_exists BOOLEAN;
BEGIN
  -- Check that old columns no longer exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'tenant_id'
  ) INTO agents_tenant_id_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'tenant_id'
  ) INTO workflows_tenant_id_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompts' AND column_name = 'tenant_id'
  ) INTO prompts_tenant_id_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'tenant_id'
  ) INTO audit_logs_tenant_id_exists;

  -- Raise error if any old column still exists
  IF agents_tenant_id_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: agents.tenant_id still exists';
  END IF;

  IF workflows_tenant_id_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: workflows.tenant_id still exists';
  END IF;

  IF prompts_tenant_id_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: prompts.tenant_id still exists';
  END IF;

  IF audit_logs_tenant_id_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: audit_logs.tenant_id still exists';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 3: MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✓ All old columns removed';
  RAISE NOTICE '✓ All triggers removed';
  RAISE NOTICE '✓ Tables vacuumed';
  RAISE NOTICE '✓ Query planner updated';
  RAISE NOTICE '';
  RAISE NOTICE 'Schema standardization complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Monitor application for 24-48 hours';
  RAISE NOTICE '2. Run full security test suite';
  RAISE NOTICE '3. Verify no regressions';
  RAISE NOTICE '4. Archive backup file (keep for 90 days)';
  RAISE NOTICE '5. Update application documentation';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/**
 * CRITICAL: Phase 3 is NOT reversible without backup
 *
 * To rollback Phase 3:
 *
 * 1. Stop application
 * 2. Restore from backup:
 *    psql $DATABASE_URL < backup_before_phase3_YYYYMMDD.sql
 * 3. Verify data integrity
 * 4. Restart application
 *
 * ALTERNATIVE: Re-add old columns (requires data re-sync)
 *
 * -- Add tenant_id columns back
 * ALTER TABLE agents ADD COLUMN tenant_id UUID;
 * ALTER TABLE workflows ADD COLUMN tenant_id UUID;
 * ALTER TABLE prompts ADD COLUMN tenant_id UUID;
 * ALTER TABLE audit_logs ADD COLUMN tenant_id UUID;
 *
 * -- Copy data from new columns back to old columns
 * UPDATE agents SET tenant_id = owner_organization_id;
 * UPDATE workflows SET tenant_id = organization_id;
 * UPDATE prompts SET tenant_id = organization_id;
 * UPDATE audit_logs SET tenant_id = organization_id;
 *
 * -- Re-create sync triggers
 * -- (Run Phase 1 migration again)
 */

-- ============================================================================
-- DISK SPACE RECLAIMED
-- ============================================================================

DO $$
DECLARE
  database_size TEXT;
BEGIN
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO database_size;
  RAISE NOTICE 'Current database size: %', database_size;
  RAISE NOTICE '';
  RAISE NOTICE 'Disk space reclaimed by dropping old columns and vacuuming';
END $$;
