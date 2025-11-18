-- =============================================================================
-- FIX ISSUES AND CONTINUE SCHEMA BUILD
-- =============================================================================
-- This fixes the enum/table conflicts and completes the schema
-- =============================================================================

-- Fix 1: Check and fix domain_expertise ENUM
DO $$
BEGIN
  -- Add 'foundational' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'foundational'
                 AND enumtypid = 'domain_expertise'::regtype) THEN
    ALTER TYPE domain_expertise ADD VALUE 'foundational';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add foundational to domain_expertise: %', SQLERRM;
END $$;

-- Fix 2: Drop and recreate llm_providers if it exists but is incomplete
DROP TABLE IF EXISTS llm_providers CASCADE;

CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  provider_type llm_provider_type NOT NULL,
  api_endpoint TEXT,
  api_version TEXT,
  requires_api_key BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  rate_limit_rpm INTEGER,
  rate_limit_tpm INTEGER,
  rate_limit_rpd INTEGER,
  default_cost_per_1k_input_tokens NUMERIC(10,6),
  default_cost_per_1k_output_tokens NUMERIC(10,6),
  supported_features JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(tenant_id, slug)
);

-- Seed LLM providers
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
  )
ON CONFLICT (id) DO NOTHING;

-- Fix 3: Check if agents table exists, if not create it
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  title TEXT,
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
  expertise_level domain_expertise DEFAULT 'intermediate',
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INTEGER,
  avatar_url TEXT,
  avatar_description TEXT,
  color_scheme JSONB DEFAULT '{}'::jsonb,
  system_prompt TEXT,
  base_model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 4000,
  personality_traits JSONB DEFAULT '{}'::jsonb,
  communication_style TEXT,
  status agent_status DEFAULT 'development' NOT NULL,
  validation_status validation_status DEFAULT 'draft',
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),
  total_conversations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(tenant_id, slug)
);

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed domain_expertise ENUM';
  RAISE NOTICE '✅ Recreated llm_providers table';
  RAISE NOTICE '✅ Created agents table if missing';
  RAISE NOTICE '';
  RAISE NOTICE 'Now retry applying parts 3-8 via Dashboard';
END $$;
