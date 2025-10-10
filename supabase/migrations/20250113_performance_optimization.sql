-- Performance Optimization Migration
-- This migration creates materialized views, partial indexes, and other performance optimizations

-- Enable pg_stat_statements extension for query analysis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create materialized view for user organization data
CREATE MATERIALIZED VIEW IF NOT EXISTS user_org_data AS
SELECT 
  u.id,
  u.organization_id,
  u.role,
  u.email,
  u.is_active,
  o.name as org_name,
  o.subscription_tier,
  COUNT(a.id) as agent_count,
  COUNT(w.id) as workflow_count,
  MAX(u.created_at) as user_created_at,
  MAX(u.last_login_at) as last_login_at
FROM user_profiles u
LEFT JOIN organizations o ON u.organization_id = o.id
LEFT JOIN agents a ON a.organization_id = o.id AND a.is_active = true
LEFT JOIN workflows w ON w.organization_id = o.id AND w.status = 'active'
GROUP BY u.id, u.organization_id, u.role, u.email, u.is_active, o.name, o.subscription_tier;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_user_org_data_org_id ON user_org_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_org_data_role ON user_org_data(role);
CREATE INDEX IF NOT EXISTS idx_user_org_data_active ON user_org_data(is_active);

-- Create materialized view for organization statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS org_statistics AS
SELECT 
  o.id as organization_id,
  o.name as org_name,
  o.subscription_tier,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT a.id) as agent_count,
  COUNT(DISTINCT w.id) as workflow_count,
  COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END) as active_users,
  COUNT(DISTINCT CASE WHEN a.is_active = true THEN a.id END) as active_agents,
  COUNT(DISTINCT CASE WHEN w.status = 'active' THEN w.id END) as active_workflows,
  MAX(u.last_login_at) as last_user_activity,
  MAX(a.updated_at) as last_agent_activity,
  MAX(w.updated_at) as last_workflow_activity
FROM organizations o
LEFT JOIN user_profiles u ON u.organization_id = o.id
LEFT JOIN agents a ON a.organization_id = o.id
LEFT JOIN workflows w ON w.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_tier;

-- Create index on organization statistics
CREATE INDEX IF NOT EXISTS idx_org_statistics_org_id ON org_statistics(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_statistics_tier ON org_statistics(subscription_tier);

-- Create partial indexes for active users only
CREATE INDEX IF NOT EXISTS idx_active_users_org 
ON user_profiles(organization_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_active_users_role 
ON user_profiles(role) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_active_users_org_role 
ON user_profiles(organization_id, role) 
WHERE is_active = true;

-- Create partial indexes for active agents
CREATE INDEX IF NOT EXISTS idx_active_agents_org 
ON agents(organization_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_active_agents_status 
ON agents(status) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_active_agents_org_status 
ON agents(organization_id, status) 
WHERE is_active = true;

-- Create partial indexes for active workflows
CREATE INDEX IF NOT EXISTS idx_active_workflows_org 
ON workflows(organization_id) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_active_workflows_status 
ON workflows(status) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_active_workflows_org_status 
ON workflows(organization_id, status) 
WHERE status = 'active';

-- Create composite indexes for common RLS queries
CREATE INDEX IF NOT EXISTS idx_agents_org_status_created 
ON agents(organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflows_org_status_created 
ON workflows(organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp 
ON audit_logs(organization_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp 
ON audit_logs(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp 
ON audit_logs(action, timestamp DESC);

-- Create covering indexes for frequently accessed data
CREATE INDEX IF NOT EXISTS idx_user_profiles_covering 
ON user_profiles(organization_id) 
INCLUDE (role, is_active, email, last_login_at);

CREATE INDEX IF NOT EXISTS idx_agents_covering 
ON agents(organization_id) 
INCLUDE (name, status, is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_workflows_covering 
ON workflows(organization_id) 
INCLUDE (name, status, created_at, updated_at);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_agents_metadata 
ON agents USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_workflows_config 
ON workflows USING GIN (config);

CREATE INDEX IF NOT EXISTS idx_audit_logs_details 
ON audit_logs USING GIN (details);

CREATE INDEX IF NOT EXISTS idx_threat_events_details 
ON threat_events USING GIN (details);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_agents_name_fts 
ON agents USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_workflows_name_fts 
ON workflows USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_organizations_name_fts 
ON organizations USING GIN (to_tsvector('english', name));

-- Create indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_hour 
ON audit_logs (date_trunc('hour', timestamp));

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_day 
ON audit_logs (date_trunc('day', timestamp));

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp_hour 
ON threat_events (date_trunc('hour', timestamp));

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp_day 
ON threat_events (date_trunc('day', timestamp));

-- Create indexes for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_entity_window 
ON rate_limit_tracking (entity_type, entity_id, window_start, window_type);

CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_cleanup 
ON rate_limit_tracking (window_start, window_type, created_at);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_org_data;
  REFRESH MATERIALIZED VIEW CONCURRENTLY org_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
  query_text TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  rows BIGINT,
  shared_blks_hit BIGINT,
  shared_blks_read BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read
  FROM pg_stat_statements
  WHERE query LIKE '%organization_id%'
  ORDER BY mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.tablename,
    s.indexname,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch
  FROM pg_stat_user_indexes s
  JOIN pg_index i ON s.indexrelid = i.indexrelid
  WHERE s.schemaname = 'public'
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  n_tup_ins BIGINT,
  n_tup_upd BIGINT,
  n_tup_del BIGINT,
  n_live_tup BIGINT,
  n_dead_tup BIGINT,
  last_vacuum TIMESTAMPTZ,
  last_autovacuum TIMESTAMPTZ,
  last_analyze TIMESTAMPTZ,
  last_autoanalyze TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.tablename,
    s.n_tup_ins,
    s.n_tup_upd,
    s.n_tup_del,
    s.n_live_tup,
    s.n_dead_tup,
    s.last_vacuum,
    s.last_autovacuum,
    s.last_analyze,
    s.last_autoanalyze
  FROM pg_stat_user_tables s
  WHERE s.schemaname = 'public'
  ORDER BY s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to optimize queries
CREATE OR REPLACE FUNCTION optimize_queries()
RETURNS void AS $$
BEGIN
  -- Update table statistics
  ANALYZE;
  
  -- Refresh materialized views
  PERFORM refresh_materialized_views();
  
  -- Vacuum tables to reclaim space
  VACUUM ANALYZE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job to refresh materialized views (if pg_cron is available)
-- SELECT cron.schedule('refresh-materialized-views', '0 */6 * * *', 'SELECT refresh_materialized_views();');

-- Create scheduled job to optimize queries (if pg_cron is available)
-- SELECT cron.schedule('optimize-queries', '0 2 * * *', 'SELECT optimize_queries();');

-- Grant permissions
GRANT SELECT ON user_org_data TO authenticated;
GRANT SELECT ON org_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_query_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_usage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION optimize_queries() TO authenticated;
