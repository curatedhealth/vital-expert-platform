-- Create user_agents table to track which agents users have added
-- This replaces localStorage approach with proper database persistence

CREATE TABLE IF NOT EXISTS user_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  original_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE, -- For user copies
  is_user_copy BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique user-agent combinations
  UNIQUE(user_id, agent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own agent relationships" ON user_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add agents to their list" ON user_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove agents from their list" ON user_agents
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_agents_updated_at
  BEFORE UPDATE ON user_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_agents_updated_at();

-- Add comment
COMMENT ON TABLE user_agents IS 'Tracks which agents each user has added to their personal list';
