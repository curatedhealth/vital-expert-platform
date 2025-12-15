-- Check for agent-to-agent relationship tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name LIKE '%agent%'
AND (column_name LIKE '%agent%' OR column_name LIKE '%child%' OR column_name LIKE '%parent%')
ORDER BY table_name, ordinal_position;

