-- ============================================================================
-- Step 1: Check Tools Table Schema First
-- ============================================================================

-- Get all columns in tools table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'tools'
ORDER BY ordinal_position;

