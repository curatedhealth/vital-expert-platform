-- ============================================================================
-- VITAL Path - Tenants Table RLS Policies
-- ============================================================================
-- 
-- Tenants are the top-level isolation unit.
-- Users can only access data within their assigned tenant.
--
-- CRITICAL: These policies are the foundation of multi-tenancy security.
-- ============================================================================

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (prevents bypass)
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES
-- ============================================================================

-- Users can only see their own tenant
CREATE POLICY "tenants_select_own"
ON tenants
FOR SELECT
USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
);

-- System/admin users can see all tenants (for admin dashboards)
CREATE POLICY "tenants_select_admin"
ON tenants
FOR SELECT
USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'system'
);

-- ============================================================================
-- INSERT POLICIES
-- ============================================================================

-- Only system users can create new tenants
CREATE POLICY "tenants_insert_system_only"
ON tenants
FOR INSERT
WITH CHECK (
    (auth.jwt() ->> 'role') = 'system'
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Tenant admins can update their own tenant settings
CREATE POLICY "tenants_update_own_admin"
ON tenants
FOR UPDATE
USING (
    id = (auth.jwt() ->> 'tenant_id')::uuid
    AND (auth.jwt() ->> 'tenant_role') = 'admin'
)
WITH CHECK (
    id = (auth.jwt() ->> 'tenant_id')::uuid
);

-- System users can update any tenant
CREATE POLICY "tenants_update_system"
ON tenants
FOR UPDATE
USING (
    (auth.jwt() ->> 'role') = 'system'
)
WITH CHECK (
    (auth.jwt() ->> 'role') = 'system'
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Only system users can delete tenants (soft delete preferred)
CREATE POLICY "tenants_delete_system_only"
ON tenants
FOR DELETE
USING (
    (auth.jwt() ->> 'role') = 'system'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current tenant ID from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT (auth.jwt() ->> 'tenant_id')::uuid
$$;

-- Function to check if user is tenant admin
CREATE OR REPLACE FUNCTION auth.is_tenant_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT (auth.jwt() ->> 'tenant_role') = 'admin'
$$;

-- Function to check if user is system admin
CREATE OR REPLACE FUNCTION auth.is_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT (auth.jwt() ->> 'role') IN ('admin', 'system')
$$;


