-- Ask Expert Memory Tables Migration
-- Creates tables for advanced memory and long-term learning

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Memory Table
CREATE TABLE IF NOT EXISTS chat_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    memory_key VARCHAR(255) NOT NULL,
    memory_value TEXT NOT NULL,
    strategy VARCHAR(50) NOT NULL DEFAULT 'buffer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id, memory_key, strategy)
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    message_index INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id, message_index)
);

-- User Facts Table (for long-term memory)
CREATE TABLE IF NOT EXISTS user_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    fact TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('preference', 'context', 'history', 'goal', 'constraint')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    source VARCHAR(20) NOT NULL CHECK (source IN ('explicit', 'inferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Projects Table
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Long Term Memory Table
CREATE TABLE IF NOT EXISTS user_long_term_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    memory_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table (if not exists)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON chat_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_memory_strategy ON chat_memory(strategy);

CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_message_index ON chat_history(session_id, message_index);

CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON user_facts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facts_category ON user_facts(category);
CREATE INDEX IF NOT EXISTS idx_user_facts_confidence ON user_facts(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON user_projects(status);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_priority ON user_goals(priority);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_id ON chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chat_memory_updated_at BEFORE UPDATE ON chat_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_facts_updated_at BEFORE UPDATE ON user_facts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON user_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_long_term_memory_updated_at BEFORE UPDATE ON user_long_term_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO user_facts (user_id, fact, category, confidence, source) VALUES
('test-user-1', 'User prefers detailed explanations with examples', 'preference', 0.9, 'inferred'),
('test-user-1', 'User is working on a medical device project', 'context', 0.8, 'explicit'),
('test-user-1', 'User has experience with FDA regulations', 'history', 0.7, 'inferred')
ON CONFLICT DO NOTHING;

INSERT INTO user_projects (user_id, name, description, status, progress) VALUES
('test-user-1', 'Digital Therapeutic for Anxiety', 'Developing a prescription digital therapeutic for anxiety management', 'active', 45),
('test-user-1', 'FDA 510k Submission', 'Preparing 510k submission for medical device', 'active', 75)
ON CONFLICT DO NOTHING;

INSERT INTO user_goals (user_id, description, status, priority, deadline) VALUES
('test-user-1', 'Complete FDA submission by Q2 2025', 'active', 'high', '2025-06-30'),
('test-user-1', 'Launch pilot study for digital therapeutic', 'active', 'medium', '2025-03-31')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON TABLE chat_memory IS 'Stores session-based memory for different strategies';
COMMENT ON TABLE chat_history IS 'Stores chat message history for sessions';
COMMENT ON TABLE user_facts IS 'Stores extracted facts about users for personalization';
COMMENT ON TABLE user_projects IS 'Tracks user projects and their progress';
COMMENT ON TABLE user_goals IS 'Tracks user goals and objectives';
COMMENT ON TABLE user_long_term_memory IS 'Stores long-term memory data for users';
COMMENT ON TABLE chat_messages IS 'Stores chat messages for persistence and analytics';
