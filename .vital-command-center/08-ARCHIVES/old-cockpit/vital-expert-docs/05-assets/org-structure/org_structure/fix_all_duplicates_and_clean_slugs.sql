-- =====================================================================
-- FIX ALL DUPLICATES AND CLEAN SLUGS
-- 1. Ensure all functions are mapped to Pharmaceuticals tenant
-- 2. Replace all -pharma functions with corresponding non-pharma versions
-- 3. Clean all slugs and names (remove -pharma, digits, unwanted patterns)
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    keep_func_id uuid;
    merge_func_id uuid;
    dept_record RECORD;
    merged_count INTEGER := 0;
    dept_moved_count INTEGER := 0;
    role_moved_count INTEGER := 0;
    cleaned_count INTEGER := 0;
    clean_slug TEXT;
    wrong_tenant_count INTEGER;
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
    RAISE NOTICE '=== STEP 1: VERIFY ALL FUNCTIONS ARE MAPPED TO PHARMA TENANT ===';
    
    -- Verify all functions are mapped to pharma tenant (don't update, just check)
    SELECT COUNT(*) INTO wrong_tenant_count
    FROM public.org_functions f
    WHERE f.tenant_id != pharma_tenant_id
    AND f.name::text IN (
        SELECT DISTINCT name::text FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
    );
    
    IF wrong_tenant_count > 0 THEN
        RAISE NOTICE '⚠️  Warning: % functions are not mapped to Pharmaceuticals tenant', wrong_tenant_count;
        RAISE NOTICE '   These will be handled separately if needed';
    ELSE
        RAISE NOTICE '✅ All functions are mapped to Pharmaceuticals tenant';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: MERGE -PHARMA FUNCTIONS INTO NON-PHARMA VERSIONS ===';
    
    -- Process each duplicate function name
    FOR func_record IN
        SELECT 
            f.name::text as function_name,
            array_agg(f.id ORDER BY 
                CASE WHEN f.slug LIKE '%-pharma%' THEN 1 ELSE 0 END,  -- non-pharma first
                (SELECT COUNT(*) FROM public.org_departments d WHERE d.function_id = f.id AND d.tenant_id = f.tenant_id) DESC,
                (SELECT COUNT(*) FROM public.org_roles r WHERE r.function_id = f.id AND r.tenant_id = f.tenant_id) DESC,
                f.created_at ASC
            ) as func_ids,
            array_agg(f.slug ORDER BY 
                CASE WHEN f.slug LIKE '%-pharma%' THEN 1 ELSE 0 END
            ) as slugs
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name::text
        HAVING COUNT(*) > 1
    LOOP
        -- First ID is the non-pharma version we're keeping
        keep_func_id := func_record.func_ids[1];
        
        RAISE NOTICE '';
        RAISE NOTICE 'Processing: %', func_record.function_name;
        RAISE NOTICE '  Keeping function ID: % (slug: %)', keep_func_id, func_record.slugs[1];
        
        -- Process each pharma duplicate (skip the first one which is the non-pharma version)
        FOR i IN 2..array_length(func_record.func_ids, 1) LOOP
            merge_func_id := func_record.func_ids[i];
            
            RAISE NOTICE '  Merging pharma function ID: % (slug: %)', merge_func_id, func_record.slugs[i];
            
            -- Move departments from pharma to non-pharma
            dept_moved_count := 0;
            FOR dept_record IN
                SELECT id, name
                FROM public.org_departments
                WHERE function_id = merge_func_id 
                AND tenant_id = pharma_tenant_id
            LOOP
                -- Check if department with same name exists in non-pharma version
                IF NOT EXISTS (
                    SELECT 1 FROM public.org_departments
                    WHERE function_id = keep_func_id
                    AND tenant_id = pharma_tenant_id
                    AND name = dept_record.name
                ) THEN
                    -- Move department to non-pharma version
                    UPDATE public.org_departments
                    SET function_id = keep_func_id
                    WHERE id = dept_record.id;
                    dept_moved_count := dept_moved_count + 1;
                ELSE
                    -- Department exists, update roles to point to non-pharma's department
                    UPDATE public.org_roles r
                    SET department_id = (
                        SELECT id FROM public.org_departments
                        WHERE function_id = keep_func_id
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
            SET function_id = keep_func_id
            WHERE function_id = merge_func_id 
            AND tenant_id = pharma_tenant_id;
            GET DIAGNOSTICS role_moved_count = ROW_COUNT;
            
            RAISE NOTICE '    Moved % roles', role_moved_count;
            
            -- Delete pharma function
            DELETE FROM public.org_functions
            WHERE id = merge_func_id AND tenant_id = pharma_tenant_id;
            
            merged_count := merged_count + 1;
            RAISE NOTICE '  ✅ Deleted pharma function: %', func_record.slugs[i];
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: CLEAN ALL SLUGS (REMOVE -PHARMA, DIGITS, UNWANTED PATTERNS) ===';
    
    -- Clean all function slugs
    FOR func_record IN
        SELECT 
            f.id,
            f.name::text as function_name,
            f.slug as current_slug
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
    LOOP
        -- Generate clean slug from function name
        -- Remove all non-alphanumeric except hyphens, then convert to lowercase
        clean_slug := lower(regexp_replace(func_record.function_name, '[^a-zA-Z0-9]+', '-', 'g'));
        
        -- Remove trailing/leading hyphens
        clean_slug := trim(both '-' from clean_slug);
        
        -- Remove any remaining digits at the end (like -123, -abc123)
        clean_slug := regexp_replace(clean_slug, '-\d+$', '');
        
        -- Remove any -pharma-* patterns if they somehow still exist
        clean_slug := regexp_replace(clean_slug, '-pharma-[a-z0-9-]+', '');
        
        -- Remove trailing hyphens again after cleanup
        clean_slug := trim(both '-' from clean_slug);
        
        -- Only update if slug is different
        IF clean_slug != func_record.current_slug THEN
            UPDATE public.org_functions
            SET slug = clean_slug
            WHERE id = func_record.id AND tenant_id = pharma_tenant_id;
            
            cleaned_count := cleaned_count + 1;
            RAISE NOTICE 'Cleaned slug: "%" -> "%"', func_record.current_slug, clean_slug;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Total slugs cleaned: %', cleaned_count;
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Duplicates merged: %', merged_count;
    RAISE NOTICE '  - Slugs cleaned: %', cleaned_count;
END $$;

COMMIT;

