-- =====================================================================
-- MERGE DUPLICATE ROLES ACROSS TENANTS
-- Makes roles tenant-agnostic by merging duplicates and reassigning personas
-- =====================================================================

-- =====================================================================
-- STEP 1: PREVIEW - See what will be merged
-- =====================================================================
SELECT 
    '=== PREVIEW: Roles to be merged ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.id) as role_instances,
    STRING_AGG(DISTINCT t.name, ', ' ORDER BY t.name) as tenant_names,
    STRING_AGG(r.id::text, ', ' ORDER BY r.created_at) as role_ids,
    MIN(r.created_at) as oldest_role,
    MAX(r.created_at) as newest_role,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas_to_reassign
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
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
GROUP BY r.name
ORDER BY role_instances DESC, r.name
LIMIT 20;

-- =====================================================================
-- STEP 2: STRATEGY - Keep the oldest role, merge others into it
-- =====================================================================
-- This creates a mapping table showing which roles should be merged into which
SELECT 
    '=== MERGE STRATEGY: Keep oldest role, merge others ===' as section;

WITH role_groups AS (
    SELECT 
        r.name as role_name,
        r.id as role_id,
        r.tenant_id,
        r.function_id,
        r.department_id,
        r.created_at,
        ROW_NUMBER() OVER (
            PARTITION BY r.name 
            ORDER BY r.created_at ASC, r.id ASC
        ) as keep_priority
    FROM public.org_roles r
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
    CASE WHEN keep_priority = 1 THEN role_id END as keep_role_id,
    CASE WHEN keep_priority > 1 THEN role_id END as merge_role_id,
    keep_priority
FROM role_groups
ORDER BY role_name, keep_priority
LIMIT 50;

-- =====================================================================
-- STEP 3: ACTUAL MERGE SCRIPT (Commented out for safety)
-- =====================================================================
-- Uncomment and run this section to actually perform the merge
-- WARNING: This will modify your database. Review the preview first!

/*
BEGIN;

-- Step 3a: Create a mapping of roles to merge
CREATE TEMP TABLE role_merge_mapping AS
WITH role_groups AS (
    SELECT 
        r.name as role_name,
        r.id as role_id,
        r.tenant_id,
        r.function_id,
        r.department_id,
        r.created_at,
        ROW_NUMBER() OVER (
            PARTITION BY r.name 
            ORDER BY r.created_at ASC, r.id ASC
        ) as keep_priority
    FROM public.org_roles r
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
    merge_role.role_id as source_role_id,
    keep_role.role_id as target_role_id,
    merge_role.role_name
FROM role_groups merge_role
INNER JOIN role_groups keep_role 
    ON merge_role.role_name = keep_role.role_name
    AND keep_role.keep_priority = 1
WHERE merge_role.keep_priority > 1;

-- Step 3b: Reassign personas from duplicate roles to the kept role
UPDATE public.personas p
SET 
    role_id = mapping.target_role_id,
    updated_at = NOW()
FROM role_merge_mapping mapping
WHERE p.role_id = mapping.source_role_id
  AND p.deleted_at IS NULL;

-- Step 3c: Update the kept role to be tenant-agnostic (set tenant_id to NULL)
-- OR set it to a VITAL System tenant if you have one
UPDATE public.org_roles r
SET 
    tenant_id = NULL,  -- Make tenant-agnostic
    -- OR use: tenant_id = (SELECT id FROM tenants WHERE slug = 'vital-system' LIMIT 1),
    updated_at = NOW()
FROM role_merge_mapping mapping
WHERE r.id = mapping.target_role_id;

-- Step 3d: Soft delete the duplicate roles
UPDATE public.org_roles r
SET 
    deleted_at = NOW(),
    updated_at = NOW()
FROM role_merge_mapping mapping
WHERE r.id = mapping.source_role_id;

-- Clean up
DROP TABLE role_merge_mapping;

COMMIT;
*/

-- =====================================================================
-- ALTERNATIVE: Make all duplicate roles tenant-agnostic without merging
-- =====================================================================
-- This approach keeps all roles but makes them tenant-agnostic
-- Uncomment to use this approach instead

/*
BEGIN;

-- Set tenant_id to NULL for all roles that are duplicated across tenants
UPDATE public.org_roles r
SET 
    tenant_id = NULL,  -- Make tenant-agnostic
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.name IN (
      SELECT r2.name
      FROM public.org_roles r2
      WHERE r2.deleted_at IS NULL
      GROUP BY r2.name
      HAVING COUNT(DISTINCT r2.tenant_id) > 1
  );

COMMIT;
*/

-- =====================================================================
-- VERIFICATION: After merge
-- =====================================================================
SELECT 
    '=== VERIFICATION: Check results after merge ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names,
    COUNT(*) as total_roles,
    COUNT(DISTINCT r.tenant_id) as unique_tenants,
    COUNT(CASE WHEN r.tenant_id IS NULL THEN 1 END) as tenant_agnostic_roles
FROM public.org_roles r
WHERE r.deleted_at IS NULL;

-- Check for remaining duplicates
SELECT 
    '=== Remaining duplicates across tenants ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.tenant_id IS NOT NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.tenant_id) > 1
ORDER BY tenant_count DESC
LIMIT 20;

