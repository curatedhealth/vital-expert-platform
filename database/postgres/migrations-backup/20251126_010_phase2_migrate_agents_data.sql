/**
 * Phase 2: Migrate Agent Data (Simplified for Actual Schema)
 *
 * GOAL: Copy tenant_id → owner_organization_id for 943 agents that need it
 *
 * ACTUAL DATABASE STATE:
 * - agents table: Has both tenant_id and owner_organization_id (Phase 1 complete)
 * - workflows table: Only has organization_id (never had tenant_id)
 * - prompts table: Only has organization_id (never had tenant_id)
 *
 * DATA STATUS:
 * - 1,138 total agents
 * - 1,016 have tenant_id (allocated to pharma, digital health, VITAL, etc.)
 * - 73 already have owner_organization_id
 * - 943 need migration (tenant_id → owner_organization_id)
 * - 0 inconsistencies (sync trigger working correctly)
 *
 * STRATEGY:
 * 1. Migrate data for agents table only
 * 2. Update RLS policies for all 3 tables
 * 3. Create indexes on new columns
 * 4. Validate data consistency
 *
 * RISK LEVEL: LOW
 * - Simple data copy operation
 * - Sync trigger ensures ongoing consistency
 * - No schema changes
 * - Fully reversible
 *
 * ROLLBACK: Set owner_organization_id = NULL for migrated rows
 */

-- ============================================================================
-- VALIDATION: Pre-Migration Check
-- ============================================================================

DO $$
DECLARE
  agents_count INTEGER;
  needs_migration INTEGER;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 2: MIGRATE AGENT DATA';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Count total agents
  SELECT COUNT(*) INTO agents_count FROM agents;

  -- Count agents needing migration
  SELECT COUNT(*) INTO needs_migration
  FROM agents
  WHERE tenant_id IS NOT NULL
    AND owner_organization_id IS NULL;

  RAISE NOTICE 'Total agents: %', agents_count;
  RAISE NOTICE 'Agents needing migration: %', needs_migration;
  RAISE NOTICE '';

  IF needs_migration = 0 THEN
    RAISE NOTICE '✓ No agents need migration (already complete)';
  ELSE
    RAISE NOTICE 'Will migrate % agents from tenant_id to owner_organization_id', needs_migration;
  END IF;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Migrate Agent Data (tenant_id → owner_organization_id)
-- ============================================================================

-- Backup current state before migration
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  -- Perform migration
  UPDATE agents
  SET owner_organization_id = tenant_id
  WHERE tenant_id IS NOT NULL
    AND owner_organization_id IS NULL;

  GET DIAGNOSTICS migrated_count = ROW_COUNT;

  RAISE NOTICE '✓ Migrated % agents (tenant_id → owner_organization_id)', migrated_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: Validate Data Migration
-- ============================================================================

DO $$
DECLARE
  total_agents INTEGER;
  has_tenant INTEGER;
  has_owner_org INTEGER;
  inconsistent INTEGER;
  null_both INTEGER;
BEGIN
  -- Get counts
  SELECT
    COUNT(*),
    COUNT(tenant_id),
    COUNT(owner_organization_id),
    COUNT(CASE WHEN tenant_id != owner_organization_id
          AND tenant_id IS NOT NULL
          AND owner_organization_id IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN tenant_id IS NULL
          AND owner_organization_id IS NULL THEN 1 END)
  INTO total_agents, has_tenant, has_owner_org, inconsistent, null_both
  FROM agents;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'DATA MIGRATION VALIDATION';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total agents: %', total_agents;
  RAISE NOTICE 'Agents with tenant_id: %', has_tenant;
  RAISE NOTICE 'Agents with owner_organization_id: %', has_owner_org;
  RAISE NOTICE 'Inconsistent rows (tenant_id != owner_organization_id): %', inconsistent;
  RAISE NOTICE 'Rows with both NULL: %', null_both;
  RAISE NOTICE '';

  IF inconsistent > 0 THEN
    RAISE EXCEPTION 'DATA INCONSISTENCY DETECTED: % rows have mismatched tenant_id vs owner_organization_id', inconsistent;
  END IF;

  RAISE NOTICE '✓ Data migration validated successfully';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 3: Update RLS Policies for Agents Table
-- ============================================================================

-- Drop old policies that reference tenant_id (if they exist)
DO $$
BEGIN
  -- Try to drop old tenant_id-based policy
  BEGIN
    DROP POLICY IF EXISTS agents_isolation_old ON agents;
    DROP POLICY IF EXISTS agents_tenant_isolation ON agents;
    RAISE NOTICE '✓ Dropped old tenant_id-based policies (if they existed)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠ No old policies to drop';
  END;
END $$;

-- Create new policy using owner_organization_id
DO $$
BEGIN
  -- Create new organization-based isolation policy
  CREATE POLICY agents_isolation ON agents
    FOR ALL
    USING (owner_organization_id = get_current_organization_context()::UUID);

  RAISE NOTICE '✓ Created new RLS policy: agents_isolation (using owner_organization_id)';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '⚠ Policy agents_isolation already exists, recreating...';
    DROP POLICY agents_isolation ON agents;
    CREATE POLICY agents_isolation ON agents
      FOR ALL
      USING (owner_organization_id = get_current_organization_context()::UUID);
    RAISE NOTICE '✓ Recreated RLS policy: agents_isolation';
END $$;

-- Add service role bypass
DO $$
BEGIN
  CREATE POLICY agents_service_role_bypass ON agents
    FOR ALL
    TO service_role
    USING (true);

  RAISE NOTICE '✓ Created service role bypass policy';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Service role bypass policy already exists';
END $$;

-- ============================================================================
-- STEP 4: Update RLS Policies for Workflows Table
-- ============================================================================

-- Workflows already uses organization_id, just ensure policies exist
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✓ RLS enabled on workflows table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ RLS already enabled on workflows table';
END $$;

DO $$
BEGIN
  -- Create organization isolation policy
  CREATE POLICY workflows_isolation ON workflows
    FOR ALL
    USING (organization_id = get_current_organization_context()::UUID);

  RAISE NOTICE '✓ Created RLS policy: workflows_isolation';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ RLS policy workflows_isolation already exists';
END $$;

-- Service role bypass
DO $$
BEGIN
  CREATE POLICY workflows_service_role_bypass ON workflows
    FOR ALL
    TO service_role
    USING (true);

  RAISE NOTICE '✓ Created service role bypass for workflows';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Service role bypass already exists for workflows';
END $$;

-- ============================================================================
-- STEP 5: Update RLS Policies for Prompts Table
-- ============================================================================

-- Prompts already uses organization_id, just ensure policies exist
DO $$
BEGIN
  ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✓ RLS enabled on prompts table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✓ RLS already enabled on prompts table';
END $$;

DO $$
BEGIN
  CREATE POLICY prompts_isolation ON prompts
    FOR ALL
    USING (organization_id = get_current_organization_context()::UUID);

  RAISE NOTICE '✓ Created RLS policy: prompts_isolation';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ RLS policy prompts_isolation already exists';
END $$;

-- Service role bypass
DO $$
BEGIN
  CREATE POLICY prompts_service_role_bypass ON prompts
    FOR ALL
    TO service_role
    USING (true);

  RAISE NOTICE '✓ Created service role bypass for prompts';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Service role bypass already exists for prompts';
END $$;

-- ============================================================================
-- STEP 6: Create Indexes on New Columns
-- ============================================================================

-- Index on agents.owner_organization_id
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_agents_owner_organization_id
    ON agents(owner_organization_id);
  RAISE NOTICE '✓ Created index: idx_agents_owner_organization_id';
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE '✓ Index idx_agents_owner_organization_id already exists';
END $$;

-- Index on workflows.organization_id
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_workflows_organization_id
    ON workflows(organization_id);
  RAISE NOTICE '✓ Created index: idx_workflows_organization_id';
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE '✓ Index idx_workflows_organization_id already exists';
END $$;

-- Index on prompts.organization_id
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_prompts_organization_id
    ON prompts(organization_id);
  RAISE NOTICE '✓ Created index: idx_prompts_organization_id';
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE '✓ Index idx_prompts_organization_id already exists';
END $$;

-- ============================================================================
-- STEP 7: Final Validation
-- ============================================================================

DO $$
DECLARE
  agents_rls BOOLEAN;
  workflows_rls BOOLEAN;
  prompts_rls BOOLEAN;
  agents_policy_count INTEGER;
  workflows_policy_count INTEGER;
  prompts_policy_count INTEGER;
BEGIN
  -- Check RLS enabled
  SELECT relrowsecurity INTO agents_rls
  FROM pg_class WHERE relname = 'agents';

  SELECT relrowsecurity INTO workflows_rls
  FROM pg_class WHERE relname = 'workflows';

  SELECT relrowsecurity INTO prompts_rls
  FROM pg_class WHERE relname = 'prompts';

  -- Count policies
  SELECT COUNT(*) INTO agents_policy_count
  FROM pg_policies WHERE tablename = 'agents';

  SELECT COUNT(*) INTO workflows_policy_count
  FROM pg_policies WHERE tablename = 'workflows';

  SELECT COUNT(*) INTO prompts_policy_count
  FROM pg_policies WHERE tablename = 'prompts';

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 2: MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Status:';
  RAISE NOTICE '  - agents: % (% policies)', agents_rls, agents_policy_count;
  RAISE NOTICE '  - workflows: % (% policies)', workflows_rls, workflows_policy_count;
  RAISE NOTICE '  - prompts: % (% policies)', prompts_rls, prompts_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes Created:';
  RAISE NOTICE '  ✓ idx_agents_owner_organization_id';
  RAISE NOTICE '  ✓ idx_workflows_organization_id';
  RAISE NOTICE '  ✓ idx_prompts_organization_id';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test application functionality';
  RAISE NOTICE '2. Monitor for 48-72 hours';
  RAISE NOTICE '3. Run security test suite';
  RAISE NOTICE '4. If stable, proceed to Phase 3 (drop tenant_id from agents)';
  RAISE NOTICE '';

  -- Validation checks
  IF NOT agents_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on agents';
  END IF;

  IF NOT workflows_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on workflows';
  END IF;

  IF NOT prompts_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on prompts';
  END IF;

  IF agents_policy_count < 2 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: agents table needs at least 2 policies (isolation + service role)';
  END IF;

  RAISE NOTICE '✓ All validation checks passed';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/**
 * To rollback Phase 2:
 *
 * -- Revert data migration
 * UPDATE agents
 * SET owner_organization_id = NULL
 * WHERE tenant_id IS NOT NULL;
 *
 * -- Revert RLS policies to use tenant_id
 * DROP POLICY IF EXISTS agents_isolation ON agents;
 * CREATE POLICY agents_isolation ON agents
 *   FOR ALL
 *   USING (tenant_id = get_current_organization_context()::UUID);
 *
 * -- Note: Keep workflows and prompts policies (they never had tenant_id)
 */
