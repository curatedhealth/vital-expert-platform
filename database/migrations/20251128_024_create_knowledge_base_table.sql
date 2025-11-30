-- ============================================================================
-- Migration: Create Knowledge Base Table
-- Date: 2025-11-28
-- Purpose: Create the knowledge_base table for RAG document storage
--          and the agent_knowledge junction table for agent-knowledge links
-- ============================================================================

BEGIN;

-- ============================================================================
-- KNOWLEDGE_BASE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    chunk_index INTEGER DEFAULT 0,
    parent_document_id UUID REFERENCES knowledge_base(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant
ON knowledge_base(tenant_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_source_type
ON knowledge_base(source_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at
ON knowledge_base(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_search
ON knowledge_base USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_search
ON knowledge_base USING gin(to_tsvector('english', title));

-- Vector similarity search index (if pgvector extension exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding
        ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    END IF;
END $$;

COMMENT ON TABLE knowledge_base IS 'Knowledge base for RAG document storage with multi-tenant support';

-- ============================================================================
-- AGENT_KNOWLEDGE JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    knowledge_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
    relevance_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT agent_knowledge_unique UNIQUE(agent_id, knowledge_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent
ON agent_knowledge(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_knowledge
ON agent_knowledge(knowledge_id);

COMMENT ON TABLE agent_knowledge IS 'Links agents to their knowledge base entries';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge ENABLE ROW LEVEL SECURITY;

-- Knowledge base policies
CREATE POLICY knowledge_base_tenant_policy ON knowledge_base
    FOR ALL
    USING (
        tenant_id = COALESCE(
            current_setting('app.tenant_id', true)::UUID,
            (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY knowledge_base_service_policy ON knowledge_base
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Agent knowledge policies
CREATE POLICY agent_knowledge_tenant_policy ON agent_knowledge
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM knowledge_base kb
            WHERE kb.id = knowledge_id
            AND kb.tenant_id = COALESCE(
                current_setting('app.tenant_id', true)::UUID,
                (SELECT organization_id FROM profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY agent_knowledge_service_policy ON agent_knowledge
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

/**
 * Search knowledge base with text similarity
 */
CREATE OR REPLACE FUNCTION search_knowledge_base(
    p_tenant_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    source_type TEXT,
    metadata JSONB,
    similarity_rank FLOAT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.source_type,
        kb.metadata,
        ts_rank(to_tsvector('english', kb.content), plainto_tsquery('english', p_query)) as similarity_rank
    FROM knowledge_base kb
    WHERE kb.tenant_id = p_tenant_id
      AND to_tsvector('english', kb.content) @@ plainto_tsquery('english', p_query)
    ORDER BY similarity_rank DESC
    LIMIT p_limit;
$$;

/**
 * Search knowledge base with vector similarity (if embedding exists)
 */
CREATE OR REPLACE FUNCTION search_knowledge_base_vector(
    p_tenant_id UUID,
    p_embedding vector(1536),
    p_limit INTEGER DEFAULT 10,
    p_min_similarity FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    source_type TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.source_type,
        kb.metadata,
        1 - (kb.embedding <=> p_embedding) as similarity
    FROM knowledge_base kb
    WHERE kb.tenant_id = p_tenant_id
      AND kb.embedding IS NOT NULL
      AND 1 - (kb.embedding <=> p_embedding) >= p_min_similarity
    ORDER BY kb.embedding <=> p_embedding
    LIMIT p_limit;
$$;

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name IN ('knowledge_base', 'agent_knowledge');

    IF table_count = 2 THEN
        RAISE NOTICE '✅ Knowledge base tables created successfully';
    ELSE
        RAISE WARNING '❌ Some tables missing (found %/2)', table_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== Knowledge Base Migration Complete ===';
    RAISE NOTICE 'Tables:';
    RAISE NOTICE '  - knowledge_base (RAG document storage)';
    RAISE NOTICE '  - agent_knowledge (agent-knowledge links)';
    RAISE NOTICE 'Functions:';
    RAISE NOTICE '  - search_knowledge_base(tenant_id, query, limit)';
    RAISE NOTICE '  - search_knowledge_base_vector(tenant_id, embedding, limit, min_similarity)';
END $$;

COMMIT;
