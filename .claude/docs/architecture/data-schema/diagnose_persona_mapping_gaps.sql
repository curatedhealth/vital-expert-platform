-- =====================================================================
-- DIAGNOSE PERSONA MAPPING GAPS
-- Explains the mapping statistics and shows which personas need mapping
-- =====================================================================

-- =====================================================================
-- EXPLANATION OF THE STATISTICS
-- =====================================================================
SELECT 
    '=== EXPLANATION OF YOUR STATISTICS ===' as section;

SELECT 
    'Total personas: 968' as metric,
    'Total number of personas in your database (excluding deleted ones)' as explanation
UNION ALL
SELECT 
    'Personas with role: 689',
    'Number of personas that have a role_id assigned (689 out of 968 = 71%)'
UNION ALL
SELECT 
    'Personas with function: 686',
    'Number of personas that have a function_id assigned (686 out of 968 = 71%)'
UNION ALL
SELECT 
    'Personas with department: 686',
    'Number of personas that have a department_id assigned (686 out of 968 = 71%)'
UNION ALL
SELECT 
    'Fully mapped: 686',
    'Number of personas that have ALL THREE (role, function, department) assigned (686 out of 968 = 71%)';

-- =====================================================================
-- SUMMARY: WHAT THIS MEANS
-- =====================================================================
SELECT 
    '=== WHAT THIS MEANS ===' as section;

SELECT 
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped,
    COUNT(*) - COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as personas_missing_mappings,
    ROUND(100.0 * COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) / COUNT(*), 2) as percent_fully_mapped
FROM public.personas
WHERE deleted_at IS NULL;

-- =====================================================================
-- BREAKDOWN: Personas Missing Mappings
-- =====================================================================
SELECT 
    '=== PERSONAS MISSING MAPPINGS (282 personas) ===' as section;

SELECT 
    CASE 
        WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN 'Missing All Three'
        WHEN role_id IS NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 'Missing Role Only'
        WHEN function_id IS NULL AND role_id IS NOT NULL AND department_id IS NOT NULL THEN 'Missing Function Only'
        WHEN department_id IS NULL AND role_id IS NOT NULL AND function_id IS NOT NULL THEN 'Missing Department Only'
        WHEN role_id IS NULL AND function_id IS NULL THEN 'Missing Role & Function'
        WHEN role_id IS NULL AND department_id IS NULL THEN 'Missing Role & Department'
        WHEN function_id IS NULL AND department_id IS NULL THEN 'Missing Function & Department'
        ELSE 'Other'
    END as missing_status,
    COUNT(*) as count
FROM public.personas
WHERE deleted_at IS NULL
  AND NOT (role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL)
GROUP BY 
    CASE 
        WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN 'Missing All Three'
        WHEN role_id IS NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 'Missing Role Only'
        WHEN function_id IS NULL AND role_id IS NOT NULL AND department_id IS NOT NULL THEN 'Missing Function Only'
        WHEN department_id IS NULL AND role_id IS NOT NULL AND function_id IS NOT NULL THEN 'Missing Department Only'
        WHEN role_id IS NULL AND function_id IS NULL THEN 'Missing Role & Function'
        WHEN role_id IS NULL AND department_id IS NULL THEN 'Missing Role & Department'
        WHEN function_id IS NULL AND department_id IS NULL THEN 'Missing Function & Department'
        ELSE 'Other'
    END
ORDER BY count DESC;

-- =====================================================================
-- DETAILED VIEW: Sample of Unmapped Personas
-- =====================================================================
SELECT 
    '=== SAMPLE OF UNMAPPED PERSONAS (First 50) ===' as section;

SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN '❌ Missing All'
        WHEN p.role_id IS NULL THEN '⚠️  Missing Role'
        WHEN p.function_id IS NULL THEN '⚠️  Missing Function'
        WHEN p.department_id IS NULL THEN '⚠️  Missing Department'
        ELSE '✅ Has All'
    END as mapping_status,
    r.name as role_name,
    f.name::text as function_name,
    d.name as department_name,
    p.created_at
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.deleted_at IS NULL
  AND NOT (p.role_id IS NOT NULL AND p.function_id IS NOT NULL AND p.department_id IS NOT NULL)
ORDER BY 
    CASE 
        WHEN p.role_id IS NULL AND p.function_id IS NULL AND p.department_id IS NULL THEN 1
        WHEN p.role_id IS NULL THEN 2
        WHEN p.function_id IS NULL THEN 3
        WHEN p.department_id IS NULL THEN 4
        ELSE 5
    END,
    p.name
LIMIT 50;

-- =====================================================================
-- Personas with Role but Missing Function/Department
-- =====================================================================
SELECT 
    '=== PERSONAS WITH ROLE BUT MISSING FUNCTION/DEPARTMENT ===' as section;

SELECT 
    p.name as persona_name,
    p.slug as persona_slug,
    r.name as role_name,
    r.function_id as role_function_id,
    r.department_id as role_department_id,
    f.name::text as function_name,
    d.name as department_name,
    CASE 
        WHEN p.function_id IS NULL AND p.department_id IS NULL THEN 'Missing Both'
        WHEN p.function_id IS NULL THEN 'Missing Function'
        WHEN p.department_id IS NULL THEN 'Missing Department'
    END as missing_what
FROM public.personas p
INNER JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.deleted_at IS NULL
  AND p.role_id IS NOT NULL
  AND (p.function_id IS NULL OR p.department_id IS NULL)
ORDER BY p.name
LIMIT 20;

-- =====================================================================
-- RECOMMENDATION: How to Fix Missing Mappings
-- =====================================================================
SELECT 
    '=== RECOMMENDATIONS ===' as section;

SELECT 
    '1. Personas with role but missing function/department' as recommendation,
    'These can be fixed by copying function_id and department_id from the role' as action,
    COUNT(*) as affected_count
FROM public.personas p
INNER JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
  AND p.role_id IS NOT NULL
  AND (p.function_id IS NULL OR p.department_id IS NULL)
  AND (r.function_id IS NOT NULL OR r.department_id IS NOT NULL)
UNION ALL
SELECT 
    '2. Personas completely unmapped',
    'These need to be mapped using the mapping scripts (map_personas_from_json_efficient.sql or map_personas_by_name_from_json.sql)',
    COUNT(*)
FROM public.personas
WHERE deleted_at IS NULL
  AND role_id IS NULL
  AND function_id IS NULL
  AND department_id IS NULL;

