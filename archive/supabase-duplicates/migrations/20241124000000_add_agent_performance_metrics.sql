-- ============================================================================
-- VITAL Platform: Agent Performance Metrics
-- Migration: 20241124000000
-- Purpose: Enable evidence-based agent selection with performance tracking
-- ============================================================================

-- Add performance tracking columns to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  avg_response_quality numeric(3,2) DEFAULT 0.0
  CHECK (avg_response_quality BETWEEN 0 AND 1);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  total_interactions integer DEFAULT 0
  CHECK (total_interactions >= 0);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  avg_satisfaction_score numeric(3,2) DEFAULT 0.0
  CHECK (avg_satisfaction_score BETWEEN 0 AND 5);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  avg_response_time_ms integer DEFAULT 0
  CHECK (avg_response_time_ms >= 0);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  total_tokens_used bigint DEFAULT 0
  CHECK (total_tokens_used >= 0);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  last_interaction_at timestamptz;

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  interaction_id uuid, -- Can be null for anonymous feedback

  -- Quality Metrics
  response_quality_score numeric(3,2) CHECK (response_quality_score BETWEEN 0 AND 1),
  user_satisfaction_score integer CHECK (user_satisfaction_score BETWEEN 1 AND 5),
  task_completion_rate numeric(5,2) CHECK (task_completion_rate BETWEEN 0 AND 100),

  -- Performance Metrics
  response_time_ms integer CHECK (response_time_ms >= 0),
  tokens_used integer CHECK (tokens_used >= 0),
  cost_usd numeric(10,4) CHECK (cost_usd >= 0),

  -- Context
  query_text text,
  query_category text,
  feedback_text text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id
  ON agent_performance_metrics(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_performance_created_at
  ON agent_performance_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_performance_satisfaction
  ON agent_performance_metrics(user_satisfaction_score DESC);

CREATE INDEX IF NOT EXISTS idx_agent_performance_quality
  ON agent_performance_metrics(response_quality_score DESC);

-- Add interaction_id index if interactions table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'chat_interactions') THEN
    CREATE INDEX IF NOT EXISTS idx_agent_performance_interaction_id
      ON agent_performance_metrics(interaction_id);
  END IF;
END $$;

-- ============================================================================
-- Trigger: Update Agent Performance Averages
-- ============================================================================

CREATE OR REPLACE FUNCTION update_agent_performance_avg()
RETURNS TRIGGER AS $$
BEGIN
  -- Update aggregate metrics for the agent
  UPDATE agents SET
    avg_response_quality = COALESCE((
      SELECT AVG(response_quality_score)
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
        AND response_quality_score IS NOT NULL
    ), 0.0),

    avg_satisfaction_score = COALESCE((
      SELECT AVG(user_satisfaction_score)
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
        AND user_satisfaction_score IS NOT NULL
    ), 0.0),

    avg_response_time_ms = COALESCE((
      SELECT AVG(response_time_ms)::integer
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
        AND response_time_ms IS NOT NULL
    ), 0),

    total_interactions = COALESCE((
      SELECT COUNT(*)
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
    ), 0),

    total_tokens_used = COALESCE((
      SELECT SUM(tokens_used)
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
        AND tokens_used IS NOT NULL
    ), 0),

    last_interaction_at = COALESCE((
      SELECT MAX(created_at)
      FROM agent_performance_metrics
      WHERE agent_id = NEW.agent_id
    ), now()),

    updated_at = now()
  WHERE id = NEW.agent_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_agent_performance ON agent_performance_metrics;
CREATE TRIGGER trigger_update_agent_performance
  AFTER INSERT OR UPDATE ON agent_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_agent_performance_avg();

-- ============================================================================
-- Helper Function: Calculate Agent Performance Score (0-100)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_agent_performance_score(
  p_agent_id uuid
) RETURNS numeric AS $$
DECLARE
  v_quality_score numeric;
  v_satisfaction_score numeric;
  v_interaction_count integer;
  v_final_score numeric;
BEGIN
  SELECT
    avg_response_quality,
    avg_satisfaction_score,
    total_interactions
  INTO v_quality_score, v_satisfaction_score, v_interaction_count
  FROM agents
  WHERE id = p_agent_id;

  -- If no interactions, return 50 (neutral)
  IF v_interaction_count = 0 THEN
    RETURN 50.0;
  END IF;

  -- Weighted score:
  -- - Quality: 40% (0-1 scale → 0-40)
  -- - Satisfaction: 40% (1-5 scale → 0-40, normalized)
  -- - Interaction count bonus: 20% (log scale, caps at 100 interactions)
  v_final_score :=
    (v_quality_score * 40) +
    ((v_satisfaction_score / 5.0) * 40) +
    (LEAST(20, (LOG(v_interaction_count + 1) / LOG(100)) * 20));

  RETURN ROUND(v_final_score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Helper Function: Get Top Performing Agents
-- ============================================================================

CREATE OR REPLACE FUNCTION get_top_performing_agents(
  p_limit integer DEFAULT 10,
  p_min_interactions integer DEFAULT 5
) RETURNS TABLE (
  agent_id uuid,
  display_name text,
  tier integer,
  performance_score numeric,
  avg_satisfaction numeric,
  total_interactions integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.display_name,
    a.tier,
    calculate_agent_performance_score(a.id) as performance_score,
    a.avg_satisfaction_score,
    a.total_interactions
  FROM agents a
  WHERE a.total_interactions >= p_min_interactions
    AND a.status = 'active'
  ORDER BY calculate_agent_performance_score(a.id) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper View: Agent Performance Summary
-- ============================================================================

CREATE OR REPLACE VIEW v_agent_performance_summary AS
SELECT
  a.id,
  a.display_name,
  a.tier,
  a.status,
  a.total_interactions,
  a.avg_response_quality,
  a.avg_satisfaction_score,
  a.avg_response_time_ms,
  a.total_tokens_used,
  a.last_interaction_at,
  calculate_agent_performance_score(a.id) as performance_score,

  -- Recent performance (last 7 days)
  (SELECT AVG(user_satisfaction_score)
   FROM agent_performance_metrics
   WHERE agent_id = a.id
     AND created_at >= now() - interval '7 days'
  ) as recent_satisfaction_score,

  (SELECT COUNT(*)
   FROM agent_performance_metrics
   WHERE agent_id = a.id
     AND created_at >= now() - interval '7 days'
  ) as recent_interactions,

  -- Trend (comparing last 7 days vs previous 7 days)
  (
    SELECT
      CASE
        WHEN prev_avg = 0 THEN 0
        ELSE ROUND(((recent_avg - prev_avg) / prev_avg * 100), 2)
      END
    FROM (
      SELECT
        (SELECT AVG(user_satisfaction_score)
         FROM agent_performance_metrics
         WHERE agent_id = a.id
           AND created_at >= now() - interval '7 days'
        ) as recent_avg,
        (SELECT AVG(user_satisfaction_score)
         FROM agent_performance_metrics
         WHERE agent_id = a.id
           AND created_at >= now() - interval '14 days'
           AND created_at < now() - interval '7 days'
        ) as prev_avg
    ) t
  ) as satisfaction_trend_pct
FROM agents a
WHERE a.status != 'deprecated';

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert performance feedback"
  ON agent_performance_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all authenticated users to give feedback

-- Policy: Users can view all performance metrics (read-only)
CREATE POLICY "Users can view performance metrics"
  ON agent_performance_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins can update/delete metrics
CREATE POLICY "Admins can manage performance metrics"
  ON agent_performance_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- Sample Data (Development Only - Comment out for production)
-- ============================================================================

-- Uncomment below to insert sample performance data for testing
/*
DO $$
DECLARE
  v_agent_id uuid;
BEGIN
  -- Get a sample agent
  SELECT id INTO v_agent_id FROM agents LIMIT 1;

  IF v_agent_id IS NOT NULL THEN
    -- Insert sample metrics
    INSERT INTO agent_performance_metrics (
      agent_id,
      response_quality_score,
      user_satisfaction_score,
      response_time_ms,
      tokens_used,
      cost_usd,
      query_text,
      query_category
    ) VALUES
      (v_agent_id, 0.85, 4, 1200, 150, 0.03, 'What are the FDA requirements?', 'regulatory'),
      (v_agent_id, 0.92, 5, 900, 120, 0.025, 'Explain clinical trial phases', 'clinical'),
      (v_agent_id, 0.78, 4, 1500, 180, 0.035, 'Drug interaction check', 'safety');

    RAISE NOTICE 'Sample performance metrics inserted for agent %', v_agent_id;
  END IF;
END $$;
*/

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Add comment to migration tracking
COMMENT ON TABLE agent_performance_metrics IS
  'Tracks agent performance metrics for evidence-based selection. Updated: 2024-11-24';

COMMENT ON FUNCTION calculate_agent_performance_score IS
  'Calculates overall performance score (0-100) based on quality, satisfaction, and usage';

COMMENT ON FUNCTION get_top_performing_agents IS
  'Returns top N agents by performance score with minimum interaction threshold';

COMMENT ON VIEW v_agent_performance_summary IS
  'Comprehensive view of agent performance including trends and recent metrics';
