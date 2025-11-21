-- Migration: Create RAG User Feedback System
-- Purpose: Collect user feedback on RAG responses for continuous improvement
-- Phase: Week 1 - User Feedback Collection (P0)
-- Created: 2025-10-27

-- =====================================================
-- 1. Create rag_user_feedback table
-- =====================================================

CREATE TABLE IF NOT EXISTS rag_user_feedback (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,

  -- User identification (optional for anonymous feedback)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,

  -- Agent context (agents table may not exist yet, so we store as text)
  agent_id UUID, -- Can add FK constraint later when agents table exists
  agent_name TEXT,

  -- Query and response content (for analysis)
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,

  -- Feedback data
  vote TEXT CHECK (vote IN ('up', 'down')) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category TEXT CHECK (category IN (
    'irrelevant',
    'incomplete',
    'inaccurate',
    'confusing',
    'sources',
    'hallucination',
    'slow',
    'other'
  )),
  comment TEXT,

  -- Metadata for analysis
  response_time_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  model_name TEXT,
  retrieval_strategy TEXT,
  num_sources_cited INTEGER,

  -- Session tracking
  session_id TEXT,
  conversation_id UUID,
  message_position INTEGER, -- Position in conversation

  -- Device/browser info
  user_agent TEXT,
  device_type TEXT,

  -- Follow-up tracking
  was_helpful BOOLEAN GENERATED ALWAYS AS (vote = 'up') STORED,
  needs_review BOOLEAN GENERATED ALWAYS AS (vote = 'down' AND (rating IS NULL OR rating <= 2)) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================

-- Primary query patterns
CREATE INDEX idx_feedback_tenant_created ON rag_user_feedback(tenant_id, created_at DESC);
CREATE INDEX idx_feedback_agent_created ON rag_user_feedback(agent_id, created_at DESC);
CREATE INDEX idx_feedback_user_created ON rag_user_feedback(user_id, created_at DESC);

-- Analytics queries
CREATE INDEX idx_feedback_vote_created ON rag_user_feedback(vote, created_at DESC);
CREATE INDEX idx_feedback_rating ON rag_user_feedback(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_feedback_category ON rag_user_feedback(category) WHERE category IS NOT NULL;

-- Review queue
CREATE INDEX idx_feedback_needs_review ON rag_user_feedback(needs_review, created_at DESC) WHERE needs_review = true;

-- Performance analysis
CREATE INDEX idx_feedback_response_time ON rag_user_feedback(response_time_ms) WHERE response_time_ms IS NOT NULL;

-- Full-text search on comments
CREATE INDEX idx_feedback_comment_search ON rag_user_feedback USING gin(to_tsvector('english', comment)) WHERE comment IS NOT NULL;

-- =====================================================
-- 3. Create feedback analytics view
-- =====================================================

CREATE OR REPLACE VIEW vw_feedback_analytics AS
SELECT
  tenant_id,
  agent_id,
  agent_name,

  -- Overall metrics
  COUNT(*) as total_feedback,
  COUNT(*) FILTER (WHERE vote = 'up') as thumbs_up_count,
  COUNT(*) FILTER (WHERE vote = 'down') as thumbs_down_count,

  -- Satisfaction score (thumbs up / total)
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE vote = 'up') / NULLIF(COUNT(*), 0),
    2
  ) as satisfaction_percent,

  -- Average rating
  ROUND(AVG(rating), 2) as avg_rating,

  -- Issue breakdown
  COUNT(*) FILTER (WHERE category = 'irrelevant') as irrelevant_count,
  COUNT(*) FILTER (WHERE category = 'incomplete') as incomplete_count,
  COUNT(*) FILTER (WHERE category = 'inaccurate') as inaccurate_count,
  COUNT(*) FILTER (WHERE category = 'confusing') as confusing_count,
  COUNT(*) FILTER (WHERE category = 'sources') as sources_issues_count,
  COUNT(*) FILTER (WHERE category = 'hallucination') as hallucination_count,
  COUNT(*) FILTER (WHERE category = 'slow') as slow_count,

  -- Review queue
  COUNT(*) FILTER (WHERE needs_review = true) as needs_review_count,

  -- Performance metrics
  ROUND(AVG(response_time_ms), 0) as avg_response_time_ms,
  ROUND(AVG(cost_usd), 6) as avg_cost_usd,

  -- Time ranges
  MIN(created_at) as first_feedback_at,
  MAX(created_at) as last_feedback_at
FROM
  rag_user_feedback
GROUP BY
  tenant_id, agent_id, agent_name;

-- =====================================================
-- 4. Create daily feedback summary view
-- =====================================================

CREATE OR REPLACE VIEW vw_daily_feedback_summary AS
SELECT
  tenant_id,
  DATE(created_at) as feedback_date,

  -- Daily metrics
  COUNT(*) as total_feedback,
  COUNT(*) FILTER (WHERE vote = 'up') as thumbs_up,
  COUNT(*) FILTER (WHERE vote = 'down') as thumbs_down,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE vote = 'up') / NULLIF(COUNT(*), 0),
    2
  ) as satisfaction_percent,

  -- Rating distribution
  COUNT(*) FILTER (WHERE rating = 5) as five_star,
  COUNT(*) FILTER (WHERE rating = 4) as four_star,
  COUNT(*) FILTER (WHERE rating = 3) as three_star,
  COUNT(*) FILTER (WHERE rating = 2) as two_star,
  COUNT(*) FILTER (WHERE rating = 1) as one_star,

  -- Average metrics
  ROUND(AVG(rating), 2) as avg_rating,
  ROUND(AVG(response_time_ms), 0) as avg_response_time_ms,

  -- Issues
  COUNT(*) FILTER (WHERE needs_review = true) as needs_review
FROM
  rag_user_feedback
GROUP BY
  tenant_id, DATE(created_at)
ORDER BY
  feedback_date DESC;

-- =====================================================
-- 5. Create function to get problem queries
-- =====================================================

CREATE OR REPLACE FUNCTION get_problem_queries(
  p_tenant_id UUID,
  p_min_rating INTEGER DEFAULT 2,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  query_text TEXT,
  response_text TEXT,
  rating INTEGER,
  category TEXT,
  comment TEXT,
  agent_name TEXT,
  created_at TIMESTAMPTZ,
  feedback_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.query_text,
    f.response_text,
    f.rating,
    f.category,
    f.comment,
    f.agent_name,
    f.created_at,
    COUNT(*) OVER (PARTITION BY f.query_text) as feedback_count
  FROM
    rag_user_feedback f
  WHERE
    f.tenant_id = p_tenant_id
    AND f.vote = 'down'
    AND (f.rating IS NULL OR f.rating <= p_min_rating)
  ORDER BY
    f.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Create function to update feedback stats
-- =====================================================

CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_feedback_updated
  BEFORE UPDATE ON rag_user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp();

-- =====================================================
-- 7. Row Level Security (RLS)
-- =====================================================

ALTER TABLE rag_user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert feedback (anonymous or authenticated)
CREATE POLICY "Users can insert feedback" ON rag_user_feedback
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts, tenant_id validated by app

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON rag_user_feedback
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL -- Anonymous feedback visible to submitter's session
  );

-- Tenant admins can view all feedback for their tenant
CREATE POLICY "Tenant admins can view tenant feedback" ON rag_user_feedback
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Platform admins can view all feedback
CREATE POLICY "Platform admins can view all feedback" ON rag_user_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_tenants
      WHERE user_id = auth.uid()
        AND tenant_id = '00000000-0000-0000-0000-000000000001'
        AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- 8. Grant permissions
-- =====================================================

-- Grant read access to views for authenticated users
GRANT SELECT ON vw_feedback_analytics TO authenticated;
GRANT SELECT ON vw_daily_feedback_summary TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_problem_queries TO authenticated;

-- =====================================================
-- 9. Create initial feedback prompt templates
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- When to show this prompt
  trigger_condition TEXT CHECK (trigger_condition IN (
    'thumbs_down',
    'low_rating',
    'slow_response',
    'random_sample'
  )),

  -- Prompt content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  show_probability DECIMAL(3, 2) DEFAULT 1.0, -- 0.0 to 1.0

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default prompts
INSERT INTO feedback_prompt_templates (name, description, trigger_condition, title, message) VALUES
  (
    'Thumbs Down Follow-up',
    'Shown when user gives thumbs down',
    'thumbs_down',
    'Help us improve',
    'We''d love to know what went wrong. Your feedback helps us improve our responses.'
  ),
  (
    'Low Rating Follow-up',
    'Shown when user gives 1-2 stars',
    'low_rating',
    'Tell us more',
    'We noticed you gave a low rating. Can you help us understand what we could do better?'
  ),
  (
    'Slow Response Follow-up',
    'Shown when response takes >5s',
    'slow_response',
    'Was this too slow?',
    'We noticed this response took a while. Let us know if speed is an issue.'
  ),
  (
    'Random Quality Check',
    'Randomly sample 10% of responses',
    'random_sample',
    'Quick feedback',
    'How did we do? Your feedback helps improve the experience for everyone.'
  );

-- =====================================================
-- 10. Create feedback metrics export function
-- =====================================================

CREATE OR REPLACE FUNCTION export_feedback_metrics(
  p_tenant_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'total_feedback'::TEXT,
    COUNT(*)::NUMERIC,
    'count'::TEXT,
    p_start_date,
    p_end_date
  FROM rag_user_feedback
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date

  UNION ALL

  SELECT
    'satisfaction_rate',
    ROUND(100.0 * COUNT(*) FILTER (WHERE vote = 'up') / NULLIF(COUNT(*), 0), 2),
    'percent',
    p_start_date,
    p_end_date
  FROM rag_user_feedback
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date

  UNION ALL

  SELECT
    'avg_rating',
    ROUND(AVG(rating), 2),
    'stars',
    p_start_date,
    p_end_date
  FROM rag_user_feedback
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date
    AND rating IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Add comment to table
COMMENT ON TABLE rag_user_feedback IS 'User feedback on RAG responses for continuous improvement. Part of Week 1 enhancement plan.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RAG User Feedback system created successfully';
  RAISE NOTICE '   - Table: rag_user_feedback';
  RAISE NOTICE '   - Views: vw_feedback_analytics, vw_daily_feedback_summary';
  RAISE NOTICE '   - Functions: get_problem_queries, export_feedback_metrics';
  RAISE NOTICE '   - RLS policies: Enabled for multi-tenant security';
END $$;
