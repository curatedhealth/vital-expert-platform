-- =====================================================================
-- MAP ROLES FROM JSON FILE
-- Generated from: PHARMA_ROLE_SCOPE_NORMALIZED.json
-- Total unique roles: 161
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    existing_role_id uuid;
    roles_created INTEGER := 0;
    roles_updated INTEGER := 0;
    roles_mapped INTEGER := 0;
    roles_unmapped INTEGER := 0;
    slug_value text;
    unique_id_value text;
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
    RAISE NOTICE '=== MAPPING ROLES FROM JSON ===';
    RAISE NOTICE '';
    -- Role 1/161: Medical Science Liaison
    -- Function: Medical Affairs, Department: Field Medical
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Medical'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Science Liaison'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-science-liaison' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Science Liaison',
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
                'Medical Science Liaison',
                'Medical Affairs',
                'Field Medical';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Science Liaison',
                    'Medical Affairs',
                    'Field Medical';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Science Liaison',
                    'Medical Affairs',
                    'Field Medical';
            END IF;
        END IF;
    END IF;
    
    -- Role 2/161: Senior Medical Science Liaison
    -- Function: Medical Affairs, Department: Field Medical
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Medical'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Senior Medical Science Liaison'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'senior-medical-science-liaison' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Senior Medical Science Liaison',
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
                'Senior Medical Science Liaison',
                'Medical Affairs',
                'Field Medical';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Senior Medical Science Liaison',
                    'Medical Affairs',
                    'Field Medical';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Senior Medical Science Liaison',
                    'Medical Affairs',
                    'Field Medical';
            END IF;
        END IF;
    END IF;
    
    -- Role 3/161: Regional Field Medical Director
    -- Function: Medical Affairs, Department: Field Medical
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Medical'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regional Field Medical Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regional-field-medical-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regional Field Medical Director',
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
                'Regional Field Medical Director',
                'Medical Affairs',
                'Field Medical';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regional Field Medical Director',
                    'Medical Affairs',
                    'Field Medical';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regional Field Medical Director',
                    'Medical Affairs',
                    'Field Medical';
            END IF;
        END IF;
    END IF;
    
    -- Role 4/161: Field Team Lead
    -- Function: Medical Affairs, Department: Field Medical
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Medical'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Field Team Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'field-team-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Field Team Lead',
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
                'Field Team Lead',
                'Medical Affairs',
                'Field Medical';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Field Team Lead',
                    'Medical Affairs',
                    'Field Medical';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Field Team Lead',
                    'Medical Affairs',
                    'Field Medical';
            END IF;
        END IF;
    END IF;
    
    -- Role 5/161: Medical Scientific Manager
    -- Function: Medical Affairs, Department: Field Medical
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Medical'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Scientific Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-scientific-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Scientific Manager',
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
                'Medical Scientific Manager',
                'Medical Affairs',
                'Field Medical';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Scientific Manager',
                    'Medical Affairs',
                    'Field Medical';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Scientific Manager',
                    'Medical Affairs',
                    'Field Medical';
            END IF;
        END IF;
    END IF;
    
    -- Role 6/161: Medical Information Specialist
    -- Function: Medical Affairs, Department: Medical Information Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Information Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Information Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-information-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Information Specialist',
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
                'Medical Information Specialist',
                'Medical Affairs',
                'Medical Information Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Information Specialist',
                    'Medical Affairs',
                    'Medical Information Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Information Specialist',
                    'Medical Affairs',
                    'Medical Information Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 7/161: Medical Information Manager
    -- Function: Medical Affairs, Department: Medical Information Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Information Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Information Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-information-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Information Manager',
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
                'Medical Information Manager',
                'Medical Affairs',
                'Medical Information Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Information Manager',
                    'Medical Affairs',
                    'Medical Information Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Information Manager',
                    'Medical Affairs',
                    'Medical Information Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 8/161: MI Operations Lead
    -- Function: Medical Affairs, Department: Medical Information Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Information Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('MI Operations Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'mi-operations-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'MI Operations Lead',
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
                'MI Operations Lead',
                'Medical Affairs',
                'Medical Information Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'MI Operations Lead',
                    'Medical Affairs',
                    'Medical Information Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'MI Operations Lead',
                    'Medical Affairs',
                    'Medical Information Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 9/161: Medical Info Associate
    -- Function: Medical Affairs, Department: Medical Information Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Information Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Info Associate'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-info-associate' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Info Associate',
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
                'Medical Info Associate',
                'Medical Affairs',
                'Medical Information Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Info Associate',
                    'Medical Affairs',
                    'Medical Information Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Info Associate',
                    'Medical Affairs',
                    'Medical Information Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 10/161: Medical Info Scientist
    -- Function: Medical Affairs, Department: Medical Information Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Information Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Info Scientist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-info-scientist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Info Scientist',
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
                'Medical Info Scientist',
                'Medical Affairs',
                'Medical Information Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Info Scientist',
                    'Medical Affairs',
                    'Medical Information Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Info Scientist',
                    'Medical Affairs',
                    'Medical Information Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 11/161: Scientific Communications Manager
    -- Function: Medical Affairs, Department: Scientific Communications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Scientific Communications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Scientific Communications Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'scientific-communications-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Scientific Communications Manager',
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
                'Scientific Communications Manager',
                'Medical Affairs',
                'Scientific Communications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Scientific Communications Manager',
                    'Medical Affairs',
                    'Scientific Communications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Scientific Communications Manager',
                    'Medical Affairs',
                    'Scientific Communications';
            END IF;
        END IF;
    END IF;
    
    -- Role 12/161: Medical Writer
    -- Function: Medical Affairs, Department: Scientific Communications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Scientific Communications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Writer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-writer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Writer',
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
                'Medical Writer',
                'Medical Affairs',
                'Scientific Communications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Writer',
                    'Medical Affairs',
                    'Scientific Communications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Writer',
                    'Medical Affairs',
                    'Scientific Communications';
            END IF;
        END IF;
    END IF;
    
    -- Role 13/161: Publications Lead
    -- Function: Medical Affairs, Department: Scientific Communications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Scientific Communications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Publications Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'publications-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Publications Lead',
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
                'Publications Lead',
                'Medical Affairs',
                'Scientific Communications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Publications Lead',
                    'Medical Affairs',
                    'Scientific Communications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Publications Lead',
                    'Medical Affairs',
                    'Scientific Communications';
            END IF;
        END IF;
    END IF;
    
    -- Role 14/161: Scientific Affairs Lead
    -- Function: Medical Affairs, Department: Scientific Communications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Scientific Communications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Scientific Affairs Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'scientific-affairs-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Scientific Affairs Lead',
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
                'Scientific Affairs Lead',
                'Medical Affairs',
                'Scientific Communications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Scientific Affairs Lead',
                    'Medical Affairs',
                    'Scientific Communications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Scientific Affairs Lead',
                    'Medical Affairs',
                    'Scientific Communications';
            END IF;
        END IF;
    END IF;
    
    -- Role 15/161: Medical Communications Specialist
    -- Function: Medical Affairs, Department: Scientific Communications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Scientific Communications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Communications Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-communications-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Communications Specialist',
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
                'Medical Communications Specialist',
                'Medical Affairs',
                'Scientific Communications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Communications Specialist',
                    'Medical Affairs',
                    'Scientific Communications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Communications Specialist',
                    'Medical Affairs',
                    'Scientific Communications';
            END IF;
        END IF;
    END IF;
    
    -- Role 16/161: Medical Education Manager
    -- Function: Medical Affairs, Department: Medical Education
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Education'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Education Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-education-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Education Manager',
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
                'Medical Education Manager',
                'Medical Affairs',
                'Medical Education';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Education Manager',
                    'Medical Affairs',
                    'Medical Education';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Education Manager',
                    'Medical Affairs',
                    'Medical Education';
            END IF;
        END IF;
    END IF;
    
    -- Role 17/161: Medical Education Strategist
    -- Function: Medical Affairs, Department: Medical Education
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Education'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Education Strategist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-education-strategist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Education Strategist',
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
                'Medical Education Strategist',
                'Medical Affairs',
                'Medical Education';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Education Strategist',
                    'Medical Affairs',
                    'Medical Education';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Education Strategist',
                    'Medical Affairs',
                    'Medical Education';
            END IF;
        END IF;
    END IF;
    
    -- Role 18/161: Digital Medical Education Lead
    -- Function: Medical Affairs, Department: Medical Education
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Education'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Digital Medical Education Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'digital-medical-education-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Digital Medical Education Lead',
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
                'Digital Medical Education Lead',
                'Medical Affairs',
                'Medical Education';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Digital Medical Education Lead',
                    'Medical Affairs',
                    'Medical Education';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Digital Medical Education Lead',
                    'Medical Affairs',
                    'Medical Education';
            END IF;
        END IF;
    END IF;
    
    -- Role 19/161: Scientific Trainer
    -- Function: Medical Affairs, Department: Medical Education
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Education'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Scientific Trainer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'scientific-trainer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Scientific Trainer',
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
                'Scientific Trainer',
                'Medical Affairs',
                'Medical Education';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Scientific Trainer',
                    'Medical Affairs',
                    'Medical Education';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Scientific Trainer',
                    'Medical Affairs',
                    'Medical Education';
            END IF;
        END IF;
    END IF;
    
    -- Role 20/161: HEOR Director
    -- Function: Medical Affairs, Department: HEOR & Evidence (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR & Evidence (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Director',
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
                'HEOR Director',
                'Medical Affairs',
                'HEOR & Evidence (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Director',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Director',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 21/161: HEOR Manager
    -- Function: Medical Affairs, Department: HEOR & Evidence (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR & Evidence (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Manager',
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
                'HEOR Manager',
                'Medical Affairs',
                'HEOR & Evidence (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Manager',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Manager',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 22/161: Real-World Evidence Lead
    -- Function: Medical Affairs, Department: HEOR & Evidence (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR & Evidence (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Real-World Evidence Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'real-world-evidence-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Real-World Evidence Lead',
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
                'Real-World Evidence Lead',
                'Medical Affairs',
                'HEOR & Evidence (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Real-World Evidence Lead',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Real-World Evidence Lead',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 23/161: HEOR Project Manager
    -- Function: Medical Affairs, Department: HEOR & Evidence (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR & Evidence (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Project Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-project-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Project Manager',
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
                'HEOR Project Manager',
                'Medical Affairs',
                'HEOR & Evidence (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Project Manager',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Project Manager',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 24/161: Economic Modeler
    -- Function: Medical Affairs, Department: HEOR & Evidence (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR & Evidence (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Economic Modeler'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'economic-modeler' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Economic Modeler',
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
                'Economic Modeler',
                'Medical Affairs',
                'HEOR & Evidence (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Economic Modeler',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Economic Modeler',
                    'Medical Affairs',
                    'HEOR & Evidence (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 25/161: Publications Manager
    -- Function: Medical Affairs, Department: Publications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Publications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Publications Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'publications-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Publications Manager',
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
                'Publications Manager',
                'Medical Affairs',
                'Publications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Publications Manager',
                    'Medical Affairs',
                    'Publications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Publications Manager',
                    'Medical Affairs',
                    'Publications';
            END IF;
        END IF;
    END IF;
    
    -- Role 26/161: Publications Lead
    -- Function: Medical Affairs, Department: Publications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Publications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Publications Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'publications-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Publications Lead',
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
                'Publications Lead',
                'Medical Affairs',
                'Publications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Publications Lead',
                    'Medical Affairs',
                    'Publications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Publications Lead',
                    'Medical Affairs',
                    'Publications';
            END IF;
        END IF;
    END IF;
    
    -- Role 27/161: Publication Planner
    -- Function: Medical Affairs, Department: Publications
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Publications'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Publication Planner'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'publication-planner' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Publication Planner',
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
                'Publication Planner',
                'Medical Affairs',
                'Publications';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Publication Planner',
                    'Medical Affairs',
                    'Publications';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Publication Planner',
                    'Medical Affairs',
                    'Publications';
            END IF;
        END IF;
    END IF;
    
    -- Role 28/161: Chief Medical Officer
    -- Function: Medical Affairs, Department: Medical Leadership
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Leadership'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Chief Medical Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'chief-medical-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Chief Medical Officer',
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
                'Chief Medical Officer',
                'Medical Affairs',
                'Medical Leadership';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Chief Medical Officer',
                    'Medical Affairs',
                    'Medical Leadership';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Chief Medical Officer',
                    'Medical Affairs',
                    'Medical Leadership';
            END IF;
        END IF;
    END IF;
    
    -- Role 29/161: VP Medical Affairs
    -- Function: Medical Affairs, Department: Medical Leadership
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Leadership'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('VP Medical Affairs'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'vp-medical-affairs' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'VP Medical Affairs',
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
                'VP Medical Affairs',
                'Medical Affairs',
                'Medical Leadership';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'VP Medical Affairs',
                    'Medical Affairs',
                    'Medical Leadership';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'VP Medical Affairs',
                    'Medical Affairs',
                    'Medical Leadership';
            END IF;
        END IF;
    END IF;
    
    -- Role 30/161: Medical Affairs Director
    -- Function: Medical Affairs, Department: Medical Leadership
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Leadership'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Affairs Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-affairs-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Affairs Director',
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
                'Medical Affairs Director',
                'Medical Affairs',
                'Medical Leadership';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Affairs Director',
                    'Medical Affairs',
                    'Medical Leadership';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Affairs Director',
                    'Medical Affairs',
                    'Medical Leadership';
            END IF;
        END IF;
    END IF;
    
    -- Role 31/161: Senior Medical Director
    -- Function: Medical Affairs, Department: Medical Leadership
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Leadership'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Senior Medical Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'senior-medical-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Senior Medical Director',
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
                'Senior Medical Director',
                'Medical Affairs',
                'Medical Leadership';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Senior Medical Director',
                    'Medical Affairs',
                    'Medical Leadership';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Senior Medical Director',
                    'Medical Affairs',
                    'Medical Leadership';
            END IF;
        END IF;
    END IF;
    
    -- Role 32/161: Clinical Operations Liaison
    -- Function: Medical Affairs, Department: Clinical Operations Support
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Clinical Operations Support'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Clinical Operations Liaison'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'clinical-operations-liaison' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Clinical Operations Liaison',
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
                'Clinical Operations Liaison',
                'Medical Affairs',
                'Clinical Operations Support';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Clinical Operations Liaison',
                    'Medical Affairs',
                    'Clinical Operations Support';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Clinical Operations Liaison',
                    'Medical Affairs',
                    'Clinical Operations Support';
            END IF;
        END IF;
    END IF;
    
    -- Role 33/161: Clinical Ops Support Analyst
    -- Function: Medical Affairs, Department: Clinical Operations Support
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Clinical Operations Support'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Clinical Ops Support Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'clinical-ops-support-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Clinical Ops Support Analyst',
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
                'Clinical Ops Support Analyst',
                'Medical Affairs',
                'Clinical Operations Support';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Clinical Ops Support Analyst',
                    'Medical Affairs',
                    'Clinical Operations Support';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Clinical Ops Support Analyst',
                    'Medical Affairs',
                    'Clinical Operations Support';
            END IF;
        END IF;
    END IF;
    
    -- Role 34/161: Medical Liaison Clinical Trials
    -- Function: Medical Affairs, Department: Clinical Operations Support
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Clinical Operations Support'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Liaison Clinical Trials'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-liaison-clinical-trials' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Liaison Clinical Trials',
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
                'Medical Liaison Clinical Trials',
                'Medical Affairs',
                'Clinical Operations Support';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Liaison Clinical Trials',
                    'Medical Affairs',
                    'Clinical Operations Support';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Liaison Clinical Trials',
                    'Medical Affairs',
                    'Clinical Operations Support';
            END IF;
        END IF;
    END IF;
    
    -- Role 35/161: Medical Excellence Lead
    -- Function: Medical Affairs, Department: Medical Excellence & Compliance
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Excellence & Compliance'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Excellence Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-excellence-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Excellence Lead',
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
                'Medical Excellence Lead',
                'Medical Affairs',
                'Medical Excellence & Compliance';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Excellence Lead',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Excellence Lead',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            END IF;
        END IF;
    END IF;
    
    -- Role 36/161: Compliance Specialist
    -- Function: Medical Affairs, Department: Medical Excellence & Compliance
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Excellence & Compliance'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Compliance Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'compliance-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Compliance Specialist',
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
                'Compliance Specialist',
                'Medical Affairs',
                'Medical Excellence & Compliance';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Compliance Specialist',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Compliance Specialist',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            END IF;
        END IF;
    END IF;
    
    -- Role 37/161: Medical Governance Officer
    -- Function: Medical Affairs, Department: Medical Excellence & Compliance
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Medical Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Medical Excellence & Compliance'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Medical Governance Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'medical-governance-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Medical Governance Officer',
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
                'Medical Governance Officer',
                'Medical Affairs',
                'Medical Excellence & Compliance';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Medical Governance Officer',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Medical Governance Officer',
                    'Medical Affairs',
                    'Medical Excellence & Compliance';
            END IF;
        END IF;
    END IF;
    
    -- Role 38/161: VP Market Access
    -- Function: Market Access, Department: Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('VP Market Access'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'vp-market-access' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'VP Market Access',
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
                'VP Market Access',
                'Market Access',
                'Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'VP Market Access',
                    'Market Access',
                    'Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'VP Market Access',
                    'Market Access',
                    'Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 39/161: Chief Market Access Officer
    -- Function: Market Access, Department: Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Chief Market Access Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'chief-market-access-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Chief Market Access Officer',
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
                'Chief Market Access Officer',
                'Market Access',
                'Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Chief Market Access Officer',
                    'Market Access',
                    'Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Chief Market Access Officer',
                    'Market Access',
                    'Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 40/161: Market Access Director
    -- Function: Market Access, Department: Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Market Access Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'market-access-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Market Access Director',
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
                'Market Access Director',
                'Market Access',
                'Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Market Access Director',
                    'Market Access',
                    'Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Market Access Director',
                    'Market Access',
                    'Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 41/161: Head Market Access
    -- Function: Market Access, Department: Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Head Market Access'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'head-market-access' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Head Market Access',
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
                'Head Market Access',
                'Market Access',
                'Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Head Market Access',
                    'Market Access',
                    'Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Head Market Access',
                    'Market Access',
                    'Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 42/161: HEOR Director
    -- Function: Market Access, Department: HEOR (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Director',
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
                'HEOR Director',
                'Market Access',
                'HEOR (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Director',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Director',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 43/161: HEOR Manager
    -- Function: Market Access, Department: HEOR (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Manager',
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
                'HEOR Manager',
                'Market Access',
                'HEOR (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Manager',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Manager',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 44/161: HEOR Project Lead
    -- Function: Market Access, Department: HEOR (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Project Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-project-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Project Lead',
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
                'HEOR Project Lead',
                'Market Access',
                'HEOR (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Project Lead',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Project Lead',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 45/161: HEOR Analyst
    -- Function: Market Access, Department: HEOR (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HEOR Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'heor-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HEOR Analyst',
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
                'HEOR Analyst',
                'Market Access',
                'HEOR (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HEOR Analyst',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HEOR Analyst',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 46/161: Outcomes Research Scientist
    -- Function: Market Access, Department: HEOR (Health Economics & Outcomes Research)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'HEOR (Health Economics & Outcomes Research)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Outcomes Research Scientist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'outcomes-research-scientist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Outcomes Research Scientist',
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
                'Outcomes Research Scientist',
                'Market Access',
                'HEOR (Health Economics & Outcomes Research)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Outcomes Research Scientist',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Outcomes Research Scientist',
                    'Market Access',
                    'HEOR (Health Economics & Outcomes Research)';
            END IF;
        END IF;
    END IF;
    
    -- Role 47/161: Value Evidence Lead
    -- Function: Market Access, Department: Value, Evidence & Outcomes
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Value, Evidence & Outcomes'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Value Evidence Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'value-evidence-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Value Evidence Lead',
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
                'Value Evidence Lead',
                'Market Access',
                'Value, Evidence & Outcomes';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Value Evidence Lead',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Value Evidence Lead',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            END IF;
        END IF;
    END IF;
    
    -- Role 48/161: Evidence Synthesis Scientist
    -- Function: Market Access, Department: Value, Evidence & Outcomes
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Value, Evidence & Outcomes'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Evidence Synthesis Scientist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'evidence-synthesis-scientist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Evidence Synthesis Scientist',
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
                'Evidence Synthesis Scientist',
                'Market Access',
                'Value, Evidence & Outcomes';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Evidence Synthesis Scientist',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Evidence Synthesis Scientist',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            END IF;
        END IF;
    END IF;
    
    -- Role 49/161: HTA Specialist
    -- Function: Market Access, Department: Value, Evidence & Outcomes
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Value, Evidence & Outcomes'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HTA Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'hta-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HTA Specialist',
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
                'HTA Specialist',
                'Market Access',
                'Value, Evidence & Outcomes';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HTA Specialist',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HTA Specialist',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            END IF;
        END IF;
    END IF;
    
    -- Role 50/161: Value Proposition Lead
    -- Function: Market Access, Department: Value, Evidence & Outcomes
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Value, Evidence & Outcomes'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Value Proposition Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'value-proposition-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Value Proposition Lead',
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
                'Value Proposition Lead',
                'Market Access',
                'Value, Evidence & Outcomes';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Value Proposition Lead',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Value Proposition Lead',
                    'Market Access',
                    'Value, Evidence & Outcomes';
            END IF;
        END IF;
    END IF;
    
    -- Role 51/161: Pricing Manager
    -- Function: Market Access, Department: Pricing & Reimbursement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Pricing & Reimbursement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Pricing Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'pricing-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Pricing Manager',
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
                'Pricing Manager',
                'Market Access',
                'Pricing & Reimbursement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Pricing Manager',
                    'Market Access',
                    'Pricing & Reimbursement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Pricing Manager',
                    'Market Access',
                    'Pricing & Reimbursement';
            END IF;
        END IF;
    END IF;
    
    -- Role 52/161: Global Pricing Lead
    -- Function: Market Access, Department: Pricing & Reimbursement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Pricing & Reimbursement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Global Pricing Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'global-pricing-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Global Pricing Lead',
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
                'Global Pricing Lead',
                'Market Access',
                'Pricing & Reimbursement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Global Pricing Lead',
                    'Market Access',
                    'Pricing & Reimbursement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Global Pricing Lead',
                    'Market Access',
                    'Pricing & Reimbursement';
            END IF;
        END IF;
    END IF;
    
    -- Role 53/161: Reimbursement Manager
    -- Function: Market Access, Department: Pricing & Reimbursement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Pricing & Reimbursement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Reimbursement Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'reimbursement-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Reimbursement Manager',
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
                'Reimbursement Manager',
                'Market Access',
                'Pricing & Reimbursement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Reimbursement Manager',
                    'Market Access',
                    'Pricing & Reimbursement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Reimbursement Manager',
                    'Market Access',
                    'Pricing & Reimbursement';
            END IF;
        END IF;
    END IF;
    
    -- Role 54/161: Value & Pricing Analyst
    -- Function: Market Access, Department: Pricing & Reimbursement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Pricing & Reimbursement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Value & Pricing Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'value-pricing-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Value & Pricing Analyst',
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
                'Value & Pricing Analyst',
                'Market Access',
                'Pricing & Reimbursement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Value & Pricing Analyst',
                    'Market Access',
                    'Pricing & Reimbursement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Value & Pricing Analyst',
                    'Market Access',
                    'Pricing & Reimbursement';
            END IF;
        END IF;
    END IF;
    
    -- Role 55/161: HTA Access Lead
    -- Function: Market Access, Department: Pricing & Reimbursement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Pricing & Reimbursement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('HTA Access Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'hta-access-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'HTA Access Lead',
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
                'HTA Access Lead',
                'Market Access',
                'Pricing & Reimbursement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'HTA Access Lead',
                    'Market Access',
                    'Pricing & Reimbursement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'HTA Access Lead',
                    'Market Access',
                    'Pricing & Reimbursement';
            END IF;
        END IF;
    END IF;
    
    -- Role 56/161: Payer Strategy Lead
    -- Function: Market Access, Department: Payer Relations & Contracting
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Payer Relations & Contracting'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Payer Strategy Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'payer-strategy-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Payer Strategy Lead',
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
                'Payer Strategy Lead',
                'Market Access',
                'Payer Relations & Contracting';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Payer Strategy Lead',
                    'Market Access',
                    'Payer Relations & Contracting';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Payer Strategy Lead',
                    'Market Access',
                    'Payer Relations & Contracting';
            END IF;
        END IF;
    END IF;
    
    -- Role 57/161: Payer Relations Manager
    -- Function: Market Access, Department: Payer Relations & Contracting
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Payer Relations & Contracting'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Payer Relations Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'payer-relations-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Payer Relations Manager',
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
                'Payer Relations Manager',
                'Market Access',
                'Payer Relations & Contracting';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Payer Relations Manager',
                    'Market Access',
                    'Payer Relations & Contracting';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Payer Relations Manager',
                    'Market Access',
                    'Payer Relations & Contracting';
            END IF;
        END IF;
    END IF;
    
    -- Role 58/161: Contract Strategy Lead
    -- Function: Market Access, Department: Payer Relations & Contracting
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Payer Relations & Contracting'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Contract Strategy Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'contract-strategy-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Contract Strategy Lead',
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
                'Contract Strategy Lead',
                'Market Access',
                'Payer Relations & Contracting';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Contract Strategy Lead',
                    'Market Access',
                    'Payer Relations & Contracting';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Contract Strategy Lead',
                    'Market Access',
                    'Payer Relations & Contracting';
            END IF;
        END IF;
    END IF;
    
    -- Role 59/161: Access Contract Analyst
    -- Function: Market Access, Department: Payer Relations & Contracting
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Payer Relations & Contracting'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Access Contract Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'access-contract-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Access Contract Analyst',
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
                'Access Contract Analyst',
                'Market Access',
                'Payer Relations & Contracting';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Access Contract Analyst',
                    'Market Access',
                    'Payer Relations & Contracting';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Access Contract Analyst',
                    'Market Access',
                    'Payer Relations & Contracting';
            END IF;
        END IF;
    END IF;
    
    -- Role 60/161: Patient Access Manager
    -- Function: Market Access, Department: Patient Access & Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Patient Access & Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Patient Access Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'patient-access-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Patient Access Manager',
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
                'Patient Access Manager',
                'Market Access',
                'Patient Access & Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Patient Access Manager',
                    'Market Access',
                    'Patient Access & Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Patient Access Manager',
                    'Market Access',
                    'Patient Access & Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 61/161: Patient Support Lead
    -- Function: Market Access, Department: Patient Access & Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Patient Access & Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Patient Support Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'patient-support-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Patient Support Lead',
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
                'Patient Support Lead',
                'Market Access',
                'Patient Access & Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Patient Support Lead',
                    'Market Access',
                    'Patient Access & Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Patient Support Lead',
                    'Market Access',
                    'Patient Access & Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 62/161: Access Programs Analyst
    -- Function: Market Access, Department: Patient Access & Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Patient Access & Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Access Programs Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'access-programs-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Access Programs Analyst',
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
                'Access Programs Analyst',
                'Market Access',
                'Patient Access & Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Access Programs Analyst',
                    'Market Access',
                    'Patient Access & Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Access Programs Analyst',
                    'Market Access',
                    'Patient Access & Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 63/161: Patient Journey Lead
    -- Function: Market Access, Department: Patient Access & Services
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Patient Access & Services'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Patient Journey Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'patient-journey-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Patient Journey Lead',
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
                'Patient Journey Lead',
                'Market Access',
                'Patient Access & Services';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Patient Journey Lead',
                    'Market Access',
                    'Patient Access & Services';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Patient Journey Lead',
                    'Market Access',
                    'Patient Access & Services';
            END IF;
        END IF;
    END IF;
    
    -- Role 64/161: Government Affairs Director
    -- Function: Market Access, Department: Government & Policy Affairs
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Government & Policy Affairs'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Government Affairs Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'government-affairs-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Government Affairs Director',
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
                'Government Affairs Director',
                'Market Access',
                'Government & Policy Affairs';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Government Affairs Director',
                    'Market Access',
                    'Government & Policy Affairs';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Government Affairs Director',
                    'Market Access',
                    'Government & Policy Affairs';
            END IF;
        END IF;
    END IF;
    
    -- Role 65/161: Policy Analyst
    -- Function: Market Access, Department: Government & Policy Affairs
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Government & Policy Affairs'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Policy Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'policy-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Policy Analyst',
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
                'Policy Analyst',
                'Market Access',
                'Government & Policy Affairs';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Policy Analyst',
                    'Market Access',
                    'Government & Policy Affairs';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Policy Analyst',
                    'Market Access',
                    'Government & Policy Affairs';
            END IF;
        END IF;
    END IF;
    
    -- Role 66/161: Access Policy Lead
    -- Function: Market Access, Department: Government & Policy Affairs
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Government & Policy Affairs'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Access Policy Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'access-policy-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Access Policy Lead',
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
                'Access Policy Lead',
                'Market Access',
                'Government & Policy Affairs';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Access Policy Lead',
                    'Market Access',
                    'Government & Policy Affairs';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Access Policy Lead',
                    'Market Access',
                    'Government & Policy Affairs';
            END IF;
        END IF;
    END IF;
    
    -- Role 67/161: Public Affairs Lead
    -- Function: Market Access, Department: Government & Policy Affairs
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Government & Policy Affairs'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Public Affairs Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'public-affairs-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Public Affairs Lead',
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
                'Public Affairs Lead',
                'Market Access',
                'Government & Policy Affairs';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Public Affairs Lead',
                    'Market Access',
                    'Government & Policy Affairs';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Public Affairs Lead',
                    'Market Access',
                    'Government & Policy Affairs';
            END IF;
        END IF;
    END IF;
    
    -- Role 68/161: Trade Director
    -- Function: Market Access, Department: Trade & Distribution
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Trade & Distribution'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Trade Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'trade-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Trade Director',
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
                'Trade Director',
                'Market Access',
                'Trade & Distribution';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Trade Director',
                    'Market Access',
                    'Trade & Distribution';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Trade Director',
                    'Market Access',
                    'Trade & Distribution';
            END IF;
        END IF;
    END IF;
    
    -- Role 69/161: Distribution Manager
    -- Function: Market Access, Department: Trade & Distribution
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Trade & Distribution'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Distribution Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'distribution-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Distribution Manager',
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
                'Distribution Manager',
                'Market Access',
                'Trade & Distribution';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Distribution Manager',
                    'Market Access',
                    'Trade & Distribution';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Distribution Manager',
                    'Market Access',
                    'Trade & Distribution';
            END IF;
        END IF;
    END IF;
    
    -- Role 70/161: Wholesale Channel Lead
    -- Function: Market Access, Department: Trade & Distribution
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Trade & Distribution'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Wholesale Channel Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'wholesale-channel-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Wholesale Channel Lead',
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
                'Wholesale Channel Lead',
                'Market Access',
                'Trade & Distribution';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Wholesale Channel Lead',
                    'Market Access',
                    'Trade & Distribution';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Wholesale Channel Lead',
                    'Market Access',
                    'Trade & Distribution';
            END IF;
        END IF;
    END IF;
    
    -- Role 71/161: Trade Operations Analyst
    -- Function: Market Access, Department: Trade & Distribution
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Trade & Distribution'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Trade Operations Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'trade-operations-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Trade Operations Analyst',
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
                'Trade Operations Analyst',
                'Market Access',
                'Trade & Distribution';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Trade Operations Analyst',
                    'Market Access',
                    'Trade & Distribution';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Trade Operations Analyst',
                    'Market Access',
                    'Trade & Distribution';
            END IF;
        END IF;
    END IF;
    
    -- Role 72/161: Market Access Analyst
    -- Function: Market Access, Department: Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Market Access Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'market-access-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Market Access Analyst',
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
                'Market Access Analyst',
                'Market Access',
                'Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Market Access Analyst',
                    'Market Access',
                    'Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Market Access Analyst',
                    'Market Access',
                    'Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 73/161: Data Insights Lead
    -- Function: Market Access, Department: Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Data Insights Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'data-insights-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Data Insights Lead',
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
                'Data Insights Lead',
                'Market Access',
                'Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Data Insights Lead',
                    'Market Access',
                    'Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Data Insights Lead',
                    'Market Access',
                    'Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 74/161: Access Data Scientist
    -- Function: Market Access, Department: Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Access Data Scientist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'access-data-scientist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Access Data Scientist',
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
                'Access Data Scientist',
                'Market Access',
                'Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Access Data Scientist',
                    'Market Access',
                    'Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Access Data Scientist',
                    'Market Access',
                    'Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 75/161: Insights Manager
    -- Function: Market Access, Department: Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Insights Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'insights-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Insights Manager',
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
                'Insights Manager',
                'Market Access',
                'Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Insights Manager',
                    'Market Access',
                    'Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Insights Manager',
                    'Market Access',
                    'Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 76/161: Market Access Operations Lead
    -- Function: Market Access, Department: Operations & Excellence
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Operations & Excellence'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Market Access Operations Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'market-access-operations-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Market Access Operations Lead',
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
                'Market Access Operations Lead',
                'Market Access',
                'Operations & Excellence';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Market Access Operations Lead',
                    'Market Access',
                    'Operations & Excellence';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Market Access Operations Lead',
                    'Market Access',
                    'Operations & Excellence';
            END IF;
        END IF;
    END IF;
    
    -- Role 77/161: Access Process Excellence Manager
    -- Function: Market Access, Department: Operations & Excellence
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Operations & Excellence'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Access Process Excellence Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'access-process-excellence-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Access Process Excellence Manager',
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
                'Access Process Excellence Manager',
                'Market Access',
                'Operations & Excellence';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Access Process Excellence Manager',
                    'Market Access',
                    'Operations & Excellence';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Access Process Excellence Manager',
                    'Market Access',
                    'Operations & Excellence';
            END IF;
        END IF;
    END IF;
    
    -- Role 78/161: Operations Excellence Officer
    -- Function: Market Access, Department: Operations & Excellence
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Market Access'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Operations & Excellence'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Operations Excellence Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'operations-excellence-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Operations Excellence Officer',
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
                'Operations Excellence Officer',
                'Market Access',
                'Operations & Excellence';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Operations Excellence Officer',
                    'Market Access',
                    'Operations & Excellence';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Operations Excellence Officer',
                    'Market Access',
                    'Operations & Excellence';
            END IF;
        END IF;
    END IF;
    
    -- Role 79/161: Chief Commercial Officer
    -- Function: Commercial Organization, Department: Commercial Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Chief Commercial Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'chief-commercial-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Chief Commercial Officer',
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
                'Chief Commercial Officer',
                'Commercial Organization',
                'Commercial Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Chief Commercial Officer',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Chief Commercial Officer',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 80/161: SVP Commercial
    -- Function: Commercial Organization, Department: Commercial Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('SVP Commercial'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'svp-commercial' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'SVP Commercial',
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
                'SVP Commercial',
                'Commercial Organization',
                'Commercial Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'SVP Commercial',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'SVP Commercial',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 81/161: VP Commercial Strategy
    -- Function: Commercial Organization, Department: Commercial Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('VP Commercial Strategy'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'vp-commercial-strategy' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'VP Commercial Strategy',
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
                'VP Commercial Strategy',
                'Commercial Organization',
                'Commercial Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'VP Commercial Strategy',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'VP Commercial Strategy',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 82/161: Commercial Strategy Director
    -- Function: Commercial Organization, Department: Commercial Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Commercial Strategy Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'commercial-strategy-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Commercial Strategy Director',
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
                'Commercial Strategy Director',
                'Commercial Organization',
                'Commercial Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Commercial Strategy Director',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Commercial Strategy Director',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 83/161: Strategic Accounts Head
    -- Function: Commercial Organization, Department: Commercial Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Strategic Accounts Head'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'strategic-accounts-head' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Strategic Accounts Head',
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
                'Strategic Accounts Head',
                'Commercial Organization',
                'Commercial Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Strategic Accounts Head',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Strategic Accounts Head',
                    'Commercial Organization',
                    'Commercial Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 84/161: National Sales Director
    -- Function: Commercial Organization, Department: Field Sales Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Sales Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('National Sales Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'national-sales-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'National Sales Director',
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
                'National Sales Director',
                'Commercial Organization',
                'Field Sales Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'National Sales Director',
                    'Commercial Organization',
                    'Field Sales Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'National Sales Director',
                    'Commercial Organization',
                    'Field Sales Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 85/161: Regional Sales Manager
    -- Function: Commercial Organization, Department: Field Sales Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Sales Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regional Sales Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regional-sales-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regional Sales Manager',
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
                'Regional Sales Manager',
                'Commercial Organization',
                'Field Sales Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regional Sales Manager',
                    'Commercial Organization',
                    'Field Sales Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regional Sales Manager',
                    'Commercial Organization',
                    'Field Sales Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 86/161: District Sales Manager
    -- Function: Commercial Organization, Department: Field Sales Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Sales Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('District Sales Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'district-sales-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'District Sales Manager',
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
                'District Sales Manager',
                'Commercial Organization',
                'Field Sales Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'District Sales Manager',
                    'Commercial Organization',
                    'Field Sales Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'District Sales Manager',
                    'Commercial Organization',
                    'Field Sales Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 87/161: Sales Representative
    -- Function: Commercial Organization, Department: Field Sales Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Sales Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sales Representative'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sales-representative' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sales Representative',
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
                'Sales Representative',
                'Commercial Organization',
                'Field Sales Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sales Representative',
                    'Commercial Organization',
                    'Field Sales Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sales Representative',
                    'Commercial Organization',
                    'Field Sales Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 88/161: Sales Territory Lead
    -- Function: Commercial Organization, Department: Field Sales Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Field Sales Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sales Territory Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sales-territory-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sales Territory Lead',
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
                'Sales Territory Lead',
                'Commercial Organization',
                'Field Sales Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sales Territory Lead',
                    'Commercial Organization',
                    'Field Sales Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sales Territory Lead',
                    'Commercial Organization',
                    'Field Sales Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 89/161: Specialty Sales Lead
    -- Function: Commercial Organization, Department: Specialty & Hospital Sales
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Specialty & Hospital Sales'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Specialty Sales Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'specialty-sales-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Specialty Sales Lead',
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
                'Specialty Sales Lead',
                'Commercial Organization',
                'Specialty & Hospital Sales';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Specialty Sales Lead',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Specialty Sales Lead',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            END IF;
        END IF;
    END IF;
    
    -- Role 90/161: Hospital Sales Manager
    -- Function: Commercial Organization, Department: Specialty & Hospital Sales
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Specialty & Hospital Sales'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Hospital Sales Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'hospital-sales-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Hospital Sales Manager',
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
                'Hospital Sales Manager',
                'Commercial Organization',
                'Specialty & Hospital Sales';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Hospital Sales Manager',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Hospital Sales Manager',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            END IF;
        END IF;
    END IF;
    
    -- Role 91/161: Hospital Sales Rep
    -- Function: Commercial Organization, Department: Specialty & Hospital Sales
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Specialty & Hospital Sales'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Hospital Sales Rep'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'hospital-sales-rep' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Hospital Sales Rep',
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
                'Hospital Sales Rep',
                'Commercial Organization',
                'Specialty & Hospital Sales';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Hospital Sales Rep',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Hospital Sales Rep',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            END IF;
        END IF;
    END IF;
    
    -- Role 92/161: Institutional Accounts Manager
    -- Function: Commercial Organization, Department: Specialty & Hospital Sales
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Specialty & Hospital Sales'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Institutional Accounts Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'institutional-accounts-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Institutional Accounts Manager',
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
                'Institutional Accounts Manager',
                'Commercial Organization',
                'Specialty & Hospital Sales';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Institutional Accounts Manager',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Institutional Accounts Manager',
                    'Commercial Organization',
                    'Specialty & Hospital Sales';
            END IF;
        END IF;
    END IF;
    
    -- Role 93/161: Key Account Manager
    -- Function: Commercial Organization, Department: Key Account Management
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Key Account Management'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Key Account Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'key-account-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Key Account Manager',
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
                'Key Account Manager',
                'Commercial Organization',
                'Key Account Management';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Key Account Manager',
                    'Commercial Organization',
                    'Key Account Management';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Key Account Manager',
                    'Commercial Organization',
                    'Key Account Management';
            END IF;
        END IF;
    END IF;
    
    -- Role 94/161: KAM Director
    -- Function: Commercial Organization, Department: Key Account Management
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Key Account Management'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('KAM Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'kam-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'KAM Director',
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
                'KAM Director',
                'Commercial Organization',
                'Key Account Management';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'KAM Director',
                    'Commercial Organization',
                    'Key Account Management';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'KAM Director',
                    'Commercial Organization',
                    'Key Account Management';
            END IF;
        END IF;
    END IF;
    
    -- Role 95/161: Strategic Account Manager
    -- Function: Commercial Organization, Department: Key Account Management
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Key Account Management'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Strategic Account Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'strategic-account-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Strategic Account Manager',
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
                'Strategic Account Manager',
                'Commercial Organization',
                'Key Account Management';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Strategic Account Manager',
                    'Commercial Organization',
                    'Key Account Management';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Strategic Account Manager',
                    'Commercial Organization',
                    'Key Account Management';
            END IF;
        END IF;
    END IF;
    
    -- Role 96/161: Account Manager - IDNs/GPOs
    -- Function: Commercial Organization, Department: Key Account Management
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Key Account Management'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Account Manager - IDNs/GPOs'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'account-manager-idns-gpos' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Account Manager - IDNs/GPOs',
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
                'Account Manager - IDNs/GPOs',
                'Commercial Organization',
                'Key Account Management';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Account Manager - IDNs/GPOs',
                    'Commercial Organization',
                    'Key Account Management';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Account Manager - IDNs/GPOs',
                    'Commercial Organization',
                    'Key Account Management';
            END IF;
        END IF;
    END IF;
    
    -- Role 97/161: Customer Experience Director
    -- Function: Commercial Organization, Department: Customer Experience
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Customer Experience'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Customer Experience Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'customer-experience-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Customer Experience Director',
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
                'Customer Experience Director',
                'Commercial Organization',
                'Customer Experience';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Customer Experience Director',
                    'Commercial Organization',
                    'Customer Experience';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Customer Experience Director',
                    'Commercial Organization',
                    'Customer Experience';
            END IF;
        END IF;
    END IF;
    
    -- Role 98/161: CX Program Lead
    -- Function: Commercial Organization, Department: Customer Experience
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Customer Experience'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CX Program Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cx-program-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CX Program Lead',
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
                'CX Program Lead',
                'Commercial Organization',
                'Customer Experience';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CX Program Lead',
                    'Commercial Organization',
                    'Customer Experience';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CX Program Lead',
                    'Commercial Organization',
                    'Customer Experience';
            END IF;
        END IF;
    END IF;
    
    -- Role 99/161: Customer Success Manager
    -- Function: Commercial Organization, Department: Customer Experience
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Customer Experience'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Customer Success Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'customer-success-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Customer Success Manager',
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
                'Customer Success Manager',
                'Commercial Organization',
                'Customer Experience';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Customer Success Manager',
                    'Commercial Organization',
                    'Customer Experience';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Customer Success Manager',
                    'Commercial Organization',
                    'Customer Experience';
            END IF;
        END IF;
    END IF;
    
    -- Role 100/161: CX Insights Analyst
    -- Function: Commercial Organization, Department: Customer Experience
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Customer Experience'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CX Insights Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cx-insights-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CX Insights Analyst',
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
                'CX Insights Analyst',
                'Commercial Organization',
                'Customer Experience';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CX Insights Analyst',
                    'Commercial Organization',
                    'Customer Experience';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CX Insights Analyst',
                    'Commercial Organization',
                    'Customer Experience';
            END IF;
        END IF;
    END IF;
    
    -- Role 101/161: Marketing Director
    -- Function: Commercial Organization, Department: Commercial Marketing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Marketing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Marketing Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'marketing-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Marketing Director',
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
                'Marketing Director',
                'Commercial Organization',
                'Commercial Marketing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Marketing Director',
                    'Commercial Organization',
                    'Commercial Marketing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Marketing Director',
                    'Commercial Organization',
                    'Commercial Marketing';
            END IF;
        END IF;
    END IF;
    
    -- Role 102/161: Product Manager
    -- Function: Commercial Organization, Department: Commercial Marketing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Marketing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Product Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'product-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Product Manager',
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
                'Product Manager',
                'Commercial Organization',
                'Commercial Marketing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Product Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Product Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            END IF;
        END IF;
    END IF;
    
    -- Role 103/161: Brand Lead
    -- Function: Commercial Organization, Department: Commercial Marketing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Marketing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Brand Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'brand-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Brand Lead',
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
                'Brand Lead',
                'Commercial Organization',
                'Commercial Marketing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Brand Lead',
                    'Commercial Organization',
                    'Commercial Marketing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Brand Lead',
                    'Commercial Organization',
                    'Commercial Marketing';
            END IF;
        END IF;
    END IF;
    
    -- Role 104/161: Lifecycle Marketing Manager
    -- Function: Commercial Organization, Department: Commercial Marketing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Marketing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Lifecycle Marketing Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'lifecycle-marketing-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Lifecycle Marketing Manager',
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
                'Lifecycle Marketing Manager',
                'Commercial Organization',
                'Commercial Marketing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Lifecycle Marketing Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Lifecycle Marketing Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            END IF;
        END IF;
    END IF;
    
    -- Role 105/161: Digital Marketing Manager
    -- Function: Commercial Organization, Department: Commercial Marketing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Marketing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Digital Marketing Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'digital-marketing-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Digital Marketing Manager',
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
                'Digital Marketing Manager',
                'Commercial Organization',
                'Commercial Marketing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Digital Marketing Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Digital Marketing Manager',
                    'Commercial Organization',
                    'Commercial Marketing';
            END IF;
        END IF;
    END IF;
    
    -- Role 106/161: Business Development Lead
    -- Function: Commercial Organization, Department: Business Development & Licensing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Business Development & Licensing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Business Development Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'business-development-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Business Development Lead',
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
                'Business Development Lead',
                'Commercial Organization',
                'Business Development & Licensing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Business Development Lead',
                    'Commercial Organization',
                    'Business Development & Licensing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Business Development Lead',
                    'Commercial Organization',
                    'Business Development & Licensing';
            END IF;
        END IF;
    END IF;
    
    -- Role 107/161: Licensing Manager
    -- Function: Commercial Organization, Department: Business Development & Licensing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Business Development & Licensing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Licensing Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'licensing-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Licensing Manager',
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
                'Licensing Manager',
                'Commercial Organization',
                'Business Development & Licensing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Licensing Manager',
                    'Commercial Organization',
                    'Business Development & Licensing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Licensing Manager',
                    'Commercial Organization',
                    'Business Development & Licensing';
            END IF;
        END IF;
    END IF;
    
    -- Role 108/161: Acquisitions Analyst
    -- Function: Commercial Organization, Department: Business Development & Licensing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Business Development & Licensing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Acquisitions Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'acquisitions-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Acquisitions Analyst',
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
                'Acquisitions Analyst',
                'Commercial Organization',
                'Business Development & Licensing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Acquisitions Analyst',
                    'Commercial Organization',
                    'Business Development & Licensing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Acquisitions Analyst',
                    'Commercial Organization',
                    'Business Development & Licensing';
            END IF;
        END IF;
    END IF;
    
    -- Role 109/161: BD Strategy Director
    -- Function: Commercial Organization, Department: Business Development & Licensing
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Business Development & Licensing'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('BD Strategy Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'bd-strategy-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'BD Strategy Director',
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
                'BD Strategy Director',
                'Commercial Organization',
                'Business Development & Licensing';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'BD Strategy Director',
                    'Commercial Organization',
                    'Business Development & Licensing';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'BD Strategy Director',
                    'Commercial Organization',
                    'Business Development & Licensing';
            END IF;
        END IF;
    END IF;
    
    -- Role 110/161: Commercial Data Scientist
    -- Function: Commercial Organization, Department: Commercial Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Commercial Data Scientist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'commercial-data-scientist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Commercial Data Scientist',
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
                'Commercial Data Scientist',
                'Commercial Organization',
                'Commercial Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Commercial Data Scientist',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Commercial Data Scientist',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 111/161: Business Insights Lead
    -- Function: Commercial Organization, Department: Commercial Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Business Insights Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'business-insights-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Business Insights Lead',
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
                'Business Insights Lead',
                'Commercial Organization',
                'Commercial Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Business Insights Lead',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Business Insights Lead',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 112/161: Sales Analytics Manager
    -- Function: Commercial Organization, Department: Commercial Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sales Analytics Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sales-analytics-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sales Analytics Manager',
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
                'Sales Analytics Manager',
                'Commercial Organization',
                'Commercial Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sales Analytics Manager',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sales Analytics Manager',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 113/161: Forecasting Analyst
    -- Function: Commercial Organization, Department: Commercial Analytics & Insights
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Commercial Analytics & Insights'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Forecasting Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'forecasting-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Forecasting Analyst',
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
                'Forecasting Analyst',
                'Commercial Organization',
                'Commercial Analytics & Insights';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Forecasting Analyst',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Forecasting Analyst',
                    'Commercial Organization',
                    'Commercial Analytics & Insights';
            END IF;
        END IF;
    END IF;
    
    -- Role 114/161: Sales Training Manager
    -- Function: Commercial Organization, Department: Sales Training & Enablement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Sales Training & Enablement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sales Training Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sales-training-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sales Training Manager',
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
                'Sales Training Manager',
                'Commercial Organization',
                'Sales Training & Enablement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sales Training Manager',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sales Training Manager',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            END IF;
        END IF;
    END IF;
    
    -- Role 115/161: Sales Enablement Lead
    -- Function: Commercial Organization, Department: Sales Training & Enablement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Sales Training & Enablement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sales Enablement Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sales-enablement-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sales Enablement Lead',
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
                'Sales Enablement Lead',
                'Commercial Organization',
                'Sales Training & Enablement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sales Enablement Lead',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sales Enablement Lead',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            END IF;
        END IF;
    END IF;
    
    -- Role 116/161: Learning & Development Specialist
    -- Function: Commercial Organization, Department: Sales Training & Enablement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Sales Training & Enablement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Learning & Development Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'learning-development-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Learning & Development Specialist',
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
                'Learning & Development Specialist',
                'Commercial Organization',
                'Sales Training & Enablement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Learning & Development Specialist',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Learning & Development Specialist',
                    'Commercial Organization',
                    'Sales Training & Enablement';
            END IF;
        END IF;
    END IF;
    
    -- Role 117/161: Omnichannel CRM Manager
    -- Function: Commercial Organization, Department: Digital & Omnichannel Engagement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Digital & Omnichannel Engagement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Omnichannel CRM Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'omnichannel-crm-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Omnichannel CRM Manager',
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
                'Omnichannel CRM Manager',
                'Commercial Organization',
                'Digital & Omnichannel Engagement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Omnichannel CRM Manager',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Omnichannel CRM Manager',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            END IF;
        END IF;
    END IF;
    
    -- Role 118/161: Digital Engagement Director
    -- Function: Commercial Organization, Department: Digital & Omnichannel Engagement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Digital & Omnichannel Engagement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Digital Engagement Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'digital-engagement-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Digital Engagement Director',
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
                'Digital Engagement Director',
                'Commercial Organization',
                'Digital & Omnichannel Engagement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Digital Engagement Director',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Digital Engagement Director',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            END IF;
        END IF;
    END IF;
    
    -- Role 119/161: Multichannel Ops Lead
    -- Function: Commercial Organization, Department: Digital & Omnichannel Engagement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Digital & Omnichannel Engagement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Multichannel Ops Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'multichannel-ops-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Multichannel Ops Lead',
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
                'Multichannel Ops Lead',
                'Commercial Organization',
                'Digital & Omnichannel Engagement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Multichannel Ops Lead',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Multichannel Ops Lead',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            END IF;
        END IF;
    END IF;
    
    -- Role 120/161: Remote Sales Lead
    -- Function: Commercial Organization, Department: Digital & Omnichannel Engagement
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Digital & Omnichannel Engagement'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Remote Sales Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'remote-sales-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Remote Sales Lead',
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
                'Remote Sales Lead',
                'Commercial Organization',
                'Digital & Omnichannel Engagement';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Remote Sales Lead',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Remote Sales Lead',
                    'Commercial Organization',
                    'Digital & Omnichannel Engagement';
            END IF;
        END IF;
    END IF;
    
    -- Role 121/161: Commercial Compliance Officer
    -- Function: Commercial Organization, Department: Compliance & Commercial Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Compliance & Commercial Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Commercial Compliance Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'commercial-compliance-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Commercial Compliance Officer',
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
                'Commercial Compliance Officer',
                'Commercial Organization',
                'Compliance & Commercial Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Commercial Compliance Officer',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Commercial Compliance Officer',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 122/161: Commercial Operations Manager
    -- Function: Commercial Organization, Department: Compliance & Commercial Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Compliance & Commercial Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Commercial Operations Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'commercial-operations-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Commercial Operations Manager',
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
                'Commercial Operations Manager',
                'Commercial Organization',
                'Compliance & Commercial Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Commercial Operations Manager',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Commercial Operations Manager',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 123/161: Compliance Review Lead
    -- Function: Commercial Organization, Department: Compliance & Commercial Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Commercial Organization'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Compliance & Commercial Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Compliance Review Lead'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'compliance-review-lead' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Compliance Review Lead',
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
                'Compliance Review Lead',
                'Commercial Organization',
                'Compliance & Commercial Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Compliance Review Lead',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Compliance Review Lead',
                    'Commercial Organization',
                    'Compliance & Commercial Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 124/161: Chief Regulatory Officer
    -- Function: Regulatory Affairs, Department: Regulatory Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Chief Regulatory Officer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'chief-regulatory-officer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Chief Regulatory Officer',
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
                'Chief Regulatory Officer',
                'Regulatory Affairs',
                'Regulatory Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Chief Regulatory Officer',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Chief Regulatory Officer',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 125/161: SVP Regulatory Affairs
    -- Function: Regulatory Affairs, Department: Regulatory Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('SVP Regulatory Affairs'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'svp-regulatory-affairs' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'SVP Regulatory Affairs',
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
                'SVP Regulatory Affairs',
                'Regulatory Affairs',
                'Regulatory Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'SVP Regulatory Affairs',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'SVP Regulatory Affairs',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 126/161: VP Regulatory Strategy
    -- Function: Regulatory Affairs, Department: Regulatory Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('VP Regulatory Strategy'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'vp-regulatory-strategy' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'VP Regulatory Strategy',
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
                'VP Regulatory Strategy',
                'Regulatory Affairs',
                'Regulatory Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'VP Regulatory Strategy',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'VP Regulatory Strategy',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 127/161: Head of Regulatory Operations
    -- Function: Regulatory Affairs, Department: Regulatory Leadership & Strategy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Leadership & Strategy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Head of Regulatory Operations'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'head-of-regulatory-operations' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Head of Regulatory Operations',
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
                'Head of Regulatory Operations',
                'Regulatory Affairs',
                'Regulatory Leadership & Strategy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Head of Regulatory Operations',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Head of Regulatory Operations',
                    'Regulatory Affairs',
                    'Regulatory Leadership & Strategy';
            END IF;
        END IF;
    END IF;
    
    -- Role 128/161: VP Regulatory Submissions
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('VP Regulatory Submissions'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'vp-regulatory-submissions' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'VP Regulatory Submissions',
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
                'VP Regulatory Submissions',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'VP Regulatory Submissions',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'VP Regulatory Submissions',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 129/161: Submissions Director
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Submissions Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'submissions-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Submissions Director',
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
                'Submissions Director',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Submissions Director',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Submissions Director',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 130/161: Senior Regulatory Submissions Manager
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Senior Regulatory Submissions Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'senior-regulatory-submissions-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Senior Regulatory Submissions Manager',
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
                'Senior Regulatory Submissions Manager',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Senior Regulatory Submissions Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Senior Regulatory Submissions Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 131/161: Submissions Manager
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Submissions Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'submissions-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Submissions Manager',
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
                'Submissions Manager',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Submissions Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Submissions Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 132/161: Publishing Manager
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Publishing Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'publishing-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Publishing Manager',
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
                'Publishing Manager',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Publishing Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Publishing Manager',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 133/161: Senior Regulatory Writer
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Senior Regulatory Writer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'senior-regulatory-writer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Senior Regulatory Writer',
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
                'Senior Regulatory Writer',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Senior Regulatory Writer',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Senior Regulatory Writer',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 134/161: Regulatory Writer
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Writer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-writer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Writer',
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
                'Regulatory Writer',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Writer',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Writer',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 135/161: Regulatory Document Specialist
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Document Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-document-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Document Specialist',
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
                'Regulatory Document Specialist',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Document Specialist',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Document Specialist',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 136/161: Regulatory Coordinator
    -- Function: Regulatory Affairs, Department: Regulatory Submissions & Operations
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Submissions & Operations'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Coordinator'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-coordinator' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Coordinator',
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
                'Regulatory Coordinator',
                'Regulatory Affairs',
                'Regulatory Submissions & Operations';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Coordinator',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Coordinator',
                    'Regulatory Affairs',
                    'Regulatory Submissions & Operations';
            END IF;
        END IF;
    END IF;
    
    -- Role 137/161: Regulatory Intelligence Director
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Intelligence Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-intelligence-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Intelligence Director',
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
                'Regulatory Intelligence Director',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Intelligence Director',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Intelligence Director',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 138/161: Sr. Regulatory Intelligence Manager
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sr. Regulatory Intelligence Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sr-regulatory-intelligence-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sr. Regulatory Intelligence Manager',
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
                'Sr. Regulatory Intelligence Manager',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sr. Regulatory Intelligence Manager',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sr. Regulatory Intelligence Manager',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 139/161: Reg Intelligence Manager
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Reg Intelligence Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'reg-intelligence-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Reg Intelligence Manager',
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
                'Reg Intelligence Manager',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Reg Intelligence Manager',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Reg Intelligence Manager',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 140/161: Sr. Regulatory Policy Analyst
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sr. Regulatory Policy Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sr-regulatory-policy-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sr. Regulatory Policy Analyst',
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
                'Sr. Regulatory Policy Analyst',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sr. Regulatory Policy Analyst',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sr. Regulatory Policy Analyst',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 141/161: Regulatory Policy Analyst
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Policy Analyst'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-policy-analyst' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Policy Analyst',
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
                'Regulatory Policy Analyst',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Policy Analyst',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Policy Analyst',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 142/161: Regulatory Intelligence Specialist
    -- Function: Regulatory Affairs, Department: Regulatory Intelligence & Policy
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Intelligence & Policy'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Intelligence Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-intelligence-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Intelligence Specialist',
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
                'Regulatory Intelligence Specialist',
                'Regulatory Affairs',
                'Regulatory Intelligence & Policy';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Intelligence Specialist',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Intelligence Specialist',
                    'Regulatory Affairs',
                    'Regulatory Intelligence & Policy';
            END IF;
        END IF;
    END IF;
    
    -- Role 143/161: CMC Regulatory Affairs Director
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CMC Regulatory Affairs Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cmc-regulatory-affairs-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CMC Regulatory Affairs Director',
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
                'CMC Regulatory Affairs Director',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CMC Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CMC Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 144/161: Sr. CMC Regulatory Manager
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sr. CMC Regulatory Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sr-cmc-regulatory-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sr. CMC Regulatory Manager',
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
                'Sr. CMC Regulatory Manager',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sr. CMC Regulatory Manager',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sr. CMC Regulatory Manager',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 145/161: CMC Regulatory Manager
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CMC Regulatory Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cmc-regulatory-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CMC Regulatory Manager',
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
                'CMC Regulatory Manager',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CMC Regulatory Manager',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CMC Regulatory Manager',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 146/161: Sr. CMC Regulatory Specialist
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Sr. CMC Regulatory Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'sr-cmc-regulatory-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Sr. CMC Regulatory Specialist',
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
                'Sr. CMC Regulatory Specialist',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Sr. CMC Regulatory Specialist',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Sr. CMC Regulatory Specialist',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 147/161: CMC Regulatory Specialist
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CMC Regulatory Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cmc-regulatory-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CMC Regulatory Specialist',
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
                'CMC Regulatory Specialist',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CMC Regulatory Specialist',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CMC Regulatory Specialist',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 148/161: CMC Technical Writer
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CMC Technical Writer'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cmc-technical-writer' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CMC Technical Writer',
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
                'CMC Technical Writer',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CMC Technical Writer',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CMC Technical Writer',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 149/161: CMC Regulatory Associate
    -- Function: Regulatory Affairs, Department: CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('CMC Regulatory Associate'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'cmc-regulatory-associate' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'CMC Regulatory Associate',
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
                'CMC Regulatory Associate',
                'Regulatory Affairs',
                'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'CMC Regulatory Associate',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'CMC Regulatory Associate',
                    'Regulatory Affairs',
                    'CMC Regulatory Affairs (Chemistry, Manufacturing & Controls)';
            END IF;
        END IF;
    END IF;
    
    -- Role 150/161: Head of US Regulatory Affairs
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Head of US Regulatory Affairs'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'head-of-us-regulatory-affairs' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Head of US Regulatory Affairs',
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
                'Head of US Regulatory Affairs',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Head of US Regulatory Affairs',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Head of US Regulatory Affairs',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 151/161: Head of EU Regulatory Affairs
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Head of EU Regulatory Affairs'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'head-of-eu-regulatory-affairs' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Head of EU Regulatory Affairs',
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
                'Head of EU Regulatory Affairs',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Head of EU Regulatory Affairs',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Head of EU Regulatory Affairs',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 152/161: US Regulatory Affairs Director
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('US Regulatory Affairs Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'us-regulatory-affairs-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'US Regulatory Affairs Director',
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
                'US Regulatory Affairs Director',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'US Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'US Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 153/161: EU Regulatory Affairs Director
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('EU Regulatory Affairs Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'eu-regulatory-affairs-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'EU Regulatory Affairs Director',
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
                'EU Regulatory Affairs Director',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'EU Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'EU Regulatory Affairs Director',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 154/161: APAC Regulatory Affairs Manager
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('APAC Regulatory Affairs Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'apac-regulatory-affairs-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'APAC Regulatory Affairs Manager',
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
                'APAC Regulatory Affairs Manager',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'APAC Regulatory Affairs Manager',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'APAC Regulatory Affairs Manager',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 155/161: LatAm Regulatory Affairs Manager
    -- Function: Regulatory Affairs, Department: Global Regulatory Affairs (US, EU, APAC, LatAm)
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Global Regulatory Affairs (US, EU, APAC, LatAm)'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('LatAm Regulatory Affairs Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'latam-regulatory-affairs-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'LatAm Regulatory Affairs Manager',
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
                'LatAm Regulatory Affairs Manager',
                'Regulatory Affairs',
                'Global Regulatory Affairs (US, EU, APAC, LatAm)';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'LatAm Regulatory Affairs Manager',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'LatAm Regulatory Affairs Manager',
                    'Regulatory Affairs',
                    'Global Regulatory Affairs (US, EU, APAC, LatAm)';
            END IF;
        END IF;
    END IF;
    
    -- Role 156/161: Regulatory Compliance Director
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Compliance Director'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-compliance-director' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Compliance Director',
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
                'Regulatory Compliance Director',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Compliance Director',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Compliance Director',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    -- Role 157/161: Regulatory Labeling Manager
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Labeling Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-labeling-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Labeling Manager',
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
                'Regulatory Labeling Manager',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Labeling Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Labeling Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    -- Role 158/161: Regulatory Compliance Manager
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Compliance Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-compliance-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Compliance Manager',
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
                'Regulatory Compliance Manager',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Compliance Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Compliance Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    -- Role 159/161: Regulatory Systems Manager
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Systems Manager'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-systems-manager' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Systems Manager',
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
                'Regulatory Systems Manager',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Systems Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Systems Manager',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    -- Role 160/161: Regulatory Labeling Specialist
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Labeling Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-labeling-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Labeling Specialist',
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
                'Regulatory Labeling Specialist',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Labeling Specialist',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Labeling Specialist',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    -- Role 161/161: Regulatory Systems Specialist
    -- Function: Regulatory Affairs, Department: Regulatory Compliance & Systems
    
    -- Get function ID
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text = 'Regulatory Affairs'
    LIMIT 1;
    
    -- Get department ID
    IF matched_function_id IS NOT NULL THEN
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name = 'Regulatory Compliance & Systems'
        LIMIT 1;
    END IF;
    
    -- Check if role exists
    SELECT id INTO existing_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND LOWER(TRIM(role_name)) = LOWER(TRIM('Regulatory Systems Specialist'))
    LIMIT 1;
    
    -- Create or update role
    IF existing_role_id IS NULL THEN
        -- Create new role
        unique_id_value := 'role-' || 'regulatory-systems-specialist' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
        
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
            unique_id_value,
            'Regulatory Systems Specialist',
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
                'Regulatory Systems Specialist',
                'Regulatory Affairs',
                'Regulatory Compliance & Systems';
        END IF;
    ELSE
        -- Update existing role
        UPDATE public.org_roles
        SET 
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE id = existing_role_id;
        
        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        IF roles_updated > 0 THEN
            roles_mapped := roles_mapped + 1;
            IF matched_department_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',
                    'Regulatory Systems Specialist',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            ELSE
                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',
                    'Regulatory Systems Specialist',
                    'Regulatory Affairs',
                    'Regulatory Compliance & Systems';
            END IF;
        END IF;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE '  - Total roles processed: %', 161;
    RAISE NOTICE '  - Roles created: %', roles_created;
    RAISE NOTICE '  - Roles mapped: %', roles_mapped;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete.';
END $$;

COMMIT;