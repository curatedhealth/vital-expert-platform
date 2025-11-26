-- Check actual org_responsibilities schema
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'org_responsibilities' 
ORDER BY ordinal_position;

