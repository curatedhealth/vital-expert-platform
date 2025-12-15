-- =====================================================================
-- MAP PERSONAS TO ROLES, FUNCTIONS, AND DEPARTMENTS BY NAME
-- Based on persona name/slug to role/function/department name mapping
-- Total personas to map: 50
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    persona_record RECORD;
    matched_persona_id uuid;
    matched_role_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    personas_updated INTEGER := 0;
    update_count INTEGER;
    personas_not_found TEXT[] := ARRAY[]::TEXT[];
    roles_not_found TEXT[] := ARRAY[]::TEXT[];
    functions_not_found TEXT[] := ARRAY[]::TEXT[];
    departments_not_found TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;

    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;

    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🔄 MAPPING PERSONAS BY NAME/SLUG TO ROLES/FUNCTIONS/DEPARTMENTS';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE '';

    -- =====================================================================
    -- Persona 1: Dr. Lawrence Garcia
    -- Slug: dr-lawrence-garcia-field-trainer-advanced
    -- Role: Director, Field Enablement, Function: Commercial, Department: Sales
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-lawrence-garcia-field-trainer-advanced' OR name ILIKE 'Dr. Lawrence Garcia')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Commercial' THEN 1
             WHEN name::text ILIKE '%Commercial%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Sales%'
    ORDER BY
        CASE WHEN name ILIKE 'Sales' THEN 1
             WHEN name ILIKE '%Sales%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Director, Field Enablement%'
    ORDER BY
        CASE WHEN name ILIKE 'Director, Field Enablement' THEN 1
             WHEN name ILIKE '%Director, Field Enablement%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Lawrence Garcia';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Lawrence Garcia';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Lawrence Garcia (slug: dr-lawrence-garcia-field-trainer-advanced)';
        personas_not_found := array_append(personas_not_found, 'Dr. Lawrence Garcia (dr-lawrence-garcia-field-trainer-advanced)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Director, Field Enablement' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Director, Field Enablement');
    END IF;
    IF matched_function_id IS NULL AND 'Commercial' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Commercial');
    END IF;
    IF matched_department_id IS NULL AND 'Sales' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Sales');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 2: Dr. Priya Singh
    -- Slug: dr-priya-singh-field-trainer-compliance
    -- Role: Director, Field Enablement, Function: Commercial, Department: Sales
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-priya-singh-field-trainer-compliance' OR name ILIKE 'Dr. Priya Singh')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Commercial' THEN 1
             WHEN name::text ILIKE '%Commercial%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Sales%'
    ORDER BY
        CASE WHEN name ILIKE 'Sales' THEN 1
             WHEN name ILIKE '%Sales%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Director, Field Enablement%'
    ORDER BY
        CASE WHEN name ILIKE 'Director, Field Enablement' THEN 1
             WHEN name ILIKE '%Director, Field Enablement%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Priya Singh';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Priya Singh';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Priya Singh (slug: dr-priya-singh-field-trainer-compliance)';
        personas_not_found := array_append(personas_not_found, 'Dr. Priya Singh (dr-priya-singh-field-trainer-compliance)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Director, Field Enablement' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Director, Field Enablement');
    END IF;
    IF matched_function_id IS NULL AND 'Commercial' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Commercial');
    END IF;
    IF matched_department_id IS NULL AND 'Sales' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Sales');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 3: Dr. Victoria Thompson
    -- Slug: dr-victoria-thompson-field-trainer-onboarding
    -- Role: Director, Field Enablement, Function: Commercial, Department: Sales
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-victoria-thompson-field-trainer-onboarding' OR name ILIKE 'Dr. Victoria Thompson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Commercial' THEN 1
             WHEN name::text ILIKE '%Commercial%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Sales%'
    ORDER BY
        CASE WHEN name ILIKE 'Sales' THEN 1
             WHEN name ILIKE '%Sales%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Director, Field Enablement%'
    ORDER BY
        CASE WHEN name ILIKE 'Director, Field Enablement' THEN 1
             WHEN name ILIKE '%Director, Field Enablement%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Victoria Thompson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Victoria Thompson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Victoria Thompson (slug: dr-victoria-thompson-field-trainer-onboarding)';
        personas_not_found := array_append(personas_not_found, 'Dr. Victoria Thompson (dr-victoria-thompson-field-trainer-onboarding)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Director, Field Enablement' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Director, Field Enablement');
    END IF;
    IF matched_function_id IS NULL AND 'Commercial' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Commercial');
    END IF;
    IF matched_department_id IS NULL AND 'Sales' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Sales');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 4: Dr. Jessica Martinez
    -- Slug: dr-jessica-martinez-safety-physician-signal
    -- Role: Safety Physician, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-jessica-martinez-safety-physician-signal' OR name ILIKE 'Dr. Jessica Martinez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Safety Physician%'
    ORDER BY
        CASE WHEN name ILIKE 'Safety Physician' THEN 1
             WHEN name ILIKE '%Safety Physician%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Jessica Martinez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Jessica Martinez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Jessica Martinez (slug: dr-jessica-martinez-safety-physician-signal)';
        personas_not_found := array_append(personas_not_found, 'Dr. Jessica Martinez (dr-jessica-martinez-safety-physician-signal)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Safety Physician' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Safety Physician');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 5: Dr. Ryan O''Connor
    -- Slug: dr-ryan-oconnor-safety-physician-periodic
    -- Role: Safety Physician, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-ryan-oconnor-safety-physician-periodic' OR name ILIKE 'Dr. Ryan O''Connor')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Safety Physician%'
    ORDER BY
        CASE WHEN name ILIKE 'Safety Physician' THEN 1
             WHEN name ILIKE '%Safety Physician%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Ryan O''Connor';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Ryan O''Connor';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Ryan O''Connor (slug: dr-ryan-oconnor-safety-physician-periodic)';
        personas_not_found := array_append(personas_not_found, 'Dr. Ryan O''Connor (dr-ryan-oconnor-safety-physician-periodic)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Safety Physician' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Safety Physician');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 6: Dr. Sophia Andersen
    -- Slug: dr-sophia-andersen-safety-physician-events
    -- Role: Safety Physician, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-sophia-andersen-safety-physician-events' OR name ILIKE 'Dr. Sophia Andersen')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Safety Physician%'
    ORDER BY
        CASE WHEN name ILIKE 'Safety Physician' THEN 1
             WHEN name ILIKE '%Safety Physician%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Sophia Andersen';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Sophia Andersen';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Sophia Andersen (slug: dr-sophia-andersen-safety-physician-events)';
        personas_not_found := array_append(personas_not_found, 'Dr. Sophia Andersen (dr-sophia-andersen-safety-physician-events)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Safety Physician' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Safety Physician');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 7: Dr. Thomas Clarke
    -- Slug: dr-thomas-clarke-safety-physician-risk
    -- Role: Safety Physician, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-thomas-clarke-safety-physician-risk' OR name ILIKE 'Dr. Thomas Clarke')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Safety Physician%'
    ORDER BY
        CASE WHEN name ILIKE 'Safety Physician' THEN 1
             WHEN name ILIKE '%Safety Physician%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Thomas Clarke';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Thomas Clarke';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Thomas Clarke (slug: dr-thomas-clarke-safety-physician-risk)';
        personas_not_found := array_append(personas_not_found, 'Dr. Thomas Clarke (dr-thomas-clarke-safety-physician-risk)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Safety Physician' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Safety Physician');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 8: Dr. Christopher Davis
    -- Slug: dr-christopher-davis-study-site-med-lead-selection
    -- Role: Study Site Medical Lead, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-davis-study-site-med-lead-selection' OR name ILIKE 'Dr. Christopher Davis')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Study Site Medical Lead%'
    ORDER BY
        CASE WHEN name ILIKE 'Study Site Medical Lead' THEN 1
             WHEN name ILIKE '%Study Site Medical Lead%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Davis';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Davis';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Davis (slug: dr-christopher-davis-study-site-med-lead-selection)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Davis (dr-christopher-davis-study-site-med-lead-selection)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Study Site Medical Lead' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Study Site Medical Lead');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 9: Dr. Kevin Murphy
    -- Slug: dr-kevin-murphy-study-site-med-lead-management
    -- Role: Study Site Medical Lead, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-kevin-murphy-study-site-med-lead-management' OR name ILIKE 'Dr. Kevin Murphy')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Study Site Medical Lead%'
    ORDER BY
        CASE WHEN name ILIKE 'Study Site Medical Lead' THEN 1
             WHEN name ILIKE '%Study Site Medical Lead%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Kevin Murphy';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Kevin Murphy';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Kevin Murphy (slug: dr-kevin-murphy-study-site-med-lead-management)';
        personas_not_found := array_append(personas_not_found, 'Dr. Kevin Murphy (dr-kevin-murphy-study-site-med-lead-management)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Study Site Medical Lead' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Study Site Medical Lead');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 10: Dr. Natalia Volkov
    -- Slug: dr-natalia-volkov-study-site-med-lead-training
    -- Role: Study Site Medical Lead, Function: Medical Affairs, Department: Clinical Operations Support
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-natalia-volkov-study-site-med-lead-training' OR name ILIKE 'Dr. Natalia Volkov')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Clinical Operations Support%'
    ORDER BY
        CASE WHEN name ILIKE 'Clinical Operations Support' THEN 1
             WHEN name ILIKE '%Clinical Operations Support%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Study Site Medical Lead%'
    ORDER BY
        CASE WHEN name ILIKE 'Study Site Medical Lead' THEN 1
             WHEN name ILIKE '%Study Site Medical Lead%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Natalia Volkov';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Natalia Volkov';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Natalia Volkov (slug: dr-natalia-volkov-study-site-med-lead-training)';
        personas_not_found := array_append(personas_not_found, 'Dr. Natalia Volkov (dr-natalia-volkov-study-site-med-lead-training)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Study Site Medical Lead' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Study Site Medical Lead');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Clinical Operations Support' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Clinical Operations Support');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 11: Dr. Christopher Martin
    -- Slug: dr-christopher-martin-epidemiologist-registry
    -- Role: Epidemiologist, Function: Medical Affairs, Department: Evidence Generation & HEOR
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-martin-epidemiologist-registry' OR name ILIKE 'Dr. Christopher Martin')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Evidence Generation & HEOR%'
    ORDER BY
        CASE WHEN name ILIKE 'Evidence Generation & HEOR' THEN 1
             WHEN name ILIKE '%Evidence Generation & HEOR%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Epidemiologist%'
    ORDER BY
        CASE WHEN name ILIKE 'Epidemiologist' THEN 1
             WHEN name ILIKE '%Epidemiologist%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Martin';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Martin';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Martin (slug: dr-christopher-martin-epidemiologist-registry)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Martin (dr-christopher-martin-epidemiologist-registry)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Epidemiologist' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Epidemiologist');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Evidence Generation & HEOR' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Evidence Generation & HEOR');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 12: Dr. Elizabeth Rodriguez
    -- Slug: dr-elizabeth-rodriguez-epidemiologist-safety
    -- Role: Epidemiologist, Function: Medical Affairs, Department: Evidence Generation & HEOR
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elizabeth-rodriguez-epidemiologist-safety' OR name ILIKE 'Dr. Elizabeth Rodriguez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Evidence Generation & HEOR%'
    ORDER BY
        CASE WHEN name ILIKE 'Evidence Generation & HEOR' THEN 1
             WHEN name ILIKE '%Evidence Generation & HEOR%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Epidemiologist%'
    ORDER BY
        CASE WHEN name ILIKE 'Epidemiologist' THEN 1
             WHEN name ILIKE '%Epidemiologist%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elizabeth Rodriguez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elizabeth Rodriguez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elizabeth Rodriguez (slug: dr-elizabeth-rodriguez-epidemiologist-safety)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elizabeth Rodriguez (dr-elizabeth-rodriguez-epidemiologist-safety)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Epidemiologist' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Epidemiologist');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Evidence Generation & HEOR' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Evidence Generation & HEOR');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 13: Dr. James Lee
    -- Slug: dr-james-lee-epidemiologist-disease
    -- Role: Epidemiologist, Function: Medical Affairs, Department: Evidence Generation & HEOR
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-james-lee-epidemiologist-disease' OR name ILIKE 'Dr. James Lee')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Evidence Generation & HEOR%'
    ORDER BY
        CASE WHEN name ILIKE 'Evidence Generation & HEOR' THEN 1
             WHEN name ILIKE '%Evidence Generation & HEOR%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Epidemiologist%'
    ORDER BY
        CASE WHEN name ILIKE 'Epidemiologist' THEN 1
             WHEN name ILIKE '%Epidemiologist%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. James Lee';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. James Lee';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. James Lee (slug: dr-james-lee-epidemiologist-disease)';
        personas_not_found := array_append(personas_not_found, 'Dr. James Lee (dr-james-lee-epidemiologist-disease)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Epidemiologist' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Epidemiologist');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Evidence Generation & HEOR' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Evidence Generation & HEOR');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 14: Dr. Jennifer Adams
    -- Slug: dr-jennifer-adams-epi
    -- Role: Epidemiologist, Function: Medical Affairs, Department: Evidence Generation & HEOR
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-jennifer-adams-epi' OR name ILIKE 'Dr. Jennifer Adams')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Evidence Generation & HEOR%'
    ORDER BY
        CASE WHEN name ILIKE 'Evidence Generation & HEOR' THEN 1
             WHEN name ILIKE '%Evidence Generation & HEOR%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Epidemiologist%'
    ORDER BY
        CASE WHEN name ILIKE 'Epidemiologist' THEN 1
             WHEN name ILIKE '%Epidemiologist%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Jennifer Adams';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Jennifer Adams';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Jennifer Adams (slug: dr-jennifer-adams-epi)';
        personas_not_found := array_append(personas_not_found, 'Dr. Jennifer Adams (dr-jennifer-adams-epi)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Epidemiologist' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Epidemiologist');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Evidence Generation & HEOR' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Evidence Generation & HEOR');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 15: Dr. Victoria Thompson
    -- Slug: dr-victoria-thompson-epidemiologist-infectious
    -- Role: Epidemiologist, Function: Medical Affairs, Department: Evidence Generation & HEOR
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-victoria-thompson-epidemiologist-infectious' OR name ILIKE 'Dr. Victoria Thompson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Evidence Generation & HEOR%'
    ORDER BY
        CASE WHEN name ILIKE 'Evidence Generation & HEOR' THEN 1
             WHEN name ILIKE '%Evidence Generation & HEOR%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Epidemiologist%'
    ORDER BY
        CASE WHEN name ILIKE 'Epidemiologist' THEN 1
             WHEN name ILIKE '%Epidemiologist%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Victoria Thompson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Victoria Thompson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Victoria Thompson (slug: dr-victoria-thompson-epidemiologist-infectious)';
        personas_not_found := array_append(personas_not_found, 'Dr. Victoria Thompson (dr-victoria-thompson-epidemiologist-infectious)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Epidemiologist' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Epidemiologist');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Evidence Generation & HEOR' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Evidence Generation & HEOR');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 16: Dr. Amanda Wilson
    -- Slug: dr-amanda-wilson-msl-immunology
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-amanda-wilson-msl-immunology' OR name ILIKE 'Dr. Amanda Wilson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Amanda Wilson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Amanda Wilson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Amanda Wilson (slug: dr-amanda-wilson-msl-immunology)';
        personas_not_found := array_append(personas_not_found, 'Dr. Amanda Wilson (dr-amanda-wilson-msl-immunology)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 17: Dr. Christopher Anderson
    -- Slug: dr-christopher-anderson-msl-launch
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-anderson-msl-launch' OR name ILIKE 'Dr. Christopher Anderson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Anderson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Anderson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Anderson (slug: dr-christopher-anderson-msl-launch)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Anderson (dr-christopher-anderson-msl-launch)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 18: Dr. David Lee
    -- Slug: dr-david-lee-msl-cardiovascular
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-david-lee-msl-cardiovascular' OR name ILIKE 'Dr. David Lee')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. David Lee';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. David Lee';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. David Lee (slug: dr-david-lee-msl-cardiovascular)';
        personas_not_found := array_append(personas_not_found, 'Dr. David Lee (dr-david-lee-msl-cardiovascular)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 19: Dr. Elizabeth Kim
    -- Slug: dr-elizabeth-kim-msl-manager-strategic
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elizabeth-kim-msl-manager-strategic' OR name ILIKE 'Dr. Elizabeth Kim')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elizabeth Kim';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elizabeth Kim';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elizabeth Kim (slug: dr-elizabeth-kim-msl-manager-strategic)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elizabeth Kim (dr-elizabeth-kim-msl-manager-strategic)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 20: Dr. Giovanni Rossi
    -- Slug: dr-giovanni-rossi-msl-manager-performance
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-giovanni-rossi-msl-manager-performance' OR name ILIKE 'Dr. Giovanni Rossi')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Giovanni Rossi';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Giovanni Rossi';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Giovanni Rossi (slug: dr-giovanni-rossi-msl-manager-performance)';
        personas_not_found := array_append(personas_not_found, 'Dr. Giovanni Rossi (dr-giovanni-rossi-msl-manager-performance)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 21: Dr. Michael O''Brien
    -- Slug: dr-michael-obrien-msl-manager-hands-on
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-michael-obrien-msl-manager-hands-on' OR name ILIKE 'Dr. Michael O''Brien')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Michael O''Brien';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Michael O''Brien';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Michael O''Brien (slug: dr-michael-obrien-msl-manager-hands-on)';
        personas_not_found := array_append(personas_not_found, 'Dr. Michael O''Brien (dr-michael-obrien-msl-manager-hands-on)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 22: Dr. Rebecca Martinez
    -- Slug: dr-rebecca-martinez-msl-specialty
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-rebecca-martinez-msl-specialty' OR name ILIKE 'Dr. Rebecca Martinez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Rebecca Martinez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Rebecca Martinez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Rebecca Martinez (slug: dr-rebecca-martinez-msl-specialty)';
        personas_not_found := array_append(personas_not_found, 'Dr. Rebecca Martinez (dr-rebecca-martinez-msl-specialty)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 23: Dr. Robert Kim
    -- Slug: dr-robert-kim-msl-mgr
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-robert-kim-msl-mgr' OR name ILIKE 'Dr. Robert Kim')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Robert Kim';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Robert Kim';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Robert Kim (slug: dr-robert-kim-msl-mgr)';
        personas_not_found := array_append(personas_not_found, 'Dr. Robert Kim (dr-robert-kim-msl-mgr)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 24: Dr. Timothy Brown
    -- Slug: dr-timothy-brown-msl-oncology-specialist
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-timothy-brown-msl-oncology-specialist' OR name ILIKE 'Dr. Timothy Brown')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Timothy Brown';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Timothy Brown';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Timothy Brown (slug: dr-timothy-brown-msl-oncology-specialist)';
        personas_not_found := array_append(personas_not_found, 'Dr. Timothy Brown (dr-timothy-brown-msl-oncology-specialist)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 25: Dr. Yuki Tanaka
    -- Slug: dr-yuki-tanaka-msl-manager-development
    -- Role: MSL Manager, Function: Medical Affairs, Department: Field Medical
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-yuki-tanaka-msl-manager-development' OR name ILIKE 'Dr. Yuki Tanaka')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Field Medical%'
    ORDER BY
        CASE WHEN name ILIKE 'Field Medical' THEN 1
             WHEN name ILIKE '%Field Medical%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%MSL Manager%'
    ORDER BY
        CASE WHEN name ILIKE 'MSL Manager' THEN 1
             WHEN name ILIKE '%MSL Manager%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Yuki Tanaka';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Yuki Tanaka';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Yuki Tanaka (slug: dr-yuki-tanaka-msl-manager-development)';
        personas_not_found := array_append(personas_not_found, 'Dr. Yuki Tanaka (dr-yuki-tanaka-msl-manager-development)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'MSL Manager' != '' THEN
        roles_not_found := array_append(roles_not_found, 'MSL Manager');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Field Medical' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Field Medical');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 26: David Wilson
    -- Slug: pharma-david-wilson-mcm
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'pharma-david-wilson-mcm' OR name ILIKE 'David Wilson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: David Wilson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: David Wilson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: David Wilson (slug: pharma-david-wilson-mcm)';
        personas_not_found := array_append(personas_not_found, 'David Wilson (pharma-david-wilson-mcm)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 27: Dr. Akiko Tanaka
    -- Slug: dr-akiko-tanaka-medical-director-global
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-akiko-tanaka-medical-director-global' OR name ILIKE 'Dr. Akiko Tanaka')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Akiko Tanaka';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Akiko Tanaka';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Akiko Tanaka (slug: dr-akiko-tanaka-medical-director-global)';
        personas_not_found := array_append(personas_not_found, 'Dr. Akiko Tanaka (dr-akiko-tanaka-medical-director-global)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 28: Dr. Amanda Foster
    -- Slug: dr-amanda-foster-med-comms-manager-launch
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-amanda-foster-med-comms-manager-launch' OR name ILIKE 'Dr. Amanda Foster')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Amanda Foster';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Amanda Foster';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Amanda Foster (slug: dr-amanda-foster-med-comms-manager-launch)';
        personas_not_found := array_append(personas_not_found, 'Dr. Amanda Foster (dr-amanda-foster-med-comms-manager-launch)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 29: Dr. Amy Zhang
    -- Slug: pharma-dr-amy-zhang-msl
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'pharma-dr-amy-zhang-msl' OR name ILIKE 'Dr. Amy Zhang')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Amy Zhang';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Amy Zhang';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Amy Zhang (slug: pharma-dr-amy-zhang-msl)';
        personas_not_found := array_append(personas_not_found, 'Dr. Amy Zhang (pharma-dr-amy-zhang-msl)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 30: Dr. Andrew Thompson
    -- Slug: dr-andrew-thompson-medical-analytics-predictive
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-andrew-thompson-medical-analytics-predictive' OR name ILIKE 'Dr. Andrew Thompson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Andrew Thompson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Andrew Thompson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Andrew Thompson (slug: dr-andrew-thompson-medical-analytics-predictive)';
        personas_not_found := array_append(personas_not_found, 'Dr. Andrew Thompson (dr-andrew-thompson-medical-analytics-predictive)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 31: Dr. Andrew Thompson
    -- Slug: dr-andrew-thompson-medical-monitor-rare
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-andrew-thompson-medical-monitor-rare' OR name ILIKE 'Dr. Andrew Thompson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Andrew Thompson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Andrew Thompson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Andrew Thompson (slug: dr-andrew-thompson-medical-monitor-rare)';
        personas_not_found := array_append(personas_not_found, 'Dr. Andrew Thompson (dr-andrew-thompson-medical-monitor-rare)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 32: Dr. Andrew Thompson
    -- Slug: dr-andrew-thompson-med-info-specialist
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-andrew-thompson-med-info-specialist' OR name ILIKE 'Dr. Andrew Thompson')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Andrew Thompson';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Andrew Thompson';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Andrew Thompson (slug: dr-andrew-thompson-med-info-specialist)';
        personas_not_found := array_append(personas_not_found, 'Dr. Andrew Thompson (dr-andrew-thompson-med-info-specialist)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 33: Dr. Anthony Rossi
    -- Slug: dr-anthony-rossi-medical-operations-resources
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-anthony-rossi-medical-operations-resources' OR name ILIKE 'Dr. Anthony Rossi')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Anthony Rossi';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Anthony Rossi';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Anthony Rossi (slug: dr-anthony-rossi-medical-operations-resources)';
        personas_not_found := array_append(personas_not_found, 'Dr. Anthony Rossi (dr-anthony-rossi-medical-operations-resources)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 34: Dr. Anthony Rossi
    -- Slug: dr-anthony-rossi-med-info-manager-patient
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-anthony-rossi-med-info-manager-patient' OR name ILIKE 'Dr. Anthony Rossi')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Anthony Rossi';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Anthony Rossi';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Anthony Rossi (slug: dr-anthony-rossi-med-info-manager-patient)';
        personas_not_found := array_append(personas_not_found, 'Dr. Anthony Rossi (dr-anthony-rossi-med-info-manager-patient)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 35: Dr. Anthony Rossi
    -- Slug: dr-anthony-rossi-medical-writer-scientific-digital
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-anthony-rossi-medical-writer-scientific-digital' OR name ILIKE 'Dr. Anthony Rossi')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Anthony Rossi';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Anthony Rossi';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Anthony Rossi (slug: dr-anthony-rossi-medical-writer-scientific-digital)';
        personas_not_found := array_append(personas_not_found, 'Dr. Anthony Rossi (dr-anthony-rossi-medical-writer-scientific-digital)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 36: Dr. Catherine Lefevre
    -- Slug: dr-catherine-lefevre-med-info-manager-regulatory
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-catherine-lefevre-med-info-manager-regulatory' OR name ILIKE 'Dr. Catherine Lefevre')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Catherine Lefevre';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Catherine Lefevre';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Catherine Lefevre (slug: dr-catherine-lefevre-med-info-manager-regulatory)';
        personas_not_found := array_append(personas_not_found, 'Dr. Catherine Lefevre (dr-catherine-lefevre-med-info-manager-regulatory)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 37: Dr. Catherine Lefevre
    -- Slug: dr-catherine-lefevre-medical-writer-scientific-congress
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-catherine-lefevre-medical-writer-scientific-congress' OR name ILIKE 'Dr. Catherine Lefevre')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Catherine Lefevre';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Catherine Lefevre';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Catherine Lefevre (slug: dr-catherine-lefevre-medical-writer-scientific-congress)';
        personas_not_found := array_append(personas_not_found, 'Dr. Catherine Lefevre (dr-catherine-lefevre-medical-writer-scientific-congress)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 38: Dr. Christopher Davis
    -- Slug: dr-christopher-davis-med-content-compliance
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-davis-med-content-compliance' OR name ILIKE 'Dr. Christopher Davis')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Davis';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Davis';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Davis (slug: dr-christopher-davis-med-content-compliance)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Davis (dr-christopher-davis-med-content-compliance)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 39: Dr. Christopher Martin
    -- Slug: dr-christopher-martin-medical-quality-manager-improvement
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-martin-medical-quality-manager-improvement' OR name ILIKE 'Dr. Christopher Martin')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Martin';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Martin';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Martin (slug: dr-christopher-martin-medical-quality-manager-improvement)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Martin (dr-christopher-martin-medical-quality-manager-improvement)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 40: Dr. Christopher Martin
    -- Slug: dr-christopher-martin-medical-education-director-patient
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-christopher-martin-medical-education-director-patient' OR name ILIKE 'Dr. Christopher Martin')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Christopher Martin';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Christopher Martin';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Christopher Martin (slug: dr-christopher-martin-medical-education-director-patient)';
        personas_not_found := array_append(personas_not_found, 'Dr. Christopher Martin (dr-christopher-martin-medical-education-director-patient)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 41: Dr. David Park
    -- Slug: dr-david-park-medical-writer-scientific-manuscript
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-david-park-medical-writer-scientific-manuscript' OR name ILIKE 'Dr. David Park')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. David Park';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. David Park';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. David Park (slug: dr-david-park-medical-writer-scientific-manuscript)';
        personas_not_found := array_append(personas_not_found, 'Dr. David Park (dr-david-park-medical-writer-scientific-manuscript)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 42: Dr. David Park
    -- Slug: dr-david-park-med-info-manager-content
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-david-park-med-info-manager-content' OR name ILIKE 'Dr. David Park')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. David Park';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. David Park';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. David Park (slug: dr-david-park-med-info-manager-content)';
        personas_not_found := array_append(personas_not_found, 'Dr. David Park (dr-david-park-med-info-manager-content)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 43: Dr. Elena Kovalenko
    -- Slug: dr-elena-kovalenko-medical-operations-budget
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elena-kovalenko-medical-operations-budget' OR name ILIKE 'Dr. Elena Kovalenko')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elena Kovalenko';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elena Kovalenko';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elena Kovalenko (slug: dr-elena-kovalenko-medical-operations-budget)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elena Kovalenko (dr-elena-kovalenko-medical-operations-budget)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 44: Dr. Elena Kovalenko
    -- Slug: dr-elena-kovalenko-medical-writer-scientific-social
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elena-kovalenko-medical-writer-scientific-social' OR name ILIKE 'Dr. Elena Kovalenko')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elena Kovalenko';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elena Kovalenko';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elena Kovalenko (slug: dr-elena-kovalenko-medical-writer-scientific-social)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elena Kovalenko (dr-elena-kovalenko-medical-writer-scientific-social)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 45: Dr. Elena Rodriguez
    -- Slug: pharma-dr-elena-rodriguez-md
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'pharma-dr-elena-rodriguez-md' OR name ILIKE 'Dr. Elena Rodriguez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elena Rodriguez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elena Rodriguez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elena Rodriguez (slug: pharma-dr-elena-rodriguez-md)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elena Rodriguez (pharma-dr-elena-rodriguez-md)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 46: Dr. Elizabeth Rodriguez
    -- Slug: dr-elizabeth-rodriguez-medical-quality-manager-sop
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elizabeth-rodriguez-medical-quality-manager-sop' OR name ILIKE 'Dr. Elizabeth Rodriguez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elizabeth Rodriguez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elizabeth Rodriguez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elizabeth Rodriguez (slug: dr-elizabeth-rodriguez-medical-quality-manager-sop)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elizabeth Rodriguez (dr-elizabeth-rodriguez-medical-quality-manager-sop)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 47: Dr. Elizabeth Rodriguez
    -- Slug: dr-elizabeth-rodriguez-medical-education-director-hcp
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-elizabeth-rodriguez-medical-education-director-hcp' OR name ILIKE 'Dr. Elizabeth Rodriguez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Elizabeth Rodriguez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Elizabeth Rodriguez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Elizabeth Rodriguez (slug: dr-elizabeth-rodriguez-medical-education-director-hcp)';
        personas_not_found := array_append(personas_not_found, 'Dr. Elizabeth Rodriguez (dr-elizabeth-rodriguez-medical-education-director-hcp)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 48: Dr. Emily Taylor
    -- Slug: dr-emily-taylor-mws
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-emily-taylor-mws' OR name ILIKE 'Dr. Emily Taylor')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Emily Taylor';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Emily Taylor';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Emily Taylor (slug: dr-emily-taylor-mws)';
        personas_not_found := array_append(personas_not_found, 'Dr. Emily Taylor (dr-emily-taylor-mws)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 49: Dr. Emma Rodriguez
    -- Slug: dr-emma-rodriguez-msl-early-career
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-emma-rodriguez-msl-early-career' OR name ILIKE 'Dr. Emma Rodriguez')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Emma Rodriguez';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Emma Rodriguez';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Emma Rodriguez (slug: dr-emma-rodriguez-msl-early-career)';
        personas_not_found := array_append(personas_not_found, 'Dr. Emma Rodriguez (dr-emma-rodriguez-msl-early-career)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    -- =====================================================================
    -- Persona 50: Dr. Hassan Al-Rashid
    -- Slug: dr-hassan-al-rashid-medical-monitor-phase
    -- Role: Chief Medical Officer, Function: Medical Affairs, Department: Leadership
    -- =====================================================================

    -- Find persona
    SELECT id INTO matched_persona_id
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (slug = 'dr-hassan-al-rashid-medical-monitor-phase' OR name ILIKE 'Dr. Hassan Al-Rashid')
      AND deleted_at IS NULL
    LIMIT 1;

    -- Find function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY
        CASE WHEN name::text ILIKE 'Medical Affairs' THEN 1
             WHEN name::text ILIKE '%Medical Affairs%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find department
    SELECT id INTO matched_department_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND name ILIKE '%Leadership%'
    ORDER BY
        CASE WHEN name ILIKE 'Leadership' THEN 1
             WHEN name ILIKE '%Leadership%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Find role
    SELECT id INTO matched_role_id
    FROM public.org_roles
    WHERE tenant_id = pharma_tenant_id
      AND (function_id = matched_function_id OR matched_function_id IS NULL)
      AND (department_id = matched_department_id OR matched_department_id IS NULL)
      AND name ILIKE '%Chief Medical Officer%'
    ORDER BY
        CASE WHEN name ILIKE 'Chief Medical Officer' THEN 1
             WHEN name ILIKE '%Chief Medical Officer%' THEN 2
             ELSE 3 END
    LIMIT 1;

    -- Update persona if found
    IF matched_persona_id IS NOT NULL THEN
        UPDATE public.personas
        SET
            role_id = COALESCE(matched_role_id, role_id),
            function_id = COALESCE(matched_function_id, function_id),
            department_id = COALESCE(matched_department_id, department_id),
            updated_at = NOW()
        WHERE id = matched_persona_id
          AND (
              role_id IS DISTINCT FROM matched_role_id
              OR function_id IS DISTINCT FROM matched_function_id
              OR department_id IS DISTINCT FROM matched_department_id
          );

        GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + 1;
            RAISE NOTICE '  ✅ Updated: Dr. Hassan Al-Rashid';
        ELSE
            RAISE NOTICE '  ⚠️  No changes needed: Dr. Hassan Al-Rashid';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Persona not found: Dr. Hassan Al-Rashid (slug: dr-hassan-al-rashid-medical-monitor-phase)';
        personas_not_found := array_append(personas_not_found, 'Dr. Hassan Al-Rashid (dr-hassan-al-rashid-medical-monitor-phase)');
    END IF;

    -- Track missing entities
    IF matched_role_id IS NULL AND 'Chief Medical Officer' != '' THEN
        roles_not_found := array_append(roles_not_found, 'Chief Medical Officer');
    END IF;
    IF matched_function_id IS NULL AND 'Medical Affairs' != '' THEN
        functions_not_found := array_append(functions_not_found, 'Medical Affairs');
    END IF;
    IF matched_department_id IS NULL AND 'Leadership' != '' THEN
        departments_not_found := array_append(departments_not_found, 'Leadership');
    END IF;

    -- Reset variables for next iteration
    matched_persona_id := NULL;
    matched_role_id := NULL;
    matched_function_id := NULL;
    matched_department_id := NULL;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MAPPING COMPLETE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Total personas updated: %', personas_updated;

    IF array_length(personas_not_found, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Personas not found (%):', array_length(personas_not_found, 1);
        RAISE NOTICE '%', array_to_string(personas_not_found, ', ');
    END IF;

    IF array_length(roles_not_found, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Roles not found (%):', array_length(roles_not_found, 1);
        RAISE NOTICE '%', array_to_string(roles_not_found, ', ');
    END IF;

    IF array_length(functions_not_found, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Functions not found (%):', array_length(functions_not_found, 1);
        RAISE NOTICE '%', array_to_string(functions_not_found, ', ');
    END IF;

    IF array_length(departments_not_found, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  Departments not found (%):', array_length(departments_not_found, 1);
        RAISE NOTICE '%', array_to_string(departments_not_found, ', ');
    END IF;

END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Summary statistics
SELECT 
    '=== MAPPING SUMMARY ===' as section;

SELECT 
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped
FROM public.personas
WHERE deleted_at IS NULL;
