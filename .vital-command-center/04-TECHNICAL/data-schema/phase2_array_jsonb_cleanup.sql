-- ==========================================
-- FILE: phase2_array_jsonb_cleanup.sql
-- PURPOSE: Migrate all JSONB and array columns to normalized junction tables
-- PHASE: 2 of 4
-- DEPENDENCIES: phase1_foundation_cleanup.sql must be executed successfully
-- GOLDEN RULES: Implements Rule #1 (Zero JSONB), Rule #2 (3NF), Rule #3 (TEXT[] for simple lists only)
-- ==========================================

-- ==========================================
-- SECTION 1: CREATE NORMALIZED TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 2: ARRAY & JSONB NORMALIZATION ===';
  RAISE NOTICE 'Creating normalized tables for JTBD attributes...';
END $$;

-- Create jtbd_kpis table
CREATE TABLE IF NOT EXISTS jtbd_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  kpi_name TEXT NOT NULL,
  kpi_description TEXT,
  kpi_type TEXT,
  target_value NUMERIC,
  measurement_unit TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_kpi UNIQUE(jtbd_id, kpi_name)
);

DO $$
BEGIN
  RAISE NOTICE '✓ Created table: jtbd_kpis';
END $$;

-- Enhance jtbd_pain_points table (add missing columns if needed)
DO $$
BEGIN
  -- Ensure all required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_pain_points' AND column_name = 'frequency') THEN
    ALTER TABLE jtbd_pain_points ADD COLUMN frequency TEXT;
    RAISE NOTICE '✓ Added column: jtbd_pain_points.frequency';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_pain_points' AND column_name = 'impact') THEN
    ALTER TABLE jtbd_pain_points ADD COLUMN impact TEXT;
    RAISE NOTICE '✓ Added column: jtbd_pain_points.impact';
  END IF;
  
  RAISE NOTICE '✓ Enhanced table: jtbd_pain_points';
END $$;

-- Create jtbd_desired_outcomes table
CREATE TABLE IF NOT EXISTS jtbd_desired_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  outcome TEXT NOT NULL,
  importance INTEGER CHECK (importance >= 1 AND importance <= 10),
  outcome_type TEXT,
  measurement TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_outcome UNIQUE(jtbd_id, outcome)
);

DO $$
BEGIN
  RAISE NOTICE '✓ Created table: jtbd_desired_outcomes';
END $$;

-- Enhance jtbd_success_criteria table (standardize column name)
DO $$
DECLARE
  criterion_col TEXT;
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_success_criteria') THEN
    -- Detect existing column name
    SELECT column_name INTO criterion_col
    FROM information_schema.columns
    WHERE table_name = 'jtbd_success_criteria'
      AND column_name IN ('criterion', 'criteria', 'criteria_text', 'success_criterion', 'criterion_text')
    LIMIT 1;
    
    -- Standardize to 'criterion' if different
    IF criterion_col IS NOT NULL AND criterion_col != 'criterion' THEN
      EXECUTE format('ALTER TABLE jtbd_success_criteria RENAME COLUMN %I TO criterion', criterion_col);
      RAISE NOTICE '✓ Renamed column: jtbd_success_criteria.% to criterion', criterion_col;
    END IF;
    
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_success_criteria' AND column_name = 'measurement') THEN
      ALTER TABLE jtbd_success_criteria ADD COLUMN measurement TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd_success_criteria' AND column_name = 'threshold') THEN
      ALTER TABLE jtbd_success_criteria ADD COLUMN threshold TEXT;
    END IF;
    
    RAISE NOTICE '✓ Enhanced table: jtbd_success_criteria';
  ELSE
    -- Create from scratch
    CREATE TABLE jtbd_success_criteria (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      
      criterion TEXT NOT NULL,
      measurement TEXT,
      threshold TEXT,
      
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    RAISE NOTICE '✓ Created table: jtbd_success_criteria';
  END IF;
END $$;

-- Create jtbd_tags table
CREATE TABLE IF NOT EXISTS jtbd_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_jtbd_tag UNIQUE(jtbd_id, tag)
);

DO $$
BEGIN
  RAISE NOTICE '✓ Created table: jtbd_tags';
END $$;

-- ==========================================
-- SECTION 2: MIGRATE JSONB DATA
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Migrating JSONB data to normalized tables...';
END $$;

-- Migrate jtbd.kpis JSONB
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'kpis') THEN
    INSERT INTO jtbd_kpis (jtbd_id, tenant_id, kpi_name, kpi_description, kpi_type, target_value)
    SELECT 
      id, 
      tenant_id,
      k->>'name',
      k->>'description',
      k->>'type',
      (k->>'target')::NUMERIC
    FROM jtbd, jsonb_array_elements(COALESCE(kpis, '[]'::jsonb)) as k
    WHERE kpis IS NOT NULL 
      AND jsonb_array_length(kpis) > 0
      AND TRIM(COALESCE(k->>'name', '')) != ''
    ON CONFLICT (jtbd_id, kpi_name) DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % KPIs from JSONB', migrated_count;
  ELSE
    RAISE NOTICE '! Column jtbd.kpis does not exist, skipping migration';
  END IF;
END $$;

-- Migrate jtbd.pain_points JSONB
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'pain_points') THEN
    INSERT INTO jtbd_pain_points (jtbd_id, tenant_id, issue, severity, pain_point_type, frequency, impact)
    SELECT 
      id,
      tenant_id,
      p->>'issue',
      p->>'severity',
      p->>'type',
      p->>'frequency',
      p->>'impact'
    FROM jtbd, jsonb_array_elements(COALESCE(pain_points, '[]'::jsonb)) as p
    WHERE pain_points IS NOT NULL 
      AND jsonb_array_length(pain_points) > 0
      AND TRIM(COALESCE(p->>'issue', '')) != ''
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % pain points from JSONB', migrated_count;
  ELSE
    RAISE NOTICE '! Column jtbd.pain_points does not exist, skipping migration';
  END IF;
END $$;

-- Migrate jtbd.desired_outcomes JSONB
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'desired_outcomes') THEN
    INSERT INTO jtbd_desired_outcomes (jtbd_id, tenant_id, outcome, importance, outcome_type)
    SELECT 
      id,
      tenant_id,
      o->>'outcome',
      (o->>'importance')::INTEGER,
      o->>'type'
    FROM jtbd, jsonb_array_elements(COALESCE(desired_outcomes, '[]'::jsonb)) as o
    WHERE desired_outcomes IS NOT NULL 
      AND jsonb_array_length(desired_outcomes) > 0
      AND TRIM(COALESCE(o->>'outcome', '')) != ''
    ON CONFLICT (jtbd_id, outcome) DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % desired outcomes from JSONB', migrated_count;
  ELSE
    RAISE NOTICE '! Column jtbd.desired_outcomes does not exist, skipping migration';
  END IF;
END $$;

-- ==========================================
-- SECTION 3: MIGRATE ARRAY DATA
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Migrating array data to normalized tables...';
END $$;

-- Migrate jtbd.success_criteria array
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'success_criteria') THEN
    INSERT INTO jtbd_success_criteria (jtbd_id, tenant_id, criterion)
    SELECT 
      id, 
      tenant_id, 
      unnest(success_criteria)
    FROM jtbd
    WHERE success_criteria IS NOT NULL
      AND array_length(success_criteria, 1) > 0
      AND EXISTS (
        SELECT 1 FROM unnest(success_criteria) AS sc
        WHERE sc IS NOT NULL AND TRIM(sc) != ''
      )
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % success criteria from array', migrated_count;
  ELSE
    RAISE NOTICE '! Column jtbd.success_criteria does not exist, skipping migration';
  END IF;
END $$;

-- Migrate jtbd.tags array
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'tags') THEN
    INSERT INTO jtbd_tags (jtbd_id, tenant_id, tag)
    SELECT 
      id, 
      tenant_id, 
      unnest(tags)
    FROM jtbd
    WHERE tags IS NOT NULL
      AND array_length(tags, 1) > 0
      AND EXISTS (
        SELECT 1 FROM unnest(tags) AS t
        WHERE t IS NOT NULL AND TRIM(t) != ''
      )
    ON CONFLICT (jtbd_id, tag) DO NOTHING;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % tags from array', migrated_count;
  ELSE
    RAISE NOTICE '! Column jtbd.tags does not exist, skipping migration';
  END IF;
END $$;

-- ==========================================
-- SECTION 4: DROP MIGRATED COLUMNS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Dropping migrated JSONB and array columns...';
END $$;

-- Drop JSONB columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'kpis') THEN
    ALTER TABLE jtbd DROP COLUMN kpis CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.kpis';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'pain_points') THEN
    ALTER TABLE jtbd DROP COLUMN pain_points CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.pain_points';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'desired_outcomes') THEN
    ALTER TABLE jtbd DROP COLUMN desired_outcomes CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.desired_outcomes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'metadata') THEN
    ALTER TABLE jtbd DROP COLUMN metadata CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.metadata';
  END IF;
END $$;

-- Drop array columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'success_criteria') THEN
    ALTER TABLE jtbd DROP COLUMN success_criteria CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.success_criteria';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'tags') THEN
    ALTER TABLE jtbd DROP COLUMN tags CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.tags';
  END IF;
END $$;

-- ==========================================
-- SECTION 5: REMOVE DUPLICATE/CONFLICTING FIELDS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Removing duplicate and conflicting fields...';
END $$;

-- Drop jtbd_code (use 'code' only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'jtbd_code') THEN
    ALTER TABLE jtbd DROP COLUMN jtbd_code CASCADE;
    RAISE NOTICE '✓ Dropped duplicate column: jtbd.jtbd_code (use code instead)';
  END IF;
END $$;

-- Drop category (use 'job_category' only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'category') THEN
    -- Backfill job_category from category if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'job_category') THEN
      UPDATE jtbd SET job_category = category WHERE job_category IS NULL AND category IS NOT NULL;
    END IF;
    
    ALTER TABLE jtbd DROP COLUMN category CASCADE;
    RAISE NOTICE '✓ Dropped duplicate column: jtbd.category (use job_category instead)';
  END IF;
END $$;

-- Drop unique_id (use 'code' only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'unique_id') THEN
    ALTER TABLE jtbd DROP COLUMN unique_id CASCADE;
    RAISE NOTICE '✓ Dropped duplicate column: jtbd.unique_id (use code instead)';
  END IF;
END $$;

-- Drop workflow_id (workflows link to JTBDs, not vice versa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'workflow_id') THEN
    ALTER TABLE jtbd DROP COLUMN workflow_id CASCADE;
    RAISE NOTICE '✓ Dropped column: jtbd.workflow_id (workflows link to JTBDs)';
  END IF;
END $$;

-- ==========================================
-- SECTION 6: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Creating indexes for normalized tables...';
END $$;

-- Indexes for jtbd_kpis
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_jtbd ON jtbd_kpis(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_kpis_tenant ON jtbd_kpis(tenant_id) WHERE tenant_id IS NOT NULL;

-- Indexes for jtbd_pain_points
CREATE INDEX IF NOT EXISTS idx_jtbd_pain_points_jtbd ON jtbd_pain_points(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_pain_points_severity ON jtbd_pain_points(severity) WHERE severity IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_jtbd_pain_points_tenant ON jtbd_pain_points(tenant_id) WHERE tenant_id IS NOT NULL;

-- Indexes for jtbd_desired_outcomes
CREATE INDEX IF NOT EXISTS idx_jtbd_desired_outcomes_jtbd ON jtbd_desired_outcomes(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_desired_outcomes_importance ON jtbd_desired_outcomes(importance);
CREATE INDEX IF NOT EXISTS idx_jtbd_desired_outcomes_tenant ON jtbd_desired_outcomes(tenant_id) WHERE tenant_id IS NOT NULL;

-- Indexes for jtbd_success_criteria
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_jtbd ON jtbd_success_criteria(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_success_criteria_tenant ON jtbd_success_criteria(tenant_id) WHERE tenant_id IS NOT NULL;

-- Indexes for jtbd_tags
CREATE INDEX IF NOT EXISTS idx_jtbd_tags_jtbd ON jtbd_tags(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_tags_tag ON jtbd_tags(tag);
CREATE INDEX IF NOT EXISTS idx_jtbd_tags_tenant ON jtbd_tags(tenant_id) WHERE tenant_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✓ Created all indexes';
END $$;

-- ==========================================
-- SECTION 7: VERIFICATION QUERIES
-- ==========================================

DO $$
DECLARE
  kpi_count INTEGER;
  pain_point_count INTEGER;
  outcome_count INTEGER;
  criteria_count INTEGER;
  tag_count INTEGER;
  jsonb_remaining INTEGER;
  array_remaining INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== PHASE 2 VERIFICATION ===';
  
  -- Count migrated data
  SELECT COUNT(*) INTO kpi_count FROM jtbd_kpis;
  RAISE NOTICE 'Migrated KPIs: %', kpi_count;
  
  SELECT COUNT(*) INTO pain_point_count FROM jtbd_pain_points;
  RAISE NOTICE 'Migrated pain points: %', pain_point_count;
  
  SELECT COUNT(*) INTO outcome_count FROM jtbd_desired_outcomes;
  RAISE NOTICE 'Migrated desired outcomes: %', outcome_count;
  
  SELECT COUNT(*) INTO criteria_count FROM jtbd_success_criteria;
  RAISE NOTICE 'Migrated success criteria: %', criteria_count;
  
  SELECT COUNT(*) INTO tag_count FROM jtbd_tags;
  RAISE NOTICE 'Migrated tags: %', tag_count;
  
  -- Check for remaining JSONB/array columns
  SELECT COUNT(*) INTO jsonb_remaining
  FROM information_schema.columns
  WHERE table_name = 'jtbd'
    AND data_type = 'jsonb'
    AND column_name IN ('kpis', 'pain_points', 'desired_outcomes', 'metadata');
  
  SELECT COUNT(*) INTO array_remaining
  FROM information_schema.columns
  WHERE table_name = 'jtbd'
    AND data_type = 'ARRAY'
    AND column_name IN ('success_criteria', 'tags');
  
  RAISE NOTICE 'Remaining JSONB columns: % (should be 0)', jsonb_remaining;
  RAISE NOTICE 'Remaining array columns: % (should be 0)', array_remaining;
  
  -- Overall status
  IF jsonb_remaining = 0 AND array_remaining = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓✓✓ PHASE 2 COMPLETE - ALL CHECKS PASSED ✓✓✓';
  ELSE
    RAISE WARNING 'Phase 2 completed with warnings - some JSONB/array columns remain';
  END IF;
END $$;

-- Human-readable verification query
SELECT 
  'KPIs' as entity,
  COUNT(*)::TEXT as count
FROM jtbd_kpis

UNION ALL

SELECT 
  'Pain Points',
  COUNT(*)::TEXT
FROM jtbd_pain_points

UNION ALL

SELECT 
  'Desired Outcomes',
  COUNT(*)::TEXT
FROM jtbd_desired_outcomes

UNION ALL

SELECT 
  'Success Criteria',
  COUNT(*)::TEXT
FROM jtbd_success_criteria

UNION ALL

SELECT 
  'Tags',
  COUNT(*)::TEXT
FROM jtbd_tags

UNION ALL

SELECT 
  'JSONB Columns Remaining',
  COUNT(*)::TEXT
FROM information_schema.columns
WHERE table_name = 'jtbd'
  AND data_type = 'jsonb'
  AND column_name IN ('kpis', 'pain_points', 'desired_outcomes', 'metadata')

UNION ALL

SELECT 
  'Array Columns Remaining',
  COUNT(*)::TEXT
FROM information_schema.columns
WHERE table_name = 'jtbd'
  AND data_type = 'ARRAY'
  AND column_name IN ('success_criteria', 'tags');

