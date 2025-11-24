-- Check actual database schema before running role queries
-- Run this FIRST to see what columns actually exist in your database

-- 1. Check org_departments columns
SELECT
    'org_departments columns:' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'org_departments'
ORDER BY ordinal_position;

-- 2. Check org_roles columns
SELECT
    'org_roles columns:' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'org_roles'
ORDER BY ordinal_position;

-- 3. Sample org_departments data
SELECT
    id,
    *
FROM org_departments
WHERE function_area = 'Medical Affairs'
   OR function_area ILIKE '%Medical%'
LIMIT 5;

-- 4. Sample org_roles data
SELECT
    id,
    name,
    role_category,
    geographic_scope,
    department_id
FROM org_roles
WHERE department_id IN (
    SELECT id FROM org_departments
    WHERE function_area = 'Medical Affairs'
       OR function_area ILIKE '%Medical%'
)
LIMIT 10;
