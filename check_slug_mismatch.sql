-- =====================================================================
-- CHECK SLUG MISMATCH BETWEEN PERSONAS.ROLE_SLUG AND ORG_ROLES.SLUG
-- =====================================================================

-- 1. Show sample role_slug values from personas (that don't have role_id)
SELECT 
  role_slug,
  COUNT(*) as persona_count
FROM personas
WHERE role_slug IS NOT NULL
  AND role_id IS NULL
GROUP BY role_slug
ORDER BY persona_count DESC
LIMIT 30;

-- 2. Show sample slug values from org_roles
SELECT 
  slug,
  COUNT(*) as role_count,
  function_id,
  department_id
FROM org_roles
WHERE slug IS NOT NULL
GROUP BY slug, function_id, department_id
ORDER BY role_count DESC
LIMIT 30;

-- 3. Check if any role_slug values match org_roles.slug
SELECT 
  p.role_slug,
  COUNT(DISTINCT p.id) as persona_count,
  COUNT(DISTINCT r.id) as matching_roles,
  STRING_AGG(DISTINCT r.slug, ', ') as matching_slugs
FROM personas p
LEFT JOIN org_roles r ON LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug))
WHERE p.role_slug IS NOT NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- 4. Show personas with role_slug that have NO match in org_roles.slug
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  'No matching slug in org_roles' as issue
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r 
    WHERE LOWER(TRIM(r.slug)) = LOWER(TRIM(p.role_slug))
  )
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- 5. Show org_roles.slug values that might be close matches (for manual review)
-- This helps identify if there are typos or naming differences
SELECT 
  p.role_slug as persona_slug,
  r.slug as org_role_slug,
  -- Calculate similarity
  CASE 
    WHEN LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug)) THEN 'Exact match'
    WHEN LOWER(REPLACE(p.role_slug, '-', '')) = LOWER(REPLACE(r.slug, '-', '')) THEN 'Match without hyphens'
    WHEN LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(r.slug)) || '%' THEN 'Persona contains org_role'
    WHEN LOWER(TRIM(r.slug)) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%' THEN 'Org_role contains persona'
    ELSE 'No match'
  END as match_type
FROM personas p
CROSS JOIN org_roles r
WHERE p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND p.role_id IS NULL
  AND (
    LOWER(REPLACE(p.role_slug, '-', '')) = LOWER(REPLACE(r.slug, '-', ''))
    OR LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(r.slug)) || '%'
    OR LOWER(TRIM(r.slug)) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%'
  )
LIMIT 100;

