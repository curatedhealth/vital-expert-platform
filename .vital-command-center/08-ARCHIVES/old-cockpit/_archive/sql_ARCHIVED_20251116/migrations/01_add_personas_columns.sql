-- =====================================================================================
-- STEP 1: Add all columns to personas table (including tenant_id)
-- =====================================================================================
-- Run this file FIRST, then run 02_create_persona_junction_tables.sql
-- =====================================================================================

-- Add tenant_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'personas' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE personas ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX idx_personas_tenant ON personas(tenant_id);
    RAISE NOTICE '✅ Added tenant_id column';
  ELSE
    RAISE NOTICE 'ℹ️  tenant_id already exists';
  END IF;
END $$;

-- Add all other columns
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS role_slug TEXT,
  ADD COLUMN IF NOT EXISTS function_slug TEXT,
  ADD COLUMN IF NOT EXISTS department_slug TEXT,
  ADD COLUMN IF NOT EXISTS persona_number INTEGER,
  ADD COLUMN IF NOT EXISTS years_in_current_role INTEGER,
  ADD COLUMN IF NOT EXISTS years_in_industry INTEGER,
  ADD COLUMN IF NOT EXISTS years_in_function INTEGER,
  ADD COLUMN IF NOT EXISTS geographic_scope TEXT,
  ADD COLUMN IF NOT EXISTS reporting_to TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT,
  ADD COLUMN IF NOT EXISTS team_size_typical INTEGER,
  ADD COLUMN IF NOT EXISTS budget_authority TEXT,
  ADD COLUMN IF NOT EXISTS direct_reports INTEGER,
  ADD COLUMN IF NOT EXISTS span_of_control TEXT,
  ADD COLUMN IF NOT EXISTS age_range TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS location_type TEXT,
  ADD COLUMN IF NOT EXISTS work_arrangement TEXT,
  ADD COLUMN IF NOT EXISTS salary_min_usd INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max_usd INTEGER,
  ADD COLUMN IF NOT EXISTS salary_median_usd INTEGER,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS salary_year INTEGER,
  ADD COLUMN IF NOT EXISTS salary_sources TEXT,
  ADD COLUMN IF NOT EXISTS sample_size TEXT,
  ADD COLUMN IF NOT EXISTS confidence_level TEXT,
  ADD COLUMN IF NOT EXISTS data_recency TEXT,
  ADD COLUMN IF NOT EXISTS geographic_benchmark_scope TEXT,
  ADD COLUMN IF NOT EXISTS work_style_preference TEXT,
  ADD COLUMN IF NOT EXISTS learning_style TEXT,
  ADD COLUMN IF NOT EXISTS technology_adoption TEXT,
  ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
  ADD COLUMN IF NOT EXISTS change_readiness TEXT,
  ADD COLUMN IF NOT EXISTS one_liner TEXT,
  ADD COLUMN IF NOT EXISTS background_story TEXT,
  ADD COLUMN IF NOT EXISTS section TEXT;

-- Add CHECK constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'personas_confidence_level_check'
  ) THEN
    ALTER TABLE personas ADD CONSTRAINT personas_confidence_level_check
      CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high'));
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_personas_role_slug ON personas(role_slug);
CREATE INDEX IF NOT EXISTS idx_personas_function_slug ON personas(function_slug);
CREATE INDEX IF NOT EXISTS idx_personas_department_slug ON personas(department_slug);
CREATE INDEX IF NOT EXISTS idx_personas_persona_number ON personas(persona_number);
CREATE INDEX IF NOT EXISTS idx_personas_geographic_scope ON personas(geographic_scope);
CREATE INDEX IF NOT EXISTS idx_personas_section ON personas(section);

-- Add comments
COMMENT ON COLUMN personas.tenant_id IS 'Reference to tenant (multi-tenancy support)';
COMMENT ON COLUMN personas.role_slug IS 'Slug reference to org_roles table';
COMMENT ON COLUMN personas.function_slug IS 'Slug reference to org_functions table';
COMMENT ON COLUMN personas.department_slug IS 'Slug reference to org_departments table';
COMMENT ON COLUMN personas.persona_number IS 'Sequential number within function/section';
COMMENT ON COLUMN personas.geographic_scope IS 'Geographic scope of responsibility';
COMMENT ON COLUMN personas.one_liner IS 'One-line tagline describing the persona';
COMMENT ON COLUMN personas.background_story IS 'Narrative background of the persona';

-- Verification
DO $$
DECLARE
  v_column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'personas'
    AND column_name IN (
      'tenant_id', 'role_slug', 'function_slug', 'department_slug', 'persona_number',
      'years_in_current_role', 'years_in_industry', 'years_in_function',
      'geographic_scope', 'reporting_to', 'team_size', 'team_size_typical',
      'budget_authority', 'direct_reports', 'span_of_control',
      'age_range', 'education_level', 'location_type', 'work_arrangement',
      'salary_min_usd', 'salary_max_usd', 'salary_median_usd',
      'salary_currency', 'salary_year', 'salary_sources',
      'sample_size', 'confidence_level', 'data_recency', 'geographic_benchmark_scope',
      'work_style_preference', 'learning_style', 'technology_adoption',
      'risk_tolerance', 'change_readiness',
      'one_liner', 'background_story', 'section'
    );

  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'STEP 1 COMPLETE - Added % columns to personas table', v_column_count;
  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'Next: Run 02_create_persona_junction_tables.sql';
  RAISE NOTICE '=====================================================================================';
END $$;
