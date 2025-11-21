-- =====================================================================
-- PHASE 1.1: Clean Up JTBD Core Table
-- =====================================================================
-- Purpose: Remove normalization violations from jtbd table
-- - Remove org structure columns (belong in junction tables)
-- - Remove JSONB fields (migrate to normalized tables)
-- - Remove array fields (migrate to normalized tables)
-- - Remove duplicate/conflicting columns

-- STEP 1: Create backup
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS jtbd_backup_pre_normalization AS 
  SELECT * FROM jtbd;
  
  RAISE NOTICE '✓ Backup created: jtbd_backup_pre_normalization';
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE '✓ Backup table already exists';
END $$;

-- STEP 2: Drop any existing triggers that depend on org columns
DO $$
BEGIN
  -- Drop triggers that might depend on org structure columns
  DROP TRIGGER IF EXISTS trigger_sync_jtbd_org_names ON jtbd;
  DROP TRIGGER IF EXISTS trigger_sync_function_name ON jtbd;
  DROP TRIGGER IF EXISTS trigger_sync_department_name ON jtbd;
  DROP TRIGGER IF EXISTS trigger_sync_role_name ON jtbd;
  
  RAISE NOTICE '✓ Dropped existing triggers on jtbd table';
END $$;

-- STEP 3: Remove org structure columns (they belong in junction tables)
DO $$
BEGIN
  -- Check and remove function/department/role columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN function_id CASCADE;
    RAISE NOTICE '✓ Removed function_id from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'function_name') THEN
    ALTER TABLE public.jtbd DROP COLUMN function_name CASCADE;
    RAISE NOTICE '✓ Removed function_name from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN department_id CASCADE;
    RAISE NOTICE '✓ Removed department_id from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'department_name') THEN
    ALTER TABLE public.jtbd DROP COLUMN department_name CASCADE;
    RAISE NOTICE '✓ Removed department_name from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN role_id CASCADE;
    RAISE NOTICE '✓ Removed role_id from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'role_name') THEN
    ALTER TABLE public.jtbd DROP COLUMN role_name CASCADE;
    RAISE NOTICE '✓ Removed role_name from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'persona_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN persona_id CASCADE;
    RAISE NOTICE '✓ Removed persona_id from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'org_function_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN org_function_id CASCADE;
    RAISE NOTICE '✓ Removed org_function_id from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'workflow_id') THEN
    ALTER TABLE public.jtbd DROP COLUMN workflow_id CASCADE;
    RAISE NOTICE '✓ Removed workflow_id from jtbd';
  END IF;
END $$;

-- STEP 4: Migrate JSONB data to normalized tables before dropping columns
DO $$
BEGIN
  -- Migrate KPIs from JSONB to jtbd_kpis table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'kpis') THEN
    -- Only migrate if there's actual data
    IF EXISTS (SELECT 1 FROM jtbd WHERE kpis IS NOT NULL AND jsonb_array_length(kpis) > 0) THEN
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
        AND k->>'name' IS NOT NULL
        AND TRIM(k->>'name') != ''
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE '✓ Migrated KPIs from JSONB to jtbd_kpis';
    END IF;
    
    ALTER TABLE jtbd DROP COLUMN kpis;
    RAISE NOTICE '✓ Removed kpis JSONB column from jtbd';
  END IF;
  
  -- Migrate pain_points from JSONB to jtbd_pain_points table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'pain_points') THEN
    IF EXISTS (SELECT 1 FROM jtbd WHERE pain_points IS NOT NULL) THEN
      INSERT INTO jtbd_pain_points (jtbd_id, tenant_id, issue, severity, pain_point_type)
      SELECT 
        id,
        tenant_id,
        p->>'issue',
        p->>'severity',
        p->>'type'
      FROM jtbd, jsonb_array_elements(COALESCE(pain_points, '[]'::jsonb)) as p
      WHERE pain_points IS NOT NULL
        AND p->>'issue' IS NOT NULL
        AND TRIM(p->>'issue') != ''
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE '✓ Migrated pain_points from JSONB to jtbd_pain_points';
    END IF;
    
    ALTER TABLE jtbd DROP COLUMN pain_points;
    RAISE NOTICE '✓ Removed pain_points JSONB column from jtbd';
  END IF;
  
  -- Migrate desired_outcomes from JSONB to jtbd_desired_outcomes table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'desired_outcomes') THEN
    IF EXISTS (SELECT 1 FROM jtbd WHERE desired_outcomes IS NOT NULL) THEN
      INSERT INTO jtbd_desired_outcomes (jtbd_id, tenant_id, outcome, importance, outcome_type)
      SELECT 
        id,
        tenant_id,
        o->>'outcome',
        (o->>'importance')::INTEGER,
        o->>'type'
      FROM jtbd, jsonb_array_elements(COALESCE(desired_outcomes, '[]'::jsonb)) as o
      WHERE desired_outcomes IS NOT NULL
        AND o->>'outcome' IS NOT NULL
        AND TRIM(o->>'outcome') != ''
      ON CONFLICT DO NOTHING;
      
      RAISE NOTICE '✓ Migrated desired_outcomes from JSONB to jtbd_desired_outcomes';
    END IF;
    
    ALTER TABLE jtbd DROP COLUMN desired_outcomes;
    RAISE NOTICE '✓ Removed desired_outcomes JSONB column from jtbd';
  END IF;
END $$;

-- STEP 5: Remove array violations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'success_criteria') THEN
    -- Migrate to jtbd_success_criteria if data exists and table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd_success_criteria') THEN
      -- Try to determine the correct column name
      DECLARE
        criterion_column TEXT;
      BEGIN
        SELECT column_name INTO criterion_column
        FROM information_schema.columns
        WHERE table_name = 'jtbd_success_criteria'
          AND column_name IN ('criterion', 'criteria', 'criteria_text', 'success_criterion', 'criterion_text')
        LIMIT 1;
        
        IF criterion_column IS NOT NULL THEN
          -- Dynamically insert with correct column name
          EXECUTE format('
            INSERT INTO jtbd_success_criteria (jtbd_id, tenant_id, %I)
            SELECT id, tenant_id, unnest(success_criteria)
            FROM jtbd
            WHERE success_criteria IS NOT NULL 
              AND array_length(success_criteria, 1) > 0
            ON CONFLICT DO NOTHING
          ', criterion_column);
          
          RAISE NOTICE '✓ Migrated success_criteria array to jtbd_success_criteria';
        ELSE
          RAISE NOTICE '⚠ Could not find criterion column in jtbd_success_criteria - skipping migration';
        END IF;
      END;
    END IF;
    
    ALTER TABLE jtbd DROP COLUMN success_criteria CASCADE;
    RAISE NOTICE '✓ Removed success_criteria array from jtbd';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'tags') THEN
    -- Optionally migrate tags to a jtbd_tags table (create if needed)
    ALTER TABLE jtbd DROP COLUMN tags CASCADE;
    RAISE NOTICE '✓ Removed tags array from jtbd';
  END IF;
END $$;

-- STEP 6: Remove metadata JSONB
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'metadata') THEN
    ALTER TABLE jtbd DROP COLUMN metadata CASCADE;
    RAISE NOTICE '✓ Removed metadata JSONB from jtbd';
  END IF;
END $$;

-- STEP 7: Remove duplicate/conflicting columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'jtbd_code') THEN
    ALTER TABLE jtbd DROP COLUMN jtbd_code CASCADE;
    RAISE NOTICE '✓ Removed duplicate jtbd_code column (using code instead)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'unique_id') THEN
    ALTER TABLE jtbd DROP COLUMN unique_id CASCADE;
    RAISE NOTICE '✓ Removed duplicate unique_id column (using code instead)';
  END IF;
  
  -- Check for category vs job_category conflict
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'category') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'job_category') THEN
    ALTER TABLE jtbd DROP COLUMN category CASCADE;
    RAISE NOTICE '✓ Removed duplicate category column (using job_category instead)';
  END IF;
END $$;

-- STEP 8: Verification
DO $$
DECLARE
  remaining_violations TEXT[];
BEGIN
  -- Check for any remaining JSONB or array columns
  SELECT array_agg(column_name)
  INTO remaining_violations
  FROM information_schema.columns
  WHERE table_name = 'jtbd' 
    AND (data_type IN ('jsonb', 'ARRAY') OR data_type LIKE '%[]');
  
  IF remaining_violations IS NOT NULL THEN
    RAISE WARNING 'Remaining JSONB/array columns in jtbd: %', remaining_violations;
  ELSE
    RAISE NOTICE '✓ No JSONB or array columns remain in jtbd table';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '=== JTBD CORE CLEANUP COMPLETE ===';
END $$;

