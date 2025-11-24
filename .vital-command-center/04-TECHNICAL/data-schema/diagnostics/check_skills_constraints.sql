-- Check skills table constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'skills'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

