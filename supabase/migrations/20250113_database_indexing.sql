-- Database Indexing Improvements Migration
-- This migration creates optimized indexes for common query patterns and RLS policies

-- Drop existing indexes that might conflict
DROP INDEX IF EXISTS idx_user_profiles_org_id;
DROP INDEX IF EXISTS idx_agents_org_id;
DROP INDEX IF EXISTS idx_workflows_org_id;
DROP INDEX IF EXISTS idx_audit_logs_org_id;

-- Create comprehensive indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_role ON user_profiles(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_active ON user_profiles(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_active ON user_profiles(role, is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_role_active ON user_profiles(organization_id, role, is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_created ON user_profiles(organization_id, created_at);

-- Create comprehensive indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_org_id ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_org_status ON agents(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_agents_org_active ON agents(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_agents_status_active ON agents(status, is_active);
CREATE INDEX IF NOT EXISTS idx_agents_org_status_active ON agents(organization_id, status, is_active);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON agents(updated_at);
CREATE INDEX IF NOT EXISTS idx_agents_org_created ON agents(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agents_org_updated ON agents(organization_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_agents_org_status_created ON agents(organization_id, status, created_at);

-- Create comprehensive indexes for workflows table
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_org_status ON workflows(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at);
CREATE INDEX IF NOT EXISTS idx_workflows_org_created ON workflows(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_workflows_org_updated ON workflows(organization_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_workflows_org_status_created ON workflows(organization_id, status, created_at);

-- Create comprehensive indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp ON audit_logs(organization_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action ON audit_logs(organization_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_user ON audit_logs(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_user_timestamp ON audit_logs(organization_id, user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action_timestamp ON audit_logs(organization_id, action, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_timestamp ON audit_logs(user_id, action, timestamp);

-- Create comprehensive indexes for organizations table
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);
CREATE INDEX IF NOT EXISTS idx_organizations_updated_at ON organizations(updated_at);
CREATE INDEX IF NOT EXISTS idx_organizations_tier_created ON organizations(subscription_tier, created_at);

-- Create comprehensive indexes for threat_events table
CREATE INDEX IF NOT EXISTS idx_threat_events_type ON threat_events(type);
CREATE INDEX IF NOT EXISTS idx_threat_events_severity ON threat_events(severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_user_id ON threat_events(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_events_org_id ON threat_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp ON threat_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_resolved ON threat_events(resolved);
CREATE INDEX IF NOT EXISTS idx_threat_events_false_positive ON threat_events(false_positive);
CREATE INDEX IF NOT EXISTS idx_threat_events_type_severity ON threat_events(type, severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_org_timestamp ON threat_events(organization_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_user_timestamp ON threat_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_type_timestamp ON threat_events(type, timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_severity_timestamp ON threat_events(severity, timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_org_type ON threat_events(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_threat_events_org_severity ON threat_events(organization_id, severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_resolved_timestamp ON threat_events(resolved, timestamp);
CREATE INDEX IF NOT EXISTS idx_threat_events_false_positive_timestamp ON threat_events(false_positive, timestamp);

-- Create comprehensive indexes for rate_limit_tracking table
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_entity ON rate_limit_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_window ON rate_limit_tracking(window_start, window_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_entity_window ON rate_limit_tracking(entity_type, entity_id, window_start, window_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_created_at ON rate_limit_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracking_cleanup ON rate_limit_tracking(window_start, window_type, created_at);

-- Create comprehensive indexes for rate_limit_config table
CREATE INDEX IF NOT EXISTS idx_rate_limit_config_entity ON rate_limit_config(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_config_active ON rate_limit_config(is_active);
CREATE INDEX IF NOT EXISTS idx_rate_limit_config_entity_active ON rate_limit_config(entity_type, entity_id, is_active);

-- Create comprehensive indexes for alert_logs table
CREATE INDEX IF NOT EXISTS idx_alert_logs_threat_id ON alert_logs(threat_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_threat_type ON alert_logs(threat_type);
CREATE INDEX IF NOT EXISTS idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at ON alert_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_alert_logs_delivery_status ON alert_logs(delivery_status);
CREATE INDEX IF NOT EXISTS idx_alert_logs_threat_type_severity ON alert_logs(threat_type, severity);
CREATE INDEX IF NOT EXISTS idx_alert_logs_threat_type_sent_at ON alert_logs(threat_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_alert_logs_severity_sent_at ON alert_logs(severity, sent_at);
CREATE INDEX IF NOT EXISTS idx_alert_logs_delivery_status_sent_at ON alert_logs(delivery_status, sent_at);

-- Create comprehensive indexes for alert_channels table
CREATE INDEX IF NOT EXISTS idx_alert_channels_type ON alert_channels(type);
CREATE INDEX IF NOT EXISTS idx_alert_channels_enabled ON alert_channels(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_channels_type_enabled ON alert_channels(type, enabled);

-- Create comprehensive indexes for alert_templates table
CREATE INDEX IF NOT EXISTS idx_alert_templates_is_default ON alert_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_alert_templates_threat_types ON alert_templates USING GIN (threat_types);
CREATE INDEX IF NOT EXISTS idx_alert_templates_severity_levels ON alert_templates USING GIN (severity_levels);
CREATE INDEX IF NOT EXISTS idx_alert_templates_channels ON alert_templates USING GIN (channels);

-- Create comprehensive indexes for alert_rules table
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_conditions ON alert_rules USING GIN (conditions);
CREATE INDEX IF NOT EXISTS idx_alert_rules_channels ON alert_rules USING GIN (channels);

-- Create covering indexes for frequently accessed data
CREATE INDEX IF NOT EXISTS idx_user_profiles_covering_org 
ON user_profiles(organization_id) 
INCLUDE (id, role, email, is_active, created_at, last_login_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_covering_role 
ON user_profiles(role) 
INCLUDE (id, organization_id, email, is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_agents_covering_org 
ON agents(organization_id) 
INCLUDE (id, name, status, is_active, created_at, updated_at);

CREATE INDEX IF NOT EXISTS idx_agents_covering_status 
ON agents(status) 
INCLUDE (id, organization_id, name, is_active, created_at);

CREATE INDEX IF NOT EXISTS idx_workflows_covering_org 
ON workflows(organization_id) 
INCLUDE (id, name, status, created_at, updated_at);

CREATE INDEX IF NOT EXISTS idx_workflows_covering_status 
ON workflows(status) 
INCLUDE (id, organization_id, name, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_covering_org 
ON audit_logs(organization_id) 
INCLUDE (id, user_id, action, timestamp, details);

CREATE INDEX IF NOT EXISTS idx_audit_logs_covering_user 
ON audit_logs(user_id) 
INCLUDE (id, organization_id, action, timestamp, details);

CREATE INDEX IF NOT EXISTS idx_audit_logs_covering_action 
ON audit_logs(action) 
INCLUDE (id, organization_id, user_id, timestamp, details);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_agents_metadata_gin 
ON agents USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_workflows_config_gin 
ON workflows USING GIN (config);

CREATE INDEX IF NOT EXISTS idx_audit_logs_details_gin 
ON audit_logs USING GIN (details);

CREATE INDEX IF NOT EXISTS idx_threat_events_details_gin 
ON threat_events USING GIN (details);

CREATE INDEX IF NOT EXISTS idx_alert_channels_config_gin 
ON alert_channels USING GIN (config);

CREATE INDEX IF NOT EXISTS idx_alert_rules_conditions_gin 
ON alert_rules USING GIN (conditions);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_agents_name_fts 
ON agents USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_workflows_name_fts 
ON workflows USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_organizations_name_fts 
ON organizations USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_fts 
ON user_profiles USING GIN (to_tsvector('english', email));

-- Create indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_hour 
ON audit_logs (date_trunc('hour', timestamp));

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_day 
ON audit_logs (date_trunc('day', timestamp));

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp_hour 
ON threat_events (date_trunc('hour', timestamp));

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp_day 
ON threat_events (date_trunc('day', timestamp));

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at_hour 
ON user_profiles (date_trunc('hour', created_at));

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at_day 
ON user_profiles (date_trunc('day', created_at));

-- Create indexes for RLS policy optimization
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_uid 
ON user_profiles (id) 
WHERE id = auth.uid();

CREATE INDEX IF NOT EXISTS idx_organizations_auth_uid 
ON organizations (id) 
WHERE id IN (
  SELECT organization_id 
  FROM user_profiles 
  WHERE id = auth.uid()
);

-- Create function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT,
  usage_ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.tablename,
    s.indexname,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    CASE 
      WHEN s.idx_scan > 0 THEN 
        ROUND((s.idx_tup_read::NUMERIC / s.idx_scan), 2)
      ELSE 0
    END as usage_ratio
  FROM pg_stat_user_indexes s
  JOIN pg_index i ON s.indexrelid = i.indexrelid
  WHERE s.schemaname = 'public'
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unused indexes
CREATE OR REPLACE FUNCTION get_unused_indexes()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  indexname TEXT,
  index_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname,
    s.tablename,
    s.indexname,
    pg_size_pretty(pg_relation_size(s.indexrelid)) as index_size
  FROM pg_stat_user_indexes s
  WHERE s.schemaname = 'public'
    AND s.idx_scan = 0
    AND s.indexname NOT LIKE '%_pkey'
  ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get index statistics
CREATE OR REPLACE FUNCTION get_index_statistics()
RETURNS TABLE (
  total_indexes BIGINT,
  total_size TEXT,
  avg_size TEXT,
  unused_indexes BIGINT,
  unused_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_indexes,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_size,
    pg_size_pretty(AVG(pg_relation_size(indexrelid))) as avg_size,
    COUNT(*) FILTER (WHERE idx_scan = 0) as unused_indexes,
    pg_size_pretty(SUM(pg_relation_size(indexrelid)) FILTER (WHERE idx_scan = 0)) as unused_size
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION analyze_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unused_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_statistics() TO authenticated;
