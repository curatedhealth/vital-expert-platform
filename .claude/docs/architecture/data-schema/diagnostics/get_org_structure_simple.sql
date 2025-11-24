-- =====================================================
-- Get Complete Medical Affairs Organizational Structure
-- =====================================================
-- Version 2: Simplified query to check what exists first
-- =====================================================

-- QUERY 1: Check if tables exist and get their columns
SELECT 
    'Table Check' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('roles', 'departments', 'functions', 'tenants')
ORDER BY table_name;

-- QUERY 2: Get all roles (simple version)
SELECT 
    'Roles' as category,
    id,
    name,
    slug,
    department_id,
    function_id,
    created_at
FROM roles
WHERE deleted_at IS NULL
ORDER BY name
LIMIT 50;

-- QUERY 3: Get all departments (simple version)
SELECT 
    'Departments' as category,
    id,
    name,
    slug,
    function_id,
    created_at
FROM departments
WHERE deleted_at IS NULL
ORDER BY name;

-- QUERY 4: Get all functions (simple version)
SELECT 
    'Functions' as category,
    id,
    name,
    slug,
    created_at
FROM functions
WHERE deleted_at IS NULL
ORDER BY name;

-- QUERY 5: Get all tenants
SELECT 
    'Tenants' as category,
    id,
    name,
    slug,
    created_at
FROM tenants
WHERE deleted_at IS NULL
ORDER BY name;

-- QUERY 6: Count summary
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM functions WHERE deleted_at IS NULL) as functions_count,
    (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) as departments_count,
    (SELECT COUNT(*) FROM roles WHERE deleted_at IS NULL) as roles_count,
    (SELECT COUNT(*) FROM tenants WHERE deleted_at IS NULL) as tenants_count;

