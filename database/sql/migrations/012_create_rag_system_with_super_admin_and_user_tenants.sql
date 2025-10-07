-- ============================================================================
-- RAG SYSTEM WITH SUPER ADMIN AND USER TENANTS
-- ============================================================================
-- Two-tier RAG system:
-- 1. Super Admin: Global or agent-specific knowledge bases
-- 2. User Tenants: Individual users create their own RAG knowledge bases
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS rag_search_analytics CASCADE;
DROP TABLE IF EXISTS rag_knowledge_chunks CASCADE;
DROP TABLE IF EXISTS rag_knowledge_sources CASCADE;
DROP TABLE IF EXISTS rag_tenants CASCADE;

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
-- Tracks both super admin (you) and individual user tenants
CREATE TABLE rag_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    tenant_type VARCHAR(50) NOT NULL CHECK (tenant_type IN ('super_admin', 'user')),
    user_id UUID, -- References auth.users for user tenants, NULL for super admin
    subscription_tier VARCHAR(50) DEFAULT 'standard',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert super admin tenant (YOU)
INSERT INTO rag_tenants (name, domain, tenant_type, subscription_tier, settings)
VALUES (
    'VITAL Path Super Admin',
    'superadmin.vitalpath.com',
    'super_admin',
    'enterprise',
    '{"features": ["rag", "expert_panels", "compliance", "global_knowledge"], "max_documents": 100000}'
)
ON CONFLICT (domain) DO NOTHING;

-- ============================================================================
-- KNOWLEDGE SOURCES TABLE
-- ============================================================================
-- Stores metadata about uploaded documents
CREATE TABLE rag_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES rag_tenants(id) ON DELETE CASCADE,

    -- Basic metadata
    name VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    source_type VARCHAR(100) DEFAULT 'uploaded_file',

    -- File metadata
    file_path VARCHAR(1000),
    file_size BIGINT,
    mime_type VARCHAR(200),
    content_hash VARCHAR(64) UNIQUE, -- Prevent duplicate uploads

    -- Scope: global (all agents) or agent-specific
    is_global BOOLEAN DEFAULT true,
    agent_id UUID, -- NULL if global, specific agent ID if agent-specific

    -- Knowledge domain classification
    domain VARCHAR(200) DEFAULT 'digital_health',
    category VARCHAR(200),

    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'archived')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Quality metrics
    quality_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),

    -- Usage analytics
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- KNOWLEDGE CHUNKS TABLE
-- ============================================================================
-- Stores document chunks with vector embeddings for semantic search
CREATE TABLE rag_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    chunk_index INTEGER NOT NULL,

    -- Vector embedding (OpenAI text-embedding-3-large = 3072 dimensions)
    -- For backward compatibility with ada-002 (1536), we'll use 1536 for now
    embedding vector(1536),

    -- Chunk metadata
    section_title VARCHAR(500),
    page_number INTEGER,
    word_count INTEGER,

    -- Context metadata
    medical_context JSONB DEFAULT '{}',
    regulatory_context JSONB DEFAULT '{}',

    -- Quality metrics
    quality_score DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEARCH ANALYTICS TABLE
-- ============================================================================
-- Track RAG search queries for analytics and optimization
CREATE TABLE rag_search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES rag_tenants(id) ON DELETE CASCADE,

    -- Query information
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    query_domain VARCHAR(200),

    -- Results metadata
    results_count INTEGER DEFAULT 0,
    avg_similarity_score DECIMAL(5,4),
    top_similarity_score DECIMAL(5,4),

    -- Performance metrics
    search_time_ms INTEGER,
    total_chunks_searched INTEGER,

    -- Context
    user_id UUID,
    agent_id UUID,
    session_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenant indexes
CREATE INDEX IF NOT EXISTS idx_rag_tenants_type ON rag_tenants(tenant_type);
CREATE INDEX IF NOT EXISTS idx_rag_tenants_user_id ON rag_tenants(user_id) WHERE user_id IS NOT NULL;

-- Knowledge sources indexes
CREATE INDEX IF NOT EXISTS idx_rag_sources_tenant ON rag_knowledge_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_sources_domain ON rag_knowledge_sources(domain);
CREATE INDEX IF NOT EXISTS idx_rag_sources_status ON rag_knowledge_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_rag_sources_is_global ON rag_knowledge_sources(is_global);
CREATE INDEX IF NOT EXISTS idx_rag_sources_agent_id ON rag_knowledge_sources(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_sources_hash ON rag_knowledge_sources(content_hash);
CREATE INDEX IF NOT EXISTS idx_rag_sources_tags ON rag_knowledge_sources USING GIN(tags);

-- Knowledge chunks indexes
CREATE INDEX IF NOT EXISTS idx_rag_chunks_source ON rag_knowledge_chunks(source_id);

-- Vector similarity search index (IVFFlat algorithm for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding
    ON rag_knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS idx_rag_analytics_tenant ON rag_search_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_analytics_domain ON rag_search_analytics(query_domain);
CREATE INDEX IF NOT EXISTS idx_rag_analytics_created ON rag_search_analytics(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE rag_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_search_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role has full access to tenants" ON rag_tenants;
DROP POLICY IF EXISTS "Users can read their own tenant" ON rag_tenants;
DROP POLICY IF EXISTS "Service role has full access to sources" ON rag_knowledge_sources;
DROP POLICY IF EXISTS "Users can read their tenant sources" ON rag_knowledge_sources;
DROP POLICY IF EXISTS "Service role has full access to chunks" ON rag_knowledge_chunks;
DROP POLICY IF EXISTS "Users can read their tenant chunks" ON rag_knowledge_chunks;
DROP POLICY IF EXISTS "Service role has full access to analytics" ON rag_search_analytics;

-- Tenants policies
CREATE POLICY "Service role has full access to tenants"
    ON rag_tenants FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their own tenant"
    ON rag_tenants FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR tenant_type = 'super_admin');

-- Knowledge sources policies
CREATE POLICY "Service role has full access to sources"
    ON rag_knowledge_sources FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their tenant sources"
    ON rag_knowledge_sources FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (
            SELECT id FROM rag_tenants
            WHERE user_id = auth.uid() OR tenant_type = 'super_admin'
        )
    );

-- Knowledge chunks policies
CREATE POLICY "Service role has full access to chunks"
    ON rag_knowledge_chunks FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their tenant chunks"
    ON rag_knowledge_chunks FOR SELECT
    TO authenticated
    USING (
        source_id IN (
            SELECT ks.id FROM rag_knowledge_sources ks
            JOIN rag_tenants t ON ks.tenant_id = t.id
            WHERE t.user_id = auth.uid() OR t.tenant_type = 'super_admin'
        )
    );

-- Search analytics policies
CREATE POLICY "Service role has full access to analytics"
    ON rag_search_analytics FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

-- ============================================================================
-- SEMANTIC SEARCH FUNCTION
-- ============================================================================
-- Vector similarity search with filtering by tenant, scope, and agent
CREATE OR REPLACE FUNCTION search_rag_knowledge(
    query_embedding vector(1536),
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

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get super admin tenant ID
CREATE OR REPLACE FUNCTION get_super_admin_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT id FROM rag_tenants WHERE tenant_type = 'super_admin' LIMIT 1;
$$;

-- Get or create user tenant
CREATE OR REPLACE FUNCTION get_or_create_user_tenant(p_user_id UUID, p_user_name VARCHAR)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_tenant_id UUID;
    v_domain VARCHAR;
BEGIN
    -- Check if user already has a tenant
    SELECT id INTO v_tenant_id
    FROM rag_tenants
    WHERE user_id = p_user_id AND tenant_type = 'user';

    -- If not, create one
    IF v_tenant_id IS NULL THEN
        v_domain := 'user-' || p_user_id || '.vitalpath.com';

        INSERT INTO rag_tenants (name, domain, tenant_type, user_id, subscription_tier)
        VALUES (
            p_user_name || '''s Knowledge Base',
            v_domain,
            'user',
            p_user_id,
            'standard'
        )
        RETURNING id INTO v_tenant_id;
    END IF;

    RETURN v_tenant_id;
END;
$$;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_rag_tenants_updated_at ON rag_tenants;
CREATE TRIGGER update_rag_tenants_updated_at
    BEFORE UPDATE ON rag_tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rag_sources_updated_at ON rag_knowledge_sources;
CREATE TRIGGER update_rag_sources_updated_at
    BEFORE UPDATE ON rag_knowledge_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE rag_tenants IS 'Tenant management: super admin (global/agent-specific) and user tenants (personal knowledge bases)';
COMMENT ON TABLE rag_knowledge_sources IS 'Document metadata for RAG system with multi-tenant support';
COMMENT ON TABLE rag_knowledge_chunks IS 'Document chunks with vector embeddings for semantic search';
COMMENT ON TABLE rag_search_analytics IS 'Search query analytics for optimization and monitoring';

COMMENT ON COLUMN rag_tenants.tenant_type IS 'super_admin = platform admin, user = individual user tenant';
COMMENT ON COLUMN rag_knowledge_sources.is_global IS 'true = available to all agents, false = agent-specific';
COMMENT ON COLUMN rag_knowledge_sources.agent_id IS 'NULL if global, specific agent UUID if agent-specific';
COMMENT ON COLUMN rag_knowledge_chunks.embedding IS 'Vector embedding for semantic similarity search (1536 dimensions for ada-002)';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
    'Tenants' as table_name,
    COUNT(*) as record_count
FROM rag_tenants
UNION ALL
SELECT
    'Knowledge Sources',
    COUNT(*)
FROM rag_knowledge_sources
UNION ALL
SELECT
    'Knowledge Chunks',
    COUNT(*)
FROM rag_knowledge_chunks
UNION ALL
SELECT
    'Search Analytics',
    COUNT(*)
FROM rag_search_analytics;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RAG System with Super Admin and User Tenants created successfully!';
    RAISE NOTICE '   - Super Admin Tenant: superadmin.vitalpath.com';
    RAISE NOTICE '   - Tables: rag_tenants, rag_knowledge_sources, rag_knowledge_chunks, rag_search_analytics';
    RAISE NOTICE '   - Search Function: search_rag_knowledge()';
    RAISE NOTICE '   - Helper Functions: get_super_admin_tenant_id(), get_or_create_user_tenant()';
END $$;
