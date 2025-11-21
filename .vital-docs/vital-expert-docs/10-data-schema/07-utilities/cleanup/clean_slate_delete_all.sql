-- =============================================
-- CLEAN SLATE: Delete All Functions, Departments, Roles
-- Start fresh for multi-tenant architecture
-- =============================================

DO $$
DECLARE
    deleted_personas INT := 0;
    deleted_roles INT := 0;
    deleted_departments INT := 0;
    deleted_functions INT := 0;
BEGIN
    RAISE NOTICE '=== CLEAN SLATE: Deleting All Organizational Entities ===';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  This will delete ALL functions, departments, and roles';
    RAISE NOTICE '⚠️  Personas will also be deleted (cascade)';
    RAISE NOTICE '';

    -- STEP 1: Delete junction table data first (if they exist)
    RAISE NOTICE '--- Step 1: Clearing Junction Tables (if exist) ---';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_tenants') THEN
        DELETE FROM public.role_tenants;
        RAISE NOTICE '✓ Cleared role_tenants';
    ELSE
        RAISE NOTICE '⊘ role_tenants does not exist (skipping)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'department_tenants') THEN
        DELETE FROM public.department_tenants;
        RAISE NOTICE '✓ Cleared department_tenants';
    ELSE
        RAISE NOTICE '⊘ department_tenants does not exist (skipping)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'function_tenants') THEN
        DELETE FROM public.function_tenants;
        RAISE NOTICE '✓ Cleared function_tenants';
    ELSE
        RAISE NOTICE '⊘ function_tenants does not exist (skipping)';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 2: Deleting Personas ---';
    
    -- Delete all personas (these reference roles)
    DELETE FROM public.personas;
    GET DIAGNOSTICS deleted_personas = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % personas', deleted_personas;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 3: Deleting Roles ---';
    
    -- Delete all roles
    DELETE FROM public.org_roles;
    GET DIAGNOSTICS deleted_roles = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % roles', deleted_roles;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 4: Deleting Departments ---';
    
    -- Delete all departments
    DELETE FROM public.org_departments;
    GET DIAGNOSTICS deleted_departments = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % departments', deleted_departments;

    RAISE NOTICE '';
    RAISE NOTICE '--- Step 5: Deleting Functions ---';
    
    -- Delete all functions
    DELETE FROM public.org_functions;
    GET DIAGNOSTICS deleted_functions = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % functions', deleted_functions;

    RAISE NOTICE '';
    RAISE NOTICE '=== CLEAN SLATE COMPLETE ===';
    RAISE NOTICE 'Total deleted:';
    RAISE NOTICE '  - % functions', deleted_functions;
    RAISE NOTICE '  - % departments', deleted_departments;
    RAISE NOTICE '  - % roles', deleted_roles;
    RAISE NOTICE '  - % personas', deleted_personas;
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to rebuild organizational structure!';
END $$;

-- Verification: Confirm everything is deleted
SELECT '=== VERIFICATION: All Counts Should Be Zero ===' as section;

SELECT 
    'Functions' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as soft_deleted_count
FROM public.org_functions
UNION ALL
SELECT 
    'Departments' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as soft_deleted_count
FROM public.org_departments
UNION ALL
SELECT 
    'Roles' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as soft_deleted_count
FROM public.org_roles
UNION ALL
SELECT 
    'Personas' as entity_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as soft_deleted_count
FROM public.personas;

-- Check junction tables (if they exist)
SELECT '=== JUNCTION TABLES (checking if they exist) ===' as section;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'function_tenants') THEN
        RAISE NOTICE '✓ function_tenants exists';
    ELSE
        RAISE NOTICE '⊘ function_tenants does not exist (will be created by multi-tenant script)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'department_tenants') THEN
        RAISE NOTICE '✓ department_tenants exists';
    ELSE
        RAISE NOTICE '⊘ department_tenants does not exist (will be created by multi-tenant script)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_tenants') THEN
        RAISE NOTICE '✓ role_tenants exists';
    ELSE
        RAISE NOTICE '⊘ role_tenants does not exist (will be created by multi-tenant script)';
    END IF;
END $$;

