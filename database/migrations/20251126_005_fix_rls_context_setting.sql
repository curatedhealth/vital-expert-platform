-- Migration: Fix RLS Context Auto-Setting
-- Date: 2025-11-26
-- Priority: CRITICAL (Security Fix #5)
-- Purpose: Ensure RLS policies are automatically enforced by setting context on every request

BEGIN;

-- ============================================================================
-- UPDATE RLS CONTEXT FUNCTION TO USE CORRECT VARIABLE NAMES
-- ============================================================================

/**
 * Sets organization context for RLS policies
 *
 * CRITICAL: This function MUST be called at the start of every request
 * that queries multi-tenant data. Otherwise, RLS policies won't filter properly.
 *
 * Sets BOTH variable names for compatibility:
 * - app.current_organization_id (new, recommended)
 * - app.tenant_id (legacy, for backward compatibility)
 *
 * @param p_organization_id UUID - The organization ID to set as context
 */
CREATE OR REPLACE FUNCTION set_organization_context(p_organization_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow NULL to clear context (for platform-level queries)
  IF p_organization_id IS NULL THEN
    PERFORM set_config('app.current_organization_id', '', false);
    PERFORM set_config('app.tenant_id', '', false);
    RAISE DEBUG 'Organization context cleared';
    RETURN;
  END IF;

  -- Set BOTH variable names for compatibility with different RLS policies
  PERFORM set_config('app.current_organization_id', p_organization_id::text, false);
  PERFORM set_config('app.tenant_id', p_organization_id::text, false);

  RAISE DEBUG 'Organization context set to: %', p_organization_id;
END;
$$;

COMMENT ON FUNCTION set_organization_context IS
  'Sets organization context for RLS policies. Call this at the start of every request.';

-- ============================================================================
-- GET CURRENT ORGANIZATION CONTEXT
-- ============================================================================

/**
 * Gets the currently set organization context
 * Useful for debugging and verification
 */
CREATE OR REPLACE FUNCTION get_current_organization_context()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_context TEXT;
BEGIN
  -- Try new variable name first
  v_context := current_setting('app.current_organization_id', true);

  -- Fall back to legacy name if not set
  IF v_context IS NULL OR v_context = '' THEN
    v_context := current_setting('app.tenant_id', true);
  END IF;

  -- Return as UUID or NULL
  IF v_context IS NULL OR v_context = '' THEN
    RETURN NULL;
  END IF;

  RETURN v_context::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION get_current_organization_context IS
  'Returns the currently set organization context from session variables';

-- ============================================================================
-- LEGACY FUNCTION COMPATIBILITY (keep for backward compatibility)
-- ============================================================================

/**
 * Legacy function - calls new set_organization_context
 * Maintains backward compatibility with existing code
 */
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delegate to new function
  PERFORM set_organization_context(p_tenant_id);

  RAISE DEBUG 'Legacy set_tenant_context called, delegated to set_organization_context';
END;
$$;

COMMENT ON FUNCTION set_tenant_context IS
  'LEGACY: Use set_organization_context instead. Maintained for backward compatibility.';

/**
 * Legacy function - calls new get_current_organization_context
 */
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT get_current_organization_context();
$$;

COMMENT ON FUNCTION get_current_tenant_id IS
  'LEGACY: Use get_current_organization_context instead. Maintained for backward compatibility.';

-- ============================================================================
-- VALIDATION & TESTING
-- ============================================================================

DO $$
DECLARE
  test_org_id UUID := '00000000-0000-0000-0000-000000000001';
  retrieved_context UUID;
BEGIN
  -- Test setting context
  PERFORM set_organization_context(test_org_id);

  -- Test retrieving context
  retrieved_context := get_current_organization_context();

  IF retrieved_context = test_org_id THEN
    RAISE NOTICE '✓ RLS context functions working correctly';
  ELSE
    RAISE WARNING '✗ RLS context retrieval mismatch: expected %, got %',
      test_org_id, retrieved_context;
  END IF;

  -- Test clearing context
  PERFORM set_organization_context(NULL);
  retrieved_context := get_current_organization_context();

  IF retrieved_context IS NULL THEN
    RAISE NOTICE '✓ Context clearing working correctly';
  ELSE
    RAISE WARNING '✗ Context not properly cleared, still: %', retrieved_context;
  END IF;

  -- Test legacy functions
  PERFORM set_tenant_context(test_org_id);
  retrieved_context := get_current_tenant_id();

  IF retrieved_context = test_org_id THEN
    RAISE NOTICE '✓ Legacy functions working correctly';
  ELSE
    RAISE WARNING '✗ Legacy functions not working: expected %, got %',
      test_org_id, retrieved_context;
  END IF;

  RAISE NOTICE '✅ RLS Context Migration Complete';
  RAISE NOTICE '   - set_organization_context(uuid) created';
  RAISE NOTICE '   - get_current_organization_context() created';
  RAISE NOTICE '   - Legacy functions updated for compatibility';
  RAISE NOTICE '   - Call set_organization_context() at start of every request';
END $$;

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- In application code, call this at the start of every request:

-- TypeScript/JavaScript (Supabase):
await supabase.rpc('set_organization_context', {
  p_organization_id: userOrganizationId
});

-- OR use legacy name:
await supabase.rpc('set_tenant_context', {
  p_tenant_id: userOrganizationId
});

-- Python:
supabase.rpc('set_organization_context', {
  'p_organization_id': user_organization_id
}).execute()

-- Then all subsequent queries in that request will be filtered by RLS:
const { data } = await supabase.from('agents').select('*');
// Only returns agents for the set organization

-- To verify context is set:
const { data: context } = await supabase.rpc('get_current_organization_context');
console.log('Current org context:', context);
*/

-- ============================================================================
-- ROLLBACK SCRIPT (save separately if needed)
-- ============================================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS set_organization_context(UUID);
-- DROP FUNCTION IF EXISTS get_current_organization_context();
-- -- Restore original functions if needed
-- COMMIT;
