-- =====================================================
-- Get Complete Medical Affairs Organizational Structure (CORRECTED)
-- =====================================================
-- Uses actual table names: org_roles, org_departments, org_functions
-- =====================================================

-- Get all Medical Affairs roles with complete hierarchy
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.slug as role_slug,
    d.id as department_id,
    d.name as department_name,
    f.id as function_id,
    f.name as function_name
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND f.name ILIKE '%medical affairs%'
ORDER BY 
    d.name NULLS LAST,
    r.name;

-- Get summary counts
SELECT 
    'Summary' as category,
    COUNT(DISTINCT f.id) as functions_count,
    COUNT(DISTINCT d.id) as departments_count,
    COUNT(r.id) as roles_count
FROM org_roles r
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND f.name ILIKE '%medical affairs%';

-- Get all tenants
SELECT 
    'Tenants' as category,
    id as tenant_id,
    name as tenant_name,
    slug as tenant_slug
FROM tenants
WHERE deleted_at IS NULL;

-- Get Medical Affairs function
SELECT 
    'Medical Affairs Function' as category,
    id as function_id,
    name as function_name,
    slug as function_slug
FROM org_functions
WHERE name ILIKE '%medical affairs%'
  AND deleted_at IS NULL;

-- Get all departments under Medical Affairs
SELECT 
    'Medical Affairs Departments' as category,
    d.id as department_id,
    d.name as department_name,
    d.slug as department_slug,
    (SELECT COUNT(*) FROM org_roles WHERE department_id = d.id AND deleted_at IS NULL) as role_count
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
WHERE f.name ILIKE '%medical affairs%'
  AND d.deleted_at IS NULL
ORDER BY d.name;

