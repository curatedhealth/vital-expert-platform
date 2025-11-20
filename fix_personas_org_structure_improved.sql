-- =====================================================================
-- FIX PERSONAS ORG STRUCTURE MAPPING (IMPROVED VERSION)
-- This script handles different naming conventions between role_slug and org_roles
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

-- Step 2: Create a helper function to normalize role names for matching
-- This converts "Chief Medical Officer" to "chief-medical-officer" and vice versa
CREATE OR REPLACE FUNCTION normalize_role_name(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert to lowercase and replace spaces/hyphens with single hyphens
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(input_text, '[^a-z0-9]+', '-', 'gi'), '^-+|-+$', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Populate role_id from role_slug with flexible matching
-- This matches role_slug to org_roles using normalized names
UPDATE personas p
SET 
  role_id = r.id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id IS NULL
  AND p.role_slug IS NOT NULL
  AND (
    -- Direct match (exact, case-insensitive)
    LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, '')))
    OR LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.name::text, '')))
    OR
    -- Normalized match (handles "Chief Medical Officer" <-> "chief-medical-officer")
    normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, ''))
    OR
    -- Partial match (role_slug contains role_type or vice versa)
    LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) || '%'
    OR LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%'
  );

-- Step 4: Populate function_id and department_id from role_id
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

-- Step 5: Check results after fix
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

-- Step 6: Show personas that still couldn't be matched (with suggestions)
SELECT 
  p.id,
  p.name,
  p.role_slug,
  p.role_id,
  p.function_id,
  p.department_id,
  -- Show potential matches
  (
    SELECT STRING_AGG(COALESCE(r.role_type::text, r.name::text, r.id::text), ', ')
    FROM org_roles r
    WHERE normalize_role_name(p.role_slug) LIKE '%' || normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) || '%'
       OR normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) LIKE '%' || normalize_role_name(p.role_slug) || '%'
    LIMIT 5
  ) as potential_matches,
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

-- Step 7: Summary by tenant after fix
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

-- Step 8: Clean up - drop the helper function (optional)
-- DROP FUNCTION IF EXISTS normalize_role_name(TEXT);

