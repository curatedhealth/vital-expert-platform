-- =====================================================================
-- MAP MEDICAL AFFAIRS ROLES TO PERSONAS
-- Focused on Medical Affairs function only
-- Generated from BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    matched_role_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    personas_updated INTEGER := 0;
    update_count INTEGER;
    role_name_var text;
    dept_name_var text;
    func_name_var text;
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
    RAISE NOTICE '=== MAPPING MEDICAL AFFAIRS ROLES TO PERSONAS ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- DIAGNOSTIC: Show available Medical Affairs roles
    -- =====================================================================
    RAISE NOTICE '=== DIAGNOSTIC: Available Medical Affairs Roles ===';
    FOR role_name_var, dept_name_var, func_name_var IN
        SELECT DISTINCT
            r.name,
            d.name,
            f.name::text
        FROM public.org_roles r
        INNER JOIN public.org_functions f ON r.function_id = f.id
        INNER JOIN public.org_departments d ON r.department_id = d.id
        WHERE r.tenant_id = pharma_tenant_id
          AND f.name::text ILIKE '%Medical Affairs%'
        ORDER BY f.name::text, d.name, r.name
    LOOP
        RAISE NOTICE '  Role: % | Department: % | Function: %', role_name_var, dept_name_var, func_name_var;
    END LOOP;
    RAISE NOTICE '';

    -- =====================================================================
    -- MEDICAL AFFAIRS - Field Medical - Medical Science Liaison
    -- =====================================================================
    RAISE NOTICE '=== Mapping: Medical Science Liaison ===';
    
    -- Find the role: Medical Science Liaison
    SELECT r.id, r.function_id, r.department_id
    INTO matched_role_id, matched_function_id, matched_department_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%Medical Science Liaison%'
      AND f.name::text ILIKE '%Medical Affairs%'
      AND d.name ILIKE '%Field Medical%'
    ORDER BY 
        CASE WHEN r.name = 'Medical Science Liaison' THEN 1 ELSE 2 END,
        CASE WHEN d.name = 'Field Medical' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found role ID: %', matched_role_id;
        RAISE NOTICE '  Function ID: %, Department ID: %', matched_function_id, matched_department_id;

        -- Map all 4 Medical Science Liaison personas by slug
        UPDATE public.personas
        SET
            role_id = matched_role_id,
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'medical_science_liaison_1_field_medical_medical_affairs',
                  'medical_science_liaison_2_field_medical_medical_affairs',
                  'medical_science_liaison_3_field_medical_medical_affairs',
                  'medical_science_liaison_4_field_medical_medical_affairs'
              )
              OR (
                  name ILIKE '%Medical Science Liaison Persona%' 
                  AND name ILIKE '%Field Medical%' 
                  AND name ILIKE '%Medical Affairs%'
              )
          )
          AND (role_id IS NULL OR role_id != matched_role_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  ✅ Updated % Medical Science Liaison persona(s)', update_count;

        -- Show which personas were found
        FOR role_name_var IN
            SELECT p.name || ' (' || p.slug || ')'
            FROM public.personas p
            WHERE p.tenant_id = pharma_tenant_id
              AND p.role_id = matched_role_id
              AND p.name ILIKE '%Medical Science Liaison Persona%'
            ORDER BY p.name
        LOOP
            RAISE NOTICE '    - %', role_name_var;
        END LOOP;
    ELSE
        RAISE NOTICE '  ❌ Role not found: Medical Science Liaison (Medical Affairs > Field Medical)';
        RAISE NOTICE '     Trying to find any Medical Science Liaison role...';
        
        -- Try to find any Medical Science Liaison role
        SELECT r.id, r.function_id, r.department_id
        INTO matched_role_id, matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.tenant_id = pharma_tenant_id
          AND r.name ILIKE '%Medical Science Liaison%'
        LIMIT 1;
        
        IF matched_role_id IS NOT NULL THEN
            RAISE NOTICE '  ⚠️  Found Medical Science Liaison role (ID: %) but may not match expected function/department', matched_role_id;
        END IF;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- MEDICAL AFFAIRS - HEOR & Evidence - HEOR Director
    -- =====================================================================
    RAISE NOTICE '=== Mapping: HEOR Director ===';
    
    SELECT r.id, r.function_id, r.department_id
    INTO matched_role_id, matched_function_id, matched_department_id
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%HEOR Director%'
      AND f.name::text ILIKE '%Medical Affairs%'
      AND (d.name ILIKE '%HEOR%Evidence%' OR d.name ILIKE '%HEOR & Evidence%' OR d.name ILIKE '%HEOR%')
    ORDER BY 
        CASE WHEN r.name = 'HEOR Director' THEN 1 ELSE 2 END,
        CASE WHEN d.name ILIKE '%HEOR%Evidence%' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_role_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found role ID: %', matched_role_id;
        RAISE NOTICE '  Function ID: %, Department ID: %', matched_function_id, matched_department_id;

        -- Map all 4 HEOR Director personas
        UPDATE public.personas
        SET
            role_id = matched_role_id,
            function_id = matched_function_id,
            department_id = matched_department_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'heor_director_1_heor_&_evidence_medical_affairs',
                  'heor_director_2_heor_&_evidence_medical_affairs',
                  'heor_director_3_heor_&_evidence_medical_affairs',
                  'heor_director_4_heor_&_evidence_medical_affairs'
              )
              OR (
                  name ILIKE '%HEOR Director Persona%' 
                  AND name ILIKE '%HEOR%Evidence%' 
                  AND name ILIKE '%Medical Affairs%'
              )
          )
          AND (role_id IS NULL OR role_id != matched_role_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  ✅ Updated % HEOR Director persona(s)', update_count;

        -- Show which personas were found
        FOR role_name_var IN
            SELECT p.name || ' (' || p.slug || ')'
            FROM public.personas p
            WHERE p.tenant_id = pharma_tenant_id
              AND p.role_id = matched_role_id
              AND p.name ILIKE '%HEOR Director Persona%'
            ORDER BY p.name
        LOOP
            RAISE NOTICE '    - %', role_name_var;
        END LOOP;
    ELSE
        RAISE NOTICE '  ❌ Role not found: HEOR Director (Medical Affairs > HEOR & Evidence)';
        RAISE NOTICE '     Trying to find any HEOR Director role...';
        
        SELECT r.id, r.function_id, r.department_id
        INTO matched_role_id, matched_function_id, matched_department_id
        FROM public.org_roles r
        WHERE r.tenant_id = pharma_tenant_id
          AND r.name ILIKE '%HEOR Director%'
        LIMIT 1;
        
        IF matched_role_id IS NOT NULL THEN
            RAISE NOTICE '  ⚠️  Found HEOR Director role (ID: %) but may not match expected function/department', matched_role_id;
        END IF;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '=== MEDICAL AFFAIRS MAPPING SUMMARY ===';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE '';
    
    -- Show unmapped Medical Affairs personas
    RAISE NOTICE 'Unmapped Medical Affairs personas:';
    FOR role_name_var IN
        SELECT p.name || ' (' || COALESCE(p.slug, 'no slug') || ')' as persona_info
        FROM public.personas p
        WHERE p.tenant_id = pharma_tenant_id
          AND p.role_id IS NULL
          AND (
              p.name ILIKE '%Medical Science Liaison Persona%'
              OR p.name ILIKE '%HEOR Director Persona%'
          )
        ORDER BY p.name
    LOOP
        RAISE NOTICE '  ⚠️  %', role_name_var;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Medical Affairs mapping complete.';
END $$;

COMMIT;

-- Verification query
SELECT 
    '=== VERIFICATION: Medical Affairs Personas ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.role_id IS NOT NULL THEN '✅ Mapped'
        ELSE '❌ Unmapped'
    END as mapping_status,
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
)
ORDER BY 
    CASE WHEN p.role_id IS NULL THEN 0 ELSE 1 END,
    p.name;

