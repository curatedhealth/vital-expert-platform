-- ============================================================================
-- PROMPT ENHANCEMENT ANALYTICS TABLE
-- ============================================================================
-- Migration: Create analytics table for tracking template usage and success
-- Description: Tracks which templates are used, by whom, success rates, and learns from user selections
-- Author: VITAL Path AI Team
-- Date: 2024-11-06

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.prompt_enhancement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    template_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    template_name TEXT,
    suite TEXT,
    subsuite TEXT,
    
    -- Context
    agent_id TEXT,
    agent_name TEXT,
    tenant_id UUID,
    user_id UUID REFERENCES auth.users(id),
    
    -- Intent
    intent_focus TEXT,
    intent_title TEXT,
    keywords TEXT[],
    
    -- Scoring
    relevance_score DECIMAL(5, 2),  -- 0-100 score of template match
    
    -- User Interaction
    user_applied BOOLEAN DEFAULT FALSE,  -- Did user apply the prompt?
    user_modified BOOLEAN DEFAULT FALSE,  -- Did user modify before applying?
    time_to_decision_seconds INTEGER,  -- How long to decide
    
    -- Feedback (optional)
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Session tracking
    session_id TEXT,
    
    -- Performance
    processing_time_ms INTEGER
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_template_id 
ON public.prompt_enhancement_analytics(template_id);

CREATE INDEX IF NOT EXISTS idx_analytics_agent_id 
ON public.prompt_enhancement_analytics(agent_id);

CREATE INDEX IF NOT EXISTS idx_analytics_tenant_id 
ON public.prompt_enhancement_analytics(tenant_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_applied 
ON public.prompt_enhancement_analytics(user_applied, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON public.prompt_enhancement_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_suite_subsuite 
ON public.prompt_enhancement_analytics(suite, subsuite);

-- Create composite index for popular queries
CREATE INDEX IF NOT EXISTS idx_analytics_template_agent 
ON public.prompt_enhancement_analytics(template_id, agent_id, user_applied);

-- Enable Row Level Security
ALTER TABLE public.prompt_enhancement_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.prompt_enhancement_analytics;
DROP POLICY IF EXISTS "Allow users to view their own analytics" ON public.prompt_enhancement_analytics;
DROP POLICY IF EXISTS "Allow admins to view all analytics" ON public.prompt_enhancement_analytics;

-- Create RLS policies
-- 1. Users can insert their own analytics
CREATE POLICY "Allow authenticated users to insert" 
ON public.prompt_enhancement_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Any authenticated user can track usage

-- 2. Users can view their own analytics
CREATE POLICY "Allow users to view their own analytics" 
ON public.prompt_enhancement_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Admins can view all analytics
CREATE POLICY "Allow admins to view all analytics" 
ON public.prompt_enhancement_analytics
FOR SELECT
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- 4. Users can update their own analytics (for feedback)
CREATE POLICY "Allow users to update their own analytics" 
ON public.prompt_enhancement_analytics
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_analytics_updated_at_trigger 
ON public.prompt_enhancement_analytics;

CREATE TRIGGER update_analytics_updated_at_trigger
    BEFORE UPDATE ON public.prompt_enhancement_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_analytics_updated_at();

-- Create materialized view for template popularity
CREATE MATERIALIZED VIEW IF NOT EXISTS public.template_popularity_stats AS
SELECT 
    template_id,
    template_name,
    suite,
    subsuite,
    COUNT(*) as total_uses,
    COUNT(*) FILTER (WHERE user_applied = true) as times_applied,
    ROUND(AVG(relevance_score), 2) as avg_relevance_score,
    ROUND(AVG(user_rating)::numeric, 2) as avg_user_rating,
    COUNT(DISTINCT agent_id) as unique_agents,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_used
FROM public.prompt_enhancement_analytics
WHERE template_id IS NOT NULL
GROUP BY template_id, template_name, suite, subsuite;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_popularity_template_id 
ON public.template_popularity_stats(template_id);

-- Create refresh function
CREATE OR REPLACE FUNCTION public.refresh_template_popularity_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.template_popularity_stats;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE public.prompt_enhancement_analytics IS 
'Tracks usage and success of prompt enhancement templates for analytics and learning';

COMMENT ON COLUMN public.prompt_enhancement_analytics.user_applied IS 
'Whether the user actually applied the enhanced prompt (key success metric)';

COMMENT ON COLUMN public.prompt_enhancement_analytics.relevance_score IS 
'AI-computed relevance score (0-100) of how well the template matched the request';

COMMENT ON MATERIALIZED VIEW public.template_popularity_stats IS 
'Aggregated statistics on template popularity and success rates. Refresh periodically.';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.prompt_enhancement_analytics TO authenticated;
GRANT SELECT ON public.template_popularity_stats TO authenticated;
GRANT ALL ON public.prompt_enhancement_analytics TO service_role;
GRANT ALL ON public.template_popularity_stats TO service_role;

-- ============================================================================
-- RECOMMENDED SUITES/SUBSUITES QUERIES
-- ============================================================================

-- View: Most popular suites by agent
CREATE OR REPLACE VIEW public.popular_suites_by_agent AS
SELECT 
    agent_id,
    agent_name,
    suite,
    subsuite,
    COUNT(*) as use_count,
    COUNT(*) FILTER (WHERE user_applied = true) as success_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE user_applied = true) / COUNT(*), 1) as success_rate
FROM public.prompt_enhancement_analytics
WHERE agent_id IS NOT NULL AND suite IS NOT NULL
GROUP BY agent_id, agent_name, suite, subsuite
HAVING COUNT(*) >= 3  -- Minimum threshold
ORDER BY agent_id, use_count DESC;

COMMENT ON VIEW public.popular_suites_by_agent IS 
'Shows which PRISM suites/subsuites are most popular for each agent';

-- View: Trending templates (last 30 days)
CREATE OR REPLACE VIEW public.trending_templates AS
SELECT 
    template_id,
    template_name,
    suite,
    subsuite,
    COUNT(*) as recent_uses,
    COUNT(*) FILTER (WHERE user_applied = true) as recent_successes,
    ROUND(AVG(relevance_score), 2) as avg_score
FROM public.prompt_enhancement_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
    AND template_id IS NOT NULL
GROUP BY template_id, template_name, suite, subsuite
HAVING COUNT(*) >= 2
ORDER BY recent_uses DESC, recent_successes DESC
LIMIT 20;

COMMENT ON VIEW public.trending_templates IS 
'Templates trending in the last 30 days';

-- Grant view permissions
GRANT SELECT ON public.popular_suites_by_agent TO authenticated;
GRANT SELECT ON public.trending_templates TO authenticated;

-- ============================================================================
-- SCHEDULED REFRESH (Optional - requires pg_cron extension)
-- ============================================================================

-- Uncomment if you have pg_cron extension:
-- SELECT cron.schedule(
--     'refresh-template-stats',
--     '0 * * * *',  -- Every hour
--     $$SELECT refresh_template_popularity_stats()$$
-- );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View recent analytics
-- SELECT * FROM prompt_enhancement_analytics ORDER BY created_at DESC LIMIT 10;

-- View template stats
-- SELECT * FROM template_popularity_stats ORDER BY total_uses DESC;

-- View popular suites by agent
-- SELECT * FROM popular_suites_by_agent WHERE agent_id = 'your_agent_id';

-- View trending templates
-- SELECT * FROM trending_templates;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP VIEW IF EXISTS public.trending_templates CASCADE;
-- DROP VIEW IF EXISTS public.popular_suites_by_agent CASCADE;
-- DROP MATERIALIZED VIEW IF EXISTS public.template_popularity_stats CASCADE;
-- DROP FUNCTION IF EXISTS public.refresh_template_popularity_stats() CASCADE;
-- DROP TRIGGER IF EXISTS update_analytics_updated_at_trigger ON public.prompt_enhancement_analytics;
-- DROP FUNCTION IF EXISTS public.update_analytics_updated_at() CASCADE;
-- DROP TABLE IF EXISTS public.prompt_enhancement_analytics CASCADE;

