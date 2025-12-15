-- Create user_agents table for managing user-agent relationships
-- This table tracks which agents a user has added to their chat

CREATE TABLE IF NOT EXISTS user_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  is_user_copy BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only have one relationship per agent
  UNIQUE(user_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_added_at ON user_agents(added_at DESC);

-- Enable Row Level Security
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own agent relationships" ON user_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent relationships" ON user_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" ON user_agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" ON user_agents
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_agents_updated_at
  BEFORE UPDATE ON user_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_agents_updated_at();
