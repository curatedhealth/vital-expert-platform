-- ============================================================================
-- Server-Side Session Persistence Schema
--
-- Tables for:
-- - User sessions (authentication, activity tracking)
-- - Search history (query logs, results tracking)
-- - Agent interactions (selections, ratings, feedback)
-- - User preferences (domains, tiers, settings)
-- - Personalized recommendations (ML-based suggestions)
--
-- Created: 2025-10-25
-- Phase: 4 Week 1 - Session Persistence
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USER SESSIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User identification
    user_id TEXT NOT NULL,  -- From auth system (Supabase auth.users.id or external ID)
    session_token TEXT UNIQUE NOT NULL,  -- JWT or session identifier

    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,  -- mobile, tablet, desktop
    browser TEXT,
    os TEXT,

    -- Geographic info
    country TEXT,
    region TEXT,
    city TEXT,

    -- Session timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,

    -- Session state
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    logout_reason TEXT,  -- manual, timeout, forced

    -- Analytics
    total_searches INTEGER NOT NULL DEFAULT 0,
    total_agent_selections INTEGER NOT NULL DEFAULT 0,
    total_conversations INTEGER NOT NULL DEFAULT 0,
    session_duration_seconds INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM COALESCE(ended_at, NOW()) - created_at)::INTEGER
    ) STORED,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Indexes
    CONSTRAINT valid_session_dates CHECK (created_at <= COALESCE(ended_at, NOW())),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions (session_token) WHERE is_active = TRUE;
CREATE INDEX idx_user_sessions_active ON user_sessions (user_id, is_active, last_activity_at DESC);
CREATE INDEX idx_user_sessions_created_at ON user_sessions (created_at DESC);

-- Auto-update last_activity_at
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- ----------------------------------------------------------------------------
-- 2. SEARCH HISTORY TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Session linkage
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,

    -- Search details
    query TEXT NOT NULL,
    query_normalized TEXT,  -- Lowercased, trimmed
    query_embedding vector(1536),  -- For similarity search

    -- Filters applied
    filters JSONB DEFAULT '{}'::jsonb,  -- {domains: [...], tier: 1, capabilities: [...]}

    -- Search results
    total_results INTEGER NOT NULL DEFAULT 0,
    results JSONB,  -- Array of agent results with scores

    -- Performance metrics
    search_time_ms NUMERIC(10, 2),
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    experiment_variant TEXT,  -- A/B test variant

    -- User interaction
    selected_agent_id UUID,  -- Agent user clicked on
    selected_agent_rank INTEGER,  -- Position in results (1-based)
    time_to_selection_ms INTEGER,  -- Time from search to selection

    -- Feedback
    helpful BOOLEAN,  -- User feedback: was this search helpful?
    feedback_text TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    selected_at TIMESTAMPTZ,
    feedback_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for search_history
CREATE INDEX idx_search_history_session ON search_history (session_id, created_at DESC);
CREATE INDEX idx_search_history_user ON search_history (user_id, created_at DESC);
CREATE INDEX idx_search_history_query ON search_history USING gin (to_tsvector('english', query));
CREATE INDEX idx_search_history_selected_agent ON search_history (selected_agent_id) WHERE selected_agent_id IS NOT NULL;
CREATE INDEX idx_search_history_embedding ON search_history USING hnsw (query_embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- ----------------------------------------------------------------------------
-- 3. AGENT INTERACTIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Session and user
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    search_id UUID REFERENCES search_history(id) ON DELETE SET NULL,

    -- Agent details
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,

    -- Interaction type
    interaction_type TEXT NOT NULL,  -- view, select, chat, rate, feedback

    -- Context
    agent_rank INTEGER,  -- Position in search results
    context JSONB DEFAULT '{}'::jsonb,  -- Additional context

    -- Chat interactions (if applicable)
    message_count INTEGER DEFAULT 0,
    conversation_duration_seconds INTEGER,

    -- User feedback
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    helpful BOOLEAN,
    feedback_text TEXT,
    feedback_tags TEXT[],  -- ['accurate', 'helpful', 'slow', etc.]

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_interaction_type CHECK (
        interaction_type IN ('view', 'select', 'chat', 'rate', 'feedback', 'escalate')
    )
);

-- Indexes for agent_interactions
CREATE INDEX idx_agent_interactions_session ON agent_interactions (session_id, created_at DESC);
CREATE INDEX idx_agent_interactions_user ON agent_interactions (user_id, created_at DESC);
CREATE INDEX idx_agent_interactions_agent ON agent_interactions (agent_id, created_at DESC);
CREATE INDEX idx_agent_interactions_type ON agent_interactions (interaction_type, created_at DESC);
CREATE INDEX idx_agent_interactions_rating ON agent_interactions (agent_id, rating) WHERE rating IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. USER PREFERENCES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User identification
    user_id TEXT UNIQUE NOT NULL,

    -- Search preferences
    preferred_domains TEXT[] DEFAULT '{}',  -- Favorite domains
    preferred_capabilities TEXT[] DEFAULT '{}',  -- Preferred capabilities
    preferred_tier INTEGER CHECK (preferred_tier BETWEEN 1 AND 3),
    default_max_results INTEGER DEFAULT 10 CHECK (default_max_results BETWEEN 1 AND 50),

    -- Display preferences
    show_graph_context BOOLEAN DEFAULT TRUE,
    show_performance_metrics BOOLEAN DEFAULT TRUE,
    enable_websocket BOOLEAN DEFAULT FALSE,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,

    -- Privacy preferences
    track_search_history BOOLEAN DEFAULT TRUE,
    share_analytics BOOLEAN DEFAULT TRUE,

    -- Personalization settings
    enable_recommendations BOOLEAN DEFAULT TRUE,
    enable_learning BOOLEAN DEFAULT TRUE,  -- Learn from user behavior

    -- Frequently used agents
    favorite_agents UUID[] DEFAULT '{}',
    blocked_agents UUID[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata (extensible for future preferences)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for user_preferences
CREATE INDEX idx_user_preferences_user ON user_preferences (user_id);
CREATE INDEX idx_user_preferences_domains ON user_preferences USING gin (preferred_domains);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_timestamp
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_timestamp();

-- ----------------------------------------------------------------------------
-- 5. PERSONALIZED RECOMMENDATIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User
    user_id TEXT NOT NULL,

    -- Recommendation details
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,  -- frequent, similar_to_favorites, trending, new

    -- Scoring
    relevance_score NUMERIC(3, 2) NOT NULL CHECK (relevance_score BETWEEN 0 AND 1),
    confidence_score NUMERIC(3, 2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),

    -- Reasoning
    reason TEXT,  -- Human-readable explanation
    factors JSONB,  -- {domain_match: 0.8, past_usage: 0.9, ...}

    -- Context
    based_on_search_ids UUID[],  -- Search history IDs used for recommendation
    based_on_agent_ids UUID[],  -- Agent interaction IDs used

    -- Interaction tracking
    shown_count INTEGER NOT NULL DEFAULT 0,
    clicked BOOLEAN NOT NULL DEFAULT FALSE,
    clicked_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,  -- Recommendations expire after 24-48 hours

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_recommendation_type CHECK (
        recommendation_type IN ('frequent', 'similar_to_favorites', 'trending', 'new', 'collaborative', 'content_based')
    ),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for personalized_recommendations
CREATE INDEX idx_recommendations_user ON personalized_recommendations (user_id, relevance_score DESC);
CREATE INDEX idx_recommendations_active ON personalized_recommendations (user_id, expires_at)
    WHERE expires_at > NOW() AND clicked = FALSE;
CREATE INDEX idx_recommendations_agent ON personalized_recommendations (agent_id);
CREATE INDEX idx_recommendations_type ON personalized_recommendations (recommendation_type, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. USER ACTIVITY SUMMARY (MATERIALIZED VIEW)
-- ----------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS v_user_activity_summary AS
SELECT
    u.user_id,

    -- Session stats
    COUNT(DISTINCT u.id) AS total_sessions,
    COUNT(DISTINCT u.id) FILTER (WHERE u.is_active) AS active_sessions,
    AVG(u.session_duration_seconds) AS avg_session_duration_seconds,
    MAX(u.last_activity_at) AS last_seen_at,

    -- Search stats
    COUNT(s.id) AS total_searches,
    COUNT(DISTINCT s.query_normalized) AS unique_queries,
    AVG(s.total_results) AS avg_results_per_search,
    AVG(s.search_time_ms) AS avg_search_time_ms,
    COUNT(s.id) FILTER (WHERE s.cache_hit) AS cached_searches,
    ROUND(100.0 * COUNT(s.id) FILTER (WHERE s.cache_hit) / NULLIF(COUNT(s.id), 0), 2) AS cache_hit_rate_pct,

    -- Agent interaction stats
    COUNT(i.id) AS total_interactions,
    COUNT(DISTINCT i.agent_id) AS unique_agents_used,
    COUNT(i.id) FILTER (WHERE i.interaction_type = 'select') AS agent_selections,
    COUNT(i.id) FILTER (WHERE i.interaction_type = 'chat') AS chat_interactions,
    COUNT(i.id) FILTER (WHERE i.rating IS NOT NULL) AS rated_interactions,
    AVG(i.rating) FILTER (WHERE i.rating IS NOT NULL) AS avg_agent_rating,

    -- Preferences
    p.preferred_domains,
    p.preferred_tier,
    p.enable_recommendations,

    -- Timestamps
    MIN(u.created_at) AS first_seen_at,
    MAX(u.last_activity_at) AS last_activity_at

FROM user_sessions u
LEFT JOIN search_history s ON u.id = s.session_id
LEFT JOIN agent_interactions i ON u.id = i.session_id
LEFT JOIN user_preferences p ON u.user_id = p.user_id

GROUP BY u.user_id, p.preferred_domains, p.preferred_tier, p.enable_recommendations;

-- Index for materialized view
CREATE UNIQUE INDEX idx_user_activity_summary_user ON v_user_activity_summary (user_id);
CREATE INDEX idx_user_activity_summary_last_activity ON v_user_activity_summary (last_activity_at DESC);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_user_activity_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY v_user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: Get user's search history with filters
CREATE OR REPLACE FUNCTION get_user_search_history(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    query TEXT,
    total_results INTEGER,
    selected_agent_id UUID,
    selected_agent_name TEXT,
    search_time_ms NUMERIC,
    cache_hit BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sh.id,
        sh.query,
        sh.total_results,
        sh.selected_agent_id,
        a.name AS selected_agent_name,
        sh.search_time_ms,
        sh.cache_hit,
        sh.created_at
    FROM search_history sh
    LEFT JOIN agents a ON sh.selected_agent_id = a.id
    WHERE sh.user_id = p_user_id
    ORDER BY sh.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's top agents by usage
CREATE OR REPLACE FUNCTION get_user_top_agents(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    interaction_count INTEGER,
    avg_rating NUMERIC,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.agent_id,
        i.agent_name,
        COUNT(*)::INTEGER AS interaction_count,
        AVG(i.rating) AS avg_rating,
        MAX(i.created_at) AS last_used_at
    FROM agent_interactions i
    WHERE i.user_id = p_user_id
        AND i.interaction_type IN ('select', 'chat')
    GROUP BY i.agent_id, i.agent_name
    ORDER BY interaction_count DESC, avg_rating DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get similar searches (for autocomplete/suggestions)
CREATE OR REPLACE FUNCTION get_similar_searches(
    p_query_embedding vector(1536),
    p_user_id TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    query TEXT,
    search_count INTEGER,
    avg_results INTEGER,
    similarity NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sh.query_normalized AS query,
        COUNT(*)::INTEGER AS search_count,
        AVG(sh.total_results)::INTEGER AS avg_results,
        (1 - (sh.query_embedding <=> p_query_embedding))::NUMERIC(3, 2) AS similarity
    FROM search_history sh
    WHERE sh.query_embedding IS NOT NULL
        AND (p_user_id IS NULL OR sh.user_id = p_user_id)
    GROUP BY sh.query_normalized, sh.query_embedding
    ORDER BY sh.query_embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Record search event
CREATE OR REPLACE FUNCTION record_search_event(
    p_session_id UUID,
    p_user_id TEXT,
    p_query TEXT,
    p_filters JSONB DEFAULT '{}'::jsonb,
    p_results JSONB DEFAULT '[]'::jsonb,
    p_total_results INTEGER DEFAULT 0,
    p_search_time_ms NUMERIC DEFAULT NULL,
    p_cache_hit BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    v_search_id UUID;
BEGIN
    INSERT INTO search_history (
        session_id,
        user_id,
        query,
        query_normalized,
        filters,
        results,
        total_results,
        search_time_ms,
        cache_hit
    ) VALUES (
        p_session_id,
        p_user_id,
        p_query,
        LOWER(TRIM(p_query)),
        p_filters,
        p_results,
        p_total_results,
        p_search_time_ms,
        p_cache_hit
    )
    RETURNING id INTO v_search_id;

    -- Update session stats
    UPDATE user_sessions
    SET total_searches = total_searches + 1
    WHERE id = p_session_id;

    RETURN v_search_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Record agent interaction
CREATE OR REPLACE FUNCTION record_agent_interaction(
    p_session_id UUID,
    p_user_id TEXT,
    p_agent_id UUID,
    p_interaction_type TEXT,
    p_search_id UUID DEFAULT NULL,
    p_rating INTEGER DEFAULT NULL,
    p_feedback_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_interaction_id UUID;
    v_agent_name TEXT;
BEGIN
    -- Get agent name
    SELECT name INTO v_agent_name
    FROM agents
    WHERE id = p_agent_id;

    INSERT INTO agent_interactions (
        session_id,
        user_id,
        search_id,
        agent_id,
        agent_name,
        interaction_type,
        rating,
        feedback_text
    ) VALUES (
        p_session_id,
        p_user_id,
        p_search_id,
        p_agent_id,
        v_agent_name,
        p_interaction_type,
        p_rating,
        p_feedback_text
    )
    RETURNING id INTO v_interaction_id;

    -- Update session stats
    IF p_interaction_type = 'select' THEN
        UPDATE user_sessions
        SET total_agent_selections = total_agent_selections + 1
        WHERE id = p_session_id;
    END IF;

    RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 8. CLEANUP AND MAINTENANCE
-- ----------------------------------------------------------------------------

-- Function: Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    WITH updated AS (
        UPDATE user_sessions
        SET is_active = FALSE,
            ended_at = NOW(),
            logout_reason = 'timeout'
        WHERE is_active = TRUE
            AND expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM updated;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean up old recommendations
CREATE OR REPLACE FUNCTION cleanup_old_recommendations()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM personalized_recommendations
    WHERE expires_at < NOW() - INTERVAL '7 days';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '*/15 * * * *', 'SELECT cleanup_expired_sessions()');
-- SELECT cron.schedule('cleanup-recommendations', '0 2 * * *', 'SELECT cleanup_old_recommendations()');
-- SELECT cron.schedule('refresh-activity-summary', '*/30 * * * *', 'SELECT refresh_user_activity_summary()');

-- ----------------------------------------------------------------------------
-- GRANTS (adjust based on your roles)
-- ----------------------------------------------------------------------------

-- Grant permissions to authenticated users
-- GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON search_history TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON agent_interactions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
-- GRANT SELECT ON personalized_recommendations TO authenticated;
-- GRANT SELECT ON v_user_activity_summary TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'user_sessions',
        'search_history',
        'agent_interactions',
        'user_preferences',
        'personalized_recommendations'
    )
ORDER BY table_name;

-- Verify functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_user_search_history',
        'get_user_top_agents',
        'get_similar_searches',
        'record_search_event',
        'record_agent_interaction',
        'cleanup_expired_sessions',
        'cleanup_old_recommendations'
    )
ORDER BY routine_name;
