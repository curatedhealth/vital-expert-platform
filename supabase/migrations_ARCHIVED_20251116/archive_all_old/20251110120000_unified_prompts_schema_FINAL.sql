-- ============================================================================
-- UNIFIED PROMPTS™ SCHEMA - Single Source of Truth (WORKING VERSION)
-- ============================================================================
-- Purpose: Consolidate all prompt data into industry-agnostic tables
-- - prompts: All prompts from dh_prompt
-- - prompt_suites: All suites (PRISM framework)
-- ============================================================================

-- ============================================================================
-- 1. CREATE UNIFIED PROMPTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,
  tenant_id UUID,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,
  suite TEXT NOT NULL,
  subsuite TEXT,
  category TEXT NOT NULL,
  domain TEXT NOT NULL,
  pattern TEXT NOT NULL DEFAULT 'Direct',
  complexity_level TEXT CHECK (complexity_level IN ('Basic', 'Intermediate', 'Advanced', 'Expert')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  validation_status TEXT DEFAULT 'active',
  version TEXT DEFAULT '1.0',
  metadata JSONB DEFAULT '{}'::jsonb,
  model_config JSONB DEFAULT '{"model": "claude-sonnet-4", "temperature": 0.7, "max_tokens": 4000}'::jsonb,
  execution_instructions JSONB,
  success_criteria JSONB,
  input_schema JSONB,
  output_schema JSONB,
  validation_rules JSONB,
  estimated_tokens INTEGER,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  compliance_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisite_capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_suite ON prompts(suite);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);

-- ============================================================================
-- 2. CREATE UNIFIED PROMPT_SUITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,
  tenant_id UUID,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT,
  category TEXT NOT NULL,
  function TEXT NOT NULL,
  domain TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  icon TEXT DEFAULT 'Sparkles',
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_suites_position ON prompt_suites(position);

-- ============================================================================
-- 3. MIGRATE DATA FROM dh_prompt (SAFE VERSION)
-- ============================================================================

DO $$
DECLARE
  prompt_count INTEGER;
BEGIN
  -- Check if dh_prompt exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dh_prompt') THEN

    -- Check if prompts table is empty
    SELECT COUNT(*) INTO prompt_count FROM prompts;

    IF prompt_count = 0 THEN
      -- Safe migration - only select columns that exist
      INSERT INTO prompts (
        unique_id,
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
        name,
        name,
        COALESCE(description, 'Prompt'),
        system_prompt,
        user_template,
        COALESCE((metadata->>'suite')::TEXT, 'RULES™'),
        (metadata->>'sub_suite')::TEXT,
        COALESCE(category, 'general'),
        COALESCE(category, 'general'),
        COALESCE(pattern, 'Direct'),
        COALESCE(tags, ARRAY[]::TEXT[]),
        CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
        COALESCE(version_label, '1.0'),
        COALESCE(metadata, '{}'::jsonb),
        COALESCE(model_config, '{}'::jsonb),
        COALESCE(created_at, NOW()),
        COALESCE(updated_at, NOW())
      FROM dh_prompt
      WHERE is_active = TRUE;

      RAISE NOTICE 'Migrated % prompts from dh_prompt', (SELECT COUNT(*) FROM dh_prompt WHERE is_active = TRUE);
    ELSE
      RAISE NOTICE 'Prompts table already has % records, skipping migration', prompt_count;
    END IF;
  ELSE
    RAISE NOTICE 'dh_prompt table does not exist, skipping data migration';
  END IF;
END $$;

-- ============================================================================
-- 4. SEED 10 PRISM SUITES
-- ============================================================================

INSERT INTO prompt_suites (unique_id, name, acronym, display_name, description, tagline, category, function, domain, position, color, metadata, is_active)
VALUES
  ('SUITE-RULES', 'RULES™', 'RULES', 'RULES™ - Regulatory Excellence', 'Regulatory Understanding & Legal Excellence Standards', 'Master Regulatory Compliance', 'regulatory', 'REGULATORY', 'Pharmaceutical', 1, 'bg-blue-500', '{"full_name": "Regulatory Understanding & Legal Excellence Standards"}'::jsonb, TRUE),
  ('SUITE-TRIALS', 'TRIALS™', 'TRIALS', 'TRIALS™ - Clinical Development', 'Therapeutic Research & Investigation Analysis & Leadership Standards', 'Excel in Clinical Trials', 'clinical', 'CLINICAL', 'Pharmaceutical', 2, 'bg-indigo-500', '{"full_name": "Therapeutic Research & Investigation Analysis & Leadership Standards"}'::jsonb, TRUE),
  ('SUITE-GUARD', 'GUARD™', 'GUARD', 'GUARD™ - Safety Framework', 'Global Understanding & Assessment of Risk & Drug Safety', 'Protect Patient Safety', 'safety', 'SAFETY', 'Pharmaceutical', 3, 'bg-red-500', '{"full_name": "Global Understanding & Assessment of Risk & Drug Safety"}'::jsonb, TRUE),
  ('SUITE-VALUE', 'VALUE™', 'VALUE', 'VALUE™ - Market Access', 'Value Assessment & Launch Understanding Excellence', 'Demonstrate Value', 'heor', 'HEOR', 'Payers & Health Plans', 4, 'bg-green-500', '{"full_name": "Value Assessment & Launch Understanding Excellence"}'::jsonb, TRUE),
  ('SUITE-BRIDGE', 'BRIDGE™', 'BRIDGE', 'BRIDGE™ - Stakeholder Engagement', 'Building Relationships & Intelligence Development & Growth Excellence', 'Connect Stakeholders', 'medical_affairs', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 5, 'bg-cyan-500', '{"full_name": "Building Relationships & Intelligence Development & Growth Excellence"}'::jsonb, TRUE),
  ('SUITE-PROOF', 'PROOF™', 'PROOF', 'PROOF™ - Evidence Analytics', 'Professional Research & Outcomes Optimization & Framework', 'Generate Evidence', 'analytics', 'DATA_ANALYTICS', 'Pharmaceutical', 6, 'bg-teal-500', '{"full_name": "Professional Research & Outcomes Optimization & Framework"}'::jsonb, TRUE),
  ('SUITE-CRAFT', 'CRAFT™', 'CRAFT', 'CRAFT™ - Medical Writing', 'Creative Regulatory & Academic Framework & Technical Excellence', 'Write with Precision', 'writing', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 7, 'bg-orange-500', '{"full_name": "Creative Regulatory & Academic Framework & Technical Excellence"}'::jsonb, TRUE),
  ('SUITE-SCOUT', 'SCOUT™', 'SCOUT', 'SCOUT™ - Competitive Intelligence', 'Strategic Competitive & Operational Understanding & Tactical Intelligence', 'Track Competition', 'intelligence', 'BUSINESS_DEV', 'Pharmaceutical', 8, 'bg-purple-500', '{"full_name": "Strategic Competitive & Operational Understanding & Tactical Intelligence"}'::jsonb, TRUE),
  ('SUITE-PROJECT', 'PROJECT™', 'PROJECT', 'PROJECT™ - Project Management', 'Planning Resources Objectives Justification Execution Control Tracking', 'Deliver Projects', 'operations', 'OPERATIONS', 'Pharmaceutical', 9, 'bg-amber-500', '{"full_name": "Planning Resources Objectives Justification Execution Control Tracking"}'::jsonb, TRUE),
  ('SUITE-FORGE', 'FORGE™', 'FORGE', 'FORGE™ - Digital Health Development', 'Foundation Optimization Regulatory Guidelines Engineering', 'Build Digital Health', 'digital_health', 'DIGITAL_HEALTH', 'Digital Health & DTx', 10, 'bg-emerald-500', '{"full_name": "Foundation Optimization Regulatory Guidelines Engineering"}'::jsonb, TRUE)
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to view prompts" ON prompts;
DROP POLICY IF EXISTS "Allow all authenticated users to view prompt suites" ON prompt_suites;

CREATE POLICY "Allow all authenticated users to view prompts"
  ON prompts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all authenticated users to view prompt suites"
  ON prompt_suites FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

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
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETE
-- ============================================================================

DO $$
DECLARE
  total_prompts INTEGER;
  total_suites INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_prompts FROM prompts WHERE status = 'active';
  SELECT COUNT(*) INTO total_suites FROM prompt_suites WHERE is_active = TRUE;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE!';
  RAISE NOTICE 'Total Prompts: %', total_prompts;
  RAISE NOTICE 'Total Suites: %', total_suites;
  RAISE NOTICE '========================================';
END $$;
