-- =====================================================================
-- DUPLICATE ORG STRUCTURE DATA FOR PHARMACEUTICALS
-- Run this after the first migration that adds tenant_id
-- =====================================================================

-- Tenant IDs:
-- VITAL Expert Platform: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
-- Pharmaceuticals: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

-- =====================================================================
-- 1. Duplicate org_functions for Pharmaceuticals
-- =====================================================================

INSERT INTO org_functions (
  id, department_name, description, migration_ready,
  created_at, updated_at, created_by, updated_by, tenant_id
)
SELECT
  uuid_generate_v4(),
  department_name,
  description,
  migration_ready,
  created_at,
  NOW(),
  created_by,
  'system_migration',
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
FROM org_functions
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';

-- =====================================================================
-- 2. Duplicate org_departments for Pharmaceuticals
-- =====================================================================

INSERT INTO org_departments (
  id, department_id, department_name, department_type, description,
  function_area, compliance_requirements, critical_systems, data_classification,
  migration_ready, export_format, function_id, created_at, updated_at,
  created_by, updated_by, metadata, tenant_id
)
SELECT
  uuid_generate_v4(),
  department_id,
  department_name,
  department_type,
  description,
  function_area,
  compliance_requirements,
  critical_systems,
  data_classification,
  migration_ready,
  export_format,
  function_id,
  created_at,
  NOW(),
  created_by,
  'system_migration',
  metadata,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
FROM org_departments
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';

-- =====================================================================
-- 3. Duplicate org_roles for Pharmaceuticals
-- =====================================================================

INSERT INTO org_roles (
  id, role_name, role_title, description, seniority_level,
  reports_to_role_id, function_area, department_name, required_skills,
  required_certifications, years_experience_min, years_experience_max,
  migration_ready, is_active, function_id, department_id,
  created_at, updated_at, created_by, updated_by, metadata, tenant_id
)
SELECT
  uuid_generate_v4(),
  role_name,
  role_title,
  description,
  seniority_level,
  reports_to_role_id,
  function_area,
  department_name,
  required_skills,
  required_certifications,
  years_experience_min,
  years_experience_max,
  migration_ready,
  is_active,
  function_id,
  department_id,
  created_at,
  NOW(),
  created_by,
  'system_migration',
  metadata,
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
FROM org_roles
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244';

-- =====================================================================
-- 4. Verify final counts
-- =====================================================================

SELECT 'Final counts' as status;

SELECT 'org_functions' as table_name,
  CASE
    WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
    WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharma'
    ELSE 'Other'
  END as tenant,
  COUNT(*) as count
FROM org_functions GROUP BY tenant_id
UNION ALL
SELECT 'org_departments',
  CASE
    WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
    WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharma'
    ELSE 'Other'
  END,
  COUNT(*)
FROM org_departments GROUP BY tenant_id
UNION ALL
SELECT 'org_roles',
  CASE
    WHEN tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' THEN 'VITAL Expert'
    WHEN tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' THEN 'Pharma'
    ELSE 'Other'
  END,
  COUNT(*)
FROM org_roles GROUP BY tenant_id
ORDER BY table_name, tenant;
