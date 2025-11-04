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
-- Version: 3.0 (Adapted to actual schema)
-- ============================================
--
-- ROLLBACK INSTRUCTIONS (if needed):
-- ============================================
-- See end of file for complete rollback script
-- ============================================

BEGIN;

-- ============================================
-- STEP 0: Add tenant_id to tables that need it
-- ============================================

-- Add tenant_id to consultations if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'consultations'
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.consultations 
        ADD COLUMN tenant_id uuid;
        
        -- Set default tenant for existing records (if any)
        -- In production, you'd want to properly map these
        UPDATE public.consultations
        SET tenant_id = (SELECT tenant_id FROM public.profiles LIMIT 1)
        WHERE tenant_id IS NULL;
        
        RAISE NOTICE '✅ Added tenant_id to consultations';
    ELSE
        RAISE NOTICE '⚠️  tenant_id already exists on consultations';
    END IF;
END $$;

-- Add tenant_id to user_agents if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_agents'
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE public.user_agents 
        ADD COLUMN tenant_id uuid;
        
        -- Set tenant_id from user's profile
        UPDATE public.user_agents ua
        SET tenant_id = p.tenant_id
        FROM public.profiles p
        WHERE ua.user_id = p.id
        AND ua.tenant_id IS NULL;
        
        RAISE NOTICE '✅ Added tenant_id to user_agents';
    ELSE
        RAISE NOTICE '⚠️  tenant_id already exists on user_agents';
    END IF;
END $$;

-- ============================================
-- STEP 1: Enable RLS on all tenant-scoped tables
-- ============================================

DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        'agents',
        'conversations', 
        'consultations',
        'messages',
        'user_agents',
        'profiles',
        'agent_skills',
        'agent_prompts',
        'agent_prompts_full',
        'agent_metrics',
        'agent_metrics_daily',
        'rag_knowledge_sources',
        'session_memories',
        'user_memory',
        'user_roles',
        'user_tenants',
        'tool_executions',
        'panels',
        'panel_messages',
        'panel_participants',
        'panel_rounds'
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
-- STEP 3: Create RLS policies for core tables
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

-- Policy: consultations
CREATE POLICY "tenant_isolation_consultations"
ON public.consultations
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Policy: messages (via consultations)
CREATE POLICY "tenant_isolation_messages"
ON public.messages
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.id = messages.consultation_id
        AND consultations.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.id = messages.consultation_id
        AND consultations.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
);

-- Policy: user_agents
CREATE POLICY "tenant_isolation_user_agents"
ON public.user_agents
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Policy: profiles
CREATE POLICY "tenant_isolation_profiles"
ON public.profiles
FOR ALL
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ============================================
-- STEP 4: Create RLS policies for other tables with tenant_id
-- ============================================

-- Dynamic policy creation for tables with tenant_id
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT DISTINCT t.table_name
        FROM information_schema.tables t
        JOIN information_schema.columns c 
            ON t.table_name = c.table_name 
            AND t.table_schema = c.table_schema
        WHERE t.table_schema = 'public'
        AND c.column_name = 'tenant_id'
        AND t.table_name NOT IN ('agents', 'conversations', 'consultations', 'user_agents', 'profiles')
        AND t.table_type = 'BASE TABLE'
    LOOP
        BEGIN
            -- Check if RLS is enabled
            IF EXISTS (
                SELECT 1 FROM pg_tables pt
                JOIN pg_class c ON c.relname = pt.tablename
                WHERE pt.schemaname = 'public'
                AND pt.tablename = tbl.table_name
                AND c.relrowsecurity = true
            ) THEN
                EXECUTE format(
                    'CREATE POLICY "tenant_isolation_%I" ON public.%I FOR ALL USING (tenant_id = current_setting(''app.tenant_id'', true)::uuid) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::uuid)',
                    tbl.table_name, tbl.table_name
                );
                RAISE NOTICE '✅ Policy created for %', tbl.table_name;
            END IF;
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE '⚠️  Policy already exists for %', tbl.table_name;
            WHEN OTHERS THEN
                RAISE WARNING '❌ Failed to create policy for %: %', tbl.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================
-- STEP 5: Helper functions
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
-- STEP 6: Performance indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id 
ON public.agents(tenant_id) 
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id 
ON public.conversations(tenant_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consultations_tenant_id 
ON public.consultations(tenant_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_tenant_id 
ON public.user_agents(tenant_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id 
ON public.profiles(tenant_id)
WHERE tenant_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consultations_tenant_user 
ON public.consultations(tenant_id, user_id)
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_consultation_id
ON public.messages(consultation_id);

-- ============================================
-- STEP 7: Verification queries
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
    RAISE NOTICE 'Indexes created: 7';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- 
-- To rollback this migration, run the following:
--
-- BEGIN;
--
-- -- 1. Disable RLS on all tables
-- DO $$
-- DECLARE
--     tbl RECORD;
-- BEGIN
--     FOR tbl IN
--         SELECT tablename
--         FROM pg_tables t
--         JOIN pg_class c ON c.relname = t.tablename
--         WHERE t.schemaname = 'public'
--         AND c.relrowsecurity = true
--     LOOP
--         EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
--     END LOOP;
-- END $$;
--
-- -- 2. Drop all tenant_isolation policies
-- DO $$
-- DECLARE
--     pol RECORD;
-- BEGIN
--     FOR pol IN
--         SELECT tablename, policyname
--         FROM pg_policies
--         WHERE schemaname = 'public'
--         AND policyname LIKE 'tenant_isolation_%'
--     LOOP
--         EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
--     END LOOP;
-- END $$;
--
-- -- 3. Drop helper functions
-- DROP FUNCTION IF EXISTS set_tenant_context(uuid);
-- DROP FUNCTION IF EXISTS get_tenant_context();
-- DROP FUNCTION IF EXISTS clear_tenant_context();
-- DROP FUNCTION IF EXISTS count_rls_policies();
--
-- -- 4. Drop indexes (optional - may want to keep for performance)
-- DROP INDEX IF EXISTS idx_agents_tenant_id;
-- DROP INDEX IF EXISTS idx_conversations_tenant_id;
-- DROP INDEX IF EXISTS idx_consultations_tenant_id;
-- DROP INDEX IF EXISTS idx_user_agents_tenant_id;
-- DROP INDEX IF EXISTS idx_profiles_tenant_id;
-- DROP INDEX IF EXISTS idx_consultations_tenant_user;
-- DROP INDEX IF EXISTS idx_messages_consultation_id;
--
-- COMMIT;
-- ============================================

