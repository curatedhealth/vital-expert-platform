-- Add User Agent Ownership Support
-- Enables users to have personal copies of agents
-- Generated: 2025-01-19

-- Add user ownership columns to agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_user_copy BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS copied_at TIMESTAMP DEFAULT NOW();

-- Create index for efficient user agent queries
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_copy ON agents(is_user_copy);
CREATE INDEX IF NOT EXISTS idx_agents_original_id ON agents(original_agent_id);

-- Note: RLS policies will be added later once we confirm the table structure
-- For now, we'll rely on application-level security

-- Update existing agents to be admin agents (not user copies)
UPDATE agents
SET is_user_copy = FALSE, user_id = NULL
WHERE is_user_copy IS NULL OR user_id IS NOT NULL;