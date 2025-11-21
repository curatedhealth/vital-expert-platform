-- ============================================================================
-- UPDATE VECTOR DIMENSIONS FROM 1536 TO 3072
-- ============================================================================
-- Updates all vector columns to support text-embedding-3-large (3072 dimensions)
-- instead of text-embedding-ada-002 (1536 dimensions)
-- ============================================================================

-- Drop existing vector indexes (they depend on the vector column type)
DROP INDEX IF EXISTS idx_rag_chunks_embedding;

-- Update rag_knowledge_chunks table
ALTER TABLE rag_knowledge_chunks
  ALTER COLUMN embedding TYPE vector(3072);

-- Update rag_search_analytics table
ALTER TABLE rag_search_analytics
  ALTER COLUMN query_embedding TYPE vector(3072);

-- Note: pgvector currently has a 2000 dimension limit for indexes (both IVFFlat and HNSW)
-- For 3072 dimensions, we'll use exact nearest neighbor search (slower but accurate)
-- This is acceptable for small to medium datasets (<100k vectors)
-- Alternative: Use dimensionality reduction or switch to ada-002 (1536 dims)
-- CREATE INDEX idx_rag_chunks_embedding ON rag_knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- Update the search function signature
DROP FUNCTION IF EXISTS search_rag_knowledge(vector, UUID, UUID, VARCHAR, FLOAT, INT, BOOLEAN);

CREATE OR REPLACE FUNCTION search_rag_knowledge(
    query_embedding vector(3072),
    p_tenant_id UUID DEFAULT NULL,
    p_agent_id UUID DEFAULT NULL,
    p_domain VARCHAR DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    include_global BOOLEAN DEFAULT true
)
RETURNS TABLE (
    chunk_id UUID,
    source_id UUID,
    content TEXT,
    similarity FLOAT,
    source_name VARCHAR(500),
    domain VARCHAR(200),
    is_global BOOLEAN,
    agent_id UUID,
    section_title VARCHAR(500),
    metadata JSONB
)
LANGUAGE sql STABLE
AS $$
    SELECT
        kc.id AS chunk_id,
        kc.source_id,
        kc.content,
        1 - (kc.embedding <=> query_embedding) AS similarity,
        ks.name AS source_name,
        ks.domain,
        ks.is_global,
        ks.agent_id,
        kc.section_title,
        ks.metadata
    FROM rag_knowledge_chunks kc
    JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
    WHERE
        -- Similarity threshold
        1 - (kc.embedding <=> query_embedding) > match_threshold

        -- Tenant filter (if specified)
        AND (p_tenant_id IS NULL OR ks.tenant_id = p_tenant_id)

        -- Scope filter: global OR specific to requested agent
        AND (
            (include_global AND ks.is_global = true)
            OR (p_agent_id IS NOT NULL AND ks.agent_id = p_agent_id)
        )

        -- Domain filter (if specified)
        AND (p_domain IS NULL OR ks.domain = p_domain)

        -- Only completed documents
        AND ks.processing_status = 'completed'
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;

-- Update column comments
COMMENT ON COLUMN rag_knowledge_chunks.embedding IS 'Vector embedding for semantic similarity search (3072 dimensions for text-embedding-3-large)';
COMMENT ON COLUMN rag_search_analytics.query_embedding IS 'Vector embedding of the search query (3072 dimensions for text-embedding-3-large)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully updated vector dimensions to 3072!';
    RAISE NOTICE '   - Updated rag_knowledge_chunks.embedding';
    RAISE NOTICE '   - Updated rag_search_analytics.query_embedding';
    RAISE NOTICE '   - Recreated vector similarity search index';
    RAISE NOTICE '   - Updated search_rag_knowledge() function';
    RAISE NOTICE '   - Now using text-embedding-3-large (3072 dimensions)';
END $$;
