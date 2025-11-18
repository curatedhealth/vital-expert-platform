-- =====================================================
-- VERIFICATION SCRIPT
-- Check what tables and columns exist in the database
-- =====================================================

-- Check if org_roles table exists and what columns it has
SELECT
  'org_roles columns' as check_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'org_roles';

-- List all columns in org_roles
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'org_roles'
ORDER BY ordinal_position;

-- Check if normalized tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN (
      'role_therapeutic_areas',
      'role_company_sizes',
      'role_company_types',
      'role_geographic_countries',
      'role_geographic_regions',
      'role_prior_roles',
      'role_preferred_degrees',
      'role_credentials_required',
      'role_credentials_preferred',
      'role_internal_stakeholders',
      'role_external_stakeholders',
      'role_technology_platforms',
      'role_key_activities',
      'role_kpis',
      'role_lateral_moves',
      'role_compliance_requirements',
      'role_regional_variations'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES
    ('role_therapeutic_areas'),
    ('role_company_sizes'),
    ('role_company_types'),
    ('role_geographic_countries'),
    ('role_geographic_regions'),
    ('role_prior_roles'),
    ('role_preferred_degrees'),
    ('role_credentials_required'),
    ('role_credentials_preferred'),
    ('role_internal_stakeholders'),
    ('role_external_stakeholders'),
    ('role_technology_platforms'),
    ('role_key_activities'),
    ('role_kpis'),
    ('role_lateral_moves'),
    ('role_compliance_requirements'),
    ('role_regional_variations')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_name = expected_tables.table_name
  AND t.table_schema = 'public'
ORDER BY
  CASE WHEN t.table_name IS NULL THEN 1 ELSE 0 END,
  expected_tables.table_name;

-- Check if critical columns exist in org_roles
SELECT
  column_name,
  CASE
    WHEN column_name IN (
      'reports_to',
      'leadership_level',
      'career_level',
      'team_size_min',
      'base_salary_min_usd',
      'geographic_scope_type'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES
    ('reports_to'),
    ('leadership_level'),
    ('career_level'),
    ('team_size_min'),
    ('base_salary_min_usd'),
    ('geographic_scope_type')
) AS expected_columns(column_name)
LEFT JOIN information_schema.columns c
  ON c.column_name = expected_columns.column_name
  AND c.table_name = 'org_roles'
ORDER BY
  CASE WHEN c.column_name IS NULL THEN 1 ELSE 0 END,
  expected_columns.column_name;
