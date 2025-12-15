-- ============================================================================
-- SAFE RLS SETUP - Step by Step
-- ============================================================================
-- This is a safe migration that won't break if columns don't exist

-- Step 1: Just enable RLS (doesn't break anything)
ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Step 2: Create permissive temporary policies (allows everything)
-- These ensure the app continues working while we set up proper isolation

DROP POLICY IF EXISTS "temp_allow_all_agents" ON public.agents;
CREATE POLICY "temp_allow_all_agents" ON public.agents
    FOR ALL
    TO public, authenticated, anon, service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "temp_allow_all_conversations" ON public.conversations;
CREATE POLICY "temp_allow_all_conversations" ON public.conversations
    FOR ALL
    TO public, authenticated, anon, service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "temp_allow_all_messages" ON public.messages;
CREATE POLICY "temp_allow_all_messages" ON public.messages
    FOR ALL
    TO public, authenticated, anon, service_role
    USING (true)
    WITH CHECK (true);

-- Success message
SELECT 'RLS enabled with permissive policies - app will continue working normally' as status;

-- Check results
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename;






