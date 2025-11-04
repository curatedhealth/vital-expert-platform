-- ============================================================================
-- Performance Optimization for Hybrid GraphRAG Agent Search
--
-- SQL optimizations for:
-- - Index tuning
-- - Query plan analysis
-- - Vacuum and analyze
-- - Connection pooling
-- - Performance monitoring views
--
-- Created: 2025-10-24
-- Phase: 3 Week 5 - Testing & Optimization
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ANALYZE DATABASE STATISTICS
-- ----------------------------------------------------------------------------

-- Update statistics for query planner
ANALYZE agents;
ANALYZE agent_embeddings;
ANALYZE agent_collaborations;
ANALYZE agent_escalations;
ANALYZE agent_domain_relationships;
ANALYZE agent_capability_relationships;

-- ----------------------------------------------------------------------------
-- 2. INDEX OPTIMIZATION
-- ----------------------------------------------------------------------------

-- Check existing indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename LIKE 'agent%'
ORDER BY tablename, indexname;

-- HNSW index statistics
SELECT
    indexrelname AS index_name,
    idx_scan AS times_used,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE indexrelname LIKE '%agent%'
ORDER BY idx_scan DESC;

-- Create additional performance indexes if needed

-- Index on agent tier for filtering
CREATE INDEX IF NOT EXISTS idx_agents_tier
ON agents ((metadata->>'tier'))
WHERE status = 'active';

-- Index on agent domains for filtering
CREATE INDEX IF NOT EXISTS idx_agents_domains_gin
ON agents USING gin ((metadata->'domains'))
WHERE status = 'active';

-- Index on agent capabilities for filtering
CREATE INDEX IF NOT EXISTS idx_agents_capabilities_gin
ON agents USING gin ((metadata->'capabilities'))
WHERE status = 'active';

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_agents_status_tier
ON agents (status, (metadata->>'tier'))
WHERE status = 'active';

-- Index on embedding type for efficient lookups
CREATE INDEX IF NOT EXISTS idx_agent_embeddings_type
ON agent_embeddings (agent_id, embedding_type);

-- Index on escalation relationships for graph queries
CREATE INDEX IF NOT EXISTS idx_escalations_from_to
ON agent_escalations (from_agent_id, to_agent_id, priority DESC);

CREATE INDEX IF NOT EXISTS idx_escalations_success_rate
ON agent_escalations (success_rate DESC)
WHERE success_rate >= 0.7;

-- Index on collaborations for graph queries
CREATE INDEX IF NOT EXISTS idx_collaborations_agents
ON agent_collaborations (agent1_id, agent2_id, collaboration_count DESC);

-- Index on domain relationships
CREATE INDEX IF NOT EXISTS idx_domain_relationships
ON agent_domain_relationships (from_agent_id, to_agent_id, similarity_score DESC);

-- ----------------------------------------------------------------------------
-- 3. QUERY PLAN ANALYSIS
-- ----------------------------------------------------------------------------

-- Create function to analyze hybrid search query plan
CREATE OR REPLACE FUNCTION analyze_hybrid_search_performance(
    query_embedding vector(1536),
    p_tier INTEGER DEFAULT NULL,
    p_domains TEXT[] DEFAULT NULL,
    p_max_results INTEGER DEFAULT 10
) RETURNS TABLE (
    query_plan TEXT
) AS $$
BEGIN
    RETURN QUERY
    EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
    SELECT
        a.id AS agent_id,
        a.name,
        a.display_name,
        COALESCE((a.metadata->>'tier')::INTEGER, 2) AS tier,

        -- Vector similarity score (60% weight)
        (1 - (ae.embedding <=> query_embedding)) * 0.60 AS vector_score,

        -- Domain proficiency score (25% weight)
        CASE
            WHEN p_domains IS NOT NULL THEN
                (
                    SELECT COUNT(*)::FLOAT / GREATEST(array_length(p_domains, 1), 1)
                    FROM unnest(p_domains) AS domain
                    WHERE domain = ANY(
                        SELECT jsonb_array_elements_text(a.metadata->'domains')
                    )
                ) * 0.25
            ELSE 0.25
        END AS domain_score,

        -- Overall score
        (1 - (ae.embedding <=> query_embedding)) * 0.60 +
        CASE
            WHEN p_domains IS NOT NULL THEN
                (
                    SELECT COUNT(*)::FLOAT / GREATEST(array_length(p_domains, 1), 1)
                    FROM unnest(p_domains) AS domain
                    WHERE domain = ANY(
                        SELECT jsonb_array_elements_text(a.metadata->'domains')
                    )
                ) * 0.25
            ELSE 0.25
        END AS overall_score

    FROM agents a
    INNER JOIN agent_embeddings ae ON a.id = ae.agent_id
    WHERE a.status = 'active'
        AND ae.embedding_type = 'profile'
        AND (p_tier IS NULL OR (a.metadata->>'tier')::INTEGER = p_tier)
    ORDER BY overall_score DESC
    LIMIT p_max_results;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE MONITORING VIEWS
-- ----------------------------------------------------------------------------

-- View: Top slow queries
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    rows,
    100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS cache_hit_ratio
FROM pg_stat_statements
WHERE query LIKE '%agent%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- View: Index usage statistics
CREATE OR REPLACE VIEW v_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'RARELY USED'
        ELSE 'FREQUENTLY USED'
    END AS usage_category
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND tablename LIKE 'agent%'
ORDER BY idx_scan DESC;

-- View: Table bloat and vacuum recommendations
CREATE OR REPLACE VIEW v_table_maintenance AS
SELECT
    schemaname,
    tablename,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    CASE
        WHEN n_live_tup > 0
        THEN ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0
    END AS dead_tuple_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    CASE
        WHEN n_dead_tup > 1000 AND n_dead_tup::FLOAT / NULLIF(n_live_tup, 0) > 0.1
        THEN 'VACUUM RECOMMENDED'
        WHEN last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '7 days'
        THEN 'ANALYZE RECOMMENDED'
        ELSE 'OK'
    END AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename LIKE 'agent%'
ORDER BY dead_tuple_pct DESC;

-- View: Connection pool statistics
CREATE OR REPLACE VIEW v_connection_stats AS
SELECT
    datname AS database,
    usename AS user,
    application_name,
    COUNT(*) AS connection_count,
    COUNT(*) FILTER (WHERE state = 'active') AS active,
    COUNT(*) FILTER (WHERE state = 'idle') AS idle,
    COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
    MAX(NOW() - state_change) AS max_age
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname, usename, application_name
ORDER BY connection_count DESC;

-- View: Cache hit ratios
CREATE OR REPLACE VIEW v_cache_performance AS
SELECT
    'Tables' AS cache_type,
    SUM(heap_blks_read) AS disk_reads,
    SUM(heap_blks_hit) AS cache_hits,
    ROUND(
        100.0 * SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0),
        2
    ) AS cache_hit_ratio_pct
FROM pg_statio_user_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Indexes' AS cache_type,
    SUM(idx_blks_read) AS disk_reads,
    SUM(idx_blks_hit) AS cache_hits,
    ROUND(
        100.0 * SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0),
        2
    ) AS cache_hit_ratio_pct
FROM pg_statio_user_indexes
WHERE schemaname = 'public';

-- ----------------------------------------------------------------------------
-- 5. HNSW INDEX OPTIMIZATION
-- ----------------------------------------------------------------------------

-- Check HNSW index parameters
SELECT
    c.relname AS index_name,
    c.reloptions AS index_options,
    pg_size_pretty(pg_relation_size(c.oid)) AS index_size,
    s.idx_scan AS scans,
    s.idx_tup_read AS tuples_read
FROM pg_class c
JOIN pg_stat_user_indexes s ON c.oid = s.indexrelid
WHERE c.relname LIKE '%hnsw%';

-- Recommendation: For production workloads, consider increasing HNSW parameters
-- This improves recall at the cost of slower index build and larger size
--
-- To rebuild with higher parameters:
--
-- DROP INDEX agent_embeddings_hnsw_idx;
-- CREATE INDEX agent_embeddings_hnsw_idx
-- ON agent_embeddings
-- USING hnsw (embedding vector_cosine_ops)
-- WITH (m = 32, ef_construction = 128);
--
-- Current: m=16, ef_construction=64 (faster build, lower recall)
-- High perf: m=32, ef_construction=128 (slower build, higher recall)
-- Maximum: m=64, ef_construction=256 (production quality)

-- ----------------------------------------------------------------------------
-- 6. VACUUM AND MAINTENANCE
-- ----------------------------------------------------------------------------

-- Manual vacuum for agent tables (run during low-traffic periods)
-- VACUUM ANALYZE agents;
-- VACUUM ANALYZE agent_embeddings;
-- VACUUM ANALYZE agent_collaborations;
-- VACUUM ANALYZE agent_escalations;

-- Full vacuum (reclaims disk space, requires table lock)
-- VACUUM FULL ANALYZE agents;

-- ----------------------------------------------------------------------------
-- 7. QUERY OPTIMIZATION RECOMMENDATIONS
-- ----------------------------------------------------------------------------

-- Create function to get query optimization recommendations
CREATE OR REPLACE FUNCTION get_optimization_recommendations()
RETURNS TABLE (
    category TEXT,
    recommendation TEXT,
    current_value TEXT,
    suggested_value TEXT,
    priority TEXT
) AS $$
BEGIN
    -- Check for missing indexes
    RETURN QUERY
    SELECT
        'Missing Index' AS category,
        'Consider adding index on frequently filtered columns' AS recommendation,
        '' AS current_value,
        'CREATE INDEX idx_name ON table_name (column_name)' AS suggested_value,
        'MEDIUM' AS priority
    WHERE EXISTS (
        SELECT 1
        FROM pg_stat_user_tables t
        WHERE t.seq_scan > 100
            AND t.seq_tup_read / NULLIF(t.seq_scan, 0) > 10000
    );

    -- Check for unused indexes
    RETURN QUERY
    SELECT
        'Unused Index' AS category,
        'Consider dropping unused indexes: ' || indexname AS recommendation,
        idx_scan::TEXT AS current_value,
        'DROP INDEX ' || indexname AS suggested_value,
        'LOW' AS priority
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey';

    -- Check for high dead tuple percentage
    RETURN QUERY
    SELECT
        'Table Bloat' AS category,
        'Table ' || tablename || ' needs VACUUM' AS recommendation,
        ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)::TEXT || '%' AS current_value,
        'VACUUM ANALYZE ' || tablename AS suggested_value,
        'HIGH' AS priority
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 1000
        AND n_dead_tup::FLOAT / NULLIF(n_live_tup, 0) > 0.1;

    -- Check cache hit ratio
    RETURN QUERY
    SELECT
        'Cache Hit Ratio' AS category,
        'Low cache hit ratio - consider increasing shared_buffers' AS recommendation,
        ROUND(
            100.0 * SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0),
            2
        )::TEXT || '%' AS current_value,
        'shared_buffers = 25% of RAM' AS suggested_value,
        'HIGH' AS priority
    FROM pg_statio_user_tables
    HAVING ROUND(
        100.0 * SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0),
        2
    ) < 90;

END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 8. PERFORMANCE TESTING QUERIES
-- ----------------------------------------------------------------------------

-- Test 1: Vector search performance (should use HNSW index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    a.id,
    a.name,
    1 - (ae.embedding <=> '[0.1,0.2,0.3]'::vector(1536)) AS similarity
FROM agents a
JOIN agent_embeddings ae ON a.id = ae.agent_id
WHERE ae.embedding_type = 'profile'
    AND a.status = 'active'
ORDER BY ae.embedding <=> '[0.1,0.2,0.3]'::vector(1536)
LIMIT 10;

-- Test 2: Filtered search performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    a.id,
    a.name,
    (a.metadata->>'tier')::INTEGER AS tier
FROM agents a
WHERE a.status = 'active'
    AND (a.metadata->>'tier')::INTEGER = 1
    AND a.metadata->'domains' @> '["regulatory-affairs"]'::jsonb
LIMIT 10;

-- Test 3: Graph relationship query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    ae.from_agent_id,
    ae.to_agent_id,
    ae.escalation_reason,
    ae.success_rate,
    a.name AS to_agent_name
FROM agent_escalations ae
JOIN agents a ON ae.to_agent_id = a.id
WHERE ae.from_agent_id = (
    SELECT id FROM agents WHERE name = 'fda-regulatory-strategist' LIMIT 1
)
    AND ae.success_rate >= 0.7
ORDER BY ae.priority DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- 9. MONITORING QUERIES
-- ----------------------------------------------------------------------------

-- Run these queries periodically to monitor performance

-- Current database size
SELECT
    pg_size_pretty(pg_database_size(current_database())) AS database_size;

-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename LIKE 'agent%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active queries
SELECT
    pid,
    usename,
    application_name,
    state,
    query_start,
    NOW() - query_start AS duration,
    LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state = 'active'
    AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- Lock monitoring
SELECT
    locktype,
    relation::regclass AS table,
    mode,
    granted,
    pid
FROM pg_locks
WHERE relation IS NOT NULL
    AND relation::regclass::TEXT LIKE 'agent%';

-- ----------------------------------------------------------------------------
-- USAGE EXAMPLES
-- ----------------------------------------------------------------------------

-- 1. Check index usage
-- SELECT * FROM v_index_usage;

-- 2. Find slow queries
-- SELECT * FROM v_slow_queries;

-- 3. Check maintenance needs
-- SELECT * FROM v_table_maintenance;

-- 4. Get optimization recommendations
-- SELECT * FROM get_optimization_recommendations() ORDER BY priority DESC;

-- 5. Monitor cache performance
-- SELECT * FROM v_cache_performance;

-- 6. Check connection pool
-- SELECT * FROM v_connection_stats;
