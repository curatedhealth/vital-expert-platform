-- Quick diagnostic: Check conversations and messages table structure
SELECT 'conversations' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'conversations'
UNION ALL
SELECT 'messages' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'messages'
ORDER BY table_name, column_name;
