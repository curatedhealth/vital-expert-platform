-- =====================================================================
-- MERGE DUPLICATES BY EXACT FUNCTION IDs
-- Uses the exact IDs from the duplicate check to merge them
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
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
    RAISE NOTICE '=== MERGING DUPLICATES BY ID ===';
    
    -- Market Access: Keep first (0eb2031a-d3c9-480e-876a-cc0ad20d1229), merge second (632328ab-d26a-434c-a878-d0536b14f74d)
    primary_func_id := '0eb2031a-d3c9-480e-876a-cc0ad20d1229'::uuid;
    duplicate_func_id := '632328ab-d26a-434c-a878-d0536b14f74d'::uuid;
    RAISE NOTICE 'Merging Market Access: % -> %', duplicate_func_id, primary_func_id;
    
    -- Move departments
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    -- Move roles
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    
    -- Delete duplicate
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    -- Medical Affairs: Keep first (8a788fc9-d1bd-4687-83b9-a0aad6949c53), merge second (f6d1c889-fe26-47ca-9c72-282d2b37efac)
    primary_func_id := '8a788fc9-d1bd-4687-83b9-a0aad6949c53'::uuid;
    duplicate_func_id := 'f6d1c889-fe26-47ca-9c72-282d2b37efac'::uuid;
    dept_moved_count := 0;
    RAISE NOTICE 'Merging Medical Affairs: % -> %', duplicate_func_id, primary_func_id;
    
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    -- Operations: Keep first (55db9ea0-b5b5-46b1-bbc9-2317e11f1990), merge second (c788c261-f15c-4039-a8bf-57c0c4f18eeb)
    primary_func_id := '55db9ea0-b5b5-46b1-bbc9-2317e11f1990'::uuid;
    duplicate_func_id := 'c788c261-f15c-4039-a8bf-57c0c4f18eeb'::uuid;
    dept_moved_count := 0;
    RAISE NOTICE 'Merging Operations: % -> %', duplicate_func_id, primary_func_id;
    
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    -- Clinical: Keep first (9e0815d5-706b-4663-a272-4b0c7181a2e9), merge second (285880d1-5bb0-4736-b1ee-4b74342aaff9)
    primary_func_id := '9e0815d5-706b-4663-a272-4b0c7181a2e9'::uuid;
    duplicate_func_id := '285880d1-5bb0-4736-b1ee-4b74342aaff9'::uuid;
    dept_moved_count := 0;
    RAISE NOTICE 'Merging Clinical: % -> %', duplicate_func_id, primary_func_id;
    
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    -- Quality: Keep first (6f51ee88-b676-4653-a303-63f367c06d93), merge second (a0e15275-2349-406f-bcee-eab24f41c117)
    primary_func_id := '6f51ee88-b676-4653-a303-63f367c06d93'::uuid;
    duplicate_func_id := 'a0e15275-2349-406f-bcee-eab24f41c117'::uuid;
    dept_moved_count := 0;
    RAISE NOTICE 'Merging Quality: % -> %', duplicate_func_id, primary_func_id;
    
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    -- Business Development: Keep first (da2c597e-c817-4038-975e-72ea38597d4e), merge second (d65d48f2-12b0-4066-b8ba-9f526e695e2e)
    primary_func_id := 'da2c597e-c817-4038-975e-72ea38597d4e'::uuid;
    duplicate_func_id := 'd65d48f2-12b0-4066-b8ba-9f526e695e2e'::uuid;
    dept_moved_count := 0;
    RAISE NOTICE 'Merging Business Development: % -> %', duplicate_func_id, primary_func_id;
    
    FOR dept_record IN SELECT id, name FROM public.org_departments WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id LOOP
        IF NOT EXISTS (SELECT 1 FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name) THEN
            UPDATE public.org_departments SET function_id = primary_func_id WHERE id = dept_record.id;
            dept_moved_count := dept_moved_count + 1;
        ELSE
            UPDATE public.org_roles SET department_id = (SELECT id FROM public.org_departments WHERE function_id = primary_func_id AND tenant_id = pharma_tenant_id AND name = dept_record.name LIMIT 1) WHERE department_id = dept_record.id AND tenant_id = pharma_tenant_id;
            DELETE FROM public.org_departments WHERE id = dept_record.id;
        END IF;
    END LOOP;
    
    UPDATE public.org_roles SET function_id = primary_func_id WHERE function_id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    GET DIAGNOSTICS role_moved_count = ROW_COUNT;
    RAISE NOTICE '  Moved % departments, % roles', dept_moved_count, role_moved_count;
    DELETE FROM public.org_functions WHERE id = duplicate_func_id AND tenant_id = pharma_tenant_id;
    merged_count := merged_count + 1;
    RAISE NOTICE '  ✅ Deleted duplicate';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total duplicates merged: %', merged_count;
END $$;

COMMIT;

