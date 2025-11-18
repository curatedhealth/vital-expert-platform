-- Enable Public Read Access to Agents Table
-- This allows the /api/agents-crud endpoint to fetch agents
-- Required for agents page to load

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for all agents" ON public.agents;

-- Create policy to allow anonymous and authenticated users to read all agents
-- This is safe because agents are public resources that all tenants can access
CREATE POLICY "Enable read access for all agents"
ON public.agents
FOR SELECT
TO anon, authenticated
USING (true);  -- Allow reading all agents

-- Ensure RLS is enabled on agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

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
WHERE tablename = 'agents';
