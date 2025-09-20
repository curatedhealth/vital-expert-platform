-- Create LLM Providers table and security setup for remote database
-- This SQL will be executed directly in the Supabase dashboard

-- Provider types enum
CREATE TYPE provider_type AS ENUM (
  'openai', 'anthropic', 'google', 'azure', 'aws_bedrock', 'cohere', 'huggingface', 'custom'
);

-- Provider status enum
CREATE TYPE provider_status AS ENUM (
  'active', 'inactive', 'maintenance', 'error', 'testing'
);

-- LLM Providers table
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(100) NOT NULL UNIQUE,
  provider_type provider_type NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  api_endpoint TEXT NOT NULL,
  max_tokens INTEGER DEFAULT 4096,
  supports_streaming BOOLEAN DEFAULT false,
  supports_function_calling BOOLEAN DEFAULT false,
  input_cost_per_token DECIMAL(12, 10) DEFAULT 0.0,
  output_cost_per_token DECIMAL(12, 10) DEFAULT 0.0,
  context_window INTEGER DEFAULT 4096,
  description TEXT,
  healthcare_compliance BOOLEAN DEFAULT false,
  hipaa_compliant BOOLEAN DEFAULT false,
  fda_compliant BOOLEAN DEFAULT false,
  status provider_status DEFAULT 'inactive',
  is_active BOOLEAN DEFAULT false,
  priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  response_time_ms INTEGER DEFAULT 2000,
  uptime_percentage DECIMAL(5, 2) DEFAULT 99.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Role permissions table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'llm_manager', 'user', 'viewer')),
  scope TEXT NOT NULL CHECK (scope IN ('llm_providers', 'agents', 'workflows', 'analytics', 'system_settings', 'user_management', 'audit_logs')),
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'execute', 'manage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, scope, action)
);

-- Security audit log table
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_llm_providers_type ON llm_providers(provider_type);
CREATE INDEX idx_llm_providers_active ON llm_providers(is_active);
CREATE INDEX idx_llm_providers_priority ON llm_providers(priority_score DESC);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at);

-- Enable RLS
ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - allow authenticated users to read)
CREATE POLICY "llm_providers_select_policy" ON llm_providers
  FOR SELECT USING (true);

CREATE POLICY "llm_providers_insert_policy" ON llm_providers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "llm_providers_update_policy" ON llm_providers
  FOR UPDATE USING (true);

CREATE POLICY "role_permissions_select_policy" ON role_permissions
  FOR SELECT USING (true);

CREATE POLICY "security_audit_select_policy" ON security_audit_log
  FOR SELECT USING (true);

CREATE POLICY "security_audit_insert_policy" ON security_audit_log
  FOR INSERT WITH CHECK (true);

-- Insert role permissions
INSERT INTO role_permissions (role, scope, action) VALUES
-- Super Admin
('super_admin', 'llm_providers', 'create'),
('super_admin', 'llm_providers', 'read'),
('super_admin', 'llm_providers', 'update'),
('super_admin', 'llm_providers', 'delete'),
('super_admin', 'llm_providers', 'manage'),
('super_admin', 'user_management', 'manage'),
-- Admin
('admin', 'llm_providers', 'create'),
('admin', 'llm_providers', 'read'),
('admin', 'llm_providers', 'update'),
('admin', 'llm_providers', 'delete'),
('admin', 'llm_providers', 'manage'),
-- LLM Manager
('llm_manager', 'llm_providers', 'create'),
('llm_manager', 'llm_providers', 'read'),
('llm_manager', 'llm_providers', 'update'),
('llm_manager', 'llm_providers', 'delete'),
-- User
('user', 'llm_providers', 'read'),
-- Viewer
('viewer', 'llm_providers', 'read');

-- Insert sample LLM providers
INSERT INTO llm_providers (
  provider_name, provider_type, model_name, api_endpoint, max_tokens,
  supports_streaming, supports_function_calling, input_cost_per_token,
  output_cost_per_token, context_window, description, healthcare_compliance,
  hipaa_compliant, fda_compliant, is_active, priority_score, response_time_ms, uptime_percentage
) VALUES
-- OpenAI Providers
('OpenAI GPT-4 Turbo', 'openai', 'gpt-4-1106-preview', 'https://api.openai.com/v1', 128000, true, true, 0.00001, 0.00003, 128000, 'Latest GPT-4 Turbo model with improved instruction following and JSON mode', true, true, true, true, 95, 2000, 99.9),
('OpenAI GPT-4', 'openai', 'gpt-4', 'https://api.openai.com/v1', 8192, true, true, 0.00003, 0.00006, 8192, 'Most capable GPT-4 model for complex reasoning and healthcare applications', true, true, true, true, 90, 3000, 99.8),
('OpenAI GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', 'https://api.openai.com/v1', 4096, true, true, 0.0000015, 0.000002, 16385, 'Fast and cost-effective model for routine healthcare documentation', true, true, false, true, 85, 1500, 99.9),

-- Anthropic Providers
('Anthropic Claude 3 Opus', 'anthropic', 'claude-3-opus-20240229', 'https://api.anthropic.com', 4096, true, true, 0.000015, 0.000075, 200000, 'Most powerful Claude model for complex medical reasoning and analysis', true, true, true, true, 92, 2500, 99.7),
('Anthropic Claude 3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', 'https://api.anthropic.com', 4096, true, true, 0.000003, 0.000015, 200000, 'Balanced Claude model for general healthcare applications', true, true, true, true, 88, 2000, 99.8),
('Anthropic Claude 3 Haiku', 'anthropic', 'claude-3-haiku-20240307', 'https://api.anthropic.com', 4096, true, false, 0.00000025, 0.00000125, 200000, 'Fast and cost-effective Claude model for simple healthcare tasks', true, true, false, true, 82, 1000, 99.9),

-- Google Providers
('Google Gemini Pro', 'google', 'gemini-pro', 'https://generativelanguage.googleapis.com', 8192, true, true, 0.0000005, 0.0000015, 32768, 'Google''s advanced multimodal model for healthcare applications', true, true, false, true, 86, 1800, 99.6),
('Google Gemini Ultra', 'google', 'gemini-ultra', 'https://generativelanguage.googleapis.com', 8192, true, true, 0.000008, 0.000024, 32768, 'Google''s most capable model for complex medical analysis', true, true, true, true, 89, 3000, 99.5),

-- Enterprise Providers (inactive by default)
('Azure OpenAI GPT-4', 'azure', 'gpt-4', 'https://your-resource.openai.azure.com', 8192, true, true, 0.00003, 0.00006, 8192, 'Enterprise GPT-4 with Azure security and compliance', true, true, true, false, 93, 2500, 99.9),
('AWS Bedrock Claude 3 Opus', 'aws_bedrock', 'anthropic.claude-3-opus-20240229-v1:0', 'https://bedrock-runtime.us-east-1.amazonaws.com', 4096, true, true, 0.000015, 0.000075, 200000, 'Claude 3 Opus via AWS Bedrock with enterprise security', true, true, true, false, 91, 2800, 99.8);

-- Create or update user profile for super admin
INSERT INTO user_profiles (user_id, email, full_name, role, department, organization, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'hicham.naim@curated.health',
  'Hicham Naim',
  'super_admin',
  'Engineering',
  'Curated Health',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Hicham Naim',
  department = 'Engineering',
  organization = 'Curated Health',
  is_active = true,
  updated_at = NOW();