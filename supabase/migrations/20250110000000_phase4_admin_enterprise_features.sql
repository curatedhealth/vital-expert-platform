-- ============================================================================
-- PHASE 4 ADMIN DASHBOARD - ENTERPRISE FEATURES
-- ============================================================================
-- Database migrations for Phase 4 admin dashboard features:
-- 1. System Settings & Feature Flags Management
-- 2. Backup & Disaster Recovery Dashboard
-- 3. Advanced Usage Analytics & Cost Management
-- 4. Rate Limiting & Security Controls
-- 5. Advanced Monitoring & Alerting
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM SETTINGS & FEATURE FLAGS MANAGEMENT
-- ============================================================================

-- Feature flags table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  target_users TEXT[], -- User IDs for targeted rollout
  target_orgs TEXT[], -- Organization IDs for targeted rollout
  environment VARCHAR(50) DEFAULT 'all', -- all, dev, staging, prod
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category VARCHAR(100) NOT NULL, -- security, performance, features, compliance
  environment VARCHAR(50) DEFAULT 'all',
  is_sensitive BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System announcements table
CREATE TABLE system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, warning, critical, maintenance
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  target_roles TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. BACKUP & DISASTER RECOVERY DASHBOARD
-- ============================================================================

-- Backup metadata table
CREATE TABLE backup_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL, -- full, incremental, differential
  backup_location TEXT NOT NULL,
  file_size BIGINT,
  database_size BIGINT,
  status VARCHAR(50) NOT NULL, -- completed, failed, in_progress
  tables_backed_up TEXT[],
  backup_duration_seconds INTEGER,
  retention_days INTEGER DEFAULT 90,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Restore operations table
CREATE TABLE restore_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID REFERENCES backup_metadata(id),
  restore_type VARCHAR(50) NOT NULL, -- full, partial, point_in_time
  status VARCHAR(50) NOT NULL, -- pending, in_progress, completed, failed
  tables_restored TEXT[],
  restore_duration_seconds INTEGER,
  performed_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Backup schedules table
CREATE TABLE backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  backup_type VARCHAR(50) NOT NULL,
  cron_expression VARCHAR(100) NOT NULL, -- Standard cron format
  retention_days INTEGER DEFAULT 90,
  is_enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ADVANCED USAGE ANALYTICS & COST MANAGEMENT
-- ============================================================================

-- Enhanced budget configuration
CREATE TABLE budget_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- tenant, user, service, provider
  entity_id VARCHAR(255) NOT NULL,
  daily_limit DECIMAL(10, 2),
  weekly_limit DECIMAL(10, 2),
  monthly_limit DECIMAL(10, 2),
  alert_threshold_percentage INTEGER DEFAULT 80,
  hard_limit BOOLEAN DEFAULT false, -- Block on limit vs warn
  notification_channels JSONB DEFAULT '[]', -- email, slack, pagerduty
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Cost anomalies detection
CREATE TABLE cost_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  anomaly_type VARCHAR(50) NOT NULL, -- spike, unusual_pattern, budget_breach
  expected_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  deviation_percentage DECIMAL(5, 2),
  severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, false_positive
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ
);

-- Cost allocation rules
CREATE TABLE cost_allocation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  allocation_type VARCHAR(50) NOT NULL, -- even_split, usage_based, custom
  source_entity_type VARCHAR(50) NOT NULL,
  source_entity_id VARCHAR(255) NOT NULL,
  target_entities JSONB NOT NULL, -- Array of {entity_type, entity_id, percentage}
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. RATE LIMITING & SECURITY CONTROLS
-- ============================================================================

-- Rate limit configurations
CREATE TABLE rate_limit_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_pattern VARCHAR(255) NOT NULL,
  limit_type VARCHAR(50) NOT NULL, -- requests_per_second, requests_per_minute, etc.
  limit_value INTEGER NOT NULL,
  scope VARCHAR(50) NOT NULL, -- global, per_user, per_tenant, per_ip
  entity_id VARCHAR(255), -- Specific user/tenant ID or null for global
  burst_allowance INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limit violations
CREATE TABLE rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES rate_limit_configs(id),
  endpoint VARCHAR(255) NOT NULL,
  user_id UUID,
  tenant_id UUID,
  ip_address INET,
  request_count INTEGER NOT NULL,
  limit_value INTEGER NOT NULL,
  violation_time TIMESTAMPTZ DEFAULT NOW(),
  action_taken VARCHAR(50), -- warned, blocked, throttled
  metadata JSONB DEFAULT '{}'
);

-- IP whitelist/blacklist
CREATE TABLE ip_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  ip_range CIDR,
  list_type VARCHAR(50) NOT NULL, -- whitelist, blacklist
  reason TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abuse detection patterns
CREATE TABLE abuse_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR(255) NOT NULL,
  detection_rule JSONB NOT NULL, -- Rule configuration
  severity VARCHAR(50) DEFAULT 'medium',
  auto_block BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security incidents
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(50) NOT NULL, -- rate_limit, abuse, suspicious_access
  severity VARCHAR(50) NOT NULL,
  user_id UUID,
  tenant_id UUID,
  ip_address INET,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved
  action_taken TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- 5. ADVANCED MONITORING & ALERTING
-- ============================================================================

-- Alert rules
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition JSONB NOT NULL, -- Alert condition configuration
  severity VARCHAR(50) NOT NULL, -- info, warning, critical
  evaluation_interval_seconds INTEGER DEFAULT 60,
  notification_channels UUID[] NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification channels
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  channel_type VARCHAR(50) NOT NULL, -- email, slack, pagerduty, webhook
  configuration JSONB NOT NULL, -- Channel-specific config
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert instances
CREATE TABLE alert_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_rule_id UUID REFERENCES alert_rules(id),
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'firing', -- firing, resolved, suppressed
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Feature flags indexes
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flags_environment ON feature_flags(environment);

-- System settings indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_environment ON system_settings(environment);

-- System announcements indexes
CREATE INDEX idx_system_announcements_active ON system_announcements(is_active);
CREATE INDEX idx_system_announcements_type ON system_announcements(type);
CREATE INDEX idx_system_announcements_time ON system_announcements(start_time, end_time);

-- Backup metadata indexes
CREATE INDEX idx_backup_metadata_status ON backup_metadata(status);
CREATE INDEX idx_backup_metadata_created_at ON backup_metadata(created_at);
CREATE INDEX idx_backup_metadata_type ON backup_metadata(backup_type);

-- Restore operations indexes
CREATE INDEX idx_restore_operations_status ON restore_operations(status);
CREATE INDEX idx_restore_operations_backup_id ON restore_operations(backup_id);
CREATE INDEX idx_restore_operations_started_at ON restore_operations(started_at);

-- Backup schedules indexes
CREATE INDEX idx_backup_schedules_enabled ON backup_schedules(is_enabled);
CREATE INDEX idx_backup_schedules_next_run ON backup_schedules(next_run_at);

-- Budget configurations indexes
CREATE INDEX idx_budget_configs_entity ON budget_configurations(entity_type, entity_id);
CREATE INDEX idx_budget_configs_limits ON budget_configurations(daily_limit, weekly_limit, monthly_limit);

-- Cost anomalies indexes
CREATE INDEX idx_cost_anomalies_entity ON cost_anomalies(entity_type, entity_id);
CREATE INDEX idx_cost_anomalies_detected_at ON cost_anomalies(detected_at);
CREATE INDEX idx_cost_anomalies_status ON cost_anomalies(status);
CREATE INDEX idx_cost_anomalies_severity ON cost_anomalies(severity);

-- Rate limit configs indexes
CREATE INDEX idx_rate_limit_configs_endpoint ON rate_limit_configs(endpoint_pattern);
CREATE INDEX idx_rate_limit_configs_scope ON rate_limit_configs(scope);
CREATE INDEX idx_rate_limit_configs_enabled ON rate_limit_configs(is_enabled);

-- Rate limit violations indexes
CREATE INDEX idx_rate_limit_violations_config ON rate_limit_violations(config_id);
CREATE INDEX idx_rate_limit_violations_time ON rate_limit_violations(violation_time);
CREATE INDEX idx_rate_limit_violations_user ON rate_limit_violations(user_id);
CREATE INDEX idx_rate_limit_violations_ip ON rate_limit_violations(ip_address);

-- IP access control indexes
CREATE INDEX idx_ip_access_control_type ON ip_access_control(list_type);
CREATE INDEX idx_ip_access_control_active ON ip_access_control(is_active);
CREATE INDEX idx_ip_access_control_expires ON ip_access_control(expires_at);

-- Security incidents indexes
CREATE INDEX idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_detected_at ON security_incidents(detected_at);

-- Alert rules indexes
CREATE INDEX idx_alert_rules_enabled ON alert_rules(is_enabled);
CREATE INDEX idx_alert_rules_severity ON alert_rules(severity);

-- Alert instances indexes
CREATE INDEX idx_alert_instances_rule ON alert_instances(alert_rule_id);
CREATE INDEX idx_alert_instances_status ON alert_instances(status);
CREATE INDEX idx_alert_instances_triggered_at ON alert_instances(triggered_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies (super_admin and admin roles)
CREATE POLICY "Admin access to feature_flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to system_settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to system_announcements" ON system_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to backup_metadata" ON backup_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to restore_operations" ON restore_operations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to backup_schedules" ON backup_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to budget_configurations" ON budget_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to cost_anomalies" ON cost_anomalies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to cost_allocation_rules" ON cost_allocation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to rate_limit_configs" ON rate_limit_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to rate_limit_violations" ON rate_limit_violations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to ip_access_control" ON ip_access_control
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to abuse_patterns" ON abuse_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to security_incidents" ON security_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to alert_rules" ON alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to notification_channels" ON notification_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admin access to alert_instances" ON alert_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

-- Create audit trigger function for Phase 4 tables
CREATE OR REPLACE FUNCTION audit_phase4_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    ),
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all Phase 4 tables
CREATE TRIGGER audit_feature_flags_changes
  AFTER INSERT OR UPDATE OR DELETE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_system_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_system_announcements_changes
  AFTER INSERT OR UPDATE OR DELETE ON system_announcements
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_backup_metadata_changes
  AFTER INSERT OR UPDATE OR DELETE ON backup_metadata
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_restore_operations_changes
  AFTER INSERT OR UPDATE OR DELETE ON restore_operations
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_backup_schedules_changes
  AFTER INSERT OR UPDATE OR DELETE ON backup_schedules
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_budget_configurations_changes
  AFTER INSERT OR UPDATE OR DELETE ON budget_configurations
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_cost_anomalies_changes
  AFTER INSERT OR UPDATE OR DELETE ON cost_anomalies
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_cost_allocation_rules_changes
  AFTER INSERT OR UPDATE OR DELETE ON cost_allocation_rules
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_rate_limit_configs_changes
  AFTER INSERT OR UPDATE OR DELETE ON rate_limit_configs
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_rate_limit_violations_changes
  AFTER INSERT OR UPDATE OR DELETE ON rate_limit_violations
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_ip_access_control_changes
  AFTER INSERT OR UPDATE OR DELETE ON ip_access_control
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_abuse_patterns_changes
  AFTER INSERT OR UPDATE OR DELETE ON abuse_patterns
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_security_incidents_changes
  AFTER INSERT OR UPDATE OR DELETE ON security_incidents
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_alert_rules_changes
  AFTER INSERT OR UPDATE OR DELETE ON alert_rules
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_notification_channels_changes
  AFTER INSERT OR UPDATE OR DELETE ON notification_channels
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

CREATE TRIGGER audit_alert_instances_changes
  AFTER INSERT OR UPDATE OR DELETE ON alert_instances
  FOR EACH ROW EXECUTE FUNCTION audit_phase4_changes();

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, category, environment, is_sensitive, requires_restart) VALUES
  ('maintenance_mode', 'false', 'features', 'all', false, true),
  ('max_file_upload_size', '10485760', 'performance', 'all', false, false),
  ('session_timeout_minutes', '480', 'security', 'all', false, false),
  ('enable_audit_logging', 'true', 'security', 'all', false, true),
  ('backup_retention_days', '90', 'compliance', 'all', false, false),
  ('rate_limit_global_requests_per_minute', '1000', 'security', 'all', false, false),
  ('cost_anomaly_detection_enabled', 'true', 'features', 'all', false, false),
  ('alert_notification_enabled', 'true', 'features', 'all', false, false);

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, environment) VALUES
  ('advanced_analytics', 'Enable advanced analytics dashboard', false, 0, 'all'),
  ('beta_features', 'Enable beta features for testing', false, 10, 'staging'),
  ('enhanced_security', 'Enable enhanced security features', true, 100, 'all'),
  ('cost_optimization', 'Enable automatic cost optimization', false, 0, 'all'),
  ('real_time_monitoring', 'Enable real-time monitoring features', true, 100, 'all');

-- Insert default notification channels
INSERT INTO notification_channels (name, channel_type, configuration, is_enabled) VALUES
  ('Default Email', 'email', '{"recipients": ["admin@vitalpath.com"], "template": "default"}', true),
  ('Admin Slack', 'slack', '{"webhook_url": "", "channel": "#admin-alerts"}', false),
  ('PagerDuty', 'pagerduty', '{"integration_key": "", "service_name": "VITAL Path Admin"}', false);

-- Insert default alert rules
INSERT INTO alert_rules (name, description, condition, severity, notification_channels, is_enabled) VALUES
  ('High Error Rate', 'Alert when error rate exceeds 5%', '{"metric": "error_rate", "threshold": 5, "operator": "gt"}', 'critical', ARRAY[]::UUID[], true),
  ('Backup Failure', 'Alert when backup operations fail', '{"metric": "backup_status", "value": "failed", "operator": "eq"}', 'critical', ARRAY[]::UUID[], true),
  ('Cost Anomaly', 'Alert when cost anomalies are detected', '{"metric": "cost_anomaly", "severity": "high", "operator": "eq"}', 'warning', ARRAY[]::UUID[], true),
  ('Rate Limit Violations', 'Alert when rate limit violations spike', '{"metric": "rate_limit_violations", "threshold": 100, "operator": "gt", "time_window": "5m"}', 'warning', ARRAY[]::UUID[], true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE feature_flags IS 'Feature flags for controlling system functionality with rollout controls';
COMMENT ON TABLE system_settings IS 'Global system configuration settings';
COMMENT ON TABLE system_announcements IS 'System-wide announcements and notifications';
COMMENT ON TABLE backup_metadata IS 'Metadata for database backup operations';
COMMENT ON TABLE restore_operations IS 'Database restore operation tracking';
COMMENT ON TABLE backup_schedules IS 'Automated backup scheduling configuration';
COMMENT ON TABLE budget_configurations IS 'Cost budget limits and alert thresholds';
COMMENT ON TABLE cost_anomalies IS 'Detected cost anomalies and spending patterns';
COMMENT ON TABLE cost_allocation_rules IS 'Rules for allocating costs across entities';
COMMENT ON TABLE rate_limit_configs IS 'Rate limiting configuration per endpoint';
COMMENT ON TABLE rate_limit_violations IS 'Rate limit violation tracking and actions';
COMMENT ON TABLE ip_access_control IS 'IP whitelist and blacklist management';
COMMENT ON TABLE abuse_patterns IS 'Abuse detection pattern definitions';
COMMENT ON TABLE security_incidents IS 'Security incident tracking and resolution';
COMMENT ON TABLE alert_rules IS 'Alert rule definitions and conditions';
COMMENT ON TABLE notification_channels IS 'Notification channel configurations';
COMMENT ON TABLE alert_instances IS 'Active and historical alert instances';
