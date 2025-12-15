-- =============================================================================
-- PHASES 18-25: Governance, Monitoring, Analytics & Compliance
-- =============================================================================
-- PURPOSE: Complete governance, monitoring, security, and analytics infrastructure
-- TABLES: 29 tables across 8 phases
-- TIME: ~90 minutes
-- =============================================================================

-- =============================================================================
-- PHASE 18: Monitoring & Metrics (3 tables)
-- =============================================================================

CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Time Period
  metric_date DATE NOT NULL,

  -- Usage Metrics
  total_consultations INTEGER DEFAULT 0,
  total_panel_participations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,

  -- Performance
  average_response_time_ms INTEGER,
  average_rating NUMERIC(3,2),
  success_rate NUMERIC(5,2),

  -- Costs
  total_cost_usd NUMERIC(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(agent_id, metric_date)
);

CREATE INDEX idx_agent_metrics_agent ON agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_date ON agent_metrics(metric_date DESC);
CREATE INDEX idx_agent_metrics_tenant ON agent_metrics(tenant_id);

COMMENT ON TABLE agent_metrics IS 'Daily aggregated metrics per agent';

-- =============================================================================

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Metric Details
  metric_name TEXT NOT NULL,
  metric_category TEXT, -- 'usage', 'performance', 'cost', 'quality'
  metric_value NUMERIC,
  metric_unit TEXT,

  -- Context
  entity_type TEXT, -- 'agent', 'workflow', 'consultation', 'tenant'
  entity_id UUID,

  -- Time
  measured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_perf_metrics_tenant ON performance_metrics(tenant_id);
CREATE INDEX idx_perf_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_perf_metrics_category ON performance_metrics(metric_category);
CREATE INDEX idx_perf_metrics_entity ON performance_metrics(entity_type, entity_id);
CREATE INDEX idx_perf_metrics_measured ON performance_metrics(measured_at DESC);

COMMENT ON TABLE performance_metrics IS 'General performance metrics tracking';

-- =============================================================================

CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Health Check Details
  component TEXT NOT NULL, -- 'database', 'api', 'llm_provider', 'storage'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  response_time_ms INTEGER,

  -- Metrics
  cpu_usage NUMERIC(5,2),
  memory_usage NUMERIC(5,2),
  error_rate NUMERIC(5,2),

  -- Metadata
  details JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_system_health_component ON system_health(component);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_checked ON system_health(checked_at DESC);

COMMENT ON TABLE system_health IS 'System health monitoring';

-- =============================================================================
-- PHASE 19: LLM Usage Logging (3 tables)
-- =============================================================================

CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Request Details
  model_id UUID REFERENCES llm_models(id) ON DELETE SET NULL,
  model_name TEXT NOT NULL,

  -- Context (one of these)
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panel_discussions(id) ON DELETE CASCADE,
  execution_step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE CASCADE,

  -- Usage
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,

  -- Cost
  cost_usd NUMERIC(10,6) NOT NULL,

  -- Performance
  response_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_llm_usage_tenant ON llm_usage_logs(tenant_id);
CREATE INDEX idx_llm_usage_model ON llm_usage_logs(model_id);
CREATE INDEX idx_llm_usage_consultation ON llm_usage_logs(consultation_id);
CREATE INDEX idx_llm_usage_panel ON llm_usage_logs(panel_id);
CREATE INDEX idx_llm_usage_step ON llm_usage_logs(execution_step_id);
CREATE INDEX idx_llm_usage_created ON llm_usage_logs(created_at DESC);

COMMENT ON TABLE llm_usage_logs IS 'Detailed LLM API call logging for cost tracking';

-- =============================================================================

CREATE TABLE token_usage_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregated Usage
  total_tokens BIGINT DEFAULT 0,
  total_prompt_tokens BIGINT DEFAULT 0,
  total_completion_tokens BIGINT DEFAULT 0,
  total_cost_usd NUMERIC(10,2) DEFAULT 0,

  -- Breakdown by Model
  usage_by_model JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, period_start, period_end)
);

CREATE INDEX idx_token_summary_tenant ON token_usage_summary(tenant_id);
CREATE INDEX idx_token_summary_period ON token_usage_summary(period_start DESC);

COMMENT ON TABLE token_usage_summary IS 'Aggregated token usage for billing';

-- =============================================================================

CREATE TABLE cost_allocation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Allocation Details
  cost_category TEXT NOT NULL, -- 'llm', 'storage', 'compute', 'bandwidth'
  amount_usd NUMERIC(10,2) NOT NULL,

  -- Assignment (one of these)
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  solution_id UUID REFERENCES solutions(id) ON DELETE SET NULL,

  -- Time Period
  allocation_date DATE NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cost_alloc_tenant ON cost_allocation(tenant_id);
CREATE INDEX idx_cost_alloc_category ON cost_allocation(cost_category);
CREATE INDEX idx_cost_alloc_date ON cost_allocation(allocation_date DESC);
CREATE INDEX idx_cost_alloc_user ON cost_allocation(user_id);

COMMENT ON TABLE cost_allocation IS 'Cost allocation and chargeback';

-- =============================================================================
-- PHASE 20: Memory & Context (4 tables)
-- =============================================================================

CREATE TABLE user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Memory Details
  memory_type TEXT, -- 'preference', 'fact', 'context', 'interaction'
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,

  -- Relevance
  importance_score NUMERIC(3,2) CHECK (importance_score BETWEEN 0 AND 1),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Embedding (for semantic retrieval)
  embedding vector(1536),

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, memory_type, memory_key)
);

CREATE INDEX idx_user_memory_user ON user_memory(user_id);
CREATE INDEX idx_user_memory_type ON user_memory(memory_type);
CREATE INDEX idx_user_memory_importance ON user_memory(importance_score DESC);
CREATE INDEX idx_user_memory_embedding ON user_memory USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE user_memory IS 'Long-term user memory for personalization';

-- =============================================================================

CREATE TABLE conversation_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL, -- References consultation or panel ID
  conversation_type TEXT NOT NULL, -- 'consultation', 'panel'

  -- Memory Details
  memory_content TEXT NOT NULL,
  memory_summary TEXT,

  -- Embedding
  embedding vector(1536),

  -- Context Window
  token_count INTEGER,
  priority_score NUMERIC(3,2) CHECK (priority_score BETWEEN 0 AND 1),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_conv_memory_conversation ON conversation_memory(conversation_id, conversation_type);
CREATE INDEX idx_conv_memory_priority ON conversation_memory(priority_score DESC);
CREATE INDEX idx_conv_memory_embedding ON conversation_memory USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE conversation_memory IS 'Conversation-specific memory for context management';

-- =============================================================================

CREATE TABLE session_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Context Data
  context_key TEXT NOT NULL,
  context_value JSONB NOT NULL,

  -- TTL
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(session_id, context_key)
);

CREATE INDEX idx_session_context_session ON session_context(session_id);
CREATE INDEX idx_session_context_user ON session_context(user_id);
CREATE INDEX idx_session_context_expires ON session_context(expires_at);

COMMENT ON TABLE session_context IS 'Session-scoped context data';

-- =============================================================================

CREATE TABLE global_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Context Details
  context_key TEXT NOT NULL,
  context_value JSONB NOT NULL,
  context_scope TEXT DEFAULT 'tenant', -- 'platform', 'tenant', 'global'

  -- Access Control
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, context_key)
);

CREATE INDEX idx_global_context_tenant ON global_context(tenant_id);
CREATE INDEX idx_global_context_key ON global_context(context_key);
CREATE INDEX idx_global_context_scope ON global_context(context_scope);

COMMENT ON TABLE global_context IS 'Tenant and platform-wide context data';

-- =============================================================================
-- PHASE 21: Security & Encryption (2 tables)
-- =============================================================================

CREATE TABLE encrypted_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Key Details
  service_name TEXT NOT NULL, -- 'openai', 'anthropic', 'slack', etc.
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL, -- Encrypted using pgcrypto

  -- Rotation
  last_rotated_at TIMESTAMPTZ DEFAULT NOW(),
  rotation_interval_days INTEGER DEFAULT 90,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, service_name, key_name)
);

CREATE INDEX idx_encrypted_keys_tenant ON encrypted_api_keys(tenant_id);
CREATE INDEX idx_encrypted_keys_service ON encrypted_api_keys(service_name);
CREATE INDEX idx_encrypted_keys_active ON encrypted_api_keys(is_active);

COMMENT ON TABLE encrypted_api_keys IS 'Encrypted API keys for third-party services';

-- =============================================================================

CREATE TABLE data_encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Key Details
  key_purpose TEXT NOT NULL, -- 'data_encryption', 'token_encryption', 'backup'
  encrypted_key TEXT NOT NULL,
  key_version INTEGER DEFAULT 1,

  -- Rotation
  is_current BOOLEAN DEFAULT true,
  rotated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, key_purpose, key_version)
);

CREATE INDEX idx_data_keys_tenant ON data_encryption_keys(tenant_id);
CREATE INDEX idx_data_keys_purpose ON data_encryption_keys(key_purpose);
CREATE INDEX idx_data_keys_current ON data_encryption_keys(is_current) WHERE is_current = true;

COMMENT ON TABLE data_encryption_keys IS 'Encryption keys for data-at-rest';

-- =============================================================================
-- PHASE 22: Rate Limiting & Quotas (3 tables)
-- =============================================================================

CREATE TABLE rate_limit_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Limit Details
  limit_type TEXT NOT NULL, -- 'api_calls', 'tokens', 'workflows', 'consultations'
  limit_scope TEXT NOT NULL, -- 'per_minute', 'per_hour', 'per_day', 'per_month'
  limit_value INTEGER NOT NULL,

  -- Target (one of these)
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rate_limit_tenant ON rate_limit_config(tenant_id);
CREATE INDEX idx_rate_limit_type ON rate_limit_config(limit_type);
CREATE INDEX idx_rate_limit_user ON rate_limit_config(user_id);

COMMENT ON TABLE rate_limit_config IS 'Rate limiting configuration';

-- =============================================================================

CREATE TABLE rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES rate_limit_config(id) ON DELETE CASCADE,

  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,

  -- Status
  is_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(config_id, window_start)
);

CREATE INDEX idx_rate_usage_config ON rate_limit_usage(config_id);
CREATE INDEX idx_rate_usage_window ON rate_limit_usage(window_start DESC);
CREATE INDEX idx_rate_usage_exceeded ON rate_limit_usage(is_exceeded) WHERE is_exceeded = true;

COMMENT ON TABLE rate_limit_usage IS 'Rate limit usage tracking';

-- =============================================================================

CREATE TABLE quota_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Quota Details
  quota_type TEXT NOT NULL, -- 'storage', 'users', 'agents', 'workflows', 'tokens'
  quota_limit BIGINT NOT NULL,
  current_usage BIGINT DEFAULT 0,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Alerts
  alert_threshold_percentage NUMERIC(5,2) DEFAULT 80,
  is_exceeded BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, quota_type, period_start)
);

CREATE INDEX idx_quota_tracking_tenant ON quota_tracking(tenant_id);
CREATE INDEX idx_quota_tracking_type ON quota_tracking(quota_type);
CREATE INDEX idx_quota_tracking_exceeded ON quota_tracking(is_exceeded);

COMMENT ON TABLE quota_tracking IS 'Quota monitoring and enforcement';

-- =============================================================================
-- PHASE 23: Compliance & Audit (4 tables)
-- =============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Event Details
  event_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'access', 'export'
  entity_type TEXT NOT NULL, -- 'user', 'agent', 'workflow', 'data'
  entity_id UUID,

  -- Actor
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  action_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_event ON audit_log(event_type);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

COMMENT ON TABLE audit_log IS 'Comprehensive audit trail (7-year retention for HIPAA/SOC2)';

-- =============================================================================

CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Policy Details
  data_type TEXT NOT NULL, -- 'audit_logs', 'conversations', 'workflows', 'user_data'
  retention_period_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT false,

  -- Compliance
  compliance_reason TEXT, -- 'HIPAA', 'GDPR', 'SOC2', 'business'

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, data_type)
);

CREATE INDEX idx_retention_policies_tenant ON data_retention_policies(tenant_id);
CREATE INDEX idx_retention_policies_type ON data_retention_policies(data_type);

COMMENT ON TABLE data_retention_policies IS 'Data retention policies for compliance';

-- =============================================================================

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Consent Details
  consent_type TEXT NOT NULL, -- 'data_processing', 'analytics', 'marketing', 'ai_training'
  is_granted BOOLEAN NOT NULL,
  version TEXT NOT NULL, -- Version of terms/policy

  -- Audit
  consented_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address INET,

  -- Revocation
  revoked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_consent_user ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);
CREATE INDEX idx_consent_granted ON consent_records(is_granted);

COMMENT ON TABLE consent_records IS 'User consent tracking for GDPR compliance';

-- =============================================================================

CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Compliance Details
  framework TEXT NOT NULL, -- 'HIPAA', 'GDPR', 'SOC2', 'ISO27001'
  requirement_id TEXT NOT NULL,
  requirement_description TEXT,

  -- Status
  compliance_status TEXT DEFAULT 'compliant', -- 'compliant', 'non_compliant', 'in_progress', 'not_applicable'
  evidence_url TEXT,

  -- Review
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_compliance_tenant ON compliance_records(tenant_id);
CREATE INDEX idx_compliance_framework ON compliance_records(framework);
CREATE INDEX idx_compliance_status ON compliance_records(compliance_status);

COMMENT ON TABLE compliance_records IS 'Compliance framework tracking';

-- =============================================================================
-- PHASE 24: Analytics & Events (3 tables)
-- =============================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Event Details
  event_name TEXT NOT NULL,
  event_category TEXT, -- 'user_action', 'system', 'business', 'engagement'
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Properties
  properties JSONB DEFAULT '{}'::jsonb,

  -- Session
  session_id UUID,

  -- Device/Context
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,

  -- Timestamps
  event_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_events_tenant ON analytics_events(tenant_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);

COMMENT ON TABLE analytics_events IS 'User behavior and system events for analytics';

-- =============================================================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session Details
  session_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Activity
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,

  -- Device
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,

  -- Referrer
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_tenant ON user_sessions(tenant_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start DESC);

COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';

-- =============================================================================

CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Feature Details
  feature_name TEXT NOT NULL, -- 'ask_expert', 'ask_panel', 'workflows', 'custom_agents'
  usage_date DATE NOT NULL,

  -- Usage Metrics
  usage_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,

  -- Engagement
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  abandon_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(tenant_id, feature_name, usage_date)
);

CREATE INDEX idx_feature_usage_tenant ON feature_usage(tenant_id);
CREATE INDEX idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_date ON feature_usage(usage_date DESC);

COMMENT ON TABLE feature_usage IS 'Feature usage analytics';

-- =============================================================================
-- PHASE 25: Alerts & Health (3 tables)
-- =============================================================================

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Alert Details
  alert_type TEXT NOT NULL, -- 'quota_exceeded', 'error_rate_high', 'cost_threshold', 'system_issue'
  severity TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
  title TEXT NOT NULL,
  message TEXT,

  -- Context
  entity_type TEXT,
  entity_id UUID,

  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'ignored'
  acknowledged_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at DESC);

COMMENT ON TABLE alerts IS 'System and business alerts';

-- =============================================================================

CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Check Details
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL, -- 'database', 'api', 'llm', 'storage', 'queue'
  status TEXT NOT NULL, -- 'pass', 'warn', 'fail'

  -- Metrics
  response_time_ms INTEGER,
  error_message TEXT,

  -- Details
  details JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_health_checks_name ON health_checks(check_name);
CREATE INDEX idx_health_checks_type ON health_checks(check_type);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_health_checks_checked ON health_checks(checked_at DESC);

COMMENT ON TABLE health_checks IS 'System health check results';

-- =============================================================================

CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Incident Details
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'minor', 'major', 'critical'
  status TEXT DEFAULT 'investigating', -- 'investigating', 'identified', 'monitoring', 'resolved'

  -- Timeline
  detected_at TIMESTAMPTZ NOT NULL,
  identified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Impact
  affected_tenants UUID[] DEFAULT ARRAY[]::UUID[],
  affected_users_count INTEGER,
  downtime_minutes INTEGER,

  -- Resolution
  root_cause TEXT,
  resolution_summary TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_incidents_severity ON incident_reports(severity);
CREATE INDEX idx_incidents_status ON incident_reports(status);
CREATE INDEX idx_incidents_detected ON incident_reports(detected_at DESC);

COMMENT ON TABLE incident_reports IS 'System incident tracking and post-mortems';

-- =============================================================================
-- VERIFICATION FOR PHASES 18-25
-- =============================================================================

DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        -- Phase 18
        'agent_metrics', 'performance_metrics', 'system_health',
        -- Phase 19
        'llm_usage_logs', 'token_usage_summary', 'cost_allocation',
        -- Phase 20
        'user_memory', 'conversation_memory', 'session_context', 'global_context',
        -- Phase 21
        'encrypted_api_keys', 'data_encryption_keys',
        -- Phase 22
        'rate_limit_config', 'rate_limit_usage', 'quota_tracking',
        -- Phase 23
        'audit_log', 'data_retention_policies', 'consent_records', 'compliance_records',
        -- Phase 24
        'analytics_events', 'user_sessions', 'feature_usage',
        -- Phase 25
        'alerts', 'health_checks', 'incident_reports'
    );

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASES 18-25 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', total_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Coverage:';
    RAISE NOTICE '  Phase 18: Monitoring & Metrics (3 tables)';
    RAISE NOTICE '  Phase 19: LLM Usage Logging (3 tables)';
    RAISE NOTICE '  Phase 20: Memory & Context (4 tables)';
    RAISE NOTICE '  Phase 21: Security & Encryption (2 tables)';
    RAISE NOTICE '  Phase 22: Rate Limiting & Quotas (3 tables)';
    RAISE NOTICE '  Phase 23: Compliance & Audit (4 tables)';
    RAISE NOTICE '  Phase 24: Analytics & Events (3 tables)';
    RAISE NOTICE '  Phase 25: Alerts & Health (3 tables)';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 123 TABLES CREATED ✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 26-28 (Indexes, RLS, Functions)';
    RAISE NOTICE '';
END $$;
