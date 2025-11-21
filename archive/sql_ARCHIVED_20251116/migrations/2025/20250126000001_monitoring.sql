-- ============================================================================
-- Sprint 2: Monitoring Dashboard - Database Migration
-- Creates tables for metrics collection and cost tracking
-- ============================================================================

-- Extraction Metrics Table
-- Stores metrics for each extraction run
CREATE TABLE IF NOT EXISTS extraction_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID, -- FK to extraction_runs if exists
  total_entities INTEGER NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  confidence_avg DECIMAL(5,4) CHECK (confidence_avg >= 0 AND confidence_avg <= 1),
  api_cost_usd DECIMAL(10,6) NOT NULL CHECK (api_cost_usd >= 0),
  cache_hit_rate DECIMAL(5,4) CHECK (cache_hit_rate >= 0 AND cache_hit_rate <= 1),
  errors INTEGER DEFAULT 0 CHECK (errors >= 0),
  metadata JSONB, -- Additional metrics (entity types, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for extraction_metrics
CREATE INDEX idx_extraction_metrics_created ON extraction_metrics(created_at DESC);
CREATE INDEX idx_extraction_metrics_extraction_id ON extraction_metrics(extraction_id) WHERE extraction_id IS NOT NULL;
CREATE INDEX idx_extraction_metrics_cost ON extraction_metrics(api_cost_usd DESC);
CREATE INDEX idx_extraction_metrics_errors ON extraction_metrics(errors) WHERE errors > 0;

-- Cost Tracking Table
-- Tracks costs for all services (Gemini, Pinecone, Redis, Cohere)
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL CHECK (service IN ('gemini_api', 'pinecone', 'redis', 'cohere', 'other')),
  cost_usd DECIMAL(10,6) NOT NULL CHECK (cost_usd >= 0),
  operation_count INTEGER CHECK (operation_count >= 0),
  metadata JSONB, -- Additional info (model, tokens, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cost_tracking
CREATE INDEX idx_cost_tracking_service_date ON cost_tracking(service, created_at DESC);
CREATE INDEX idx_cost_tracking_created ON cost_tracking(created_at DESC);
CREATE INDEX idx_cost_tracking_service ON cost_tracking(service);

-- Alerts Table (optional - for storing alert history)
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'error_rate', 'cache_hit_rate', 'cost_spike', etc.
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  threshold_value DECIMAL(10,4),
  actual_value DECIMAL(10,4),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);

-- Indexes for monitoring_alerts
CREATE INDEX idx_monitoring_alerts_triggered ON monitoring_alerts(triggered_at DESC);
CREATE INDEX idx_monitoring_alerts_type ON monitoring_alerts(alert_type);
CREATE INDEX idx_monitoring_alerts_unresolved ON monitoring_alerts(resolved_at) WHERE resolved_at IS NULL;

-- Comments
COMMENT ON TABLE extraction_metrics IS 'Stores performance and quality metrics for each extraction run';
COMMENT ON TABLE cost_tracking IS 'Tracks API costs across all services for cost analytics';
COMMENT ON TABLE monitoring_alerts IS 'Stores monitoring alert history for tracking system health';

COMMENT ON COLUMN extraction_metrics.confidence_avg IS 'Average confidence score across all extracted entities (0.0 to 1.0)';
COMMENT ON COLUMN extraction_metrics.cache_hit_rate IS 'Percentage of cache hits for this extraction (0.0 to 1.0)';
COMMENT ON COLUMN cost_tracking.service IS 'Service identifier: gemini_api, pinecone, redis, cohere, or other';
COMMENT ON COLUMN monitoring_alerts.severity IS 'Alert severity level: info, warning, or critical';

-- Grant permissions (adjust based on your roles)
-- GRANT SELECT, INSERT ON extraction_metrics TO authenticated;
-- GRANT SELECT, INSERT ON cost_tracking TO authenticated;
-- GRANT SELECT ON monitoring_alerts TO authenticated;
