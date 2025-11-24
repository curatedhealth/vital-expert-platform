-- =============================================
-- Delete VITAL System Roles, Functions, Departments
-- Keep Pharmaceuticals as Canonical Set
-- =============================================

DO $$
DECLARE
    vital_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    pharma_tenant_id UUID := 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    deleted_roles INT := 0;
    deleted_depts INT := 0;
    deleted_funcs INT := 0;
BEGIN
    RAISE NOTICE '=== Cleanup: Delete VITAL System Entities ===';
    RAISE NOTICE 'VITAL System Tenant: %', vital_tenant_id;
    RAISE NOTICE 'Pharmaceuticals Tenant: % (KEEPING)', pharma_tenant_id;
    RAISE NOTICE '';

    -- STEP 1: Delete VITAL System Roles
    RAISE NOTICE '--- Step 1: Delete VITAL System Roles ---';
    
    DELETE FROM public.org_roles
    WHERE tenant_id = vital_tenant_id;
    GET DIAGNOSTICS deleted_roles = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % VITAL System roles', deleted_roles;

    -- Also delete any roles still with NULL tenant_id
    DELETE FROM public.org_roles
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS deleted_roles = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % roles with NULL tenant_id', deleted_roles;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 2: Delete VITAL System Departments ---';
    
    -- Delete VITAL System departments
    DELETE FROM public.org_departments
    WHERE tenant_id = vital_tenant_id;
    GET DIAGNOSTICS deleted_depts = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % VITAL System departments', deleted_depts;

    -- Delete departments with NULL tenant_id
    DELETE FROM public.org_departments
    WHERE tenant_id IS NULL;
    GET DIAGNOSTICS deleted_depts = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % departments with NULL tenant_id', deleted_depts;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 3: Delete VITAL System Functions ---';
    
    -- Note: Functions are typically tenant-agnostic in many systems
    -- Check if org_functions has tenant_id column first
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'org_functions' 
          AND column_name = 'tenant_id'
    ) THEN
        DELETE FROM public.org_functions
        WHERE tenant_id = vital_tenant_id;
        GET DIAGNOSTICS deleted_funcs = ROW_COUNT;
        RAISE NOTICE '✓ Deleted % VITAL System functions', deleted_funcs;

        DELETE FROM public.org_functions
        WHERE tenant_id IS NULL;
        GET DIAGNOSTICS deleted_funcs = ROW_COUNT;
        RAISE NOTICE '✓ Deleted % functions with NULL tenant_id', deleted_funcs;
    ELSE
        RAISE NOTICE '⚠ org_functions does not have tenant_id column (functions are tenant-agnostic)';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== Verification ===';
    
    -- Count remaining Pharmaceuticals entities
    SELECT COUNT(*) INTO deleted_roles
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL;
    RAISE NOTICE '✓ % active Pharmaceuticals roles remain', deleted_roles;

    SELECT COUNT(*) INTO deleted_depts
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id AND deleted_at IS NULL;
    RAISE NOTICE '✓ % active Pharmaceuticals departments remain', deleted_depts;

    -- Check for any orphaned roles (NULL tenant_id)
    SELECT COUNT(*) INTO deleted_roles
    FROM public.org_roles
    WHERE tenant_id IS NULL AND deleted_at IS NULL;
    
    IF deleted_roles > 0 THEN
        RAISE WARNING '⚠ % roles still have NULL tenant_id', deleted_roles;
    ELSE
        RAISE NOTICE '✓ No orphaned roles (all have tenant_id)';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Next step: Map Pharmaceuticals entities to multiple tenants via junction tables';
END $$;

-- Final verification: Show what remains
SELECT 
    '=== REMAINING PHARMACEUTICALS ROLES ===' as section;

SELECT 
    r.id,
    r.name as role_name,
    r.slug,
    d.name as department_name,
    f.name::text as function_name,
    r.tenant_id
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.deleted_at IS NULL
ORDER BY r.name
LIMIT 20;

SELECT 
    '=== SUMMARY ===' as section,
    COUNT(*) as total_pharma_roles
FROM public.org_roles
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

