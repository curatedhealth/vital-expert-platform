-- =====================================================================
-- CHECK ROLE MATCHING BETWEEN PERSONAS.ROLE_SLUG AND ORG_ROLES
-- This helps debug why role_slug values aren't matching
-- =====================================================================

-- Create helper function for normalization
CREATE OR REPLACE FUNCTION normalize_role_name(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(input_text, '[^a-z0-9]+', '-', 'gi'), '^-+|-+$', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1. Show sample role_slug values from personas
SELECT 
  'Personas role_slug samples' as source,
  role_slug,
  normalize_role_name(role_slug) as normalized,
  COUNT(*) as persona_count
FROM personas
WHERE role_slug IS NOT NULL
GROUP BY role_slug
ORDER BY persona_count DESC
LIMIT 20;

-- 2. Show sample role_type/name values from org_roles
SELECT 
  'Org_roles samples' as source,
  COALESCE(role_type::text, name::text, id::text) as role_display,
  normalize_role_name(COALESCE(role_type::text, name::text, '')) as normalized,
  COUNT(*) as role_count
FROM org_roles
GROUP BY COALESCE(role_type::text, name::text, id::text)
ORDER BY role_count DESC
LIMIT 20;

-- 3. Try to find matches using different strategies
SELECT 
  p.role_slug as persona_role_slug,
  normalize_role_name(p.role_slug) as normalized_persona_slug,
  COALESCE(r.role_type::text, r.name::text, r.id::text) as org_role_display,
  normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) as normalized_org_role,
  CASE 
    WHEN LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) THEN 'Exact match'
    WHEN normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, '')) THEN 'Normalized match'
    WHEN LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) || '%' THEN 'Persona contains org_role'
    WHEN LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%' THEN 'Org_role contains persona'
    ELSE 'No match'
  END as match_type,
  r.id as org_role_id,
  r.function_id,
  r.department_id
FROM personas p
CROSS JOIN org_roles r
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND (
    LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, '')))
    OR normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, ''))
    OR LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) || '%'
    OR LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%'
  )
LIMIT 50;

-- 4. Show personas with role_slug but no matches found
SELECT 
  p.id,
  p.name,
  p.role_slug,
  normalize_role_name(p.role_slug) as normalized_slug,
  'No match found in org_roles' as issue
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r
    WHERE (
      LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, '')))
      OR normalize_role_name(p.role_slug) = normalize_role_name(COALESCE(r.role_type::text, r.name::text, ''))
      OR LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) || '%'
      OR LOWER(TRIM(COALESCE(r.role_type::text, r.name::text, ''))) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%'
    )
  )
LIMIT 50;


