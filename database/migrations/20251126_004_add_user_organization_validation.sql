-- Migration: Add User-Organization Membership Validation
-- Date: 2025-11-26
-- Priority: CRITICAL (Security Fix #2)
-- Purpose: Validate users belong to organizations they claim to access

BEGIN;

-- ============================================================================
-- USER-ORGANIZATION MEMBERSHIP VALIDATION FUNCTION
-- ============================================================================

/**
 * Validates that a user has membership in the specified organization
 *
 * This is CRITICAL for multi-tenant security. Every API request must validate
 * that the authenticated user actually belongs to the organization they're trying to access.
 *
 * @param p_user_id UUID - The authenticated user's ID
 * @param p_organization_id UUID - The organization ID to validate access to
 * @returns BOOLEAN - true if user has membership, false otherwise
 */
CREATE OR REPLACE FUNCTION validate_user_organization_membership(
  p_user_id UUID,
  p_organization_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_membership BOOLEAN;
BEGIN
  -- Check if user has active membership in the organization
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = p_user_id
      AND organization_id = p_organization_id
  ) INTO v_has_membership;

  -- Log validation attempt (for security audit)
  RAISE LOG 'User membership validation: user=%, org=%, result=%',
    p_user_id, p_organization_id, v_has_membership;

  RETURN v_has_membership;
END;
$$;

COMMENT ON FUNCTION validate_user_organization_membership IS
  'Validates user membership in organization for security checks. Returns true if user belongs to organization.';

-- ============================================================================
-- GET USER ORGANIZATIONS FUNCTION
-- ============================================================================

/**
 * Returns all organizations a user has access to
 * Useful for multi-select dropdowns and access lists
 *
 * @param p_user_id UUID - The user's ID
 * @returns TABLE of organization details
 */
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  user_role TEXT,
  permissions JSONB,
  joined_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.slug as organization_slug,
    uo.role as user_role,
    uo.permissions,
    uo.created_at as joined_at
  FROM public.user_organizations uo
  INNER JOIN public.organizations o ON uo.organization_id = o.id
  WHERE uo.user_id = p_user_id
    AND o.deleted_at IS NULL  -- Only active organizations
  ORDER BY o.name;
$$;

COMMENT ON FUNCTION get_user_organizations IS
  'Returns all organizations a user belongs to with their roles and permissions';

-- ============================================================================
-- SECURITY AUDIT LOGGING
-- ============================================================================

/**
 * Logs unauthorized organization access attempts
 * Called when validate_user_organization_membership returns false
 */
CREATE TABLE IF NOT EXISTS public.unauthorized_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  attempted_organization_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unauthorized_access_user
  ON public.unauthorized_access_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_unauthorized_access_org
  ON public.unauthorized_access_attempts(attempted_organization_id, created_at DESC);

COMMENT ON TABLE public.unauthorized_access_attempts IS
  'Audit log for unauthorized cross-organization access attempts (HIPAA requirement)';

-- ============================================================================
-- RLS POLICIES FOR AUDIT LOG
-- ============================================================================

ALTER TABLE public.unauthorized_access_attempts ENABLE ROW LEVEL SECURITY;

-- Only super admins can read unauthorized access attempts
CREATE POLICY "Super admins can read unauthorized access attempts"
  ON public.unauthorized_access_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin')
    )
  );

-- System can insert unauthorized access attempts (for logging)
CREATE POLICY "System can log unauthorized access attempts"
  ON public.unauthorized_access_attempts
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- VALIDATION
-- ============================================================================

-- Test the validation function works
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- This should not error, just return false for non-existent user/org
  test_result := validate_user_organization_membership(
    '00000000-0000-0000-0000-000000000000'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID
  );

  RAISE NOTICE 'Validation function test completed: %', test_result;
END $$;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (save as separate file if needed)
-- ============================================================================
-- BEGIN;
-- DROP FUNCTION IF EXISTS validate_user_organization_membership(UUID, UUID);
-- DROP FUNCTION IF EXISTS get_user_organizations(UUID);
-- DROP TABLE IF EXISTS public.unauthorized_access_attempts;
-- COMMIT;
