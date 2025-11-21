-- =====================================================================
-- FIX PERSONAS ORG STRUCTURE MAPPING
-- This script will:
-- 1. Populate role_id from role_slug (if role_id is NULL but role_slug exists)
-- 2. Populate function_id and department_id from role_id
-- =====================================================================

-- Step 1: Check current state
SELECT 
  'Before Fix' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(role_slug) as with_role_slug,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(*) - COUNT(role_id) as missing_role_id,
  COUNT(*) - COUNT(function_id) as missing_function_id,
  COUNT(*) - COUNT(department_id) as missing_department_id
FROM personas;

-- Step 2: Populate role_id from role_slug where role_id is NULL
-- Match personas.role_slug to org_roles.role_type or org_roles.name
UPDATE personas p
SET 
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id IS NULL
  AND p.role_slug IS NOT NULL
  AND (
    -- Try matching role_slug to role_type (primary match)
    (r.role_type IS NOT NULL AND LOWER(TRIM(r.role_type)) = LOWER(TRIM(p.role_slug)))
    OR
    -- Try matching role_slug to name (fallback)
    (r.name IS NOT NULL AND LOWER(TRIM(r.name)) = LOWER(TRIM(p.role_slug)))
  );

-- Step 3: Populate function_id and department_id from role_id
-- Update personas that have a role_id but are missing function_id
UPDATE personas p
SET 
  function_id = r.function_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND r.function_id IS NOT NULL
  AND (p.function_id IS NULL OR p.function_id != r.function_id);

-- Update personas that have a role_id but are missing department_id
UPDATE personas p
SET 
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND r.department_id IS NOT NULL
  AND (p.department_id IS NULL OR p.department_id != r.department_id);

-- Step 4: Check results after fix
SELECT 
  'After Fix' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(role_slug) as with_role_slug,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(*) - COUNT(role_id) as missing_role_id,
  COUNT(*) - COUNT(function_id) as missing_function_id,
  COUNT(*) - COUNT(department_id) as missing_department_id
FROM personas;

-- Step 5: Show personas that still couldn't be matched
SELECT 
  p.id,
  p.name,
  p.role_slug,
  p.role_id,
  p.function_id,
  p.department_id,
  CASE 
    WHEN p.role_slug IS NULL THEN 'No role_slug'
    WHEN p.role_id IS NULL THEN 'role_slug not found in org_roles'
    WHEN p.function_id IS NULL THEN 'role has no function_id'
    WHEN p.department_id IS NULL THEN 'role has no department_id'
    ELSE 'OK'
  END as issue
FROM personas p
WHERE 
  p.role_id IS NULL 
  OR p.function_id IS NULL 
  OR p.department_id IS NULL
ORDER BY 
  CASE 
    WHEN p.role_id IS NULL THEN 1
    WHEN p.function_id IS NULL THEN 2
    WHEN p.department_id IS NULL THEN 3
    ELSE 4
  END
LIMIT 100;

-- Step 6: Summary by tenant after fix
SELECT 
  COALESCE(p.tenant_id::text, 'NULL') as tenant_id,
  COUNT(*) as total_personas,
  COUNT(function_id) as with_function,
  COUNT(department_id) as with_department,
  COUNT(role_id) as with_role,
  COUNT(*) - COUNT(function_id) as missing_function,
  COUNT(*) - COUNT(department_id) as missing_department,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department
FROM personas p
GROUP BY p.tenant_id
ORDER BY total_personas DESC;

