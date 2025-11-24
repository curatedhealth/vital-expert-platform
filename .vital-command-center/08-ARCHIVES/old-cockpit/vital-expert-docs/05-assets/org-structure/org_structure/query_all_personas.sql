-- =====================================================================
-- QUERY ALL EXISTING PERSONAS
-- Comprehensive view of all personas in the database
-- =====================================================================

-- Total count
SELECT 
    'TOTAL_COUNT' as section,
    COUNT(*) as total_personas,
    COUNT(DISTINCT tenant_id) as tenant_count,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped
FROM public.personas
WHERE deleted_at IS NULL OR deleted_at IS NULL;

-- All personas with their current mappings
SELECT 
    'ALL_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    p.tenant_id,
    t.name as tenant_name,
    p.role_id,
    r.name as role_name,
    p.function_id,
    f.name as function_name,
    p.department_id,
    d.name as department_name,
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN 'UNMAPPED'
        WHEN p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN 'FULLY_MAPPED'
        ELSE 'PARTIAL_MAPPED'
    END as mapping_status
FROM public.personas p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.deleted_at IS NULL
ORDER BY 
    t.name,
    CASE 
        WHEN p.role_id IS NULL THEN 1
        WHEN p.function_id IS NULL OR p.department_id IS NULL THEN 2
        ELSE 3
    END,
    f.name,
    d.name,
    r.name,
    p.name;

-- Personas by tenant
SELECT 
    'BY_TENANT' as section,
    t.name as tenant_name,
    COUNT(*) as total_personas,
    COUNT(p.role_id) as personas_with_role,
    COUNT(p.function_id) as personas_with_function,
    COUNT(p.department_id) as personas_with_department
FROM public.personas p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.deleted_at IS NULL
GROUP BY t.name
ORDER BY total_personas DESC;

-- Sample of personas (first 50)
SELECT 
    'SAMPLE_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    t.name as tenant_name,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name
FROM public.personas p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT 50;

-- Personas matching expected patterns from JSON
SELECT 
    'MATCHING_EXPECTED_PATTERNS' as section,
    p.id,
    p.name,
    p.slug,
    t.name as tenant_name,
    r.name as role_name,
    CASE 
        WHEN p.name ILIKE '%Medical Science Liaison%' THEN 'Medical Science Liaison'
        WHEN p.name ILIKE '%HEOR Director%' THEN 'HEOR Director'
        WHEN p.name ILIKE '%VP Market Access%' THEN 'VP Market Access'
        WHEN p.name ILIKE '%Commercial Lead%' THEN 'Commercial Lead'
        WHEN p.name ILIKE '%Chief Regulatory Officer%' THEN 'Chief Regulatory Officer'
        ELSE 'Other'
    END as expected_role_pattern
FROM public.personas p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
  AND (
    p.name ILIKE '%Medical Science Liaison%'
    OR p.name ILIKE '%HEOR Director%'
    OR p.name ILIKE '%VP Market Access%'
    OR p.name ILIKE '%Commercial Lead%'
    OR p.name ILIKE '%Chief Regulatory Officer%'
    OR p.slug ILIKE '%medical_science_liaison%'
    OR p.slug ILIKE '%heor_director%'
    OR p.slug ILIKE '%market_access%'
    OR p.slug ILIKE '%commercial_lead%'
    OR p.slug ILIKE '%regulatory_officer%'
  )
ORDER BY expected_role_pattern, p.name;

-- Unmapped personas (no role_id)
SELECT 
    'UNMAPPED_PERSONAS' as section,
    p.id,
    p.name,
    p.slug,
    t.name as tenant_name,
    p.role_id,
    p.function_id,
    p.department_id
FROM public.personas p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
ORDER BY t.name, p.name
LIMIT 100;

