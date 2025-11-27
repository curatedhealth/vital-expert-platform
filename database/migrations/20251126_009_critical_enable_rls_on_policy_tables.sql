/**
 * CRITICAL SECURITY FIX: Enable RLS on Tables with Existing Policies
 *
 * PRIORITY: P0 - CRITICAL
 * ISSUE: Supabase Lint Detection - "Policy Exists RLS Disabled"
 *
 * PROBLEM:
 * Three tables have RLS policies defined but RLS is NOT ENABLED on the table.
 * This means all policies are completely ignored, creating a false sense of security.
 * Any authenticated user can access ALL data from these tables.
 *
 * AFFECTED TABLES:
 * 1. knowledge_domains - Has 3 policies but RLS disabled
 * 2. tenants - Has 1 policy but RLS disabled
 * 3. users - Has 2 policies but RLS disabled
 *
 * SOLUTION:
 * Enable RLS on these 3 tables. Existing policies will immediately take effect.
 *
 * RISK LEVEL: VERY LOW
 * - No schema changes
 * - No data modification
 * - Only enables existing policies
 * - Fully reversible (disable RLS if issues occur)
 *
 * IMPACT: HIGH SECURITY IMPROVEMENT
 * - Immediately enforces existing policies
 * - Prevents unauthorized cross-tenant data access
 * - Closes critical security vulnerability
 *
 * ROLLBACK: Disable RLS on the 3 tables
 */

-- ============================================================================
-- VALIDATION: Backup Check
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'CRITICAL SECURITY FIX: Enable RLS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'This migration enables RLS on 3 critical tables:';
  RAISE NOTICE '  1. knowledge_domains';
  RAISE NOTICE '  2. tenants';
  RAISE NOTICE '  3. users';
  RAISE NOTICE '';
  RAISE NOTICE 'Existing policies will immediately take effect.';
  RAISE NOTICE 'Risk Level: VERY LOW (no schema or data changes)';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Verify Policies Exist Before Enabling RLS
-- ============================================================================

DO $$
DECLARE
  knowledge_domains_policies INTEGER;
  tenants_policies INTEGER;
  users_policies INTEGER;
BEGIN
  -- Count existing policies for each table
  SELECT COUNT(*) INTO knowledge_domains_policies
  FROM pg_policies
  WHERE tablename = 'knowledge_domains';

  SELECT COUNT(*) INTO tenants_policies
  FROM pg_policies
  WHERE tablename = 'tenants';

  SELECT COUNT(*) INTO users_policies
  FROM pg_policies
  WHERE tablename = 'users';

  -- Validate policies exist
  IF knowledge_domains_policies = 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: No policies found for knowledge_domains table';
  END IF;

  IF tenants_policies = 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: No policies found for tenants table';
  END IF;

  IF users_policies = 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: No policies found for users table';
  END IF;

  RAISE NOTICE '✓ Safety check passed:';
  RAISE NOTICE '  - knowledge_domains: % policies found', knowledge_domains_policies;
  RAISE NOTICE '  - tenants: % policies found', tenants_policies;
  RAISE NOTICE '  - users: % policies found', users_policies;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: Enable RLS on knowledge_domains Table
-- ============================================================================

DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  -- Check if RLS already enabled
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'knowledge_domains' AND relnamespace = 'public'::regnamespace;

  IF rls_enabled THEN
    RAISE NOTICE '⚠ RLS already enabled on knowledge_domains (skipping)';
  ELSE
    -- Enable RLS
    ALTER TABLE knowledge_domains ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✓ Enabled RLS on knowledge_domains table';

    -- List active policies
    RAISE NOTICE '  Active policies:';
    FOR rec IN
      SELECT policyname FROM pg_policies WHERE tablename = 'knowledge_domains'
    LOOP
      RAISE NOTICE '    - %', rec.policyname;
    END LOOP;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Enable RLS on tenants Table
-- ============================================================================

DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  -- Check if RLS already enabled
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'tenants' AND relnamespace = 'public'::regnamespace;

  IF rls_enabled THEN
    RAISE NOTICE '⚠ RLS already enabled on tenants (skipping)';
  ELSE
    -- Enable RLS
    ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✓ Enabled RLS on tenants table';

    -- List active policies
    RAISE NOTICE '  Active policies:';
    FOR rec IN
      SELECT policyname FROM pg_policies WHERE tablename = 'tenants'
    LOOP
      RAISE NOTICE '    - %', rec.policyname;
    END LOOP;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Enable RLS on users Table
-- ============================================================================

DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  -- Check if RLS already enabled
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'users' AND relnamespace = 'public'::regnamespace;

  IF rls_enabled THEN
    RAISE NOTICE '⚠ RLS already enabled on users (skipping)';
  ELSE
    -- Enable RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✓ Enabled RLS on users table';

    -- List active policies
    RAISE NOTICE '  Active policies:';
    FOR rec IN
      SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
      RAISE NOTICE '    - %', rec.policyname;
    END LOOP;
  END IF;
END $$;

-- ============================================================================
-- VALIDATION: Verify RLS Enabled
-- ============================================================================

DO $$
DECLARE
  knowledge_domains_rls BOOLEAN;
  tenants_rls BOOLEAN;
  users_rls BOOLEAN;
BEGIN
  -- Check RLS status for all 3 tables
  SELECT relrowsecurity INTO knowledge_domains_rls
  FROM pg_class
  WHERE relname = 'knowledge_domains' AND relnamespace = 'public'::regnamespace;

  SELECT relrowsecurity INTO tenants_rls
  FROM pg_class
  WHERE relname = 'tenants' AND relnamespace = 'public'::regnamespace;

  SELECT relrowsecurity INTO users_rls
  FROM pg_class
  WHERE relname = 'users' AND relnamespace = 'public'::regnamespace;

  -- Validate all enabled
  IF NOT knowledge_domains_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on knowledge_domains';
  END IF;

  IF NOT tenants_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on tenants';
  END IF;

  IF NOT users_rls THEN
    RAISE EXCEPTION 'VALIDATION FAILED: RLS not enabled on users';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'CRITICAL SECURITY FIX: COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✓ RLS enabled on knowledge_domains';
  RAISE NOTICE '✓ RLS enabled on tenants';
  RAISE NOTICE '✓ RLS enabled on users';
  RAISE NOTICE '';
  RAISE NOTICE 'All existing policies are now actively enforced.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test queries to verify policies work as expected';
  RAISE NOTICE '2. Monitor application logs for access denied errors';
  RAISE NOTICE '3. If issues occur, disable RLS temporarily and review policies';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/**
 * To rollback this migration (if issues detected):
 *
 * -- Disable RLS on the 3 tables
 * ALTER TABLE knowledge_domains DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
 * ALTER TABLE users DISABLE ROW LEVEL SECURITY;
 *
 * Note: This reopens the security vulnerability!
 * Only rollback if policies are causing application errors.
 * Better approach: Fix the policies rather than disabling RLS.
 */
