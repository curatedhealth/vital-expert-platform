-- =====================================================================
-- MAP PERSONAS TO ROLES BASED ON SLUG/NAME PATTERNS
-- This script extracts role information from persona slugs and names
-- and maps them to org_roles, org_functions, and org_departments
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
    role_keywords TEXT[];
    keyword TEXT;
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
    RAISE NOTICE '=== MAPPING PERSONAS FROM SLUGS/NAMES ===';
    RAISE NOTICE '';

    -- Loop through all unmapped personas for Pharmaceuticals tenant
    FOR persona_record IN 
        SELECT p.id, p.name, p.slug, p.tenant_id
        FROM public.personas p
        WHERE p.tenant_id = pharma_tenant_id
          AND p.role_id IS NULL
          AND (p.deleted_at IS NULL)
        ORDER BY p.name
    LOOP
        matched_role_id := NULL;
        matched_function_id := NULL;
        matched_department_id := NULL;

        -- Extract role keywords from slug (remove person name, size, version info)
        -- Example: "alexander-coleman-senior-analytics-manager-large-v4" 
        -- -> extract "senior-analytics-manager"
        role_keywords := string_to_array(
            regexp_replace(
                regexp_replace(
                    regexp_replace(persona_record.slug, '^[a-z]+-[a-z]+-', ''), -- Remove first-name-last-name-
                    '-(large|mid|small|startup|enterprise|v4|v3|v2|v1|expert|junior|senior|mid|specialty|biotech|emerging|rare|oncology|neurology|immunology|dermatology|hemoc|pharma|global|us|regional|national|local|community|academic|teaching|idn|gpo|aco|kpi|kol|rwe|heor|veo|cmc|bd|ma|mktg|ops|cx|kam|pm|ci|bi|etl|ml|ai|seo|sem|social|content|campaigns|platform|integration|automation|process|analytics|reporting|dashboards|forecasting|modeling|targeting|segmentation|insights|journey|touchpoints|personalization|orchestration|engagement|digital|omnichannel|strategic|tactical|operational|effectiveness|performance|efficiency|compliance|oversight|review|training|development|learning|onboarding|curriculum|certification|coaching|enablement|tools|workflows|platform|systems|crm|erp|sap|interactive|elearning|video|clinical|field-focused|brand|flagship|growth|mature|lifecycle|pipeline|launch|early-stage|mid-stage|late-stage|portfolio|strategic|tactical|operational|sourcing|evaluation|diligence|integration|partnerships|licensing|therapeutic|oncology|rare|emerging|neurology|immunology|dermatology|hemoc|biotech|pharma|global|us|regional|national|local|community|academic|teaching|idn|gpo|aco|top-tier|niche|value|mid|expert|junior|senior|mid|large|small|startup|enterprise|v4|v3|v2|v1)$', '' -- Remove trailing metadata
                ),
                '-+', '-', 'g' -- Normalize multiple hyphens
            ),
            '-'
        );

        -- Try to match role by keywords in slug
        -- Build search pattern from keywords
        IF array_length(role_keywords, 1) > 0 THEN
            -- Try matching with role name (exact or partial)
            FOR keyword IN SELECT unnest(role_keywords) WHERE length(unnest(role_keywords)) > 2
            LOOP
                -- Try exact match first
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND (
                    r.name::text ILIKE '%' || keyword || '%'
                    OR r.slug ILIKE '%' || keyword || '%'
                  )
                ORDER BY 
                    CASE 
                        WHEN r.name::text ILIKE keyword THEN 1
                        WHEN r.name::text ILIKE keyword || '%' THEN 2
                        WHEN r.name::text ILIKE '%' || keyword || '%' THEN 3
                        ELSE 4
                    END
                LIMIT 1;

                EXIT WHEN matched_role_id IS NOT NULL;
            END LOOP;

            -- If no match found, try matching with combined keywords
            IF matched_role_id IS NULL AND array_length(role_keywords, 1) >= 2 THEN
                SELECT r.id, r.function_id, r.department_id
                INTO matched_role_id, matched_function_id, matched_department_id
                FROM public.org_roles r
                WHERE r.tenant_id = pharma_tenant_id
                  AND (
                    r.name::text ILIKE '%' || role_keywords[array_length(role_keywords, 1) - 1] || '%' || role_keywords[array_length(role_keywords, 1)] || '%'
                    OR r.name::text ILIKE '%' || role_keywords[array_length(role_keywords, 1)] || '%'
                  )
                ORDER BY 
                    CASE 
                        WHEN r.name::text ILIKE '%' || role_keywords[array_length(role_keywords, 1) - 1] || '%' || role_keywords[array_length(role_keywords, 1)] || '%' THEN 1
                        ELSE 2
                    END
                LIMIT 1;
            END IF;
        END IF;

        -- If still no match, try matching from persona name
        IF matched_role_id IS NULL THEN
            -- Extract potential role from name (look for common role patterns)
            SELECT r.id, r.function_id, r.department_id
            INTO matched_role_id, matched_function_id, matched_department_id
            FROM public.org_roles r
            WHERE r.tenant_id = pharma_tenant_id
              AND (
                -- Try matching common role titles in name
                (persona_record.name ILIKE '%Director%' AND r.name::text ILIKE '%Director%')
                OR (persona_record.name ILIKE '%Manager%' AND r.name::text ILIKE '%Manager%')
                OR (persona_record.name ILIKE '%VP%' AND r.name::text ILIKE '%VP%')
                OR (persona_record.name ILIKE '%Senior%' AND r.name::text ILIKE '%Senior%')
                OR (persona_record.name ILIKE '%Specialist%' AND r.name::text ILIKE '%Specialist%')
                OR (persona_record.name ILIKE '%Analyst%' AND r.name::text ILIKE '%Analyst%')
                OR (persona_record.name ILIKE '%Scientist%' AND r.name::text ILIKE '%Scientist%')
                OR (persona_record.name ILIKE '%Officer%' AND r.name::text ILIKE '%Officer%')
                OR (persona_record.name ILIKE '%Lead%' AND r.name::text ILIKE '%Lead%')
                OR (persona_record.name ILIKE '%Executive%' AND r.name::text ILIKE '%Executive%')
              )
            ORDER BY 
                CASE 
                    WHEN r.name::text = SPLIT_PART(persona_record.name, ' ', -1) THEN 1
                    ELSE 2
                END
            LIMIT 1;
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
                    RAISE NOTICE '  ✅ Mapped: "%" (slug: %) -> Role ID: %', 
                        persona_record.name, 
                        persona_record.slug,
                        matched_role_id;
                END IF;
            END IF;
        END IF;

    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '=== MAPPING COMPLETE ===';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Personas updated: %', personas_updated;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Persona mapping process finished.';
END $$;

COMMIT;

-- Verification query
SELECT 
    'VERIFICATION' as section,
    COUNT(*) as total_unmapped,
    COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as now_mapped
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL);

