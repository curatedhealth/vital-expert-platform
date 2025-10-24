-- Migration: Add RBAC Roles to Profiles Table
-- Description: Updates the profiles table to support the new RBAC role system
-- Date: 2025-10-24

-- First, drop the existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with all RBAC roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'manager', 'user', 'viewer', 'guest'));

-- Update existing 'admin' users to 'super_admin' (optional - only if you want to upgrade)
-- UPDATE profiles SET role = 'super_admin' WHERE role = 'admin';

-- Create an index on role for faster permission queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: super_admin, admin, manager, user, viewer, guest';
