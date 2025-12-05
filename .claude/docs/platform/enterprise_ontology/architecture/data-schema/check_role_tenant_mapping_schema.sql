-- Check database schema for role-tenant mapping
-- Option 1: Check if there's a junction table
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'org_roles',
    'role_tenants',
    'org_role_tenants',
    'tenant_roles'
  )
ORDER BY table_name, ordinal_position;

-- Option 2: Check if tenant_id is an array
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'org_roles'
  AND column_name = 'tenant_id';

-- Option 3: List all tables that might be junction tables
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name ILIKE '%role%tenant%'
    OR table_name ILIKE '%tenant%role%'
  );

