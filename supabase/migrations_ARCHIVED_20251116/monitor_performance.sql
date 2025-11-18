-- =============================================================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================================================
-- Monitor database performance and identify optimization opportunities
-- Target: <200ms query response time
-- =============================================================================

-- =============================================================================
-- ENABLE pg_stat_statements EXTENSION (if not already enabled)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- =============================================================================
-- 1. SLOW QUERIES (>200ms)
-- =============================================================================

-- Find queries taking longer than 200ms on average
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct_total_time,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 200  -- Queries taking >200ms
  AND query NOT LIKE '%pg_stat%'  -- Exclude monitoring queries
ORDER BY mean_exec_time DESC
LIMIT 20;

-- =============================================================================
-- 2. MOST FREQUENTLY CALLED QUERIES
-- =============================================================================

-- Top 20 most frequently executed queries
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY calls DESC
LIMIT 20;

-- =============================================================================
-- 3. QUERIES WITH HIGHEST TOTAL TIME
-- =============================================================================

-- Queries consuming the most cumulative time
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY total_exec_time DESC
LIMIT 20;

-- =============================================================================
-- 4. INDEX USAGE STATISTICS
-- =============================================================================

-- Indexes that are never used (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Never used
  AND indexname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Most used indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 20;

-- =============================================================================
-- 5. TABLE STATISTICS
-- =============================================================================

-- Largest tables with read/write statistics
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  seq_scan as sequential_scans,
  idx_scan as index_scans,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100)::numeric, 2) as dead_row_pct
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- =============================================================================
-- 6. SEQUENTIAL SCANS (Should use indexes instead)
-- =============================================================================

-- Tables with high sequential scan counts (might need indexes)
SELECT
  schemaname,
  tablename,
  seq_scan as sequential_scans,
  seq_tup_read as rows_read_sequentially,
  idx_scan as index_scans,
  n_live_tup as live_rows,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND n_live_tup > 1000  -- Only for tables with significant data
ORDER BY seq_scan DESC, n_live_tup DESC
LIMIT 20;

-- =============================================================================
-- 7. CACHE HIT RATIOS
-- =============================================================================

-- Database cache hit ratio (should be >99%)
SELECT
  'Database Cache Hit Ratio' as metric,
  ROUND(
    (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100)::numeric,
    2
  ) as percentage,
  CASE
    WHEN (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100) > 99 THEN '✅ Excellent'
    WHEN (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100) > 95 THEN '⚠️  Good'
    ELSE '❌ Poor - Consider increasing shared_buffers'
  END as status
FROM pg_stat_database
WHERE datname = current_database();

-- Index cache hit ratio (should be >99%)
SELECT
  'Index Cache Hit Ratio' as metric,
  ROUND(
    (SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0) * 100)::numeric,
    2
  ) as percentage,
  CASE
    WHEN (SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0) * 100) > 99 THEN '✅ Excellent'
    WHEN (SUM(idx_blks_hit) / NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0) * 100) > 95 THEN '⚠️  Good'
    ELSE '❌ Poor - Consider increasing shared_buffers'
  END as status
FROM pg_statio_user_indexes;

-- =============================================================================
-- 8. TABLE BLOAT (Dead tuples needing VACUUM)
-- =============================================================================

-- Tables with high dead tuple percentage (need VACUUM)
SELECT
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100)::numeric, 2) as dead_row_pct,
  last_vacuum,
  last_autovacuum,
  CASE
    WHEN (n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100) > 20 THEN '❌ High bloat - VACUUM recommended'
    WHEN (n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100) > 10 THEN '⚠️  Moderate bloat'
    ELSE '✅ Low bloat'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 100  -- Only for tables with data
ORDER BY (n_dead_tup::numeric / NULLIF(n_live_tup, 0)) DESC
LIMIT 20;

-- =============================================================================
-- 9. CONNECTION STATISTICS
-- =============================================================================

-- Current connections by state
SELECT
  state,
  COUNT(*) as connection_count,
  MAX(EXTRACT(EPOCH FROM (NOW() - state_change))) as max_seconds_in_state
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY connection_count DESC;

-- Long-running queries (>1 minute)
SELECT
  pid,
  usename,
  application_name,
  state,
  EXTRACT(EPOCH FROM (NOW() - query_start)) as runtime_seconds,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query_start < NOW() - INTERVAL '1 minute'
  AND query NOT LIKE '%pg_stat%'
ORDER BY runtime_seconds DESC;

-- =============================================================================
-- 10. QUERY PLAN EXAMPLES (For specific slow queries)
-- =============================================================================

-- Example: Explain a specific query to see execution plan
-- EXPLAIN ANALYZE
-- SELECT a.*, p.*
-- FROM agents a
-- JOIN jtbd_personas jp ON a.id = jp.agent_id
-- JOIN personas p ON jp.persona_id = p.id
-- WHERE a.specialty = 'Digital Health'
-- LIMIT 10;

-- =============================================================================
-- 11. COMPREHENSIVE PERFORMANCE SUMMARY
-- =============================================================================

SELECT
  'Total Tables' as metric,
  COUNT(*)::TEXT as value
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'Total Indexes',
  COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Database Size',
  pg_size_pretty(pg_database_size(current_database()))
FROM pg_database
WHERE datname = current_database()

UNION ALL

SELECT
  'Total Queries (since last reset)',
  SUM(calls)::TEXT
FROM pg_stat_statements

UNION ALL

SELECT
  'Avg Query Time (ms)',
  ROUND(AVG(mean_exec_time)::numeric, 2)::TEXT
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'

UNION ALL

SELECT
  'Cache Hit Ratio (%)',
  ROUND(
    (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100)::numeric,
    2
  )::TEXT
FROM pg_stat_database
WHERE datname = current_database()

UNION ALL

SELECT
  'Active Connections',
  COUNT(*)::TEXT
FROM pg_stat_activity
WHERE state = 'active' AND datname = current_database();

-- =============================================================================
-- RECOMMENDATIONS
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 PERFORMANCE MONITORING COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Key Metrics to Monitor:';
  RAISE NOTICE '  1. Query times: Target <200ms average';
  RAISE NOTICE '  2. Cache hit ratio: Target >99%%';
  RAISE NOTICE '  3. Sequential scans: Should be minimal on large tables';
  RAISE NOTICE '  4. Dead tuple ratio: Keep <10%% with VACUUM';
  RAISE NOTICE '  5. Unused indexes: Consider removing to save space';
  RAISE NOTICE '';
  RAISE NOTICE 'Optimization Actions:';
  RAISE NOTICE '  - Run VACUUM on tables with >10%% dead rows';
  RAISE NOTICE '  - Add indexes for frequent sequential scans';
  RAISE NOTICE '  - Remove unused indexes (idx_scan = 0)';
  RAISE NOTICE '  - Optimize queries taking >200ms';
  RAISE NOTICE '';
END $$;
