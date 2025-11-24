-- Chat, Conversations, and Knowledge Base Schema Migration
-- Creates tables for chat functionality, conversations, and document management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (if not exists from previous migrations)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'trial', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  max_projects INTEGER DEFAULT 3,
  max_users INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'clinician', 'researcher', 'member')),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (VITAL Journey instances)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN (
    'digital_therapeutic',
    'ai_diagnostic',
    'clinical_decision_support',
    'remote_monitoring',
    'telemedicine_platform',
    'health_analytics'
  )),
  current_phase TEXT DEFAULT 'vision' CHECK (current_phase IN ('vision', 'integrate', 'test', 'activate', 'learn')),
  phase_progress JSONB DEFAULT '{"vision": 0, "integrate": 0, "test": 0, "activate": 0, "learn": 0}',
  milestones JSONB DEFAULT '[]',
  regulatory_pathway TEXT,
  target_markets TEXT[],
  clinical_indication TEXT,
  patient_population TEXT,
  primary_endpoints TEXT[],
  secondary_endpoints TEXT[],
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  agent_id TEXT,
  agent_name TEXT,
  session_type TEXT DEFAULT 'chat' CHECK (session_type IN ('chat', 'workflow', 'analysis')),
  context JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (Chat conversations)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'function')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'code', 'json')),
  agent_id TEXT,
  agent_name TEXT,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  citations JSONB DEFAULT '[]',
  feedback JSONB,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN (
    'regulatory_guidance',
    'clinical_protocol',
    'market_research',
    'internal',
    'sop',
    'template',
    'faq',
    'policy'
  )),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  content TEXT,
  content_format TEXT DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'text', 'json')),
  source_url TEXT,
  source_type TEXT,
  embedding_model TEXT,
  vector_ids TEXT[],
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  knowledge_base_id UUID REFERENCES knowledge_base(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  file_path TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'regulatory_guidance',
    'clinical_protocol',
    'market_research',
    'internal',
    'sop',
    'template',
    'reference',
    'data_sheet'
  )),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  content_text TEXT,
  content_summary TEXT,
  extract_metadata JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  embedding_model TEXT,
  vector_ids TEXT[],
  source_url TEXT,
  page_count INTEGER,
  language TEXT DEFAULT 'en',
  is_processed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'organization', 'project', 'private')),
  created_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows (core workflow management)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN (
    'regulatory_submission',
    'clinical_protocol_review',
    'market_access_assessment',
    'rwe_data_collection',
    'compliance_check',
    'document_generation',
    'jtbd_execution'
  )),
  template_id TEXT,
  configuration JSONB DEFAULT '{}',
  definition JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  trigger_conditions JSONB DEFAULT '{}',
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'error', 'running', 'cancelled')),
  run_count INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('agent', 'human', 'system', 'condition', 'loop')),
  step_order INTEGER NOT NULL,
  description TEXT,
  configuration JSONB DEFAULT '{}',
  input_schema JSONB,
  output_schema JSONB,
  agent_id TEXT,
  required_capabilities TEXT[],
  is_optional BOOLEAN DEFAULT false,
  retry_config JSONB,
  timeout_seconds INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, step_order)
);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  execution_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB,
  output_data JSONB,
  step_results JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  error_message TEXT,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  triggered_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Icons table
CREATE TABLE IF NOT EXISTS icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  svg_content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinical Validations
CREATE TABLE IF NOT EXISTS clinical_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agent', 'capability', 'workflow', 'document', 'knowledge')),
  entity_id UUID NOT NULL,
  validation_type TEXT NOT NULL CHECK (validation_type IN ('clinical_accuracy', 'safety_review', 'efficacy_assessment', 'regulatory_compliance')),
  validator_id UUID REFERENCES users(id),
  validator_credentials TEXT,
  validation_date TIMESTAMPTZ DEFAULT NOW(),
  validation_result JSONB,
  accuracy_score DECIMAL(5,4) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  notes TEXT,
  expiration_date TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT true,
  audit_trail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_project ON chat_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_organization ON knowledge_base(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_project ON knowledge_base(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_type ON knowledge_base(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_knowledge_base ON documents(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_vector_ids ON documents USING GIN(vector_ids);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_workflows_organization ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_project ON workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON workflow_steps(workflow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);
CREATE INDEX IF NOT EXISTS idx_icons_active ON icons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_icons_tags ON icons USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clinical_validations_entity ON clinical_validations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_clinical_validations_type ON clinical_validations(validation_type);
CREATE INDEX IF NOT EXISTS idx_clinical_validations_current ON clinical_validations(is_current) WHERE is_current = true;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icons_updated_at BEFORE UPDATE ON icons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_validations_updated_at BEFORE UPDATE ON clinical_validations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_validations ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
CREATE POLICY "chat_sessions_select" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "chat_sessions_insert" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_sessions_update" ON chat_sessions FOR UPDATE USING (true);
CREATE POLICY "chat_sessions_delete" ON chat_sessions FOR DELETE USING (true);

-- Policies for conversations
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (true);
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_update" ON conversations FOR UPDATE USING (true);
CREATE POLICY "conversations_delete" ON conversations FOR DELETE USING (true);

-- Policies for messages
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (true);
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (true);

-- Policies for knowledge_base
CREATE POLICY "knowledge_base_select" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "knowledge_base_insert" ON knowledge_base FOR INSERT WITH CHECK (true);
CREATE POLICY "knowledge_base_update" ON knowledge_base FOR UPDATE USING (true);
CREATE POLICY "knowledge_base_delete" ON knowledge_base FOR DELETE USING (true);

-- Policies for documents
CREATE POLICY "documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (true);

-- Policies for workflows
CREATE POLICY "workflows_select" ON workflows FOR SELECT USING (true);
CREATE POLICY "workflows_insert" ON workflows FOR INSERT WITH CHECK (true);
CREATE POLICY "workflows_update" ON workflows FOR UPDATE USING (true);
CREATE POLICY "workflows_delete" ON workflows FOR DELETE USING (true);

-- Policies for workflow_steps
CREATE POLICY "workflow_steps_select" ON workflow_steps FOR SELECT USING (true);
CREATE POLICY "workflow_steps_insert" ON workflow_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "workflow_steps_update" ON workflow_steps FOR UPDATE USING (true);
CREATE POLICY "workflow_steps_delete" ON workflow_steps FOR DELETE USING (true);

-- Policies for workflow_executions
CREATE POLICY "workflow_executions_select" ON workflow_executions FOR SELECT USING (true);
CREATE POLICY "workflow_executions_insert" ON workflow_executions FOR INSERT WITH CHECK (true);
CREATE POLICY "workflow_executions_update" ON workflow_executions FOR UPDATE USING (true);
CREATE POLICY "workflow_executions_delete" ON workflow_executions FOR DELETE USING (true);

-- Policies for icons
CREATE POLICY "icons_select" ON icons FOR SELECT USING (true);
CREATE POLICY "icons_insert" ON icons FOR INSERT WITH CHECK (true);
CREATE POLICY "icons_update" ON icons FOR UPDATE USING (true);
CREATE POLICY "icons_delete" ON icons FOR DELETE USING (true);

-- Policies for clinical_validations
CREATE POLICY "clinical_validations_select" ON clinical_validations FOR SELECT USING (true);
CREATE POLICY "clinical_validations_insert" ON clinical_validations FOR INSERT WITH CHECK (true);
CREATE POLICY "clinical_validations_update" ON clinical_validations FOR UPDATE USING (true);
CREATE POLICY "clinical_validations_delete" ON clinical_validations FOR DELETE USING (true);