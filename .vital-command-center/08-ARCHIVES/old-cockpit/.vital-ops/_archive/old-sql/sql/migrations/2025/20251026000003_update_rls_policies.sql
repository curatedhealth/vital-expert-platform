-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT RLS POLICIES
-- Migration: Update Row Level Security for Tenant Isolation + Sharing
-- Version: 1.0.0
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Implement comprehensive RLS policies that support:
--   1. Tenant isolation (users only see their tenant's resources)
--   2. Platform resource sharing (global shared resources)
--   3. Selective resource sharing (cross-tenant collaboration)
--   4. Platform admin bypass (for management)
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

-- Function: Get accessible resources for a tenant (generic)
CREATE OR REPLACE FUNCTION get_accessible_resources(
    p_tenant_id UUID,
    p_table_name TEXT,
    p_include_own BOOLEAN DEFAULT true,
    p_include_platform BOOLEAN DEFAULT true,
    p_include_shared BOOLEAN DEFAULT true
)
RETURNS TABLE(
    resource_id UUID,
    resource_name TEXT,
    source TEXT,
    owner_tenant_id UUID,
    owner_tenant_name TEXT
) AS $$
DECLARE
    v_query TEXT;
BEGIN
    v_query := format($query$
        SELECT
            r.id AS resource_id,
            r.name AS resource_name,
            CASE
                WHEN r.tenant_id = %L THEN 'own'
                WHEN r.tenant_id = get_super_admin_tenant_id() THEN 'platform'
                ELSE 'shared'
            END AS source,
            r.tenant_id AS owner_tenant_id,
            t.name AS owner_tenant_name
        FROM %I r
        JOIN tenants t ON r.tenant_id = t.id
        WHERE r.deleted_at IS NULL
        AND (
            (%L AND r.tenant_id = %L)  -- Own resources
            OR
            (%L AND r.is_shared = true AND r.sharing_mode = 'global')  -- Platform shared
            OR
            (%L AND r.is_shared = true AND r.sharing_mode = 'selective'
                AND %L = ANY(r.shared_with))  -- Selectively shared
        )
        ORDER BY source, r.name
    $query$,
        p_tenant_id,
        p_table_name,
        p_include_own, p_tenant_id,
        p_include_platform,
        p_include_shared, p_tenant_id
    );

    RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Convenience wrappers for specific resource types
CREATE OR REPLACE FUNCTION get_accessible_agents(p_tenant_id UUID)
RETURNS TABLE(agent_id UUID, name TEXT, source TEXT, owner_tenant_id UUID, owner_tenant_name TEXT) AS $$
    SELECT resource_id, resource_name, source, owner_tenant_id, owner_tenant_name
    FROM get_accessible_resources(p_tenant_id, 'agents');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_accessible_tools(p_tenant_id UUID)
RETURNS TABLE(tool_id UUID, name TEXT, source TEXT, owner_tenant_id UUID, owner_tenant_name TEXT) AS $$
    SELECT resource_id, resource_name, source, owner_tenant_id, owner_tenant_name
    FROM get_accessible_resources(p_tenant_id, 'tools');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_accessible_prompts(p_tenant_id UUID)
RETURNS TABLE(prompt_id UUID, name TEXT, source TEXT, owner_tenant_id UUID, owner_tenant_name TEXT) AS $$
    SELECT resource_id, resource_name, source, owner_tenant_id, owner_tenant_name
    FROM get_accessible_resources(p_tenant_id, 'prompts');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_accessible_workflows(p_tenant_id UUID)
RETURNS TABLE(workflow_id UUID, name TEXT, source TEXT, owner_tenant_id UUID, owner_tenant_name TEXT) AS $$
    SELECT resource_id, resource_name, source, owner_tenant_id, owner_tenant_name
    FROM get_accessible_resources(p_tenant_id, 'workflows');
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 2. UPDATE AGENTS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies
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
        deleted_at IS NULL
        AND (
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
        )
    );

-- Policy 2: INSERT (create resources for own tenant)
CREATE POLICY "agents_insert_own_tenant" ON agents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND created_by_user_id = auth.uid()
        AND deleted_at IS NULL
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
-- 3. TOOLS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tools_select_with_sharing" ON tools
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            tenant_id = get_current_tenant_id()
            OR (is_shared = true AND sharing_mode = 'global')
            OR (is_shared = true AND sharing_mode = 'selective'
                AND get_current_tenant_id() = ANY(shared_with))
            OR is_platform_admin(auth.uid())
        )
    );

CREATE POLICY "tools_insert_own_tenant" ON tools
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND created_by_user_id = auth.uid()
    );

CREATE POLICY "tools_update_own_tenant" ON tools
    FOR UPDATE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
    WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

CREATE POLICY "tools_delete_own_tenant" ON tools
    FOR DELETE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

-- ============================================================================
-- 4. PROMPTS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompts_select_with_sharing" ON prompts
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            tenant_id = get_current_tenant_id()
            OR (is_shared = true AND sharing_mode = 'global')
            OR (is_shared = true AND sharing_mode = 'selective'
                AND get_current_tenant_id() = ANY(shared_with))
            OR is_platform_admin(auth.uid())
        )
    );

CREATE POLICY "prompts_insert_own_tenant" ON prompts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND created_by_user_id = auth.uid()
    );

CREATE POLICY "prompts_update_own_tenant" ON prompts
    FOR UPDATE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
    WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

CREATE POLICY "prompts_delete_own_tenant" ON prompts
    FOR DELETE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

-- ============================================================================
-- 5. WORKFLOWS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows_select_with_sharing" ON workflows
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NULL
        AND (
            tenant_id = get_current_tenant_id()
            OR (is_shared = true AND sharing_mode = 'global')
            OR (is_shared = true AND sharing_mode = 'selective'
                AND get_current_tenant_id() = ANY(shared_with))
            OR is_platform_admin(auth.uid())
        )
    );

CREATE POLICY "workflows_insert_own_tenant" ON workflows
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND created_by_user_id = auth.uid()
    );

CREATE POLICY "workflows_update_own_tenant" ON workflows
    FOR UPDATE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
    WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

CREATE POLICY "workflows_delete_own_tenant" ON workflows
    FOR DELETE
    TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

-- ============================================================================
-- 6. RAG_KNOWLEDGE_SOURCES TABLE RLS POLICIES (if exists)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_knowledge_sources') THEN
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "rag_knowledge_sources_select" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_insert" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_update" ON rag_knowledge_sources;
        DROP POLICY IF EXISTS "rag_knowledge_sources_delete" ON rag_knowledge_sources;

        -- Enable RLS
        ALTER TABLE rag_knowledge_sources ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "rag_sources_select_with_sharing" ON rag_knowledge_sources
            FOR SELECT
            TO authenticated
            USING (
                deleted_at IS NULL
                AND (
                    tenant_id = get_current_tenant_id()
                    OR (is_shared = true AND sharing_mode = 'global')
                    OR (is_shared = true AND sharing_mode = 'selective'
                        AND get_current_tenant_id() = ANY(shared_with))
                    OR is_platform_admin(auth.uid())
                )
            );

        CREATE POLICY "rag_sources_insert_own_tenant" ON rag_knowledge_sources
            FOR INSERT
            TO authenticated
            WITH CHECK (
                tenant_id = get_current_tenant_id()
                AND created_by_user_id = auth.uid()
            );

        CREATE POLICY "rag_sources_update_own_tenant" ON rag_knowledge_sources
            FOR UPDATE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()))
            WITH CHECK (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        CREATE POLICY "rag_sources_delete_own_tenant" ON rag_knowledge_sources
            FOR DELETE
            TO authenticated
            USING (tenant_id = get_current_tenant_id() OR is_platform_admin(auth.uid()));

        RAISE NOTICE 'Updated RLS policies for rag_knowledge_sources';
    END IF;
END $$;

-- ============================================================================
-- 7. CREATE MATERIALIZED VIEW FOR PLATFORM SHARED RESOURCES (PERFORMANCE)
-- ============================================================================

-- Drop if exists
DROP MATERIALIZED VIEW IF EXISTS mv_platform_shared_resources CASCADE;

-- Create materialized view for frequently accessed platform resources
CREATE MATERIALIZED VIEW mv_platform_shared_resources AS
SELECT
    'agent' AS resource_type,
    id AS resource_id,
    name,
    tenant_id,
    is_shared,
    sharing_mode,
    resource_type AS resource_category,
    created_at
FROM agents
WHERE is_shared = true
  AND sharing_mode = 'global'
  AND deleted_at IS NULL

UNION ALL

SELECT
    'tool' AS resource_type,
    id AS resource_id,
    name,
    tenant_id,
    is_shared,
    sharing_mode,
    resource_type AS resource_category,
    created_at
FROM tools
WHERE is_shared = true
  AND sharing_mode = 'global'
  AND deleted_at IS NULL

UNION ALL

SELECT
    'prompt' AS resource_type,
    id AS resource_id,
    name,
    tenant_id,
    is_shared,
    sharing_mode,
    resource_type AS resource_category,
    created_at
FROM prompts
WHERE is_shared = true
  AND sharing_mode = 'global'
  AND deleted_at IS NULL

UNION ALL

SELECT
    'workflow' AS resource_type,
    id AS resource_id,
    name,
    tenant_id,
    is_shared,
    sharing_mode,
    resource_type AS resource_category,
    created_at
FROM workflows
WHERE is_shared = true
  AND sharing_mode = 'global'
  AND deleted_at IS NULL;

-- Create index on materialized view
CREATE INDEX idx_mv_platform_resources_type
    ON mv_platform_shared_resources(resource_type);
CREATE INDEX idx_mv_platform_resources_category
    ON mv_platform_shared_resources(resource_category);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_platform_resources()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_shared_resources;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON MATERIALIZED VIEW mv_platform_shared_resources IS 'Cached view of all platform-shared resources for performance';
COMMENT ON FUNCTION refresh_platform_resources IS 'Refreshes the platform resources materialized view. Run after creating/updating platform resources';

-- ============================================================================
-- 8. ADD AUDIT LOGGING FOR RESOURCE SHARING
-- ============================================================================

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
    owner_tenant_id UUID NOT NULL REFERENCES tenants(id),
    performed_by_user_id UUID,
    affected_tenant_id UUID,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_resource_sharing_audit_resource ON resource_sharing_audit(resource_type, resource_id);
CREATE INDEX idx_resource_sharing_audit_tenant ON resource_sharing_audit(owner_tenant_id);
CREATE INDEX idx_resource_sharing_audit_user ON resource_sharing_audit(performed_by_user_id);
CREATE INDEX idx_resource_sharing_audit_created ON resource_sharing_audit(created_at DESC);

-- Enable RLS
ALTER TABLE resource_sharing_audit ENABLE ROW LEVEL SECURITY;

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
-- 9. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_policy_count INTEGER;
BEGIN
    -- Count policies created
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE '%_with_sharing';

    RAISE NOTICE 'Migration 20251026000003 completed successfully';
    RAISE NOTICE 'Created % RLS policies with tenant isolation + sharing', v_policy_count;
    RAISE NOTICE 'Created helper functions: set_tenant_context, can_access_resource, get_accessible_*';
    RAISE NOTICE 'Created materialized view: mv_platform_shared_resources';
    RAISE NOTICE 'Created audit table: resource_sharing_audit';
    RAISE NOTICE 'Next step: Run 20251026000004_seed_mvp_tenants.sql';
END $$;
