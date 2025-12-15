-- =====================================================
-- Get Complete Medical Affairs Organizational Structure
-- =====================================================
-- Returns all roles with their departments and functions for Medical Affairs
-- =====================================================

-- Get all roles with their complete org hierarchy
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    f.id as function_id,
    f.name as function_name,
    f.slug as function_slug
FROM roles r
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN functions f ON d.function_id = f.id OR r.function_id = f.id
WHERE (f.name ILIKE '%medical affairs%' OR f.slug ILIKE '%medical-affairs%')
   OR (d.name ILIKE '%medical%' OR d.slug ILIKE '%medical%')
   OR r.name ILIKE '%medical%'
   OR r.deleted_at IS NULL
ORDER BY 
    f.name NULLS LAST,
    d.name NULLS LAST,
    r.name;

-- Also get count summary
SELECT 
    'Summary' as info,
    COUNT(DISTINCT f.id) as function_count,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count
FROM roles r
LEFT JOIN departments d ON r.department_id = d.id
LEFT JOIN functions f ON d.function_id = f.id OR r.function_id = f.id
WHERE r.deleted_at IS NULL;

-- Get all functions (to see what exists)
SELECT 
    'Available Functions' as category,
    id as function_id,
    name as function_name,
    slug as function_slug,
    (SELECT COUNT(*) FROM departments WHERE function_id = functions.id) as department_count
FROM functions
WHERE deleted_at IS NULL
ORDER BY name;

-- Get all departments (to see what exists)
SELECT 
    'Available Departments' as category,
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    f.id as function_id,
    f.name as function_name,
    (SELECT COUNT(*) FROM roles WHERE department_id = d.id AND deleted_at IS NULL) as role_count
FROM departments d
LEFT JOIN functions f ON d.function_id = f.id
WHERE d.deleted_at IS NULL
ORDER BY f.name NULLS LAST, d.name;

-- Get tenant info
SELECT 
    'Available Tenants' as category,
    id as tenant_id,
    name as tenant_name,
    slug as tenant_slug
FROM tenants
WHERE deleted_at IS NULL;

