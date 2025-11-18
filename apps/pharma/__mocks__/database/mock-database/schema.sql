-- Mock Database Schema for VITAL Path
-- This is a minimal schema to prevent build errors when no database is configured

-- Create enum types for LLM providers
CREATE TYPE provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'azure',
  'aws_bedrock',
  'cohere',
  'huggingface',
  'custom'
);

CREATE TYPE provider_status AS ENUM (
  'initializing',
  'active',
  'error',
  'maintenance',
  'disabled'
);

-- Minimal LLM Providers table
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(100) NOT NULL,
  provider_type provider_type NOT NULL,
  api_endpoint VARCHAR(500),
  model_id VARCHAR(200) NOT NULL,
  status provider_status DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Minimal LLM Usage Logs table
CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  llm_provider_id UUID NOT NULL REFERENCES llm_providers(id),
  agent_id UUID,
  user_id UUID,
  request_id UUID NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_input DECIMAL(10, 6) DEFAULT 0,
  cost_output DECIMAL(10, 6) DEFAULT 0,
  total_cost DECIMAL(10, 6) GENERATED ALWAYS AS (cost_input + cost_output) STORED,
  latency_ms INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some mock data
INSERT INTO llm_providers (provider_name, provider_type, model_id) VALUES
('OpenAI GPT-4', 'openai', 'gpt-4'),
('Anthropic Claude', 'anthropic', 'claude-3-sonnet'),
('Google Gemini', 'google', 'gemini-pro');

-- Create indexes
CREATE INDEX idx_llm_providers_active ON llm_providers(is_active, status) WHERE is_active = true;
CREATE INDEX idx_usage_logs_provider_date ON llm_usage_logs(llm_provider_id, created_at);
CREATE INDEX idx_usage_logs_user_date ON llm_usage_logs(user_id, created_at);

-- Comments
COMMENT ON TABLE llm_providers IS 'Mock registry of LLM providers for development';
COMMENT ON TABLE llm_usage_logs IS 'Mock usage tracking for LLM requests';
