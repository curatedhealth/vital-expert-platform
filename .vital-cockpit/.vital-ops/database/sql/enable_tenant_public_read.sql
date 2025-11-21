-- Enable Public Read Access to Tenants Table
-- This allows subdomain-based tenant detection in middleware
-- Only active tenants are readable by anonymous users

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for active tenants" ON public.tenants;

-- Create policy to allow anonymous reads of active tenants
-- This is safe because:
-- 1. Only active tenants are exposed
-- 2. Only id, name, slug, status fields are typically selected
-- 3. This is required for subdomain routing before authentication
CREATE POLICY "Enable read access for active tenants"
ON public.tenants
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Ensure RLS is enabled on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Verify the policy
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'tenants';
