-- ==========================================
-- FILE: phase3_value_ai_layers.sql  
-- PURPOSE: Create Value Layer and AI Layer with proper normalization and JTBD mappings
-- PHASE: 3 of 4
-- DEPENDENCIES: phase1 and phase2 must be executed successfully
-- GOLDEN RULES: Implements Rule #1 (Zero JSONB), Rule #2 (3NF), Rule #3 (Proper FKs)
-- ==========================================

-- ==========================================
-- SECTION 1: VALUE LAYER - REFERENCE TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 3: VALUE & AI LAYERS ===';
  RAISE NOTICE 'Creating Value Layer reference tables...';
END $$;

-- Create value_categories table
CREATE TABLE IF NOT EXISTS value_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed value categories
INSERT INTO value_categories (code, name, description, sort_order) VALUES
  ('SMARTER', 'Smarter', 'Enhanced decision-making and intelligence', 1),
  ('FASTER', 'Faster', 'Improved speed and efficiency', 2),
  ('BETTER', 'Better', 'Higher quality outcomes', 3),
  ('EFFICIENT', 'Efficient', 'Optimized resource utilization', 4),
  ('SAFER', 'Safer', 'Reduced risk and improved safety', 5),
  ('SCALABLE', 'Scalable', 'Ability to grow and adapt', 6)
ON CONFLICT (code) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✓ Created and seeded value_categories';
END $$;

-- Create value_drivers table
CREATE TABLE IF NOT EXISTS value_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  driver_type TEXT CHECK (driver_type IN ('internal', 'external')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed value drivers
INSERT INTO value_drivers (code, name, driver_type, description) VALUES
  ('OPERATIONAL_EFFICIENCY', 'Operational Efficiency', 'internal', 'Streamlined operations and processes'),
  ('SCIENTIFIC_QUALITY', 'Scientific Quality', 'internal', 'Rigor and excellence in scientific work'),
  ('COMPLIANCE', 'Regulatory Compliance', 'internal', 'Adherence to regulations and standards'),
  ('COST_REDUCTION', 'Cost Reduction', 'internal', 'Decreased operational costs'),
  ('EMPLOYEE_EXPERIENCE', 'Employee Experience', 'internal', 'Improved employee satisfaction and productivity'),
  ('HCP_EXPERIENCE', 'HCP Experience', 'external', 'Enhanced healthcare professional interactions'),
  ('PATIENT_IMPACT', 'Patient Impact', 'external', 'Positive patient outcomes'),
  ('MARKET_ACCESS', 'Market Access', 'external', 'Expanded market reach'),
  ('STAKEHOLDER_TRUST', 'Stakeholder Trust', 'external', 'Increased confidence from stakeholders')
ON CONFLICT (code) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✓ Created and seeded value_drivers';
END $$;

-- ==========================================
-- SECTION 2: VALUE LAYER - JUNCTION TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating Value Layer junction tables...';
END $$;

-- Create jtbd_value_categories junction
CREATE TABLE IF NOT EXISTS jtbd_value_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES value_categories(id) ON DELETE CASCADE,
  relevance_score NUMERIC(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_value_category UNIQUE(jtbd_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_value_categories_jtbd ON jtbd_value_categories(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_categories_category ON jtbd_value_categories(category_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Created jtbd_value_categories junction';
END $$;

-- Create jtbd_value_drivers junction
CREATE TABLE IF NOT EXISTS jtbd_value_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES value_drivers(id) ON DELETE CASCADE,
  impact_strength NUMERIC(3,2) CHECK (impact_strength BETWEEN 0 AND 1),
  quantified_value_usd NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_value_driver UNIQUE(jtbd_id, driver_id)
);

CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_jtbd ON jtbd_value_drivers(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_value_drivers_driver ON jtbd_value_drivers(driver_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Created jtbd_value_drivers junction';
END $$;

-- ==========================================
-- SECTION 3: AI LAYER - REFERENCE TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating AI Layer reference tables...';
END $$;

-- Create ai_intervention_types table
CREATE TABLE IF NOT EXISTS ai_intervention_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed AI intervention types
INSERT INTO ai_intervention_types (code, name, description) VALUES
  ('AUTOMATION', 'Automation', 'Fully automate repetitive tasks'),
  ('AUGMENTATION', 'Augmentation', 'Enhance human capabilities with AI assistance'),
  ('REDESIGN', 'Redesign', 'Fundamentally transform the process using AI')
ON CONFLICT (code) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✓ Created and seeded ai_intervention_types';
END $$;

-- ==========================================
-- SECTION 4: AI LAYER - ASSESSMENT TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating AI Layer assessment tables...';
END $$;

-- Create jtbd_ai_suitability table
CREATE TABLE IF NOT EXISTS jtbd_ai_suitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE REFERENCES jtbd(id) ON DELETE CASCADE,
  
  -- Suitability scores by AI capability
  rag_score NUMERIC(3,2) CHECK (rag_score BETWEEN 0 AND 1),
  summary_score NUMERIC(3,2) CHECK (summary_score BETWEEN 0 AND 1),
  generation_score NUMERIC(3,2) CHECK (generation_score BETWEEN 0 AND 1),
  classification_score NUMERIC(3,2) CHECK (classification_score BETWEEN 0 AND 1),
  reasoning_score NUMERIC(3,2) CHECK (reasoning_score BETWEEN 0 AND 1),
  automation_score NUMERIC(3,2) CHECK (automation_score BETWEEN 0 AND 1),
  
  -- Overall assessment
  overall_ai_readiness NUMERIC(3,2) CHECK (overall_ai_readiness BETWEEN 0 AND 1),
  intervention_type_id UUID REFERENCES ai_intervention_types(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suitability_jtbd ON jtbd_ai_suitability(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suitability_intervention ON jtbd_ai_suitability(intervention_type_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suitability_readiness ON jtbd_ai_suitability(overall_ai_readiness) WHERE overall_ai_readiness >= 0.7;

DO $$
BEGIN
  RAISE NOTICE '✓ Created jtbd_ai_suitability';
END $$;

-- Create ai_opportunities table
CREATE TABLE IF NOT EXISTS ai_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  
  opportunity_name TEXT NOT NULL,
  description TEXT,
  
  automation_potential NUMERIC(3,2) CHECK (automation_potential BETWEEN 0 AND 1),
  augmentation_potential NUMERIC(3,2) CHECK (augmentation_potential BETWEEN 0 AND 1),
  intervention_type_id UUID REFERENCES ai_intervention_types(id),
  
  complexity TEXT CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  value_estimate_usd NUMERIC,
  implementation_effort TEXT CHECK (implementation_effort IN ('low', 'medium', 'high', 'very_high')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_opportunities_jtbd ON ai_opportunities(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_ai_opportunities_intervention ON ai_opportunities(intervention_type_id);
CREATE INDEX IF NOT EXISTS idx_ai_opportunities_complexity ON ai_opportunities(complexity);

DO $$
BEGIN
  RAISE NOTICE '✓ Created ai_opportunities';
END $$;

-- Create ai_use_cases table
CREATE TABLE IF NOT EXISTS ai_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ai_opportunities(id) ON DELETE CASCADE,
  
  use_case_name TEXT NOT NULL,
  description TEXT,
  service_layer TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_use_cases_opportunity ON ai_use_cases(opportunity_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Created ai_use_cases';
END $$;

-- Create jtbd_context table
CREATE TABLE IF NOT EXISTS jtbd_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  context_type TEXT CHECK (context_type IN ('precondition', 'postcondition', 'trigger')),
  context_text TEXT NOT NULL,
  sequence_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_context_jtbd ON jtbd_context(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_context_type ON jtbd_context(context_type);

DO $$
BEGIN
  RAISE NOTICE '✓ Created jtbd_context';
END $$;

-- ==========================================
-- SECTION 5: DROP DEPRECATED AI TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Dropping deprecated AI tables...';
END $$;

-- Drop old AI opportunities table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_gen_ai_opportunities') THEN
    DROP TABLE jtbd_gen_ai_opportunities CASCADE;
    RAISE NOTICE '✓ Dropped deprecated table: jtbd_gen_ai_opportunities';
  ELSE
    RAISE NOTICE '! Table jtbd_gen_ai_opportunities does not exist';
  END IF;
END $$;

-- ==========================================
-- SECTION 6: VERIFICATION QUERIES
-- ==========================================

DO $$
DECLARE
  value_cat_count INTEGER;
  value_drv_count INTEGER;
  ai_int_count INTEGER;
  jtbd_value_cat INTEGER;
  jtbd_value_drv INTEGER;
  ai_suit_count INTEGER;
  ai_opp_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== PHASE 3 VERIFICATION ===';
  
  -- Count reference data
  SELECT COUNT(*) INTO value_cat_count FROM value_categories;
  RAISE NOTICE 'Value categories: % (expected 6)', value_cat_count;
  
  SELECT COUNT(*) INTO value_drv_count FROM value_drivers;
  RAISE NOTICE 'Value drivers: % (expected 9)', value_drv_count;
  
  SELECT COUNT(*) INTO ai_int_count FROM ai_intervention_types;
  RAISE NOTICE 'AI intervention types: % (expected 3)', ai_int_count;
  
  -- Count mappings
  SELECT COUNT(*) INTO jtbd_value_cat FROM jtbd_value_categories;
  RAISE NOTICE 'JTBD→Value category mappings: %', jtbd_value_cat;
  
  SELECT COUNT(*) INTO jtbd_value_drv FROM jtbd_value_drivers;
  RAISE NOTICE 'JTBD→Value driver mappings: %', jtbd_value_drv;
  
  SELECT COUNT(*) INTO ai_suit_count FROM jtbd_ai_suitability;
  RAISE NOTICE 'JTBD AI suitability assessments: %', ai_suit_count;
  
  SELECT COUNT(*) INTO ai_opp_count FROM ai_opportunities;
  RAISE NOTICE 'AI opportunities: %', ai_opp_count;
  
  -- Overall status
  IF value_cat_count = 6 AND value_drv_count = 9 AND ai_int_count = 3 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ PHASE 3 COMPLETE - ALL REFERENCE DATA SEEDED ✓✓✓';
  ELSE
    RAISE WARNING 'Phase 3 completed with warnings - check reference data counts';
  END IF;
END $$;

-- Human-readable verification query
SELECT 
  'Value Categories' as entity,
  COUNT(*)::TEXT as count,
  '6 expected' as note
FROM value_categories

UNION ALL

SELECT 
  'Value Drivers',
  COUNT(*)::TEXT,
  '9 expected'
FROM value_drivers

UNION ALL

SELECT 
  'AI Intervention Types',
  COUNT(*)::TEXT,
  '3 expected'
FROM ai_intervention_types

UNION ALL

SELECT 
  'JTBD→Value Category Mappings',
  COUNT(*)::TEXT,
  'varies by data'
FROM jtbd_value_categories

UNION ALL

SELECT 
  'JTBD→Value Driver Mappings',
  COUNT(*)::TEXT,
  'varies by data'
FROM jtbd_value_drivers

UNION ALL

SELECT 
  'JTBD AI Suitability',
  COUNT(*)::TEXT,
  'varies by data'
FROM jtbd_ai_suitability

UNION ALL

SELECT 
  'AI Opportunities',
  COUNT(*)::TEXT,
  'varies by data'
FROM ai_opportunities;

