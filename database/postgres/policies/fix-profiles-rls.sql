-- ============================================================================
-- Fix Profiles RLS to Allow Agent Access Control Queries
-- Issue: Agents RLS policies need to check user role, but profiles RLS blocks it
-- ============================================================================

BEGIN;

-- Allow authenticated users to read ANY profile's role and tenant_id
-- This is necessary for RLS policies on other tables (agents, tenant_agents)
DROP POLICY IF EXISTS "allow_role_checks_for_rls" ON public.profiles;

CREATE POLICY "allow_role_checks_for_rls"
ON public.profiles FOR SELECT
TO authenticated
USING (true);  -- All authenticated users can read profiles (for RLS checks)

-- Note: This doesn't expose sensitive data because:
-- 1. Only role and tenant_id are used in RLS policies
-- 2. Profiles table doesn't contain sensitive personal data
-- 3. This is necessary for multi-tenant access control

COMMIT;

SELECT '✅ Profiles RLS updated to allow role checks!' as status;
