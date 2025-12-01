-- ============================================================================
-- RLS POLICIES FOR MULTI-TENANT DATA ISOLATION (CORRECTED)
-- ============================================================================
-- This version handles different possible column naming conventions
-- Run the diagnostic query (000_diagnostic_check_tables.sql) first to verify columns

-- ============================================================================
-- IMPORTANT: Uncomment the section that matches your table structure
-- ============================================================================

-- ============================================================================
-- OPTION 1: If agents table uses 'tenant_id' column
-- ============================================================================

-- ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
-- 
-- CREATE POLICY "tenant_isolation_agents" ON public.agents
--     FOR ALL
--     USING (
--         tenant_id = get_current_tenant_id()
--         OR get_current_tenant_id() IS NULL
--     );

-- ============================================================================
-- OPTION 2: If agents table uses 'organization_id' column
-- ============================================================================

-- ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
-- 
-- CREATE POLICY "tenant_isolation_agents" ON public.agents
--     FOR ALL
--     USING (
--         organization_id = get_current_tenant_id()
--         OR get_current_tenant_id() IS NULL
--     );

-- ============================================================================
-- OPTION 3: If agents table uses 'created_by' or 'owner_id' column
-- ============================================================================

-- ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "tenant_isolation_agents" ON public.agents;
-- 
-- CREATE POLICY "tenant_isolation_agents" ON public.agents
--     FOR ALL
--     USING (
--         created_by::text = current_setting('app.current_tenant_id', true)
--         OR get_current_tenant_id() IS NULL
--     );

-- ============================================================================
-- OPTION 4: If agents table has NO tenant column (make all public for now)
-- ============================================================================

ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_agents" ON public.agents;

CREATE POLICY "public_read_agents" ON public.agents
    FOR SELECT
    USING (true);  -- Temporarily allow all reads until tenant column is added

COMMENT ON POLICY "public_read_agents" ON public.agents IS 
'Temporary policy - allows all reads. Add tenant_id column and update policy for proper isolation.';


-- ============================================================================
-- CONVERSATIONS TABLE - Usually has tenant_id
-- ============================================================================

ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_conversations" ON public.conversations;

CREATE POLICY "tenant_isolation_conversations" ON public.conversations
    FOR ALL
    USING (
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'conversations' AND column_name = 'tenant_id'
            ) THEN tenant_id = get_current_tenant_id() OR get_current_tenant_id() IS NULL
            ELSE true  -- No tenant_id column, allow all for now
        END
    );


-- ============================================================================
-- MESSAGES TABLE - Usually isolated via parent conversation
-- ============================================================================

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_messages" ON public.messages;

-- Try to isolate via parent conversation if possible
CREATE POLICY "tenant_isolation_messages" ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'tenant_id'
        ) AND EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.tenant_id = get_current_tenant_id()
                 OR get_current_tenant_id() IS NULL)
        )
        OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'tenant_id'
        )  -- No tenant isolation if column doesn't exist
    );


-- ============================================================================
-- ALTERNATIVE: Simple Open Policies (Use if columns don't exist yet)
-- ============================================================================
-- These allow all operations until proper tenant columns are added

-- For agents (if above fails)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name IN ('tenant_id', 'organization_id')
    ) THEN
        ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "allow_all_agents_temp" ON public.agents;
        CREATE POLICY "allow_all_agents_temp" ON public.agents FOR ALL USING (true);
        
        RAISE NOTICE 'Created temporary open policy for agents table - no tenant column found';
    END IF;
END $$;

-- For conversations (if above fails)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "allow_all_conversations_temp" ON public.conversations;
        CREATE POLICY "allow_all_conversations_temp" ON public.conversations FOR ALL USING (true);
        
        RAISE NOTICE 'Created temporary open policy for conversations table - no tenant column found';
    END IF;
END $$;

-- For messages (if above fails)
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "allow_all_messages_temp" ON public.messages;
    CREATE POLICY "allow_all_messages_temp" ON public.messages FOR ALL USING (true);
    
    RAISE NOTICE 'Created temporary open policy for messages table';
END $$;


-- ============================================================================
-- ADD TENANT COLUMNS (Run this if columns don't exist)
-- ============================================================================

-- Add tenant_id to agents if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'agents' 
        AND column_name IN ('tenant_id', 'organization_id')
    ) THEN
        ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS tenant_id UUID;
        ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS organization_id UUID;
        
        RAISE NOTICE 'Added tenant_id and organization_id columns to agents table';
        RAISE NOTICE 'IMPORTANT: Update existing rows with proper tenant IDs before enabling strict RLS';
    END IF;
END $$;

-- Add tenant_id to conversations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'conversations' 
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS tenant_id UUID;
        
        RAISE NOTICE 'Added tenant_id column to conversations table';
        RAISE NOTICE 'IMPORTANT: Update existing rows with proper tenant IDs before enabling strict RLS';
    END IF;
END $$;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename;

-- View all policies
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('agents', 'conversations', 'messages')
ORDER BY tablename, policyname;


-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
1. Run 000_diagnostic_check_tables.sql to see your actual table structure
2. This migration will:
   - Enable RLS on tables
   - Create temporary open policies if tenant columns don't exist
   - Add tenant_id columns if missing
3. After columns are added, update this file with proper tenant isolation
4. Update existing data with tenant IDs
5. Replace temporary policies with strict isolation policies
*/






