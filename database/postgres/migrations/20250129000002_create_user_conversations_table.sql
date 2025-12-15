-- Create user_conversations table
-- Replaces localStorage usage for conversations in ask-expert pages

CREATE TABLE IF NOT EXISTS user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  mode TEXT, -- e.g., 'mode_1_interactive_manual', 'mode_2_automatic', etc.
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user ON user_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON user_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON user_conversations(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON user_conversations(user_id, is_pinned) WHERE is_pinned = true;

-- Row Level Security (RLS)
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view their own conversations"
  ON user_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own conversations
CREATE POLICY "Users can create their own conversations"
  ON user_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON user_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
  ON user_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_conversations_updated_at
  BEFORE UPDATE ON user_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Comments
COMMENT ON TABLE user_conversations IS 'Stores user conversations for Ask Expert feature, replaces localStorage';
COMMENT ON COLUMN user_conversations.messages IS 'JSON array of messages with role (user/assistant/system) and content';
COMMENT ON COLUMN user_conversations.mode IS 'Mode used for this conversation (mode_1, mode_2, mode_3, etc.)';

