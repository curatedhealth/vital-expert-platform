-- =====================================================================
-- DIAGNOSE PERSONAS ORG STRUCTURE BEFORE FIX
-- Run this first to understand the current state
-- =====================================================================

-- =====================================================================
-- 1. Overall statistics by tenant
-- =====================================================================
SELECT 
  COALESCE(p.tenant_id::text, 'NULL') as tenant_id,
  COUNT(*) as total_personas,
  COUNT(role_id) as with_role_id,
  COUNT(role_slug) as with_role_slug,
  COUNT(function_id) as with_function_id,
  COUNT(department_id) as with_department_id,
  COUNT(title) as with_title,
  COUNT(*) - COUNT(role_id) as missing_role_id,
  COUNT(*) - COUNT(function_id) as missing_function_id,
  COUNT(*) - COUNT(department_id) as missing_department_id,
  ROUND(100.0 * COUNT(role_id) / COUNT(*), 2) as pct_with_role,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_with_department
FROM personas p
WHERE p.deleted_at IS NULL
GROUP BY p.tenant_id
ORDER BY total_personas DESC;

-- =====================================================================
-- 2. Sample role_slug values from personas (top 30)
-- =====================================================================
SELECT 
  p.role_slug,
  COUNT(*) as persona_count,
  COUNT(p.role_id) as with_role_id,
  COUNT(*) - COUNT(p.role_id) as missing_role_id
FROM personas p
WHERE p.deleted_at IS NULL
  AND p.role_slug IS NOT NULL
GROUP BY p.role_slug
ORDER BY persona_count DESC
LIMIT 30;

-- =====================================================================
-- 3. Sample org_roles.slug values (top 30)
-- =====================================================================
SELECT 
  r.slug,
  r.name,
  COUNT(DISTINCT r.id) as role_count,
  COUNT(DISTINCT r.function_id) as functions_count,
  COUNT(DISTINCT r.department_id) as departments_count
FROM org_roles r
WHERE r.slug IS NOT NULL
GROUP BY r.slug, r.name
ORDER BY role_count DESC
LIMIT 30;

-- =====================================================================
-- 4. Check for potential matches between role_slug and org_roles.slug
-- =====================================================================
SELECT 
  p.role_slug as persona_role_slug,
  r.slug as org_role_slug,
  r.name as org_role_name,
  COUNT(DISTINCT p.id) as persona_count,
  'Potential match' as status
FROM personas p
CROSS JOIN org_roles r
WHERE p.deleted_at IS NULL
  AND p.role_slug IS NOT NULL
  AND r.slug IS NOT NULL
  AND p.role_id IS NULL  -- Only consider unmatched personas
  AND (
    -- Exact match (case-insensitive)
    LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug))
    OR
    -- Close match (one contains the other)
    LOWER(TRIM(p.role_slug)) LIKE '%' || LOWER(TRIM(r.slug)) || '%'
    OR
    LOWER(TRIM(r.slug)) LIKE '%' || LOWER(TRIM(p.role_slug)) || '%'
  )
GROUP BY p.role_slug, r.slug, r.name
ORDER BY persona_count DESC
LIMIT 50;

-- =====================================================================
-- 5. Sample titles from personas without role_id
-- =====================================================================
SELECT 
  p.title,
  p.role_slug,
  COUNT(*) as persona_count
FROM personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.title IS NOT NULL
GROUP BY p.title, p.role_slug
ORDER BY persona_count DESC
LIMIT 30;

-- =====================================================================
-- 6. Check org_roles that have function_id and department_id
-- =====================================================================
SELECT 
  COUNT(*) as total_roles,
  COUNT(function_id) as roles_with_function,
  COUNT(department_id) as roles_with_department,
  COUNT(*) - COUNT(function_id) as roles_missing_function,
  COUNT(*) - COUNT(department_id) as roles_missing_department,
  ROUND(100.0 * COUNT(function_id) / COUNT(*), 2) as pct_roles_with_function,
  ROUND(100.0 * COUNT(department_id) / COUNT(*), 2) as pct_roles_with_department
FROM org_roles;

-- =====================================================================
-- 7. Show roles that are missing function_id or department_id
-- (These would prevent persona mapping)
-- =====================================================================
SELECT 
  r.id,
  r.slug,
  r.name,
  r.function_id,
  r.department_id,
  CASE 
    WHEN r.function_id IS NULL THEN 'Missing function_id'
    WHEN r.department_id IS NULL THEN 'Missing department_id'
    ELSE 'OK'
  END as issue
FROM org_roles r
WHERE r.function_id IS NULL OR r.department_id IS NULL
ORDER BY 
  CASE 
    WHEN r.function_id IS NULL THEN 1
    WHEN r.department_id IS NULL THEN 2
    ELSE 3
  END
LIMIT 50;

-- =====================================================================
-- 8. Check tenant-specific data
-- =====================================================================
-- Tenant: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b (666 personas)
SELECT 
  'Tenant: c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' as tenant_info,
  COUNT(*) as total_personas,
  COUNT(DISTINCT p.role_slug) as unique_role_slugs,
  COUNT(DISTINCT p.title) as unique_titles,
  COUNT(p.role_id) as with_role_id,
  COUNT(p.function_id) as with_function_id,
  COUNT(p.department_id) as with_department_id
FROM personas p
WHERE p.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
  AND p.deleted_at IS NULL;

-- Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (331 personas)
SELECT 
  'Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' as tenant_info,
  COUNT(*) as total_personas,
  COUNT(DISTINCT p.role_slug) as unique_role_slugs,
  COUNT(DISTINCT p.title) as unique_titles,
  COUNT(p.role_id) as with_role_id,
  COUNT(p.function_id) as with_function_id,
  COUNT(p.department_id) as with_department_id
FROM personas p
WHERE p.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.deleted_at IS NULL;

-- =====================================================================
-- 9. Top unmatched role_slug values by tenant
-- =====================================================================
SELECT 
  p.tenant_id::text as tenant_id,
  p.role_slug,
  COUNT(*) as persona_count
FROM personas p
WHERE p.deleted_at IS NULL
  AND p.role_slug IS NOT NULL
  AND p.role_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM org_roles r 
    WHERE LOWER(TRIM(r.slug)) = LOWER(TRIM(p.role_slug))
  )
GROUP BY p.tenant_id, p.role_slug
ORDER BY persona_count DESC
LIMIT 50;

