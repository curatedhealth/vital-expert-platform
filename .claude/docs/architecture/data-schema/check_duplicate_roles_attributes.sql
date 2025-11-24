-- =====================================================================
-- CHECK DUPLICATE ROLES FOR DIFFERENT ATTRIBUTES
-- Investigates if duplicate roles have different attributes (global, regional, local, etc.)
-- =====================================================================

-- =====================================================================
-- FIRST: Check what columns exist in org_roles table
-- =====================================================================
SELECT 
    '=== ORG_ROLES TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'org_roles'
ORDER BY ordinal_position;

-- =====================================================================
-- Check for attributes in name, slug, or other text fields
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES: Check for Global/Regional/Local in names ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.id) as instance_count,
    STRING_AGG(DISTINCT r.name, ' | ') as all_name_variations,
    STRING_AGG(DISTINCT r.slug, ' | ') as all_slug_variations,
    COUNT(DISTINCT CASE WHEN r.name ILIKE '%global%' THEN 1 END) as has_global,
    COUNT(DISTINCT CASE WHEN r.name ILIKE '%regional%' THEN 1 END) as has_regional,
    COUNT(DISTINCT CASE WHEN r.name ILIKE '%local%' THEN 1 END) as has_local,
    COUNT(DISTINCT CASE WHEN r.name ILIKE '%national%' THEN 1 END) as has_national,
    COUNT(DISTINCT CASE WHEN r.slug ILIKE '%global%' THEN 1 END) as slug_has_global,
    COUNT(DISTINCT CASE WHEN r.slug ILIKE '%regional%' THEN 1 END) as slug_has_regional,
    COUNT(DISTINCT CASE WHEN r.slug ILIKE '%local%' THEN 1 END) as slug_has_local
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  )
GROUP BY r.name
HAVING COUNT(DISTINCT r.id) > 1
ORDER BY instance_count DESC, r.name
LIMIT 50;

-- =====================================================================
-- DETAILED: Show all instances of duplicate roles with their attributes
-- =====================================================================
SELECT 
    '=== DETAILED: All instances of duplicate roles ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    r.slug as role_slug,
    t.name as tenant_name,
    f.name::text as function_name,
    d.name as department_name,
    r.is_active,
    r.created_at,
    r.updated_at,
    -- Check if name or slug contains geographic/scope indicators
    CASE 
        WHEN r.name ILIKE '%global%' OR r.slug ILIKE '%global%' THEN 'Global'
        WHEN r.name ILIKE '%regional%' OR r.slug ILIKE '%regional%' THEN 'Regional'
        WHEN r.name ILIKE '%local%' OR r.slug ILIKE '%local%' THEN 'Local'
        WHEN r.name ILIKE '%national%' OR r.slug ILIKE '%national%' THEN 'National'
        ELSE 'Not specified'
    END as scope_indicator,
    COALESCE(persona_counts.persona_count, 0) as personas_assigned
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
ORDER BY r.name, t.name, r.created_at
LIMIT 100;

-- =====================================================================
-- Check for roles with same base name but different scopes
-- =====================================================================
SELECT 
    '=== ROLES WITH SAME BASE NAME BUT DIFFERENT SCOPES ===' as section;

WITH role_scopes AS (
    SELECT 
        r.name as role_name,
        r.id as role_id,
        r.slug,
        t.name as tenant_name,
        COALESCE(
            r.geographic_scope_type::text,
            CASE 
                WHEN r.name ILIKE '%global%' OR r.slug ILIKE '%global%' THEN 'Global'
                WHEN r.name ILIKE '%regional%' OR r.slug ILIKE '%regional%' THEN 'Regional'
                WHEN r.name ILIKE '%local%' OR r.slug ILIKE '%local%' THEN 'Local'
                WHEN r.name ILIKE '%national%' OR r.slug ILIKE '%national%' THEN 'National'
                ELSE 'Standard'
            END
        ) as scope
    FROM public.org_roles r
    INNER JOIN public.tenants t ON r.tenant_id = t.id
    WHERE r.deleted_at IS NULL
      AND r.name IN (
          SELECT r2.name
          FROM public.org_roles r2
          WHERE r2.deleted_at IS NULL
          GROUP BY r2.name
          HAVING COUNT(DISTINCT r2.tenant_id) > 1
      )
)
SELECT 
    role_name,
    COUNT(DISTINCT scope) as different_scopes_count,
    STRING_AGG(DISTINCT scope, ', ' ORDER BY scope) as scopes_found,
    COUNT(DISTINCT role_id) as total_instances
FROM role_scopes
GROUP BY role_name
HAVING COUNT(DISTINCT scope) > 1
ORDER BY different_scopes_count DESC, role_name
LIMIT 50;

-- =====================================================================
-- Check geographic_scope_type column (if it exists)
-- =====================================================================
SELECT 
    '=== CHECK GEOGRAPHIC SCOPE TYPE ===' as section;

-- Check if geographic_scope_type column exists and show values
SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.id) as instance_count,
    COUNT(DISTINCT r.geographic_scope_type) as different_scopes,
    (
        SELECT STRING_AGG(scope_val::text, ', ' ORDER BY scope_val)
        FROM (
            SELECT DISTINCT r2.geographic_scope_type as scope_val
            FROM public.org_roles r2
            WHERE r2.name = r.name
              AND r2.deleted_at IS NULL
        ) distinct_scopes
    ) as scope_types,
    (
        SELECT STRING_AGG(tenant_val, ', ' ORDER BY tenant_val)
        FROM (
            SELECT DISTINCT t2.name as tenant_val
            FROM public.org_roles r2
            INNER JOIN public.tenants t2 ON r2.tenant_id = t2.id
            WHERE r2.name = r.name
              AND r2.deleted_at IS NULL
        ) distinct_tenants
    ) as tenant_names
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  )
GROUP BY r.name
HAVING COUNT(DISTINCT r.geographic_scope_type) > 1
ORDER BY different_scopes DESC, r.name
LIMIT 50;

-- =====================================================================
-- DETAILED: Duplicate roles with different geographic scopes
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES WITH DIFFERENT GEOGRAPHIC SCOPES ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    r.slug,
    t.name as tenant_name,
    r.geographic_scope_type,
    r.geographic_primary_region,
    f.name::text as function_name,
    d.name as department_name,
    COALESCE(persona_counts.persona_count, 0) as personas_assigned
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
        AND COUNT(DISTINCT r2.geographic_scope_type) > 1
  )
ORDER BY r.name, r.geographic_scope_type, t.name
LIMIT 100;

-- =====================================================================
-- Summary: How many duplicates have different attributes
-- =====================================================================
SELECT 
    '=== SUMMARY: Duplicates with different attributes ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as total_duplicate_role_names,
    COUNT(DISTINCT CASE 
        WHEN r.name ILIKE '%global%' OR r.name ILIKE '%regional%' OR r.name ILIKE '%local%' 
        OR r.slug ILIKE '%global%' OR r.slug ILIKE '%regional%' OR r.slug ILIKE '%local%'
        THEN r.name 
    END) as roles_with_scope_indicators,
    COUNT(DISTINCT CASE 
        WHEN r.function_id IS DISTINCT FROM (
            SELECT r2.function_id 
            FROM public.org_roles r2 
            WHERE r2.name = r.name 
              AND r2.deleted_at IS NULL 
            LIMIT 1
        ) THEN r.name
    END) as roles_with_different_functions,
    COUNT(DISTINCT CASE 
        WHEN r.department_id IS DISTINCT FROM (
            SELECT r2.department_id 
            FROM public.org_roles r2 
            WHERE r2.name = r.name 
              AND r2.deleted_at IS NULL 
            LIMIT 1
        ) THEN r.name
    END) as roles_with_different_departments
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  );

