-- ============================================================================
-- AGENT RELATIONSHIPS, SUBAGENTS, AND WORKFLOWS
-- Based on LangChain DeepAgents Architecture
-- https://docs.langchain.com/oss/python/deepagents/overview
-- ============================================================================

-- ============================================================================
-- 1. AGENT RELATIONSHIPS (Parent-Child, Peer-to-Peer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent/Source Agent
    parent_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Child/Target Agent
    child_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Relationship Type
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'orchestrates',      -- L1 orchestrates L2 Experts
        'delegates_to',      -- Higher level delegates to lower (L1->L3, L2->L3, L3->L4)
        'uses_worker',       -- L1/L2 directly uses L4 Workers
        'uses_tool',         -- Any level (L1-L4) uses L5 Tools
        'supervises',        -- Supervision relationship
        'collaborates_with', -- Peer collaboration (same level)
        'escalates_to',      -- Lower escalates to higher
        'consults',          -- Advisory relationship
        'spawns_subagent'    -- Dynamic subagent creation
    )),
    
    -- Delegation/Communication Settings
    can_delegate BOOLEAN DEFAULT true,
    can_receive_results BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Context Isolation (per DeepAgents)
    context_isolation BOOLEAN DEFAULT true,  -- Subagent gets isolated context
    share_memory BOOLEAN DEFAULT false,       -- Share long-term memory
    share_filesystem BOOLEAN DEFAULT false,   -- Share virtual filesystem
    
    -- Priority and Ordering
    priority INTEGER DEFAULT 0,  -- Higher = preferred
    execution_order INTEGER,     -- For sequential workflows
    
    -- Conditions for Activation
    activation_conditions JSONB DEFAULT '{}',  -- When to activate this relationship
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-relationships and duplicates
    CONSTRAINT no_self_relationship CHECK (parent_agent_id != child_agent_id),
    CONSTRAINT unique_relationship UNIQUE (parent_agent_id, child_agent_id, relationship_type)
);

-- Indexes for fast lookups
CREATE INDEX idx_agent_rel_parent ON agent_relationships(parent_agent_id);
CREATE INDEX idx_agent_rel_child ON agent_relationships(child_agent_id);
CREATE INDEX idx_agent_rel_type ON agent_relationships(relationship_type);

-- ============================================================================
-- 2. AGENT WORKFLOWS (Multi-Step Task Orchestration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Workflow Identity
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Workflow Type
    workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN (
        'sequential',    -- Steps execute in order
        'parallel',      -- Steps execute simultaneously
        'conditional',   -- Steps based on conditions
        'hierarchical',  -- L1 -> L2 -> L3 delegation
        'collaborative', -- Multiple agents collaborate
        'iterative'      -- Loop until condition met
    )),
    
    -- Entry Point
    entry_agent_id UUID REFERENCES agents(id),
    
    -- Workflow Configuration
    max_iterations INTEGER DEFAULT 10,
    timeout_seconds INTEGER DEFAULT 300,
    retry_on_failure BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    
    -- Context Management (per DeepAgents)
    use_virtual_filesystem BOOLEAN DEFAULT true,
    persist_memory BOOLEAN DEFAULT true,
    context_window_limit INTEGER DEFAULT 100000,
    
    -- Metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. WORKFLOW STEPS (Individual Steps in a Workflow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent Workflow
    workflow_id UUID NOT NULL REFERENCES agent_workflows(id) ON DELETE CASCADE,
    
    -- Step Identity
    step_name VARCHAR(200) NOT NULL,
    step_order INTEGER NOT NULL,
    
    -- Agent Assignment
    agent_id UUID REFERENCES agents(id),
    
    -- Step Type
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN (
        'agent_execution',   -- Agent performs task
        'tool_call',         -- L5 tool execution
        'subagent_spawn',    -- Spawn subagent
        'human_review',      -- Human-in-the-loop
        'condition_check',   -- Conditional branching
        'aggregation',       -- Combine results
        'file_operation',    -- Virtual filesystem op
        'memory_operation'   -- Long-term memory op
    )),
    
    -- Input/Output Configuration
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    
    -- Execution Settings
    timeout_seconds INTEGER DEFAULT 60,
    retry_on_failure BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 2,
    
    -- Conditional Logic
    condition_expression TEXT,  -- When to execute this step
    next_step_on_success UUID,
    next_step_on_failure UUID,
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_workflow_step UNIQUE (workflow_id, step_order)
);

-- ============================================================================
-- 4. AGENT TASK TEMPLATES (Reusable Task Definitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Identity
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Task Classification
    task_category VARCHAR(100),  -- research, analysis, generation, review, etc.
    complexity_level VARCHAR(20) CHECK (complexity_level IN (
        'simple',      -- Single agent, single step
        'moderate',    -- Multiple steps, single agent
        'complex',     -- Multiple agents, delegation
        'advanced'     -- Full workflow with subagents
    )),
    
    -- Recommended Agent Level
    recommended_agent_level INTEGER CHECK (recommended_agent_level BETWEEN 1 AND 5),
    
    -- Task Template
    task_template TEXT NOT NULL,  -- Template with placeholders
    expected_output_format TEXT,
    
    -- Execution Hints
    estimated_duration_seconds INTEGER,
    requires_human_review BOOLEAN DEFAULT false,
    requires_external_tools BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. SYSTEM PROMPT TEMPLATES (Gold Standard Prompts by Level)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Identity
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Agent Level Targeting
    agent_level_id UUID REFERENCES agent_levels(id),
    
    -- Template Sections (Structured)
    role_definition TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]',
    capabilities JSONB DEFAULT '[]',
    tools_available JSONB DEFAULT '[]',
    
    -- Agent Hierarchy Instructions
    delegation_instructions TEXT,
    escalation_instructions TEXT,
    collaboration_instructions TEXT,
    
    -- Context Management (per DeepAgents)
    context_management_instructions TEXT,
    memory_instructions TEXT,
    filesystem_instructions TEXT,
    
    -- Communication Protocols
    output_format_instructions TEXT,
    communication_style TEXT,
    
    -- Safety and Boundaries
    boundaries_and_limitations TEXT,
    ethical_guidelines TEXT,
    
    -- Full Compiled Template
    compiled_template TEXT,
    
    -- Metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. ENABLE RLS
-- ============================================================================
ALTER TABLE agent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompt_templates ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for now)
CREATE POLICY "Allow all for agent_relationships" ON agent_relationships FOR ALL USING (true);
CREATE POLICY "Allow all for agent_workflows" ON agent_workflows FOR ALL USING (true);
CREATE POLICY "Allow all for workflow_steps" ON workflow_steps FOR ALL USING (true);
CREATE POLICY "Allow all for agent_task_templates" ON agent_task_templates FOR ALL USING (true);
CREATE POLICY "Allow all for system_prompt_templates" ON system_prompt_templates FOR ALL USING (true);

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================
COMMENT ON TABLE agent_relationships IS 'Defines parent-child, peer, and tool relationships between agents (DeepAgents pattern)';
COMMENT ON TABLE agent_workflows IS 'Multi-step workflows orchestrating multiple agents';
COMMENT ON TABLE workflow_steps IS 'Individual steps within an agent workflow';
COMMENT ON TABLE agent_task_templates IS 'Reusable task templates with complexity levels';
COMMENT ON TABLE system_prompt_templates IS 'Gold standard system prompt templates by agent level';

