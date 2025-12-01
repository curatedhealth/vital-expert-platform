-- ============================================
-- Migration: Fix User Agents Table (Smart Detection)
-- ============================================
-- This migration checks existing structure and only adds what's needed

-- First, let's see what we have
DO $$ 
DECLARE
    table_exists boolean;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_agents'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_agents table already exists - checking structure...';
    ELSE
        RAISE NOTICE '📋 Creating user_agents table...';
    END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can insert their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can update their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Users can delete their own agents" ON user_agents;
    DROP POLICY IF EXISTS "Service role has full access" ON user_agents;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a user can't add the same agent twice
    UNIQUE(user_id, agent_id)
);

-- Add columns if they don't exist (safe for existing tables)
DO $$ 
BEGIN
    -- Add is_favorite if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'is_favorite'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN is_favorite BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added column: is_favorite';
    END IF;
    
    -- Add custom_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'custom_name'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN custom_name TEXT;
        RAISE NOTICE '✅ Added column: custom_name';
    END IF;
    
    -- Add custom_description if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'custom_description'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN custom_description TEXT;
        RAISE NOTICE '✅ Added column: custom_description';
    END IF;
    
    -- Add usage_count if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'usage_count'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added column: usage_count';
    END IF;
    
    -- Add last_used_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'last_used_at'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN last_used_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added column: last_used_at';
    END IF;
    
    -- Add settings if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'settings'
    ) THEN
        ALTER TABLE user_agents ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE '✅ Added column: settings';
    END IF;
END $$;

-- Create indexes if they don't exist (only after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);

-- Create conditional indexes only if columns exist
DO $$
BEGIN
    -- Create favorite index if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'is_favorite'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_agents_favorite 
        ON user_agents(user_id, is_favorite) WHERE is_favorite = true;
        RAISE NOTICE '✅ Created index: idx_user_agents_favorite';
    END IF;
    
    -- Create last_used index if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_agents' AND column_name = 'last_used_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_agents_last_used 
        ON user_agents(user_id, last_used_at DESC);
        RAISE NOTICE '✅ Created index: idx_user_agents_last_used';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Final success message
DO $$ 
BEGIN
    RAISE NOTICE '✅✅✅ user_agents table fully configured with all columns, indexes, and policies!';
END $$;







