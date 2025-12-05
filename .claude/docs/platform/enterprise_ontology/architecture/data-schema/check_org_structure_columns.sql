-- Quick check to see what columns actually exist in org_structure tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('org_functions', 'org_departments', 'org_roles')
    AND column_name IN ('department_name', 'name', 'function_name', 'role_name', 'unique_id', 'tenant_id')
ORDER BY table_name, column_name;

