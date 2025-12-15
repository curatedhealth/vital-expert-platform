-- ============================================================================
-- Migration: Activate Agents and Add User Context Functions
-- Date: 2025-11-27
-- Priority: CRITICAL (Phase 1 Launch Blocker)
-- Purpose:
--   1. Activate 136+ agents for Phase 1 launch
--   2. Add user context functions for RLS enforcement
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: AGENT ACTIVATION
-- ============================================================================

-- First, let's see what we have
DO $$
DECLARE
    v_total_agents INTEGER;
    v_active_agents INTEGER;
    v_inactive_agents INTEGER;
    v_testing_agents INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(*) INTO v_active_agents FROM agents WHERE status = 'active';
    SELECT COUNT(*) INTO v_inactive_agents FROM agents WHERE status = 'inactive';
    SELECT COUNT(*) INTO v_testing_agents FROM agents WHERE status = 'testing';

    RAISE NOTICE '=== BEFORE ACTIVATION ===';
    RAISE NOTICE 'Total agents: %', v_total_agents;
    RAISE NOTICE 'Active agents: %', v_active_agents;
    RAISE NOTICE 'Inactive agents: %', v_inactive_agents;
    RAISE NOTICE 'Testing agents: %', v_testing_agents;
END $$;

-- Activate all agents that have required fields populated
-- These are ready for production use
UPDATE agents
SET
    status = 'active',
    updated_at = NOW()
WHERE
    status IN ('inactive', 'testing')
    AND name IS NOT NULL
    AND name != ''
    AND (description IS NOT NULL AND description != '')
    -- Don't activate agents without system prompts
    AND (
        system_prompt IS NOT NULL
        OR (metadata->>'system_prompt') IS NOT NULL
    );

-- Verify activation results
DO $$
DECLARE
    v_total_agents INTEGER;
    v_active_agents INTEGER;
    v_inactive_agents INTEGER;
    v_testing_agents INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_agents FROM agents;
    SELECT COUNT(*) INTO v_active_agents FROM agents WHERE status = 'active';
    SELECT COUNT(*) INTO v_inactive_agents FROM agents WHERE status = 'inactive';
    SELECT COUNT(*) INTO v_testing_agents FROM agents WHERE status = 'testing';

    RAISE NOTICE '=== AFTER ACTIVATION ===';
    RAISE NOTICE 'Total agents: %', v_total_agents;
    RAISE NOTICE 'Active agents: %', v_active_agents;
    RAISE NOTICE 'Inactive agents: %', v_inactive_agents;
    RAISE NOTICE 'Testing agents: %', v_testing_agents;

    IF v_active_agents < 136 THEN
        RAISE WARNING 'Only % active agents - PRD requires 136+', v_active_agents;
    ELSE
        RAISE NOTICE '✅ Agent activation successful: % agents active (PRD target: 136+)', v_active_agents;
    END IF;
END $$;

-- ============================================================================
-- PART 2: USER CONTEXT FUNCTIONS FOR RLS
-- ============================================================================

/**
 * Sets user context for RLS policies
 *
 * CRITICAL: This function MUST be called at the start of every request
 * when using service role (not Supabase Auth) to ensure RLS works correctly.
 *
 * @param p_user_id UUID - The user ID to set as context
 */
CREATE OR REPLACE FUNCTION set_user_context(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Allow NULL to clear context
    IF p_user_id IS NULL THEN
        PERFORM set_config('app.current_user_id', '', false);
        RAISE DEBUG 'User context cleared';
        RETURN;
    END IF;

    -- Set user context for this session/transaction
    PERFORM set_config('app.current_user_id', p_user_id::text, false);

    RAISE DEBUG 'User context set to: %', p_user_id;
END;
$$;

COMMENT ON FUNCTION set_user_context IS
    'Sets user context for RLS policies. Call this at the start of every request when using service role.';

/**
 * Gets the currently set user context
 * Useful for debugging and verification
 */
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_context TEXT;
BEGIN
    v_context := current_setting('app.current_user_id', true);

    IF v_context IS NULL OR v_context = '' THEN
        RETURN NULL;
    END IF;

    RETURN v_context::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

COMMENT ON FUNCTION get_current_user_context IS
    'Returns the currently set user context from session variables';

/**
 * Combined function to set both user and organization context
 * Convenience function for setting both in one call
 */
CREATE OR REPLACE FUNCTION set_request_context(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set user context
    IF p_user_id IS NOT NULL THEN
        PERFORM set_config('app.current_user_id', p_user_id::text, false);
    ELSE
        PERFORM set_config('app.current_user_id', '', false);
    END IF;

    -- Set organization context (using existing function pattern)
    IF p_organization_id IS NOT NULL THEN
        PERFORM set_config('app.current_organization_id', p_organization_id::text, false);
        PERFORM set_config('app.tenant_id', p_organization_id::text, false);
    ELSE
        PERFORM set_config('app.current_organization_id', '', false);
        PERFORM set_config('app.tenant_id', '', false);
    END IF;

    RAISE DEBUG 'Request context set - user: %, org: %', p_user_id, p_organization_id;
END;
$$;

COMMENT ON FUNCTION set_request_context IS
    'Sets both user and organization context for RLS. Call at start of every API request.';

/**
 * Gets full request context for debugging
 */
CREATE OR REPLACE FUNCTION get_request_context()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_user_id TEXT;
    v_org_id TEXT;
    v_tenant_id TEXT;
BEGIN
    v_user_id := current_setting('app.current_user_id', true);
    v_org_id := current_setting('app.current_organization_id', true);
    v_tenant_id := current_setting('app.tenant_id', true);

    RETURN jsonb_build_object(
        'user_id', NULLIF(v_user_id, ''),
        'organization_id', NULLIF(v_org_id, ''),
        'tenant_id', NULLIF(v_tenant_id, ''),
        'timestamp', NOW()
    );
END;
$$;

COMMENT ON FUNCTION get_request_context IS
    'Returns current request context as JSON for debugging';

-- ============================================================================
-- PART 3: UPDATE auth.uid() FALLBACK FOR SERVICE ROLE
-- ============================================================================

/**
 * Enhanced auth.uid() that falls back to app.current_user_id
 * This allows RLS policies to work with both Supabase Auth and service role
 */
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_auth_uid UUID;
    v_app_user_id TEXT;
BEGIN
    -- First try native Supabase auth.uid()
    BEGIN
        SELECT auth.jwt() ->> 'sub' INTO v_auth_uid;
        IF v_auth_uid IS NOT NULL THEN
            RETURN v_auth_uid;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- auth.jwt() not available, continue to fallback
        NULL;
    END;

    -- Fallback to app.current_user_id (set by service role)
    v_app_user_id := current_setting('app.current_user_id', true);

    IF v_app_user_id IS NOT NULL AND v_app_user_id != '' THEN
        RETURN v_app_user_id::UUID;
    END IF;

    -- No user context available
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION auth.uid IS
    'Returns user ID from Supabase Auth JWT or app.current_user_id fallback for service role';

-- ============================================================================
-- VALIDATION & TESTING
-- ============================================================================

DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000099';
    test_org_id UUID := '00000000-0000-0000-0000-000000000001';
    retrieved_context JSONB;
    retrieved_user_id UUID;
BEGIN
    -- Test set_user_context
    PERFORM set_user_context(test_user_id);
    retrieved_user_id := get_current_user_context();

    IF retrieved_user_id = test_user_id THEN
        RAISE NOTICE '✓ set_user_context/get_current_user_context working correctly';
    ELSE
        RAISE WARNING '✗ User context mismatch: expected %, got %', test_user_id, retrieved_user_id;
    END IF;

    -- Test set_request_context
    PERFORM set_request_context(test_user_id, test_org_id);
    retrieved_context := get_request_context();

    IF (retrieved_context->>'user_id')::UUID = test_user_id
       AND (retrieved_context->>'organization_id')::UUID = test_org_id THEN
        RAISE NOTICE '✓ set_request_context/get_request_context working correctly';
    ELSE
        RAISE WARNING '✗ Request context mismatch: %', retrieved_context;
    END IF;

    -- Test auth.uid() fallback
    retrieved_user_id := auth.uid();
    IF retrieved_user_id = test_user_id THEN
        RAISE NOTICE '✓ auth.uid() fallback working correctly';
    ELSE
        RAISE WARNING '✗ auth.uid() fallback mismatch: expected %, got %', test_user_id, retrieved_user_id;
    END IF;

    -- Clear context
    PERFORM set_request_context(NULL, NULL);

    RAISE NOTICE '✅ User Context Migration Complete';
    RAISE NOTICE '   - set_user_context(uuid) created';
    RAISE NOTICE '   - get_current_user_context() created';
    RAISE NOTICE '   - set_request_context(uuid, uuid) created';
    RAISE NOTICE '   - get_request_context() created';
    RAISE NOTICE '   - auth.uid() enhanced with fallback';
END $$;

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- In API Gateway middleware (JavaScript/TypeScript):

// At start of every request:
await supabase.rpc('set_request_context', {
    p_user_id: req.userId,
    p_organization_id: req.tenantId
});

// OR set individually:
await supabase.rpc('set_user_context', { p_user_id: req.userId });
await supabase.rpc('set_organization_context', { p_organization_id: req.tenantId });

// To verify context is set correctly:
const { data: context } = await supabase.rpc('get_request_context');
console.log('Current context:', context);

-- In Python (ai-engine):

await supabase.rpc('set_request_context', {
    'p_user_id': user_id,
    'p_organization_id': tenant_id
}).execute()
*/

-- ============================================================================
-- ROLLBACK SCRIPT (save separately if needed)
-- ============================================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS set_user_context(UUID);
-- DROP FUNCTION IF EXISTS get_current_user_context();
-- DROP FUNCTION IF EXISTS set_request_context(UUID, UUID);
-- DROP FUNCTION IF EXISTS get_request_context();
-- -- Note: Rolling back auth.uid() requires restoring original function
-- COMMIT;
