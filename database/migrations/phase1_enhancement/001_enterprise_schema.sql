-- ===================================================================
-- VITAL Path Platform - Enhanced Phase 1: Enterprise Database Schema
-- Migration: 001_enterprise_schema.sql
-- Version: 1.0.0
-- Created: 2025-09-24
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===================================================================
-- 1. ENTERPRISE CORE SCHEMA
-- ===================================================================

-- Organizations with event sourcing
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    organization_type VARCHAR(50) NOT NULL DEFAULT 'healthcare', -- healthcare, pharma, biotech, academic
    compliance_level VARCHAR(50) NOT NULL DEFAULT 'hipaa', -- hipaa, fda, gdpr, sox
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'professional', -- starter, professional, enterprise, custom
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- User management with multi-tenant isolation
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, user, viewer, analyst
    permissions JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, pending
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    INDEX (organization_id),
    INDEX (email),
    INDEX (account_status)
);

-- ===================================================================
-- 2. EVENT SOURCING & CQRS FOUNDATION
-- ===================================================================

-- Event store for complete audit trail
CREATE TABLE event_store (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    correlation_id UUID,
    causation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (aggregate_id),
    INDEX (aggregate_type),
    INDEX (event_type),
    INDEX (created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for event store
CREATE TABLE event_store_2025_01 PARTITION OF event_store
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE event_store_2025_02 PARTITION OF event_store
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE event_store_2025_03 PARTITION OF event_store
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Event snapshots for performance optimization
CREATE TABLE event_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    snapshot_data JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (aggregate_id, aggregate_type),
    INDEX (organization_id),
    INDEX (aggregate_type)
);

-- ===================================================================
-- 3. ADVANCED VECTOR STORAGE & RAG FOUNDATION
-- ===================================================================

-- Document collections with hierarchical organization
CREATE TABLE document_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    collection_type VARCHAR(50) NOT NULL, -- clinical, regulatory, research, training
    parent_id UUID REFERENCES document_collections(id),
    path LTREE,
    access_level VARCHAR(20) DEFAULT 'private', -- public, private, restricted
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (collection_type),
    INDEX USING GIST (path),
    INDEX (parent_id)
);

-- Enhanced document storage with versioning
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    collection_id UUID REFERENCES document_collections(id),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'text/plain',
    source_url TEXT,
    source_type VARCHAR(50), -- upload, web, api, integration
    file_path TEXT,
    file_size BIGINT,
    checksum VARCHAR(64),
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    extraction_metadata JSONB DEFAULT '{}',
    content_hash VARCHAR(64),
    version INTEGER DEFAULT 1,
    parent_version_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (collection_id),
    INDEX (processing_status),
    INDEX (content_hash),
    INDEX (created_at)
) PARTITION BY HASH (organization_id);

-- Create hash partitions for documents
CREATE TABLE documents_part_0 PARTITION OF documents FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE documents_part_1 PARTITION OF documents FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE documents_part_2 PARTITION OF documents FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE documents_part_3 PARTITION OF documents FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- High-performance embeddings with multiple vector strategies
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    document_id UUID NOT NULL REFERENCES documents(id),
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_tokens INTEGER,
    embedding_model VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-large',
    embedding_vector vector(3072), -- OpenAI text-embedding-3-large
    sparse_embedding JSONB, -- For hybrid search
    chunk_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (document_id),
    INDEX (chunk_index)
) PARTITION BY HASH (organization_id);

-- Create hash partitions for embeddings
CREATE TABLE embeddings_part_0 PARTITION OF embeddings FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE embeddings_part_1 PARTITION OF embeddings FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE embeddings_part_2 PARTITION OF embeddings FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE embeddings_part_3 PARTITION OF embeddings FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Optimized vector indexes for each partition
CREATE INDEX CONCURRENTLY embeddings_part_0_vector_cosine_idx ON embeddings_part_0 USING hnsw (embedding_vector vector_cosine_ops);
CREATE INDEX CONCURRENTLY embeddings_part_1_vector_cosine_idx ON embeddings_part_1 USING hnsw (embedding_vector vector_cosine_ops);
CREATE INDEX CONCURRENTLY embeddings_part_2_vector_cosine_idx ON embeddings_part_2 USING hnsw (embedding_vector vector_cosine_ops);
CREATE INDEX CONCURRENTLY embeddings_part_3_vector_cosine_idx ON embeddings_part_3 USING hnsw (embedding_vector vector_cosine_ops);

-- ===================================================================
-- 4. REAL-TIME PROCESSING & CACHING
-- ===================================================================

-- Query cache for performance optimization
CREATE TABLE query_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    query_hash VARCHAR(64) NOT NULL,
    query_text TEXT NOT NULL,
    query_metadata JSONB DEFAULT '{}',
    result_data JSONB NOT NULL,
    embedding_vector vector(3072),
    hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (organization_id, query_hash),
    INDEX (organization_id),
    INDEX (query_hash),
    INDEX (expires_at),
    INDEX (last_accessed_at)
);

-- Session management for real-time features
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    socket_id VARCHAR(255),
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (session_token),
    INDEX (expires_at),
    INDEX (last_activity_at)
);

-- ===================================================================
-- 5. ANALYTICS & MONITORING FOUNDATION
-- ===================================================================

-- Usage analytics with time-series optimization
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    metrics JSONB NOT NULL DEFAULT '{}',
    dimensions JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (event_type),
    INDEX (resource_type),
    INDEX (timestamp),
    INDEX (processed)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for analytics
CREATE TABLE usage_analytics_2025_01 PARTITION OF usage_analytics
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE usage_analytics_2025_02 PARTITION OF usage_analytics
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- System performance monitoring
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20),
    metric_tags JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    INDEX (metric_name),
    INDEX (organization_id),
    INDEX (timestamp)
) PARTITION BY RANGE (timestamp);

-- Create daily partitions for system metrics
CREATE TABLE system_metrics_2025_09_24 PARTITION OF system_metrics
    FOR VALUES FROM ('2025-09-24') TO ('2025-09-25');
CREATE TABLE system_metrics_2025_09_25 PARTITION OF system_metrics
    FOR VALUES FROM ('2025-09-25') TO ('2025-09-26');

-- ===================================================================
-- 6. SECURITY & COMPLIANCE
-- ===================================================================

-- Audit trail with immutable logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    severity VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
    compliance_flags JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (action),
    INDEX (resource_type),
    INDEX (created_at),
    INDEX (severity)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit logs
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- API keys and access control
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    rate_window INTEGER DEFAULT 3600, -- seconds
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (key_hash),
    INDEX (expires_at),
    INDEX (is_active)
);

-- ===================================================================
-- 7. FUNCTIONS & TRIGGERS
-- ===================================================================

-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_collections_updated_at BEFORE UPDATE ON document_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger function
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, new_values)
        VALUES (NEW.organization_id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (NEW.organization_id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (organization_id, action, resource_type, resource_id, old_values)
        VALUES (OLD.organization_id, TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Query cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM query_cache WHERE expires_at < NOW();
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION similarity_search(
    org_id UUID,
    query_embedding vector(3072),
    similarity_threshold FLOAT DEFAULT 0.8,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    document_id UUID,
    content TEXT,
    similarity FLOAT,
    chunk_index INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.document_id,
        e.content,
        (1 - (e.embedding_vector <=> query_embedding)) as similarity,
        e.chunk_index
    FROM embeddings e
    WHERE e.organization_id = org_id
      AND (1 - (e.embedding_vector <=> query_embedding)) > similarity_threshold
    ORDER BY e.embedding_vector <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 8. INITIAL INDEXES & CONSTRAINTS
-- ===================================================================

-- Performance indexes
CREATE INDEX CONCURRENTLY organizations_subscription_tier_idx ON organizations(subscription_tier);
CREATE INDEX CONCURRENTLY users_organization_role_idx ON users(organization_id, role);
CREATE INDEX CONCURRENTLY documents_processing_status_idx ON documents(processing_status) WHERE processing_status != 'completed';
CREATE INDEX CONCURRENTLY query_cache_hit_count_idx ON query_cache(hit_count DESC);

-- Text search indexes
CREATE INDEX CONCURRENTLY documents_title_search_idx ON documents USING GIN (to_tsvector('english', title));
CREATE INDEX CONCURRENTLY documents_content_search_idx ON documents USING GIN (to_tsvector('english', content));
CREATE INDEX CONCURRENTLY embeddings_content_search_idx ON embeddings USING GIN (to_tsvector('english', content));

-- JSONB indexes for metadata queries
CREATE INDEX CONCURRENTLY organizations_metadata_idx ON organizations USING GIN (metadata);
CREATE INDEX CONCURRENTLY users_preferences_idx ON users USING GIN (preferences);
CREATE INDEX CONCURRENTLY documents_extraction_metadata_idx ON documents USING GIN (extraction_metadata);
CREATE INDEX CONCURRENTLY embeddings_chunk_metadata_idx ON embeddings USING GIN (chunk_metadata);

-- ===================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all main tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced with roles)
CREATE POLICY users_isolation ON users FOR ALL TO authenticated USING (organization_id = current_setting('app.current_organization_id')::UUID);
CREATE POLICY documents_isolation ON documents FOR ALL TO authenticated USING (organization_id = current_setting('app.current_organization_id')::UUID);
CREATE POLICY embeddings_isolation ON embeddings FOR ALL TO authenticated USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- ===================================================================
-- 10. INITIAL DATA & CONFIGURATION
-- ===================================================================

-- Create default organization for development
INSERT INTO organizations (name, slug, domain, organization_type, compliance_level, subscription_tier, settings)
VALUES (
    'VITAL Path Demo',
    'vital-demo',
    'demo.vitalpath.ai',
    'healthcare',
    'hipaa',
    'enterprise',
    '{
        "features": {
            "advanced_rag": true,
            "clinical_validation": true,
            "fhir_integration": true,
            "real_time_processing": true,
            "enterprise_security": true
        },
        "limits": {
            "documents": 100000,
            "users": 1000,
            "api_calls_per_month": 1000000,
            "storage_gb": 1000
        }
    }'::jsonb
);

-- Performance optimization settings
SET maintenance_work_mem = '1GB';
SET max_parallel_workers_per_gather = 4;
SET effective_cache_size = '8GB';
SET random_page_cost = 1.1;

-- Create scheduled job for cache cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Phase 1: Enterprise Database Schema Migration Complete';
    RAISE NOTICE 'Features: Event Sourcing, CQRS, Advanced Vector Storage, Real-time Processing';
    RAISE NOTICE 'Performance: Partitioning, Optimized Indexes, Query Caching, RLS';
    RAISE NOTICE 'Security: Audit Logging, API Keys, Multi-tenant Isolation';
END $$;