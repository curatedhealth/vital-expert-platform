-- ============================================
-- Migration: Fix User Agents Table (Idempotent)
-- ============================================
-- This migration safely creates the user_agents table and policies
-- even if some parts already exist

-- Drop existing policies if they exist (to recreate them properly)
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can view their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can insert their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can update their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can delete their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Service role has full access" ON user_agents;
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist yet, that's fine
        NULL;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    custom_name TEXT,
    custom_description TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a user can't add the same agent twice
    UNIQUE(user_id, agent_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_favorite ON user_agents(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_agents_last_used ON user_agents(user_id, last_used_at DESC);

-- Enable RLS
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create policies (now that we've dropped the old ones)
CREATE POLICY "Users can view their own agents"
    ON user_agents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
    ON user_agents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
    ON user_agents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
    ON user_agents
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
    ON user_agents
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_user_agents_updated_at ON user_agents;

CREATE TRIGGER update_user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ user_agents table and policies configured successfully!';
END $$;



