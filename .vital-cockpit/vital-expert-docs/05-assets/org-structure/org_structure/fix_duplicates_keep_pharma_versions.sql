-- =====================================================================
-- FIX DUPLICATES: KEEP NON-PHARMA VERSIONS, MERGE PHARMA DATA
-- Strategy: Keep functions WITHOUT -pharma slugs (clean slugs),
--           merge data from -pharma versions into them,
--           then delete -pharma versions
-- Examples: medical-affairs-pharma-236b447c -> merge into medical-affairs
--           operations-pharma-54a89a9e -> merge into operations
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    pharma_func_id uuid;
    non_pharma_func_id uuid;
    dept_record RECORD;
    merged_count INTEGER := 0;
    dept_moved_count INTEGER := 0;
    role_moved_count INTEGER := 0;
    clean_slug TEXT;
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
    RAISE NOTICE '=== FIXING DUPLICATES: KEEP NON-PHARMA VERSIONS ===';
    
    -- Process each duplicate function name
    FOR func_record IN
        SELECT 
            f.name::text as function_name,
            array_agg(f.id ORDER BY 
                CASE WHEN f.slug LIKE '%-pharma%' THEN 1 ELSE 0 END,  -- non-pharma first
                (SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id) DESC,
                (SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id) DESC
            ) as func_ids,
            array_agg(f.slug ORDER BY 
                CASE WHEN f.slug LIKE '%-pharma%' THEN 1 ELSE 0 END
            ) as slugs
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name::text
        HAVING COUNT(*) > 1
    LOOP
        -- First ID should be the NON-pharma version (clean slug)
        pharma_func_id := func_record.func_ids[1];  -- This is actually the non-pharma version we're keeping
        
        RAISE NOTICE '';
        RAISE NOTICE 'Processing: %', func_record.function_name;
        RAISE NOTICE '  Keeping non-pharma function ID: % (slug: %)', pharma_func_id, func_record.slugs[1];
        
        -- Process each pharma duplicate (skip the first one which is the non-pharma version we're keeping)
        FOR i IN 2..array_length(func_record.func_ids, 1) LOOP
            non_pharma_func_id := func_record.func_ids[i];  -- This is actually the pharma version we're merging
            
            RAISE NOTICE '  Merging pharma function ID: % (slug: %) into non-pharma version', non_pharma_func_id, func_record.slugs[i];
            
            -- Move departments from pharma to non-pharma
            dept_moved_count := 0;
            FOR dept_record IN
                SELECT id, name
                FROM public.org_departments
                WHERE function_id = non_pharma_func_id 
                AND tenant_id = pharma_tenant_id
            LOOP
                -- Check if department with same name exists in non-pharma version
                IF NOT EXISTS (
                    SELECT 1 FROM public.org_departments
                    WHERE function_id = pharma_func_id
                    AND tenant_id = pharma_tenant_id
                    AND name = dept_record.name
                ) THEN
                    -- Move department to non-pharma version
                    UPDATE public.org_departments
                    SET function_id = pharma_func_id
                    WHERE id = dept_record.id;
                    dept_moved_count := dept_moved_count + 1;
                ELSE
                    -- Department exists in non-pharma version, update roles to point to non-pharma's department
                    UPDATE public.org_roles r
                    SET department_id = (
                        SELECT id FROM public.org_departments
                        WHERE function_id = pharma_func_id
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
            
            -- Move all roles from pharma to non-pharma
            UPDATE public.org_roles
            SET function_id = pharma_func_id
            WHERE function_id = non_pharma_func_id 
            AND tenant_id = pharma_tenant_id;
            GET DIAGNOSTICS role_moved_count = ROW_COUNT;
            
            RAISE NOTICE '    Moved % roles', role_moved_count;
            
            -- Delete pharma function
            DELETE FROM public.org_functions
            WHERE id = non_pharma_func_id AND tenant_id = pharma_tenant_id;
            
            merged_count := merged_count + 1;
            RAISE NOTICE '  ✅ Deleted pharma function: %', func_record.slugs[i];
        END LOOP;
    END LOOP;
    
    -- Also handle functions that don't have -pharma but should be updated
    -- (like Commercial Organization, Finance & Accounting, etc. that have old slugs)
    RAISE NOTICE '';
    RAISE NOTICE '=== UPDATING SLUGS FOR RENAMED FUNCTIONS ===';
    
    -- Update slugs for functions that were renamed but still have old slugs
    -- Generate clean slugs from function names
    UPDATE public.org_functions
    SET slug = lower(regexp_replace(name::text, '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE tenant_id = pharma_tenant_id
    AND slug != lower(regexp_replace(name::text, '[^a-zA-Z0-9]+', '-', 'g'))
    AND slug NOT LIKE '%-pharma%'  -- Don't update -pharma slugs (they're being deleted above)
    AND name::text IN (
        'Commercial Organization',
        'Finance & Accounting',
        'Human Resources',
        'Information Technology (IT) / Digital',
        'Legal & Compliance',
        'Manufacturing & Supply Chain',
        'Regulatory Affairs',
        'Research & Development (R&D)'
    );
    
    GET DIAGNOSTICS merged_count = ROW_COUNT;
    IF merged_count > 0 THEN
        RAISE NOTICE 'Updated % function slugs to clean versions', merged_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
END $$;

COMMIT;

