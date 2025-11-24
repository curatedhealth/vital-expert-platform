-- =====================================================================
-- DIAGNOSE PERSONAS IN DATABASE
-- Check what personas actually exist and how they're named
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id uuid;
    total_personas_count INTEGER;
    matching_personas_count INTEGER;
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
    RAISE NOTICE '=== DIAGNOSING PERSONAS IN DATABASE ===';
    RAISE NOTICE '';

    -- Count total personas for this tenant
    SELECT COUNT(*) INTO total_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (deleted_at IS NULL OR deleted_at IS NULL);

    RAISE NOTICE 'Total personas in Pharmaceuticals tenant: %', total_personas_count;
    RAISE NOTICE '';

    -- Check for personas matching our expected patterns
    RAISE NOTICE '=== Checking for personas matching expected patterns ===';
    RAISE NOTICE '';

    -- Medical Science Liaison
    SELECT COUNT(*) INTO matching_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (
          name ILIKE '%Medical Science Liaison%'
          OR slug ILIKE '%medical_science_liaison%'
      );

    RAISE NOTICE 'Personas with "Medical Science Liaison" in name/slug: %', matching_personas_count;
    IF matching_personas_count > 0 THEN
        FOR rec IN
            SELECT name, slug, function_id, department_id, role_id
            FROM public.personas
            WHERE tenant_id = pharma_tenant_id
              AND (
                  name ILIKE '%Medical Science Liaison%'
                  OR slug ILIKE '%medical_science_liaison%'
              )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - Name: %', rec.name;
            RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
            RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
                COALESCE(rec.function_id::text, 'NULL'),
                COALESCE(rec.department_id::text, 'NULL'),
                COALESCE(rec.role_id::text, 'NULL');
        END LOOP;
    END IF;
    RAISE NOTICE '';

    -- HEOR Director
    SELECT COUNT(*) INTO matching_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (
          name ILIKE '%HEOR Director%'
          OR slug ILIKE '%heor_director%'
      );

    RAISE NOTICE 'Personas with "HEOR Director" in name/slug: %', matching_personas_count;
    IF matching_personas_count > 0 THEN
        FOR rec IN
            SELECT name, slug, function_id, department_id, role_id
            FROM public.personas
            WHERE tenant_id = pharma_tenant_id
              AND (
                  name ILIKE '%HEOR Director%'
                  OR slug ILIKE '%heor_director%'
              )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - Name: %', rec.name;
            RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
            RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
                COALESCE(rec.function_id::text, 'NULL'),
                COALESCE(rec.department_id::text, 'NULL'),
                COALESCE(rec.role_id::text, 'NULL');
        END LOOP;
    END IF;
    RAISE NOTICE '';

    -- VP Market Access
    SELECT COUNT(*) INTO matching_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (
          name ILIKE '%VP Market Access%'
          OR slug ILIKE '%vp_market_access%'
      );

    RAISE NOTICE 'Personas with "VP Market Access" in name/slug: %', matching_personas_count;
    IF matching_personas_count > 0 THEN
        FOR rec IN
            SELECT name, slug, function_id, department_id, role_id
            FROM public.personas
            WHERE tenant_id = pharma_tenant_id
              AND (
                  name ILIKE '%VP Market Access%'
                  OR slug ILIKE '%vp_market_access%'
              )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - Name: %', rec.name;
            RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
            RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
                COALESCE(rec.function_id::text, 'NULL'),
                COALESCE(rec.department_id::text, 'NULL'),
                COALESCE(rec.role_id::text, 'NULL');
        END LOOP;
    END IF;
    RAISE NOTICE '';

    -- Commercial Lead
    SELECT COUNT(*) INTO matching_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (
          name ILIKE '%Commercial Lead%'
          OR slug ILIKE '%commercial_lead%'
      );

    RAISE NOTICE 'Personas with "Commercial Lead" in name/slug: %', matching_personas_count;
    IF matching_personas_count > 0 THEN
        FOR rec IN
            SELECT name, slug, function_id, department_id, role_id
            FROM public.personas
            WHERE tenant_id = pharma_tenant_id
              AND (
                  name ILIKE '%Commercial Lead%'
                  OR slug ILIKE '%commercial_lead%'
              )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - Name: %', rec.name;
            RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
            RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
                COALESCE(rec.function_id::text, 'NULL'),
                COALESCE(rec.department_id::text, 'NULL'),
                COALESCE(rec.role_id::text, 'NULL');
        END LOOP;
    END IF;
    RAISE NOTICE '';

    -- Chief Regulatory Officer
    SELECT COUNT(*) INTO matching_personas_count
    FROM public.personas
    WHERE tenant_id = pharma_tenant_id
      AND (
          name ILIKE '%Chief Regulatory Officer%'
          OR slug ILIKE '%chief_regulatory_officer%'
      );

    RAISE NOTICE 'Personas with "Chief Regulatory Officer" in name/slug: %', matching_personas_count;
    IF matching_personas_count > 0 THEN
        FOR rec IN
            SELECT name, slug, function_id, department_id, role_id
            FROM public.personas
            WHERE tenant_id = pharma_tenant_id
              AND (
                  name ILIKE '%Chief Regulatory Officer%'
                  OR slug ILIKE '%chief_regulatory_officer%'
              )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - Name: %', rec.name;
            RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
            RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
                COALESCE(rec.function_id::text, 'NULL'),
                COALESCE(rec.department_id::text, 'NULL'),
                COALESCE(rec.role_id::text, 'NULL');
        END LOOP;
    END IF;
    RAISE NOTICE '';

    -- Show sample of all personas (first 10)
    RAISE NOTICE '=== Sample of all personas in tenant (first 10) ===';
    FOR rec IN
        SELECT name, slug, function_id, department_id, role_id
        FROM public.personas
        WHERE tenant_id = pharma_tenant_id
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '  - Name: %', rec.name;
        RAISE NOTICE '    Slug: %', COALESCE(rec.slug, 'NULL');
        RAISE NOTICE '    Function ID: %, Dept ID: %, Role ID: %', 
            COALESCE(rec.function_id::text, 'NULL'),
            COALESCE(rec.department_id::text, 'NULL'),
            COALESCE(rec.role_id::text, 'NULL');
        RAISE NOTICE '';
    END LOOP;

    RAISE NOTICE '✅ Diagnosis complete.';
END $$;

-- =====================================================================
-- QUERY: Show all personas with their current mappings
-- =====================================================================
SELECT 
    '=== ALL PERSONAS IN PHARMACEUTICALS TENANT ===' as section;

SELECT 
    p.id,
    p.name,
    p.slug,
    p.function_id,
    f.name::text as function_name,
    p.department_id,
    d.name as department_name,
    p.role_id,
    r.name as role_name,
    p.created_at
FROM public.personas p
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL)
ORDER BY p.created_at DESC
LIMIT 50;

-- =====================================================================
-- QUERY: Check for exact slug matches from JSON
-- =====================================================================
SELECT 
    '=== CHECKING FOR EXACT SLUG MATCHES FROM JSON ===' as section;

SELECT 
    'medical_science_liaison_1_field_medical_medical_affairs' as expected_slug,
    COUNT(*) as found_count
FROM public.personas
WHERE tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND slug = 'medical_science_liaison_1_field_medical_medical_affairs'

UNION ALL

SELECT 
    'heor_director_1_heor_&_evidence_medical_affairs' as expected_slug,
    COUNT(*) as found_count
FROM public.personas
WHERE tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND slug = 'heor_director_1_heor_&_evidence_medical_affairs'

UNION ALL

SELECT 
    'vp_market_access_1_leadership_&_strategy_market_access' as expected_slug,
    COUNT(*) as found_count
FROM public.personas
WHERE tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND slug = 'vp_market_access_1_leadership_&_strategy_market_access'

UNION ALL

SELECT 
    'commercial_lead_1_commercial_ops_commercial_organization' as expected_slug,
    COUNT(*) as found_count
FROM public.personas
WHERE tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND slug = 'commercial_lead_1_commercial_ops_commercial_organization'

UNION ALL

SELECT 
    'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs' as expected_slug,
    COUNT(*) as found_count
FROM public.personas
WHERE tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND slug = 'chief_regulatory_officer_1_regulatory_strategy_regulatory_affairs';

