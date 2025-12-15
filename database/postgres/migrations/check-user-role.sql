-- ============================================================================
-- CHECK USER ROLE - Run this to see your current role
-- ============================================================================

-- Option 1: Check your role from auth.users email (replace with your email)
-- Replace 'your-email@example.com' with your actual email address
SELECT 
  u.id as user_id,
  u.email,
  ur.role as user_roles_role,
  ur.tenant_id,
  p.role as profiles_role
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'your-email@example.com';

-- Option 2: Check all user_roles (if you have access)
-- This shows all users with roles in the user_roles table
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.tenant_id,
  u.email,
  ur.created_at
FROM user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.created_at DESC
LIMIT 100;

-- Option 3: Check profiles table roles
SELECT 
  id,
  email,
  role,
  full_name
FROM profiles
WHERE role IN ('super_admin', 'admin', 'superadmin')
ORDER BY created_at DESC
LIMIT 100;

-- Option 4: Get YOUR user ID from your email first
-- Replace 'your-email@example.com' with your actual email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Option 5: Check if you have superadmin in user_roles (most common case)
-- Replace the email below with your actual email
SELECT 
  ur.role,
  ur.user_id,
  u.email,
  CASE 
    WHEN ur.role = 'superadmin' THEN 'YES - You have superadmin role'
    WHEN ur.role = 'admin' THEN 'YES - You have admin role'
    WHEN ur.role IS NULL THEN 'NO - No role in user_roles table'
    ELSE 'Other role: ' || ur.role
  END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'your-email@example.com';

