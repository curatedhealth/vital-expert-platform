-- ============================================
-- Script: Check and Create User Agents Table
-- ============================================
-- Run this to diagnose and fix the user_agents table issue

-- Step 1: Check if the table exists
DO $$ 
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_agents'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_agents table EXISTS';
    ELSE
        RAISE NOTICE '❌ user_agents table DOES NOT EXIST - will create it';
    END IF;
END $$;

-- Step 2: Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_added_at ON user_agents(added_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can insert their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can update their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can delete their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Service role has full access" ON user_agents;
    DROP POLICY IF EXISTS "Users can view their own agent relationships" ON user_agents;
    DROP POLICY IF EXISTS "Users can insert their own agent relationships" ON user_agents;
    DROP POLICY IF EXISTS "Users can update their own agent relationships" ON user_agents;
    DROP POLICY IF EXISTS "Users can delete their own agent relationships" ON user_agents;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'No policies to drop (table did not exist)';
END $$;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view their own agent relationships" ON user_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent relationships" ON user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" ON user_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" ON user_agents
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create service role policy for API access
CREATE POLICY "Service role has full access to user_agents" ON user_agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS user_agents_updated_at ON user_agents;
CREATE TRIGGER user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_agents_updated_at();

-- Step 10: Verify the setup
DO $$ 
DECLARE
    policy_count integer;
    index_count integer;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_agents';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'user_agents';
    
    RAISE NOTICE '✅ Setup complete:';
    RAISE NOTICE '   - Policies: %', policy_count;
    RAISE NOTICE '   - Indexes: %', index_count;
END $$;

-- List the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_agents'
ORDER BY ordinal_position;












