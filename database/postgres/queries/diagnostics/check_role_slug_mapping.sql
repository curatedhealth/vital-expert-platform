-- =====================================================================
-- CHECK ROLE_SLUG MAPPING TO ORG_ROLES
-- This helps understand how to match personas.role_slug to org_roles
-- =====================================================================

-- 1. Check what role_slug values exist in personas
SELECT 
  role_slug,
  COUNT(*) as persona_count,
  COUNT(role_id) as with_role_id,
  COUNT(*) - COUNT(role_id) as missing_role_id
FROM personas
WHERE role_slug IS NOT NULL
GROUP BY role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- 2. Check what role_type/name values exist in org_roles
SELECT 
  COALESCE(role_type::text, name::text, id::text) as role_display,
  COUNT(*) as role_count,
  COUNT(function_id) as with_function,
  COUNT(department_id) as with_department
FROM org_roles
GROUP BY COALESCE(role_type::text, name::text, id::text)
ORDER BY role_count DESC
LIMIT 50;

-- 3. Try to find matches between role_slug and org_roles
-- This shows which personas.role_slug can be matched to org_roles
SELECT 
  p.role_slug,
  COUNT(DISTINCT p.id) as persona_count,
  COUNT(DISTINCT r.id) as matching_roles,
  STRING_AGG(DISTINCT COALESCE(r.role_type::text, r.name::text, r.id::text), ', ') as matching_role_names
FROM personas p
LEFT JOIN org_roles r ON (
  LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.role_type::text, '')))
  OR LOWER(TRIM(p.role_slug)) = LOWER(TRIM(COALESCE(r.name::text, '')))
)
WHERE p.role_slug IS NOT NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

-- 4. Show personas with role_slug but no matching role_id
SELECT 
  p.id,
  p.name,
  p.role_slug,
  p.role_id,
  CASE 
    WHEN p.role_id IS NULL THEN 'No role_id - needs matching'
    ELSE 'Has role_id'
  END as status
FROM personas p
WHERE p.role_slug IS NOT NULL
  AND p.role_id IS NULL
LIMIT 50;

