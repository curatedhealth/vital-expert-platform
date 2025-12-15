-- Check validation_status enum values
SELECT 
    e.enumlabel as allowed_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'validation_status'
ORDER BY e.enumsortorder;

