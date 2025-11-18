-- =============================================================================
-- CREATE AGENTS TABLE (Fixed - uses expertise_level enum)
-- =============================================================================

-- Drop if exists to start fresh
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table with correct enum
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,

  -- Professional Profile
  title TEXT,
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

  -- Expertise - Now uses the NEW expertise_level enum
  expertise_level expertise_level DEFAULT 'intermediate',
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INTEGER,

  -- Avatar
  avatar_url TEXT,
  avatar_description TEXT,
  color_scheme JSONB DEFAULT '{}'::jsonb,

  -- AI Config
  system_prompt TEXT,
  base_model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 4000,

  -- Personality
  personality_traits JSONB DEFAULT '{}'::jsonb,
  communication_style TEXT,

  -- Status
  status agent_status DEFAULT 'development' NOT NULL,
  validation_status validation_status DEFAULT 'draft',

  -- Metrics
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),
  total_conversations INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_slug ON agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_function ON agents(function_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_expertise ON agents(expertise_level) WHERE deleted_at IS NULL;

-- Wrap RAISE NOTICE in DO block
DO $$
BEGIN
  RAISE NOTICE '✅ Agents table created successfully with expertise_level enum';
END $$;
