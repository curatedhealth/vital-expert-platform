-- VITAL Path Phase 1: Complete RAG System Database Schema
-- Multi-tenant RAG system with pgvector support for specialized healthcare domains

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

-- Enhanced knowledge domains with PRISM specializations
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

-- PRISM suite classifications
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

-- Document processing status
CREATE TYPE processing_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'archived'
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

    -- Domain classification
    domain knowledge_domain NOT NULL DEFAULT 'medical_affairs',
    prism_suite prism_suite,
    category VARCHAR(200),
    subcategory VARCHAR(200),

    -- Content metadata
    authors TEXT[],
    publication_date DATE,
    journal VARCHAR(500),
    doi VARCHAR(200),
    pmid VARCHAR(50),
    tags TEXT[],
    keywords TEXT[],

    -- Processing metadata
    processing_status processing_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Access control
    is_public BOOLEAN DEFAULT false,
    access_level VARCHAR(100) DEFAULT 'tenant',
    permissions JSONB DEFAULT '{}',

    -- Quality metrics
    content_quality_score DECIMAL(3,2) DEFAULT 0.0,
    relevance_score DECIMAL(3,2) DEFAULT 0.0,
    citation_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Enhanced document chunks with medical context awareness
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_source_id UUID REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Chunk content
    content TEXT NOT NULL,
    content_length INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,

    -- Vector embeddings (1536 dimensions for OpenAI text-embedding-ada-002)
    embedding_openai vector(1536),
    embedding_medical vector(768), -- For specialized medical embeddings

    -- Medical context metadata
    medical_specialties TEXT[],
    therapeutic_areas TEXT[],
    drug_names TEXT[],
    indication_mentions TEXT[],
    study_types TEXT[],
    evidence_level VARCHAR(50),
    regulatory_mentions TEXT[],

    -- Content classification
    domain knowledge_domain NOT NULL,
    prism_suite prism_suite,
    content_type VARCHAR(100),
    section_type VARCHAR(100),

    -- NLP extracted features
    keywords TEXT[],
    entities JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),
    readability_score DECIMAL(3,2),
    technical_complexity VARCHAR(50),

    -- Quality and relevance
    chunk_quality_score DECIMAL(3,2) DEFAULT 0.0,
    retrieval_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRISM prompt library with domain specialization
CREATE TABLE IF NOT EXISTS prism_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Prompt identification
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    acronym VARCHAR(20),
    prism_suite prism_suite NOT NULL,
    domain knowledge_domain NOT NULL,

    -- Prompt content
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    description TEXT,

    -- Metadata
    version VARCHAR(20) DEFAULT '1.0',
    tags TEXT[],
    parameters JSONB DEFAULT '{}',

    -- Usage and quality
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    is_user_created BOOLEAN DEFAULT false,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,

    UNIQUE(tenant_id, name, prism_suite)
);

-- RAG query sessions with enhanced tracking
CREATE TABLE IF NOT EXISTS rag_query_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,

    -- Query context
    query_text TEXT NOT NULL,
    domain knowledge_domain NOT NULL,
    prism_suite prism_suite,
    prompt_id UUID REFERENCES prism_prompts(id),

    -- Search parameters
    search_filters JSONB DEFAULT '{}',
    similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
    max_results INTEGER DEFAULT 10,

    -- Results
    response_text TEXT,
    source_chunks UUID[],
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,

    -- Quality metrics
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback TEXT,
    was_helpful BOOLEAN,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration_ms INTEGER
);

-- Enhanced vector search function for medical context
CREATE OR REPLACE FUNCTION match_medical_documents(
    p_tenant_id UUID,
    p_query_embedding vector(1536),
    p_domain knowledge_domain DEFAULT NULL,
    p_prism_suite prism_suite DEFAULT NULL,
    p_therapeutic_areas TEXT[] DEFAULT NULL,
    p_medical_specialties TEXT[] DEFAULT NULL,
    p_evidence_levels TEXT[] DEFAULT NULL,
    p_match_threshold float DEFAULT 0.7,
    p_match_count int DEFAULT 10
)
RETURNS TABLE(
    chunk_id UUID,
    knowledge_source_id UUID,
    content TEXT,
    similarity float,
    domain knowledge_domain,
    prism_suite prism_suite,
    medical_specialties TEXT[],
    therapeutic_areas TEXT[],
    evidence_level VARCHAR(50),
    source_title VARCHAR(500),
    source_authors TEXT[],
    publication_date DATE,
    chunk_quality_score DECIMAL(3,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.knowledge_source_id,
        dc.content,
        (1 - (dc.embedding_openai <=> p_query_embedding)) as similarity,
        dc.domain,
        dc.prism_suite,
        dc.medical_specialties,
        dc.therapeutic_areas,
        dc.evidence_level,
        ks.title,
        ks.authors,
        ks.publication_date,
        dc.chunk_quality_score
    FROM document_chunks dc
    JOIN knowledge_sources ks ON dc.knowledge_source_id = ks.id
    WHERE
        dc.tenant_id = p_tenant_id
        AND ks.processing_status = 'completed'
        AND (1 - (dc.embedding_openai <=> p_query_embedding)) > p_match_threshold
        AND (p_domain IS NULL OR dc.domain = p_domain)
        AND (p_prism_suite IS NULL OR dc.prism_suite = p_prism_suite)
        AND (p_therapeutic_areas IS NULL OR dc.therapeutic_areas && p_therapeutic_areas)
        AND (p_medical_specialties IS NULL OR dc.medical_specialties && p_medical_specialties)
        AND (p_evidence_levels IS NULL OR dc.evidence_level = ANY(p_evidence_levels))
    ORDER BY similarity DESC
    LIMIT p_match_count;
END;
$$;

-- Legacy compatibility function
CREATE OR REPLACE FUNCTION match_document_chunks(
    agent_id TEXT,
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    similarity float,
    title VARCHAR(500),
    is_public BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        (1 - (dc.embedding_openai <=> query_embedding)) as similarity,
        ks.title,
        ks.is_public
    FROM document_chunks dc
    JOIN knowledge_sources ks ON dc.knowledge_source_id = ks.id
    WHERE
        (1 - (dc.embedding_openai <=> query_embedding)) > match_threshold
        AND ks.processing_status = 'completed'
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_openai ON document_chunks USING ivfflat (embedding_openai vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_medical ON document_chunks USING ivfflat (embedding_medical vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_domain ON document_chunks(tenant_id, domain);
CREATE INDEX IF NOT EXISTS idx_document_chunks_prism_suite ON document_chunks(prism_suite);
CREATE INDEX IF NOT EXISTS idx_document_chunks_medical_specialties ON document_chunks USING gin(medical_specialties);
CREATE INDEX IF NOT EXISTS idx_document_chunks_therapeutic_areas ON document_chunks USING gin(therapeutic_areas);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tenant_domain ON knowledge_sources(tenant_id, domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_processing_status ON knowledge_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_content_hash ON knowledge_sources(content_hash);
CREATE INDEX IF NOT EXISTS idx_prism_prompts_suite_domain ON prism_prompts(prism_suite, domain);
CREATE INDEX IF NOT EXISTS idx_rag_query_sessions_tenant_domain ON rag_query_sessions(tenant_id, domain);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts ON document_chunks USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_title_fts ON knowledge_sources USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_description_fts ON knowledge_sources USING gin(to_tsvector('english', description));

-- Row Level Security (RLS) for multi-tenancy
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prism_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_query_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (to be customized based on authentication system)
CREATE POLICY tenant_isolation_knowledge_sources ON knowledge_sources
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
        OR is_public = true
    );

CREATE POLICY tenant_isolation_document_chunks ON document_chunks
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
    );

CREATE POLICY tenant_isolation_prism_prompts ON prism_prompts
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
        OR tenant_id IS NULL  -- Global prompts
    );

-- Trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_chunks_updated_at BEFORE UPDATE ON document_chunks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default tenant for development
INSERT INTO tenants (id, name, domain, subscription_tier)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'VITAL Path Demo',
    'demo.vitalpath.ai',
    'enterprise'
) ON CONFLICT (domain) DO NOTHING;

-- Set default tenant context
SELECT set_config('app.current_tenant_id', '00000000-0000-0000-0000-000000000000', false);

COMMENT ON TABLE tenants IS 'Multi-tenant organization management';
COMMENT ON TABLE knowledge_sources IS 'Enhanced knowledge sources with PRISM domain classification';
COMMENT ON TABLE document_chunks IS 'Vector-enabled document chunks with medical context awareness';
COMMENT ON TABLE prism_prompts IS 'PRISM specialized prompt library for healthcare domains';
COMMENT ON TABLE rag_query_sessions IS 'RAG query tracking with quality metrics';
COMMENT ON FUNCTION match_medical_documents IS 'Enhanced vector search with medical context filtering';