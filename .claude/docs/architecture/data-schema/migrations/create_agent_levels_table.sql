-- =====================================================
-- Create Agent Levels Table and Add Foreign Key
-- =====================================================
-- Creates the agent_levels lookup table and adds agent_level_id to agents
-- =====================================================

-- Create agent_levels table
CREATE TABLE IF NOT EXISTS agent_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    level_number INTEGER NOT NULL UNIQUE,
    
    -- Definitions
    description TEXT NOT NULL,
    definition TEXT NOT NULL,
    purpose TEXT NOT NULL,
    
    -- Capabilities
    can_spawn_lower_levels BOOLEAN DEFAULT false,
    can_spawn_specialists BOOLEAN DEFAULT false,
    can_spawn_workers BOOLEAN DEFAULT false,
    can_spawn_tools BOOLEAN DEFAULT false,
    max_spawned_agents INTEGER DEFAULT 0,
    
    -- Characteristics
    typical_use_cases TEXT[],
    key_characteristics TEXT[],
    response_complexity TEXT CHECK (response_complexity IN ('simple', 'moderate', 'complex', 'deep', 'strategic')),
    autonomy_level TEXT CHECK (autonomy_level IN ('fully_autonomous', 'semi_autonomous', 'supervised', 'tool_only')),
    
    -- Performance expectations
    avg_response_time_ms INTEGER,
    typical_token_usage INTEGER,
    accuracy_target_pct NUMERIC(5,2),
    
    -- Operational
    requires_human_oversight BOOLEAN DEFAULT false,
    can_escalate_up BOOLEAN DEFAULT true,
    can_delegate_down BOOLEAN DEFAULT false,
    supports_parallel_execution BOOLEAN DEFAULT false,
    
    -- LLM Configuration
    recommended_model TEXT,
    fallback_model TEXT,
    allowed_models TEXT[],
    default_temperature NUMERIC(3,2),
    default_max_tokens INTEGER,
    supports_streaming BOOLEAN DEFAULT true,
    
    -- Icons & Display
    icon_name TEXT, -- Lucide React icon name (e.g., 'Target', 'Award', 'Settings')
    color_hex TEXT,
    display_order INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_agent_levels_level_number 
ON agent_levels(level_number) 
WHERE deleted_at IS NULL;

-- Add agent_level_id to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS agent_level_id UUID REFERENCES agent_levels(id);

-- Create index on agents.agent_level_id
CREATE INDEX IF NOT EXISTS idx_agents_agent_level_id 
ON agents(agent_level_id) 
WHERE deleted_at IS NULL;

-- Seed the 5 agent levels
INSERT INTO agent_levels (
    name, slug, level_number, 
    description, definition, purpose,
    can_spawn_lower_levels, can_spawn_specialists, can_spawn_workers, can_spawn_tools,
    max_spawned_agents,
    typical_use_cases, key_characteristics,
    response_complexity, autonomy_level,
    avg_response_time_ms, typical_token_usage, accuracy_target_pct,
    requires_human_oversight, can_escalate_up, can_delegate_down, supports_parallel_execution,
    recommended_model, fallback_model, allowed_models, default_temperature, default_max_tokens, supports_streaming,
    icon_name, color_hex, display_order
)
VALUES 
    -- LEVEL 1: MASTER AGENTS
    (
        'Master',
        'master',
        1,
        'Top-level orchestrators managing entire domains or functions',
        'Master Agents are the highest-level AI agents in the hierarchy, responsible for strategic coordination across entire functional domains (e.g., Regulatory, Clinical, Market Access). They delegate to Expert Agents and provide comprehensive oversight.',
        'Provide strategic oversight, coordinate cross-functional activities, delegate complex queries to appropriate Expert Agents, and synthesize multi-domain responses',
        true, true, true, true, -- Can spawn all lower levels
        15, -- Max spawned agents
        ARRAY['Strategic coordination', 'Cross-functional orchestration', 'High-level delegation', 'Domain-wide oversight', 'Multi-expert synthesis'],
        ARRAY['Strategic thinking', 'Delegation expertise', 'Cross-domain knowledge', 'Synthesis capabilities', 'Escalation management'],
        'strategic',
        'fully_autonomous',
        5000, 8000, 95.00,
        false, false, true, true,
        'gpt-4o', 'gpt-4-turbo', ARRAY['gpt-4o', 'gpt-4-turbo', 'claude-3-opus', 'claude-3.5-sonnet'],
        0.7, 8000, true,
        'Target', '#1E40AF', 1
    ),
    
    -- LEVEL 2: EXPERT AGENTS
    (
        'Expert',
        'expert',
        2,
        'Deep domain specialists with advanced analytical capabilities',
        'Expert Agents are domain specialists (e.g., FDA Expert, Clinical Trial Design Expert, Reimbursement Expert) with deep knowledge in specific areas. They handle complex queries requiring specialized expertise and can spawn Specialist Agents for sub-domain tasks.',
        'Provide deep domain expertise, handle complex analytical queries, spawn Specialist Agents for technical sub-tasks, and deliver evidence-based recommendations',
        true, true, true, true, -- Can spawn specialists, workers, and tools
        10, -- Max spawned agents
        ARRAY['Domain expertise', 'Complex problem solving', 'Specialized analysis', 'Expert consultation', 'Technical deep-dives'],
        ARRAY['Deep domain knowledge', 'Analytical reasoning', 'Evidence-based', 'Specialization', 'Sub-agent coordination'],
        'deep',
        'fully_autonomous',
        10000, 6000, 92.00,
        false, true, true, true,
        'gpt-4o', 'gpt-4-turbo', ARRAY['gpt-4o', 'gpt-4-turbo', 'claude-3.5-sonnet', 'claude-3-sonnet'],
        0.7, 6000, true,
        'Award', '#2563EB', 2
    ),
    
    -- LEVEL 3: SPECIALIST AGENTS
    (
        'Specialist',
        'specialist',
        3,
        'Focused specialists for specific sub-domains or technical tasks',
        'Specialist Agents focus on narrow sub-domains (e.g., Predicate Identification, Endpoint Selection, Payer Negotiation) and are dynamically spawned by Expert Agents to handle well-defined, technical work.',
        'Execute well-defined sub-domain tasks, provide specialized technical analysis, spawn Worker Agents for data processing, and deliver focused outputs',
        true, false, true, true, -- Can spawn workers and tools, not specialists
        5, -- Max spawned agents
        ARRAY['Sub-domain focus', 'Technical implementation', 'Specific task execution', 'Domain-specific analysis', 'Focused problem-solving'],
        ARRAY['Narrow expertise', 'Task-oriented', 'Technical depth', 'Efficient execution', 'Clear scope'],
        'complex',
        'semi_autonomous',
        15000, 4000, 90.00,
        false, true, true, true,
        'gpt-4-turbo', 'gpt-4', ARRAY['gpt-4-turbo', 'gpt-4', 'claude-3-sonnet', 'claude-3-haiku'],
        0.6, 4000, true,
        'Settings', '#3B82F6', 3
    ),
    
    -- LEVEL 4: WORKER AGENTS
    (
        'Worker',
        'worker',
        4,
        'Task-execution agents for routine, repeatable work',
        'Worker Agents handle structured, repeatable tasks (e.g., Literature Search, Data Analysis, Document Generation) that follow well-defined processes. They execute in parallel and leverage Tool Agents for atomic operations.',
        'Execute routine tasks, process structured data, perform document transformations, run parallel workflows, and leverage Tool Agents for API calls',
        true, false, false, true, -- Can only spawn tools
        3, -- Max spawned agents
        ARRAY['Routine tasks', 'Data processing', 'Document handling', 'Structured workflows', 'Parallel execution'],
        ARRAY['Task automation', 'Process adherence', 'Efficiency', 'Repeatability', 'Parallel processing'],
        'moderate',
        'supervised',
        5000, 2000, 85.00,
        false, true, false, true,
        'gpt-4', 'gpt-3.5-turbo', ARRAY['gpt-4', 'gpt-3.5-turbo', 'claude-3-haiku'],
        0.5, 2000, true,
        'Wrench', '#60A5FA', 4
    ),
    
    -- LEVEL 5: TOOL AGENTS
    (
        'Tool',
        'tool',
        5,
        'Micro-agents wrapping specific tools, APIs, or atomic operations',
        'Tool Agents are lightweight wrappers around specific tools, APIs, or atomic operations (e.g., PubMed Search, FDA Database Query, Statistical Calculator). They execute single-purpose actions and return structured data.',
        'Execute atomic operations, wrap external APIs, perform single-purpose tasks, return structured data, and provide tool-level reliability',
        false, false, false, false, -- Cannot spawn any sub-agents
        0, -- Cannot spawn
        ARRAY['API calls', 'Tool wrapping', 'Atomic operations', 'Single-purpose execution', 'Data retrieval'],
        ARRAY['Lightweight', 'Single-purpose', 'Fast execution', 'Structured output', 'Reliability'],
        'simple',
        'tool_only',
        1000, 500, 98.00,
        false, true, false, true,
        'gpt-3.5-turbo', 'gpt-3.5-turbo', ARRAY['gpt-3.5-turbo', 'gpt-4'],
        0.3, 500, false,
        'Plug', '#93C5FD', 5
    )
ON CONFLICT (name) DO UPDATE SET
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    definition = EXCLUDED.definition,
    purpose = EXCLUDED.purpose,
    can_spawn_lower_levels = EXCLUDED.can_spawn_lower_levels,
    can_spawn_specialists = EXCLUDED.can_spawn_specialists,
    can_spawn_workers = EXCLUDED.can_spawn_workers,
    can_spawn_tools = EXCLUDED.can_spawn_tools,
    max_spawned_agents = EXCLUDED.max_spawned_agents,
    typical_use_cases = EXCLUDED.typical_use_cases,
    key_characteristics = EXCLUDED.key_characteristics,
    response_complexity = EXCLUDED.response_complexity,
    autonomy_level = EXCLUDED.autonomy_level,
    avg_response_time_ms = EXCLUDED.avg_response_time_ms,
    typical_token_usage = EXCLUDED.typical_token_usage,
    accuracy_target_pct = EXCLUDED.accuracy_target_pct,
    requires_human_oversight = EXCLUDED.requires_human_oversight,
    can_escalate_up = EXCLUDED.can_escalate_up,
    can_delegate_down = EXCLUDED.can_delegate_down,
    supports_parallel_execution = EXCLUDED.supports_parallel_execution,
    recommended_model = EXCLUDED.recommended_model,
    fallback_model = EXCLUDED.fallback_model,
    allowed_models = EXCLUDED.allowed_models,
    default_temperature = EXCLUDED.default_temperature,
    default_max_tokens = EXCLUDED.default_max_tokens,
    supports_streaming = EXCLUDED.supports_streaming,
    icon_name = EXCLUDED.icon_name,
    color_hex = EXCLUDED.color_hex,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_agent_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_agent_levels_updated_at ON agent_levels;
CREATE TRIGGER trigger_update_agent_levels_updated_at
    BEFORE UPDATE ON agent_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_levels_updated_at();

-- Verification query
SELECT 
    level_number,
    name,
    slug,
    description,
    response_complexity,
    autonomy_level,
    recommended_model,
    fallback_model,
    default_temperature,
    default_max_tokens,
    can_spawn_specialists,
    can_spawn_workers,
    can_spawn_tools,
    max_spawned_agents,
    accuracy_target_pct,
    icon_name,
    color_hex
FROM agent_levels
ORDER BY level_number;

