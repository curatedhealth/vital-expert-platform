-- =====================================================================
-- POPULATE DEPARTMENTS AND ROLES FOR PHARMACEUTICALS TENANT
-- This script completes the population by adding departments and roles
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

BEGIN;

-- =====================================================================
-- STEP 1: Create function ID mapping
-- =====================================================================

CREATE TEMP TABLE IF NOT EXISTS function_id_mapping AS
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
-- STEP 2: Copy Departments
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
-- STEP 3: Create department ID mapping
-- =====================================================================

CREATE TEMP TABLE IF NOT EXISTS department_id_mapping AS
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
-- STEP 4: Copy Roles
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
    NULL, -- Reset reports_to_role_id
    COALESCE(r.is_active, true),
    NOW(),
    NOW(),
    m_f.new_function_id,
    m_d.new_department_id,
    r.leadership_level,
    r.geographic_scope,
    r.ta_focus
FROM org_roles r
INNER JOIN function_id_mapping m_f ON r.function_id = m_f.old_function_id
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
-- STEP 5: Verification
-- =====================================================================

SELECT '=== POPULATION COMPLETE ===' as status;

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

-- Check for orphaned records
SELECT 
    'Orphaned Departments' as issue_type,
    COUNT(*) as count
FROM org_departments d
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (d.function_id IS NULL 
         OR d.function_id NOT IN (
             SELECT id FROM org_functions 
             WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
         ));

SELECT 
    'Orphaned Roles' as issue_type,
    COUNT(*) as count
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

