-- =====================================================================
-- FIX PERSONAS ORG STRUCTURE MAPPING (FINAL VERSION)
-- This script will match role_slug to org_roles and populate function_id/department_id
-- =====================================================================

-- Step 1: Check current state
SELECT 
  'Before Fix' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(role_slug) as with_role_slug,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id
FROM personas;

-- Step 2: Match role_slug to org_roles.slug and populate role_id, function_id, and department_id in one go
-- This is the correct approach since org_roles has a slug column!
UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug))
  AND (
    -- Only update if role_id is NULL or if function_id/department_id need updating
    p.role_id IS NULL
    OR (p.function_id IS NULL AND r.function_id IS NOT NULL)
    OR (p.department_id IS NULL AND r.department_id IS NOT NULL)
    OR (p.function_id IS DISTINCT FROM r.function_id)
    OR (p.department_id IS DISTINCT FROM r.department_id)
  );

-- Step 5: Check results
SELECT 
  'After Fix' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(*) - COUNT(role_id) as missing_role_id,
  COUNT(*) - COUNT(function_id) as missing_function_id,
  COUNT(*) - COUNT(department_id) as missing_department_id
FROM personas;

-- Step 6: Show remaining unmatched personas (for manual review)
SELECT 
  p.role_slug,
  COUNT(*) as persona_count
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- Step 6b: Show which role_slug values don't exist in org_roles.slug
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  'No matching slug in org_roles' as issue
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r 
    WHERE LOWER(TRIM(r.slug)) = LOWER(TRIM(p.role_slug))
  )
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- Step 7: Summary by tenant
SELECT 
  COALESCE(p.tenant_id::text, 'NULL') as tenant_id,
  COUNT(*) as total_personas,
  COUNT(function_id) as with_function,
  COUNT(department_id) as with_department,
  COUNT(role_id) as with_role,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department
FROM personas p
GROUP BY p.tenant_id
ORDER BY total_personas DESC;

