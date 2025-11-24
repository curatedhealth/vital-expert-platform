-- =====================================================================
-- POPULATE PHARMACEUTICALS TENANT ORG-STRUCTURE DATA
-- This script populates functions, departments, and roles for Pharmaceuticals
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

BEGIN;

-- =====================================================================
-- STEP 1: Check if we should copy from existing tenant or create new
-- =====================================================================

-- First, let's see what data exists in other tenants
DO $$
DECLARE
    source_tenant_id UUID;
    pharma_tenant_id UUID := 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
    func_count INTEGER;
    dept_count INTEGER;
    role_count INTEGER;
BEGIN
    -- Check if Pharmaceuticals already has data
    SELECT COUNT(*) INTO func_count FROM org_functions WHERE tenant_id = pharma_tenant_id;
    SELECT COUNT(*) INTO dept_count FROM org_departments WHERE tenant_id = pharma_tenant_id;
    SELECT COUNT(*) INTO role_count FROM org_roles WHERE tenant_id = pharma_tenant_id;
    
    IF func_count > 0 OR dept_count > 0 OR role_count > 0 THEN
        RAISE NOTICE 'Pharmaceuticals tenant already has data: % functions, % departments, % roles', func_count, dept_count, role_count;
        RAISE NOTICE 'Skipping population. If you want to repopulate, delete existing data first.';
        RETURN;
    END IF;
    
    -- Find a source tenant with data
    SELECT tenant_id INTO source_tenant_id
    FROM (
        SELECT tenant_id, COUNT(*) as cnt
        FROM org_functions
        WHERE tenant_id IS NOT NULL
        GROUP BY tenant_id
        ORDER BY cnt DESC
        LIMIT 1
    ) t;
    
    IF source_tenant_id IS NOT NULL THEN
        RAISE NOTICE 'Found source tenant with data: %', source_tenant_id;
        RAISE NOTICE 'Will copy data from this tenant to Pharmaceuticals';
    ELSE
        RAISE NOTICE 'No existing data found. Will create new pharma-specific data.';
    END IF;
END $$;

-- =====================================================================
-- STEP 2: Copy Functions from source tenant (if exists)
-- =====================================================================

-- Copy functions from the tenant with the most data
INSERT INTO org_functions (
    id,
    tenant_id,
    name,
    slug,
    description,
    parent_id,
    icon,
    color,
    sort_order,
    is_active,
    created_at,
    updated_at,
    geographic_scope,
    ta_focus,
    strategic_priority,
    allowed_tenants
)
SELECT 
    gen_random_uuid(),
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid,
    name,
    slug || '-pharma' || '-' || substring(gen_random_uuid()::text, 1, 8), -- Make slug unique
    description,
    NULL, -- Reset parent_id, will fix later
    icon,
    color,
    sort_order,
    is_active,
    NOW(),
    NOW(),
    geographic_scope,
    ta_focus,
    strategic_priority,
    allowed_tenants
FROM org_functions
WHERE tenant_id IN (
    SELECT tenant_id
    FROM org_functions
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM org_functions 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
);

-- =====================================================================
-- STEP 3: Copy Departments from source tenant
-- =====================================================================

-- First, create a mapping of old function IDs to new function IDs
CREATE TEMP TABLE function_id_mapping AS
SELECT 
    old_f.id as old_function_id,
    new_f.id as new_function_id
FROM org_functions old_f
INNER JOIN org_functions new_f ON 
    old_f.name = new_f.name 
    AND old_f.tenant_id IN (
        SELECT tenant_id
        FROM org_functions
        WHERE tenant_id IS NOT NULL
        GROUP BY tenant_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    AND new_f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Copy departments
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
    d.slug || '-pharma' || '-' || substring(gen_random_uuid()::text, 1, 8), -- Make slug unique
    d.description,
    d.is_active,
    NOW(),
    NOW(),
    m.new_function_id, -- Use mapped function_id
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
-- STEP 4: Copy Roles from source tenant
-- =====================================================================

-- Create mapping for departments
CREATE TEMP TABLE department_id_mapping AS
SELECT 
    old_d.id as old_department_id,
    new_d.id as new_department_id
FROM org_departments old_d
INNER JOIN org_departments new_d ON 
    old_d.name = new_d.name 
    AND old_d.tenant_id IN (
        SELECT tenant_id
        FROM org_functions
        WHERE tenant_id IS NOT NULL
        GROUP BY tenant_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    AND new_d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Copy roles
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
    r.slug || '-pharma' || '-' || substring(gen_random_uuid()::text, 1, 8), -- Make slug unique
    r.description,
    r.seniority_level,
    NULL, -- Reset reports_to_role_id, can fix later if needed
    r.is_active,
    NOW(),
    NOW(),
    m_f.new_function_id, -- Use mapped function_id
    m_d.new_department_id, -- Use mapped department_id
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

