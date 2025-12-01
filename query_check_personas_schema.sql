-- Check personas table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'personas'
ORDER BY ordinal_position;

