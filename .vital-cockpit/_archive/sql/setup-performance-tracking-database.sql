-- ========================================================================
-- PROMPT PERFORMANCE TRACKING DATABASE SETUP
-- ========================================================================
-- This script sets up the complete performance tracking infrastructure
-- for the PRISM prompt system in Supabase Cloud
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================
-- 1. CREATE PROMPT_USAGE TABLE
-- ========================================================================
-- This table tracks all prompt usage, performance metrics, and user feedback

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

-- ========================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================================================

-- Core indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt_id ON prompt_usage(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_agent_id ON prompt_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_user_id ON prompt_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_created_at ON prompt_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_success ON prompt_usage(success);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_rating ON prompt_usage(rating);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt_created ON prompt_usage(prompt_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_agent_created ON prompt_usage(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_success_created ON prompt_usage(success, created_at);

-- ========================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ========================================================================

ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- 4. CREATE RLS POLICIES
-- ========================================================================

-- Policy for authenticated users to read their own usage data
CREATE POLICY "prompt_usage_read_own" ON prompt_usage
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (user_id = auth.uid() OR auth.uid() IN (
            SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
        ))
    );

-- Policy for service role to read all data
CREATE POLICY "prompt_usage_read_service" ON prompt_usage
    FOR SELECT USING (auth.role() = 'service_role');

-- Policy for authenticated users to insert their own usage data
CREATE POLICY "prompt_usage_insert_own" ON prompt_usage
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        (user_id = auth.uid() OR user_id IS NULL)
    );

-- Policy for service role to insert data
CREATE POLICY "prompt_usage_insert_service" ON prompt_usage
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy for service role to update data
CREATE POLICY "prompt_usage_update_service" ON prompt_usage
    FOR UPDATE USING (auth.role() = 'service_role');

-- ========================================================================
-- 5. GRANT PERMISSIONS
-- ========================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON prompt_usage TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON prompt_usage TO service_role;

-- ========================================================================
-- 6. CREATE PERFORMANCE MONITORING FUNCTIONS
-- ========================================================================

-- Function to get performance summary for a specific prompt
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

-- Function to get top performing prompts
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

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_prompts BIGINT,
    total_usage BIGINT,
    average_success_rate NUMERIC,
    average_rating NUMERIC,
    total_tokens BIGINT,
    total_cost NUMERIC,
    active_prompts BIGINT,
    performance_alerts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM prompts WHERE prompt_starter IS NOT NULL) as total_prompts,
        COUNT(pu.*) as total_usage,
        ROUND(
            (COUNT(*) FILTER (WHERE pu.success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as average_success_rate,
        ROUND(AVG(pu.rating), 2) as average_rating,
        SUM(pu.tokens_used) as total_tokens,
        ROUND(SUM(pu.cost), 4) as total_cost,
        COUNT(DISTINCT pu.prompt_id) as active_prompts,
        COUNT(*) FILTER (WHERE pu.success = false OR pu.rating < 3) as performance_alerts
    FROM prompt_usage pu
    WHERE pu.created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get performance alerts
CREATE OR REPLACE FUNCTION get_performance_alerts(
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    prompt_id UUID,
    alert_type TEXT,
    alert_message TEXT,
    severity TEXT,
    metric_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH prompt_stats AS (
        SELECT 
            pu.prompt_id,
            COUNT(*) as usage_count,
            ROUND(
                (COUNT(*) FILTER (WHERE pu.success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
                2
            ) as success_rate,
            ROUND(AVG(pu.rating), 2) as average_rating,
            ROUND(AVG(pu.response_time_ms), 2) as avg_response_time
        FROM prompt_usage pu
        WHERE pu.created_at >= NOW() - INTERVAL '1 day' * p_days
        GROUP BY pu.prompt_id
    )
    SELECT 
        ps.prompt_id,
        'low_usage' as alert_type,
        'Low usage detected' as alert_message,
        'low' as severity,
        ps.usage_count::NUMERIC as metric_value
    FROM prompt_stats ps
    WHERE ps.usage_count < 5
    
    UNION ALL
    
    SELECT 
        ps.prompt_id,
        'poor_success_rate' as alert_type,
        'Poor success rate detected' as alert_message,
        CASE WHEN ps.success_rate < 50 THEN 'high' ELSE 'medium' END as severity,
        ps.success_rate as metric_value
    FROM prompt_stats ps
    WHERE ps.success_rate < 70
    
    UNION ALL
    
    SELECT 
        ps.prompt_id,
        'poor_rating' as alert_type,
        'Poor user rating detected' as alert_message,
        CASE WHEN ps.average_rating < 2 THEN 'high' ELSE 'medium' END as severity,
        ps.average_rating as metric_value
    FROM prompt_stats ps
    WHERE ps.average_rating < 3 AND ps.average_rating > 0
    
    UNION ALL
    
    SELECT 
        ps.prompt_id,
        'slow_response' as alert_type,
        'Slow response time detected' as alert_message,
        CASE WHEN ps.avg_response_time > 10000 THEN 'high' ELSE 'medium' END as severity,
        ps.avg_response_time as metric_value
    FROM prompt_stats ps
    WHERE ps.avg_response_time > 5000;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- 7. CREATE SAMPLE PERFORMANCE DATA
-- ========================================================================

-- Insert sample performance data for testing
INSERT INTO prompt_usage (
    prompt_id,
    agent_id,
    user_prompt,
    enhanced_prompt,
    response_time_ms,
    success,
    rating,
    feedback,
    tokens_used,
    cost,
    session_id,
    created_at
)
SELECT 
    p.id as prompt_id,
    a.id as agent_id,
    'Sample user prompt for ' || p.display_name as user_prompt,
    'Enhanced prompt using ' || p.name || ' framework' as enhanced_prompt,
    (RANDOM() * 3000 + 500)::INTEGER as response_time_ms,
    (RANDOM() > 0.1) as success,
    CASE WHEN RANDOM() > 0.2 THEN (RANDOM() * 5 + 1)::INTEGER ELSE NULL END as rating,
    CASE WHEN RANDOM() > 0.7 THEN 'Sample feedback for ' || p.name ELSE NULL END as feedback,
    (RANDOM() * 2000 + 500)::INTEGER as tokens_used,
    (RANDOM() * 0.05)::DECIMAL(10,4) as cost,
    'session_' || (RANDOM() * 1000)::INTEGER as session_id,
    NOW() - (RANDOM() * INTERVAL '30 days') as created_at
FROM prompts p
CROSS JOIN agents a
WHERE p.prompt_starter IS NOT NULL
AND a.status = 'active'
LIMIT 100;

-- ========================================================================
-- 8. VERIFY SETUP
-- ========================================================================

-- Check table creation
SELECT 
    'prompt_usage' as table_name,
    COUNT(*) as record_count
FROM prompt_usage

UNION ALL

SELECT 
    'prompts' as table_name,
    COUNT(*) as record_count
FROM prompts
WHERE prompt_starter IS NOT NULL

UNION ALL

SELECT 
    'agent_prompts' as table_name,
    COUNT(*) as record_count
FROM agent_prompts;

-- Test performance functions
SELECT 'Performance functions test' as test_name, * FROM get_dashboard_metrics(30);
SELECT 'Top prompts test' as test_name, * FROM get_top_performing_prompts('usage_count', 5, 30);
SELECT 'Alerts test' as test_name, * FROM get_performance_alerts(7);

-- ========================================================================
-- SETUP COMPLETE
-- ========================================================================

-- Display completion message
SELECT 
    'PROMPT PERFORMANCE TRACKING SETUP COMPLETE' as status,
    NOW() as completed_at,
    'Ready for production use' as message;
