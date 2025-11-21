-- =====================================================================
-- VERIFY PERSONA TO ROLE MAPPING
-- Checks the results of mapping personas to roles, functions, and departments
-- =====================================================================

-- Summary: Mapping status overview
SELECT 
    'MAPPING_SUMMARY' as section,
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped,
    COUNT(CASE WHEN role_id IS NULL THEN 1 END) as unmapped_personas
FROM public.personas;

-- Detailed view: All personas with their mappings
SELECT 
    'PERSONA_MAPPINGS' as section,
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name,
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN 'UNMAPPED'
        WHEN p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL THEN 'FULLY_MAPPED'
        WHEN p.role_id IS NOT NULL AND (p.function_id IS NULL OR p.department_id IS NULL) THEN 'PARTIAL_MAPPED'
        ELSE 'INCOMPLETE'
    END as mapping_status
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
ORDER BY 
    CASE 
        WHEN p.role_id IS NULL THEN 1
        WHEN p.function_id IS NULL OR p.department_id IS NULL THEN 2
        ELSE 3
    END,
    f.name,
    d.name,
    r.name,
    p.name;

-- Unmapped personas (if any)
SELECT 
    'UNMAPPED_PERSONAS' as section,
    p.id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.role_id,
    p.function_id,
    p.department_id
FROM public.personas p
WHERE p.role_id IS NULL
ORDER BY p.name;

-- Mapping by function
SELECT 
    'BY_FUNCTION' as section,
    f.name as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT d.id) as department_count,
    STRING_AGG(DISTINCT p.name, ', ' ORDER BY p.name) as persona_names
FROM public.personas p
JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
GROUP BY f.name
ORDER BY persona_count DESC;

-- Mapping by department
SELECT 
    'BY_DEPARTMENT' as section,
    d.name as department_name,
    f.name as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    STRING_AGG(DISTINCT p.name, ', ' ORDER BY p.name) as persona_names
FROM public.personas p
JOIN public.org_departments d ON p.department_id = d.id
JOIN public.org_functions f ON p.function_id = f.id
GROUP BY d.name, f.name
ORDER BY f.name, d.name;

-- Mapping by role
SELECT 
    'BY_ROLE' as section,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    STRING_AGG(DISTINCT p.name, ', ' ORDER BY p.name) as persona_names
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
GROUP BY r.name, f.name, d.name
ORDER BY f.name, d.name, r.name;

-- Expected vs Actual: Check if personas from JSON are mapped
-- This checks for personas that should exist based on the JSON structure
SELECT 
    'EXPECTED_PERSONAS' as section,
    'Medical Science Liaison Persona 1 - Field Medical - Medical Affairs' as expected_persona,
    CASE WHEN EXISTS (
        SELECT 1 FROM public.personas 
        WHERE name ILIKE '%Medical Science Liaison Persona 1%' 
        AND role_id IS NOT NULL
    ) THEN '✅ MAPPED' ELSE '❌ NOT FOUND' END as status
UNION ALL
SELECT 
    'EXPECTED_PERSONAS',
    'HEOR Director Persona 1 - HEOR & Evidence - Medical Affairs',
    CASE WHEN EXISTS (
        SELECT 1 FROM public.personas 
        WHERE name ILIKE '%HEOR Director Persona 1%' 
        AND role_id IS NOT NULL
    ) THEN '✅ MAPPED' ELSE '❌ NOT FOUND' END
UNION ALL
SELECT 
    'EXPECTED_PERSONAS',
    'VP Market Access Persona 1 - Leadership & Strategy - Market Access',
    CASE WHEN EXISTS (
        SELECT 1 FROM public.personas 
        WHERE name ILIKE '%VP Market Access Persona 1%' 
        AND role_id IS NOT NULL
    ) THEN '✅ MAPPED' ELSE '❌ NOT FOUND' END
UNION ALL
SELECT 
    'EXPECTED_PERSONAS',
    'Commercial Lead Persona 1 - Commercial Ops - Commercial Organization',
    CASE WHEN EXISTS (
        SELECT 1 FROM public.personas 
        WHERE name ILIKE '%Commercial Lead Persona 1%' 
        AND role_id IS NOT NULL
    ) THEN '✅ MAPPED' ELSE '❌ NOT FOUND' END
UNION ALL
SELECT 
    'EXPECTED_PERSONAS',
    'Chief Regulatory Officer Persona 1 - Regulatory Strategy - Regulatory Affairs',
    CASE WHEN EXISTS (
        SELECT 1 FROM public.personas 
        WHERE name ILIKE '%Chief Regulatory Officer Persona 1%' 
        AND role_id IS NOT NULL
    ) THEN '✅ MAPPED' ELSE '❌ NOT FOUND' END;

