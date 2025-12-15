-- ============================================================================
-- SMART RLS POLICIES - Only apply where tenant_id exists
-- ============================================================================

-- ============================================================================
-- 1. AGENTS TABLE (we know this has tenant_id)
-- ============================================================================

DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;

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

CREATE POLICY "service_role_bypass_agents" ON public.agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

SELECT '✅ Agents table: Tenant isolation applied' as status;


-- ============================================================================
-- 2. CONVERSATIONS TABLE (check if tenant_id exists)
-- ============================================================================

DO $$ 
BEGIN
    -- Check if conversations has tenant_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'tenant_id'
    ) THEN
        -- Apply tenant isolation
        DROP POLICY IF EXISTS "temp_allow_all_conversations" ON public.conversations;
        DROP POLICY IF EXISTS "tenant_isolation_conversations" ON public.conversations;
        DROP POLICY IF EXISTS "service_role_bypass_conversations" ON public.conversations;
        
        EXECUTE 'CREATE POLICY "tenant_isolation_conversations" ON public.conversations
            FOR ALL
            TO public, authenticated, anon
            USING (
                tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )';
        
        EXECUTE 'CREATE POLICY "service_role_bypass_conversations" ON public.conversations
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)';
        
        RAISE NOTICE '✅ Conversations table: Tenant isolation applied';
    ELSE
        -- Keep permissive policy
        DROP POLICY IF EXISTS "temp_allow_all_conversations" ON public.conversations;
        
        EXECUTE 'CREATE POLICY "temp_allow_all_conversations" ON public.conversations
            FOR ALL
            USING (true)
            WITH CHECK (true)';
        
        RAISE NOTICE '⚠️  Conversations table: No tenant_id column - kept permissive policy';
    END IF;
END $$;


-- ============================================================================
-- 3. MESSAGES TABLE (check if tenant_id exists or use parent conversation)
-- ============================================================================

DO $$ 
BEGIN
    -- Check if messages has tenant_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'tenant_id'
    ) THEN
        -- Apply direct tenant isolation
        DROP POLICY IF EXISTS "temp_allow_all_messages" ON public.messages;
        DROP POLICY IF EXISTS "tenant_isolation_messages" ON public.messages;
        DROP POLICY IF EXISTS "service_role_bypass_messages" ON public.messages;
        
        EXECUTE 'CREATE POLICY "tenant_isolation_messages" ON public.messages
            FOR ALL
            TO public, authenticated, anon
            USING (
                tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                OR get_current_tenant_id() IS NULL
            )';
        
        EXECUTE 'CREATE POLICY "service_role_bypass_messages" ON public.messages
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)';
        
        RAISE NOTICE '✅ Messages table: Tenant isolation applied (direct tenant_id)';
        
    -- Check if we can isolate via parent conversation
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'tenant_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'conversation_id'
    ) THEN
        -- Apply isolation via parent conversation
        DROP POLICY IF EXISTS "temp_allow_all_messages" ON public.messages;
        DROP POLICY IF EXISTS "tenant_isolation_messages" ON public.messages;
        DROP POLICY IF EXISTS "service_role_bypass_messages" ON public.messages;
        
        EXECUTE 'CREATE POLICY "tenant_isolation_messages" ON public.messages
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
            )';
        
        EXECUTE 'CREATE POLICY "service_role_bypass_messages" ON public.messages
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)';
        
        RAISE NOTICE '✅ Messages table: Tenant isolation applied (via parent conversation)';
    ELSE
        -- Keep permissive policy
        DROP POLICY IF EXISTS "temp_allow_all_messages" ON public.messages;
        
        EXECUTE 'CREATE POLICY "temp_allow_all_messages" ON public.messages
            FOR ALL
            USING (true)
            WITH CHECK (true)';
        
        RAISE NOTICE '⚠️  Messages table: No tenant isolation possible - kept permissive policy';
    END IF;
END $$;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show what policies were created
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN policyname LIKE '%temp%' THEN '⚠️  Permissive (no tenant column)'
        WHEN policyname LIKE '%isolation%' THEN '✅ Tenant isolated'
        WHEN policyname LIKE '%bypass%' THEN '🔓 Service role access'
        ELSE policyname
    END as policy_type,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename, policyname;

-- Summary
SELECT 
    '✅ RLS policies applied successfully!' as status,
    'Check the table above to see which tables have tenant isolation' as note;






