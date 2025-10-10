-- Rate Limiting Configuration Migration
-- This migration creates the rate limiting configuration table and related functions

-- Create rate_limit_config table
CREATE TABLE IF NOT EXISTS rate_limit_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'organization', 'global')),
  entity_id UUID,
  endpoint_pattern VARCHAR(255),
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  requests_per_minute INTEGER DEFAULT 100,
  burst_limit INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  UNIQUE(entity_type, entity_id, endpoint_pattern)
);

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  endpoint_pattern VARCHAR(255),
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_type VARCHAR(20) NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, endpoint_pattern, window_start, window_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_config_entity 
ON rate_limit_config(entity_type, entity_id, is_active);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_lookup 
ON rate_limit_tracking(entity_type, entity_id, endpoint_pattern, window_start, window_type);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_cleanup 
ON rate_limit_tracking(window_start, window_type);

-- Enable RLS
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_limit_config
CREATE POLICY "Admin can manage rate limit config" ON rate_limit_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for rate_limit_tracking (read-only for admins)
CREATE POLICY "Admin can view rate limit tracking" ON rate_limit_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function to get rate limit configuration
CREATE OR REPLACE FUNCTION get_rate_limit_config(
  p_entity_type VARCHAR(50),
  p_entity_id UUID DEFAULT NULL,
  p_endpoint_pattern VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
  requests_per_minute INTEGER,
  requests_per_hour INTEGER,
  requests_per_day INTEGER,
  burst_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(rlc.requests_per_minute, 100) as requests_per_minute,
    COALESCE(rlc.requests_per_hour, 1000) as requests_per_hour,
    COALESCE(rlc.requests_per_day, 10000) as requests_per_day,
    COALESCE(rlc.burst_limit, 200) as burst_limit
  FROM rate_limit_config rlc
  WHERE rlc.is_active = true
    AND rlc.entity_type = p_entity_type
    AND (rlc.entity_id = p_entity_id OR rlc.entity_id IS NULL)
    AND (rlc.endpoint_pattern = p_endpoint_pattern OR rlc.endpoint_pattern IS NULL)
  ORDER BY 
    CASE WHEN rlc.entity_id IS NOT NULL THEN 1 ELSE 2 END,
    CASE WHEN rlc.endpoint_pattern IS NOT NULL THEN 1 ELSE 2 END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_endpoint_pattern VARCHAR(255) DEFAULT NULL,
  p_window_type VARCHAR(20) DEFAULT 'hour'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_config RECORD;
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_limit INTEGER;
BEGIN
  -- Get rate limit configuration
  SELECT * INTO v_config FROM get_rate_limit_config(p_entity_type, p_entity_id, p_endpoint_pattern);
  
  -- Calculate window start
  CASE p_window_type
    WHEN 'minute' THEN
      v_window_start := date_trunc('minute', NOW());
      v_limit := v_config.requests_per_minute;
    WHEN 'hour' THEN
      v_window_start := date_trunc('hour', NOW());
      v_limit := v_config.requests_per_hour;
    WHEN 'day' THEN
      v_window_start := date_trunc('day', NOW());
      v_limit := v_config.requests_per_day;
    ELSE
      RETURN false;
  END CASE;
  
  -- Get current count for this window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM rate_limit_tracking
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND (endpoint_pattern = p_endpoint_pattern OR (endpoint_pattern IS NULL AND p_endpoint_pattern IS NULL))
    AND window_start = v_window_start
    AND window_type = p_window_type;
  
  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO rate_limit_tracking (entity_type, entity_id, endpoint_pattern, window_start, window_type)
  VALUES (p_entity_type, p_entity_id, p_endpoint_pattern, v_window_start, p_window_type)
  ON CONFLICT (entity_type, entity_id, endpoint_pattern, window_start, window_type)
  DO UPDATE SET request_count = rate_limit_tracking.request_count + 1;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit tracking data
CREATE OR REPLACE FUNCTION cleanup_rate_limit_tracking()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete tracking data older than 7 days
  DELETE FROM rate_limit_tracking
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default rate limit configurations
INSERT INTO rate_limit_config (entity_type, entity_id, endpoint_pattern, requests_per_minute, requests_per_hour, requests_per_day, burst_limit, created_by)
VALUES 
  ('global', NULL, NULL, 100, 1000, 10000, 200, NULL),
  ('user', NULL, '/api/admin/*', 10, 100, 1000, 20, NULL),
  ('user', NULL, '/api/orchestrator/*', 20, 200, 2000, 50, NULL),
  ('organization', NULL, NULL, 1000, 10000, 100000, 2000, NULL);

-- Create a scheduled job to clean up old tracking data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_rate_limit_tracking();');
