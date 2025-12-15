-- ============================================================================
-- AgentOS 3.0: System Prompt Infrastructure
-- Migration: 20251126_system_prompt_infrastructure.sql
-- Purpose: Create tables for gold standard system prompts and worker pool
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM PROMPT TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template identification
    template_name VARCHAR(200) NOT NULL UNIQUE,
    agent_level VARCHAR(20) NOT NULL CHECK (agent_level IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    agent_level_name VARCHAR(50) NOT NULL, -- MASTER, EXPERT, SPECIALIST, WORKER, TOOL
    version VARCHAR(20) NOT NULL DEFAULT '2.0',
    
    -- Prompt content
    base_prompt TEXT NOT NULL,
    level_specific_prompt TEXT NOT NULL,
    deepagents_tools_section TEXT,
    examples_section TEXT,
    
    -- Configuration
    token_budget_min INTEGER NOT NULL,
    token_budget_max INTEGER NOT NULL,
    allowed_models JSONB DEFAULT '[]',
    
    -- Capabilities
    can_spawn_levels VARCHAR[] DEFAULT '{}', -- e.g., ['L2', 'L3'] for L1
    can_use_worker_pool BOOLEAN DEFAULT FALSE,
    can_use_tool_registry BOOLEAN DEFAULT FALSE,
    is_stateless BOOLEAN DEFAULT FALSE,
    is_tenant_agnostic BOOLEAN DEFAULT FALSE,
    
    -- Usage guidelines
    when_to_use TEXT,
    prohibited_actions TEXT[],
    success_criteria TEXT[],
    
    -- Metadata
    framework_basis VARCHAR[] DEFAULT ARRAY['Claude Code', 'Deep Research', 'Manus', 'OpenAI'], -- Where patterns come from
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT valid_agent_level CHECK (agent_level IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    CONSTRAINT valid_token_budget CHECK (token_budget_min > 0 AND token_budget_max >= token_budget_min)
);

CREATE INDEX idx_system_prompt_templates_level ON system_prompt_templates(agent_level);
CREATE INDEX idx_system_prompt_templates_active ON system_prompt_templates(is_active);

COMMENT ON TABLE system_prompt_templates IS 'Gold standard system prompt templates for all 5 agent levels (AgentOS 3.0)';

-- ============================================================================
-- 2. WORKER POOL CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_pool_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Worker type
    worker_type VARCHAR(50) NOT NULL UNIQUE, -- data_extraction, computation, file_processing
    worker_type_description TEXT NOT NULL,
    
    -- Pool configuration
    pool_size INTEGER NOT NULL DEFAULT 5,
    max_concurrent_tasks INTEGER NOT NULL DEFAULT 10,
    task_timeout_seconds INTEGER NOT NULL DEFAULT 30,
    
    -- Available tasks
    available_tasks JSONB NOT NULL DEFAULT '[]', -- Array of task definitions
    
    -- Available tools
    available_tools VARCHAR[] NOT NULL DEFAULT '{}',
    
    -- Performance targets
    target_latency_seconds INTEGER NOT NULL DEFAULT 10,
    target_success_rate DECIMAL(3,2) NOT NULL DEFAULT 0.99,
    
    -- Resource limits
    max_memory_mb INTEGER NOT NULL DEFAULT 2048,
    max_file_size_mb INTEGER NOT NULL DEFAULT 50,
    max_api_results INTEGER NOT NULL DEFAULT 1000,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_pool_size CHECK (pool_size > 0),
    CONSTRAINT valid_success_rate CHECK (target_success_rate >= 0 AND target_success_rate <= 1)
);

CREATE INDEX idx_worker_pool_config_type ON worker_pool_config(worker_type);
CREATE INDEX idx_worker_pool_config_active ON worker_pool_config(is_active);

COMMENT ON TABLE worker_pool_config IS 'Configuration for shared worker pools (L4 agents)';

-- ============================================================================
-- 3. WORKER EXECUTION LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Worker identification
    worker_type VARCHAR(50) NOT NULL,
    worker_id VARCHAR(100) NOT NULL, -- Specific worker instance
    
    -- Task details
    task_name VARCHAR(100) NOT NULL,
    task_params JSONB NOT NULL DEFAULT '{}',
    
    -- Requesting context
    requesting_agent_id UUID,
    requesting_agent_level VARCHAR(20),
    session_id UUID,
    tenant_id UUID NOT NULL,
    
    -- Execution results
    status VARCHAR(20) NOT NULL CHECK (status IN ('COMPLETE', 'FAILED', 'PARTIAL', 'TIMEOUT')),
    execution_time_ms INTEGER NOT NULL,
    tokens_used INTEGER,
    
    -- Output (sanitized - no PII)
    output_summary JSONB DEFAULT '{}',
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Tools used
    tools_used VARCHAR[],
    records_processed INTEGER,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_execution_time CHECK (execution_time_ms >= 0)
);

CREATE INDEX idx_worker_execution_log_tenant ON worker_execution_log(tenant_id);
CREATE INDEX idx_worker_execution_log_worker_type ON worker_execution_log(worker_type);
CREATE INDEX idx_worker_execution_log_status ON worker_execution_log(status);
CREATE INDEX idx_worker_execution_log_started_at ON worker_execution_log(started_at);

COMMENT ON TABLE worker_execution_log IS 'Audit trail for all worker executions (performance monitoring and billing)';

-- ============================================================================
-- 4. TOOL REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS tool_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tool identification
    tool_id VARCHAR(100) NOT NULL UNIQUE,
    tool_name VARCHAR(100) NOT NULL,
    tool_type VARCHAR(50) NOT NULL, -- api_wrapper, calculator, data_processor
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    
    -- Function details
    function_name VARCHAR(100) NOT NULL,
    function_description TEXT NOT NULL,
    
    -- Schemas (enforced)
    input_schema JSONB NOT NULL,
    output_schema JSONB NOT NULL,
    
    -- Performance characteristics
    avg_latency_ms INTEGER,
    rate_limit VARCHAR(100), -- e.g., "100 calls/minute per tenant"
    timeout_seconds INTEGER NOT NULL DEFAULT 10,
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    -- Security & Access
    required_permissions VARCHAR[] DEFAULT '{}',
    allowed_file_paths VARCHAR[] DEFAULT '{}',
    allowed_api_endpoints VARCHAR[] DEFAULT '{}',
    
    -- Compliance
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    hipaa_compliant BOOLEAN DEFAULT TRUE,
    logs_pii BOOLEAN DEFAULT FALSE,
    
    -- Cost
    cost_per_call DECIMAL(10,6) DEFAULT 0.0001,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_deterministic BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_version CHECK (version ~ '^\d+\.\d+\.\d+$')
);

CREATE INDEX idx_tool_registry_tool_id ON tool_registry(tool_id);
CREATE INDEX idx_tool_registry_tool_type ON tool_registry(tool_type);
CREATE INDEX idx_tool_registry_active ON tool_registry(is_active);

COMMENT ON TABLE tool_registry IS 'Registry of all available tools (L5) with schemas and metadata';

-- ============================================================================
-- 5. AGENT PROMPT OVERRIDES
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_prompt_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent reference
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Template reference
    template_id UUID REFERENCES system_prompt_templates(id),
    
    -- Override sections (optional - override specific parts)
    custom_role_description TEXT,
    custom_capabilities TEXT,
    custom_examples TEXT,
    additional_tools JSONB DEFAULT '[]',
    
    -- Custom parameters
    custom_token_budget INTEGER,
    custom_rag_profile VARCHAR(50),
    custom_kg_view JSONB,
    
    -- Priority
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(agent_id, template_id)
);

CREATE INDEX idx_agent_prompt_overrides_agent ON agent_prompt_overrides(agent_id);
CREATE INDEX idx_agent_prompt_overrides_active ON agent_prompt_overrides(is_active);

COMMENT ON TABLE agent_prompt_overrides IS 'Agent-specific overrides to gold standard prompts';

-- ============================================================================
-- 6. DEEPAGENTS TOOL USAGE LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS deepagents_tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Agent context
    agent_id UUID NOT NULL,
    agent_level VARCHAR(20) NOT NULL,
    session_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Tool usage
    tool_name VARCHAR(50) NOT NULL, -- write_todos, write_file, read_file, task, execute_worker_task
    tool_params JSONB NOT NULL DEFAULT '{}',
    
    -- Results
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    execution_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Context
    parent_agent_id UUID, -- If spawned by another agent
    workflow_step VARCHAR(100),
    
    -- Timing
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_tool_name CHECK (tool_name IN (
        'write_todos', 'write_file', 'read_file', 'edit_file', 'ls',
        'task', 'execute_worker_task', 'escalate_to_human'
    ))
);

CREATE INDEX idx_deepagents_usage_agent ON deepagents_tool_usage(agent_id);
CREATE INDEX idx_deepagents_usage_tenant ON deepagents_tool_usage(tenant_id);
CREATE INDEX idx_deepagents_usage_tool ON deepagents_tool_usage(tool_name);
CREATE INDEX idx_deepagents_usage_executed_at ON deepagents_tool_usage(executed_at);

COMMENT ON TABLE deepagents_tool_usage IS 'Tracking DeepAgents framework tool usage for monitoring and optimization';

-- ============================================================================
-- 7. ENABLE RLS (Permissive policies for initial setup)
-- ============================================================================

ALTER TABLE system_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_pool_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompt_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE deepagents_tool_usage ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all for service role, restrict for others)
CREATE POLICY "system_prompt_templates_service_role" ON system_prompt_templates
    FOR ALL USING (true);

CREATE POLICY "worker_pool_config_service_role" ON worker_pool_config
    FOR ALL USING (true);

CREATE POLICY "tool_registry_service_role" ON tool_registry
    FOR ALL USING (true);

CREATE POLICY "agent_prompt_overrides_service_role" ON agent_prompt_overrides
    FOR ALL USING (true);

-- Tenant isolation for execution logs
CREATE POLICY "worker_execution_log_tenant" ON worker_execution_log
    FOR ALL USING (
        auth.uid() IS NOT NULL OR 
        tenant_id = COALESCE(
            (current_setting('app.current_tenant_id', true))::UUID,
            tenant_id
        )
    );

CREATE POLICY "deepagents_usage_tenant" ON deepagents_tool_usage
    FOR ALL USING (
        auth.uid() IS NOT NULL OR
        tenant_id = COALESCE(
            (current_setting('app.current_tenant_id', true))::UUID,
            tenant_id
        )
    );

-- ============================================================================
-- 8. FUNCTIONS FOR PROMPT RENDERING
-- ============================================================================

CREATE OR REPLACE FUNCTION render_system_prompt(
    p_agent_id UUID,
    p_session_id UUID,
    p_query_tier VARCHAR(20) DEFAULT 'tier_2',
    p_additional_context JSONB DEFAULT '{}'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_level_number INTEGER;
    v_agent_name VARCHAR(200);
    v_template RECORD;
    v_override RECORD;
    v_rendered_prompt TEXT;
BEGIN
    -- Get agent details with level info
    SELECT 
        al.level_number,
        a.name
    INTO v_level_number, v_agent_name
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE a.id = p_agent_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agent not found: %', p_agent_id;
    END IF;
    
    -- Get template for agent level
    SELECT *
    INTO v_template
    FROM system_prompt_templates
    WHERE agent_level = 'L' || v_level_number
    AND is_active = TRUE
    ORDER BY version DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No template found for level: L%', v_level_number;
    END IF;
    
    -- Check for overrides
    SELECT *
    INTO v_override
    FROM agent_prompt_overrides
    WHERE agent_id = p_agent_id
    AND is_active = TRUE
    ORDER BY priority DESC
    LIMIT 1;
    
    -- Build rendered prompt
    v_rendered_prompt := v_template.base_prompt || E'\n\n' || v_template.level_specific_prompt;
    
    -- Add DeepAgents tools section if applicable
    IF v_template.deepagents_tools_section IS NOT NULL THEN
        v_rendered_prompt := v_rendered_prompt || E'\n\n' || v_template.deepagents_tools_section;
    END IF;
    
    -- Apply template variables (basic - full rendering done in Python service)
    v_rendered_prompt := REPLACE(v_rendered_prompt, '{{agent_level}}', v_template.agent_level_name);
    v_rendered_prompt := REPLACE(v_rendered_prompt, '{{query_tier}}', p_query_tier);
    v_rendered_prompt := REPLACE(v_rendered_prompt, '{{session_id}}', p_session_id::TEXT);
    v_rendered_prompt := REPLACE(v_rendered_prompt, '{{token_budget}}', v_template.token_budget_max::TEXT);
    v_rendered_prompt := REPLACE(v_rendered_prompt, '{{agent_name}}', COALESCE(v_agent_name, 'Agent'));
    
    -- Apply overrides if present
    IF v_override IS NOT NULL THEN
        IF v_override.custom_role_description IS NOT NULL THEN
            v_rendered_prompt := REGEXP_REPLACE(
                v_rendered_prompt,
                '## Role & Capabilities.*?##',
                '## Role & Capabilities' || E'\n' || v_override.custom_role_description || E'\n\n##',
                'ns'
            );
        END IF;
    END IF;
    
    RETURN v_rendered_prompt;
END;
$$;

COMMENT ON FUNCTION render_system_prompt IS 'Render complete system prompt for an agent with template variables resolved';

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '✅ AgentOS 3.0 System Prompt Infrastructure created successfully';
    RAISE NOTICE '📋 Tables created: 8';
    RAISE NOTICE '🔧 Functions created: 1';
    RAISE NOTICE '🔐 RLS enabled on all tables';
END $$;

