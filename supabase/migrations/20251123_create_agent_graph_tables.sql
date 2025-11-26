-- ============================================================================
-- Migration: Create Agent Graph Orchestration Tables
-- Date: 2025-11-23
-- Purpose: Enable data-driven agent orchestration with LangGraph compilation
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Agent Graphs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  
  -- Graph configuration
  entry_point_node_id UUID,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_graph_name_tenant UNIQUE(name, tenant_id)
);

-- ============================================================================
-- 2. Agent Graph Nodes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Graph relationship
  graph_id UUID NOT NULL REFERENCES public.agent_graphs(id) ON DELETE CASCADE,
  
  -- Node metadata
  node_key TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN (
    'agent', 'skill', 'panel', 'router', 'tool', 'human', 'start', 'end'
  )),
  label TEXT,
  description TEXT,
  
  -- Node-specific references
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  panel_id UUID,
  tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
  
  -- Execution configuration
  config JSONB DEFAULT '{}'::jsonb,
  timeout_seconds INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 0,
  
  -- Position for UI
  position_x INTEGER,
  position_y INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_node_key_per_graph UNIQUE(graph_id, node_key)
);

-- Add FK from agent_graphs to agent_graph_nodes
ALTER TABLE public.agent_graphs 
  ADD CONSTRAINT fk_entry_point_node 
  FOREIGN KEY (entry_point_node_id) 
  REFERENCES public.agent_graph_nodes(id) 
  ON DELETE SET NULL;

-- ============================================================================
-- 3. Agent Graph Edges Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Graph relationship
  graph_id UUID NOT NULL REFERENCES public.agent_graphs(id) ON DELETE CASCADE,
  
  -- Edge connection
  source_node_id UUID NOT NULL REFERENCES public.agent_graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.agent_graph_nodes(id) ON DELETE CASCADE,
  
  -- Edge type
  edge_type TEXT NOT NULL CHECK (edge_type IN ('direct', 'conditional')),
  
  -- Conditional edge configuration
  condition_key TEXT,
  condition_value TEXT,
  condition_function TEXT,
  
  -- Edge metadata
  label TEXT,
  priority INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_edge UNIQUE(graph_id, source_node_id, target_node_id, condition_key, condition_value),
  CONSTRAINT no_self_loop CHECK (source_node_id != target_node_id)
);

-- ============================================================================
-- 4. Agent Hierarchies Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_hierarchies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hierarchy relationship
  parent_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  child_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- Hierarchy metadata
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'delegates_to', 'supervises', 'collaborates_with'
  )),
  delegation_conditions JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_hierarchy UNIQUE(parent_agent_id, child_agent_id, relationship_type),
  CONSTRAINT no_self_reference CHECK (parent_agent_id != child_agent_id)
);

-- ============================================================================
-- 5. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_graphs_tenant ON public.agent_graphs(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_graphs_active ON public.agent_graphs(is_active);

CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_graph ON public.agent_graph_nodes(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_type ON public.agent_graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_agent ON public.agent_graph_nodes(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_skill ON public.agent_graph_nodes(skill_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_nodes_tool ON public.agent_graph_nodes(tool_id);

CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_graph ON public.agent_graph_edges(graph_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_source ON public.agent_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_target ON public.agent_graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_agent_graph_edges_type ON public.agent_graph_edges(edge_type);

CREATE INDEX IF NOT EXISTS idx_agent_hierarchies_parent ON public.agent_hierarchies(parent_agent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_hierarchies_child ON public.agent_hierarchies(child_agent_id) WHERE is_active = true;

-- ============================================================================
-- 6. Comments
-- ============================================================================

COMMENT ON TABLE public.agent_graphs IS 'Agent orchestration graphs for LangGraph compilation';
COMMENT ON TABLE public.agent_graph_nodes IS 'Nodes in agent graphs (agent, skill, panel, router, tool, human)';
COMMENT ON TABLE public.agent_graph_edges IS 'Edges connecting nodes (direct or conditional)';
COMMENT ON TABLE public.agent_hierarchies IS 'Hierarchical relationships between agents';

COMMIT;

-- Verification
SELECT 'agent_graphs' AS table_name, COUNT(*) AS row_count FROM public.agent_graphs
UNION ALL
SELECT 'agent_graph_nodes', COUNT(*) FROM public.agent_graph_nodes
UNION ALL
SELECT 'agent_graph_edges', COUNT(*) FROM public.agent_graph_edges
UNION ALL
SELECT 'agent_hierarchies', COUNT(*) FROM public.agent_hierarchies;
