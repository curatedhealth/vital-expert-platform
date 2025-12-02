SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workflow_templates'
ORDER BY ordinal_position;
