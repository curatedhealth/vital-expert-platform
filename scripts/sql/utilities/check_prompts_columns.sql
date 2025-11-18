-- Check actual columns in prompts table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'prompts'
ORDER BY ordinal_position;
