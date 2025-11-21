-- VITAL Path Phase 1: RAG System Database Schema (Supabase Compatible)
-- Multi-tenant RAG system with pgvector support for healthcare domains

-- Enable required extensions (Supabase compatible)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enhanced knowledge domains with PRISM specializations
DO $$ BEGIN
    CREATE TYPE knowledge_domain AS ENUM (
        'medical_affairs',
        'regulatory_compliance',
        'digital_health',
        'clinical_research',
        'market_access',
        'commercial_strategy',
        'methodology_frameworks',
        'technology_platforms'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PRISM suite classifications
DO $$ BEGIN
    CREATE TYPE prism_suite AS ENUM (
        'RULES',    -- Regulatory Excellence
        'TRIALS',   -- Clinical Development
        'GUARD',    -- Safety Framework
        'VALUE',    -- Market Access
        'BRIDGE',   -- Stakeholder Engagement
        'PROOF',    -- Evidence Analytics
        'CRAFT',    -- Medical Writing
        'SCOUT'     -- Competitive Intelligence
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Document processing status
DO $$ BEGIN
    CREATE TYPE processing_status AS ENUM (
        'pending',
        'processing',
        'completed',
        'failed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core tenant management
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'standard',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced knowledge sources with PRISM metadata
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    source_type VARCHAR(100) DEFAULT 'uploaded_file',

    -- File metadata
    file_path VARCHAR(1000),
    file_size BIGINT,
    mime_type VARCHAR(200),
    content_hash VARCHAR(64),

    -- PRISM classification
    domain knowledge_domain DEFAULT 'medical_affairs',
    prism_suite prism_suite,
    medical_specialty VARCHAR(200),
    therapeutic_area VARCHAR(200),

    -- Processing and quality
    processing_status processing_status DEFAULT 'pending',
    quality_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),

    -- Analytics
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,

    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Document chunks with pgvector embeddings
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    chunk_index INTEGER NOT NULL,

    -- Vector embedding
    embedding vector(1536),

    -- Chunk metadata
    section_title VARCHAR(500),
    page_number INTEGER,
    word_count INTEGER,

    -- PRISM-specific metadata
    medical_context JSONB DEFAULT '{}',
    regulatory_context JSONB DEFAULT '{}',
    clinical_context JSONB DEFAULT '{}',

    -- Quality and relevance
    quality_score DECIMAL(3,2),
    semantic_density DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search analytics for RAG performance tracking
CREATE TABLE IF NOT EXISTS rag_search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Query metadata
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    query_domain knowledge_domain,

    -- Results metadata
    results_count INTEGER DEFAULT 0,
    avg_similarity_score DECIMAL(5,4),
    top_similarity_score DECIMAL(5,4),

    -- Performance metrics
    search_time_ms INTEGER,
    total_chunks_searched INTEGER,

    -- Context
    user_id UUID,
    session_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tenant ON knowledge_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_domain ON knowledge_sources(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_prism_suite ON knowledge_sources(prism_suite);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_processing_status ON knowledge_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source ON knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_rag_search_tenant ON rag_search_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_search_domain ON rag_search_analytics(query_domain);
CREATE INDEX IF NOT EXISTS idx_rag_search_created ON rag_search_analytics(created_at);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation
CREATE POLICY tenant_isolation_policy ON knowledge_sources
    FOR ALL USING (
        tenant_id IN (
            SELECT id FROM tenants
            WHERE domain = current_setting('app.current_tenant', true)
        )
    );

CREATE POLICY chunks_tenant_isolation_policy ON knowledge_chunks
    FOR ALL USING (
        source_id IN (
            SELECT id FROM knowledge_sources ks
            JOIN tenants t ON ks.tenant_id = t.id
            WHERE t.domain = current_setting('app.current_tenant', true)
        )
    );

CREATE POLICY analytics_tenant_isolation_policy ON rag_search_analytics
    FOR ALL USING (
        tenant_id IN (
            SELECT id FROM tenants
            WHERE domain = current_setting('app.current_tenant', true)
        )
    );

-- Create a function for semantic search
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
    query_embedding vector(1536),
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
    prism_suite prism_suite
)
LANGUAGE sql STABLE
AS $$
    SELECT
        kc.id AS chunk_id,
        kc.source_id,
        kc.content,
        (kc.embedding <=> query_embedding) * -1 + 1 AS similarity,
        ks.name AS source_name,
        ks.domain,
        ks.prism_suite
    FROM knowledge_chunks kc
    JOIN knowledge_sources ks ON kc.source_id = ks.id
    WHERE
        (kc.embedding <=> query_embedding) * -1 + 1 > match_threshold
        AND (filter_domain IS NULL OR ks.domain = filter_domain)
        AND (filter_prism_suite IS NULL OR ks.prism_suite = filter_prism_suite)
        AND ks.processing_status = 'completed'
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;

-- Insert default tenant for development
INSERT INTO tenants (name, domain, subscription_tier, settings)
VALUES (
    'VITAL Path Development',
    'dev.vitalpath.com',
    'enterprise',
    '{"features": ["rag", "expert_panels", "compliance"], "max_documents": 10000}'
)
ON CONFLICT (domain) DO NOTHING;