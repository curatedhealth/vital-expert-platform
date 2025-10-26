-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT RLS POLICIES (SIMPLE VERSION)
-- Migration: Update Row Level Security for Tenant Isolation + Sharing
-- Version: 1.0.0-SIMPLE
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Implement RLS policies for agents table ONLY
--   1. Tenant isolation (users only see their tenant's resources)
--   2. Platform resource sharing (global shared resources)
--   3. Selective resource sharing (cross-tenant collaboration)
--   4. Platform admin bypass (for management)
-- ============================================================================
-- CHANGES FROM ORIGINAL:
--   - REMOVED: deleted_at column references (doesn't exist in remote schema)
--   - REMOVED: tools, prompts, workflows tables (don't exist yet)
--   - REMOVED: rag_knowledge_sources table (doesn't exist yet)
--   - REMOVED: Materialized view (references non-existent tables)
--   - KEPT: Only agents table RLS policies
--   - KEPT: Essential helper functions
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

COMMENT ON FUNCTION get_current_tenant_id IS 'Gets the current tenant ID from session variable';

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
-- 2. UPDATE AGENTS TABLE RLS POLICIES
-- ============================================================================

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public agents are viewable by everyone" ON agents;
DROP POLICY IF EXISTS "Authenticated users can view internal agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can create agents" ON agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their own custom agents" ON agents;
DROP POLICY IF EXISTS "agents_select_with_sharing" ON agents;
DROP POLICY IF EXISTS "agents_insert_own_tenant" ON agents;
DROP POLICY IF EXISTS "agents_update_own_tenant" ON agents;
DROP POLICY IF EXISTS "agents_delete_own_tenant" ON agents;

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

-- Policy 4: DELETE (delete own tenant's resources)
CREATE POLICY "agents_delete_own_tenant" ON agents
    FOR DELETE
    TO authenticated
    USING (
        tenant_id = get_current_tenant_id()
        OR is_platform_admin(auth.uid())
    );

-- ============================================================================
-- 3. CREATE AUDIT LOGGING FOR RESOURCE SHARING
-- ============================================================================

-- Create audit table if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_sharing_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Resource Info
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    resource_name VARCHAR(255),

    -- Action
    action VARCHAR(50) NOT NULL CHECK (action IN ('shared', 'unshared', 'modified', 'access_granted', 'access_revoked')),
    previous_sharing_mode VARCHAR(50),
    new_sharing_mode VARCHAR(50),
    previous_shared_with UUID[],
    new_shared_with UUID[],

    -- Actors
    owner_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    performed_by_user_id UUID,
    affected_tenant_id UUID,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for audit table
DO $$
BEGIN
    -- Check and create indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'resource_sharing_audit'
        AND indexname = 'idx_resource_sharing_audit_resource'
    ) THEN
        CREATE INDEX idx_resource_sharing_audit_resource
            ON resource_sharing_audit(resource_type, resource_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'resource_sharing_audit'
        AND indexname = 'idx_resource_sharing_audit_tenant'
    ) THEN
        CREATE INDEX idx_resource_sharing_audit_tenant
            ON resource_sharing_audit(owner_tenant_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'resource_sharing_audit'
        AND indexname = 'idx_resource_sharing_audit_user'
    ) THEN
        CREATE INDEX idx_resource_sharing_audit_user
            ON resource_sharing_audit(performed_by_user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'resource_sharing_audit'
        AND indexname = 'idx_resource_sharing_audit_created'
    ) THEN
        CREATE INDEX idx_resource_sharing_audit_created
            ON resource_sharing_audit(created_at DESC);
    END IF;
END $$;

-- Enable RLS on audit table
ALTER TABLE resource_sharing_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing audit policies
DROP POLICY IF EXISTS "audit_platform_admin" ON resource_sharing_audit;
DROP POLICY IF EXISTS "audit_own_tenant" ON resource_sharing_audit;

-- Platform admins can see all audit logs
CREATE POLICY "audit_platform_admin" ON resource_sharing_audit
    FOR SELECT
    TO authenticated
    USING (is_platform_admin(auth.uid()));

-- Tenant admins can see their own tenant's audit logs
CREATE POLICY "audit_own_tenant" ON resource_sharing_audit
    FOR SELECT
    TO authenticated
    USING (
        owner_tenant_id = get_current_tenant_id()
        OR affected_tenant_id = get_current_tenant_id()
    );

-- ============================================================================
-- 4. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_policy_count INTEGER;
    v_function_count INTEGER;
BEGIN
    -- Count policies created on agents table
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'agents'
    AND policyname LIKE 'agents_%';

    -- Count helper functions created
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc
    WHERE proname IN ('set_tenant_context', 'get_current_tenant_id', 'can_access_resource');

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Migration 20251026000003_SIMPLE completed successfully';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Created % RLS policies on agents table', v_policy_count;
    RAISE NOTICE 'Created % helper functions', v_function_count;
    RAISE NOTICE 'Functions: set_tenant_context, get_current_tenant_id, can_access_resource';
    RAISE NOTICE 'Created audit table: resource_sharing_audit';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Next step: Run 20251026000004_seed_mvp_tenants.sql';
    RAISE NOTICE '============================================================';
END $$;
