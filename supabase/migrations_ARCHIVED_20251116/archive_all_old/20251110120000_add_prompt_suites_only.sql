-- ============================================================================
-- ADD PROMPT_SUITES TABLE - Use Existing 'prompt' Table for Frontend
-- ============================================================================
-- Purpose: Create prompt_suites table and add suite field to existing prompt table
-- - Keep existing 'prompt' table data (~3,570 prompts)
-- - Add 'suite' column to 'prompt' table if it doesn't exist
-- - Create 'prompt_suites' table with 10 PRISM suites
-- - Frontend will use existing 'prompt' table immediately
-- ============================================================================

-- ============================================================================
-- 1. ADD SUITE COLUMN TO EXISTING 'prompt' TABLE (if not exists)
-- ============================================================================

DO $$
BEGIN
  -- Add suite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt'
    AND column_name = 'suite'
  ) THEN
    ALTER TABLE prompt ADD COLUMN suite TEXT DEFAULT 'RULES™';
    RAISE NOTICE 'Added suite column to prompt table';
  ELSE
    RAISE NOTICE 'Suite column already exists in prompt table';
  END IF;

  -- Add subsuite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt'
    AND column_name = 'subsuite'
  ) THEN
    ALTER TABLE prompt ADD COLUMN subsuite TEXT;
    RAISE NOTICE 'Added subsuite column to prompt table';
  ELSE
    RAISE NOTICE 'Subsuite column already exists in prompt table';
  END IF;
END $$;

-- Create index on suite column
CREATE INDEX IF NOT EXISTS idx_prompt_suite ON prompt(suite);

-- ============================================================================
-- 2. CREATE PROMPT_SUITES TABLE
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT prompt_suites_unique_id_key UNIQUE (unique_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_suites_position ON prompt_suites(position);
CREATE INDEX IF NOT EXISTS idx_prompt_suites_active ON prompt_suites(is_active);

-- ============================================================================
-- 3. SEED 10 PRISM SUITES
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
-- 4. UPDATE SUITE ASSIGNMENT FOR EXISTING PROMPTS (Smart Mapping)
-- ============================================================================

DO $$
BEGIN
  -- Assign suites based on prompt name patterns
  UPDATE prompt SET suite = 'RULES™'
  WHERE suite IS NULL OR suite = 'RULES™'
  AND (
    LOWER(name) LIKE '%regulatory%' OR
    LOWER(name) LIKE '%fda%' OR
    LOWER(name) LIKE '%ema%' OR
    LOWER(name) LIKE '%compliance%' OR
    LOWER(display_name) LIKE '%regulatory%'
  );

  UPDATE prompt SET suite = 'TRIALS™'
  WHERE suite IS NULL OR suite = 'RULES™'
  AND (
    LOWER(name) LIKE '%clinical%' OR
    LOWER(name) LIKE '%trial%' OR
    LOWER(name) LIKE '%protocol%' OR
    LOWER(display_name) LIKE '%clinical%'
  );

  UPDATE prompt SET suite = 'GUARD™'
  WHERE suite IS NULL OR suite = 'RULES™'
  AND (
    LOWER(name) LIKE '%safety%' OR
    LOWER(name) LIKE '%pharmacovigilance%' OR
    LOWER(name) LIKE '%adverse%' OR
    LOWER(display_name) LIKE '%safety%'
  );

  UPDATE prompt SET suite = 'VALUE™'
  WHERE suite IS NULL OR suite = 'RULES™'
  AND (
    LOWER(name) LIKE '%heor%' OR
    LOWER(name) LIKE '%payer%' OR
    LOWER(name) LIKE '%market access%' OR
    LOWER(display_name) LIKE '%value%'
  );

  RAISE NOTICE 'Updated suite assignments for existing prompts';
END $$;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to view prompt suites" ON prompt_suites;
CREATE POLICY "Allow all authenticated users to view prompt suites"
  ON prompt_suites FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 6. VERIFY COMPLETION
-- ============================================================================

DO $$
DECLARE
  total_prompts INTEGER;
  total_suites INTEGER;
  prompts_with_suite INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_prompts FROM prompt WHERE validation_status = 'active';
  SELECT COUNT(*) INTO total_suites FROM prompt_suites WHERE is_active = TRUE;
  SELECT COUNT(*) INTO prompts_with_suite FROM prompt WHERE suite IS NOT NULL;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE!';
  RAISE NOTICE 'Total Prompts: %', total_prompts;
  RAISE NOTICE 'Prompts with Suite: %', prompts_with_suite;
  RAISE NOTICE 'Total Suites: %', total_suites;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Frontend ready at: /prism';
  RAISE NOTICE 'API will use table: prompt (existing data)';
  RAISE NOTICE '========================================';
END $$;
