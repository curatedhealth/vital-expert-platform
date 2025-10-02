-- ===================================================================
-- VITAL Path Platform - Enhanced Phase 1: Event-Driven Architecture
-- Migration: 003_event_driven_architecture.sql
-- Version: 1.0.0
-- Created: 2025-09-24
-- ===================================================================

-- ===================================================================
-- 1. REAL-TIME EVENT STREAMING INFRASTRUCTURE
-- ===================================================================

-- Event Stream Definitions
CREATE TABLE event_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    stream_name VARCHAR(100) UNIQUE NOT NULL,
    stream_description TEXT,
    stream_type VARCHAR(50) NOT NULL, -- clinical_data, user_activity, system_events, dtx_usage
    schema_definition JSONB NOT NULL, -- Event schema for validation
    retention_policy JSONB DEFAULT '{"days": 90, "max_events": 1000000}',
    partition_strategy VARCHAR(50) DEFAULT 'time_based', -- time_based, hash_based, key_based
    compression_enabled BOOLEAN DEFAULT TRUE,
    encryption_enabled BOOLEAN DEFAULT TRUE,
    access_control JSONB DEFAULT '{}', -- Stream access permissions
    monitoring_config JSONB DEFAULT '{}', -- Alerting, metrics collection
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (stream_type),
    INDEX (is_active)
);

-- Real-time Event Log with High-Performance Ingestion
CREATE TABLE event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    stream_id UUID NOT NULL REFERENCES event_streams(id),
    event_id VARCHAR(100) NOT NULL, -- Unique event identifier
    event_type VARCHAR(100) NOT NULL,
    event_version VARCHAR(20) DEFAULT '1.0',
    source_system VARCHAR(100) NOT NULL, -- Origin system/service
    source_user UUID REFERENCES users(id),
    correlation_id UUID, -- For request tracing
    causation_id UUID, -- Event that caused this event
    aggregate_id UUID, -- Business entity reference
    aggregate_type VARCHAR(100), -- Entity type
    event_payload JSONB NOT NULL, -- Event data
    metadata JSONB DEFAULT '{}', -- Additional context
    trace_context JSONB DEFAULT '{}', -- Distributed tracing info
    timestamp_occurred TIMESTAMPTZ DEFAULT NOW(),
    timestamp_recorded TIMESTAMPTZ DEFAULT NOW(),
    sequence_number BIGSERIAL,
    partition_key VARCHAR(100), -- For consistent partitioning
    processing_status VARCHAR(30) DEFAULT 'pending', -- pending, processing, processed, failed
    retry_count INTEGER DEFAULT 0,
    error_details JSONB,
    INDEX (organization_id),
    INDEX (stream_id),
    INDEX (event_type),
    INDEX (source_system),
    INDEX (aggregate_id),
    INDEX (timestamp_occurred),
    INDEX (processing_status),
    INDEX (partition_key),
    UNIQUE (stream_id, event_id)
) PARTITION BY RANGE (timestamp_occurred);

-- Create time-based partitions for event log
CREATE TABLE event_log_2025_09 PARTITION OF event_log
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE event_log_2025_10 PARTITION OF event_log
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE event_log_2025_11 PARTITION OF event_log
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE event_log_2025_12 PARTITION OF event_log
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- ===================================================================
-- 2. WEBSOCKET & REAL-TIME CONNECTION MANAGEMENT
-- ===================================================================

-- WebSocket Connection Registry
CREATE TABLE websocket_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    connection_id VARCHAR(255) UNIQUE NOT NULL, -- WebSocket connection ID
    socket_endpoint VARCHAR(255) NOT NULL, -- Connection endpoint
    client_info JSONB DEFAULT '{}', -- Browser, device info
    subscription_topics JSONB DEFAULT '[]', -- Subscribed event types
    connection_state VARCHAR(30) DEFAULT 'connected', -- connected, disconnected, error
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_received INTEGER DEFAULT 0,
    connection_quality JSONB DEFAULT '{}', -- Latency, packet loss
    bandwidth_usage BIGINT DEFAULT 0, -- Bytes transferred
    rate_limit_remaining INTEGER DEFAULT 1000, -- Messages per window
    rate_limit_reset_time TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ,
    INDEX (organization_id),
    INDEX (user_id),
    INDEX (connection_id),
    INDEX (connection_state),
    INDEX (last_heartbeat),
    INDEX (last_activity_at)
);

-- Real-time Subscription Management
CREATE TABLE event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    connection_id UUID NOT NULL REFERENCES websocket_connections(id),
    subscription_name VARCHAR(255) NOT NULL,
    event_types JSONB NOT NULL DEFAULT '[]', -- Subscribed event types
    filter_conditions JSONB DEFAULT '{}', -- Event filtering rules
    delivery_options JSONB DEFAULT '{}', -- QoS, batching, ordering
    subscription_state VARCHAR(30) DEFAULT 'active', -- active, paused, cancelled
    last_delivered_sequence BIGINT DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    delivery_failures INTEGER DEFAULT 0,
    backpressure_status VARCHAR(30) DEFAULT 'normal', -- normal, throttled, blocked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    INDEX (organization_id),
    INDEX (connection_id),
    INDEX (subscription_state),
    INDEX USING GIN (event_types),
    UNIQUE (connection_id, subscription_name)
);

-- ===================================================================
-- 3. DIGITAL HEALTH EVENT TYPES & SCHEMAS
-- ===================================================================

-- Clinical Event Types for Digital Health
INSERT INTO event_streams (organization_id, stream_name, stream_description, stream_type, schema_definition)
SELECT
    o.id,
    'clinical_observations',
    'Real-time clinical observations and vital signs from digital health interventions',
    'clinical_data',
    '{
        "type": "object",
        "required": ["patient_id", "observation_type", "value", "timestamp"],
        "properties": {
            "patient_id": {"type": "string", "format": "uuid"},
            "observation_type": {"type": "string", "enum": ["vital_signs", "symptoms", "medication_adherence", "behavior_metrics"]},
            "value": {"type": "object"},
            "unit": {"type": "string"},
            "device_id": {"type": "string"},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
            "clinical_context": {"type": "object"},
            "timestamp": {"type": "string", "format": "date-time"}
        }
    }'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO event_streams (organization_id, stream_name, stream_description, stream_type, schema_definition)
SELECT
    o.id,
    'dtx_engagement',
    'Digital therapeutics user engagement and usage patterns',
    'dtx_usage',
    '{
        "type": "object",
        "required": ["user_id", "intervention_id", "engagement_type", "session_data"],
        "properties": {
            "user_id": {"type": "string", "format": "uuid"},
            "intervention_id": {"type": "string", "format": "uuid"},
            "engagement_type": {"type": "string", "enum": ["session_start", "session_end", "module_complete", "goal_achieved", "reminder_interaction"]},
            "session_data": {
                "type": "object",
                "properties": {
                    "duration_seconds": {"type": "integer"},
                    "interactions": {"type": "array"},
                    "completion_rate": {"type": "number"},
                    "user_feedback": {"type": "object"}
                }
            },
            "clinical_outcomes": {"type": "object"},
            "timestamp": {"type": "string", "format": "date-time"}
        }
    }'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO event_streams (organization_id, stream_name, stream_description, stream_type, schema_definition)
SELECT
    o.id,
    'safety_monitoring',
    'Real-time safety event detection and adverse event reporting',
    'clinical_data',
    '{
        "type": "object",
        "required": ["event_type", "severity", "patient_reference", "event_data"],
        "properties": {
            "event_type": {"type": "string", "enum": ["adverse_event", "device_malfunction", "data_anomaly", "safety_signal"]},
            "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
            "patient_reference": {"type": "string"},
            "intervention_id": {"type": "string", "format": "uuid"},
            "event_data": {"type": "object"},
            "detection_method": {"type": "string", "enum": ["automated", "clinician_reported", "patient_reported"]},
            "immediate_actions": {"type": "array"},
            "timestamp": {"type": "string", "format": "date-time"}
        }
    }'::jsonb
FROM organizations o WHERE o.slug = 'vital-demo';

-- ===================================================================
-- 4. EVENT PROCESSING & WORKFLOW ORCHESTRATION
-- ===================================================================

-- Event Processing Rules Engine
CREATE TABLE event_processing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    event_pattern JSONB NOT NULL, -- Event matching pattern
    condition_logic JSONB NOT NULL, -- Processing conditions
    action_definition JSONB NOT NULL, -- Actions to execute
    rule_priority INTEGER DEFAULT 100, -- Processing priority
    rule_state VARCHAR(30) DEFAULT 'active', -- active, disabled, testing
    execution_mode VARCHAR(30) DEFAULT 'synchronous', -- synchronous, asynchronous, batch
    rate_limit JSONB DEFAULT '{"max_executions": 1000, "window_minutes": 60}',
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_strategy": "exponential"}',
    success_criteria JSONB DEFAULT '{}', -- Rule success metrics
    failure_handling JSONB DEFAULT '{}', -- Error handling strategy
    performance_metrics JSONB DEFAULT '{}', -- Execution statistics
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (rule_state),
    INDEX (rule_priority),
    INDEX (execution_mode),
    INDEX (last_executed_at)
);

-- Workflow Orchestration for Digital Health Processes
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_description TEXT,
    workflow_type VARCHAR(100) NOT NULL, -- clinical_pathway, safety_protocol, data_pipeline, user_journey
    trigger_events JSONB NOT NULL DEFAULT '[]', -- Events that trigger workflow
    workflow_steps JSONB NOT NULL DEFAULT '[]', -- Step definitions
    input_schema JSONB NOT NULL, -- Expected input format
    output_schema JSONB NOT NULL, -- Expected output format
    sla_requirements JSONB DEFAULT '{}', -- Performance requirements
    compliance_rules JSONB DEFAULT '[]', -- Regulatory compliance
    approval_workflow JSONB DEFAULT '{}', -- Human approval steps
    rollback_strategy JSONB DEFAULT '{}', -- Error recovery
    monitoring_config JSONB DEFAULT '{}', -- Workflow monitoring
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(50) DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    INDEX (organization_id),
    INDEX (workflow_type),
    INDEX (is_active),
    INDEX USING GIN (trigger_events)
);

-- Workflow Execution Instances
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id),
    execution_id VARCHAR(100) UNIQUE NOT NULL, -- Unique execution identifier
    trigger_event_id UUID REFERENCES event_log(id),
    input_data JSONB NOT NULL,
    current_step INTEGER DEFAULT 0,
    execution_status VARCHAR(30) DEFAULT 'running', -- running, completed, failed, cancelled, paused
    execution_context JSONB DEFAULT '{}', -- Runtime context
    step_history JSONB DEFAULT '[]', -- Execution history
    output_data JSONB,
    error_details JSONB,
    performance_metrics JSONB DEFAULT '{}', -- Timing, resource usage
    sla_status VARCHAR(30) DEFAULT 'on_track', -- on_track, at_risk, breached
    human_tasks JSONB DEFAULT '[]', -- Pending human interventions
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (workflow_id),
    INDEX (execution_status),
    INDEX (sla_status),
    INDEX (started_at),
    INDEX (last_activity_at)
) PARTITION BY RANGE (started_at);

-- Create partitions for workflow executions
CREATE TABLE workflow_executions_2025_09 PARTITION OF workflow_executions
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE workflow_executions_2025_10 PARTITION OF workflow_executions
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- ===================================================================
-- 5. DIGITAL HEALTH ANALYTICS & REAL-TIME MONITORING
-- ===================================================================

-- Real-time Analytics Aggregations
CREATE TABLE real_time_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- clinical, engagement, safety, performance
    dimensions JSONB NOT NULL DEFAULT '{}', -- Grouping dimensions
    aggregation_type VARCHAR(30) NOT NULL, -- count, sum, avg, min, max, percentile
    metric_value NUMERIC NOT NULL,
    confidence_interval JSONB, -- Statistical confidence
    sample_size INTEGER,
    calculation_method TEXT, -- How metric was calculated
    data_sources JSONB DEFAULT '[]', -- Source event streams
    time_window INTERVAL, -- Aggregation window
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- When to purge old metrics
    is_alerting_enabled BOOLEAN DEFAULT FALSE,
    alert_thresholds JSONB DEFAULT '{}', -- Alert conditions
    INDEX (organization_id),
    INDEX (metric_name),
    INDEX (metric_category),
    INDEX (timestamp),
    INDEX (expires_at),
    INDEX USING GIN (dimensions)
) PARTITION BY RANGE (timestamp);

-- Create hourly partitions for real-time metrics
CREATE TABLE real_time_metrics_2025_09_24_00 PARTITION OF real_time_metrics
    FOR VALUES FROM ('2025-09-24 00:00:00') TO ('2025-09-24 01:00:00');
CREATE TABLE real_time_metrics_2025_09_24_01 PARTITION OF real_time_metrics
    FOR VALUES FROM ('2025-09-24 01:00:00') TO ('2025-09-24 02:00:00');

-- Patient Real-time Status Dashboard
CREATE TABLE patient_real_time_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    patient_fhir_id VARCHAR(64) NOT NULL,
    intervention_id UUID REFERENCES digital_interventions(id),
    current_status JSONB NOT NULL DEFAULT '{}', -- Overall patient status
    vital_signs JSONB DEFAULT '{}', -- Latest vital signs
    medication_adherence JSONB DEFAULT '{}', -- Adherence metrics
    engagement_metrics JSONB DEFAULT '{}', -- DTx engagement
    clinical_alerts JSONB DEFAULT '[]', -- Active clinical alerts
    safety_flags JSONB DEFAULT '[]', -- Safety concerns
    care_plan_progress JSONB DEFAULT '{}', -- Care plan status
    next_scheduled_actions JSONB DEFAULT '[]', -- Upcoming actions
    risk_scores JSONB DEFAULT '{}', -- Risk stratification
    last_contact TIMESTAMPTZ,
    status_confidence NUMERIC(3,2) DEFAULT 0.95, -- Confidence in status
    data_freshness JSONB DEFAULT '{}', -- When each data point was last updated
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX (organization_id),
    INDEX (patient_fhir_id),
    INDEX (intervention_id),
    INDEX (last_contact),
    INDEX (updated_at),
    UNIQUE (organization_id, patient_fhir_id)
);

-- ===================================================================
-- 6. DIGITAL HEALTH SPECIFIC EVENT PROCESSING FUNCTIONS
-- ===================================================================

-- Clinical Event Validation Function
CREATE OR REPLACE FUNCTION validate_clinical_event(
    event_data JSONB,
    stream_schema JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    validation_result BOOLEAN := TRUE;
    required_fields TEXT[];
    field TEXT;
BEGIN
    -- Extract required fields from schema
    SELECT array_agg(key) INTO required_fields
    FROM jsonb_object_keys(stream_schema->'properties') AS key
    WHERE key = ANY(SELECT jsonb_array_elements_text(stream_schema->'required'));

    -- Check required fields are present
    FOREACH field IN ARRAY required_fields
    LOOP
        IF NOT event_data ? field THEN
            validation_result := FALSE;
            EXIT;
        END IF;
    END LOOP;

    -- Additional clinical data validation logic can be added here

    RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Event Processing Trigger Function
CREATE OR REPLACE FUNCTION process_event_trigger()
RETURNS TRIGGER AS $$
DECLARE
    matching_rules RECORD;
    processing_result JSONB;
BEGIN
    -- Find matching processing rules
    FOR matching_rules IN
        SELECT * FROM event_processing_rules epr
        WHERE epr.organization_id = NEW.organization_id
          AND epr.rule_state = 'active'
          AND NEW.event_payload @> epr.event_pattern
        ORDER BY epr.rule_priority ASC
    LOOP
        -- Execute rule actions (simplified - would call external processing service)
        INSERT INTO usage_analytics (
            organization_id,
            user_id,
            event_type,
            resource_type,
            resource_id,
            metrics,
            timestamp
        ) VALUES (
            NEW.organization_id,
            NEW.source_user,
            'event_rule_triggered',
            'event_processing_rule',
            matching_rules.id,
            jsonb_build_object(
                'rule_name', matching_rules.rule_name,
                'event_type', NEW.event_type,
                'processing_timestamp', NOW()
            ),
            NOW()
        );

        -- Update rule execution statistics
        UPDATE event_processing_rules
        SET execution_count = execution_count + 1,
            last_executed_at = NOW()
        WHERE id = matching_rules.id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply event processing trigger
CREATE TRIGGER event_processing_trigger
    AFTER INSERT ON event_log
    FOR EACH ROW
    EXECUTE FUNCTION process_event_trigger();

-- Real-time Patient Status Update Function
CREATE OR REPLACE FUNCTION update_patient_real_time_status(
    org_id UUID,
    patient_id VARCHAR,
    status_update JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO patient_real_time_status (
        organization_id,
        patient_fhir_id,
        current_status,
        updated_at
    )
    VALUES (
        org_id,
        patient_id,
        status_update,
        NOW()
    )
    ON CONFLICT (organization_id, patient_fhir_id)
    DO UPDATE SET
        current_status = patient_real_time_status.current_status || status_update,
        updated_at = NOW();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- WebSocket Connection Cleanup Function
CREATE OR REPLACE FUNCTION cleanup_websocket_connections()
RETURNS void AS $$
BEGIN
    -- Mark stale connections as disconnected
    UPDATE websocket_connections
    SET connection_state = 'disconnected',
        disconnected_at = NOW()
    WHERE connection_state = 'connected'
      AND last_heartbeat < NOW() - INTERVAL '5 minutes';

    -- Clean up old disconnected connections
    DELETE FROM websocket_connections
    WHERE connection_state = 'disconnected'
      AND disconnected_at < NOW() - INTERVAL '24 hours';

    -- Clean up associated subscriptions
    DELETE FROM event_subscriptions
    WHERE connection_id NOT IN (
        SELECT id FROM websocket_connections
        WHERE connection_state = 'connected'
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 7. PERFORMANCE OPTIMIZATIONS & INDEXES
-- ===================================================================

-- High-performance indexes for event processing
CREATE INDEX CONCURRENTLY event_log_processing_idx ON event_log (organization_id, processing_status, timestamp_occurred) WHERE processing_status != 'processed';
CREATE INDEX CONCURRENTLY event_log_aggregate_idx ON event_log (aggregate_id, aggregate_type, timestamp_occurred);
CREATE INDEX CONCURRENTLY event_log_correlation_idx ON event_log (correlation_id) WHERE correlation_id IS NOT NULL;

-- WebSocket performance indexes
CREATE INDEX CONCURRENTLY websocket_heartbeat_idx ON websocket_connections (last_heartbeat) WHERE connection_state = 'connected';
CREATE INDEX CONCURRENTLY event_subscriptions_delivery_idx ON event_subscriptions (subscription_state, last_delivered_sequence);

-- Real-time metrics indexes
CREATE INDEX CONCURRENTLY real_time_metrics_category_idx ON real_time_metrics (organization_id, metric_category, timestamp);
CREATE INDEX CONCURRENTLY real_time_metrics_alerting_idx ON real_time_metrics (is_alerting_enabled, metric_name) WHERE is_alerting_enabled = TRUE;

-- Patient status indexes
CREATE INDEX CONCURRENTLY patient_status_intervention_idx ON patient_real_time_status (intervention_id, updated_at);
CREATE INDEX CONCURRENTLY patient_status_alerts_idx ON patient_real_time_status USING GIN (clinical_alerts) WHERE jsonb_array_length(clinical_alerts) > 0;

-- ===================================================================
-- 8. INITIAL CONFIGURATION & SAMPLE RULES
-- ===================================================================

-- Sample Event Processing Rules for Digital Health
INSERT INTO event_processing_rules (
    organization_id,
    rule_name,
    rule_description,
    event_pattern,
    condition_logic,
    action_definition,
    created_by
)
SELECT
    o.id,
    'Critical Vital Signs Alert',
    'Trigger immediate clinical alert for critical vital signs values',
    '{"event_type": "clinical_observation", "observation_type": "vital_signs"}'::jsonb,
    '{"severity": "critical", "requires_immediate_attention": true}'::jsonb,
    '{"actions": [{"type": "clinical_alert", "urgency": "immediate"}, {"type": "notify_care_team", "escalation_level": 1}]}'::jsonb,
    (SELECT id FROM users WHERE email = 'admin@vitalpath.ai' LIMIT 1)
FROM organizations o WHERE o.slug = 'vital-demo';

INSERT INTO event_processing_rules (
    organization_id,
    rule_name,
    rule_description,
    event_pattern,
    condition_logic,
    action_definition,
    created_by
)
SELECT
    o.id,
    'DTx Engagement Monitoring',
    'Monitor digital therapeutics engagement patterns and trigger interventions',
    '{"event_type": "dtx_engagement"}'::jsonb,
    '{"low_engagement_threshold": 0.3, "consecutive_missed_sessions": 3}'::jsonb,
    '{"actions": [{"type": "engagement_intervention", "method": "personalized_reminder"}, {"type": "update_care_plan", "recommendation": "increase_support"}]}'::jsonb,
    (SELECT id FROM users WHERE email = 'admin@vitalpath.ai' LIMIT 1)
FROM organizations o WHERE o.slug = 'vital-demo';

-- Sample Workflow Definitions
INSERT INTO workflow_definitions (
    organization_id,
    workflow_name,
    workflow_description,
    workflow_type,
    trigger_events,
    workflow_steps,
    input_schema,
    output_schema,
    created_by
)
SELECT
    o.id,
    'Safety Event Response Protocol',
    'Automated workflow for responding to digital health safety events',
    'safety_protocol',
    '["safety_monitoring"]'::jsonb,
    '[
        {"step": 1, "name": "immediate_assessment", "type": "automated", "timeout": "5min"},
        {"step": 2, "name": "clinician_notification", "type": "notification", "timeout": "15min"},
        {"step": 3, "name": "patient_safety_check", "type": "human_task", "timeout": "1hour"},
        {"step": 4, "name": "incident_documentation", "type": "automated", "timeout": "30min"},
        {"step": 5, "name": "regulatory_reporting", "type": "conditional", "timeout": "24hours"}
    ]'::jsonb,
    '{"type": "object", "properties": {"safety_event": {"type": "object"}, "patient_context": {"type": "object"}}}'::jsonb,
    '{"type": "object", "properties": {"resolution_status": {"type": "string"}, "follow_up_required": {"type": "boolean"}}}'::jsonb,
    (SELECT id FROM users WHERE email = 'admin@vitalpath.ai' LIMIT 1)
FROM organizations o WHERE o.slug = 'vital-demo';

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Event-Driven Architecture Migration Complete';
    RAISE NOTICE 'Features: Real-time Event Streaming, WebSocket Management, Workflow Orchestration';
    RAISE NOTICE 'Digital Health: Clinical Event Processing, Safety Monitoring, Patient Status Tracking';
    RAISE NOTICE 'Performance: Partitioned Tables, Optimized Indexes, Real-time Analytics';
END $$;