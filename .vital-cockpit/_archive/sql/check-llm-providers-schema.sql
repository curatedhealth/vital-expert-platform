-- Check the actual columns in llm_providers table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'llm_providers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
