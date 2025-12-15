-- ============================================================================
-- Agents Table RLS Policies for Multi-Tenant Access Control
-- ============================================================================
-- Users can ONLY see:
--   1. Public/active agents (status = 'active' or is_public = true)
--   2. Agents from their own tenant
--   3. Their own custom agents (created_by = user_id)
-- Users CANNOT see non-public agents from other tenants
-- ============================================================================

-- Enable RLS on agents table (if not already enabled)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Force RLS for all users (including table owner)
ALTER TABLE agents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP existing policies to recreate them cleanly
-- ============================================================================
DROP POLICY IF EXISTS "Users can view public agents" ON agents;
DROP POLICY IF EXISTS "Users can view own tenant agents" ON agents;
DROP POLICY IF EXISTS "Users can view own custom agents" ON agents;
DROP POLICY IF EXISTS "Users can create agents in own tenant" ON agents;
DROP POLICY IF EXISTS "Users can update own custom agents" ON agents;
DROP POLICY IF EXISTS "Admins can update tenant agents" ON agents;
DROP POLICY IF EXISTS "Users can delete own custom agents" ON agents;
DROP POLICY IF EXISTS "Admins can delete tenant agents" ON agents;
DROP POLICY IF EXISTS "Service role bypass" ON agents;
DROP POLICY IF EXISTS "agents_select_policy" ON agents;
DROP POLICY IF EXISTS "agents_insert_policy" ON agents;
DROP POLICY IF EXISTS "agents_update_policy" ON agents;
DROP POLICY IF EXISTS "agents_delete_policy" ON agents;

-- ============================================================================
-- SELECT POLICIES (What users can see)
-- ============================================================================

-- Policy 1: Users can see PUBLIC/ACTIVE agents from any tenant
CREATE POLICY "agents_select_public"
ON agents FOR SELECT
USING (
    -- Public agents (status = 'active' and publicly visible)
    (status = 'active' AND (is_public = true OR is_public IS NULL))
    OR
    -- Testing status agents that are public
    (status = 'testing' AND is_public = true)
);

-- Policy 2: Users can see ALL agents from their OWN tenant (including non-public)
CREATE POLICY "agents_select_own_tenant"
ON agents FOR SELECT
USING (
    -- Check if user belongs to the agent's tenant
    tenant_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
        UNION
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- Policy 3: Users can see their OWN custom agents (regardless of status/tenant)
CREATE POLICY "agents_select_own_created"
ON agents FOR SELECT
USING (
    created_by = auth.uid()
);

-- Policy 4: Super admins can see ALL agents
CREATE POLICY "agents_select_super_admin"
ON agents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'superadmin')
    )
);

-- ============================================================================
-- INSERT POLICIES (Who can create agents)
-- ============================================================================

-- Users can create agents in their own tenant
CREATE POLICY "agents_insert_own_tenant"
ON agents FOR INSERT
WITH CHECK (
    -- Agent must be assigned to user's tenant
    (tenant_id IS NULL OR tenant_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
        UNION
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ))
    AND
    -- Set created_by to current user
    (created_by IS NULL OR created_by = auth.uid())
);

-- Super admins can create agents in any tenant
CREATE POLICY "agents_insert_super_admin"
ON agents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'superadmin')
    )
);

-- ============================================================================
-- UPDATE POLICIES (Who can edit agents)
-- ============================================================================

-- Users can update their OWN custom agents
CREATE POLICY "agents_update_own_created"
ON agents FOR UPDATE
USING (
    created_by = auth.uid()
    AND is_custom = true
    AND (is_library_agent IS NULL OR is_library_agent = false)
)
WITH CHECK (
    created_by = auth.uid()
);

-- Tenant admins can update agents in their tenant
CREATE POLICY "agents_update_tenant_admin"
ON agents FOR UPDATE
USING (
    tenant_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'superadmin')
    )
)
WITH CHECK (
    tenant_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'superadmin')
    )
);

-- Super admins can update any agent
CREATE POLICY "agents_update_super_admin"
ON agents FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'superadmin')
    )
);

-- ============================================================================
-- DELETE POLICIES (Who can delete agents)
-- ============================================================================

-- Users can delete their OWN custom agents
CREATE POLICY "agents_delete_own_created"
ON agents FOR DELETE
USING (
    created_by = auth.uid()
    AND is_custom = true
    AND (is_library_agent IS NULL OR is_library_agent = false)
);

-- Tenant admins can delete agents in their tenant
CREATE POLICY "agents_delete_tenant_admin"
ON agents FOR DELETE
USING (
    tenant_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'superadmin')
    )
);

-- Super admins can delete any agent
CREATE POLICY "agents_delete_super_admin"
ON agents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'superadmin')
    )
);

-- ============================================================================
-- SERVICE ROLE BYPASS
-- Allows backend services to bypass RLS when using service_role key
-- ============================================================================
CREATE POLICY "agents_service_role_bypass"
ON agents FOR ALL
USING (
    -- Service role has full access
    current_setting('role', true) = 'service_role'
    OR
    -- Check for service role via auth.role()
    (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- ============================================================================
-- GRANT permissions to roles
-- ============================================================================
GRANT SELECT ON agents TO authenticated;
GRANT INSERT ON agents TO authenticated;
GRANT UPDATE ON agents TO authenticated;
GRANT DELETE ON agents TO authenticated;
GRANT ALL ON agents TO service_role;

-- ============================================================================
-- Add is_public column if not exists (for explicit public visibility)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE agents ADD COLUMN is_public BOOLEAN DEFAULT true;
        COMMENT ON COLUMN agents.is_public IS 'Whether agent is publicly visible to all tenants';
    END IF;
END
$$;

-- ============================================================================
-- Summary: RLS Policies Created
-- ============================================================================
-- SELECT:
--   - agents_select_public: Public/active agents visible to all
--   - agents_select_own_tenant: All agents in user's tenant
--   - agents_select_own_created: User's own custom agents
--   - agents_select_super_admin: Super admins see all
--
-- INSERT:
--   - agents_insert_own_tenant: Create in own tenant
--   - agents_insert_super_admin: Super admins create anywhere
--
-- UPDATE:
--   - agents_update_own_created: Edit own custom agents
--   - agents_update_tenant_admin: Admins edit tenant agents
--   - agents_update_super_admin: Super admins edit all
--
-- DELETE:
--   - agents_delete_own_created: Delete own custom agents
--   - agents_delete_tenant_admin: Admins delete tenant agents
--   - agents_delete_super_admin: Super admins delete all
-- ============================================================================
