-- =============================================================================
-- PHASE 05: Core AI Assets - Agents & Capabilities
-- =============================================================================
-- PURPOSE: Create AI agents, capabilities, and domains
-- TABLES: 4 tables (agents, capabilities, domains, agent_industries)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: domains (strategic outcome domains)
-- =============================================================================
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES domains(id) ON DELETE SET NULL,

  -- Metadata
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for domains
CREATE INDEX idx_domains_tenant ON domains(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_domains_parent ON domains(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_domains_slug ON domains(slug) WHERE deleted_at IS NULL;

COMMENT ON TABLE domains IS 'Strategic outcome domains (e.g., Revenue Growth, Patient Outcomes, Market Share)';

-- =============================================================================
-- TABLE 2: capabilities (strategic capabilities)
-- =============================================================================
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Domain Association
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,

  -- Classification
  capability_type TEXT, -- 'analytical', 'operational', 'strategic', 'compliance'
  maturity_level domain_expertise DEFAULT 'foundational',

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for capabilities
CREATE INDEX idx_capabilities_tenant ON capabilities(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_domain ON capabilities(domain_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_type ON capabilities(capability_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_slug ON capabilities(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_tags ON capabilities USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE capabilities IS 'Strategic capabilities that agents possess (e.g., Competitive Intelligence, Launch Planning)';

-- =============================================================================
-- TABLE 3: agents (AI consultants/experts - 254 total)
-- =============================================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,

  -- Professional Profile
  title TEXT, -- e.g., "Senior Medical Affairs Director"
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,

  -- Expertise
  expertise_level domain_expertise DEFAULT 'intermediate',
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_of_experience INTEGER,

  -- Avatar & Branding
  avatar_url TEXT,
  avatar_description TEXT, -- For AI-generated avatars
  color_scheme JSONB DEFAULT '{}'::jsonb,

  -- AI Configuration
  system_prompt TEXT,
  base_model TEXT DEFAULT 'gpt-4', -- Default LLM model
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens INTEGER DEFAULT 4000,

  -- Personality & Style
  personality_traits JSONB DEFAULT '{}'::jsonb,
  -- Example: {"analytical": 0.8, "empathetic": 0.6, "assertive": 0.7}
  communication_style TEXT, -- 'formal', 'conversational', 'technical', 'executive'

  -- Status & Lifecycle
  status agent_status DEFAULT 'development' NOT NULL,
  validation_status validation_status DEFAULT 'draft',

  -- Performance Metrics
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

-- Indexes for agents
CREATE INDEX idx_agents_tenant ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_slug ON agents(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_role ON agents(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_function ON agents(function_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_department ON agents(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_expertise ON agents(expertise_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_tags ON agents USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_specializations ON agents USING GIN(specializations) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_rating ON agents(average_rating DESC NULLS LAST);
CREATE INDEX idx_agents_usage ON agents(usage_count DESC);

COMMENT ON TABLE agents IS 'AI consultant agents (254 total) with professional profiles and expertise';
COMMENT ON COLUMN agents.system_prompt IS 'Core system prompt defining agent behavior and expertise';
COMMENT ON COLUMN agents.personality_traits IS 'JSONB object with trait dimensions (0-1 scale)';

-- =============================================================================
-- JUNCTION TABLE: agent_industries (agents mapped to industries)
-- =============================================================================
CREATE TABLE agent_industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, industry_id)
);

-- Indexes for agent_industries
CREATE INDEX idx_agent_industries_agent ON agent_industries(agent_id);
CREATE INDEX idx_agent_industries_industry ON agent_industries(industry_id);
CREATE INDEX idx_agent_industries_score ON agent_industries(relevance_score DESC);
CREATE INDEX idx_agent_industries_primary ON agent_industries(is_primary) WHERE is_primary = true;

COMMENT ON TABLE agent_industries IS 'Maps agents to industries with relevance scores';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get active agents by function
CREATE OR REPLACE FUNCTION get_agents_by_function(p_function_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  title TEXT,
  expertise_level domain_expertise,
  average_rating NUMERIC
)
LANGUAGE SQL STABLE AS $$
  SELECT id, name, title, expertise_level, average_rating
  FROM agents
  WHERE function_id = p_function_id
  AND status = 'active'
  AND deleted_at IS NULL
  ORDER BY average_rating DESC NULLS LAST, usage_count DESC;
$$;

-- Function to get agents by industry
CREATE OR REPLACE FUNCTION get_agents_by_industry(p_industry_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  title TEXT,
  relevance_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT a.id, a.name, a.title, ai.relevance_score
  FROM agents a
  JOIN agent_industries ai ON a.id = ai.agent_id
  WHERE ai.industry_id = p_industry_id
  AND a.status = 'active'
  AND a.deleted_at IS NULL
  ORDER BY ai.relevance_score DESC, a.average_rating DESC NULLS LAST;
$$;

-- Function to search agents
CREATE OR REPLACE FUNCTION search_agents(
  p_tenant_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  title TEXT,
  tagline TEXT,
  relevance REAL
)
LANGUAGE SQL STABLE AS $$
  SELECT
    id,
    name,
    title,
    tagline,
    ts_rank(
      to_tsvector('english', name || ' ' || COALESCE(title, '') || ' ' || COALESCE(tagline, '') || ' ' || COALESCE(description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM agents
  WHERE tenant_id = p_tenant_id
  AND status = 'active'
  AND deleted_at IS NULL
  AND (
    name ILIKE '%' || p_search_term || '%'
    OR title ILIKE '%' || p_search_term || '%'
    OR tagline ILIKE '%' || p_search_term || '%'
    OR description ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(tags)
    OR p_search_term = ANY(specializations)
  )
  ORDER BY relevance DESC
  LIMIT p_limit;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('domains', 'capabilities', 'agents', 'agent_industries');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 05 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for 254 agent imports';
    RAISE NOTICE 'Agent fields: identity, professional profile, expertise, AI config, personality, status';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 06 (Personas & JTBDs)';
    RAISE NOTICE '';
END $$;
