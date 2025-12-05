-- =====================================================================
-- MERGE DUPLICATE ROLES FROM CSV DATA
-- Based on: Supabase Snippet Multi-level Tenant Foundation (3).csv
-- Strategy: Keep role with most personas, only delete roles with 0 personas
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: PREVIEW - Analyze duplicate roles from CSV data
-- =====================================================================
SELECT 
    '=== PREVIEW: Duplicate roles from CSV ===' as section;

-- This query simulates what we'd get from the CSV
-- In practice, you'd import the CSV or use the actual data
WITH csv_data AS (
    -- Sample data structure from CSV
    -- role_name, role_id, tenant_name, persona_count, tenant_id
    SELECT 
        'Accountant' as role_name,
        'ecc7524f-9dc8-43a3-be70-1c0b36f8b7c2'::uuid as role_id,
        'Digital Health Startup' as tenant_name,
        0 as persona_count,
        '11111111-1111-1111-1111-111111111111'::uuid as tenant_id
    UNION ALL
    SELECT 'Accountant', '690effe3-d652-4463-b7d8-88642a39e3ec'::uuid, 'VITAL Platform', 0, '00000000-0000-0000-0000-000000000001'::uuid
    UNION ALL
    SELECT 'Accountant', 'b5da220f-7e4e-40fe-8ada-3adc8ba6514f'::uuid, 'Pharmaceuticals', 0, 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid
    UNION ALL
    SELECT 'Accountant', 'd7f5de98-be22-4a53-8801-dc2fb5319f80'::uuid, 'Pharmaceuticals', 0, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
    -- Add more roles as needed from CSV
),
role_analysis AS (
    SELECT 
        role_name,
        role_id,
        tenant_name,
        persona_count,
        tenant_id,
        ROW_NUMBER() OVER (
            PARTITION BY role_name 
            ORDER BY 
                persona_count DESC,  -- Keep role with most personas
                role_id ASC  -- Then by ID for consistency
        ) as keep_priority
    FROM csv_data
)
SELECT 
    role_name,
    COUNT(*) as total_instances,
    COUNT(CASE WHEN keep_priority = 1 THEN 1 END) as roles_to_keep,
    COUNT(CASE WHEN keep_priority > 1 AND persona_count = 0 THEN 1 END) as roles_to_delete,
    COUNT(CASE WHEN keep_priority > 1 AND persona_count > 0 THEN 1 END) as roles_to_merge_with_personas,
    SUM(CASE WHEN keep_priority > 1 THEN persona_count ELSE 0 END) as personas_to_reassign,
    (ARRAY_AGG(role_id ORDER BY keep_priority))[1] as keep_role_id
FROM role_analysis
GROUP BY role_name
HAVING COUNT(*) > 1
ORDER BY total_instances DESC, role_name
LIMIT 20;

-- =====================================================================
-- STEP 2: ACTUAL MERGE SCRIPT (Based on actual database data)
-- This uses the actual database, not CSV, but follows CSV insights
-- =====================================================================

DO $$
DECLARE
    roles_merged INTEGER := 0;
    personas_reassigned INTEGER := 0;
    roles_deleted INTEGER := 0;
    update_count INTEGER;
BEGIN
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🔄 MERGING DUPLICATE ROLES (Safe Mode - Only delete roles without personas)';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Step 2a: Create mapping table for duplicate roles
    CREATE TEMP TABLE role_merge_mapping AS
    WITH role_groups AS (
        SELECT 
            r.name as role_name,
            r.id as role_id,
            r.tenant_id,
            r.function_id,
            r.department_id,
            r.created_at,
            COALESCE(persona_counts.persona_count, 0) as persona_count,
            ROW_NUMBER() OVER (
                PARTITION BY r.name 
                ORDER BY 
                    COALESCE(persona_counts.persona_count, 0) DESC,  -- Keep role with most personas
                    r.created_at ASC,  -- Then oldest
                    r.id ASC
            ) as keep_priority
        FROM public.org_roles r
        LEFT JOIN (
            SELECT role_id, COUNT(*) as persona_count
            FROM public.personas
            WHERE deleted_at IS NULL
            GROUP BY role_id
        ) persona_counts ON persona_counts.role_id = r.id
        WHERE r.deleted_at IS NULL
          AND r.name IN (
              -- Find roles that exist in multiple tenants
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
        merge_role.role_name,
        merge_role.persona_count,
        merge_role.keep_priority,
        merge_role.tenant_id as source_tenant_id
    FROM role_groups merge_role
    INNER JOIN role_groups keep_role 
        ON merge_role.role_name = keep_role.role_name
        AND keep_role.keep_priority = 1
    WHERE merge_role.keep_priority > 1;

    RAISE NOTICE 'Created merge mapping for % duplicate roles', (SELECT COUNT(*) FROM role_merge_mapping);
    RAISE NOTICE '';

    -- Step 2b: Reassign personas from duplicate roles to the kept role
    RAISE NOTICE 'Step 1: Reassigning personas...';
    UPDATE public.personas p
    SET 
        role_id = mapping.target_role_id,
        updated_at = NOW()
    FROM role_merge_mapping mapping
    WHERE p.role_id = mapping.source_role_id
      AND p.deleted_at IS NULL
      AND mapping.persona_count > 0;  -- Only reassign if source role has personas

    GET DIAGNOSTICS update_count = ROW_COUNT;
    personas_reassigned := update_count;
    RAISE NOTICE '  ✅ Reassigned % personas to kept roles', personas_reassigned;
    RAISE NOTICE '';

    -- Step 2c: Update the kept role to be tenant-agnostic (set tenant_id to NULL)
    -- This allows the role to be shared across tenants
    RAISE NOTICE 'Step 2: Making kept roles tenant-agnostic...';
    UPDATE public.org_roles r
    SET 
        tenant_id = NULL,  -- Make tenant-agnostic
        updated_at = NOW()
    WHERE r.id IN (
        SELECT DISTINCT target_role_id 
        FROM role_merge_mapping
    )
    AND r.tenant_id IS NOT NULL;  -- Only update if not already NULL

    GET DIAGNOSTICS update_count = ROW_COUNT;
    roles_merged := update_count;
    RAISE NOTICE '  ✅ Made % roles tenant-agnostic', roles_merged;
    RAISE NOTICE '';

    -- Step 2d: Soft delete ONLY roles without personas
    RAISE NOTICE 'Step 3: Deleting duplicate roles WITHOUT personas...';
    UPDATE public.org_roles r
    SET 
        deleted_at = NOW(),
        updated_at = NOW()
    FROM role_merge_mapping mapping
    WHERE r.id = mapping.source_role_id
      AND mapping.persona_count = 0  -- ONLY delete roles with no personas
      AND r.deleted_at IS NULL;  -- Only if not already deleted

    GET DIAGNOSTICS update_count = ROW_COUNT;
    roles_deleted := update_count;
    RAISE NOTICE '  ✅ Soft deleted % duplicate roles (without personas)', roles_deleted;
    RAISE NOTICE '';

    -- Step 2e: Report roles that still exist (have personas, so not deleted)
    RAISE NOTICE 'Step 4: Reporting roles kept (have personas)...';
    SELECT COUNT(*) INTO update_count
    FROM role_merge_mapping
    WHERE persona_count > 0
      AND source_role_id IN (
          SELECT id FROM public.org_roles WHERE deleted_at IS NULL
      );

    RAISE NOTICE '  ⚠️  % duplicate roles kept (have personas assigned)', update_count;
    RAISE NOTICE '';

    -- Clean up
    DROP TABLE role_merge_mapping;

    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MERGE COMPLETE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Personas reassigned: %', personas_reassigned;
    RAISE NOTICE 'Roles made tenant-agnostic: %', roles_merged;
    RAISE NOTICE 'Duplicate roles deleted (no personas): %', roles_deleted;
    RAISE NOTICE '';

END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION: After merge
-- =====================================================================
SELECT 
    '=== VERIFICATION: Check results after merge ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names,
    COUNT(*) as total_roles,
    COUNT(DISTINCT r.tenant_id) as unique_tenants,
    COUNT(CASE WHEN r.tenant_id IS NULL THEN 1 END) as tenant_agnostic_roles,
    COUNT(CASE WHEN r.deleted_at IS NOT NULL THEN 1 END) as deleted_roles
FROM public.org_roles r;

-- Check for remaining duplicates across tenants
SELECT 
    '=== Remaining duplicates across tenants ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.id) as role_count,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas
FROM public.org_roles r
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id IS NOT NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.tenant_id) > 1
ORDER BY tenant_count DESC, role_count DESC
LIMIT 20;

-- Show roles that were kept because they have personas
SELECT 
    '=== Roles kept (have personas, not deleted) ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    t.name as tenant_name,
    COALESCE(persona_counts.persona_count, 0) as persona_count,
    r.tenant_id
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
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
  AND r.tenant_id IS NOT NULL  -- Still has tenant (not made tenant-agnostic yet)
ORDER BY r.name, persona_count DESC
LIMIT 50;

