-- ============================================================================
-- VITAL Path - Agents Table RLS Policies
-- ============================================================================
-- 
-- Agents are tenant-isolated but can be marked as "shared" for cross-tenant
-- access (system agents available to all tenants).
-- ============================================================================

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE agents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view agents in their tenant
CREATE POLICY "agents_select_tenant"
ON agents
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
);

-- Users can also view shared/system agents (is_shared = true)
CREATE POLICY "agents_select_shared"
ON agents
FOR SELECT
USING (
    is_shared = true
    OR is_system = true
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

-- Users can create agents in their tenant
CREATE POLICY "agents_insert_tenant"
ON agents
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
    -- Regular users cannot create system agents
    AND (is_system = false OR auth.is_system_admin())
);

-- System admins can create system agents (no tenant)
CREATE POLICY "agents_insert_system"
ON agents
FOR INSERT
WITH CHECK (
    auth.is_system_admin()
    AND is_system = true
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
    AND is_system = false
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND is_system = false
);

-- Tenant admins can update any tenant agent
CREATE POLICY "agents_update_tenant_admin"
ON agents
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
    AND is_system = false
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND is_system = false
);

-- System admins can update system agents
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

-- Users can delete agents they created
CREATE POLICY "agents_delete_own"
ON agents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
    AND is_system = false
);

-- Tenant admins can delete any tenant agent
CREATE POLICY "agents_delete_tenant_admin"
ON agents
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
    AND is_system = false
);

-- System admins can delete system agents
CREATE POLICY "agents_delete_system"
ON agents
FOR DELETE
USING (
    auth.is_system_admin()
    AND is_system = true
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for tenant filtering
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id 
ON agents(tenant_id);

-- Index for shared/system agents
CREATE INDEX IF NOT EXISTS idx_agents_shared 
ON agents(is_shared, is_system);

-- Composite index for user's agents
CREATE INDEX IF NOT EXISTS idx_agents_tenant_user 
ON agents(tenant_id, created_by);






