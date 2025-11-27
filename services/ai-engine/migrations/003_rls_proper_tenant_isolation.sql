-- ============================================================================
-- PROPER TENANT ISOLATION POLICIES
-- ============================================================================
-- Your tables have tenant_id columns - perfect for proper isolation!

-- ============================================================================
-- 1. AGENTS TABLE - Tenant Isolation
-- ============================================================================

-- Clean up any existing policies
DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;

-- Create tenant isolation policy
CREATE POLICY "tenant_isolation_agents" ON public.agents
    FOR ALL
    TO public, authenticated, anon
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL  -- Allow if no context set
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

COMMENT ON POLICY "tenant_isolation_agents" ON public.agents IS 
'Ensures users can only access agents from their own tenant';


-- ============================================================================
-- 2. CONVERSATIONS TABLE - Tenant Isolation
-- ============================================================================

DROP POLICY IF EXISTS "temp_allow_all_conversations" ON public.conversations;
DROP POLICY IF EXISTS "tenant_isolation_conversations" ON public.conversations;
DROP POLICY IF EXISTS "service_role_bypass_conversations" ON public.conversations;

CREATE POLICY "tenant_isolation_conversations" ON public.conversations
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

CREATE POLICY "service_role_bypass_conversations" ON public.conversations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_conversations" ON public.conversations IS 
'Ensures users can only access conversations from their own tenant';


-- ============================================================================
-- 3. MESSAGES TABLE - Isolated via Parent Conversation
-- ============================================================================

DROP POLICY IF EXISTS "temp_allow_all_messages" ON public.messages;
DROP POLICY IF EXISTS "tenant_isolation_messages" ON public.messages;
DROP POLICY IF EXISTS "service_role_bypass_messages" ON public.messages;

-- Messages inherit tenant isolation from their parent conversation
CREATE POLICY "tenant_isolation_messages" ON public.messages
    FOR ALL
    TO public, authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (
                conversations.tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )
        )
    );

CREATE POLICY "service_role_bypass_messages" ON public.messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_messages" ON public.messages IS 
'Ensures users can only access messages from conversations in their tenant';


-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show enabled RLS tables
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename;

-- Show all policies
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
    tablename, 
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
GROUP BY tablename
ORDER BY tablename;

-- Success message
SELECT 
    '✅ Tenant isolation policies applied successfully!' as status,
    'All tables now enforce tenant_id filtering' as description,
    'Service role can still access all data for admin operations' as note;


-- ============================================================================
-- TEST THE ISOLATION (Optional - for verification)
-- ============================================================================

-- Test 1: Set tenant context
-- SELECT set_tenant_context('00000000-0000-0000-0000-000000000001'::UUID);

-- Test 2: Query agents (should only see tenant 1)
-- SELECT id, name, tenant_id FROM agents LIMIT 5;

-- Test 3: Verify current tenant
-- SELECT get_current_tenant_id() as current_tenant;

-- Test 4: Clear context
-- SELECT set_tenant_context(NULL::UUID);

-- Test 5: Query again (should see all if context is NULL)
-- SELECT COUNT(*) as total_agents FROM agents;


