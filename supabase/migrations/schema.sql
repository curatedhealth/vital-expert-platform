-- VITALpath Database Schema
-- This schema supports the VITAL Framework: Vision, Integrate, Test, Activate, Learn

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings (if available)
-- Note: pgvector extension might need to be installed on your Supabase instance
-- You can enable it in Supabase Dashboard > Database > Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR(50) DEFAULT 'member',
  job_title VARCHAR(255),
  department VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(100), -- 'digital_therapeutics', 'medical_device', 'health_app', etc.
  current_phase VARCHAR(50) DEFAULT 'vision', -- 'vision', 'integrate', 'test', 'activate', 'learn'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'archived'
  target_market VARCHAR(255),
  regulatory_pathway VARCHAR(100), -- '510k', 'pma', 'ce_mark', etc.
  timeline_start DATE,
  timeline_end DATE,
  budget_allocated DECIMAL(12,2),
  budget_spent DECIMAL(12,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Project members table
CREATE TABLE project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- AI Agents table
CREATE TABLE ai_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model VARCHAR(100) DEFAULT 'gpt-4',
  avatar VARCHAR(50) DEFAULT '🤖',
  color VARCHAR(50) DEFAULT 'text-trust-blue',
  capabilities TEXT[] DEFAULT '{}',
  rag_enabled BOOLEAN DEFAULT true,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  is_custom BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat conversations table
CREATE TABLE chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id UUID REFERENCES ai_agents(id),
  title VARCHAR(500),
  message_count INTEGER DEFAULT 0,
  last_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  agent_id UUID REFERENCES ai_agents(id),
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_loading BOOLEAN DEFAULT false,
  has_error BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(500) NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  content_type VARCHAR(100),
  document_type VARCHAR(100), -- 'protocol', 'regulatory', 'clinical', 'technical', etc.
  phase VARCHAR(50), -- Which VITAL phase this document belongs to
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'archived'
  content TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- VITAL Framework milestones table
CREATE TABLE vital_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase VARCHAR(50) NOT NULL, -- 'vision', 'integrate', 'test', 'activate', 'learn'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'blocked'
  due_date DATE,
  completed_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  dependencies UUID[] DEFAULT '{}', -- Array of milestone IDs this depends on
  deliverables JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Knowledge base table for RAG
CREATE TABLE knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(100), -- 'regulation', 'guideline', 'best_practice', 'template', etc.
  source VARCHAR(500),
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- For OpenAI ada-002 embeddings
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_current_phase ON projects(current_phase);
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_project ON chat_conversations(project_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_vital_milestones_project ON vital_milestones(project_id);
CREATE INDEX idx_vital_milestones_phase ON vital_milestones(phase);
CREATE INDEX idx_knowledge_base_organization ON knowledge_base(organization_id);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their organization" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Chat conversations policies
CREATE POLICY "Users can view their own conversations" ON chat_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE user_id = auth.uid()
    )
  );

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at 
  BEFORE UPDATE ON ai_agents 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at 
  BEFORE UPDATE ON chat_conversations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_vital_milestones_updated_at 
  BEFORE UPDATE ON vital_milestones 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
  BEFORE UPDATE ON knowledge_base 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
