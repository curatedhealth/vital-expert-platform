-- Simple test to verify database connection
SELECT 'Connection successful!' as test;

-- Check if org_roles exists
SELECT COUNT(*) as org_roles_exists
FROM information_schema.tables
WHERE table_name = 'org_roles';

-- List existing role_ tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'role_%'
ORDER BY table_name;
