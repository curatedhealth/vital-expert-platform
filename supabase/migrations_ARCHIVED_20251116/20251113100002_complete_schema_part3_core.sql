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
  maturity_level expertise_level DEFAULT 'foundational',

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
-- SKIPPED: Agents table already created via 20251113110004_create_agents_table_fixed.sql
-- That version uses the corrected expertise_level enum instead of domain_expertise

DO $$
BEGIN
  RAISE NOTICE 'Skipping agents table creation - already exists with correct schema';
  RAISE NOTICE 'Created via: 20251113110004_create_agents_table_fixed.sql';
END $$;

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
  expertise_level expertise_level,
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
-- =============================================================================
-- PHASE 06: Personas & Jobs-To-Be-Done
-- =============================================================================
-- PURPOSE: Create business context layer with personas and JTBDs
-- TABLES: 5 tables (personas, jobs_to_be_done, jtbd_personas, strategic_priorities, capability_jtbd_mapping)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: strategic_priorities (SP01-SP20)
-- =============================================================================
CREATE TABLE strategic_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  code TEXT NOT NULL, -- 'SP01', 'SP02', etc.
  name TEXT NOT NULL,
  description TEXT,

  -- Classification
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  priority_level INTEGER CHECK (priority_level BETWEEN 1 AND 5), -- 1=highest

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, code)
);

-- Indexes for strategic_priorities
CREATE INDEX idx_strategic_priorities_tenant ON strategic_priorities(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_strategic_priorities_code ON strategic_priorities(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_strategic_priorities_domain ON strategic_priorities(domain_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_strategic_priorities_priority ON strategic_priorities(priority_level);

COMMENT ON TABLE strategic_priorities IS 'Strategic priorities (SP01-SP20) defining high-level business objectives';

-- =============================================================================
-- TABLE 2: jobs_to_be_done (338 JTBDs)
-- =============================================================================
CREATE TABLE jobs_to_be_done (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  code TEXT NOT NULL, -- 'JTBD-001', 'JTBD-002', etc.
  name TEXT NOT NULL,
  description TEXT,

  -- Classification
  strategic_priority_id UUID REFERENCES strategic_priorities(id) ON DELETE SET NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  functional_area functional_area_type NOT NULL,

  -- Job Characteristics
  job_category job_category_type DEFAULT 'operational',
  complexity complexity_type DEFAULT 'medium',
  frequency frequency_type DEFAULT 'monthly',

  -- Outcome Metrics
  success_criteria TEXT[] DEFAULT ARRAY[]::TEXT[],
  kpis JSONB DEFAULT '[]'::jsonb,

  -- Context
  pain_points JSONB DEFAULT '[]'::jsonb,
  desired_outcomes JSONB DEFAULT '[]'::jsonb,

  -- Status
  status jtbd_status DEFAULT 'draft',
  validation_score DECIMAL(3,2) CHECK (validation_score BETWEEN 0 AND 1),

  -- Workflow Association
  workflow_id UUID, -- Forward reference to workflows table (created later)

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, code)
);

-- Indexes for jobs_to_be_done
CREATE INDEX idx_jtbds_tenant ON jobs_to_be_done(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_code ON jobs_to_be_done(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_strategic_priority ON jobs_to_be_done(strategic_priority_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_domain ON jobs_to_be_done(domain_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_functional_area ON jobs_to_be_done(functional_area) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_category ON jobs_to_be_done(job_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_complexity ON jobs_to_be_done(complexity) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_status ON jobs_to_be_done(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_workflow ON jobs_to_be_done(workflow_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jtbds_tags ON jobs_to_be_done USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE jobs_to_be_done IS '338 Jobs-To-Be-Done representing specific business objectives and tasks';
COMMENT ON COLUMN jobs_to_be_done.functional_area IS 'Primary organizational function (NOT NULL - fixed validation gap)';
COMMENT ON COLUMN jobs_to_be_done.workflow_id IS 'Optional reference to automated workflow for this JTBD';

-- =============================================================================
-- TABLE 3: personas (335 personas)
-- =============================================================================
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT,
  tagline TEXT,

  -- Professional Profile
  role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
  function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
  seniority_level TEXT, -- 'junior', 'mid', 'senior', 'executive', 'c-suite'

  -- Demographics
  years_of_experience INTEGER,
  typical_organization_size TEXT, -- 'startup', 'small', 'medium', 'large', 'enterprise'

  -- Context
  key_responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  pain_points JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,

  -- Behavior
  preferred_tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  communication_preferences JSONB DEFAULT '{}'::jsonb,
  decision_making_style TEXT,

  -- Avatar
  avatar_url TEXT,
  avatar_description TEXT,

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

-- Indexes for personas
CREATE INDEX idx_personas_tenant ON personas(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_slug ON personas(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_role ON personas(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_function ON personas(function_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_department ON personas(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_seniority ON personas(seniority_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_active ON personas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_tags ON personas USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE personas IS '335 user personas representing different professional roles and contexts';
COMMENT ON COLUMN personas.pain_points IS 'JSONB array of pain points (added to fix missing field)';

-- =============================================================================
-- JUNCTION TABLE: jtbd_personas (many-to-many with relevance scoring)
-- =============================================================================
CREATE TABLE jtbd_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,

  -- Relevance Scoring (FIXED: was INTEGER 1-10, now DECIMAL 0-1)
  relevance_score DECIMAL(3,2) NOT NULL CHECK (relevance_score BETWEEN 0 AND 1),
  is_primary BOOLEAN DEFAULT false,

  -- Context
  notes TEXT,
  mapping_source mapping_source_type DEFAULT 'manual',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(jtbd_id, persona_id)
);

-- Indexes for jtbd_personas
CREATE INDEX idx_jtbd_personas_jtbd ON jtbd_personas(jtbd_id);
CREATE INDEX idx_jtbd_personas_persona ON jtbd_personas(persona_id);
CREATE INDEX idx_jtbd_personas_score ON jtbd_personas(relevance_score DESC);
CREATE INDEX idx_jtbd_personas_primary ON jtbd_personas(is_primary) WHERE is_primary = true;
CREATE INDEX idx_jtbd_personas_source ON jtbd_personas(mapping_source);

COMMENT ON TABLE jtbd_personas IS 'Maps JTBDs to personas with 0-1 relevance scores (FIXED from 1-10 scale)';
COMMENT ON COLUMN jtbd_personas.relevance_score IS 'Relevance score 0.0-1.0 (FIXED: was INTEGER 1-10, caused type mismatch bug)';

-- =============================================================================
-- JUNCTION TABLE: capability_jtbd_mapping
-- =============================================================================
CREATE TABLE capability_jtbd_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,

  -- Relevance
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  is_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(capability_id, jtbd_id)
);

-- Indexes
CREATE INDEX idx_cap_jtbd_capability ON capability_jtbd_mapping(capability_id);
CREATE INDEX idx_cap_jtbd_jtbd ON capability_jtbd_mapping(jtbd_id);
CREATE INDEX idx_cap_jtbd_score ON capability_jtbd_mapping(relevance_score DESC);
CREATE INDEX idx_cap_jtbd_required ON capability_jtbd_mapping(is_required) WHERE is_required = true;

COMMENT ON TABLE capability_jtbd_mapping IS 'Maps capabilities to JTBDs showing which capabilities support which jobs';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get JTBDs by persona
CREATE OR REPLACE FUNCTION get_jtbds_by_persona(p_persona_id UUID)
RETURNS TABLE(
  id UUID,
  code TEXT,
  name TEXT,
  functional_area functional_area_type,
  relevance_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT j.id, j.code, j.name, j.functional_area, jp.relevance_score
  FROM jobs_to_be_done j
  JOIN jtbd_personas jp ON j.id = jp.jtbd_id
  WHERE jp.persona_id = p_persona_id
  AND j.deleted_at IS NULL
  ORDER BY jp.relevance_score DESC, j.code;
$$;

-- Function to get personas by JTBD
CREATE OR REPLACE FUNCTION get_personas_by_jtbd(p_jtbd_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  title TEXT,
  relevance_score DECIMAL
)
LANGUAGE SQL STABLE AS $$
  SELECT p.id, p.name, p.title, jp.relevance_score
  FROM personas p
  JOIN jtbd_personas jp ON p.id = jp.persona_id
  WHERE jp.jtbd_id = p_jtbd_id
  AND p.deleted_at IS NULL
  ORDER BY jp.relevance_score DESC;
$$;

-- Function to get JTBDs by functional area
CREATE OR REPLACE FUNCTION get_jtbds_by_function(p_functional_area functional_area_type)
RETURNS TABLE(
  id UUID,
  code TEXT,
  name TEXT,
  complexity complexity_type,
  status jtbd_status
)
LANGUAGE SQL STABLE AS $$
  SELECT id, code, name, complexity, status
  FROM jobs_to_be_done
  WHERE functional_area = p_functional_area
  AND deleted_at IS NULL
  ORDER BY code;
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
    AND tablename IN ('strategic_priorities', 'jobs_to_be_done', 'personas', 'jtbd_personas', 'capability_jtbd_mapping');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 06 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for data import:';
    RAISE NOTICE '  - 335 personas';
    RAISE NOTICE '  - 338 JTBDs';
    RAISE NOTICE '  - Strategic priorities (SP01-SP20)';
    RAISE NOTICE '';
    RAISE NOTICE 'CRITICAL FIX APPLIED:';
    RAISE NOTICE '  - jtbd_personas.relevance_score: DECIMAL(3,2) 0-1 scale';
    RAISE NOTICE '  - jobs_to_be_done.functional_area: NOT NULL constraint';
    RAISE NOTICE '  - personas.pain_points: JSONB field added';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 07 (Prompt System)';
    RAISE NOTICE '';
END $$;
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
