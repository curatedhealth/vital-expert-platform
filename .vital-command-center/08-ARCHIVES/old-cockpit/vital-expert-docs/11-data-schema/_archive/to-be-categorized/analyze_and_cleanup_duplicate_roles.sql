-- =====================================================================
-- ANALYZE AND CLEANUP DUPLICATE ROLES
-- Identifies duplicate roles and helps determine which should be merged
-- =====================================================================

-- =====================================================================
-- SUMMARY: Understanding the Duplicates
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES SUMMARY ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names,
    COUNT(*) as total_roles,
    COUNT(*) - COUNT(DISTINCT r.name) as duplicate_roles_count,
    COUNT(DISTINCT CASE WHEN dup_counts.dup_count > 1 THEN r.name END) as role_names_with_duplicates,
    ROUND(100.0 * (COUNT(*) - COUNT(DISTINCT r.name)) / COUNT(*), 2) as percent_duplicates
FROM public.org_roles r
LEFT JOIN (
    SELECT name, COUNT(*) as dup_count
    FROM public.org_roles
    WHERE deleted_at IS NULL
    GROUP BY name
    HAVING COUNT(*) > 1
) dup_counts ON r.name = dup_counts.name
WHERE r.deleted_at IS NULL;

-- =====================================================================
-- TRUE DUPLICATES: Same name, same tenant, same function, same department
-- These should likely be merged
-- =====================================================================
SELECT 
    '=== TRUE DUPLICATES (Should be merged) ===' as section;

SELECT 
    r.name as role_name,
    t.name as tenant_name,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(DISTINCT r.id) as duplicate_count,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids,
    STRING_AGG(r.slug, ', ' ORDER BY r.created_at) as role_slugs,
    STRING_AGG(
        COALESCE(persona_counts.persona_count, 0)::text || ' personas', 
        ', ' 
        ORDER BY r.created_at
    ) as persona_counts,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas,
    MIN(r.created_at) as oldest_created,
    MAX(r.created_at) as newest_created
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.name, t.id, t.name, f.id, f.name, d.id, d.name
HAVING COUNT(DISTINCT r.id) > 1
ORDER BY duplicate_count DESC, r.name
LIMIT 50;

-- =====================================================================
-- LEGITIMATE DUPLICATES: Same name but different contexts
-- These are probably OK (different tenants, functions, or departments)
-- =====================================================================
SELECT 
    '=== LEGITIMATE DUPLICATES (Different contexts) ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.function_id) as function_count,
    COUNT(DISTINCT r.department_id) as department_count,
    COUNT(*) as total_instances,
    STRING_AGG(DISTINCT t.name, ', ') as tenant_names,
    STRING_AGG(DISTINCT f.name::text, ', ') as function_names
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT name 
      FROM public.org_roles 
      WHERE deleted_at IS NULL 
      GROUP BY name 
      HAVING COUNT(*) > 1
  )
GROUP BY r.name
HAVING COUNT(DISTINCT r.tenant_id) > 1 
    OR COUNT(DISTINCT r.function_id) > 1
    OR COUNT(DISTINCT r.department_id) > 1
ORDER BY total_instances DESC, r.name
LIMIT 50;

-- =====================================================================
-- DUPLICATES WITHIN SAME TENANT (Pharmaceuticals)
-- =====================================================================
SELECT 
    '=== DUPLICATES WITHIN PHARMACEUTICALS TENANT ===' as section;

SELECT 
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(DISTINCT r.id) as duplicate_count,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas,
    MIN(r.created_at) as oldest,
    MAX(r.created_at) as newest
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
  AND (t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%')
  AND r.name IN (
      SELECT name 
      FROM public.org_roles r2
      INNER JOIN public.tenants t2 ON r2.tenant_id = t2.id
      WHERE r2.deleted_at IS NULL
        AND (t2.slug = 'pharmaceuticals' OR t2.name ILIKE '%pharmaceutical%')
      GROUP BY name 
      HAVING COUNT(*) > 1
  )
GROUP BY r.name, r.function_id, f.name, r.department_id, d.name
HAVING COUNT(DISTINCT r.id) > 1
ORDER BY duplicate_count DESC, r.name
LIMIT 50;

-- =====================================================================
-- ROLES WITH MOST DUPLICATES
-- =====================================================================
SELECT 
    '=== TOP 20 ROLES WITH MOST DUPLICATES ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.id) as total_instances,
    COUNT(DISTINCT r.tenant_id) as unique_tenants,
    COUNT(DISTINCT r.function_id) as unique_functions,
    COUNT(DISTINCT r.department_id) as unique_departments,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas_assigned
FROM public.org_roles r
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.id) > 1
ORDER BY total_instances DESC
LIMIT 20;

-- =====================================================================
-- RECOMMENDATION: Which duplicates to merge
-- =====================================================================
SELECT 
    '=== RECOMMENDATION: Roles to Merge ===' as section;

SELECT 
    'True duplicates (same tenant/function/department)' as category,
    COUNT(*) as count
FROM (
    SELECT r.name, r.tenant_id, r.function_id, r.department_id
    FROM public.org_roles r
    WHERE r.deleted_at IS NULL
    GROUP BY r.name, r.tenant_id, r.function_id, r.department_id
    HAVING COUNT(*) > 1
) true_dups
UNION ALL
SELECT 
    'Legitimate duplicates (different contexts)',
    COUNT(DISTINCT r.name)
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT name 
      FROM public.org_roles 
      WHERE deleted_at IS NULL 
      GROUP BY name 
      HAVING COUNT(*) > 1
  )
  AND r.name NOT IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name, r2.tenant_id, r2.function_id, r2.department_id
      HAVING COUNT(*) > 1
  );

