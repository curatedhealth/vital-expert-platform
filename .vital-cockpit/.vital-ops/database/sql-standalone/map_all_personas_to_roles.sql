-- =====================================================================
-- MAP ALL PERSONAS TO ROLES
-- Strategic approach: Map personas to roles within their departments
-- Based on BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- Prerequisite: Personas must already have function_id and department_id mapped
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    matched_role_id uuid;
    personas_updated INTEGER := 0;
    update_count INTEGER;
    role_name_var text;
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
    RAISE NOTICE '=== MAPPING ALL PERSONAS TO ROLES ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: MEDICAL AFFAIRS - Field Medical - Medical Science Liaison
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: Medical Science Liaison Role ===';
    
    -- Get Medical Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Get Field Medical department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Field Medical%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            -- Find Medical Science Liaison role
            SELECT id INTO matched_role_id
            FROM public.org_roles
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND department_id = matched_department_id
              AND name ILIKE '%Medical Science Liaison%'
            ORDER BY 
                CASE WHEN name = 'Medical Science Liaison' THEN 1 ELSE 2 END
            LIMIT 1;

            IF matched_role_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Found Medical Science Liaison role (ID: %)', matched_role_id;
                
                -- Map Medical Science Liaison personas to role
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND department_id = matched_department_id
                  AND (
                      slug IN (
                          'medical_science_liaison_1_field_medical_medical_affairs',
                          'medical_science_liaison_2_field_medical_medical_affairs',
                          'medical_science_liaison_3_field_medical_medical_affairs',
                          'medical_science_liaison_4_field_medical_medical_affairs'
                      )
                      OR name ILIKE '%Medical Science Liaison Persona%'
                  )
                  AND (role_id IS NULL OR role_id != matched_role_id);

                GET DIAGNOSTICS update_count = ROW_COUNT;
                personas_updated := personas_updated + update_count;
                RAISE NOTICE '    Updated Medical Science Liaison personas: %', update_count;
            ELSE
                RAISE NOTICE '  ❌ Medical Science Liaison role NOT found';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ Field Medical department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Medical Affairs function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 2: MEDICAL AFFAIRS - HEOR & Evidence - HEOR Director
    -- =====================================================================
    RAISE NOTICE '=== STEP 2: HEOR Director Role ===';
    
    IF matched_function_id IS NOT NULL THEN
        -- Get HEOR & Evidence department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND (name ILIKE '%HEOR%Evidence%' OR name ILIKE '%HEOR & Evidence%' OR name ILIKE '%HEOR%')
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            -- Find HEOR Director role
            SELECT id INTO matched_role_id
            FROM public.org_roles
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND department_id = matched_department_id
              AND name ILIKE '%HEOR Director%'
            ORDER BY 
                CASE WHEN name = 'HEOR Director' THEN 1 ELSE 2 END
            LIMIT 1;

            IF matched_role_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Found HEOR Director role (ID: %)', matched_role_id;
                
                -- Map HEOR Director personas to role
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND department_id = matched_department_id
                  AND (
                      slug IN (
                          'heor_director_1_heor_&_evidence_medical_affairs',
                          'heor_director_2_heor_&_evidence_medical_affairs',
                          'heor_director_3_heor_&_evidence_medical_affairs',
                          'heor_director_4_heor_&_evidence_medical_affairs'
                      )
                      OR name ILIKE '%HEOR Director Persona%'
                  )
                  AND (role_id IS NULL OR role_id != matched_role_id);

                GET DIAGNOSTICS update_count = ROW_COUNT;
                personas_updated := personas_updated + update_count;
                RAISE NOTICE '    Updated HEOR Director personas: %', update_count;
            ELSE
                RAISE NOTICE '  ❌ HEOR Director role NOT found';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ HEOR & Evidence department NOT found';
        END IF;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 3: MARKET ACCESS - Leadership & Strategy - VP Market Access
    -- =====================================================================
    RAISE NOTICE '=== STEP 3: VP Market Access Role ===';
    
    -- Get Market Access function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Market Access%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Get Leadership & Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND (name ILIKE '%Leadership%Strategy%' OR name ILIKE '%Leadership & Strategy%')
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            -- Find VP Market Access role
            SELECT id INTO matched_role_id
            FROM public.org_roles
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND department_id = matched_department_id
              AND name ILIKE '%VP Market Access%'
            ORDER BY 
                CASE WHEN name = 'VP Market Access' THEN 1 ELSE 2 END
            LIMIT 1;

            IF matched_role_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Found VP Market Access role (ID: %)', matched_role_id;
                
                -- Map VP Market Access personas to role
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND department_id = matched_department_id
                  AND (
                      slug IN (
                          'vp_market_access_1_leadership_&_strategy_market_access',
                          'vp_market_access_2_leadership_&_strategy_market_access',
                          'vp_market_access_3_leadership_&_strategy_market_access',
                          'vp_market_access_4_leadership_&_strategy_market_access'
                      )
                      OR name ILIKE '%VP Market Access Persona%'
                  )
                  AND (role_id IS NULL OR role_id != matched_role_id);

                GET DIAGNOSTICS update_count = ROW_COUNT;
                personas_updated := personas_updated + update_count;
                RAISE NOTICE '    Updated VP Market Access personas: %', update_count;
            ELSE
                RAISE NOTICE '  ❌ VP Market Access role NOT found';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ Leadership & Strategy department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Market Access function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 4: COMMERCIAL ORGANIZATION - Commercial Ops - Commercial Lead
    -- =====================================================================
    RAISE NOTICE '=== STEP 4: Commercial Lead Role ===';
    
    -- Get Commercial Organization function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial Organization%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Get Commercial Ops department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Commercial Ops%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            -- Find Commercial Lead role
            SELECT id INTO matched_role_id
            FROM public.org_roles
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND department_id = matched_department_id
              AND name ILIKE '%Commercial Lead%'
            ORDER BY 
                CASE WHEN name = 'Commercial Lead' THEN 1 ELSE 2 END
            LIMIT 1;

            IF matched_role_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Found Commercial Lead role (ID: %)', matched_role_id;
                
                -- Map Commercial Lead personas to role
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND department_id = matched_department_id
                  AND (
                      slug IN (
                          'commercial_lead_1_commercial_ops_commercial_organization',
                          'commercial_lead_2_commercial_ops_commercial_organization',
                          'commercial_lead_3_commercial_ops_commercial_organization',
                          'commercial_lead_4_commercial_ops_commercial_organization'
                      )
                      OR name ILIKE '%Commercial Lead Persona%'
                  )
                  AND (role_id IS NULL OR role_id != matched_role_id);

                GET DIAGNOSTICS update_count = ROW_COUNT;
                personas_updated := personas_updated + update_count;
                RAISE NOTICE '    Updated Commercial Lead personas: %', update_count;
            ELSE
                RAISE NOTICE '  ❌ Commercial Lead role NOT found';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ Commercial Ops department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Commercial Organization function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 5: REGULATORY AFFAIRS - Regulatory Strategy - Chief Regulatory Officer
    -- =====================================================================
    RAISE NOTICE '=== STEP 5: Chief Regulatory Officer Role ===';
    
    -- Get Regulatory Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Regulatory Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Get Regulatory Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Regulatory Strategy%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            -- Find Chief Regulatory Officer role
            SELECT id INTO matched_role_id
            FROM public.org_roles
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND department_id = matched_department_id
              AND name ILIKE '%Chief Regulatory Officer%'
            ORDER BY 
                CASE WHEN name = 'Chief Regulatory Officer' THEN 1 ELSE 2 END
            LIMIT 1;

            IF matched_role_id IS NOT NULL THEN
                RAISE NOTICE '  ✅ Found Chief Regulatory Officer role (ID: %)', matched_role_id;
                
                -- Map Chief Regulatory Officer personas to role
                UPDATE public.personas
                SET
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND function_id = matched_function_id
                  AND department_id = matched_department_id
                  AND (
                      slug IN (
                          'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs',
                          'chief_regulatory_officer_2_regulatory_strategy_regulatory_affairs',
                          'chief_regulatory_officer_3_regulatory_strategy_regulatory_affairs',
                          'chief_regulatory_officer_4_regulatory_strategy_regulatory_affairs'
                      )
                      OR name ILIKE '%Chief Regulatory Officer Persona%'
                  )
                  AND (role_id IS NULL OR role_id != matched_role_id);

                GET DIAGNOSTICS update_count = ROW_COUNT;
                personas_updated := personas_updated + update_count;
                RAISE NOTICE '    Updated Chief Regulatory Officer personas: %', update_count;
            ELSE
                RAISE NOTICE '  ❌ Chief Regulatory Officer role NOT found';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ Regulatory Strategy department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Regulatory Affairs function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '=== ROLE MAPPING SUMMARY ===';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE '';

    -- Show personas still missing role_id
    RAISE NOTICE 'Personas still missing role_id:';
    FOR role_name_var IN
        SELECT p.name || ' (Function: ' || COALESCE(f.name::text, 'NULL') || ', Department: ' || COALESCE(d.name, 'NULL') || ')'
        FROM public.personas p
        LEFT JOIN public.org_functions f ON p.function_id = f.id
        LEFT JOIN public.org_departments d ON p.department_id = d.id
        WHERE p.tenant_id = pharma_tenant_id
          AND p.function_id IS NOT NULL
          AND p.department_id IS NOT NULL
          AND p.role_id IS NULL
          AND (
              p.name ILIKE '%Medical Science Liaison Persona%'
              OR p.name ILIKE '%HEOR Director Persona%'
              OR p.name ILIKE '%VP Market Access Persona%'
              OR p.name ILIKE '%Commercial Lead Persona%'
              OR p.name ILIKE '%Chief Regulatory Officer Persona%'
          )
        ORDER BY f.name::text, d.name, p.name
        LIMIT 20
    LOOP
        RAISE NOTICE '  ⚠️  %', role_name_var;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete.';
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION: Show all personas and their complete mappings
-- =====================================================================
SELECT 
    '=== VERIFICATION: Complete Persona Mappings ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN '✅ Fully Mapped'
        WHEN p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN '⚠️  Missing Role'
        WHEN p.function_id IS NOT NULL THEN '⚠️  Missing Dept & Role'
        ELSE '❌ Unmapped'
    END as mapping_status,
    f.name::text as function_name,
    d.name as department_name,
    r.name as role_name
FROM public.personas p
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
)
ORDER BY 
    CASE 
        WHEN p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN 1
        WHEN p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN 2
        WHEN p.function_id IS NOT NULL THEN 3
        ELSE 4
    END,
    f.name::text,
    d.name,
    r.name,
    p.name;

-- Summary statistics
SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    COUNT(*) as total_personas,
    COUNT(DISTINCT CASE WHEN p.function_id IS NOT NULL THEN p.id END) as personas_with_function,
    COUNT(DISTINCT CASE WHEN p.department_id IS NOT NULL THEN p.id END) as personas_with_department,
    COUNT(DISTINCT CASE WHEN p.role_id IS NOT NULL THEN p.id END) as personas_with_role,
    COUNT(DISTINCT CASE WHEN p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN p.id END) as fully_mapped_personas
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
);

