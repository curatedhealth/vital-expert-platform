-- ==========================================
-- FILE: phase2_executable_skills.sql
-- PURPOSE: Transform skills from labels to executable units with parameter bindings and LangGraph component registry
-- PHASE: 2 of 9 - Executable Skills & LangGraph Integration
-- DEPENDENCIES: skills table must exist
-- GOLDEN RULES: Executable skills with explicit parameters, no JSONB for parameter definitions
-- ==========================================

-- ==========================================
-- SECTION 1: ENHANCE SKILLS TABLE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 2: EXECUTABLE SKILLS & LANGGRAPH INTEGRATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 1: Enhancing Skills Table ---';
END $$;

-- Add executability columns to skills table
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS skill_type TEXT CHECK (skill_type IN ('tool_call', 'api_call', 'llm_chain', 'custom_logic', 'composite')),
ADD COLUMN IF NOT EXISTS python_module TEXT,
ADD COLUMN IF NOT EXISTS callable_name TEXT,
ADD COLUMN IF NOT EXISTS is_executable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_context BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_stateful BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0';

DO $$
BEGIN
    RAISE NOTICE '✓ Added executability columns to skills table';
END $$;

-- ==========================================
-- SECTION 2: CREATE SKILL PARAMETER DEFINITIONS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 2: Creating Skill Parameter Definitions Table ---';
END $$;

CREATE TABLE IF NOT EXISTS skill_parameter_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    -- Parameter specification
    parameter_name TEXT NOT NULL,
    parameter_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array', 'uuid'
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    
    -- Validation
    validation_rule TEXT, -- e.g., 'regex:^[A-Z]{3}$', 'range:1-100', 'enum:active,inactive'
    description TEXT,
    
    -- Context binding
    binding_source TEXT CHECK (binding_source IN ('literal', 'context', 'previous_step', 'user_input', 'runtime')),
    binding_path TEXT, -- JSONPath or dot notation for context retrieval
    
    -- Metadata
    sequence_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(skill_id, parameter_name)
);

COMMENT ON TABLE skill_parameter_definitions IS 'Defines parameters for executable skills with validation and binding rules';

DO $$
BEGIN
    RAISE NOTICE '✓ Created skill_parameter_definitions table';
END $$;

-- ==========================================
-- SECTION 3: ENHANCE AGENT_SKILLS TABLE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 3: Enhancing Agent Skills Junction Table ---';
END $$;

-- Add execution configuration to agent_skills
ALTER TABLE agent_skills
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS execution_priority INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS max_retry_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS timeout_seconds INTEGER DEFAULT 30;

DO $$
BEGIN
    RAISE NOTICE '✓ Added execution config columns to agent_skills table';
END $$;

-- ==========================================
-- SECTION 4: CREATE LANGGRAPH COMPONENT REGISTRY
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 4: Creating LangGraph Component Registry ---';
END $$;

CREATE TABLE IF NOT EXISTS lang_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    component_type TEXT NOT NULL CHECK (component_type IN (
        'llm_node', 'tool_node', 'router', 'parallel', 
        'subgraph', 'conditional', 'human_in_loop', 'agent'
    )),
    
    -- Implementation
    python_module TEXT NOT NULL,
    callable_name TEXT NOT NULL,
    version TEXT DEFAULT '1.0.0',
    
    -- Configuration
    requires_state BOOLEAN DEFAULT false,
    state_schema_id UUID, -- FK to a schemas table if needed
    is_stateful BOOLEAN DEFAULT false,
    
    -- Metadata
    description TEXT,
    documentation_url TEXT,
    example_config TEXT, -- Plain text example, not JSONB
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_deprecated BOOLEAN DEFAULT false,
    deprecated_by_id UUID REFERENCES lang_components(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(python_module, callable_name, version)
);

COMMENT ON TABLE lang_components IS 'Registry of reusable LangGraph components (nodes, routers, etc.)';

DO $$
BEGIN
    RAISE NOTICE '✓ Created lang_components table';
END $$;

-- ==========================================
-- SECTION 5: LINK SKILLS TO COMPONENTS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 5: Creating Skill-Component Linkage Table ---';
END $$;

CREATE TABLE IF NOT EXISTS skill_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES lang_components(id) ON DELETE CASCADE,
    
    -- Mapping
    is_primary_component BOOLEAN DEFAULT true,
    execution_order INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(skill_id, component_id)
);

COMMENT ON TABLE skill_components IS 'Maps skills to LangGraph components for execution';

DO $$
BEGIN
    RAISE NOTICE '✓ Created skill_components table';
END $$;

-- ==========================================
-- SECTION 6: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 6: Creating Indexes ---';
END $$;

-- Skills indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(skill_type);
CREATE INDEX IF NOT EXISTS idx_skills_executable ON skills(is_executable);
CREATE INDEX IF NOT EXISTS idx_skills_module ON skills(python_module);

-- Skill parameter definitions indexes
CREATE INDEX IF NOT EXISTS idx_skill_parameter_definitions_skill ON skill_parameter_definitions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_parameter_definitions_required ON skill_parameter_definitions(is_required);
CREATE INDEX IF NOT EXISTS idx_skill_parameter_definitions_binding ON skill_parameter_definitions(binding_source);

-- Agent skills indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_agent_skills_enabled ON agent_skills(is_enabled);
CREATE INDEX IF NOT EXISTS idx_agent_skills_priority ON agent_skills(execution_priority);

-- LangGraph components indexes
CREATE INDEX IF NOT EXISTS idx_lang_components_type ON lang_components(component_type);
CREATE INDEX IF NOT EXISTS idx_lang_components_active ON lang_components(is_active);
CREATE INDEX IF NOT EXISTS idx_lang_components_slug ON lang_components(slug);
CREATE INDEX IF NOT EXISTS idx_lang_components_module ON lang_components(python_module);

-- Skill components indexes
CREATE INDEX IF NOT EXISTS idx_skill_components_skill ON skill_components(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_components_component ON skill_components(component_id);
CREATE INDEX IF NOT EXISTS idx_skill_components_primary ON skill_components(is_primary_component);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
END $$;

-- ==========================================
-- SECTION 7: SEED BASIC LANGGRAPH COMPONENTS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 7: Seeding Basic LangGraph Components ---';
END $$;

-- Check if lang_components exists and has data
DO $$
DECLARE
    table_exists BOOLEAN;
    component_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'lang_components'
    ) INTO table_exists;
    
    IF table_exists THEN
        SELECT COUNT(*) INTO component_count FROM lang_components;
        IF component_count > 0 THEN
            RAISE NOTICE '⚠ lang_components already has % rows, skipping seed', component_count;
            RETURN;
        END IF;
    END IF;
END $$;

-- Insert common LangGraph components using explicit column order
DO $$
BEGIN
    -- Insert each component individually with explicit columns
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('OpenAI LLM Node', 'openai_llm_node', 'Standard OpenAI LLM node for text generation', 'llm_node', 'langgraph.prebuilt', 'OpenAINode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Tavily Search Tool', 'tavily_search_tool', 'Web search tool using Tavily API', 'tool_node', 'langgraph.prebuilt.tools', 'TavilySearchTool', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Semantic Router', 'semantic_router', 'Routes based on semantic similarity of inputs', 'router', 'langgraph.prebuilt.routing', 'SemanticRouter', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Parallel Executor', 'parallel_executor', 'Executes multiple nodes in parallel', 'parallel', 'langgraph.prebuilt.parallel', 'ParallelNode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Human Approval Gate', 'human_approval_gate', 'Requires human approval before proceeding', 'human_in_loop', 'langgraph.prebuilt.human', 'HumanApprovalNode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Conditional Branch', 'conditional_branch', 'Branches based on condition evaluation', 'conditional', 'langgraph.prebuilt.conditional', 'ConditionalNode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Subgraph Node', 'subgraph_node', 'Embeds another graph as a node', 'subgraph', 'langgraph.prebuilt', 'SubgraphNode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO lang_components (name, slug, description, component_type, python_module, callable_name, version, is_active)
    VALUES ('Agent Node', 'agent_node', 'Full agent with tools and memory', 'agent', 'langgraph.prebuilt.agent', 'AgentNode', '1.0.0', true)
    ON CONFLICT (slug) DO NOTHING;
    
    RAISE NOTICE '✓ Seeded LangGraph components';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Error seeding components (may already exist): %', SQLERRM;
END $$;

DO $$
DECLARE
    component_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO component_count FROM lang_components WHERE is_active = true;
    RAISE NOTICE '✓ Seeded % LangGraph components', component_count;
END $$;

-- ==========================================
-- SECTION 8: VERIFICATION QUERIES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SECTION 8: VERIFICATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

DO $$
DECLARE
    skill_count INTEGER;
    executable_skill_count INTEGER;
    param_def_count INTEGER;
    component_count INTEGER;
    skill_component_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO skill_count FROM skills;
    SELECT COUNT(*) INTO executable_skill_count FROM skills WHERE is_executable = true;
    SELECT COUNT(*) INTO param_def_count FROM skill_parameter_definitions;
    SELECT COUNT(*) INTO component_count FROM lang_components WHERE is_active = true;
    SELECT COUNT(*) INTO skill_component_count FROM skill_components;
    
    RAISE NOTICE '=== POST-MIGRATION STATE ===';
    RAISE NOTICE 'Total skills: %', skill_count;
    RAISE NOTICE 'Executable skills: %', executable_skill_count;
    RAISE NOTICE 'Skill parameter definitions: %', param_def_count;
    RAISE NOTICE 'Active LangGraph components: %', component_count;
    RAISE NOTICE 'Skill-component mappings: %', skill_component_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 2 COMPLETE: EXECUTABLE SKILLS & LANGGRAPH INTEGRATION';
    RAISE NOTICE '=================================================================';
END $$;

-- Final summary query
SELECT 
    'Skills (total)' as entity, 
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_executable = true) as executable_count
FROM skills
UNION ALL
SELECT 
    'Skill Parameters', 
    COUNT(*),
    COUNT(DISTINCT skill_id)
FROM skill_parameter_definitions
UNION ALL
SELECT 
    'LangGraph Components', 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true)
FROM lang_components
UNION ALL
SELECT 
    'Skill-Component Mappings', 
    COUNT(*),
    COUNT(DISTINCT skill_id)
FROM skill_components;

