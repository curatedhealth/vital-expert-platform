/**
 * Phase 2: Migrate Data & Update RLS Policies
 *
 * GOAL: Migrate data to new columns, update RLS policies, enable dual-write
 *
 * STRATEGY: Zero-downtime migration with validation
 * - Copy data from old columns to new columns
 * - Validate data integrity
 * - Update RLS policies to use new columns
 * - Deploy application code to read from new columns (triggers ensure dual-write)
 *
 * PREREQUISITES:
 * - Phase 1 completed successfully
 * - Application stable for 24-48 hours
 * - Triggers actively syncing old/new columns
 *
 * ROLLBACK: Revert RLS policies, deploy app code to use old columns
 *
 * RISK LEVEL: MEDIUM
 * - Data is copied (not moved)
 * - RLS policies updated (affects data visibility)
 * - Application code deployment required
 * - Reversible with coordination
 */

-- ============================================================================
-- VALIDATION: Pre-Flight Checks
-- ============================================================================

DO $$
DECLARE
  phase1_complete BOOLEAN;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 2: MIGRATE DATA & UPDATE RLS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Verify Phase 1 columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'owner_organization_id'
  ) INTO phase1_complete;

  IF NOT phase1_complete THEN
    RAISE EXCEPTION 'PHASE 1 NOT COMPLETE: Run Phase 1 migration first';
  END IF;

  RAISE NOTICE 'IMPORTANT: Ensure database backup exists';
  RAISE NOTICE 'Backup command: pg_dump $DATABASE_URL > backup_phase2_$(date +%%Y%%m%%d).sql';
  RAISE NOTICE '';
  RAISE NOTICE 'This migration modifies data and RLS policies';
  RAISE NOTICE 'Rollback: Revert RLS policies, redeploy application code';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Migrate Data - agents Table
-- ============================================================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE 'Migrating agents data: tenant_id -> owner_organization_id...';

  -- Copy data from tenant_id to owner_organization_id
  UPDATE agents
  SET owner_organization_id = tenant_id
  WHERE owner_organization_id IS NULL
    AND tenant_id IS NOT NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Migrated % rows in agents table', rows_updated;
END $$;

-- Validate agents data consistency
DO $$
DECLARE
  inconsistent_count INTEGER;
  null_count INTEGER;
BEGIN
  -- Check for inconsistencies between old and new columns
  SELECT COUNT(*) INTO inconsistent_count
  FROM agents
  WHERE tenant_id IS NOT NULL
    AND owner_organization_id IS NOT NULL
    AND tenant_id != owner_organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: % rows have inconsistent tenant_id vs owner_organization_id', inconsistent_count;
  END IF;

  -- Check for NULLs in both columns (data quality issue)
  SELECT COUNT(*) INTO null_count
  FROM agents
  WHERE tenant_id IS NULL
    AND owner_organization_id IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING 'WARNING: % agents have NULL organization (may be platform-wide resources)', null_count;
  END IF;

  RAISE NOTICE '✓ Agents data validation passed: 0 inconsistencies';
END $$;

-- ============================================================================
-- STEP 2: Migrate Data - workflows Table
-- ============================================================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE 'Migrating workflows data: tenant_id -> organization_id...';

  -- Copy data from tenant_id to organization_id
  UPDATE workflows
  SET organization_id = tenant_id
  WHERE organization_id IS NULL
    AND tenant_id IS NOT NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Migrated % rows in workflows table', rows_updated;
END $$;

-- Validate workflows data consistency
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM workflows
  WHERE tenant_id IS NOT NULL
    AND organization_id IS NOT NULL
    AND tenant_id != organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: % rows have inconsistent tenant_id vs organization_id', inconsistent_count;
  END IF;

  RAISE NOTICE '✓ Workflows data validation passed: 0 inconsistencies';
END $$;

-- ============================================================================
-- STEP 3: Migrate Data - prompts Table
-- ============================================================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE 'Migrating prompts data: tenant_id -> organization_id...';

  -- Copy data from tenant_id to organization_id
  UPDATE prompts
  SET organization_id = tenant_id
  WHERE organization_id IS NULL
    AND tenant_id IS NOT NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Migrated % rows in prompts table', rows_updated;
END $$;

-- Validate prompts data consistency
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM prompts
  WHERE tenant_id IS NOT NULL
    AND organization_id IS NOT NULL
    AND tenant_id != organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: % rows have inconsistent tenant_id vs organization_id', inconsistent_count;
  END IF;

  RAISE NOTICE '✓ Prompts data validation passed: 0 inconsistencies';
END $$;

-- ============================================================================
-- STEP 4: Migrate Data - audit_logs Table
-- ============================================================================

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  RAISE NOTICE 'Migrating audit_logs data: tenant_id -> organization_id...';

  -- Copy data from tenant_id to organization_id
  UPDATE audit_logs
  SET organization_id = tenant_id
  WHERE organization_id IS NULL
    AND tenant_id IS NOT NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '✓ Migrated % rows in audit_logs table', rows_updated;
END $$;

-- Validate audit_logs data consistency
DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM audit_logs
  WHERE tenant_id IS NOT NULL
    AND organization_id IS NOT NULL
    AND tenant_id != organization_id;

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: % rows have inconsistent tenant_id vs organization_id', inconsistent_count;
  END IF;

  RAISE NOTICE '✓ Audit logs data validation passed: 0 inconsistencies';
END $$;

-- ============================================================================
-- STEP 5: Update RLS Policies - agents Table
-- ============================================================================

-- Drop old policy
DROP POLICY IF EXISTS agents_isolation ON agents;

-- Create new policy using owner_organization_id
CREATE POLICY agents_isolation ON agents
  USING (
    -- Organization-owned agents
    owner_organization_id = get_current_organization_context()::UUID

    -- Platform-shared agents (visible to all)
    OR sharing_scope = 'platform'

    -- Tenant-shared agents (visible within same tenant hierarchy)
    OR (
      sharing_scope = 'tenant'
      AND EXISTS (
        SELECT 1
        FROM organizations o_owner, organizations o_viewer
        WHERE o_owner.id = agents.owner_organization_id
          AND o_viewer.id = get_current_organization_context()::UUID
          AND (
            -- Same tenant
            o_owner.parent_organization_id = o_viewer.parent_organization_id
            -- Or one is parent of the other
            OR o_owner.id = o_viewer.parent_organization_id
            OR o_viewer.id = o_owner.parent_organization_id
          )
      )
    )
  );

RAISE NOTICE '✓ Updated RLS policy for agents table (now uses owner_organization_id)';

-- ============================================================================
-- STEP 6: Update RLS Policies - workflows Table
-- ============================================================================

-- Drop old policy
DROP POLICY IF EXISTS workflows_isolation ON workflows;

-- Create new policy using organization_id
CREATE POLICY workflows_isolation ON workflows
  USING (organization_id = get_current_organization_context()::UUID);

RAISE NOTICE '✓ Updated RLS policy for workflows table (now uses organization_id)';

-- ============================================================================
-- STEP 7: Update RLS Policies - prompts Table
-- ============================================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS prompts_isolation ON prompts;

-- Enable RLS on prompts table
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create new policy using organization_id
CREATE POLICY prompts_isolation ON prompts
  USING (
    organization_id = get_current_organization_context()::UUID
    OR organization_id IS NULL -- Platform-wide prompts
  );

RAISE NOTICE '✓ Created RLS policy for prompts table (now uses organization_id)';

-- ============================================================================
-- STEP 8: Add RLS Policies - audit_logs Table
-- ============================================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS audit_logs_isolation ON audit_logs;

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy using organization_id
CREATE POLICY audit_logs_isolation ON audit_logs
  USING (organization_id = get_current_organization_context()::UUID);

RAISE NOTICE '✓ Created RLS policy for audit_logs table';

-- ============================================================================
-- STEP 9: Add RLS Policies - user_organizations Table
-- ============================================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS user_organizations_isolation ON user_organizations;

-- Enable RLS on user_organizations table
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own organization memberships
CREATE POLICY user_organizations_isolation ON user_organizations
  USING (
    organization_id = get_current_organization_context()::UUID
    OR user_id = auth.uid() -- Users can see their own memberships
  );

RAISE NOTICE '✓ Created RLS policy for user_organizations table';

-- ============================================================================
-- STEP 10: Add Indexes on New Columns
-- ============================================================================

-- Index on agents.owner_organization_id
CREATE INDEX IF NOT EXISTS idx_agents_owner_organization_id
ON agents(owner_organization_id)
WHERE owner_organization_id IS NOT NULL;

-- Index on workflows.organization_id
CREATE INDEX IF NOT EXISTS idx_workflows_organization_id
ON workflows(organization_id)
WHERE organization_id IS NOT NULL;

-- Index on prompts.organization_id
CREATE INDEX IF NOT EXISTS idx_prompts_organization_id
ON prompts(organization_id)
WHERE organization_id IS NOT NULL;

-- Index on audit_logs.organization_id
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id
ON audit_logs(organization_id)
WHERE organization_id IS NOT NULL;

RAISE NOTICE '✓ Created indexes on new organization columns';

-- ============================================================================
-- STEP 11: Analyze Tables for Query Planner
-- ============================================================================

ANALYZE agents;
ANALYZE workflows;
ANALYZE prompts;
ANALYZE audit_logs;
ANALYZE user_organizations;

RAISE NOTICE '✓ Analyzed tables for query planner optimization';

-- ============================================================================
-- VALIDATION: Post-Migration Checks
-- ============================================================================

DO $$
DECLARE
  agents_policy_exists BOOLEAN;
  workflows_policy_exists BOOLEAN;
  prompts_policy_exists BOOLEAN;
  audit_logs_policy_exists BOOLEAN;
  user_orgs_policy_exists BOOLEAN;
BEGIN
  -- Verify RLS policies exist
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'agents' AND policyname = 'agents_isolation'
  ) INTO agents_policy_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workflows' AND policyname = 'workflows_isolation'
  ) INTO workflows_policy_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'prompts' AND policyname = 'prompts_isolation'
  ) INTO prompts_policy_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs' AND policyname = 'audit_logs_isolation'
  ) INTO audit_logs_policy_exists;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_organizations' AND policyname = 'user_organizations_isolation'
  ) INTO user_orgs_policy_exists;

  IF NOT agents_policy_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: agents RLS policy not found';
  END IF;

  IF NOT workflows_policy_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: workflows RLS policy not found';
  END IF;

  IF NOT prompts_policy_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: prompts RLS policy not found';
  END IF;

  IF NOT audit_logs_policy_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: audit_logs RLS policy not found';
  END IF;

  IF NOT user_orgs_policy_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: user_organizations RLS policy not found';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 2: VALIDATION PASSED';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✓ All data migrated successfully';
  RAISE NOTICE '✓ All RLS policies updated';
  RAISE NOTICE '✓ All indexes created';
  RAISE NOTICE '✓ Tables analyzed';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Deploy application code to read from new columns';
  RAISE NOTICE '2. Monitor for 48 hours';
  RAISE NOTICE '3. Verify no cross-organization data leaks';
  RAISE NOTICE '4. Run security test suite';
  RAISE NOTICE '5. Proceed to Phase 3 after 1-2 weeks of stability';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/**
 * To rollback Phase 2:
 *
 * -- Revert agents RLS policy to use tenant_id
 * DROP POLICY IF EXISTS agents_isolation ON agents;
 * CREATE POLICY agents_isolation ON agents
 *   USING (tenant_id = get_current_organization_context()::UUID);
 *
 * -- Revert workflows RLS policy
 * DROP POLICY IF EXISTS workflows_isolation ON workflows;
 * CREATE POLICY workflows_isolation ON workflows
 *   USING (tenant_id = get_current_organization_context()::UUID);
 *
 * -- Remove prompts RLS policy
 * DROP POLICY IF EXISTS prompts_isolation ON prompts;
 * ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
 *
 * -- Remove audit_logs RLS policy
 * DROP POLICY IF EXISTS audit_logs_isolation ON audit_logs;
 * ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
 *
 * -- Remove user_organizations RLS policy
 * DROP POLICY IF EXISTS user_organizations_isolation ON user_organizations;
 * ALTER TABLE user_organizations DISABLE ROW LEVEL SECURITY;
 *
 * -- Deploy application code to read from old columns (tenant_id)
 * -- Keep triggers active for data consistency
 */
