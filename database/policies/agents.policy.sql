-- ============================================================================
-- VITAL Path - Agents Table RLS Policies
-- ============================================================================
--
-- Agents are tenant-isolated with visibility options:
-- - is_public: Visible to all users (read-only for other tenants)
-- - is_shared: Shared across tenants (read-only for other tenants)
-- - is_private_to_user: Only visible to the creator
--
-- PREREQUISITES: Run tenants.policy.sql first to create auth helper functions.
-- ============================================================================

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (prevents bypass even for owner)
ALTER TABLE agents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view agents in their own tenant
CREATE POLICY "agents_select_tenant"
ON agents
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
    AND (
        -- Not private, or user is the creator
        is_private_to_user = false
        OR created_by = auth.uid()
    )
);

-- Users can view public agents from any tenant (read-only)
CREATE POLICY "agents_select_public"
ON agents
FOR SELECT
USING (
    is_public = true
);

-- Users can view shared agents from any tenant (read-only)
CREATE POLICY "agents_select_shared"
ON agents
FOR SELECT
USING (
    is_shared = true
);

-- System admins can view all agents
CREATE POLICY "agents_select_system"
ON agents
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Users can create agents in their own tenant
CREATE POLICY "agents_insert_tenant"
ON agents
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
);

-- System admins can create agents for any tenant
CREATE POLICY "agents_insert_system"
ON agents
FOR INSERT
WITH CHECK (
    auth.is_system_admin()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Users can update agents they created
CREATE POLICY "agents_update_own"
ON agents
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    -- Cannot change tenant_id on update
);

-- Tenant admins can update any agent in their tenant
CREATE POLICY "agents_update_tenant_admin"
ON agents
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- System admins can update any agent
CREATE POLICY "agents_update_system"
ON agents
FOR UPDATE
USING (
    auth.is_system_admin()
)
WITH CHECK (
    auth.is_system_admin()
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Users can delete agents they created (soft delete preferred)
CREATE POLICY "agents_delete_own"
ON agents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
);

-- Tenant admins can delete any agent in their tenant
CREATE POLICY "agents_delete_tenant_admin"
ON agents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- System admins can delete any agent
CREATE POLICY "agents_delete_system"
ON agents
FOR DELETE
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for tenant filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id
ON agents(tenant_id);

-- Index for public/shared agents (cross-tenant queries)
CREATE INDEX IF NOT EXISTS idx_agents_visibility
ON agents(is_public, is_shared)
WHERE is_public = true OR is_shared = true;

-- Composite index for user's own agents
CREATE INDEX IF NOT EXISTS idx_agents_tenant_user
ON agents(tenant_id, created_by);

-- Index for private agents lookup
CREATE INDEX IF NOT EXISTS idx_agents_private
ON agents(tenant_id, created_by, is_private_to_user)
WHERE is_private_to_user = true;

-- Index for active agents (most queries filter by status)
CREATE INDEX IF NOT EXISTS idx_agents_tenant_status
ON agents(tenant_id, status)
WHERE status = 'active';






