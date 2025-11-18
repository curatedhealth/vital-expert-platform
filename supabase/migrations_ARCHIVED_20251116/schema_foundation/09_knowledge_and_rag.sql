-- =============================================================================
-- PHASE 09: Knowledge Management & RAG System
-- =============================================================================
-- PURPOSE: Create knowledge sources, RAG chunks, and domain hierarchies
-- TABLES: 5 tables (knowledge_sources, knowledge_chunks, knowledge_domains, knowledge_domain_mapping, domain_hierarchies)
-- TIME: ~20 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: knowledge_domains (hierarchical knowledge taxonomy)
-- =============================================================================
CREATE TABLE knowledge_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  domain_path LTREE, -- e.g., 'clinical.oncology.breast_cancer'
  depth_level INTEGER DEFAULT 0,

  -- Classification
  domain_type TEXT, -- 'industry', 'function', 'therapeutic_area', 'technology', 'methodology'

  -- Metadata
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for knowledge_domains
CREATE INDEX idx_knowledge_domains_tenant ON knowledge_domains(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_parent ON knowledge_domains(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_path_gist ON knowledge_domains USING GIST(domain_path) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_slug ON knowledge_domains(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_type ON knowledge_domains(domain_type) WHERE deleted_at IS NULL;

COMMENT ON TABLE knowledge_domains IS 'Hierarchical knowledge domain taxonomy for organizing knowledge sources';

-- =============================================================================
-- TABLE 2: knowledge_sources (documents, articles, internal docs)
-- =============================================================================
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content
  content TEXT, -- Full text content
  content_type TEXT, -- 'pdf', 'markdown', 'html', 'docx', 'url', 'api'
  source_url TEXT,
  file_path TEXT, -- Path in storage

  -- Classification
  data_classification data_classification DEFAULT 'internal',
  source_type TEXT, -- 'internal', 'public', 'licensed', 'proprietary'

  -- Metadata
  author TEXT,
  published_date DATE,
  language TEXT DEFAULT 'en',
  word_count INTEGER,
  page_count INTEGER,

  -- Processing Status
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  embedding_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  chunk_count INTEGER DEFAULT 0,

  -- Quality Metrics
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  usage_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  validation_status validation_status DEFAULT 'draft',

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for knowledge_sources
CREATE INDEX idx_knowledge_sources_tenant ON knowledge_sources(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_slug ON knowledge_sources(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_type ON knowledge_sources(content_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_classification ON knowledge_sources(data_classification) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(processing_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_quality ON knowledge_sources(quality_score DESC NULLS LAST);

-- Full-text search
CREATE INDEX idx_knowledge_sources_search ON knowledge_sources USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))) WHERE deleted_at IS NULL;

COMMENT ON TABLE knowledge_sources IS 'Source documents and content for RAG system';

-- =============================================================================
-- TABLE 3: knowledge_chunks (RAG embeddings)
-- =============================================================================
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Position in source
  start_position INTEGER, -- Character position in original
  end_position INTEGER,

  -- Embedding (pgvector)
  embedding vector(1536), -- OpenAI ada-002 dimension

  -- Context
  heading TEXT, -- Section heading if applicable
  context_before TEXT, -- Surrounding context for better retrieval
  context_after TEXT,

  -- Metadata
  word_count INTEGER,
  token_count INTEGER,

  -- Quality
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(source_id, chunk_index)
);

-- Indexes for knowledge_chunks
CREATE INDEX idx_knowledge_chunks_source ON knowledge_chunks(source_id);
CREATE INDEX idx_knowledge_chunks_index ON knowledge_chunks(chunk_index);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE knowledge_chunks IS 'Text chunks with embeddings for semantic search (RAG)';
COMMENT ON COLUMN knowledge_chunks.embedding IS 'Vector embedding for semantic similarity search (dimension 1536)';

-- =============================================================================
-- JUNCTION TABLE 1: knowledge_domain_mapping
-- =============================================================================
CREATE TABLE knowledge_domain_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(source_id, domain_id)
);

-- Indexes
CREATE INDEX idx_knowledge_domain_map_source ON knowledge_domain_mapping(source_id);
CREATE INDEX idx_knowledge_domain_map_domain ON knowledge_domain_mapping(domain_id);
CREATE INDEX idx_knowledge_domain_map_score ON knowledge_domain_mapping(relevance_score DESC);

COMMENT ON TABLE knowledge_domain_mapping IS 'Maps knowledge sources to domains';

-- =============================================================================
-- JUNCTION TABLE 2: domain_hierarchies (alternative to ltree for complex relationships)
-- =============================================================================
CREATE TABLE domain_hierarchies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  child_domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,

  -- Relationship Type
  relationship_type TEXT DEFAULT 'parent_child', -- 'parent_child', 'related', 'prerequisite'
  depth INTEGER DEFAULT 1, -- Distance in hierarchy

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(parent_domain_id, child_domain_id, relationship_type),
  CHECK (parent_domain_id != child_domain_id)
);

-- Indexes
CREATE INDEX idx_domain_hier_parent ON domain_hierarchies(parent_domain_id);
CREATE INDEX idx_domain_hier_child ON domain_hierarchies(child_domain_id);
CREATE INDEX idx_domain_hier_type ON domain_hierarchies(relationship_type);

COMMENT ON TABLE domain_hierarchies IS 'Explicit domain hierarchy relationships for complex taxonomies';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to search knowledge by semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  p_query_embedding vector(1536),
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_min_similarity NUMERIC DEFAULT 0.7
)
RETURNS TABLE(
  chunk_id UUID,
  source_id UUID,
  source_title TEXT,
  content TEXT,
  similarity NUMERIC
)
LANGUAGE SQL STABLE AS $$
  SELECT
    kc.id as chunk_id,
    ks.id as source_id,
    ks.title as source_title,
    kc.content,
    1 - (kc.embedding <=> p_query_embedding) as similarity
  FROM knowledge_chunks kc
  JOIN knowledge_sources ks ON kc.source_id = ks.id
  WHERE ks.tenant_id = p_tenant_id
  AND ks.is_active = true
  AND ks.deleted_at IS NULL
  AND 1 - (kc.embedding <=> p_query_embedding) >= p_min_similarity
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT p_limit;
$$;

-- Function to get knowledge sources by domain
CREATE OR REPLACE FUNCTION get_knowledge_by_domain(p_domain_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  relevance_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT ks.id, ks.title, ks.description, kdm.relevance_score
  FROM knowledge_sources ks
  JOIN knowledge_domain_mapping kdm ON ks.id = kdm.source_id
  WHERE kdm.domain_id = p_domain_id
  AND ks.is_active = true
  AND ks.deleted_at IS NULL
  ORDER BY kdm.relevance_score DESC, ks.quality_score DESC NULLS LAST;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('knowledge_domains', 'knowledge_sources', 'knowledge_chunks', 'knowledge_domain_mapping', 'domain_hierarchies');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 09 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 2';
    RAISE NOTICE '';
    RAISE NOTICE 'RAG System Features:';
    RAISE NOTICE '  - Knowledge domain taxonomy with ltree';
    RAISE NOTICE '  - Document ingestion and chunking';
    RAISE NOTICE '  - Vector embeddings (pgvector, dimension 1536)';
    RAISE NOTICE '  - Semantic similarity search';
    RAISE NOTICE '  - Domain-based organization';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 10 (Skills & Tools)';
    RAISE NOTICE '';
END $$;
