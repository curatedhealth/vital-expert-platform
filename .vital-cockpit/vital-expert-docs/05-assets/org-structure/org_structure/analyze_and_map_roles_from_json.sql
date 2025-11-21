-- =====================================================================
-- ANALYZE AND MAP ROLES FROM JSON FILE
-- This script:
-- 1. Identifies missing roles (in JSON but not in DB)
-- 2. Maps all existing roles to correct function/department
-- 3. Creates missing roles
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    json_data jsonb;
    role_record jsonb;
    unique_roles jsonb := '[]'::jsonb;
    role_key text;
    function_name text;
    department_name text;
    role_name text;
    matched_function_id uuid;
    matched_department_id uuid;
    existing_role_id uuid;
    roles_created INTEGER := 0;
    roles_updated INTEGER := 0;
    roles_mapped INTEGER := 0;
    roles_unmapped INTEGER := 0;
    missing_roles_count INTEGER := 0;
    
    -- Helper function to generate slug from name
    slug_value text;
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
    RAISE NOTICE '=== ANALYZING JSON FILE STRUCTURE ===';
    RAISE NOTICE '';
    
    -- Note: This script expects the JSON data to be loaded into a temporary table
    -- or passed as a parameter. For now, we'll create a CTE with sample structure
    -- In practice, you would load the JSON file into a temporary table first
    
    -- Create a temporary table to hold JSON data
    CREATE TEMP TABLE IF NOT EXISTS temp_role_json (
        function_name text,
        department_name text,
        role_name text,
        scope text,
        scope_category text
    );
    
    RAISE NOTICE 'NOTE: JSON data must be loaded into temp_role_json table first';
    RAISE NOTICE 'Use: COPY temp_role_json FROM ''/path/to/PHARMA_ROLE_SCOPE_NORMALIZED.json'' WITH (FORMAT json);';
    RAISE NOTICE '';
    RAISE NOTICE 'Or insert manually using INSERT statements';
    RAISE NOTICE '';
    
    -- For now, we'll work with the assumption that data is in temp_role_json
    -- Step 1: Get unique roles (ignoring scope variations)
    CREATE TEMP TABLE IF NOT EXISTS temp_unique_roles AS
    SELECT DISTINCT
        function_name,
        department_name,
        role_name
    FROM temp_role_json;
    
    -- Step 2: Identify missing roles
    RAISE NOTICE '=== IDENTIFYING MISSING ROLES ===';
    
    CREATE TEMP TABLE IF NOT EXISTS temp_missing_roles AS
    SELECT 
        trj.function_name,
        trj.department_name,
        trj.role_name
    FROM temp_unique_roles trj
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.org_roles r
        WHERE r.tenant_id = pharma_tenant_id
          AND LOWER(TRIM(r.role_name)) = LOWER(TRIM(trj.role_name))
    );
    
    SELECT COUNT(*) INTO missing_roles_count FROM temp_missing_roles;
    RAISE NOTICE 'Found % missing roles', missing_roles_count;
    
    -- Step 3: Create missing roles
    IF missing_roles_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '=== CREATING MISSING ROLES ===';
        
        FOR role_record IN
            SELECT * FROM temp_missing_roles
        LOOP
            -- Get function ID
            SELECT id INTO matched_function_id
            FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text = role_record.function_name
            LIMIT 1;
            
            -- Get department ID
            IF matched_function_id IS NOT NULL THEN
                SELECT id INTO matched_department_id
                FROM public.org_departments
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND name = role_record.department_name
                LIMIT 1;
            END IF;
            
            -- Generate unique_id and slug
            slug_value := LOWER(REGEXP_REPLACE(role_record.role_name, '[^a-zA-Z0-9]+', '-', 'g'));
            slug_value := TRIM(BOTH '-' FROM slug_value);
            
            -- Create the role
            INSERT INTO public.org_roles (
                unique_id,
                role_name,
                tenant_id,
                function_id,
                department_id,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                'role-' || slug_value || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
                role_record.role_name,
                pharma_tenant_id,
                matched_function_id,
                matched_department_id,
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT (unique_id) DO NOTHING
            RETURNING id INTO existing_role_id;
            
            IF existing_role_id IS NOT NULL THEN
                roles_created := roles_created + 1;
                RAISE NOTICE '  ✅ Created role: "%" -> Function: "%", Department: "%"', 
                    role_record.role_name,
                    role_record.function_name,
                    role_record.department_name;
            END IF;
        END LOOP;
    END IF;
    
    -- Step 4: Map all existing roles to correct function/department
    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING EXISTING ROLES ===';
    
    FOR role_record IN
        SELECT 
            r.id as role_id,
            r.role_name,
            r.function_id as current_function_id,
            r.department_id as current_department_id,
            trj.function_name,
            trj.department_name
        FROM public.org_roles r
        CROSS JOIN temp_unique_roles trj
        WHERE r.tenant_id = pharma_tenant_id
          AND LOWER(TRIM(r.role_name)) = LOWER(TRIM(trj.role_name))
          AND (
              r.function_id IS NULL 
              OR r.department_id IS NULL
              OR r.function_id != (
                  SELECT id FROM public.org_functions 
                  WHERE tenant_id = pharma_tenant_id 
                    AND name::text = trj.function_name 
                  LIMIT 1
              )
              OR r.department_id != (
                  SELECT id FROM public.org_departments 
                  WHERE tenant_id = pharma_tenant_id 
                    AND function_id = (
                        SELECT id FROM public.org_functions 
                        WHERE tenant_id = pharma_tenant_id 
                          AND name::text = trj.function_name 
                        LIMIT 1
                    )
                    AND name = trj.department_name 
                  LIMIT 1
              )
          )
        LIMIT 1  -- Get first matching record per role
    LOOP
        -- Get function ID
        SELECT id INTO matched_function_id
        FROM public.org_functions
        WHERE tenant_id = pharma_tenant_id
          AND name::text = role_record.function_name
        LIMIT 1;
        
        -- Get department ID
        IF matched_function_id IS NOT NULL THEN
            SELECT id INTO matched_department_id
            FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND name = role_record.department_name
            LIMIT 1;
        END IF;
        
        -- Update the role
        IF matched_function_id IS NOT NULL THEN
            UPDATE public.org_roles
            SET 
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE id = role_record.role_id;
            
            GET DIAGNOSTICS roles_updated = ROW_COUNT;
            IF roles_updated > 0 THEN
                roles_mapped := roles_mapped + 1;
                IF matched_department_id IS NOT NULL THEN
                    RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"', 
                        role_record.role_name,
                        role_record.function_name,
                        role_record.department_name;
                ELSE
                    RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")', 
                        role_record.role_name,
                        role_record.function_name,
                        role_record.department_name;
                END IF;
            END IF;
        ELSE
            roles_unmapped := roles_unmapped + 1;
            RAISE NOTICE '  ❌ Could not map role "%" - Function "%" not found', 
                role_record.role_name,
                role_record.function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE '  - Missing roles identified: %', missing_roles_count;
    RAISE NOTICE '  - Roles created: %', roles_created;
    RAISE NOTICE '  - Roles mapped: %', roles_mapped;
    RAISE NOTICE '  - Roles unmapped: %', roles_unmapped;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role analysis and mapping complete.';
    
    -- Cleanup
    DROP TABLE IF EXISTS temp_role_json;
    DROP TABLE IF EXISTS temp_unique_roles;
    DROP TABLE IF EXISTS temp_missing_roles;
    
END $$;

COMMIT;

