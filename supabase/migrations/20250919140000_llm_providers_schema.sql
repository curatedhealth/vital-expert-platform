-- LLM Providers and Management Schema
-- Migration: 20250919140000_llm_providers_schema.sql

-- Create enum types for LLM providers
CREATE TYPE provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'azure',
  'aws_bedrock',
  'cohere',
  'huggingface',
  'custom'
);

CREATE TYPE provider_status AS ENUM (
  'initializing',
  'active',
  'error',
  'maintenance',
  'disabled'
);

-- LLM Providers table
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(100) NOT NULL,
  provider_type provider_type NOT NULL,
  api_endpoint VARCHAR(500),
  api_key_encrypted TEXT, -- Encrypted API key
  model_id VARCHAR(200) NOT NULL,
  model_version VARCHAR(50),

  -- Capabilities
  capabilities JSONB DEFAULT '{
    "medical_knowledge": false,
    "code_generation": false,
    "image_understanding": false,
    "function_calling": false,
    "streaming": false,
    "context_window": 4096,
    "supports_phi": false
  }'::jsonb,

  -- Cost configuration
  cost_per_1k_input_tokens DECIMAL(10, 6) DEFAULT 0,
  cost_per_1k_output_tokens DECIMAL(10, 6) DEFAULT 0,

  -- Model configuration
  max_tokens INTEGER DEFAULT 4096,
  temperature_default DECIMAL(3, 2) DEFAULT 0.7,

  -- Rate limits
  rate_limit_rpm INTEGER DEFAULT 60, -- Requests per minute
  rate_limit_tpm INTEGER DEFAULT 10000, -- Tokens per minute
  rate_limit_concurrent INTEGER DEFAULT 10, -- Concurrent requests

  -- Priority and routing
  priority_level INTEGER DEFAULT 1, -- Lower = higher priority for fallbacks
  weight DECIMAL(3, 2) DEFAULT 1.0, -- Load balancing weight

  -- Status and health
  status provider_status DEFAULT 'initializing',
  is_active BOOLEAN DEFAULT true,
  is_hipaa_compliant BOOLEAN DEFAULT false,
  is_production_ready BOOLEAN DEFAULT false,

  -- Performance metrics
  medical_accuracy_score DECIMAL(5, 2), -- Percentage (0-100)
  average_latency_ms INTEGER,
  uptime_percentage DECIMAL(5, 2) DEFAULT 100.0,

  -- Health check configuration
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_interval_minutes INTEGER DEFAULT 5,
  health_check_timeout_seconds INTEGER DEFAULT 30,

  -- Custom headers and configuration
  custom_headers JSONB DEFAULT '{}'::jsonb,
  retry_config JSONB DEFAULT '{
    "max_retries": 3,
    "retry_delay_ms": 1000,
    "exponential_backoff": true,
    "backoff_multiplier": 2
  }'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT unique_provider_model UNIQUE(provider_type, model_id, api_endpoint),
  CONSTRAINT valid_priority CHECK (priority_level > 0),
  CONSTRAINT valid_weight CHECK (weight > 0 AND weight <= 10),
  CONSTRAINT valid_accuracy CHECK (medical_accuracy_score IS NULL OR (medical_accuracy_score >= 0 AND medical_accuracy_score <= 100)),
  CONSTRAINT valid_uptime CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100)
);

-- LLM Provider Health Checks table
CREATE TABLE llm_provider_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,

  -- Health check details
  check_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_healthy BOOLEAN NOT NULL,
  response_time_ms INTEGER,

  -- Test request details
  test_prompt TEXT DEFAULT 'Health check',
  test_response TEXT,
  test_tokens_used INTEGER,
  test_cost DECIMAL(10, 6),

  -- Error details (if unhealthy)
  error_type VARCHAR(100), -- 'timeout', 'auth_error', 'rate_limit', 'server_error', etc.
  error_message TEXT,
  error_code VARCHAR(50),

  -- HTTP details
  http_status_code INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- LLM Usage Logs table (enhanced version)
CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core references
  llm_provider_id UUID NOT NULL REFERENCES llm_providers(id),
  agent_id UUID REFERENCES agents(id),
  user_id UUID REFERENCES auth.users(id),

  -- Request identification
  request_id UUID NOT NULL,
  session_id UUID,
  parent_request_id UUID, -- For chained/follow-up requests

  -- Token usage
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Cost calculation
  cost_input DECIMAL(10, 6) DEFAULT 0,
  cost_output DECIMAL(10, 6) DEFAULT 0,
  total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (cost_input + cost_output) STORED,

  -- Performance metrics
  latency_ms INTEGER NOT NULL,
  queue_time_ms INTEGER DEFAULT 0, -- Time spent in queue before processing
  processing_time_ms INTEGER, -- Actual LLM processing time

  -- Request/Response details
  status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'error', 'timeout', 'rate_limited', 'cancelled'
  error_message TEXT,
  error_type VARCHAR(100),

  -- Medical/healthcare context
  medical_context VARCHAR(100), -- 'diagnosis', 'treatment', 'research', 'administrative'
  contains_phi BOOLEAN DEFAULT false,
  patient_context_id UUID, -- Reference to patient/case if applicable
  clinical_validation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'validated', 'rejected', 'not_required'

  -- Content metadata
  request_metadata JSONB DEFAULT '{}'::jsonb,
  response_metadata JSONB DEFAULT '{}'::jsonb,

  -- Confidence and quality scores
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  quality_score DECIMAL(3, 2), -- 0.00 to 1.00
  medical_accuracy_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Audit and compliance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Usage Quotas table
CREATE TABLE usage_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Entity being limited
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'agent', 'department', 'global', 'api_key'
  entity_id UUID, -- NULL for global quotas

  -- Quota definition
  quota_type VARCHAR(50) NOT NULL, -- 'tokens', 'requests', 'cost', 'concurrent'
  quota_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'annual'
  quota_limit DECIMAL(15, 2) NOT NULL,

  -- Current usage
  current_usage DECIMAL(15, 2) DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_end TIMESTAMP WITH TIME ZONE,

  -- Alert configuration
  alert_threshold_percent INTEGER DEFAULT 80, -- Alert when 80% of quota used
  hard_limit BOOLEAN DEFAULT false, -- Block requests if exceeded
  grace_requests INTEGER DEFAULT 0, -- Allow N requests over limit

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_reset TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT unique_entity_quota UNIQUE(entity_type, entity_id, quota_type, quota_period),
  CONSTRAINT valid_quota_limit CHECK (quota_limit > 0),
  CONSTRAINT valid_alert_threshold CHECK (alert_threshold_percent > 0 AND alert_threshold_percent <= 100)
);

-- Performance Metrics table
CREATE TABLE llm_provider_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,

  -- Time period
  metric_date DATE NOT NULL,
  metric_hour INTEGER, -- 0-23 for hourly metrics, NULL for daily

  -- Usage metrics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  cancelled_requests INTEGER DEFAULT 0,

  -- Token metrics
  total_input_tokens BIGINT DEFAULT 0,
  total_output_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT GENERATED ALWAYS AS (total_input_tokens + total_output_tokens) STORED,

  -- Cost metrics
  total_cost DECIMAL(15, 4) DEFAULT 0,
  avg_cost_per_request DECIMAL(10, 6),

  -- Performance metrics
  avg_latency_ms DECIMAL(10, 2),
  p50_latency_ms DECIMAL(10, 2),
  p95_latency_ms DECIMAL(10, 2),
  p99_latency_ms DECIMAL(10, 2),
  max_latency_ms INTEGER,

  -- Quality metrics
  avg_confidence_score DECIMAL(3, 2),
  avg_medical_accuracy DECIMAL(5, 2),

  -- Error analysis
  error_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN total_requests > 0
      THEN (failed_requests::decimal / total_requests) * 100
      ELSE 0
    END
  ) STORED,
  timeout_count INTEGER DEFAULT 0,
  rate_limit_count INTEGER DEFAULT 0,
  auth_error_count INTEGER DEFAULT 0,
  server_error_count INTEGER DEFAULT 0,

  -- Health metrics
  health_check_success_rate DECIMAL(5, 2),
  uptime_minutes INTEGER DEFAULT 1440, -- Default to full day

  -- Usage patterns
  unique_users_count INTEGER DEFAULT 0,
  unique_agents_count INTEGER DEFAULT 0,
  peak_concurrent_requests INTEGER DEFAULT 0,

  -- Medical/compliance metrics
  phi_requests_count INTEGER DEFAULT 0,
  clinical_validations_passed INTEGER DEFAULT 0,
  clinical_validations_failed INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_provider_metric_period UNIQUE(provider_id, metric_date, metric_hour),
  CONSTRAINT valid_metric_hour CHECK (metric_hour IS NULL OR (metric_hour >= 0 AND metric_hour <= 23))
);

-- Update trigger for llm_providers
CREATE OR REPLACE FUNCTION update_llm_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_llm_providers_updated_at
  BEFORE UPDATE ON llm_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_llm_provider_updated_at();

-- Function to calculate quota usage
CREATE OR REPLACE FUNCTION update_quota_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user quotas
  IF NEW.user_id IS NOT NULL THEN
    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_cost,
        updated_at = NOW()
    WHERE entity_type = 'user'
      AND entity_id = NEW.user_id
      AND quota_type = 'cost'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);

    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_tokens,
        updated_at = NOW()
    WHERE entity_type = 'user'
      AND entity_id = NEW.user_id
      AND quota_type = 'tokens'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);
  END IF;

  -- Update agent quotas
  IF NEW.agent_id IS NOT NULL THEN
    UPDATE usage_quotas
    SET current_usage = current_usage + NEW.total_cost,
        updated_at = NOW()
    WHERE entity_type = 'agent'
      AND entity_id = NEW.agent_id
      AND quota_type = 'cost'
      AND is_active = true
      AND period_start <= NEW.created_at
      AND (period_end IS NULL OR period_end > NEW.created_at);
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quota_usage_trigger
  AFTER INSERT ON llm_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_usage();

-- Function to aggregate daily metrics
CREATE OR REPLACE FUNCTION aggregate_daily_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO llm_provider_metrics (
    provider_id,
    metric_date,
    total_requests,
    successful_requests,
    failed_requests,
    total_input_tokens,
    total_output_tokens,
    total_cost,
    avg_cost_per_request,
    avg_latency_ms,
    p95_latency_ms,
    p99_latency_ms,
    max_latency_ms,
    timeout_count,
    rate_limit_count,
    unique_users_count,
    phi_requests_count
  )
  SELECT
    llm_provider_id,
    DATE(created_at) as metric_date,
    COUNT(*) as total_requests,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_requests,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost_per_request,
    AVG(latency_ms) as avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency_ms,
    MAX(latency_ms) as max_latency_ms,
    SUM(CASE WHEN status = 'timeout' THEN 1 ELSE 0 END) as timeout_count,
    SUM(CASE WHEN status = 'rate_limited' THEN 1 ELSE 0 END) as rate_limit_count,
    COUNT(DISTINCT user_id) as unique_users_count,
    SUM(CASE WHEN contains_phi THEN 1 ELSE 0 END) as phi_requests_count
  FROM llm_usage_logs
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY llm_provider_id, DATE(created_at)
  ON CONFLICT (provider_id, metric_date, metric_hour)
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    successful_requests = EXCLUDED.successful_requests,
    failed_requests = EXCLUDED.failed_requests,
    total_input_tokens = EXCLUDED.total_input_tokens,
    total_output_tokens = EXCLUDED.total_output_tokens,
    total_cost = EXCLUDED.total_cost,
    avg_cost_per_request = EXCLUDED.avg_cost_per_request,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms,
    p99_latency_ms = EXCLUDED.p99_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    timeout_count = EXCLUDED.timeout_count,
    rate_limit_count = EXCLUDED.rate_limit_count,
    unique_users_count = EXCLUDED.unique_users_count,
    phi_requests_count = EXCLUDED.phi_requests_count;
END;
$$ language 'plpgsql';

-- RLS Policies
ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_provider_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_provider_metrics ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage LLM providers
CREATE POLICY "Authenticated users can manage LLM providers"
  ON llm_providers
  FOR ALL
  TO authenticated
  USING (true);

-- Users can view active providers (for selection)
CREATE POLICY "Users can view active LLM providers"
  ON llm_providers
  FOR SELECT
  TO authenticated
  USING (is_active = true AND status = 'active');

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON llm_usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can view all usage logs
CREATE POLICY "Authenticated users can view all usage logs"
  ON llm_usage_logs
  FOR ALL
  TO authenticated
  USING (true);

-- Users can view their own quotas
CREATE POLICY "Users can view own quotas"
  ON usage_quotas
  FOR SELECT
  TO authenticated
  USING (
    (entity_type = 'user' AND entity_id = auth.uid()) OR
    (entity_type = 'global')
  );

-- Create indexes for performance
CREATE INDEX idx_llm_providers_active ON llm_providers(is_active, status) WHERE is_active = true;
CREATE INDEX idx_llm_providers_type ON llm_providers(provider_type);
CREATE INDEX idx_llm_providers_priority ON llm_providers(priority_level, weight) WHERE is_active = true;

CREATE INDEX idx_usage_logs_composite ON llm_usage_logs(llm_provider_id, created_at, status);
CREATE INDEX idx_usage_logs_user_date ON llm_usage_logs(user_id, created_at);
CREATE INDEX idx_usage_logs_agent_date ON llm_usage_logs(agent_id, created_at);

CREATE INDEX idx_quotas_entity ON usage_quotas(entity_type, entity_id) WHERE is_active = true;
CREATE INDEX idx_quotas_period ON usage_quotas(period_start, period_end) WHERE is_active = true;

CREATE INDEX idx_metrics_provider_date ON llm_provider_metrics(provider_id, metric_date);
CREATE INDEX idx_health_checks_recent ON llm_provider_health_checks(provider_id, check_timestamp);

-- Additional indexes for health checks
CREATE INDEX idx_health_provider_timestamp ON llm_provider_health_checks(provider_id, check_timestamp);
CREATE INDEX idx_health_timestamp ON llm_provider_health_checks(check_timestamp);
CREATE INDEX idx_health_status ON llm_provider_health_checks(is_healthy);

-- Additional indexes for usage logs
CREATE INDEX idx_usage_provider_date ON llm_usage_logs(llm_provider_id, created_at);
CREATE INDEX idx_usage_agent_date ON llm_usage_logs(agent_id, created_at);
CREATE INDEX idx_usage_user_date ON llm_usage_logs(user_id, created_at);
CREATE INDEX idx_usage_session ON llm_usage_logs(session_id);
CREATE INDEX idx_usage_request ON llm_usage_logs(request_id);
CREATE INDEX idx_usage_cost ON llm_usage_logs(total_cost);
CREATE INDEX idx_usage_phi ON llm_usage_logs(contains_phi);
CREATE INDEX idx_usage_medical_context ON llm_usage_logs(medical_context);
CREATE INDEX idx_usage_status ON llm_usage_logs(status);

-- Comments for documentation
COMMENT ON TABLE llm_providers IS 'Registry of all LLM providers and their configurations';
COMMENT ON TABLE llm_provider_health_checks IS 'Health monitoring logs for LLM providers';
COMMENT ON TABLE llm_usage_logs IS 'Detailed usage tracking for all LLM requests';
COMMENT ON TABLE usage_quotas IS 'Usage quotas and limits for users, agents, and departments';
COMMENT ON TABLE llm_provider_metrics IS 'Aggregated performance metrics for LLM providers';

COMMENT ON COLUMN llm_providers.api_key_encrypted IS 'API key encrypted using application-level encryption';
COMMENT ON COLUMN llm_providers.capabilities IS 'JSON object describing model capabilities and features';
COMMENT ON COLUMN llm_providers.retry_config IS 'JSON configuration for retry logic and backoff';
COMMENT ON COLUMN llm_usage_logs.contains_phi IS 'Flag indicating if request/response contained PHI (for HIPAA compliance)';
COMMENT ON COLUMN llm_usage_logs.clinical_validation_status IS 'Status of clinical validation for medical responses';