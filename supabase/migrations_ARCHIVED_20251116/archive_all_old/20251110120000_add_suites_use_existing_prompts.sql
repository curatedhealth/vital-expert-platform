-- ============================================================================
-- ADD PROMPT_SUITES - Use Existing 'prompts' Table
-- ============================================================================
-- Purpose:
-- - Create prompt_suites table with 10 PRISM suites
-- - Add suite/subsuite columns to existing 'prompts' table if missing
-- - Keep all existing data in 'prompts' table (~3,570 records)
-- - Frontend will use existing 'prompts' table immediately
-- ============================================================================

-- ============================================================================
-- 1. ADD SUITE COLUMNS TO EXISTING 'prompts' TABLE (if needed)
-- ============================================================================

DO $$
BEGIN
  -- Add suite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompts'
    AND column_name = 'suite'
  ) THEN
    ALTER TABLE prompts ADD COLUMN suite TEXT DEFAULT 'RULES™';
    RAISE NOTICE 'Added suite column to prompts table';
  ELSE
    RAISE NOTICE 'Suite column already exists';
  END IF;

  -- Add subsuite column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompts'
    AND column_name = 'subsuite'
  ) THEN
    ALTER TABLE prompts ADD COLUMN subsuite TEXT;
    RAISE NOTICE 'Added subsuite column to prompts table';
  ELSE
    RAISE NOTICE 'Subsuite column already exists';
  END IF;
END $$;

-- Create index on suite
CREATE INDEX IF NOT EXISTS idx_prompts_suite ON prompts(suite);

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_suites_position ON prompt_suites(position);
CREATE INDEX IF NOT EXISTS idx_prompt_suites_active ON prompt_suites(is_active);

-- ============================================================================
-- 3. SEED 10 PRISM SUITES
-- ============================================================================

INSERT INTO prompt_suites (unique_id, name, acronym, display_name, description, tagline, category, function, domain, position, color, metadata, is_active)
VALUES
  ('SUITE-RULES', 'RULES™', 'RULES', 'RULES™ - Regulatory Excellence', 'Regulatory Understanding & Legal Excellence Standards', 'Master Regulatory Compliance', 'regulatory', 'REGULATORY', 'Pharmaceutical', 1, 'bg-blue-500', '{"full_name": "Regulatory Understanding & Legal Excellence Standards"}'::jsonb, TRUE),
  ('SUITE-TRIALS', 'TRIALS™', 'TRIALS', 'TRIALS™ - Clinical Development', 'Therapeutic Research & Investigation Analysis & Leadership Standards', 'Excel in Clinical Trials', 'clinical', 'CLINICAL', 'Pharmaceutical', 2, 'bg-indigo-500', '{"full_name": "Therapeutic Research & Investigation Analysis & Leadership Standards"}'::jsonb, TRUE),
  ('SUITE-GUARD', 'GUARD™', 'GUARD', 'GUARD™ - Safety Framework', 'Global Understanding & Assessment of Risk & Drug Safety', 'Protect Patient Safety', 'safety', 'SAFETY', 'Pharmaceutical', 3, 'bg-red-500', '{"full_name": "Global Understanding & Assessment of Risk & Drug Safety"}'::jsonb, TRUE),
  ('SUITE-VALUE', 'VALUE™', 'VALUE', 'VALUE™ - Market Access', 'Value Assessment & Launch Understanding Excellence', 'Demonstrate Value', 'heor', 'HEOR', 'Payers & Health Plans', 4, 'bg-green-500', '{"full_name": "Value Assessment & Launch Understanding Excellence"}'::jsonb, TRUE),
  ('SUITE-BRIDGE', 'BRIDGE™', 'BRIDGE', 'BRIDGE™ - Stakeholder Engagement', 'Building Relationships & Intelligence Development & Growth Excellence', 'Connect Stakeholders', 'medical_affairs', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 5, 'bg-cyan-500', '{"full_name": "Building Relationships & Intelligence Development & Growth Excellence"}'::jsonb, TRUE),
  ('SUITE-PROOF', 'PROOF™', 'PROOF', 'PROOF™ - Evidence Analytics', 'Professional Research & Outcomes Optimization & Framework', 'Generate Evidence', 'analytics', 'DATA_ANALYTICS', 'Pharmaceutical', 6, 'bg-teal-500', '{"full_name": "Professional Research & Optimization & Framework"}'::jsonb, TRUE),
  ('SUITE-CRAFT', 'CRAFT™', 'CRAFT', 'CRAFT™ - Medical Writing', 'Creative Regulatory & Academic Framework & Technical Excellence', 'Write with Precision', 'writing', 'MEDICAL_AFFAIRS', 'Pharmaceutical', 7, 'bg-orange-500', '{"full_name": "Creative Regulatory & Academic Framework & Technical Excellence"}'::jsonb, TRUE),
  ('SUITE-SCOUT', 'SCOUT™', 'SCOUT', 'SCOUT™ - Competitive Intelligence', 'Strategic Competitive & Operational Understanding & Tactical Intelligence', 'Track Competition', 'intelligence', 'BUSINESS_DEV', 'Pharmaceutical', 8, 'bg-purple-500', '{"full_name": "Strategic Competitive & Operational Understanding & Tactical Intelligence"}'::jsonb, TRUE),
  ('SUITE-PROJECT', 'PROJECT™', 'PROJECT', 'PROJECT™ - Project Management', 'Planning Resources Objectives Justification Execution Control Tracking', 'Deliver Projects', 'operations', 'OPERATIONS', 'Pharmaceutical', 9, 'bg-amber-500', '{"full_name": "Planning Resources Objectives Justification Execution Control Tracking"}'::jsonb, TRUE),
  ('SUITE-FORGE', 'FORGE™', 'FORGE', 'FORGE™ - Digital Health Development', 'Foundation Optimization Regulatory Guidelines Engineering', 'Build Digital Health', 'digital_health', 'DIGITAL_HEALTH', 'Digital Health & DTx', 10, 'bg-emerald-500', '{"full_name": "Foundation Optimization Regulatory Guidelines Engineering"}'::jsonb, TRUE)
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- 4. SMART SUITE ASSIGNMENT (Update existing prompts - ONLY using 'name' column)
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Assign suites based on name patterns ONLY (no metadata column reference)
  WITH suite_updates AS (
    SELECT
      id,
      CASE
        WHEN LOWER(name) LIKE '%regulatory%' OR LOWER(name) LIKE '%fda%' OR LOWER(name) LIKE '%ema%' OR LOWER(name) LIKE '%compliance%' THEN 'RULES™'
        WHEN LOWER(name) LIKE '%clinical%' OR LOWER(name) LIKE '%trial%' OR LOWER(name) LIKE '%protocol%' OR LOWER(name) LIKE '%study%' THEN 'TRIALS™'
        WHEN LOWER(name) LIKE '%safety%' OR LOWER(name) LIKE '%pharmacovigilance%' OR LOWER(name) LIKE '%adverse%' OR LOWER(name) LIKE '%pv%' THEN 'GUARD™'
        WHEN LOWER(name) LIKE '%heor%' OR LOWER(name) LIKE '%payer%' OR LOWER(name) LIKE '%market access%' OR LOWER(name) LIKE '%value%' THEN 'VALUE™'
        WHEN LOWER(name) LIKE '%medical affairs%' OR LOWER(name) LIKE '%kol%' OR LOWER(name) LIKE '%msl%' OR LOWER(name) LIKE '%stakeholder%' THEN 'BRIDGE™'
        WHEN LOWER(name) LIKE '%analytics%' OR LOWER(name) LIKE '%data%' OR LOWER(name) LIKE '%evidence%' OR LOWER(name) LIKE '%rwe%' THEN 'PROOF™'
        WHEN LOWER(name) LIKE '%writing%' OR LOWER(name) LIKE '%publication%' OR LOWER(name) LIKE '%manuscript%' OR LOWER(name) LIKE '%document%' THEN 'CRAFT™'
        WHEN LOWER(name) LIKE '%competitive%' OR LOWER(name) LIKE '%intelligence%' OR LOWER(name) LIKE '%market analysis%' OR LOWER(name) LIKE '%landscape%' THEN 'SCOUT™'
        WHEN LOWER(name) LIKE '%project%' OR LOWER(name) LIKE '%management%' OR LOWER(name) LIKE '%portfolio%' OR LOWER(name) LIKE '%planning%' THEN 'PROJECT™'
        WHEN LOWER(name) LIKE '%digital%' OR LOWER(name) LIKE '%dtx%' OR LOWER(name) LIKE '%samd%' OR LOWER(name) LIKE '%app%' THEN 'FORGE™'
        ELSE 'RULES™'
      END as assigned_suite
    FROM prompts
    WHERE suite IS NULL OR suite = ''
  )
  UPDATE prompts p
  SET suite = su.assigned_suite
  FROM suite_updates su
  WHERE p.id = su.id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Assigned suites to % prompts', updated_count;
END $$;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE prompt_suites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to view prompt suites" ON prompt_suites;
CREATE POLICY "Allow all authenticated users to view prompt suites"
  ON prompt_suites FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 6. COMPLETION REPORT
-- ============================================================================

DO $$
DECLARE
  total_prompts INTEGER;
  active_prompts INTEGER;
  total_suites INTEGER;
  prompts_with_suite INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_prompts FROM prompts;
  SELECT COUNT(*) INTO active_prompts FROM prompts WHERE status = 'active';
  SELECT COUNT(*) INTO total_suites FROM prompt_suites WHERE is_active = TRUE;
  SELECT COUNT(*) INTO prompts_with_suite FROM prompts WHERE suite IS NOT NULL AND suite != '';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Prompts: %', total_prompts;
  RAISE NOTICE 'Active Prompts: %', active_prompts;
  RAISE NOTICE 'Prompts with Suite: %', prompts_with_suite;
  RAISE NOTICE 'Total Suites: %', total_suites;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Frontend ready at: /prism';
  RAISE NOTICE 'Using table: prompts (existing data)';
  RAISE NOTICE '========================================';
END $$;
