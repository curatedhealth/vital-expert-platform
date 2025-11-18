-- Phase 1 Complete Database Schema
-- Creates all tables required for VITAL Path Phase 1 systems
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS retention_actions CASCADE;
DROP TABLE IF EXISTS consent_records CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS health_checks CASCADE;
DROP TABLE IF EXISTS traces CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS knowledge_documents CASCADE;

-- Knowledge Documents (Enhanced RAG System)
CREATE TABLE knowledge_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  upload_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  domain VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  chunk_count INTEGER DEFAULT 0,
  embedding vector(1536), -- OpenAI embeddings
  evidence_level VARCHAR(10),
  validation_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Document Chunks for RAG
CREATE TABLE document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Audit Events (Compliance Framework)
CREATE TABLE audit_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success', 'failure', 'warning')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  data_accessed TEXT[],
  changes JSONB,
  compliance_flags JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics (Observability System)
CREATE TABLE metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  value DECIMAL(20,6) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('counter', 'gauge', 'histogram', 'summary')),
  labels JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traces (Observability System)
CREATE TABLE traces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trace_id VARCHAR(100) NOT NULL,
  span_id VARCHAR(100) NOT NULL,
  parent_span_id VARCHAR(100),
  operation VARCHAR(255) NOT NULL,
  service VARCHAR(100) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('ok', 'error', 'timeout')),
  tags JSONB DEFAULT '{}',
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Checks (Observability System)
CREATE TABLE health_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  latency_ms INTEGER NOT NULL,
  details JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '[]',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts (Observability System)
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id VARCHAR(100) UNIQUE NOT NULL,
  rule_id VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Records (Compliance Framework)
CREATE TABLE consent_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consent_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('granted', 'denied', 'withdrawn', 'expired')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE,
  scope TEXT[] DEFAULT '{}',
  legal_basis VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Retention Actions (Compliance Framework)
CREATE TABLE retention_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  data_id VARCHAR(100) NOT NULL,
  policy_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('secure_delete', 'anonymize', 'pseudonymize')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Retention Tracking
CREATE TABLE data_retention_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  data_type VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  data_id VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_documents_user ON knowledge_documents(user_id);
CREATE INDEX idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_documents_domain ON knowledge_documents(domain);
CREATE INDEX idx_knowledge_documents_created ON knowledge_documents(created_at);
CREATE INDEX idx_knowledge_documents_embedding ON knowledge_documents USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_document_chunks_doc ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_audit_events_user ON audit_events(user_id);
CREATE INDEX idx_audit_events_operation ON audit_events(operation);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_outcome ON audit_events(outcome);

CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX idx_metrics_type ON metrics(type);

CREATE INDEX idx_traces_trace_id ON traces(trace_id);
CREATE INDEX idx_traces_span_id ON traces(span_id);
CREATE INDEX idx_traces_service ON traces(service);
CREATE INDEX idx_traces_start_time ON traces(start_time);

CREATE INDEX idx_health_checks_service ON health_checks(service);
CREATE INDEX idx_health_checks_timestamp ON health_checks(timestamp);
CREATE INDEX idx_health_checks_status ON health_checks(status);

CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);

CREATE INDEX idx_consent_records_user ON consent_records(user_id);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX idx_consent_records_status ON consent_records(status);

CREATE INDEX idx_retention_actions_policy ON retention_actions(policy_id);
CREATE INDEX idx_retention_actions_timestamp ON retention_actions(timestamp);

-- Enable Row Level Security
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (restrictive for security)
-- Knowledge documents - allow authenticated users to see their own and public docs
CREATE POLICY "knowledge_documents_authenticated" ON knowledge_documents
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "document_chunks_authenticated" ON document_chunks
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM knowledge_documents
    WHERE id = document_chunks.document_id
    AND (user_id = auth.uid() OR user_id IS NULL)
  ));

-- Audit events - service role only for security
CREATE POLICY "audit_events_service_role" ON audit_events
  FOR ALL TO service_role;

-- Metrics - service role only
CREATE POLICY "metrics_service_role" ON metrics
  FOR ALL TO service_role;

-- Traces - service role only
CREATE POLICY "traces_service_role" ON traces
  FOR ALL TO service_role;

-- Health checks - service role only
CREATE POLICY "health_checks_service_role" ON health_checks
  FOR ALL TO service_role;

-- Alerts - service role only
CREATE POLICY "alerts_service_role" ON alerts
  FOR ALL TO service_role;

-- Consent records - users can see their own
CREATE POLICY "consent_records_own" ON consent_records
  FOR ALL TO authenticated
  USING (user_id = auth.uid()::text);

-- Retention actions - service role only
CREATE POLICY "retention_actions_service_role" ON retention_actions
  FOR ALL TO service_role;

-- Data retention tracking - service role only
CREATE POLICY "data_retention_tracking_service_role" ON data_retention_tracking
  FOR ALL TO service_role;

-- Insert some sample data for testing
INSERT INTO knowledge_documents (
  title, content, file_name, file_type, status, domain, tags
) VALUES
(
  'HIPAA Compliance Guidelines',
  'Healthcare organizations must comply with HIPAA regulations to protect patient health information...',
  'hipaa_guidelines.pdf',
  'application/pdf',
  'completed',
  'regulatory',
  ARRAY['hipaa', 'compliance', 'healthcare']
),
(
  'Clinical Trial Best Practices',
  'This document outlines the best practices for conducting clinical trials in accordance with FDA guidelines...',
  'clinical_trial_best_practices.pdf',
  'application/pdf',
  'completed',
  'clinical',
  ARRAY['clinical-trials', 'fda', 'research']
);

-- Insert sample health check
INSERT INTO health_checks (
  service, status, latency_ms, details, dependencies, timestamp
) VALUES (
  'database', 'healthy', 25, '{"connection": "active"}', '[]', NOW()
);

COMMENT ON TABLE knowledge_documents IS 'Enhanced RAG system document storage with vector embeddings';
COMMENT ON TABLE document_chunks IS 'Document chunks for RAG retrieval with embeddings';
COMMENT ON TABLE audit_events IS 'Comprehensive audit trail for compliance';
COMMENT ON TABLE metrics IS 'System metrics for observability';
COMMENT ON TABLE traces IS 'Distributed tracing spans';
COMMENT ON TABLE health_checks IS 'Service health monitoring';
COMMENT ON TABLE alerts IS 'System alerts and notifications';
COMMENT ON TABLE consent_records IS 'User consent management for GDPR compliance';
COMMENT ON TABLE retention_actions IS 'Data retention policy enforcement actions';
COMMENT ON TABLE data_retention_tracking IS 'Tracks data subject to retention policies';