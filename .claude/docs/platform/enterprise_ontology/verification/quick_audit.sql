-- ============================================================================
-- QUICK PHARMA ONTOLOGY AUDIT
-- Run this anytime to check current state
-- ============================================================================

-- Overall Summary
SELECT
    '=== PHARMA ONTOLOGY STATUS ===' as report;

SELECT
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

-- MECE Coverage
SELECT
    '=== MECE PERSONA DISTRIBUTION ===' as report;

SELECT
    derived_archetype,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM personas) * 100, 1) as pct
FROM personas
WHERE derived_archetype IS NOT NULL
GROUP BY derived_archetype
ORDER BY derived_archetype;

-- JTBD Opportunities
SELECT
    '=== TOP ODI OPPORTUNITIES ===' as report;

SELECT
    code,
    name,
    opportunity_score,
    CASE
        WHEN opportunity_score >= 15 THEN 'EXTREME'
        WHEN opportunity_score >= 12 THEN 'HIGH'
        WHEN opportunity_score >= 10 THEN 'MODERATE'
        ELSE 'TABLE_STAKES'
    END as tier
FROM jtbd
WHERE opportunity_score IS NOT NULL
ORDER BY opportunity_score DESC
LIMIT 10;

-- Data Quality
SELECT
    '=== DATA QUALITY CHECKS ===' as report;

SELECT
    'Duplicate Departments' as check_type,
    COUNT(*) as issues
FROM (SELECT name FROM org_departments GROUP BY name HAVING COUNT(*) > 1) d

UNION ALL

SELECT
    'Empty Departments' as check_type,
    COUNT(*) as issues
FROM (
    SELECT d.id FROM org_departments d
    LEFT JOIN org_roles r ON r.department_id = d.id
    GROUP BY d.id HAVING COUNT(r.id) = 0
) e

UNION ALL

SELECT
    'Incomplete MECE' as check_type,
    COUNT(*) as issues
FROM (
    SELECT r.id FROM org_roles r
    LEFT JOIN personas p ON p.source_role_id = r.id
    GROUP BY r.id HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
) m;
