-- ============================================================================
-- INITIAL SCHEMA MIGRATION
-- ============================================================================
-- Description: Core database schema for Ask Expert platform
-- Version: 1.0.0
-- Date: 2025-01-27
-- Compliance: HIPAA, GDPR, CCPA, SOC 2
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Orchestration modes (5-mode system)
CREATE TYPE orchestration_mode AS ENUM (
  'query_automatic',
  'query_manual',
  'chat_automatic',
  'chat_manual',
  'agent'
);

-- Agent tier levels
CREATE TYPE agent_tier AS ENUM (
  'tier_1',
  'tier_2',
  'tier_3'
);

-- Agent operational status
CREATE TYPE agent_status AS ENUM (
  'active',
  'inactive',
  'testing'
);

-- Compliance levels
CREATE TYPE compliance_level AS ENUM (
  'standard',
  'hipaa',
  'gdpr',
  'fda',
  'soc2',
  'ccpa'
);

-- Message roles
CREATE TYPE message_role AS ENUM (
  'user',
  'assistant',
  'system'
);

-- Conversation status
CREATE TYPE conversation_status AS ENUM (
  'active',
  'archived',
  'deleted'
);

-- Intent types
CREATE TYPE intent_type AS ENUM (
  'question',
  'task',
  'consultation',
  'analysis',
  'generation'
);

-- Complexity levels
CREATE TYPE complexity_level AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

-- Urgency levels
CREATE TYPE urgency_level AS ENUM (
  'low',
  'standard',
  'high',
  'urgent'
);

-- Checkpoint types (Mode 5)
CREATE TYPE checkpoint_type AS ENUM (
  'approval',
  'review',
  'decision',
  'safety'
);

-- Checkpoint status
CREATE TYPE checkpoint_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Data subject request types (GDPR/CCPA)
CREATE TYPE dsr_type AS ENUM (
  'access',
  'deletion',
  'portability',
  'rectification'
);

-- Data subject request status
CREATE TYPE dsr_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'rejected'
);

-- Regulation types
CREATE TYPE regulation_type AS ENUM (
  'GDPR',
  'CCPA',
  'HIPAA'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Tenants (multi-tenant architecture)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  domain VARCHAR(255) UNIQUE,
  compliance_level compliance_level NOT NULL DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  preferences JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Agents (AI expert definitions)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tier agent_tier NOT NULL DEFAULT 'tier_3',
  status agent_status NOT NULL DEFAULT 'active',
  knowledge_domains TEXT[] NOT NULL DEFAULT '{}',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  embedding vector(1536), -- OpenAI text-embedding-3-large
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT agents_knowledge_domains_not_empty CHECK (array_length(knowledge_domains, 1) > 0),
  CONSTRAINT agents_priority_range CHECK (priority BETWEEN 0 AND 1000)
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  mode orchestration_mode NOT NULL,
  status conversation_status NOT NULL DEFAULT 'active',
  compliance_level compliance_level NOT NULL DEFAULT 'standard',
  persistent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT conversations_deleted_check CHECK (
    (status = 'deleted' AND deleted_at IS NOT NULL) OR
    (status != 'deleted' AND deleted_at IS NULL)
  )
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  reasoning TEXT[],
  citations TEXT[],
  confidence NUMERIC(3, 2),
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  estimated_cost NUMERIC(10, 6),
  latency_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT messages_content_not_empty CHECK (length(trim(content)) > 0),
  CONSTRAINT messages_confidence_range CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  CONSTRAINT messages_tokens_positive CHECK (
    (tokens_prompt IS NULL OR tokens_prompt >= 0) AND
    (tokens_completion IS NULL OR tokens_completion >= 0) AND
    (tokens_total IS NULL OR tokens_total >= 0)
  )
);

-- Sources (RAG documents)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  similarity NUMERIC(5, 4) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sources_similarity_range CHECK (similarity BETWEEN 0 AND 1)
);

-- Agent Metrics (usage tracking)
CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  average_latency_ms INTEGER,
  satisfaction_score NUMERIC(3, 2),
  last_used_at TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT agent_metrics_satisfaction_range CHECK (
    satisfaction_score IS NULL OR
    (satisfaction_score >= 0 AND satisfaction_score <= 5)
  ),
  CONSTRAINT agent_metrics_unique_daily UNIQUE (agent_id, tenant_id, date)
);

-- Intent Classifications (query analysis)
CREATE TABLE intent_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  primary_intent intent_type NOT NULL,
  primary_domain VARCHAR(100) NOT NULL,
  domains TEXT[] NOT NULL,
  confidence NUMERIC(3, 2) NOT NULL,
  complexity complexity_level NOT NULL,
  urgency urgency_level NOT NULL,
  requires_multiple_experts BOOLEAN NOT NULL DEFAULT FALSE,
  reasoning TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT intent_confidence_range CHECK (confidence BETWEEN 0 AND 1)
);

-- Checkpoints (Mode 5 human-in-the-loop)
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type checkpoint_type NOT NULL,
  description TEXT NOT NULL,
  status checkpoint_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  CONSTRAINT checkpoints_resolved_check CHECK (
    (status = 'pending' AND resolved_at IS NULL) OR
    (status != 'pending' AND resolved_at IS NOT NULL)
  )
);

-- Task Plans (Mode 5 autonomous execution)
CREATE TABLE task_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Task Steps (Mode 5 execution steps)
CREATE TABLE task_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_plan_id UUID NOT NULL REFERENCES task_plans(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT task_steps_unique_step UNIQUE (task_plan_id, step_number)
);

-- ============================================================================
-- COMPLIANCE & AUDIT TABLES
-- ============================================================================

-- Audit Logs (HIPAA/GDPR/SOC 2 compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  phi_accessed TEXT[] NOT NULL DEFAULT '{}',
  pii_accessed TEXT[] NOT NULL DEFAULT '{}',
  compliance_level compliance_level NOT NULL,
  justification TEXT,
  session_id UUID NOT NULL,
  request_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Subject Requests (GDPR/CCPA compliance)
CREATE TABLE data_subject_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type dsr_type NOT NULL,
  status dsr_status NOT NULL DEFAULT 'pending',
  regulation regulation_type NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT dsr_completed_check CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

-- Consent Records (GDPR/CCPA compliance)
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose VARCHAR(200) NOT NULL,
  granted BOOLEAN NOT NULL,
  regulation regulation_type NOT NULL,
  version VARCHAR(20) NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT consent_revoked_check CHECK (
    (granted = TRUE AND revoked_at IS NULL) OR
    (granted = FALSE)
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_active ON tenants(is_active) WHERE is_active = TRUE;

-- Users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Agents
CREATE INDEX idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX idx_agents_status ON agents(status) WHERE status = 'active';
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);
CREATE INDEX idx_agents_embedding ON agents USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- Conversations
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_mode ON conversations(mode);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_agent_id ON messages(agent_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Sources
CREATE INDEX idx_sources_message_id ON sources(message_id);
CREATE INDEX idx_sources_similarity ON sources(similarity DESC);

-- Agent Metrics
CREATE INDEX idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_tenant_id ON agent_metrics(tenant_id);
CREATE INDEX idx_agent_metrics_date ON agent_metrics(date DESC);

-- Intent Classifications
CREATE INDEX idx_intent_classifications_conversation_id ON intent_classifications(conversation_id);
CREATE INDEX idx_intent_classifications_primary_intent ON intent_classifications(primary_intent);
CREATE INDEX idx_intent_classifications_complexity ON intent_classifications(complexity);

-- Checkpoints
CREATE INDEX idx_checkpoints_conversation_id ON checkpoints(conversation_id);
CREATE INDEX idx_checkpoints_status ON checkpoints(status);
CREATE INDEX idx_checkpoints_type ON checkpoints(type);

-- Task Plans
CREATE INDEX idx_task_plans_conversation_id ON task_plans(conversation_id);
CREATE INDEX idx_task_plans_created_at ON task_plans(created_at DESC);

-- Task Steps
CREATE INDEX idx_task_steps_task_plan_id ON task_steps(task_plan_id);
CREATE INDEX idx_task_steps_status ON task_steps(status);

-- Audit Logs
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);

-- Data Subject Requests
CREATE INDEX idx_dsr_tenant_id ON data_subject_requests(tenant_id);
CREATE INDEX idx_dsr_user_id ON data_subject_requests(user_id);
CREATE INDEX idx_dsr_status ON data_subject_requests(status);

-- Consent Records
CREATE INDEX idx_consent_records_tenant_id ON consent_records(tenant_id);
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_purpose ON consent_records(purpose);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_metrics_updated_at BEFORE UPDATE ON agent_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_plans_updated_at BEFORE UPDATE ON task_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_steps_updated_at BEFORE UPDATE ON task_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_agents_by_embedding(
  query_embedding vector(1536),
  match_threshold numeric DEFAULT 0.8,
  match_count integer DEFAULT 5,
  filter_tenant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name varchar,
  display_name varchar,
  tier agent_tier,
  similarity numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.display_name,
    a.tier,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM agents a
  WHERE
    a.status = 'active'
    AND (filter_tenant_id IS NULL OR a.tenant_id = filter_tenant_id)
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant organizations';
COMMENT ON TABLE users IS 'Platform users (extends Supabase auth)';
COMMENT ON TABLE agents IS 'AI expert agent definitions';
COMMENT ON TABLE conversations IS 'User conversation sessions';
COMMENT ON TABLE messages IS 'Chat messages in conversations';
COMMENT ON TABLE sources IS 'RAG source documents cited in responses';
COMMENT ON TABLE agent_metrics IS 'Agent usage and performance metrics';
COMMENT ON TABLE intent_classifications IS 'Query intent analysis results';
COMMENT ON TABLE checkpoints IS 'Human-in-the-loop approval points (Mode 5)';
COMMENT ON TABLE task_plans IS 'Autonomous task execution plans (Mode 5)';
COMMENT ON TABLE task_steps IS 'Individual steps in task plans';
COMMENT ON TABLE audit_logs IS 'HIPAA/GDPR/SOC 2 compliance audit trail';
COMMENT ON TABLE data_subject_requests IS 'GDPR/CCPA data subject rights requests';
COMMENT ON TABLE consent_records IS 'GDPR/CCPA consent tracking';
