-- Insert data using the correct schema for llm_providers table
INSERT INTO public.llm_providers (
  provider_name, 
  provider_type, 
  api_endpoint, 
  model_id, 
  model_version,
  capabilities,
  cost_per_1k_input_tokens,
  cost_per_1k_output_tokens,
  max_tokens,
  temperature_default,
  rate_limit_rpm,
  rate_limit_tpm,
  priority_level,
  weight,
  status,
  is_active,
  is_hipaa_compliant,
  is_production_ready,
  medical_accuracy_score,
  average_latency_ms,
  uptime_percentage,
  health_check_enabled,
  health_check_interval_minutes,
  health_check_timeout_seconds,
  metadata,
  tags
) VALUES
  (
    'OpenAI GPT-4',
    'openai',
    'https://api.openai.com/v1',
    'gpt-4',
    'gpt-4-1106-preview',
    '{"text_generation": true, "chat": true, "embeddings": true}',
    0.03,
    0.06,
    4096,
    0.7,
    500,
    150000,
    1,
    1.0,
    'active',
    true,
    false,
    true,
    0.95,
    1200,
    99.9,
    true,
    5,
    30,
    '{"description": "OpenAI GPT-4 for general medical assistance"}',
    ARRAY['general', 'medical', 'gpt-4']
  ),
  (
    'Anthropic Claude',
    'anthropic',
    'https://api.anthropic.com/v1',
    'claude-3-5-sonnet',
    'claude-3-5-sonnet-20241022',
    '{"text_generation": true, "chat": true, "analysis": true}',
    0.015,
    0.075,
    8192,
    0.7,
    1000,
    200000,
    1,
    1.0,
    'active',
    true,
    true,
    true,
    0.98,
    800,
    99.8,
    true,
    5,
    30,
    '{"description": "Anthropic Claude for medical analysis and compliance"}',
    ARRAY['medical', 'compliance', 'claude']
  )
ON CONFLICT (id) DO NOTHING;

-- Insert knowledge domains (using the schema we know works)
INSERT INTO public.knowledge_domains (name, slug, description, tier, priority, is_active) VALUES
  ('Regulatory Affairs', 'regulatory-affairs', 'FDA, EMA, and global regulatory requirements', 1, 1, true),
  ('Clinical Development', 'clinical-development', 'Clinical trial design and execution', 1, 2, true),
  ('Medical Affairs', 'medical-affairs', 'Medical information and scientific communications', 1, 3, true),
  ('Quality Assurance', 'quality-assurance', 'Quality systems and compliance', 1, 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert agents (using the schema we know works)
INSERT INTO public.agents (name, slug, description, tier, priority, is_public, is_active) VALUES
  ('FDA Regulatory Strategist', 'fda-regulatory-strategist', 'Expert FDA regulatory strategist for drug and device approvals', 1, 1, true, true),
  ('Clinical Protocol Designer', 'clinical-protocol-designer', 'Expert clinical research professional for trial design', 1, 2, true, true),
  ('Medical Information Specialist', 'medical-information-specialist', 'Specialist in medical information and scientific communications', 1, 3, true, true),
  ('Quality Systems Expert', 'quality-systems-expert', 'Expert in quality assurance and regulatory compliance', 1, 4, true, true)
ON CONFLICT (slug) DO NOTHING;