-- ============================================================================
-- Tools Registry & Agent-Tool Linking System
-- Date: 2025-11-02
-- Purpose: Comprehensive tool management for VITAL AI Platform
--
-- Features:
-- - Tools registry with metadata and configuration
-- - Agent-to-tools linking (many-to-many)
-- - Tool execution history and analytics
-- - Tool versioning and deprecation
-- - Permission-based tool access
-- - LangGraph integration ready
-- ============================================================================

-- ============================================================================
-- 1. TOOLS REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS tools (
  -- Identity
  tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_code TEXT UNIQUE NOT NULL, -- e.g., 'web_search', 'web_scraper', 'rag_search'
  tool_name TEXT NOT NULL,
  tool_description TEXT NOT NULL,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'web', 'rag', 'computation', 'database', 'communication', 
    'file', 'code', 'medical', 'custom'
  )),
  subcategory TEXT,
  
  -- Implementation
  implementation_type TEXT NOT NULL CHECK (implementation_type IN (
    'python_function', 'api_endpoint', 'langchain_tool', 'external_api'
  )),
  implementation_path TEXT NOT NULL, -- Python module path or API endpoint
  function_name TEXT, -- Function name if Python
  
  -- Configuration
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- JSON Schema for inputs
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- JSON Schema for outputs
  default_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Default tool configuration
  required_env_vars TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['TAVILY_API_KEY']
  
  -- Behavior
  is_async BOOLEAN NOT NULL DEFAULT TRUE,
  max_execution_time_seconds INTEGER DEFAULT 30,
  retry_config JSONB DEFAULT '{"max_retries": 3, "backoff_factor": 2}'::jsonb,
  rate_limit_per_minute INTEGER,
  cost_per_execution NUMERIC(10, 4), -- In USD
  
  -- LangGraph Integration
  langgraph_compatible BOOLEAN NOT NULL DEFAULT TRUE,
  langgraph_node_name TEXT, -- Suggested node name for LangGraph
  supports_streaming BOOLEAN DEFAULT FALSE,
  
  -- Status & Lifecycle
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'deprecated', 'disabled', 'beta', 'experimental'
  )),
  version TEXT NOT NULL DEFAULT '1.0.0',
  deprecated_by UUID REFERENCES tools(tool_id) ON DELETE SET NULL,
  deprecation_date TIMESTAMPTZ,
  
  -- Access Control
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN (
    'public', 'authenticated', 'premium', 'admin', 'internal'
  )),
  allowed_tenants TEXT[], -- NULL = all tenants
  allowed_roles TEXT[], -- e.g., ['agent', 'user', 'admin']
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  documentation_url TEXT,
  example_usage JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  updated_by TEXT
);

-- Indexes for tools
CREATE INDEX IF NOT EXISTS idx_tools_code ON tools(tool_code);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tools_access_level ON tools(access_level);
CREATE INDEX IF NOT EXISTS idx_tools_langgraph_compatible ON tools(langgraph_compatible) WHERE langgraph_compatible = TRUE;
CREATE INDEX IF NOT EXISTS idx_tools_tags ON tools USING GIN(tags);

-- Comments
COMMENT ON TABLE tools IS 'Registry of all available tools for agents and workflows';
COMMENT ON COLUMN tools.tool_code IS 'Unique identifier for tool (used in code)';
COMMENT ON COLUMN tools.implementation_path IS 'Python module path (e.g., tools.web_search) or API URL';
COMMENT ON COLUMN tools.input_schema IS 'JSON Schema defining tool input parameters';
COMMENT ON COLUMN tools.output_schema IS 'JSON Schema defining tool output format';
COMMENT ON COLUMN tools.langgraph_compatible IS 'Whether tool can be used as LangGraph node';

-- ============================================================================
-- 2. AGENT-TOOL LINKING (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_tools (
  -- Identity
  agent_tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL, -- Agent identifier
  tool_id UUID NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  
  -- Configuration
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER DEFAULT 50, -- Higher = more likely to be used (1-100)
  custom_config JSONB DEFAULT '{}'::jsonb, -- Agent-specific tool configuration
  
  -- Usage Constraints
  max_uses_per_session INTEGER, -- NULL = unlimited
  max_cost_per_session NUMERIC(10, 4), -- In USD
  allowed_contexts TEXT[], -- e.g., ['autonomous', 'interactive', 'research']
  
  -- Behavior
  auto_approve BOOLEAN DEFAULT FALSE, -- Auto-approve tool execution or ask user
  require_confirmation BOOLEAN DEFAULT FALSE,
  fallback_tool_id UUID REFERENCES tools(tool_id) ON DELETE SET NULL,
  
  -- Metadata
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(agent_id, tool_id)
);

-- Indexes for agent_tools
CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON agent_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_tool_id ON agent_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_enabled ON agent_tools(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_agent_tools_priority ON agent_tools(agent_id, priority DESC);

-- Comments
COMMENT ON TABLE agent_tools IS 'Links agents to their available tools with configuration';
COMMENT ON COLUMN agent_tools.priority IS 'Tool selection priority (1-100, higher = preferred)';
COMMENT ON COLUMN agent_tools.auto_approve IS 'Whether agent can use tool without user confirmation';

-- ============================================================================
-- 3. TOOL EXECUTION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS tool_executions (
  -- Identity
  execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  agent_tool_id UUID REFERENCES agent_tools(agent_tool_id) ON DELETE SET NULL,
  
  -- Context
  agent_id TEXT,
  session_id TEXT,
  conversation_id TEXT,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Execution Details
  input_params JSONB NOT NULL,
  output_result JSONB,
  error_message TEXT,
  error_traceback TEXT,
  
  -- Performance
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'running', 'success', 'failed', 'timeout', 'cancelled'
  )),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  -- Cost & Resources
  cost_usd NUMERIC(10, 4),
  tokens_used INTEGER,
  api_calls_made INTEGER DEFAULT 1,
  
  -- LangGraph Context
  workflow_run_id TEXT,
  node_name TEXT,
  iteration_number INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for tool_executions
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool_id ON tool_executions(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent_id ON tool_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_session_id ON tool_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tenant_id ON tool_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON tool_executions(status);
CREATE INDEX IF NOT EXISTS idx_tool_executions_started_at ON tool_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_executions_workflow_run_id ON tool_executions(workflow_run_id);

-- Comments
COMMENT ON TABLE tool_executions IS 'History of all tool executions for analytics and debugging';
COMMENT ON COLUMN tool_executions.workflow_run_id IS 'LangGraph workflow run ID for tracing';
COMMENT ON COLUMN tool_executions.execution_time_ms IS 'Execution time in milliseconds';

-- ============================================================================
-- 4. TOOL ANALYTICS (Materialized View for Performance)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS tool_analytics AS
SELECT
  t.tool_id,
  t.tool_code,
  t.tool_name,
  t.category,
  COUNT(te.execution_id) AS total_executions,
  COUNT(CASE WHEN te.status = 'success' THEN 1 END) AS successful_executions,
  COUNT(CASE WHEN te.status = 'failed' THEN 1 END) AS failed_executions,
  ROUND(
    COUNT(CASE WHEN te.status = 'success' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(te.execution_id), 0) * 100, 
    2
  ) AS success_rate_percent,
  AVG(te.execution_time_ms) AS avg_execution_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY te.execution_time_ms) AS p95_execution_time_ms,
  SUM(te.cost_usd) AS total_cost_usd,
  AVG(te.cost_usd) AS avg_cost_usd,
  COUNT(DISTINCT te.agent_id) AS unique_agents_using,
  COUNT(DISTINCT te.tenant_id) AS unique_tenants_using,
  MAX(te.started_at) AS last_used_at
FROM tools t
LEFT JOIN tool_executions te ON t.tool_id = te.tool_id
WHERE te.started_at >= now() - INTERVAL '30 days' -- Last 30 days
GROUP BY t.tool_id, t.tool_code, t.tool_name, t.category;

-- Index for analytics view
CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_analytics_tool_id ON tool_analytics(tool_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_tool_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY tool_analytics;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON MATERIALIZED VIEW tool_analytics IS 'Analytics for tool usage (last 30 days)';

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tools
DROP TRIGGER IF EXISTS trg_tools_updated ON tools;
CREATE TRIGGER trg_tools_updated
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION trg_update_timestamp();

-- Apply to agent_tools
DROP TRIGGER IF EXISTS trg_agent_tools_updated ON agent_tools;
CREATE TRIGGER trg_agent_tools_updated
  BEFORE UPDATE ON agent_tools
  FOR EACH ROW
  EXECUTE FUNCTION trg_update_timestamp();

-- Auto-complete execution time
CREATE OR REPLACE FUNCTION trg_complete_tool_execution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('success', 'failed', 'timeout', 'cancelled') AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
    NEW.execution_time_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tool_executions_complete ON tool_executions;
CREATE TRIGGER trg_tool_executions_complete
  BEFORE UPDATE ON tool_executions
  FOR EACH ROW
  EXECUTE FUNCTION trg_complete_tool_execution();

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Get agent's available tools
CREATE OR REPLACE FUNCTION get_agent_tools(p_agent_id TEXT, p_context TEXT DEFAULT NULL)
RETURNS TABLE (
  tool_id UUID,
  tool_code TEXT,
  tool_name TEXT,
  tool_description TEXT,
  category TEXT,
  input_schema JSONB,
  output_schema JSONB,
  priority INTEGER,
  custom_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tool_id,
    t.tool_code,
    t.tool_name,
    t.tool_description,
    t.category,
    t.input_schema,
    t.output_schema,
    at.priority,
    at.custom_config
  FROM tools t
  INNER JOIN agent_tools at ON t.tool_id = at.tool_id
  WHERE at.agent_id = p_agent_id
    AND at.is_enabled = TRUE
    AND t.status = 'active'
    AND (p_context IS NULL OR p_context = ANY(at.allowed_contexts) OR at.allowed_contexts IS NULL)
  ORDER BY at.priority DESC, t.tool_name ASC;
END;
$$ LANGUAGE plpgsql;

-- Log tool execution
CREATE OR REPLACE FUNCTION log_tool_execution(
  p_tool_code TEXT,
  p_agent_id TEXT,
  p_tenant_id TEXT,
  p_input_params JSONB,
  p_output_result JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_workflow_run_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_tool_id UUID;
  v_execution_id UUID;
BEGIN
  -- Get tool_id from tool_code
  SELECT tool_id INTO v_tool_id FROM tools WHERE tool_code = p_tool_code LIMIT 1;
  
  IF v_tool_id IS NULL THEN
    RAISE EXCEPTION 'Tool not found: %', p_tool_code;
  END IF;
  
  -- Insert execution record
  INSERT INTO tool_executions (
    tool_id,
    agent_id,
    tenant_id,
    session_id,
    workflow_run_id,
    input_params,
    output_result,
    error_message,
    status,
    execution_time_ms,
    started_at,
    completed_at
  ) VALUES (
    v_tool_id,
    p_agent_id,
    p_tenant_id,
    p_session_id,
    p_workflow_run_id,
    p_input_params,
    p_output_result,
    p_error_message,
    p_status,
    p_execution_time_ms,
    now() - (COALESCE(p_execution_time_ms, 0) || ' milliseconds')::INTERVAL,
    CASE WHEN p_status IN ('success', 'failed') THEN now() ELSE NULL END
  )
  RETURNING execution_id INTO v_execution_id;
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION get_agent_tools IS 'Get all enabled tools for an agent, optionally filtered by context';
COMMENT ON FUNCTION log_tool_execution IS 'Log a tool execution with all relevant metadata';

-- ============================================================================
-- 7. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;

-- Tools: Public read for active tools
CREATE POLICY tools_public_read ON tools
  FOR SELECT
  USING (status = 'active' AND access_level = 'public');

-- Tools: Full access for service role
CREATE POLICY tools_service_all ON tools
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Agent Tools: Agent can read their own tools
CREATE POLICY agent_tools_agent_read ON agent_tools
  FOR SELECT
  USING (agent_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Agent Tools: Service role full access
CREATE POLICY agent_tools_service_all ON agent_tools
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Tool Executions: Tenant isolation
CREATE POLICY tool_executions_tenant_isolation ON tool_executions
  FOR ALL
  USING (
    tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

COMMENT ON POLICY tools_public_read ON tools IS 'Allow public read access to active public tools';
COMMENT ON POLICY tool_executions_tenant_isolation ON tool_executions IS 'Tenant-isolated access to tool executions';

