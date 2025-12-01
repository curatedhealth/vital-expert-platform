-- Check enum values for functional_area_type
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'functional_area_type')
ORDER BY enumsortorder;

