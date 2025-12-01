-- ================================================================
-- JSONB NORMALIZATION FIX MIGRATION
-- Adds missing tenant_id columns and creates RLS policies
-- ================================================================
-- Version: 1.1 (Fix)
-- Date: 2025-11-29
-- Issue: Tables created without tenant_id column
-- ================================================================

BEGIN;

-- ================================================================
-- SECTION 1: ADD MISSING TENANT_ID COLUMNS
-- ================================================================

-- Add tenant_id to all junction tables if missing
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'jtbd_ai_data_requirements',
    'jtbd_ai_model_requirements',
    'jtbd_ai_integration_requirements',
    'role_kpis',
    'role_clinical_competencies',
    'role_deliverables',
    'role_daily_activities',
    'role_systems',
    'role_stakeholder_interactions',
    'role_gxp_training',
    'role_specific_training',
    'theme_success_metrics'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Check if table exists and tenant_id column is missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenant_id') THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE', tbl);
        RAISE NOTICE 'Added tenant_id to %', tbl;
      ELSE
        RAISE NOTICE 'tenant_id already exists on %', tbl;
      END IF;
    ELSE
      RAISE NOTICE 'Table % does not exist - skipping', tbl;
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- SECTION 2: ENABLE RLS ON ALL TABLES
-- ================================================================

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'jtbd_ai_data_requirements',
    'jtbd_ai_model_requirements',
    'jtbd_ai_integration_requirements',
    'role_kpis',
    'role_clinical_competencies',
    'role_deliverables',
    'role_daily_activities',
    'role_systems',
    'role_stakeholder_interactions',
    'role_gxp_training',
    'role_specific_training',
    'theme_success_metrics'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      RAISE NOTICE 'Enabled RLS on %', tbl;
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- SECTION 3: CREATE OR REPLACE HELPER FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION get_current_tenant() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.current_tenant', true), '')::uuid,
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================================
-- SECTION 4: CREATE RLS POLICIES
-- ================================================================

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'jtbd_ai_data_requirements',
    'jtbd_ai_model_requirements',
    'jtbd_ai_integration_requirements',
    'role_kpis',
    'role_clinical_competencies',
    'role_deliverables',
    'role_daily_activities',
    'role_systems',
    'role_stakeholder_interactions',
    'role_gxp_training',
    'role_specific_training',
    'theme_success_metrics'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
      -- Only create policy if tenant_id column exists
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'tenant_id') THEN
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_policy ON %I', tbl, tbl);
        EXECUTE format('
          CREATE POLICY %I_tenant_policy ON %I
            FOR ALL
            USING (tenant_id IS NULL OR tenant_id = get_current_tenant() OR get_current_tenant() IS NULL)
        ', tbl, tbl);
        RAISE NOTICE 'Created RLS policy for %', tbl;
      ELSE
        RAISE NOTICE 'Skipping RLS policy for % - no tenant_id column', tbl;
      END IF;
    END IF;
  END LOOP;
END $$;

COMMIT;

-- ================================================================
-- VERIFICATION REPORT
-- ================================================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_tenant_col_count INTEGER;
  v_rls_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'jtbd_ai_data_requirements', 'jtbd_ai_model_requirements', 'jtbd_ai_integration_requirements',
    'role_kpis', 'role_clinical_competencies', 'role_deliverables', 'role_daily_activities',
    'role_systems', 'role_stakeholder_interactions', 'role_gxp_training', 'role_specific_training',
    'theme_success_metrics'
  );

  -- Count tables with tenant_id
  SELECT COUNT(*) INTO v_tenant_col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND table_name IN (
    'jtbd_ai_data_requirements', 'jtbd_ai_model_requirements', 'jtbd_ai_integration_requirements',
    'role_kpis', 'role_clinical_competencies', 'role_deliverables', 'role_daily_activities',
    'role_systems', 'role_stakeholder_interactions', 'role_gxp_training', 'role_specific_training',
    'theme_success_metrics'
  );

  -- Count RLS enabled tables
  SELECT COUNT(*) INTO v_rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'jtbd_ai_data_requirements', 'jtbd_ai_model_requirements', 'jtbd_ai_integration_requirements',
    'role_kpis', 'role_clinical_competencies', 'role_deliverables', 'role_daily_activities',
    'role_systems', 'role_stakeholder_interactions', 'role_gxp_training', 'role_specific_training',
    'theme_success_metrics'
  );

  RAISE NOTICE '================================================================';
  RAISE NOTICE 'JSONB NORMALIZATION FIX COMPLETE';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'Junction Tables Found: % / 12', v_table_count;
  RAISE NOTICE 'Tables with tenant_id: % / 12', v_tenant_col_count;
  RAISE NOTICE 'Tables with RLS Enabled: % / 12', v_rls_count;
  RAISE NOTICE '================================================================';
END $$;
