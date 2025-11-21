-- Create prompt_usage table for tracking prompt performance metrics
-- This table stores usage data for monitoring and analytics

CREATE TABLE IF NOT EXISTS prompt_usage (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Usage Data
    user_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    success BOOLEAN NOT NULL DEFAULT true,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    error_message TEXT,

    -- Token and Cost Tracking
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 4) NOT NULL DEFAULT 0.00,

    -- Metadata
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt_id ON prompt_usage(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_agent_id ON prompt_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_user_id ON prompt_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_created_at ON prompt_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_success ON prompt_usage(success);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_rating ON prompt_usage(rating);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt_created ON prompt_usage(prompt_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_agent_created ON prompt_usage(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_user_created ON prompt_usage(user_id, created_at);

-- Enable Row Level Security
ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "prompt_usage_read_policy" ON prompt_usage
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "prompt_usage_insert_policy" ON prompt_usage
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "prompt_usage_update_policy" ON prompt_usage
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND user_id = auth.uid())
    );

CREATE POLICY "prompt_usage_delete_policy" ON prompt_usage
    FOR DELETE USING (
        auth.role() = 'service_role'
    );

-- Grant permissions
GRANT ALL ON prompt_usage TO authenticated;
GRANT ALL ON prompt_usage TO service_role;

-- Add comments
COMMENT ON TABLE prompt_usage IS 'Tracks usage and performance metrics for prompts';
COMMENT ON COLUMN prompt_usage.prompt_id IS 'Reference to the prompt that was used';
COMMENT ON COLUMN prompt_usage.agent_id IS 'Reference to the agent that used the prompt (optional)';
COMMENT ON COLUMN prompt_usage.user_id IS 'Reference to the user who initiated the prompt (optional)';
COMMENT ON COLUMN prompt_usage.user_prompt IS 'Original user input prompt';
COMMENT ON COLUMN prompt_usage.enhanced_prompt IS 'Enhanced prompt after PRISM processing';
COMMENT ON COLUMN prompt_usage.response_time_ms IS 'Time taken to process the prompt in milliseconds';
COMMENT ON COLUMN prompt_usage.success IS 'Whether the prompt processing was successful';
COMMENT ON COLUMN prompt_usage.rating IS 'User rating of the prompt quality (1-5)';
COMMENT ON COLUMN prompt_usage.feedback IS 'User feedback text';
COMMENT ON COLUMN prompt_usage.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN prompt_usage.tokens_used IS 'Number of tokens consumed';
COMMENT ON COLUMN prompt_usage.cost IS 'Cost of processing in USD';
COMMENT ON COLUMN prompt_usage.session_id IS 'Session identifier for grouping related usage';
COMMENT ON COLUMN prompt_usage.ip_address IS 'IP address of the user';
COMMENT ON COLUMN prompt_usage.user_agent IS 'User agent string';

-- Create a function to get prompt performance summary
CREATE OR REPLACE FUNCTION get_prompt_performance_summary(
    p_prompt_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    usage_count BIGINT,
    success_rate NUMERIC,
    average_rating NUMERIC,
    average_response_time NUMERIC,
    total_tokens BIGINT,
    total_cost NUMERIC,
    last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as usage_count,
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as success_rate,
        ROUND(AVG(rating), 2) as average_rating,
        ROUND(AVG(response_time_ms), 2) as average_response_time,
        SUM(tokens_used) as total_tokens,
        ROUND(SUM(cost), 4) as total_cost,
        MAX(created_at) as last_used
    FROM prompt_usage
    WHERE prompt_id = p_prompt_id
    AND created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get top performing prompts
CREATE OR REPLACE FUNCTION get_top_performing_prompts(
    p_metric TEXT DEFAULT 'usage_count',
    p_limit INTEGER DEFAULT 10,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    prompt_id UUID,
    prompt_name TEXT,
    domain TEXT,
    usage_count BIGINT,
    success_rate NUMERIC,
    average_rating NUMERIC,
    total_tokens BIGINT,
    total_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as prompt_id,
        p.display_name as prompt_name,
        p.domain,
        COALESCE(perf.usage_count, 0) as usage_count,
        COALESCE(perf.success_rate, 0) as success_rate,
        COALESCE(perf.average_rating, 0) as average_rating,
        COALESCE(perf.total_tokens, 0) as total_tokens,
        COALESCE(perf.total_cost, 0) as total_cost
    FROM prompts p
    LEFT JOIN LATERAL (
        SELECT 
            COUNT(*) as usage_count,
            ROUND(
                (COUNT(*) FILTER (WHERE pu.success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
                2
            ) as success_rate,
            ROUND(AVG(pu.rating), 2) as average_rating,
            SUM(pu.tokens_used) as total_tokens,
            ROUND(SUM(pu.cost), 4) as total_cost
        FROM prompt_usage pu
        WHERE pu.prompt_id = p.id
        AND pu.created_at >= NOW() - INTERVAL '1 day' * p_days
    ) perf ON true
    WHERE p.prompt_starter IS NOT NULL
    ORDER BY 
        CASE p_metric
            WHEN 'usage_count' THEN COALESCE(perf.usage_count, 0)
            WHEN 'success_rate' THEN COALESCE(perf.success_rate, 0)
            WHEN 'average_rating' THEN COALESCE(perf.average_rating, 0)
            ELSE COALESCE(perf.usage_count, 0)
        END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_prompt_performance_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_prompt_performance_summary(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_top_performing_prompts(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_performing_prompts(TEXT, INTEGER, INTEGER) TO service_role;
