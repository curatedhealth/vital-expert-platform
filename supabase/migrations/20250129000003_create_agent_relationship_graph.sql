/**
 * Agent Relationship Graph Migration
 * 
 * Creates tables for agent relationships and knowledge graph nodes
 * to enable multi-hop reasoning, collaboration discovery, and team building.
 * 
 * Part of Phase 2: Enhanced GraphRAG & Relationships
 * 
 * @module supabase/migrations
 * @date 2025-01-29
 */

BEGIN;

-- ============================================================================
-- AGENT RELATIONSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship endpoints
  source_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Relationship type (collaborates, supervises, delegates, consults, reports_to)
  relationship_type VARCHAR(50) NOT NULL CHECK (
    relationship_type IN (
      'collaborates',
      'supervises',
      'delegates',
      'consults',
      'reports_to'
    )
  ),
  
  -- Relationship strength (0.0 to 1.0)
  weight FLOAT DEFAULT 1.0 CHECK (weight >= 0.0 AND weight <= 1.0),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT no_self_relationship CHECK (source_agent_id != target_agent_id),
  CONSTRAINT unique_relationship UNIQUE(source_agent_id, target_agent_id, relationship_type)
);

-- ============================================================================
-- AGENT KNOWLEDGE GRAPH TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_knowledge_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent reference
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Entity information
  entity_type VARCHAR(100) NOT NULL CHECK (
    entity_type IN ('skill', 'domain', 'tool', 'knowledge_area')
  ),
  entity_name VARCHAR(255) NOT NULL,
  
  -- Confidence score (0.0 to 1.0)
  confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  
  -- Optional embedding for semantic search
  embedding vector(1536),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_agent_entity UNIQUE(agent_id, entity_type, entity_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agent relationships indexes
CREATE INDEX IF NOT EXISTS idx_agent_relationships_source 
  ON agent_relationships(source_agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_relationships_target 
  ON agent_relationships(target_agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_relationships_type 
  ON agent_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_agent_relationships_weight 
  ON agent_relationships(weight DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_agent_relationships_source_type 
  ON agent_relationships(source_agent_id, relationship_type);

-- Agent knowledge graph indexes
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_agent 
  ON agent_knowledge_graph(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_entity_type 
  ON agent_knowledge_graph(entity_type);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_entity_name 
  ON agent_knowledge_graph(entity_name);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_confidence 
  ON agent_knowledge_graph(confidence DESC);

-- Vector similarity index (if pgvector extension available)
-- This requires pgvector extension - will fail gracefully if not available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_embedding 
      ON agent_knowledge_graph 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Extension not available, skip vector index
    NULL;
END $$;

-- Composite index for entity lookups
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_entity_lookup 
  ON agent_knowledge_graph(entity_type, entity_name);

-- GIN index for JSONB metadata
CREATE INDEX IF NOT EXISTS idx_agent_relationships_metadata 
  ON agent_relationships USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_graph_metadata 
  ON agent_knowledge_graph USING GIN (metadata);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE agent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_graph ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read relationships for agents they can access
CREATE POLICY "Users can read agent relationships"
  ON agent_relationships FOR SELECT
  USING (
    -- Source or target agent must be accessible (via RLS on agents table)
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_relationships.source_agent_id
    )
    OR EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_relationships.target_agent_id
    )
  );

-- RLS Policy: Users can create relationships for agents they own or manage
CREATE POLICY "Users can create agent relationships"
  ON agent_relationships FOR INSERT
  WITH CHECK (
    -- User must own or be admin of source agent
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_relationships.source_agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- RLS Policy: Users can update relationships they created (or are admin)
CREATE POLICY "Users can update agent relationships"
  ON agent_relationships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_relationships.source_agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- RLS Policy: Users can delete relationships they created (or are admin)
CREATE POLICY "Users can delete agent relationships"
  ON agent_relationships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_relationships.source_agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- RLS Policy: Users can read knowledge nodes for agents they can access
CREATE POLICY "Users can read agent knowledge graph"
  ON agent_knowledge_graph FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_knowledge_graph.agent_id
    )
  );

-- RLS Policy: Users can create knowledge nodes for agents they own or manage
CREATE POLICY "Users can create agent knowledge graph nodes"
  ON agent_knowledge_graph FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_knowledge_graph.agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- RLS Policy: Users can update knowledge nodes they created (or are admin)
CREATE POLICY "Users can update agent knowledge graph nodes"
  ON agent_knowledge_graph FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_knowledge_graph.agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- RLS Policy: Users can delete knowledge nodes they created (or are admin)
CREATE POLICY "Users can delete agent knowledge graph nodes"
  ON agent_knowledge_graph FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_knowledge_graph.agent_id
      AND (
        agents.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role IN ('super_admin', 'admin')
        )
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_relationship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_agent_knowledge_graph_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER agent_relationship_updated_at
  BEFORE UPDATE ON agent_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_relationship_updated_at();

CREATE TRIGGER agent_knowledge_graph_updated_at
  BEFORE UPDATE ON agent_knowledge_graph
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_knowledge_graph_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE agent_relationships IS
  'Represents relationships between agents (collaboration, supervision, delegation) for graph traversal';

COMMENT ON TABLE agent_knowledge_graph IS
  'Represents knowledge entities (skills, domains, tools) associated with agents for expertise discovery';

COMMENT ON COLUMN agent_relationships.weight IS
  'Relationship strength (0.0 = weak, 1.0 = strong). Used for ranking in graph traversal.';

COMMENT ON COLUMN agent_knowledge_graph.confidence IS
  'Confidence in agent expertise for this entity (0.0 = uncertain, 1.0 = highly confident).';

COMMIT;

