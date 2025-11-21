-- =====================================================================
-- MERGE REMAINING DUPLICATE FUNCTIONS
-- Finishes the consolidation by merging remaining duplicates
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    primary_func_id uuid;
    duplicate_func_id uuid;
    dept_count_primary INTEGER;
    dept_count_duplicate INTEGER;
    role_count_primary INTEGER;
    role_count_duplicate INTEGER;
    merged_count INTEGER := 0;
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== MERGING REMAINING DUPLICATES ===';
    
    -- Merge remaining duplicates
    FOR func_record IN
        SELECT 
            f.name,
            array_agg(f.id ORDER BY 
                (SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id) DESC,
                (SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id) DESC,
                f.created_at DESC
            ) as func_ids
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name
        HAVING COUNT(*) > 1
    LOOP
        -- Primary is the first one (most data)
        primary_func_id := func_record.func_ids[1];
        
        -- Get counts for primary
        SELECT COUNT(*) INTO dept_count_primary
        FROM public.org_departments
        WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id;
        
        SELECT COUNT(*) INTO role_count_primary
        FROM public.org_roles
        WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id;
        
        RAISE NOTICE 'Merging duplicates for: %', func_record.name;
        RAISE NOTICE '  Primary function ID: % (% departments, % roles)', 
            primary_func_id, dept_count_primary, role_count_primary;
        
        -- Process each duplicate (skip the first one which is the primary)
        FOR i IN 2..array_length(func_record.func_ids, 1) LOOP
            duplicate_func_id := func_record.func_ids[i];
            
            SELECT COUNT(*) INTO dept_count_duplicate
            FROM public.org_departments
            WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            SELECT COUNT(*) INTO role_count_duplicate
            FROM public.org_roles
            WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            RAISE NOTICE '  Merging duplicate ID: % (% departments, % roles)', 
                duplicate_func_id, dept_count_duplicate, role_count_duplicate;
            
            -- Move departments from duplicate to primary
            UPDATE public.org_departments
            SET function_id = primary_func_id
            WHERE function_id = duplicate_func_id 
            AND tenant_id = pharma_tenant_id
            AND NOT EXISTS (
                -- Avoid duplicates: don't move if department with same name already exists in primary
                SELECT 1 FROM public.org_departments d2
                WHERE d2.function_id = primary_func_id
                AND d2.tenant_id = pharma_tenant_id
                AND d2.name = org_departments.name
            );
            
            -- Move roles from duplicate to primary
            UPDATE public.org_roles
            SET function_id = primary_func_id
            WHERE function_id = duplicate_func_id 
            AND tenant_id = pharma_tenant_id;
            
            -- Update roles' department_id if department was moved
            UPDATE public.org_roles r
            SET department_id = d_new.id
            FROM public.org_departments d_old, public.org_departments d_new
            WHERE r.department_id = d_old.id
            AND d_old.function_id = duplicate_func_id
            AND d_new.function_id = primary_func_id
            AND d_new.tenant_id = pharma_tenant_id
            AND d_old.name = d_new.name
            AND r.tenant_id = pharma_tenant_id;
            
            -- Delete duplicate function
            DELETE FROM public.org_functions
            WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            merged_count := merged_count + 1;
            RAISE NOTICE '  ✅ Merged and deleted duplicate';
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
END $$;

COMMIT;

