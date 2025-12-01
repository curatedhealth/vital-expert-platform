-- ============================================================================
-- CHECK DIGITAL HEALTH INDUSTRY & BUSINESS FUNCTION MAPPINGS
-- ============================================================================
-- Single Tenant: c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 (VITAL System)
-- Industry ID: e5f6a7b8-5555-4eee-8005-000000000005 (Digital Health)
-- ============================================================================

-- ============================================================================
-- 1. VERIFY THE DIGITAL HEALTH INDUSTRY EXISTS
-- ============================================================================
SELECT 
    '=== DIGITAL HEALTH INDUSTRY ===' as section,
    id,
    name,
    slug,
    description,
    icon,
    color,
    is_active
FROM industries
WHERE id = 'e5f6a7b8-5555-4eee-8005-000000000005'::uuid
   OR slug = 'digital_health';

-- ============================================================================
-- 2. CHECK THE VITAL SYSTEM TENANT
-- ============================================================================
SELECT 
    '=== VITAL SYSTEM TENANT ===' as section,
    id,
    name,
    slug,
    is_active
FROM tenants
WHERE id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid;

-- ============================================================================
-- 3. CHECK ALL ORG_FUNCTIONS FOR VITAL TENANT
-- ============================================================================
SELECT 
    '=== ALL ORG_FUNCTIONS (VITAL TENANT) ===' as section,
    id,
    name,
    slug,
    description,
    is_active
FROM org_functions
WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid
   OR tenant_id IS NULL
ORDER BY name;

-- ============================================================================
-- 4. CHECK ORG_FUNCTIONS THAT MATCH DIGITAL HEALTH
-- ============================================================================
SELECT 
    '=== ORG_FUNCTIONS MATCHING DIGITAL HEALTH ===' as section,
    id,
    name,
    slug,
    description
FROM org_functions
WHERE name ILIKE '%digital%'
   OR name ILIKE '%health%tech%'
   OR name ILIKE '%telehealth%'
   OR name ILIKE '%DTx%'
   OR slug ILIKE '%digital%'
ORDER BY name;

-- ============================================================================
-- 5. CHECK ORG_DEPARTMENTS FOR VITAL TENANT
-- ============================================================================
SELECT 
    '=== ALL ORG_DEPARTMENTS (VITAL TENANT) ===' as section,
    d.id,
    d.name,
    d.slug,
    f.name as function_name
FROM org_departments d
LEFT JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid
   OR d.tenant_id IS NULL
ORDER BY f.name, d.name
LIMIT 50;

-- ============================================================================
-- 6. CHECK ORG_ROLES FOR VITAL TENANT
-- ============================================================================
SELECT 
    '=== ALL ORG_ROLES (VITAL TENANT) ===' as section,
    r.id,
    r.name,
    r.slug,
    r.seniority_level,
    d.name as department_name
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid
   OR r.tenant_id IS NULL
ORDER BY r.name
LIMIT 50;

-- ============================================================================
-- 7. SUMMARY COUNTS FOR VITAL TENANT
-- ============================================================================
SELECT 
    '=== SUMMARY COUNTS ===' as section,
    'Industries (Total)' as entity,
    (SELECT COUNT(*) FROM industries WHERE is_active = true) as count
UNION ALL
SELECT 
    '',
    'Digital Health Industry',
    (SELECT COUNT(*) FROM industries WHERE slug = 'digital_health')
UNION ALL
SELECT 
    '',
    'Org Functions (VITAL Tenant)',
    (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid OR tenant_id IS NULL)
UNION ALL
SELECT 
    '',
    'Org Departments (VITAL Tenant)',
    (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid OR tenant_id IS NULL)
UNION ALL
SELECT 
    '',
    'Org Roles (VITAL Tenant)',
    (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid OR tenant_id IS NULL);

-- ============================================================================
-- 8. FULL HIERARCHY: FUNCTIONS → DEPARTMENTS → ROLES
-- ============================================================================
SELECT 
    '=== FULL ORG HIERARCHY ===' as section,
    f.name as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid
   OR f.tenant_id IS NULL
GROUP BY f.id, f.name
ORDER BY f.name;

-- ============================================================================
-- 9. LIST ALL 15 INDUSTRIES
-- ============================================================================
SELECT 
    '=== ALL 15 INDUSTRIES ===' as section,
    id,
    name,
    slug,
    icon,
    sort_order
FROM industries
WHERE is_active = true
ORDER BY sort_order, name;
