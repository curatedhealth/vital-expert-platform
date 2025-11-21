-- =============================================================================
-- PHASE 10: Skills & Tools System
-- =============================================================================
-- PURPOSE: Create skills, tools, templates, and agent capabilities
-- TABLES: 5 tables (skills, skill_categories, tools, templates, agent_tools)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: skill_categories (hierarchical skill taxonomy)
-- =============================================================================
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,

  -- Metadata
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for skill_categories
CREATE INDEX idx_skill_categories_parent ON skill_categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_skill_categories_slug ON skill_categories(slug) WHERE deleted_at IS NULL;

COMMENT ON TABLE skill_categories IS 'Hierarchical categories for organizing skills';

-- =============================================================================
-- TABLE 2: skills (agent capabilities and competencies)
-- =============================================================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Classification
  category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  skill_type TEXT, -- 'analytical', 'technical', 'creative', 'strategic', 'communication'
  complexity complexity_type DEFAULT 'medium',

  -- Learning/Training
  prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
  learning_resources JSONB DEFAULT '[]'::jsonb,

  -- Usage
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

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

-- Indexes for skills
CREATE INDEX idx_skills_tenant ON skills(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_skills_slug ON skills(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_skills_category ON skills(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_skills_type ON skills(skill_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_skills_active ON skills(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_skills_tags ON skills USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE skills IS 'Skills and competencies that agents can possess or develop';

-- =============================================================================
-- TABLE 3: tools (external tools and integrations)
-- =============================================================================
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Tool Type
  tool_type TEXT, -- 'api', 'function', 'database', 'webhook', 'integration'
  integration_name TEXT, -- 'slack', 'salesforce', 'hubspot', 'custom'

  -- Configuration
  endpoint_url TEXT,
  authentication_type TEXT, -- 'api_key', 'oauth', 'basic', 'none'
  configuration JSONB DEFAULT '{}'::jsonb,

  -- Function Specification (for function calling)
  function_spec JSONB,
  -- Example:
  -- {
  --   "name": "get_competitor_intel",
  --   "description": "Retrieve competitive intelligence data",
  --   "parameters": {
  --     "type": "object",
  --     "properties": {
  --       "company_name": {"type": "string", "description": "Name of competitor"},
  --       "data_type": {"type": "string", "enum": ["financial", "product", "strategy"]}
  --     },
  --     "required": ["company_name"]
  --   }
  -- }

  -- Usage & Performance
  usage_count INTEGER DEFAULT 0,
  average_response_time_ms INTEGER,
  success_rate NUMERIC(5,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,

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

-- Indexes for tools
CREATE INDEX idx_tools_tenant ON tools(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tools_slug ON tools(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_tools_type ON tools(tool_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_tools_integration ON tools(integration_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_tools_active ON tools(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_tools_tags ON tools USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE tools IS 'External tools and integrations available to agents';
COMMENT ON COLUMN tools.function_spec IS 'OpenAI function calling specification (JSON schema)';

-- =============================================================================
-- TABLE 4: templates (reusable content templates)
-- =============================================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Template Details
  template_type TEXT, -- 'report', 'analysis', 'presentation', 'email', 'document'
  content TEXT NOT NULL,
  format TEXT DEFAULT 'markdown', -- 'markdown', 'html', 'docx', 'pdf'

  -- Variables
  variables JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"name": "product_name", "type": "string", "required": true}]

  -- Classification
  category TEXT,
  use_case TEXT,

  -- Usage
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,

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

-- Indexes for templates
CREATE INDEX idx_templates_tenant ON templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_slug ON templates(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_type ON templates(template_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_category ON templates(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_active ON templates(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_tags ON templates USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE templates IS 'Reusable content templates for deliverables and outputs';

-- =============================================================================
-- JUNCTION TABLE 1: agent_tools (agents can use tools)
-- =============================================================================
CREATE TABLE agent_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Usage
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, tool_id)
);

-- Indexes
CREATE INDEX idx_agent_tools_agent ON agent_tools(agent_id);
CREATE INDEX idx_agent_tools_tool ON agent_tools(tool_id);
CREATE INDEX idx_agent_tools_enabled ON agent_tools(is_enabled);

COMMENT ON TABLE agent_tools IS 'Maps agents to tools they can use';

-- =============================================================================
-- JUNCTION TABLE 2: agent_skills (agents have skills)
-- =============================================================================
CREATE TABLE agent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Proficiency
  proficiency_level domain_expertise DEFAULT 'intermediate',
  proficiency_score DECIMAL(3,2) CHECK (proficiency_score BETWEEN 0 AND 1),

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, skill_id)
);

-- Indexes
CREATE INDEX idx_agent_skills_agent ON agent_skills(agent_id);
CREATE INDEX idx_agent_skills_skill ON agent_skills(skill_id);
CREATE INDEX idx_agent_skills_proficiency ON agent_skills(proficiency_level);

COMMENT ON TABLE agent_skills IS 'Maps agents to skills with proficiency levels';

-- =============================================================================
-- JUNCTION TABLE 3: agent_knowledge (agents have access to knowledge)
-- =============================================================================
CREATE TABLE agent_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,

  -- Access Control
  can_cite BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, source_id)
);

-- Indexes
CREATE INDEX idx_agent_knowledge_agent ON agent_knowledge(agent_id);
CREATE INDEX idx_agent_knowledge_source ON agent_knowledge(source_id);
CREATE INDEX idx_agent_knowledge_score ON agent_knowledge(relevance_score DESC);

COMMENT ON TABLE agent_knowledge IS 'Maps agents to knowledge sources they can access';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get tools by agent
CREATE OR REPLACE FUNCTION get_tools_by_agent(p_agent_id UUID)
RETURNS TABLE(
  tool_id UUID,
  tool_name TEXT,
  tool_type TEXT,
  function_spec JSONB,
  is_enabled BOOLEAN
)
LANGUAGE SQL STABLE AS $$
  SELECT t.id, t.name, t.tool_type, t.function_spec, at.is_enabled
  FROM tools t
  JOIN agent_tools at ON t.id = at.tool_id
  WHERE at.agent_id = p_agent_id
  AND t.is_active = true
  AND t.deleted_at IS NULL
  ORDER BY at.is_required DESC, t.name;
$$;

-- Function to get skills by agent
CREATE OR REPLACE FUNCTION get_skills_by_agent(p_agent_id UUID)
RETURNS TABLE(
  skill_id UUID,
  skill_name TEXT,
  proficiency_level domain_expertise,
  proficiency_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT s.id, s.name, ask.proficiency_level, ask.proficiency_score
  FROM skills s
  JOIN agent_skills ask ON s.id = ask.skill_id
  WHERE ask.agent_id = p_agent_id
  AND s.is_active = true
  AND s.deleted_at IS NULL
  ORDER BY ask.proficiency_score DESC NULLS LAST;
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
    AND tablename IN ('skill_categories', 'skills', 'tools', 'templates', 'agent_tools', 'agent_skills', 'agent_knowledge');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 10 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 2';
    RAISE NOTICE '';
    RAISE NOTICE 'Skills & Tools Features:';
    RAISE NOTICE '  - Hierarchical skill categories';
    RAISE NOTICE '  - Tools with function calling specs';
    RAISE NOTICE '  - Reusable templates';
    RAISE NOTICE '  - Agent-skill proficiency mapping';
    RAISE NOTICE '  - Agent-tool configuration';
    RAISE NOTICE '  - Agent-knowledge access control';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 56 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 11 (Ask Expert Service)';
    RAISE NOTICE '';
END $$;
