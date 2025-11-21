-- =====================================================================
-- IDENTIFY ROLES DUPLICATED ACROSS TENANTS
-- Roles should be shared (tenant-agnostic), not duplicated per tenant
-- This query helps identify roles that are duplicated across tenants
-- =====================================================================

-- =====================================================================
-- ROLES DUPLICATED ACROSS MULTIPLE TENANTS
-- =====================================================================
SELECT 
    '=== ROLES DUPLICATED ACROSS TENANTS (Should be shared) ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.id) as total_role_instances,
    STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as tenant_names,
    STRING_AGG(DISTINCT t.slug, ', ' ORDER BY t.slug) as tenant_slugs,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas_assigned,
    MIN(r.created_at) as oldest_role,
    MAX(r.created_at) as newest_role
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.tenant_id) > 1
ORDER BY tenant_count DESC, total_role_instances DESC, r.name
LIMIT 50;

-- =====================================================================
-- DETAILED VIEW: All instances of roles duplicated across tenants
-- =====================================================================
SELECT 
    '=== DETAILED VIEW: Role instances across tenants ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    r.slug as role_slug,
    t.name as tenant_name,
    t.slug as tenant_slug,
    f.name::text as function_name,
    d.name as department_name,
    COALESCE(persona_counts.persona_count, 0) as personas_assigned,
    r.created_at,
    r.updated_at
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
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  )
ORDER BY r.name, t.name, f.name, d.name;

-- =====================================================================
-- ROLES THAT SHOULD BE MERGED (Same name, same function, same department, different tenants)
-- =====================================================================
SELECT 
    '=== ROLES TO MERGE (Same name/function/dept, different tenants) ===' as section;

SELECT 
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.id) as role_count,
    STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as tenant_names,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids_to_merge,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas
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
GROUP BY r.name, f.id, f.name, d.id, d.name
HAVING COUNT(DISTINCT r.tenant_id) > 1
ORDER BY role_count DESC, r.name
LIMIT 50;

-- =====================================================================
-- STATISTICS: How many roles are duplicated across tenants
-- =====================================================================
SELECT 
    '=== STATISTICS: Roles duplicated across tenants ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names_duplicated_across_tenants,
    COUNT(*) as total_role_instances_duplicated,
    COUNT(DISTINCT r.tenant_id) as tenants_involved,
    STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as all_tenant_names
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  );

-- =====================================================================
-- RECOMMENDATION: Roles that should be made tenant-agnostic
-- =====================================================================
SELECT 
    '=== RECOMMENDATION ===' as section;

SELECT 
    'Roles duplicated across tenants should be made tenant-agnostic' as recommendation,
    'Set tenant_id to NULL or a shared "VITAL System" tenant for these roles' as action,
    COUNT(DISTINCT r.name) as affected_role_names,
    COUNT(*) as total_instances_to_merge
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  );

