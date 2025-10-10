-- Complete RLS Coverage Migration
-- This migration enables RLS on all remaining tables and creates comprehensive organization isolation policies

-- Enable RLS on all remaining tables
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_validation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_signal_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create organization isolation policies for usage_metrics
CREATE POLICY "org_isolation_usage_metrics" ON usage_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for notifications
CREATE POLICY "org_isolation_notifications" ON notifications
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for rag_knowledge_bases
CREATE POLICY "org_isolation_rag_knowledge_bases" ON rag_knowledge_bases
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for rag_documents
CREATE POLICY "org_isolation_rag_documents" ON rag_documents
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for conversations
CREATE POLICY "org_isolation_conversations" ON conversations
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for query_sessions
CREATE POLICY "org_isolation_query_sessions" ON query_sessions
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for clinical_validation_executions
CREATE POLICY "org_isolation_clinical_validation_executions" ON clinical_validation_executions
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for digital_interventions
CREATE POLICY "org_isolation_digital_interventions" ON digital_interventions
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for intervention_lifecycle
CREATE POLICY "org_isolation_intervention_lifecycle" ON intervention_lifecycle
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for safety_events
CREATE POLICY "org_isolation_safety_events" ON safety_events
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for safety_signal_detection
CREATE POLICY "org_isolation_safety_signal_detection" ON safety_signal_detection
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for rag_performance_metrics
CREATE POLICY "org_isolation_rag_performance_metrics" ON rag_performance_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for rag_system_health
CREATE POLICY "org_isolation_rag_system_health" ON rag_system_health
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for system_metrics
CREATE POLICY "org_isolation_system_metrics" ON system_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for real_time_metrics
CREATE POLICY "org_isolation_real_time_metrics" ON real_time_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for usage_analytics
CREATE POLICY "org_isolation_usage_analytics" ON usage_analytics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for rate_limit_violations
CREATE POLICY "org_isolation_rate_limit_violations" ON rate_limit_violations
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for security_incidents
CREATE POLICY "org_isolation_security_incidents" ON security_incidents
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for alert_rules
CREATE POLICY "org_isolation_alert_rules" ON alert_rules
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for alert_instances
CREATE POLICY "org_isolation_alert_instances" ON alert_instances
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for backup_jobs
CREATE POLICY "org_isolation_backup_jobs" ON backup_jobs
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for cost_analytics
CREATE POLICY "org_isolation_cost_analytics" ON cost_analytics
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for api_keys
CREATE POLICY "org_isolation_api_keys" ON api_keys
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for system_settings
CREATE POLICY "org_isolation_system_settings" ON system_settings
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for compliance_playbooks
CREATE POLICY "org_isolation_compliance_playbooks" ON compliance_playbooks
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Create organization isolation policies for security_audit_log
CREATE POLICY "org_isolation_security_audit_log" ON security_audit_log
  FOR ALL USING (
    organization_id = get_user_organization_id() OR
    is_organization_admin()
  );

-- Add missing indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_org 
  ON usage_metrics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_org 
  ON notifications(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_knowledge_bases_org 
  ON rag_knowledge_bases(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_documents_org 
  ON rag_documents(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_org 
  ON conversations(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_sessions_org 
  ON query_sessions(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_validation_executions_org 
  ON clinical_validation_executions(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_digital_interventions_org 
  ON digital_interventions(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_intervention_lifecycle_org 
  ON intervention_lifecycle(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_events_org 
  ON safety_events(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_signal_detection_org 
  ON safety_signal_detection(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_performance_metrics_org 
  ON rag_performance_metrics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rag_system_health_org 
  ON rag_system_health(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_metrics_org 
  ON system_metrics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_real_time_metrics_org 
  ON real_time_metrics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_analytics_org 
  ON usage_analytics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limit_violations_org 
  ON rate_limit_violations(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_org 
  ON security_incidents(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alert_rules_org 
  ON alert_rules(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alert_instances_org 
  ON alert_instances(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backup_jobs_org 
  ON backup_jobs(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cost_analytics_org 
  ON cost_analytics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_org 
  ON api_keys(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_settings_org 
  ON system_settings(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_playbooks_org 
  ON compliance_playbooks(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_org 
  ON security_audit_log(organization_id);

-- Add user_id indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_user_id 
  ON usage_metrics(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_id 
  ON conversations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_sessions_user_id 
  ON query_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_validation_executions_user_id 
  ON clinical_validation_executions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_analytics_user_id 
  ON usage_analytics(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_user_id 
  ON security_audit_log(user_id);

-- Create composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_analytics_org_timestamp 
  ON usage_analytics(organization_id, timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_org_timestamp 
  ON audit_logs(organization_id, timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_org_user_id 
  ON notifications(organization_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_org_user_id 
  ON conversations(organization_id, user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_admin() TO authenticated;

-- Create a function to check if user can access specific resource
CREATE OR REPLACE FUNCTION can_access_resource(
  resource_table text,
  resource_id uuid,
  user_id uuid
) RETURNS boolean AS $$
DECLARE
  user_org_id uuid;
  resource_org_id uuid;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM user_profiles
  WHERE user_profiles.user_id = can_access_resource.user_id
  AND is_active = true
  LIMIT 1;

  IF user_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user is super admin
  IF is_organization_admin() THEN
    RETURN true;
  END IF;

  -- Get resource's organization
  EXECUTE format('SELECT organization_id FROM %I WHERE id = $1', resource_table)
  INTO resource_org_id
  USING resource_id;

  -- Check if resource belongs to user's organization
  RETURN resource_org_id = user_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_access_resource(text, uuid, uuid) TO authenticated;
