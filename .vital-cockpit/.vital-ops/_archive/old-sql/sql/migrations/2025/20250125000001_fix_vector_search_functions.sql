-- Migration: Fix Vector Search Functions (Resolve Naming Conflicts)
-- Date: 2025-01-25
-- Description: Properly drops existing functions with correct signatures before recreating

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- CLEAN UP: Drop all existing variations of these functions
-- ============================================================================

-- Drop search_knowledge_by_embedding with all possible signatures
DROP FUNCTION IF EXISTS search_knowledge_by_embedding(vector(1536), text, text, int, float) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_by_embedding(vector(1536), text, int, float) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_by_embedding(vector(1536), int) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_by_embedding CASCADE;

-- Drop search_knowledge_for_agent with all possible signatures
DROP FUNCTION IF EXISTS search_knowledge_for_agent(uuid, text, vector(1536), int) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_for_agent(uuid, vector(1536), int) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_for_agent CASCADE;

-- Drop search_knowledge_base with all possible signatures
DROP FUNCTION IF EXISTS search_knowledge_base(vector(1536), float, int, jsonb) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_base(vector(1536), int) CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_base CASCADE;

-- Drop match_user_memory_with_filters
DROP FUNCTION IF EXISTS match_user_memory_with_filters(vector(1536), uuid, text, float, int) CASCADE;
DROP FUNCTION IF EXISTS match_user_memory_with_filters CASCADE;

-- Drop hybrid_search with all possible signatures
DROP FUNCTION IF EXISTS hybrid_search(vector(1536), text, text, int, float, float) CASCADE;
DROP FUNCTION IF EXISTS hybrid_search(vector(1536), text) CASCADE;
DROP FUNCTION IF EXISTS hybrid_search CASCADE;

-- Drop get_similar_documents
DROP FUNCTION IF EXISTS get_similar_documents(uuid, int, float) CASCADE;
DROP FUNCTION IF EXISTS get_similar_documents CASCADE;

-- Drop update_knowledge_statistics
DROP FUNCTION IF EXISTS update_knowledge_statistics() CASCADE;

-- ============================================================================
-- 1. SEARCH_KNOWLEDGE_BY_EMBEDDING
-- General knowledge base search using embeddings
-- ============================================================================

CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(1536),
  domain_filter text DEFAULT NULL,
  embedding_model text DEFAULT 'openai',
  max_results int DEFAULT 10,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  chunk_id uuid,
  source_id uuid,
  content text,
  similarity float,
  source_title text,
  domain text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id as chunk_id,
    dc.document_id as source_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    kd.title as source_title,
    kd.domain,
    dc.metadata
  FROM document_chunks dc
  JOIN knowledge_documents kd ON dc.document_id = kd.id
  WHERE
    -- Apply similarity threshold
    1 - (dc.embedding <=> query_embedding) > similarity_threshold
    -- Apply domain filter if provided
    AND (domain_filter IS NULL OR kd.domain = domain_filter)
    -- Only active documents
    AND kd.status = 'completed'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT max_results;
END;
$$;

GRANT EXECUTE ON FUNCTION search_knowledge_by_embedding TO authenticated, anon;
COMMENT ON FUNCTION search_knowledge_by_embedding IS 'Performs vector similarity search on knowledge base with optional domain filtering';

-- ============================================================================
-- 2. SEARCH_KNOWLEDGE_FOR_AGENT
-- Agent-optimized search with relevance boosting
-- ============================================================================

CREATE OR REPLACE FUNCTION search_knowledge_for_agent(
  agent_id_param uuid,
  query_text_param text,
  query_embedding_param vector(1536),
  max_results int DEFAULT 10
)
RETURNS TABLE (
  chunk_id uuid,
  source_id uuid,
  content text,
  similarity float,
  relevance_boost float,
  source_title text,
  domain text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
  agent_domain text;
  agent_capabilities text[];
BEGIN
  -- Get agent's primary domain and capabilities
  SELECT
    COALESCE(a.metadata->>'primary_domain', 'general'),
    ARRAY(SELECT jsonb_array_elements_text(a.capabilities))
  INTO agent_domain, agent_capabilities
  FROM agents a
  WHERE a.id = agent_id_param;

  RETURN QUERY
  SELECT
    dc.id as chunk_id,
    dc.document_id as source_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding_param) as similarity,
    (1 - (dc.embedding <=> query_embedding_param)) *
    CASE
      WHEN kd.domain = agent_domain THEN 1.3
      WHEN kd.domain = ANY(agent_capabilities) THEN 1.15
      ELSE 1.0
    END as relevance_boost,
    kd.title as source_title,
    kd.domain,
    dc.metadata
  FROM document_chunks dc
  JOIN knowledge_documents kd ON dc.document_id = kd.id
  WHERE
    1 - (dc.embedding <=> query_embedding_param) > 0.6
    AND kd.status = 'completed'
  ORDER BY relevance_boost DESC
  LIMIT max_results;
END;
$$;

GRANT EXECUTE ON FUNCTION search_knowledge_for_agent TO authenticated, anon;
COMMENT ON FUNCTION search_knowledge_for_agent IS 'Agent-optimized vector search with domain relevance boosting';

-- ============================================================================
-- 3. SEARCH_KNOWLEDGE_BASE
-- Flexible search with filters
-- ============================================================================

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_id uuid,
  document_title text,
  domain text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity,
    kd.id as document_id,
    kd.title as document_title,
    kd.domain
  FROM document_chunks dc
  JOIN knowledge_documents kd ON dc.document_id = kd.id
  WHERE
    1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (NOT (filters ? 'domain') OR kd.domain = (filters->>'domain'))
    AND (NOT (filters ? 'phase') OR kd.metadata->>'phase' = (filters->>'phase'))
    AND (NOT (filters ? 'tags') OR kd.tags && ARRAY(SELECT jsonb_array_elements_text(filters->'tags')))
    AND kd.status = 'completed'
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION search_knowledge_base TO authenticated, anon;
COMMENT ON FUNCTION search_knowledge_base IS 'Flexible vector search with multiple filter options';

-- ============================================================================
-- 4. HYBRID_SEARCH
-- Combined vector + full-text search
-- ============================================================================

CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1536),
  query_text text,
  domain_filter text DEFAULT NULL,
  max_results int DEFAULT 10,
  semantic_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3
)
RETURNS TABLE (
  chunk_id uuid,
  source_id uuid,
  content text,
  semantic_score float,
  keyword_score float,
  combined_score float,
  source_title text,
  domain text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT
      dc.id,
      dc.document_id,
      dc.content,
      dc.metadata,
      kd.title,
      kd.domain,
      1 - (dc.embedding <=> query_embedding) as score
    FROM document_chunks dc
    JOIN knowledge_documents kd ON dc.document_id = kd.id
    WHERE
      kd.status = 'completed'
      AND (domain_filter IS NULL OR kd.domain = domain_filter)
  ),
  keyword_search AS (
    SELECT
      dc.id,
      ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)) as score
    FROM document_chunks dc
    JOIN knowledge_documents kd ON dc.document_id = kd.id
    WHERE
      to_tsvector('english', dc.content) @@ plainto_tsquery('english', query_text)
      AND kd.status = 'completed'
      AND (domain_filter IS NULL OR kd.domain = domain_filter)
  )
  SELECT
    ss.id as chunk_id,
    ss.document_id as source_id,
    ss.content,
    ss.score as semantic_score,
    COALESCE(ks.score, 0.0) as keyword_score,
    (ss.score * semantic_weight + COALESCE(ks.score, 0.0) * keyword_weight) as combined_score,
    ss.title as source_title,
    ss.domain,
    ss.metadata
  FROM semantic_search ss
  LEFT JOIN keyword_search ks ON ss.id = ks.id
  WHERE ss.score > 0.5
  ORDER BY combined_score DESC
  LIMIT max_results;
END;
$$;

GRANT EXECUTE ON FUNCTION hybrid_search TO authenticated, anon;
COMMENT ON FUNCTION hybrid_search IS 'Hybrid search combining vector and full-text with configurable weights';

-- ============================================================================
-- 5. GET_SIMILAR_DOCUMENTS
-- Document-level similarity
-- ============================================================================

CREATE OR REPLACE FUNCTION get_similar_documents(
  document_id_param uuid,
  max_results int DEFAULT 5,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id uuid,
  title text,
  domain text,
  similarity float,
  tags text[],
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  doc_embedding vector(1536);
BEGIN
  SELECT AVG(embedding)::vector(1536)
  INTO doc_embedding
  FROM document_chunks
  WHERE document_id = document_id_param;

  IF doc_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    kd.id,
    kd.title,
    kd.domain,
    1 - (AVG(dc.embedding) <=> doc_embedding) as similarity,
    kd.tags,
    kd.created_at
  FROM knowledge_documents kd
  JOIN document_chunks dc ON dc.document_id = kd.id
  WHERE
    kd.id != document_id_param
    AND kd.status = 'completed'
  GROUP BY kd.id, kd.title, kd.domain, kd.tags, kd.created_at
  HAVING 1 - (AVG(dc.embedding) <=> doc_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$;

GRANT EXECUTE ON FUNCTION get_similar_documents TO authenticated, anon;
COMMENT ON FUNCTION get_similar_documents IS 'Find similar documents based on embedding similarity';

-- ============================================================================
-- 6. UPDATE STATISTICS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_knowledge_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE knowledge_documents
    SET chunk_count = (
      SELECT COUNT(*)
      FROM document_chunks
      WHERE document_id = COALESCE(NEW.document_id, OLD.document_id)
    )
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chunk_count_trigger ON document_chunks;
CREATE TRIGGER update_chunk_count_trigger
AFTER INSERT OR DELETE ON document_chunks
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_statistics();

-- ============================================================================
-- 7. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts
ON document_chunks USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status_domain
ON knowledge_documents(status, domain) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags
ON knowledge_documents USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_created
ON document_chunks(document_id, created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Vector Search Functions Migration Complete';
  RAISE NOTICE '';
  RAISE NOTICE 'Created Functions:';
  RAISE NOTICE '  ✓ search_knowledge_by_embedding(vector, text, text, int, float)';
  RAISE NOTICE '  ✓ search_knowledge_for_agent(uuid, text, vector, int)';
  RAISE NOTICE '  ✓ search_knowledge_base(vector, float, int, jsonb)';
  RAISE NOTICE '  ✓ hybrid_search(vector, text, text, int, float, float)';
  RAISE NOTICE '  ✓ get_similar_documents(uuid, int, float)';
  RAISE NOTICE '  ✓ update_knowledge_statistics()';
  RAISE NOTICE '';
  RAISE NOTICE 'Created Indexes:';
  RAISE NOTICE '  ✓ idx_document_chunks_content_fts (GIN full-text)';
  RAISE NOTICE '  ✓ idx_knowledge_documents_status_domain';
  RAISE NOTICE '  ✓ idx_knowledge_documents_tags (GIN)';
  RAISE NOTICE '  ✓ idx_document_chunks_document_created';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to use! Test with:';
  RAISE NOTICE '   SELECT * FROM search_knowledge_by_embedding(...)';
END $$;
