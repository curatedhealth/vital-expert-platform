-- Complete VITAL Expert Database Schema Migration
-- This migration creates all tables with proper relations for the VITAL Expert platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  country TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User organization memberships
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- =============================================
-- AI AGENTS SYSTEM
-- =============================================

-- Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  avatar TEXT,
  color TEXT,
  system_prompt TEXT,
  model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  context_window INTEGER DEFAULT 8000,
  capabilities TEXT[],
  business_function TEXT,
  department TEXT,
  role TEXT,
  tier INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',
  is_public BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent capabilities table
CREATE TABLE IF NOT EXISTS public.agent_capabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  capability_name TEXT NOT NULL,
  description TEXT,
  proficiency_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent knowledge domains
CREATE TABLE IF NOT EXISTS public.agent_knowledge_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  expertise_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LLM PROVIDERS & USAGE TRACKING
-- =============================================

-- LLM providers table
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  api_key TEXT,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  rate_limits JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  models JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM models table
CREATE TABLE IF NOT EXISTS public.llm_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  context_window INTEGER,
  max_tokens INTEGER,
  input_cost_per_1k DECIMAL(10,6),
  output_cost_per_1k DECIMAL(10,6),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM usage logs
CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  agent_id UUID REFERENCES public.agents(id),
  provider_id UUID REFERENCES public.llm_providers(id),
  model_id UUID REFERENCES public.llm_models(id),
  session_id TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10,4),
  latency_ms INTEGER,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- KNOWLEDGE MANAGEMENT
-- =============================================

-- Knowledge domains
CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.knowledge_domains(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge documents
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  domain_id UUID REFERENCES public.knowledge_domains(id),
  document_type TEXT DEFAULT 'text',
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document embeddings for RAG
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER,
  chunk_text TEXT,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONVERSATIONS & CHAT
-- =============================================

-- Chat sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  agent_id UUID REFERENCES public.agents(id),
  title TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WORKFLOWS & AUTOMATION
-- =============================================

-- Workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id),
  user_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'running',
  input_data JSONB,
  output_data JSONB,
  error_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ANALYTICS & METRICS
-- =============================================

-- Analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4),
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT & COMPLIANCE
-- =============================================

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance records
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_knowledge_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- User organizations policies
CREATE POLICY "Users can view own memberships" ON public.user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Agents policies
CREATE POLICY "Authenticated users can view public agents" ON public.agents
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Users can create agents" ON public.agents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own agents" ON public.agents
  FOR UPDATE USING (created_by = auth.uid());

-- LLM providers policies
CREATE POLICY "Authenticated users can view providers" ON public.llm_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- LLM usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.llm_usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage logs" ON public.llm_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Knowledge domains policies
CREATE POLICY "Authenticated users can view knowledge domains" ON public.knowledge_domains
  FOR SELECT USING (auth.role() = 'authenticated');

-- Knowledge documents policies
CREATE POLICY "Users can view public documents" ON public.knowledge_documents
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Users can create documents" ON public.knowledge_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages in own sessions" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Workflows policies
CREATE POLICY "Users can view public workflows" ON public.workflows
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Analytics events policies
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Audit logs policies (admin only)
CREATE POLICY "Admin users can view audit logs" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'organization'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_llm_providers_updated_at BEFORE UPDATE ON public.llm_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_llm_models_updated_at BEFORE UPDATE ON public.llm_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_domains_updated_at BEFORE UPDATE ON public.knowledge_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON public.agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_department ON public.agents(department);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON public.agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON public.agents(created_by);

-- LLM usage logs indexes
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_user_id ON public.llm_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_created_at ON public.llm_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_llm_usage_logs_provider_id ON public.llm_usage_logs(provider_id);

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON public.chat_sessions(agent_id);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Knowledge documents indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain_id ON public.knowledge_documents(domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_by ON public.knowledge_documents(created_by);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default LLM providers
INSERT INTO public.llm_providers (name, provider_type, is_active, models) VALUES
  ('OpenAI', 'openai', true, '["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]'),
  ('Anthropic', 'anthropic', true, '["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"]'),
  ('Google', 'google', true, '["gemini-pro", "gemini-pro-vision"]'),
  ('Meta', 'meta', true, '["llama-2-70b", "llama-2-13b"]')
ON CONFLICT DO NOTHING;

-- Insert default knowledge domains
INSERT INTO public.knowledge_domains (name, slug, description) VALUES
  ('Regulatory Affairs', 'regulatory-affairs', 'FDA, EMA, and global regulatory requirements'),
  ('Clinical Development', 'clinical-development', 'Clinical trial design and execution'),
  ('Quality Assurance', 'quality-assurance', 'Quality management systems and compliance'),
  ('Market Access', 'market-access', 'Reimbursement and market access strategies'),
  ('Digital Health', 'digital-health', 'Digital therapeutics and health technologies'),
  ('Medical Devices', 'medical-devices', 'Medical device development and regulation'),
  ('Pharmacovigilance', 'pharmacovigilance', 'Drug safety and adverse event monitoring'),
  ('Health Economics', 'health-economics', 'Economic evaluation and outcomes research')
ON CONFLICT (slug) DO NOTHING;
