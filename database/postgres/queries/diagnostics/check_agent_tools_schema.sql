-- Check agent_tools table schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agent_tools'
ORDER BY ordinal_position;

