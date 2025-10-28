-- ============================================================================
-- SUPERADMIN SETUP - SIMPLE VERSION
-- ============================================================================
-- Run this in Supabase SQL Editor
-- This handles existing user_roles table with different constraints
-- ============================================================================

-- Step 1: Drop existing check constraint and add new one with 'superadmin'
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('user', 'admin', 'superadmin'));

-- Step 2: Ensure unique constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_tenant_id_key'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_tenant_id_key
    UNIQUE (user_id, tenant_id);
  END IF;
END $$;

-- Step 3: Create is_superadmin helper function
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

-- Step 4: Grant superadmin to first user (YOU!)
DO $$
DECLARE
  v_user_id UUID;
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Assign superadmin role
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (v_user_id, 'superadmin', v_platform_tenant_id)
    ON CONFLICT (user_id, tenant_id)
    DO UPDATE SET role = 'superadmin';

    RAISE NOTICE 'Granted superadmin to user: %', v_user_id;
  ELSE
    RAISE NOTICE 'No users found. Please log in first.';
  END IF;
END $$;

-- Step 5: Update RLS policies for knowledge_domains
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Superadmins have full access to knowledge_domains" ON public.knowledge_domains;

-- Allow everyone to read (public access)
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

-- Allow superadmins full access
CREATE POLICY "Superadmins have full access to knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (public.is_superadmin());

-- Step 6: Verify setup
SELECT
  u.email,
  ur.role,
  ur.tenant_id,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'superadmin';
