-- Create Dummy Superadmin User for Development
-- Run this in Supabase SQL Editor or via supabase CLI

-- Step 1: Insert into auth.users (Supabase authentication)
-- Note: This requires admin/service role access
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  is_super_admin
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'superadmin@vitalexpert.com',
  crypt('superadmin123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Admin","organization":"VITAL Expert"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  false
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Step 2: Create profile in public.profiles
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  organization,
  role,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'superadmin@vitalexpert.com',
  'Super Admin',
  'VITAL Expert',
  'super_admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  updated_at = NOW();

-- Step 3: Get or create vital-system organization
DO $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Check if vital-system organization exists
  SELECT id INTO v_org_id
  FROM public.organizations
  WHERE tenant_key = 'vital-system' OR name = 'VITAL System'
  LIMIT 1;

  -- If not found, create it
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (
      id,
      name,
      tenant_type,
      tenant_key,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000010'::uuid,
      'VITAL System',
      'platform',
      'vital-system',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_org_id;
  END IF;

  -- Step 4: Create user record in public.users (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.users (
      id,
      organization_id,
      email,
      role,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      v_org_id,
      'superadmin@vitalexpert.com',
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = v_org_id,
      role = 'admin',
      updated_at = NOW();
  END IF;

  RAISE NOTICE 'Superadmin user created successfully!';
  RAISE NOTICE 'Email: superadmin@vitalexpert.com';
  RAISE NOTICE 'Password: superadmin123';
  RAISE NOTICE 'Organization ID: %', v_org_id;
END $$;

-- Verification query
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.organization,
  p.role as profile_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'superadmin@vitalexpert.com';
