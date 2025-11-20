-- =====================================================================
-- FIX PERSONAS ORG STRUCTURE MAPPING (COMPREHENSIVE VERSION)
-- This script tries multiple matching strategies to populate role_id, function_id, department_id
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

-- Step 2: Strategy 1 - Match by slug (exact match, case-insensitive)
UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id IS NULL
  AND p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug));

-- Step 3: Strategy 2 - Match by slug without hyphens (handles "chief-medical-officer" vs "chiefmedicalofficer")
UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id IS NULL
  AND p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND LOWER(REPLACE(p.role_slug, '-', '')) = LOWER(REPLACE(r.slug, '-', ''));

-- Step 4: Strategy 3 - Match by role_type or name (if slug doesn't match)
-- Normalize both sides for comparison
UPDATE personas p
SET 
  role_id = r.id,
  function_id = r.function_id,
  department_id = r.department_id,
  updated_at = NOW()
FROM org_roles r
WHERE 
  p.role_id IS NULL
  AND p.role_slug IS NOT NULL
  AND (
    -- Match role_slug to role_type (normalized)
    (r.role_type IS NOT NULL AND LOWER(REPLACE(REPLACE(p.role_slug, '-', ' '), '_', ' ')) = LOWER(REPLACE(r.role_type, '-', ' ')))
    OR
    -- Match role_slug to name (normalized)
    (r.name IS NOT NULL AND LOWER(REPLACE(REPLACE(p.role_slug, '-', ' '), '_', ' ')) = LOWER(REPLACE(r.name, '-', ' ')))
  );

-- Step 5: Check intermediate results
SELECT 
  'After Matching' as status,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(*) - COUNT(role_id) as missing_role_id
FROM personas;

-- Step 6: Populate function_id and department_id for personas that got role_id but missing org fields
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

-- Step 7: Final results
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

-- Step 8: Show remaining unmatched personas
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  'Still unmatched' as status
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- Step 9: Summary by tenant
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

