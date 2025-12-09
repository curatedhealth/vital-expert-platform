-- ============================================================================
-- VITAL Path - Workflows Table RLS Policies
-- ============================================================================
-- 
-- Workflows are tenant-isolated.
-- Users can only access workflows within their tenant.
-- 
-- This is a CRITICAL policy - workflow definitions contain business logic.
-- ============================================================================

-- Enable RLS on workflows table
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE workflows FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can view all workflows in their tenant
CREATE POLICY "workflows_select_tenant"
ON workflows
FOR SELECT
USING (
    tenant_id = auth.tenant_id()
);

-- System admins can view all workflows (for debugging)
CREATE POLICY "workflows_select_system"
ON workflows
FOR SELECT
USING (
    auth.is_system_admin()
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Users can create workflows in their tenant only
CREATE POLICY "workflows_insert_tenant"
ON workflows
FOR INSERT
WITH CHECK (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Users can update workflows they created
CREATE POLICY "workflows_update_own"
ON workflows
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
    -- Cannot change tenant_id or created_by
);

-- Tenant admins can update any workflow in their tenant
CREATE POLICY "workflows_update_tenant_admin"
ON workflows
FOR UPDATE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
)
WITH CHECK (
    tenant_id = auth.tenant_id()
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Users can delete workflows they created (soft delete preferred)
CREATE POLICY "workflows_delete_own"
ON workflows
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND created_by = auth.uid()
);

-- Tenant admins can delete any workflow in their tenant
CREATE POLICY "workflows_delete_tenant_admin"
ON workflows
FOR DELETE
USING (
    tenant_id = auth.tenant_id()
    AND auth.is_tenant_admin()
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for tenant filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id 
ON workflows(tenant_id);

-- Composite index for user's workflows
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_user 
ON workflows(tenant_id, created_by);

-- Index for status filtering within tenant
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_status 
ON workflows(tenant_id, status);


