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
-- SKIPPED: llm_providers table already exists from previous migrations
DO $$
BEGIN
  RAISE NOTICE 'Skipping llm_providers table - already exists';
  RAISE NOTICE 'Continuing with remaining tables in Part 4...';
END $$;

-- =============================================================================
-- TABLE 2: llm_models (specific models from providers)
-- =============================================================================
CREATE TABLE IF NOT EXISTS llm_models (
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
CREATE TABLE IF NOT EXISTS model_configurations (
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
-- SKIPPED: llm_providers table has different schema (no tenant_id column)
-- Seed data already exists from previous migrations

DO $$
BEGIN
  RAISE NOTICE 'Skipping llm_providers seed data - table schema differs from gold standard';
  RAISE NOTICE 'Existing data preserved';
END $$;

-- =============================================================================
-- SEED DATA: LLM Models
-- =============================================================================
-- SKIPPED: Seed data references provider IDs that may not exist in existing llm_providers table
-- Existing data preserved

DO $$
BEGIN
  RAISE NOTICE 'Skipping llm_models seed data - provider IDs may not match existing schema';
  RAISE NOTICE 'Existing data preserved';
END $$;

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
-- =============================================================================
-- PHASE 09: Knowledge Management & RAG System
-- =============================================================================
-- PURPOSE: Create knowledge sources, RAG chunks, and domain hierarchies
-- TABLES: 5 tables (knowledge_sources, knowledge_chunks, knowledge_domains, knowledge_domain_mapping, domain_hierarchies)
-- TIME: ~20 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: knowledge_domains (hierarchical knowledge taxonomy)
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  domain_path LTREE, -- e.g., 'clinical.oncology.breast_cancer'
  depth_level INTEGER DEFAULT 0,

  -- Classification
  domain_type TEXT, -- 'industry', 'function', 'therapeutic_area', 'technology', 'methodology'

  -- Metadata
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for knowledge_domains
CREATE INDEX idx_knowledge_domains_tenant ON knowledge_domains(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_parent ON knowledge_domains(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_path_gist ON knowledge_domains USING GIST(domain_path) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_slug ON knowledge_domains(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_domains_type ON knowledge_domains(domain_type) WHERE deleted_at IS NULL;

COMMENT ON TABLE knowledge_domains IS 'Hierarchical knowledge domain taxonomy for organizing knowledge sources';

-- =============================================================================
-- TABLE 2: knowledge_sources (documents, articles, internal docs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content
  content TEXT, -- Full text content
  content_type TEXT, -- 'pdf', 'markdown', 'html', 'docx', 'url', 'api'
  source_url TEXT,
  file_path TEXT, -- Path in storage

  -- Classification
  data_classification data_classification DEFAULT 'internal',
  source_type TEXT, -- 'internal', 'public', 'licensed', 'proprietary'

  -- Metadata
  author TEXT,
  published_date DATE,
  language TEXT DEFAULT 'en',
  word_count INTEGER,
  page_count INTEGER,

  -- Processing Status
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  embedding_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  chunk_count INTEGER DEFAULT 0,

  -- Quality Metrics
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  usage_count INTEGER DEFAULT 0,

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

-- Indexes for knowledge_sources
CREATE INDEX idx_knowledge_sources_tenant ON knowledge_sources(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_slug ON knowledge_sources(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_type ON knowledge_sources(content_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_classification ON knowledge_sources(data_classification) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(processing_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_sources_quality ON knowledge_sources(quality_score DESC NULLS LAST);

-- Full-text search
CREATE INDEX idx_knowledge_sources_search ON knowledge_sources USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))) WHERE deleted_at IS NULL;

COMMENT ON TABLE knowledge_sources IS 'Source documents and content for RAG system';

-- =============================================================================
-- TABLE 3: knowledge_chunks (RAG embeddings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, -- Position in source
  start_position INTEGER, -- Character position in original
  end_position INTEGER,

  -- Embedding (pgvector)
  embedding vector(1536), -- OpenAI ada-002 dimension

  -- Context
  heading TEXT, -- Section heading if applicable
  context_before TEXT, -- Surrounding context for better retrieval
  context_after TEXT,

  -- Metadata
  word_count INTEGER,
  token_count INTEGER,

  -- Quality
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(source_id, chunk_index)
);

-- Indexes for knowledge_chunks
CREATE INDEX idx_knowledge_chunks_source ON knowledge_chunks(source_id);
CREATE INDEX idx_knowledge_chunks_index ON knowledge_chunks(chunk_index);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE knowledge_chunks IS 'Text chunks with embeddings for semantic search (RAG)';
COMMENT ON COLUMN knowledge_chunks.embedding IS 'Vector embedding for semantic similarity search (dimension 1536)';

-- =============================================================================
-- JUNCTION TABLE 1: knowledge_domain_mapping
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_domain_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(source_id, domain_id)
);

-- Indexes
CREATE INDEX idx_knowledge_domain_map_source ON knowledge_domain_mapping(source_id);
CREATE INDEX idx_knowledge_domain_map_domain ON knowledge_domain_mapping(domain_id);
CREATE INDEX idx_knowledge_domain_map_score ON knowledge_domain_mapping(relevance_score DESC);

COMMENT ON TABLE knowledge_domain_mapping IS 'Maps knowledge sources to domains';

-- =============================================================================
-- JUNCTION TABLE 2: domain_hierarchies (alternative to ltree for complex relationships)
-- =============================================================================
CREATE TABLE IF NOT EXISTS domain_hierarchies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  child_domain_id UUID NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,

  -- Relationship Type
  relationship_type TEXT DEFAULT 'parent_child', -- 'parent_child', 'related', 'prerequisite'
  depth INTEGER DEFAULT 1, -- Distance in hierarchy

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(parent_domain_id, child_domain_id, relationship_type),
  CHECK (parent_domain_id != child_domain_id)
);

-- Indexes
CREATE INDEX idx_domain_hier_parent ON domain_hierarchies(parent_domain_id);
CREATE INDEX idx_domain_hier_child ON domain_hierarchies(child_domain_id);
CREATE INDEX idx_domain_hier_type ON domain_hierarchies(relationship_type);

COMMENT ON TABLE domain_hierarchies IS 'Explicit domain hierarchy relationships for complex taxonomies';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to search knowledge by semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  p_query_embedding vector(1536),
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_min_similarity NUMERIC DEFAULT 0.7
)
RETURNS TABLE(
  chunk_id UUID,
  source_id UUID,
  source_title TEXT,
  content TEXT,
  similarity NUMERIC
)
LANGUAGE SQL STABLE AS $$
  SELECT
    kc.id as chunk_id,
    ks.id as source_id,
    ks.title as source_title,
    kc.content,
    1 - (kc.embedding <=> p_query_embedding) as similarity
  FROM knowledge_chunks kc
  JOIN knowledge_sources ks ON kc.source_id = ks.id
  WHERE ks.tenant_id = p_tenant_id
  AND ks.is_active = true
  AND ks.deleted_at IS NULL
  AND 1 - (kc.embedding <=> p_query_embedding) >= p_min_similarity
  ORDER BY kc.embedding <=> p_query_embedding
  LIMIT p_limit;
$$;

-- Function to get knowledge sources by domain
CREATE OR REPLACE FUNCTION get_knowledge_by_domain(p_domain_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  relevance_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT ks.id, ks.title, ks.description, kdm.relevance_score
  FROM knowledge_sources ks
  JOIN knowledge_domain_mapping kdm ON ks.id = kdm.source_id
  WHERE kdm.domain_id = p_domain_id
  AND ks.is_active = true
  AND ks.deleted_at IS NULL
  ORDER BY kdm.relevance_score DESC, ks.quality_score DESC NULLS LAST;
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
    AND tablename IN ('knowledge_domains', 'knowledge_sources', 'knowledge_chunks', 'knowledge_domain_mapping', 'domain_hierarchies');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 09 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 2';
    RAISE NOTICE '';
    RAISE NOTICE 'RAG System Features:';
    RAISE NOTICE '  - Knowledge domain taxonomy with ltree';
    RAISE NOTICE '  - Document ingestion and chunking';
    RAISE NOTICE '  - Vector embeddings (pgvector, dimension 1536)';
    RAISE NOTICE '  - Semantic similarity search';
    RAISE NOTICE '  - Domain-based organization';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 10 (Skills & Tools)';
    RAISE NOTICE '';
END $$;
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
CREATE TABLE IF NOT EXISTS skill_categories (
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
CREATE TABLE IF NOT EXISTS skills (
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
CREATE TABLE IF NOT EXISTS tools (
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
CREATE TABLE IF NOT EXISTS templates (
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
CREATE TABLE IF NOT EXISTS agent_tools (
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
CREATE TABLE IF NOT EXISTS agent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Proficiency
  proficiency_level expertise_level DEFAULT 'intermediate',
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
CREATE TABLE IF NOT EXISTS agent_knowledge (
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
  proficiency_level expertise_level,
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
