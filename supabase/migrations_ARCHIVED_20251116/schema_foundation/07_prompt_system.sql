-- =============================================================================
-- PHASE 07: Prompt Management System
-- =============================================================================
-- PURPOSE: Create hierarchical prompt system (suites → sub-suites → prompts)
-- TABLES: 6 tables (prompt_suites, prompt_sub_suites, prompts, prompt_versions, suite_prompts, agent_prompts)
-- TIME: ~20 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: prompt_suites (top-level collections)
-- =============================================================================
CREATE TABLE prompt_suites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Organization
  category TEXT, -- 'discovery', 'analysis', 'recommendation', 'execution', 'evaluation'
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Available across tenants

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for prompt_suites
CREATE INDEX idx_prompt_suites_tenant ON prompt_suites(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_suites_slug ON prompt_suites(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_suites_category ON prompt_suites(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_suites_active ON prompt_suites(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_suites_public ON prompt_suites(is_public) WHERE deleted_at IS NULL;

COMMENT ON TABLE prompt_suites IS 'Top-level prompt collections (e.g., "Launch Planning Suite", "Competitive Intelligence Suite")';

-- =============================================================================
-- TABLE 2: prompt_sub_suites (sub-collections within suites)
-- =============================================================================
CREATE TABLE prompt_sub_suites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suite_id UUID NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Organization
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(suite_id, slug)
);

-- Indexes for prompt_sub_suites
CREATE INDEX idx_prompt_sub_suites_suite ON prompt_sub_suites(suite_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_sub_suites_slug ON prompt_sub_suites(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompt_sub_suites_active ON prompt_sub_suites(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE prompt_sub_suites IS 'Sub-collections within prompt suites for better organization';

-- =============================================================================
-- TABLE 3: prompts (individual prompt templates)
-- =============================================================================
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Prompt Content
  content TEXT NOT NULL,
  role_type message_role DEFAULT 'system', -- 'system', 'user', 'assistant'

  -- Classification
  category TEXT, -- 'analysis', 'generation', 'evaluation', 'transformation'
  complexity complexity_type DEFAULT 'medium',

  -- Variables/Placeholders
  variables JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"name": "product_name", "type": "string", "required": true, "description": "Name of the product"}]

  -- Version Control
  version TEXT DEFAULT '1.0.0',
  is_current_version BOOLEAN DEFAULT true,

  -- Quality Metrics
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),
  success_rate NUMERIC(5,2), -- Percentage

  -- Status
  is_active BOOLEAN DEFAULT true,
  validation_status validation_status DEFAULT 'draft',

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for prompts
CREATE INDEX idx_prompts_tenant ON prompts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_slug ON prompts(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_category ON prompts(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_role ON prompts(role_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_active ON prompts(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_current ON prompts(is_current_version) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_prompts_rating ON prompts(average_rating DESC NULLS LAST);
CREATE INDEX idx_prompts_usage ON prompts(usage_count DESC);

-- Full-text search index
CREATE INDEX idx_prompts_search ON prompts USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || content)) WHERE deleted_at IS NULL;

COMMENT ON TABLE prompts IS 'Individual prompt templates with variables and version control';
COMMENT ON COLUMN prompts.variables IS 'JSONB array of variable definitions with name, type, required, description';
COMMENT ON COLUMN prompts.content IS 'Prompt template with {{variable}} placeholders';

-- =============================================================================
-- TABLE 4: prompt_versions (version history)
-- =============================================================================
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Version Info
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,

  -- Change Tracking
  change_summary TEXT,
  changed_by UUID REFERENCES user_profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(prompt_id, version)
);

-- Indexes for prompt_versions
CREATE INDEX idx_prompt_versions_prompt ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_version ON prompt_versions(version);
CREATE INDEX idx_prompt_versions_created ON prompt_versions(created_at DESC);

COMMENT ON TABLE prompt_versions IS 'Version history for prompts enabling rollback and change tracking';

-- =============================================================================
-- JUNCTION TABLE 1: suite_prompts (prompts in suites/sub-suites)
-- =============================================================================
CREATE TABLE suite_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  suite_id UUID REFERENCES prompt_suites(id) ON DELETE CASCADE,
  sub_suite_id UUID REFERENCES prompt_sub_suites(id) ON DELETE CASCADE,

  -- Organization
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CHECK (suite_id IS NOT NULL OR sub_suite_id IS NOT NULL),
  UNIQUE(prompt_id, suite_id, sub_suite_id)
);

-- Indexes for suite_prompts
CREATE INDEX idx_suite_prompts_prompt ON suite_prompts(prompt_id);
CREATE INDEX idx_suite_prompts_suite ON suite_prompts(suite_id);
CREATE INDEX idx_suite_prompts_sub_suite ON suite_prompts(sub_suite_id);
CREATE INDEX idx_suite_prompts_order ON suite_prompts(sort_order);

COMMENT ON TABLE suite_prompts IS 'Assigns prompts to suites or sub-suites';

-- =============================================================================
-- JUNCTION TABLE 2: agent_prompts (agents using prompts)
-- =============================================================================
CREATE TABLE agent_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Usage Context
  usage_context TEXT, -- 'system_prompt', 'conversation_starter', 'analysis_template', 'response_format'
  is_primary BOOLEAN DEFAULT false,

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, prompt_id, usage_context)
);

-- Indexes for agent_prompts
CREATE INDEX idx_agent_prompts_agent ON agent_prompts(agent_id);
CREATE INDEX idx_agent_prompts_prompt ON agent_prompts(prompt_id);
CREATE INDEX idx_agent_prompts_context ON agent_prompts(usage_context);
CREATE INDEX idx_agent_prompts_primary ON agent_prompts(is_primary) WHERE is_primary = true;

COMMENT ON TABLE agent_prompts IS 'Maps agents to prompts they use in different contexts';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get prompts by suite
CREATE OR REPLACE FUNCTION get_prompts_by_suite(p_suite_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  sort_order INTEGER
)
LANGUAGE SQL STABLE AS $$
  SELECT p.id, p.name, p.description, p.category, sp.sort_order
  FROM prompts p
  JOIN suite_prompts sp ON p.id = sp.prompt_id
  WHERE sp.suite_id = p_suite_id
  AND p.deleted_at IS NULL
  AND p.is_active = true
  ORDER BY sp.sort_order, p.name;
$$;

-- Function to get prompts by agent
CREATE OR REPLACE FUNCTION get_prompts_by_agent(p_agent_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  content TEXT,
  usage_context TEXT,
  is_primary BOOLEAN
)
LANGUAGE SQL STABLE AS $$
  SELECT p.id, p.name, p.content, ap.usage_context, ap.is_primary
  FROM prompts p
  JOIN agent_prompts ap ON p.id = ap.prompt_id
  WHERE ap.agent_id = p_agent_id
  AND p.deleted_at IS NULL
  AND p.is_active = true
  ORDER BY ap.is_primary DESC, ap.sort_order;
$$;

-- Function to render prompt with variables
CREATE OR REPLACE FUNCTION render_prompt(
  p_prompt_id UUID,
  p_variables JSONB
)
RETURNS TEXT
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_content TEXT;
  v_key TEXT;
  v_value TEXT;
BEGIN
  -- Get prompt content
  SELECT content INTO v_content
  FROM prompts
  WHERE id = p_prompt_id
  AND deleted_at IS NULL;

  IF v_content IS NULL THEN
    RAISE EXCEPTION 'Prompt not found: %', p_prompt_id;
  END IF;

  -- Replace variables (simple implementation)
  FOR v_key, v_value IN SELECT key, value FROM jsonb_each_text(p_variables)
  LOOP
    v_content := REPLACE(v_content, '{{' || v_key || '}}', v_value);
  END LOOP;

  RETURN v_content;
END;
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
    AND tablename IN ('prompt_suites', 'prompt_sub_suites', 'prompts', 'prompt_versions', 'suite_prompts', 'agent_prompts');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 07 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Prompt System Features:';
    RAISE NOTICE '  - Hierarchical organization (suites → sub-suites → prompts)';
    RAISE NOTICE '  - Version control and history';
    RAISE NOTICE '  - Variable substitution';
    RAISE NOTICE '  - Agent-prompt mapping';
    RAISE NOTICE '  - Full-text search';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for prompt library import';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 08 (LLM Providers & Models)';
    RAISE NOTICE '';
END $$;
