-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT RLS POLICIES (Phase 7.2)
-- Migration: Update Row Level Security for Tenant Isolation + Sharing
-- Version: 2.0.0
-- Date: 2025-02-01
-- ============================================================================
-- Purpose: Implement comprehensive RLS policies that support:
--   1. Tenant isolation (users only see their tenant's resources)
--   2. Platform resource sharing (global shared resources)
--   3. Selective resource sharing (cross-tenant collaboration)
--   4. Platform admin bypass (for management)
-- ============================================================================
-- Note: This migration is idempotent (drops existing policies first)
-- ============================================================================

-- ============================================================================
-- 1. CREATE HELPER FUNCTIONS FOR RESOURCE ACCESS
-- ============================================================================

-- Function: Set tenant context (for RLS session variable)
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.tenant_id', p_tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_tenant_context IS 'Sets the current tenant context for RLS policies';

-- Function: Get current tenant from session
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if resource can be accessed by tenant
CREATE OR REPLACE FUNCTION can_access_resource(
    p_resource_tenant_id UUID,
    p_is_shared BOOLEAN,
    p_sharing_mode VARCHAR,
    p_shared_with UUID[],
    p_requesting_tenant_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Own resource
    IF p_resource_tenant_id = p_requesting_tenant_id THEN
        RETURN true;
    END IF;

    -- Not shared at all
    IF NOT p_is_shared THEN
        RETURN false;
    END IF;

    -- Globally shared (platform resources)
    IF p_sharing_mode = 'global' THEN
        RETURN true;
    END IF;

    -- Selectively shared
    IF p_sharing_mode = 'selective' THEN
        RETURN p_requesting_tenant_id = ANY(COALESCE(p_shared_with, ARRAY[]::UUID[]));
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION can_access_resource IS 'Validates if a tenant can access a resource based on sharing settings';

-- ============================================================================
-- 2. ENABLE RLS ON RESOURCE TABLES
-- ============================================================================

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tools table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') THEN
        ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tools table';
    END IF;
END $$;

-- Enable RLS on prompts table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
        ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on prompts table';
    END IF;
END $$;

-- Enable RLS on rag_knowledge_sources (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_knowledge_sources') THEN
        ALTER TABLE rag_knowledge_sources ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on rag_knowledge_sources table';
    END IF;
END $$;

-- ============================================================================
-- 3. UPDATE AGENTS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "agents_select_with_sharing" ON agents;
DROP POLICY IF EXISTS "agents_insert_own_tenant" ON agents;
DROP POLICY IF EXISTS "agents_update_own_tenant" ON agents;
DROP POLICY IF EXISTS "agents_delete_own_tenant" ON agents;
DROP POLICY IF EXISTS "Public agents are viewable by everyone" ON agents;
DROP POLICY IF EXISTS "Authenticated users can view internal agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can create agents" ON agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their own custom agents" ON agents;

-- Policy 1: SELECT with tenant isolation + sharing
CREATE POLICY "agents_select_with_sharing" ON agents
    FOR SELECT
    TO authenticated
    USING (
        -- Own resources
        tenant_id = get_current_tenant_id()

        OR

        -- Globally shared platform resources
        (is_shared = true AND sharing_mode = 'global')

        OR

        -- Selectively shared resources
        (is_shared = true
         AND sharing_mode = 'selective'
         AND get_current_tenant_id() = ANY(shared_with))

        OR

        -- Platform admin bypass
        is_platform_admin(auth.uid())
    );

-- Policy 2: INSERT (create resources for own tenant)
CREATE POLICY "agents_insert_own_tenant" ON agents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND created_by_user_id = auth.uid()
    );

-- Policy 3: UPDATE (modify own tenant's resources)
CREATE POLICY "agents_update_own_tenant" ON agents
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id = get_current_tenant_id()
        OR is_platform_admin(auth.uid())
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        OR is_platform_admin(auth.uid())
    );

-- Policy 4: DELETE (soft delete own tenant's resources)
CREATE POLICY "agents_delete_own_tenant" ON agents
    FOR DELETE
    TO authenticated
    USING (
        tenant_id = get_current_tenant_id()
        OR is_platform_admin(auth.uid())
    );

-- ============================================================================
-- 4. TOOLS TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tools') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "tools_select_with_sharing" ON tools;
        DROP POLICY IF EXISTS "tools_insert_own_tenant" ON tools;
        DROP POLICY IF EXISTS "tools_update_own_tenant" ON tools;
        DROP POLICY IF EXISTS "tools_delete_own_tenant" ON tools;

        -- SELECT policy
        CREATE POLICY "tools_select_with_sharing" ON tools
            FOR SELECT
            TO authenticated
            USING (
                (deleted_at IS NULL)
                AND (
                    tenant_id = get_current_tenant_id()
                    OR (is_shared = true AND sharing_mode = 'global')
                    OR (is_shared = true AND sharing_mode = 'selective'
                        AND get_current_tenant_id() = ANY(shared_with))
                    OR is_platform_admin(auth.uid())
                )
            );

        -- INSERT policy
        CREATE POLICY "tools_insert_own_tenant" ON tools
            FOR INSERT
            TO authenticated
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                AND created_by_user_id = auth.uid()
            );

        -- UPDATE policy
        CREATE POLICY "tools_update_own_tenant" ON tools
            FOR UPDATE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
            WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        -- DELETE policy
        CREATE POLICY "tools_delete_own_tenant" ON tools
            FOR DELETE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        RAISE NOTICE 'Created RLS policies for tools table';
    END IF;
END $$;

-- ============================================================================
-- 5. PROMPTS TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "prompts_select_with_sharing" ON prompts;
        DROP POLICY IF EXISTS "prompts_insert_own_tenant" ON prompts;
        DROP POLICY IF EXISTS "prompts_update_own_tenant" ON prompts;
        DROP POLICY IF EXISTS "prompts_delete_own_tenant" ON prompts;

        -- SELECT policy
        CREATE POLICY "prompts_select_with_sharing" ON prompts
            FOR SELECT
            TO authenticated
            USING (
                (deleted_at IS NULL)
                AND (
                    tenant_id = get_current_tenant_id()
                    OR (is_shared = true AND sharing_mode = 'global')
                    OR (is_shared = true AND sharing_mode = 'selective'
                        AND get_current_tenant_id() = ANY(shared_with))
                    OR is_platform_admin(auth.uid())
                )
            );

        -- INSERT policy
        CREATE POLICY "prompts_insert_own_tenant" ON prompts
            FOR INSERT
            TO authenticated
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                AND created_by_user_id = auth.uid()
            );

        -- UPDATE policy
        CREATE POLICY "prompts_update_own_tenant" ON prompts
            FOR UPDATE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
            WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        -- DELETE policy
        CREATE POLICY "prompts_delete_own_tenant" ON prompts
            FOR DELETE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        RAISE NOTICE 'Created RLS policies for prompts table';
    END IF;
END $$;

-- ============================================================================
-- 6. RAG_KNOWLEDGE_SOURCES TABLE RLS POLICIES (if exists)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_knowledge_sources') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "rag_knowledge_sources_select" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_insert" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_update" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_delete" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_sources_select_with_sharing" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_sources_insert_own_tenant" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_sources_update_own_tenant" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_sources_delete_own_tenant" ON rag_knowledge_sources;

        -- Enable RLS
        ALTER TABLE rag_knowledge_sources ENABLE ROW LEVEL SECURITY;

        -- SELECT policy
        CREATE POLICY "rag_sources_select_with_sharing" ON rag_knowledge_sources
            FOR SELECT
            TO authenticated
            USING (
                (deleted_at IS NULL OR deleted_at IS NULL)  -- Handle both cases
                AND (
                    tenant_id = get_current_tenant_id()
                    OR (is_shared = true AND sharing_mode = 'global')
                    OR (is_shared = true AND sharing_mode = 'selective'
                        AND get_current_tenant_id() = ANY(shared_with))
                    OR is_platform_admin(auth.uid())
                )
            );

        -- INSERT policy
        CREATE POLICY "rag_sources_insert_own_tenant" ON rag_knowledge_sources
            FOR INSERT
            TO authenticated
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                AND created_by_user_id = auth.uid()
            );

        -- UPDATE policy
        CREATE POLICY "rag_sources_update_own_tenant" ON rag_knowledge_sources
            FOR UPDATE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
            WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        -- DELETE policy
        CREATE POLICY "rag_sources_delete_own_tenant" ON rag_knowledge_sources
            FOR DELETE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        RAISE NOTICE 'Updated RLS policies for rag_knowledge_sources';
    END IF;
END $$;

-- ============================================================================
-- 7. ENABLE RLS ON TENANTS AND USER TABLES
-- ============================================================================

-- Enable RLS on tenants table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tenants table';
    END IF;
END $$;

-- Enable RLS on user_tenants table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tenants') THEN
        ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_tenants table';
    END IF;
END $$;

-- Enable RLS on user_roles table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_roles table';
    END IF;
END $$;

-- ============================================================================
-- 8. CREATE TENANTS TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "tenants_platform_admin_all" ON tenants;
        DROP POLICY IF EXISTS "tenants_admin_own_tenant" ON tenants;
        DROP POLICY IF EXISTS "tenants_admin_update_own" ON tenants;
        DROP POLICY IF EXISTS "tenants_public_info" ON tenants;

        -- Policy 1: Platform admins can see all tenants
        CREATE POLICY "tenants_platform_admin_all" ON tenants
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM user_roles
                    WHERE user_roles.user_id = auth.uid()
                    AND user_roles.role = 'platform_admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM user_roles
                    WHERE user_roles.user_id = auth.uid()
                    AND user_roles.role = 'platform_admin'
                )
            );

        -- Policy 2: Tenant admins can see their own tenant
        CREATE POLICY "tenants_admin_own_tenant" ON tenants
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM user_tenants ut
                    JOIN user_roles ur ON ur.user_id = ut.user_id
                    WHERE ut.tenant_id = tenants.id
                    AND ut.user_id = auth.uid()
                    AND ur.role IN ('tenant_admin', 'tenant_owner')
                )
            );

        -- Policy 3: All authenticated users can see public tenant info (for discovery)
        CREATE POLICY "tenants_public_info" ON tenants
            FOR SELECT
            TO authenticated
            USING (
                status = 'active'
                AND deleted_at IS NULL
            );

        RAISE NOTICE 'Created RLS policies for tenants table';
    END IF;
END $$;

-- ============================================================================
-- 9. CREATE USER_TENANTS TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tenants') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "user_tenants_own_access" ON user_tenants;

        -- Users can see their own tenant associations
        CREATE POLICY "user_tenants_own_access" ON user_tenants
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());

        RAISE NOTICE 'Created RLS policies for user_tenants table';
    END IF;
END $$;

-- ============================================================================
-- 10. CREATE USER_ROLES TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "user_roles_own_access" ON user_roles;

        -- Users can see their own roles
        CREATE POLICY "user_roles_own_access" ON user_roles
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());

        RAISE NOTICE 'Created RLS policies for user_roles table';
    END IF;
END $$;

-- ============================================================================
-- 11. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_policy_count INTEGER;
    v_rls_enabled_tables TEXT[];
BEGIN
    -- Count policies created
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE '%_with_sharing' OR policyname LIKE '%_own_tenant';

    -- Get list of tables with RLS enabled
    SELECT ARRAY_AGG(tablename) INTO v_rls_enabled_tables
    FROM pg_tables t
    WHERE schemaname = 'public'
    AND EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = t.tablename
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    );

    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Migration 20250201000006: Update RLS Policies - COMPLETE';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'RLS policies created: %', v_policy_count;
    RAISE NOTICE 'Tables with RLS enabled: %', array_to_string(v_rls_enabled_tables, ', ');
    RAISE NOTICE 'Next step: Run migration 20250201000004_seed_platform_tenant.sql';
    RAISE NOTICE '============================================================================';
END $$;

