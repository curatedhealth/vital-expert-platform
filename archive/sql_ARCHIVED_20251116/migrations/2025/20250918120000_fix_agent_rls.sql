-- Fix agents table RLS policies to allow public access
-- Agents are global resources that should be accessible to all users

-- Enable RLS on agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all agents
CREATE POLICY "Public read access to agents" ON agents
  FOR SELECT USING (true);

-- Allow authenticated users to update agents (for editing functionality)
CREATE POLICY "Authenticated users can update agents" ON agents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role full access to agents" ON agents
  FOR ALL USING (auth.role() = 'service_role');

-- Grant anon role access to read agents
GRANT SELECT ON agents TO anon;
GRANT UPDATE ON agents TO authenticated;