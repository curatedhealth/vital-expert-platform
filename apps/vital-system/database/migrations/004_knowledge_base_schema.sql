-- ============================================================================
-- KNOWLEDGE BASE SCHEMA MIGRATION
-- ============================================================================
-- Description: RAG knowledge base tables and functions for production
-- Version: 1.0.0
-- Date: 2025-01-27
-- ============================================================================

-- ============================================================================
-- KNOWLEDGE BASE TABLES
-- ============================================================================

-- Knowledge sources (documents, PDFs, etc.)
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  source_type VARCHAR(50) NOT NULL DEFAULT 'document', -- document, pdf, url, text
  source_url TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  domain VARCHAR(100) NOT NULL, -- healthcare, regulatory, clinical, etc.
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Knowledge chunks (processed content from sources) - Pinecone integration
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for deduplication
  pinecone_id VARCHAR(255) UNIQUE, -- Pinecone vector ID
  metadata JSONB DEFAULT '{}',
  domain VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent knowledge access tracking
CREATE TABLE IF NOT EXISTS agent_knowledge_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  knowledge_chunk_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  relevance_score NUMERIC(3,2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, knowledge_chunk_id)
);

-- Knowledge base search analytics
CREATE TABLE IF NOT EXISTS knowledge_search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  search_strategy VARCHAR(50) NOT NULL, -- vector, hybrid, keyword, agent_optimized
  results_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  domain_filter VARCHAR(100),
  similarity_threshold NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Knowledge sources indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tenant ON knowledge_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_domain ON knowledge_sources(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_active ON knowledge_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_metadata ON knowledge_sources USING GIN(metadata);

-- Knowledge base indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON knowledge_base(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant ON knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_domain ON knowledge_base(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_hash ON knowledge_base(content_hash);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_chunk_index ON knowledge_base(source_id, chunk_index);

-- Pinecone ID index for fast lookups
CREATE INDEX IF NOT EXISTS idx_knowledge_base_pinecone_id ON knowledge_base(pinecone_id);

-- Agent knowledge access indexes
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_agent ON agent_knowledge_access(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_chunk ON agent_knowledge_access(knowledge_chunk_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_tenant ON agent_knowledge_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_score ON agent_knowledge_access(relevance_score DESC);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_search_analytics_tenant ON knowledge_search_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_analytics_agent ON knowledge_search_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_analytics_created ON knowledge_search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_analytics_strategy ON knowledge_search_analytics(search_strategy);

-- ============================================================================
-- PINECONE INTEGRATION FUNCTIONS
-- ============================================================================

-- Get knowledge chunks by Pinecone IDs (after Pinecone search)
CREATE OR REPLACE FUNCTION get_knowledge_chunks_by_pinecone_ids(
  pinecone_ids TEXT[],
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  source_title VARCHAR(500),
  domain VARCHAR(100),
  chunk_index INTEGER,
  pinecone_id VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    ks.title AS source_title,
    kb.domain,
    kb.chunk_index,
    kb.pinecone_id
  FROM knowledge_base kb
  JOIN knowledge_sources ks ON kb.source_id = ks.id
  WHERE
    kb.is_active = true
    AND ks.is_active = true
    AND kb.pinecone_id = ANY(pinecone_ids)
    AND (filter_tenant_id IS NULL OR kb.tenant_id = filter_tenant_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get knowledge chunks for agent by Pinecone IDs with relevance boosting
CREATE OR REPLACE FUNCTION get_agent_knowledge_chunks(
  agent_id_param UUID,
  pinecone_ids TEXT[],
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  source_id UUID,
  content TEXT,
  source_title VARCHAR(500),
  domain VARCHAR(100),
  relevance_boost NUMERIC,
  metadata JSONB,
  pinecone_id VARCHAR(255)
) AS $$
DECLARE
  agent_domains TEXT[];
  agent_capabilities TEXT[];
BEGIN
  -- Get agent's knowledge domains and capabilities
  SELECT 
    a.knowledge_domains,
    a.capabilities
  INTO 
    agent_domains,
    agent_capabilities
  FROM agents a
  WHERE a.id = agent_id_param;

  -- If agent not found, return empty
  IF agent_domains IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    kb.id AS chunk_id,
    kb.source_id,
    kb.content,
    ks.title AS source_title,
    kb.domain,
    -- Boost relevance based on agent's domains and capabilities
    CASE 
      WHEN kb.domain = ANY(agent_domains) THEN 1.0
      WHEN EXISTS (
        SELECT 1 FROM unnest(agent_capabilities) AS cap 
        WHERE cap = ANY(kb.tags)
      ) THEN 0.9
      ELSE 0.8
    END AS relevance_boost,
    kb.metadata,
    kb.pinecone_id
  FROM knowledge_base kb
  JOIN knowledge_sources ks ON kb.source_id = ks.id
  WHERE
    kb.is_active = true
    AND ks.is_active = true
    AND kb.pinecone_id = ANY(pinecone_ids)
    AND (filter_tenant_id IS NULL OR kb.tenant_id = filter_tenant_id)
  ORDER BY 
    -- Order by relevance boost first
    CASE 
      WHEN kb.domain = ANY(agent_domains) THEN 1.0
      WHEN EXISTS (
        SELECT 1 FROM unnest(agent_capabilities) AS cap 
        WHERE cap = ANY(kb.tags)
      ) THEN 0.9
      ELSE 0.8
    END DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_knowledge_sources_updated_at
  BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_search_analytics ENABLE ROW LEVEL SECURITY;

-- Knowledge sources policies
CREATE POLICY "Users can view knowledge sources in their tenant" ON knowledge_sources
  FOR SELECT USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert knowledge sources in their tenant" ON knowledge_sources
  FOR INSERT WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update knowledge sources in their tenant" ON knowledge_sources
  FOR UPDATE USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can delete knowledge sources in their tenant" ON knowledge_sources
  FOR DELETE USING (tenant_id = auth.user_tenant_id());

-- Knowledge base policies
CREATE POLICY "Users can view knowledge base in their tenant" ON knowledge_base
  FOR SELECT USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert knowledge base in their tenant" ON knowledge_base
  FOR INSERT WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update knowledge base in their tenant" ON knowledge_base
  FOR UPDATE USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can delete knowledge base in their tenant" ON knowledge_base
  FOR DELETE USING (tenant_id = auth.user_tenant_id());

-- Agent knowledge access policies
CREATE POLICY "Users can view agent knowledge access in their tenant" ON agent_knowledge_access
  FOR SELECT USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert agent knowledge access in their tenant" ON agent_knowledge_access
  FOR INSERT WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update agent knowledge access in their tenant" ON agent_knowledge_access
  FOR UPDATE USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can delete agent knowledge access in their tenant" ON agent_knowledge_access
  FOR DELETE USING (tenant_id = auth.user_tenant_id());

-- Search analytics policies
CREATE POLICY "Users can view search analytics in their tenant" ON knowledge_search_analytics
  FOR SELECT USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert search analytics in their tenant" ON knowledge_search_analytics
  FOR INSERT WITH CHECK (tenant_id = auth.user_tenant_id());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE knowledge_sources IS 'Source documents and files for RAG knowledge base';
COMMENT ON TABLE knowledge_base IS 'Processed knowledge chunks with embeddings for vector search';
COMMENT ON TABLE agent_knowledge_access IS 'Tracks which knowledge chunks agents have accessed';
COMMENT ON TABLE knowledge_search_analytics IS 'Analytics for knowledge base searches';

COMMENT ON FUNCTION match_documents IS 'Basic vector similarity search for knowledge chunks';
COMMENT ON FUNCTION search_knowledge_for_agent IS 'Agent-optimized search with relevance boosting';
COMMENT ON FUNCTION search_knowledge_base IS 'General knowledge base search with filtering';
COMMENT ON FUNCTION hybrid_search IS 'Combines vector similarity and keyword search';
