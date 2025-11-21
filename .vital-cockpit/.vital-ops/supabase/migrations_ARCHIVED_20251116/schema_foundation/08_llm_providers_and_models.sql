-- =============================================================================
-- PHASE 08: LLM Providers & Models Configuration
-- =============================================================================
-- PURPOSE: Configure LLM providers, models, and usage settings
-- TABLES: 3 tables (llm_providers, llm_models, model_configurations)
-- TIME: ~10 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: llm_providers (OpenAI, Anthropic, Azure, etc.)
-- =============================================================================
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  provider_type llm_provider_type NOT NULL,

  -- API Configuration
  api_endpoint TEXT,
  api_version TEXT,
  requires_api_key BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Rate Limits (provider-level)
  rate_limit_rpm INTEGER, -- Requests per minute
  rate_limit_tpm INTEGER, -- Tokens per minute
  rate_limit_rpd INTEGER, -- Requests per day

  -- Cost Tracking
  default_cost_per_1k_input_tokens NUMERIC(10,6),
  default_cost_per_1k_output_tokens NUMERIC(10,6),

  -- Metadata
  supported_features JSONB DEFAULT '{}'::jsonb,
  -- Example: {"streaming": true, "function_calling": true, "vision": false}
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for llm_providers
CREATE INDEX idx_llm_providers_tenant ON llm_providers(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_providers_slug ON llm_providers(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_providers_type ON llm_providers(provider_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_providers_active ON llm_providers(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_providers_default ON llm_providers(is_default) WHERE is_default = true;

COMMENT ON TABLE llm_providers IS 'LLM provider configurations (OpenAI, Anthropic, Azure OpenAI, etc.)';

-- =============================================================================
-- TABLE 2: llm_models (specific models from providers)
-- =============================================================================
CREATE TABLE llm_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  model_id TEXT NOT NULL, -- e.g., 'gpt-4-turbo-preview', 'claude-3-opus-20240229'

  -- Capabilities
  context_window INTEGER NOT NULL, -- Max tokens
  max_output_tokens INTEGER,
  supports_streaming BOOLEAN DEFAULT true,
  supports_function_calling BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,

  -- Performance
  training_cutoff_date DATE,
  latency_ms_avg INTEGER, -- Average response latency

  -- Cost (can override provider defaults)
  cost_per_1k_input_tokens NUMERIC(10,6),
  cost_per_1k_output_tokens NUMERIC(10,6),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_recommended BOOLEAN DEFAULT false,
  deprecation_date DATE,

  -- Metadata
  capabilities JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(provider_id, model_id)
);

-- Indexes for llm_models
CREATE INDEX idx_llm_models_provider ON llm_models(provider_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_models_slug ON llm_models(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_models_model_id ON llm_models(model_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_models_active ON llm_models(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_models_recommended ON llm_models(is_recommended) WHERE is_recommended = true;
CREATE INDEX idx_llm_models_context ON llm_models(context_window DESC);

COMMENT ON TABLE llm_models IS 'Specific LLM models available from providers';

-- =============================================================================
-- TABLE 3: model_configurations (agent-specific model configs)
-- =============================================================================
CREATE TABLE model_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Association (one of these must be set)
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  workflow_id UUID, -- Forward reference (created in Phase 13)
  task_id UUID, -- Forward reference (created in Phase 13)

  -- Model Selection
  model_id UUID NOT NULL REFERENCES llm_models(id) ON DELETE CASCADE,
  fallback_model_id UUID REFERENCES llm_models(id) ON DELETE SET NULL,

  -- Generation Parameters
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  top_p DECIMAL(3,2) DEFAULT 1.0 CHECK (top_p BETWEEN 0 AND 1),
  frequency_penalty DECIMAL(3,2) DEFAULT 0 CHECK (frequency_penalty BETWEEN -2 AND 2),
  presence_penalty DECIMAL(3,2) DEFAULT 0 CHECK (presence_penalty BETWEEN -2 AND 2),
  max_tokens INTEGER,

  -- Advanced Settings
  stop_sequences TEXT[] DEFAULT ARRAY[]::TEXT[],
  response_format JSONB, -- {"type": "json_object"} for JSON mode
  seed INTEGER, -- For deterministic outputs

  -- Cost Control
  max_cost_per_request NUMERIC(10,2),
  enable_caching BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CHECK (
    (agent_id IS NOT NULL AND workflow_id IS NULL AND task_id IS NULL) OR
    (agent_id IS NULL AND workflow_id IS NOT NULL AND task_id IS NULL) OR
    (agent_id IS NULL AND workflow_id IS NULL AND task_id IS NOT NULL)
  )
);

-- Indexes for model_configurations
CREATE INDEX idx_model_configs_tenant ON model_configurations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_model_configs_agent ON model_configurations(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_model_configs_workflow ON model_configurations(workflow_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_model_configs_task ON model_configurations(task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_model_configs_model ON model_configurations(model_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE model_configurations IS 'LLM model configurations for agents, workflows, and tasks';

-- =============================================================================
-- SEED DATA: LLM Providers
-- =============================================================================

INSERT INTO llm_providers (id, tenant_id, name, slug, provider_type, api_endpoint, is_active, is_default, rate_limit_rpm, default_cost_per_1k_input_tokens, default_cost_per_1k_output_tokens, supported_features) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'OpenAI',
    'openai',
    'openai',
    'https://api.openai.com/v1',
    true,
    true,
    3500,
    0.01,
    0.03,
    jsonb_build_object('streaming', true, 'function_calling', true, 'vision', true, 'json_mode', true)
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'Anthropic',
    'anthropic',
    'anthropic',
    'https://api.anthropic.com/v1',
    true,
    false,
    4000,
    0.015,
    0.075,
    jsonb_build_object('streaming', true, 'function_calling', true, 'vision', true, 'extended_context', true)
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'Azure OpenAI',
    'azure-openai',
    'azure_openai',
    NULL,
    true,
    false,
    3500,
    0.01,
    0.03,
    jsonb_build_object('streaming', true, 'function_calling', true, 'enterprise_compliance', true)
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED DATA: LLM Models
-- =============================================================================

INSERT INTO llm_models (id, provider_id, name, slug, model_id, context_window, max_output_tokens, supports_streaming, supports_function_calling, cost_per_1k_input_tokens, cost_per_1k_output_tokens, is_active, is_recommended) VALUES
  -- OpenAI Models
  (
    '41000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'GPT-4 Turbo',
    'gpt-4-turbo',
    'gpt-4-turbo-preview',
    128000,
    4096,
    true,
    true,
    0.01,
    0.03,
    true,
    true
  ),
  (
    '41000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000001',
    'GPT-4',
    'gpt-4',
    'gpt-4',
    8192,
    4096,
    true,
    true,
    0.03,
    0.06,
    true,
    false
  ),
  (
    '41000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000001',
    'GPT-3.5 Turbo',
    'gpt-3-5-turbo',
    'gpt-3.5-turbo',
    16384,
    4096,
    true,
    true,
    0.0005,
    0.0015,
    true,
    false
  ),
  -- Anthropic Models
  (
    '41000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000002',
    'Claude 3 Opus',
    'claude-3-opus',
    'claude-3-opus-20240229',
    200000,
    4096,
    true,
    true,
    0.015,
    0.075,
    true,
    true
  ),
  (
    '41000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000002',
    'Claude 3 Sonnet',
    'claude-3-sonnet',
    'claude-3-sonnet-20240229',
    200000,
    4096,
    true,
    true,
    0.003,
    0.015,
    true,
    true
  ),
  (
    '41000000-0000-0000-0000-000000000006',
    '40000000-0000-0000-0000-000000000002',
    'Claude 3 Haiku',
    'claude-3-haiku',
    'claude-3-haiku-20240307',
    200000,
    4096,
    true,
    true,
    0.00025,
    0.00125,
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
    provider_count INTEGER;
    model_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('llm_providers', 'llm_models', 'model_configurations');

    SELECT COUNT(*) INTO provider_count FROM llm_providers;
    SELECT COUNT(*) INTO model_count FROM llm_models;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 08 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Providers seeded: %', provider_count;
    RAISE NOTICE 'Models seeded: %', model_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Providers: OpenAI, Anthropic, Azure OpenAI';
    RAISE NOTICE 'Models: GPT-4 Turbo, GPT-4, GPT-3.5, Claude 3 Opus, Sonnet, Haiku';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 09 (Knowledge & RAG)';
    RAISE NOTICE '';
END $$;
