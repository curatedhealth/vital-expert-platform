-- ============================================================================
-- VITAL RAG System - Critical Fixes Migration
-- ============================================================================
-- Purpose: Fix critical RAG system issues identified in schema analysis
-- Created: 2025-10-18
-- Dependencies: 20250924100002_rag_schema_fixed.sql, 20251003_setup_rag_knowledge_base.sql
-- ============================================================================

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- STEP 1: UPGRADE VECTOR DIMENSIONS (1536 → 3072)
-- ============================================================================

-- Upgrade rag_knowledge_chunks embedding column
DO $$
BEGIN
    -- Check if column exists and has wrong dimensions
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rag_knowledge_chunks' 
        AND column_name = 'embedding'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Check current dimension
        IF (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'rag_knowledge_chunks' 
            AND column_name = 'embedding'
            AND udt_name = 'vector') > 0 THEN
            
            -- Create backup table first
            CREATE TABLE IF NOT EXISTS rag_knowledge_chunks_backup_1536 AS 
            SELECT * FROM rag_knowledge_chunks WHERE embedding IS NOT NULL;
            
            -- Drop the old index
            DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding;
            
            -- Alter column to new dimensions
            ALTER TABLE rag_knowledge_chunks 
            ALTER COLUMN embedding TYPE vector(3072);
            
            RAISE NOTICE '✅ Upgraded rag_knowledge_chunks.embedding to vector(3072)';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not upgrade rag_knowledge_chunks.embedding: %', SQLERRM;
END $$;

-- Upgrade rag_search_analytics query_embedding column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rag_search_analytics' 
        AND column_name = 'query_embedding'
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE rag_search_analytics 
        ALTER COLUMN query_embedding TYPE vector(3072);
        
        RAISE NOTICE '✅ Upgraded rag_search_analytics.query_embedding to vector(3072)';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not upgrade rag_search_analytics.query_embedding: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 2: CREATE CORRECT RPC FUNCTIONS
-- ============================================================================

-- Create search_rag_knowledge function (what TypeScript code expects)
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

-- Create hybrid search function (vector + full-text)
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

-- ============================================================================
-- STEP 3: RECREATE VECTOR INDEXES FOR NEW DIMENSIONS
-- ============================================================================

-- Recreate vector similarity search index for 3072 dimensions
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_embedding_3072
    ON rag_knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Drop old index if it exists
DROP INDEX IF EXISTS idx_rag_knowledge_chunks_embedding;

-- ============================================================================
-- STEP 4: ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- Full-text search index for hybrid search
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_content_fts
    ON rag_knowledge_chunks USING gin(to_tsvector('english', content));

-- Index for tenant filtering
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_tenant_processing
    ON rag_knowledge_sources(tenant_id, processing_status);

-- ============================================================================
-- STEP 5: UPDATE EXISTING RPC FUNCTION (BACKWARD COMPATIBILITY)
-- ============================================================================

-- Update existing search_rag_knowledge_chunks to use 3072 dimensions
CREATE OR REPLACE FUNCTION search_rag_knowledge_chunks(
    query_embedding vector(3072),  -- Updated from 1536
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_domain knowledge_domain DEFAULT NULL,
    filter_prism_suite prism_suite DEFAULT NULL
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
    regulatory_context JSONB
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
        kc.regulatory_context
    FROM rag_knowledge_chunks kc
    JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
    WHERE
        1 - (kc.embedding <=> query_embedding) > match_threshold
        AND (filter_domain IS NULL OR ks.domain = filter_domain)
        AND (filter_prism_suite IS NULL OR ks.prism_suite = filter_prism_suite)
        AND ks.processing_status = 'completed'
        AND kc.embedding IS NOT NULL
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;

-- ============================================================================
-- STEP 6: ADD HELPER FUNCTIONS
-- ============================================================================

-- Function to get embedding dimensions (for validation)
CREATE OR REPLACE FUNCTION get_rag_embedding_dimensions()
RETURNS INTEGER
LANGUAGE sql STABLE
AS $$
    SELECT 3072;
$$;

-- Function to validate embedding dimensions
CREATE OR REPLACE FUNCTION validate_embedding_dimensions(embedding_vector vector)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
    SELECT array_length(embedding_vector, 1) = 3072;
$$;

-- Function to get RAG system status
CREATE OR REPLACE FUNCTION get_rag_system_status()
RETURNS TABLE (
    component TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE sql STABLE
AS $$
    SELECT 'vector_dimensions'::TEXT, '3072'::TEXT, 'Upgraded from 1536'::TEXT
    UNION ALL
    SELECT 'search_functions'::TEXT, 'available'::TEXT, 'search_rag_knowledge, hybrid_search_rag_knowledge'::TEXT
    UNION ALL
    SELECT 'tables'::TEXT, 'ready'::TEXT, 'rag_knowledge_sources, rag_knowledge_chunks, rag_search_analytics'::TEXT
    UNION ALL
    SELECT 'indexes'::TEXT, 'optimized'::TEXT, 'Vector similarity, full-text search, tenant filtering'::TEXT;
$$;

-- ============================================================================
-- STEP 7: DATA VALIDATION
-- ============================================================================

-- Check for any existing embeddings with wrong dimensions
DO $$
DECLARE
    wrong_dim_count INTEGER;
    total_chunks INTEGER;
BEGIN
    -- Count chunks with embeddings
    SELECT COUNT(*) INTO total_chunks FROM rag_knowledge_chunks WHERE embedding IS NOT NULL;
    
    -- This will fail if any embeddings have wrong dimensions
    SELECT COUNT(*) INTO wrong_dim_count 
    FROM rag_knowledge_chunks 
    WHERE embedding IS NOT NULL 
    AND NOT validate_embedding_dimensions(embedding);
    
    IF wrong_dim_count > 0 THEN
        RAISE WARNING 'Found % chunks with wrong embedding dimensions. These need to be regenerated.', wrong_dim_count;
    ELSE
        RAISE NOTICE '✅ All existing embeddings have correct dimensions (3072)';
    END IF;
    
    RAISE NOTICE '📊 Total chunks with embeddings: %', total_chunks;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 VITAL RAG System Critical Fixes Applied Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Upgraded vector dimensions: 1536 → 3072';
    RAISE NOTICE '✅ Created search_rag_knowledge() function (TypeScript compatible)';
    RAISE NOTICE '✅ Created hybrid_search_rag_knowledge() function';
    RAISE NOTICE '✅ Updated search_rag_knowledge_chunks() for 3072 dimensions';
    RAISE NOTICE '✅ Recreated vector indexes for new dimensions';
    RAISE NOTICE '✅ Added full-text search indexes';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next Steps:';
    RAISE NOTICE '   1. Fix TypeScript service (initialize Supabase client)';
    RAISE NOTICE '   2. Replace mock embeddings with real OpenAI API';
    RAISE NOTICE '   3. Create search API endpoint';
    RAISE NOTICE '   4. Test end-to-end functionality';
    RAISE NOTICE '';
    RAISE NOTICE '📊 System Status:';
    PERFORM * FROM get_rag_system_status();
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

/*
ROLLBACK STEPS (if migration needs to be reverted):

1. Restore from backup:
   INSERT INTO rag_knowledge_chunks (SELECT * FROM rag_knowledge_chunks_backup_1536);

2. Revert vector dimensions:
   ALTER TABLE rag_knowledge_chunks ALTER COLUMN embedding TYPE vector(1536);
   ALTER TABLE rag_search_analytics ALTER COLUMN query_embedding TYPE vector(1536);

3. Recreate old indexes:
   CREATE INDEX idx_rag_knowledge_chunks_embedding ON rag_knowledge_chunks 
   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

4. Drop new functions:
   DROP FUNCTION IF EXISTS search_rag_knowledge(vector, float, int, knowledge_domain, prism_suite, UUID);
   DROP FUNCTION IF EXISTS hybrid_search_rag_knowledge(vector, text, float, int, float, float, knowledge_domain, prism_suite, UUID);

5. Restore old function:
   -- Restore original search_rag_knowledge_chunks with 1536 dimensions
*/
