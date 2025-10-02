-- Enhanced VITAL AI Platform Phase 1 Schema
-- Supports multi-model orchestration, advanced RAG, and comprehensive monitoring

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- ENHANCED KNOWLEDGE MANAGEMENT
-- ==========================================

-- Update knowledge_documents table with enhanced metadata
ALTER TABLE knowledge_documents
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS evidence_level VARCHAR(10),
ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS medical_specialty VARCHAR(100),
ADD COLUMN IF NOT EXISTS conditions TEXT[],
ADD COLUMN IF NOT EXISTS interventions TEXT[],
ADD COLUMN IF NOT EXISTS authors TEXT[],
ADD COLUMN IF NOT EXISTS publication_date DATE,
ADD COLUMN IF NOT EXISTS doi VARCHAR(100),
ADD COLUMN IF NOT EXISTS pubmed_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id);

-- Create comprehensive indexes for knowledge documents
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_embedding_cosine
ON knowledge_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_evidence_level
ON knowledge_documents (evidence_level);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_specialty
ON knowledge_documents (medical_specialty);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_validation
ON knowledge_documents (validation_status, last_validated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_quality
ON knowledge_documents (quality_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_conditions_gin
ON knowledge_documents USING gin (conditions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_interventions_gin
ON knowledge_documents USING gin (interventions);

-- Full-text search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_fts
ON knowledge_documents USING gin (to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Enhanced document chunks with quality metrics
ALTER TABLE document_chunks
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS extraction_method VARCHAR(50) DEFAULT 'automatic',
ADD COLUMN IF NOT EXISTS section VARCHAR(255),
ADD COLUMN IF NOT EXISTS page_number INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS token_count INTEGER,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';

-- Enhanced indexes for document chunks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_quality
ON document_chunks (quality_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_section
ON document_chunks (section) WHERE section IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_fts
ON document_chunks USING gin (to_tsvector('english', content));

-- ==========================================
-- MULTI-MODEL LLM ORCHESTRATION
-- ==========================================

-- LLM Providers configuration
CREATE TABLE IF NOT EXISTS llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    endpoint_url TEXT,
    api_key_encrypted TEXT, -- Store encrypted
    priority INTEGER DEFAULT 5,
    max_concurrent INTEGER DEFAULT 10,
    cost_per_token DECIMAL(10, 8),
    average_latency_ms INTEGER DEFAULT 2000,
    reliability_score DECIMAL(3,2) DEFAULT 0.95,
    health_status VARCHAR(20) DEFAULT 'healthy',
    configuration JSONB DEFAULT '{}',

    -- Rate limiting
    rate_limit_rpm INTEGER DEFAULT 1000,
    rate_limit_tpm INTEGER DEFAULT 50000,

    -- Monitoring
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    last_health_check TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM Models configuration
CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    context_window INTEGER DEFAULT 4096,
    max_tokens_per_minute INTEGER DEFAULT 10000,
    cost_per_input_token DECIMAL(10, 8),
    cost_per_output_token DECIMAL(10, 8),

    -- Capabilities
    capabilities TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',

    -- Performance metrics
    average_response_time_ms INTEGER DEFAULT 2000,
    quality_score DECIMAL(3,2) DEFAULT 0.8,

    -- Configuration
    model_config JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider_id, model_name)
);

-- Query routing decisions log
CREATE TABLE IF NOT EXISTS query_routing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    query_text TEXT NOT NULL,
    query_hash VARCHAR(64), -- For caching

    -- Query analysis
    query_intent VARCHAR(50),
    query_domain VARCHAR(50),
    query_complexity VARCHAR(20),
    estimated_tokens INTEGER,

    -- Routing decision
    primary_provider VARCHAR(50),
    primary_model VARCHAR(100),
    fallback_providers TEXT[],
    routing_strategy VARCHAR(50),
    routing_reasoning TEXT,

    -- Execution results
    providers_tried TEXT[],
    successful_provider VARCHAR(50),
    successful_model VARCHAR(100),
    final_response_tokens INTEGER,

    -- Performance metrics
    total_latency_ms INTEGER,
    provider_latency_ms INTEGER,
    processing_time_ms INTEGER,
    total_cost DECIMAL(10,6),

    -- Quality metrics
    response_quality_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for query routing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_routing_user_time
ON query_routing_log (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_routing_provider
ON query_routing_log (successful_provider, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_routing_hash
ON query_routing_log (query_hash);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_routing_domain
ON query_routing_log (query_domain, created_at DESC);

-- ==========================================
-- ENHANCED CONVERSATION TRACKING
-- ==========================================

-- Enhanced conversations with clinical context
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS clinical_context JSONB,
ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS compliance_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS safety_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) DEFAULT 'not_required',
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cost_tracking JSONB DEFAULT '{}';

-- Enhanced messages with orchestration metadata
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS orchestration_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS routing_decision_id UUID REFERENCES query_routing_log(id),
ADD COLUMN IF NOT EXISTS provider_responses JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS consensus_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quality_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS evidence_citations JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS safety_validation JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reranking_applied BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS retrieval_metadata JSONB DEFAULT '{}';

-- ==========================================
-- PERFORMANCE MONITORING & METRICS
-- ==========================================

-- System metrics for monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Partitioning helper
    date_partition DATE GENERATED ALWAYS AS (DATE(timestamp)) STORED
) PARTITION BY RANGE (timestamp);

-- Create partitions for current and future months
CREATE TABLE system_metrics_2024_12 PARTITION OF system_metrics
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE system_metrics_2025_01 PARTITION OF system_metrics
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Performance monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_metrics_name_time
ON system_metrics (metric_name, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_metrics_tags_gin
ON system_metrics USING gin (tags);

-- Agent performance tracking
CREATE TABLE IF NOT EXISTS agent_performance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL,
    conversation_id UUID REFERENCES conversations(conversation_id),
    message_id UUID REFERENCES messages(message_id),

    -- Performance metrics
    response_time_ms INTEGER NOT NULL,
    token_usage INTEGER,
    cost_usd DECIMAL(10,6),

    -- Quality metrics
    accuracy_score DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    safety_score DECIMAL(3,2),

    -- Context
    query_complexity VARCHAR(20),
    domain VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_perf_agent_time
ON agent_performance_log (agent_id, created_at DESC);

-- ==========================================
-- RAG PERFORMANCE TRACKING
-- ==========================================

-- RAG retrieval performance
CREATE TABLE IF NOT EXISTS rag_retrieval_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    query_embedding vector(1536),

    -- Retrieval strategy
    strategy VARCHAR(50) NOT NULL,
    filters_applied JSONB,

    -- Results
    documents_retrieved INTEGER,
    chunks_retrieved INTEGER,
    reranking_applied BOOLEAN DEFAULT FALSE,

    -- Performance
    retrieval_time_ms INTEGER,
    embedding_time_ms INTEGER,
    reranking_time_ms INTEGER,
    total_time_ms INTEGER,

    -- Quality metrics
    average_similarity_score DECIMAL(4,3),
    top_score DECIMAL(4,3),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- COMPLIANCE & AUDIT ENHANCEMENTS
-- ==========================================

-- Enhanced audit trail with digital signatures
ALTER TABLE audit_trail
ADD COLUMN IF NOT EXISTS clinical_decision JSONB,
ADD COLUMN IF NOT EXISTS evidence_used JSONB,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS digital_signature VARCHAR(256);

-- Compliance validation results
CREATE TABLE IF NOT EXISTS compliance_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'conversation', 'message', 'document'
    entity_id UUID NOT NULL,

    -- Validation types
    hipaa_compliant BOOLEAN,
    gdpr_compliant BOOLEAN,
    fda_part11_compliant BOOLEAN,

    -- Validation details
    validation_type VARCHAR(50) NOT NULL,
    validation_result JSONB NOT NULL,
    issues_found JSONB,
    severity_level VARCHAR(20),

    -- Resolution tracking
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_entity
ON compliance_validations (entity_type, entity_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_unresolved
ON compliance_validations (resolved, severity_level) WHERE NOT resolved;

-- ==========================================
-- CLINICAL EVIDENCE INTEGRATION
-- ==========================================

-- Clinical evidence database
CREATE TABLE IF NOT EXISTS clinical_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_type VARCHAR(50) NOT NULL,
    evidence_level VARCHAR(10) NOT NULL, -- 1a, 1b, 2a, etc.

    -- Content
    title TEXT NOT NULL,
    summary TEXT,
    full_content TEXT,

    -- Source information
    source VARCHAR(255),
    publication_date DATE,
    authors TEXT[],
    doi VARCHAR(100),
    pubmed_id VARCHAR(20),

    -- Classification
    medical_specialty VARCHAR(100),
    conditions TEXT[],
    interventions TEXT[],

    -- Quality metrics
    quality_score DECIMAL(3,2) DEFAULT 0.5,
    citation_count INTEGER DEFAULT 0,

    -- Vector embedding
    embedding vector(1536),

    -- Validation
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,
    validation_status VARCHAR(20) DEFAULT 'pending',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_level
ON clinical_evidence (evidence_level, quality_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_specialty
ON clinical_evidence (medical_specialty);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_embedding_cosine
ON clinical_evidence USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_conditions_gin
ON clinical_evidence USING gin (conditions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evidence_validation
ON clinical_evidence (validation_status, validated_at DESC NULLS LAST);

-- ==========================================
-- FUNCTIONS AND PROCEDURES
-- ==========================================

-- Function to calculate document similarity
CREATE OR REPLACE FUNCTION calculate_document_similarity(
    query_embedding vector(1536),
    document_id UUID
) RETURNS DECIMAL(4,3) AS $
DECLARE
    doc_embedding vector(1536);
    similarity DECIMAL(4,3);
BEGIN
    SELECT embedding INTO doc_embedding
    FROM knowledge_documents
    WHERE id = document_id;

    IF doc_embedding IS NULL THEN
        RETURN 0.0;
    END IF;

    SELECT 1 - (query_embedding <=> doc_embedding) INTO similarity;
    RETURN similarity;
END;
$ LANGUAGE plpgsql;

-- Function for hybrid search with scoring
CREATE OR REPLACE FUNCTION hybrid_search_documents(
    query_text TEXT,
    query_embedding vector(1536),
    max_results INTEGER DEFAULT 20,
    vector_weight DECIMAL(3,2) DEFAULT 0.7,
    keyword_weight DECIMAL(3,2) DEFAULT 0.3
) RETURNS TABLE (
    document_id UUID,
    chunk_id UUID,
    content TEXT,
    vector_score DECIMAL(4,3),
    keyword_score DECIMAL(4,3),
    hybrid_score DECIMAL(4,3)
) AS $
BEGIN
    RETURN QUERY
    WITH vector_results AS (
        SELECT
            dc.document_id,
            dc.id as chunk_id,
            dc.content,
            (1 - (dc.embedding <=> query_embedding)) as v_score,
            0.0 as k_score
        FROM document_chunks dc
        ORDER BY dc.embedding <=> query_embedding
        LIMIT max_results
    ),
    keyword_results AS (
        SELECT
            dc.document_id,
            dc.id as chunk_id,
            dc.content,
            0.0 as v_score,
            ts_rank_cd(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)) as k_score
        FROM document_chunks dc
        WHERE to_tsvector('english', dc.content) @@ plainto_tsquery('english', query_text)
        ORDER BY ts_rank_cd(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)) DESC
        LIMIT max_results
    ),
    combined_results AS (
        SELECT DISTINCT
            COALESCE(vr.document_id, kr.document_id) as document_id,
            COALESCE(vr.chunk_id, kr.chunk_id) as chunk_id,
            COALESCE(vr.content, kr.content) as content,
            COALESCE(vr.v_score, 0.0) as vector_score,
            COALESCE(kr.k_score, 0.0) as keyword_score
        FROM vector_results vr
        FULL OUTER JOIN keyword_results kr ON vr.chunk_id = kr.chunk_id
    )
    SELECT
        cr.document_id,
        cr.chunk_id,
        cr.content,
        cr.vector_score,
        cr.keyword_score,
        (cr.vector_score * vector_weight + cr.keyword_score * keyword_weight) as hybrid_score
    FROM combined_results cr
    ORDER BY hybrid_score DESC
    LIMIT max_results;
END;
$ LANGUAGE plpgsql;

-- Function to update system metrics
CREATE OR REPLACE FUNCTION record_system_metric(
    metric_name VARCHAR(100),
    metric_value DECIMAL(15,6),
    metric_unit VARCHAR(20) DEFAULT NULL,
    tags JSONB DEFAULT '{}'
) RETURNS VOID AS $
BEGIN
    INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags)
    VALUES (metric_name, metric_value, metric_unit, tags);
END;
$ LANGUAGE plpgsql;

-- ==========================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ==========================================

-- Agent performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_performance_summary AS
SELECT
    agent_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as query_count,
    AVG(response_time_ms) as avg_response_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time_ms,
    AVG(accuracy_score) as avg_accuracy,
    AVG(relevance_score) as avg_relevance,
    AVG(safety_score) as avg_safety,
    SUM(cost_usd) as total_cost
FROM agent_performance_log
GROUP BY agent_id, DATE_TRUNC('day', created_at);

CREATE INDEX ON agent_performance_summary (agent_id, date DESC);

-- RAG performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS rag_performance_summary AS
SELECT
    strategy,
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as query_count,
    AVG(total_time_ms) as avg_total_time_ms,
    AVG(retrieval_time_ms) as avg_retrieval_time_ms,
    AVG(documents_retrieved) as avg_documents_retrieved,
    AVG(average_similarity_score) as avg_similarity_score,
    SUM(CASE WHEN reranking_applied THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) as reranking_rate
FROM rag_retrieval_log
GROUP BY strategy, DATE_TRUNC('hour', created_at);

CREATE INDEX ON rag_performance_summary (strategy, hour DESC);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_evidence ENABLE ROW LEVEL SECURITY;

-- Policies for LLM configuration (admin only)
CREATE POLICY "llm_providers_admin_only" ON llm_providers
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for clinical evidence (based on validation status)
CREATE POLICY "clinical_evidence_validated_read" ON clinical_evidence
    FOR SELECT
    TO authenticated
    USING (validation_status = 'validated' OR auth.jwt() ->> 'role' IN ('admin', 'clinical_validator'));

-- ==========================================
-- SCHEDULED MAINTENANCE
-- ==========================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views() RETURNS VOID AS $
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY agent_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY rag_performance_summary;
END;
$ LANGUAGE plpgsql;

-- Function to clean old metrics (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_metrics() RETURNS INTEGER AS $
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM system_metrics
    WHERE timestamp < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- ==========================================
-- INITIAL DATA
-- ==========================================

-- Insert default LLM providers
INSERT INTO llm_providers (
    provider_id, name, endpoint_url, priority, max_concurrent,
    cost_per_token, average_latency_ms, reliability_score,
    rate_limit_rpm, rate_limit_tpm
) VALUES
(
    'openai', 'OpenAI', 'https://api.openai.com/v1',
    1, 50, 0.000015, 2000, 0.95, 3000, 150000
),
(
    'anthropic', 'Anthropic Claude', 'https://api.anthropic.com/v1',
    2, 30, 0.000020, 3000, 0.97, 2000, 100000
)
ON CONFLICT (provider_id) DO NOTHING;

-- Insert default models
INSERT INTO llm_models (
    provider_id, model_name, context_window, max_tokens_per_minute,
    cost_per_input_token, cost_per_output_token,
    capabilities, specializations, quality_score
)
SELECT
    p.id,
    'gpt-4-turbo-preview',
    128000,
    40000,
    0.00001,
    0.00003,
    ARRAY['reasoning', 'analysis', 'medical'],
    ARRAY['clinical-reasoning', 'complex-analysis'],
    0.95
FROM llm_providers p WHERE p.provider_id = 'openai'
ON CONFLICT (provider_id, model_name) DO NOTHING;

INSERT INTO llm_models (
    provider_id, model_name, context_window, max_tokens_per_minute,
    cost_per_input_token, cost_per_output_token,
    capabilities, specializations, quality_score
)
SELECT
    p.id,
    'claude-3-opus-20240229',
    200000,
    20000,
    0.000015,
    0.000075,
    ARRAY['reasoning', 'analysis', 'safety'],
    ARRAY['safety-critical', 'regulatory-analysis'],
    0.97
FROM llm_providers p WHERE p.provider_id = 'anthropic'
ON CONFLICT (provider_id, model_name) DO NOTHING;

-- Success message
SELECT 'Enhanced Phase 1 schema installation completed successfully!' as status;