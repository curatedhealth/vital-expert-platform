-- =====================================================================
-- Seed Default LLM Providers
-- Creates default LLM provider configurations for common models
-- =====================================================================

-- Insert OpenAI GPT-4 provider
INSERT INTO llm_providers (
  provider_name,
  provider_type,
  model_id,
  model_version,
  api_endpoint,
  capabilities,
  max_tokens,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  temperature_default,
  status,
  is_active,
  is_production_ready
) VALUES
(
  'OpenAI GPT-4',
  'openai',
  'gpt-4',
  '0613',
  'https://api.openai.com/v1/chat/completions',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 8192,
    'medical_knowledge', true,
    'code_generation', true
  ),
  8192,
  0.03,
  0.06,
  0.7,
  'active',
  false, -- Set to false until API key is configured
  false
),
(
  'OpenAI GPT-4 Turbo',
  'openai',
  'gpt-4-turbo-preview',
  '0125',
  'https://api.openai.com/v1/chat/completions',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 128000,
    'medical_knowledge', true,
    'code_generation', true,
    'image_understanding', true
  ),
  128000,
  0.01,
  0.03,
  0.7,
  'active',
  false,
  false
),
(
  'OpenAI GPT-3.5 Turbo',
  'openai',
  'gpt-3.5-turbo',
  '0125',
  'https://api.openai.com/v1/chat/completions',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 16385,
    'medical_knowledge', false,
    'code_generation', true
  ),
  16385,
  0.0005,
  0.0015,
  0.7,
  'active',
  false,
  true
),
(
  'Anthropic Claude 3 Opus',
  'anthropic',
  'claude-3-opus-20240229',
  '20240229',
  'https://api.anthropic.com/v1/messages',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 200000,
    'medical_knowledge', true,
    'code_generation', true,
    'image_understanding', true
  ),
  200000,
  0.015,
  0.075,
  0.7,
  'active',
  false,
  false
),
(
  'Anthropic Claude 3 Sonnet',
  'anthropic',
  'claude-3-sonnet-20240229',
  '20240229',
  'https://api.anthropic.com/v1/messages',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 200000,
    'medical_knowledge', true,
    'code_generation', true,
    'image_understanding', true
  ),
  200000,
  0.003,
  0.015,
  0.7,
  'active',
  false,
  true
),
(
  'Anthropic Claude 3 Haiku',
  'anthropic',
  'claude-3-haiku-20240307',
  '20240307',
  'https://api.anthropic.com/v1/messages',
  jsonb_build_object(
    'streaming', true,
    'function_calling', true,
    'context_window', 200000,
    'medical_knowledge', false,
    'code_generation', true,
    'image_understanding', true
  ),
  200000,
  0.00025,
  0.00125,
  0.7,
  'active',
  false,
  true
);

-- Add comments
COMMENT ON TABLE llm_providers IS 'LLM provider configurations for the platform. Providers must have api_key_encrypted set to be available in agent creation.';
