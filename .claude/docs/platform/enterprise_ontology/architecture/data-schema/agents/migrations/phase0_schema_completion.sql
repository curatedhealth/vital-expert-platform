-- ============================================================================
-- AGENTOS 3.0: PHASE 0 - SCHEMA COMPLETION
-- ============================================================================
-- Description: Add all remaining schema components required for GraphRAG
--              and Advanced Agents implementation
-- Dependencies: Requires AgentOS 2.0 schema (34 tables, 6 views)
-- Author: AgentOS Team
-- Date: 2025-11-22
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: KNOWLEDGE GRAPH METADATA TABLES
-- ============================================================================

-- 1.1 KG Node Types Registry
-- Purpose: Define allowed node types in the knowledge graph
-- Examples: Drug, Disease, Guideline, Trial, Publication, KOL, Payer, Regulation
CREATE TABLE IF NOT EXISTS kg_node_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}',  -- Schema for allowed properties
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kg_node_types_name ON kg_node_types(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kg_node_types_active ON kg_node_types(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE kg_node_types IS 'Registry of allowed node types in the knowledge graph';
COMMENT ON COLUMN kg_node_types.properties IS 'JSONB schema defining allowed properties for this node type';

-- 1.2 KG Edge Types Registry
-- Purpose: Define allowed relationship types in the knowledge graph
-- Examples: TREATS, INDICATED_FOR, CONTRAINDICATED_WITH, RECOMMENDS, SUPPORTED_BY
CREATE TABLE IF NOT EXISTS kg_edge_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    inverse_name TEXT,  -- e.g., TREATS has inverse TREATED_BY
    properties JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kg_edge_types_name ON kg_edge_types(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kg_edge_types_active ON kg_edge_types(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE kg_edge_types IS 'Registry of allowed relationship types in the knowledge graph';
COMMENT ON COLUMN kg_edge_types.inverse_name IS 'Inverse relationship name for bidirectional navigation';

-- 1.3 Agent KG Views
-- Purpose: Define per-agent graph view filters for security and precision
-- This is CRITICAL for Graph-RAG security & precision
CREATE TABLE IF NOT EXISTS agent_kg_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    rag_profile_id UUID REFERENCES rag_profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    include_nodes UUID[] DEFAULT '{}',  -- Array of kg_node_types.id
    include_edges UUID[] DEFAULT '{}',  -- Array of kg_edge_types.id
    max_hops INTEGER DEFAULT 3 CHECK (max_hops BETWEEN 1 AND 10),
    graph_limit INTEGER DEFAULT 100 CHECK (graph_limit > 0),
    depth_strategy TEXT DEFAULT 'breadth' CHECK (depth_strategy IN ('breadth', 'depth', 'entity-centric')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(agent_id, name)
);

CREATE INDEX IF NOT EXISTS idx_agent_kg_views_agent ON agent_kg_views(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agent_kg_views_rag_profile ON agent_kg_views(rag_profile_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agent_kg_views_active ON agent_kg_views(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE agent_kg_views IS 'Per-agent graph view filters defining allowed nodes, edges, and traversal depth';
COMMENT ON COLUMN agent_kg_views.depth_strategy IS 'Graph traversal strategy: breadth-first, depth-first, or entity-centric';

-- 1.4 KG Sync Log
-- Purpose: Track synchronization between Postgres metadata and Neo4j graph data
CREATE TABLE IF NOT EXISTS kg_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('entity', 'relationship', 'agent_graph_projection', 'full_sync')),
    source_id UUID,  -- ID of the entity being synced
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'success', 'error')),
    message TEXT,
    error_details JSONB,
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_sync_log_status ON kg_sync_log(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_type ON kg_sync_log(sync_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_source ON kg_sync_log(source_id) WHERE source_id IS NOT NULL;

COMMENT ON TABLE kg_sync_log IS 'Tracks synchronization between Postgres control plane and Neo4j knowledge graph';

-- ============================================================================
-- SECTION 2: AGENT NODE ROLES & VALIDATORS
-- ============================================================================

-- 2.1 Agent Node Roles
-- Purpose: Define roles for agent graph nodes (planner, executor, critic, etc.)
CREATE TABLE IF NOT EXISTS agent_node_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_role TEXT UNIQUE NOT NULL CHECK (node_role IN (
        'planner', 'executor', 'critic', 'router', 'supervisor',
        'panel', 'tool', 'human', 'memory', 'validator'
    )),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE agent_node_roles IS 'Defines roles for agent graph nodes to enable role-specific behavior';

-- Insert default roles
INSERT INTO agent_node_roles (node_role, description) VALUES
    ('planner', 'Plans task decomposition and execution strategy (e.g., Tree-of-Thoughts)'),
    ('executor', 'Executes tasks using skills and tools (e.g., ReAct agent)'),
    ('critic', 'Critiques and validates outputs (e.g., Constitutional AI)'),
    ('router', 'Routes to appropriate sub-agents or skills based on conditions'),
    ('supervisor', 'Supervises multi-agent coordination and synthesis'),
    ('panel', 'Orchestrates panel discussions with multiple agents'),
    ('tool', 'Executes external tool calls'),
    ('human', 'Requires human-in-the-loop interaction'),
    ('memory', 'Retrieves or stores memory (episodic, semantic, instruction)'),
    ('validator', 'Validates safety, compliance, factuality')
ON CONFLICT (node_role) DO NOTHING;

-- 2.2 Add role_id to agent_graph_nodes
-- Purpose: Link nodes to their roles for role-specific compilation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_graph_nodes' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE agent_graph_nodes 
        ADD COLUMN role_id UUID REFERENCES agent_node_roles(id);
        
        -- Check if deleted_at column exists before creating conditional index
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'agent_graph_nodes' AND column_name = 'deleted_at'
        ) THEN
            CREATE INDEX idx_agent_graph_nodes_role ON agent_graph_nodes(role_id) WHERE deleted_at IS NULL;
        ELSE
            CREATE INDEX idx_agent_graph_nodes_role ON agent_graph_nodes(role_id);
        END IF;
    END IF;
END $$;

COMMENT ON COLUMN agent_graph_nodes.role_id IS 'Role of this node for role-specific behavior compilation';

-- 2.3 Agent Validators
-- Purpose: Registry of validator implementations for safety enforcement
CREATE TABLE IF NOT EXISTS agent_validators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    validator_type TEXT NOT NULL CHECK (validator_type IN (
        'safety', 'compliance', 'factuality', 'hallucination',
        'bias', 'toxicity', 'pii', 'clinical_accuracy'
    )),
    description TEXT,
    implementation_ref TEXT,  -- Python module path or service endpoint
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_validators_type ON agent_validators(validator_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agent_validators_active ON agent_validators(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE agent_validators IS 'Registry of validator implementations for safety and quality enforcement';

-- 2.4 Agent Node Validators (Junction Table)
-- Purpose: Assign validators to specific agent graph nodes
CREATE TABLE IF NOT EXISTS agent_node_validators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL REFERENCES agent_graph_nodes(id) ON DELETE CASCADE,
    validator_id UUID NOT NULL REFERENCES agent_validators(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,  -- Lower number = higher priority
    is_blocking BOOLEAN DEFAULT true,  -- If true, failure blocks execution
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(node_id, validator_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_node_validators_node ON agent_node_validators(node_id);
CREATE INDEX IF NOT EXISTS idx_agent_node_validators_validator ON agent_node_validators(validator_id);
CREATE INDEX IF NOT EXISTS idx_agent_node_validators_priority ON agent_node_validators(priority);

COMMENT ON TABLE agent_node_validators IS 'Maps validators to agent graph nodes with execution priority';
COMMENT ON COLUMN agent_node_validators.is_blocking IS 'If true, validator failure prevents node execution';

-- ============================================================================
-- SECTION 3: AGENT MEMORY SYSTEM
-- ============================================================================

-- 3.1 Agent Memory - Episodic (Session-Level)
-- Purpose: Store session-level conversation memory with embeddings for retrieval
CREATE TABLE IF NOT EXISTS agent_memory_episodic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002 dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_agent ON agent_memory_episodic(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_session ON agent_memory_episodic(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_episodic_embedding ON agent_memory_episodic 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE agent_memory_episodic IS 'Session-level conversation memory with semantic search capability';

-- 3.2 Agent Memory - Semantic (Learned Facts)
-- Purpose: Store facts learned by agents with confidence scores
CREATE TABLE IF NOT EXISTS agent_memory_semantic (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    fact TEXT NOT NULL,
    confidence NUMERIC(5,4) CHECK (confidence BETWEEN 0 AND 1),
    source TEXT,  -- Where this fact was learned from
    verified BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_agent ON agent_memory_semantic(agent_id, confidence DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_semantic_verified ON agent_memory_semantic(verified) WHERE verified = true;

COMMENT ON TABLE agent_memory_semantic IS 'Persistent facts learned by agents with confidence tracking';

-- 3.3 Agent Memory - Instructions (Adaptive Rules)
-- Purpose: Store adaptive instructions and specializations
CREATE TABLE IF NOT EXISTS agent_memory_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    rule TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    context JSONB DEFAULT '{}',  -- When this rule applies
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_instructions_agent ON agent_memory_instructions(agent_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_instructions_active ON agent_memory_instructions(is_active) WHERE is_active = true;

COMMENT ON TABLE agent_memory_instructions IS 'Adaptive rules and instructions learned by agents';

-- 3.4 Agent State (LangGraph State Persistence)
-- Purpose: Serialize LangGraph state for time-travel debugging and recovery
CREATE TABLE IF NOT EXISTS agent_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    graph_id UUID REFERENCES agent_graphs(id) ON DELETE SET NULL,
    session_id UUID NOT NULL,
    step_index INTEGER NOT NULL,
    node_id UUID REFERENCES agent_graph_nodes(id),
    state JSONB NOT NULL,  -- Serialized LangGraph state
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_state_session ON agent_state(session_id, step_index);
CREATE INDEX IF NOT EXISTS idx_agent_state_agent ON agent_state(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_state_graph ON agent_state(graph_id, created_at DESC);

COMMENT ON TABLE agent_state IS 'Serialized LangGraph state for debugging, recovery, and training data';

-- ============================================================================
-- SECTION 4: PANEL VOTING & ARBITRATION
-- ============================================================================

-- 4.1 Agent Panel Votes
-- Purpose: Store individual agent votes in panel discussions
CREATE TABLE IF NOT EXISTS agent_panel_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    graph_id UUID NOT NULL REFERENCES agent_graphs(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    vote JSONB NOT NULL,  -- Vote content (recommendation, score, rationale)
    weight NUMERIC(5,4) DEFAULT 1.0 CHECK (weight >= 0),
    confidence NUMERIC(5,4) CHECK (confidence BETWEEN 0 AND 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_session ON agent_panel_votes(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_graph ON agent_panel_votes(graph_id, session_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_votes_agent ON agent_panel_votes(agent_id, created_at DESC);

COMMENT ON TABLE agent_panel_votes IS 'Individual agent votes in panel discussions with weights';

-- 4.2 Agent Panel Arbitrations
-- Purpose: Store final arbitration results from panel discussions
CREATE TABLE IF NOT EXISTS agent_panel_arbitrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    graph_id UUID NOT NULL REFERENCES agent_graphs(id) ON DELETE CASCADE,
    result JSONB NOT NULL,  -- Final arbitrated result
    method TEXT NOT NULL CHECK (method IN ('majority', 'weighted', 'critic-led', 'model-mediated', 'consensus', 'delphi')),
    confidence NUMERIC(5,4) CHECK (confidence BETWEEN 0 AND 1),
    metadata JSONB DEFAULT '{}',  -- Vote distribution, iterations, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_session ON agent_panel_arbitrations(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_graph ON agent_panel_arbitrations(graph_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_panel_arbitrations_method ON agent_panel_arbitrations(method);

COMMENT ON TABLE agent_panel_arbitrations IS 'Final arbitration results from panel discussions';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    -- Count new tables created
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'kg_node_types', 'kg_edge_types', 'agent_kg_views', 'kg_sync_log',
        'agent_node_roles', 'agent_validators', 'agent_node_validators',
        'agent_memory_episodic', 'agent_memory_semantic', 'agent_memory_instructions', 'agent_state',
        'agent_panel_votes', 'agent_panel_arbitrations'
    );
    
    RAISE NOTICE '=== PHASE 0 SCHEMA COMPLETION SUMMARY ===';
    RAISE NOTICE 'New tables created: %', table_count;
    RAISE NOTICE 'Expected: 13 tables';
    
    IF table_count = 13 THEN
        RAISE NOTICE 'STATUS: ✓ All tables created successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠ Some tables may already exist or creation failed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TABLE BREAKDOWN ===';
    RAISE NOTICE 'Knowledge Graph: kg_node_types, kg_edge_types, agent_kg_views, kg_sync_log';
    RAISE NOTICE 'Node Roles: agent_node_roles, agent_validators, agent_node_validators';
    RAISE NOTICE 'Memory System: agent_memory_episodic, agent_memory_semantic, agent_memory_instructions, agent_state';
    RAISE NOTICE 'Panel System: agent_panel_votes, agent_panel_arbitrations';
    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. Run phase0_verification.sql to verify integrity';
    RAISE NOTICE '2. Run seed_kg_metadata.sql to populate KG types';
    RAISE NOTICE '3. Run seed_agent_kg_views.sql to create agent KG views';
    RAISE NOTICE '4. Proceed to Phase 1: GraphRAG Foundation';
END $$;

