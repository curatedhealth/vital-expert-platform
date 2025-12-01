-- ============================================================================
-- FIX MISSING FUNCTIONS AND ROLES FOR ALL AGENTS
-- ============================================================================
-- Strategy:
-- 1. Assign functions based on agent name matching and department
-- 2. Assign roles based on agent name matching and department
-- ============================================================================

BEGIN;

\echo '╔══════════════════════════════════════════════════════════════════════╗'
\echo '║        🔧 FIXING MISSING FUNCTIONS AND ROLES FOR ALL AGENTS          ║'
\echo '╚══════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- STEP 1: Assign functions based on name matching + default from departments
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚙️  STEP 1: Assigning functions to agents...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Option A: Assign "Medical Affairs" function to Medical/Clinical agents
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Medical Affairs'
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
    a.name ILIKE '%Medical Excellence%' OR
    a.name ILIKE '%Field Medical%' OR
    a.name ILIKE '%HEOR%' OR
    a.name ILIKE '%Evidence%'
);

SELECT '✅ Medical Affairs function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Medical Affairs';

-- Option B: Assign "Market Access" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Market Access'
AND (
    a.name ILIKE '%Market Access%' OR
    a.name ILIKE '%Pricing%' OR
    a.name ILIKE '%Reimbursement%' OR
    a.name ILIKE '%Payer%' OR
    a.name ILIKE '%Value%' OR
    a.name ILIKE '%Health Economics%'
);

SELECT '✅ Market Access function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Market Access';

-- Option C: Assign "Regulatory Affairs" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Regulatory Affairs'
AND (
    a.name ILIKE '%Regulatory%' OR
    a.name ILIKE '%Submission%' OR
    a.name ILIKE '%CMC%' OR
    a.name ILIKE '%Compliance%'
);

SELECT '✅ Regulatory Affairs function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Regulatory Affairs';

-- Option D: Assign "Commercial Organization" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Commercial Organization'
AND (
    a.name ILIKE '%Marketing%' OR
    a.name ILIKE '%Brand%' OR
    a.name ILIKE '%Sales%' OR
    a.name ILIKE '%Commercial%' OR
    a.name ILIKE '%Account%'
);

SELECT '✅ Commercial Organization function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Commercial Organization';

-- Option E: Assign "Research & Development (R&D)" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Research & Development (R&D)'
AND (
    a.name ILIKE '%R&D%' OR
    a.name ILIKE '%Research%' OR
    a.name ILIKE '%Development%' OR
    a.name ILIKE '%Data Scientist%' OR
    a.name ILIKE '%Biostatisti%' OR
    a.name ILIKE '%Study%'
);

SELECT '✅ R&D function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Research & Development (R&D)';

-- Option F: Assign "Manufacturing & Supply Chain" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Manufacturing & Supply Chain'
AND (
    a.name ILIKE '%Manufacturing%' OR
    a.name ILIKE '%Supply%' OR
    a.name ILIKE '%Production%' OR
    a.name ILIKE '%Process%' OR
    a.name ILIKE '%Quality%'
);

SELECT '✅ Manufacturing function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Manufacturing & Supply Chain';

-- Option G: Assign "Information Technology (IT) / Digital" function
UPDATE agents a
SET 
    function_id = f.id,
    function_name = f.name
FROM org_functions f
WHERE a.function_id IS NULL
AND f.name = 'Information Technology (IT) / Digital'
AND (
    a.name ILIKE '%IT%' OR
    a.name ILIKE '%Digital%' OR
    a.name ILIKE '%Technology%' OR
    a.name ILIKE '%Data%' OR
    a.name ILIKE '%Analytics%' OR
    a.name ILIKE '%Software%'
);

SELECT '✅ IT/Digital function assigned:' as status, COUNT(*) as count
FROM agents WHERE function_name = 'Information Technology (IT) / Digital';

-- Option H: Default to "Medical Affairs" for all remaining agents
UPDATE agents a
SET 
    function_id = (SELECT id FROM org_functions WHERE name = 'Medical Affairs'),
    function_name = 'Medical Affairs'
WHERE a.function_id IS NULL;

SELECT '✅ Default function (Medical Affairs) assigned:' as status, COUNT(*) as count
FROM agents WHERE function_id IS NOT NULL;

-- ============================================================================
-- STEP 2: Assign roles based on agent name and department
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👤 STEP 2: Assigning roles to agents based on name + department...'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Assign roles from org_roles where department_id matches
UPDATE agents a
SET 
    role_id = r.id,
    role_name = r.name
FROM org_roles r
WHERE a.role_id IS NULL
AND a.department_id IS NOT NULL
AND r.department_id = a.department_id
-- Find best match by name similarity
AND r.id = (
    SELECT r2.id
    FROM org_roles r2
    WHERE r2.department_id = a.department_id
    AND (
        LOWER(a.name) = LOWER(r2.name)
        OR LOWER(a.name) LIKE '%' || LOWER(r2.name) || '%'
        OR LOWER(r2.name) LIKE '%' || LOWER(a.name) || '%'
    )
    ORDER BY LENGTH(r2.name) ASC
    LIMIT 1
);

SELECT '✅ Roles assigned by name+department matching:' as status, COUNT(*) as count
FROM agents WHERE role_id IS NOT NULL;

-- Assign default role from department (pick first role in each department)
UPDATE agents a
SET 
    role_id = r.id,
    role_name = r.name
FROM (
    SELECT DISTINCT ON (r.department_id)
        r.department_id,
        r.id,
        r.name
    FROM org_roles r
    WHERE r.geographic_scope = 'global'
    ORDER BY r.department_id, r.seniority_level DESC, r.name
) r
WHERE a.role_id IS NULL
AND a.department_id IS NOT NULL
AND r.department_id = a.department_id;

SELECT '✅ Default roles assigned by department:' as status, COUNT(*) as count
FROM agents WHERE role_id IS NOT NULL;

COMMIT;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 FINAL VERIFICATION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    'Total Agents' as metric,
    COUNT(*) as count,
    '100.0%' as percentage
FROM agents
UNION ALL
SELECT 
    'With Department',
    COUNT(*),
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%'
FROM agents WHERE department_id IS NOT NULL
UNION ALL
SELECT 
    'With Function',
    COUNT(*),
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%'
FROM agents WHERE function_id IS NOT NULL
UNION ALL
SELECT 
    'With Role',
    COUNT(*),
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%'
FROM agents WHERE role_id IS NOT NULL
UNION ALL
SELECT 
    'Fully Mapped (All 3)',
    COUNT(*),
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%'
FROM agents 
WHERE department_id IS NOT NULL 
AND function_id IS NOT NULL 
AND role_id IS NOT NULL;

-- Top functions
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⚙️  TOP 10 FUNCTIONS BY AGENT COUNT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    f.name as function,
    COUNT(a.id) as agent_count,
    ROUND(COUNT(a.id) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%' as percentage
FROM agents a
JOIN org_functions f ON a.function_id = f.id
GROUP BY f.id, f.name
ORDER BY COUNT(a.id) DESC
LIMIT 10;

-- Top roles
\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👤 TOP 10 ROLES BY AGENT COUNT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
    r.name as role,
    COUNT(a.id) as agent_count,
    ROUND(COUNT(a.id) * 100.0 / (SELECT COUNT(*) FROM agents), 1) || '%' as percentage
FROM agents a
JOIN org_roles r ON a.role_id = r.id
GROUP BY r.id, r.name
ORDER BY COUNT(a.id) DESC
LIMIT 10;

-- Sample fully mapped agents
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
JOIN org_departments d ON a.department_id = d.id
JOIN org_functions f ON a.function_id = f.id
JOIN org_roles r ON a.role_id = r.id
ORDER BY a.name
LIMIT 15;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ FUNCTIONS AND ROLES ASSIGNMENT COMPLETE!'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'


