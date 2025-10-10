-- Threat Detection and Alerting Tables Migration
-- This migration creates tables for storing threat events and alert logs

-- Create threat_events table
CREATE TABLE IF NOT EXISTS threat_events (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('brute_force', 'credential_stuffing', 'sql_injection', 'unusual_access', 'geographic_anomaly', 'rate_limit_abuse')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  user_id UUID REFERENCES user_profiles(id),
  organization_id UUID REFERENCES organizations(id),
  ip_address INET NOT NULL,
  user_agent TEXT,
  endpoint VARCHAR(500),
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  resolved BOOLEAN DEFAULT false,
  false_positive BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alert_logs table
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_id VARCHAR(255) REFERENCES threat_events(id),
  threat_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  rules_applied TEXT[] NOT NULL,
  channels_used TEXT[] NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  delivery_status VARCHAR(20) DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alert_channels table
CREATE TABLE IF NOT EXISTS alert_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'slack', 'sms', 'webhook')),
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alert_templates table
CREATE TABLE IF NOT EXISTS alert_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  threat_types TEXT[] NOT NULL,
  severity_levels TEXT[] NOT NULL,
  channels TEXT[] NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  conditions JSONB NOT NULL,
  channels TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 15,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_threat_events_type_severity 
ON threat_events(type, severity);

CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp 
ON threat_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_threat_events_user_id 
ON threat_events(user_id);

CREATE INDEX IF NOT EXISTS idx_threat_events_organization_id 
ON threat_events(organization_id);

CREATE INDEX IF NOT EXISTS idx_threat_events_ip_address 
ON threat_events(ip_address);

CREATE INDEX IF NOT EXISTS idx_threat_events_resolved 
ON threat_events(resolved, false_positive);

CREATE INDEX IF NOT EXISTS idx_alert_logs_threat_id 
ON alert_logs(threat_id);

CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at 
ON alert_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_logs_delivery_status 
ON alert_logs(delivery_status);

-- Enable RLS
ALTER TABLE threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threat_events
CREATE POLICY "Users can view their own threat events" ON threat_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all threat events" ON threat_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for alert_logs
CREATE POLICY "Admins can view alert logs" ON alert_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for alert_channels
CREATE POLICY "Admins can manage alert channels" ON alert_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for alert_templates
CREATE POLICY "Admins can manage alert templates" ON alert_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for alert_rules
CREATE POLICY "Admins can manage alert rules" ON alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Function to get threat statistics
CREATE OR REPLACE FUNCTION get_threat_statistics(
  p_organization_id UUID DEFAULT NULL,
  p_time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
  threat_type VARCHAR(50),
  severity VARCHAR(20),
  count BIGINT,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.type as threat_type,
    te.severity,
    COUNT(*) as count,
    MAX(te.timestamp) as last_occurrence
  FROM threat_events te
  WHERE te.timestamp >= NOW() - p_time_range
    AND (p_organization_id IS NULL OR te.organization_id = p_organization_id)
  GROUP BY te.type, te.severity
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get threat trends
CREATE OR REPLACE FUNCTION get_threat_trends(
  p_organization_id UUID DEFAULT NULL,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  hour TIMESTAMPTZ,
  threat_count BIGINT,
  critical_count BIGINT,
  high_count BIGINT,
  medium_count BIGINT,
  low_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('hour', te.timestamp) as hour,
    COUNT(*) as threat_count,
    COUNT(*) FILTER (WHERE te.severity = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE te.severity = 'high') as high_count,
    COUNT(*) FILTER (WHERE te.severity = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE te.severity = 'low') as low_count
  FROM threat_events te
  WHERE te.timestamp >= NOW() - (p_hours || ' hours')::INTERVAL
    AND (p_organization_id IS NULL OR te.organization_id = p_organization_id)
  GROUP BY date_trunc('hour', te.timestamp)
  ORDER BY hour DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve threat event
CREATE OR REPLACE FUNCTION resolve_threat_event(
  p_threat_id VARCHAR(255),
  p_resolved_by UUID,
  p_resolution_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE threat_events
  SET 
    resolved = true,
    resolved_at = NOW(),
    resolved_by = p_resolved_by,
    resolution_notes = p_resolution_notes,
    updated_at = NOW()
  WHERE id = p_threat_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark threat as false positive
CREATE OR REPLACE FUNCTION mark_threat_false_positive(
  p_threat_id VARCHAR(255),
  p_marked_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE threat_events
  SET 
    false_positive = true,
    resolved = true,
    resolved_at = NOW(),
    resolved_by = p_marked_by,
    resolution_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_threat_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default alert templates
INSERT INTO alert_templates (id, name, subject, body, threat_types, severity_levels, channels, is_default, created_by)
VALUES 
  (
    uuid_generate_v4(),
    'Default Threat Alert',
    'Security Alert: {{threatType}} detected',
    'A {{severity}} security threat has been detected:

Threat Type: {{threatType}}
Severity: {{severity}}
User ID: {{userId}}
Organization ID: {{organizationId}}
IP Address: {{ipAddress}}
Endpoint: {{endpoint}}
Timestamp: {{timestamp}}

Details:
{{details}}',
    ARRAY['brute_force', 'credential_stuffing', 'sql_injection', 'unusual_access', 'geographic_anomaly', 'rate_limit_abuse'],
    ARRAY['low', 'medium', 'high', 'critical'],
    ARRAY['email', 'slack'],
    true,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Critical Threat Alert',
    '🚨 CRITICAL SECURITY ALERT: {{threatType}}',
    '🚨 IMMEDIATE ATTENTION REQUIRED 🚨

A CRITICAL security threat has been detected and requires immediate action:

Threat Type: {{threatType}}
Severity: {{severity}}
User ID: {{userId}}
Organization ID: {{organizationId}}
IP Address: {{ipAddress}}
Endpoint: {{endpoint}}
Timestamp: {{timestamp}}

Details:
{{details}}

Please investigate and take appropriate action immediately.',
    ARRAY['brute_force', 'sql_injection', 'credential_stuffing'],
    ARRAY['critical', 'high'],
    ARRAY['email', 'slack', 'sms'],
    false,
    NULL
  );

-- Insert default alert rules
INSERT INTO alert_rules (id, name, conditions, channels, enabled, cooldown_minutes, created_by)
VALUES 
  (
    uuid_generate_v4(),
    'Critical Security Threats',
    '{"threatTypes": ["brute_force", "sql_injection", "credential_stuffing"], "severity": ["critical", "high"]}',
    ARRAY['email', 'slack', 'sms'],
    true,
    5,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Medium Security Threats',
    '{"threatTypes": ["unusual_access", "rate_limit_abuse"], "severity": ["medium"]}',
    ARRAY['email', 'slack'],
    true,
    15,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Low Security Threats',
    '{"threatTypes": ["geographic_anomaly"], "severity": ["low"]}',
    ARRAY['email'],
    true,
    60,
    NULL
  );
