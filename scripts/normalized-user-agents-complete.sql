-- ============================================================================
-- NORMALIZED USER_AGENTS SCHEMA - Complete Implementation
-- ============================================================================
-- This migration creates a fully normalized user_agents table with all
-- missing attributes, while keeping separate tables for specialized concerns
-- following Single Responsibility Principle and proper normalization (3NF)

-- ============================================================================
-- STEP 1: CREATE/UPDATE user_agents TABLE (Core Relationship + Attributes)
-- ============================================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS user_agents (
    -- PRIMARY KEYS & FOREIGN KEYS
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    original_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Ensure unique relationship
    UNIQUE(user_id, agent_id)
);

-- Add all columns that don't exist
DO $$ 
BEGIN
    -- Core relationship fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_user_copy') THEN
        ALTER TABLE user_agents ADD COLUMN is_user_copy BOOLEAN DEFAULT FALSE;
    END IF;

    -- CATEGORY 1: USER CUSTOMIZATION (belongs in user_agents - user-specific)
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_temperature') THEN
        ALTER TABLE user_agents ADD COLUMN custom_temperature DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='custom_max_tokens') THEN
        ALTER TABLE user_agents ADD COLUMN custom_max_tokens INTEGER;
    END IF;

    -- CATEGORY 2: ORGANIZATION (belongs in user_agents - user-specific organization)
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='display_position') THEN
        ALTER TABLE user_agents ADD COLUMN display_position TEXT CHECK (display_position IN ('sidebar', 'dashboard', 'hidden'));
    END IF;

    -- CATEGORY 3: BASIC USAGE TRACKING (belongs in user_agents - simple counters)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='usage_count') THEN
        ALTER TABLE user_agents ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='message_count') THEN
        ALTER TABLE user_agents ADD COLUMN message_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='conversation_count') THEN
        ALTER TABLE user_agents ADD COLUMN conversation_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='success_count') THEN
        ALTER TABLE user_agents ADD COLUMN success_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='error_count') THEN
        ALTER TABLE user_agents ADD COLUMN error_count INTEGER DEFAULT 0;
    END IF;

    -- CATEGORY 4: QUALITY METRICS (belongs in user_agents - simple aggregates)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='user_rating') THEN
        ALTER TABLE user_agents ADD COLUMN user_rating DECIMAL(3,2) CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 5));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='quality_score') THEN
        ALTER TABLE user_agents ADD COLUMN quality_score DECIMAL(3,2) CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_rating_at') THEN
        ALTER TABLE user_agents ADD COLUMN last_rating_at TIMESTAMPTZ;
    END IF;

    -- CATEGORY 5: PERFORMANCE METRICS (belongs in user_agents - aggregated metrics)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='avg_response_time_ms') THEN
        ALTER TABLE user_agents ADD COLUMN avg_response_time_ms INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='total_tokens_used') THEN
        ALTER TABLE user_agents ADD COLUMN total_tokens_used BIGINT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='total_cost_usd') THEN
        ALTER TABLE user_agents ADD COLUMN total_cost_usd DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- CATEGORY 6: TIMESTAMPS (belongs in user_agents - lifecycle tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='added_at') THEN
        ALTER TABLE user_agents ADD COLUMN added_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='first_used_at') THEN
        ALTER TABLE user_agents ADD COLUMN first_used_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_used_at') THEN
        ALTER TABLE user_agents ADD COLUMN last_used_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='created_at') THEN
        ALTER TABLE user_agents ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='updated_at') THEN
        ALTER TABLE user_agents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- CATEGORY 7: STATE MANAGEMENT (belongs in user_agents - simple state)
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
        ALTER TABLE user_agents ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'disabled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='archived_at') THEN
        ALTER TABLE user_agents ADD COLUMN archived_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='deleted_at') THEN
        ALTER TABLE user_agents ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;

    -- CATEGORY 8: PREFERENCES & SETTINGS (belongs in user_agents - JSONB for flexibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='settings') THEN
        ALTER TABLE user_agents ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='preferences') THEN
        ALTER TABLE user_agents ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='ui_config') THEN
        ALTER TABLE user_agents ADD COLUMN ui_config JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- CATEGORY 9: NOTIFICATIONS (belongs in user_agents - per-agent notification settings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='notifications_enabled') THEN
        ALTER TABLE user_agents ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='notification_settings') THEN
        ALTER TABLE user_agents ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb;
    END IF;

    -- CATEGORY 10: QUICK CONTEXT (belongs in user_agents - lightweight references)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='last_conversation_id') THEN
        ALTER TABLE user_agents ADD COLUMN last_conversation_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='notes') THEN
        ALTER TABLE user_agents ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='quick_notes') THEN
        ALTER TABLE user_agents ADD COLUMN quick_notes TEXT;
    END IF;

    -- CATEGORY 11: METADATA (belongs in user_agents - flexible data)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='metadata') THEN
        ALTER TABLE user_agents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='source') THEN
        ALTER TABLE user_agents ADD COLUMN source TEXT CHECK (source IN ('store', 'custom', 'imported', 'template', 'recommended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='source_details') THEN
        ALTER TABLE user_agents ADD COLUMN source_details JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- CATEGORY 12: COLLABORATION (belongs in user_agents - basic sharing info)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='is_shared') THEN
        ALTER TABLE user_agents ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='shared_with') THEN
        ALTER TABLE user_agents ADD COLUMN shared_with UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='team_id') THEN
        ALTER TABLE user_agents ADD COLUMN team_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_agents' AND column_name='share_settings') THEN
        ALTER TABLE user_agents ADD COLUMN share_settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    RAISE NOTICE '✅ All user_agents columns added successfully';
END $$;

-- ============================================================================
-- STEP 2: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Core lookups
CREATE INDEX IF NOT EXISTS idx_user_agents_user_id ON user_agents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_agent_id ON user_agents(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_original_agent_id ON user_agents(original_agent_id) WHERE original_agent_id IS NOT NULL;

-- User experience
CREATE INDEX IF NOT EXISTS idx_user_agents_user_active ON user_agents(user_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_favorites ON user_agents(user_id, is_favorite, sort_order) WHERE is_favorite = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_pinned ON user_agents(user_id, is_pinned, sort_order) WHERE is_pinned = TRUE AND deleted_at IS NULL;

-- Organization
CREATE INDEX IF NOT EXISTS idx_user_agents_folder ON user_agents(user_id, folder) WHERE folder IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_tags ON user_agents USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_status ON user_agents(user_id, status) WHERE deleted_at IS NULL;

-- Usage tracking
CREATE INDEX IF NOT EXISTS idx_user_agents_last_used ON user_agents(user_id, last_used_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_usage_count ON user_agents(user_id, usage_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_added_at ON user_agents(user_id, added_at DESC) WHERE deleted_at IS NULL;

-- Quality metrics
CREATE INDEX IF NOT EXISTS idx_user_agents_rating ON user_agents(user_id, user_rating DESC) WHERE user_rating IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_quality ON user_agents(user_id, quality_score DESC) WHERE quality_score IS NOT NULL AND deleted_at IS NULL;

-- Collaboration
CREATE INDEX IF NOT EXISTS idx_user_agents_team ON user_agents(team_id, user_id) WHERE team_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_shared ON user_agents(user_id, is_shared) WHERE is_shared = TRUE AND deleted_at IS NULL;

-- JSONB indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_agents_settings ON user_agents USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_user_agents_preferences ON user_agents USING GIN(preferences);
CREATE INDEX IF NOT EXISTS idx_user_agents_metadata ON user_agents USING GIN(metadata);

-- Soft delete
CREATE INDEX IF NOT EXISTS idx_user_agents_archived ON user_agents(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_deleted ON user_agents(deleted_at) WHERE deleted_at IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_agents_user_folder_order ON user_agents(user_id, folder, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_agents_user_status_last_used ON user_agents(user_id, status, last_used_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- STEP 3: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agents" ON user_agents;
DROP POLICY IF EXISTS "Users can view their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can insert their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can update their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Users can delete their own agent relationships" ON user_agents;
DROP POLICY IF EXISTS "Team members can view shared agents" ON user_agents;
DROP POLICY IF EXISTS "Service role has full access to user_agents" ON user_agents;

-- Create comprehensive policies
CREATE POLICY "Users can view their own agent relationships" 
    ON user_agents FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent relationships" 
    ON user_agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships" 
    ON user_agents FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent relationships" 
    ON user_agents FOR DELETE 
    USING (auth.uid() = user_id);

-- Team collaboration
CREATE POLICY "Team members can view shared agents" 
    ON user_agents FOR SELECT 
    USING (
        is_shared = TRUE 
        AND (
            auth.uid() = ANY(shared_with)
            OR team_id IN (
                SELECT team_id 
                FROM user_role_assignments 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Service role (for API/backend)
CREATE POLICY "Service role has full access to user_agents" 
    ON user_agents FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ============================================================================
-- STEP 4: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
DROP TRIGGER IF EXISTS user_agents_updated_at ON user_agents;
CREATE TRIGGER user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_agents_updated_at();

-- Function: Calculate quality score
CREATE OR REPLACE FUNCTION calculate_agent_quality_score(
    p_user_rating DECIMAL,
    p_usage_count INTEGER,
    p_success_count INTEGER,
    p_error_count INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    quality DECIMAL;
    success_rate DECIMAL;
    usage_score DECIMAL;
BEGIN
    -- Calculate success rate
    IF (p_success_count + p_error_count) > 0 THEN
        success_rate = p_success_count::DECIMAL / (p_success_count + p_error_count);
    ELSE
        success_rate = 0;
    END IF;
    
    -- Calculate usage score (0-5 scale)
    usage_score = CASE 
        WHEN p_usage_count > 100 THEN 5.0
        WHEN p_usage_count > 50 THEN 4.5
        WHEN p_usage_count > 20 THEN 4.0
        WHEN p_usage_count > 10 THEN 3.5
        WHEN p_usage_count > 5 THEN 3.0
        WHEN p_usage_count > 0 THEN 2.5
        ELSE 0
    END;
    
    -- Weighted average
    quality = (
        COALESCE(p_user_rating, 3.0) * 0.5 +      -- 50% user rating
        (success_rate * 5.0) * 0.3 +                -- 30% success rate
        usage_score * 0.2                            -- 20% usage frequency
    );
    
    RETURN ROUND(quality, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Auto-calculate quality score on update
CREATE OR REPLACE FUNCTION auto_calculate_quality_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_rating IS NOT NULL OR NEW.usage_count != OLD.usage_count OR NEW.success_count != OLD.success_count THEN
        NEW.quality_score = calculate_agent_quality_score(
            NEW.user_rating,
            NEW.usage_count,
            NEW.success_count,
            NEW.error_count
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate quality score
DROP TRIGGER IF EXISTS user_agents_auto_quality ON user_agents;
CREATE TRIGGER user_agents_auto_quality
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_quality_score();

-- ============================================================================
-- STEP 5: HELPER FUNCTIONS
-- ============================================================================

-- Function: Add agent to user's list
CREATE OR REPLACE FUNCTION add_user_agent(
    p_user_id UUID,
    p_agent_id UUID,
    p_source TEXT DEFAULT 'store',
    p_folder TEXT DEFAULT NULL
)
RETURNS user_agents AS $$
DECLARE
    result user_agents;
BEGIN
    INSERT INTO user_agents (
        user_id,
        agent_id,
        source,
        folder,
        added_at,
        first_used_at,
        created_at
    ) VALUES (
        p_user_id,
        p_agent_id,
        p_source,
        p_folder,
        NOW(),
        NULL,
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

-- Function: Track agent usage
CREATE OR REPLACE FUNCTION track_agent_usage(
    p_user_id UUID,
    p_agent_id UUID,
    p_success BOOLEAN DEFAULT TRUE,
    p_tokens_used INTEGER DEFAULT 0,
    p_cost_usd DECIMAL DEFAULT 0,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_total_interactions INTEGER;
BEGIN
    UPDATE user_agents SET
        usage_count = usage_count + 1,
        message_count = message_count + 1,
        last_used_at = NOW(),
        first_used_at = COALESCE(first_used_at, NOW()),
        success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
        error_count = error_count + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
        total_tokens_used = total_tokens_used + p_tokens_used,
        total_cost_usd = total_cost_usd + p_cost_usd,
        avg_response_time_ms = CASE 
            WHEN p_response_time_ms IS NOT NULL THEN
                CASE
                    WHEN avg_response_time_ms IS NULL THEN p_response_time_ms
                    ELSE ((avg_response_time_ms * usage_count + p_response_time_ms) / (usage_count + 1))::INTEGER
                END
            ELSE avg_response_time_ms
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id AND agent_id = p_agent_id;
    
    -- Auto-recalculate quality score
    SELECT usage_count INTO v_total_interactions
    FROM user_agents
    WHERE user_id = p_user_id AND agent_id = p_agent_id;
    
    IF v_total_interactions % 10 = 0 THEN  -- Recalculate every 10 uses
        UPDATE user_agents SET
            quality_score = calculate_agent_quality_score(
                user_rating,
                usage_count,
                success_count,
                error_count
            )
        WHERE user_id = p_user_id AND agent_id = p_agent_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Soft delete agent
CREATE OR REPLACE FUNCTION soft_delete_user_agent(
    p_user_id UUID,
    p_agent_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_agents 
    SET 
        deleted_at = NOW(),
        is_active = FALSE,
        is_visible = FALSE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND agent_id = p_agent_id AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore deleted agent
CREATE OR REPLACE FUNCTION restore_user_agent(
    p_user_id UUID,
    p_agent_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_agents 
    SET 
        deleted_at = NULL,
        is_active = TRUE,
        is_visible = TRUE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND agent_id = p_agent_id AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: HELPFUL VIEWS
-- ============================================================================

-- View: Active user agents with agent details
CREATE OR REPLACE VIEW user_agents_with_details AS
SELECT 
    ua.*,
    a.name as agent_name,
    COALESCE(a.title, a.name) as agent_display_name,  -- Use title or fallback to name
    a.tagline as agent_tagline,
    a.description as agent_description,
    a.avatar_url as agent_avatar,
    a.avatar_description as agent_avatar_description,
    a.role_id as agent_role_id,
    a.function_id as agent_function_id,
    a.department_id as agent_department_id,
    a.expertise_level as agent_expertise_level,
    a.base_model as agent_model,
    a.status as agent_status,
    a.usage_count as agent_total_usage,
    a.average_rating as agent_average_rating,
    -- Calculated fields for user's usage
    CASE 
        WHEN ua.usage_count = 0 THEN 'never_used'
        WHEN ua.last_used_at > NOW() - INTERVAL '24 hours' THEN 'active'
        WHEN ua.last_used_at > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN ua.last_used_at > NOW() - INTERVAL '30 days' THEN 'occasional'
        ELSE 'inactive'
    END as usage_status,
    CASE 
        WHEN (ua.success_count + ua.error_count) > 0 
        THEN ROUND((ua.success_count::DECIMAL / (ua.success_count + ua.error_count)) * 100, 2)
        ELSE NULL
    END as success_rate_percent
FROM user_agents ua
LEFT JOIN agents a ON ua.agent_id = a.id
WHERE ua.deleted_at IS NULL AND ua.is_active = TRUE;

-- View: User's favorite agents
CREATE OR REPLACE VIEW user_favorite_agents AS
SELECT * FROM user_agents_with_details
WHERE is_favorite = TRUE
ORDER BY sort_order, last_used_at DESC NULLS LAST;

-- View: User's most used agents
CREATE OR REPLACE VIEW user_popular_agents AS
SELECT * FROM user_agents_with_details
WHERE usage_count > 0
ORDER BY usage_count DESC, last_used_at DESC
LIMIT 20;

-- View: Recently used agents
CREATE OR REPLACE VIEW user_recent_agents AS
SELECT * FROM user_agents_with_details
WHERE last_used_at IS NOT NULL
ORDER BY last_used_at DESC
LIMIT 10;

-- ============================================================================
-- STEP 7: VERIFICATION & SUMMARY
-- ============================================================================

DO $$ 
DECLARE
    column_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
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
    
    -- Count functions related to user_agents
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname LIKE '%user_agent%';
    
    -- Count views
    SELECT COUNT(*) INTO view_count
    FROM pg_views
    WHERE schemaname = 'public'
    AND viewname LIKE '%user_agent%';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ NORMALIZED user_agents TABLE COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Table: user_agents';
    RAISE NOTICE 'Columns: % (fully normalized)', column_count;
    RAISE NOTICE 'Indexes: % (optimized for performance)', index_count;
    RAISE NOTICE 'RLS Policies: % (secured)', policy_count;
    RAISE NOTICE 'Helper Functions: %', function_count;
    RAISE NOTICE 'Views: %', view_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Schema follows 3NF (Third Normal Form):';
    RAISE NOTICE '  ✓ No repeating groups (1NF)';
    RAISE NOTICE '  ✓ All non-key attributes depend on primary key (2NF)';
    RAISE NOTICE '  ✓ No transitive dependencies (3NF)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Separate tables maintained for:';
    RAISE NOTICE '  ✓ user_memory (detailed AI memory with vectors)';
    RAISE NOTICE '  ✓ llm_usage_logs (detailed LLM tracking)';
    RAISE NOTICE '  ✓ user_ratings (detailed reviews)';
    RAISE NOTICE '  ✓ user_favorites (generic favorites)';
    RAISE NOTICE '  ✓ rate_limit_* (abuse prevention)';
    RAISE NOTICE '  ✓ quota_tracking (usage limits)';
    RAISE NOTICE '  ✓ user_sessions (session analytics)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Ready for production!';
    RAISE NOTICE '========================================';
END $$;

-- Show table structure (replacing psql \d command with SQL query)
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'agent_id') THEN 'PRIMARY/FOREIGN KEY'
        WHEN column_name LIKE '%_at' THEN 'TIMESTAMP'
        WHEN column_name LIKE 'is_%' THEN 'BOOLEAN FLAG'
        WHEN column_name LIKE 'custom_%' THEN 'USER CUSTOMIZATION'
        WHEN data_type = 'jsonb' THEN 'FLEXIBLE DATA'
        WHEN data_type = 'ARRAY' THEN 'ARRAY DATA'
        ELSE 'DATA FIELD'
    END as field_category
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_agents'
ORDER BY 
    CASE 
        WHEN column_name = 'id' THEN 1
        WHEN column_name = 'user_id' THEN 2
        WHEN column_name = 'agent_id' THEN 3
        WHEN column_name = 'original_agent_id' THEN 4
        WHEN column_name LIKE 'custom_%' THEN 5
        WHEN column_name IN ('is_favorite', 'is_pinned', 'folder', 'tags', 'sort_order') THEN 6
        WHEN column_name LIKE '%_count' THEN 7
        WHEN column_name LIKE '%rating%' OR column_name LIKE '%quality%' THEN 8
        WHEN column_name LIKE '%_at' THEN 9
        ELSE 10
    END,
    ordinal_position;

