-- =============================================================================
-- PERFORMANCE MONITORING - SIMPLIFIED VERSION
-- =============================================================================
-- PURPOSE: Monitor database performance metrics
-- COMPATIBLE: Works with Supabase Dashboard SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. QUERY PERFORMANCE
-- =============================================================================

-- Average query execution time (Target: <200ms)
SELECT
  ROUND(AVG(mean_exec_time)::numeric, 2) as avg_query_time_ms,
  ROUND(MAX(mean_exec_time)::numeric, 2) as max_query_time_ms,
  ROUND(MIN(mean_exec_time)::numeric, 2) as min_query_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%';

-- Slow queries (>200ms)
SELECT
  LEFT(query, 100) as query_preview,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND(((total_exec_time / NULLIF(SUM(total_exec_time) OVER (), 0)) * 100)::numeric, 2) as pct_total_time
FROM pg_stat_statements
WHERE mean_exec_time > 200
  AND query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Most frequently called queries
SELECT
  LEFT(query, 100) as query_preview,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(total_exec_time::numeric, 2) as total_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY calls DESC
LIMIT 20;

-- =============================================================================
-- 2. CACHE HIT RATIO (Target: >99%)
-- =============================================================================

SELECT
  ROUND(
    (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100)::numeric,
    2
  ) as cache_hit_ratio_pct
FROM pg_stat_database
WHERE datname = current_database();

-- =============================================================================
-- 3. TABLE STATISTICS
-- =============================================================================

-- Table sizes and row counts
SELECT
  schemaname,
  relname as table_name,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100)::numeric, 2) as dead_tuple_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC
LIMIT 20;

-- Tables that need VACUUM (>10% dead tuples)
SELECT
  schemaname,
  relname as table_name,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100)::numeric, 2) as dead_tuple_pct,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 0
  AND (n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100) > 10
ORDER BY dead_tuple_pct DESC;

-- Sequential scans on large tables (may need indexes)
SELECT
  schemaname,
  relname as table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  ROUND((seq_tup_read::numeric / NULLIF(seq_scan, 0))::numeric, 2) as avg_rows_per_seq_scan,
  n_live_tup as live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND n_live_tup > 1000
ORDER BY seq_tup_read DESC
LIMIT 20;

-- =============================================================================
-- 4. INDEX USAGE STATISTICS
-- =============================================================================

-- Indexes that are never used (candidates for removal)
SELECT
  schemaname,
  relname as table_name,
  indexrelname as index_name,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Never used
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Most used indexes
SELECT
  schemaname,
  relname as table_name,
  indexrelname as index_name,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  ROUND((idx_tup_fetch::numeric / NULLIF(idx_tup_read, 0) * 100)::numeric, 2) as fetch_efficiency_pct
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 20;

-- Tables with low index usage (may be missing indexes)
SELECT
  schemaname,
  relname as table_name,
  seq_scan,
  idx_scan,
  ROUND((idx_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100)::numeric, 2) as index_usage_pct,
  n_live_tup as live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND (seq_scan + idx_scan) > 0
  AND n_live_tup > 1000
ORDER BY index_usage_pct ASC
LIMIT 20;

-- =============================================================================
-- 5. DATABASE SIZE AND GROWTH
-- =============================================================================

-- Total database size
SELECT
  pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Top 20 largest tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- =============================================================================
-- 6. CONNECTION STATISTICS
-- =============================================================================

-- Current active connections
SELECT
  COUNT(*) as total_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();

-- Longest running queries
SELECT
  pid,
  usename,
  application_name,
  state,
  query_start,
  NOW() - query_start as duration,
  LEFT(query, 100) as query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start ASC
LIMIT 10;

-- =============================================================================
-- 7. LOCK MONITORING
-- =============================================================================

-- Current locks
SELECT
  locktype,
  relation::regclass as table_name,
  mode,
  granted,
  COUNT(*) as lock_count
FROM pg_locks
WHERE relation IS NOT NULL
GROUP BY locktype, relation, mode, granted
ORDER BY lock_count DESC
LIMIT 20;

-- Blocking queries
SELECT
  blocked_locks.pid AS blocked_pid,
  blocking_locks.pid AS blocking_pid,
  blocked_activity.usename AS blocked_user,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
  AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
  AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
  AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
  AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
  AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
  AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
  AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
  AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- =============================================================================
-- 8. SUMMARY REPORT
-- =============================================================================

DO $$
DECLARE
    db_size TEXT;
    total_tables INTEGER;
    total_indexes INTEGER;
    avg_query_time NUMERIC;
    cache_hit_ratio NUMERIC;
    active_connections INTEGER;
    slow_query_count INTEGER;
BEGIN
    -- Gather metrics
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;

    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes
    WHERE schemaname = 'public';

    SELECT ROUND(AVG(mean_exec_time)::numeric, 2) INTO avg_query_time
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%';

    SELECT ROUND(
        (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100)::numeric,
        2
    ) INTO cache_hit_ratio
    FROM pg_stat_database
    WHERE datname = current_database();

    SELECT COUNT(*) INTO active_connections
    FROM pg_stat_activity
    WHERE datname = current_database() AND state = 'active';

    SELECT COUNT(*) INTO slow_query_count
    FROM pg_stat_statements
    WHERE mean_exec_time > 200 AND query NOT LIKE '%pg_stat%';

    -- Print report
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 PERFORMANCE MONITORING REPORT';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Database Overview:';
    RAISE NOTICE '  - Database size: %', db_size;
    RAISE NOTICE '  - Total tables: %', total_tables;
    RAISE NOTICE '  - Total indexes: %', total_indexes;
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Query Performance:';
    RAISE NOTICE '  - Average query time: % ms', COALESCE(avg_query_time, 0);
    IF avg_query_time < 200 OR avg_query_time IS NULL THEN
        RAISE NOTICE '    ✅ Target: <200ms (GOOD)';
    ELSE
        RAISE NOTICE '    ⚠️  Target: <200ms (NEEDS OPTIMIZATION)';
    END IF;
    RAISE NOTICE '  - Slow queries (>200ms): %', slow_query_count;
    RAISE NOTICE '';
    RAISE NOTICE '💾 Cache Performance:';
    RAISE NOTICE '  - Cache hit ratio: % %%', COALESCE(cache_hit_ratio, 0);
    IF cache_hit_ratio > 99 OR cache_hit_ratio IS NULL THEN
        RAISE NOTICE '    ✅ Target: >99%% (EXCELLENT)';
    ELSIF cache_hit_ratio > 95 THEN
        RAISE NOTICE '    ⚠️  Target: >99%% (GOOD)';
    ELSE
        RAISE NOTICE '    ❌ Target: >99%% (NEEDS IMPROVEMENT)';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '🔌 Connections:';
    RAISE NOTICE '  - Active connections: %', active_connections;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Review the detailed queries above for:';
    RAISE NOTICE '  - Slow queries to optimize';
    RAISE NOTICE '  - Tables needing VACUUM';
    RAISE NOTICE '  - Unused indexes to remove';
    RAISE NOTICE '  - Missing indexes to add';
    RAISE NOTICE '';
END $$;
