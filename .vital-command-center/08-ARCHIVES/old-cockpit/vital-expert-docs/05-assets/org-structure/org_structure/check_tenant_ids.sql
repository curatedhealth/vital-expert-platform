-- =====================================================================
-- CHECK WHAT ORGANIZATIONS THESE TENANT IDs CORRESPOND TO
-- =====================================================================

-- Check organizations table for these tenant IDs
SELECT 
    'Organizations Table' as source,
    id,
    name,
    slug,
    is_active,
    created_at
FROM organizations
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
    'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244',
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
    '684f6c2c-b50d-4726-ad92-c76c3b785a89'
)
ORDER BY name;

-- Check tenants table (if it exists separately)
SELECT 
    'Tenants Table' as source,
    id,
    tenant_key,
    display_name,
    description,
    is_active
FROM tenants
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
    'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244',
    'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b',
    '684f6c2c-b50d-4726-ad92-c76c3b785a89'
)
ORDER BY display_name;

-- =====================================================================
-- COUNT DATA BY ACTUAL TENANT IDs
-- =====================================================================

SELECT '=== DATA COUNTS BY ACTUAL TENANT IDs ===' as section;

-- Count org_functions by actual tenant IDs
SELECT 
    'org_functions' as table_name,
    tenant_id,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
GROUP BY tenant_id
ORDER BY tenant_id;

-- Count org_departments by actual tenant IDs
SELECT 
    'org_departments' as table_name,
    tenant_id,
    COUNT(*) as count
FROM org_departments
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
GROUP BY tenant_id
ORDER BY tenant_id;

-- Count org_roles by actual tenant IDs
SELECT 
    'org_roles' as table_name,
    tenant_id,
    COUNT(*) as count
FROM org_roles
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
GROUP BY tenant_id
ORDER BY tenant_id;

-- =====================================================================
-- SAMPLE DATA FROM EACH TENANT
-- =====================================================================

SELECT '=== SAMPLE FUNCTIONS FROM EACH TENANT ===' as section;

SELECT 
    tenant_id,
    name,
    slug,
    is_active
FROM org_functions
WHERE tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
ORDER BY tenant_id, name
LIMIT 30;

SELECT '=== SAMPLE DEPARTMENTS FROM EACH TENANT ===' as section;

SELECT 
    d.tenant_id,
    d.name as department_name,
    d.slug,
    f.name as function_name,
    d.is_active
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
ORDER BY d.tenant_id, f.name, d.name
LIMIT 30;

SELECT '=== SAMPLE ROLES FROM EACH TENANT ===' as section;

SELECT 
    r.tenant_id,
    r.name as role_name,
    r.slug,
    f.name as function_name,
    d.name as department_name,
    r.seniority_level,
    r.is_active
FROM org_roles r
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
)
ORDER BY r.tenant_id, f.name, d.name, r.name
LIMIT 30;

