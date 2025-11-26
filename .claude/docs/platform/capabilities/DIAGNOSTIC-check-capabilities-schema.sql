-- ============================================================================
-- DIAGNOSTIC: Check Actual Capabilities Table Structure
-- ============================================================================
-- Run this in Supabase SQL Editor to see what columns actually exist
-- ============================================================================

-- Show all columns in capabilities table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'capabilities'
ORDER BY ordinal_position;

-- Also check if table even exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'capabilities'
) as capabilities_table_exists;

-- Show sample data if any exists
SELECT * FROM capabilities LIMIT 3;

