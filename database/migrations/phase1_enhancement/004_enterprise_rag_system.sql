-- ===================================================================
-- VITAL Path Platform - Enhanced Phase 1: Enterprise RAG Base System
-- Migration: 004_enterprise_rag_system.sql
-- Version: 1.0.0
-- Created: 2025-09-24
-- ===================================================================

-- ===================================================================
-- 1. ADVANCED VECTOR SEARCH & RETRIEVAL ENGINE
-- ===================================================================

-- Vector Index Configurations for Different Use Cases
CREATE TABLE vector_index_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    config_name VARCHAR(255) NOT NULL,
    config_description TEXT,
    use_case VARCHAR(100) NOT NULL, -- clinical_search, regulatory_compliance, research_insights
    embedding_model VARCHAR(100) NOT NULL, -- text-embedding-3-large, text-embedding-3-small
    vector_dimensions INTEGER NOT NULL,
    distance_metric VARCHAR(30) DEFAULT 'cosine', -- cosine, euclidean, dot_product
    index_parameters JSONB DEFAULT '{}', -- HNSW parameters: m, ef_construction, ef
    chunk_strategy JSONB DEFAULT '{}', -- Chunking configuration
    overlap_strategy JSONB DEFAULT '{}', -- Chunk overlap settings
    preprocessing_pipeline JSONB DEFAULT '[]', -- Text preprocessing steps
    performance_targets JSONB DEFAULT '{}', -- Latency, accuracy targets
    quality_metrics JSONB DEFAULT '{}', -- Current performance metrics
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (use_case),
    INDEX (embedding_model),
    INDEX (is_active),
    UNIQUE (organization_id, config_name)
);

-- Advanced Vector Collections with Metadata Filtering
CREATE TABLE vector_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    collection_name VARCHAR(255) NOT NULL,
    collection_description TEXT,
    collection_type VARCHAR(100) NOT NULL, -- clinical_knowledge, regulatory_docs, research_papers
    index_config_id UUID NOT NULL REFERENCES vector_index_configs(id),
    access_control JSONB DEFAULT '{}', -- Role-based access control
    data_classification VARCHAR(50) DEFAULT 'internal', -- public, internal, confidential, restricted
    retention_policy JSONB DEFAULT '{}', -- Data retention rules
    quality_standards JSONB DEFAULT '{}', -- Content quality requirements
    update_frequency VARCHAR(30) DEFAULT 'daily', -- real_time, hourly, daily, weekly
    synchronization_config JSONB DEFAULT '{}', -- Sync with external sources
    monitoring_config JSONB DEFAULT '{}', -- Performance monitoring
    total_vectors INTEGER DEFAULT 0,
    last_indexed_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (collection_type),
    INDEX (index_config_id),
    INDEX (data_classification),
    UNIQUE (organization_id, collection_name)
);

-- High-Performance Vector Storage with Rich Metadata
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    collection_id UUID NOT NULL REFERENCES vector_collections(id),
    document_id UUID REFERENCES documents(id),
    chunk_id VARCHAR(100) NOT NULL, -- Unique chunk identifier
    content_text TEXT NOT NULL,
    content_tokens INTEGER,
    embedding_vector vector(3072) NOT NULL, -- Configurable dimension
    sparse_vector JSONB, -- For hybrid search capabilities
    content_hash VARCHAR(64) NOT NULL, -- For deduplication
    chunk_metadata JSONB DEFAULT '{}', -- Rich metadata for filtering
    content_type VARCHAR(50), -- paragraph, table, list, code, formula
    semantic_tags JSONB DEFAULT '[]', -- AI-generated semantic tags
    entity_mentions JSONB DEFAULT '[]', -- Named entities in chunk
    clinical_concepts JSONB DEFAULT '[]', -- Medical concept references
    quality_score NUMERIC(3,2) DEFAULT 0.80, -- Content quality assessment
    relevance_score NUMERIC(3,2), -- Domain relevance score
    freshness_score NUMERIC(3,2), -- Content freshness indicator
    authority_score NUMERIC(3,2), -- Source authority score
    usage_statistics JSONB DEFAULT '{}', -- Retrieval statistics
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (collection_id),
    INDEX (document_id),
    INDEX (chunk_id),
    INDEX (content_hash),
    INDEX (quality_score),
    INDEX USING GIN (chunk_metadata),
    INDEX USING GIN (semantic_tags),
    INDEX USING GIN (clinical_concepts),
    UNIQUE (collection_id, chunk_id)
) PARTITION BY HASH (collection_id);

-- Create partitions for vector embeddings
CREATE TABLE vector_embeddings_part_0 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE vector_embeddings_part_1 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE TABLE vector_embeddings_part_2 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 2);
CREATE TABLE vector_embeddings_part_3 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 3);
CREATE TABLE vector_embeddings_part_4 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 4);
CREATE TABLE vector_embeddings_part_5 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 5);
CREATE TABLE vector_embeddings_part_6 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 6);
CREATE TABLE vector_embeddings_part_7 PARTITION OF vector_embeddings FOR VALUES WITH (MODULUS 8, REMAINDER 7);

-- Optimized vector indexes for each partition
CREATE INDEX CONCURRENTLY vector_embeddings_part_0_vector_idx ON vector_embeddings_part_0 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_1_vector_idx ON vector_embeddings_part_1 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_2_vector_idx ON vector_embeddings_part_2 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_3_vector_idx ON vector_embeddings_part_3 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_4_vector_idx ON vector_embeddings_part_4 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_5_vector_idx ON vector_embeddings_part_5 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_6_vector_idx ON vector_embeddings_part_6 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX CONCURRENTLY vector_embeddings_part_7_vector_idx ON vector_embeddings_part_7 USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- ===================================================================
-- 2. INTELLIGENT QUERY PROCESSING & ROUTING
-- ===================================================================

-- Query Intent Classification & Routing
CREATE TABLE query_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intent_name VARCHAR(255) UNIQUE NOT NULL,
    intent_description TEXT,
    intent_category VARCHAR(100) NOT NULL, -- clinical_query, regulatory_question, research_insight
    pattern_signatures JSONB NOT NULL DEFAULT '[]', -- Query patterns for classification
    routing_strategy JSONB NOT NULL DEFAULT '{}', -- How to route this intent
    required_context JSONB DEFAULT '[]', -- Context requirements
    expected_response_type VARCHAR(100), -- factual, analytical, procedural, creative
    complexity_level VARCHAR(30) DEFAULT 'medium', -- simple, medium, complex, expert
    domain_expertise JSONB DEFAULT '[]', -- Required domain knowledge
    quality_thresholds JSONB DEFAULT '{}', -- Response quality requirements
    personalization_factors JSONB DEFAULT '[]', -- User-specific factors
    performance_targets JSONB DEFAULT '{}', -- Latency, accuracy targets
    success_metrics JSONB DEFAULT '{}', -- Current performance metrics
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (intent_category),
    INDEX (complexity_level),
    INDEX (is_active),
    INDEX USING GIN (domain_expertise)
);

-- Query Processing Pipeline
CREATE TABLE query_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    query_text TEXT NOT NULL,
    query_intent_id UUID REFERENCES query_intents(id),
    query_context JSONB DEFAULT '{}', -- User context, conversation history
    processing_pipeline JSONB DEFAULT '[]', -- Processing steps executed
    routing_decisions JSONB DEFAULT '{}', -- Routing logic applied
    retrieval_strategy JSONB DEFAULT '{}', -- Vector search configuration used
    collections_searched JSONB DEFAULT '[]', -- Collections queried
    filter_criteria JSONB DEFAULT '{}', -- Applied filters
    reranking_strategy JSONB DEFAULT '{}', -- Result reranking approach
    response_synthesis JSONB DEFAULT '{}', -- Response generation method
    quality_checks JSONB DEFAULT '[]', -- Quality validation steps
    performance_metrics JSONB DEFAULT '{}', -- Timing, resource usage
    user_feedback JSONB DEFAULT '{}', -- User satisfaction, corrections
    session_state VARCHAR(30) DEFAULT 'active', -- active, completed, abandoned, error
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (session_token),
    INDEX (query_intent_id),
    INDEX (session_state),
    INDEX (started_at)
) PARTITION BY RANGE (started_at);

-- Create partitions for query sessions
CREATE TABLE query_sessions_2025_09 PARTITION OF query_sessions FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE query_sessions_2025_10 PARTITION OF query_sessions FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- ===================================================================
-- 3. ADVANCED CACHING & PERFORMANCE OPTIMIZATION
-- ===================================================================

-- Multi-Level Query Result Cache
CREATE TABLE rag_query_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    cache_key VARCHAR(255) UNIQUE NOT NULL, -- Deterministic query hash
    cache_level VARCHAR(30) NOT NULL, -- L1_memory, L2_local, L3_distributed
    query_fingerprint VARCHAR(64) NOT NULL, -- Query semantic fingerprint
    query_embedding vector(3072), -- Query embedding for similarity
    cached_results JSONB NOT NULL, -- Cached response data
    result_metadata JSONB DEFAULT '{}', -- Cache metadata
    source_collections JSONB DEFAULT '[]', -- Source collections referenced
    cache_score NUMERIC(3,2) DEFAULT 1.00, -- Cache confidence score
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    staleness_score NUMERIC(3,2) DEFAULT 0.00, -- How stale is the cache
    validation_checksum VARCHAR(64), -- Data integrity check
    compression_algorithm VARCHAR(30), -- Compression used
    cache_size_bytes INTEGER,
    access_pattern JSONB DEFAULT '{}', -- Usage patterns for optimization
    geographic_scope JSONB DEFAULT '{}', -- Geographic cache distribution
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_hit_at TIMESTAMPTZ,
    last_validated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    INDEX (organization_id),
    INDEX (cache_key),
    INDEX (cache_level),
    INDEX (query_fingerprint),
    INDEX (hit_count DESC),
    INDEX (expires_at),
    INDEX (last_hit_at),
    INDEX USING HNSW (query_embedding vector_cosine_ops)
) PARTITION BY HASH (organization_id);

-- Create cache partitions
CREATE TABLE rag_query_cache_part_0 PARTITION OF rag_query_cache FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE rag_query_cache_part_1 PARTITION OF rag_query_cache FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE rag_query_cache_part_2 PARTITION OF rag_query_cache FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE rag_query_cache_part_3 PARTITION OF rag_query_cache FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Precomputed Query Clusters for Cache Optimization
CREATE TABLE query_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    cluster_name VARCHAR(255) NOT NULL,
    cluster_description TEXT,
    centroid_embedding vector(3072) NOT NULL, -- Cluster centroid
    cluster_queries JSONB DEFAULT '[]', -- Representative queries
    cluster_size INTEGER DEFAULT 0,
    cluster_cohesion NUMERIC(3,2), -- Cluster tightness measure
    domain_focus JSONB DEFAULT '[]', -- Domain specialization
    user_segments JSONB DEFAULT '[]', -- User types in cluster
    cache_hit_rate NUMERIC(3,2) DEFAULT 0.00,
    average_response_time NUMERIC(8,2), -- Milliseconds
    optimization_priority INTEGER DEFAULT 100,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (cluster_size),
    INDEX (cache_hit_rate),
    INDEX (optimization_priority),
    INDEX USING HNSW (centroid_embedding vector_cosine_ops),
    UNIQUE (organization_id, cluster_name)
);

-- ===================================================================
-- 4. RAG PERFORMANCE MONITORING & ANALYTICS
-- ===================================================================

-- Comprehensive RAG Performance Metrics
CREATE TABLE rag_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- latency, accuracy, relevance, user_satisfaction
    metric_subcategory VARCHAR(100), -- vector_search, reranking, synthesis, caching
    measurement_value NUMERIC NOT NULL,
    measurement_unit VARCHAR(30), -- milliseconds, percentage, ratio
    measurement_context JSONB DEFAULT '{}', -- Context metadata
    benchmark_value NUMERIC, -- Target or baseline value
    deviation_from_benchmark NUMERIC, -- Performance delta
    confidence_interval JSONB, -- Statistical confidence bounds
    sample_size INTEGER,
    measurement_method VARCHAR(100), -- How metric was calculated
    data_sources JSONB DEFAULT '[]', -- Source systems/collections
    user_segment JSONB DEFAULT '{}', -- User demographics/role
    query_complexity VARCHAR(30), -- simple, medium, complex
    domain_context JSONB DEFAULT '{}', -- Clinical domain, use case
    geographic_region VARCHAR(100), -- Performance by region
    time_window INTERVAL, -- Measurement window
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_alerting_enabled BOOLEAN DEFAULT FALSE,
    alert_thresholds JSONB DEFAULT '{}',
    INDEX (organization_id),
    INDEX (metric_name),
    INDEX (metric_category),
    INDEX (timestamp),
    INDEX (query_complexity),
    INDEX USING GIN (domain_context),
    INDEX (is_alerting_enabled) WHERE is_alerting_enabled = TRUE
) PARTITION BY RANGE (timestamp);

-- Create performance metrics partitions
CREATE TABLE rag_performance_metrics_2025_09_24 PARTITION OF rag_performance_metrics
    FOR VALUES FROM ('2025-09-24') TO ('2025-09-25');
CREATE TABLE rag_performance_metrics_2025_09_25 PARTITION OF rag_performance_metrics
    FOR VALUES FROM ('2025-09-25') TO ('2025-09-26');

-- RAG System Health Dashboard
CREATE TABLE rag_system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    component_name VARCHAR(100) NOT NULL, -- vector_search, cache, indexing, synthesis
    health_status VARCHAR(30) NOT NULL, -- healthy, warning, critical, maintenance
    health_score NUMERIC(3,2) NOT NULL, -- 0.00-1.00 health score
    performance_indicators JSONB NOT NULL DEFAULT '{}', -- Key performance metrics
    resource_utilization JSONB DEFAULT '{}', -- CPU, memory, storage usage
    error_metrics JSONB DEFAULT '{}', -- Error rates, types
    capacity_metrics JSONB DEFAULT '{}', -- Current vs. maximum capacity
    dependency_status JSONB DEFAULT '{}', -- External dependencies health
    recent_incidents JSONB DEFAULT '[]', -- Recent issues and resolutions
    maintenance_schedule JSONB DEFAULT '{}', -- Planned maintenance windows
    sla_compliance JSONB DEFAULT '{}', -- SLA adherence metrics
    improvement_recommendations JSONB DEFAULT '[]', -- System optimization suggestions
    last_health_check TIMESTAMPTZ DEFAULT NOW(),
    next_scheduled_check TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (component_name),
    INDEX (health_status),
    INDEX (health_score),
    INDEX (last_health_check),
    UNIQUE (organization_id, component_name)
);

-- ===================================================================
-- 5. ENTERPRISE RAG FUNCTIONS
-- ===================================================================

-- Advanced Hybrid Search Function
CREATE OR REPLACE FUNCTION enterprise_hybrid_search(
    org_id UUID,
    query_embedding vector(3072),
    query_text TEXT,
    collection_filters UUID[] DEFAULT NULL,
    metadata_filters JSONB DEFAULT '{}',
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 20,
    use_reranking BOOLEAN DEFAULT TRUE,
    include_sparse BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    embedding_id UUID,
    content TEXT,
    similarity_score FLOAT,
    metadata JSONB,
    quality_score NUMERIC,
    source_authority NUMERIC,
    content_freshness NUMERIC
) AS $$
DECLARE
    search_collections UUID[];
    filter_sql TEXT := '';
    sparse_weight FLOAT := 0.3;
    dense_weight FLOAT := 0.7;
BEGIN
    -- Determine collections to search
    IF collection_filters IS NOT NULL THEN
        search_collections := collection_filters;
    ELSE
        SELECT array_agg(id) INTO search_collections
        FROM vector_collections vc
        WHERE vc.organization_id = org_id
          AND vc.data_classification IN ('public', 'internal');
    END IF;

    -- Build metadata filter SQL
    IF metadata_filters != '{}'::jsonb THEN
        filter_sql := ' AND ve.chunk_metadata @> $4';
    END IF;

    -- Execute hybrid search query
    RETURN QUERY EXECUTE format('
        SELECT
            ve.id,
            ve.content_text,
            CASE
                WHEN $7 = TRUE AND ve.sparse_vector IS NOT NULL THEN
                    ((%s * (1 - (ve.embedding_vector <=> $1))) +
                     (%s * calculate_sparse_similarity(ve.sparse_vector, $8)))
                ELSE
                    (1 - (ve.embedding_vector <=> $1))
            END as similarity_score,
            ve.chunk_metadata,
            ve.quality_score,
            ve.authority_score,
            ve.freshness_score
        FROM vector_embeddings ve
        WHERE ve.organization_id = $2
          AND ve.collection_id = ANY($3)
          AND (1 - (ve.embedding_vector <=> $1)) > $5
          %s
        ORDER BY similarity_score DESC
        LIMIT $6',
        dense_weight,
        sparse_weight,
        filter_sql
    )
    USING query_embedding, org_id, search_collections, metadata_filters, similarity_threshold, max_results, include_sparse, query_text;
END;
$$ LANGUAGE plpgsql;

-- Cache Management Function
CREATE OR REPLACE FUNCTION manage_rag_cache(
    org_id UUID,
    operation VARCHAR DEFAULT 'cleanup'
)
RETURNS JSONB AS $$
DECLARE
    cache_stats JSONB;
    cleanup_count INTEGER;
    optimization_recommendations JSONB;
BEGIN
    -- Cache cleanup
    IF operation = 'cleanup' THEN
        DELETE FROM rag_query_cache
        WHERE organization_id = org_id
          AND (expires_at < NOW() OR staleness_score > 0.8);

        GET DIAGNOSTICS cleanup_count = ROW_COUNT;

        cache_stats := jsonb_build_object(
            'operation', 'cleanup',
            'cleaned_entries', cleanup_count,
            'timestamp', NOW()
        );

    -- Cache optimization
    ELSIF operation = 'optimize' THEN
        -- Update cache scores based on usage patterns
        UPDATE rag_query_cache rqc
        SET cache_score = CASE
            WHEN hit_count > 10 AND last_hit_at > NOW() - INTERVAL '24 hours' THEN 1.0
            WHEN hit_count > 5 AND last_hit_at > NOW() - INTERVAL '7 days' THEN 0.8
            WHEN hit_count > 0 AND last_hit_at > NOW() - INTERVAL '30 days' THEN 0.6
            ELSE 0.3
        END
        WHERE organization_id = org_id;

        cache_stats := jsonb_build_object(
            'operation', 'optimize',
            'optimized_at', NOW()
        );
    END IF;

    -- Generate performance statistics
    SELECT jsonb_build_object(
        'total_cache_entries', COUNT(*),
        'cache_hit_rate', AVG(CASE WHEN hit_count > 0 THEN hit_count::float / GREATEST(hit_count + miss_count, 1) ELSE 0 END),
        'average_cache_score', AVG(cache_score),
        'expired_entries', COUNT(*) FILTER (WHERE expires_at < NOW()),
        'high_performance_entries', COUNT(*) FILTER (WHERE cache_score > 0.8)
    ) INTO cache_stats
    FROM rag_query_cache
    WHERE organization_id = org_id;

    RETURN cache_stats || jsonb_build_object('operation_result', cache_stats);
END;
$$ LANGUAGE plpgsql;

-- Vector Index Optimization Function
CREATE OR REPLACE FUNCTION optimize_vector_indexes(
    org_id UUID,
    collection_id_param UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    optimization_results JSONB := '{}';
    collection_record RECORD;
    index_stats JSONB;
BEGIN
    -- Loop through collections to optimize
    FOR collection_record IN
        SELECT * FROM vector_collections vc
        WHERE vc.organization_id = org_id
          AND (collection_id_param IS NULL OR vc.id = collection_id_param)
          AND vc.total_vectors > 1000 -- Only optimize substantial collections
    LOOP
        -- Update collection statistics
        UPDATE vector_collections
        SET
            total_vectors = (
                SELECT COUNT(*)
                FROM vector_embeddings ve
                WHERE ve.collection_id = collection_record.id
            ),
            last_indexed_at = NOW()
        WHERE id = collection_record.id;

        -- Gather index performance statistics
        SELECT jsonb_build_object(
            'collection_id', collection_record.id,
            'collection_name', collection_record.collection_name,
            'total_vectors', (SELECT COUNT(*) FROM vector_embeddings WHERE collection_id = collection_record.id),
            'average_quality_score', (SELECT AVG(quality_score) FROM vector_embeddings WHERE collection_id = collection_record.id),
            'last_optimized', NOW()
        ) INTO index_stats;

        optimization_results := optimization_results || jsonb_build_object(collection_record.collection_name, index_stats);
    END LOOP;

    RETURN optimization_results;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 6. INITIAL ENTERPRISE RAG CONFIGURATION
-- ===================================================================

-- Default Vector Index Configurations
INSERT INTO vector_index_configs (
    organization_id, config_name, config_description, use_case, embedding_model,
    vector_dimensions, index_parameters, chunk_strategy, performance_targets
)
SELECT
    o.id,
    'Clinical Knowledge Search',
    'Optimized for clinical knowledge retrieval with high accuracy requirements',
    'clinical_search',
    'text-embedding-3-large',
    3072,
    '{"m": 16, "ef_construction": 64, "ef": 40}'::jsonb,
    '{"max_tokens": 512, "overlap_tokens": 50, "strategy": "semantic_chunking"}'::jsonb,
    '{"max_latency_ms": 200, "min_accuracy": 0.85, "target_recall": 0.90}'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO vector_index_configs (
    organization_id, config_name, config_description, use_case, embedding_model,
    vector_dimensions, index_parameters, chunk_strategy, performance_targets
)
SELECT
    o.id,
    'Regulatory Compliance Search',
    'Optimized for regulatory document search with comprehensive coverage',
    'regulatory_compliance',
    'text-embedding-3-large',
    3072,
    '{"m": 32, "ef_construction": 128, "ef": 64}'::jsonb,
    '{"max_tokens": 1024, "overlap_tokens": 100, "strategy": "hierarchical_chunking"}'::jsonb,
    '{"max_latency_ms": 500, "min_accuracy": 0.95, "target_recall": 0.95}'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

-- Default Query Intent Classifications
INSERT INTO query_intents (intent_name, intent_description, intent_category, pattern_signatures, routing_strategy, expected_response_type)
VALUES
    ('Clinical Evidence Inquiry',
     'Queries seeking clinical evidence, research findings, or treatment guidelines',
     'clinical_query',
     '[{"keywords": ["clinical", "evidence", "treatment", "guideline", "efficacy", "safety"], "patterns": ["what is the evidence for", "clinical studies on", "treatment guidelines for"]}]'::jsonb,
     '{"primary_collections": ["clinical_knowledge"], "secondary_collections": ["research_papers"], "reranking": "clinical_relevance"}'::jsonb,
     'factual'),

    ('Regulatory Compliance Question',
     'Questions about regulatory requirements, FDA guidance, or compliance standards',
     'regulatory_question',
     '[{"keywords": ["FDA", "regulatory", "compliance", "approval", "submission", "guidance"], "patterns": ["FDA requirements for", "regulatory pathway", "compliance with"]}]'::jsonb,
     '{"primary_collections": ["regulatory_docs"], "filters": {"content_type": "guidance"}, "reranking": "regulatory_authority"}'::jsonb,
     'procedural'),

    ('Digital Health Implementation',
     'Queries about implementing digital health solutions, technical requirements, or best practices',
     'research_insight',
     '[{"keywords": ["implementation", "digital health", "technical", "integration", "deployment"], "patterns": ["how to implement", "best practices for", "technical requirements"]}]'::jsonb,
     '{"primary_collections": ["implementation_guides"], "secondary_collections": ["technical_standards"], "reranking": "practical_applicability"}'::jsonb,
     'analytical');

-- Default Vector Collections
INSERT INTO vector_collections (
    organization_id, collection_name, collection_description, collection_type, index_config_id,
    data_classification, quality_standards
)
SELECT
    o.id,
    'Clinical Evidence Library',
    'Curated clinical evidence, research findings, and treatment guidelines for digital health interventions',
    'clinical_knowledge',
    vic.id,
    'internal',
    '{"min_evidence_level": "systematic_review", "peer_reviewed": true, "clinical_validation": true}'::jsonb
FROM organizations o
CROSS JOIN vector_index_configs vic
WHERE o.slug = 'vital-demo' AND vic.config_name = 'Clinical Knowledge Search';

INSERT INTO vector_collections (
    organization_id, collection_name, collection_description, collection_type, index_config_id,
    data_classification, quality_standards
)
SELECT
    o.id,
    'Regulatory Guidance Repository',
    'FDA guidance documents, regulatory standards, and compliance requirements for digital therapeutics',
    'regulatory_docs',
    vic.id,
    'internal',
    '{"official_source": true, "current_version": true, "regulatory_authority": "FDA"}'::jsonb
FROM organizations o
CROSS JOIN vector_index_configs vic
WHERE o.slug = 'vital-demo' AND vic.config_name = 'Regulatory Compliance Search';

-- Initialize System Health Monitoring
INSERT INTO rag_system_health (
    organization_id, component_name, health_status, health_score, performance_indicators
)
SELECT
    o.id,
    component,
    'healthy',
    0.95,
    '{"uptime": 99.9, "response_time_ms": 150, "error_rate": 0.01}'::jsonb
FROM organizations o
CROSS JOIN (VALUES
    ('vector_search'),
    ('cache'),
    ('indexing'),
    ('synthesis')
) AS components(component)
WHERE o.slug = 'vital-demo';

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Enterprise RAG Base System Migration Complete';
    RAISE NOTICE 'Features: Advanced Vector Search, Multi-Level Caching, Performance Monitoring';
    RAISE NOTICE 'Optimizations: Partitioned Vector Storage, Query Clustering, Intelligent Routing';
    RAISE NOTICE 'Analytics: Comprehensive Performance Metrics, System Health Dashboard';
END $$;