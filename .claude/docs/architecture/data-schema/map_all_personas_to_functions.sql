-- =====================================================================
-- MAP ALL PERSONAS TO BUSINESS FUNCTIONS
-- Strategic approach: Map personas to functions first, then departments, then roles
-- Based on BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    matched_function_id uuid;
    personas_updated INTEGER := 0;
    update_count INTEGER;
    func_name_var text;
    persona_name_var text;
    persona_slug_var text;
    expected_functions_count INTEGER := 0;
    mapped_functions_count INTEGER := 0;
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
    RAISE NOTICE '=== MAPPING ALL PERSONAS TO BUSINESS FUNCTIONS ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: MEDICAL AFFAIRS
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: MEDICAL AFFAIRS ===';
    
    -- Find Medical Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    ORDER BY 
        CASE WHEN name::text = 'Medical Affairs' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Medical Affairs function (ID: %)', matched_function_id;
        
        -- Map all Medical Affairs personas
        -- Medical Science Liaison personas (4)
        UPDATE public.personas
        SET
            function_id = matched_function_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'medical_science_liaison_1_field_medical_medical_affairs',
                  'medical_science_liaison_2_field_medical_medical_affairs',
                  'medical_science_liaison_3_field_medical_medical_affairs',
                  'medical_science_liaison_4_field_medical_medical_affairs'
              )
              OR name ILIKE '%Medical Science Liaison Persona%'
          )
          AND (function_id IS NULL OR function_id != matched_function_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '    Updated Medical Science Liaison personas: %', update_count;

        -- HEOR Director personas (4)
        UPDATE public.personas
        SET
            function_id = matched_function_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'heor_director_1_heor_&_evidence_medical_affairs',
                  'heor_director_2_heor_&_evidence_medical_affairs',
                  'heor_director_3_heor_&_evidence_medical_affairs',
                  'heor_director_4_heor_&_evidence_medical_affairs'
              )
              OR name ILIKE '%HEOR Director Persona%'
          )
          AND (function_id IS NULL OR function_id != matched_function_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '    Updated HEOR Director personas: %', update_count;
        
        mapped_functions_count := mapped_functions_count + 1;
    ELSE
        RAISE NOTICE '  ❌ Medical Affairs function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 2: MARKET ACCESS
    -- =====================================================================
    RAISE NOTICE '=== STEP 2: MARKET ACCESS ===';
    
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Market Access%'
    ORDER BY 
        CASE WHEN name::text = 'Market Access' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Market Access function (ID: %)', matched_function_id;
        
        -- Map VP Market Access personas (4)
        UPDATE public.personas
        SET
            function_id = matched_function_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'vp_market_access_1_leadership_&_strategy_market_access',
                  'vp_market_access_2_leadership_&_strategy_market_access',
                  'vp_market_access_3_leadership_&_strategy_market_access',
                  'vp_market_access_4_leadership_&_strategy_market_access'
              )
              OR name ILIKE '%VP Market Access Persona%'
          )
          AND (function_id IS NULL OR function_id != matched_function_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '    Updated VP Market Access personas: %', update_count;
        
        mapped_functions_count := mapped_functions_count + 1;
    ELSE
        RAISE NOTICE '  ❌ Market Access function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 3: COMMERCIAL ORGANIZATION
    -- =====================================================================
    RAISE NOTICE '=== STEP 3: COMMERCIAL ORGANIZATION ===';
    
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial Organization%'
    ORDER BY 
        CASE WHEN name::text = 'Commercial Organization' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Commercial Organization function (ID: %)', matched_function_id;
        
        -- Map Commercial Lead personas (4)
        UPDATE public.personas
        SET
            function_id = matched_function_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'commercial_lead_1_commercial_ops_commercial_organization',
                  'commercial_lead_2_commercial_ops_commercial_organization',
                  'commercial_lead_3_commercial_ops_commercial_organization',
                  'commercial_lead_4_commercial_ops_commercial_organization'
              )
              OR name ILIKE '%Commercial Lead Persona%'
          )
          AND (function_id IS NULL OR function_id != matched_function_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '    Updated Commercial Lead personas: %', update_count;
        
        mapped_functions_count := mapped_functions_count + 1;
    ELSE
        RAISE NOTICE '  ❌ Commercial Organization function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 4: REGULATORY AFFAIRS
    -- =====================================================================
    RAISE NOTICE '=== STEP 4: REGULATORY AFFAIRS ===';
    
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Regulatory Affairs%'
    ORDER BY 
        CASE WHEN name::text = 'Regulatory Affairs' THEN 1 ELSE 2 END
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Regulatory Affairs function (ID: %)', matched_function_id;
        
        -- Map Chief Regulatory Officer personas (4)
        UPDATE public.personas
        SET
            function_id = matched_function_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND (
              slug IN (
                  'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs',
                  'chief_regulatory_officer_2_regulatory_strategy_regulatory_affairs',
                  'chief_regulatory_officer_3_regulatory_strategy_regulatory_affairs',
                  'chief_regulatory_officer_4_regulatory_strategy_regulatory_affairs'
              )
              OR name ILIKE '%Chief Regulatory Officer Persona%'
          )
          AND (function_id IS NULL OR function_id != matched_function_id);

        GET DIAGNOSTICS update_count = ROW_COUNT;
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '    Updated Chief Regulatory Officer personas: %', update_count;
        
        mapped_functions_count := mapped_functions_count + 1;
    ELSE
        RAISE NOTICE '  ❌ Regulatory Affairs function NOT found';
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '=== FUNCTION MAPPING SUMMARY ===';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE 'Functions mapped: % out of 4', mapped_functions_count;
    RAISE NOTICE '';

    -- Show personas still missing function_id
    RAISE NOTICE 'Personas still missing function_id:';
    FOR persona_name_var, persona_slug_var IN
        SELECT p.name, COALESCE(p.slug, 'no slug')
        FROM public.personas p
        WHERE p.tenant_id = pharma_tenant_id
          AND p.function_id IS NULL
          AND (
              p.name ILIKE '%Medical Science Liaison Persona%'
              OR p.name ILIKE '%HEOR Director Persona%'
              OR p.name ILIKE '%VP Market Access Persona%'
              OR p.name ILIKE '%Commercial Lead Persona%'
              OR p.name ILIKE '%Chief Regulatory Officer Persona%'
          )
        ORDER BY p.name
        LIMIT 20
    LOOP
        RAISE NOTICE '  ⚠️  % (slug: %)', persona_name_var, persona_slug_var;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Function mapping complete.';
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION: Show all personas and their function mappings
-- =====================================================================
SELECT 
    '=== VERIFICATION: Personas by Function ===' as section;

SELECT 
    f.name::text as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN p.function_id IS NOT NULL THEN p.id END) as mapped_count,
    COUNT(DISTINCT CASE WHEN p.function_id IS NULL THEN p.id END) as unmapped_count
FROM public.personas p
LEFT JOIN public.org_functions f ON p.function_id = f.id
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
GROUP BY f.name::text
ORDER BY 
    CASE 
        WHEN f.name::text ILIKE '%Medical Affairs%' THEN 1
        WHEN f.name::text ILIKE '%Market Access%' THEN 2
        WHEN f.name::text ILIKE '%Commercial Organization%' THEN 3
        WHEN f.name::text ILIKE '%Regulatory Affairs%' THEN 4
        ELSE 5
    END,
    f.name::text;

-- Detailed view
SELECT 
    '=== DETAILED: All Personas with Function Mapping ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.function_id IS NOT NULL THEN '✅ Mapped'
        ELSE '❌ Unmapped'
    END as function_status,
    f.name::text as function_name,
    f.id as function_id
FROM public.personas p
LEFT JOIN public.org_functions f ON p.function_id = f.id
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
    CASE WHEN p.function_id IS NULL THEN 0 ELSE 1 END,
    f.name::text,
    p.name;

