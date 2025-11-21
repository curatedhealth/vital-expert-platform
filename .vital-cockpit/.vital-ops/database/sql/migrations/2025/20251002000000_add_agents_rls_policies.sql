-- =====================================================================
-- Add Missing RLS Policies for Agents Table
-- Ensures agents are accessible via PostgREST API
-- =====================================================================

-- Enable Row Level Security (if not already enabled)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SERVICE ROLE POLICY
-- =====================================================================

-- Drop if exists (for idempotency)
DROP POLICY IF EXISTS "Service role has full access to agents" ON agents;

-- Service role needs full access for administrative operations
CREATE POLICY "Service role has full access to agents"
ON agents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================================
-- ANONYMOUS ROLE POLICY
-- =====================================================================

-- Drop if exists (for idempotency)
DROP POLICY IF EXISTS "Anonymous users can view public agents" ON agents;

-- Anonymous users can view public agents (for landing pages, etc.)
CREATE POLICY "Anonymous users can view public agents"
ON agents
FOR SELECT
TO anon
USING (is_public = true OR data_classification = 'public');

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON POLICY "Service role has full access to agents" ON agents IS
'Allows service role to perform all operations on agents table for administrative purposes';

COMMENT ON POLICY "Anonymous users can view public agents" ON agents IS
'Allows unauthenticated users to view agents marked as public or with public data classification';
