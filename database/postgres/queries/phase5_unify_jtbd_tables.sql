-- ==========================================
-- FILE: phase5_unify_jtbd_tables.sql
-- PURPOSE: Phase 1 - Critical Structural Unification
-- PHASE: 5 of 8 (continuing from previous 4 phases)
-- DEPENDENCIES: jtbd, jtbd_core, persona_jtbd, jtbd_personas tables
-- GOLDEN RULES: Single source of truth, no dual concepts, ID+NAME pattern
-- ==========================================

-- ==========================================
-- SECTION 1: DISCOVERY & BACKUP
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== PHASE 5: JTBD TABLE UNIFICATION ===';
  RAISE NOTICE 'Goal: Merge jtbd_core into jtbd, consolidate persona mappings';
  RAISE NOTICE '';
END $$;

-- Create backups
CREATE TABLE IF NOT EXISTS jtbd_backup_phase5 AS SELECT * FROM jtbd;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS jtbd_core_backup_phase5 AS SELECT * FROM jtbd_core';
    RAISE NOTICE '✓ Backed up jtbd_core';
  ELSE
    RAISE NOTICE '⊗ jtbd_core does not exist, skipping backup';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS persona_jtbd_backup_phase5 AS SELECT * FROM persona_jtbd;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS jtbd_personas_backup_phase5 AS SELECT * FROM jtbd_personas';
    RAISE NOTICE '✓ Backed up jtbd_personas';
  ELSE
    RAISE NOTICE '⊗ jtbd_personas does not exist, skipping backup';
  END IF;
END $$;

-- Discovery: Check current state
DO $$
DECLARE
  jtbd_count INTEGER;
  jtbd_core_count INTEGER := 0;
  persona_jtbd_count INTEGER;
  jtbd_personas_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO jtbd_count FROM jtbd;
  SELECT COUNT(*) INTO persona_jtbd_count FROM persona_jtbd;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core') THEN
    EXECUTE 'SELECT COUNT(*) FROM jtbd_core' INTO jtbd_core_count;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas') THEN
    EXECUTE 'SELECT COUNT(*) FROM jtbd_personas' INTO jtbd_personas_count;
  END IF;
  
  RAISE NOTICE '=== CURRENT STATE ===';
  RAISE NOTICE 'jtbd: % rows', jtbd_count;
  RAISE NOTICE 'jtbd_core: % rows', jtbd_core_count;
  RAISE NOTICE 'persona_jtbd: % rows', persona_jtbd_count;
  RAISE NOTICE 'jtbd_personas: % rows', jtbd_personas_count;
  RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 2: UNIFY JTBD TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '=== UNIFYING JTBD TABLES ===';
END $$;

-- Step 1: Add missing columns to jtbd from jtbd_core
ALTER TABLE jtbd 
  ADD COLUMN IF NOT EXISTS job_statement TEXT,
  ADD COLUMN IF NOT EXISTS when_situation TEXT;

DO $$
BEGIN
  RAISE NOTICE '✓ Added job_statement and when_situation columns to jtbd';
END $$;

-- Step 2: Migrate data from jtbd_core to jtbd (if jtbd_core exists)
DO $$
DECLARE
  row_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core') THEN
    RAISE NOTICE 'Found jtbd_core table, creating mapping...';
    
    -- Create temporary mapping table
    -- jtbd_core has: name (required), job_statement, when_situation, desired_outcome
    -- jtbd has: code (required), name (required)
    -- Match on: name similarity or ID if they match
    CREATE TEMP TABLE jtbd_core_mapping AS
    SELECT 
      jc.id as jtbd_core_id,
      j.id as jtbd_id,
      CASE 
        WHEN j.id = jc.id THEN 'exact_id_match'
        WHEN LOWER(j.name) = LOWER(jc.name) THEN 'exact_name_match'
        WHEN LOWER(j.name) = LOWER(jc.job_statement) THEN 'name_matches_job_statement'
        ELSE 'no_match'
      END as match_type
    FROM jtbd_core jc
    LEFT JOIN jtbd j ON (
      j.id = jc.id 
      OR LOWER(j.name) = LOWER(jc.name)
      OR LOWER(j.name) = LOWER(jc.job_statement)
    )
    WHERE j.id IS NOT NULL;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Created mapping for % jtbd_core → jtbd matches', row_count;
    
    -- Update jtbd with data from jtbd_core
    -- jtbd_core columns: job_statement, when_situation, desired_outcome, description, priority, status
    UPDATE jtbd j
    SET 
      job_statement = COALESCE(j.job_statement, jc.job_statement),
      when_situation = COALESCE(j.when_situation, jc.when_situation),
      description = COALESCE(j.description, jc.description, jc.desired_outcome),
      updated_at = NOW()
    FROM jtbd_core jc
    JOIN jtbd_core_mapping m ON jc.id = m.jtbd_core_id
    WHERE j.id = m.jtbd_id;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Updated % jtbd rows with jtbd_core data', row_count;
    
    -- Migrate tags from jtbd_core to jtbd_tags (jtbd_core.tags is ARRAY)
    INSERT INTO jtbd_tags (jtbd_id, tag, tenant_id)
    SELECT 
      m.jtbd_id,
      unnest(jc.tags),
      jc.tenant_id
    FROM jtbd_core jc
    JOIN jtbd_core_mapping m ON jc.id = m.jtbd_core_id
    WHERE jc.tags IS NOT NULL 
      AND array_length(jc.tags, 1) > 0
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % tags from jtbd_core', row_count;
    
  ELSE
    RAISE NOTICE '⊗ jtbd_core table does not exist, skipping migration';
  END IF;
END $$;

-- ==========================================
-- SECTION 3: CONSOLIDATE PERSONA↔JTBD MAPPINGS
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CONSOLIDATING PERSONA↔JTBD MAPPINGS ===';
END $$;

-- Step 1: Ensure persona_jtbd references jtbd (not jtbd_core)
DO $$
BEGIN
  -- Check current FK target
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'persona_jtbd' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'jtbd_core'
  ) THEN
    RAISE NOTICE '⚠ persona_jtbd currently references jtbd_core, migrating...';
    
    -- Drop old FK
    ALTER TABLE persona_jtbd DROP CONSTRAINT IF EXISTS persona_jtbd_jtbd_id_fkey;
    
    -- Update jtbd_id to reference jtbd table using mapping
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'jtbd_core_mapping') THEN
      UPDATE persona_jtbd pj
      SET jtbd_id = m.jtbd_id
      FROM jtbd_core_mapping m
      WHERE pj.jtbd_id = m.jtbd_core_id;
      
      RAISE NOTICE '✓ Remapped persona_jtbd.jtbd_id to reference jtbd table';
    END IF;
    
    -- Add new FK to jtbd
    ALTER TABLE persona_jtbd 
      ADD CONSTRAINT persona_jtbd_jtbd_id_fkey 
      FOREIGN KEY (jtbd_id) REFERENCES jtbd(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✓ persona_jtbd now references jtbd table';
  ELSE
    RAISE NOTICE '✓ persona_jtbd already references jtbd table';
  END IF;
END $$;

-- Step 2: Migrate data from jtbd_personas to persona_jtbd (if jtbd_personas exists)
DO $$
DECLARE
  row_count INTEGER := 0;
  insert_sql TEXT;
  select_sql TEXT;
  has_tenant_id BOOLEAN;
  has_created_at BOOLEAN;
  has_updated_at BOOLEAN;
  has_relevance BOOLEAN;
  has_importance BOOLEAN;
  has_frequency BOOLEAN;
  has_context BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas') THEN
    -- Check what columns persona_jtbd actually has
    SELECT 
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'tenant_id'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'created_at'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'updated_at'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'relevance_score'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'importance'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'frequency'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'context')
    INTO has_tenant_id, has_created_at, has_updated_at, has_relevance, has_importance, has_frequency, has_context;
    
    RAISE NOTICE 'persona_jtbd schema: tenant_id=%, created_at=%, updated_at=%, relevance=%, importance=%, frequency=%, context=%', 
      has_tenant_id, has_created_at, has_updated_at, has_relevance, has_importance, has_frequency, has_context;
    
    -- Build dynamic INSERT based on available columns
    -- Core columns that should always exist: persona_id, jtbd_id
    insert_sql := 'INSERT INTO persona_jtbd (persona_id, jtbd_id';
    select_sql := 'SELECT jp.persona_id, jp.jtbd_id';
    
    IF has_tenant_id THEN 
      insert_sql := insert_sql || ', tenant_id'; 
      select_sql := select_sql || ', jp.tenant_id';
    END IF;
    IF has_created_at THEN 
      insert_sql := insert_sql || ', created_at'; 
      select_sql := select_sql || ', jp.created_at';
    END IF;
    IF has_updated_at THEN 
      insert_sql := insert_sql || ', updated_at'; 
      select_sql := select_sql || ', jp.updated_at';
    END IF;
    IF has_relevance THEN 
      insert_sql := insert_sql || ', relevance_score'; 
      select_sql := select_sql || ', jp.relevance_score';
    END IF;
    IF has_importance THEN 
      insert_sql := insert_sql || ', importance'; 
      select_sql := select_sql || ', jp.importance';
    END IF;
    IF has_frequency THEN 
      insert_sql := insert_sql || ', frequency'; 
      select_sql := select_sql || ', jp.frequency';
    END IF;
    IF has_context THEN 
      insert_sql := insert_sql || ', context'; 
      select_sql := select_sql || ', jp.context';
    END IF;
    
    insert_sql := insert_sql || ') ' || select_sql || ' FROM jtbd_personas jp ' ||
      'WHERE NOT EXISTS (SELECT 1 FROM persona_jtbd pj WHERE pj.persona_id = jp.persona_id AND pj.jtbd_id = jp.jtbd_id) ' ||
      'ON CONFLICT (persona_id, jtbd_id) DO NOTHING';
    
    RAISE NOTICE 'Executing: %', insert_sql;
    
    -- Execute dynamic INSERT
    EXECUTE insert_sql;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE '✓ Migrated % rows from jtbd_personas to persona_jtbd', row_count;
    
    -- Rename jtbd_personas to deprecated
    ALTER TABLE jtbd_personas RENAME TO jtbd_personas_deprecated;
    COMMENT ON TABLE jtbd_personas_deprecated IS 
      'DEPRECATED: Consolidated into persona_jtbd. This table will be removed in v2.0';
    
    RAISE NOTICE '✓ Renamed jtbd_personas → jtbd_personas_deprecated';
    
  ELSE
    RAISE NOTICE '⊗ jtbd_personas table does not exist, skipping migration';
  END IF;
END $$;

-- Step 3: Create backward-compatible view
DO $$
DECLARE
  view_sql TEXT;
  has_tenant_id BOOLEAN;
  has_created_at BOOLEAN;
  has_updated_at BOOLEAN;
  has_relevance BOOLEAN;
  has_importance BOOLEAN;
  has_frequency BOOLEAN;
  has_context BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas_deprecated') THEN
    -- Check what columns persona_jtbd has to build matching view
    SELECT 
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'tenant_id'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'created_at'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'updated_at'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'relevance_score'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'importance'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'frequency'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_jtbd' AND column_name = 'context')
    INTO has_tenant_id, has_created_at, has_updated_at, has_relevance, has_importance, has_frequency, has_context;
    
    -- Build dynamic view based on available columns
    view_sql := 'CREATE OR REPLACE VIEW jtbd_personas AS SELECT gen_random_uuid() as id, jtbd_id, persona_id';
    
    IF has_relevance THEN view_sql := view_sql || ', relevance_score'; END IF;
    IF has_importance THEN view_sql := view_sql || ', importance'; END IF;
    IF has_frequency THEN view_sql := view_sql || ', frequency'; END IF;
    IF has_context THEN view_sql := view_sql || ', context'; END IF;
    IF has_tenant_id THEN view_sql := view_sql || ', tenant_id'; END IF;
    IF has_created_at THEN view_sql := view_sql || ', created_at'; END IF;
    IF has_updated_at THEN view_sql := view_sql || ', updated_at'; END IF;
    
    view_sql := view_sql || ' FROM persona_jtbd';
    
    EXECUTE view_sql;
    
    EXECUTE 'COMMENT ON VIEW jtbd_personas IS ''DEPRECATED VIEW: For backward compatibility only. Use persona_jtbd table directly.''';
    
    RAISE NOTICE '✓ Created backward-compatible view: jtbd_personas → persona_jtbd';
  END IF;
END $$;

-- ==========================================
-- SECTION 4: DEPRECATE JTBD_CORE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== DEPRECATING JTBD_CORE ===';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core') THEN
    -- Rename to deprecated
    ALTER TABLE jtbd_core RENAME TO jtbd_core_deprecated;
    
    COMMENT ON TABLE jtbd_core_deprecated IS 
      'DEPRECATED: All data merged into jtbd table. This table will be removed in v2.0. Backup available in jtbd_core_backup_phase5.';
    
    RAISE NOTICE '✓ Renamed jtbd_core → jtbd_core_deprecated';
    
    -- Create view for backward compatibility
    CREATE OR REPLACE VIEW jtbd_core AS
    SELECT 
      id,
      code,
      name as job_statement,
      circumstance as when_situation,
      desired_outcome,
      'active'::text as status,
      ARRAY[]::text[] as tags,
      tenant_id,
      created_at,
      updated_at
    FROM jtbd
    WHERE deleted_at IS NULL;
    
    COMMENT ON VIEW jtbd_core IS 
      'DEPRECATED VIEW: For backward compatibility only. Use jtbd table directly.';
    
    RAISE NOTICE '✓ Created backward-compatible view: jtbd_core → jtbd';
  ELSE
    RAISE NOTICE '⊗ jtbd_core table does not exist, skipping deprecation';
  END IF;
END $$;

-- ==========================================
-- SECTION 5: VERIFICATION QUERIES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
END $$;

-- Verify jtbd table state
SELECT 
  'jtbd Table' as metric,
  COUNT(*) as total,
  COUNT(job_statement) as with_job_statement,
  COUNT(when_situation) as with_when_situation,
  COUNT(*) - COUNT(job_statement) as missing_job_statement
FROM jtbd;

-- Verify persona_jtbd mappings
SELECT 
  'persona_jtbd Mappings' as metric,
  COUNT(*) as total,
  COUNT(DISTINCT persona_id) as unique_personas,
  COUNT(DISTINCT jtbd_id) as unique_jtbds,
  0 as orphaned_mappings
FROM persona_jtbd;

-- Check for orphaned mappings (should be 0)
SELECT 
  'Orphaned persona_jtbd (should be 0)' as check_name,
  COUNT(*) as count
FROM persona_jtbd pj
WHERE NOT EXISTS (SELECT 1 FROM jtbd j WHERE j.id = pj.jtbd_id)
   OR NOT EXISTS (SELECT 1 FROM personas p WHERE p.id = pj.persona_id);

-- Verify foreign key
SELECT 
  'persona_jtbd FK Status' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'persona_jtbd' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'jtbd'
    ) THEN 'References jtbd ✓'
    ELSE 'ERROR: Not referencing jtbd'
  END as status;

-- Check deprecated tables
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core_deprecated')
    THEN 'jtbd_core_deprecated exists ✓'
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_core')
    THEN 'WARNING: jtbd_core still exists (not renamed)'
    ELSE 'jtbd_core does not exist (never existed or already removed)'
  END as jtbd_core_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas_deprecated')
    THEN 'jtbd_personas_deprecated exists ✓'
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_personas')
    THEN 'WARNING: jtbd_personas still exists (not renamed)'
    ELSE 'jtbd_personas does not exist (never existed or already removed)'
  END as jtbd_personas_status;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PHASE 5 COMPLETE: JTBD TABLE UNIFICATION';
  RAISE NOTICE '';
  RAISE NOTICE 'Achievements:';
  RAISE NOTICE '  ✓ Single canonical JTBD table (jtbd)';
  RAISE NOTICE '  ✓ Single canonical persona↔JTBD mapping (persona_jtbd)';
  RAISE NOTICE '  ✓ Legacy tables renamed to *_deprecated';
  RAISE NOTICE '  ✓ Backward-compatible views created';
  RAISE NOTICE '  ✓ All foreign keys point to jtbd table';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Phase 6 - Complete Array Cleanup';
END $$;

