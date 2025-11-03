-- ============================================
-- VITAL AI Engine - Row-Level Security (RLS)
-- Multi-Tenant Isolation (Golden Rule #2)
-- ============================================
-- 
-- Purpose: Enforce tenant isolation at database level
-- Prevents: Cross-tenant data leakage
-- Compliance: SOC 2, HIPAA, GDPR
--
-- Author: Security Team
-- Date: 2025-11-03
-- Version: 2.1
-- ============================================
--
-- ROLLBACK INSTRUCTIONS (if needed):
-- ============================================
-- 1. Disable RLS on all tables:
--    ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
--    (repeat for all tables)
--
-- 2. Drop all policies:
--    DROP POLICY IF EXISTS tenant_isolation_agents ON public.agents;
--    DROP POLICY IF EXISTS tenant_isolation_conversations ON public.conversations;
--    (repeat for all tables)
--
-- 3. Drop helper functions:
--    DROP FUNCTION IF EXISTS set_tenant_context(uuid);
--    DROP FUNCTION IF EXISTS get_tenant_context();
--    DROP FUNCTION IF EXISTS clear_tenant_context();
--    DROP FUNCTION IF EXISTS count_rls_policies();
--
-- 4. Drop indexes:
--    DROP INDEX IF EXISTS idx_agents_tenant_id;
--    DROP INDEX IF EXISTS idx_conversations_tenant_id;
--    (repeat for all indexes)
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Enable RLS on all tenant-scoped tables
-- ============================================

DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        'agents',
        'conversations', 
        'messages',
        'user_agents',
        'agent_tools',
        'rag_sources',
        'embeddings',
        'chat_sessions',
        'workflows',
        'workflow_executions',
        'tasks',
        'task_assignments'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            -- Enable RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE '✅ RLS enabled on public.%', tbl_name;
        ELSE
            RAISE NOTICE '⚠️  Table public.% does not exist, skipping', tbl_name;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Drop existing policies (idempotent)
-- ============================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND policyname LIKE 'tenant_isolation_%'
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename
        );
        RAISE NOTICE '🗑️  Dropped policy %.%', pol.tablename, pol.policyname;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Create RLS policies
-- ============================================

-- Policy: agents
CREATE POLICY "tenant_isolation_agents"
ON public.agents
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Policy: conversations
CREATE POLICY "tenant_isolation_conversations"
ON public.conversations
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Policy: messages (via conversations)
CREATE POLICY "tenant_isolation_messages"
ON public.messages
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
);

-- Policy: user_agents
CREATE POLICY "tenant_isolation_user_agents"
ON public.user_agents
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Policy: agent_tools (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agent_tools') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_agent_tools" ON public.agent_tools FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for agent_tools';
    END IF;
END $$;

-- Policy: rag_sources (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rag_sources') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_rag_sources" ON public.rag_sources FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for rag_sources';
    END IF;
END $$;

-- Policy: embeddings (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'embeddings') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_embeddings" ON public.embeddings FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for embeddings';
    END IF;
END $$;

-- Policy: chat_sessions (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_chat_sessions" ON public.chat_sessions FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for chat_sessions';
    END IF;
END $$;

-- Policy: workflows (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_workflows" ON public.workflows FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for workflows';
    END IF;
END $$;

-- Policy: workflow_executions (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_executions') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_workflow_executions" ON public.workflow_executions FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for workflow_executions';
    END IF;
END $$;

-- Policy: tasks (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_tasks" ON public.tasks FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for tasks';
    END IF;
END $$;

-- Policy: task_assignments (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_assignments') THEN
        EXECUTE 'CREATE POLICY "tenant_isolation_task_assignments" ON public.task_assignments FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)';
        RAISE NOTICE '✅ Policy created for task_assignments';
    END IF;
END $$;

-- ============================================
-- STEP 4: Helper functions
-- ============================================

-- Function: set_tenant_context
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate UUID
    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'tenant_id cannot be NULL';
    END IF;
    
    -- Set configuration variable (session-scoped)
    PERFORM set_config('app.tenant_id', p_tenant_id::text, false);
    
    RAISE DEBUG 'Tenant context set to: %', p_tenant_id;
END;
$$;

-- Function: get_tenant_context
CREATE OR REPLACE FUNCTION get_tenant_context()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tenant_id_str TEXT;
    tenant_id uuid;
BEGIN
    tenant_id_str := current_setting('app.tenant_id', true);
    
    IF tenant_id_str IS NULL OR tenant_id_str = '' THEN
        RAISE EXCEPTION 'Tenant context not set - call set_tenant_context() first';
    END IF;
    
    tenant_id := tenant_id_str::uuid;
    RETURN tenant_id;
END;
$$;

-- Function: clear_tenant_context
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.tenant_id', '', false);
END;
$$;

-- Function: count_rls_policies (for health check)
CREATE OR REPLACE FUNCTION count_rls_policies()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND policyname LIKE 'tenant_isolation_%';
    
    RETURN policy_count;
END;
$$;

-- ============================================
-- STEP 5: Performance indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id 
ON public.agents(tenant_id) 
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id 
ON public.conversations(tenant_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_tenant_id 
ON public.user_agents(tenant_id)
WHERE tenant_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_user 
ON public.conversations(tenant_id, user_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
ON public.messages(conversation_id);

-- ============================================
-- STEP 6: Verification queries
-- ============================================

-- Count policies created
DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE 'tenant_isolation_%';
    
    SELECT COUNT(*) INTO table_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ RLS Migration Complete';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Tables with RLS enabled: %', table_count;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE 'Helper functions: 4 (set/get/clear/count)';
    RAISE NOTICE 'Indexes created: 5';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

COMMIT;

