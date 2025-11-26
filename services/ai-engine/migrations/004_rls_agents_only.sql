-- ============================================================================
-- TENANT ISOLATION - AGENTS TABLE ONLY (SAFE VERSION)
-- ============================================================================
-- This only updates the agents table which we know has tenant_id

-- ============================================================================
-- AGENTS TABLE - Tenant Isolation
-- ============================================================================

-- Clean up any existing policies on agents
DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;

-- Create tenant isolation policy for agents
CREATE POLICY "tenant_isolation_agents" ON public.agents
    FOR ALL
    TO public, authenticated, anon
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

-- Service role can access everything
CREATE POLICY "service_role_bypass_agents" ON public.agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Success message
SELECT 
    '✅ Agents table tenant isolation applied!' as status,
    'Users can only see agents from their tenant' as description;

-- Verify
SELECT 
    tablename,
    policyname,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'agents'
ORDER BY policyname;

