-- ============================================================================
-- ASSIGN DEPARTMENTS, FUNCTIONS, AND ROLES TO ALL AGENTS
-- ============================================================================
-- This script intelligently maps agents to organizational structures based on:
-- 1. Agent name pattern matching
-- 2. Existing agent data (role_name, function_name, department_name)
-- 3. Logical hierarchies (Department → Function → Role)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Map agents to roles based on name similarity
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👤 STEP 1: Mapping agents to roles by name similarity...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

UPDATE agents a
SET 
    role_id = r.id,
    role_name = r.name
FROM org_roles r
WHERE a.role_id IS NULL
AND (
    -- Exact match
    LOWER(a.name) = LOWER(r.name)
    OR
    -- Very close match (agent name contains role name)
    LOWER(a.name) LIKE '%' || LOWER(r.name) || '%'
    OR
    -- Role name contains agent name (for shorter agent names)
    LOWER(r.name) LIKE '%' || LOWER(a.name) || '%'
)
-- Pick the closest match (shortest role name = more specific)
AND r.id = (
    SELECT r2.id
    FROM org_roles r2
    WHERE (
        LOWER(a.name) = LOWER(r2.name)
        OR LOWER(a.name) LIKE '%' || LOWER(r2.name) || '%'
        OR LOWER(r2.name) LIKE '%' || LOWER(a.name) || '%'
    )
    ORDER BY LENGTH(r2.name) ASC
    LIMIT 1
);

SELECT 
    '✅ Roles assigned by name matching:' as status,
    COUNT(*) as count
FROM agents 
WHERE role_id IS NOT NULL;

-- ============================================================================
-- STEP 2: Assign functions from roles
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚙️  STEP 2: Assigning functions from roles...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
WHERE a.role_id = r.id
AND a.function_id IS NULL;

SELECT 
    '✅ Functions assigned from roles:' as status,
    COUNT(*) as count
FROM agents 
WHERE function_id IS NOT NULL;

-- ============================================================================
-- STEP 3: Assign departments from functions
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🏢 STEP 3: Assigning departments from functions...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM (
    SELECT DISTINCT ON (f.id)
        f.id as function_id,
        d.id as dept_id,
        d.name as dept_name
    FROM org_functions f
    JOIN org_function_departments ofd ON f.id = ofd.function_id
    JOIN org_departments d ON ofd.department_id = d.id
    ORDER BY f.id, ofd.created_at ASC
) AS dept_mapping
JOIN org_departments d ON dept_mapping.dept_id = d.id
WHERE a.function_id = dept_mapping.function_id
AND a.department_id IS NULL;

SELECT 
    '✅ Departments assigned from functions:' as status,
    COUNT(*) as count
FROM agents 
WHERE department_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Handle remaining agents - assign by keyword matching
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔍 STEP 4: Handling remaining agents with keyword matching...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Medical Affairs Department
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name ILIKE '%Medical Affairs%'
AND (
    a.name ILIKE '%Medical%' OR
    a.name ILIKE '%Clinical%' OR
    a.name ILIKE '%MSL%' OR
    a.name ILIKE '%KOL%' OR
    a.name ILIKE '%Publication%' OR
    a.name ILIKE '%Scientific%' OR
    a.name ILIKE '%Medical Writer%' OR
    a.name ILIKE '%Medical Education%' OR
    a.name ILIKE '%Medical Information%' OR
    a.name ILIKE '%Medical Excellence%'
);

-- Commercial/Marketing Department
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name ILIKE '%Commercial%'
AND (
    a.name ILIKE '%Marketing%' OR
    a.name ILIKE '%Brand%' OR
    a.name ILIKE '%Sales%' OR
    a.name ILIKE '%Commercial%' OR
    a.name ILIKE '%Account%' OR
    a.name ILIKE '%Digital Marketing%'
);

-- Market Access Department
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name ILIKE '%Market Access%'
AND (
    a.name ILIKE '%Market Access%' OR
    a.name ILIKE '%HEOR%' OR
    a.name ILIKE '%Pricing%' OR
    a.name ILIKE '%Reimbursement%' OR
    a.name ILIKE '%Payer%' OR
    a.name ILIKE '%Value%' OR
    a.name ILIKE '%Access%'
);

-- Regulatory Affairs Department
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name ILIKE '%Regulatory%'
AND (
    a.name ILIKE '%Regulatory%' OR
    a.name ILIKE '%Submission%' OR
    a.name ILIKE '%Compliance%' OR
    a.name ILIKE '%CMC%'
);

-- Clinical Development/Operations
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND (d.name ILIKE '%Clinical Development%' OR d.name ILIKE '%Clinical Operations%')
AND (
    a.name ILIKE '%Clinical Trial%' OR
    a.name ILIKE '%Clinical Data%' OR
    a.name ILIKE '%Clinical Operations%' OR
    a.name ILIKE '%Biometric%' OR
    a.name ILIKE '%Biostatistician%' OR
    a.name ILIKE '%CRA%' OR
    a.name ILIKE '%Study%'
);

-- Quality/Pharmacovigilance
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND (d.name ILIKE '%Quality%' OR d.name ILIKE '%Pharmacovigilance%')
AND (
    a.name ILIKE '%Quality%' OR
    a.name ILIKE '%QA%' OR
    a.name ILIKE '%QC%' OR
    a.name ILIKE '%Pharmacovigilance%' OR
    a.name ILIKE '%Safety%' OR
    a.name ILIKE '%Adverse%'
);

-- R&D/Manufacturing
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND (d.name ILIKE '%R&D%' OR d.name ILIKE '%Manufacturing%' OR d.name ILIKE '%Process Development%')
AND (
    a.name ILIKE '%R&D%' OR
    a.name ILIKE '%Research%' OR
    a.name ILIKE '%Development%' OR
    a.name ILIKE '%Manufacturing%' OR
    a.name ILIKE '%Process%' OR
    a.name ILIKE '%Production%' OR
    a.name ILIKE '%CMC%' OR
    a.name ILIKE '%Formulation%'
);

-- Analytics & Insights
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name ILIKE '%Analytics%'
AND (
    a.name ILIKE '%Analytics%' OR
    a.name ILIKE '%Data Scientist%' OR
    a.name ILIKE '%Data Analyst%' OR
    a.name ILIKE '%BI%' OR
    a.name ILIKE '%Business Intelligence%' OR
    a.name ILIKE '%Insights%'
);

SELECT 
    '✅ Departments assigned by keyword matching:' as status,
    COUNT(*) as count
FROM agents 
WHERE department_id IS NOT NULL;

-- ============================================================================
-- STEP 5: Assign default department for any remaining agents
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📦 STEP 5: Assigning default department for remaining agents...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Assign "Medical Affairs" as default for any remaining agents
UPDATE agents a
SET 
    department_id = d.id,
    department_name = d.name
FROM org_departments d
WHERE a.department_id IS NULL
AND d.name = 'Medical Affairs';

-- If "Medical Affairs" doesn't exist, use first available department
UPDATE agents a
SET 
    department_id = (SELECT id FROM org_departments ORDER BY name LIMIT 1),
    department_name = (SELECT name FROM org_departments ORDER BY name LIMIT 1)
WHERE a.department_id IS NULL;

SELECT 
    '✅ Default departments assigned:' as status,
    COUNT(*) as count
FROM agents 
WHERE department_id IS NOT NULL;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION & REPORTING
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 FINAL VERIFICATION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Summary counts
SELECT 
    'Total Agents' as metric,
    COUNT(*) as count
FROM agents
UNION ALL
SELECT 
    'With Role' as metric,
    COUNT(*) as count
FROM agents WHERE role_id IS NOT NULL
UNION ALL
SELECT 
    'With Function' as metric,
    COUNT(*) as count
FROM agents WHERE function_id IS NOT NULL
UNION ALL
SELECT 
    'With Department' as metric,
    COUNT(*) as count
FROM agents WHERE department_id IS NOT NULL
UNION ALL
SELECT 
    'Fully Mapped (All 3)' as metric,
    COUNT(*) as count
FROM agents 
WHERE role_id IS NOT NULL 
AND function_id IS NOT NULL 
AND department_id IS NOT NULL;

-- Top departments by agent count
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🏢 TOP DEPARTMENTS BY AGENT COUNT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 
    d.name as department,
    COUNT(a.id) as agent_count
FROM agents a
JOIN org_departments d ON a.department_id = d.id
GROUP BY d.id, d.name
ORDER BY COUNT(a.id) DESC
LIMIT 10;

-- Top functions by agent count
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚙️  TOP FUNCTIONS BY AGENT COUNT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 
    f.name as function,
    COUNT(a.id) as agent_count
FROM agents a
JOIN org_functions f ON a.function_id = f.id
GROUP BY f.id, f.name
ORDER BY COUNT(a.id) DESC
LIMIT 10;

-- Sample agents with full mapping
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ SAMPLE FULLY MAPPED AGENTS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 
    a.name as agent,
    d.name as department,
    f.name as function,
    r.name as role
FROM agents a
LEFT JOIN org_departments d ON a.department_id = d.id
LEFT JOIN org_functions f ON a.function_id = f.id
LEFT JOIN org_roles r ON a.role_id = r.id
WHERE a.department_id IS NOT NULL 
AND a.function_id IS NOT NULL 
AND a.role_id IS NOT NULL
ORDER BY a.name
LIMIT 15;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ ORGANIZATIONAL ASSIGNMENT COMPLETE!'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

