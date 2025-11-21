-- ============================================================================
-- UNIFIED PROMPTS™ SCHEMA - Single Source of Truth (FIXED VERSION)
-- ============================================================================
-- Purpose: Consolidate all prompt data into industry-agnostic tables
-- - prompts: All prompts from both dh_prompt and legacy sources
-- - prompt_suites: All suites (PRISM framework) - industry agnostic
-- ============================================================================

-- ============================================================================
-- 1. CREATE UNIFIED PROMPTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompts (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,                    -- Portable ID: PRM-XXX-YYY-ZZZ

  -- Multi-tenancy (nullable for now)
  tenant_id UUID,

  -- Basic Information
  name TEXT NOT NULL,                                -- Internal name
  display_name TEXT NOT NULL,                        -- User-friendly name
  description TEXT NOT NULL,                         -- Prompt description

  -- Prompt Content
  system_prompt TEXT NOT NULL,                       -- System/instruction prompt
  user_prompt_template TEXT,                         -- Template with variables

  -- Categorization
  suite TEXT NOT NULL,                               -- PRISM suite: RULES™, TRIALS™, etc.
  subsuite TEXT,                                     -- Optional subsuite
  category TEXT NOT NULL,                            -- Domain: regulatory, clinical, etc.
  domain TEXT NOT NULL,                              -- Functional area

  -- Prompt Engineering
  pattern TEXT NOT NULL DEFAULT 'Direct',            -- CoT, Few-Shot, ReAct, Direct, RAG, etc.
  complexity_level TEXT CHECK (complexity_level IN ('Basic', 'Intermediate', 'Advanced', 'Expert')),

  -- Tags & Search
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Status & Lifecycle
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  validation_status TEXT DEFAULT 'active' CHECK (validation_status IN ('active', 'inactive', 'beta', 'deprecated')),
  version TEXT DEFAULT '1.0',

  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Model Configuration
  model_config JSONB DEFAULT '{
    "model": "claude-sonnet-4",
    "temperature": 0.7,
    "max_tokens": 4000
  }'::jsonb,

  -- Advanced Features
  execution_instructions JSONB,
  success_criteria JSONB,
  input_schema JSONB,
  output_schema JSONB,
  validation_rules JSONB,

  -- Performance & Usage
  estimated_tokens INTEGER,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),

  -- Compliance & Safety
  compliance_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisite_capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Ownership & Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT prompts_unique_id_key UNIQUE (unique_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_tenant ON prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompts_suite ON prompts(suite);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_pattern ON prompts(pattern);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_metadata ON prompts USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING GIN(
  to_tsvector('english',
    COALESCE(name, '') || ' ' ||
    COALESCE(display_name, '') || ' ' ||
    COALESCE(description, '')
  )
);

-- ============================================================================
-- 2. CREATE UNIFIED PROMPT_SUITES TABLE (Industry Agnostic)
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_suites (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,                    -- SUITE-RULES, SUITE-TRIALS, etc.

  -- Multi-tenancy (nullable for now)
  tenant_id UUID,

  -- Basic Information
  name TEXT NOT NULL,                                -- RULES™, TRIALS™, etc.
  acronym TEXT NOT NULL,                             -- RULES, TRIALS, etc.
  display_name TEXT NOT NULL,                        -- Full display name
  description TEXT NOT NULL,
  tagline TEXT,

  -- Organization
  category TEXT NOT NULL,                            -- regulatory, clinical, safety, etc.
  function TEXT NOT NULL,                            -- REGULATORY, CLINICAL, etc.
  domain TEXT,                                       -- Pharmaceutical, Digital Health, etc.
  position INTEGER NOT NULL DEFAULT 0,               -- Display order

  -- Visual
  color TEXT NOT NULL DEFAULT 'bg-gray-500',         -- Tailwind color class
  icon TEXT DEFAULT 'Sparkles',                      -- Icon name

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,                -- Extended attributes

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT prompt_suites_unique_id_key UNIQUE (unique_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_suites_tenant ON prompt_suites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompt_suites_category ON prompt_suites(category);
CREATE INDEX IF NOT EXISTS idx_prompt_suites_position ON prompt_suites(position);
CREATE INDEX IF NOT EXISTS idx_prompt_suites_active ON prompt_suites(is_active);

-- ============================================================================
-- 3. MIGRATE DATA FROM dh_prompt TO prompts
-- ============================================================================

-- Only migrate if dh_prompt exists and prompts is empty
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dh_prompt')
     AND NOT EXISTS (SELECT 1 FROM prompts LIMIT 1) THEN

    INSERT INTO prompts (
      unique_id,
      tenant_id,
      name,
      display_name,
      description,
      system_prompt,
      user_prompt_template,
      suite,
      subsuite,
      category,
      domain,
      pattern,
      complexity_level,
      tags,
      status,
      version,
      metadata,
      model_config,
      created_at,
      updated_at
    )
    SELECT
      COALESCE(unique_id, 'PRM-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12)),
      NULL as tenant_id,  -- Set to NULL if column doesn't exist
      name,
      name AS display_name,
      COALESCE((metadata->>'description')::TEXT, description, 'Prompt'),
      system_prompt,
      user_template,
      COALESCE((metadata->>'suite')::TEXT, 'RULES™'),
      (metadata->>'sub_suite')::TEXT,
      COALESCE(category, 'general'),
      COALESCE((metadata->>'workflow')::TEXT, 'general'),
      COALESCE(pattern, 'Direct'),
      (metadata->>'complexity')::TEXT,
      COALESCE(tags, ARRAY[]::TEXT[]),
      CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
      COALESCE(version_label, '1.0'),
      metadata,
      COALESCE(model_config, '{}'::jsonb),
      created_at,
      updated_at
    FROM dh_prompt
    WHERE is_active = TRUE;

    RAISE NOTICE 'Migrated % prompts from dh_prompt to prompts', (SELECT COUNT(*) FROM dh_prompt WHERE is_active = TRUE);
  END IF;
END $$;

-- ============================================================================
-- 4. MIGRATE DATA FROM dh_prompt_suite TO prompt_suites
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dh_prompt_suite')
     AND NOT EXISTS (SELECT 1 FROM prompt_suites LIMIT 1) THEN

    INSERT INTO prompt_suites (
      unique_id,
      tenant_id,
      name,
      acronym,
      display_name,
      description,
      tagline,
      category,
      function,
      domain,
      position,
      color,
      metadata,
      is_active,
      created_at,
      updated_at
    )
    SELECT
      unique_id,
      NULL as tenant_id,  -- Set to NULL if column doesn't exist
      name,
      COALESCE((metadata->>'acronym')::TEXT, UPPER(SUBSTRING(name FROM 1 FOR 5))),
      name AS display_name,
      COALESCE(description, ''),
      (metadata->>'tagline')::TEXT,
      COALESCE(category, 'general'),
      COALESCE((metadata->>'function')::TEXT, 'GENERAL'),
      (metadata->>'domain')::TEXT,
      COALESCE(position, 0),
      'bg-blue-500', -- Default color
      metadata,
      is_active,
      created_at,
      updated_at
    FROM dh_prompt_suite
    WHERE is_active = TRUE;

    RAISE NOTICE 'Migrated % suites from dh_prompt_suite to prompt_suites', (SELECT COUNT(*) FROM dh_prompt_suite WHERE is_active = TRUE);
  END IF;
END $$;

-- ============================================================================
-- 5. SEED 10 PRISM SUITES (If table is empty or has fewer than 10)
-- ============================================================================

INSERT INTO prompt_suites (unique_id, name, acronym, display_name, description, tagline, category, function, domain, position, color, metadata, is_active)
VALUES
  ('SUITE-RULES', 'RULES™', 'RULES', 'RULES™ - Regulatory Excellence', 'Regulatory Understanding & Legal Excellence Standards', 'Master Regulatory Compliance', 'regulatory', 'REGULATORY', 'Pharmaceutical', 1, 'bg-blue-500', '{"full_name": "Regulatory Understanding & Legal Excellence Standards", "key_areas": ["FDA/EMA submissions", "Regulatory strategy", "Compliance"]}'::jsonb, TRUE),
  ('SUITE-TRIALS', 'TRIALS™', 'TRIALS', 'TRIALS™ - Clinical Development', 'Therapeutic Research & Investigation Analysis & Leadership Standards', 'Excel in Clinical Trials', 'clinical', 'CLINICAL', 'Pharmaceutical', 2, 'bg-indigo-500', '{"full_name": "Therapeutic Research & Investigation Analysis & Leadership Standards", "key_areas": ["Protocol design", "Clinical operations", "Endpoints"]}'::jsonb, TRUE),
  ('SUITE-GUARD', 'GUARD™', 'GUARD', 'GUARD™ - Safety Framework', 'Global Understanding & Assessment of Risk & Drug Safety', 'Protect Patient Safety', 'safety', 'SAFETY', 'Pharmaceutical', 3, 'bg-red-500', '{"full_name": "Global Understanding & Assessment of Risk & Drug Safety", "key_areas": ["Pharmacovigilance", "Safety monitoring", "Signal detection"]}'::jsonb, TRUE),
  ('SUITE-VALUE', 'VALUE™', 'VALUE', 'VALUE™ - Market Access', 'Value Assessment & Launch Understanding Excellence', 'Demonstrate Value', 'heor', 'HEOR', 'Payers & Health Plans', 4, 'bg-green-500', '{"full_name": "Value Assessment & Launch Understanding Excellence", "key_areas": ["HEOR", "Payer engagement", "Pricing"]}'::jsonb, TRUE),
  ('SUITE-BRIDGE', 'BRIDGE™', 'BRIDGE', 'BRIDGE™ - Stakeholder Engagement', 'Building Relationships & Intelligence Development & Growth Excellence', 'Connect Stakeholders', 'medical_affairs', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 5, 'bg-cyan-500', '{"full_name": "Building Relationships & Intelligence Development & Growth Excellence", "key_areas": ["KOL engagement", "Medical affairs", "Field operations"]}'::jsonb, TRUE),
  ('SUITE-PROOF', 'PROOF™', 'PROOF', 'PROOF™ - Evidence Analytics', 'Professional Research & Outcomes Optimization & Framework', 'Generate Evidence', 'analytics', 'DATA_ANALYTICS', 'Pharmaceutical', 6, 'bg-teal-500', '{"full_name": "Professional Research & Outcomes Optimization & Framework", "key_areas": ["Real-world evidence", "Data analytics", "Evidence synthesis"]}'::jsonb, TRUE),
  ('SUITE-CRAFT', 'CRAFT™', 'CRAFT', 'CRAFT™ - Medical Writing', 'Creative Regulatory & Academic Framework & Technical Excellence', 'Write with Precision', 'writing', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 7, 'bg-orange-500', '{"full_name": "Creative Regulatory & Academic Framework & Technical Excellence", "key_areas": ["Scientific writing", "Publications", "Regulatory documents"]}'::jsonb, TRUE),
  ('SUITE-SCOUT', 'SCOUT™', 'SCOUT', 'SCOUT™ - Competitive Intelligence', 'Strategic Competitive & Operational Understanding & Tactical Intelligence', 'Track Competition', 'intelligence', 'BUSINESS_DEV', 'Pharmaceutical', 8, 'bg-purple-500', '{"full_name": "Strategic Competitive & Operational Understanding & Tactical Intelligence", "key_areas": ["Market analysis", "Pipeline tracking", "Competitive strategy"]}'::jsonb, TRUE),
  ('SUITE-PROJECT', 'PROJECT™', 'PROJECT', 'PROJECT™ - Project Management', 'Planning Resources Objectives Justification Execution Control Tracking', 'Deliver Projects', 'operations', 'OPERATIONS', 'Pharmaceutical', 9, 'bg-amber-500', '{"full_name": "Planning Resources Objectives Justification Execution Control Tracking", "key_areas": ["Program management", "Portfolio optimization", "Risk management"]}'::jsonb, TRUE),
  ('SUITE-FORGE', 'FORGE™', 'FORGE', 'FORGE™ - Digital Health Development', 'Foundation Optimization Regulatory Guidelines Engineering', 'Build Digital Health', 'digital_health', 'DIGITAL_HEALTH', 'Digital Health & DTx', 10, 'bg-emerald-500', '{"full_name": "Foundation Optimization Regulatory Guidelines Engineering", "key_areas": ["DTx", "SaMD", "Digital biomarkers"]}'::jsonb, TRUE)
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) - Simplified for now
-- ============================================================================

-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;

-- Prompts Policies - Allow all authenticated users for now
CREATE POLICY IF NOT EXISTS "Allow all authenticated users to view prompts"
  ON prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow all authenticated users to insert prompts"
  ON prompts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all authenticated users to update prompts"
  ON prompts FOR UPDATE
  TO authenticated
  USING (true);

-- Prompt Suites Policies - Allow all authenticated users
CREATE POLICY IF NOT EXISTS "Allow all authenticated users to view prompt suites"
  ON prompt_suites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage prompt suites"
  ON prompt_suites FOR ALL
  TO authenticated
  USING (true);

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompt_suites_updated_at ON prompt_suites;
CREATE TRIGGER update_prompt_suites_updated_at
  BEFORE UPDATE ON prompt_suites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Get prompt count by suite
CREATE OR REPLACE FUNCTION get_prompt_count_by_suite(suite_name TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM prompts
  WHERE suite = suite_name
  AND status = 'active';
$$ LANGUAGE SQL STABLE;

-- Get all suites with prompt counts
CREATE OR REPLACE FUNCTION get_suites_with_counts()
RETURNS TABLE (
  suite_id UUID,
  suite_name TEXT,
  suite_color TEXT,
  prompt_count BIGINT
) AS $$
  SELECT
    ps.id as suite_id,
    ps.name as suite_name,
    ps.color as suite_color,
    COUNT(p.id) as prompt_count
  FROM prompt_suites ps
  LEFT JOIN prompts p ON p.suite = ps.name AND p.status = 'active'
  WHERE ps.is_active = TRUE
  GROUP BY ps.id, ps.name, ps.color, ps.position
  ORDER BY ps.position;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE prompts IS 'Unified prompts table - single source of truth for all PROMPTS™ Framework prompts';
COMMENT ON TABLE prompt_suites IS 'PROMPTS™ Framework suites - industry agnostic categorization (RULES™, TRIALS™, etc.)';
