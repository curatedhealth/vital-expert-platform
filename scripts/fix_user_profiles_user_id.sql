-- =========================================================================
-- FIX: Populate user_id in user_profiles table
-- =========================================================================
-- PROBLEM: user_profiles.user_id is NULL for all users
-- SOLUTION: Match by email and populate from auth.users

-- Step 1: Check current state
SELECT 
    up.email,
    up.role,
    up.user_id as current_user_id,
    au.id as auth_user_id
FROM user_profiles up
LEFT JOIN auth.users au ON au.email = up.email
ORDER BY up.role DESC, up.email;

-- Step 2: Update user_profiles.user_id with auth.users.id based on email match
UPDATE user_profiles up
SET user_id = au.id
FROM auth.users au
WHERE au.email = up.email
AND up.user_id IS NULL;

-- Step 3: Verify the update
SELECT 
    up.email,
    up.role,
    up.user_id,
    CASE 
        WHEN up.user_id IS NOT NULL THEN '✅ Fixed'
        ELSE '❌ Still NULL'
    END as status
FROM user_profiles up
ORDER BY up.role DESC, up.email;

-- Step 4: Show role distribution
SELECT 
    role,
    COUNT(*) as count,
    COUNT(user_id) as with_user_id,
    COUNT(*) - COUNT(user_id) as missing_user_id
FROM user_profiles
GROUP BY role
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'member' THEN 4
        ELSE 5
    END;


