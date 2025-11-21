-- Make Amine and Hicham super admins with access to all tenants
-- Run this in Supabase SQL Editor

-- Step 1: Get the vital-system organization ID (the main admin tenant)
DO $$
DECLARE
  v_vital_system_org_id UUID;
  v_amine_user_id UUID;
  v_hicham_user_id UUID;
BEGIN
  -- Get vital-system organization ID
  SELECT id INTO v_vital_system_org_id
  FROM public.organizations
  WHERE tenant_key = 'vital-system'
  LIMIT 1;

  -- Get user IDs
  SELECT id INTO v_amine_user_id
  FROM auth.users
  WHERE email = 'amine.oualibouch2@gmail.com';

  SELECT id INTO v_hicham_user_id
  FROM auth.users
  WHERE email = 'hicham.naim@curated.health';

  RAISE NOTICE 'Vital System Org ID: %', v_vital_system_org_id;
  RAISE NOTICE 'Amine User ID: %', v_amine_user_id;
  RAISE NOTICE 'Hicham User ID: %', v_hicham_user_id;

  -- Update profiles table to set super_admin role
  IF v_amine_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE id = v_amine_user_id;

    RAISE NOTICE 'Updated Amine profile to super_admin';
  END IF;

  IF v_hicham_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'super_admin'
    WHERE id = v_hicham_user_id;

    RAISE NOTICE 'Updated Hicham profile to super_admin';
  END IF;

  -- Update or insert into users table (public.users with organization_id)
  IF v_amine_user_id IS NOT NULL AND v_vital_system_org_id IS NOT NULL THEN
    INSERT INTO public.users (id, organization_id, email, role)
    VALUES (v_amine_user_id, v_vital_system_org_id, 'amine.oualibouch2@gmail.com', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET organization_id = v_vital_system_org_id,
        role = 'admin',
        updated_at = NOW();

    RAISE NOTICE 'Updated Amine users record with vital-system org';
  END IF;

  IF v_hicham_user_id IS NOT NULL AND v_vital_system_org_id IS NOT NULL THEN
    INSERT INTO public.users (id, organization_id, email, role)
    VALUES (v_hicham_user_id, v_vital_system_org_id, 'hicham.naim@curated.health', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET organization_id = v_vital_system_org_id,
        role = 'admin',
        updated_at = NOW();

    RAISE NOTICE 'Updated Hicham users record with vital-system org';
  END IF;

  -- Verify updates
  RAISE NOTICE '--- Verification ---';
  RAISE NOTICE 'Amine profile role: %', (SELECT role FROM public.profiles WHERE id = v_amine_user_id);
  RAISE NOTICE 'Amine users org: %', (SELECT organization_id FROM public.users WHERE id = v_amine_user_id);
  RAISE NOTICE 'Hicham profile role: %', (SELECT role FROM public.profiles WHERE id = v_hicham_user_id);
  RAISE NOTICE 'Hicham users org: %', (SELECT organization_id FROM public.users WHERE id = v_hicham_user_id);

END $$;

-- Verification query
SELECT
  u.email,
  u.id as user_id,
  p.role as profile_role,
  pu.organization_id,
  o.name as organization_name,
  o.tenant_type,
  o.tenant_key
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.users pu ON pu.id = u.id
LEFT JOIN public.organizations o ON o.id = pu.organization_id
WHERE u.email IN ('amine.oualibouch2@gmail.com', 'hicham.naim@curated.health')
ORDER BY u.email;
