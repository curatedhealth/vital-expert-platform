-- Allow anon users to update agents temporarily for testing
-- This should be restricted in production

-- Drop existing update policy
DROP POLICY IF EXISTS "Authenticated users can update agents" ON agents;

-- Allow anon users to update agents
CREATE POLICY "Allow agent updates for testing" ON agents
  FOR UPDATE USING (true);

-- Grant update permission to anon role
GRANT UPDATE ON agents TO anon;