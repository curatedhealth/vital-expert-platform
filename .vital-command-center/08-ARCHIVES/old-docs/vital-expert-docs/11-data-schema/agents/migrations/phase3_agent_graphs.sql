-- ==========================================
-- FILE: phase3_agent_graphs.sql
-- PURPOSE: Create first-class agent graph tables for data-driven orchestration (routers, chains, hierarchies)
-- PHASE: 3 of 9 - Agent Graph Model
-- DEPENDENCIES: agents, lang_components, tools tables must exist
-- GOLDEN RULES: Data-driven orchestration, no hardcoded flows
-- ==========================================

-- ==========================================
-- SECTION 1: CREATE AGENT GRAPHS TABLE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3: AGENT GRAPH MODEL';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 1: Creating Agent Graphs Table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_graphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Graph Type
    graph_type TEXT NOT NULL CHECK (graph_type IN (
        'sequential', 'parallel', 'conditional', 'router', 
        'hierarchical', 'loop', 'subgraph', 'custom'
    )),
    
    -- Root/Entry Point (will add FK constraint after nodes table created)
    entry_node_id UUID,
    
    -- Configuration
    is_reentrant BOOLEAN DEFAULT false,
    max_iterations INTEGER DEFAULT 10,
    timeout_seconds INTEGER DEFAULT 300,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0.0',
    
    -- Metadata
    tags TEXT[], -- Temporary array, can normalize later if needed
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(tenant_id, slug)
);

COMMENT ON TABLE agent_graphs IS 'First-class agent orchestration graphs for data-driven workflows';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_graphs table';
END $$;

-- ==========================================
-- SECTION 2: CREATE AGENT GRAPH NODES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 2: Creating Agent Graph Nodes Table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_graph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id UUID NOT NULL REFERENCES agent_graphs(id) ON DELETE CASCADE,
    
    -- Node Identity
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN (
        'agent', 'llm', 'tool', 'router', 'condition', 
        'parallel', 'human', 'subgraph', 'start', 'end'
    )),
    
    -- Linked Resources
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    component_id UUID REFERENCES lang_components(id) ON DELETE SET NULL,
    tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
    subgraph_id UUID REFERENCES agent_graphs(id) ON DELETE SET NULL,
    
    -- Node Position (for visual editor)
    position_x INTEGER,
    position_y INTEGER,
    
    -- Execution Config
    is_async BOOLEAN DEFAULT false,
    retry_on_failure BOOLEAN DEFAULT false,
    max_retries INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 60,
    
    -- Routing Logic (for router nodes)
    routing_logic TEXT, -- Plain text description or reference to a routing_policy_id
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(graph_id, node_name)
);

COMMENT ON TABLE agent_graph_nodes IS 'Nodes in agent graphs - can be agents, tools, routers, conditions, etc.';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_graph_nodes table';
END $$;

-- ==========================================
-- SECTION 3: CREATE AGENT GRAPH EDGES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 3: Creating Agent Graph Edges Table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id UUID NOT NULL REFERENCES agent_graphs(id) ON DELETE CASCADE,
    
    -- Edge endpoints
    source_node_id UUID NOT NULL REFERENCES agent_graph_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES agent_graph_nodes(id) ON DELETE CASCADE,
    
    -- Edge properties
    edge_label TEXT, -- e.g., 'success', 'failure', 'condition_met'
    condition_expression TEXT, -- Plain text or reference to condition logic
    is_default BOOLEAN DEFAULT false,
    
    -- Execution order (for sequential flows)
    sequence_order INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT no_self_loop CHECK (source_node_id != target_node_id),
    UNIQUE(source_node_id, target_node_id, edge_label)
);

COMMENT ON TABLE agent_graph_edges IS 'Edges connecting nodes in agent graphs with conditions and labels';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_graph_edges table';
END $$;

-- ==========================================
-- SECTION 4: CREATE AGENT HIERARCHIES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 4: Creating Agent Hierarchies Table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_hierarchies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Hierarchy relationship
    parent_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    child_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Relationship metadata
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'delegates_to', 'supervises', 'collaborates_with', 'consults', 'escalates_to'
    )),
    
    -- Delegation rules
    delegation_trigger TEXT, -- Plain text description
    auto_delegate BOOLEAN DEFAULT false,
    confidence_threshold NUMERIC(3,2) CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT no_self_hierarchy CHECK (parent_agent_id != child_agent_id),
    UNIQUE(parent_agent_id, child_agent_id, relationship_type)
);

COMMENT ON TABLE agent_hierarchies IS 'Parent-child agent relationships for delegation and escalation patterns';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_hierarchies table';
END $$;

-- ==========================================
-- SECTION 5: CREATE AGENT GRAPH ASSIGNMENTS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 5: Creating Agent Graph Assignments Table ---';
END $$;

CREATE TABLE IF NOT EXISTS agent_graph_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    graph_id UUID NOT NULL REFERENCES agent_graphs(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    is_primary_graph BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, graph_id)
);

COMMENT ON TABLE agent_graph_assignments IS 'Maps agents to their execution graphs';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_graph_assignments table';
END $$;

-- ==========================================
-- SECTION 6: ADD FOREIGN KEY FOR ENTRY NODE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 6: Adding Foreign Key for Entry Node ---';
END $$;

-- Add FK constraint for entry_node_id (self-referential after nodes table exists)
ALTER TABLE agent_graphs
DROP CONSTRAINT IF EXISTS agent_graphs_entry_node_id_fkey,
ADD CONSTRAINT agent_graphs_entry_node_id_fkey 
FOREIGN KEY (entry_node_id) REFERENCES agent_graph_nodes(id) ON DELETE SET NULL;

DO $$
BEGIN
    RAISE NOTICE '✓ Added entry_node_id foreign key constraint';
END $$;

-- ==========================================
-- SECTION 7: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- SECTION 7: Creating Indexes ---';
END $$;

-- Agent graphs indexes
CREATE INDEX IF NOT EXISTS idx_agent_graphs_tenant ON agent_graphs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_graphs_type ON agent_graphs(graph_type);
CREATE INDEX IF NOT EXISTS idx_agent_graphs_active ON agent_graphs(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_graphs_slug ON agent_graphs(slug);

-- Agent graph nodes indexes
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_graph ON agent_graph_nodes(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_agent ON agent_graph_nodes(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_component ON agent_graph_nodes(component_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_tool ON agent_graph_nodes(tool_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_type ON agent_graph_nodes(node_type);

-- Agent graph edges indexes
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_graph ON agent_graph_edges(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_source ON agent_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_target ON agent_graph_edges(target_node_id);

-- Agent hierarchies indexes
CREATE INDEX IF NOT EXISTS idx_agent_hierarchies_parent ON agent_hierarchies(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_hierarchies_child ON agent_hierarchies(child_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_hierarchies_type ON agent_hierarchies(relationship_type);

-- Agent graph assignments indexes
CREATE INDEX IF NOT EXISTS idx_agent_graph_assignments_agent ON agent_graph_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_assignments_graph ON agent_graph_assignments(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_assignments_primary ON agent_graph_assignments(is_primary_graph);
CREATE INDEX IF NOT EXISTS idx_agent_graph_assignments_active ON agent_graph_assignments(is_active);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
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
    graph_count INTEGER;
    node_count INTEGER;
    edge_count INTEGER;
    hierarchy_count INTEGER;
    assignment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO graph_count FROM agent_graphs;
    SELECT COUNT(*) INTO node_count FROM agent_graph_nodes;
    SELECT COUNT(*) INTO edge_count FROM agent_graph_edges;
    SELECT COUNT(*) INTO hierarchy_count FROM agent_hierarchies;
    SELECT COUNT(*) INTO assignment_count FROM agent_graph_assignments;
    
    RAISE NOTICE '=== POST-MIGRATION STATE ===';
    RAISE NOTICE 'Agent graphs: %', graph_count;
    RAISE NOTICE 'Graph nodes: %', node_count;
    RAISE NOTICE 'Graph edges: %', edge_count;
    RAISE NOTICE 'Agent hierarchies: %', hierarchy_count;
    RAISE NOTICE 'Agent-graph assignments: %', assignment_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 3 COMPLETE: AGENT GRAPH MODEL';
    RAISE NOTICE '=================================================================';
END $$;

-- Final summary query
SELECT 
    'Agent Graphs' as entity, 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM agent_graphs
UNION ALL
SELECT 
    'Graph Nodes', 
    COUNT(*),
    COUNT(DISTINCT graph_id)
FROM agent_graph_nodes
UNION ALL
SELECT 
    'Graph Edges', 
    COUNT(*),
    COUNT(DISTINCT graph_id)
FROM agent_graph_edges
UNION ALL
SELECT 
    'Agent Hierarchies', 
    COUNT(*),
    COUNT(DISTINCT parent_agent_id)
FROM agent_hierarchies
UNION ALL
SELECT 
    'Agent-Graph Assignments', 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_primary_graph = true)
FROM agent_graph_assignments;

