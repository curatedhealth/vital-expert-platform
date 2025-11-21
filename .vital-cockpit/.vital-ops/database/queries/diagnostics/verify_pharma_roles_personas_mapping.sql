-- =====================================================================
-- VERIFY PHARMACEUTICALS ROLES TO PERSONAS MAPPING
-- Verifies that all personas from JSON are correctly mapped to roles
-- =====================================================================

-- Get Pharmaceuticals tenant ID
DO $$
DECLARE
    pharma_tenant_id uuid;
BEGIN
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;

    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;

    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION REPORT ===';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. CHECK ALL PERSONAS FROM JSON ARE MAPPED
-- =====================================================================

SELECT 
    '=== PERSONA MAPPING STATUS ===' as section;

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
WHERE (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
)
ORDER BY 
    CASE 
        WHEN p.role_id IS NULL THEN 0 
        ELSE 1 
    END,
    p.name;

-- =====================================================================
-- 2. SUMMARY STATISTICS
-- =====================================================================

SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    COUNT(*) FILTER (WHERE p.role_id IS NOT NULL) as mapped_personas,
    COUNT(*) FILTER (WHERE p.role_id IS NULL) as unmapped_personas,
    COUNT(*) as total_personas_from_json
FROM public.personas p
WHERE (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
);

-- =====================================================================
-- 3. ROLE TO PERSONA MAPPING BREAKDOWN
-- =====================================================================

SELECT 
    '=== ROLE TO PERSONA BREAKDOWN ===' as section;

SELECT 
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count,
    COUNT(p.id) FILTER (WHERE p.role_id IS NOT NULL) as mapped_count,
    COUNT(p.id) FILTER (WHERE p.role_id IS NULL) as unmapped_count
FROM public.org_roles r
INNER JOIN public.org_functions f ON r.function_id = f.id
INNER JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND r.name IN (
    'Medical Science Liaison',
    'HEOR Director',
    'VP Market Access',
    'Commercial Lead',
    'Chief Regulatory Officer'
)
GROUP BY r.name, f.name, d.name
ORDER BY r.name;

-- =====================================================================
-- 4. UNMAPPED PERSONAS DETAIL
-- =====================================================================

SELECT 
    '=== UNMAPPED PERSONAS ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    p.role_id,
    p.function_id,
    p.department_id
FROM public.personas p
WHERE p.role_id IS NULL
AND (
    p.name ILIKE '%Medical Science Liaison Persona%'
    OR p.name ILIKE '%HEOR Director Persona%'
    OR p.name ILIKE '%VP Market Access Persona%'
    OR p.name ILIKE '%Commercial Lead Persona%'
    OR p.name ILIKE '%Chief Regulatory Officer Persona%'
)
ORDER BY p.name;

