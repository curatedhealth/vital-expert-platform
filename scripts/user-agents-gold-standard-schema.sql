-- ============================================================================
-- GOLD STANDARD: user_agents Table Schema
-- ============================================================================
-- Complete schema for tracking user-agent relationships with all best practices

-- Drop existing table if recreating (CAREFUL - this deletes data!)
-- DROP TABLE IF EXISTS user_agents CASCADE;

CREATE TABLE IF NOT EXISTS user_agents (
    -- ========================================================================
    -- PRIMARY KEYS & RELATIONSHIPS
    -- ========================================================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- ========================================================================
    -- USER CUSTOMIZATION
    -- ========================================================================
    custom_name TEXT,                           -- User's custom name for the agent
    custom_description TEXT,                    -- User's custom description
    custom_avatar TEXT,                         -- Custom avatar URL/emoji
    custom_color TEXT,                          -- Custom color preference
    custom_system_prompt TEXT,                  -- User's custom system prompt
    is_user_copy BOOLEAN DEFAULT FALSE,         -- Whether this is a user-created copy
    
    -- ========================================================================
    -- ORGANIZATION & FAVORITES
    -- ========================================================================
    is_favorite BOOLEAN DEFAULT FALSE,          -- Star/favorite status
    is_pinned BOOLEAN DEFAULT FALSE,            -- Pin to top of list
    folder TEXT,                                -- Folder/category for organization
    tags TEXT[],                                -- User-defined tags
    sort_order INTEGER DEFAULT 0,               -- Custom sort order
    
    -- ========================================================================
    -- USAGE TRACKING
    -- ========================================================================
    added_at TIMESTAMPTZ DEFAULT NOW(),         -- When user added the agent
    last_used_at TIMESTAMPTZ,                   -- Last time agent was used
    first_used_at TIMESTAMPTZ,                  -- First time agent was used
    usage_count INTEGER DEFAULT 0,              -- Total number of uses
    message_count INTEGER DEFAULT 0,            -- Total messages exchanged
    success_count INTEGER DEFAULT 0,            -- Successful interactions
    error_count INTEGER DEFAULT 0,              -- Failed interactions
    
    -- ========================================================================
    -- PERFORMANCE & QUALITY
    -- ========================================================================
    avg_response_time_ms INTEGER,               -- Average response time
    total_tokens_used INTEGER DEFAULT 0,        -- Total tokens consumed
    user_rating DECIMAL(3,2),                   -- User's rating (0.00 to 5.00)
    user_feedback TEXT,                         -- User's feedback text
    quality_score DECIMAL(3,2),                 -- Calculated quality score
    
    -- ========================================================================
    -- CONFIGURATION & SETTINGS
    -- ========================================================================
    settings JSONB DEFAULT '{}'::jsonb,         -- User-specific settings
    preferences JSONB DEFAULT '{}'::jsonb,      -- User preferences
    notifications_enabled BOOLEAN DEFAULT TRUE,  -- Enable notifications
    auto_suggestions_enabled BOOLEAN DEFAULT TRUE, -- Enable auto-suggestions
    
    -- ========================================================================
    -- STATE MANAGEMENT
    -- ========================================================================
    is_active BOOLEAN DEFAULT TRUE,             -- Active/archived status
    is_enabled BOOLEAN DEFAULT TRUE,            -- Enabled/disabled
    is_visible BOOLEAN DEFAULT TRUE,            -- Visible in UI
    status TEXT DEFAULT 'active',               -- Status: active, paused, archived
    
    -- ========================================================================
    -- CONTEXT & HISTORY
    -- ========================================================================
    conversation_count INTEGER DEFAULT 0,       -- Number of conversations
    last_conversation_id UUID,                  -- Reference to last conversation
    shared_context JSONB DEFAULT '{}'::jsonb,   -- Shared context data
    memory JSONB DEFAULT '{}'::jsonb,           -- Agent memory/learning
    
    -- ========================================================================
    -- COLLABORATION & SHARING
    -- ========================================================================
    is_shared BOOLEAN DEFAULT FALSE,            -- Whether shared with others
    shared_with UUID[],                         -- Array of user IDs shared with
    share_settings JSONB DEFAULT '{}'::jsonb,   -- Sharing configuration
    team_id UUID,                               -- Team/organization ID
    
    -- ========================================================================
    -- BILLING & LIMITS
    -- ========================================================================
    usage_quota INTEGER,                        -- Monthly usage quota
    usage_this_month INTEGER DEFAULT 0,         -- Current month usage
    last_quota_reset TIMESTAMPTZ,               -- Last quota reset date
    cost_this_month DECIMAL(10,2) DEFAULT 0,    -- Cost for current month
    
    -- ========================================================================
    -- METADATA & AUDIT
    -- ========================================================================
    metadata JSONB DEFAULT '{}'::jsonb,         -- Additional metadata
    notes TEXT,                                 -- User's private notes
    source TEXT,                                -- How agent was added (store, custom, import)
    source_details JSONB DEFAULT '{}'::jsonb,   -- Source-specific details
    
    -- ========================================================================
    -- TIMESTAMPS
    -- ========================================================================
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,                    -- When archived (soft delete)
    deleted_at TIMESTAMPTZ,                     -- Soft delete timestamp
    
    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================
    CONSTRAINT user_agents_unique_relationship 
        UNIQUE(user_id, agent_id),
    CONSTRAINT user_agents_valid_rating 
        CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 5)),
    CONSTRAINT user_agents_valid_quality 
        CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5)),
    CONSTRAINT user_agents_valid_status 
        CHECK (status IN ('active', 'paused', 'archived', 'disabled'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core relationships
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id 
    ON user_agents(user_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id 
    ON user_agents(agent_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id 
    ON user_agents(original_agent_id) 
    WHERE original_agent_id IS NOT NULL;

-- User experience
CREATE INDEX IF NOT EXISTS idx_user_agents_favorites 
    ON user_agents(user_id, is_favorite, sort_order) 
    WHERE is_favorite = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_pinned 
    ON user_agents(user_id, is_pinned, sort_order) 
    WHERE is_pinned = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_active 
    ON user_agents(user_id, is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;

-- Usage tracking
CREATE INDEX IF NOT EXISTS idx_user_agents_last_used 
    ON user_agents(user_id, last_used_at DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_usage_count 
    ON user_agents(user_id, usage_count DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_added_at 
    ON user_agents(user_id, added_at DESC) 
    WHERE deleted_at IS NULL;

-- Organization
CREATE INDEX IF NOT EXISTS idx_user_agents_folder 
    ON user_agents(user_id, folder) 
    WHERE folder IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_tags 
    ON user_agents USING GIN(tags) 
    WHERE deleted_at IS NULL;

-- Quality & ratings
CREATE INDEX IF NOT EXISTS idx_user_agents_rating 
    ON user_agents(user_id, user_rating DESC) 
    WHERE user_rating IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_quality 
    ON user_agents(user_id, quality_score DESC) 
    WHERE quality_score IS NOT NULL AND deleted_at IS NULL;

-- Team collaboration
CREATE INDEX IF NOT EXISTS idx_user_agents_team 
    ON user_agents(team_id, user_id) 
    WHERE team_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_agents_shared 
    ON user_agents(user_id, is_shared) 
    WHERE is_shared = TRUE AND deleted_at IS NULL;

-- JSONB indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_agents_settings 
    ON user_agents USING GIN(settings);

CREATE INDEX IF NOT EXISTS idx_user_agents_metadata 
    ON user_agents USING GIN(metadata);

-- Soft delete
CREATE INDEX IF NOT EXISTS idx_user_agents_deleted 
    ON user_agents(deleted_at) 
    WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Service role has full access to user_agents" ON user_agents;
DROP POLICY IF EXISTS "Team members can view shared agents" ON user_agents;

-- User access policies
CREATE POLICY "Users can view their own agent relationships" 
    ON user_agents FOR SELECT 
    USING (
        auth.uid() = user_id 
        AND deleted_at IS NULL
    );

CREATE POLICY "Users can insert their own agent relationships" 
    ON user_agents FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own agent relationships" 
    ON user_agents FOR UPDATE 
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own agent relationships" 
    ON user_agents FOR DELETE 
    USING (
        auth.uid() = user_id
    );

-- Team collaboration policy
CREATE POLICY "Team members can view shared agents" 
    ON user_agents FOR SELECT 
    USING (
        is_shared = TRUE 
        AND auth.uid() = ANY(shared_with)
        AND deleted_at IS NULL
    );

-- Service role (for API access)
CREATE POLICY "Service role has full access to user_agents" 
    ON user_agents FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS user_agents_updated_at ON user_agents;
CREATE TRIGGER user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_agents_updated_at();

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION increment_agent_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and last used timestamp
    NEW.usage_count = COALESCE(OLD.usage_count, 0) + 1;
    NEW.last_used_at = NOW();
    
    -- Set first_used_at if not set
    IF OLD.first_used_at IS NULL THEN
        NEW.first_used_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_user_agent()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of deleting, set deleted_at timestamp
    UPDATE user_agents 
    SET deleted_at = NOW(), 
        is_active = FALSE 
    WHERE id = OLD.id;
    RETURN NULL; -- Prevent actual delete
END;
$$ LANGUAGE plpgsql;

-- Trigger for soft delete
DROP TRIGGER IF EXISTS user_agents_soft_delete ON user_agents;
CREATE TRIGGER user_agents_soft_delete
    BEFORE DELETE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_user_agent();

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_agent_quality_score(agent_record user_agents)
RETURNS DECIMAL AS $$
DECLARE
    quality DECIMAL;
    success_rate DECIMAL;
BEGIN
    -- Calculate success rate
    IF agent_record.usage_count > 0 THEN
        success_rate = agent_record.success_count::DECIMAL / agent_record.usage_count;
    ELSE
        success_rate = 0;
    END IF;
    
    -- Calculate quality score (weighted average)
    quality = (
        COALESCE(agent_record.user_rating, 3.0) * 0.4 +  -- 40% user rating
        (success_rate * 5.0) * 0.3 +                      -- 30% success rate
        (CASE 
            WHEN agent_record.usage_count > 50 THEN 5.0
            WHEN agent_record.usage_count > 20 THEN 4.0
            WHEN agent_record.usage_count > 10 THEN 3.0
            ELSE 2.0
        END) * 0.3                                         -- 30% usage frequency
    );
    
    RETURN ROUND(quality, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for active user agents with calculated metrics
CREATE OR REPLACE VIEW user_agents_active AS
SELECT 
    ua.*,
    a.name as agent_name,
    a.display_name as agent_display_name,
    a.avatar_url as agent_avatar,
    a.tier as agent_tier,
    calculate_agent_quality_score(ua.*) as calculated_quality_score,
    CASE 
        WHEN ua.usage_count = 0 THEN 'never_used'
        WHEN ua.last_used_at > NOW() - INTERVAL '24 hours' THEN 'active'
        WHEN ua.last_used_at > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN ua.last_used_at > NOW() - INTERVAL '30 days' THEN 'occasional'
        ELSE 'inactive'
    END as usage_status
FROM user_agents ua
LEFT JOIN agents a ON ua.agent_id = a.id
WHERE ua.deleted_at IS NULL 
    AND ua.is_active = TRUE;

-- View for user's favorite agents
CREATE OR REPLACE VIEW user_agents_favorites AS
SELECT * FROM user_agents_active
WHERE is_favorite = TRUE
ORDER BY sort_order, last_used_at DESC;

-- View for user's most used agents
CREATE OR REPLACE VIEW user_agents_popular AS
SELECT * FROM user_agents_active
WHERE usage_count > 0
ORDER BY usage_count DESC, last_used_at DESC;

-- ============================================================================
-- HELPER FUNCTIONS FOR API
-- ============================================================================

-- Function to add agent to user's list
CREATE OR REPLACE FUNCTION add_user_agent(
    p_user_id UUID,
    p_agent_id UUID,
    p_original_agent_id UUID DEFAULT NULL,
    p_is_user_copy BOOLEAN DEFAULT FALSE,
    p_source TEXT DEFAULT 'manual'
)
RETURNS user_agents AS $$
DECLARE
    result user_agents;
BEGIN
    INSERT INTO user_agents (
        user_id,
        agent_id,
        original_agent_id,
        is_user_copy,
        source,
        added_at
    ) VALUES (
        p_user_id,
        p_agent_id,
        p_original_agent_id,
        p_is_user_copy,
        p_source,
        NOW()
    )
    ON CONFLICT (user_id, agent_id) 
    DO UPDATE SET
        is_active = TRUE,
        deleted_at = NULL,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track agent usage
CREATE OR REPLACE FUNCTION track_agent_usage(
    p_user_id UUID,
    p_agent_id UUID,
    p_success BOOLEAN DEFAULT TRUE,
    p_tokens_used INTEGER DEFAULT 0,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_agents SET
        usage_count = usage_count + 1,
        last_used_at = NOW(),
        first_used_at = COALESCE(first_used_at, NOW()),
        success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
        error_count = error_count + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
        total_tokens_used = total_tokens_used + p_tokens_used,
        avg_response_time_ms = CASE 
            WHEN p_response_time_ms IS NOT NULL THEN
                COALESCE((avg_response_time_ms * usage_count + p_response_time_ms) / (usage_count + 1), p_response_time_ms)
            ELSE avg_response_time_ms
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id AND agent_id = p_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_agents IS 'Gold standard table for managing user-agent relationships with comprehensive tracking and features';
COMMENT ON COLUMN user_agents.custom_name IS 'User can rename the agent for personal use';
COMMENT ON COLUMN user_agents.is_favorite IS 'Quick access to favorite agents';
COMMENT ON COLUMN user_agents.usage_count IS 'Number of times user has interacted with this agent';
COMMENT ON COLUMN user_agents.quality_score IS 'Calculated quality score based on multiple factors';
COMMENT ON COLUMN user_agents.settings IS 'User-specific settings like temperature, max_tokens, etc.';
COMMENT ON COLUMN user_agents.memory IS 'Agent memory/learning data specific to this user';
COMMENT ON COLUMN user_agents.deleted_at IS 'Soft delete timestamp - allows data recovery';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify the setup
SELECT 
    'Table exists' as check_type,
    EXISTS(SELECT FROM pg_tables WHERE tablename = 'user_agents') as result
UNION ALL
SELECT 
    'RLS enabled',
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_agents')
UNION ALL
SELECT 
    'Policies count',
    COUNT(*)::text::boolean
FROM pg_policies WHERE tablename = 'user_agents'
UNION ALL
SELECT
    'Indexes count',
    COUNT(*)::text::boolean
FROM pg_indexes WHERE tablename = 'user_agents'
UNION ALL
SELECT
    'Views count',
    COUNT(*)::text::boolean
FROM pg_views WHERE viewname LIKE 'user_agents%';


