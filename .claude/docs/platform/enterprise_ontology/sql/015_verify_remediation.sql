-- ============================================================================
-- VERIFICATION SCRIPT: Post-Remediation Checks
-- Run this AFTER 014_pharma_ontology_remediation.sql
-- Location: .claude/docs/platform/enterprise_ontology/sql/
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE METRICS
-- ============================================================================

SELECT '=== CORE METRICS ===' as section;

-- Overall Summary
SELECT
    'OVERALL SUMMARY' as report,
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(DISTINCT r.id) as roles,
    COUNT(DISTINCT p.id) as personas,
    COUNT(DISTINCT jr.role_id) as roles_with_jtbd,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as jtbd_coverage_pct
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN personas p ON p.source_role_id = r.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name
ORDER BY f.name;

-- ============================================================================
-- SECTION 2: PHASE 1 VERIFICATION (JTBD-Role Mapping)
-- ============================================================================

SELECT '=== PHASE 1: JTBD-ROLE MAPPING ===' as section;

-- Check: Commercial JTBD-Role Coverage (Target: 100%)
SELECT
    'Commercial JTBD-Role Coverage' as check_name,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT jr.role_id) as mapped_roles,
    COUNT(DISTINCT r.id) - COUNT(DISTINCT jr.role_id) as unmapped_roles,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as coverage_pct,
    CASE
        WHEN COUNT(DISTINCT jr.role_id) = COUNT(DISTINCT r.id) THEN '✅ PASS'
        WHEN COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) >= 0.95 THEN '🟡 NEAR'
        ELSE '❌ FAIL'
    END as status
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization';

-- Check: New JTBDs Created (Target: 16)
SELECT
    'New Commercial JTBDs Created' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 16 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM jtbd
WHERE code LIKE 'COM-JTBD-0%'
AND code >= 'COM-JTBD-069';

-- List new JTBDs
SELECT
    'NEW JTBD' as type,
    code,
    name,
    opportunity_score,
    CASE
        WHEN opportunity_score >= 15 THEN 'Extreme'
        WHEN opportunity_score >= 12 THEN 'High'
        WHEN opportunity_score >= 10 THEN 'Moderate'
        ELSE 'Table Stakes'
    END as tier
FROM jtbd
WHERE code LIKE 'COM-JTBD-0%'
AND code >= 'COM-JTBD-069'
ORDER BY code;

-- List any STILL unmapped roles (should be 0)
SELECT
    'STILL UNMAPPED' as status,
    r.name as role_name,
    d.name as department_name
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization'
AND jr.role_id IS NULL
ORDER BY d.name, r.name;

-- ============================================================================
-- SECTION 3: PHASE 2 VERIFICATION (Data Quality)
-- ============================================================================

SELECT '=== PHASE 2: DATA QUALITY ===' as section;

-- Check: Duplicate Departments (Target: 0)
SELECT
    'Duplicate Departments' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM (
    SELECT name FROM org_departments GROUP BY name HAVING COUNT(*) > 1
) dups;

-- List duplicates if any
SELECT
    'DUPLICATE' as status,
    name,
    COUNT(*) as occurrences
FROM org_departments
GROUP BY name
HAVING COUNT(*) > 1;

-- Check: Empty Departments (Target: 0)
SELECT
    'Empty Departments' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM (
    SELECT d.id
    FROM org_departments d
    JOIN org_functions f ON d.function_id = f.id
    LEFT JOIN org_roles r ON r.department_id = d.id
    WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
    GROUP BY d.id
    HAVING COUNT(r.id) = 0
) empty;

-- List empty departments if any
SELECT
    'EMPTY DEPT' as status,
    f.name as function_name,
    d.name as department_name
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name, d.name, d.id
HAVING COUNT(r.id) = 0;

-- Check: MECE Persona Coverage (Target: 100%)
SELECT
    'Incomplete MECE Personas' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM (
    SELECT r.id
    FROM org_roles r
    JOIN org_departments d ON r.department_id = d.id
    JOIN org_functions f ON d.function_id = f.id
    LEFT JOIN personas p ON p.source_role_id = r.id
    WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
    GROUP BY r.id
    HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
) incomplete;

-- ============================================================================
-- SECTION 4: ODI OPPORTUNITY ANALYSIS
-- ============================================================================

SELECT '=== ODI OPPORTUNITY ANALYSIS ===' as section;

-- Opportunity Tier Distribution
SELECT
    'ODI Tiers' as report,
    CASE
        WHEN opportunity_score >= 15 THEN '1. Extreme (15+)'
        WHEN opportunity_score >= 12 THEN '2. High (12-15)'
        WHEN opportunity_score >= 10 THEN '3. Moderate (10-12)'
        ELSE '4. Table Stakes (<10)'
    END as tier,
    COUNT(*) as jtbd_count,
    ROUND(AVG(importance_score)::numeric, 2) as avg_importance,
    ROUND(AVG(satisfaction_score)::numeric, 2) as avg_satisfaction
FROM jtbd
WHERE opportunity_score IS NOT NULL
GROUP BY tier
ORDER BY tier;

-- Top 10 Opportunities
SELECT
    'TOP OPPORTUNITIES' as report,
    code,
    name,
    opportunity_score,
    importance_score,
    satisfaction_score
FROM jtbd
WHERE opportunity_score IS NOT NULL
ORDER BY opportunity_score DESC
LIMIT 10;

-- ============================================================================
-- SECTION 5: FINAL SCORECARD
-- ============================================================================

SELECT '=== FINAL SCORECARD ===' as section;

WITH metrics AS (
    -- Commercial JTBD Coverage
    SELECT 'Commercial JTBD Coverage' as metric,
           ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as value,
           100 as target
    FROM org_functions f
    JOIN org_departments d ON d.function_id = f.id
    JOIN org_roles r ON r.department_id = d.id
    LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
    WHERE f.name = 'Commercial Organization'

    UNION ALL

    -- Medical Affairs JTBD Coverage
    SELECT 'Medical Affairs JTBD Coverage' as metric,
           ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as value,
           100 as target
    FROM org_functions f
    JOIN org_departments d ON d.function_id = f.id
    JOIN org_roles r ON r.department_id = d.id
    LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
    WHERE f.name = 'Medical Affairs'

    UNION ALL

    -- Market Access JTBD Coverage
    SELECT 'Market Access JTBD Coverage' as metric,
           ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as value,
           100 as target
    FROM org_functions f
    JOIN org_departments d ON d.function_id = f.id
    JOIN org_roles r ON r.department_id = d.id
    LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
    WHERE f.name = 'Market Access'

    UNION ALL

    -- MECE Coverage
    SELECT 'MECE Persona Coverage' as metric,
           ROUND((1 - COUNT(*)::numeric / NULLIF((
               SELECT COUNT(*) FROM org_roles r
               JOIN org_departments d ON r.department_id = d.id
               JOIN org_functions f ON d.function_id = f.id
               WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
           ), 0)) * 100, 1) as value,
           100 as target
    FROM (
        SELECT r.id
        FROM org_roles r
        JOIN org_departments d ON r.department_id = d.id
        JOIN org_functions f ON d.function_id = f.id
        LEFT JOIN personas p ON p.source_role_id = r.id
        WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
        GROUP BY r.id
        HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
    ) incomplete
)
SELECT
    metric,
    value,
    target,
    value - target as gap,
    CASE
        WHEN value >= target THEN '✅ PASS'
        WHEN value >= target - 5 THEN '🟡 NEAR'
        ELSE '❌ FAIL'
    END as status
FROM metrics
ORDER BY metric;

-- Overall Completeness Score
SELECT
    'OVERALL COMPLETENESS' as metric,
    ROUND((
        (SELECT COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0)
         FROM org_functions f
         JOIN org_departments d ON d.function_id = f.id
         JOIN org_roles r ON r.department_id = d.id
         LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
         WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
        ) * 100
    ), 1) as percentage,
    CASE
        WHEN (SELECT COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0)
              FROM org_functions f
              JOIN org_departments d ON d.function_id = f.id
              JOIN org_roles r ON r.department_id = d.id
              LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
              WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
             ) >= 0.98 THEN '✅ GOLD STANDARD (98%+)'
        WHEN (SELECT COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0)
              FROM org_functions f
              JOIN org_departments d ON d.function_id = f.id
              JOIN org_roles r ON r.department_id = d.id
              LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
              WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
             ) >= 0.95 THEN '🟡 NEAR TARGET (95-98%)'
        ELSE '❌ NEEDS WORK (<95%)'
    END as status;

-- ============================================================================
-- END OF VERIFICATION
-- ============================================================================
SELECT '=== VERIFICATION COMPLETE ===' as section;
