-- =====================================================================
-- FORCE MERGE REMAINING DUPLICATE FUNCTIONS
-- More robust version that handles edge cases
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    primary_func_id uuid;
    duplicate_func_id uuid;
    dept_record RECORD;
    role_record RECORD;
    merged_count INTEGER := 0;
    dept_moved_count INTEGER := 0;
    role_moved_count INTEGER := 0;
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
    RAISE NOTICE '=== FORCE MERGING REMAINING DUPLICATES ===';
    
    -- Process each duplicate function name
    -- Note: Cast name to text for proper comparison since it's an enum
    FOR func_record IN
        SELECT 
            f.name::text as name_text,
            array_agg(f.id ORDER BY 
                (SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id) DESC,
                (SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id) DESC,
                f.created_at ASC
            ) as func_ids
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name::text
        HAVING COUNT(*) > 1
    LOOP
        -- Primary is the first one (most data, oldest)
        primary_func_id := func_record.func_ids[1];
        
        RAISE NOTICE '';
        RAISE NOTICE 'Processing: %', func_record.name_text;
        RAISE NOTICE '  Primary function ID: %', primary_func_id;
        
        -- Process each duplicate (skip the first one which is the primary)
        FOR i IN 2..array_length(func_record.func_ids, 1) LOOP
            duplicate_func_id := func_record.func_ids[i];
            
            RAISE NOTICE '  Duplicate function ID: %', duplicate_func_id;
            
            -- Move departments from duplicate to primary
            dept_moved_count := 0;
            FOR dept_record IN
                SELECT id, name
                FROM public.org_departments
                WHERE function_id = duplicate_func_id 
                AND tenant_id = pharma_tenant_id
            LOOP
                -- Check if department with same name exists in primary
                IF NOT EXISTS (
                    SELECT 1 FROM public.org_departments
                    WHERE function_id = primary_func_id
                    AND tenant_id = pharma_tenant_id
                    AND name = dept_record.name
                ) THEN
                    -- Move department to primary
                    UPDATE public.org_departments
                    SET function_id = primary_func_id
                    WHERE id = dept_record.id;
                    dept_moved_count := dept_moved_count + 1;
                ELSE
                    -- Department exists in primary, update roles to point to primary's department
                    UPDATE public.org_roles r
                    SET department_id = (
                        SELECT id FROM public.org_departments
                        WHERE function_id = primary_func_id
                        AND tenant_id = pharma_tenant_id
                        AND name = dept_record.name
                        LIMIT 1
                    )
                    WHERE r.department_id = dept_record.id
                    AND r.tenant_id = pharma_tenant_id;
                    
                    -- Delete duplicate department
                    DELETE FROM public.org_departments
                    WHERE id = dept_record.id;
                END IF;
            END LOOP;
            
            RAISE NOTICE '    Moved % departments', dept_moved_count;
            
            -- Move all roles from duplicate to primary
            role_moved_count := 0;
            FOR role_record IN
                SELECT id
                FROM public.org_roles
                WHERE function_id = duplicate_func_id 
                AND tenant_id = pharma_tenant_id
            LOOP
                UPDATE public.org_roles
                SET function_id = primary_func_id
                WHERE id = role_record.id;
                role_moved_count := role_moved_count + 1;
            END LOOP;
            
            RAISE NOTICE '    Moved % roles', role_moved_count;
            
            -- Delete duplicate function
            DELETE FROM public.org_functions
            WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
            
            merged_count := merged_count + 1;
            RAISE NOTICE '  ✅ Deleted duplicate function';
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
END $$;

COMMIT;

