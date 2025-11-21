-- ============================================================================
-- VITAL Unified Intelligence: Analytics Schema Migration
-- Date: 2025-11-04
-- Purpose: Create TimescaleDB-powered unified analytics warehouse
-- 
-- This migration creates the foundation for:
-- - Real-time event collection
-- - Cost attribution & tracking
-- - Quality monitoring
-- - Tenant health scoring
-- - Predictive analytics
-- ============================================================================

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- ============================================================================
-- 1. PLATFORM EVENTS TABLE
-- Purpose: Unified event stream for all platform activities
-- Retention: 3 years
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics.platform_events (
  time TIMESTAMPTZ NOT NULL,
  event_id UUID DEFAULT gen_random_uuid(),
  
  -- Context
  tenant_id UUID NOT NULL,
  user_id UUID,
  session_id UUID,
  
  -- Event Classification
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN (
    'user_behavior',
    'agent_performance', 
    'system_health',
    'business_metric'
  )),
  
  -- Event Data
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Attribution
  source TEXT, -- 'ask_expert' | 'ask_panel' | 'workflow' | 'solution_builder'
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable(
  'analytics.platform_events', 
  'time',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_platform_events_tenant_time 
  ON analytics.platform_events (tenant_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_platform_events_user_time 
  ON analytics.platform_events (user_id, time DESC) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_events_type 
  ON analytics.platform_events (event_type, time DESC);

CREATE INDEX IF NOT EXISTS idx_platform_events_category_time 
  ON analytics.platform_events (event_category, time DESC);

CREATE INDEX IF NOT EXISTS idx_platform_events_session 
  ON analytics.platform_events (session_id, time DESC) 
  WHERE session_id IS NOT NULL;

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_platform_events_event_data 
  ON analytics.platform_events USING GIN (event_data);

-- Set retention policy: 3 years
SELECT add_retention_policy(
  'analytics.platform_events', 
  INTERVAL '3 years',
  if_not_exists => TRUE
);

-- Enable compression after 30 days
ALTER TABLE analytics.platform_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,event_category'
);

SELECT add_compression_policy(
  'analytics.platform_events', 
  INTERVAL '30 days',
  if_not_exists => TRUE
);

-- ============================================================================
-- 2. TENANT COST EVENTS TABLE
-- Purpose: Track all costs for billing and attribution
-- Retention: 7 years (compliance/tax)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics.tenant_cost_events (
  time TIMESTAMPTZ NOT NULL,
  cost_event_id UUID DEFAULT gen_random_uuid(),
  
  -- Context
  tenant_id UUID NOT NULL,
  user_id UUID,
  session_id UUID,
  
  -- Cost Classification
  cost_type TEXT NOT NULL CHECK (cost_type IN (
    'llm',
    'embedding',
    'storage',
    'compute',
    'search',
    'other'
  )),
  
  -- Cost Details
  cost_usd DECIMAL(10, 4) NOT NULL,
  quantity INTEGER, -- tokens, documents, queries, etc.
  unit_price DECIMAL(10, 6), -- cost per unit
  
  -- Service Attribution
  service TEXT NOT NULL, -- 'openai' | 'pinecone' | 'modal' | 'vercel' | 'supabase'
  service_tier TEXT, -- 'gpt-4' | 'gpt-4-turbo' | 'ada-002' | etc.
  
  -- Request Context
  request_id UUID,
  agent_id TEXT,
  query_id UUID,
  
  -- Additional Data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Convert to hypertable
SELECT create_hypertable(
  'analytics.tenant_cost_events', 
  'time',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cost_events_tenant_time 
  ON analytics.tenant_cost_events (tenant_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_cost_events_user_time 
  ON analytics.tenant_cost_events (user_id, time DESC) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cost_events_type_time 
  ON analytics.tenant_cost_events (cost_type, time DESC);

CREATE INDEX IF NOT EXISTS idx_cost_events_service_time 
  ON analytics.tenant_cost_events (service, time DESC);

CREATE INDEX IF NOT EXISTS idx_cost_events_agent 
  ON analytics.tenant_cost_events (agent_id, time DESC) 
  WHERE agent_id IS NOT NULL;

-- Set retention policy: 7 years (tax compliance)
SELECT add_retention_policy(
  'analytics.tenant_cost_events', 
  INTERVAL '7 years',
  if_not_exists => TRUE
);

-- Enable compression after 90 days
ALTER TABLE analytics.tenant_cost_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,cost_type'
);

SELECT add_compression_policy(
  'analytics.tenant_cost_events', 
  INTERVAL '90 days',
  if_not_exists => TRUE
);

-- ============================================================================
-- 3. AGENT EXECUTIONS TABLE
-- Purpose: Track agent performance, quality, and success rates
-- Retention: 3 years
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics.agent_executions (
  time TIMESTAMPTZ NOT NULL,
  execution_id UUID DEFAULT gen_random_uuid(),
  
  -- Context
  tenant_id UUID NOT NULL,
  user_id UUID,
  session_id UUID,
  
  -- Agent Identity
  agent_id TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- 'ask_expert' | 'workflow' | 'custom'
  agent_version TEXT,
  
  -- Execution Metrics
  execution_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_type TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Quality Metrics
  quality_score DECIMAL(3, 2), -- 0.00 to 1.00 (RAGAS score)
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  citation_accuracy DECIMAL(3, 2),
  hallucination_detected BOOLEAN DEFAULT FALSE,
  compliance_score DECIMAL(3, 2),
  
  -- Cost
  cost_usd DECIMAL(10, 4),
  total_tokens INTEGER,
  
  -- Request Details
  query_id UUID,
  query_length INTEGER,
  response_length INTEGER,
  
  -- Additional Data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Convert to hypertable
SELECT create_hypertable(
  'analytics.agent_executions', 
  'time',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_executions_tenant_time 
  ON analytics.agent_executions (tenant_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_agent_executions_user_time 
  ON analytics.agent_executions (user_id, time DESC) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_time 
  ON analytics.agent_executions (agent_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_agent_executions_success_time 
  ON analytics.agent_executions (success, time DESC);

CREATE INDEX IF NOT EXISTS idx_agent_executions_error_time 
  ON analytics.agent_executions (error_type, time DESC) 
  WHERE error_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agent_executions_quality 
  ON analytics.agent_executions (quality_score, time DESC) 
  WHERE quality_score IS NOT NULL;

-- Set retention policy: 3 years
SELECT add_retention_policy(
  'analytics.agent_executions', 
  INTERVAL '3 years',
  if_not_exists => TRUE
);

-- Enable compression after 30 days
ALTER TABLE analytics.agent_executions SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id,agent_id'
);

SELECT add_compression_policy(
  'analytics.agent_executions', 
  INTERVAL '30 days',
  if_not_exists => TRUE
);

-- ============================================================================
-- 4. MATERIALIZED VIEWS FOR FAST QUERIES
-- ============================================================================

-- Tenant Daily Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.tenant_daily_summary AS
SELECT
  time_bucket('1 day', time) AS day,
  tenant_id,
  COUNT(*) AS total_events,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(DISTINCT session_id) AS unique_sessions,
  SUM(CASE WHEN event_category = 'user_behavior' THEN 1 ELSE 0 END) AS user_events,
  SUM(CASE WHEN event_category = 'agent_performance' THEN 1 ELSE 0 END) AS agent_events,
  SUM(CASE WHEN event_category = 'system_health' THEN 1 ELSE 0 END) AS system_events
FROM analytics.platform_events
GROUP BY day, tenant_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_daily_summary_day_tenant 
  ON analytics.tenant_daily_summary (day, tenant_id);

-- Tenant Cost Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.tenant_cost_summary AS
SELECT
  time_bucket('1 day', time) AS day,
  tenant_id,
  cost_type,
  service,
  SUM(cost_usd) AS total_cost,
  SUM(quantity) AS total_quantity,
  COUNT(*) AS event_count,
  AVG(cost_usd) AS avg_cost,
  MAX(cost_usd) AS max_cost
FROM analytics.tenant_cost_events
GROUP BY day, tenant_id, cost_type, service;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_cost_summary_day_tenant_type_service 
  ON analytics.tenant_cost_summary (day, tenant_id, cost_type, service);

-- Agent Performance Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.agent_performance_summary AS
SELECT
  time_bucket('1 hour', time) AS hour,
  tenant_id,
  agent_id,
  agent_type,
  COUNT(*) AS execution_count,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) AS success_count,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS failure_count,
  ROUND(AVG(execution_time_ms)::numeric, 2) AS avg_execution_time_ms,
  ROUND(AVG(quality_score)::numeric, 2) AS avg_quality_score,
  ROUND(AVG(user_rating)::numeric, 2) AS avg_user_rating,
  SUM(cost_usd) AS total_cost,
  SUM(total_tokens) AS total_tokens
FROM analytics.agent_executions
GROUP BY hour, tenant_id, agent_id, agent_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_performance_summary_hour_tenant_agent 
  ON analytics.agent_performance_summary (hour, tenant_id, agent_id);

-- ============================================================================
-- 5. CONTINUOUS AGGREGATES (Real-time rollups)
-- ============================================================================

-- Real-time tenant metrics (5-minute rollup)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.tenant_metrics_realtime
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('5 minutes', time) AS bucket,
  tenant_id,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(DISTINCT session_id) AS active_sessions
FROM analytics.platform_events
GROUP BY bucket, tenant_id;

-- Add refresh policy (refresh last 1 hour every 5 minutes)
SELECT add_continuous_aggregate_policy(
  'analytics.tenant_metrics_realtime',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '5 minutes',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);

-- Real-time cost metrics (5-minute rollup)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.cost_metrics_realtime
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('5 minutes', time) AS bucket,
  tenant_id,
  cost_type,
  SUM(cost_usd) AS total_cost,
  COUNT(*) AS transaction_count
FROM analytics.tenant_cost_events
GROUP BY bucket, tenant_id, cost_type;

SELECT add_continuous_aggregate_policy(
  'analytics.cost_metrics_realtime',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '5 minutes',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Get tenant cost for date range
CREATE OR REPLACE FUNCTION analytics.get_tenant_cost(
  p_tenant_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS DECIMAL(10, 4) AS $$
  SELECT COALESCE(SUM(cost_usd), 0)
  FROM analytics.tenant_cost_events
  WHERE tenant_id = p_tenant_id
    AND time >= p_start_time
    AND time < p_end_time;
$$ LANGUAGE SQL STABLE;

-- Get agent success rate
CREATE OR REPLACE FUNCTION analytics.get_agent_success_rate(
  p_agent_id TEXT,
  p_tenant_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS DECIMAL(5, 2) AS $$
  SELECT CASE 
    WHEN COUNT(*) = 0 THEN 100.00
    ELSE ROUND((SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100)::numeric, 2)
  END
  FROM analytics.agent_executions
  WHERE agent_id = p_agent_id
    AND tenant_id = p_tenant_id
    AND time >= NOW() - (p_hours || ' hours')::INTERVAL;
$$ LANGUAGE SQL STABLE;

-- Get tenant engagement score (0-100)
CREATE OR REPLACE FUNCTION analytics.get_tenant_engagement(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS DECIMAL(5, 2) AS $$
  WITH engagement_data AS (
    SELECT 
      COUNT(DISTINCT user_id) AS active_users,
      COUNT(DISTINCT session_id) AS sessions,
      COUNT(*) AS total_events
    FROM analytics.platform_events
    WHERE tenant_id = p_tenant_id
      AND event_category = 'user_behavior'
      AND time >= NOW() - (p_days || ' days')::INTERVAL
  )
  SELECT 
    LEAST(
      100.00,
      ROUND((
        (active_users * 10) + 
        (sessions * 2) + 
        (total_events * 0.1)
      )::numeric, 2)
    )
  FROM engagement_data;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 7. REFRESH POLICIES FOR MATERIALIZED VIEWS
-- ============================================================================

-- Refresh tenant daily summary every hour
CREATE OR REPLACE FUNCTION analytics.refresh_tenant_daily_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.tenant_daily_summary;
END;
$$ LANGUAGE plpgsql;

-- Refresh tenant cost summary every hour
CREATE OR REPLACE FUNCTION analytics.refresh_tenant_cost_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.tenant_cost_summary;
END;
$$ LANGUAGE plpgsql;

-- Refresh agent performance summary every 15 minutes
CREATE OR REPLACE FUNCTION analytics.refresh_agent_performance_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.agent_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant read access to analytics schema
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO authenticated;
GRANT SELECT ON ALL MATERIALIZED VIEWS IN SCHEMA analytics TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA analytics TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON SCHEMA analytics IS 'Unified analytics warehouse powered by TimescaleDB for VITAL Intelligence System';
COMMENT ON TABLE analytics.platform_events IS 'Unified event stream for all platform activities (3-year retention)';
COMMENT ON TABLE analytics.tenant_cost_events IS 'Cost tracking for billing and attribution (7-year retention)';
COMMENT ON TABLE analytics.agent_executions IS 'Agent performance, quality, and success tracking (3-year retention)';

