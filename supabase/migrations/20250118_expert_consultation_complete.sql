-- Complete Expert Consultation Database Schema
-- This migration creates all necessary tables for the expert consultation service

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Consultation Sessions Table
CREATE TABLE IF NOT EXISTS consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('interactive', 'autonomous')),
    agent_selection_mode VARCHAR(50) NOT NULL CHECK (agent_selection_mode IN ('automatic', 'manual')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_cost DECIMAL(10,4) DEFAULT 0.0,
    budget DECIMAL(10,4) DEFAULT 50.0,
    max_iterations INTEGER DEFAULT 10,
    current_iteration INTEGER DEFAULT 0,
    reasoning_mode VARCHAR(50) DEFAULT 'react' CHECK (reasoning_mode IN ('react', 'cot')),
    context JSONB DEFAULT '{}',
    error TEXT,
    
    -- Indexes will be created separately
);

-- Reasoning Steps Table
CREATE TABLE IF NOT EXISTS reasoning_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    phase VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id) ON DELETE CASCADE
);

-- Session Costs Table
CREATE TABLE IF NOT EXISTS session_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    cost_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,4) NOT NULL,
    model VARCHAR(100),
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id) ON DELETE CASCADE
);

-- Session Checkpoints Table (for LangGraph)
CREATE TABLE IF NOT EXISTS session_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    state JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id) ON DELETE CASCADE,
    
    -- Unique constraint
    UNIQUE(session_id, checkpoint_id)
);

-- Execution Analytics Table
CREATE TABLE IF NOT EXISTS execution_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id) ON DELETE CASCADE
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    default_mode VARCHAR(50) DEFAULT 'interactive',
    default_agent_selection_mode VARCHAR(50) DEFAULT 'automatic',
    default_budget DECIMAL(10,4) DEFAULT 50.0,
    preferred_agents JSONB DEFAULT '[]',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Performance Table
CREATE TABLE IF NOT EXISTS agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    performance_score DECIMAL(5,2),
    response_time_ms INTEGER,
    cost_efficiency DECIMAL(5,2),
    user_satisfaction DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id) ON DELETE CASCADE
);

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RPC functions for complex queries

-- Function to get user session statistics
CREATE OR REPLACE FUNCTION get_user_session_stats(p_user_id VARCHAR(255))
RETURNS TABLE (
    total_sessions BIGINT,
    completed_sessions BIGINT,
    total_cost DECIMAL(10,4),
    avg_cost DECIMAL(10,4),
    avg_duration INTERVAL,
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(AVG(total_cost), 0) as avg_cost,
        COALESCE(AVG(updated_at - created_at), INTERVAL '0') as avg_duration,
        COALESCE(
            (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            0
        ) as success_rate
    FROM consultation_sessions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent performance statistics
CREATE OR REPLACE FUNCTION get_agent_performance_stats(p_agent_id VARCHAR(255), p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_sessions BIGINT,
    avg_performance_score DECIMAL(5,2),
    avg_response_time_ms INTEGER,
    avg_cost_efficiency DECIMAL(5,2),
    avg_user_satisfaction DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_sessions,
        COALESCE(AVG(performance_score), 0) as avg_performance_score,
        COALESCE(AVG(response_time_ms), 0)::INTEGER as avg_response_time_ms,
        COALESCE(AVG(cost_efficiency), 0) as avg_cost_efficiency,
        COALESCE(AVG(user_satisfaction), 0) as avg_user_satisfaction
    FROM agent_performance ap
    JOIN consultation_sessions cs ON ap.session_id = cs.session_id
    WHERE ap.agent_id = p_agent_id
    AND cs.created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old reasoning steps
    DELETE FROM reasoning_steps 
    WHERE session_id IN (
        SELECT session_id FROM consultation_sessions 
        WHERE created_at < NOW() - INTERVAL '1 day' * p_days
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old sessions
    DELETE FROM consultation_sessions 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days;
    
    -- Delete old system metrics
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '1 day' * p_days;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_consultation_sessions_updated_at
    BEFORE UPDATE ON consultation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags) VALUES
('service_startup', 1, 'count', '{"service": "expert_consultation"}'),
('database_migration', 1, 'count', '{"version": "20250118_complete"}');

-- Create views for common queries

-- Active sessions view
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    cs.*,
    COUNT(rs.id) as reasoning_steps_count,
    COALESCE(SUM(sc.amount), 0) as total_cost_breakdown
FROM consultation_sessions cs
LEFT JOIN reasoning_steps rs ON cs.session_id = rs.session_id
LEFT JOIN session_costs sc ON cs.session_id = sc.session_id
WHERE cs.status IN ('active', 'paused')
GROUP BY cs.id;

-- User session summary view
CREATE OR REPLACE VIEW user_session_summary AS
SELECT 
    user_id,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_sessions,
    COALESCE(SUM(total_cost), 0) as total_cost,
    COALESCE(AVG(total_cost), 0) as avg_cost,
    COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 0) as avg_duration_seconds,
    MAX(created_at) as last_session_at
FROM consultation_sessions
GROUP BY user_id;

-- Agent performance summary view
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    ap.agent_id,
    COUNT(*) as total_sessions,
    COALESCE(AVG(ap.performance_score), 0) as avg_performance_score,
    COALESCE(AVG(ap.response_time_ms), 0) as avg_response_time_ms,
    COALESCE(AVG(ap.cost_efficiency), 0) as avg_cost_efficiency,
    COALESCE(AVG(ap.user_satisfaction), 0) as avg_user_satisfaction,
    MAX(ap.created_at) as last_used_at
FROM agent_performance ap
GROUP BY ap.agent_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_id ON consultation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_agent_id ON consultation_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_status ON consultation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_created_at ON consultation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_session_id ON consultation_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_reasoning_steps_session_id ON reasoning_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_steps_phase ON reasoning_steps(phase);
CREATE INDEX IF NOT EXISTS idx_reasoning_steps_created_at ON reasoning_steps(created_at);

CREATE INDEX IF NOT EXISTS idx_session_costs_session_id ON session_costs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_costs_cost_type ON session_costs(cost_type);
CREATE INDEX IF NOT EXISTS idx_session_costs_created_at ON session_costs(created_at);

CREATE INDEX IF NOT EXISTS idx_session_checkpoints_session_id ON session_checkpoints(session_id);
CREATE INDEX IF NOT EXISTS idx_session_checkpoints_checkpoint_id ON session_checkpoints(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_session_checkpoints_created_at ON session_checkpoints(created_at);

CREATE INDEX IF NOT EXISTS idx_execution_analytics_session_id ON execution_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_execution_analytics_metric_name ON execution_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_execution_analytics_created_at ON execution_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_session_id ON agent_performance(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_score ON agent_performance(performance_score);
CREATE INDEX IF NOT EXISTS idx_agent_performance_created_at ON agent_performance(created_at);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_tags ON system_metrics USING GIN(tags);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vital;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vital;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO vital;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultation_sessions_user_status 
ON consultation_sessions(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultation_sessions_agent_status 
ON consultation_sessions(agent_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reasoning_steps_session_phase 
ON reasoning_steps(session_id, phase);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_costs_session_type 
ON session_costs(session_id, cost_type);

-- Add comments for documentation
COMMENT ON TABLE consultation_sessions IS 'Main table for expert consultation sessions';
COMMENT ON TABLE reasoning_steps IS 'Individual reasoning steps for each session';
COMMENT ON TABLE session_costs IS 'Cost breakdown for each session';
COMMENT ON TABLE session_checkpoints IS 'LangGraph checkpoint data for session resumption';
COMMENT ON TABLE execution_analytics IS 'Performance metrics for each session';
COMMENT ON TABLE user_preferences IS 'User-specific configuration and preferences';
COMMENT ON TABLE agent_performance IS 'Performance metrics for each agent';
COMMENT ON TABLE system_metrics IS 'System-wide metrics and monitoring data';
