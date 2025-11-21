-- =====================================================================
-- MAP PHARMACEUTICALS TENANT ROLES TO PERSONAS
-- Generated from BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- Maps all personas to their corresponding roles, functions, and departments
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    persona_record RECORD;
    matched_role_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    personas_updated INTEGER := 0;
    personas_not_found INTEGER := 0;
    roles_not_found INTEGER := 0;
    update_count INTEGER;
    has_name_col boolean;
    has_slug_col boolean;
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
    RAISE NOTICE '=== MAPPING ROLES TO PERSONAS FROM JSON ===';
    RAISE NOTICE '';

    -- Check which columns exist in personas table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'personas'
          AND column_name = 'name'
    ) INTO has_name_col;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'personas'
          AND column_name = 'slug'
    ) INTO has_slug_col;

    -- =====================================================================
    -- MEDICAL AFFAIRS - Field Medical - Medical Science Liaison
    -- =====================================================================
    
    -- Find the role: Medical Science Liaison
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE 'Medical Science Liaison'
      AND f.name::text ILIKE 'Medical Affairs'
      AND d.name ILIKE 'Field Medical'
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Map all 4 Medical Science Liaison personas
        FOR persona_record IN 
            SELECT unnest(ARRAY[
                'medical_science_liaison_1_field_medical_medical_affairs',
                'medical_science_liaison_2_field_medical_medical_affairs',
                'medical_science_liaison_3_field_medical_medical_affairs',
                'medical_science_liaison_4_field_medical_medical_affairs'
            ]) AS persona_slug
        LOOP
            IF has_slug_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE slug = persona_record.persona_slug
                   OR (name ILIKE '%Medical Science Liaison Persona%' 
                       AND name ILIKE '%Field Medical%' 
                       AND name ILIKE '%Medical Affairs%'
                       AND slug IS NULL);
            ELSIF has_name_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE name ILIKE '%Medical Science Liaison Persona%' 
                  AND name ILIKE '%Field Medical%' 
                  AND name ILIKE '%Medical Affairs%';
            END IF;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + update_count;
            END IF;
        END LOOP;

        RAISE NOTICE '  ✅ Mapped Medical Science Liaison personas (4 personas)';
    ELSE
        roles_not_found := roles_not_found + 1;
        RAISE NOTICE '  ❌ Role not found: Medical Science Liaison (Medical Affairs > Field Medical)';
    END IF;

    -- =====================================================================
    -- MEDICAL AFFAIRS - HEOR & Evidence - HEOR Director
    -- =====================================================================
    
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE 'HEOR Director'
      AND f.name::text ILIKE 'Medical Affairs'
      AND (d.name ILIKE 'HEOR & Evidence' OR d.name ILIKE 'HEOR%Evidence')
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        FOR persona_record IN 
            SELECT unnest(ARRAY[
                'heor_director_1_heor_&_evidence_medical_affairs',
                'heor_director_2_heor_&_evidence_medical_affairs',
                'heor_director_3_heor_&_evidence_medical_affairs',
                'heor_director_4_heor_&_evidence_medical_affairs'
            ]) AS persona_slug
        LOOP
            IF has_slug_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE slug = persona_record.persona_slug
                   OR (name ILIKE '%HEOR Director Persona%' 
                       AND name ILIKE '%HEOR%Evidence%' 
                       AND name ILIKE '%Medical Affairs%'
                       AND slug IS NULL);
            ELSIF has_name_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE name ILIKE '%HEOR Director Persona%' 
                  AND name ILIKE '%HEOR%Evidence%' 
                  AND name ILIKE '%Medical Affairs%';
            END IF;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + update_count;
            END IF;
        END LOOP;

        RAISE NOTICE '  ✅ Mapped HEOR Director personas (4 personas)';
    ELSE
        roles_not_found := roles_not_found + 1;
        RAISE NOTICE '  ❌ Role not found: HEOR Director (Medical Affairs > HEOR & Evidence)';
    END IF;

    -- =====================================================================
    -- MARKET ACCESS - Leadership & Strategy - VP Market Access
    -- =====================================================================
    
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE 'VP Market Access'
      AND f.name::text ILIKE 'Market Access'
      AND (d.name ILIKE 'Leadership & Strategy' OR d.name ILIKE 'Leadership%Strategy')
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        FOR persona_record IN 
            SELECT unnest(ARRAY[
                'vp_market_access_1_leadership_&_strategy_market_access',
                'vp_market_access_2_leadership_&_strategy_market_access',
                'vp_market_access_3_leadership_&_strategy_market_access',
                'vp_market_access_4_leadership_&_strategy_market_access'
            ]) AS persona_slug
        LOOP
            IF has_slug_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE slug = persona_record.persona_slug
                   OR (name ILIKE '%VP Market Access Persona%' 
                       AND name ILIKE '%Leadership%Strategy%' 
                       AND name ILIKE '%Market Access%'
                       AND slug IS NULL);
            ELSIF has_name_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE name ILIKE '%VP Market Access Persona%' 
                  AND name ILIKE '%Leadership%Strategy%' 
                  AND name ILIKE '%Market Access%';
            END IF;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + update_count;
            END IF;
        END LOOP;

        RAISE NOTICE '  ✅ Mapped VP Market Access personas (4 personas)';
    ELSE
        roles_not_found := roles_not_found + 1;
        RAISE NOTICE '  ❌ Role not found: VP Market Access (Market Access > Leadership & Strategy)';
    END IF;

    -- =====================================================================
    -- COMMERCIAL ORGANIZATION - Commercial Ops - Commercial Lead
    -- =====================================================================
    
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE 'Commercial Lead'
      AND f.name::text ILIKE 'Commercial Organization'
      AND d.name ILIKE 'Commercial Ops'
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        FOR persona_record IN 
            SELECT unnest(ARRAY[
                'commercial_lead_1_commercial_ops_commercial_organization',
                'commercial_lead_2_commercial_ops_commercial_organization',
                'commercial_lead_3_commercial_ops_commercial_organization',
                'commercial_lead_4_commercial_ops_commercial_organization'
            ]) AS persona_slug
        LOOP
            IF has_slug_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE slug = persona_record.persona_slug
                   OR (name ILIKE '%Commercial Lead Persona%' 
                       AND name ILIKE '%Commercial Ops%' 
                       AND name ILIKE '%Commercial Organization%'
                       AND slug IS NULL);
            ELSIF has_name_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE name ILIKE '%Commercial Lead Persona%' 
                  AND name ILIKE '%Commercial Ops%' 
                  AND name ILIKE '%Commercial Organization%';
            END IF;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + update_count;
            END IF;
        END LOOP;

        RAISE NOTICE '  ✅ Mapped Commercial Lead personas (4 personas)';
    ELSE
        roles_not_found := roles_not_found + 1;
        RAISE NOTICE '  ❌ Role not found: Commercial Lead (Commercial Organization > Commercial Ops)';
    END IF;

    -- =====================================================================
    -- REGULATORY AFFAIRS - Regulatory Strategy - Chief Regulatory Officer
    -- =====================================================================
    
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE 'Chief Regulatory Officer'
      AND f.name::text ILIKE 'Regulatory Affairs'
      AND d.name ILIKE 'Regulatory Strategy'
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        FOR persona_record IN 
            SELECT unnest(ARRAY[
                'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs',
                'chief_regulatory_officer_2_regulatory_strategy_regulatory_affairs',
                'chief_regulatory_officer_3_regulatory_strategy_regulatory_affairs',
                'chief_regulatory_officer_4_regulatory_strategy_regulatory_affairs'
            ]) AS persona_slug
        LOOP
            IF has_slug_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE slug = persona_record.persona_slug
                   OR (name ILIKE '%Chief Regulatory Officer Persona%' 
                       AND name ILIKE '%Regulatory Strategy%' 
                       AND name ILIKE '%Regulatory Affairs%'
                       AND slug IS NULL);
            ELSIF has_name_col THEN
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    updated_at = NOW()
                WHERE name ILIKE '%Chief Regulatory Officer Persona%' 
                  AND name ILIKE '%Regulatory Strategy%' 
                  AND name ILIKE '%Regulatory Affairs%';
            END IF;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + update_count;
            END IF;
        END LOOP;

        RAISE NOTICE '  ✅ Mapped Chief Regulatory Officer personas (4 personas)';
    ELSE
        roles_not_found := roles_not_found + 1;
        RAISE NOTICE '  ❌ Role not found: Chief Regulatory Officer (Regulatory Affairs > Regulatory Strategy)';
    END IF;

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Total personas expected: 20';
    RAISE NOTICE '  - Personas updated: %', personas_updated;
    RAISE NOTICE '  - Roles not found: %', roles_not_found;
    RAISE NOTICE '';
    
    -- Count personas that still need mapping
    SELECT COUNT(*) INTO personas_not_found
    FROM public.personas p
    WHERE p.role_id IS NULL
      AND (
          p.name ILIKE '%Medical Science Liaison%'
          OR p.name ILIKE '%HEOR Director%'
          OR p.name ILIKE '%VP Market Access%'
          OR p.name ILIKE '%Commercial Lead%'
          OR p.name ILIKE '%Chief Regulatory Officer%'
      );
    
    IF personas_not_found > 0 THEN
        RAISE NOTICE '  ⚠️  Warning: % personas still unmapped', personas_not_found;
    ELSE
        RAISE NOTICE '  ✅ All personas from JSON have been mapped!';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role to persona mapping process finished.';
END $$;

COMMIT;

