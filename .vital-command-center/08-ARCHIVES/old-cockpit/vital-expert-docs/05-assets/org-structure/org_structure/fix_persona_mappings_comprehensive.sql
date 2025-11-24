-- =====================================================================
-- COMPREHENSIVE FIX FOR PERSONA MAPPINGS
-- 1. Fix function_id and department_id from roles
-- 2. Consolidate personas with similar role patterns to same role
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    personas_fixed INTEGER := 0;
    personas_consolidated INTEGER := 0;
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;

    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;

    RAISE NOTICE '=== FIXING PERSONA ORGANIZATIONAL STRUCTURE ===';
    RAISE NOTICE '';

    -- Step 1: Update personas to inherit function_id and department_id from their roles
    UPDATE public.personas p
    SET
        function_id = r.function_id,
        department_id = r.department_id,
        updated_at = NOW()
    FROM public.org_roles r
    WHERE p.role_id = r.id
      AND p.tenant_id = pharma_tenant_id
      AND p.role_id IS NOT NULL
      AND (
        p.function_id IS NULL 
        OR p.department_id IS NULL
        OR p.function_id != r.function_id
        OR p.department_id != r.department_id
      );

    GET DIAGNOSTICS personas_fixed = ROW_COUNT;
    RAISE NOTICE 'Step 1: Fixed function_id/department_id for % personas', personas_fixed;

    -- Step 2: For personas with similar role patterns, consolidate to the most common role
    -- This handles cases where personas with similar slugs got mapped to different roles
    WITH slug_parts AS (
        SELECT 
            p.id as persona_id,
            p.slug,
            p.role_id,
            string_to_array(p.slug, '-') as parts,
            r.name as role_name,
            r.function_id,
            r.department_id
        FROM public.personas p
        LEFT JOIN public.org_roles r ON p.role_id = r.id
        WHERE p.tenant_id = pharma_tenant_id
          AND p.role_id IS NOT NULL
          AND (p.deleted_at IS NULL)
    ),
    persona_role_patterns AS (
        SELECT 
            persona_id,
            slug,
            role_id,
            -- Extract role pattern from slug (skip first 2 parts for name)
            CASE 
                WHEN array_length(parts, 1) >= 3 THEN
                    array_to_string(
                        parts[3:array_length(parts, 1)],
                        '-'
                    )
                ELSE NULL
            END as role_pattern,
            role_name,
            function_id,
            department_id
        FROM slug_parts
    ),
    role_pattern_groups AS (
        SELECT 
            role_pattern,
            role_id,
            COUNT(*) as persona_count,
            function_id,
            department_id
        FROM persona_role_patterns
        WHERE role_pattern IS NOT NULL
        GROUP BY role_pattern, role_id, function_id, department_id
    ),
    most_common_role_per_pattern AS (
        SELECT DISTINCT ON (role_pattern)
            role_pattern,
            role_id,
            function_id,
            department_id,
            persona_count
        FROM role_pattern_groups
        ORDER BY role_pattern, persona_count DESC, role_id
    )
    UPDATE public.personas p
    SET
        role_id = mcr.role_id,
        function_id = mcr.function_id,
        department_id = mcr.department_id,
        updated_at = NOW()
    FROM persona_role_patterns prp
    JOIN most_common_role_per_pattern mcr ON prp.role_pattern = mcr.role_pattern
    WHERE p.id = prp.persona_id
      AND p.role_id != mcr.role_id;

    GET DIAGNOSTICS personas_consolidated = ROW_COUNT;
    RAISE NOTICE 'Step 2: Consolidated % personas to most common role per pattern', personas_consolidated;

    RAISE NOTICE '';
    RAISE NOTICE '=== FIX COMPLETE ===';
    RAISE NOTICE 'Total personas fixed: %', personas_fixed;
    RAISE NOTICE 'Total personas consolidated: %', personas_consolidated;
END $$;

COMMIT;

-- Verification query
SELECT 
    'VERIFICATION' as section,
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL);

-- Check roles with multiple personas (should show 3-5 personas per role)
SELECT 
    'ROLES_WITH_PERSONAS' as section,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
JOIN public.personas p ON p.role_id = r.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL)
GROUP BY r.id, r.name, f.name, d.name
HAVING COUNT(p.id) > 0
ORDER BY persona_count DESC, r.name
LIMIT 20;

