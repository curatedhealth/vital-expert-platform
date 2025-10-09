-- Check the actual columns in knowledge_domains table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'knowledge_domains' 
AND table_schema = 'public'
ORDER BY ordinal_position;
