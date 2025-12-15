-- =====================================================================
-- VERIFY MEDICAL AFFAIRS MAPPING FROM JSON
-- Based on BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- Verifies that all Medical Affairs personas from JSON are correctly mapped
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id uuid;
    expected_personas_count INTEGER := 8; -- 4 MSL + 4 HEOR Director
    mapped_count INTEGER := 0;
    unmapped_count INTEGER := 0;
    rec RECORD;
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
    RAISE NOTICE '=== VERIFYING MEDICAL AFFAIRS MAPPING FROM JSON ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- EXPECTED DATA FROM JSON
    -- =====================================================================
    RAISE NOTICE '=== EXPECTED DATA FROM JSON ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Function: Medical Affairs';
    RAISE NOTICE '';
    RAISE NOTICE 'Department: Field Medical';
    RAISE NOTICE '  Role: Medical Science Liaison';
    RAISE NOTICE '  Expected Personas (4):';
    RAISE NOTICE '    1. Medical Science Liaison Persona 1 - Field Medical - Medical Affairs';
    RAISE NOTICE '       Slug: medical_science_liaison_1_field_medical_medical_affairs';
    RAISE NOTICE '    2. Medical Science Liaison Persona 2 - Field Medical - Medical Affairs';
    RAISE NOTICE '       Slug: medical_science_liaison_2_field_medical_medical_affairs';
    RAISE NOTICE '    3. Medical Science Liaison Persona 3 - Field Medical - Medical Affairs';
    RAISE NOTICE '       Slug: medical_science_liaison_3_field_medical_medical_affairs';
    RAISE NOTICE '    4. Medical Science Liaison Persona 4 - Field Medical - Medical Affairs';
    RAISE NOTICE '       Slug: medical_science_liaison_4_field_medical_medical_affairs';
    RAISE NOTICE '';
    RAISE NOTICE 'Department: HEOR & Evidence';
    RAISE NOTICE '  Role: HEOR Director';
    RAISE NOTICE '  Expected Personas (4):';
    RAISE NOTICE '    1. HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs';
    RAISE NOTICE '       Slug: heor_director_1_heor_&_evidence_medical_affairs';
    RAISE NOTICE '    2. HEOR Director Persona 2 - HEOR & Evidence - Medical Affairs';
    RAISE NOTICE '       Slug: heor_director_2_heor_&_evidence_medical_affairs';
    RAISE NOTICE '    3. HEOR Director Persona 3 - HEOR & Evidence - Medical Affairs';
    RAISE NOTICE '       Slug: heor_director_3_heor_&_evidence_medical_affairs';
    RAISE NOTICE '    4. HEOR Director Persona 4 - HEOR & Evidence - Medical Affairs';
    RAISE NOTICE '       Slug: heor_director_4_heor_&_evidence_medical_affairs';
    RAISE NOTICE '';

    -- =====================================================================
    -- VERIFY ROLES EXIST
    -- =====================================================================
    RAISE NOTICE '=== VERIFYING ROLES EXIST ===';
    RAISE NOTICE '';

    -- Check Medical Science Liaison role
    SELECT COUNT(*) INTO rec
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%Medical Science Liaison%'
      AND f.name::text ILIKE '%Medical Affairs%'
      AND d.name ILIKE '%Field Medical%';

    IF rec > 0 THEN
        RAISE NOTICE '  ✅ Medical Science Liaison role found';
        FOR rec IN
            SELECT r.id, r.name, f.name::text as func_name, d.name as dept_name
            FROM public.org_roles r
            INNER JOIN public.org_functions f ON r.function_id = f.id
            INNER JOIN public.org_departments d ON r.department_id = d.id
            WHERE r.tenant_id = pharma_tenant_id
              AND r.name ILIKE '%Medical Science Liaison%'
              AND f.name::text ILIKE '%Medical Affairs%'
              AND d.name ILIKE '%Field Medical%'
            LIMIT 1
        LOOP
            RAISE NOTICE '     Role ID: %', rec.id;
            RAISE NOTICE '     Role Name: %', rec.name;
            RAISE NOTICE '     Function: %', rec.func_name;
            RAISE NOTICE '     Department: %', rec.dept_name;
        END LOOP;
    ELSE
        RAISE NOTICE '  ❌ Medical Science Liaison role NOT found';
        RAISE NOTICE '     Searching for any Medical Science Liaison role...';
        FOR rec IN
            SELECT r.id, r.name, f.name::text as func_name, d.name as dept_name
            FROM public.org_roles r
            LEFT JOIN public.org_functions f ON r.function_id = f.id
            LEFT JOIN public.org_departments d ON r.department_id = d.id
            WHERE r.tenant_id = pharma_tenant_id
              AND r.name ILIKE '%Medical Science Liaison%'
            LIMIT 5
        LOOP
            RAISE NOTICE '     Found: % (Function: %, Department: %)', rec.name, COALESCE(rec.func_name, 'NULL'), COALESCE(rec.dept_name, 'NULL');
        END LOOP;
    END IF;

    RAISE NOTICE '';

    -- Check HEOR Director role
    SELECT COUNT(*) INTO rec
    FROM public.org_roles r
    INNER JOIN public.org_functions f ON r.function_id = f.id
    INNER JOIN public.org_departments d ON r.department_id = d.id
    WHERE r.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%HEOR Director%'
      AND f.name::text ILIKE '%Medical Affairs%'
      AND (d.name ILIKE '%HEOR%Evidence%' OR d.name ILIKE '%HEOR & Evidence%');

    IF rec > 0 THEN
        RAISE NOTICE '  ✅ HEOR Director role found';
        FOR rec IN
            SELECT r.id, r.name, f.name::text as func_name, d.name as dept_name
            FROM public.org_roles r
            INNER JOIN public.org_functions f ON r.function_id = f.id
            INNER JOIN public.org_departments d ON r.department_id = d.id
            WHERE r.tenant_id = pharma_tenant_id
              AND r.name ILIKE '%HEOR Director%'
              AND f.name::text ILIKE '%Medical Affairs%'
              AND (d.name ILIKE '%HEOR%Evidence%' OR d.name ILIKE '%HEOR & Evidence%')
            LIMIT 1
        LOOP
            RAISE NOTICE '     Role ID: %', rec.id;
            RAISE NOTICE '     Role Name: %', rec.name;
            RAISE NOTICE '     Function: %', rec.func_name;
            RAISE NOTICE '     Department: %', rec.dept_name;
        END LOOP;
    ELSE
        RAISE NOTICE '  ❌ HEOR Director role NOT found';
        RAISE NOTICE '     Searching for any HEOR Director role...';
        FOR rec IN
            SELECT r.id, r.name, f.name::text as func_name, d.name as dept_name
            FROM public.org_roles r
            LEFT JOIN public.org_functions f ON r.function_id = f.id
            LEFT JOIN public.org_departments d ON r.department_id = d.id
            WHERE r.tenant_id = pharma_tenant_id
              AND r.name ILIKE '%HEOR Director%'
            LIMIT 5
        LOOP
            RAISE NOTICE '     Found: % (Function: %, Department: %)', rec.name, COALESCE(rec.func_name, 'NULL'), COALESCE(rec.dept_name, 'NULL');
        END LOOP;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- VERIFY PERSONAS EXIST AND ARE MAPPED
    -- =====================================================================
    RAISE NOTICE '=== VERIFYING PERSONAS FROM JSON ===';
    RAISE NOTICE '';

    -- Medical Science Liaison Personas
    RAISE NOTICE 'Medical Science Liaison Personas:';
    FOR rec IN
        SELECT 
            p.id,
            p.name,
            p.slug,
            p.role_id,
            r.name as role_name,
            f.name::text as function_name,
            d.name as department_name,
            CASE 
                WHEN p.role_id IS NOT NULL AND r.name ILIKE '%Medical Science Liaison%' THEN '✅ Mapped'
                WHEN p.role_id IS NOT NULL THEN '⚠️  Mapped to wrong role'
                ELSE '❌ Unmapped'
            END as status
        FROM public.personas p
        LEFT JOIN public.org_roles r ON p.role_id = r.id
        LEFT JOIN public.org_functions f ON p.function_id = f.id
        LEFT JOIN public.org_departments d ON p.department_id = d.id
        WHERE p.tenant_id = pharma_tenant_id
          AND (
              p.slug IN (
                  'medical_science_liaison_1_field_medical_medical_affairs',
                  'medical_science_liaison_2_field_medical_medical_affairs',
                  'medical_science_liaison_3_field_medical_medical_affairs',
                  'medical_science_liaison_4_field_medical_medical_affairs'
              )
              OR p.name ILIKE '%Medical Science Liaison Persona%'
          )
        ORDER BY p.slug, p.name
    LOOP
        RAISE NOTICE '  %: %', rec.status, rec.name;
        RAISE NOTICE '     Slug: %', COALESCE(rec.slug, 'MISSING');
        IF rec.role_id IS NOT NULL THEN
            RAISE NOTICE '     Role: % (ID: %)', COALESCE(rec.role_name, 'NULL'), rec.role_id;
            RAISE NOTICE '     Function: %', COALESCE(rec.function_name, 'NULL');
            RAISE NOTICE '     Department: %', COALESCE(rec.department_name, 'NULL');
            IF rec.role_name ILIKE '%Medical Science Liaison%' THEN
                mapped_count := mapped_count + 1;
            END IF;
        ELSE
            unmapped_count := unmapped_count + 1;
        END IF;
        RAISE NOTICE '';
    END LOOP;

    -- HEOR Director Personas
    RAISE NOTICE 'HEOR Director Personas:';
    FOR rec IN
        SELECT 
            p.id,
            p.name,
            p.slug,
            p.role_id,
            r.name as role_name,
            f.name::text as function_name,
            d.name as department_name,
            CASE 
                WHEN p.role_id IS NOT NULL AND r.name ILIKE '%HEOR Director%' THEN '✅ Mapped'
                WHEN p.role_id IS NOT NULL THEN '⚠️  Mapped to wrong role'
                ELSE '❌ Unmapped'
            END as status
        FROM public.personas p
        LEFT JOIN public.org_roles r ON p.role_id = r.id
        LEFT JOIN public.org_functions f ON p.function_id = f.id
        LEFT JOIN public.org_departments d ON p.department_id = d.id
        WHERE p.tenant_id = pharma_tenant_id
          AND (
              p.slug IN (
                  'heor_director_1_heor_&_evidence_medical_affairs',
                  'heor_director_2_heor_&_evidence_medical_affairs',
                  'heor_director_3_heor_&_evidence_medical_affairs',
                  'heor_director_4_heor_&_evidence_medical_affairs'
              )
              OR p.name ILIKE '%HEOR Director Persona%'
          )
        ORDER BY p.slug, p.name
    LOOP
        RAISE NOTICE '  %: %', rec.status, rec.name;
        RAISE NOTICE '     Slug: %', COALESCE(rec.slug, 'MISSING');
        IF rec.role_id IS NOT NULL THEN
            RAISE NOTICE '     Role: % (ID: %)', COALESCE(rec.role_name, 'NULL'), rec.role_id;
            RAISE NOTICE '     Function: %', COALESCE(rec.function_name, 'NULL');
            RAISE NOTICE '     Department: %', COALESCE(rec.department_name, 'NULL');
            IF rec.role_name ILIKE '%HEOR Director%' THEN
                mapped_count := mapped_count + 1;
            END IF;
        ELSE
            unmapped_count := unmapped_count + 1;
        END IF;
        RAISE NOTICE '';
    END LOOP;

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '=== VERIFICATION SUMMARY ===';
    RAISE NOTICE 'Expected personas from JSON: %', expected_personas_count;
    RAISE NOTICE 'Correctly mapped: %', mapped_count;
    RAISE NOTICE 'Unmapped: %', unmapped_count;
    RAISE NOTICE '';

    IF mapped_count = expected_personas_count THEN
        RAISE NOTICE '✅ SUCCESS: All Medical Affairs personas are correctly mapped!';
    ELSIF mapped_count > 0 THEN
        RAISE NOTICE '⚠️  PARTIAL: % out of % personas are mapped', mapped_count, expected_personas_count;
    ELSE
        RAISE NOTICE '❌ FAILURE: No personas are mapped';
    END IF;

    RAISE NOTICE '';
END $$;

-- =====================================================================
-- DETAILED VERIFICATION QUERY
-- =====================================================================
SELECT 
    '=== DETAILED VERIFICATION QUERY ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.role_id IS NOT NULL AND r.name ILIKE '%Medical Science Liaison%' THEN '✅ Mapped (MSL)'
        WHEN p.role_id IS NOT NULL AND r.name ILIKE '%HEOR Director%' THEN '✅ Mapped (HEOR)'
        WHEN p.role_id IS NOT NULL THEN '⚠️  Mapped (Wrong Role)'
        ELSE '❌ Unmapped'
    END as mapping_status,
    r.name as role_name,
    r.id as role_id,
    f.name::text as function_name,
    d.name as department_name,
    CASE 
        WHEN p.slug IN (
            'medical_science_liaison_1_field_medical_medical_affairs',
            'medical_science_liaison_2_field_medical_medical_affairs',
            'medical_science_liaison_3_field_medical_medical_affairs',
            'medical_science_liaison_4_field_medical_medical_affairs',
            'heor_director_1_heor_&_evidence_medical_affairs',
            'heor_director_2_heor_&_evidence_medical_affairs',
            'heor_director_3_heor_&_evidence_medical_affairs',
            'heor_director_4_heor_&_evidence_medical_affairs'
        ) THEN '✅ Expected from JSON'
        ELSE '⚠️  Not in JSON'
    END as json_match
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
    p.slug IN (
        'medical_science_liaison_1_field_medical_medical_affairs',
        'medical_science_liaison_2_field_medical_medical_affairs',
        'medical_science_liaison_3_field_medical_medical_affairs',
        'medical_science_liaison_4_field_medical_medical_affairs',
        'heor_director_1_heor_&_evidence_medical_affairs',
        'heor_director_2_heor_&_evidence_medical_affairs',
        'heor_director_3_heor_&_evidence_medical_affairs',
        'heor_director_4_heor_&_evidence_medical_affairs'
    )
    OR p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
)
ORDER BY 
    CASE WHEN p.role_id IS NULL THEN 0 ELSE 1 END,
    p.name;

