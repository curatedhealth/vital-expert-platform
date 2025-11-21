-- =====================================================================
-- CLEAN SLATE: REMOVE ALL DIGITAL HEALTH ORG-STRUCTURE DATA
-- Deletes all functions and departments for Digital Health tenant
-- NOTE: Roles are preserved - they will be orphaned and can be reassigned later
-- =====================================================================

BEGIN;

DO $$
DECLARE
    digital_health_tenant_id uuid;
    depts_deleted INTEGER := 0;
    funcs_deleted INTEGER := 0;
    jtbd_updated INTEGER := 0;
    roles_updated INTEGER := 0;
BEGIN
    -- Get Digital Health tenant ID
    SELECT id INTO digital_health_tenant_id
    FROM public.tenants
    WHERE slug = 'digital-health-startup' 
       OR slug = 'digital-health'
       OR name ILIKE '%digital health%'
    LIMIT 1;
    
    IF digital_health_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Digital Health tenant not found';
    END IF;
    
    RAISE NOTICE 'Digital Health Tenant ID: %', digital_health_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== CLEANING SLATE: REMOVING FUNCTIONS AND DEPARTMENTS ===';
    RAISE NOTICE 'NOTE: Roles are preserved and will be orphaned (can be reassigned later)';
    RAISE NOTICE '';
    
    -- Step 1: Handle foreign key constraint from jobs_to_be_done
    RAISE NOTICE 'Step 1: Clearing org_function_id references in jobs_to_be_done...';
    UPDATE public.jobs_to_be_done
    SET org_function_id = NULL
    WHERE org_function_id IN (
        SELECT id FROM public.org_functions
        WHERE tenant_id = digital_health_tenant_id
    );
    GET DIAGNOSTICS jtbd_updated = ROW_COUNT;
    RAISE NOTICE '  ✅ Updated % jobs_to_be_done records (set org_function_id to NULL)', jtbd_updated;
    
    -- Step 2: Delete all departments (must be before functions due to foreign keys)
    RAISE NOTICE 'Step 2: Deleting all departments...';
    DELETE FROM public.org_departments
    WHERE tenant_id = digital_health_tenant_id;
    GET DIAGNOSTICS depts_deleted = ROW_COUNT;
    RAISE NOTICE '  ✅ Deleted % departments', depts_deleted;
    
    -- Step 3: Update roles to remove function_id and department_id references
    RAISE NOTICE 'Step 3: Clearing function_id and department_id from roles...';
    UPDATE public.org_roles
    SET function_id = NULL,
        department_id = NULL
    WHERE tenant_id = digital_health_tenant_id;
    GET DIAGNOSTICS roles_updated = ROW_COUNT;
    RAISE NOTICE '  ✅ Updated % roles (cleared function_id and department_id)', roles_updated;
    
    -- Step 4: Delete all functions
    RAISE NOTICE 'Step 4: Deleting all functions...';
    DELETE FROM public.org_functions
    WHERE tenant_id = digital_health_tenant_id;
    GET DIAGNOSTICS funcs_deleted = ROW_COUNT;
    RAISE NOTICE '  ✅ Deleted % functions', funcs_deleted;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== CLEAN SLATE COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Jobs to be done updated: %', jtbd_updated;
    RAISE NOTICE '  - Departments deleted: %', depts_deleted;
    RAISE NOTICE '  - Roles updated (function/department cleared): %', roles_updated;
    RAISE NOTICE '  - Functions deleted: %', funcs_deleted;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Digital Health tenant functions and departments are now clean';
    RAISE NOTICE '   Roles are preserved but orphaned (function_id and department_id cleared)';
END $$;

COMMIT;

