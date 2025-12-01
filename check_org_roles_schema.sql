-- Check org_roles table schema - columns that are NOT NULL
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'org_roles' 
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- Check distinct geographic_scope values
SELECT DISTINCT geographic_scope FROM org_roles WHERE geographic_scope IS NOT NULL LIMIT 10;

-- Check enum values for geographic_scope_type
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'geographic_scope_type')
ORDER BY enumsortorder;

