-- =====================================================
-- 5-Level Agent Hierarchy - Schema Migration
-- =====================================================
-- Adds support for Master → Expert → Specialist → Worker → Tool hierarchy
-- Version: 1.0
-- Date: 2025-11-22
-- =====================================================

-- =====================================================
-- STEP 1: Add New Columns to AGENTS Table
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Adding 5-Level Hierarchy Support to AGENTS Table';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

-- Add agent_level (CRITICAL - defines hierarchy position)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    agent_level TEXT NOT NULL DEFAULT 'expert'
    CHECK (agent_level IN ('master', 'expert', 'specialist', 'worker', 'tool'));

-- Add master_agent_id (links to Level 1 master)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    master_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    master_agent_name TEXT;

-- Add industry_vertical (10 healthcare verticals)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    industry_vertical TEXT
    CHECK (industry_vertical IN (
        'pharmaceuticals', 'medical_devices', 'biotechnology',
        'digital_health', 'diagnostics', 'healthcare_services',
        'health_insurance', 'hospital_systems', 'clinical_research',
        'regulatory_affairs'
    ));

-- Add reasoning capabilities (JSONB)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    reasoning_capabilities JSONB DEFAULT '{
        "chain_of_thought": false,
        "tree_of_thoughts": false,
        "self_critique": false,
        "constitutional_ai": false
    }'::jsonb;

-- Add spawning capabilities
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    can_spawn_specialists BOOLEAN DEFAULT false;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    can_spawn_workers BOOLEAN DEFAULT false;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    max_spawned_agents INTEGER DEFAULT 0;

-- Add performance metrics
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    accuracy_score NUMERIC(4,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    response_time_p50 INTEGER;  -- milliseconds

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    response_time_p95 INTEGER;  -- milliseconds

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    satisfaction_rating NUMERIC(3,2) CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5);

-- Add expertise arrays
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    domain_expertise TEXT[];

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    certifications TEXT[];

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    knowledge_sources TEXT[];

-- Add tool-specific fields (for Level 5)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    tool_type TEXT
    CHECK (tool_type IN (
        'database', 'search', 'calculator', 'generator',
        'analyzer', 'validator', 'integration'
    ));

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    tool_endpoint TEXT;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    tool_auth_method TEXT;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    tool_rate_limit INTEGER;

-- Add cost fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    cost_per_query NUMERIC(10,4) CHECK (cost_per_query >= 0);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS 
    monthly_quota INTEGER;

DO $$ BEGIN
    RAISE NOTICE '✓ Added 20+ new columns to agents table';
END $$;

-- =====================================================
-- STEP 2: Create Indexes for New Columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_agents_level ON agents(agent_level);
CREATE INDEX IF NOT EXISTS idx_agents_master ON agents(master_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_vertical ON agents(industry_vertical);
CREATE INDEX IF NOT EXISTS idx_agents_domain_expertise ON agents USING GIN(domain_expertise);
CREATE INDEX IF NOT EXISTS idx_agents_spawning ON agents(can_spawn_specialists, can_spawn_workers) WHERE can_spawn_specialists = true OR can_spawn_workers = true;

DO $$ BEGIN
    RAISE NOTICE '✓ Created indexes for new columns';
END $$;

-- =====================================================
-- STEP 3: Enhance AGENT_HIERARCHIES Table
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Enhancing AGENT_HIERARCHIES Table';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

-- Add level tracking
ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    parent_level TEXT CHECK (parent_level IN ('master', 'expert', 'specialist', 'worker', 'tool'));

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    child_level TEXT CHECK (child_level IN ('master', 'expert', 'specialist', 'worker', 'tool'));

-- Add spawning context
ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    is_dynamic_spawn BOOLEAN DEFAULT false;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    spawn_condition JSONB;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    max_concurrent_spawns INTEGER DEFAULT 1;

-- Add execution context
ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    execution_order INTEGER;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    is_parallel BOOLEAN DEFAULT false;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    timeout_seconds INTEGER DEFAULT 60;

-- Add priority and routing
ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100);

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    weight NUMERIC(3,2) DEFAULT 1.0;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    routing_rules JSONB;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    fallback_agent_id UUID REFERENCES agents(id);

-- Add metrics
ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    total_delegations INTEGER DEFAULT 0;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    successful_delegations INTEGER DEFAULT 0;

ALTER TABLE agent_hierarchies ADD COLUMN IF NOT EXISTS 
    avg_delegation_time INTEGER;

DO $$ BEGIN
    RAISE NOTICE '✓ Added 15+ new columns to agent_hierarchies table';
END $$;

-- Update relationship_type constraint to include 'uses' (for Level 5 tools)
ALTER TABLE agent_hierarchies DROP CONSTRAINT IF EXISTS agent_hierarchies_relationship_type_check;
ALTER TABLE agent_hierarchies ADD CONSTRAINT agent_hierarchies_relationship_type_check
    CHECK (relationship_type IN ('delegates_to', 'supervises', 'collaborates_with', 'consults', 'escalates_to', 'uses'));

DO $$ BEGIN
    RAISE NOTICE '✓ Updated relationship_type to include ''uses'' for tool integration';
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hierarchies_parent_level ON agent_hierarchies(parent_level);
CREATE INDEX IF NOT EXISTS idx_hierarchies_child_level ON agent_hierarchies(child_level);
CREATE INDEX IF NOT EXISTS idx_hierarchies_execution ON agent_hierarchies(execution_order) WHERE execution_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hierarchies_parallel ON agent_hierarchies(is_parallel) WHERE is_parallel = true;
CREATE INDEX IF NOT EXISTS idx_hierarchies_dynamic ON agent_hierarchies(is_dynamic_spawn) WHERE is_dynamic_spawn = true;

DO $$ BEGIN
    RAISE NOTICE '✓ Created indexes for hierarchy enhancements';
END $$;

-- =====================================================
-- STEP 4: Create AGENT_LEVELS Reference Table
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Creating New Supporting Tables';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

CREATE TABLE IF NOT EXISTS agent_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 5),
    level_name TEXT NOT NULL UNIQUE,
    level_description TEXT,
    
    -- Capabilities by Level
    can_spawn_children BOOLEAN DEFAULT false,
    max_children INTEGER,
    default_reasoning_capabilities JSONB DEFAULT '{}',
    
    -- Performance Targets
    target_response_time_p50 INTEGER,
    target_response_time_p95 INTEGER,
    target_accuracy NUMERIC(4,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed agent levels
INSERT INTO agent_levels (level_number, level_name, level_description, can_spawn_children, max_children, default_reasoning_capabilities, target_response_time_p50, target_response_time_p95, target_accuracy)
VALUES 
    (1, 'master', 'Orchestrators - coordinate multiple experts', true, 50, '{"chain_of_thought": true, "tree_of_thoughts": true}'::jsonb, 2000, 5000, 0.95),
    (2, 'expert', 'Domain Specialists - 136+ specialized agents', true, 10, '{"chain_of_thought": true}'::jsonb, 1500, 3000, 0.92),
    (3, 'specialist', 'Sub-Experts - dynamically spawned as needed', true, 5, '{"chain_of_thought": true}'::jsonb, 1000, 2000, 0.90),
    (4, 'worker', 'Task Executors - parallel task execution', true, 10, '{}'::jsonb, 500, 1000, 0.85),
    (5, 'tool', 'Integration Tools - 100+ specialized tools', false, 0, '{}'::jsonb, 200, 500, 0.99)
ON CONFLICT (level_number) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '✓ Created agent_levels table with 5 level definitions';
END $$;

-- =====================================================
-- STEP 5: Create AGENT_CAPABILITIES Table
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Capability Definition
    capability_name TEXT NOT NULL,
    capability_type TEXT CHECK (capability_type IN (
        'reasoning',
        'action',
        'integration',
        'domain_knowledge'
    )),
    capability_description TEXT,
    
    -- Proficiency
    proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    
    -- Validation
    is_validated BOOLEAN DEFAULT false,
    validation_score NUMERIC(3,2),
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, capability_name)
);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_type ON agent_capabilities(capability_type);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_proficiency ON agent_capabilities(proficiency_level);

DO $$ BEGIN
    RAISE NOTICE '✓ Created agent_capabilities table';
END $$;

-- =====================================================
-- STEP 6: Create AGENT_VERTICAL_MAPPING Table
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_vertical_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Vertical Assignment
    industry_vertical TEXT NOT NULL CHECK (industry_vertical IN (
        'pharmaceuticals', 'medical_devices', 'biotechnology',
        'digital_health', 'diagnostics', 'healthcare_services',
        'health_insurance', 'hospital_systems', 'clinical_research',
        'regulatory_affairs'
    )),
    
    -- Vertical-Specific Config
    vertical_expertise_level TEXT CHECK (vertical_expertise_level IN ('beginner', 'intermediate', 'expert', 'master')),
    vertical_priority INTEGER DEFAULT 50,
    
    -- Usage in Vertical
    queries_in_vertical INTEGER DEFAULT 0,
    avg_rating_in_vertical NUMERIC(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, industry_vertical)
);

CREATE INDEX IF NOT EXISTS idx_agent_vertical_agent ON agent_vertical_mapping(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_vertical_industry ON agent_vertical_mapping(industry_vertical);

DO $$ BEGIN
    RAISE NOTICE '✓ Created agent_vertical_mapping table';
END $$;

-- =====================================================
-- STEP 7: Create AGENT_SPAWN_HISTORY Table
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_spawn_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Spawn Context
    parent_agent_id UUID NOT NULL REFERENCES agents(id),
    spawned_agent_id UUID NOT NULL REFERENCES agents(id),
    spawn_reason TEXT,
    spawn_trigger JSONB,
    
    -- Session Context
    conversation_id UUID,
    user_query TEXT,
    
    -- Lifecycle
    spawned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Result
    spawn_successful BOOLEAN,
    output_summary TEXT,
    
    -- Performance
    response_time_ms INTEGER,
    tokens_used INTEGER,
    cost NUMERIC(10,4)
);

CREATE INDEX IF NOT EXISTS idx_spawn_history_parent ON agent_spawn_history(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_spawn_history_spawned ON agent_spawn_history(spawned_agent_id);
CREATE INDEX IF NOT EXISTS idx_spawn_history_conversation ON agent_spawn_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_spawn_history_time ON agent_spawn_history(spawned_at);

DO $$ BEGIN
    RAISE NOTICE '✓ Created agent_spawn_history table';
END $$;

-- =====================================================
-- STEP 8: Create MASTER_AGENTS Table
-- =====================================================

CREATE TABLE IF NOT EXISTS master_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Master Identity
    master_domain TEXT NOT NULL UNIQUE CHECK (master_domain IN (
        'regulatory',
        'clinical',
        'market_access',
        'technical',
        'strategic',
        'medical_excellence',
        'operations'
    )),
    
    -- Master Capabilities
    orchestration_strategy TEXT,
    max_concurrent_experts INTEGER DEFAULT 5,
    expert_selection_algorithm TEXT DEFAULT 'semantic_routing',
    
    -- Performance
    total_orchestrations INTEGER DEFAULT 0,
    avg_orchestration_time INTEGER,
    success_rate NUMERIC(4,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_master_agents_domain ON master_agents(master_domain);
CREATE INDEX IF NOT EXISTS idx_master_agents_active ON master_agents(is_active) WHERE is_active = true;

DO $$ BEGIN
    RAISE NOTICE '✓ Created master_agents table';
END $$;

-- =====================================================
-- STEP 9: Create Views for 5-Level System
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Creating Views for 5-Level Hierarchy';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

-- View: Complete Agent Hierarchy
CREATE OR REPLACE VIEW v_agent_hierarchy_complete AS
SELECT 
    a.id,
    a.name,
    a.agent_level,
    a.master_agent_id,
    ma.name as master_agent_name,
    a.industry_vertical,
    a.can_spawn_specialists,
    a.can_spawn_workers,
    
    -- Count children by level
    (SELECT COUNT(*) FROM agent_hierarchies ah WHERE ah.parent_agent_id = a.id AND ah.child_level = 'expert') as expert_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah WHERE ah.parent_agent_id = a.id AND ah.child_level = 'specialist') as specialist_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah WHERE ah.parent_agent_id = a.id AND ah.child_level = 'worker') as worker_children_count,
    (SELECT COUNT(*) FROM agent_hierarchies ah WHERE ah.parent_agent_id = a.id AND ah.child_level = 'tool') as tool_children_count,
    
    -- Performance
    a.accuracy_score,
    a.satisfaction_rating,
    a.usage_count,
    a.response_time_p50,
    a.response_time_p95
    
FROM agents a
LEFT JOIN agents ma ON a.master_agent_id = ma.id
WHERE a.deleted_at IS NULL
ORDER BY 
    CASE a.agent_level
        WHEN 'master' THEN 1
        WHEN 'expert' THEN 2
        WHEN 'specialist' THEN 3
        WHEN 'worker' THEN 4
        WHEN 'tool' THEN 5
    END,
    a.name;

DO $$ BEGIN
    RAISE NOTICE '✓ Created v_agent_hierarchy_complete view';
END $$;

-- View: Agent Routing Map
CREATE OR REPLACE VIEW v_agent_routing_map AS
SELECT 
    pa.name as parent_agent,
    pa.agent_level as parent_level,
    ca.name as child_agent,
    ca.agent_level as child_level,
    ah.relationship_type,
    ah.delegation_trigger,
    ah.auto_delegate,
    ah.confidence_threshold,
    ah.execution_order,
    ah.is_parallel,
    ah.total_delegations,
    ah.successful_delegations,
    CASE 
        WHEN ah.total_delegations > 0 
        THEN ROUND((ah.successful_delegations::NUMERIC / ah.total_delegations * 100), 2)
        ELSE 0
    END as success_rate_pct
FROM agent_hierarchies ah
JOIN agents pa ON ah.parent_agent_id = pa.id
JOIN agents ca ON ah.child_agent_id = ca.id
WHERE pa.deleted_at IS NULL AND ca.deleted_at IS NULL
ORDER BY pa.agent_level, pa.name, ah.execution_order NULLS LAST;

DO $$ BEGIN
    RAISE NOTICE '✓ Created v_agent_routing_map view';
END $$;

-- =====================================================
-- STEP 10: Update Existing Agents to Level 2 (Expert)
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Updating Existing Agents';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
END $$;

-- Update existing 5 analytics agents to Level 2 (Expert)
UPDATE agents 
SET 
    agent_level = 'expert',
    reasoning_capabilities = '{"chain_of_thought": true, "self_critique": true}'::jsonb,
    domain_expertise = ARRAY['analytics', 'medical-affairs', 'data-science'],
    industry_vertical = 'pharmaceuticals'
WHERE name IN (
    'Director of Medical Analytics',
    'Real-World Evidence Analyst',
    'Clinical Data Scientist',
    'Market Insights Analyst',
    'HCP Engagement Analytics Specialist'
);

DO $$ BEGIN
    RAISE NOTICE '✓ Updated 5 existing agents to Level 2 (expert)';
END $$;

-- Update existing hierarchies with level information
UPDATE agent_hierarchies ah
SET 
    parent_level = pa.agent_level,
    child_level = ca.agent_level
FROM agents pa, agents ca
WHERE ah.parent_agent_id = pa.id 
  AND ah.child_agent_id = ca.id
  AND ah.parent_level IS NULL;

DO $$ BEGIN
    RAISE NOTICE '✓ Updated existing hierarchies with level information';
END $$;

-- =====================================================
-- COMPLETION SUMMARY
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '5-Level Agent Hierarchy Migration COMPLETE!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  ✓ Enhanced agents table (20+ new columns)';
    RAISE NOTICE '  ✓ Enhanced agent_hierarchies table (15+ new columns)';
    RAISE NOTICE '  ✓ Created agent_levels table';
    RAISE NOTICE '  ✓ Created agent_capabilities table';
    RAISE NOTICE '  ✓ Created agent_vertical_mapping table';
    RAISE NOTICE '  ✓ Created agent_spawn_history table';
    RAISE NOTICE '  ✓ Created master_agents table';
    RAISE NOTICE '  ✓ Created v_agent_hierarchy_complete view';
    RAISE NOTICE '  ✓ Created v_agent_routing_map view';
    RAISE NOTICE '  ✓ Updated 5 existing agents to Level 2';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Seed 5 Master Agents (Level 1)';
    RAISE NOTICE '  2. Seed 30+ Expert Agents (Level 2)';
    RAISE NOTICE '  3. Define Specialist Agents (Level 3)';
    RAISE NOTICE '  4. Define Worker Agents (Level 4)';
    RAISE NOTICE '  5. Define Tool Agents (Level 5)';
    RAISE NOTICE '';
END $$;

