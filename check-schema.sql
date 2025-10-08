-- Check the actual schema of your tables
-- Run this first to see what columns exist

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'llm_providers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'knowledge_domains' 
AND table_schema = 'public'
ORDER BY ordinal_position;
