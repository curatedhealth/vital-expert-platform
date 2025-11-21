-- =====================================================================
-- SMART PERSONA TO ROLE MAPPING
-- Maps personas to roles by intelligently parsing slugs and matching to role names
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
    update_count INTEGER;
    slug_parts TEXT[];
    search_pattern TEXT;
    i INTEGER;
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
    RAISE NOTICE '=== SMART PERSONA MAPPING ===';
    RAISE NOTICE '';

    -- Loop through unmapped personas
    FOR persona_record IN 
        SELECT p.id, p.name, p.slug, p.tenant_id
        FROM public.personas p
        WHERE p.tenant_id = pharma_tenant_id
          AND p.role_id IS NULL
          AND (p.deleted_at IS NULL)
        ORDER BY p.name
        -- Remove LIMIT to process all, or keep for batch processing
    LOOP
        matched_role_id := NULL;
        matched_function_id := NULL;
        matched_department_id := NULL;
        search_pattern := NULL;

        -- Strategy 1: Extract role keywords from slug
        -- Pattern: firstname-lastname-role-keywords-size-version
        -- Example: alexander-coleman-senior-analytics-manager-large-v4
        -- Extract: senior-analytics-manager (parts 3 to N-2, excluding size/version)
        slug_parts := string_to_array(persona_record.slug, '-');
        
        -- Skip first 2 parts (first-name last-name)
        -- Extract role parts (usually parts 3 onwards, but skip last 2 which are often size/version)
        IF array_length(slug_parts, 1) >= 3 THEN
            -- Build role search pattern from middle parts
            -- Try different combinations: 3-word, 2-word, single word
            search_pattern := NULL;
            
            -- Try 3-word combination first (e.g., "senior-analytics-manager")
            IF array_length(slug_parts, 1) >= 5 THEN
                search_pattern := slug_parts[3] || ' ' || slug_parts[4] || ' ' || slug_parts[5];
                
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%' || REPLACE(search_pattern, ' ', '%') || '%'
                ORDER BY 
                    CASE 
                        WHEN r.name::text ILIKE '%' || search_pattern || '%' THEN 1
                        ELSE 2
                    END
                LIMIT 1;
            END IF;
            
            -- Try 2-word combinations if 3-word didn't match
            IF matched_role_id IS NULL AND array_length(slug_parts, 1) >= 4 THEN
                FOR i IN 3..LEAST(array_length(slug_parts, 1) - 2, 5) LOOP
                    IF i + 1 <= array_length(slug_parts, 1) - 2 THEN
                        search_pattern := slug_parts[i] || ' ' || slug_parts[i + 1];
                        
                        SELECT r.id, r.function_id, r.department_id
                        INTO matched_role_id, matched_function_id, matched_department_id
                        FROM public.org_roles r
                        WHERE r.tenant_id = pharma_tenant_id
                          AND r.name::text ILIKE '%' || REPLACE(search_pattern, ' ', '%') || '%'
                        ORDER BY 
                            CASE 
                                WHEN r.name::text ILIKE '%' || search_pattern || '%' THEN 1
                                ELSE 2
                            END
                        LIMIT 1;
                        
                        EXIT WHEN matched_role_id IS NOT NULL;
                    END IF;
                END LOOP;
            END IF;
            
            -- Try single keywords if multi-word didn't match
            IF matched_role_id IS NULL THEN
                FOR i IN 3..LEAST(array_length(slug_parts, 1) - 2, 6) LOOP
                    -- Skip common non-role words
                    IF slug_parts[i] NOT IN ('large', 'mid', 'small', 'startup', 'enterprise', 'v4', 'v3', 'v2', 'v1', 
                                             'specialty', 'biotech', 'emerging', 'rare', 'oncology', 'neurology', 
                                             'immunology', 'dermatology', 'pharma', 'global', 'us', 'regional', 
                                             'national', 'local', 'community', 'academic', 'teaching') 
                       AND length(slug_parts[i]) > 3 THEN
                        
                        SELECT r.id, r.function_id, r.department_id
                        INTO matched_role_id, matched_function_id, matched_department_id
                        FROM public.org_roles r
                        WHERE r.tenant_id = pharma_tenant_id
                          AND (
                            r.name::text ILIKE '%' || slug_parts[i] || '%'
                            OR r.slug ILIKE '%' || slug_parts[i] || '%'
                          )
                        ORDER BY 
                            CASE 
                                WHEN r.name::text ILIKE slug_parts[i] THEN 1
                                WHEN r.name::text ILIKE slug_parts[i] || '%' THEN 2
                                WHEN r.name::text ILIKE '%' || slug_parts[i] || '%' THEN 3
                                ELSE 4
                            END
                        LIMIT 1;
                        
                        EXIT WHEN matched_role_id IS NOT NULL;
                    END IF;
                END LOOP;
            END IF;
        END IF;

        -- Strategy 3: Direct keyword matching for common role patterns
        IF matched_role_id IS NULL THEN
            -- Common role title patterns
            IF persona_record.slug ILIKE '%director%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Director%'
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%manager%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Manager%'
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%vp%' OR persona_record.slug ILIKE '%vice-president%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND (r.name::text ILIKE '%VP%' OR r.name::text ILIKE '%Vice President%')
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%specialist%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Specialist%'
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%analyst%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Analyst%'
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%scientist%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Scientist%'
                LIMIT 1;
            ELSIF persona_record.slug ILIKE '%officer%' OR persona_record.slug ILIKE '%cfo%' OR persona_record.slug ILIKE '%cto%' OR persona_record.slug ILIKE '%ceo%' THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND r.name::text ILIKE '%Officer%'
                LIMIT 1;
            END IF;
        END IF;

        -- Update persona if match found
        IF matched_role_id IS NOT NULL THEN
            UPDATE public.personas
            SET
                role_id = matched_role_id,
                function_id = matched_function_id,
                department_id = matched_department_id,
                updated_at = NOW()
            WHERE id = persona_record.id;

            GET DIAGNOSTICS update_count = ROW_COUNT;
            IF update_count > 0 THEN
                personas_updated := personas_updated + 1;
                IF personas_updated % 50 = 0 OR personas_updated <= 10 THEN
                    RAISE NOTICE '  ✅ Mapped: "%" -> Role found', persona_record.name;
                END IF;
            END IF;
        END IF;

    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Personas updated: %', personas_updated;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Persona mapping process finished.';
END $$;

COMMIT;

