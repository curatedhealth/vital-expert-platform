-- =====================================================================
-- MAP PERSONAS TO ROLES, FUNCTIONS, AND DEPARTMENTS
-- Generated from BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- Total personas: 20
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
    query_str text;
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
    RAISE NOTICE '=== MAPPING PERSONAS TO ROLES ===';
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

    -- Check org_roles column structure
    -- We'll use dynamic matching in the loop

    -- Persona: Medical Science Liaison Persona 1 - Field Medical - Medical Affairs
    -- Role: Medical Science Liaison, Function: Medical Affairs, Department: Field Medical
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Medical Science Liaison'
        OR r.name::text ILIKE '%Medical Science Liaison%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Medical Science Liaison' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'medical_science_liaison_1_field_medical_medical_affairs'
               OR (name ILIKE '%Medical Science Liaison Persona 1 - Field Medical - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Medical Science Liaison Persona 1 - Field Medical - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Medical Science Liaison Persona 1 - Field Medical - Medical Affairs" -> "Medical Science Liaison"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Medical Science Liaison Persona 1 - Field Medical - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Medical Science Liaison Persona 1 - Field Medical - Medical Affairs": "Medical Science Liaison"';
        END IF;
    END IF;

    -- Persona: Medical Science Liaison Persona 2 - Field Medical - Medical Affairs
    -- Role: Medical Science Liaison, Function: Medical Affairs, Department: Field Medical
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Medical Science Liaison'
        OR r.name::text ILIKE '%Medical Science Liaison%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Medical Science Liaison' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'medical_science_liaison_2_field_medical_medical_affairs'
               OR (name ILIKE '%Medical Science Liaison Persona 2 - Field Medical - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Medical Science Liaison Persona 2 - Field Medical - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Medical Science Liaison Persona 2 - Field Medical - Medical Affairs" -> "Medical Science Liaison"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Medical Science Liaison Persona 2 - Field Medical - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Medical Science Liaison Persona 2 - Field Medical - Medical Affairs": "Medical Science Liaison"';
        END IF;
    END IF;

    -- Persona: Medical Science Liaison Persona 3 - Field Medical - Medical Affairs
    -- Role: Medical Science Liaison, Function: Medical Affairs, Department: Field Medical
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Medical Science Liaison'
        OR r.name::text ILIKE '%Medical Science Liaison%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Medical Science Liaison' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'medical_science_liaison_3_field_medical_medical_affairs'
               OR (name ILIKE '%Medical Science Liaison Persona 3 - Field Medical - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Medical Science Liaison Persona 3 - Field Medical - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Medical Science Liaison Persona 3 - Field Medical - Medical Affairs" -> "Medical Science Liaison"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Medical Science Liaison Persona 3 - Field Medical - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Medical Science Liaison Persona 3 - Field Medical - Medical Affairs": "Medical Science Liaison"';
        END IF;
    END IF;

    -- Persona: Medical Science Liaison Persona 4 - Field Medical - Medical Affairs
    -- Role: Medical Science Liaison, Function: Medical Affairs, Department: Field Medical
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Medical Science Liaison'
        OR r.name::text ILIKE '%Medical Science Liaison%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Medical Science Liaison' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'medical_science_liaison_4_field_medical_medical_affairs'
               OR (name ILIKE '%Medical Science Liaison Persona 4 - Field Medical - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Medical Science Liaison Persona 4 - Field Medical - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Medical Science Liaison Persona 4 - Field Medical - Medical Affairs" -> "Medical Science Liaison"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Medical Science Liaison Persona 4 - Field Medical - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Medical Science Liaison Persona 4 - Field Medical - Medical Affairs": "Medical Science Liaison"';
        END IF;
    END IF;

    -- Persona: HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs
    -- Role: HEOR Director, Function: Medical Affairs, Department: HEOR & Evidence
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'HEOR Director'
        OR r.name::text ILIKE '%HEOR Director%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'HEOR Director' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'heor_director_1_heor_&_evidence_medical_affairs'
               OR (name ILIKE '%HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs" -> "HEOR Director"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs": "HEOR Director"';
        END IF;
    END IF;

    -- Persona: HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs
    -- Role: HEOR Director, Function: Medical Affairs, Department: HEOR & Evidence
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'HEOR Director'
        OR r.name::text ILIKE '%HEOR Director%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'HEOR Director' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'heor_director_2_heor_&_evidence_medical_affairs'
               OR (name ILIKE '%HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs" -> "HEOR Director"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs": "HEOR Director"';
        END IF;
    END IF;

    -- Persona: HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs
    -- Role: HEOR Director, Function: Medical Affairs, Department: HEOR & Evidence
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'HEOR Director'
        OR r.name::text ILIKE '%HEOR Director%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'HEOR Director' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'heor_director_3_heor_&_evidence_medical_affairs'
               OR (name ILIKE '%HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs" -> "HEOR Director"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs": "HEOR Director"';
        END IF;
    END IF;

    -- Persona: HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs
    -- Role: HEOR Director, Function: Medical Affairs, Department: HEOR & Evidence
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'HEOR Director'
        OR r.name::text ILIKE '%HEOR Director%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'HEOR Director' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'heor_director_4_heor_&_evidence_medical_affairs'
               OR (name ILIKE '%HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs" -> "HEOR Director"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs": "HEOR Director"';
        END IF;
    END IF;

    -- Persona: VP Market Access Persona 1 - Leadership & Strategy - Market Access
    -- Role: VP Market Access, Function: Market Access, Department: Leadership & Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'VP Market Access'
        OR r.name::text ILIKE '%VP Market Access%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'VP Market Access' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'vp_market_access_1_leadership_&_strategy_market_access'
               OR (name ILIKE '%VP Market Access Persona 1 - Leadership & Strategy - Market Access%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%VP Market Access Persona 1 - Leadership & Strategy - Market Access%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "VP Market Access Persona 1 - Leadership & Strategy - Market Access" -> "VP Market Access"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "VP Market Access Persona 1 - Leadership & Strategy - Market Access"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "VP Market Access Persona 1 - Leadership & Strategy - Market Access": "VP Market Access"';
        END IF;
    END IF;

    -- Persona: VP Market Access Persona 2 - Leadership & Strategy - Market Access
    -- Role: VP Market Access, Function: Market Access, Department: Leadership & Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'VP Market Access'
        OR r.name::text ILIKE '%VP Market Access%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'VP Market Access' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'vp_market_access_2_leadership_&_strategy_market_access'
               OR (name ILIKE '%VP Market Access Persona 2 - Leadership & Strategy - Market Access%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%VP Market Access Persona 2 - Leadership & Strategy - Market Access%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "VP Market Access Persona 2 - Leadership & Strategy - Market Access" -> "VP Market Access"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "VP Market Access Persona 2 - Leadership & Strategy - Market Access"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "VP Market Access Persona 2 - Leadership & Strategy - Market Access": "VP Market Access"';
        END IF;
    END IF;

    -- Persona: VP Market Access Persona 3 - Leadership & Strategy - Market Access
    -- Role: VP Market Access, Function: Market Access, Department: Leadership & Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'VP Market Access'
        OR r.name::text ILIKE '%VP Market Access%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'VP Market Access' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'vp_market_access_3_leadership_&_strategy_market_access'
               OR (name ILIKE '%VP Market Access Persona 3 - Leadership & Strategy - Market Access%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%VP Market Access Persona 3 - Leadership & Strategy - Market Access%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "VP Market Access Persona 3 - Leadership & Strategy - Market Access" -> "VP Market Access"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "VP Market Access Persona 3 - Leadership & Strategy - Market Access"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "VP Market Access Persona 3 - Leadership & Strategy - Market Access": "VP Market Access"';
        END IF;
    END IF;

    -- Persona: VP Market Access Persona 4 - Leadership & Strategy - Market Access
    -- Role: VP Market Access, Function: Market Access, Department: Leadership & Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'VP Market Access'
        OR r.name::text ILIKE '%VP Market Access%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'VP Market Access' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'vp_market_access_4_leadership_&_strategy_market_access'
               OR (name ILIKE '%VP Market Access Persona 4 - Leadership & Strategy - Market Access%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%VP Market Access Persona 4 - Leadership & Strategy - Market Access%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "VP Market Access Persona 4 - Leadership & Strategy - Market Access" -> "VP Market Access"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "VP Market Access Persona 4 - Leadership & Strategy - Market Access"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "VP Market Access Persona 4 - Leadership & Strategy - Market Access": "VP Market Access"';
        END IF;
    END IF;

    -- Persona: Commercial Lead Persona 1 - Commercial Ops - Commercial Organization
    -- Role: Commercial Lead, Function: Commercial Organization, Department: Commercial Ops
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Commercial Lead'
        OR r.name::text ILIKE '%Commercial Lead%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Commercial Lead' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'commercial_lead_1_commercial_ops_commercial_organization'
               OR (name ILIKE '%Commercial Lead Persona 1 - Commercial Ops - Commercial Organization%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Commercial Lead Persona 1 - Commercial Ops - Commercial Organization%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Commercial Lead Persona 1 - Commercial Ops - Commercial Organization" -> "Commercial Lead"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Commercial Lead Persona 1 - Commercial Ops - Commercial Organization"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Commercial Lead Persona 1 - Commercial Ops - Commercial Organization": "Commercial Lead"';
        END IF;
    END IF;

    -- Persona: Commercial Lead Persona 2 - Commercial Ops - Commercial Organization
    -- Role: Commercial Lead, Function: Commercial Organization, Department: Commercial Ops
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Commercial Lead'
        OR r.name::text ILIKE '%Commercial Lead%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Commercial Lead' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'commercial_lead_2_commercial_ops_commercial_organization'
               OR (name ILIKE '%Commercial Lead Persona 2 - Commercial Ops - Commercial Organization%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Commercial Lead Persona 2 - Commercial Ops - Commercial Organization%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Commercial Lead Persona 2 - Commercial Ops - Commercial Organization" -> "Commercial Lead"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Commercial Lead Persona 2 - Commercial Ops - Commercial Organization"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Commercial Lead Persona 2 - Commercial Ops - Commercial Organization": "Commercial Lead"';
        END IF;
    END IF;

    -- Persona: Commercial Lead Persona 3 - Commercial Ops - Commercial Organization
    -- Role: Commercial Lead, Function: Commercial Organization, Department: Commercial Ops
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Commercial Lead'
        OR r.name::text ILIKE '%Commercial Lead%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Commercial Lead' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'commercial_lead_3_commercial_ops_commercial_organization'
               OR (name ILIKE '%Commercial Lead Persona 3 - Commercial Ops - Commercial Organization%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Commercial Lead Persona 3 - Commercial Ops - Commercial Organization%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Commercial Lead Persona 3 - Commercial Ops - Commercial Organization" -> "Commercial Lead"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Commercial Lead Persona 3 - Commercial Ops - Commercial Organization"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Commercial Lead Persona 3 - Commercial Ops - Commercial Organization": "Commercial Lead"';
        END IF;
    END IF;

    -- Persona: Commercial Lead Persona 4 - Commercial Ops - Commercial Organization
    -- Role: Commercial Lead, Function: Commercial Organization, Department: Commercial Ops
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Commercial Lead'
        OR r.name::text ILIKE '%Commercial Lead%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Commercial Lead' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'commercial_lead_4_commercial_ops_commercial_organization'
               OR (name ILIKE '%Commercial Lead Persona 4 - Commercial Ops - Commercial Organization%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Commercial Lead Persona 4 - Commercial Ops - Commercial Organization%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Commercial Lead Persona 4 - Commercial Ops - Commercial Organization" -> "Commercial Lead"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Commercial Lead Persona 4 - Commercial Ops - Commercial Organization"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Commercial Lead Persona 4 - Commercial Ops - Commercial Organization": "Commercial Lead"';
        END IF;
    END IF;

    -- Persona: Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs
    -- Role: Chief Regulatory Officer, Function: Regulatory Affairs, Department: Regulatory Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Chief Regulatory Officer'
        OR r.name::text ILIKE '%Chief Regulatory Officer%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Chief Regulatory Officer' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs'
               OR (name ILIKE '%Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs" -> "Chief Regulatory Officer"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs": "Chief Regulatory Officer"';
        END IF;
    END IF;

    -- Persona: Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs
    -- Role: Chief Regulatory Officer, Function: Regulatory Affairs, Department: Regulatory Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Chief Regulatory Officer'
        OR r.name::text ILIKE '%Chief Regulatory Officer%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Chief Regulatory Officer' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'chief_regulatory_officer_2_regulatory_strategy_regulatory_affairs'
               OR (name ILIKE '%Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs" -> "Chief Regulatory Officer"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Chief Regulatory Officer Persona 2 - Regulatory Strategy - Regulatory Affairs": "Chief Regulatory Officer"';
        END IF;
    END IF;

    -- Persona: Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs
    -- Role: Chief Regulatory Officer, Function: Regulatory Affairs, Department: Regulatory Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Chief Regulatory Officer'
        OR r.name::text ILIKE '%Chief Regulatory Officer%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Chief Regulatory Officer' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'chief_regulatory_officer_3_regulatory_strategy_regulatory_affairs'
               OR (name ILIKE '%Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs" -> "Chief Regulatory Officer"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Chief Regulatory Officer Persona 3 - Regulatory Strategy - Regulatory Affairs": "Chief Regulatory Officer"';
        END IF;
    END IF;

    -- Persona: Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs
    -- Role: Chief Regulatory Officer, Function: Regulatory Affairs, Department: Regulatory Strategy
    SELECT r.id INTO matched_role_id
    FROM public.org_roles r
    WHERE r.tenant_id = pharma_tenant_id
      AND (
        r.name::text ILIKE 'Chief Regulatory Officer'
        OR r.name::text ILIKE '%Chief Regulatory Officer%'
      )
    ORDER BY CASE
        WHEN r.name::text ILIKE 'Chief Regulatory Officer' THEN 1
        ELSE 2
    END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        SELECT r.function_id, r.department_id
        INTO matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.id = matched_role_id;

        -- Update persona by name or slug
        IF has_slug_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE slug = 'chief_regulatory_officer_4_regulatory_strategy_regulatory_affairs'
               OR (name ILIKE '%Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs%' AND slug IS NULL);
        ELSIF has_name_col THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE name ILIKE '%Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs%';
        END IF;

                GET DIAGNOSTICS update_count = ROW_COUNT;
        IF update_count > 0 THEN
            personas_updated := personas_updated + update_count;
            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN
                RAISE NOTICE '  ✅ Mapped persona: "Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs" -> "Chief Regulatory Officer"';
            END IF;
        ELSE
            personas_not_found := personas_not_found + 1;
            IF personas_not_found <= 10 THEN
                RAISE NOTICE '  ⚠️  Persona not found: "Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs"';
            END IF;
        END IF;
    ELSE
        roles_not_found := roles_not_found + 1;
        IF roles_not_found <= 10 THEN
            RAISE NOTICE '  ❌ Role not found for persona "Chief Regulatory Officer Persona 4 - Regulatory Strategy - Regulatory Affairs": "Chief Regulatory Officer"';
        END IF;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Total personas processed: %', 20;
    RAISE NOTICE '  - Personas updated: %', personas_updated;
    RAISE NOTICE '  - Personas not found in DB: %', personas_not_found;
    RAISE NOTICE '  - Roles not found: %', roles_not_found;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Persona mapping process finished.';
END $$;

COMMIT;