-- =====================================================
-- Check existing organizational tables
-- =====================================================

-- Check if these tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('tenants', 'functions', 'departments', 'roles', 'personas')
ORDER BY table_name;

-- Check tenants table structure and data
SELECT 'tenants' as table_check, id, name, slug FROM tenants LIMIT 5;

-- Check if agents table has these columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
  AND column_name IN ('tenant_id', 'function_id', 'function_name', 'department_id', 'department_name', 'role_id', 'role_name')
ORDER BY column_name;

