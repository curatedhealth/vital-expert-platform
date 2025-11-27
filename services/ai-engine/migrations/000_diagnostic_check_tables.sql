-- ============================================================================
-- DIAGNOSTIC: Check Table Structures
-- ============================================================================
-- Run this first to see what columns exist in your tables

-- Check agents table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'agents'
ORDER BY ordinal_position;

-- Check conversations table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'conversations'
ORDER BY ordinal_position;

-- Check messages table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'messages'
ORDER BY ordinal_position;

-- List all tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;


