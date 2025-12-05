-- ============================================================================
-- COMMERCIAL ORGANIZATION JTBD-ROLE GAP REMEDIATION
-- Maps existing JTBDs to unmapped Commercial roles
-- Date: 2025-12-02
-- ============================================================================

-- Step 1: Identify all unmapped Commercial roles
WITH unmapped_roles AS (
    SELECT
        r.id as role_id,
        r.name as role_name,
        d.name as department_name
    FROM org_roles r
    JOIN org_departments d ON r.department_id = d.id
    JOIN org_functions f ON d.function_id = f.id
    LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
    WHERE f.name = 'Commercial Organization'
    AND jr.role_id IS NULL
)
SELECT * FROM unmapped_roles ORDER BY department_name, role_name;

-- Step 2: Find suitable JTBDs for Commercial roles (by keyword matching)
-- This creates suggested mappings based on role name keywords

-- Leadership roles → Leadership & Strategy JTBDs
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.85 as relevance_score,
    8.5 as importance,
    'quarterly' as frequency
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL  -- Not already mapped
AND (
    -- Leadership roles get strategy JTBDs
    (r.name ILIKE '%chief%' OR r.name ILIKE '%vice president%' OR r.name ILIKE '%director%')
    AND (j.name ILIKE '%strateg%' OR j.name ILIKE '%planning%' OR j.name ILIKE '%leadership%')
)
ON CONFLICT DO NOTHING;

-- Analytics roles → Analytics JTBDs
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.90 as relevance_score,
    8.0 as importance,
    'weekly' as frequency
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    (r.name ILIKE '%analyst%' OR r.name ILIKE '%analytics%' OR r.name ILIKE '%insights%')
    AND (j.name ILIKE '%analy%' OR j.name ILIKE '%insight%' OR j.name ILIKE '%data%')
)
ON CONFLICT DO NOTHING;

-- Marketing roles → Marketing JTBDs
INSERT INTO jtbd_roles (jtbd_id, role_id, role_name, relevance_score, importance, frequency)
SELECT DISTINCT
    j.id as jtbd_id,
    r.id as role_id,
    r.name as role_name,
    0.88 as relevance_score,
    7.5 as importance,
    'monthly' as frequency
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
CROSS JOIN jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN jtbd_roles existing ON existing.role_id = r.id AND existing.jtbd_id = j.id
WHERE f.name = 'Commercial Organization'
AND existing.role_id IS NULL
AND (
    (r.name ILIKE '%marketing%' OR r.name ILIKE '%brand%' OR r.name ILIKE '%product%')
    AND (j.name ILIKE '%market%' OR j.name ILIKE '%brand%' OR j.name ILIKE '%campaign%')
)
ON CONFLICT DO NOTHING;

-- Step 3: Verify results
SELECT
    'After Remediation' as status,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT jr.role_id) as roles_with_jtbd,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 1) as coverage_pct
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization';

-- ============================================================================
-- DEPARTMENT CLEANUP (Review before executing)
-- ============================================================================

-- Check for duplicate departments
SELECT
    name,
    COUNT(*) as count,
    array_agg(id::text) as ids
FROM org_departments
GROUP BY name
HAVING COUNT(*) > 1;

-- Check for empty departments (0 roles)
SELECT
    f.name as function_name,
    d.name as department_name,
    COUNT(r.id) as role_count
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name, d.name
HAVING COUNT(r.id) = 0
ORDER BY f.name, d.name;

-- ============================================================================
-- FIND INCOMPLETE MECE PERSONA
-- ============================================================================

SELECT
    r.name as role_name,
    d.name as department_name,
    COUNT(DISTINCT p.derived_archetype) as archetype_count,
    array_agg(DISTINCT p.derived_archetype) as archetypes_present,
    ARRAY['AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC'] as expected
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Commercial Organization'
GROUP BY r.id, r.name, d.name
HAVING COUNT(DISTINCT p.derived_archetype) < 4
   AND COUNT(DISTINCT p.derived_archetype) > 0
ORDER BY archetype_count;
