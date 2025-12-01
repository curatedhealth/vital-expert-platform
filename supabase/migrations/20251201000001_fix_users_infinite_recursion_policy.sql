-- ============================================================================
-- FIX: Infinite recursion in RLS policy for relation "users"
-- ============================================================================
-- Error observed from Supabase REST:
--   {"code":"42P17","message":"infinite recursion detected in policy for relation \"users\""}
--
-- Root cause:
--   - Policy "users_read_org_users" on public.users selects from public.users
--     inside its USING clause (self-reference).
--   - Policy "super_admins_read_all_users" on public.users also joins
--     public.users inside its USING clause.
--   - With RLS enabled on public.users, any SELECT on public.users can
--     re-trigger these policies recursively, causing 42P17.
--
-- Fix (definitive):
--   - Drop BOTH recursive policies if they exist.
--   - Recreate:
--       1) A simple "users_read_own_user" policy (id = auth.uid()) so every
--          authenticated user can always read their own row.
--       2) A safe "users_read_org_users" policy that uses public.profiles
--          to determine the caller's organization_id instead of querying
--          public.users.
--       3) A safe "super_admins_read_all_users" policy that uses profiles
--          and organizations only (no self-join on public.users).
--
--   All new policies avoid selecting from public.users inside their USING
--   expressions, so infinite recursion cannot occur.
--
-- Result:
--   - /rest/v1/users?select=organization_id&id=eq.<user_id> returns 200
--     instead of 500/42P17.
--   - Tenant isolation & super-admin behavior are preserved.
-- ============================================================================

DO $$
BEGIN
  -- Drop old recursive policies if they exist
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_read_org_users'
  ) THEN
    DROP POLICY "users_read_org_users" ON public.users;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'super_admins_read_all_users'
  ) THEN
    DROP POLICY "super_admins_read_all_users" ON public.users;
  END IF;

  -- --------------------------------------------------------------------------
  -- Policy 1: Users can always read their own user row
  -- --------------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_read_own_user'
  ) THEN
    CREATE POLICY "users_read_own_user"
    ON public.users FOR SELECT
    TO authenticated
    USING (id = auth.uid());
  END IF;

  -- --------------------------------------------------------------------------
  -- Policy 2: Users can read other users in their organization
  --          (resolved via profiles, no self-reference to users)
  -- --------------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_read_org_users_safe'
  ) THEN
    CREATE POLICY "users_read_org_users_safe"
    ON public.users FOR SELECT
    TO authenticated
    USING (
      organization_id IS NOT NULL
      AND organization_id IN (
        SELECT p.organization_id
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.organization_id IS NOT NULL
      )
    );
  END IF;

  -- --------------------------------------------------------------------------
  -- Policy 3: Super admins (in system tenant) can read all users
  --          (uses profiles + organizations, no self-join on users)
  -- --------------------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'super_admins_read_all_users_safe'
  ) THEN
    CREATE POLICY "super_admins_read_all_users_safe"
    ON public.users FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.organizations o ON o.id = p.organization_id
        WHERE p.id = auth.uid()
          AND p.role = 'super_admin'
          AND o.tenant_type = 'system'
      )
    );
  END IF;
END $$;



