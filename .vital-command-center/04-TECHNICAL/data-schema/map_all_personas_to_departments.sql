-- =====================================================================
-- MAP ALL PERSONAS TO DEPARTMENTS
-- Strategic approach: Map personas to departments within their functions
-- Based on BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- Prerequisite: Personas must already have function_id mapped
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    matched_function_id uuid;
    matched_department_id uuid;
    personas_updated INTEGER := 0;
    update_count INTEGER;
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
    RAISE NOTICE '=== MAPPING ALL PERSONAS TO DEPARTMENTS ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: MEDICAL AFFAIRS - Field Medical Department
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: MEDICAL AFFAIRS - Field Medical ===';
    
    -- Get Medical Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Find Field Medical department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Field Medical%'
        ORDER BY 
            CASE WHEN name = 'Field Medical' THEN 1 ELSE 2 END
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Field Medical department (ID: %)', matched_department_id;
            
            -- Map Medical Science Liaison personas to Field Medical department
            UPDATE public.personas
            SET
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND (
                  slug IN (
                      'medical_science_liaison_1_field_medical_medical_affairs',
                      'medical_science_liaison_2_field_medical_medical_affairs',
                      'medical_science_liaison_3_field_medical_medical_affairs',
                      'medical_science_liaison_4_field_medical_medical_affairs'
                  )
                  OR name ILIKE '%Medical Science Liaison Persona%'
              )
              AND (department_id IS NULL OR department_id != matched_department_id);

            GET DIAGNOSTICS update_count = ROW_COUNT;
            personas_updated := personas_updated + update_count;
            RAISE NOTICE '    Updated Medical Science Liaison personas: %', update_count;
        ELSE
            RAISE NOTICE '  ❌ Field Medical department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Medical Affairs function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 2: MEDICAL AFFAIRS - HEOR & Evidence Department
    -- =====================================================================
    RAISE NOTICE '=== STEP 2: MEDICAL AFFAIRS - HEOR & Evidence ===';
    
    IF matched_function_id IS NOT NULL THEN
        -- Find HEOR & Evidence department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND (name ILIKE '%HEOR%Evidence%' OR name ILIKE '%HEOR & Evidence%' OR name ILIKE '%HEOR%')
        ORDER BY 
            CASE WHEN name = 'HEOR & Evidence' THEN 1
                 WHEN name ILIKE '%HEOR%Evidence%' THEN 2
                 ELSE 3 END
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found HEOR & Evidence department (ID: %)', matched_department_id;
            
            -- Map HEOR Director personas to HEOR & Evidence department
            UPDATE public.personas
            SET
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND (
                  slug IN (
                      'heor_director_1_heor_&_evidence_medical_affairs',
                      'heor_director_2_heor_&_evidence_medical_affairs',
                      'heor_director_3_heor_&_evidence_medical_affairs',
                      'heor_director_4_heor_&_evidence_medical_affairs'
                  )
                  OR name ILIKE '%HEOR Director Persona%'
              )
              AND (department_id IS NULL OR department_id != matched_department_id);

            GET DIAGNOSTICS update_count = ROW_COUNT;
            personas_updated := personas_updated + update_count;
            RAISE NOTICE '    Updated HEOR Director personas: %', update_count;
        ELSE
            RAISE NOTICE '  ❌ HEOR & Evidence department NOT found';
        END IF;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 3: MARKET ACCESS - Leadership & Strategy Department
    -- =====================================================================
    RAISE NOTICE '=== STEP 3: MARKET ACCESS - Leadership & Strategy ===';
    
    -- Get Market Access function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Market Access%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Find Leadership & Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND (name ILIKE '%Leadership%Strategy%' OR name ILIKE '%Leadership & Strategy%')
        ORDER BY 
            CASE WHEN name = 'Leadership & Strategy' THEN 1 ELSE 2 END
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Leadership & Strategy department (ID: %)', matched_department_id;
            
            -- Map VP Market Access personas to Leadership & Strategy department
            UPDATE public.personas
            SET
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND (
                  slug IN (
                      'vp_market_access_1_leadership_&_strategy_market_access',
                      'vp_market_access_2_leadership_&_strategy_market_access',
                      'vp_market_access_3_leadership_&_strategy_market_access',
                      'vp_market_access_4_leadership_&_strategy_market_access'
                  )
                  OR name ILIKE '%VP Market Access Persona%'
              )
              AND (department_id IS NULL OR department_id != matched_department_id);

            GET DIAGNOSTICS update_count = ROW_COUNT;
            personas_updated := personas_updated + update_count;
            RAISE NOTICE '    Updated VP Market Access personas: %', update_count;
        ELSE
            RAISE NOTICE '  ❌ Leadership & Strategy department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Market Access function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 4: COMMERCIAL ORGANIZATION - Commercial Ops Department
    -- =====================================================================
    RAISE NOTICE '=== STEP 4: COMMERCIAL ORGANIZATION - Commercial Ops ===';
    
    -- Get Commercial Organization function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial Organization%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Find Commercial Ops department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Commercial Ops%'
        ORDER BY 
            CASE WHEN name = 'Commercial Ops' THEN 1 ELSE 2 END
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Commercial Ops department (ID: %)', matched_department_id;
            
            -- Map Commercial Lead personas to Commercial Ops department
            UPDATE public.personas
            SET
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND (
                  slug IN (
                      'commercial_lead_1_commercial_ops_commercial_organization',
                      'commercial_lead_2_commercial_ops_commercial_organization',
                      'commercial_lead_3_commercial_ops_commercial_organization',
                      'commercial_lead_4_commercial_ops_commercial_organization'
                  )
                  OR name ILIKE '%Commercial Lead Persona%'
              )
              AND (department_id IS NULL OR department_id != matched_department_id);

            GET DIAGNOSTICS update_count = ROW_COUNT;
            personas_updated := personas_updated + update_count;
            RAISE NOTICE '    Updated Commercial Lead personas: %', update_count;
        ELSE
            RAISE NOTICE '  ❌ Commercial Ops department NOT found';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ Commercial Organization function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 5: REGULATORY AFFAIRS - Regulatory Strategy Department
    -- =====================================================================
    RAISE NOTICE '=== STEP 5: REGULATORY AFFAIRS - Regulatory Strategy ===';
    
    -- Get Regulatory Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Regulatory Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        -- Find Regulatory Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Regulatory Strategy%'
        ORDER BY 
            CASE WHEN name = 'Regulatory Strategy' THEN 1 ELSE 2 END
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Regulatory Strategy department (ID: %)', matched_department_id;
            
            -- Map Chief Regulatory Officer personas to Regulatory Strategy department
            UPDATE public.personas
            SET
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE tenant_id = pharma_tenant_id
              AND function_id = matched_function_id
              AND (
                  slug IN (
                      'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs',
                      'chief_regulatory_officer_2_regulatory_strategy_regulatory_affairs',
                      'chief_regulatory_officer_3_regulatory_strategy_regulatory_affairs',
                      'chief_regulatory_officer_4_regulatory_strategy_regulatory_affairs'
                  )
                  OR name ILIKE '%Chief Regulatory Officer Persona%'
              )
              AND (department_id IS NULL OR department_id != matched_department_id);

            GET DIAGNOSTICS update_count = ROW_COUNT;
            personas_updated := personas_updated + update_count;
            RAISE NOTICE '    Updated Chief Regulatory Officer personas: %', update_count;
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
    RAISE NOTICE '=== DEPARTMENT MAPPING SUMMARY ===';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE '';

    -- Show personas still missing department_id
    RAISE NOTICE 'Personas still missing department_id:';
    FOR dept_name_var, func_name_var IN
        SELECT p.name, f.name::text
        FROM public.personas p
        LEFT JOIN public.org_functions f ON p.function_id = f.id
        WHERE p.tenant_id = pharma_tenant_id
          AND p.function_id IS NOT NULL
          AND p.department_id IS NULL
          AND (
              p.name ILIKE '%Medical Science Liaison Persona%'
              OR p.name ILIKE '%HEOR Director Persona%'
              OR p.name ILIKE '%VP Market Access Persona%'
              OR p.name ILIKE '%Commercial Lead Persona%'
              OR p.name ILIKE '%Chief Regulatory Officer Persona%'
          )
        ORDER BY f.name::text, p.name
        LIMIT 20
    LOOP
        RAISE NOTICE '  ⚠️  % (Function: %)', dept_name_var, COALESCE(func_name_var, 'NULL');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Department mapping complete.';
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION: Show all personas and their department mappings
-- =====================================================================
SELECT 
    '=== VERIFICATION: Personas by Department ===' as section;

SELECT 
    f.name::text as function_name,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN p.department_id IS NOT NULL THEN p.id END) as mapped_count,
    COUNT(DISTINCT CASE WHEN p.department_id IS NULL THEN p.id END) as unmapped_count
FROM public.personas p
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
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
)
GROUP BY f.name::text, d.name
ORDER BY 
    CASE 
        WHEN f.name::text ILIKE '%Medical Affairs%' THEN 1
        WHEN f.name::text ILIKE '%Market Access%' THEN 2
        WHEN f.name::text ILIKE '%Commercial Organization%' THEN 3
        WHEN f.name::text ILIKE '%Regulatory Affairs%' THEN 4
        ELSE 5
    END,
    f.name::text,
    d.name;

-- Detailed view
SELECT 
    '=== DETAILED: All Personas with Department Mapping ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.department_id IS NOT NULL THEN '✅ Mapped'
        ELSE '❌ Unmapped'
    END as department_status,
    f.name::text as function_name,
    d.name as department_name,
    d.id as department_id
FROM public.personas p
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
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
)
ORDER BY 
    CASE WHEN p.department_id IS NULL THEN 0 ELSE 1 END,
    f.name::text,
    d.name,
    p.name;

