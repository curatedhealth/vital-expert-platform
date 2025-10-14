-- Workflow Admin Tables
-- Created: 2024-12-14
-- Description: Tables for LangGraph workflow administration and monitoring

-- Workflow configurations table
CREATE TABLE IF NOT EXISTS workflow_configurations (
    id TEXT PRIMARY KEY DEFAULT 'main',
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0.0',
    deployment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow deployments table
CREATE TABLE IF NOT EXISTS workflow_deployments (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    configuration JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('deploying', 'deployed', 'failed', 'rolled_back')),
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL DEFAULT 'main',
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
    current_node TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in milliseconds
    error TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow logs table
CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    deployment_id TEXT REFERENCES workflow_deployments(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow node performance table
CREATE TABLE IF NOT EXISTS workflow_node_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL,
    workflow_id TEXT NOT NULL DEFAULT 'main',
    execution_count INTEGER DEFAULT 0,
    total_latency INTEGER DEFAULT 0, -- in milliseconds
    error_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_id ON workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_start_time ON workflow_executions(start_time);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_execution_id ON workflow_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_level ON workflow_logs(level);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created_at ON workflow_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_node_performance_node_id ON workflow_node_performance(node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_node_performance_workflow_id ON workflow_node_performance(workflow_id);

-- RLS policies
ALTER TABLE workflow_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_node_performance ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin can manage workflow configurations" ON workflow_configurations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin can manage workflow deployments" ON workflow_deployments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin can view all workflow executions" ON workflow_executions
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own workflow executions" ON workflow_executions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Admin can manage workflow logs" ON workflow_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin can manage workflow node performance" ON workflow_node_performance
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_workflow_configurations_updated_at 
    BEFORE UPDATE ON workflow_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_node_performance_updated_at 
    BEFORE UPDATE ON workflow_node_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update node performance metrics
CREATE OR REPLACE FUNCTION update_node_performance(
    p_node_id TEXT,
    p_workflow_id TEXT DEFAULT 'main',
    p_latency INTEGER DEFAULT 0,
    p_is_error BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO workflow_node_performance (
        node_id, 
        workflow_id, 
        execution_count, 
        total_latency, 
        error_count, 
        last_executed
    ) VALUES (
        p_node_id, 
        p_workflow_id, 
        1, 
        p_latency, 
        CASE WHEN p_is_error THEN 1 ELSE 0 END, 
        NOW()
    )
    ON CONFLICT (node_id, workflow_id) 
    DO UPDATE SET
        execution_count = workflow_node_performance.execution_count + 1,
        total_latency = workflow_node_performance.total_latency + p_latency,
        error_count = workflow_node_performance.error_count + CASE WHEN p_is_error THEN 1 ELSE 0 END,
        last_executed = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get workflow metrics
CREATE OR REPLACE FUNCTION get_workflow_metrics(
    p_workflow_id TEXT DEFAULT 'main',
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_executions BIGINT,
    completed_executions BIGINT,
    failed_executions BIGINT,
    running_executions BIGINT,
    success_rate NUMERIC,
    average_latency NUMERIC,
    error_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_executions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
        COUNT(*) FILTER (WHERE status = 'running') as running_executions,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as success_rate,
        CASE 
            WHEN COUNT(*) FILTER (WHERE status = 'completed' AND duration IS NOT NULL) > 0 THEN
                ROUND(AVG(duration) FILTER (WHERE status = 'completed' AND duration IS NOT NULL), 2)
            ELSE 0 
        END as average_latency,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'failed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as error_rate
    FROM workflow_executions 
    WHERE workflow_id = p_workflow_id 
    AND start_time >= NOW() - INTERVAL '1 hour' * p_hours_back;
END;
$$ LANGUAGE plpgsql;

-- Insert default workflow configuration
INSERT INTO workflow_configurations (id, configuration, is_active, version) VALUES (
    'main',
    '{
        "nodes": [
            {
                "id": "start",
                "name": "Start",
                "type": "start",
                "position": {"x": 50, "y": 50},
                "config": {},
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "routeByMode",
                "name": "Route by Mode",
                "type": "decision",
                "position": {"x": 200, "y": 50},
                "config": {
                    "condition": "interactionMode",
                    "options": ["manual", "automatic"]
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "suggestAgents",
                "name": "Suggest Agents",
                "type": "process",
                "position": {"x": 350, "y": 50},
                "config": {
                    "maxSuggestions": 3,
                    "useRanking": true
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "suggestTools",
                "name": "Suggest Tools",
                "type": "process",
                "position": {"x": 350, "y": 150},
                "config": {
                    "availableTools": ["web_search", "pubmed_search", "knowledge_base", "calculator", "fda_database"]
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "selectAgentAutomatic",
                "name": "Select Agent (Auto)",
                "type": "process",
                "position": {"x": 500, "y": 100},
                "config": {
                    "useOrchestrator": true
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "retrieveContext",
                "name": "Retrieve Context",
                "type": "process",
                "position": {"x": 650, "y": 100},
                "config": {
                    "useRAG": true,
                    "maxDocuments": 5
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "processWithAgentNormal",
                "name": "Process (Normal)",
                "type": "process",
                "position": {"x": 800, "y": 50},
                "config": {
                    "useSelectedTools": true
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "processWithAgentAutonomous",
                "name": "Process (Autonomous)",
                "type": "process",
                "position": {"x": 800, "y": 150},
                "config": {
                    "useAllTools": true,
                    "useMemory": true
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "synthesizeResponse",
                "name": "Synthesize Response",
                "type": "process",
                "position": {"x": 950, "y": 100},
                "config": {
                    "includeCitations": true,
                    "includeMetadata": true
                },
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            },
            {
                "id": "end",
                "name": "End",
                "type": "end",
                "position": {"x": 1100, "y": 100},
                "config": {},
                "status": "active",
                "executionCount": 0,
                "averageLatency": 0
            }
        ],
        "edges": [
            {"id": "e1", "source": "start", "target": "routeByMode", "status": "active"},
            {"id": "e2", "source": "routeByMode", "target": "suggestAgents", "condition": "manual", "status": "active"},
            {"id": "e3", "source": "routeByMode", "target": "suggestTools", "condition": "automatic", "status": "active"},
            {"id": "e4", "source": "suggestAgents", "target": "suggestTools", "status": "active"},
            {"id": "e5", "source": "suggestTools", "target": "selectAgentAutomatic", "status": "active"},
            {"id": "e6", "source": "selectAgentAutomatic", "target": "retrieveContext", "status": "active"},
            {"id": "e7", "source": "retrieveContext", "target": "processWithAgentNormal", "condition": "normal", "status": "active"},
            {"id": "e8", "source": "retrieveContext", "target": "processWithAgentAutonomous", "condition": "autonomous", "status": "active"},
            {"id": "e9", "source": "processWithAgentNormal", "target": "synthesizeResponse", "status": "active"},
            {"id": "e10", "source": "processWithAgentAutonomous", "target": "synthesizeResponse", "status": "active"},
            {"id": "e11", "source": "synthesizeResponse", "target": "end", "status": "active"}
        ],
        "metadata": {
            "name": "Mode-Aware Multi-Agent Workflow",
            "description": "LangGraph workflow supporting all 4 mode combinations",
            "version": "2.0.0",
            "lastModified": "2024-12-14T00:00:00Z",
            "status": "active"
        }
    }',
    true,
    '2.0.0'
) ON CONFLICT (id) DO NOTHING;
