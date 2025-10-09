-- VITAL Platform Token Tracking - LangChain/LangGraph/LangSmith Integration
-- Supabase Migration Script v2.0
-- Supports: 1:1 Conversations, Virtual Panels, Workflows, Solution Builder

-- ============================================
-- 1. ENHANCED TOKEN USAGE LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS token_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Service Context (NEW)
    service_type TEXT NOT NULL CHECK (service_type IN ('1:1_conversation', 'virtual_panel', 'workflow', 'solution_builder')),
    service_id TEXT NOT NULL,
    
    -- Agent context
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    agent_tier INTEGER NOT NULL CHECK (agent_tier BETWEEN 1 AND 3),
    agent_type TEXT,
    agent_role TEXT,  -- 'direct_conversation', 'panel_member', 'workflow_step', 'solution_synthesizer'
    
    -- Workflow Context (NEW - for 'workflow' and 'solution_builder' services)
    workflow_id TEXT,
    workflow_name TEXT,
    workflow_step INTEGER,
    workflow_step_name TEXT,
    parent_workflow_id TEXT,  -- For nested workflows in solution_builder
    
    -- Panel Context (NEW - for 'virtual_panel' service)
    panel_id TEXT,
    panel_name TEXT,
    panel_member_position INTEGER,
    total_panel_members INTEGER,
    
    -- User context
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    organization_id UUID,
    
    -- LangSmith Integration (NEW)
    langsmith_run_id TEXT,
    langsmith_trace_id TEXT,
    langsmith_parent_run_id TEXT,
    
    -- LLM provider details
    provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'azure_openai', 'huggingface', 'custom')),
    model_name TEXT NOT NULL,
    model_version TEXT,
    
    -- Token metrics
    prompt_tokens INTEGER NOT NULL CHECK (prompt_tokens >= 0),
    completion_tokens INTEGER NOT NULL CHECK (completion_tokens >= 0),
    total_tokens INTEGER GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
    
    -- Cost metrics (USD)
    input_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    output_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (input_cost + output_cost) STORED,
    
    -- Performance metrics
    latency_ms INTEGER,
    cache_hit BOOLEAN DEFAULT FALSE,
    
    -- Request metadata
    request_type TEXT DEFAULT 'completion' CHECK (request_type IN ('completion', 'embedding', 'fine_tune', 'tool_call')),
    success BOOLEAN DEFAULT TRUE,
    error_code TEXT,
    error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_agent_id ON token_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_session_id ON token_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_provider ON token_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_token_usage_cost ON token_usage_logs(total_cost DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_service_type ON token_usage_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_token_usage_workflow_id ON token_usage_logs(workflow_id) WHERE workflow_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_panel_id ON token_usage_logs(panel_id) WHERE panel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_token_usage_langsmith_run ON token_usage_logs(langsmith_run_id) WHERE langsmith_run_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_token_usage_user_service_date 
    ON token_usage_logs(user_id, service_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage logs" 
    ON token_usage_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage logs" 
    ON token_usage_logs FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Service role can view all usage logs" 
    ON token_usage_logs FOR SELECT 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. BUDGET LIMITS TABLE (unchanged)
-- ============================================

CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'session', 'agent', 'tier', 'organization', 'service')),
    entity_id TEXT NOT NULL,
    
    hourly_limit DECIMAL(10, 2),
    daily_limit DECIMAL(10, 2),
    monthly_limit DECIMAL(10, 2),
    
    soft_limit_hourly DECIMAL(10, 2),
    soft_limit_daily DECIMAL(10, 2),
    soft_limit_monthly DECIMAL(10, 2),
    
    action_on_breach TEXT DEFAULT 'alert' CHECK (action_on_breach IN ('block', 'alert', 'throttle', 'downgrade')),
    
    alert_email TEXT,
    alert_slack_webhook TEXT,
    alert_enabled BOOLEAN DEFAULT TRUE,
    
    notes TEXT,
    
    UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_budget_limits_entity ON budget_limits(entity_type, entity_id);

ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget limits" 
    ON budget_limits FOR SELECT 
    USING (
        (entity_type = 'user' AND entity_id = auth.uid()::TEXT)
        OR auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Service role can manage budget limits" 
    ON budget_limits FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. COST ALERTS TABLE (unchanged)
-- ============================================

CREATE TABLE IF NOT EXISTS cost_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_warning', 'budget_exceeded', 'anomaly', 'high_cost_call')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    
    threshold_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) NOT NULL,
    utilization_pct DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN threshold_amount > 0 THEN (current_amount / threshold_amount * 100)
            ELSE 0
        END
    ) STORED,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_taken TEXT,
    
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledgment_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cost_alerts_created_at ON cost_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_entity ON cost_alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cost_alerts_acknowledged ON cost_alerts(acknowledged) WHERE NOT acknowledged;
CREATE INDEX IF NOT EXISTS idx_cost_alerts_severity ON cost_alerts(severity);

ALTER TABLE cost_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts related to them" 
    ON cost_alerts FOR SELECT 
    USING (
        (entity_type = 'user' AND entity_id = auth.uid()::TEXT)
        OR auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Service role can manage alerts" 
    ON cost_alerts FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 4. SERVICE PERFORMANCE METRICS (NEW)
-- ============================================

CREATE TABLE IF NOT EXISTS service_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    
    -- Call statistics
    total_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_calls > 0 THEN (successful_calls::DECIMAL / total_calls * 100)
            ELSE 0
        END
    ) STORED,
    
    -- Token statistics
    total_tokens BIGINT DEFAULT 0,
    avg_tokens_per_call INTEGER,
    
    -- Cost statistics
    total_cost DECIMAL(10, 2) DEFAULT 0,
    avg_cost_per_call DECIMAL(10, 6),
    
    -- Performance statistics
    avg_latency_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (service_type, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_service_perf_date ON service_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_perf_type ON service_performance_metrics(service_type);

ALTER TABLE service_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service performance metrics" 
    ON service_performance_metrics FOR SELECT 
    USING (true);

CREATE POLICY "Service role can manage service metrics" 
    ON service_performance_metrics FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 5. WORKFLOW ANALYTICS (NEW)
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Workflow execution stats
    total_steps INTEGER NOT NULL,
    completed_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    
    -- Cost breakdown
    total_cost DECIMAL(10, 2) DEFAULT 0,
    cost_by_step JSONB,  -- {"step_1": 0.05, "step_2": 0.08, ...}
    
    -- Performance
    total_duration_ms INTEGER,
    avg_step_duration_ms INTEGER,
    
    -- User context
    user_id UUID NOT NULL REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    
    -- Status
    status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    
    UNIQUE (workflow_id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_analytics_user ON workflow_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_status ON workflow_analytics(status);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_created ON workflow_analytics(created_at DESC);

ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow analytics" 
    ON workflow_analytics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage workflow analytics" 
    ON workflow_analytics FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 6. MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- Service type breakdown
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_service_costs AS
SELECT
    date_trunc('day', created_at) as day,
    service_type,
    COUNT(*) as total_calls,
    SUM(total_tokens) as total_tokens,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost_per_call,
    AVG(latency_ms) as avg_latency
FROM token_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY day, service_type
ORDER BY day DESC, service_type;

CREATE UNIQUE INDEX ON mv_service_costs (day, service_type);

-- Workflow efficiency
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_workflow_efficiency AS
SELECT
    workflow_id,
    workflow_name,
    workflow_step,
    workflow_step_name,
    COUNT(*) as executions,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost,
    AVG(latency_ms) as avg_latency,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100 as success_rate
FROM token_usage_logs
WHERE service_type IN ('workflow', 'solution_builder')
  AND workflow_id IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY workflow_id, workflow_name, workflow_step, workflow_step_name
ORDER BY workflow_id, workflow_step;

CREATE UNIQUE INDEX ON mv_workflow_efficiency (workflow_id, workflow_step);

-- Panel performance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_panel_performance AS
SELECT
    panel_id,
    panel_name,
    panel_member_position,
    agent_name,
    COUNT(*) as contributions,
    SUM(total_cost) as total_cost,
    AVG(total_tokens) as avg_tokens,
    AVG(latency_ms) as avg_latency
FROM token_usage_logs
WHERE service_type = 'virtual_panel'
  AND panel_id IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY panel_id, panel_name, panel_member_position, agent_name
ORDER BY panel_id, panel_member_position;

CREATE UNIQUE INDEX ON mv_panel_performance (panel_id, panel_member_position);

-- User service usage
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_service_usage AS
SELECT
    user_id,
    service_type,
    date_trunc('day', created_at) as day,
    COUNT(*) as calls,
    SUM(total_cost) as daily_cost
FROM token_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY user_id, service_type, day
ORDER BY user_id, service_type, day DESC;

CREATE UNIQUE INDEX ON mv_user_service_usage (user_id, service_type, day);

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- Enhanced budget check function
CREATE OR REPLACE FUNCTION check_user_budget(
    p_user_id UUID,
    p_session_id TEXT,
    p_estimated_cost DECIMAL
) RETURNS TABLE (
    allowed BOOLEAN,
    reason TEXT,
    remaining_budget DECIMAL
) AS $$
DECLARE
    v_session_limit DECIMAL;
    v_session_spent DECIMAL;
    v_daily_limit DECIMAL;
    v_daily_spent DECIMAL;
    v_monthly_limit DECIMAL;
    v_monthly_spent DECIMAL;
BEGIN
    -- Session limit
    SELECT daily_limit INTO v_session_limit
    FROM budget_limits
    WHERE entity_type = 'session' AND entity_id = p_session_id;
    
    v_session_limit := COALESCE(v_session_limit, 999999.99);
    
    SELECT COALESCE(SUM(total_cost), 0) INTO v_session_spent
    FROM token_usage_logs
    WHERE session_id = p_session_id;
    
    IF v_session_spent + p_estimated_cost > v_session_limit THEN
        RETURN QUERY SELECT FALSE, 'Session budget exceeded', v_session_limit - v_session_spent;
        RETURN;
    END IF;
    
    -- Daily limit
    SELECT daily_limit INTO v_daily_limit
    FROM budget_limits
    WHERE entity_type = 'user' AND entity_id = p_user_id::TEXT;
    
    v_daily_limit := COALESCE(v_daily_limit, 999999.99);
    
    SELECT COALESCE(SUM(total_cost), 0) INTO v_daily_spent
    FROM token_usage_logs
    WHERE user_id = p_user_id AND created_at >= CURRENT_DATE;
    
    IF v_daily_spent + p_estimated_cost > v_daily_limit THEN
        RETURN QUERY SELECT FALSE, 'Daily budget exceeded', v_daily_limit - v_daily_spent;
        RETURN;
    END IF;
    
    -- Monthly limit
    SELECT monthly_limit INTO v_monthly_limit
    FROM budget_limits
    WHERE entity_type = 'user' AND entity_id = p_user_id::TEXT;
    
    v_monthly_limit := COALESCE(v_monthly_limit, 999999.99);
    
    SELECT COALESCE(SUM(total_cost), 0) INTO v_monthly_spent
    FROM token_usage_logs
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);
    
    IF v_monthly_spent + p_estimated_cost > v_monthly_limit THEN
        RETURN QUERY SELECT FALSE, 'Monthly budget exceeded', v_monthly_limit - v_monthly_spent;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Within budget', LEAST(
        v_session_limit - v_session_spent,
        v_daily_limit - v_daily_spent,
        v_monthly_limit - v_monthly_spent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get service breakdown
CREATE OR REPLACE FUNCTION get_service_breakdown(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
) RETURNS TABLE (
    service_type TEXT,
    total_calls BIGINT,
    total_cost DECIMAL,
    avg_cost_per_call DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tul.service_type,
        COUNT(*)::BIGINT as total_calls,
        SUM(tul.total_cost)::DECIMAL(10,2) as total_cost,
        AVG(tul.total_cost)::DECIMAL(10,6) as avg_cost_per_call
    FROM token_usage_logs tul
    WHERE tul.user_id = p_user_id
      AND tul.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY tul.service_type
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_cost_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_service_costs;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_workflow_efficiency;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_panel_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_service_usage;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. DEFAULT BUDGET LIMITS
-- ============================================

INSERT INTO budget_limits (entity_type, entity_id, daily_limit, monthly_limit, action_on_breach, notes)
VALUES 
    -- MVP total budget
    ('organization', 'mvp', 50.00, 500.00, 'alert', 'MVP total budget'),
    
    -- Service-specific limits
    ('service', '1:1_conversation', 5.00, 100.00, 'alert', '1:1 conversation service budget'),
    ('service', 'virtual_panel', 10.00, 200.00, 'alert', 'Virtual panel service budget'),
    ('service', 'workflow', 15.00, 300.00, 'alert', 'Workflow service budget'),
    ('service', 'solution_builder', 20.00, 400.00, 'alert', 'Solution builder service budget'),
    
    -- Tier limits
    ('tier', 'tier_1', 30.00, 600.00, 'alert', 'Tier 1 agents'),
    ('tier', 'tier_2', 15.00, 300.00, 'throttle', 'Tier 2 agents'),
    ('tier', 'tier_3', 5.00, 100.00, 'downgrade', 'Tier 3 agents')
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON token_usage_logs TO authenticated;
GRANT SELECT ON budget_limits TO authenticated;
GRANT SELECT ON cost_alerts TO authenticated;
GRANT SELECT ON service_performance_metrics TO authenticated;
GRANT SELECT ON workflow_analytics TO authenticated;
GRANT SELECT ON mv_service_costs TO authenticated;
GRANT SELECT ON mv_workflow_efficiency TO authenticated;
GRANT SELECT ON mv_panel_performance TO authenticated;
GRANT SELECT ON mv_user_service_usage TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'token_usage_logs',
    'budget_limits',
    'cost_alerts',
    'service_performance_metrics',
    'workflow_analytics'
)
ORDER BY tablename;

SELECT 
    schemaname,
    matviewname,
    matviewowner
FROM pg_matviews 
WHERE schemaname = 'public'
ORDER BY matviewname;

-- Migration complete!
