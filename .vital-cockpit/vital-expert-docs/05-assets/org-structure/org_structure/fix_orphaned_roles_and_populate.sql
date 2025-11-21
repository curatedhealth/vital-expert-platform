-- =====================================================================
-- FIX ORPHANED ROLES AND COMPLETE PHARMACEUTICALS POPULATION
-- This script fixes orphaned roles and ensures all data is properly linked
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

BEGIN;

-- =====================================================================
-- STEP 1: Check current state
-- =====================================================================

DO $$
DECLARE
    func_count INTEGER;
    dept_count INTEGER;
    role_count INTEGER;
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    SELECT COUNT(*) INTO dept_count FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    SELECT COUNT(*) INTO role_count FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    
    SELECT COUNT(*) INTO orphaned_count
    FROM org_roles r
    WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        AND (
            r.function_id IS NULL 
            OR r.function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
            OR r.department_id IS NULL
            OR r.department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
        );
    
    RAISE NOTICE 'Current state: % functions, % departments, % roles, % orphaned roles', 
        func_count, dept_count, role_count, orphaned_count;
END $$;

-- =====================================================================
-- STEP 2: Create function ID mapping from source tenant
-- =====================================================================

DROP TABLE IF EXISTS function_id_mapping;
CREATE TEMP TABLE function_id_mapping AS
SELECT 
    source_f.id as old_function_id,
    pharma_f.id as new_function_id,
    source_f.name as function_name
FROM org_functions source_f
INNER JOIN org_functions pharma_f ON 
    source_f.name = pharma_f.name 
    AND source_f.tenant_id IN (
        SELECT tenant_id
        FROM org_functions
        WHERE tenant_id IS NOT NULL
        AND tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        GROUP BY tenant_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    AND pharma_f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- =====================================================================
-- STEP 3: Populate Departments (if missing)
-- =====================================================================

INSERT INTO org_departments (
    id,
    tenant_id,
    name,
    slug,
    description,
    is_active,
    created_at,
    updated_at,
    function_id,
    geographic_scope,
    ta_focus,
    typical_team_size_min,
    typical_team_size_max,
    allowed_tenants
)
SELECT 
    gen_random_uuid(),
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    d.name,
    d.slug || '-pharma-' || substring(gen_random_uuid()::text, 1, 8),
    d.description,
    COALESCE(d.is_active, true),
    NOW(),
    NOW(),
    m.new_function_id,
    d.geographic_scope,
    d.ta_focus,
    d.typical_team_size_min,
    d.typical_team_size_max,
    d.allowed_tenants
FROM org_departments d
INNER JOIN function_id_mapping m ON d.function_id = m.old_function_id
WHERE d.tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    AND tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM org_departments 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND name = d.name
);

-- =====================================================================
-- STEP 4: Create department ID mapping
-- =====================================================================

DROP TABLE IF EXISTS department_id_mapping;
CREATE TEMP TABLE department_id_mapping AS
SELECT 
    source_d.id as old_department_id,
    pharma_d.id as new_department_id,
    source_d.name as department_name
FROM org_departments source_d
INNER JOIN org_departments pharma_d ON 
    source_d.name = pharma_d.name 
    AND source_d.tenant_id IN (
        SELECT tenant_id
        FROM org_functions
        WHERE tenant_id IS NOT NULL
        AND tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        GROUP BY tenant_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    AND pharma_d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- =====================================================================
-- STEP 5: Fix orphaned roles by updating their function_id and department_id
-- =====================================================================

-- First, try to fix roles that have function_id but wrong department_id
UPDATE org_roles r
SET 
    function_id = COALESCE(
        (SELECT new_function_id FROM function_id_mapping WHERE old_function_id = r.function_id),
        (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' LIMIT 1)
    ),
    department_id = COALESCE(
        (SELECT new_department_id FROM department_id_mapping WHERE old_department_id = r.department_id),
        (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' AND function_id = COALESCE(
            (SELECT new_function_id FROM function_id_mapping WHERE old_function_id = r.function_id),
            r.function_id
        ) LIMIT 1)
    )
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        r.function_id IS NULL 
        OR r.function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
        OR r.department_id IS NULL
        OR r.department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    )
    AND EXISTS (SELECT 1 FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    AND EXISTS (SELECT 1 FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b');

-- If roles still can't be fixed, link them to first available function/department
UPDATE org_roles r
SET 
    function_id = (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' LIMIT 1),
    department_id = (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' LIMIT 1)
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        r.function_id IS NULL 
        OR r.function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
        OR r.department_id IS NULL
        OR r.department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    )
    AND EXISTS (SELECT 1 FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    AND EXISTS (SELECT 1 FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b');

-- =====================================================================
-- STEP 6: Add any missing roles from source tenant
-- =====================================================================

INSERT INTO org_roles (
    id,
    tenant_id,
    name,
    slug,
    description,
    seniority_level,
    reports_to_role_id,
    is_active,
    created_at,
    updated_at,
    function_id,
    department_id,
    leadership_level,
    geographic_scope,
    ta_focus
)
SELECT 
    gen_random_uuid(),
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    r.name,
    r.slug || '-pharma-' || substring(gen_random_uuid()::text, 1, 8),
    r.description,
    r.seniority_level,
    NULL,
    COALESCE(r.is_active, true),
    NOW(),
    NOW(),
    COALESCE(m_f.new_function_id, (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' LIMIT 1)),
    COALESCE(m_d.new_department_id, (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b' LIMIT 1)),
    r.leadership_level,
    r.geographic_scope,
    r.ta_focus
FROM org_roles r
LEFT JOIN function_id_mapping m_f ON r.function_id = m_f.old_function_id
LEFT JOIN department_id_mapping m_d ON r.department_id = m_d.old_department_id
WHERE r.tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    AND tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM org_roles 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND name = r.name
);

-- =====================================================================
-- STEP 7: Final verification
-- =====================================================================

SELECT '=== FINAL COUNTS ===' as status;

SELECT 
    'org_functions' as table_name,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

SELECT '=== ORPHANED RECORDS CHECK ===' as status;

SELECT 
    'Orphaned Departments' as issue_type,
    COUNT(*) as count
FROM org_departments d
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (d.function_id IS NULL 
         OR d.function_id NOT IN (
             SELECT id FROM org_functions 
             WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         ))
UNION ALL
SELECT 
    'Orphaned Roles',
    COUNT(*)
FROM org_roles r
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        r.function_id IS NULL 
        OR r.function_id NOT IN (
            SELECT id FROM org_functions 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
        OR r.department_id IS NULL
        OR r.department_id NOT IN (
            SELECT id FROM org_departments 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
    );

COMMIT;

