-- Test if org_functions table exists and has data
SELECT COUNT(*) as total_functions FROM org_functions;

-- Show first 5 functions
SELECT id, department_name, unique_id FROM org_functions LIMIT 5;

-- Check RLS policies on org_functions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'org_functions';
