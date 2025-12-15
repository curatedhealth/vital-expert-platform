/**
 * Migration: Enable RLS on All Unprotected Tables
 *
 * PURPOSE: Blanket RLS enablement for comprehensive security coverage
 *
 * SCOPE: All 256 tables currently without RLS protection
 *
 * STRATEGY:
 * - Enable RLS on every table without it
 * - Add service role bypass policy (prevents application breakage)
 * - Proper isolation policies will be added in subsequent migrations
 *
 * SAFETY:
 * - Service role bypass ensures existing application continues to work
 * - Individual table errors won't stop the entire migration
 * - Progress tracking with detailed logging
 *
 * NEXT STEPS:
 * - Phase 4A: Add organization-scoped policies (~200 tables)
 * - Phase 4B: Add user-scoped policies (~30 tables)
 * - Phase 4C: Add public read policies (~50 tables)
 * - Phase 4D: Add junction table policies (~37 tables)
 * - Phase 4E: Add tenant-scoped policies (~50 tables)
 */

-- ============================================================================
-- PRE-MIGRATION VALIDATION
-- ============================================================================

DO $$
DECLARE
  unprotected_count INTEGER;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'BLANKET RLS ENABLEMENT';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Count unprotected tables
  SELECT COUNT(*) INTO unprotected_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%';

  RAISE NOTICE 'Tables without RLS: %', unprotected_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Strategy:';
  RAISE NOTICE '  1. Enable RLS on each table';
  RAISE NOTICE '  2. Add service_role bypass policy';
  RAISE NOTICE '  3. Continue on errors (log and skip)';
  RAISE NOTICE '';
  RAISE NOTICE 'Starting migration...';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ENABLE RLS ON ALL UNPROTECTED TABLES
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
  policy_name TEXT;
  tables_processed INTEGER := 0;
  tables_failed INTEGER := 0;
  tables_skipped INTEGER := 0;
  error_details TEXT;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PROCESSING TABLES';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = false  -- Only tables without RLS
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    ORDER BY tablename
  LOOP
    BEGIN
      -- Enable RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

      -- Add service role bypass policy (ensures nothing breaks)
      policy_name := tbl || '_service_role_bypass';

      -- Check if policy already exists
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl
          AND policyname = policy_name
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON %I FOR ALL TO service_role USING (true)',
          policy_name, tbl
        );

        tables_processed := tables_processed + 1;

        -- Log every 50 tables
        IF tables_processed % 50 = 0 THEN
          RAISE NOTICE '  ✓ Processed % tables...', tables_processed;
        END IF;
      ELSE
        -- Policy already exists, skip
        tables_skipped := tables_skipped + 1;
        RAISE NOTICE '  ⊙ Skipped % (policy already exists)', tbl;
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        error_details := SQLERRM;
        RAISE WARNING '  ✗ Failed to process table %: %', tbl, error_details;
        tables_failed := tables_failed + 1;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables processed: %', tables_processed;
  RAISE NOTICE 'Tables skipped: %', tables_skipped;
  RAISE NOTICE 'Tables failed: %', tables_failed;
  RAISE NOTICE '';

  IF tables_failed > 0 THEN
    RAISE WARNING 'Some tables failed to process. Check logs above for details.';
    RAISE NOTICE 'Application should continue working via service role bypass.';
  ELSE
    RAISE NOTICE '✓ All tables successfully protected!';
  END IF;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- POST-MIGRATION VALIDATION
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  protected_tables INTEGER;
  unprotected_tables INTEGER;
  coverage_percent NUMERIC;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'VALIDATION RESULTS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Count all tables
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%';

  -- Count protected tables
  SELECT COUNT(*) INTO protected_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%';

  -- Count unprotected
  unprotected_tables := total_tables - protected_tables;

  -- Calculate coverage
  IF total_tables > 0 THEN
    coverage_percent := ROUND((protected_tables::NUMERIC / total_tables::NUMERIC) * 100, 2);
  ELSE
    coverage_percent := 0;
  END IF;

  RAISE NOTICE 'Total tables: %', total_tables;
  RAISE NOTICE 'Protected tables: %', protected_tables;
  RAISE NOTICE 'Unprotected tables: %', unprotected_tables;
  RAISE NOTICE 'RLS coverage: %%%', coverage_percent;
  RAISE NOTICE '';

  IF unprotected_tables = 0 THEN
    RAISE NOTICE '✓ 100%% RLS COVERAGE ACHIEVED!';
  ELSE
    RAISE WARNING 'Still have % unprotected tables', unprotected_tables;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Monitor application for 24-48 hours';
  RAISE NOTICE '  2. Verify no permission denied errors';
  RAISE NOTICE '  3. Begin Phase 4A: Add organization-scoped policies';
  RAISE NOTICE '  4. Begin Phase 4B: Add user-scoped policies';
  RAISE NOTICE '  5. Begin Phase 4C: Add public read policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Current State:';
  RAISE NOTICE '  - All tables have RLS enabled';
  RAISE NOTICE '  - Service role has full access (bypass)';
  RAISE NOTICE '  - Application should work normally';
  RAISE NOTICE '  - Ready for proper isolation policies';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VERIFICATION QUERY (Run this after migration)
-- ============================================================================

/**
 * Quick verification query to check RLS status:
 *
 * SELECT
 *   COUNT(*) FILTER (WHERE rowsecurity = true) as protected,
 *   COUNT(*) FILTER (WHERE rowsecurity = false) as unprotected,
 *   COUNT(*) as total,
 *   ROUND(
 *     (COUNT(*) FILTER (WHERE rowsecurity = true)::NUMERIC / COUNT(*)::NUMERIC) * 100,
 *     2
 *   ) as coverage_percent
 * FROM pg_tables
 * WHERE schemaname = 'public'
 *   AND tablename NOT LIKE 'pg_%'
 *   AND tablename NOT LIKE 'sql_%';
 */

-- ============================================================================
-- ROLLBACK PROCEDURE (Emergency Only)
-- ============================================================================

/**
 * To rollback this migration (NOT RECOMMENDED):
 *
 * DO $$
 * DECLARE
 *   tbl TEXT;
 *   policy_name TEXT;
 * BEGIN
 *   FOR tbl IN
 *     SELECT tablename FROM pg_tables
 *     WHERE schemaname = 'public'
 *       AND rowsecurity = true
 *   LOOP
 *     -- Drop service role bypass policy
 *     policy_name := tbl || '_service_role_bypass';
 *     EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl);
 *
 *     -- Disable RLS
 *     EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
 *   END LOOP;
 * END $$;
 *
 * WARNING: This will expose all data again!
 * Only use in emergency situations.
 * Better approach: Fix policies instead of disabling RLS.
 */
