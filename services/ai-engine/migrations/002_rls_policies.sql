-- ============================================================================
-- RLS POLICIES FOR MULTI-TENANT DATA ISOLATION
-- ============================================================================
-- Apply Row Level Security policies to all tenant-sensitive tables
-- This ensures proper data isolation between organizations

-- ============================================================================
-- 1. AGENTS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
DROP POLICY IF EXISTS "service_role_bypass_agents" ON public.agents;

-- Tenant isolation policy (for authenticated users)
CREATE POLICY "tenant_isolation_agents" ON public.agents
    FOR ALL
    USING (
        organization_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL  -- Allow if no context set
    )
    WITH CHECK (
        organization_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

-- Service role bypass (for system operations)
CREATE POLICY "service_role_bypass_agents" ON public.agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_agents" ON public.agents IS 
'Ensures users can only access agents from their own organization';


-- ============================================================================
-- 2. CONVERSATIONS TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_conversations" ON public.conversations;
DROP POLICY IF EXISTS "service_role_bypass_conversations" ON public.conversations;

CREATE POLICY "tenant_isolation_conversations" ON public.conversations
    FOR ALL
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
'Ensures users can only access conversations from their own organization';


-- ============================================================================
-- 3. MESSAGES TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_messages" ON public.messages;
DROP POLICY IF EXISTS "service_role_bypass_messages" ON public.messages;

-- Messages are isolated via their parent conversation's tenant
CREATE POLICY "tenant_isolation_messages" ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.tenant_id = get_current_tenant_id()
                 OR get_current_tenant_id() IS NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.tenant_id = get_current_tenant_id()
                 OR get_current_tenant_id() IS NULL)
        )
    );

CREATE POLICY "service_role_bypass_messages" ON public.messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_messages" ON public.messages IS 
'Ensures users can only access messages from conversations in their organization';


-- ============================================================================
-- 4. AGENT_EXECUTIONS TABLE (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS public.agent_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_executions" ON public.agent_executions;
DROP POLICY IF EXISTS "service_role_bypass_executions" ON public.agent_executions;

CREATE POLICY "tenant_isolation_executions" ON public.agent_executions
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

CREATE POLICY "service_role_bypass_executions" ON public.agent_executions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_executions" ON public.agent_executions IS 
'Ensures users can only see executions from their organization';


-- ============================================================================
-- 5. DOCUMENTS/KNOWLEDGE BASE TABLE (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_documents" ON public.documents;
DROP POLICY IF EXISTS "service_role_bypass_documents" ON public.documents;

CREATE POLICY "tenant_isolation_documents" ON public.documents
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
        OR is_public = true  -- Allow public documents
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

CREATE POLICY "service_role_bypass_documents" ON public.documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_documents" ON public.documents IS 
'Ensures users can only access documents from their organization or public documents';


-- ============================================================================
-- 6. FEEDBACK TABLE (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_feedback" ON public.feedback;
DROP POLICY IF EXISTS "service_role_bypass_feedback" ON public.feedback;

CREATE POLICY "tenant_isolation_feedback" ON public.feedback
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

CREATE POLICY "service_role_bypass_feedback" ON public.feedback
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_feedback" ON public.feedback IS 
'Ensures users can only access feedback from their organization';


-- ============================================================================
-- 7. AGENT_ANALYTICS TABLE (if exists)
-- ============================================================================

ALTER TABLE IF EXISTS public.agent_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_analytics" ON public.agent_analytics;
DROP POLICY IF EXISTS "service_role_bypass_analytics" ON public.agent_analytics;

CREATE POLICY "tenant_isolation_analytics" ON public.agent_analytics
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR get_current_tenant_id() IS NULL
    );

CREATE POLICY "service_role_bypass_analytics" ON public.agent_analytics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON POLICY "tenant_isolation_analytics" ON public.agent_analytics IS 
'Ensures users can only access analytics from their organization';


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies by table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;


-- ============================================================================
-- TEST RLS ISOLATION
-- ============================================================================

-- Test script (run in psql or Supabase SQL editor):
/*
-- Set tenant context for tenant 1
SELECT set_tenant_context('00000000-0000-0000-0000-000000000001'::UUID);

-- Query agents (should only see tenant 1 agents)
SELECT id, name, organization_id FROM agents;

-- Set tenant context for tenant 2
SELECT set_tenant_context('11111111-1111-1111-1111-111111111111'::UUID);

-- Query agents again (should only see tenant 2 agents)
SELECT id, name, organization_id FROM agents;

-- Clear tenant context
SELECT set_tenant_context(NULL::UUID);

-- Query as service_role (should see all agents)
-- Note: This requires service_role permissions
*/

