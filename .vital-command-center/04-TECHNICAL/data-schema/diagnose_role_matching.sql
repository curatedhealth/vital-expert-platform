-- =====================================================================
-- DIAGNOSE ROLE MATCHING ISSUES
-- This will help identify why role_slug values aren't matching org_roles
-- =====================================================================

-- Create helper function for normalization
CREATE OR REPLACE FUNCTION normalize_role_name(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(input_text, '[^a-z0-9]+', '-', 'gi'), '^-+|-+$', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1. Show top role_slug values from personas that still don't have role_id
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  normalize_role_name(p.role_slug) as normalized_slug
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 30;

-- 2. Show all org_roles to see what we're trying to match against
SELECT 
  id,
  COALESCE(role_type::text, name::text, id::text) as role_display,
  normalize_role_name(COALESCE(role_type::text, name::text, '')) as normalized,
  function_id,
  department_id
FROM org_roles
ORDER BY COALESCE(role_type::text, name::text, id::text)
LIMIT 100;

-- 3. Try to find the best matches for each unmatched role_slug
-- This shows potential matches even if they're not perfect
SELECT 
  p.role_slug,
  normalize_role_name(p.role_slug) as normalized_persona,
  COALESCE(r.role_type::text, r.name::text, r.id::text) as org_role_display,
  normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) as normalized_org,
  r.id as org_role_id,
  r.function_id,
  r.department_id,
  -- Calculate similarity score
  CASE 
    WHEN normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) THEN 100
    WHEN LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) THEN 90
    WHEN normalize_role_name(p.role_slug) LIKE '%' || normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) || '%' THEN 70
    WHEN normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) LIKE '%' || normalize_role_name(p.role_slug) || '%' THEN 70
    ELSE 0
  END as similarity_score
FROM personas p
CROSS JOIN org_roles r
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND (
    normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, ''))
    OR LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, '')))
    OR normalize_role_name(p.role_slug) LIKE '%' || normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) || '%'
    OR normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) LIKE '%' || normalize_role_name(p.role_slug) || '%'
  )
ORDER BY p.role_slug, similarity_score DESC
LIMIT 100;

-- 4. Show personas with role_slug that have NO matches at all
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  normalize_role_name(p.role_slug) as normalized,
  'No match found' as status
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r
    WHERE (
      normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, ''))
      OR LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, '')))
      OR normalize_role_name(p.role_slug) LIKE '%' || normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) || '%'
      OR normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) LIKE '%' || normalize_role_name(p.role_slug) || '%'
    )
  )
GROUP BY p.role_slug, normalize_role_name(p.role_slug)
ORDER BY persona_count DESC
LIMIT 50;

-- 5. Check if there's a slug column in org_roles that we should be using instead
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'org_roles' 
  AND table_schema = 'public'
  AND column_name LIKE '%slug%'
ORDER BY ordinal_position;


