-- Migration: Add tenant_id to profiles table
-- This establishes the mapping between users and tenants

-- Step 1: Add tenant_id column to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- Step 3: Set existing users to platform tenant by default
UPDATE profiles 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN profiles.tenant_id IS 'Tenant/organization this user belongs to. Links to tenants table.';
