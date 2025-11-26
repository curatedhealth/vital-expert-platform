-- ============================================================================
-- SAFE MIGRATION: Upgrade user_agents to Gold Standard
-- ============================================================================
-- This script safely upgrades an existing user_agents table or creates a new one
-- Handles all edge cases and existing data

-- Step 1: Create table if it doesn't exist (minimal version)
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- Step 2: Add columns safely (only if they don't exist)
DO $$ 
BEGIN
    -- Core relationships
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='original_agent_id') THEN
        ALTER TABLE user_agents ADD COLUMN original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_user_copy') THEN
        ALTER TABLE user_agents ADD COLUMN is_user_copy BOOLEAN DEFAULT FALSE;
    END IF;

    -- User customization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_name') THEN
        ALTER TABLE user_agents ADD COLUMN custom_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_description') THEN
        ALTER TABLE user_agents ADD COLUMN custom_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_avatar') THEN
        ALTER TABLE user_agents ADD COLUMN custom_avatar TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_color') THEN
        ALTER TABLE user_agents ADD COLUMN custom_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_system_prompt') THEN
        ALTER TABLE user_agents ADD COLUMN custom_system_prompt TEXT;
    END IF;

    -- Organization & favorites
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_favorite') THEN
        ALTER TABLE user_agents ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_pinned') THEN
        ALTER TABLE user_agents ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='folder') THEN
        ALTER TABLE user_agents ADD COLUMN folder TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='tags') THEN
        ALTER TABLE user_agents ADD COLUMN tags TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='sort_order') THEN
        ALTER TABLE user_agents ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;

    -- Usage tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='added_at') THEN
        ALTER TABLE user_agents ADD COLUMN added_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_used_at') THEN
        ALTER TABLE user_agents ADD COLUMN last_used_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='first_used_at') THEN
        ALTER TABLE user_agents ADD COLUMN first_used_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='usage_count') THEN
        ALTER TABLE user_agents ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='message_count') THEN
        ALTER TABLE user_agents ADD COLUMN message_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='success_count') THEN
        ALTER TABLE user_agents ADD COLUMN success_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='error_count') THEN
        ALTER TABLE user_agents ADD COLUMN error_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='conversation_count') THEN
        ALTER TABLE user_agents ADD COLUMN conversation_count INTEGER DEFAULT 0;
    END IF;

    -- Performance & quality
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='avg_response_time_ms') THEN
        ALTER TABLE user_agents ADD COLUMN avg_response_time_ms INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='total_tokens_used') THEN
        ALTER TABLE user_agents ADD COLUMN total_tokens_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='user_rating') THEN
        ALTER TABLE user_agents ADD COLUMN user_rating DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='user_feedback') THEN
        ALTER TABLE user_agents ADD COLUMN user_feedback TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='quality_score') THEN
        ALTER TABLE user_agents ADD COLUMN quality_score DECIMAL(3,2);
    END IF;

    -- Configuration & settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='settings') THEN
        ALTER TABLE user_agents ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='preferences') THEN
        ALTER TABLE user_agents ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='notifications_enabled') THEN
        ALTER TABLE user_agents ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='auto_suggestions_enabled') THEN
        ALTER TABLE user_agents ADD COLUMN auto_suggestions_enabled BOOLEAN DEFAULT TRUE;
    END IF;

    -- State management
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_active') THEN
        ALTER TABLE user_agents ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_enabled') THEN
        ALTER TABLE user_agents ADD COLUMN is_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_visible') THEN
        ALTER TABLE user_agents ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='status') THEN
        ALTER TABLE user_agents ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Context & memory
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_conversation_id') THEN
        ALTER TABLE user_agents ADD COLUMN last_conversation_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='shared_context') THEN
        ALTER TABLE user_agents ADD COLUMN shared_context JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='memory') THEN
        ALTER TABLE user_agents ADD COLUMN memory JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Collaboration & sharing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_shared') THEN
        ALTER TABLE user_agents ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='shared_with') THEN
        ALTER TABLE user_agents ADD COLUMN shared_with UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='share_settings') THEN
        ALTER TABLE user_agents ADD COLUMN share_settings JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='team_id') THEN
        ALTER TABLE user_agents ADD COLUMN team_id UUID;
    END IF;

    -- Billing & limits
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='usage_quota') THEN
        ALTER TABLE user_agents ADD COLUMN usage_quota INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='usage_this_month') THEN
        ALTER TABLE user_agents ADD COLUMN usage_this_month INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_quota_reset') THEN
        ALTER TABLE user_agents ADD COLUMN last_quota_reset TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='cost_this_month') THEN
        ALTER TABLE user_agents ADD COLUMN cost_this_month DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Metadata & audit
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='metadata') THEN
        ALTER TABLE user_agents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='notes') THEN
        ALTER TABLE user_agents ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='source') THEN
        ALTER TABLE user_agents ADD COLUMN source TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='source_details') THEN
        ALTER TABLE user_agents ADD COLUMN source_details JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Timestamps (soft delete)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='archived_at') THEN
        ALTER TABLE user_agents ADD COLUMN archived_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='deleted_at') THEN
        ALTER TABLE user_agents ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    RAISE NOTICE '✅ All columns added successfully';
END $$;

-- Step 3: Add constraints
DO $$
BEGIN
    -- Add rating constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_agents_valid_rating') THEN
        ALTER TABLE user_agents ADD CONSTRAINT user_agents_valid_rating 
            CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 5));
    END IF;
    
    -- Add quality constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_agents_valid_quality') THEN
        ALTER TABLE user_agents ADD CONSTRAINT user_agents_valid_quality 
            CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5));
    END IF;
    
    -- Add status constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_agents_valid_status') THEN
        ALTER TABLE user_agents ADD CONSTRAINT user_agents_valid_status 
            CHECK (status IN ('active', 'paused', 'archived', 'disabled'));
    END IF;
    
    RAISE NOTICE '✅ All constraints added successfully';
END $$;

-- Step 4: Create indexes (safe - IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id) WHERE original_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_favorites ON user_agents(user_id, is_favorite, sort_order) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_agents_pinned ON user_agents(user_id, is_pinned, sort_order) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_agents_active ON user_agents(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_agents_last_used ON user_agents(user_id, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_agents_usage_count ON user_agents(user_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_agents_added_at ON user_agents(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_agents_folder ON user_agents(user_id, folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_tags ON user_agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_agents_rating ON user_agents(user_id, user_rating DESC) WHERE user_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_quality ON user_agents(user_id, quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_team ON user_agents(team_id, user_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_shared ON user_agents(user_id, is_shared) WHERE is_shared = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_agents_settings ON user_agents USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_user_agents_metadata ON user_agents USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_user_agents_deleted ON user_agents(deleted_at) WHERE deleted_at IS NOT NULL;

-- Step 5: Enable RLS
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop old policies (safe)
DROP POLICY IF EXISTS "Users can view their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON user_agents;
DROP POLICY IF EXISTS "Service role has full access" ON user_agents;
DROP POLICY IF EXISTS "Users can view their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Service role has full access to user_agents" ON user_agents;
DROP POLICY IF EXISTS "Team members can view shared agents" ON user_agents;

-- Step 7: Create policies
CREATE POLICY "Users can view their own agent relationships" ON user_agents
    FOR SELECT USING (auth.uid() = user_id AND (deleted_at IS NULL OR deleted_at IS NOT NULL));

CREATE POLICY "Users can insert their own agent relationships" ON user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" ON user_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" ON user_agents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Team members can view shared agents" ON user_agents
    FOR SELECT USING (is_shared = TRUE AND auth.uid() = ANY(shared_with) AND (deleted_at IS NULL OR deleted_at IS NOT NULL));

CREATE POLICY "Service role has full access to user_agents" ON user_agents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 8: Create or replace functions
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS user_agents_updated_at ON user_agents;
CREATE TRIGGER user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_agents_updated_at();

-- Step 10: Verify and report
DO $$ 
DECLARE
    column_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'user_agents' AND table_schema = 'public';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'user_agents';
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_agents';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Table: user_agents';
    RAISE NOTICE 'Columns: %', column_count;
    RAISE NOTICE 'Indexes: %', index_count;
    RAISE NOTICE 'Policies: %', policy_count;
    RAISE NOTICE '========================================';
END $$;

-- Step 11: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_agents'
ORDER BY ordinal_position;

