-- =====================================================================
-- CHECK PERSONAS ORG STRUCTURE MAPPING
-- Run this in Supabase SQL Editor to verify all personas have function_id and department_id
-- =====================================================================

-- 0. First, check what columns actually exist in org_roles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'org_roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 1. Overall statistics: How many personas have function_id, department_id, role_id?
SELECT 
  COUNT(*) as total_personas,
  COUNT(function_id) as personas_with_function,
  COUNT(department_id) as personas_with_department,
  COUNT(role_id) as personas_with_role,
  COUNT(*) - COUNT(function_id) as missing_function,
  COUNT(*) - COUNT(department_id) as missing_department,
  COUNT(*) - COUNT(role_id) as missing_role,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 2) as pct_with_role
FROM personas;

-- 2. Sample personas missing function_id or department_id
SELECT 
  id,
  name,
  slug,
  role_id,
  department_id,
  function_id,
  role_slug,
  department_slug,
  function_slug,
  CASE 
    WHEN role_id IS NULL THEN 'Missing role_id'
    WHEN function_id IS NULL THEN 'Missing function_id'
    WHEN department_id IS NULL THEN 'Missing department_id'
    ELSE 'OK'
  END as issue
FROM personas
WHERE function_id IS NULL 
   OR department_id IS NULL
   OR role_id IS NULL
ORDER BY 
  CASE 
    WHEN role_id IS NULL THEN 1
    WHEN function_id IS NULL THEN 2
    WHEN department_id IS NULL THEN 3
    ELSE 4
  END
LIMIT 50;

-- 3. Check if personas with role_id have function_id and department_id populated
-- (They should, based on the migration trigger)
SELECT 
  COUNT(*) as personas_with_role_but_missing_org_ids,
  COUNT(*) FILTER (WHERE role_id IS NOT NULL AND function_id IS NULL) as missing_function,
  COUNT(*) FILTER (WHERE role_id IS NOT NULL AND department_id IS NULL) as missing_department
FROM personas
WHERE role_id IS NOT NULL 
  AND (function_id IS NULL OR department_id IS NULL);

-- 4. Check the relationship: do roles have function_id and department_id?
-- Note: org_roles table uses 'role_name' not 'name'
SELECT 
  COUNT(*) as total_roles,
  COUNT(function_id) as roles_with_function,
  COUNT(department_id) as roles_with_department,
  COUNT(*) - COUNT(function_id) as roles_missing_function,
  COUNT(*) - COUNT(department_id) as roles_missing_department,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_roles_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_roles_with_department
FROM org_roles;

-- 5. Find roles that are missing function_id or department_id (these would prevent persona mapping)
-- Note: org_roles table uses 'role_type'
SELECT 
  id,
  COALESCE(
    NULLIF(role_type::text, ''),
    NULLIF(name::text, ''),
    id::text
  ) as role_display,
  function_id,
  department_id,
  CASE 
    WHEN function_id IS NULL THEN 'Missing function_id'
    WHEN department_id IS NULL THEN 'Missing department_id'
    ELSE 'OK'
  END as issue
FROM org_roles
WHERE function_id IS NULL OR department_id IS NULL
ORDER BY 
  CASE 
    WHEN function_id IS NULL THEN 1
    WHEN department_id IS NULL THEN 2
    ELSE 3
  END
LIMIT 50;

-- 5b. Alternative query using role_type (simpler version)
SELECT 
  id,
  COALESCE(role_type::text, name::text, id::text) as role_display,
  function_id,
  department_id,
  CASE 
    WHEN function_id IS NULL THEN 'Missing function_id'
    WHEN department_id IS NULL THEN 'Missing department_id'
    ELSE 'OK'
  END as issue
FROM org_roles
WHERE function_id IS NULL OR department_id IS NULL
ORDER BY 
  CASE 
    WHEN function_id IS NULL THEN 1
    WHEN department_id IS NULL THEN 2
    ELSE 3
  END
LIMIT 50;

-- 6. Check if the trigger is working: personas with role_id should auto-populate function_id and department_id
-- This query shows personas that have a role_id but the trigger didn't populate function/department
-- Note: org_roles table uses 'role_type'
SELECT 
  p.id,
  p.name,
  p.role_id,
  COALESCE(r.role_type::text, r.name::text, r.id::text, 'Unknown') as role_display,
  p.function_id,
  r.function_id as role_function_id,
  p.department_id,
  r.department_id as role_department_id,
  CASE 
    WHEN p.function_id IS DISTINCT FROM r.function_id THEN 'Function mismatch'
    WHEN p.department_id IS DISTINCT FROM r.department_id THEN 'Department mismatch'
    WHEN p.function_id IS NULL AND r.function_id IS NOT NULL THEN 'Function not populated'
    WHEN p.department_id IS NULL AND r.department_id IS NOT NULL THEN 'Department not populated'
    ELSE 'OK'
  END as issue
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
WHERE p.role_id IS NOT NULL
  AND (
    p.function_id IS NULL 
    OR p.department_id IS NULL
    OR p.function_id IS DISTINCT FROM r.function_id
    OR p.department_id IS DISTINCT FROM r.department_id
  )
LIMIT 50;

-- 7. Summary by tenant (if applicable)
SELECT 
  COALESCE(p.tenant_id::text, 'NULL') as tenant_id,
  COUNT(*) as total_personas,
  COUNT(function_id) as with_function,
  COUNT(department_id) as with_department,
  COUNT(role_id) as with_role,
  COUNT(*) - COUNT(function_id) as missing_function,
  COUNT(*) - COUNT(department_id) as missing_department
FROM personas p
GROUP BY p.tenant_id
ORDER BY total_personas DESC;

