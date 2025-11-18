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
