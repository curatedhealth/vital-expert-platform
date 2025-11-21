-- =====================================================================
-- VERIFY UNMAPPED PERSONAS COUNT
-- Shows current count of unmapped personas and breakdown by mapping status
-- =====================================================================

-- =====================================================================
-- SUMMARY: Total Unmapped Personas
-- =====================================================================
SELECT 
    '=== UNMAPPED PERSONAS SUMMARY ===' as section;

SELECT 
    COUNT(*) as total_unmapped_personas,
    'Personas missing role_id, function_id, and department_id' as description
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- =====================================================================
-- DETAILED BREAKDOWN: Mapping Status
-- =====================================================================
SELECT 
    '=== DETAILED MAPPING STATUS BREAKDOWN ===' as section;

SELECT 
    mapping_status,
    count,
    percentage
FROM (
    SELECT 
        CASE 
            WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN '❌ Missing All Three (Completely Unmapped)'
            WHEN role_id IS NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN '⚠️  Missing Role Only'
            WHEN function_id IS NULL AND role_id IS NOT NULL AND department_id IS NOT NULL THEN '⚠️  Missing Function Only'
            WHEN department_id IS NULL AND role_id IS NOT NULL AND function_id IS NOT NULL THEN '⚠️  Missing Department Only'
            WHEN role_id IS NULL AND function_id IS NULL THEN '⚠️  Missing Role & Function'
            WHEN role_id IS NULL AND department_id IS NULL THEN '⚠️  Missing Role & Department'
            WHEN function_id IS NULL AND department_id IS NULL THEN '⚠️  Missing Function & Department'
            ELSE '✅ Fully Mapped'
        END as mapping_status,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY 
        CASE 
            WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN '❌ Missing All Three (Completely Unmapped)'
            WHEN role_id IS NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN '⚠️  Missing Role Only'
            WHEN function_id IS NULL AND role_id IS NOT NULL AND department_id IS NOT NULL THEN '⚠️  Missing Function Only'
            WHEN department_id IS NULL AND role_id IS NOT NULL AND function_id IS NOT NULL THEN '⚠️  Missing Department Only'
            WHEN role_id IS NULL AND function_id IS NULL THEN '⚠️  Missing Role & Function'
            WHEN role_id IS NULL AND department_id IS NULL THEN '⚠️  Missing Role & Department'
            WHEN function_id IS NULL AND department_id IS NULL THEN '⚠️  Missing Function & Department'
            ELSE '✅ Fully Mapped'
        END
) subquery
ORDER BY 
    CASE mapping_status
        WHEN '❌ Missing All Three (Completely Unmapped)' THEN 1
        WHEN '⚠️  Missing Role Only' THEN 2
        WHEN '⚠️  Missing Function Only' THEN 3
        WHEN '⚠️  Missing Department Only' THEN 4
        WHEN '⚠️  Missing Role & Function' THEN 5
        WHEN '⚠️  Missing Role & Department' THEN 6
        WHEN '⚠️  Missing Function & Department' THEN 7
        ELSE 8
    END;

-- =====================================================================
-- OVERALL STATISTICS
-- =====================================================================
SELECT 
    '=== OVERALL STATISTICS ===' as section;

SELECT 
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped,
    COUNT(*) - COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as not_fully_mapped,
    COUNT(CASE WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN 1 END) as completely_unmapped,
    ROUND(100.0 * COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) / COUNT(*), 2) as percent_fully_mapped
FROM public.personas
WHERE deleted_at IS NULL;

-- =====================================================================
-- QUICK COUNT: Just the number
-- =====================================================================
SELECT 
    '=== QUICK COUNT ===' as section;

SELECT 
    COUNT(*) as unmapped_personas_count
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

