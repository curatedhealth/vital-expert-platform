-- =====================================================================
-- MAP PERSONAS BY ROLE NAME
-- Based on actual personas in database (PERSONAS_MAPPED_TO_ROLE_DEPT_FN.json)
-- Personas are named by role (e.g., "Medical Science Liaison") not by persona pattern
-- This script maps personas to correct functions/departments based on their role names
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
    RAISE NOTICE '=== MAPPING PERSONAS BY ROLE NAME ===';
    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 1: MEDICAL AFFAIRS - Field Medical - Medical Science Liaison
    -- =====================================================================
    RAISE NOTICE '=== STEP 1: Medical Science Liaison ===';
    
    -- Get Medical Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Medical Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Medical Affairs function (ID: %)', matched_function_id;
        
        -- Get Field Medical department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Field Medical%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Field Medical department (ID: %)', matched_department_id;
            
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
                
                -- Update personas with role name containing "Medical Science Liaison"
                -- Match personas that have this role_id OR have name matching the role
                UPDATE public.personas
                SET
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND (
                      -- Match by role_id if it exists
                      role_id = matched_role_id
                      -- OR match by name containing "Medical Science Liaison"
                      OR name ILIKE '%Medical Science Liaison%'
                      -- OR match personas that already have the correct function/department but wrong role
                      OR (
                          function_id = matched_function_id
                          AND department_id = matched_department_id
                          AND role_id IN (
                              SELECT id FROM public.org_roles
                              WHERE tenant_id = pharma_tenant_id
                                AND name ILIKE '%Medical Science Liaison%'
                          )
                      )
                  )
                  AND (
                      function_id IS NULL 
                      OR function_id != matched_function_id
                      OR department_id IS NULL
                      OR department_id != matched_department_id
                      OR role_id IS NULL
                      OR role_id != matched_role_id
                  );

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
    RAISE NOTICE '=== STEP 2: HEOR Director ===';
    
    IF matched_function_id IS NOT NULL THEN
        -- Get HEOR & Evidence department
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
                
                -- Update personas with role name containing "HEOR Director"
                UPDATE public.personas
                SET
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND (
                      role_id = matched_role_id
                      OR name ILIKE '%HEOR Director%'
                      OR (
                          function_id = matched_function_id
                          AND department_id = matched_department_id
                          AND role_id IN (
                              SELECT id FROM public.org_roles
                              WHERE tenant_id = pharma_tenant_id
                                AND name ILIKE '%HEOR Director%'
                          )
                      )
                  )
                  AND (
                      function_id IS NULL 
                      OR function_id != matched_function_id
                      OR department_id IS NULL
                      OR department_id != matched_department_id
                      OR role_id IS NULL
                      OR role_id != matched_role_id
                  );

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
    RAISE NOTICE '=== STEP 3: VP Market Access ===';
    
    -- Get Market Access function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Market Access%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Market Access function (ID: %)', matched_function_id;
        
        -- Get Leadership & Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND (name ILIKE '%Leadership%Strategy%' OR name ILIKE '%Leadership & Strategy%')
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Leadership & Strategy department (ID: %)', matched_department_id;
            
            -- Find VP Market Access role (may have variations like "VP Market Access - Global")
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
                
                -- Update personas with role name containing "VP Market Access"
                UPDATE public.personas
                SET
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND (
                      role_id = matched_role_id
                      OR name ILIKE '%VP Market Access%'
                      OR (
                          function_id = matched_function_id
                          AND department_id = matched_department_id
                          AND role_id IN (
                              SELECT id FROM public.org_roles
                              WHERE tenant_id = pharma_tenant_id
                                AND name ILIKE '%VP Market Access%'
                          )
                      )
                  )
                  AND (
                      function_id IS NULL 
                      OR function_id != matched_function_id
                      OR department_id IS NULL
                      OR department_id != matched_department_id
                      OR role_id IS NULL
                      OR role_id != matched_role_id
                  );

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
    RAISE NOTICE '=== STEP 4: Commercial Lead ===';
    
    -- Get Commercial Organization function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Commercial Organization%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Commercial Organization function (ID: %)', matched_function_id;
        
        -- Get Commercial Ops department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Commercial Ops%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Commercial Ops department (ID: %)', matched_department_id;
            
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
                
                -- Update personas with role name containing "Commercial Lead"
                UPDATE public.personas
                SET
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND (
                      role_id = matched_role_id
                      OR name ILIKE '%Commercial Lead%'
                      OR (
                          function_id = matched_function_id
                          AND department_id = matched_department_id
                          AND role_id IN (
                              SELECT id FROM public.org_roles
                              WHERE tenant_id = pharma_tenant_id
                                AND name ILIKE '%Commercial Lead%'
                          )
                      )
                  )
                  AND (
                      function_id IS NULL 
                      OR function_id != matched_function_id
                      OR department_id IS NULL
                      OR department_id != matched_department_id
                      OR role_id IS NULL
                      OR role_id != matched_role_id
                  );

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
    RAISE NOTICE '=== STEP 5: Chief Regulatory Officer ===';
    
    -- Get Regulatory Affairs function
    SELECT id INTO matched_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND name::text ILIKE '%Regulatory Affairs%'
    LIMIT 1;

    IF matched_function_id IS NOT NULL THEN
        RAISE NOTICE '  ✅ Found Regulatory Affairs function (ID: %)', matched_function_id;
        
        -- Get Regulatory Strategy department
        SELECT id INTO matched_department_id
        FROM public.org_departments
        WHERE tenant_id = pharma_tenant_id
          AND function_id = matched_function_id
          AND name ILIKE '%Regulatory Strategy%'
        LIMIT 1;

        IF matched_department_id IS NOT NULL THEN
            RAISE NOTICE '  ✅ Found Regulatory Strategy department (ID: %)', matched_department_id;
            
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
                
                -- Update personas with role name containing "Chief Regulatory Officer"
                UPDATE public.personas
                SET
                    function_id = matched_function_id,
                    department_id = matched_department_id,
                    role_id = matched_role_id,
                    updated_at = NOW()
                WHERE tenant_id = pharma_tenant_id
                  AND (
                      role_id = matched_role_id
                      OR name ILIKE '%Chief Regulatory Officer%'
                      OR (
                          function_id = matched_function_id
                          AND department_id = matched_department_id
                          AND role_id IN (
                              SELECT id FROM public.org_roles
                              WHERE tenant_id = pharma_tenant_id
                                AND name ILIKE '%Chief Regulatory Officer%'
                          )
                      )
                  )
                  AND (
                      function_id IS NULL 
                      OR function_id != matched_function_id
                      OR department_id IS NULL
                      OR department_id != matched_department_id
                      OR role_id IS NULL
                      OR role_id != matched_role_id
                  );

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
    -- STEP 6: FIX ROLES - ADD FUNCTION_ID AND DEPARTMENT_ID TO ROLES
    -- =====================================================================
    RAISE NOTICE '=== STEP 6: Fixing roles - adding function_id and department_id ===';
    
    -- Fix Medical Science Liaison role
    UPDATE public.org_roles r
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Medical Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Medical Affairs%'
                  LIMIT 1
              )
              AND name ILIKE '%Field Medical%'
            LIMIT 1
        ),
        updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id
      AND name ILIKE '%Medical Science Liaison%'
      AND (function_id IS NULL OR department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        RAISE NOTICE '  ✅ Fixed % Medical Science Liaison role(s)', update_count;
    END IF;

    -- Fix HEOR Director role
    UPDATE public.org_roles r
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Medical Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Medical Affairs%'
                  LIMIT 1
              )
              AND (name ILIKE '%HEOR%Evidence%' OR name ILIKE '%HEOR & Evidence%' OR name ILIKE '%HEOR%')
            LIMIT 1
        ),
        updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id
      AND name ILIKE '%HEOR Director%'
      AND (function_id IS NULL OR department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        RAISE NOTICE '  ✅ Fixed % HEOR Director role(s)', update_count;
    END IF;

    -- Fix VP Market Access role
    UPDATE public.org_roles r
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Market Access%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Market Access%'
                  LIMIT 1
              )
              AND (name ILIKE '%Leadership%Strategy%' OR name ILIKE '%Leadership & Strategy%')
            LIMIT 1
        ),
        updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id
      AND name ILIKE '%VP Market Access%'
      AND (function_id IS NULL OR department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        RAISE NOTICE '  ✅ Fixed % VP Market Access role(s)', update_count;
    END IF;

    -- Fix Commercial Lead role
    UPDATE public.org_roles r
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Commercial Organization%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Commercial Organization%'
                  LIMIT 1
              )
              AND name ILIKE '%Commercial Ops%'
            LIMIT 1
        ),
        updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id
      AND name ILIKE '%Commercial Lead%'
      AND (function_id IS NULL OR department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        RAISE NOTICE '  ✅ Fixed % Commercial Lead role(s)', update_count;
    END IF;

    -- Fix Chief Regulatory Officer role
    UPDATE public.org_roles r
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Regulatory Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Regulatory Affairs%'
                  LIMIT 1
              )
              AND name ILIKE '%Regulatory Strategy%'
            LIMIT 1
        ),
        updated_at = NOW()
    WHERE tenant_id = pharma_tenant_id
      AND name ILIKE '%Chief Regulatory Officer%'
      AND (function_id IS NULL OR department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        RAISE NOTICE '  ✅ Fixed % Chief Regulatory Officer role(s)', update_count;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- STEP 7: FORCE FUNCTION_ID AND DEPARTMENT_ID FROM ROLES TO PERSONAS
    -- =====================================================================
    RAISE NOTICE '=== STEP 7: Inheriting function_id and department_id from roles to personas ===';
    
    -- First, update personas where the role already has function_id and department_id
    UPDATE public.personas p
    SET
        function_id = r.function_id,
        department_id = r.department_id,
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.function_id IS NOT NULL
      AND r.department_id IS NOT NULL
      AND (
          p.function_id IS NULL
          OR p.department_id IS NULL
          OR p.function_id != r.function_id
          OR p.department_id != r.department_id
      )
      AND (
          r.name ILIKE '%Medical Science Liaison%'
          OR r.name ILIKE '%HEOR Director%'
          OR r.name ILIKE '%VP Market Access%'
          OR r.name ILIKE '%Commercial Lead%'
          OR r.name ILIKE '%Chief Regulatory Officer%'
      );

    GET DIAGNOSTICS update_count = ROW_COUNT;
    personas_updated := personas_updated + update_count;
    RAISE NOTICE '  ✅ Updated % personas to inherit function_id/department_id from roles', update_count;

    -- Second, for roles missing function_id/department_id, find and set them based on role name
    -- Medical Science Liaison
    UPDATE public.personas p
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Medical Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Medical Affairs%'
                  LIMIT 1
              )
              AND name ILIKE '%Field Medical%'
            LIMIT 1
        ),
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%Medical Science Liaison%'
      AND (p.function_id IS NULL OR p.department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  Updated % Medical Science Liaison personas with function/department', update_count;
    END IF;

    -- HEOR Director
    UPDATE public.personas p
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Medical Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Medical Affairs%'
                  LIMIT 1
              )
              AND (name ILIKE '%HEOR%Evidence%' OR name ILIKE '%HEOR & Evidence%' OR name ILIKE '%HEOR%')
            LIMIT 1
        ),
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%HEOR Director%'
      AND (p.function_id IS NULL OR p.department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  Updated % HEOR Director personas with function/department', update_count;
    END IF;

    -- VP Market Access
    UPDATE public.personas p
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Market Access%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Market Access%'
                  LIMIT 1
              )
              AND (name ILIKE '%Leadership%Strategy%' OR name ILIKE '%Leadership & Strategy%')
            LIMIT 1
        ),
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%VP Market Access%'
      AND (p.function_id IS NULL OR p.department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  Updated % VP Market Access personas with function/department', update_count;
    END IF;

    -- Commercial Lead
    UPDATE public.personas p
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Commercial Organization%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Commercial Organization%'
                  LIMIT 1
              )
              AND name ILIKE '%Commercial Ops%'
            LIMIT 1
        ),
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%Commercial Lead%'
      AND (p.function_id IS NULL OR p.department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  Updated % Commercial Lead personas with function/department', update_count;
    END IF;

    -- Chief Regulatory Officer
    UPDATE public.personas p
    SET
        function_id = (
            SELECT id FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
              AND name::text ILIKE '%Regulatory Affairs%'
            LIMIT 1
        ),
        department_id = (
            SELECT id FROM public.org_departments
            WHERE tenant_id = pharma_tenant_id
              AND function_id = (
                  SELECT id FROM public.org_functions
                  WHERE tenant_id = pharma_tenant_id
                    AND name::text ILIKE '%Regulatory Affairs%'
                  LIMIT 1
              )
              AND name ILIKE '%Regulatory Strategy%'
            LIMIT 1
        ),
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND r.name ILIKE '%Chief Regulatory Officer%'
      AND (p.function_id IS NULL OR p.department_id IS NULL);

    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
        personas_updated := personas_updated + update_count;
        RAISE NOTICE '  Updated % Chief Regulatory Officer personas with function/department', update_count;
    END IF;

    RAISE NOTICE '';

    -- =====================================================================
    -- SUMMARY
    -- =====================================================================
    RAISE NOTICE '=== MAPPING SUMMARY ===';
    RAISE NOTICE 'Total personas updated: %', personas_updated;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Mapping complete.';
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION: Show personas by role
-- =====================================================================
SELECT 
    '=== VERIFICATION: Personas by Role ===' as section;

SELECT 
    r.name as role_name,
    r.id as role_id,
    p.function_id,
    f.name::text as function_name,
    p.department_id,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN p.function_id IS NOT NULL AND p.department_id IS NOT NULL AND p.role_id IS NOT NULL THEN p.id END) as fully_mapped_count,
    COUNT(DISTINCT CASE WHEN p.function_id IS NULL THEN p.id END) as missing_function_id,
    COUNT(DISTINCT CASE WHEN p.department_id IS NULL THEN p.id END) as missing_department_id
FROM public.personas p
INNER JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    r.name ILIKE '%Medical Science Liaison%'
    OR r.name ILIKE '%HEOR Director%'
    OR r.name ILIKE '%VP Market Access%'
    OR r.name ILIKE '%Commercial Lead%'
    OR r.name ILIKE '%Chief Regulatory Officer%'
)
GROUP BY r.name, r.id, p.function_id, f.name::text, p.department_id, d.name
ORDER BY 
    CASE 
        WHEN r.name ILIKE '%Medical Science Liaison%' THEN 1
        WHEN r.name ILIKE '%HEOR Director%' THEN 2
        WHEN r.name ILIKE '%VP Market Access%' THEN 3
        WHEN r.name ILIKE '%Commercial Lead%' THEN 4
        WHEN r.name ILIKE '%Chief Regulatory Officer%' THEN 5
        ELSE 6
    END,
    r.name;

-- =====================================================================
-- COMPREHENSIVE QUERY: All IDs and Names
-- =====================================================================
SELECT 
    '=== COMPREHENSIVE: All IDs and Names ===' as section;

SELECT 
    -- IDs
    p.function_id,
    p.department_id,
    p.role_id,
    -- Names
    f.name::text as function_name,
    d.name as department_name,
    r.name as role_name,
    -- Role's function and department (from role table)
    r.function_id as role_function_id,
    r.department_id as role_department_id,
    -- Counts
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN p.function_id IS NOT NULL AND p.department_id IS NOT NULL AND p.role_id IS NOT NULL THEN p.id END) as fully_mapped_count
FROM public.personas p
INNER JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    r.name ILIKE '%Medical Science Liaison%'
    OR r.name ILIKE '%HEOR Director%'
    OR r.name ILIKE '%VP Market Access%'
    OR r.name ILIKE '%Commercial Lead%'
    OR r.name ILIKE '%Chief Regulatory Officer%'
)
GROUP BY 
    p.function_id,
    p.department_id,
    p.role_id,
    f.name::text,
    d.name,
    r.name,
    r.function_id,
    r.department_id
ORDER BY 
    CASE 
        WHEN r.name ILIKE '%Medical Science Liaison%' THEN 1
        WHEN r.name ILIKE '%HEOR Director%' THEN 2
        WHEN r.name ILIKE '%VP Market Access%' THEN 3
        WHEN r.name ILIKE '%Commercial Lead%' THEN 4
        WHEN r.name ILIKE '%Chief Regulatory Officer%' THEN 5
        ELSE 6
    END,
    r.name,
    f.name::text,
    d.name;

