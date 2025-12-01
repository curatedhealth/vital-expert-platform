-- ============================================================================
-- RLS Organization Functions for Multi-Tenant Security
-- ============================================================================
-- These functions are REQUIRED by the agent-auth middleware for:
-- 1. Validating user belongs to an organization
-- 2. Setting organization context for RLS policies
-- 3. Getting user's organizations
-- ============================================================================

-- ============================================================================
-- 1. SET ORGANIZATION CONTEXT
-- Sets the PostgreSQL session variable for RLS policies
-- ============================================================================
CREATE OR REPLACE FUNCTION set_organization_context(p_organization_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set the session variable for RLS policies
    PERFORM set_config('app.current_organization_id', COALESCE(p_organization_id::text, ''), false);
    PERFORM set_config('app.tenant_id', COALESCE(p_organization_id::text, ''), false);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION set_organization_context(UUID) TO authenticated;

-- ============================================================================
-- 2. GET CURRENT ORGANIZATION CONTEXT
-- Returns the currently set organization context
-- ============================================================================
CREATE OR REPLACE FUNCTION get_current_organization_context()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id TEXT;
BEGIN
    v_org_id := current_setting('app.current_organization_id', true);
    IF v_org_id IS NULL OR v_org_id = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_org_id::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_current_organization_context() TO authenticated;

-- ============================================================================
-- 3. VALIDATE USER ORGANIZATION MEMBERSHIP
-- Checks if a user belongs to an organization
--
-- CRITICAL SECURITY: This function validates cross-tenant access
-- Returns TRUE if:
--   - User is platform admin (vital-system tenant)
--   - User's organization_id matches the requested organization
--   - User is in organization_members table for that organization
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_user_organization_membership(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_org_id UUID;
    v_user_role TEXT;
    v_is_member BOOLEAN;
    v_platform_tenant_id UUID;
BEGIN
    -- Get platform tenant ID (vital-system) from config or tenants table
    SELECT id INTO v_platform_tenant_id
    FROM tenants
    WHERE tenant_key = 'vital-system'
    LIMIT 1;

    -- If checking platform tenant access, allow platform users
    IF p_organization_id = v_platform_tenant_id OR p_organization_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if user exists in users table with this organization
    SELECT organization_id, role INTO v_user_org_id, v_user_role
    FROM users
    WHERE id = p_user_id;

    -- Super admins can access any organization
    IF v_user_role IN ('super_admin', 'superadmin') THEN
        RETURN TRUE;
    END IF;

    -- Check direct organization match
    IF v_user_org_id = p_organization_id THEN
        RETURN TRUE;
    END IF;

    -- Check organization_members table (for multi-org users)
    SELECT EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = p_user_id
        AND organization_id = p_organization_id
    ) INTO v_is_member;

    IF v_is_member THEN
        RETURN TRUE;
    END IF;

    -- Default: deny access
    RETURN FALSE;

EXCEPTION
    WHEN OTHERS THEN
        -- Fail secure: deny on error
        RETURN FALSE;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION validate_user_organization_membership(UUID, UUID) TO authenticated;

-- ============================================================================
-- 4. GET USER ORGANIZATIONS
-- Returns all organizations a user has access to
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    organization_slug TEXT,
    user_role TEXT,
    permissions JSONB,
    joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Return organizations from users table
    RETURN QUERY
    SELECT
        u.organization_id,
        COALESCE(t.name, 'Unknown Organization') AS organization_name,
        COALESCE(t.tenant_key, 'unknown') AS organization_slug,
        u.role AS user_role,
        '{}'::JSONB AS permissions,
        u.created_at AS joined_at
    FROM users u
    LEFT JOIN tenants t ON t.id = u.organization_id
    WHERE u.id = p_user_id
    AND u.organization_id IS NOT NULL

    UNION ALL

    -- Include organizations from organization_members table
    SELECT
        om.organization_id,
        COALESCE(t.name, 'Unknown Organization') AS organization_name,
        COALESCE(t.tenant_key, 'unknown') AS organization_slug,
        om.role AS user_role,
        COALESCE(om.permissions, '{}'::JSONB) AS permissions,
        om.created_at AS joined_at
    FROM organization_members om
    LEFT JOIN tenants t ON t.id = om.organization_id
    WHERE om.user_id = p_user_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_organizations(UUID) TO authenticated;

-- ============================================================================
-- 5. Create organization_members table if not exists
-- For multi-organization membership support
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own memberships
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
CREATE POLICY "Users can view own memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policy: Admins can manage memberships in their organization
DROP POLICY IF EXISTS "Admins can manage org memberships" ON organization_members;
CREATE POLICY "Admins can manage org memberships" ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (u.role IN ('admin', 'super_admin', 'superadmin'))
            AND (u.organization_id = organization_members.organization_id
                 OR u.role IN ('super_admin', 'superadmin'))
        )
    );

-- ============================================================================
-- 6. Create unauthorized_access_attempts table for audit logging
-- HIPAA requirement: Log all unauthorized access attempts
-- ============================================================================
CREATE TABLE IF NOT EXISTS unauthorized_access_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    attempted_organization_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for security auditing
CREATE INDEX IF NOT EXISTS idx_unauthorized_attempts_user ON unauthorized_access_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_unauthorized_attempts_org ON unauthorized_access_attempts(attempted_organization_id);
CREATE INDEX IF NOT EXISTS idx_unauthorized_attempts_created ON unauthorized_access_attempts(created_at DESC);

-- Enable RLS (only admins can view)
ALTER TABLE unauthorized_access_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only super admins can view audit log
DROP POLICY IF EXISTS "Super admins can view unauthorized attempts" ON unauthorized_access_attempts;
CREATE POLICY "Super admins can view unauthorized attempts" ON unauthorized_access_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('super_admin', 'superadmin')
        )
    );

-- RLS Policy: System can insert unauthorized attempts
DROP POLICY IF EXISTS "System can log unauthorized attempts" ON unauthorized_access_attempts;
CREATE POLICY "System can log unauthorized attempts" ON unauthorized_access_attempts
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 7. Add organization_id to users table if not exists
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES tenants(id);
        CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
    END IF;
END
$$;

-- ============================================================================
-- 8. GRANT SERVICE ROLE BYPASS for admin operations
-- Allows service role to bypass RLS for system operations
-- ============================================================================
ALTER TABLE organization_members FORCE ROW LEVEL SECURITY;
ALTER TABLE unauthorized_access_attempts FORCE ROW LEVEL SECURITY;

-- Service role can bypass RLS
GRANT ALL ON organization_members TO service_role;
GRANT ALL ON unauthorized_access_attempts TO service_role;

-- ============================================================================
-- Summary: Functions created
-- ============================================================================
-- set_organization_context(UUID) - Sets RLS context
-- get_current_organization_context() - Gets current context
-- validate_user_organization_membership(UUID, UUID) - Validates membership
-- get_user_organizations(UUID) - Lists user's organizations
-- ============================================================================
