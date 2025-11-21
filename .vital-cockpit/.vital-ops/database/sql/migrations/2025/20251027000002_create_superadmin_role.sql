-- ============================================================================
-- SUPERADMIN ROLE AND RLS BYPASS
-- ============================================================================
-- Creates a superadmin role that bypasses all RLS policies
-- Allows full access to all tables and data
-- ============================================================================

-- Step 1: Create user_roles table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'superadmin')),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow superadmins to manage all roles
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;
CREATE POLICY "Superadmins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- Step 2: Create helper function to check if user is superadmin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Update RLS policies for knowledge_domains to allow superadmin
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Allow service role to manage knowledge_domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Superadmins have full access to knowledge_domains" ON public.knowledge_domains;

-- Create new policies with superadmin bypass
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true); -- Allow everyone to read

CREATE POLICY "Allow service role to manage knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin());

CREATE POLICY "Superadmins have full access to knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (public.is_superadmin());

-- Step 4: Update RLS policies for key tables to allow superadmin access
-- ============================================================================

-- Tenants table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenants') THEN
    DROP POLICY IF EXISTS "Superadmins have full access to tenants" ON public.tenants;
    CREATE POLICY "Superadmins have full access to tenants"
      ON public.tenants
      FOR ALL
      USING (public.is_superadmin());
  END IF;
END $$;

-- Agents table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agents') THEN
    DROP POLICY IF EXISTS "Superadmins have full access to agents" ON public.agents;
    CREATE POLICY "Superadmins have full access to agents"
      ON public.agents
      FOR ALL
      USING (public.is_superadmin());
  END IF;
END $$;

-- Knowledge documents table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_documents') THEN
    DROP POLICY IF EXISTS "Superadmins have full access to knowledge_documents" ON public.knowledge_documents;
    CREATE POLICY "Superadmins have full access to knowledge_documents"
      ON public.knowledge_documents
      FOR ALL
      USING (public.is_superadmin());
  END IF;
END $$;

-- RAG user feedback table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rag_user_feedback') THEN
    DROP POLICY IF EXISTS "Superadmins have full access to rag_user_feedback" ON public.rag_user_feedback;
    CREATE POLICY "Superadmins have full access to rag_user_feedback"
      ON public.rag_user_feedback
      FOR ALL
      USING (public.is_superadmin());
  END IF;
END $$;

-- Step 5: Grant superadmin to current user (YOU!)
-- ============================================================================
-- Replace this UUID with your actual Supabase user ID
-- You can find it in Supabase Dashboard > Authentication > Users
-- OR run: SELECT id, email FROM auth.users LIMIT 1;

-- IMPORTANT: Update this with your actual user ID!
-- This is a placeholder - the script below will try to find your user automatically

DO $$
DECLARE
  v_user_id UUID;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Try to find the first user in the auth.users table
  SELECT id INTO v_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Insert or update superadmin role for this user
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (v_user_id, 'superadmin', v_platform_tenant_id)
    ON CONFLICT (user_id, tenant_id)
    DO UPDATE SET
      role = 'superadmin',
      updated_at = NOW();

    RAISE NOTICE 'Granted superadmin role to user: %', v_user_id;
  ELSE
    RAISE NOTICE 'No users found in auth.users table. Please log in first, then run this migration.';
  END IF;
END $$;

-- Step 6: Verification query
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'SUPERADMIN SETUP COMPLETE';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Verify your superadmin status with:';
  RAISE NOTICE '  SELECT u.email, ur.role, ur.tenant_id';
  RAISE NOTICE '  FROM auth.users u';
  RAISE NOTICE '  JOIN public.user_roles ur ON u.id = ur.user_id';
  RAISE NOTICE '  WHERE ur.role = ''superadmin'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Test superadmin function:';
  RAISE NOTICE '  SELECT public.is_superadmin();';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

-- Display current superadmins
SELECT
  u.email,
  ur.role,
  t.name as tenant_name,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.tenants t ON ur.tenant_id = t.id
WHERE ur.role = 'superadmin'
ORDER BY ur.created_at;

COMMENT ON TABLE public.user_roles IS 'User role assignments with tenant-specific permissions';
COMMENT ON FUNCTION public.is_superadmin() IS 'Returns true if the current user is a superadmin';
