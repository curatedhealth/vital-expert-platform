-- Long-Term Memory Tables Migration
-- Enables persistent user context, preferences, and personalization across all sessions

-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- User Facts Table
-- Stores semantic facts about users (preferences, context, history, goals, constraints)
CREATE TABLE IF NOT EXISTS user_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('preference', 'context', 'history', 'goal', 'constraint')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('explicit', 'inferred')),
  confidence DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  UNIQUE(user_id, fact)
);

-- User Long-Term Memory Vector Store
-- Stores embeddings of user facts for semantic search
CREATE TABLE IF NOT EXISTS user_long_term_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat Memory Vectors Table
-- Stores conversation history as vectors for semantic memory retrieval
CREATE TABLE IF NOT EXISTS chat_memory_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation Entities Table
-- Tracks entities (patients, devices, trials) mentioned across conversations
CREATE TABLE IF NOT EXISTS conversation_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  first_mentioned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_mentioned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mention_count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  UNIQUE(session_id, value)
);

-- User Projects Table
-- Tracks devices, trials, submissions, and research projects user is working on
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('device', 'trial', 'submission', 'research')),
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- User Preferences Table
-- Stores user-specific preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- User Goals Table
-- Tracks user objectives and milestones
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  milestones TEXT[],
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_facts_user_id ON user_facts(user_id);
CREATE INDEX idx_user_facts_category ON user_facts(category);
CREATE INDEX idx_user_facts_confidence ON user_facts(confidence);
CREATE INDEX idx_user_facts_last_accessed ON user_facts(last_accessed);

CREATE INDEX idx_user_long_term_memory_user_id ON user_long_term_memory(user_id);
CREATE INDEX idx_user_long_term_memory_embedding ON user_long_term_memory USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_chat_memory_vectors_session_id ON chat_memory_vectors(session_id);
CREATE INDEX idx_chat_memory_vectors_user_id ON chat_memory_vectors(user_id);
CREATE INDEX idx_chat_memory_vectors_embedding ON chat_memory_vectors USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_conversation_entities_session_id ON conversation_entities(session_id);
CREATE INDEX idx_conversation_entities_user_id ON conversation_entities(user_id);
CREATE INDEX idx_conversation_entities_type ON conversation_entities(type);

CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_status ON user_projects(status);
CREATE INDEX idx_user_projects_last_accessed ON user_projects(last_accessed);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);

-- Create vector similarity search functions

-- Match user memory function
CREATE OR REPLACE FUNCTION match_user_memory(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    user_long_term_memory.id,
    user_long_term_memory.content,
    user_long_term_memory.metadata,
    1 - (user_long_term_memory.embedding <=> query_embedding) AS similarity
  FROM user_long_term_memory
  WHERE user_long_term_memory.user_id = match_user_id
    AND 1 - (user_long_term_memory.embedding <=> query_embedding) > match_threshold
  ORDER BY user_long_term_memory.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Match chat memory function
CREATE OR REPLACE FUNCTION match_chat_memory(
  query_embedding vector(1536),
  match_session_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_memory_vectors.id,
    chat_memory_vectors.content,
    chat_memory_vectors.metadata,
    1 - (chat_memory_vectors.embedding <=> query_embedding) AS similarity
  FROM chat_memory_vectors
  WHERE chat_memory_vectors.session_id = match_session_id
    AND 1 - (chat_memory_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY chat_memory_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE user_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_long_term_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_memory_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- User Facts
CREATE POLICY "user_facts_select_policy" ON user_facts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_facts_insert_policy" ON user_facts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_facts_update_policy" ON user_facts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_facts_delete_policy" ON user_facts
  FOR DELETE USING (user_id = auth.uid());

-- User Long-Term Memory
CREATE POLICY "user_long_term_memory_select_policy" ON user_long_term_memory
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_long_term_memory_insert_policy" ON user_long_term_memory
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_long_term_memory_delete_policy" ON user_long_term_memory
  FOR DELETE USING (user_id = auth.uid());

-- Chat Memory Vectors
CREATE POLICY "chat_memory_vectors_select_policy" ON chat_memory_vectors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "chat_memory_vectors_insert_policy" ON chat_memory_vectors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_memory_vectors_delete_policy" ON chat_memory_vectors
  FOR DELETE USING (user_id = auth.uid());

-- Conversation Entities
CREATE POLICY "conversation_entities_select_policy" ON conversation_entities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "conversation_entities_insert_policy" ON conversation_entities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversation_entities_update_policy" ON conversation_entities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "conversation_entities_delete_policy" ON conversation_entities
  FOR DELETE USING (user_id = auth.uid());

-- User Projects
CREATE POLICY "user_projects_select_policy" ON user_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_projects_insert_policy" ON user_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_projects_update_policy" ON user_projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_projects_delete_policy" ON user_projects
  FOR DELETE USING (user_id = auth.uid());

-- User Preferences
CREATE POLICY "user_preferences_select_policy" ON user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_preferences_insert_policy" ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_preferences_update_policy" ON user_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_preferences_delete_policy" ON user_preferences
  FOR DELETE USING (user_id = auth.uid());

-- User Goals
CREATE POLICY "user_goals_select_policy" ON user_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_goals_insert_policy" ON user_goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_goals_update_policy" ON user_goals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_goals_delete_policy" ON user_goals
  FOR DELETE USING (user_id = auth.uid());

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON user_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_facts TO authenticated;
GRANT ALL ON user_long_term_memory TO authenticated;
GRANT ALL ON chat_memory_vectors TO authenticated;
GRANT ALL ON conversation_entities TO authenticated;
GRANT ALL ON user_projects TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON user_goals TO authenticated;

-- Comments
COMMENT ON TABLE user_facts IS 'Stores semantic facts about users for long-term personalization';
COMMENT ON TABLE user_long_term_memory IS 'Vector embeddings of user facts for semantic search';
COMMENT ON TABLE chat_memory_vectors IS 'Conversation history as vectors for semantic memory retrieval';
COMMENT ON TABLE conversation_entities IS 'Tracks entities mentioned across user conversations';
COMMENT ON TABLE user_projects IS 'User devices, trials, submissions, and research projects';
COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';
COMMENT ON TABLE user_goals IS 'User objectives and milestones';
