-- SQL Script to bypass email confirmation for admin user
-- Run this in Supabase SQL Editor

-- First, let's check if the user exists
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'hicham.naim@curated.health';

-- Update the user to confirm email and set admin role
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin", "is_admin": true}'::jsonb,
  updated_at = NOW()
WHERE email = 'hicham.naim@curated.health';

-- Create or update the user profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_admin,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'hicham.naim@curated.health'),
  'hicham.naim@curated.health',
  'Hicham Naim',
  'super_admin',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_admin = true,
  is_active = true,
  updated_at = NOW();

-- Create admin permissions (if the table exists)
INSERT INTO public.user_permissions (
  user_id,
  permissions,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'hicham.naim@curated.health'),
  ARRAY[
    'users:create', 'users:read', 'users:update', 'users:delete',
    'agents:create', 'agents:read', 'agents:update', 'agents:delete',
    'knowledge:create', 'knowledge:read', 'knowledge:update', 'knowledge:delete',
    'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete',
    'analytics:read', 'analytics:write',
    'settings:read', 'settings:write',
    'admin:access', 'admin:manage_users', 'admin:manage_system'
  ],
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Verify the setup
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  p.role,
  p.is_admin,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'hicham.naim@curated.health';
