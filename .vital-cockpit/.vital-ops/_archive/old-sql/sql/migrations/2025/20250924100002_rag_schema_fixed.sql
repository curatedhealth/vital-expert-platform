-- VITAL Path Phase 1: RAG System Migration (Fixed DEFAULT issue)
-- This migration safely adds RAG capabilities to existing VITAL Path schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create custom types safely
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

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS rag_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'standard',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tenant first
INSERT INTO rag_tenants (name, domain, subscription_tier, settings)
VALUES (
    'VITAL Path Default',
    'default.vitalpath.com',
    'enterprise',
    '{"features": ["rag", "expert_panels", "compliance"], "max_documents": 10000}'
)
ON CONFLICT (domain) DO NOTHING;

-- Knowledge sources table for RAG system (fixed DEFAULT issue)
CREATE TABLE IF NOT EXISTS rag_knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES rag_tenants(id) ON DELETE CASCADE,

    -- Basic metadata
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

    -- Processing status
    processing_status processing_status DEFAULT 'pending',
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Document chunks with vector embeddings
CREATE TABLE IF NOT EXISTS rag_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES rag_knowledge_sources(id) ON DELETE CASCADE,

    -- Content
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    chunk_index INTEGER NOT NULL,

    -- Vector embedding (OpenAI ada-002 dimensionality)
    embedding vector(1536),

    -- Chunk metadata
    section_title VARCHAR(500),
    page_number INTEGER,
    word_count INTEGER,

    -- PRISM-specific metadata
    medical_context JSONB DEFAULT '{}',
    regulatory_context JSONB DEFAULT '{}',
    clinical_context JSONB DEFAULT '{}',

    -- Quality metrics
    quality_score DECIMAL(3,2),
    semantic_density DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search analytics (fixed DEFAULT issue)
CREATE TABLE IF NOT EXISTS rag_search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES rag_tenants(id) ON DELETE CASCADE,

    -- Query information
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

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_tenant
    ON rag_knowledge_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_domain
    ON rag_knowledge_sources(domain);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_prism_suite
    ON rag_knowledge_sources(prism_suite);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_processing_status
    ON rag_knowledge_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_sources_tags
    ON rag_knowledge_sources USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_source
    ON rag_knowledge_chunks(source_id);

-- Vector similarity search index (requires pgvector extension)
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_embedding
    ON rag_knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_rag_search_tenant
    ON rag_search_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_search_domain
    ON rag_search_analytics(query_domain);
CREATE INDEX IF NOT EXISTS idx_rag_search_created
    ON rag_search_analytics(created_at);

-- Enable Row Level Security
ALTER TABLE rag_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS rag_tenant_isolation_policy ON rag_knowledge_sources;
    DROP POLICY IF EXISTS rag_chunks_tenant_isolation_policy ON rag_knowledge_chunks;
    DROP POLICY IF EXISTS rag_analytics_tenant_isolation_policy ON rag_search_analytics;

    -- Create new policies
    CREATE POLICY rag_tenant_isolation_policy ON rag_knowledge_sources
        FOR ALL USING (
            tenant_id IN (
                SELECT id FROM rag_tenants
                WHERE domain = COALESCE(current_setting('app.current_tenant', true), 'default.vitalpath.com')
            )
        );

    CREATE POLICY rag_chunks_tenant_isolation_policy ON rag_knowledge_chunks
        FOR ALL USING (
            source_id IN (
                SELECT id FROM rag_knowledge_sources ks
                JOIN rag_tenants t ON ks.tenant_id = t.id
                WHERE t.domain = COALESCE(current_setting('app.current_tenant', true), 'default.vitalpath.com')
            )
        );

    CREATE POLICY rag_analytics_tenant_isolation_policy ON rag_search_analytics
        FOR ALL USING (
            tenant_id IN (
                SELECT id FROM rag_tenants
                WHERE domain = COALESCE(current_setting('app.current_tenant', true), 'default.vitalpath.com')
            )
        );
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Some RLS policies already exist, continuing...';
END $$;

-- Semantic search function
CREATE OR REPLACE FUNCTION search_rag_knowledge_chunks(
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
    ORDER BY (kc.embedding <=> query_embedding)
    LIMIT match_count;
$$;

-- Helper function to get default tenant ID
CREATE OR REPLACE FUNCTION get_default_rag_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
    SELECT id FROM rag_tenants WHERE domain = 'default.vitalpath.com' LIMIT 1;
$$;

-- Update existing records to use default tenant (if needed)
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Get the default tenant ID
    SELECT id INTO default_tenant_id FROM rag_tenants WHERE domain = 'default.vitalpath.com';

    -- Update any records without tenant_id
    IF default_tenant_id IS NOT NULL THEN
        UPDATE rag_knowledge_sources
        SET tenant_id = default_tenant_id
        WHERE tenant_id IS NULL;

        UPDATE rag_search_analytics
        SET tenant_id = default_tenant_id
        WHERE tenant_id IS NULL;
    END IF;
END $$;

-- Insert sample knowledge source for testing
INSERT INTO rag_knowledge_sources (
    tenant_id,
    name,
    title,
    description,
    domain,
    prism_suite,
    processing_status
)
SELECT
    t.id,
    'VITAL Path Platform Documentation',
    'Platform User Guide and Technical Documentation',
    'Comprehensive documentation for the VITAL Path healthcare AI platform',
    'digital_health',
    'CRAFT',
    'completed'
FROM rag_tenants t
WHERE t.domain = 'default.vitalpath.com'
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'VITAL Path RAG Schema migration completed successfully!';
    RAISE NOTICE 'Created tables: rag_tenants, rag_knowledge_sources, rag_knowledge_chunks, rag_search_analytics';
    RAISE NOTICE 'Vector search function: search_rag_knowledge_chunks()';
    RAISE NOTICE 'Default tenant: default.vitalpath.com';
    RAISE NOTICE 'Phase 1 RAG system is now ready!';
END $$;