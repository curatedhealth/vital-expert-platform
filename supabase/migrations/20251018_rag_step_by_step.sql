-- ============================================================================
-- VITAL RAG System - Step by Step Migration
-- ============================================================================
-- Purpose: Handle Supabase 2000 dimension limit step by step
-- Created: 2025-10-18
-- ============================================================================

-- Step 1: Drop ALL existing vector indexes first
DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding;
DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding_1536;
DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding_ivfflat;
DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding_3072;

-- Step 2: Upgrade vector dimensions (this will work now)
ALTER TABLE rag_knowledge_chunks 
ALTER COLUMN embedding TYPE vector(3072);

ALTER TABLE rag_search_analytics 
ALTER COLUMN query_embedding TYPE vector(3072);

-- Step 3: Create the essential RPC function
CREATE OR REPLACE FUNCTION search_rag_knowledge(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_domain knowledge_domain DEFAULT NULL,
    filter_prism_suite prism_suite DEFAULT NULL,
    filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    source_id UUID,
    content TEXT,
    similarity float,
    source_name VARCHAR(500),
    domain knowledge_domain,
    prism_suite prism_suite,
    section_title VARCHAR(500),
    medical_context JSONB,
    regulatory_context JSONB,
    clinical_context JSONB
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
        ks.prism_suite,
        kc.section_title,
        kc.medical_context,
        kc.regulatory_context,
        kc.clinical_context
    FROM rag_knowledge_chunks kc
    JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
    WHERE
        1 - (kc.embedding <=> query_embedding) > match_threshold
        AND (filter_domain IS NULL OR ks.domain = filter_domain)
        AND (filter_prism_suite IS NULL OR ks.prism_suite = filter_prism_suite)
        AND (filter_tenant_id IS NULL OR ks.tenant_id = filter_tenant_id)
        AND ks.processing_status = 'completed'
        AND kc.embedding IS NOT NULL
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;

-- Step 4: Create hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search_rag_knowledge(
    query_embedding vector(3072),
    query_text TEXT,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    vector_weight float DEFAULT 0.6,
    text_weight float DEFAULT 0.4,
    filter_domain knowledge_domain DEFAULT NULL,
    filter_prism_suite prism_suite DEFAULT NULL,
    filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    source_id UUID,
    content TEXT,
    similarity float,
    source_name VARCHAR(500),
    domain knowledge_domain,
    prism_suite prism_suite,
    section_title VARCHAR(500),
    medical_context JSONB,
    regulatory_context JSONB,
    clinical_context JSONB
)
LANGUAGE sql STABLE
AS $$
    WITH vector_results AS (
        SELECT
            kc.id AS chunk_id,
            kc.source_id,
            kc.content,
            1 - (kc.embedding <=> query_embedding) AS vector_similarity,
            ks.name AS source_name,
            ks.domain,
            ks.prism_suite,
            kc.section_title,
            kc.medical_context,
            kc.regulatory_context,
            kc.clinical_context
        FROM rag_knowledge_chunks kc
        JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
        WHERE
            (filter_domain IS NULL OR ks.domain = filter_domain)
            AND (filter_prism_suite IS NULL OR ks.prism_suite = filter_prism_suite)
            AND (filter_tenant_id IS NULL OR ks.tenant_id = filter_tenant_id)
            AND ks.processing_status = 'completed'
            AND kc.embedding IS NOT NULL
    ),
    text_results AS (
        SELECT
            kc.id AS chunk_id,
            kc.source_id,
            kc.content,
            ts_rank(to_tsvector('english', kc.content), plainto_tsquery('english', query_text)) AS text_similarity,
            ks.name AS source_name,
            ks.domain,
            ks.prism_suite,
            kc.section_title,
            kc.medical_context,
            kc.regulatory_context,
            kc.clinical_context
        FROM rag_knowledge_chunks kc
        JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
        WHERE
            to_tsvector('english', kc.content) @@ plainto_tsquery('english', query_text)
            AND (filter_domain IS NULL OR ks.domain = filter_domain)
            AND (filter_prism_suite IS NULL OR ks.prism_suite = filter_prism_suite)
            AND (filter_tenant_id IS NULL OR ks.tenant_id = filter_tenant_id)
            AND ks.processing_status = 'completed'
    ),
    combined_results AS (
        SELECT
            COALESCE(v.chunk_id, t.chunk_id) AS chunk_id,
            COALESCE(v.source_id, t.source_id) AS source_id,
            COALESCE(v.content, t.content) AS content,
            COALESCE(v.vector_similarity, 0) * vector_weight + 
            COALESCE(t.text_similarity, 0) * text_weight AS similarity,
            COALESCE(v.source_name, t.source_name) AS source_name,
            COALESCE(v.domain, t.domain) AS domain,
            COALESCE(v.prism_suite, t.prism_suite) AS prism_suite,
            COALESCE(v.section_title, t.section_title) AS section_title,
            COALESCE(v.medical_context, t.medical_context) AS medical_context,
            COALESCE(v.regulatory_context, t.regulatory_context) AS regulatory_context,
            COALESCE(v.clinical_context, t.clinical_context) AS clinical_context
        FROM vector_results v
        FULL OUTER JOIN text_results t ON v.chunk_id = t.chunk_id
    )
    SELECT * FROM combined_results
    WHERE similarity > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Step 5: Create performance indexes (no vector index due to 2000 dim limit)
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_content_fts
    ON rag_knowledge_chunks USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_tenant_processing
    ON rag_knowledge_sources(tenant_id, processing_status);

CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_source_embedding
    ON rag_knowledge_chunks(source_id) WHERE embedding IS NOT NULL;

-- Success message
SELECT 'RAG Migration Complete! Vector dimensions upgraded to 3072. RPC functions created.' as status;
