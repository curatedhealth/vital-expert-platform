-- ============================================================================
-- RLS Tenant Context Function
-- ============================================================================
-- This function sets the current tenant context for Row Level Security (RLS)
-- Required for proper multi-tenant data isolation

CREATE OR REPLACE FUNCTION public.set_tenant_context(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Set the tenant ID in the session configuration
    -- This will be used by RLS policies to filter data
    PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
    
    -- Log the context change for audit purposes
    RAISE DEBUG 'Tenant context set to: %', p_tenant_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_tenant_context(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_tenant_context(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.set_tenant_context(UUID) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.set_tenant_context(UUID) IS 
'Sets the current tenant context for RLS. Must be called at the start of each request to ensure proper data isolation.';


-- ============================================================================
-- Helper Function: Get Current Tenant Context
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id TEXT;
BEGIN
    -- Get the tenant ID from session configuration
    v_tenant_id := current_setting('app.current_tenant_id', true);
    
    IF v_tenant_id IS NULL OR v_tenant_id = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN v_tenant_id::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO service_role;

COMMENT ON FUNCTION public.get_current_tenant_id() IS 
'Returns the current tenant ID from the session context. Returns NULL if no context is set.';


-- ============================================================================
-- Example RLS Policy Using Tenant Context
-- ============================================================================
-- This is an example of how to use the tenant context in RLS policies
-- Apply similar patterns to your tables

/*
-- Example: RLS policy for agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_policy" ON public.agents
    FOR ALL
    USING (
        organization_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL  -- Allow if no context set (for service role)
    );

-- Example: RLS policy for conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_policy" ON public.conversations
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );
*/

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the functions are working correctly

/*
-- Test setting tenant context
SELECT set_tenant_context('00000000-0000-0000-0000-000000000001'::UUID);

-- Test getting tenant context
SELECT get_current_tenant_id();

-- Should return the tenant ID you just set
*/





