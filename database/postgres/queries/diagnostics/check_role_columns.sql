-- =====================================================
-- Check if agents table has role_id and role_name columns
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
  AND column_name IN ('role_id', 'role_name', 'function_id', 'function_name', 'department_id', 'department_name')
ORDER BY column_name;

-- Check if we have roles data
SELECT 
    'roles' as table_name,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count
FROM roles;

-- Sample roles
SELECT id, name, slug, function_id, department_id
FROM roles
WHERE deleted_at IS NULL
LIMIT 10;

