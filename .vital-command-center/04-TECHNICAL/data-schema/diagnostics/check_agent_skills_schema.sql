-- Check agent_skills table schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_skills'
    AND table_schema = 'public'
ORDER BY ordinal_position;

