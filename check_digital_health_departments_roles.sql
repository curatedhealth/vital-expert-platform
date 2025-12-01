-- ============================================================================
-- CHECK DIGITAL HEALTH DEPARTMENTS & ROLES
-- ============================================================================
-- Single Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (VITAL System)
-- Focus: Digital Health Industry Functions
-- ============================================================================

-- ============================================================================
-- 1. LIST ALL DIGITAL HEALTH FUNCTIONS (for reference)
-- ============================================================================
SELECT 
    '=== DIGITAL HEALTH FUNCTIONS ===' as section,
    id as function_id,
    name as function_name,
    slug,
    industry,
    strategic_priority
FROM org_functions
WHERE industry = 'Digital Health'
ORDER BY strategic_priority DESC;

-- ============================================================================
-- 2. DEPARTMENTS UNDER DIGITAL HEALTH FUNCTIONS
-- ============================================================================
SELECT 
    '=== DEPARTMENTS BY DH FUNCTION ===' as section,
    f.name as function_name,
    f.industry,
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    d.description as department_description
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
ORDER BY f.name, d.name;

-- ============================================================================
-- 3. COUNT DEPARTMENTS PER DIGITAL HEALTH FUNCTION
-- ============================================================================
SELECT 
    '=== DEPARTMENT COUNT BY DH FUNCTION ===' as section,
    f.name as function_name,
    COUNT(d.id) as department_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
GROUP BY f.id, f.name
ORDER BY department_count DESC, f.name;

-- ============================================================================
-- 4. ROLES UNDER DIGITAL HEALTH FUNCTIONS
-- ============================================================================
SELECT 
    '=== ROLES BY DH FUNCTION ===' as section,
    f.name as function_name,
    d.name as department_name,
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    r.seniority_level
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.industry = 'Digital Health'
ORDER BY f.name, d.name, r.seniority_level, r.name;

-- ============================================================================
-- 5. COUNT ROLES PER DIGITAL HEALTH FUNCTION
-- ============================================================================
SELECT 
    '=== ROLE COUNT BY DH FUNCTION ===' as section,
    f.name as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.industry = 'Digital Health'
GROUP BY f.id, f.name
ORDER BY role_count DESC, f.name;

-- ============================================================================
-- 6. SUMMARY: DIGITAL HEALTH TOTALS
-- ============================================================================
SELECT 
    '=== DIGITAL HEALTH SUMMARY ===' as section,
    'Functions' as entity,
    (SELECT COUNT(*) FROM org_functions WHERE industry = 'Digital Health') as count
UNION ALL
SELECT 
    '',
    'Departments',
    (SELECT COUNT(*) FROM org_departments d 
     JOIN org_functions f ON d.function_id = f.id 
     WHERE f.industry = 'Digital Health')
UNION ALL
SELECT 
    '',
    'Roles',
    (SELECT COUNT(*) FROM org_roles r 
     JOIN org_departments d ON r.department_id = d.id
     JOIN org_functions f ON d.function_id = f.id 
     WHERE f.industry = 'Digital Health');

-- ============================================================================
-- 7. ALL DEPARTMENTS (regardless of function)
-- ============================================================================
SELECT 
    '=== ALL DEPARTMENTS ===' as section,
    d.id,
    d.name,
    d.slug,
    f.name as function_name,
    f.industry
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
ORDER BY f.industry, f.name, d.name;

-- ============================================================================
-- 8. ALL ROLES (regardless of function)
-- ============================================================================
SELECT 
    '=== ALL ROLES ===' as section,
    r.id,
    r.name,
    r.slug,
    r.seniority_level,
    d.name as department_name,
    f.name as function_name,
    f.industry
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON d.function_id = f.id
ORDER BY f.industry, f.name, d.name, r.name
LIMIT 100;

-- ============================================================================
-- 9. ROLES BY SENIORITY LEVEL (Digital Health only)
-- ============================================================================
SELECT 
    '=== DH ROLES BY SENIORITY ===' as section,
    r.seniority_level,
    COUNT(*) as role_count,
    array_agg(r.name ORDER BY r.name) as role_names
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.industry = 'Digital Health'
GROUP BY r.seniority_level
ORDER BY 
    CASE r.seniority_level
        WHEN 'c_suite' THEN 1
        WHEN 'executive' THEN 2
        WHEN 'director' THEN 3
        WHEN 'senior' THEN 4
        WHEN 'mid' THEN 5
        WHEN 'entry' THEN 6
        ELSE 7
    END;

-- ============================================================================
-- 10. EXPECTED vs ACTUAL COUNTS
-- ============================================================================
SELECT 
    '=== EXPECTED vs ACTUAL ===' as section,
    'Digital Health Functions' as entity,
    9 as expected,
    (SELECT COUNT(*) FROM org_functions WHERE industry = 'Digital Health') as actual,
    CASE 
        WHEN (SELECT COUNT(*) FROM org_functions WHERE industry = 'Digital Health') >= 9 THEN '✅'
        ELSE '❌ Missing'
    END as status
UNION ALL
SELECT 
    '',
    'Digital Health Departments',
    40,
    (SELECT COUNT(*) FROM org_departments d 
     JOIN org_functions f ON d.function_id = f.id 
     WHERE f.industry = 'Digital Health'),
    CASE 
        WHEN (SELECT COUNT(*) FROM org_departments d 
              JOIN org_functions f ON d.function_id = f.id 
              WHERE f.industry = 'Digital Health') >= 40 THEN '✅'
        ELSE '❌ Missing'
    END
UNION ALL
SELECT 
    '',
    'Digital Health Roles',
    159,
    (SELECT COUNT(*) FROM org_roles r 
     JOIN org_departments d ON r.department_id = d.id
     JOIN org_functions f ON d.function_id = f.id 
     WHERE f.industry = 'Digital Health'),
    CASE 
        WHEN (SELECT COUNT(*) FROM org_roles r 
              JOIN org_departments d ON r.department_id = d.id
              JOIN org_functions f ON d.function_id = f.id 
              WHERE f.industry = 'Digital Health') >= 159 THEN '✅'
        ELSE '❌ Missing'
    END;

