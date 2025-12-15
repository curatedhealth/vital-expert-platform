-- ============================================================================
-- AgentOS 3.0: Missing Database Tables
-- File: 20251126_missing_tables.sql
-- Purpose: Add worker_pool_metrics and tool_execution_log tables
-- ============================================================================

-- ============================================================================
-- 1. WORKER POOL METRICS (Aggregated Statistics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_pool_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dimensions
    worker_type VARCHAR(50) NOT NULL,
    tenant_id UUID,
    hour_bucket TIMESTAMPTZ NOT NULL,  -- Hourly aggregation
    
    -- Execution metrics
    total_executions INTEGER NOT NULL DEFAULT 0,
    successful_executions INTEGER NOT NULL DEFAULT 0,
    failed_executions INTEGER NOT NULL DEFAULT 0,
    
    -- Performance metrics
    avg_execution_time_ms FLOAT NOT NULL DEFAULT 0,
    total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
    
    -- Resource metrics
    avg_tokens_used FLOAT DEFAULT 0,
    total_tokens_used BIGINT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(worker_type, tenant_id, hour_bucket)
);

CREATE INDEX idx_worker_metrics_tenant_time ON worker_pool_metrics(tenant_id, hour_bucket DESC);
CREATE INDEX idx_worker_metrics_type_time ON worker_pool_metrics(worker_type, hour_bucket DESC);

COMMENT ON TABLE worker_pool_metrics IS 'Hourly aggregated metrics for worker pool performance monitoring';

-- ============================================================================
-- 2. TOOL EXECUTION LOG (Detailed Tool Usage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tool_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tool identification
    tool_name VARCHAR(100) NOT NULL,
    calling_agent_id UUID,
    calling_worker_id VARCHAR(100),
    session_id UUID,
    tenant_id UUID,
    
    -- Execution details
    execution_time_ms INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'ERROR', 'TIMEOUT')),
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_log_tenant_time ON tool_execution_log(tenant_id, started_at DESC);
CREATE INDEX idx_tool_log_tool_time ON tool_execution_log(tool_name, started_at DESC);

COMMENT ON TABLE tool_execution_log IS 'Detailed execution log for all tool calls';

-- ============================================================================
-- 3. ENABLE RLS
-- ============================================================================

ALTER TABLE worker_pool_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "worker_metrics_all" ON worker_pool_metrics FOR ALL USING (true);
CREATE POLICY "tool_log_all" ON tool_execution_log FOR ALL USING (true);

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '✅ Missing database tables created successfully';
    RAISE NOTICE '📋 worker_pool_metrics: Aggregated statistics';
    RAISE NOTICE '📋 tool_execution_log: Tool usage tracking';
END $$;

