-- =====================================================================
-- COMPREHENSIVE FIX FOR PERSONAS ORG STRUCTURE MAPPING
-- Based on seed file patterns from sql/seeds/00_PREPARATION
-- =====================================================================
-- This script:
-- 1. Matches role_slug to org_roles.slug (primary method)
-- 2. Falls back to title-based pattern matching (like seed files)
-- 3. Populates role_id, function_id, and department_id from matched roles
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: Check current state
-- =====================================================================
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
FROM personas
WHERE deleted_at IS NULL;

-- =====================================================================
-- STEP 2: Match by role_slug to org_roles.slug (PRIMARY METHOD)
-- This follows the transformation_pipeline.py approach
-- =====================================================================
UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.deleted_at IS NULL
  AND p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug))
  AND (
    -- Only update if any of these fields need updating
    p.role_id IS NULL
    OR (p.function_id IS NULL AND r.function_id IS NOT NULL)
    OR (p.department_id IS NULL AND r.department_id IS NOT NULL)
    OR (p.function_id IS DISTINCT FROM r.function_id)
    OR (p.department_id IS DISTINCT FROM r.department_id)
  );

-- =====================================================================
-- STEP 3: Fallback: Match by title to org_roles.name (LIKE seed files)
-- This follows the pattern from LOAD_MARKET_ACCESS_157_PERSONAS.sql and
-- SUPPLEMENT_MEDICAL_AFFAIRS_MAPPING.sql
-- Only for personas that still don't have role_id
-- =====================================================================
-- Match personas to roles using title-based pattern matching
-- Pattern: p.title ILIKE '%' || r.name || '%'
-- This matches how Market Access and Medical Affairs personas are mapped

UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.deleted_at IS NULL
  AND p.role_id IS NULL  -- Only update if not already matched
  AND p.title IS NOT NULL
  AND r.name IS NOT NULL
  AND r.function_id IS NOT NULL
  AND r.department_id IS NOT NULL
  AND (
    -- Match title contains role name (case-insensitive) - PRIMARY MATCH
    p.title ILIKE '%' || r.name || '%'
    OR
    -- Match role name contains key words from title - FALLBACK
    r.name ILIKE '%' || SPLIT_PART(p.title, ' ', 1) || '%'
    OR
    -- Match if title starts with role name - COMMON PATTERN
    p.title ILIKE r.name || '%'
  )
  -- Avoid duplicate matches by preferring exact matches
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r2
    WHERE r2.id != r.id
      AND r2.function_id = r.function_id
      AND p.title ILIKE '%' || r2.name || '%'
      AND LENGTH(r2.name) > LENGTH(r.name)  -- Prefer longer/more specific matches
  );

-- =====================================================================
-- STEP 4: For personas with role_id but missing function_id/department_id
-- Populate from the role's function_id and department_id
-- =====================================================================
UPDATE personas p
SET 
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.deleted_at IS NULL
  AND p.role_id = r.id
  AND (
    (p.function_id IS NULL AND r.function_id IS NOT NULL)
    OR (p.department_id IS NULL AND r.department_id IS NOT NULL)
    OR (p.function_id IS DISTINCT FROM r.function_id)
    OR (p.department_id IS DISTINCT FROM r.department_id)
  );

COMMIT;

-- =====================================================================
-- STEP 5: Check results after fix
-- =====================================================================
SELECT 
  'After Fix' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(*) - COUNT(role_id) as missing_role_id,
  COUNT(*) - COUNT(function_id) as missing_function_id,
  COUNT(*) - COUNT(department_id) as missing_department_id,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 2) as pct_with_role,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department
FROM personas
WHERE deleted_at IS NULL;

-- =====================================================================
-- STEP 6: Show unmatched role_slug values (for debugging)
-- =====================================================================
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  'No matching slug in org_roles' as issue
FROM personas p
WHERE p.deleted_at IS NULL
  AND p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r 
    WHERE LOWER(TRIM(r.slug)) = LOWER(TRIM(p.role_slug))
  )
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- =====================================================================
-- STEP 7: Show sample of matched personas (verification)
-- =====================================================================
SELECT 
  p.name,
  p.title,
  p.role_slug,
  r.slug as org_role_slug,
  r.name as org_role_name,
  p.role_id,
  p.function_id,
  p.department_id,
  f.name as function_name,
  d.name as department_name
FROM personas p
JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id
WHERE p.deleted_at IS NULL
  AND p.role_id IS NOT NULL
LIMIT 20;

-- =====================================================================
-- STEP 8: Summary by tenant
-- =====================================================================
SELECT 
  COALESCE(p.tenant_id::text, 'NULL') as tenant_id,
  COUNT(*) as total_personas,
  COUNT(function_id) as with_function,
  COUNT(department_id) as with_department,
  COUNT(role_id) as with_role,
  COUNT(*) - COUNT(function_id) as missing_function,
  COUNT(*) - COUNT(department_id) as missing_department,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 2) as pct_with_role
FROM personas p
WHERE p.deleted_at IS NULL
GROUP BY p.tenant_id
ORDER BY total_personas DESC;

-- =====================================================================
-- STEP 9: Show personas that still couldn't be matched
-- =====================================================================
SELECT 
  p.id,
  p.name,
  p.title,
  p.role_slug,
  p.role_id,
  p.function_id,
  p.department_id,
  CASE 
    WHEN p.role_slug IS NULL AND p.title IS NULL THEN 'No role_slug or title'
    WHEN p.role_slug IS NULL THEN 'No role_slug'
    WHEN p.title IS NULL THEN 'No title'
    WHEN p.role_id IS NULL THEN 'role_slug not found in org_roles'
    WHEN p.function_id IS NULL THEN 'role has no function_id'
    WHEN p.department_id IS NULL THEN 'role has no department_id'
    ELSE 'OK'
  END as issue
FROM personas p
WHERE p.deleted_at IS NULL
  AND (
    p.role_id IS NULL 
    OR p.function_id IS NULL 
    OR p.department_id IS NULL
  )
ORDER BY 
  CASE 
    WHEN p.role_id IS NULL THEN 1
    WHEN p.function_id IS NULL THEN 2
    WHEN p.department_id IS NULL THEN 3
    ELSE 4
  END
LIMIT 100;

