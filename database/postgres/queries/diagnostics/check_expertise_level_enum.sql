-- Check expertise_level enum values
SELECT 
    e.enumlabel as allowed_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'expertise_level'
ORDER BY e.enumsortorder;

