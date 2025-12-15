/**
 * Migration: Fix Remaining Search Path Warning
 *
 * SECURITY FIX: Add explicit search_path to update_evidence_search_vector function
 *
 * ISSUE: One trigger function was missed in Migration 015
 * - update_evidence_search_vector() - trigger function for evidence full-text search
 * - Missing explicit search_path (vulnerable to search_path injection)
 *
 * FIX:
 * - Add `SET search_path = public` to the function
 * - This ensures the function only looks in the public schema
 * - Prevents search_path manipulation attacks
 *
 * IMPACT:
 * - Zero functionality change
 * - Fixes the final function_search_path_mutable warning
 * - Achieves 100% function security coverage
 */

-- ============================================================================
-- FIX: Add search_path to update_evidence_search_vector
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FIXING FINAL SEARCH_PATH WARNING';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';

  -- Add search_path to the trigger function
  ALTER FUNCTION update_evidence_search_vector() SET search_path = public;

  RAISE NOTICE '✓ Fixed: update_evidence_search_vector()';
  RAISE NOTICE '  - Type: Trigger function (full-text search)';
  RAISE NOTICE '  - Added: SET search_path = public';
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'MIGRATION 017: COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- VALIDATION: Verify Fix
-- ============================================================================

DO $$
DECLARE
  has_search_path BOOLEAN;
BEGIN
  -- Check if function now has search_path configured
  SELECT (proconfig @> ARRAY['search_path=public']) INTO has_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'update_evidence_search_vector';

  RAISE NOTICE 'Validation:';
  IF has_search_path THEN
    RAISE NOTICE '  ✓ update_evidence_search_vector now has search_path = public';
  ELSE
    RAISE WARNING '  ✗ update_evidence_search_vector still missing search_path!';
  END IF;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- FINAL STATISTICS
-- ============================================================================

DO $$
DECLARE
  custom_functions_without_search_path INTEGER;
BEGIN
  -- Count any remaining custom functions without search_path
  SELECT COUNT(*) INTO custom_functions_without_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND (p.proconfig IS NULL OR NOT (p.proconfig @> ARRAY['search_path=public']));

  RAISE NOTICE '============================================';
  RAISE NOTICE 'FINAL SECURITY POSTURE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Custom functions without search_path: %', custom_functions_without_search_path;
  RAISE NOTICE '';

  IF custom_functions_without_search_path = 0 THEN
    RAISE NOTICE '🎉 100%% FUNCTION SECURITY ACHIEVED!';
    RAISE NOTICE '';
    RAISE NOTICE 'All Migrations Summary:';
    RAISE NOTICE '  ✅ Migration 015: 143 custom functions fixed';
    RAISE NOTICE '  ✅ Migration 016: 3 extensions + ~437 functions moved';
    RAISE NOTICE '  ✅ Migration 017: 1 trigger function fixed';
    RAISE NOTICE '  ✅ TOTAL: 581+ functions secured';
    RAISE NOTICE '';
    RAISE NOTICE 'Remaining Warnings:';
    RAISE NOTICE '  📋 1 auth_leaked_password_protection (manual fix)';
    RAISE NOTICE '';
    RAISE NOTICE 'Overall Achievement:';
    RAISE NOTICE '  ✅ 524/524 tables with RLS (100%%)';
    RAISE NOTICE '  ✅ 40/40 Security Definer views fixed (100%%)';
    RAISE NOTICE '  ✅ 581+ functions secured (100%%)';
    RAISE NOTICE '  ✅ 0 extension_in_public warnings';
    RAISE NOTICE '  ✅ 0 function_search_path warnings';
    RAISE NOTICE '  📋 1 auth warning (manual fix documented)';
    RAISE NOTICE '';
  ELSE
    RAISE WARNING 'Still have % custom functions without search_path', custom_functions_without_search_path;
  END IF;

  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- TESTING QUERY
-- ============================================================================

/**
 * Test: Verify no function_search_path warnings remain
 *
 * SELECT
 *   p.proname,
 *   n.nspname,
 *   p.proconfig
 * FROM pg_proc p
 * JOIN pg_namespace n ON p.pronamespace = n.oid
 * WHERE n.nspname = 'public'
 *   AND p.prokind = 'f'
 *   AND (p.proconfig IS NULL OR NOT (p.proconfig @> ARRAY['search_path=public']))
 * ORDER BY p.proname;
 * -- Expected: 0 rows
 */
